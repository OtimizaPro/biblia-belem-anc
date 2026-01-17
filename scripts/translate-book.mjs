/**
 * Tradutor de Livro - Bíblia Belém An.C 2025
 * Traduz palavras gregas/hebraicas em colchetes
 * REGRA: Theos e variantes permanecem no original
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Palavras que NÃO devem ser traduzidas (referências a Deus, Jesus, Cristo)
const KEEP_ORIGINAL = new Set([
  // Theos - Deus
  'Θεός', 'Θεοῦ', 'Θεόν', 'Θεῷ', 'Θεέ', 'Θεός,',
  'θεός', 'θεοῦ', 'θεόν', 'θεῷ',
  'Theos', 'Theou', 'Theon', 'Theo',
  'Theόs', 'Theoy', 'Theόn',
  // Iēsous - Jesus
  'Ἰησοῦς', 'Ἰησοῦ', 'Ἰησοῦν',
  'Iēsous', 'Iēsou',
  'Jesus',
  // Christos - Cristo
  'Χριστός', 'Χριστοῦ', 'Χριστόν', 'Χριστῷ',
  'Christos', 'Christou', 'Christon',
  'Cristo',
]);

// Glossário Grego -> Português
const GLOSSARY = {
  // A
  'Ἀποκάλυψις': 'Revelação', 'ἀποκάλυψις': 'revelação',
  'ἀγαπῶντι': 'amando', 'ἀγάπη': 'amor', 'ἀγαπητός': 'amado',
  'ἄγγελος': 'anjo', 'ἀγγέλου': 'anjo', 'ἄγγελον': 'anjo',
  'ἅγιος': 'santo', 'ἁγίων': 'santos', 'ἅγιοι': 'santos',
  'ἀδελφός': 'irmão', 'ἀδελφοί': 'irmãos', 'ἀδελφὸς': 'irmão',
  'αἰών': 'era', 'αἰῶνας': 'eras', 'αἰώνων': 'eras',
  'αἰώνιος': 'eterno', 'αἰωνίου': 'eterna',
  'ἀκούω': 'ouvir', 'ἀκούοντες': 'ouvindo', 'ἀκουσάτω': 'ouça',
  'ἀλήθεια': 'verdade', 'ἀληθινός': 'verdadeiro',
  'ἀλλά': 'mas', 'ἀλλ\'': 'mas',
  'Ἄλφα': 'Alfa',
  'ἀμήν': 'amém',
  'ἁμαρτία': 'pecado', 'ἁμαρτιῶν': 'pecados',
  'ἀναγινώσκων': 'lendo',
  'ἄνθρωπος': 'homem', 'ἀνθρώπων': 'homens',
  'ἀπόστολος': 'apóstolo', 'ἀποστόλους': 'apóstolos',
  'ἀποστείλας': 'enviando',
  'ἀρχή': 'princípio',
  'ἄρχων': 'governante', 'ἄρχοντες': 'governantes',
  'Ἀσία': 'Ásia', 'Ἀσίᾳ': 'Ásia',
  'ἀστήρ': 'estrela', 'ἀστέρας': 'estrelas', 'ἀστέρων': 'estrelas',

  // Β
  'βασιλεία': 'reino', 'βασιλείᾳ': 'reino',
  'βασιλεύς': 'rei', 'βασιλέων': 'reis',
  'βιβλίον': 'livro', 'βιβλίου': 'livro',
  'βλέπω': 'ver', 'βλέπεις': 'vês',

  // Γ
  'γεγραμμένα': 'escritas',
  'γράφω': 'escrever', 'γράψον': 'escreve',

  // Δ
  'δεῖ': 'é-necessário',
  'δεξιά': 'direita', 'δεξιᾷ': 'direita',
  'διά': 'através-de', 'δι\'': 'através-de',
  'διάβολος': 'diabo',
  'διδαχή': 'ensino',
  'δίδωμι': 'dar', 'δώσω': 'darei',
  'δίστομος': 'de-dois-gumes',
  'δόξα': 'glória', 'δόξαν': 'glória',
  'δοῦλος': 'servo', 'δούλοις': 'servos', 'δούλῳ': 'servo',
  'δύναμις': 'poder', 'δυνάμει': 'poder',

  // Ε
  'ἐγώ': 'eu', 'Ἐγώ': 'Eu', 'ἐμέ': 'mim', 'ἐμοῦ': 'mim',
  'ἔχω': 'ter', 'ἔχει': 'tem', 'ἔχεις': 'tens', 'ἔχων': 'tendo',
  'εἰμί': 'sou', 'εἶ': 'és',
  'εἶδον': 'vi', 'εἶδες': 'viste',
  'εἶπον': 'disse', 'εἶπεν': 'disse',
  'εἰρήνη': 'paz',
  'εἰς': 'para',
  'ἐκκλησία': 'assembleia', 'ἐκκλησίαις': 'assembleias', 'ἐκκλησίας': 'assembleia',
  'ἐκπορευομένη': 'saindo',
  'ἐλάβομεν': 'recebemos',
  'ἐμαρτύρησεν': 'testemunhou',
  'ἐν': 'em',
  'ἐνδεδυμένον': 'vestido',
  'ἐνώπιον': 'diante',
  'ἐντολή': 'mandamento',
  'ἐξεκέντησαν': 'traspassaram',
  'ἐπί': 'sobre', 'ἐπ\'': 'sobre',
  'ἔργον': 'obra', 'ἔργα': 'obras',
  'ἔρχομαι': 'vir', 'ἐρχόμενος': 'vindo', 'ἔρχομαί': 'venho',
  'ἐσήμανεν': 'significou',
  'ἔσχατος': 'último',
  'ἑπτά': 'sete', 'ἑπτὰ': 'sete',
  'ἐγενόμην': 'tornei-me',
  'ἐγγύς': 'perto',

  // Ζ
  'ζάω': 'viver', 'ζῶν': 'vivente', 'ζῶντα': 'vivendo',
  'ζωή': 'vida', 'ζωῆς': 'vida',
  'ζώνη': 'cinto', 'ζώνην': 'cinto',

  // Η
  'ᾍδης': 'Hades', 'ᾍδου': 'Hades',
  'ἡμέρα': 'dia', 'ἡμέρᾳ': 'dia', 'ἡμερῶν': 'dias',
  'ἤκουσα': 'ouvi',

  // Θ
  'θάνατος': 'morte', 'θανάτου': 'morte',
  'θλῖψις': 'tribulação', 'θλίψει': 'tribulação',
  'θρόνος': 'trono', 'θρόνου': 'trono',

  // Ι
  'ἰδού': 'eis', 'Ἰδού': 'Eis', 'Ἰδοὺ': 'Eis',
  'ἱερεύς': 'sacerdote', 'ἱερεῖς': 'sacerdotes',
  'Ἰωάννης': 'João', 'Ἰωάνης': 'João', 'Ἰωάνῃ': 'João',

  // Κ
  'καί': 'e',
  'καιρός': 'tempo', 'καιρὸς': 'tempo',
  'καλέω': 'chamar', 'καλουμένῃ': 'chamada',
  'καρδία': 'coração',
  'κατά': 'segundo',
  'κεφαλή': 'cabeça', 'κεφαλὴ': 'cabeça',
  'κλείς': 'chaves',
  'κόσμος': 'mundo', 'κόσμου': 'mundo',
  'κόψονται': 'lamentarão',
  'κράτος': 'domínio',
  'κυριακή': 'do-Senhor', 'κυριακῇ': 'do-Senhor',
  'κύριος': 'Senhor', 'κυρίου': 'Senhor',

  // Λ
  'λαός': 'povo', 'λαοῦ': 'povo',
  'λέγω': 'dizer', 'λέγων': 'dizendo', 'λεγούσης': 'dizendo',
  'λευκός': 'branco', 'λευκαί': 'brancos',
  'λόγος': 'palavra', 'λόγους': 'palavras', 'λόγου': 'palavra',
  'λυχνία': 'candelabro', 'λυχνίας': 'candelabros', 'λυχνίαι': 'candelabros',
  'λύσαντι': 'libertou',

  // Μ
  'Μακάριος': 'Bem-aventurado', 'μακάριοι': 'bem-aventurados',
  'μαρτυρία': 'testemunho', 'μαρτυρίαν': 'testemunho',
  'μάρτυς': 'testemunha',
  'μαθητής': 'discípulo', 'μαθηταί': 'discípulos',
  'μέγας': 'grande', 'μεγάλην': 'grande',
  'μέλλω': 'estar-para',
  'μέσος': 'meio', 'μέσῳ': 'meio',
  'μετά': 'com', 'μετ\'': 'com',
  'μή': 'não',
  'μυστήριον': 'mistério',

  // Ν
  'ναί': 'sim',
  'νεκρός': 'morto', 'νεκρῶν': 'mortos',
  'νεφέλη': 'nuvem', 'νεφελῶν': 'nuvens',
  'νῆσος': 'ilha', 'νήσῳ': 'ilha',
  'νικάω': 'vencer', 'νικῶν': 'vencendo', 'νικῶντι': 'vencedor',

  // Ο
  'οἶδα': 'sei',
  'οἶκος': 'casa',
  'οἵτινες': 'os-quais',
  'ὄνομα': 'nome', 'ὀνόματι': 'nome',
  'ὀπίσω': 'atrás',
  'ὄψις': 'face',
  'ὄψεται': 'verá',
  'ὀφθαλμός': 'olho', 'ὀφθαλμοί': 'olhos', 'ὀφθαλμὸς': 'olho',
  'οὐ': 'não', 'οὐκ': 'não',
  'οὐρανός': 'céu', 'οὐρανοῦ': 'céu', 'οὐρανῶν': 'céus',
  'ὅς': 'o-qual', 'οἱ': 'os', 'ὁ': 'o', 'ἡ': 'a',
  'ὡς': 'como',
  'ὅτε': 'quando',
  'ὅτι': 'que',
  'οὗτος': 'este', 'οὕτως': 'assim',

  // Π
  'παῖς': 'servo',
  'Παντοκράτωρ': 'Todo-Poderoso',
  'παρά': 'de', 'παρ\'': 'junto-a',
  'πᾶς': 'todo', 'πάντα': 'todas-as-coisas', 'πάντων': 'todos',
  'πᾶσαι': 'todas',
  'πατήρ': 'pai', 'Πατρί': 'Pai', 'Πατρὶ': 'Pai',
  'Πάτμος': 'Patmos', 'Πάτμῳ': 'Patmos',
  'πέμπω': 'enviar', 'πέμψον': 'envia',
  'πιστός': 'fiel', 'πιστοί': 'fiéis',
  'πίστις': 'fé', 'πίστεως': 'fé',
  'πνεῦμα': 'espírito', 'Πνεύματι': 'Espírito', 'Πνευμάτων': 'Espíritos',
  'ποδήρη': 'longa-veste',
  'ποιέω': 'fazer', 'ποίησον': 'faze',
  'πόλις': 'cidade',
  'πολύς': 'muito', 'πολλῶν': 'muitas',
  'πούς': 'pé', 'πόδες': 'pés', 'πόδας': 'pés',
  'πρῶτος': 'primeiro', 'πρωτότοκος': 'primogênito',
  'προφητεία': 'profecia', 'προφητείας': 'profecia',
  'προφήτης': 'profeta', 'προφῆται': 'profetas',
  'πρός': 'junto-a',
  'πῦρ': 'fogo', 'πυρός': 'fogo',

  // Ρ
  'ῥομφαία': 'espada',

  // Σ
  'σάλπιγξ': 'trombeta', 'σάλπιγγος': 'trombeta',
  'σάρξ': 'carne', 'σαρκός': 'carne',
  'Σατανᾶς': 'Satanás', 'Σατανᾶ': 'Satanás',
  'σημαίνω': 'significar', 'ἐσήμανεν': 'significou',
  'σκοτία': 'trevas',
  'σοφία': 'sabedoria',
  'σοῦ': 'teu', 'σου': 'teu',
  'σταυρός': 'cruz',
  'στέφανος': 'coroa', 'στέφανον': 'coroa',
  'στόμα': 'boca', 'στόματος': 'boca',
  'σύ': 'tu',
  'σύν': 'com',
  'συνκοινωνός': 'coparticipante', 'συνκοινωνὸς': 'coparticipante',

  // Τ
  'τάχος': 'brevidade', 'τάχει': 'brevemente',
  'τέκνον': 'filho', 'τέκνα': 'filhos',
  'τηρέω': 'guardar', 'τηροῦντες': 'guardando',
  'τίς': 'quem', 'τί': 'o-que',
  'τόπος': 'lugar',
  'τότε': 'então',
  'τρεῖς': 'três',
  'τρίχες': 'cabelos',

  // Υ
  'υἱός': 'filho', 'υἱοῦ': 'filho',
  'ὑπομονή': 'perseverança', 'ὑπομονῇ': 'perseverança',

  // Φ
  'φαίνω': 'brilhar', 'φαίνει': 'brilha',
  'φέρω': 'trazer',
  'φλόξ': 'chama',
  'φοβέω': 'temer', 'φοβοῦ': 'temas',
  'φυλή': 'tribo', 'φυλαί': 'tribos', 'φυλαὶ': 'tribos',
  'φωνή': 'voz', 'φωνήν': 'voz', 'φωνὴν': 'voz',
  'φῶς': 'luz', 'φωτός': 'luz',

  // Χ
  'χαίρω': 'alegrar', 'χαρά': 'alegria',
  'χάρις': 'graça', 'χάριτος': 'graça',
  'χείρ': 'mão', 'χειρί': 'mão',
    'χρόνος': 'tempo',
  'χαλκολίβανον': 'bronze-polido', 'χαλκολιβάνῳ': 'bronze-polido',
  'χιών': 'neve',

  // Ψ
  'ψυχή': 'alma', 'ψυχαί': 'almas',

  // Ω
  'Ὦ': 'Ômega',
  'ὢν': 'sendo', 'ὤν': 'sendo',
  'ὥρα': 'hora',
};

/**
 * Traduzir palavra em colchetes
 */
