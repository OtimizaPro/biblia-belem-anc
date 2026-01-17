/**
 * Transliterador de Hebraico/Grego para caracteres latinos
 * Converte palavras em [] nos arquivos TXT exportados
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Tabela de transliteração Hebraico -> Latino (baseada em padrões acadêmicos)
const HEBREW_MAP = {
  // Consoantes
  'א': '', 'ב': 'v', 'בּ': 'b', 'ג': 'g', 'גּ': 'g', 'ד': 'd', 'דּ': 'd',
  'ה': 'h', 'הּ': 'h', 'ו': 'v', 'וּ': 'u', 'ז': 'z', 'ח': 'ch', 'ט': 't',
  'י': 'y', 'כ': 'kh', 'כּ': 'k', 'ך': 'kh', 'ךּ': 'k', 'ל': 'l',
  'מ': 'm', 'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': "'",
  'פ': 'f', 'פּ': 'p', 'ף': 'f', 'ףּ': 'p', 'צ': 'ts', 'ץ': 'ts',
  'ק': 'q', 'ר': 'r', 'שׁ': 'sh', 'שׂ': 's', 'ש': 'sh', 'תּ': 't', 'ת': 't',

  // Vogais (nikkud)
  'ָ': 'a', 'ַ': 'a', 'ֲ': 'a',  // patach, qamatz, chataf patach
  'ֵ': 'e', 'ֶ': 'e', 'ֱ': 'e',  // tzere, segol, chataf segol
  'ִ': 'i', 'ִי': 'i',           // chirik
  'ֹ': 'o', 'ָ': 'o', 'ֳ': 'o',  // cholam, qamatz qatan, chataf qamatz
  'ֻ': 'u', 'וּ': 'u',           // kubutz, shuruk
  'ְ': '', 'ֿ': '',              // shva, rafe

  // Acentos e sinais (remover)
  '֑': '', '֒': '', '֓': '', '֔': '', '֕': '', '֖': '', '֗': '',
  '֘': '', '֙': '', '֚': '', '֛': '', '֜': '', '֝': '', '֞': '',
  '֟': '', '֠': '', '֡': '', '֢': '', '֣': '', '֤': '', '֥': '',
  '֦': '', '֧': '', '֨': '', '֩': '', '֪': '', '֫': '', '֬': '',
  '֭': '', '֮': '', '֯': '', 'ֽ': '', '־': '-', '׀': '', '׃': '',
  'ׄ': '', 'ׅ': '', '׆': '', 'ׇ': '',

  // Letras com dagesh
  '֫': '', '֬': '',
};

// Tabela de transliteração Grego -> Latino
const GREEK_MAP = {
  // Maiúsculas
  'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z',
  'Η': 'Ē', 'Θ': 'Th', 'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M',
  'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P', 'Ρ': 'R', 'Σ': 'S',
  'Τ': 'T', 'Υ': 'Y', 'Φ': 'Ph', 'Χ': 'Ch', 'Ψ': 'Ps', 'Ω': 'Ō',

  // Minúsculas
  'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z',
  'η': 'ē', 'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm',
  'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's',
  'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'ph', 'χ': 'ch', 'ψ': 'ps',
  'ω': 'ō',

  // Com acentos/respirações
  'ά': 'a', 'έ': 'e', 'ή': 'ē', 'ί': 'i', 'ό': 'o', 'ύ': 'y', 'ώ': 'ō',
  'ὰ': 'a', 'ὲ': 'e', 'ὴ': 'ē', 'ὶ': 'i', 'ὸ': 'o', 'ὺ': 'y', 'ὼ': 'ō',
  'ᾶ': 'a', 'ῆ': 'ē', 'ῖ': 'i', 'ῦ': 'y', 'ῶ': 'ō',
  'ἀ': 'a', 'ἐ': 'e', 'ἠ': 'ē', 'ἰ': 'i', 'ὀ': 'o', 'ὐ': 'y', 'ὠ': 'ō',
  'ἁ': 'ha', 'ἑ': 'he', 'ἡ': 'hē', 'ἱ': 'hi', 'ὁ': 'ho', 'ὑ': 'hy', 'ὡ': 'hō',
  'ἄ': 'a', 'ἔ': 'e', 'ἤ': 'ē', 'ἴ': 'i', 'ὄ': 'o', 'ὔ': 'y', 'ὤ': 'ō',
  'ἅ': 'ha', 'ἕ': 'he', 'ἥ': 'hē', 'ἵ': 'hi', 'ὅ': 'ho', 'ὕ': 'hy', 'ὥ': 'hō',
  'ἂ': 'a', 'ἒ': 'e', 'ἢ': 'ē', 'ἲ': 'i', 'ὂ': 'o', 'ὒ': 'y', 'ὢ': 'ō',
  'ἃ': 'ha', 'ἓ': 'he', 'ἣ': 'hē', 'ἳ': 'hi', 'ὃ': 'ho', 'ὓ': 'hy', 'ὣ': 'hō',
  'ἆ': 'a', 'ἦ': 'ē', 'ἶ': 'i', 'ὖ': 'y', 'ὦ': 'ō',
  'ἇ': 'ha', 'ἧ': 'hē', 'ἷ': 'hi', 'ὗ': 'hy', 'ὧ': 'hō',
  'ᾳ': 'a', 'ῃ': 'ē', 'ῳ': 'ō',
  'ᾴ': 'a', 'ῄ': 'ē', 'ῴ': 'ō',
  'ᾲ': 'a', 'ῂ': 'ē', 'ῲ': 'ō',
  'ᾷ': 'a', 'ῇ': 'ē', 'ῷ': 'ō',
  'ᾀ': 'a', 'ᾐ': 'ē', 'ᾠ': 'ō',
  'ᾁ': 'ha', 'ᾑ': 'hē', 'ᾡ': 'hō',

  // Iota subscrito e outros
  'ϊ': 'i', 'ϋ': 'y', 'ΐ': 'i', 'ΰ': 'y',
  'ῤ': 'r', 'ῥ': 'rh',

  // Pontuação
  '·': ';', '῾': '', '᾿': '', '´': '', '`': '', '῀': '',
  ',': ',', '.': '.', ';': '?', '᾽': "'",
};

/**
 * Transliterar texto hebraico para latino
 */
