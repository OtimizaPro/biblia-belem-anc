
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
const INDEX_HTML = "<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Bíblia Tradutor - Ollama + CUDA</title>\n  <style>\n    :root {\n      --bg-primary: #0f0f1a;\n      --bg-secondary: #1a1a2e;\n      --bg-tertiary: #252542;\n      --bg-card: #1e1e35;\n      --text-primary: #ffffff;\n      --text-secondary: #a0a0b0;\n      --text-muted: #6a6a7a;\n      --accent-primary: #6366f1;\n      --accent-secondary: #818cf8;\n      --accent-success: #22c55e;\n      --accent-warning: #f59e0b;\n      --accent-danger: #ef4444;\n      --border-color: #2a2a4a;\n    }\n\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n\n    body {\n      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n      background: var(--bg-primary);\n      color: var(--text-primary);\n      min-height: 100vh;\n    }\n\n    .container {\n      max-width: 1400px;\n      margin: 0 auto;\n      padding: 2rem;\n    }\n\n    header {\n      display: flex;\n      justify-content: space-between;\n      align-items: center;\n      padding: 1.5rem 2rem;\n      background: var(--bg-secondary);\n      border-bottom: 1px solid var(--border-color);\n      margin-bottom: 2rem;\n    }\n\n    .logo {\n      display: flex;\n      align-items: center;\n      gap: 1rem;\n    }\n\n    .logo-icon { font-size: 2.5rem; }\n    .logo h1 { font-size: 1.5rem; }\n    .logo .subtitle { font-size: 0.85rem; color: var(--text-secondary); }\n\n    .status-badges {\n      display: flex;\n      gap: 1rem;\n    }\n\n    .badge {\n      display: flex;\n      align-items: center;\n      gap: 0.5rem;\n      padding: 0.5rem 1rem;\n      background: var(--bg-tertiary);\n      border-radius: 20px;\n      font-size: 0.85rem;\n    }\n\n    .badge .dot {\n      width: 8px;\n      height: 8px;\n      border-radius: 50%;\n      background: var(--text-muted);\n    }\n\n    .badge .dot.online { background: var(--accent-success); box-shadow: 0 0 8px var(--accent-success); }\n    .badge .dot.offline { background: var(--accent-danger); }\n\n    .tabs {\n      display: flex;\n      gap: 0.5rem;\n      margin-bottom: 2rem;\n      border-bottom: 1px solid var(--border-color);\n      padding-bottom: 1rem;\n    }\n\n    .tab-btn {\n      padding: 0.75rem 1.5rem;\n      background: transparent;\n      border: none;\n      border-radius: 8px;\n      color: var(--text-secondary);\n      font-size: 1rem;\n      cursor: pointer;\n      transition: all 0.2s;\n    }\n\n    .tab-btn:hover { background: var(--bg-tertiary); color: var(--text-primary); }\n    .tab-btn.active { background: var(--accent-primary); color: white; }\n\n    .tab-content { display: none; }\n    .tab-content.active { display: block; }\n\n    .stats-grid {\n      display: grid;\n      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n      gap: 1rem;\n      margin-bottom: 2rem;\n    }\n\n    .stat-card {\n      display: flex;\n      align-items: center;\n      gap: 1rem;\n      padding: 1.5rem;\n      background: var(--bg-card);\n      border-radius: 12px;\n      border: 1px solid var(--border-color);\n    }\n\n    .stat-card .icon { font-size: 2rem; }\n    .stat-card .value { font-size: 1.75rem; font-weight: 700; }\n    .stat-card .label { font-size: 0.85rem; color: var(--text-secondary); }\n\n    .section {\n      background: var(--bg-card);\n      border-radius: 12px;\n      border: 1px solid var(--border-color);\n      padding: 1.5rem;\n      margin-bottom: 1.5rem;\n    }\n\n    .section h3 {\n      margin-bottom: 1rem;\n      color: var(--text-secondary);\n      font-size: 1rem;\n    }\n\n    .controls {\n      display: flex;\n      gap: 1rem;\n      align-items: flex-end;\n      flex-wrap: wrap;\n    }\n\n    .control-group {\n      display: flex;\n      flex-direction: column;\n      gap: 0.5rem;\n    }\n\n    .control-group label {\n      font-size: 0.85rem;\n      color: var(--text-secondary);\n    }\n\n    select, input[type=\"text\"] {\n      padding: 0.75rem 1rem;\n      background: var(--bg-tertiary);\n      border: 1px solid var(--border-color);\n      border-radius: 8px;\n      color: var(--text-primary);\n      font-size: 1rem;\n      min-width: 200px;\n    }\n\n    select:focus, input:focus {\n      outline: none;\n      border-color: var(--accent-primary);\n    }\n\n    .btn {\n      padding: 0.75rem 1.5rem;\n      border: none;\n      border-radius: 8px;\n      font-size: 1rem;\n      font-weight: 500;\n      cursor: pointer;\n      transition: all 0.2s;\n      display: inline-flex;\n      align-items: center;\n      gap: 0.5rem;\n    }\n\n    .btn:disabled { opacity: 0.5; cursor: not-allowed; }\n    .btn-primary { background: var(--accent-primary); color: white; }\n    .btn-primary:hover:not(:disabled) { background: var(--accent-secondary); }\n    .btn-danger { background: var(--accent-danger); color: white; }\n    .btn-secondary { background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); }\n\n    .console {\n      height: 300px;\n      padding: 1rem;\n      background: #0a0a12;\n      border-radius: 8px;\n      font-family: 'Consolas', monospace;\n      font-size: 0.85rem;\n      color: #22c55e;\n      overflow-y: auto;\n      white-space: pre-wrap;\n      word-break: break-all;\n    }\n\n    .books-grid {\n      display: grid;\n      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));\n      gap: 0.75rem;\n      max-height: 300px;\n      overflow-y: auto;\n    }\n\n    .book-item {\n      padding: 0.75rem;\n      background: var(--bg-tertiary);\n      border-radius: 8px;\n      text-align: center;\n    }\n\n    .book-name {\n      font-size: 0.85rem;\n      margin-bottom: 0.5rem;\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n\n    .progress-bar {\n      height: 4px;\n      background: var(--bg-secondary);\n      border-radius: 2px;\n      overflow: hidden;\n    }\n\n    .progress-bar .fill {\n      height: 100%;\n      background: var(--accent-success);\n      transition: width 0.3s;\n    }\n\n    .book-percentage {\n      font-size: 0.75rem;\n      color: var(--text-muted);\n      margin-top: 0.25rem;\n    }\n\n    .quick-translate {\n      display: flex;\n      gap: 1rem;\n      align-items: flex-end;\n      flex-wrap: wrap;\n    }\n\n    .quick-translate input {\n      min-width: 300px;\n      font-size: 1.2rem;\n    }\n\n    .radio-group {\n      display: flex;\n      gap: 1.5rem;\n    }\n\n    .radio-label {\n      display: flex;\n      align-items: center;\n      gap: 0.5rem;\n      cursor: pointer;\n      color: var(--text-secondary);\n    }\n\n    .result-box {\n      min-height: 150px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      text-align: center;\n    }\n\n    .result-original { font-size: 2rem; color: var(--text-secondary); margin-bottom: 0.5rem; }\n    .result-arrow { font-size: 1.5rem; color: var(--text-muted); margin: 0.5rem 0; }\n    .result-translation { font-size: 2.5rem; font-weight: 700; color: var(--accent-secondary); }\n    .result-placeholder { color: var(--text-muted); }\n\n    .examples {\n      display: flex;\n      flex-wrap: wrap;\n      gap: 0.75rem;\n      margin-top: 1rem;\n    }\n\n    .example-btn {\n      padding: 0.5rem 1rem;\n      background: var(--bg-tertiary);\n      border: 1px solid var(--border-color);\n      border-radius: 6px;\n      color: var(--text-secondary);\n      cursor: pointer;\n      transition: all 0.2s;\n    }\n\n    .example-btn:hover {\n      background: var(--accent-primary);\n      color: white;\n      border-color: var(--accent-primary);\n    }\n\n    .loading { animation: pulse 1.5s infinite; }\n    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }\n\n    .glossary-info {\n      display: flex;\n      gap: 2rem;\n      flex-wrap: wrap;\n    }\n\n    .glossary-item {\n      display: flex;\n      align-items: center;\n      gap: 0.5rem;\n    }\n\n    .glossary-count {\n      font-weight: 600;\n      color: var(--accent-secondary);\n    }\n\n    ::-webkit-scrollbar { width: 8px; }\n    ::-webkit-scrollbar-track { background: var(--bg-secondary); }\n    ::-webkit-scrollbar-thumb { background: var(--bg-tertiary); border-radius: 4px; }\n    ::-webkit-scrollbar-thumb:hover { background: var(--accent-primary); }\n  </style>\n</head>\n<body>\n  <header>\n    <div class=\"logo\">\n      <span class=\"logo-icon\">📜</span>\n      <div>\n        <h1>Bíblia Belém An.C 2025</h1>\n        <span class=\"subtitle\">Tradutor Local Ollama + CUDA</span>\n      </div>\n    </div>\n    <div class=\"status-badges\">\n      <div class=\"badge\">\n        <span class=\"dot\" id=\"ollama-dot\"></span>\n        <span>Ollama</span>\n      </div>\n      <div class=\"badge\">\n        <span class=\"dot\" id=\"gpu-dot\"></span>\n        <span id=\"gpu-name\">GPU</span>\n      </div>\n    </div>\n  </header>\n\n  <div class=\"container\">\n    <div class=\"tabs\">\n      <button class=\"tab-btn active\" data-tab=\"dashboard\">📊 Dashboard</button>\n      <button class=\"tab-btn\" data-tab=\"translate\">🔄 Traduzir</button>\n      <button class=\"tab-btn\" data-tab=\"quick\">⚡ Tradução Rápida</button>\n    </div>\n\n    <!-- Dashboard -->\n    <div class=\"tab-content active\" id=\"tab-dashboard\">\n      <div class=\"stats-grid\">\n        <div class=\"stat-card\">\n          <span class=\"icon\">📚</span>\n          <div>\n            <div class=\"value\" id=\"stat-total\">-</div>\n            <div class=\"label\">Tokens Totais</div>\n          </div>\n        </div>\n        <div class=\"stat-card\">\n          <span class=\"icon\">✅</span>\n          <div>\n            <div class=\"value\" id=\"stat-translated\">-</div>\n            <div class=\"label\">Traduzidos</div>\n          </div>\n        </div>\n        <div class=\"stat-card\">\n          <span class=\"icon\">📈</span>\n          <div>\n            <div class=\"value\" id=\"stat-percentage\">-</div>\n            <div class=\"label\">Progresso</div>\n          </div>\n        </div>\n        <div class=\"stat-card\">\n          <span class=\"icon\">🎮</span>\n          <div>\n            <div class=\"value\" id=\"stat-gpu\">-</div>\n            <div class=\"label\">VRAM</div>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"section\">\n        <h3>Glossários Carregados</h3>\n        <div class=\"glossary-info\">\n          <div class=\"glossary-item\">\n            <span>🇬🇷 Grego:</span>\n            <span class=\"glossary-count\" id=\"glossary-greek\">-</span>\n          </div>\n          <div class=\"glossary-item\">\n            <span>🇮🇱 Hebraico:</span>\n            <span class=\"glossary-count\" id=\"glossary-hebrew\">-</span>\n          </div>\n          <div class=\"glossary-item\">\n            <span>🔒 Manter Original:</span>\n            <span class=\"glossary-count\" id=\"glossary-keep\">-</span>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"section\">\n        <h3>Modelos Disponíveis</h3>\n        <div id=\"models-list\">Carregando...</div>\n      </div>\n    </div>\n\n    <!-- Traduzir -->\n    <div class=\"tab-content\" id=\"tab-translate\">\n      <div class=\"section\">\n        <h3>Configuração</h3>\n        <div class=\"controls\">\n          <div class=\"control-group\">\n            <label>Livro</label>\n            <select id=\"book-select\">\n              <option value=\"ALL\">Todos os Livros</option>\n            </select>\n          </div>\n          <div class=\"control-group\">\n            <label>Modelo</label>\n            <select id=\"model-select\">\n              <option value=\"qwen2.5:14b\">qwen2.5:14b (Recomendado)</option>\n              <option value=\"llama3.2:8b\">llama3.2:8b (Rápido)</option>\n              <option value=\"mistral:7b\">mistral:7b (Leve)</option>\n            </select>\n          </div>\n          <button class=\"btn btn-primary\" id=\"btn-start\">▶️ Iniciar</button>\n          <button class=\"btn btn-danger\" id=\"btn-stop\" disabled>⏹️ Parar</button>\n        </div>\n      </div>\n\n      <div class=\"section\">\n        <h3>Progresso por Livro</h3>\n        <div class=\"books-grid\" id=\"books-grid\">Carregando...</div>\n      </div>\n\n      <div class=\"section\">\n        <h3>Log de Tradução</h3>\n        <div class=\"console\" id=\"console\">O log aparecerá aqui...</div>\n      </div>\n    </div>\n\n    <!-- Tradução Rápida -->\n    <div class=\"tab-content\" id=\"tab-quick\">\n      <div class=\"section\">\n        <div class=\"quick-translate\">\n          <div class=\"control-group\">\n            <label>Palavra Original</label>\n            <input type=\"text\" id=\"quick-word\" placeholder=\"Digite em grego ou hebraico...\">\n          </div>\n          <div class=\"control-group\">\n            <label>Idioma</label>\n            <div class=\"radio-group\">\n              <label class=\"radio-label\">\n                <input type=\"radio\" name=\"language\" value=\"greek\" checked>\n                <span>🇬🇷 Grego</span>\n              </label>\n              <label class=\"radio-label\">\n                <input type=\"radio\" name=\"language\" value=\"hebrew\">\n                <span>🇮🇱 Hebraico</span>\n              </label>\n            </div>\n          </div>\n          <button class=\"btn btn-primary\" id=\"btn-quick\">🔄 Traduzir</button>\n        </div>\n        <div class=\"examples\">\n          <button class=\"example-btn\" data-word=\"λόγος\" data-lang=\"greek\">λόγος</button>\n          <button class=\"example-btn\" data-word=\"ἀγάπη\" data-lang=\"greek\">ἀγάπη</button>\n          <button class=\"example-btn\" data-word=\"πίστις\" data-lang=\"greek\">πίστις</button>\n          <button class=\"example-btn\" data-word=\"χάρις\" data-lang=\"greek\">χάρις</button>\n          <button class=\"example-btn\" data-word=\"דָּבָר\" data-lang=\"hebrew\">דָּבָר</button>\n          <button class=\"example-btn\" data-word=\"שָׁלוֹם\" data-lang=\"hebrew\">שָׁלוֹם</button>\n        </div>\n      </div>\n\n      <div class=\"section\">\n        <div class=\"result-box\" id=\"result-box\">\n          <div class=\"result-placeholder\">Digite uma palavra e clique em \"Traduzir\"</div>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <script>\n    const API = '/api';\n    let pollInterval = null;\n\n    // ═══════════════════════════════════════════════════════════════════\n    // Inicialização\n    // ═══════════════════════════════════════════════════════════════════\n\n    document.addEventListener('DOMContentLoaded', async () => {\n      setupTabs();\n      setupEvents();\n      await loadStatus();\n      await loadBooks();\n    });\n\n    function setupTabs() {\n      document.querySelectorAll('.tab-btn').forEach(btn => {\n        btn.addEventListener('click', () => {\n          document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));\n          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));\n          btn.classList.add('active');\n          document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');\n        });\n      });\n    }\n\n    function setupEvents() {\n      document.getElementById('btn-start').addEventListener('click', startTranslation);\n      document.getElementById('btn-stop').addEventListener('click', stopTranslation);\n      document.getElementById('btn-quick').addEventListener('click', quickTranslate);\n      document.getElementById('quick-word').addEventListener('keypress', e => {\n        if (e.key === 'Enter') quickTranslate();\n      });\n\n      document.querySelectorAll('.example-btn').forEach(btn => {\n        btn.addEventListener('click', () => {\n          document.getElementById('quick-word').value = btn.dataset.word;\n          document.querySelector(`input[name=\"language\"][value=\"${btn.dataset.lang}\"]`).checked = true;\n          quickTranslate();\n        });\n      });\n    }\n\n    // ═══════════════════════════════════════════════════════════════════\n    // Status\n    // ═══════════════════════════════════════════════════════════════════\n\n    async function loadStatus() {\n      try {\n        const res = await fetch(`${API}/status`);\n        const data = await res.json();\n\n        // Ollama\n        const ollamaDot = document.getElementById('ollama-dot');\n        ollamaDot.classList.toggle('online', data.ollama.online);\n        ollamaDot.classList.toggle('offline', !data.ollama.online);\n\n        // GPU\n        const gpuDot = document.getElementById('gpu-dot');\n        gpuDot.classList.toggle('online', data.gpu.available);\n        gpuDot.classList.toggle('offline', !data.gpu.available);\n\n        if (data.gpu.available) {\n          document.getElementById('gpu-name').textContent = data.gpu.name.split(' ').pop();\n          document.getElementById('stat-gpu').textContent = `${((data.gpu.memoryTotal - data.gpu.memoryUsed) / 1024).toFixed(1)} GB`;\n        }\n\n        // Stats\n        document.getElementById('stat-total').textContent = data.db.total.toLocaleString();\n        document.getElementById('stat-translated').textContent = data.db.translated.toLocaleString();\n        document.getElementById('stat-percentage').textContent = data.db.percentage + '%';\n\n        // Glossaries\n        document.getElementById('glossary-greek').textContent = data.glossary.greek.toLocaleString() + ' entradas';\n        document.getElementById('glossary-hebrew').textContent = data.glossary.hebrew.toLocaleString() + ' entradas';\n        document.getElementById('glossary-keep').textContent = data.glossary.keep.toLocaleString() + ' palavras';\n\n        // Models\n        if (data.ollama.models.length > 0) {\n          document.getElementById('models-list').innerHTML = data.ollama.models.map(m =>\n            `<span style=\"margin-right: 1rem; padding: 0.25rem 0.5rem; background: var(--bg-tertiary); border-radius: 4px;\">${m.name}</span>`\n          ).join('');\n        } else {\n          document.getElementById('models-list').textContent = 'Nenhum modelo instalado';\n        }\n\n      } catch (e) {\n        console.error('Erro ao carregar status:', e);\n      }\n    }\n\n    async function loadBooks() {\n      try {\n        const res = await fetch(`${API}/books`);\n        const data = await res.json();\n\n        if (data.success) {\n          // Select\n          const select = document.getElementById('book-select');\n          select.innerHTML = '<option value=\"ALL\">Todos os Livros</option>';\n          data.books.forEach(book => {\n            const pct = book.total_tokens > 0 ? ((book.translated_tokens / book.total_tokens) * 100).toFixed(0) : 0;\n            select.innerHTML += `<option value=\"${book.code}\">${book.name_pt} (${pct}%)</option>`;\n          });\n\n          // Grid\n          document.getElementById('books-grid').innerHTML = data.books.map(book => {\n            const pct = book.total_tokens > 0 ? ((book.translated_tokens / book.total_tokens) * 100).toFixed(0) : 0;\n            return `\n              <div class=\"book-item\">\n                <div class=\"book-name\" title=\"${book.name_pt}\">${book.name_pt}</div>\n                <div class=\"progress-bar\"><div class=\"fill\" style=\"width: ${pct}%\"></div></div>\n                <div class=\"book-percentage\">${pct}%</div>\n              </div>\n            `;\n          }).join('');\n        }\n      } catch (e) {\n        console.error('Erro ao carregar livros:', e);\n      }\n    }\n\n    // ═══════════════════════════════════════════════════════════════════\n    // Tradução em Lote\n    // ═══════════════════════════════════════════════════════════════════\n\n    async function startTranslation() {\n      const bookCode = document.getElementById('book-select').value;\n      const model = document.getElementById('model-select').value;\n      const console = document.getElementById('console');\n\n      console.textContent = 'Iniciando tradução...\\n';\n\n      document.getElementById('btn-start').disabled = true;\n      document.getElementById('btn-stop').disabled = false;\n\n      await fetch(`${API}/start-translation`, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ bookCode, model })\n      });\n\n      // Poll output\n      pollInterval = setInterval(async () => {\n        const res = await fetch(`${API}/translation-output`);\n        const data = await res.json();\n        console.textContent = data.output || 'Aguardando output...';\n        console.scrollTop = console.scrollHeight;\n\n        if (!data.isRunning) {\n          clearInterval(pollInterval);\n          document.getElementById('btn-start').disabled = false;\n          document.getElementById('btn-stop').disabled = true;\n          loadStatus();\n          loadBooks();\n        }\n      }, 1000);\n    }\n\n    async function stopTranslation() {\n      await fetch(`${API}/stop-translation`, { method: 'POST' });\n      clearInterval(pollInterval);\n      document.getElementById('btn-start').disabled = false;\n      document.getElementById('btn-stop').disabled = true;\n    }\n\n    // ═══════════════════════════════════════════════════════════════════\n    // Tradução Rápida\n    // ═══════════════════════════════════════════════════════════════════\n\n    async function quickTranslate() {\n      const word = document.getElementById('quick-word').value.trim();\n      const language = document.querySelector('input[name=\"language\"]:checked').value;\n      const resultBox = document.getElementById('result-box');\n\n      if (!word) {\n        resultBox.innerHTML = '<div class=\"result-placeholder\">Digite uma palavra</div>';\n        return;\n      }\n\n      resultBox.innerHTML = '<div class=\"result-placeholder loading\">Traduzindo...</div>';\n\n      try {\n        const res = await fetch(`${API}/translate-word`, {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ word, language })\n        });\n        const data = await res.json();\n\n        if (data.success) {\n          resultBox.innerHTML = `\n            <div>\n              <div class=\"result-original\">${word}</div>\n              <div class=\"result-arrow\">↓</div>\n              <div class=\"result-translation\">${data.translation}</div>\n            </div>\n          `;\n        } else {\n          resultBox.innerHTML = `<div class=\"result-placeholder\" style=\"color: var(--accent-danger);\">Erro: ${data.error}</div>`;\n        }\n      } catch (e) {\n        resultBox.innerHTML = `<div class=\"result-placeholder\" style=\"color: var(--accent-danger);\">Erro de conexão</div>`;\n      }\n    }\n  </script>\n</body>\n</html>\n";

