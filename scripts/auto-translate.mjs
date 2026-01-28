#!/usr/bin/env node
/**
 * Script para traduzir automaticamente palavras frequentes
 * Busca as palavras exatas do banco de dados e aplica traduções
 */

import { execSync } from 'child_process';

// Função para normalizar hebraico (remover cantilação, manter vogais)
// IMPORTANTE: Não normalizar grego pois decompõe os acentos
function normalizeHebrew(word) {
  // Se contém caracteres hebraicos, normalizar
  if (/[\u0590-\u05FF]/.test(word)) {
    return word.normalize('NFD').replace(/[\u0591-\u05AF]/g, '');
  }
  // Para grego e outros, retornar como está
  return word;
}

// Traduções baseadas em padrões - aplicadas após normalização (com vogais hebraicas)
const patternTranslations = [
  // Rei (הַמֶּלֶךְ)
  { pattern: /^הַמֶּלֶךְ$/, translation: "o-rei" },
  // Filhos de (בְּנֵי־, בְּנֵֽי־)
  { pattern: /^בְּנֵ.*י[־]?$/, translation: "filhos-de" },
  // Este (הַזֶּה)
  { pattern: /^הַזֶּה$/, translation: "este" },
  // Esta (הַזֹּאת)
  { pattern: /^הַזֹּאת$/, translation: "esta" },
  // Família (מִשְׁפַּחַת)
  { pattern: /^מִשְׁפַּחַת$/, translation: "família-de" },
  // Saul (שָׁאוּל)
  { pattern: /^שָׁאוּל$/, translation: "Saul" },
  // Não (בַּל־)
  { pattern: /^בַּל־$/, translation: "não" },
  // E acamparam (וַֽיַּחֲנוּ)
  { pattern: /^וַ.*יַּחֲנוּ$/, translation: "e-acamparam" },
  // Jerusalém (יְרוּשָׁלָ͏ִם, יְרוּשָׁלַ͏ִם)
  { pattern: /^יְרוּשָׁלָ.*ם$/, translation: "Jerusalém" },
  { pattern: /^יְרוּשָׁלַ.*ם$/, translation: "Jerusalém" },
  // Em Jerusalém (בִּירוּשָׁלָ͏ִם)
  { pattern: /^בִּירוּשָׁלָ.*ם$/, translation: "em-Jerusalém" },
  // E partiram (וַיִּסְעוּ)
  { pattern: /^וַיִּסְעוּ$/, translation: "e-partiram" },
  // Na terra (בְּאֶרֶץ)
  { pattern: /^בְּאֶרֶץ$/, translation: "na-terra" },
  // E falou (וַיְדַבֵּר)
  { pattern: /^וַיְדַבֵּר$/, translation: "e-falou" },
  // E reinou (וַיִּמְלֹךְ)
  { pattern: /^וַיִּמְלֹךְ$/, translation: "e-reinou" },
  // Palavra de (דְּבַר־)
  { pattern: /^דְּבַר־$/, translation: "palavra-de" },
  // Filha de (בַּת־)
  { pattern: /^בַּת־$/, translation: "filha-de" },
  // Ano (שָׁנָה)
  { pattern: /^שָׁנָה$/, translation: "ano" },
  // Ímpios (רְשָׁעִים)
  { pattern: /^רְשָׁעִים$/, translation: "ímpios" },
  // Babilônia (בָּבֶל)
  { pattern: /^בָּבֶל$/, translation: "Babilônia" },
  // Escritos (כְּתוּבִים)
  { pattern: /^כְּתוּבִים$/, translation: "escritos" },
  // Palavras de (דִּבְרֵי)
  { pattern: /^דִּבְרֵי$/, translation: "palavras-de" },
  // Aos olhos de (בְּעֵינֵי)
  { pattern: /^בְּעֵינֵי$/, translation: "aos-olhos-de" },
  // Como (כַּאֲשֶׁר)
  { pattern: /^כַּאֲשֶׁר$/, translation: "como" },
  // A santidade (הַקֹּדֶשׁ)
  { pattern: /^הַקֹּדֶשׁ$/, translation: "a-santidade" },
  // Minha alma (נַפְשִׁי)
  { pattern: /^נַפְשִׁי$/, translation: "minha-alma" },
  // Davi (דָּוִיד)
  { pattern: /^דָּוִיד$/, translation: "Davi" },
  // Assim diz (כֹּה)
  { pattern: /^כֹּה[ ׀]?$/, translation: "assim" },
  // E que (וַאֲשֶׁר)
  { pattern: /^וַאֲשֶׁר$/, translation: "e-que" },
  // Estes (הָאֵלֶּה)
  { pattern: /^הָאֵלֶּה$/, translation: "estes" },
  // No dia (בַּיּוֹם)
  { pattern: /^בַּיּוֹם$/, translation: "no-dia" },
  // Pela mão de (בְּיַד־)
  { pattern: /^בְּיַד־$/, translation: "pela-mão-de" },
  // Príncipes (שָׂרֵי)
  { pattern: /^שָׂרֵי$/, translation: "príncipes-de" },
  // Prata (כֶּסֶף)
  { pattern: /^כֶּסֶף$/, translation: "prata" },
  // O sacerdote (הַכֹּהֵן)
  { pattern: /^הַכֹּהֵן$/, translation: "o-sacerdote" },
  // Tu (אַתָּה)
  { pattern: /^אַתָּה$/, translation: "tu" },
  // Ouvi (שִׁמְעוּ־)
  { pattern: /^שִׁמְעוּ[־]?$/, translation: "ouvi" },
  // Ordenou (צִוָּה)
  { pattern: /^צִוָּה$/, translation: "ordenou" },
  // E disseram (וַיֹּאמְרוּ)
  { pattern: /^וַיֹּאמְרוּ$/, translation: "e-disseram" },
  // Seus filhos (בָּנָיו)
  { pattern: /^בָּנָיו$/, translation: "seus-filhos" },
  // No deserto (בַּמִּדְבָּר)
  { pattern: /^בַּמִּדְבָּר$/, translation: "no-deserto" },
  // Para que não (פֶּן־)
  { pattern: /^פֶּן־$/, translation: "para-que-não" },
  // Cidades (עָרִים)
  { pattern: /^עָרִים$/, translation: "cidades" },
  // Sobre ele (עָלָיו)
  { pattern: /^עָלָיו$/, translation: "sobre-ele" },
  // Vinte (עֶשְׂרִים)
  { pattern: /^עֶשְׂרִים$/, translation: "vinte" },
  // Com ele (עִמּוֹ)
  { pattern: /^עִמּוֹ$/, translation: "com-ele" },
  // O rei (aramáico - מַלְכָּא)
  { pattern: /^מַלְכָּא$/, translation: "o-rei" },
  // A YHWH (לַֽיהוָה)
  { pattern: /^לַ.*יהוָה$/, translation: "a-YHWH" },
  // Como (כְּמוֹ־)
  { pattern: /^כְּמוֹ־$/, translation: "como" },
  // E homem (וְאִישׁ)
  { pattern: /^וְאִישׁ$/, translation: "e-homem" },
  // Eis-me (הִנְנִי)
  { pattern: /^הִנְנִי$/, translation: "eis-me" },
  // No caminho (בְּדֶרֶךְ)
  { pattern: /^בְּדֶרֶךְ$/, translation: "no-caminho" },
  // A mim (אֵלַי)
  { pattern: /^אֵלַי$/, translation: "a-mim" },
  // Grego frequente
  // Ensinando (διδάσκων)
  { pattern: /^διδάσκων$/, translation: "ensinando" },
  // Judas (Ἰούδας)
  { pattern: /^Ἰούδας$/, translation: "Judas" },
  // Creram (ἐπίστευσαν)
  { pattern: /^ἐπίστευσαν$/, translation: "creram" },
  // Vindos (ἐλθόντες)
  { pattern: /^ἐλθόντες$/, translation: "vindo" },
  // Até (ἄχρι)
  { pattern: /^ἄχρι$/, translation: "até" },
  // Homem (ἄνδρα)
  { pattern: /^ἄνδρα$/, translation: "homem" },
  // Apóstolos (ἀποστόλων)
  { pattern: /^ἀποστόλων$/, translation: "apóstolos" },
  // Necessidade (χρείαν)
  { pattern: /^χρείαν$/, translation: "necessidade" },
  // Alegria (χαρᾶς)
  { pattern: /^χαρᾶς$/, translation: "alegria" },
  // Graça (χάριτι)
  { pattern: /^χάριτι$/, translation: "graça" },
  // Estes (τούτους)
  { pattern: /^τούτους$/, translation: "estes" },
  // Carne (σαρκὶ)
  { pattern: /^σαρκὶ$/, translation: "carne" },
  // Cidade (πόλεως)
  { pattern: /^πόλεως$/, translation: "cidade" },
  // Muitos (πολλῶν)
  { pattern: /^πολλῶν$/, translation: "muitos" },
  // Membros (μέλη)
  { pattern: /^μέλη$/, translation: "membros" },
  // Diga (εἴπῃ)
  { pattern: /^εἴπῃ$/, translation: "diga" },
  // Tornai-vos (γίνεσθε)
  { pattern: /^γίνεσθε$/, translation: "tornai-vos" },
  // Elas/eles (αὐτά)
  { pattern: /^αὐτά$/, translation: "elas" },
  // Do Pai (Πατρός)
  { pattern: /^Πατρός$/, translation: "do-Pai" },
  // Sendo (ὢν)
  { pattern: /^ὢν$/, translation: "sendo" },
  // Como (ὡσεὶ)
  { pattern: /^ὡσεὶ$/, translation: "como" },
  // No nome (ὀνόματί)
  { pattern: /^ὀνόματί$/, translation: "no-nome" },
  // Ressuscitou (ἤγειρεν)
  { pattern: /^ἤγειρεν$/, translation: "ressuscitou" },
  // Serão (ἔσονται)
  { pattern: /^ἔσονται$/, translation: "serão" },
  // É lícito (ἔξεστιν)
  { pattern: /^ἔξεστιν$/, translation: "é-lícito" },
  // Saindo (ἐξελθὼν)
  { pattern: /^ἐξελθὼν$/, translation: "saindo" },
  // Homens (ἄνδρας)
  { pattern: /^ἄνδρας$/, translation: "homens" },
  // Hebraico adicional
  // Meu povo (עַמִּי)
  { pattern: /^עַמִּי$/, translation: "meu-povo" },
  // Sobre eles (עֲלֵיהֶם)
  { pattern: /^עֲלֵיהֶם$/, translation: "sobre-eles" },
  // A ela (לָהּ)
  { pattern: /^לָהּ$/, translation: "a-ela" },
  // Porque (יַעַן)
  { pattern: /^יַעַן$/, translation: "porque" },
  // Jerusalém (variante)
  { pattern: /^יְרוּשָׁלִַם$/, translation: "Jerusalém" },
  // E darei (וְנָתַתִּי)
  { pattern: /^וְנָתַתִּי$/, translation: "e-darei" },
  // O mal (הָרַע)
  { pattern: /^הָרַע$/, translation: "o-mal" },
  // Seu filho (בְּנוֹ)
  { pattern: /^בְּנוֹ$/, translation: "seu-filho" },
  // No dia (variante - בְּיוֹם)
  { pattern: /^בְּיוֹם$/, translation: "no-dia" },
  // Nele (בּוֹ)
  { pattern: /^בּוֹ$/, translation: "nele" },
  // A eles (אֲלֵיהֶם)
  { pattern: /^אֲלֵיהֶם$/, translation: "a-eles" },
  // Deus de (אֱלֹהֵי)
  { pattern: /^אֱלֹהֵי$/, translation: "Deus-de" },
  // Mais grego
  // Fim (τέλος)
  { pattern: /^τέλος$/, translation: "fim" },
  // A ti mesmo (σεαυτὸν)
  { pattern: /^σεαυτὸν$/, translation: "a-ti-mesmo" },
  // Profetas (προφῆται)
  { pattern: /^προφῆται$/, translation: "profetas" },
  // Cálice (ποτήριον)
  { pattern: /^ποτήριον$/, translation: "cálice" },
  // Falar (λαλῆσαι, λαλεῖν)
  { pattern: /^λαλῆσαι$/, translation: "falar" },
  { pattern: /^λαλεῖν$/, translation: "falar" },
  // Corações (καρδίαις)
  { pattern: /^καρδίαις$/, translation: "corações" },
  // Vede (βλέπετε)
  { pattern: /^βλέπετε$/, translation: "vede" },
  // Atrás (ὀπίσω)
  { pattern: /^ὀπίσω$/, translation: "atrás" },
  // Ouvistes (ἠκούσατε)
  { pattern: /^ἠκούσατε$/, translation: "ouvistes" },
  // Têm (ἔχουσιν)
  { pattern: /^ἔχουσιν$/, translation: "têm" },
  // Vêm (ἔρχονται)
  { pattern: /^ἔρχονται$/, translation: "vêm" },
  // Nações (ἔθνεσιν)
  { pattern: /^ἔθνεσιν$/, translation: "nações" },
  // Um (ἑνὶ)
  { pattern: /^ἑνὶ$/, translation: "um" },
  // Igreja (ἐκκλησίαν)
  { pattern: /^ἐκκλησίαν$/, translation: "igreja" },
  // Perto (ἐγγὺς)
  { pattern: /^ἐγγὺς$/, translation: "perto" },
  // Homens (Ἄνδρες)
  { pattern: /^Ἄνδρες$/, translation: "Homens" },
  // Ao homem (ἀνθρώπῳ)
  { pattern: /^ἀνθρώπῳ$/, translation: "ao-homem" },
  // Ouvindo (ἀκούσας)
  { pattern: /^ἀκούσας$/, translation: "ouvindo" },
  // Duas (שְׁתֵּי)
  { pattern: /^שְׁתֵּי$/, translation: "duas" },

  // === BATCH 10: Novas palavras frequentes ===

  // Hebraico - Nomes próprios e lugares
  // Moabe (מוֹאָב)
  { pattern: /^מוֹאָב$/, translation: "Moabe" },
  // Arã (אֲרָם)
  { pattern: /^אֲרָם$/, translation: "Arã" },
  // Canaã (כְּנָעַן)
  { pattern: /^כְּנָעַן$/, translation: "Canaã" },
  // Efraim (אֶפְרָיִם)
  { pattern: /^אֶפְרָיִם$/, translation: "Efraim" },
  // Judá (יְהוּדָה)
  { pattern: /^יְהוּדָה$/, translation: "Judá" },
  // Sião (צִיּוֹן)
  { pattern: /^צִיּוֹן$/, translation: "Sião" },
  // Egito (מִצְרָיִם)
  { pattern: /^מִצְרָיִם$/, translation: "Egito" },
  // Jacó (יַעֲקֹב)
  { pattern: /^יַעֲקֹב$/, translation: "Jacó" },
  // Moisés (מֹשֶׁה)
  { pattern: /^מֹשֶׁה$/, translation: "Moisés" },

  // Hebraico - Substantivos
  // Tenda (אֹהֶל)
  { pattern: /^אֹהֶל$/, translation: "tenda" },
  // Reunião/encontro (מוֹעֵד)
  { pattern: /^מוֹעֵד$/, translation: "reunião" },
  // Juízo (מִשְׁפָּט)
  { pattern: /^מִשְׁפָּט$/, translation: "juízo" },
  // Fogo (אֵשׁ)
  { pattern: /^אֵשׁ$/, translation: "fogo" },
  // Altar (מִזְבֵּחַ)
  { pattern: /^מִזְבֵּחַ$/, translation: "altar" },
  // Alma (נֶפֶשׁ)
  { pattern: /^נֶפֶשׁ$/, translation: "alma" },
  // Guerra (מִלְחָמָה)
  { pattern: /^מִלְחָמָה$/, translation: "guerra" },
  // Céus (שָׁמָיִם)
  { pattern: /^שָׁמָיִם$/, translation: "céus" },
  // Sangue (דָּם)
  { pattern: /^דָּם$/, translation: "sangue" },
  // Ouro (זָהָב)
  { pattern: /^זָהָב$/, translation: "ouro" },
  // Força (חַיִל)
  { pattern: /^חַיִל$/, translation: "força" },
  // Espada (חֶרֶב)
  { pattern: /^חֶרֶב$/, translation: "espada" },
  // Sabedoria (חָכְמָה)
  { pattern: /^חָכְמָה$/, translation: "sabedoria" },
  // Obra (מְלָאכָה)
  { pattern: /^מְלָאכָה$/, translation: "obra" },
  // Carne (בָּשָׂר)
  { pattern: /^בָּשָׂר$/, translation: "carne" },
  // Monte (הַר)
  { pattern: /^הַר$/, translation: "monte" },
  // Campo (שָׂדֶה)
  { pattern: /^שָׂדֶה$/, translation: "campo" },

  // Hebraico - Verbos
  // Fez (עָשָׂה)
  { pattern: /^עָשָׂה$/, translation: "fez" },
  // Deu (נָתַן)
  { pattern: /^נָתַן$/, translation: "deu" },
  // Veio (בָּא)
  { pattern: /^בָּא$/, translation: "veio" },
  // Foi (הָלַךְ)
  { pattern: /^הָלַךְ$/, translation: "foi" },
  // Tomou (לָקַח)
  { pattern: /^לָקַח$/, translation: "tomou" },
  // Viu (רָאָה)
  { pattern: /^רָאָה$/, translation: "viu" },
  // Ouviu (שָׁמַע)
  { pattern: /^שָׁמַע$/, translation: "ouviu" },
  // Voltou (שָׁב)
  { pattern: /^שָׁב$/, translation: "voltou" },
  // Levantou-se (קָם)
  { pattern: /^קָם$/, translation: "levantou-se" },
  // Morreu (מֵת)
  { pattern: /^מֵת$/, translation: "morreu" },
  // Matou (הָרַג)
  { pattern: /^הָרַג$/, translation: "matou" },
  // Caiu (נָפַל)
  { pattern: /^נָפַל$/, translation: "caiu" },
  // Enviou (שָׁלַח)
  { pattern: /^שָׁלַח$/, translation: "enviou" },
  // Serviu (עָבַד)
  { pattern: /^עָבַד$/, translation: "serviu" },
  // Edificou (בָּנָה)
  { pattern: /^בָּנָה$/, translation: "edificou" },
  // Destruiu (שָׁחַת)
  { pattern: /^שָׁחַת$/, translation: "destruiu" },

  // Hebraico - Preposições e partículas
  // Sobre (עַל)
  { pattern: /^עַל$/, translation: "sobre" },
  // Antes (לִפְנֵי)
  { pattern: /^לִפְנֵי$/, translation: "diante-de" },
  // Depois (אַחֲרֵי)
  { pattern: /^אַחֲרֵי$/, translation: "depois-de" },
  // Até (עַד)
  { pattern: /^עַד$/, translation: "até" },
  // Entre (בֵּין)
  { pattern: /^בֵּין$/, translation: "entre" },
  // Debaixo (תַּחַת)
  { pattern: /^תַּחַת$/, translation: "debaixo-de" },
  // Ao redor (סָבִיב)
  { pattern: /^סָבִיב$/, translation: "ao-redor" },
  // Com (עִם)
  { pattern: /^עִם$/, translation: "com" },
  // Para (אֶל)
  { pattern: /^אֶל$/, translation: "para" },

  // Hebraico - Números
  // Três (שָׁלֹשׁ, שְׁלֹשָׁה)
  { pattern: /^שָׁלֹשׁ$/, translation: "três" },
  { pattern: /^שְׁלֹשָׁה$/, translation: "três" },
  // Quatro (אַרְבַּע, אַרְבָּעָה)
  { pattern: /^אַרְבַּע$/, translation: "quatro" },
  { pattern: /^אַרְבָּעָה$/, translation: "quatro" },
  // Cinco (חָמֵשׁ, חֲמִשָּׁה)
  { pattern: /^חָמֵשׁ$/, translation: "cinco" },
  { pattern: /^חֲמִשָּׁה$/, translation: "cinco" },
  // Seis (שֵׁשׁ, שִׁשָּׁה)
  { pattern: /^שֵׁשׁ$/, translation: "seis" },
  { pattern: /^שִׁשָּׁה$/, translation: "seis" },
  // Sete (שֶׁבַע, שִׁבְעָה)
  { pattern: /^שֶׁבַע$/, translation: "sete" },
  { pattern: /^שִׁבְעָה$/, translation: "sete" },
  // Oito (שְׁמֹנֶה, שְׁמוֹנָה)
  { pattern: /^שְׁמֹנֶה$/, translation: "oito" },
  { pattern: /^שְׁמוֹנָה$/, translation: "oito" },
  // Dez (עֶשֶׂר, עֲשָׂרָה)
  { pattern: /^עֶשֶׂר$/, translation: "dez" },
  { pattern: /^עֲשָׂרָה$/, translation: "dez" },
  // Cem (מֵאָה)
  { pattern: /^מֵאָה$/, translation: "cem" },
  // Mil (אֶלֶף)
  { pattern: /^אֶלֶף$/, translation: "mil" },

  // Grego - Verbos
  // Disse (εἶπεν)
  { pattern: /^εἶπεν$/, translation: "disse" },
  // Disse-lhe (εἶπέν)
  { pattern: /^εἶπέν$/, translation: "disse-lhe" },
  // Dizendo (λέγων)
  { pattern: /^λέγων$/, translation: "dizendo" },
  // Veio (ἦλθεν)
  { pattern: /^ἦλθεν$/, translation: "veio" },
  // Fez (ἐποίησεν)
  { pattern: /^ἐποίησεν$/, translation: "fez" },
  // Deu (ἔδωκεν)
  { pattern: /^ἔδωκεν$/, translation: "deu" },
  // Respondeu (ἀπεκρίθη)
  { pattern: /^ἀπεκρίθη$/, translation: "respondeu" },
  // Viu (εἶδεν)
  { pattern: /^εἶδεν$/, translation: "viu" },
  // Saiu (ἐξῆλθεν)
  { pattern: /^ἐξῆλθεν$/, translation: "saiu" },
  // Entrou (εἰσῆλθεν)
  { pattern: /^εἰσῆλθεν$/, translation: "entrou" },
  // Enviou (ἀπέστειλεν)
  { pattern: /^ἀπέστειλεν$/, translation: "enviou" },
  // Recebeu (ἔλαβεν)
  { pattern: /^ἔλαβεν$/, translation: "recebeu" },
  // Escreveu (ἔγραψεν)
  { pattern: /^ἔγραψεν$/, translation: "escreveu" },
  // Morreu (ἀπέθανεν)
  { pattern: /^ἀπέθανεν$/, translation: "morreu" },
  // Levantou (ἤγειρεν)
  { pattern: /^ἤγειρεν$/, translation: "levantou" },
  // Creu (ἐπίστευσεν)
  { pattern: /^ἐπίστευσεν$/, translation: "creu" },
  // Ouviu (ἤκουσεν)
  { pattern: /^ἤκουσεν$/, translation: "ouviu" },
  // Chamou (ἐκάλεσεν)
  { pattern: /^ἐκάλεσεν$/, translation: "chamou" },
  // Salvou (ἔσωσεν)
  { pattern: /^ἔσωσεν$/, translation: "salvou" },
  // Amou (ἠγάπησεν)
  { pattern: /^ἠγάπησεν$/, translation: "amou" },

  // Grego - Substantivos
  // Reino (βασιλείαν)
  { pattern: /^βασιλείαν$/, translation: "reino" },
  // Palavra (λόγον)
  { pattern: /^λόγον$/, translation: "palavra" },
  // Espírito (πνεῦμα)
  { pattern: /^πνεῦμα$/, translation: "espírito" },
  // Vida (ζωήν)
  { pattern: /^ζωήν$/, translation: "vida" },
  // Morte (θάνατον)
  { pattern: /^θάνατον$/, translation: "morte" },
  // Verdade (ἀλήθειαν)
  { pattern: /^ἀλήθειαν$/, translation: "verdade" },
  // Amor (ἀγάπην)
  { pattern: /^ἀγάπην$/, translation: "amor" },
  // Fé (πίστιν)
  { pattern: /^πίστιν$/, translation: "fé" },
  // Esperança (ἐλπίδα)
  { pattern: /^ἐλπίδα$/, translation: "esperança" },
  // Paz (εἰρήνην)
  { pattern: /^εἰρήνην$/, translation: "paz" },
  // Justiça (δικαιοσύνην)
  { pattern: /^δικαιοσύνην$/, translation: "justiça" },
  // Lei (νόμον)
  { pattern: /^νόμον$/, translation: "lei" },
  // Pecado (ἁμαρτίαν)
  { pattern: /^ἁμαρτίαν$/, translation: "pecado" },
  // Graça (χάριν)
  { pattern: /^χάριν$/, translation: "graça" },
  // Salvação (σωτηρίαν)
  { pattern: /^σωτηρίαν$/, translation: "salvação" },

  // Grego - Nomes próprios
  // Pedro (Πέτρος)
  { pattern: /^Πέτρος$/, translation: "Pedro" },
  // Paulo (Παῦλος)
  { pattern: /^Παῦλος$/, translation: "Paulo" },
  // João (Ἰωάννης)
  { pattern: /^Ἰωάννης$/, translation: "João" },
  // Tiago (Ἰάκωβος)
  { pattern: /^Ἰάκωβος$/, translation: "Tiago" },
  // Maria (Μαρία, Μαριάμ)
  { pattern: /^Μαρία$/, translation: "Maria" },
  { pattern: /^Μαριάμ$/, translation: "Maria" },
  // Moisés (Μωϋσῆς)
  { pattern: /^Μωϋσῆς$/, translation: "Moisés" },
  // Abraão (Ἀβραάμ)
  { pattern: /^Ἀβραάμ$/, translation: "Abraão" },
  // Davi (Δαυὶδ, Δαβίδ)
  { pattern: /^Δαυὶδ$/, translation: "Davi" },
  { pattern: /^Δαβίδ$/, translation: "Davi" },
  // Israel (Ἰσραήλ)
  { pattern: /^Ἰσραήλ$/, translation: "Israel" },

  // Grego - Preposições
  // De (ἀπό, ἐκ, ἐξ)
  { pattern: /^ἀπό$/, translation: "de" },
  { pattern: /^ἐκ$/, translation: "de" },
  { pattern: /^ἐξ$/, translation: "de" },
  // Para (εἰς, πρός)
  { pattern: /^εἰς$/, translation: "para" },
  { pattern: /^πρός$/, translation: "para" },
  // Com (μετά, σύν)
  { pattern: /^μετά$/, translation: "com" },
  { pattern: /^σύν$/, translation: "com" },
  // Sobre (ἐπί)
  { pattern: /^ἐπί$/, translation: "sobre" },
  // Por (διά)
  { pattern: /^διά$/, translation: "por" },
  // Debaixo (ὑπό)
  { pattern: /^ὑπό$/, translation: "debaixo-de" },
  // Antes (πρό)
  { pattern: /^πρό$/, translation: "antes-de" },

  // Grego - Conjunções e partículas
  // E (καί)
  { pattern: /^καί$/, translation: "e" },
  // Mas (ἀλλά, δέ)
  { pattern: /^ἀλλά$/, translation: "mas" },
  { pattern: /^δέ$/, translation: "mas" },
  // Porque (γάρ, ὅτι)
  { pattern: /^γάρ$/, translation: "porque" },
  { pattern: /^ὅτι$/, translation: "que" },
  // Se (εἰ)
  { pattern: /^εἰ$/, translation: "se" },
  // Nem (οὐδέ)
  { pattern: /^οὐδέ$/, translation: "nem" },
  // Não (οὐ, οὐκ, μή)
  { pattern: /^οὐ$/, translation: "não" },
  { pattern: /^οὐκ$/, translation: "não" },
  { pattern: /^μή$/, translation: "não" },

  // === BATCH 11: Mais palavras frequentes ===

  // Hebraico - variações com cantilação
  // A eles (לָהֶם)
  { pattern: /^לָהֶם$/, translation: "a-eles" },
  // Para que (לְמַעַן)
  { pattern: /^לְמַעַן$/, translation: "para-que" },
  // Há/existe (יֵשׁ)
  { pattern: /^יֵשׁ$/, translation: "há" },
  // Jerusalém com fim de versículo
  { pattern: /^יְרוּשָׁלָ.*ם׃?$/, translation: "Jerusalém" },
  // Esta (זֹאת)
  { pattern: /^זֹאת$/, translation: "esta" },
  // E será (וְהָיָה)
  { pattern: /^וְהָיָה$/, translation: "e-será" },
  // E eis (וְהִנֵּה)
  { pattern: /^וְהִנֵּה$/, translation: "e-eis" },
  // Na mão de (בְּיַד)
  { pattern: /^בְּיַד$/, translation: "na-mão-de" },
  // Na casa de (בְּבֵית)
  { pattern: /^בְּבֵית$/, translation: "na-casa-de" },
  // Iniquidade (אָוֶן)
  { pattern: /^אָוֶן$/, translation: "iniquidade" },
  // A mim (אֵלַי)
  { pattern: /^אֵלַי$/, translation: "a-mim" },
  // Ímpio (רָשָׁע)
  { pattern: /^רָשָׁע$/, translation: "ímpio" },
  // Exércitos/hostes (צְבָאוֹת)
  { pattern: /^צְבָאוֹת$/, translation: "exércitos" },
  // Filisteus (פְּלִשְׁתִּים)
  { pattern: /^פְּלִשְׁתִּים$/, translation: "filisteus" },
  // Por favor/peço (נָא)
  { pattern: /^נָא$/, translation: "por-favor" },
  // De mim (מִנִּי־)
  { pattern: /^מִנִּי[־]?$/, translation: "de-mim" },
  // A vós/para vós (לָכֶם)
  { pattern: /^לָכֶם$/, translation: "a-vós" },
  // Para Davi (לְדָוִד)
  { pattern: /^לְדָוִד׃?$/, translation: "para-Davi" },
  // Josué (יְהוֹשֻׁעַ)
  { pattern: /^יְהוֹשֻׁעַ$/, translation: "Josué" },
  // E disseram (וַיֹּאמְרוּ)
  { pattern: /^וַיֹּאמְרוּ$/, translation: "e-disseram" },
  // E feriu (וַיַּךְ)
  { pattern: /^וַיַּךְ$/, translation: "e-feriu" },
  // E farás (וְעָשִׂיתָ)
  { pattern: /^וְעָשִׂיתָ$/, translation: "e-farás" },
  // Que/o qual (aramáico - דִּי־)
  { pattern: /^דִּי[־]?$/, translation: "que" },
  // Homens de (אַנְשֵׁי)
  { pattern: /^אַנְשֵׁי$/, translation: "homens-de" },
  // Estes (אֵלֶּה)
  { pattern: /^אֵלֶּה$/, translation: "estes" },
  // A eles (אֲלֵהֶם)
  { pattern: /^אֲלֵהֶם$/, translation: "a-eles" },

  // Grego - verbos e substantivos adicionais
  // Tu (σύ)
  { pattern: /^σύ$/, translation: "tu" },
  // Salvação (σωτηρίας)
  { pattern: /^σωτηρίας$/, translation: "salvação" },
  // Onde (ποῦ)
  { pattern: /^ποῦ$/, translation: "onde" },
  // Muito (πολλῷ)
  { pattern: /^πολλῷ$/, translation: "muito" },
  // Farei (ποιήσω)
  { pattern: /^ποιήσω$/, translation: "farei" },
  // Seja cumprido (πληρωθῇ)
  { pattern: /^πληρωθῇ$/, translation: "seja-cumprido" },
  // Parábola (παραβολὴν)
  { pattern: /^παραβολὴν$/, translation: "parábola" },
  // Na casa (οἴκῳ)
  { pattern: /^οἴκῳ$/, translation: "na-casa" },
  // Povo (λαὸς)
  { pattern: /^λαὸς$/, translation: "povo" },
  // Cabeça (κεφαλὴν)
  { pattern: /^κεφαλὴν$/, translation: "cabeça" },
  // Tempo (καιρὸν)
  { pattern: /^καιρὸν$/, translation: "tempo" },
  // Parece (δοκεῖ)
  { pattern: /^δοκεῖ$/, translation: "parece" },
  // Sabeis (γινώσκετε)
  { pattern: /^γινώσκετε$/, translation: "sabeis" },
  // Rei (βασιλεὺς)
  { pattern: /^βασιλεὺς$/, translation: "rei" },
  // Maria (Μαριὰμ)
  { pattern: /^Μαριὰμ$/, translation: "Maria" },
  // Palavra/dito (ῥῆμα)
  { pattern: /^ῥῆμα$/, translation: "palavra" },
  // Toda (ὅλην)
  { pattern: /^ὅλην$/, translation: "toda" },
  // Olhos (ὀφθαλμοὺς)
  { pattern: /^ὀφθαλμοὺς$/, translation: "olhos" },
  // Isaque (Ἰσαὰκ)
  { pattern: /^Ἰσαὰκ$/, translation: "Isaque" },
  // Vê/eis (ἴδε)
  { pattern: /^ἴδε$/, translation: "vê" },
  // Do templo (ἱεροῦ)
  { pattern: /^ἱεροῦ$/, translation: "do-templo" },
  // Éreis (ἦτε)
  { pattern: /^ἦτε$/, translation: "éreis" },
  // Dias (ἡμέραι)
  { pattern: /^ἡμέραι$/, translation: "dias" },
  // Santos (ἁγίοις)
  { pattern: /^ἁγίοις$/, translation: "santos" },
  // Deixou (ἀφῆκεν)
  { pattern: /^ἀφῆκεν$/, translation: "deixou" },
  // Uns aos outros (ἀλλήλων)
  { pattern: /^ἀλλήλων$/, translation: "uns-aos-outros" },
  // Não mais (μηκέτι)
  { pattern: /^μηκέτι$/, translation: "não-mais" },
  // A ninguém (μηδενὶ)
  { pattern: /^μηδενὶ$/, translation: "a-ninguém" },
  // Falo (λαλῶ)
  { pattern: /^λαλῶ$/, translation: "falo" },
  // Fala (λαλεῖ)
  { pattern: /^λαλεῖ$/, translation: "fala" },
  // Buscais (ζητεῖτε)
  { pattern: /^ζητεῖτε$/, translation: "buscais" },
  // Entrando (εἰσελθὼν)
  { pattern: /^εἰσελθὼν$/, translation: "entrando" },

  // === BATCH 12: Mais palavras frequentes ===

  // Hebraico
  // Paz (εἰρήνης - grego)
  { pattern: /^εἰρήνης$/, translation: "paz" },
  // Dizendo (εἰπὼν)
  { pattern: /^εἰπὼν$/, translation: "dizendo" },
  // Poderes (δυνάμεις)
  { pattern: /^δυνάμεις$/, translation: "poderes" },
  // Demônios (δαιμόνια)
  { pattern: /^δαιμόνια$/, translation: "demônios" },
  // Aconteceu (γέγονεν)
  { pattern: /^γέγονεν$/, translation: "aconteceu" },
  // Elas/os (αὐτὰ)
  { pattern: /^αὐτὰ$/, translation: "eles" },
  // Ele/isso (αὐτό)
  { pattern: /^αὐτό$/, translation: "isso" },
  // Pai (Πάτερ)
  { pattern: /^Πάτερ$/, translation: "Pai" },
  // Sendo/estando (ὄντα)
  { pattern: /^ὄντα$/, translation: "sendo" },
  // Próprio (ἴδιον)
  { pattern: /^ἴδιον$/, translation: "próprio" },
  // Começaram (ἤρξαντο)
  { pattern: /^ἤρξαντο$/, translation: "começaram" },
  // Seguiram (ἠκολούθησαν)
  { pattern: /^ἠκολούθησαν$/, translation: "seguiram" },
  // Por causa de (ἕνεκεν)
  { pattern: /^ἕνεκεν$/, translation: "por-causa-de" },
  // Misericórdia (ἔλεος)
  { pattern: /^ἔλεος$/, translation: "misericórdia" },
  // Receberam (ἔλαβον)
  { pattern: /^ἔλαβον$/, translation: "receberam" },
  // A mim (ἐμέ)
  { pattern: /^ἐμέ$/, translation: "a-mim" },
  // Daquele (ἐκείνου)
  { pattern: /^ἐκείνου$/, translation: "daquele" },
  // Apóstolo (ἀπόστολος)
  { pattern: /^ἀπόστολος$/, translation: "apóstolo" },
  // Responderam (ἀπεκρίθησαν)
  { pattern: /^ἀπεκρίθησαν$/, translation: "responderam" },
  // Irmãos (ἀδελφοὶ)
  { pattern: /^ἀδελφοὶ$/, translation: "irmãos" },

  // Hebraico - palavras
  // Será (תִּהְיֶה)
  { pattern: /^תִּהְיֶה$/, translation: "será" },
  // Remanescente (שְׁאֵרִית)
  { pattern: /^שְׁאֵרִית$/, translation: "remanescente" },
  // Santo/santidade (קֹדֶשׁ)
  { pattern: /^קֹדֶשׁ$/, translation: "santidade" },
  // Cidades de (עָרֵי)
  { pattern: /^עָרֵי$/, translation: "cidades-de" },
  // Povos (עַמִּים)
  { pattern: /^עַמִּים$/, translation: "povos" },
  // Seus servos (עֲבָדָיו)
  { pattern: /^עֲבָדָיו$/, translation: "seus-servos" },
  // Obra de (מַעֲשֵׂה)
  { pattern: /^מַעֲשֵׂה$/, translation: "obra-de" },
  // Egito (מִצְרַיִם)
  { pattern: /^מִצְרַיִם$/, translation: "Egito" },
  // Para fazer (לַעֲשׂוֹת)
  { pattern: /^לַעֲשׂוֹת$/, translation: "para-fazer" },
  // Ao regente (לַמְנַצֵּחַ)
  { pattern: /^לַמְנַצֵּחַ$/, translation: "ao-regente" },
  // Para mim (לִי)
  { pattern: /^לִי$/, translation: "para-mim" },
  // Aos olhos de (לְעֵינֵי)
  { pattern: /^לְעֵינֵי$/, translation: "aos-olhos-de" },
  // E quem (וּמִי)
  { pattern: /^וּמִי$/, translation: "e-quem" },
  // E vieram (וַיָּבֹאוּ)
  { pattern: /^וַיָּבֹאוּ$/, translation: "e-vieram" },
  // E dirás (וְאָמַרְתָּ)
  { pattern: /^וְאָמַרְתָּ$/, translation: "e-dirás" },
  // As nações (הַגּוֹיִם)
  { pattern: /^הַגּוֹיִם$/, translation: "as-nações" },
  // Em siclo (בְּשֶׁקֶל)
  { pattern: /^בְּשֶׁקֶל$/, translation: "em-siclo" },
  // Disse (אָמַר)
  { pattern: /^אָמַר[ ׀]?$/, translation: "disse" },
  // Arão (אַהֲרֹן)
  { pattern: /^אַהֲרֹן$/, translation: "Arão" },
  // Darei (אֶתֵּן)
  { pattern: /^אֶתֵּן$/, translation: "darei" },
  // A ti (אֵלֶיךָ)
  { pattern: /^אֵלֶיךָ$/, translation: "a-ti" },

  // Grego - mais palavras
  // Sinais (σημεῖα)
  { pattern: /^σημεῖα$/, translation: "sinais" },
  // Tendo chamado (προσκαλεσάμενος)
  { pattern: /^προσκαλεσάμενος$/, translation: "tendo-chamado" },
  // Muitas vezes (πολλάκις)
  { pattern: /^πολλάκις$/, translation: "muitas-vezes" },
  // Faço (ποιῶ)
  { pattern: /^ποιῶ$/, translation: "faço" },
  // Fará (ποιήσει)
  { pattern: /^ποιήσει$/, translation: "fará" },
  // Imediatamente (παραχρῆμα)
  { pattern: /^παραχρῆμα$/, translation: "imediatamente" },
  // Testemunho (μαρτύριον)
  { pattern: /^μαρτύριον$/, translation: "testemunho" },
  // Povo (λαὸν)
  { pattern: /^λαὸν$/, translation: "povo" },
  // Dez (δέκα)
  { pattern: /^δέκα$/, translation: "dez" },
  // No reino (βασιλείᾳ)
  { pattern: /^βασιλείᾳ$/, translation: "no-reino" },
  // Estas coisas (Ταῦτα)
  { pattern: /^Ταῦτα$/, translation: "estas-coisas" },
  // Pela fé (Πίστει)
  { pattern: /^Πίστει$/, translation: "pela-fé" },
  // Multidões (ὄχλους)
  { pattern: /^ὄχλους$/, translation: "multidões" },
  // Da multidão (ὄχλου)
  { pattern: /^ὄχλου$/, translation: "da-multidão" },
  // A qual (ἥτις)
  { pattern: /^ἥτις$/, translation: "a-qual" },
  // Ouviram (ἤκουσαν)
  { pattern: /^ἤκουσαν$/, translation: "ouviram" },
  // Cada um (ἕκαστος)
  { pattern: /^ἕκαστος$/, translation: "cada-um" },
  // Caiu (ἔπεσεν)
  { pattern: /^ἔπεσεν$/, translation: "caiu" },
  // Dirá (ἐρεῖ)
  { pattern: /^ἐρεῖ$/, translation: "dirá" },
  // No dia seguinte (ἐπαύριον)
  { pattern: /^ἐπαύριον$/, translation: "no-dia-seguinte" },
  // Saindo (ἐξελθόντες)
  { pattern: /^ἐξελθόντες$/, translation: "saindo" },
  // Mandamento (ἐντολὴν)
  { pattern: /^ἐντολὴν$/, translation: "mandamento" },
  // Dos santos (ἁγίων)
  { pattern: /^ἁγίων$/, translation: "dos-santos" },
  // Saudai (ἀσπάσασθε)
  { pattern: /^ἀσπάσασθε$/, translation: "saudai" },
  // Em troca de (ἀντὶ)
  { pattern: /^ἀντὶ$/, translation: "em-troca-de" },
  // Ouvi (ἀκούετε)
  { pattern: /^ἀκούετε$/, translation: "ouvi" },
  // Do irmão (ἀδελφοῦ)
  { pattern: /^ἀδελφοῦ$/, translation: "do-irmão" },
  // Aos irmãos (ἀδελφοῖς)
  { pattern: /^ἀδελφοῖς$/, translation: "aos-irmãos" },
  // Amados (ἀγαπητοί)
  { pattern: /^ἀγαπητοί$/, translation: "amados" },

  // Hebraico adicional
  // Seir (שְׂעִיר־)
  { pattern: /^שְׂעִיר[־]?$/, translation: "Seir" },
  // Sete (שִׁבְעַת)
  { pattern: /^שִׁבְעַת$/, translation: "sete" },
  // Mal/maldade (רָעָה)
  { pattern: /^רָעָה$/, translation: "maldade" },

  // === BATCH 13: Mais palavras frequentes ===

  // Hebraico
  // Vi (רָאִיתִי)
  { pattern: /^רָאִיתִי$/, translation: "vi" },
  // Voz (קוֹל)
  { pattern: /^קוֹל$/, translation: "voz" },
  // Justo (צַדִּיק)
  { pattern: /^צַדִּיק$/, translation: "justo" },
  // Entrada/porta (פֶּתַח)
  { pattern: /^פֶּתַח$/, translation: "entrada" },
  // Canto/esquina (פְּאַת־)
  { pattern: /^פְּאַת[־]?$/, translation: "canto" },
  // Filisteus (פְלִשְׁתִּים)
  { pattern: /^פְלִשְׁתִּים$/, translation: "filisteus" },
  // Fizeram (עָשׂוּ)
  { pattern: /^עָשׂוּ$/, translation: "fizeram" },
  // Tempo (עֵת)
  { pattern: /^עֵת$/, translation: "tempo" },
  // Contigo (עִמָּךְ)
  { pattern: /^עִמָּךְ$/, translation: "contigo" },
  // Árvores de (עֲצֵי)
  { pattern: /^עֲצֵי$/, translation: "árvores-de" },
  // Livro (סֵפֶר)
  { pattern: /^סֵפֶר$/, translation: "livro" },
  // Reis de (מַלְכֵי)
  { pattern: /^מַלְכֵי$/, translation: "reis-de" },
  // Do Egito (מִמִּצְרַיִם)
  { pattern: /^מִמִּצְרַיִם$/, translation: "do-Egito" },
  // Quem (מִי)
  { pattern: /^מִי$/, translation: "quem" },
  // Para sempre (לְעוֹלָם)
  { pattern: /^לְעוֹלָם$/, translation: "para-sempre" },
  // Prata (כָּסֶף)
  { pattern: /^כָּסֶף$/, translation: "prata" },
  // José (יוֹסֵף)
  { pattern: /^יוֹסֵף$/, translation: "José" },
  // Este (זֶה)
  { pattern: /^זֶה$/, translation: "este" },
  // E vinte (וְעֶשְׂרִים)
  { pattern: /^וְעֶשְׂרִים$/, translation: "e-vinte" },
  // Nações (גּוֹיִם)
  { pattern: /^גּוֹיִם$/, translation: "nações" },
  // Com a espada (בַּחֶרֶב)
  { pattern: /^בַּחֶרֶב$/, translation: "com-a-espada" },
  // De manhã (בַּבֹּקֶר)
  { pattern: /^בַּבֹּקֶר$/, translation: "de-manhã" },
  // No nome de (בְּשֵׁם)
  { pattern: /^בְּשֵׁם$/, translation: "no-nome-de" },
  // Com voz (בְּקוֹל)
  { pattern: /^בְּקוֹל$/, translation: "com-voz" },
  // Na cidade (בְּעִיר)
  { pattern: /^בְּעִיר$/, translation: "na-cidade" },
  // A ela (אֹתָהּ)
  { pattern: /^אֹתָהּ$/, translation: "a-ela" },
  // Vós (אַתֶּם)
  { pattern: /^אַתֶּם$/, translation: "vós" },
  // Deus de (אֱלֹהֵי[־]?)
  { pattern: /^אֱלֹהֵי[־]?$/, translation: "Deus-de" },
  // Nosso Deus (אֱלֹהֵינוּ)
  { pattern: /^אֱלֹהֵינוּ$/, translation: "nosso-Deus" },

  // Grego
  // Mão (χεῖρα)
  { pattern: /^χεῖρα$/, translation: "mão" },
  // Da mão (χειρὸς)
  { pattern: /^χειρὸς$/, translation: "da-mão" },
  // Na prisão (φυλακῇ)
  { pattern: /^φυλακῇ$/, translation: "na-prisão" },
  // Isto é (τοῦτ')
  { pattern: /^τοῦτ'$/, translation: "isto-é" },
  // Alguns (τινὲς)
  { pattern: /^τινὲς$/, translation: "alguns" },
  // Carne (σὰρξ)
  { pattern: /^σὰρξ$/, translation: "carne" },
  // Na carne (σαρκί)
  { pattern: /^σαρκί$/, translation: "na-carne" },
  // Na cidade (πόλει)
  { pattern: /^πόλει$/, translation: "na-cidade" },
  // Ir (πορεύεσθαι)
  { pattern: /^πορεύεσθαι$/, translation: "ir" },
  // A muitos (πολλοὺς)
  { pattern: /^πολλοὺς$/, translation: "a-muitos" },
  // Muitos (πολλοί)
  { pattern: /^πολλοί$/, translation: "muitos" },
  // Próximo (πλησίον)
  { pattern: /^πλησίον$/, translation: "próximo" },
  // Entregou (παρέδωκεν)
  { pattern: /^παρέδωκεν$/, translation: "entregou" },
  // De todo (παντὸς)
  { pattern: /^παντὸς$/, translation: "de-todo" },
  // Céu (οὐρανὸν)
  { pattern: /^οὐρανὸν$/, translation: "céu" },
  // Da casa (οἰκίας)
  { pattern: /^οἰκίας$/, translation: "da-casa" },
  // Da noite (νυκτὸς)
  { pattern: /^νυκτὸς$/, translation: "da-noite" },
  // Salário (μισθὸν)
  { pattern: /^μισθὸν$/, translation: "salário" },
  // Discípulos (μαθηταί)
  { pattern: /^μαθηταί$/, translation: "discípulos" },
  // No meio (μέσῳ)
  { pattern: /^μέσῳ$/, translation: "no-meio" },
  // Palavras (λόγοις)
  { pattern: /^λόγοις$/, translation: "palavras" },
  // Falando (λαλοῦντος)
  { pattern: /^λαλοῦντος$/, translation: "falando" },
  // Pedra (λίθον)
  { pattern: /^λίθον$/, translation: "pedra" },
  // Dizes (λέγεις)
  { pattern: /^λέγεις$/, translation: "dizes" },
  // Servo (δοῦλον)
  { pattern: /^δοῦλον$/, translation: "servo" },
  // Da justiça (δικαιοσύνης)
  { pattern: /^δικαιοσύνης$/, translation: "da-justiça" },
  // Dos escribas (γραμματέων)
  { pattern: /^γραμματέων$/, translation: "dos-escribas" },
  // Batismo (βάπτισμα)
  { pattern: /^βάπτισμα$/, translation: "batismo" },
  // A Paulo (Παύλῳ)
  { pattern: /^Παύλῳ$/, translation: "a-Paulo" },
  // Galileia (Γαλιλαίαν)
  { pattern: /^Γαλιλαίαν$/, translation: "Galileia" },
  // Ouvidos (ὦτα)
  { pattern: /^ὦτα$/, translation: "ouvidos" },
  // De toda (ὅλης)
  { pattern: /^ὅλης$/, translation: "de-toda" },
  // Monte (ὄρος)
  { pattern: /^ὄρος$/, translation: "monte" },
  // Nome (ὄνομά)
  { pattern: /^ὄνομά$/, translation: "nome" },
  // Tiago (Ἰάκωβον)
  { pattern: /^Ἰάκωβον$/, translation: "Tiago" },
  // Eu (Ἐγώ)
  { pattern: /^Ἐγώ$/, translation: "Eu" },
  // Escrevi (ἔγραψα)
  { pattern: /^ἔγραψα$/, translation: "escrevi" },
  // Promessa (ἐπαγγελίαν)
  { pattern: /^ἐπαγγελίαν$/, translation: "promessa" },
  // Em autoridade (ἐξουσίᾳ)
  { pattern: /^ἐξουσίᾳ$/, translation: "em-autoridade" },
  // A mim (ἐμοί)
  { pattern: /^ἐμοί$/, translation: "a-mim" },
  // Aqueles (ἐκεῖνοι)
  { pattern: /^ἐκεῖνοι$/, translation: "aqueles" },
  // Buscavam (ἐζήτουν)
  { pattern: /^ἐζήτουν$/, translation: "buscavam" },
  // Dos pecados (ἁμαρτιῶν)
  { pattern: /^ἁμαρτιῶν$/, translation: "dos-pecados" },
  // Do sumo sacerdote (ἀρχιερέως)
  { pattern: /^ἀρχιερέως$/, translation: "do-sumo-sacerdote" },
  // Partindo (ἀπελθὼν)
  { pattern: /^ἀπελθὼν$/, translation: "partindo" },
  // Da ressurreição (ἀναστάσεως)
  { pattern: /^ἀναστάσεως$/, translation: "da-ressurreição" },
  // Irmão (ἀδελφὸς)
  { pattern: /^ἀδελφὸς$/, translation: "irmão" },
  // Bom (ἀγαθόν)
  { pattern: /^ἀγαθόν$/, translation: "bom" },

  // Hebraico adicional
  // Paz (שָׁלוֹם)
  { pattern: /^שָׁלוֹם$/, translation: "paz" },
  // Sobre ti (עָלַיִךְ, עָלֶיךָ)
  { pattern: /^עָלַיִךְ$/, translation: "sobre-ti" },
  { pattern: /^עָלֶיךָ$/, translation: "sobre-ti" },
  // Sobre ela (עָלֶיהָ)
  { pattern: /^עָלֶיהָ$/, translation: "sobre-ela" },
  // Bronze (נְחֹשֶׁת)
  { pattern: /^נְחֹשֶׁת$/, translation: "bronze" },
  // Virá (יָבוֹא)
  { pattern: /^יָבוֹא$/, translation: "virá" },
  // Cinquenta (חֲמִשִּׁים)
  { pattern: /^חֲמִשִּׁים$/, translation: "cinquenta" },
  // E respondeu (וַיַּעַן)
  { pattern: /^וַיַּעַן$/, translation: "e-respondeu" },
  // E foi/aconteceu (וַיְהִי[־]?)
  { pattern: /^וַיְהִי[־]?$/, translation: "e-foi" },
  // E voz (וְקוֹל)
  { pattern: /^וְקוֹל$/, translation: "e-voz" },
  // E saberão (וְיָדְעוּ)
  { pattern: /^וְיָדְעוּ$/, translation: "e-saberão" },
  // E será (וְהָיְתָה)
  { pattern: /^וְהָיְתָה$/, translation: "e-será" },
  // E tu (וְאַתָּה)
  { pattern: /^וְאַתָּה$/, translation: "e-tu" },
  // O povo (הָעָם)
  { pattern: /^הָעָם$/, translation: "o-povo" },
  // O mar (הַיָּם)
  { pattern: /^הַיָּם$/, translation: "o-mar" },
  // Aquele (הַהוּא)
  { pattern: /^הַהוּא$/, translation: "aquele" },
  // Eles (הֵמָּה)
  { pattern: /^הֵמָּה$/, translation: "eles" },

  // === BATCH 14: Mais palavras frequentes ===

  // Hebraico
  // Eles (הֵם)
  { pattern: /^הֵם$/, translation: "eles" },
  // Eis (הִנֵּה[־]?)
  { pattern: /^הִנֵּה[־]?$/, translation: "eis" },
  // Porventura não (הֲלוֹא[־]?)
  { pattern: /^הֲלוֹא[־]?$/, translation: "porventura-não" },
  // Em mim (בִּי)
  { pattern: /^בִּי$/, translation: "em-mim" },
  // Efraim (אֶפְרַיִם)
  { pattern: /^אֶפְרַיִם$/, translation: "Efraim" },
  // Com ele (אִתּוֹ)
  { pattern: /^אִתּוֹ$/, translation: "com-ele" },
  // Deus (אֱלוֹהַּ)
  { pattern: /^אֱלוֹהַּ$/, translation: "Deus" },

  // Grego
  // Tempo (χρόνον)
  { pattern: /^χρόνον$/, translation: "tempo" },
  // Lugar (τόπος)
  { pattern: /^τόπος$/, translation: "lugar" },
  // De alguém (τινος)
  { pattern: /^τινος$/, translation: "de-alguém" },
  // Quem/qual (τίνα)
  { pattern: /^τίνα$/, translation: "quem" },
  // Te (σὲ)
  { pattern: /^σὲ$/, translation: "te" },
  // Consciência (συνείδησιν)
  { pattern: /^συνείδησιν$/, translation: "consciência" },
  // No sábado (σαββάτῳ)
  { pattern: /^σαββάτῳ$/, translation: "no-sábado" },
  // Quando (πότε)
  { pattern: /^πότε$/, translation: "quando" },
  // Aproximando-se (προσελθόντες)
  { pattern: /^προσελθόντες$/, translation: "aproximando-se" },
  // Credes (πιστεύετε)
  { pattern: /^πιστεύετε$/, translation: "credes" },
  // A ninguém (οὐδένα)
  { pattern: /^οὐδένα$/, translation: "a-ninguém" },
  // Agora (νυνὶ)
  { pattern: /^νυνὶ$/, translation: "agora" },
  // Túmulo (μνημεῖον)
  { pattern: /^μνημεῖον$/, translation: "túmulo" },
  // Grande (μεγάλῃ)
  { pattern: /^μεγάλῃ$/, translation: "grande" },
  // Bem-aventurados (μακάριοι)
  { pattern: /^μακάριοι$/, translation: "bem-aventurados" },
  // Nem (μήτε)
  { pattern: /^μήτε$/, translation: "nem" },
  // Palavras (λόγους)
  { pattern: /^λόγους$/, translation: "palavras" },
  // Povo (λαόν)
  { pattern: /^λαόν$/, translation: "povo" },
  // Falando (λαλῶν)
  { pattern: /^λαλῶν$/, translation: "falando" },
  // Mal (κακῶς)
  { pattern: /^κακῶς$/, translation: "mal" },
  // Assim como (καθάπερ)
  { pattern: /^καθάπερ$/, translation: "assim-como" },
  // Encontrou (εὗρεν)
  { pattern: /^εὗρεν$/, translation: "encontrou" },
  // Tinha (εἶχεν)
  { pattern: /^εἶχεν$/, translation: "tinha" },
  // Dizer (εἰπεῖν)
  { pattern: /^εἰπεῖν$/, translation: "dizer" },
  // Da aliança (διαθήκης)
  { pattern: /^διαθήκης$/, translation: "da-aliança" },
  // Seja assim (γένοιτο)
  { pattern: /^γένοιτο$/, translation: "seja-assim" },
  // Causa (αἰτίαν)
  { pattern: /^αἰτίαν$/, translation: "causa" },
  // De Simão (Σίμωνος)
  { pattern: /^Σίμωνος$/, translation: "de-Simão" },
  // Este (Οὗτός)
  { pattern: /^Οὗτός$/, translation: "Este" },
  // Por isso (Διὸ)
  { pattern: /^Διὸ$/, translation: "por-isso" },
  // Davi (Δαυείδ)
  { pattern: /^Δαυείδ$/, translation: "Davi" },
  // Rabi (Ῥαββεί)
  { pattern: /^Ῥαββεί$/, translation: "Rabi" },
  // Da mesma forma (ὡσαύτως)
  { pattern: /^ὡσαύτως$/, translation: "da-mesma-forma" },
  // Sendo (ὑπάρχων)
  { pattern: /^ὑπάρχων$/, translation: "sendo" },
  // Sendo (ὄντος)
  { pattern: /^ὄντος$/, translation: "sendo" },
  // Semelhantemente (ὁμοίως)
  { pattern: /^ὁμοίως$/, translation: "semelhantemente" },
  // Caminho (ὁδόν)
  { pattern: /^ὁδόν$/, translation: "caminho" },
  // Vê (Ἴδε)
  { pattern: /^Ἴδε$/, translation: "Vê" },
  // Jacó (Ἰακὼβ)
  { pattern: /^Ἰακὼβ$/, translation: "Jacó" },
  // Templo (ἱερὸν)
  { pattern: /^ἱερὸν$/, translation: "templo" },
  // Elias (Ἡλείας)
  { pattern: /^Ἡλείας$/, translation: "Elias" },
  // Eu era (ἤμην)
  { pattern: /^ἤμην$/, translation: "eu-era" },
  // Foi ressuscitado (ἠγέρθη)
  { pattern: /^ἠγέρθη$/, translation: "foi-ressuscitado" },
  // Tendo (ἔχοντα)
  { pattern: /^ἔχοντα$/, translation: "tendo" },
  // Anos (ἐτῶν)
  { pattern: /^ἐτῶν$/, translation: "anos" },
  // Fizeram (ἐποίησαν)
  { pattern: /^ἐποίησαν$/, translation: "fizeram" },
  // Perguntou (ἐπηρώτησεν)
  { pattern: /^ἐπηρώτησεν$/, translation: "perguntou" },
  // Repreendeu (ἐπετίμησεν)
  { pattern: /^ἐπετίμησεν$/, translation: "repreendeu" },
  // Daquela (ἐκείνης)
  { pattern: /^ἐκείνης$/, translation: "daquela" },
  // Outras coisas (ἄλλα)
  { pattern: /^ἄλλα$/, translation: "outras-coisas" },
  // Deixando (ἀφέντες)
  { pattern: /^ἀφέντες$/, translation: "deixando" },
  // Foram (ἀπῆλθον)
  { pattern: /^ἀπῆλθον$/, translation: "foram" },
  // Anunciaram (ἀπήγγειλαν)
  { pattern: /^ἀπήγγειλαν$/, translation: "anunciaram" },
  // Ouvir (ἀκοῦσαι, ἀκούειν)
  { pattern: /^ἀκοῦσαι$/, translation: "ouvir" },
  { pattern: /^ἀκούειν$/, translation: "ouvir" },
  // Dos irmãos (ἀδελφῶν)
  { pattern: /^ἀδελφῶν$/, translation: "dos-irmãos" },

  // Hebraico adicional
  // Farás (תַּעֲשֶׂה)
  { pattern: /^תַּעֲשֶׂה$/, translation: "farás" },
  // Siclo (שֶׁקֶל)
  { pattern: /^שֶׁקֶל$/, translation: "siclo" },
  // Acácia (שִׁטִּים)
  { pattern: /^שִׁטִּים$/, translation: "acácia" },
  // Sua face (פָּנָיו)
  { pattern: /^פָּנָיו$/, translation: "sua-face" },
  // Sobre mim (עָלַי)
  { pattern: /^עָלַי$/, translation: "sobre-mim" },
  // Sobre (עֲלֵי[־]?)
  { pattern: /^עֲלֵי[־]?$/, translation: "sobre" },
  // Iniquidade (עֲוֺן)
  { pattern: /^עֲוֺן$/, translation: "iniquidade" },
  // Sua alma (נַפְשׁוֹ)
  { pattern: /^נַפְשׁוֹ$/, translation: "sua-alma" },
  // Que/o quê (מָה[־]?)
  { pattern: /^מָה[־]?$/, translation: "o-quê" },
  // Anjo (מַלְאַךְ)
  { pattern: /^מַלְאַךְ$/, translation: "anjo" },
  // De sobre (מֵעַל)
  { pattern: /^מֵעַל$/, translation: "de-sobre" },
  // De diante de (מִפְּנֵי)
  { pattern: /^מִפְּנֵי$/, translation: "de-diante-de" },
  // Da mão de (מִיַּד)
  { pattern: /^מִיַּד$/, translation: "da-mão-de" },
  // Por isso (לָכֵן)
  { pattern: /^לָכֵן$/, translation: "por-isso" },
  // Para vir (לָבוֹא)
  { pattern: /^לָבוֹא$/, translation: "para-vir" },
  // Ao rei (לַמֶּלֶךְ)
  { pattern: /^לַמֶּלֶךְ$/, translation: "ao-rei" },
  // Diante de (לִפְנֵי[־]?)
  { pattern: /^לִפְנֵי[־]?$/, translation: "diante-de" },
  // Palma/palmo (כַּף)
  { pattern: /^כַּף$/, translation: "palma" },
  // Sim/assim (כֵּן)
  { pattern: /^כֵּן$/, translation: "assim" },
  // Cordeiros (כְּבָשִׂים)
  { pattern: /^כְּבָשִׂים$/, translation: "cordeiros" },
  // Habitantes de (יֹשְׁבֵי)
  { pattern: /^יֹשְׁבֵי$/, translation: "habitantes-de" },
  // Mão de (יַד[־]?)
  { pattern: /^יַד[־]?$/, translation: "mão-de" },
  // Jeremias (יִרְמְיָהוּ)
  { pattern: /^יִרְמְיָהוּ$/, translation: "Jeremias" },
  // Ezequias (חִזְקִיָּהוּ)
  { pattern: /^חִזְקִיָּהוּ$/, translation: "Ezequias" },
  // E subiu (וַיַּעַל)
  { pattern: /^וַיַּעַל$/, translation: "e-subiu" },
  // E enviou (וַיִּשְׁלַח)
  { pattern: /^וַיִּשְׁלַח$/, translation: "e-enviou" },

  // === BATCH 15: Mais palavras frequentes ===

  // Hebraico
  // E lavará (וְרָחַץ)
  { pattern: /^וְרָחַץ$/, translation: "e-lavará" },
  // Eis-os (הִנָּם)
  { pattern: /^הִנָּם$/, translation: "eis-os" },
  // Na terra (בָּאָרֶץ)
  { pattern: /^בָּאָרֶץ$/, translation: "na-terra" },
  // Não há (אֵין[־]?)
  { pattern: /^אֵין[־]?$/, translation: "não-há" },
  // Homem (אִישׁ[־]?)
  { pattern: /^אִישׁ[־]?$/, translation: "homem" },
  // Teu nome (שִׁמְךָ)
  { pattern: /^שִׁמְךָ$/, translation: "teu-nome" },
  // Teu servo (עַבְדְּךָ)
  { pattern: /^עַבְדְּךָ$/, translation: "teu-servo" },
  // Ao redor (סָבִיב)
  { pattern: /^סָבִיב[ ׀]?$/, translation: "ao-redor" },
  // Seus arredores (מִגְרָשֶׁהָ)
  { pattern: /^מִגְרָשֶׁהָ$/, translation: "seus-arredores" },
  // Lugar (מְקוֹם)
  { pattern: /^מְקוֹם$/, translation: "lugar" },
  // Muito (מְאֹד)
  { pattern: /^מְאֹד$/, translation: "muito" },
  // Meu coração (לִבִּי)
  { pattern: /^לִבִּי$/, translation: "meu-coração" },
  // Para os filhos de (לִבְנֵי)
  { pattern: /^לִבְנֵי$/, translation: "para-os-filhos-de" },
  // Diante dele (לְפָנָיו)
  { pattern: /^לְפָנָיו$/, translation: "diante-dele" },
  // Como rei (לְמֶלֶךְ)
  { pattern: /^לְמֶלֶךְ$/, translation: "como-rei" },
  // Para o dia (לְיוֹם)
  { pattern: /^לְיוֹם$/, translation: "para-o-dia" },
  // Vinho (יָיִן)
  { pattern: /^יָיִן$/, translation: "vinho" },
  // Serão (יִהְיוּ)
  { pattern: /^יִהְיוּ$/, translation: "serão" },
  // E no dia (וּבַיּוֹם)
  { pattern: /^וּבַיּוֹם$/, translation: "e-no-dia" },
  // E levantou (וַיִּשָּׂא)
  { pattern: /^וַיִּשָּׂא$/, translation: "e-levantou" },
  // E púrpura (וְאַרְגָּמָן)
  { pattern: /^וְאַרְגָּמָן$/, translation: "e-púrpura" },
  // E quatro (וְאַרְבָּעָה)
  { pattern: /^וְאַרְבָּעָה$/, translation: "e-quatro" },
  // E a (וְאֵת)
  { pattern: /^וְאֵת[ ׀]?$/, translation: "e-a" },
  // Ele- (הוּא[־]?)
  { pattern: /^הוּא[־]?$/, translation: "ele" },
  // Andando (הוֹלֵךְ)
  { pattern: /^הוֹלֵךְ$/, translation: "andando" },
  // O segundo (הַשֵּׁנִי)
  { pattern: /^הַשֵּׁנִי$/, translation: "o-segundo" },
  // O terceiro (הַשְּׁלִישִׁי)
  { pattern: /^הַשְּׁלִישִׁי$/, translation: "o-terceiro" },
  // O profeta (הַנָּבִיא)
  { pattern: /^הַנָּבִיא$/, translation: "o-profeta" },
  // O reto (הַיָּשָׁר)
  { pattern: /^הַיָּשָׁר$/, translation: "o-reto" },
  // Aquela (הַהִיא)
  { pattern: /^הַהִיא$/, translation: "aquela" },
  // As palavras (הַדְּבָרִים)
  { pattern: /^הַדְּבָרִים$/, translation: "as-palavras" },
  // Porventura não (הֲלֹא)
  { pattern: /^הֲלֹא$/, translation: "porventura-não" },
  // Orgulho (גְּאוֹן)
  { pattern: /^גְּאוֹן$/, translation: "orgulho" },
  // Entre as nações (בַּגּוֹיִם)
  { pattern: /^בַּגּוֹיִם$/, translation: "entre-as-nações" },
  // Na sua mão (בְּיָדוֹ)
  { pattern: /^בְּיָדוֹ$/, translation: "na-sua-mão" },
  // Na casa de (בְּבֵית[־]?)
  { pattern: /^בְּבֵית[־]?$/, translation: "na-casa-de" },
  // A eles (אֹתָם)
  { pattern: /^אֹתָם$/, translation: "a-eles" },
  // Eu (אָנִי)
  { pattern: /^אָנִי$/, translation: "eu" },
  // Assíria (אַשּׁוּר)
  { pattern: /^אַשּׁוּר$/, translation: "Assíria" },
  // Carneiros (אֵילִם)
  { pattern: /^אֵילִם$/, translation: "carneiros" },
  // Arca (אֲרוֹן)
  { pattern: /^אֲרוֹן$/, translation: "arca" },
  // Vosso Deus (אֱלֹהֵיכֶם)
  { pattern: /^אֱלֹהֵיכֶם$/, translation: "vosso-Deus" },

  // Grego
  // Medo (φόβον)
  { pattern: /^φόβον$/, translation: "medo" },
  // Com voz (φωνῇ)
  { pattern: /^φωνῇ$/, translation: "com-voz" },
  // No lugar (τόπῳ)
  { pattern: /^τόπῳ$/, translation: "no-lugar" },
  // Nas sinagogas (συναγωγαῖς)
  { pattern: /^συναγωγαῖς$/, translation: "nas-sinagogas" },
  // A ti (σοί)
  { pattern: /^σοί$/, translation: "a-ti" },
  // Ovelhas (πρόβατα)
  { pattern: /^πρόβατα$/, translation: "ovelhas" },
  // Profetas (προφήτας)
  { pattern: /^προφήτας$/, translation: "profetas" },
  // Aproximaram-se (προσῆλθον)
  { pattern: /^προσῆλθον$/, translation: "aproximaram-se" },
  // Mais (πλεῖον)
  { pattern: /^πλεῖον$/, translation: "mais" },
  // Da circuncisão (περιτομῆς)
  { pattern: /^περιτομῆς$/, translation: "da-circuncisão" },
  // Tendo enviado (πέμψας)
  { pattern: /^πέμψας$/, translation: "tendo-enviado" },
  // Juízo (κρίσιν)
  { pattern: /^κρίσιν$/, translation: "juízo" },
  // Do mar (θαλάσσης)
  { pattern: /^θαλάσσης$/, translation: "do-mar" },
  // Quereis (θέλετε)
  { pattern: /^θέλετε$/, translation: "quereis" },
  // Queres (θέλεις)
  { pattern: /^θέλεις$/, translation: "queres" },
  // Escritura (γραφὴ)
  { pattern: /^γραφὴ$/, translation: "escritura" },
  // Em línguas (γλώσσαις)
  { pattern: /^γλώσσαις$/, translation: "em-línguas" },
  // Pois (γε)
  { pattern: /^γε$/, translation: "pois" },
  // A Pedro (Πέτρῳ)
  { pattern: /^Πέτρῳ$/, translation: "a-Pedro" },
  // Rei (Βασιλεὺς)
  { pattern: /^Βασιλεὺς$/, translation: "Rei" },
  // Vai (ὕπαγε)
  { pattern: /^ὕπαγε$/, translation: "vai" },
  // Toda (ὅλῃ)
  { pattern: /^ὅλῃ$/, translation: "toda" },
  // Em Jerusalém (Ἱεροσολύμοις)
  { pattern: /^Ἱεροσολύμοις$/, translation: "em-Jerusalém" },
  // José (Ἰωσὴφ)
  { pattern: /^Ἰωσὴφ$/, translation: "José" },
  // Tocou (ἥψατο)
  { pattern: /^ἥψατο$/, translation: "tocou" },
  // Queria (ἤθελεν)
  { pattern: /^ἤθελεν$/, translation: "queria" },
  // Dos dias (ἡμερῶν)
  { pattern: /^ἡμερῶν$/, translation: "dos-dias" },
  // Anos (ἔτη)
  { pattern: /^ἔτη$/, translation: "anos" },
  // Depois (ἔπειτα)
  { pattern: /^ἔπειτα$/, translation: "depois" },
  // Nação (ἔθνος)
  { pattern: /^ἔθνος$/, translation: "nação" },
  // Temeram (ἐφοβήθησαν)
  { pattern: /^ἐφοβήθησαν$/, translation: "temeram" },
  // Saíram (ἐξῆλθον)
  { pattern: /^ἐξῆλθον$/, translation: "saíram" },
  // De mim mesmo (ἐμαυτοῦ)
  { pattern: /^ἐμαυτοῦ$/, translation: "de-mim-mesmo" },
  // Na igreja (ἐκκλησίᾳ)
  { pattern: /^ἐκκλησίᾳ$/, translation: "na-igreja" },
  // Ordenou (ἐκέλευσεν)
  { pattern: /^ἐκέλευσεν$/, translation: "ordenou" },
  // Uma vez (ἅπαξ)
  { pattern: /^ἅπαξ$/, translation: "uma-vez" },
  // Levantou-se (ἀνέστη)
  { pattern: /^ἀνέστη$/, translation: "levantou-se" },
  // Ao irmão (ἀδελφῷ)
  { pattern: /^ἀδελφῷ$/, translation: "ao-irmão" },
  // Região (χώραν)
  { pattern: /^χώραν$/, translation: "região" },
  // Alegria (χαρὰ)
  { pattern: /^χαρὰ$/, translation: "alegria" },
  // Voz (φωνὴν)
  { pattern: /^φωνὴν$/, translation: "voz" },
  // Alguns (τινας)
  { pattern: /^τινας$/, translation: "alguns" },
  // Corpo (σῶμά)
  { pattern: /^σῶμά$/, translation: "corpo" },
  // Boca (στόμα)
  { pattern: /^στόμα$/, translation: "boca" },
  // Trevas (σκότος)
  { pattern: /^σκότος$/, translation: "trevas" },
  // Anciãos (πρεσβύτεροι)
  { pattern: /^πρεσβύτεροι$/, translation: "anciãos" },
  // Dos anciãos (πρεσβυτέρων)
  { pattern: /^πρεσβυτέρων$/, translation: "dos-anciãos" },
  // Muito (πολὺς)
  { pattern: /^πολὺς$/, translation: "muito" },
  // No barco (πλοίῳ)
  { pattern: /^πλοίῳ$/, translation: "no-barco" },
  // Creem (πιστεύουσιν)
  { pattern: /^πιστεύουσιν$/, translation: "creem" },
  // Dos pais (πατέρων)
  { pattern: /^πατέρων$/, translation: "dos-pais" },
  // Com ousadia (παρρησίᾳ)
  { pattern: /^παρρησίᾳ$/, translation: "com-ousadia" },
  // Ai (οὐαὶ)
  { pattern: /^οὐαὶ$/, translation: "ai" },
  // Tendo tomado (λαβόντες)
  { pattern: /^λαβόντες$/, translation: "tendo-tomado" },
  // Da vontade (θελήματος)
  { pattern: /^θελήματος$/, translation: "da-vontade" },
  // Morte (θάνατον)
  { pattern: /^θάνατον$/, translation: "morte" },
  // São (εἰσίν)
  { pattern: /^εἰσίν$/, translation: "são" },
  // Dará (δώσει)
  { pattern: /^δώσει$/, translation: "dará" },
  // Pais (γονεῖς)
  { pattern: /^γονεῖς$/, translation: "pais" },
  // Conhecer (γνῶναι)
  { pattern: /^γνῶναι$/, translation: "conhecer" },
  // Filipe (Φίλιππος)
  { pattern: /^Φίλιππος$/, translation: "Filipe" },
  // Do Salvador (Σωτῆρος)
  { pattern: /^Σωτῆρος$/, translation: "do-Salvador" },
  // Simão (Σίμωνα)
  { pattern: /^Σίμωνα$/, translation: "Simão" },
  // De Moisés (Μωϋσέως)
  { pattern: /^Μωϋσέως$/, translation: "de-Moisés" },
  // Apareceu (ὤφθη)
  { pattern: /^ὤφθη$/, translation: "apareceu" },
  // De Tiago (Ἰακώβου)
  { pattern: /^Ἰακώβου$/, translation: "de-Tiago" },
  // De Herodes (Ἡρῴδου)
  { pattern: /^Ἡρῴδου$/, translation: "de-Herodes" },
  // Levaram (ἤγαγον)
  { pattern: /^ἤγαγον$/, translation: "levaram" },

  // === BATCH 16: Mais palavras frequentes ===

  // Grego
  // Cada um (ἕκαστον)
  { pattern: /^ἕκαστον$/, translation: "cada-um" },
  // Comeram (ἔφαγον)
  { pattern: /^ἔφαγον$/, translation: "comeram" },
  // Sois (ἐστὲ)
  { pattern: /^ἐστὲ$/, translation: "sois" },
  // Somos (ἐσμὲν)
  { pattern: /^ἐσμὲν$/, translation: "somos" },
  // Em cima (ἐπάνω)
  { pattern: /^ἐπάνω$/, translation: "em-cima" },
  // Da esperança (ἐλπίδος)
  { pattern: /^ἐλπίδος$/, translation: "da-esperança" },
  // Falava (ἐλάλει)
  { pattern: /^ἐλάλει$/, translation: "falava" },
  // Curou (ἐθεράπευσεν)
  { pattern: /^ἐθεράπευσεν$/, translation: "curou" },
  // Dos pecadores (ἁμαρτωλῶν)
  { pattern: /^ἁμαρτωλῶν$/, translation: "dos-pecadores" },
  // Apóstolos (ἀπόστολοι)
  { pattern: /^ἀπόστολοι$/, translation: "apóstolos" },
  // Morra (ἀποθάνῃ)
  { pattern: /^ἀποθάνῃ$/, translation: "morra" },
  // Enviaram (ἀπέστειλαν)
  { pattern: /^ἀπέστειλαν$/, translation: "enviaram" },
  // Homens (ἀνθρώπους)
  { pattern: /^ἀνθρώπους$/, translation: "homens" },
  // Uns aos outros (ἀλλήλοις)
  { pattern: /^ἀλλήλοις$/, translation: "uns-aos-outros" },
  // Verdadeiro (ἀληθής)
  { pattern: /^ἀληθής$/, translation: "verdadeiro" },
  // Ouvindo (ἀκούων)
  { pattern: /^ἀκούων$/, translation: "ouvindo" },
  // Da injustiça (ἀδικίας)
  { pattern: /^ἀδικίας$/, translation: "da-injustiça" },
  // Irmão (ἀδελφός)
  { pattern: /^ἀδελφός$/, translation: "irmão" },
  // Amando (ἀγαπῶν)
  { pattern: /^ἀγαπῶν$/, translation: "amando" },
  // Amai (ἀγαπᾶτε)
  { pattern: /^ἀγαπᾶτε$/, translation: "amai" },

  // Hebraico
  // Lei de (תּוֹרַת)
  { pattern: /^תּוֹרַת$/, translation: "lei-de" },
  // Abominação de (תּוֹעֲבַת)
  { pattern: /^תּוֹעֲבַת$/, translation: "abominação-de" },
  // Mentira (שֶׁקֶר)
  { pattern: /^שֶׁקֶר$/, translation: "mentira" },
  // Seu nome (שְׁמוֹ)
  { pattern: /^שְׁמוֹ$/, translation: "seu-nome" },
  // Teu povo (עַמְּךָ)
  { pattern: /^עַמְּךָ$/, translation: "teu-povo" },
  // Dez (עֶשְׂרֵה)
  { pattern: /^עֶשְׂרֵה$/, translation: "dez" },
  // Ainda (עוֹד)
  { pattern: /^עוֹד$/, translation: "ainda" },
  // Deram (נָתְנוּ)
  { pattern: /^נָתְנוּ$/, translation: "deram" },
  // Carga/profecia (מַשָּׂא)
  { pattern: /^מַשָּׂא$/, translation: "profecia" },
  // Deles (מֵהֶם)
  { pattern: /^מֵהֶם$/, translation: "deles" },
  // Da terra de (מֵאֶרֶץ)
  { pattern: /^מֵאֶרֶץ$/, translation: "da-terra-de" },
  // De fora (מִחוּץ)
  { pattern: /^מִחוּץ$/, translation: "de-fora" },
  // De filho de (מִבֶּן)
  { pattern: /^מִבֶּן$/, translation: "de-filho-de" },
  // No dia seguinte (מִמָּחֳרָת)
  { pattern: /^מִמָּחֳרָת$/, translation: "no-dia-seguinte" },
  // Cheia (מְלֵאָה)
  { pattern: /^מְלֵאָה$/, translation: "cheia" },
  // Para nós (לָנוּ)
  { pattern: /^לָנוּ$/, translation: "para-nós" },
  // Língua de (לְשׁוֹן)
  { pattern: /^לְשׁוֹן$/, translation: "língua-de" },
  // Para a tribo de (לְמַטֵּה)
  { pattern: /^לְמַטֵּה$/, translation: "para-a-tribo-de" },
  // A ele (לוֹ)
  { pattern: /^לוֹ$/, translation: "a-ele" },
  // Utensílios de (כְּלֵי)
  { pattern: /^כְּלֵי$/, translation: "utensílios-de" },
  // Dirão (יֹאמְרוּ)
  { pattern: /^יֹאמְרוּ$/, translation: "dirão" },
  // Jeroboão (יָרָבְעָם)
  { pattern: /^יָרָבְעָם$/, translation: "Jeroboão" },
  // Eu sei (יָדַעְתִּי)
  { pattern: /^יָדַעְתִּי$/, translation: "eu-sei" },
  // Será- (יִהְיֶה[־]?)
  { pattern: /^יִהְיֶה[־]?$/, translation: "será" },
  // Puro (טָהוֹר)
  { pattern: /^טָהוֹר$/, translation: "puro" },
  // E filho de (וּבֶן[־]?)
  { pattern: /^וּבֶן[־]?$/, translation: "e-filho-de" },
  // E habitou (וַיֵּשֶׁב)
  { pattern: /^וַיֵּשֶׁב$/, translation: "e-habitou" },
  // E eu (וַאֲנִי)
  { pattern: /^וַאֲנִי$/, translation: "e-eu" },
  // E carmesim (וְתוֹלַעַת)
  { pattern: /^וְתוֹלַעַת$/, translation: "e-carmesim" },
  // E sobre (וְעַל)
  { pattern: /^וְעַל[ ׀]?$/, translation: "e-sobre" },
  // E vós (וְאַתֶּם)
  { pattern: /^וְאַתֶּם$/, translation: "e-vós" },
  // A cidade (הָעִיר)
  { pattern: /^הָעִיר$/, translation: "a-cidade" },
  // Foram/eram (הָיוּ)
  { pattern: /^הָיוּ$/, translation: "eram" },
  // O Deus (הָאֱלֹהִים)
  { pattern: /^הָאֱלֹהִים$/, translation: "o-Deus" },
  // O sol (הַשֶּׁמֶשׁ)
  { pattern: /^הַשֶּׁמֶשׁ$/, translation: "o-sol" },
  // O sétimo (הַשְּׁבִיעִי)
  { pattern: /^הַשְּׁבִיעִי$/, translation: "o-sétimo" },
  // O lugar (הַמָּקוֹם)
  { pattern: /^הַמָּקוֹם$/, translation: "o-lugar" },
  // Os levitas (הַלְוִיִּם)
  { pattern: /^הַלְוִיִּם$/, translation: "os-levitas" },
  // A palavra (הַדָּבָר)
  { pattern: /^הַדָּבָר$/, translation: "a-palavra" },
  // Caminho de (דֶּרֶךְ[־]?)
  { pattern: /^דֶּרֶךְ[־]?$/, translation: "caminho-de" },
  // Fronteira (גְּבוּל)
  { pattern: /^גְּבוּל$/, translation: "fronteira" },
  // Filhos (בָּנִים)
  { pattern: /^בָּנִים$/, translation: "filhos" },
  // Em multidão (בְּרֹב)
  { pattern: /^בְּרֹב$/, translation: "em-multidão" },
  // A eles (אוֹתָם)
  { pattern: /^אוֹתָם$/, translation: "a-eles" },
  // Ou (אוֹ[־]?)
  { pattern: /^אוֹ[־]?$/, translation: "ou" },
  // Tu (אָתָּה)
  { pattern: /^אָתָּה$/, translation: "tu" },
  // Uma (אַחַת)
  { pattern: /^אַחַת$/, translation: "uma" },
  // Acabe (אַחְאָב)
  { pattern: /^אַחְאָב$/, translation: "Acabe" },
  // Absalão (אַבְשָׁלוֹם)
  { pattern: /^אַבְשָׁלוֹם$/, translation: "Absalão" },

  // Mais grego
  // Alegria (χαρὰν)
  { pattern: /^χαρὰν$/, translation: "alegria" },
  // Diz (φησίν)
  { pattern: /^φησίν$/, translation: "diz" },
  // Dos filhos (υἱῶν)
  { pattern: /^υἱῶν$/, translation: "dos-filhos" },
  // No terceiro (τρίτῃ)
  { pattern: /^τρίτῃ$/, translation: "no-terceiro" },
  // A quem (τίνι)
  { pattern: /^τίνι$/, translation: "a-quem" },
  // Salvar (σῶσαι)
  { pattern: /^σῶσαι$/, translation: "salvar" },
  // Será salvo (σωθήσεται)
  { pattern: /^σωθήσεται$/, translation: "será-salvo" },
  // Com sabedoria (σοφίᾳ)
  { pattern: /^σοφίᾳ$/, translation: "com-sabedoria" },
  // Do sábado (σαββάτου)
  { pattern: /^σαββάτου$/, translation: "do-sábado" },
  // Sábado (σάββατον)
  { pattern: /^σάββατον$/, translation: "sábado" },
  // Nos sábados (σάββασιν)
  { pattern: /^σάββασιν$/, translation: "nos-sábados" },
  // Orai (προσεύχεσθε)
  { pattern: /^προσεύχεσθε$/, translation: "orai" },
  // Fazes (ποιεῖς)
  { pattern: /^ποιεῖς$/, translation: "fazes" },
  // Tendo feito (ποιήσας)
  { pattern: /^ποιήσας$/, translation: "tendo-feito" },

  // === BATCH 17: Mais palavras frequentes ===

  // Grego
  // Caindo (πεσὼν)
  { pattern: /^πεσὼν$/, translation: "caindo" },
  // Discípulo (μαθητὴς)
  { pattern: /^μαθητὴς$/, translation: "discípulo" },
  // Parte (μέρος)
  { pattern: /^μέρος$/, translation: "parte" },
  // Dizendo (λέγουσα)
  { pattern: /^λέγουσα$/, translation: "dizendo" },
  // E se (κἂν)
  { pattern: /^κἂν$/, translation: "e-se" },
  // Aldeia (κώμην)
  { pattern: /^κώμην$/, translation: "aldeia" },
  // Pregando (κηρύσσων)
  { pattern: /^κηρύσσων$/, translation: "pregando" },
  // Desceu (κατέβη)
  { pattern: /^κατέβη$/, translation: "desceu" },
  // Bom (καλόν)
  { pattern: /^καλόν$/, translation: "bom" },
  // Querendo (θέλων)
  { pattern: /^θέλων$/, translation: "querendo" },
  // Então (εἶτα)
  { pattern: /^εἶτα$/, translation: "então" },
  // Será dado (δοθήσεται)
  { pattern: /^δοθήσεται$/, translation: "será-dado" },
  // Em ensino (διδαχῇ)
  { pattern: /^διδαχῇ$/, translation: "em-ensino" },
  // Ensinar (διδάσκειν)
  { pattern: /^διδάσκειν$/, translation: "ensinar" },
  // Servo/ministro (διάκονος)
  { pattern: /^διάκονος$/, translation: "servo" },
  // Terra (γῇ)
  { pattern: /^γῇ$/, translation: "terra" },
  // Amanhã (αὔριον)
  { pattern: /^αὔριον$/, translation: "amanhã" },
  // O dito (ῥηθὲν)
  { pattern: /^ῥηθὲν$/, translation: "o-dito" },
  // Vou (ὑπάγω)
  { pattern: /^ὑπάγω$/, translation: "vou" },
  // De onde (ὅθεν)
  { pattern: /^ὅθεν$/, translation: "de-onde" },
  // À multidão (ὄχλῳ)
  { pattern: /^ὄχλῳ$/, translation: "à-multidão" },
  // Do monte (ὄρους)
  { pattern: /^ὄρους$/, translation: "do-monte" },
  // Judeus (Ἰουδαίους)
  { pattern: /^Ἰουδαίους$/, translation: "judeus" },
  // Jacó (Ἰακώβ)
  { pattern: /^Ἰακώβ$/, translation: "Jacó" },
  // Em particular (ἰδίᾳ)
  { pattern: /^ἰδίᾳ$/, translation: "em-particular" },
  // Aproximou-se (ἤγγικεν)
  { pattern: /^ἤγγικεν$/, translation: "aproximou-se" },
  // Outro (ἕτερος)
  { pattern: /^ἕτερος$/, translation: "outro" },
  // Um (ἕν)
  { pattern: /^ἕν$/, translation: "um" },
  // Lançou (ἔβαλεν)
  { pattern: /^ἔβαλεν$/, translation: "lançou" },
  // De um (ἑνὸς)
  { pattern: /^ἑνὸς$/, translation: "de-um" },
  // Sois (ἐστέ)
  { pattern: /^ἐστέ$/, translation: "sois" },
  // O que vem (ἐρχόμενος)
  { pattern: /^ἐρχόμενος$/, translation: "o-que-vem" },
  // O que vem (ἐρχόμενον)
  { pattern: /^ἐρχόμενον$/, translation: "o-que-vem" },
  // Foi (ἐπορεύθη)
  { pattern: /^ἐπορεύθη$/, translation: "foi" },
  // Fazia (ἐποίει)
  { pattern: /^ἐποίει$/, translation: "fazia" },
  // Foram cheios (ἐπλήσθησαν)
  { pattern: /^ἐπλήσθησαν$/, translation: "foram-cheios" },
  // Da autoridade (ἐξουσίας)
  { pattern: /^ἐξουσίας$/, translation: "da-autoridade" },
  // Minha (ἐμὴν)
  { pattern: /^ἐμὴν$/, translation: "minha" },
  // A mim mesmo (ἐμαυτὸν)
  { pattern: /^ἐμαυτὸν$/, translation: "a-mim-mesmo" },
  // Recebestes (ἐλάβετε)
  { pattern: /^ἐλάβετε$/, translation: "recebestes" },
  // Aconteceu (ἐγενήθη)
  { pattern: /^ἐγενήθη$/, translation: "aconteceu" },
  // Perdão (ἄφεσιν)
  { pattern: /^ἄφεσιν$/, translation: "perdão" },
  // De cima (ἄνωθεν)
  { pattern: /^ἄνωθεν$/, translation: "de-cima" },
  // Homens (ἄνθρωποι)
  { pattern: /^ἄνθρωποι$/, translation: "homens" },
  // Se (ἄν)
  { pattern: /^ἄν$/, translation: "se" },
  // Outra (ἄλλη)
  { pattern: /^ἄλλη$/, translation: "outra" },
  // Pecados (ἁμαρτίαι)
  { pattern: /^ἁμαρτίαι$/, translation: "pecados" },
  // Morrer (ἀποθανεῖν)
  { pattern: /^ἀποθανεῖν$/, translation: "morrer" },
  // Ressurreição (ἀνάστασιν)
  { pattern: /^ἀνάστασιν$/, translation: "ressurreição" },
  // Verdadeiramente (ἀληθῶς)
  { pattern: /^ἀληθῶς$/, translation: "verdadeiramente" },

  // Hebraico
  // Oferta de (תְּרוּמַת)
  { pattern: /^תְּרוּמַת$/, translation: "oferta-de" },
  // Falsidade (שָׁקֶר)
  { pattern: /^שָׁקֶר$/, translation: "falsidade" },
  // Óleo (שֶׁמֶן)
  { pattern: /^שֶׁמֶן$/, translation: "óleo" },
  // Tribos de (שִׁבְטֵי)
  { pattern: /^שִׁבְטֵי$/, translation: "tribos-de" },
  // Cântico (שִׁיר)
  { pattern: /^שִׁיר$/, translation: "cântico" },
  // Ambos (שְׁנֵיהֶם)
  { pattern: /^שְׁנֵיהֶם[ ׀]?$/, translation: "ambos" },
  // Sua cabeça (רֹאשׁוֹ)
  { pattern: /^רֹאשׁוֹ$/, translation: "sua-cabeça" },
  // Muitos (רַבִּים)
  { pattern: /^רַבִּים$/, translation: "muitos" },
  // Somente (רַק)
  { pattern: /^רַק$/, translation: "somente" },
  // Toma (קַח)
  { pattern: /^קַח$/, translation: "toma" },
  // Justos (צַדִּיקִים)
  { pattern: /^צַדִּיקִים$/, translation: "justos" },

  // === BATCH 18: Mais palavras frequentes ===

  // Hebraico
  // Fiz (עָשִׂיתִי)
  { pattern: /^עָשִׂיתִי$/, translation: "fiz" },
  // Pobre/afligido (עָנִי)
  { pattern: /^עָנִי$/, translation: "afligido" },
  // Agora (עַתָּה)
  { pattern: /^עַתָּה$/, translation: "agora" },
  // Nudez de (עֶרְוַת)
  { pattern: /^עֶרְוַת$/, translation: "nudez-de" },
  // Dez (עֲשֶׂרֶת)
  { pattern: /^עֲשֶׂרֶת$/, translation: "dez" },
  // Sobre vós (עֲלֵיכֶם)
  { pattern: /^עֲלֵיכֶם$/, translation: "sobre-vós" },
  // Minha alma (נַפְשִׁי)
  { pattern: /^נַפְשִׁי׃?$/, translation: "minha-alma" },
  // Nada/não há (מֵאֵין)
  { pattern: /^מֵאֵין$/, translation: "sem" },
  // Famílias de (מִשְׁפְּחֹת)
  { pattern: /^מִשְׁפְּחֹת$/, translation: "famílias-de" },
  // Do canto/lado (מִפְּאַת)
  { pattern: /^מִפְּאַת$/, translation: "do-canto" },
  // Cheios (מְלֵאִים)
  { pattern: /^מְלֵאִים$/, translation: "cheios" },
  // Para mim (לִּי, לִי)
  { pattern: /^לִּי$/, translation: "para-mim" },
  // Por que (לָמָּה)
  { pattern: /^לָמָּה$/, translation: "por-que" },
  // Para ti (לָךְ)
  { pattern: /^לָךְ$/, translation: "para-ti" },
  // A eles (לָמוֹ)
  { pattern: /^לָמוֹ$/, translation: "a-eles" },
  // No mês (לַחֹדֶשׁ)
  { pattern: /^לַחֹדֶשׁ$/, translation: "no-mês" },
  // Pão (לֶחֶם)
  { pattern: /^לֶחֶם$/, translation: "pão" },
  // Vai (לֵךְ)
  { pattern: /^לֵךְ$/, translation: "vai" },
  // Teu coração (לִבֶּךָ)
  { pattern: /^לִבֶּךָ$/, translation: "teu-coração" },
  // Cordeiro (כֶּבֶשׂ[־]?)
  { pattern: /^כֶּבֶשׂ[־]?$/, translation: "cordeiro" },
  // Conforme a palavra de (כִּדְבַר)
  { pattern: /^כִּדְבַר$/, translation: "conforme-a-palavra-de" },
  // Dias (יָמִים)
  { pattern: /^יָמִים$/, translation: "dias" },
  // Virá (יָבֹא)
  { pattern: /^יָבֹא$/, translation: "virá" },
  // Juntos (יַחְדָּו)
  { pattern: /^יַחְדָּו$/, translation: "juntos" },
  // Graça (חֵן)
  { pattern: /^חֵן$/, translation: "graça" },
  // Força/exército (חֵיל)
  { pattern: /^חֵיל$/, translation: "força" },
  // Anciãos de (זִקְנֵי)
  { pattern: /^זִקְנֵי$/, translation: "anciãos-de" },
  // E cem (וּמֵאָה)
  { pattern: /^וּמֵאָה$/, translation: "e-cem" },
  // E para sacrifício (וּלְזֶבַח)
  { pattern: /^וּלְזֶבַח$/, translation: "e-para-sacrifício" },
  // E ele (וְהוּא[־]?)
  { pattern: /^וְהוּא[־]?$/, translation: "e-ele" },
  // E eis (וְהִנֵּה[־]?)
  { pattern: /^וְהִנֵּה[־]?$/, translation: "e-eis" },
  // E eu (וְאָנֹכִי)
  { pattern: /^וְאָנֹכִי$/, translation: "e-eu" },
  // E disse (וְאָמַר)
  { pattern: /^וְאָמַר$/, translation: "e-disse" },
  // O monte (הָהָר)
  { pattern: /^הָהָר$/, translation: "o-monte" },
  // O homem (הָאִישׁ)
  { pattern: /^הָאִישׁ$/, translation: "o-homem" },
  // O contínuo (הַתָּמִיד)
  { pattern: /^הַתָּמִיד$/, translation: "o-contínuo" },
  // O tabernáculo (הַמִּשְׁכָּן)
  { pattern: /^הַמִּשְׁכָּן$/, translation: "o-tabernáculo" },
  // Este (הַזֶּה)
  { pattern: /^הַזֶּה׃?$/, translation: "este" },
  // Louvai (הַלְלוּ[־]?)
  { pattern: /^הַלְלוּ[־]?$/, translation: "louvai" },
  // Eis (הֵן[־]?)
  { pattern: /^הֵן[־]?$/, translation: "eis" },
  // Neles (בָּהֶם)
  { pattern: /^בָּהֶם$/, translation: "neles" },
  // No ano de (בִּשְׁנַת)
  { pattern: /^בִּשְׁנַת$/, translation: "no-ano-de" },
  // Filhas de (בְּנוֹת)
  { pattern: /^בְּנוֹת$/, translation: "filhas-de" },
  // Em Israel (בְּיִשְׂרָאֵל)
  { pattern: /^בְּיִשְׂרָאֵל$/, translation: "em-Israel" },
  // Poço (בְּאֵר)
  { pattern: /^בְּאֵר$/, translation: "poço" },
  // Em seu reinado (בְמָלְכוֹ)
  { pattern: /^בְמָלְכוֹ$/, translation: "em-seu-reinado" },
  // Eu disse (אָמַרְתִּי)
  { pattern: /^אָמַרְתִּי$/, translation: "eu-disse" },
  // Teu pai (אָבִיךָ)
  { pattern: /^אָבִיךָ$/, translation: "teu-pai" },
  // Depois de (אַחֲרֵי[־]?)
  { pattern: /^אַחֲרֵי[־]?$/, translation: "depois-de" },
  // Eleazar (אֶלְעָזָר)
  { pattern: /^אֶלְעָזָר$/, translation: "Eleazar" },
  // Seus irmãos (אֶחָיו)
  { pattern: /^אֶחָיו$/, translation: "seus-irmãos" },
  // A/para (אֵת)
  { pattern: /^אֵת$/, translation: "a" },
  // Sua mãe (אִמּוֹ)
  { pattern: /^אִמּוֹ$/, translation: "sua-mãe" },
  // Jó (אִיּוֹב)
  { pattern: /^אִיּוֹב$/, translation: "Jó" },
  // Eu (אֲנִי)
  { pattern: /^אֲנִי$/, translation: "eu" },

  // === BATCH 19: Mais palavras frequentes ===

  // Grego
  // Medo (φόβος)
  { pattern: /^φόβος$/, translation: "medo" },
  // Filhos (υἱοὺς)
  { pattern: /^υἱοὺς$/, translation: "filhos" },
  // Algum (τινὰ)
  { pattern: /^τινὰ$/, translation: "algum" },
  // Na sinagoga (συναγωγῇ)
  { pattern: /^συναγωγῇ$/, translation: "na-sinagoga" },
  // Da boca (στόματος)
  { pattern: /^στόματος$/, translation: "da-boca" },
  // Da cruz (σταυροῦ)
  { pattern: /^σταυροῦ$/, translation: "da-cruz" },
  // A ti (σοὶ)
  { pattern: /^σοὶ$/, translation: "a-ti" },
  // Da sabedoria (σοφίας)
  { pattern: /^σοφίας$/, translation: "da-sabedoria" },
  // Das trevas (σκότους)
  { pattern: /^σκότους$/, translation: "das-trevas" },
  // A ti mesmo (σεαυτόν)
  { pattern: /^σεαυτόν$/, translation: "a-ti-mesmo" },
  // Te (σέ)
  { pattern: /^σέ$/, translation: "te" },
  // Jumentinho (πῶλον)
  { pattern: /^πῶλον$/, translation: "jumentinho" },
  // Todas (πᾶσαι)
  { pattern: /^πᾶσαι$/, translation: "todas" },
  // Vai (πορεύου)
  { pattern: /^πορεύου$/, translation: "vai" },
  // Do mal (πονηροῦ)
  { pattern: /^πονηροῦ$/, translation: "do-mal" },
  // Muitas coisas (πολλά)
  { pattern: /^πολλά$/, translation: "muitas-coisas" },
  // Fazem (ποιοῦσιν)
  { pattern: /^ποιοῦσιν$/, translation: "fazem" },
  // Qual (ποίᾳ)
  { pattern: /^ποίᾳ$/, translation: "qual" },
  // Do barco (πλοίου)
  { pattern: /^πλοίου$/, translation: "do-barco" },
  // Ainda mais (περισσοτέρως)
  { pattern: /^περισσοτέρως$/, translation: "ainda-mais" },
  // Pais (πατέρας)
  { pattern: /^πατέρας$/, translation: "pais" },
  // Da consolação (παρακλήσεως)
  { pattern: /^παρακλήσεως$/, translation: "da-consolação" },
  // Rogo (παρακαλῶ)
  { pattern: /^παρακαλῶ$/, translation: "rogo" },
  // Em parábolas (παραβολαῖς)
  { pattern: /^παραβολαῖς$/, translation: "em-parábolas" },
  // Sofrer (παθεῖν)
  { pattern: /^παθεῖν$/, translation: "sofrer" },
  // Casa (οἶκος)
  { pattern: /^οἶκος$/, translation: "casa" },
  // Da casa (οἴκου)
  { pattern: /^οἴκου$/, translation: "da-casa" },
  // À noite (νυκτὶ)
  { pattern: /^νυκτὶ$/, translation: "à-noite" },
  // Pouco (μικρὸν)
  { pattern: /^μικρὸν$/, translation: "pouco" },
  // Da parte (μέρους)
  { pattern: /^μέρους$/, translation: "da-parte" },
  // Principalmente (μάλιστα)
  { pattern: /^μάλιστα$/, translation: "principalmente" },
  // Chamado (λεγόμενος)
  { pattern: /^λεγόμενος$/, translation: "chamado" },
  // Muito (λίαν)
  { pattern: /^λίαν$/, translation: "muito" },
  // Viver (ζῆν)
  { pattern: /^ζῆν$/, translation: "viver" },
  // Encontra (εὑρίσκει)
  { pattern: /^εὑρίσκει$/, translation: "encontra" },
  // No evangelho (εὐαγγελίῳ)
  { pattern: /^εὐαγγελίῳ$/, translation: "no-evangelho" },
  // Servos (δοῦλοι)
  { pattern: /^δοῦλοι$/, translation: "servos" },
  // Servos (δούλους)
  { pattern: /^δούλους$/, translation: "servos" },
  // Do conhecimento (γνώσεως)
  { pattern: /^γνώσεως$/, translation: "do-conhecimento" },
  // Sabendo (γνοὺς)
  { pattern: /^γνοὺς$/, translation: "sabendo" },
  // Timóteo (Τιμόθεος)
  { pattern: /^Τιμόθεος$/, translation: "Timóteo" },
  // De Pedro (Πέτρου)
  { pattern: /^Πέτρου$/, translation: "de-Pedro" },
  // Sim (Ναί)
  { pattern: /^Ναί$/, translation: "Sim" },
  // De César (Καίσαρος)
  { pattern: /^Καίσαρος$/, translation: "de-César" },
  // Vede (Βλέπετε)
  { pattern: /^Βλέπετε$/, translation: "Vede" },
  // Egito (Αἴγυπτον)
  { pattern: /^Αἴγυπτον$/, translation: "Egito" },
  // Às multidões (ὄχλοις)
  { pattern: /^ὄχλοις$/, translation: "às-multidões" },
  // No monte (ὄρει)
  { pattern: /^ὄρει$/, translation: "no-monte" },
  // Sendo (ὄντας)
  { pattern: /^ὄντας$/, translation: "sendo" },
  // Unanimemente (ὁμοθυμαδὸν)
  { pattern: /^ὁμοθυμαδὸν$/, translation: "unanimemente" },
  // Olho (ὀφθαλμός)
  { pattern: /^ὀφθαλμός$/, translation: "olho" },
  // Deve (ὀφείλει)
  { pattern: /^ὀφείλει$/, translation: "deve" },

  // Hebraico - Deus com separador especial
  // Deus (אֱ‍ֽלֹהִים - com ZWJ)
  { pattern: /^אֱ‍?לֹהִים$/, translation: "Deus" },
];

function runD1Query(sql) {
  const escaped = sql.replace(/"/g, '\\"');
  const cmd = `npx wrangler d1 execute biblia-belem --remote --command "${escaped}" --json`;
  try {
    const result = execSync(cmd, {
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return JSON.parse(result);
  } catch (e) {
    return null;
  }
}

function runD1Update(sql) {
  const escaped = sql.replace(/"/g, '\\"');
  const cmd = `npx wrangler d1 execute biblia-belem --remote --command "${escaped}" --json`;
  try {
    execSync(cmd, {
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return true;
  } catch (e) {
    return false;
  }
}

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║      AUTO TRANSLATE - BÍBLIA BELÉM An.C 2025                     ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log();

// Buscar palavras frequentes com colchetes
console.log('📖 Buscando palavras frequentes não traduzidas...');
const result = runD1Query("SELECT DISTINCT text_utf8, COUNT(*) as freq FROM tokens WHERE pt_literal LIKE '[%]' GROUP BY text_utf8 ORDER BY freq DESC LIMIT 200");

if (!result || !result[0] || !result[0].results) {
  console.log('❌ Erro ao buscar palavras do banco');
  process.exit(1);
}

const words = result[0].results;
console.log(`📊 Encontradas ${words.length} palavras frequentes`);
console.log();

let updated = 0;
let errors = 0;
let matched = 0;

for (const { text_utf8: word, freq } of words) {
  // Normalizar palavra (remover cantilação)
  const normalized = normalizeHebrew(word);

  // Tentar encontrar tradução via padrão
  let translation = null;

  for (const { pattern, translation: trans } of patternTranslations) {
    if (pattern.test(normalized)) {
      translation = trans;
      break;
    }
  }

  if (translation) {
    matched++;
    const escapedWord = word.replace(/'/g, "''");
    const escapedTrans = translation.replace(/'/g, "''");
    const sql = `UPDATE tokens SET pt_literal = '${escapedTrans}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]'`;

    if (runD1Update(sql)) {
      updated++;
      process.stdout.write('.');
    } else {
      errors++;
      process.stdout.write('!');
    }
  }
}

console.log();
console.log();
console.log('═══════════════════════════════════════════════════════════════════');
console.log(`📊 Palavras encontradas: ${words.length}`);
console.log(`🎯 Padrões correspondentes: ${matched}`);
console.log(`✅ Atualizações bem-sucedidas: ${updated}`);
console.log(`❌ Erros: ${errors}`);
console.log('═══════════════════════════════════════════════════════════════════');
