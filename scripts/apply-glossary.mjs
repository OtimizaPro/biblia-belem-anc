/**
 * Aplicador de Glossário - Bíblia Belém An.C 2025
 * Traduz palavras gregas/hebraicas transliteradas que ficaram sem tradução
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Glossário Grego -> Português (transliteração -> tradução)
const GREEK_GLOSSARY = {
  // A
  'Apokalypsis': 'Revelação', 'apokalypsis': 'revelação',
  'Ἀpokάlypsis': 'Revelação', 'apokάlypsis': 'revelação',
  'agapē': 'amor', 'agapēn': 'amor', 'agapōnti': 'amando',
  'agapētos': 'amado', 'agapētoi': 'amados',
  'aggelos': 'anjo', 'aggeloi': 'anjos', 'aggelōn': 'anjos',
  'agioi': 'santos', 'agios': 'santo', 'agia': 'santa', 'agiōn': 'santos',
  'agathon': 'bom', 'agathos': 'bom', 'agathē': 'boa',
  'aiōn': 'era', 'aiōnos': 'era', 'aiōnas': 'eras', 'aiōnōn': 'eras',
  'aiōnios': 'eterno', 'aiōnion': 'eterna',
  'akouō': 'ouvir', 'akoysάtō': 'ouça', 'akoysate': 'ouvi', 'akoύontes': 'ouvindo',
  'alētheia': 'verdade', 'alētheias': 'verdade', 'alēthinon': 'verdadeiro',
  'alēthōs': 'verdadeiramente', 'alēthinόs': 'verdadeiro',
  'alla': 'mas', 'all': 'mas',
  'allēloys': 'uns-aos-outros',
  'Alpha': 'Alfa', 'Ἄlpha': 'Alfa',
  'amēn': 'amém', 'amήn': 'amém',
  'anabainō': 'subir', 'anabainōn': 'subindo',
  'adelphos': 'irmão', 'adelphoi': 'irmãos', 'adelphōn': 'irmãos',
  'anēr': 'homem', 'andros': 'homem', 'andres': 'homens',
  'anthrōpos': 'homem', 'anthrōpoy': 'homem', 'anthrōpōn': 'homens',
  'anaginōskōn': 'lendo', 'anaginώskōn': 'lendo',
  'apostolos': 'apóstolo', 'apostoloi': 'apóstolos', 'apostolōn': 'apóstolos',
  'apostoloys': 'apóstolos', 'apostόloys': 'apóstolos',
  'aposteilas': 'enviando', 'aposteίlas': 'enviando',
  'apekrίthē': 'respondeu', 'apekrithē': 'respondeu',
  'apestalmenos': 'enviado', 'apestalmέnos': 'enviado', 'apestalmέnoi': 'enviados',
  'apέsteilan': 'enviaram',
  'apektάnthē': 'foi-morto',
  'archē': 'princípio', 'archēn': 'princípio', 'archῆ': 'princípio',
  'archōn': 'governante', 'archontes': 'governantes',
  'arxōmai': 'começar',
  'arnion': 'cordeiro', 'arnioy': 'cordeiro',
  'Asia': 'Ásia', 'Ἀsίa': 'Ásia',
  'astēr': 'estrela', 'asteras': 'estrelas', 'astέras': 'estrelas',
  'asterōn': 'estrelas', 'astέrōn': 'estrelas',
  'axios': 'digno', 'axίōs': 'dignamente',
  'aytόn': 'ele', 'aytos': 'ele', 'aytoy': 'dele', 'aytoύs': 'eles',

  // B
  'bainō': 'ir',
  'ballō': 'lançar', 'bάllein': 'lançar',
  'baptizō': 'batizar', 'baptίzō': 'batizo', 'baptίzeis': 'batizas',
  'baptίzων': 'batizando', 'baptizōn': 'batizando',
  'basileia': 'reino', 'basileias': 'reino', 'basileίa': 'reino',
  'basileys': 'rei', 'basileōn': 'reis', 'basilέōn': 'reis',
  'bastάsai': 'suportar', 'ebάstasas': 'suportaste',
  'biblion': 'livro', 'biblίon': 'livro', 'biblioy': 'livro',
  'blepō': 'ver', 'blepeis': 'vês', 'blέpeis': 'vês', 'blέpein': 'ver',
  'boaō': 'clamar', 'boōntos': 'clamando',

  // C/Ch
  'chaίrō': 'alegrar', 'chara': 'alegria', 'charas': 'alegria',
  'charis': 'graça', 'charitōs': 'graça',
  'cheir': 'mão', 'cheiros': 'mão', 'cheiri': 'mão',
  'Christos': 'Cristo', 'Christoy': 'Cristo', 'Christόs': 'Cristo',
  'chrόnos': 'tempo', 'chronoy': 'tempo',
  'chōris': 'sem',
  'chalkolibάnō': 'bronze-polido',
  'chiōn': 'neve',

  // D
  'dei': 'é-necessário',
  'dexia': 'direita', 'dexias': 'direita', 'dexian': 'direita',
  'dέka': 'dez',
  'deytέroy': 'segunda',
  'dia': 'através-de', 'di': 'através-de',
  'diabolos': 'diabo', 'diάbolos': 'diabo',
  'didachē': 'ensino', 'didachēn': 'ensino',
  'didaskō': 'ensinar', 'edίdasken': 'ensinava',
  'didōmi': 'dar', 'dώsō': 'darei', 'dōmen': 'demos',
  'dikaios': 'justo', 'dikaioi': 'justos', 'dikaiosύnē': 'justiça',
  'dίstomos': 'de-dois-gumes', 'dίstomon': 'de-dois-gumes',
  'doxa': 'glória', 'doxan': 'glória', 'doxēs': 'glória',
  'doylos': 'servo', 'doyloi': 'servos', 'doyloys': 'servos',
  'doύlois': 'servos', 'doύlō': 'servo', 'doylōn': 'servos',
  'dynamis': 'poder', 'dynameōs': 'poder', 'dynάmei': 'poder',
  'dύnē': 'podes', 'dynamai': 'poder',

  // E
  'echō': 'ter', 'echei': 'tem', 'echeis': 'tens', 'echōn': 'tendo',
  'echomen': 'temos', 'echoytes': 'tendo', 'hexete': 'tereis',
  'edόthē': 'foi-dada',
  'egō': 'eu', 'egώ': 'eu', 'Ἐgώ': 'Eu', 'eme': 'mim', 'emoy': 'mim',
  'eidōlόthyta': 'sacrificado-a-ídolos',
  'eimi': 'sou', 'eίmi': 'sou', 'ei': 'és',
  'eidon': 'vi', 'eides': 'viste', 'eidete': 'vistes',
  'eipen': 'disse', 'eipon': 'disse', 'eipan': 'disseram',
  'eirēnē': 'paz', 'eirήnē': 'paz',
  'eis': 'para', 'eisin': 'são', 'eisίn': 'são',
  'ekklesίa': 'assembleia', 'ekklēsia': 'assembleia',
  'ekklēsίai': 'assembleias', 'ekklēsίais': 'assembleias',
  'ekporeyomέnē': 'saindo',
  'exekέntēsan': 'traspassaram',
  'elabomen': 'recebemos', 'elάbomen': 'recebemos',
  'elabon': 'receberam',
  'elάlei': 'falava',
  'elpis': 'esperança', 'elpίda': 'esperança',
  'emprosthέn': 'diante',
  'en': 'em',
  'endedymέnon': 'vestido',
  'enōpion': 'diante', 'enώpion': 'diante',
  'entolē': 'mandamento', 'entolas': 'mandamentos',
  'ep': 'sobre', 'epi': 'sobre',
  'epέstrepsa': 'voltei',
  'epeίrasas': 'provaste',
  'epistrέpsas': 'voltando',
  'ephathalmos': 'olho', 'ophthalmoi': 'olhos', 'ophthalmos': 'olho',
  'erēmō': 'deserto', 'erήmō': 'deserto',
  'erchomai': 'vir', 'erchomenos': 'vindo', 'erchόmenos': 'vindo',
  'erchomaί': 'venho',
  'ergon': 'obra', 'erga': 'obras',
  'erion': 'lã',
  'erōtaō': 'perguntar', 'erōtήsōsin': 'perguntassem', 'ērώtēsan': 'perguntaram',
  'esēmanen': 'significou', 'esήmanen': 'significou',
  'eskēnōsen': 'habitou', 'eskήnōsen': 'habitou',
  'etheasάmetha': 'contemplamos',
  'ethēken': 'colocou',
  'ethnē': 'nações', 'ethnōn': 'nações',
  'eyangelion': 'evangelho', 'eyangelioy': 'evangelho',
  'eythys': 'imediatamente', 'Eythύnate': 'Endireitai',
  'exēgēsato': 'revelou', 'exēgήsato': 'revelou',
  'exoysia': 'autoridade', 'exoysίan': 'autoridade',
  'ezēsen': 'viveu',
  'egenόmēn': 'tornei-me', 'egeneto': 'aconteceu',
  'eggύs': 'perto',
  'egennήthēsan': 'nasceram',

  // G
  'gē': 'terra', 'gēs': 'terra',
  'gegrammέna': 'escritas',
  'genea': 'geração',
  'ginomai': 'tornar-se', 'gίnoy': 'torna-te',
  'ginōskō': 'conhecer',
  'graphō': 'escrever', 'grapson': 'escreve', 'grάpson': 'escreve',
  'gέgonen': 'aconteceu', 'gegonen': 'aconteceu',

  // H
  'Hades': 'Hades', 'Ἅidoy': 'Hades',
  'hagiazō': 'santificar',
  'haima': 'sangue', 'haimatos': 'sangue',
  'hamartia': 'pecado', 'hamartias': 'pecado', 'hamartiōn': 'pecados',
  'heaytoύs': 'a-si-mesmos', 'heaytoys': 'a-si-mesmos',
  'Hēleίas': 'Elias', 'Ἡleίas': 'Elias',
  'hēmera': 'dia', 'hēmeras': 'dia', 'hēmerōn': 'dias', 'hēmέra': 'dia',
  'hēmέrais': 'dias',
  'hen': 'um', 'heis': 'um', 'mia': 'uma',
  'heōraken': 'viu', 'heώraken': 'viu',
  'hepta': 'sete',
  'hetoimazō': 'preparar',
  'hētis': 'a-qual',
  'hiereis': 'sacerdotes', 'hiereys': 'sacerdote',
  'himation': 'veste', 'himatia': 'vestes',
  'himάnta': 'correia',
  'hina': 'para-que',
  'hodos': 'caminho', 'hodoy': 'caminho',
  'homoion': 'semelhante', 'homoioi': 'semelhantes',
  'hōmolόgēsen': 'confessou',
  'horan': 'hora', 'hōras': 'hora',
  'hόs': 'o-qual', 'hoi': 'os', 'ho': 'o', 'hē': 'a',
  'hōs': 'como',
  'hote': 'quando',
  'hotan': 'quando',
  'hoti': 'que', 'porque',
  'hoytoi': 'estes', 'hoytos': 'este', 'hoytōs': 'assim',
  'ohitines': 'os-quais',
  'hypάgō': 'ir', 'hypage': 'vai',
  'hyper': 'por', 'em-favor-de',
  'hypodēma': 'sandália', 'hypodήmatos': 'sandália',
  'hypomonē': 'perseverança', 'hypomonήn': 'perseverança',

  // I
  'idoy': 'eis', 'idoύ': 'eis',
  'Iēsoys': 'Jesus',
  'Iōannēs': 'João', 'Iōannou': 'João', 'Ἰōάnēs': 'João', 'Ἰōάnē': 'João',
  'Ἰōάnoy': 'João',
  'idia': 'próprias', 'idioi': 'próprios',
  'Ἱerosolύmōn': 'Jerusalém',
  'Israel': 'Israel', 'Israēl': 'Israel', 'Ἰsraήl': 'Israel',
  'Ioydaioi': 'judeus', 'Ἰoydaioi': 'judeus', 'Ἰoydaίoys': 'judeus',

  // K
  'kagō': 'e-eu', 'kagώ': 'e-eu',
  'kai': 'e',
  'kairos': 'tempo',
  'kakos': 'mau', 'kakoys': 'maus', 'kakoύs': 'maus',
  'kaleō': 'chamar', 'kaloymέnē': 'chamada',
  'kamίnō': 'fornalha',
  'kardia': 'coração', 'kardias': 'coração',
  'kata': 'segundo', 'conforme',
  'katabainō': 'descer', 'katabaίnon': 'descendo',
  'katέlaben': 'compreendeu',
  'katoikei': 'habita', 'katoikeis': 'habitas',
  'kathōs': 'conforme',
  'kekopίakes': 'cansaste',
  'kέkragen': 'clamou',
  'kephalē': 'cabeça', 'kephalēn': 'cabeça',
  'kēryssō': 'pregar', 'kērύssōn': 'pregando',
  'kinήsō': 'moverei',
  'kleis': 'chaves',
  'kolpon': 'seio', 'kόlpon': 'seio',
  'kopos': 'trabalho', 'kόpon': 'trabalho',
  'kopsontai': 'lamentarão', 'kόpsontai': 'lamentarão',
  'kosmos': 'mundo', 'kosmoy': 'mundo', 'kόsmon': 'mundo',
  'kratei': 'manténs', 'krateis': 'seguras',
  'kratos': 'domínio', 'krάtos': 'domínio',
  'kratoyntas': 'segurando',
  'krinō': 'julgar', 'krίnō': 'julgo',
  'kyriakē': 'do-Senhor',
  'kyrios': 'Senhor', 'kyrioy': 'Senhor', 'kyriō': 'Senhor',

  // L
  'laos': 'povo', 'laoy': 'povo', 'laōn': 'povos',
  'lalēsō': 'falarei', 'laleō': 'falar',
  'lambanō': 'receber',
  'legō': 'dizer', 'legōn': 'dizendo', 'legontes': 'dizendo',
  'legόntōn': 'dizendo', 'lέgontas': 'dizendo', 'lέgeis': 'dizes',
  'legoύsēs': 'dizendo',
  'leykos': 'branco', 'leykai': 'brancos', 'leykόn': 'branco',
  'Leyeίtas': 'Levitas',
  'logos': 'palavra', 'logoy': 'palavra', 'logon': 'palavra',
  'lόgoys': 'palavras',
  'loipos': 'restante',
  'lysanti': 'libertou', 'lύsanti': 'libertou',
  'lysō': 'desatar', 'lύsō': 'desate',
  'lychnίa': 'candelabro', 'lychnίan': 'candelabro', 'lychnίas': 'candelabros',
  'lychnίai': 'candelabros',

  // M
  'Makάrios': 'Bem-aventurado', 'makarioi': 'bem-aventurados',
  'martyria': 'testemunho', 'martyrίan': 'testemunho', 'martyrίa': 'testemunho',
  'martyreō': 'testemunhar', 'martyrei': 'testemunha',
  'martyrēsē': 'testemunhe', 'martyrήsē': 'testemunhe',
  'martys': 'testemunha', 'mάrtys': 'testemunha',
  'emartύrēsen': 'testemunhou',
  'mathētēs': 'discípulo', 'mathētai': 'discípulos', 'mathētōn': 'discípulos',
  'mέga': 'grande', 'megas': 'grande', 'megalē': 'grande', 'megάlēn': 'grande',
  'mέllei': 'está-para', 'mέlleis': 'estás-para',
  'men': 'de-fato',
  'mesos': 'meio', 'mέsō': 'meio', 'mέsos': 'meio',
  'meta': 'com', 'met': 'com',
  'metanoēsōn': 'arrepende-te', 'metanόēson': 'arrepende-te',
  'metanoήsēs': 'arrependeres',
  'mē': 'não', 'mή': 'não',
  'misēsō': 'odiar', 'miseis': 'odeias', 'misō': 'odeio',
  'mnēmoneye': 'lembra-te', 'mnēmόneye': 'lembra-te',
  'monogenēs': 'unigênito', 'monogenoys': 'unigênito',
  'Mōysēs': 'Moisés', 'Mōysέōs': 'Moisés',
  'mystērion': 'mistério', 'mystήrion': 'mistério',

  // N
  'naί': 'sim', 'nai': 'sim',
  'naos': 'templo', 'naoy': 'templo',
  'nekros': 'morto', 'nekroi': 'mortos', 'nekrōn': 'mortos', 'nekrόs': 'morto',
  'nephelē': 'nuvem', 'nephelōn': 'nuvens',
  'nēsos': 'ilha', 'nήsō': 'ilha',
  'nikōn': 'vencendo', 'nikōnti': 'vencedor',
  'Nikolaitōn': 'Nicolaítas',
  'nomos': 'lei', 'nomoy': 'lei',
  'nyn': 'agora',
  'nyx': 'noite', 'nyktos': 'noite',

  // O
  'oda': 'sei', 'oida': 'sei', 'oidamen': 'sabemos',
  'oikos': 'casa', 'oikoy': 'casa',
  'olίga': 'poucas-coisas',
  'Omega': 'Ômega', 'Ὦ': 'Ômega',
  'onoma': 'nome', 'onomati': 'nome', 'onomά': 'nome',
  'opisō': 'atrás', 'opίsō': 'atrás',
  'opsis': 'face', 'rosto',
  'opsetai': 'verá',
  'horan': 'ver',
  'orge': 'ira', 'orgēs': 'ira',
  'oros': 'monte', 'oroys': 'monte',
  'oti': 'que',
  'ou': 'não', 'oyk': 'não', 'oychi': 'não',
  'ouranios': 'celestial',
  'oyranos': 'céu', 'oyranoy': 'céu', 'oyranōn': 'céus',
  'oydeis': 'ninguém',
  'Oy': 'Não',
  'oys': 'ouvido',
  'oxeia': 'afiada', 'oxeian': 'afiada',

  // P
  'pais': 'servo',
  'Pantokrάtōr': 'Todo-Poderoso',
  'para': 'de', 'par': 'junto-a',
  'paralabon': 'recebendo', 'parέlabon': 'receberam',
  'Paradeίsō': 'Paraíso',
  'pas': 'todo', 'panta': 'todas-as-coisas', 'pantōn': 'todos',
  'pasai': 'todas',
  'paschō': 'sofrer', 'pάschein': 'sofrer',
  'patēr': 'pai', 'patros': 'pai', 'Patrόs': 'Pai', 'Patri': 'Pai',
  'Pάtmō': 'Patmos',
  'peirasthēte': 'sejais-provados',
  'pempō': 'enviar', 'pempsas': 'enviou', 'pέmpson': 'envia',
  'pέmpsasin': 'enviaram',
  'pepyrōmέnēs': 'ardente',
  'peri': 'acerca-de',
  'periezōsmέnon': 'cingido',
  'peripatōn': 'caminhando', 'peripatoynta': 'caminhando',
  'Pergamon': 'Pérgamo', 'Pergάmō': 'Pérgamo',
  'petra': 'pedra', 'petras': 'pedra',
  'phaίnei': 'brilha', 'phainō': 'brilhar',
  'Pharisaioi': 'fariseus', 'Pharisaίōn': 'fariseus',
  'phagein': 'comer',
  'phobeō': 'temer', 'phobou': 'temas', 'phoboy': 'temas',
  'phlox': 'chama',
  'phōnē': 'voz', 'phōnēn': 'voz', 'phōnή': 'voz', 'phōnήn': 'voz',
  'phōs': 'luz', 'phōtόs': 'luz', 'phōtί': 'luz',
  'phōtίzei': 'ilumina',
  'phylai': 'tribos',
  'phylakē': 'prisão', 'phylakēn': 'prisão',
  'Philadelphίan': 'Filadélfia',
  'pίstis': 'fé', 'pisteōs': 'fé',
  'pistos': 'fiel', 'pistόs': 'fiel',
  'pisteύō': 'crer', 'pisteύsōsin': 'creiam', 'pisteύoysin': 'crendo',
  'plērēs': 'cheio', 'plήrēs': 'cheio',
  'plērōma': 'plenitude', 'plērώmatos': 'plenitude',
  'pneύma': 'espírito', 'Pneumatos': 'Espírito', 'Pneύmati': 'Espírito',
  'Pneymάtōn': 'Espíritos',
  'podήrē': 'longa-veste',
  'poieō': 'fazer', 'poiēson': 'faze', 'poίēson': 'faze',
  'polis': 'cidade', 'poleōs': 'cidade',
  'polloi': 'muitos', 'pollōn': 'muitas', 'polys': 'muito',
  'ponēros': 'mau', 'ponēroy': 'maligno',
  'porneyō': 'fornicar', 'porneysai': 'fornicar',
  'pόthen': 'de-onde',
  'podes': 'pés', 'pόdes': 'pés', 'pόdas': 'pés',
  'pōpote': 'jamais', 'pώpote': 'jamais',
  'poy': 'onde',
  'prōtos': 'primeiro', 'prōton': 'primeiro', 'prōtόtokos': 'primogênito',
  'prōtēn': 'primeira',
  'prophēteia': 'profecia', 'prophēteίas': 'profecia',
  'prophētēs': 'profeta', 'prophētai': 'profetas', 'prophήtēs': 'profeta',
  'pros': 'junto-a',
  'proskyneō': 'adorar',
  'prosōpon': 'face', 'rosto',
  'ptōcheia': 'pobreza', 'ptōcheίan': 'pobreza',
  'pyr': 'fogo', 'pyros': 'fogo',

  // R
  'rhomphaίa': 'espada',

  // S
  'salpigx': 'trombeta', 'sάlpiggos': 'trombeta',
  'sarx': 'carne', 'sarkos': 'carne',
  'Satanas': 'Satanás', 'Satana': 'Satanás',
  'seaytoy': 'ti-mesmo',
  'sēmainō': 'significar',
  'sēmeion': 'sinal', 'sēmeia': 'sinais',
  'skandalon': 'tropeço', 'skάndalon': 'tropeço',
  'skotia': 'trevas', 'skotίa': 'trevas', 'skotos': 'trevas',
  'Smyrna': 'Esmirna', 'Smύrnē': 'Esmirna', 'Smύrnan': 'Esmirna',
  'sōtēr': 'salvador', 'sōtēria': 'salvação',
  'sophia': 'sabedoria', 'sophias': 'sabedoria',
  'soy': 'teu', 'sou': 'teu',
  'speirō': 'semear',
  'stauros': 'cruz', 'stayros': 'cruz',
  'stέphanon': 'coroa', 'stephanos': 'coroa',
  'stēkei': 'está', 'stήkei': 'está',
  'stoma': 'boca', 'stomatos': 'boca', 'stόmatos': 'boca',
  'sy': 'tu', 'sύ': 'tu',
  'syn': 'com',
  'synagōgē': 'sinagoga',
  'synkoinōnos': 'coparticipante',

  // T
  'tachos': 'brevidade', 'tάchei': 'brevemente',
  'tayta': 'estas-coisas',
  'tέkna': 'filhos', 'teknon': 'filho', 'tekna': 'filhos',
  'teleō': 'completar',
  'tēreō': 'guardar', 'tēroyntes': 'guardando',
  'thanatos': 'morte', 'thanatoy': 'morte',
  'thaumazō': 'maravilhar',
  'thelēma': 'vontade', 'thelήmatos': 'vontade',
  'Theos': 'Deus', 'Theoy': 'Deus', 'Theόn': 'Deus', 'Theόs': 'Deus',
  'thlipsis': 'tribulação', 'thlipsin': 'tribulação', 'thlίpsei': 'tribulação',
  'thrόnos': 'trono', 'thrόnoy': 'trono',
  'Thyateira': 'Tiatira', 'Thyάteira': 'Tiatira',
  'tis': 'quem', 'tί': 'o-que', 'tίs': 'quem', 'Tίs': 'Quem',
  'topos': 'lugar', 'tόpoy': 'lugar',
  'tote': 'então',
  'treis': 'três', 'tria': 'três',
  'triches': 'cabelos', 'trίches': 'cabelos',

  // Y/U
  'yhiōn': 'filhos', 'hyios': 'filho', 'hyioy': 'filho',

  // X
  'xylon': 'árvore', 'xύloy': 'árvore',

  // Z
  'zaō': 'viver', 'zōn': 'vivendo', 'Zōn': 'Vivente',
  'zōē': 'vida', 'zōēs': 'vida',
  'zōnē': 'cinto', 'zώnēn': 'cinto',
};

// Glossário Hebraico transliterado -> Português
const HEBREW_GLOSSARY = {
  // Palavras comuns
  'Elohim': 'Deus',
  'YHWH': 'YHWH',
  'adonai': 'Senhor',
  'ruach': 'espírito',
  'nefesh': 'alma',
  'chesed': 'misericórdia',
  'shalom': 'paz',
  'emet': 'verdade',
  'tsedaqah': 'justiça',
  'torah': 'lei',
  'berit': 'aliança',
  'qodesh': 'santo',
  'kavod': 'glória',
  'rachamim': 'compaixão',
  'yasha': 'salvar',
  'ga\'al': 'remir',
  'padah': 'resgatar',
  'bara': 'criar',
  'asah': 'fazer',
  'yatsar': 'formar',
};

/**
 * Aplicar glossário em uma linha
 */
