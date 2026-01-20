import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bibleDir = path.join(__dirname, '..', 'Bible pt-br', 'txt');

let count = 0;
let totalReplacements = 0;

if (fs.existsSync(bibleDir)) {
  const files = fs.readdirSync(bibleDir).filter((f) => f.endsWith('.txt'));

  files.forEach((file) => {
    const filePath = path.join(bibleDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Substituir YHWH por yhwh
    content = content.replace(/YHWH/g, 'yhwh');

    // Contar replacements
    const replacements = (originalContent.match(/YHWH/g) || []).length;
    totalReplacements += replacements;

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✓ ${file} (${replacements} substituições)`);
      count++;
    }
  });

  console.log(
    `\n✅ Total: ${count} arquivos atualizados, ${totalReplacements} substituições de YHWH → yhwh`
  );
} else {
  console.error('❌ Diretório não encontrado:', bibleDir);
}