function transliterateHebrew(text) {
  let result = '';
  const chars = [...text]; // Spread para lidar com caracteres Unicode corretamente

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    // Verificar combinações de dois caracteres primeiro
    if (i < chars.length - 1) {
      const combo = char + chars[i + 1];
      if (HEBREW_MAP[combo] !== undefined) {
        result += HEBREW_MAP[combo];
        i++;
        continue;
      }
    }

    if (HEBREW_MAP[char] !== undefined) {
      result += HEBREW_MAP[char];
    } else if (/[\u0590-\u05FF\uFB1D-\uFB4F]/.test(char)) {
      // Caractere hebraico não mapeado - tentar conversão básica
      result += char;
    } else {
      result += char;
    }
  }

  // Limpar resultado
  return result
    .replace(/'+/g, "'")     // Múltiplos apóstrofos
    .replace(/^'+|'+$/g, '') // Apóstrofos no início/fim
    .replace(/-+/g, '-')     // Múltiplos hífens
    .replace(/^-|-$/g, '')   // Hífens no início/fim
    .trim();
}

/**
 * Transliterar texto grego para latino
 */
function transliterateGreek(text) {
  let result = '';

  for (const char of text) {
    if (GREEK_MAP[char] !== undefined) {
      result += GREEK_MAP[char];
    } else if (/[\u0370-\u03FF\u1F00-\u1FFF]/.test(char)) {
      // Caractere grego não mapeado
      result += char;
    } else {
      result += char;
    }
  }

  return result.trim();
}

/**
 * Detectar idioma e transliterar
 */
function transliterate(text) {
  // Remover colchetes
  const inner = text.replace(/^\[|\]$/g, '').trim();

  // Verificar se é marcador especial (OBJ, etc)
  if (/^[A-Z]+$/.test(inner)) {
    return `[${inner}]`;
  }

  // Detectar hebraico
  if (/[\u0590-\u05FF\uFB1D-\uFB4F]/.test(inner)) {
    const translit = transliterateHebrew(inner);
    return translit || inner;
  }

  // Detectar grego
  if (/[\u0370-\u03FF\u1F00-\u1FFF]/.test(inner)) {
    const translit = transliterateGreek(inner);
    return translit || inner;
  }

  // Manter original se não for hebraico/grego
  return text;
}

/**
 * Processar uma linha de texto
 */
function processLine(line) {
  // Encontrar todos os [...] e substituir
  return line.replace(/\[[^\]]+\]/g, (match) => {
    return transliterate(match);
  });
}

/**
 * Processar um arquivo
 */
function processFile(filepath) {
  const content = readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  const processed = lines.map(processLine);
  writeFileSync(filepath, processed.join('\n'), 'utf8');
}

// Main
const exportDir = join(process.cwd(), 'Bible pt-br', 'txt');
const files = readdirSync(exportDir).filter(f => f.endsWith('.txt'));

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║       TRANSLITERADOR - BÍBLIA BELÉM An.C 2025                    ║');
console.log('║       Hebraico/Grego -> Caracteres Latinos                       ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
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
console.log(`✓ ${count} arquivos transliterados com sucesso!`);
console.log('═══════════════════════════════════════════════════════════════════');
