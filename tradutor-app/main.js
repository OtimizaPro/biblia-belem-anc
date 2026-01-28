const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');

let mainWindow;
let translationProcess = null;

// Paths
const projectRoot = path.join(__dirname, '..');
const glossaryPath = path.join(projectRoot, 'glossary');

// Configuração Ollama
const OLLAMA_URL = process.env.OLLAMA_HOST || 'http://localhost:11434';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    backgroundColor: '#1a1a2e'
  });

  mainWindow.loadFile('index.html');

  // Remover menu em produção
  if (app.isPackaged) {
    mainWindow.setMenu(null);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (translationProcess) {
    translationProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// IPC HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

// Verificar status do Ollama
ipcMain.handle('check-ollama', async () => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) throw new Error('Ollama não respondeu');
    const data = await response.json();
    return {
      success: true,
      models: data.models || [],
      url: OLLAMA_URL
    };
  } catch (e) {
    return {
      success: false,
      error: `Ollama não está rodando em ${OLLAMA_URL}`,
      url: OLLAMA_URL
    };
  }
});

// Verificar GPU
ipcMain.handle('check-gpu', async () => {
  try {
    const output = execSync('nvidia-smi --query-gpu=name,memory.total,memory.used,utilization.gpu --format=csv,noheader,nounits', {
      encoding: 'utf-8'
    });
    const parts = output.trim().split(',').map(s => s.trim());
    return {
      success: true,
      name: parts[0],
      memoryTotal: parseInt(parts[1]),
      memoryUsed: parseInt(parts[2]),
      utilization: parseInt(parts[3])
    };
  } catch (e) {
    return { success: false, error: 'GPU NVIDIA não detectada' };
  }
});

// Carregar glossários
ipcMain.handle('load-glossaries', async () => {
  try {
    const greekPath = path.join(glossaryPath, 'greek.json');
    const hebrewPath = path.join(glossaryPath, 'hebrew.json');
    const keepPath = path.join(glossaryPath, 'keep_original.json');

    const greek = fs.existsSync(greekPath) ? JSON.parse(fs.readFileSync(greekPath, 'utf-8')) : {};
    const hebrew = fs.existsSync(hebrewPath) ? JSON.parse(fs.readFileSync(hebrewPath, 'utf-8')) : {};
    const keep = fs.existsSync(keepPath) ? JSON.parse(fs.readFileSync(keepPath, 'utf-8')) : { all_words: [] };

    return {
      success: true,
      greek: Object.keys(greek).length,
      hebrew: Object.keys(hebrew).length,
      keepOriginal: keep.all_words?.length || 0
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// Buscar estatísticas do banco
ipcMain.handle('get-db-stats', async () => {
  try {
    const result = execSync(
      `npx wrangler d1 execute biblia-belem --remote --command "SELECT COUNT(*) as total, SUM(CASE WHEN pt_literal IS NOT NULL AND pt_literal NOT LIKE '%[%' THEN 1 ELSE 0 END) as translated FROM tokens" --json`,
      { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );
    const data = JSON.parse(result)[0].results[0];
    return {
      success: true,
      total: data.total,
      translated: data.translated,
      percentage: ((data.translated / data.total) * 100).toFixed(1)
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// Buscar livros
ipcMain.handle('get-books', async () => {
  try {
    const result = execSync(
      `npx wrangler d1 execute biblia-belem --remote --command "SELECT b.code, b.name_pt, COUNT(t.id) as total_tokens, SUM(CASE WHEN t.pt_literal IS NOT NULL AND t.pt_literal NOT LIKE '%[%' THEN 1 ELSE 0 END) as translated_tokens FROM books b LEFT JOIN verses v ON v.book_id = b.id LEFT JOIN tokens t ON t.verse_id = v.id GROUP BY b.id ORDER BY b.id" --json`,
      { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );
    const books = JSON.parse(result)[0].results;
    return { success: true, books };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// Traduzir palavra única
ipcMain.handle('translate-word', async (event, word, language) => {
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
});

// Iniciar tradução de livro
ipcMain.handle('start-translation', async (event, bookCode, model) => {
  if (translationProcess) {
    return { success: false, error: 'Tradução já em andamento' };
  }

  const scriptPath = path.join(projectRoot, 'scripts', 'ollama-translate.mjs');
  const args = [scriptPath];

  if (bookCode && bookCode !== 'ALL') {
    args.push(bookCode);
  }

  if (model) {
    args.push(`--model=${model}`);
  }

  translationProcess = spawn('node', args, {
    cwd: projectRoot,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  translationProcess.stdout.on('data', (data) => {
    mainWindow.webContents.send('translation-output', data.toString());
  });

  translationProcess.stderr.on('data', (data) => {
    mainWindow.webContents.send('translation-output', data.toString());
  });

  translationProcess.on('close', (code) => {
    mainWindow.webContents.send('translation-complete', code);
    translationProcess = null;
  });

  return { success: true };
});

// Parar tradução
ipcMain.handle('stop-translation', async () => {
  if (translationProcess) {
    translationProcess.kill();
    translationProcess = null;
    return { success: true };
  }
  return { success: false, error: 'Nenhuma tradução em andamento' };
});

// Iniciar Ollama
ipcMain.handle('start-ollama', async () => {
  try {
    spawn('ollama', ['serve'], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    }).unref();

    // Aguardar inicialização
    await new Promise(r => setTimeout(r, 3000));

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// Baixar modelo
ipcMain.handle('pull-model', async (event, model) => {
  try {
    const process = spawn('ollama', ['pull', model], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    process.stdout.on('data', (data) => {
      mainWindow.webContents.send('pull-progress', data.toString());
    });

    process.stderr.on('data', (data) => {
      mainWindow.webContents.send('pull-progress', data.toString());
    });

    return new Promise((resolve) => {
      process.on('close', (code) => {
        resolve({ success: code === 0 });
      });
    });
  } catch (e) {
    return { success: false, error: e.message };
  }
});
