/**
 * Processador de Livro - Bíblia Belém An.C 2025
 * 1. Exporta do D1
 * 2. Traduz palavras gregas/hebraicas (usando glossary/greek.json)
 * 3. Gera arquivo TXT final
 *
 * REGRAS:
 * - Θεός/Theos e variantes permanecem no original grego
 * - Ἰησοῦς/Jesus permanece no original
 * - Χριστός/Cristo permanece no original
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuração do livro
const BOOK_CODE = process.argv[2] || 'REV';
const BOOK_NAME = process.argv[3] || 'Apocalipse';
const BOOK_NUM = process.argv[4] || '66';

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log(`║  PROCESSADOR - BÍBLIA BELÉM An.C 2025                             ║`);
console.log(`║  Livro ${BOOK_NUM}: ${BOOK_NAME} (${BOOK_CODE})                              `);
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// Carregar palavras que NÃO devem ser traduzidas
const keepOriginalPath = join(projectRoot, 'glossary', 'keep_original.json');
let KEEP_ORIGINAL = new Set([
  // Defaults caso o arquivo não exista
  'Θεός', 'Θεοῦ', 'Θεόν', 'Θεῷ', 'Θεέ',
  'θεός', 'θεοῦ', 'θεόν', 'θεῷ',
  'Ἰησοῦς', 'Ἰησοῦ', 'Ἰησοῦν',
  'Χριστός', 'Χριστοῦ', 'Χριστόν', 'Χριστῷ',
]);

if (existsSync(keepOriginalPath)) {
  const keepData = JSON.parse(readFileSync(keepOriginalPath, 'utf-8'));
  if (keepData.all_words) {
    KEEP_ORIGINAL = new Set(keepData.all_words);
    console.log(`✓ Carregado keep_original.json: ${KEEP_ORIGINAL.size} palavras`);
  }
}

// Carregar glossário do arquivo JSON (sincronizado com D1)
const glossaryPath = join(projectRoot, 'glossary', 'greek.json');
let GLOSSARY = {};

if (existsSync(glossaryPath)) {
  const glossaryData = JSON.parse(readFileSync(glossaryPath, 'utf-8'));
  // Converter formato { word: { translation, strongs } } para { word: translation }
  for (const [word, data] of Object.entries(glossaryData)) {
    GLOSSARY[word] = data.translation;
  }
  console.log(`✓ Carregado glossary/greek.json: ${Object.keys(GLOSSARY).length} entradas`);
} else {
  console.warn('⚠ Arquivo glossary/greek.json não encontrado, usando glossário mínimo');
  // Glossário mínimo de fallback
  GLOSSARY = {
  // A
  'Ἀποκάλυψις': 'Revelação', 'ἀποκάλυψις': 'revelação',
  'ἀγαπῶντι': 'amando', 'ἀγάπη': 'amor', 'ἀγαπητός': 'amado',
  'ἄγγελος': 'anjo', 'ἀγγέλου': 'anjo', 'ἄγγελον': 'anjo', 'ἀγγέλῳ': 'anjo',
  'ἅγιος': 'santo', 'ἁγίων': 'santos', 'ἅγιοι': 'santos',
  'ἀδελφός': 'irmão', 'ἀδελφοί': 'irmãos', 'ἀδελφὸς': 'irmão',
  'αἰών': 'era', 'αἰῶνας': 'eras', 'αἰώνων': 'eras',
  'αἰώνιος': 'eterno', 'αἰωνίου': 'eterna',
  'ἀκούω': 'ouvir', 'ἀκούοντες': 'ouvindo', 'ἀκουσάτω': 'ouça', 'ἤκουσα': 'ouvi',
  'ἀλήθεια': 'verdade', 'ἀληθινός': 'verdadeiro',
  'ἀλλά': 'mas', "ἀλλ'": 'mas',
  'Ἄλφα': 'Alfa',
  'ἀμήν': 'amém',
  'ἁμαρτία': 'pecado', 'ἁμαρτιῶν': 'pecados',
  'ἀναγινώσκων': 'lendo',
  'ἄνθρωπος': 'homem', 'ἀνθρώπων': 'homens', 'ἀνθρώπου': 'homem',
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
  'βλέπω': 'ver', 'βλέπεις': 'vês', 'βλέπειν': 'ver',

  // Γ
  'γεγραμμένα': 'escritas',
  'γῆ': 'terra', 'γῆς': 'terra',
  'γράφω': 'escrever', 'γράψον': 'escreve',

  // Δ
  'δεῖ': 'é-necessário',
  'δεξιά': 'direita', 'δεξιᾷ': 'direita',
  'διά': 'através-de', "δι'": 'através-de',
  'διάβολος': 'diabo',
  'διδαχή': 'ensino',
  'δίδωμι': 'dar', 'δώσω': 'darei',
  'δίστομος': 'de-dois-gumes',
  'δόξα': 'glória', 'δόξαν': 'glória',
  'δοῦλος': 'servo', 'δούλοις': 'servos', 'δούλῳ': 'servo', 'δούλους': 'servos',
  'δύναμις': 'poder', 'δυνάμει': 'poder',

  // Ε
  'ἐγώ': 'eu', 'Ἐγώ': 'Eu', 'ἐμέ': 'mim', 'ἐμοῦ': 'meu',
  'ἔχω': 'ter', 'ἔχει': 'tem', 'ἔχεις': 'tens', 'ἔχων': 'tendo',
  'εἰμί': 'sou', 'εἶ': 'és',
  'εἶδον': 'vi', 'εἶδες': 'viste',
  'εἶπον': 'disse', 'εἶπεν': 'disse',
  'εἰρήνη': 'paz',
  'εἰς': 'para',
  'ἐκκλησία': 'assembleia', 'ἐκκλησίαις': 'assembleias', 'ἐκκλησίας': 'assembleia',
  'ἐκπορευομένη': 'saindo',
  'ἐμαρτύρησεν': 'testemunhou',
  'ἐν': 'em',
  'ἐνδεδυμένον': 'vestido',
  'ἐνώπιον': 'diante',
  'ἐντολή': 'mandamento',
  'ἑπτά': 'sete', 'ἑπτὰ': 'sete',
  'ἔργον': 'obra', 'ἔργα': 'obras',
  'ἔρχομαι': 'vir', 'ἐρχόμενος': 'vindo', 'ἔρχομαί': 'venho',
  'ἐσήμανεν': 'significou',
  'ἔσχατος': 'último',
  'ἐγενόμην': 'tornei-me',
  'ἐγγύς': 'perto',
  'ἐξεκέντησαν': 'traspassaram',
  'ἐπί': 'sobre', "ἐπ'": 'sobre',
  'ἐπέστρεψα': 'voltei',

  // Ζ
  'ζάω': 'viver', 'ζῶν': 'vivente', 'ζῶντα': 'vivendo',
  'ζωή': 'vida', 'ζωῆς': 'vida',
  'ζώνη': 'cinto', 'ζώνην': 'cinto',

  // Η
  'ᾍδης': 'Hades', 'ᾍδου': 'Hades',
  'ἡμέρα': 'dia', 'ἡμέρᾳ': 'dia', 'ἡμερῶν': 'dias',

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
  'μετά': 'com', "μετ'": 'com',
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

  // Π
  'παῖς': 'servo',
  'Παντοκράτωρ': 'Todo-Poderoso',
  'παρά': 'de', "παρ'": 'junto-a',
  'πᾶς': 'todo', 'πάντα': 'todas-as-coisas', 'πάντων': 'todos',
  'πᾶσαι': 'todas',
  'πατήρ': 'Pai', 'Πατρί': 'Pai', 'Πατρὶ': 'Pai',
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
  'σημαίνω': 'significar',
  'σκοτία': 'trevas',
  'σοφία': 'sabedoria',
  'σοῦ': 'teu', 'σου': 'teu',
  'σταυρός': 'cruz',
  'στέφανος': 'coroa', 'στέφανον': 'coroa',
  'στόμα': 'boca', 'στόματος': 'boca',
  'σύ': 'tu',
  'σύν': 'com',
  'συνκοινωνός': 'coparticipante', 'συνκοινωνὸς': 'coparticipante',
  'Σμύρνα': 'Esmirna', 'Σμύρναν': 'Esmirna',
  'Σάρδεις': 'Sardes',
  'Φιλαδελφία': 'Filadélfia', 'Φιλαδελφίαν': 'Filadélfia',
  'Λαοδικία': 'Laodiceia', 'Λαοδικίαν': 'Laodiceia',
  'Πέργαμος': 'Pérgamo', 'Πέργαμον': 'Pérgamo',
  'Θυάτειρα': 'Tiatira',

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
  'υἱός': 'filho', 'υἱοῦ': 'filho', 'υἱόν': 'filho',
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
  'χρυσᾶς': 'dourado', 'χρυσοῦν': 'dourado',

  // Ψ
  'ψυχή': 'alma', 'ψυχαί': 'almas',

  // Ω
  'Ὦ': 'Ômega',
  'ὢν': 'sendo', 'ὤν': 'sendo',
  'ὥρα': 'hora',
  };
}

console.log('');

/**
 * Traduzir palavra em colchetes
 */