// Detectar diretório do projeto
function getProjectRoot() {
  // Tentar encontrar o diretório do projeto
  const possiblePaths = [
    path.join(process.cwd(), '..'),
    path.join(__dirname, '..'),
    process.env.BIBLE_PROJECT_ROOT,
    'v:\\Projetos\\Ecossistema aculpaedasovelhas\\Bible Belem AnC 2025'
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
    const nodePath = result.trim().split('\n')[0].split('\r')[0];
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

async function getStatus() {
  const result = {
    ollama: { online: false, models: [], url: OLLAMA_URL },
    gpu: { available: false },
    glossary: { greek: 0, hebrew: 0, keep: 0 },
    db: { total: 0, translated: 0, percentage: 0 }
  };

  // Check Ollama
  try {
    const response = await httpRequest(`${OLLAMA_URL}/api/tags`);
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
      'npx wrangler d1 execute biblia-belem --remote --command "SELECT COUNT(*) as total, SUM(CASE WHEN pt_literal IS NOT NULL AND pt_literal NOT LIKE \'%[%\' THEN 1 ELSE 0 END) as translated FROM tokens" --json',
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
      'npx wrangler d1 execute biblia-belem --remote --command "SELECT b.code, b.name_pt, COUNT(t.id) as total_tokens, SUM(CASE WHEN t.pt_literal IS NOT NULL AND t.pt_literal NOT LIKE \'%[%\' THEN 1 ELSE 0 END) as translated_tokens FROM books b LEFT JOIN verses v ON v.book_id = b.id LEFT JOIN tokens t ON t.verse_id = v.id GROUP BY b.id ORDER BY b.id" --json',
      { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );
    return { success: true, books: JSON.parse(result)[0].results };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

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
    const response = await httpRequest(`${OLLAMA_URL}/api/generate`, {
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
    args.push(`--model=${model}`);
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
  require('child_process').exec(`${start} ${url}`);
}

server.listen(PORT, () => {
  console.log('');
  console.log('================================================================');
  console.log('       TRADUTOR BIBLIA BELEM - Interface Web                    ');
  console.log('================================================================');
  console.log('');
  console.log(`   Servidor rodando em: http://localhost:${PORT}`);
  console.log('');
  console.log('   Abrindo navegador...');
  console.log('   Pressione Ctrl+C para encerrar.');
  console.log('');

  // Abrir navegador após 1 segundo
  setTimeout(() => openBrowser(`http://localhost:${PORT}`), 1000);
});