function translateBracket(match) {
  // Remover colchetes
  const content = match.slice(1, -1).trim();

  // Separar palavra da pontuação final
  const punctMatch = content.match(/^(.+?)([.,;:·]*)$/);
  const word = punctMatch ? punctMatch[1] : content;
  const punct = punctMatch ? punctMatch[2] : '';

  // Se for palavra que deve manter original (Theos, etc)
  if (KEEP_ORIGINAL.has(word)) {
    return word + punct; // Retorna sem colchetes, mantém original
  }

  // Verificar se tem tradução no glossário
  if (GLOSSARY[word]) {
    return GLOSSARY[word] + punct;
  }

  // Se não encontrou tradução, manter como está (sem colchetes)
  return word + punct;
}

/**
 * Processar linha
 */
function processLine(line) {
  // Substituir todos os [...]
  return line.replace(/\[[^\]]+\]/g, translateBracket);
}

/**
 * Processar arquivo
 */
function processBook(bookCode, bookName) {
  const filepath = join(process.cwd(), 'Bible pt-br', 'txt', `66_REV_Apocalipse.txt`);

  console.log(`Processando ${bookName}...`);

  const content = readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  const processed = lines.map(processLine);

  writeFileSync(filepath, processed.join('\n'), 'utf8');

  console.log(`✓ ${bookName} processado!`);
}

// Main - Processar Apocalipse
console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║       TRADUTOR - BÍBLIA BELÉM An.C 2025                          ║');
console.log('║       Livro 66: Apocalipse                                       ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');
console.log('REGRA: Θεός/Theos e variantes permanecem no original');
console.log('');

processBook('REV', 'Apocalipse');
