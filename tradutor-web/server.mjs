#!/usr/bin/env node
/**
 * Servidor Web para o Tradutor Ollama
 * Interface web local para tradução bíblica
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const PORT = 3333;
const OLLAMA_URL = process.env.OLLAMA_HOST || 'http://localhost:11434';

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

// Tradução em andamento
let translationProcess = null;
let translationOutput = [];

// ═══════════════════════════════════════════════════════════════════════════════
// API Handlers
// ═══════════════════════════════════════════════════════════════════════════════

async function handleApi(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
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

// ═══════════════════════════════════════════════════════════════════════════════
// Status
// ═══════════════════════════════════════════════════════════════════════════════

async function getStatus() {
  const result = {
    ollama: { online: false, models: [], url: OLLAMA_URL },
    gpu: { available: false },
    glossary: { greek: 0, hebrew: 0, keep: 0 },
    db: { total: 0, translated: 0, percentage: 0 }
  };

  // Check Ollama
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (response.ok) {
      const data = await response.json();
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
      `npx wrangler d1 execute biblia-belem --remote --command "SELECT COUNT(*) as total, SUM(CASE WHEN pt_literal IS NOT NULL AND pt_literal NOT LIKE '%[%' THEN 1 ELSE 0 END) as translated FROM tokens" --json`,
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
      `npx wrangler d1 execute biblia-belem --remote --command "SELECT b.code, b.name_pt, COUNT(t.id) as total_tokens, SUM(CASE WHEN t.pt_literal IS NOT NULL AND t.pt_literal NOT LIKE '%[%' THEN 1 ELSE 0 END) as translated_tokens FROM books b LEFT JOIN verses v ON v.book_id = b.id LEFT JOIN tokens t ON t.verse_id = v.id GROUP BY b.id ORDER BY b.id" --json`,
      { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );
    return { success: true, books: JSON.parse(result)[0].results };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Translation
// ═══════════════════════════════════════════════════════════════════════════════

async function translateWord(word, language) {
  const langName = language === 'greek' ? 'grego koiné' : 'hebraico bíblico';

  const prompt = `Você é um tradutor especialista em ${langName} bíblico para português brasileiro.

REGRAS ESTRITAS:
1. Tradução LITERAL e RÍGIDA
2. Use hífens para palavras compostas (em-o, de-a)
3. Mantenha artigos separados
4. Responda APENAS com a tradução, sem explicações

Traduza literalmente: ${word}`;

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:14b',
        prompt,
        stream: false,
        options: { temperature: 0.1 }
      })
    });

    const data = await response.json();
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
    args.push(`--model=${model}`);
  }

  translationProcess = spawn('node', args, { cwd: projectRoot });

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

// ═══════════════════════════════════════════════════════════════════════════════
// Server
// ═══════════════════════════════════════════════════════════════════════════════

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return;
  }

  // API
  if (req.url.startsWith('/api/')) {
    return handleApi(req, res);
  }

  // Static files
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║       TRADUTOR BÍBLIA BELÉM - Interface Web                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`   Servidor rodando em: http://localhost:${PORT}`);
  console.log('');
  console.log('   Abra no navegador para usar a interface gráfica.');
  console.log('   Pressione Ctrl+C para encerrar.');
  console.log('');
});
