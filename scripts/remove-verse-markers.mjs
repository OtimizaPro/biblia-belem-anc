import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bibleDir = path.join(__dirname, '..', 'Bible pt-br', 'txt');

/**
 * Remove marcadores de versículos (números no início das linhas)
 * Mantém os capítulos
 * 
 * Motivo: Os livros originais não possuíam versículos - esta foi uma construção posterior
 * Literalidade rígida: Volta à estrutura original baseada em capítulos
 */

let filesProcessed = 0;
let versesRemoved = 0;

if (fs.existsSync(bibleDir)) {
  const files = fs.readdirSync(bibleDir).filter(f => f.endsWith('.txt'));
  
  files.forEach(file => {
    const filePath = path.join(bibleDir, file);
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    
    const processedLines = lines.map(line => {
      // Se a linha começa com um número seguido de espaço ou múltiplos espaços
      // e não é um marcador de capítulo (── Capítulo X ──)
      if (/^\d+\s+/.test(line) && !line.includes('Capítulo')) {
        versesRemoved++;
        // Remove o número e espaços iniciais, mantém o conteúdo
        return line.replace(/^\d+\s+/, '');
      }
      return line;
    });
    
    fs.writeFileSync(filePath, processedLines.join('\n'), 'utf-8');
    console.log(`✓ ${file}`);
    filesProcessed++;
  });
  
  console.log(`\n✅ Processamento completo:`);
  console.log(`   - Arquivos atualizados: ${filesProcessed}`);
  console.log(`   - Marcadores de versículos removidos: ${versesRemoved}`);
  console.log(`\n📌 Estrutura mantida: Capítulos (── Capítulo X ──)`);
  console.log(`📌 Motivo: Os livros originais não possuíam versículos`);
} else {
  console.error('❌ Diretório não encontrado:', bibleDir);
}
