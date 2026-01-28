#!/usr/bin/env node
/**
 * Build script - Gera executável Windows
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler arquivos estáticos
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

// Criar versão bundled do servidor
const bundledServer = `
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const PORT = 3333;
const OLLAMA_URL = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

// Helper para requisições HTTP (substitui fetch que não funciona em pkg)
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 60000
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => JSON.parse(data),
          text: () => data
        });
      });
    });

    req.on('error', (err) => {
      console.log('HTTP Error:', err.message);
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// HTML embutido
const INDEX_HTML = ${JSON.stringify(indexHtml)};

// Detectar diretório do projeto
function getProjectRoot() {
  // Tentar encontrar o diretório do projeto
  const possiblePaths = [
    path.join(process.cwd(), '..'),
    path.join(__dirname, '..'),
    process.env.BIBLE_PROJECT_ROOT,
    'v:\\\\Projetos\\\\Ecossistema aculpaedasovelhas\\\\Bible Belem AnC 2025'
  ].filter(Boolean);

  for (const p of possiblePaths) {
    if (fs.existsSync(path.join(p, 'glossary', 'greek.json'))) {
      return p;
    }
  }

  return process.cwd();
}

const projectRoot = getProjectRoot();
console.log('Diretório do projeto:', projectRoot);

// Detectar Node.js do sistema (não o embutido no pkg)
function getSystemNode() {
  try {
    const result = execSync('where node', { encoding: 'utf-8' });
    const nodePath = result.trim().split('\\n')[0].split('\\r')[0];
    console.log('Node.js do sistema:', nodePath);
    return nodePath;
  } catch {
    console.log('Node.js nao encontrado, usando fallback');
    return 'node';
  }
}

const systemNode = getSystemNode();

// Tradução em andamento
let translationProcess = null;
let translationOutput = [];

// API Handlers
async function handleApi(req, res) {
  const url = new URL(req.url, \`http://localhost:\${PORT}\`);
  const endpoint = url.pathname.replace('/api/', '');

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    let result;

    switch (endpoint) {
      case 'status':
        result = await getStatus();
        break;

      case 'books':
        result = await getBooks();
        break;

      case 'translate-word':
        if (req.method === 'POST') {
          const body = await getBody(req);
          result = await translateWord(body.word, body.language);
        }
        break;

      case 'start-translation':
        if (req.method === 'POST') {
          const body = await getBody(req);
          result = startTranslation(body.bookCode, body.model);
        }
        break;

      case 'stop-translation':
        result = stopTranslation();
        break;

      case 'translation-output':
        result = { output: translationOutput.join(''), isRunning: translationProcess !== null };
        break;

      case 'start-ollama':
        result = startOllama();
        break;

      default:
        res.statusCode = 404;
        result = { error: 'Endpoint não encontrado' };
    }

    res.end(JSON.stringify(result));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
}

function getBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(JSON.parse(body || '{}')));
  });
}

async function getStatus() {
  const result = {
    ollama: { online: false, models: [], url: OLLAMA_URL },
    gpu: { available: false },
    glossary: { greek: 0, hebrew: 0, keep: 0 },
    db: { total: 0, translated: 0, percentage: 0 }
  };

  // Check Ollama
  try {
    const response = await httpRequest(\`\${OLLAMA_URL}/api/tags\`);
    if (response.ok) {
      const data = response.json();
      result.ollama.online = true;
      result.ollama.models = data.models || [];
    }
  } catch {}

  // Check GPU
  try {
    const gpuInfo = execSync('nvidia-smi --query-gpu=name,memory.total,memory.used,utilization.gpu --format=csv,noheader,nounits', { encoding: 'utf-8' });
    const parts = gpuInfo.trim().split(',').map(s => s.trim());
    result.gpu = {
      available: true,
      name: parts[0],
      memoryTotal: parseInt(parts[1]),
      memoryUsed: parseInt(parts[2]),
      utilization: parseInt(parts[3])
    };
  } catch {}

  // Load glossaries
  try {
    const greekPath = path.join(projectRoot, 'glossary', 'greek.json');
    const hebrewPath = path.join(projectRoot, 'glossary', 'hebrew.json');
    const keepPath = path.join(projectRoot, 'glossary', 'keep_original.json');

    if (fs.existsSync(greekPath)) {
      result.glossary.greek = Object.keys(JSON.parse(fs.readFileSync(greekPath, 'utf-8'))).length;
    }
    if (fs.existsSync(hebrewPath)) {
      result.glossary.hebrew = Object.keys(JSON.parse(fs.readFileSync(hebrewPath, 'utf-8'))).length;
    }
    if (fs.existsSync(keepPath)) {
      result.glossary.keep = JSON.parse(fs.readFileSync(keepPath, 'utf-8')).all_words?.length || 0;
    }
  } catch {}

  // DB stats
  try {
    const dbResult = execSync(
      'npx wrangler d1 execute biblia-belem --remote --command "SELECT COUNT(*) as total, SUM(CASE WHEN pt_literal IS NOT NULL AND pt_literal NOT LIKE \\'%[%\\' THEN 1 ELSE 0 END) as translated FROM tokens" --json',
      { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );
    const data = JSON.parse(dbResult)[0].results[0];
    result.db = {
      total: data.total,
      translated: data.translated,
      percentage: ((data.translated / data.total) * 100).toFixed(1)
    };
  } catch {}

  return result;
}

async function getBooks() {
  try {
    const result = execSync(
      'npx wrangler d1 execute biblia-belem --remote --command "SELECT b.code, b.name_pt, COUNT(t.id) as total_tokens, SUM(CASE WHEN t.pt_literal IS NOT NULL AND t.pt_literal NOT LIKE \\'%[%\\' THEN 1 ELSE 0 END) as translated_tokens FROM books b LEFT JOIN verses v ON v.book_id = b.id LEFT JOIN tokens t ON t.verse_id = v.id GROUP BY b.id ORDER BY b.id" --json',
      { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );
    return { success: true, books: JSON.parse(result)[0].results };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function translateWord(word, language) {
  const langName = language === 'greek' ? 'grego koiné' : 'hebraico bíblico';

  const prompt = \`Você é um tradutor especialista em \${langName} bíblico para português brasileiro.

REGRAS ESTRITAS:
1. Tradução LITERAL e RÍGIDA
2. Use hífens para palavras compostas (em-o, de-a)
3. Mantenha artigos separados
4. Responda APENAS com a tradução, sem explicações

Traduza literalmente: \${word}\`;

  try {
    const response = await httpRequest(\`\${OLLAMA_URL}/api/generate\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:14b',
        prompt,
        stream: false,
        options: { temperature: 0.1 }
      })
    });

    const data = response.json();
    return { success: true, translation: data.response.trim() };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function startTranslation(bookCode, model) {
  if (translationProcess) {
    return { success: false, error: 'Tradução já em andamento' };
  }

  translationOutput = [];
  const scriptPath = path.join(projectRoot, 'scripts', 'ollama-translate.mjs');
  const args = [scriptPath];

  if (bookCode && bookCode !== 'ALL') {
    args.push(bookCode);
  }
  if (model) {
    args.push(\`--model=\${model}\`);
  }

  translationProcess = spawn(systemNode, args, { cwd: projectRoot, shell: true });

  translationProcess.stdout.on('data', (data) => {
    translationOutput.push(data.toString());
    if (translationOutput.length > 1000) translationOutput.shift();
  });

  translationProcess.stderr.on('data', (data) => {
    translationOutput.push(data.toString());
  });

  translationProcess.on('close', () => {
    translationProcess = null;
  });

  return { success: true };
}

function stopTranslation() {
  if (translationProcess) {
    translationProcess.kill();
    translationProcess = null;
    return { success: true };
  }
  return { success: false, error: 'Nenhuma tradução em andamento' };
}

function startOllama() {
  try {
    spawn('ollama', ['serve'], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Server
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return;
  }

  if (req.url.startsWith('/api/')) {
    return handleApi(req, res);
  }

  // Servir HTML
  res.setHeader('Content-Type', 'text/html');
  res.end(INDEX_HTML);
});

// Abrir navegador automaticamente
function openBrowser(url) {
  const start = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  require('child_process').exec(\`\${start} \${url}\`);
}

server.listen(PORT, () => {
  console.log('');
  console.log('================================================================');
  console.log('       TRADUTOR BIBLIA BELEM - Interface Web                    ');
  console.log('================================================================');
  console.log('');
  console.log(\`   Servidor rodando em: http://localhost:\${PORT}\`);
  console.log('');
  console.log('   Abrindo navegador...');
  console.log('   Pressione Ctrl+C para encerrar.');
  console.log('');

  // Abrir navegador após 1 segundo
  setTimeout(() => openBrowser(\`http://localhost:\${PORT}\`), 1000);
});
`;

// Escrever arquivo bundled
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

fs.writeFileSync(path.join(distDir, 'server.cjs'), bundledServer);
console.log('✓ Arquivo bundled criado: dist/server.cjs');

// Criar package.json para pkg
const pkgConfig = {
  name: "biblia-tradutor",
  version: "1.0.0",
  bin: "server.cjs",
  pkg: {
    targets: ["node18-win-x64"],
    outputPath: ".",
    assets: []
  }
};

fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(pkgConfig, null, 2));
console.log('✓ package.json criado');

// Executar pkg
console.log('');
console.log('Gerando executável...');
try {
  execSync('npx pkg . --target node18-win-x64 --output BibliaTradutor.exe', {
    cwd: distDir,
    stdio: 'inherit'
  });
  console.log('');
  console.log('✓ Executável gerado: tradutor-web/dist/BibliaTradutor.exe');
} catch (e) {
  console.error('Erro ao gerar executável:', e.message);
}