function applyGlossary(line) {
  let result = line;

  // Aplicar glossário grego (maior para menor para evitar substituições parciais)
  const greekKeys = Object.keys(GREEK_GLOSSARY).sort((a, b) => b.length - a.length);
  for (const key of greekKeys) {
    // Substituir palavra inteira (com limites de palavra)
    const regex = new RegExp(`\\b${escapeRegex(key)}\\b`, 'g');
    result = result.replace(regex, GREEK_GLOSSARY[key]);
  }

  // Aplicar glossário hebraico
  const hebrewKeys = Object.keys(HEBREW_GLOSSARY).sort((a, b) => b.length - a.length);
  for (const key of hebrewKeys) {
    const regex = new RegExp(`\\b${escapeRegex(key)}\\b`, 'g');
    result = result.replace(regex, HEBREW_GLOSSARY[key]);
  }

  return result;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Processar arquivo
 */
function processFile(filepath) {
  const content = readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  const processed = lines.map(applyGlossary);
  writeFileSync(filepath, processed.join('\n'), 'utf8');
}

// Main
const exportDir = join(process.cwd(), 'Bible pt-br', 'txt');
const files = readdirSync(exportDir).filter(f => f.endsWith('.txt'));

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║       GLOSSÁRIO - BÍBLIA BELÉM An.C 2025                         ║');
console.log('║       Aplicando traduções faltantes                              ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`Entradas no glossário grego: ${Object.keys(GREEK_GLOSSARY).length}`);
console.log(`Entradas no glossário hebraico: ${Object.keys(HEBREW_GLOSSARY).length}`);
console.log('');

let count = 0;
for (const file of files) {
  count++;
  const filepath = join(exportDir, file);
  console.log(`[${count}/${files.length}] Processando ${file}...`);
  processFile(filepath);
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════════');
console.log(`✓ ${count} arquivos processados com sucesso!`);
console.log('═══════════════════════════════════════════════════════════════════');