function translateWord(match) {
  // Remover colchetes
  const content = match.slice(1, -1).trim();

  // Separar palavra da pontuação final
  const punctMatch = content.match(/^(.+?)([.,;:·]*)$/);
  const word = punctMatch ? punctMatch[1] : content;
  const punct = punctMatch ? punctMatch[2] : '';

  // Se for palavra que deve manter original (Theos, Jesus, Cristo)
  if (KEEP_ORIGINAL.has(word)) {
    return word + punct;
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
  return line.replace(/\[[^\]]+\]/g, translateWord);
}

// ==================== EXECUÇÃO ====================

// Passo 1: Exportar do D1
console.log('1. Exportando do D1...');
const query = `SELECT v.chapter, v.verse, GROUP_CONCAT(t.pt_literal, ' ') as texto FROM books b JOIN verses v ON b.id = v.book_id JOIN tokens t ON v.id = t.verse_id WHERE b.code = '${BOOK_CODE}' AND t.pt_literal IS NOT NULL GROUP BY v.chapter, v.verse ORDER BY v.chapter, v.verse`;

try {
  execSync(`npx wrangler d1 execute biblia-belem --remote --command "${query}" --json > temp_book.json`, { stdio: 'pipe' });
} catch (e) {
  console.error('Erro ao exportar do D1:', e.message);
  process.exit(1);
}

// Passo 2: Ler dados
const data = JSON.parse(readFileSync('temp_book.json', 'utf8'));
const verses = data[0].results;
console.log(`   ${verses.length} versículos encontrados`);

// Passo 3: Construir e traduzir
console.log('2. Traduzindo palavras...');

const lines = [];
lines.push('═══════════════════════════════════════════════════════════════════════');
lines.push(BOOK_NAME.toUpperCase());
lines.push('═══════════════════════════════════════════════════════════════════════');
lines.push('');
lines.push('Tradução: Bíblia Belém An.C 2025');
lines.push('Método: Literal Rígido - Fiel ao códice original');
lines.push('Sem suavização. Sem normalização. Sem interferência do tradutor.');
lines.push('');
lines.push('═══════════════════════════════════════════════════════════════════════');
lines.push('');

let currentChapter = 0;
let translatedCount = 0;
let untranslatedCount = 0;

for (const v of verses) {
  if (v.chapter !== currentChapter) {
    currentChapter = v.chapter;
    lines.push('');
    lines.push(`── Capítulo ${currentChapter} ──`);
    lines.push('');
  }

  // Contar traduções
  const matches = v.texto.match(/\[[^\]]+\]/g) || [];
  for (const m of matches) {
    const word = m.slice(1, -1).replace(/[.,;:·]+$/, '');
    if (GLOSSARY[word] || KEEP_ORIGINAL.has(word)) {
      translatedCount++;
    } else {
      untranslatedCount++;
    }
  }

  // Traduzir linha
  const translatedLine = processLine(v.texto);
  lines.push(`${v.verse}  ${translatedLine}`);
}

lines.push('');
lines.push('───────────────────────────────────────────────────────────────────────');
lines.push(`Fim de ${BOOK_NAME}`);

// Passo 4: Salvar
const filename = `${BOOK_NUM}_${BOOK_CODE}_${BOOK_NAME}.txt`;
const filepath = join(process.cwd(), 'Bible pt-br', 'txt', filename);
writeFileSync(filepath, lines.join('\n'), 'utf8');

console.log('3. Arquivo salvo!');
console.log('');
console.log('═══════════════════════════════════════════════════════════════════');
console.log(`✓ ${filename}`);
console.log(`  Versículos: ${verses.length}`);
console.log(`  Palavras traduzidas: ${translatedCount}`);
console.log(`  Palavras sem tradução: ${untranslatedCount}`);
console.log('═══════════════════════════════════════════════════════════════════');
