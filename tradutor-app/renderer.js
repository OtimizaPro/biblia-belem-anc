// ═══════════════════════════════════════════════════════════════════════════════
// Bíblia Tradutor - Renderer Process
// ═══════════════════════════════════════════════════════════════════════════════

// Estado da aplicação
const state = {
  ollamaOnline: false,
  gpuAvailable: false,
  isTranslating: false,
  books: [],
  models: []
};

// ═══════════════════════════════════════════════════════════════════════════════
// Inicialização
// ═══════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupEventListeners();
  await initializeApp();
});

async function initializeApp() {
  updateFooterStatus('Inicializando...');

  // Verificar status em paralelo
  await Promise.all([
    checkOllamaStatus(),
    checkGpuStatus(),
    loadGlossaries(),
    loadDbStats(),
    loadBooks()
  ]);

  updateFooterStatus('Pronto');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Navegação
// ═══════════════════════════════════════════════════════════════════════════════

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;

      // Atualizar navegação
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Atualizar conteúdo
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`tab-${tab}`).classList.add('active');
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Event Listeners
// ═══════════════════════════════════════════════════════════════════════════════

function setupEventListeners() {
  // Botões de tradução
  document.getElementById('btn-start').addEventListener('click', startTranslation);
  document.getElementById('btn-stop').addEventListener('click', stopTranslation);

  // Tradução rápida
  document.getElementById('btn-quick-translate').addEventListener('click', quickTranslate);
  document.getElementById('quick-word').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') quickTranslate();
  });

  // Exemplos de tradução
  document.querySelectorAll('.example-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('quick-word').value = btn.dataset.word;
      document.querySelector(`input[name="language"][value="${btn.dataset.lang}"]`).checked = true;
      quickTranslate();
    });
  });

  // Configurações
  document.getElementById('btn-start-ollama').addEventListener('click', startOllama);
  document.getElementById('btn-pull-model').addEventListener('click', pullModel);

  // Eventos do processo principal
  window.api.onTranslationOutput(handleTranslationOutput);
  window.api.onTranslationComplete(handleTranslationComplete);
  window.api.onPullProgress(handlePullProgress);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Status Checks
// ═══════════════════════════════════════════════════════════════════════════════

async function checkOllamaStatus() {
  const result = await window.api.checkOllama();
  const statusDot = document.querySelector('#ollama-status .status-dot');
  const statusText = document.getElementById('ollama-status-text');
  const urlText = document.getElementById('ollama-url');

  state.ollamaOnline = result.success;

  if (result.success) {
    statusDot.classList.add('online');
    statusDot.classList.remove('offline');
    statusText.textContent = 'Online';
    urlText.textContent = result.url;

    // Atualizar lista de modelos
    state.models = result.models;
    updateModelsList(result.models);
    updateModelSelect(result.models);
  } else {
    statusDot.classList.add('offline');
    statusDot.classList.remove('online');
    statusText.textContent = 'Offline';
  }

  return result;
}

async function checkGpuStatus() {
  const result = await window.api.checkGpu();
  const statusDot = document.querySelector('#gpu-status .status-dot');
  const gpuInfo = document.getElementById('gpu-info');
  const statGpu = document.getElementById('stat-gpu');

  state.gpuAvailable = result.success;

  if (result.success) {
    statusDot.classList.add('online');
    statusDot.classList.remove('offline');
    statGpu.textContent = result.name.split(' ').pop(); // Ex: "RTX 5060"

    gpuInfo.innerHTML = `
      <p><strong>GPU:</strong> ${result.name}</p>
      <p><strong>VRAM:</strong> ${result.memoryUsed}MB / ${result.memoryTotal}MB</p>
      <p><strong>Utilização:</strong> ${result.utilization}%</p>
    `;

    // Atualizar system info
    document.getElementById('system-info').innerHTML = `
      <p><strong>GPU:</strong> ${result.name}</p>
      <p><strong>VRAM Total:</strong> ${(result.memoryTotal / 1024).toFixed(1)} GB</p>
      <p><strong>VRAM Disponível:</strong> ${((result.memoryTotal - result.memoryUsed) / 1024).toFixed(1)} GB</p>
      <p><strong>Ollama:</strong> ${state.ollamaOnline ? 'Online' : 'Offline'}</p>
    `;
  } else {
    statusDot.classList.add('offline');
    statusDot.classList.remove('online');
    statGpu.textContent = 'N/A';
    gpuInfo.innerHTML = `<p style="color: var(--accent-danger);">${result.error}</p>`;
  }
}

async function loadGlossaries() {
  const result = await window.api.loadGlossaries();

  if (result.success) {
    document.getElementById('glossary-greek').textContent = result.greek.toLocaleString() + ' entradas';
    document.getElementById('glossary-hebrew').textContent = result.hebrew.toLocaleString() + ' entradas';
    document.getElementById('glossary-keep').textContent = result.keepOriginal.toLocaleString() + ' palavras';
  }
}

async function loadDbStats() {
  const result = await window.api.getDbStats();

  if (result.success) {
    document.getElementById('stat-total').textContent = result.total.toLocaleString();
    document.getElementById('stat-translated').textContent = result.translated.toLocaleString();
    document.getElementById('stat-percentage').textContent = result.percentage + '%';
  }
}

async function loadBooks() {
  const result = await window.api.getBooks();

  if (result.success) {
    state.books = result.books;
    updateBooksGrid(result.books);
    updateBookSelect(result.books);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI Updates
// ═══════════════════════════════════════════════════════════════════════════════

function updateModelsList(models) {
  const container = document.getElementById('models-list');

  if (models.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted);">Nenhum modelo instalado</p>';
    return;
  }

  container.innerHTML = models.map(m => `
    <div class="model-item">
      <span class="model-name">${m.name}</span>
      <span class="model-size">${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
    </div>
  `).join('');
}

function updateModelSelect(models) {
  const select = document.getElementById('model-select');
  const modelNames = models.map(m => m.name);

  // Manter opções existentes, marcar disponíveis
  Array.from(select.options).forEach(option => {
    const isAvailable = modelNames.some(n => n.startsWith(option.value.split(':')[0]));
    option.textContent = option.value + (isAvailable ? '' : ' (não instalado)');
  });
}

function updateBookSelect(books) {
  const select = document.getElementById('book-select');

  // Manter "Todos"
  select.innerHTML = '<option value="ALL">Todos os Livros</option>';

  books.forEach(book => {
    const percentage = book.total_tokens > 0
      ? ((book.translated_tokens / book.total_tokens) * 100).toFixed(0)
      : 0;
    const option = document.createElement('option');
    option.value = book.code;
    option.textContent = `${book.name_pt} (${percentage}%)`;
    select.appendChild(option);
  });
}

function updateBooksGrid(books) {
  const grid = document.getElementById('books-grid');

  grid.innerHTML = books.map(book => {
    const percentage = book.total_tokens > 0
      ? ((book.translated_tokens / book.total_tokens) * 100).toFixed(0)
      : 0;

    return `
      <div class="book-item">
        <div class="book-name" title="${book.name_pt}">${book.name_pt}</div>
        <div class="book-progress">
          <div class="book-progress-bar" style="width: ${percentage}%"></div>
        </div>
        <div class="book-percentage">${percentage}%</div>
      </div>
    `;
  }).join('');
}

function updateFooterStatus(text) {
  document.getElementById('footer-status').textContent = text;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Translation
// ═══════════════════════════════════════════════════════════════════════════════

async function startTranslation() {
  if (state.isTranslating) return;

  const bookCode = document.getElementById('book-select').value;
  const model = document.getElementById('model-select').value;

  // Limpar console
  const console = document.getElementById('output-console');
  console.innerHTML = '';

  // Atualizar UI
  state.isTranslating = true;
  document.getElementById('btn-start').disabled = true;
  document.getElementById('btn-stop').disabled = false;
  updateFooterStatus('Traduzindo...');

  // Iniciar tradução
  const result = await window.api.startTranslation(bookCode, model);

  if (!result.success) {
    appendOutput(`Erro: ${result.error}\n`);
    resetTranslationUI();
  }
}

async function stopTranslation() {
  const result = await window.api.stopTranslation();

  if (result.success) {
    appendOutput('\n\n⏹️ Tradução interrompida pelo usuário\n');
  }

  resetTranslationUI();
}

function handleTranslationOutput(data) {
  appendOutput(data);
}

function handleTranslationComplete(code) {
  appendOutput(`\n\n✅ Tradução finalizada (código: ${code})\n`);
  resetTranslationUI();

  // Recarregar estatísticas
  loadDbStats();
  loadBooks();
}

function appendOutput(text) {
  const console = document.getElementById('output-console');

  // Remover placeholder se existir
  const placeholder = console.querySelector('.output-placeholder');
  if (placeholder) placeholder.remove();

  console.textContent += text;
  console.scrollTop = console.scrollHeight;
}

function resetTranslationUI() {
  state.isTranslating = false;
  document.getElementById('btn-start').disabled = false;
  document.getElementById('btn-stop').disabled = true;
  updateFooterStatus('Pronto');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Quick Translation
// ═══════════════════════════════════════════════════════════════════════════════

async function quickTranslate() {
  const word = document.getElementById('quick-word').value.trim();
  const language = document.querySelector('input[name="language"]:checked').value;
  const resultDiv = document.getElementById('quick-result');

  if (!word) {
    resultDiv.innerHTML = '<div class="result-placeholder"><p>Digite uma palavra</p></div>';
    return;
  }

  if (!state.ollamaOnline) {
    resultDiv.innerHTML = '<div class="result-placeholder"><p style="color: var(--accent-danger);">Ollama não está rodando</p></div>';
    return;
  }

  // Loading
  resultDiv.innerHTML = '<div class="result-placeholder loading"><p>Traduzindo...</p></div>';
  updateFooterStatus('Traduzindo...');

  const result = await window.api.translateWord(word, language);

  if (result.success) {
    resultDiv.innerHTML = `
      <div class="result-content">
        <div class="result-original">${word}</div>
        <div class="result-arrow">↓</div>
        <div class="result-translation">${result.translation}</div>
      </div>
    `;
  } else {
    resultDiv.innerHTML = `
      <div class="result-placeholder">
        <p style="color: var(--accent-danger);">Erro: ${result.error}</p>
      </div>
    `;
  }

  updateFooterStatus('Pronto');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Settings Actions
// ═══════════════════════════════════════════════════════════════════════════════

async function startOllama() {
  updateFooterStatus('Iniciando Ollama...');

  const result = await window.api.startOllama();

  if (result.success) {
    await checkOllamaStatus();
    updateFooterStatus('Ollama iniciado');
  } else {
    updateFooterStatus('Erro ao iniciar Ollama');
  }
}

async function pullModel() {
  const model = document.getElementById('model-to-pull').value;
  const progressDiv = document.getElementById('pull-progress');
  const progressText = document.getElementById('pull-progress-text');

  progressDiv.style.display = 'block';
  progressText.textContent = `Baixando ${model}...`;
  updateFooterStatus(`Baixando ${model}...`);

  const result = await window.api.pullModel(model);

  if (result.success) {
    progressText.textContent = `✅ ${model} instalado com sucesso!`;
    await checkOllamaStatus();
  } else {
    progressText.textContent = `❌ Erro ao baixar ${model}`;
  }

  updateFooterStatus('Pronto');

  // Esconder após 5 segundos
  setTimeout(() => {
    progressDiv.style.display = 'none';
  }, 5000);
}

function handlePullProgress(data) {
  const progressText = document.getElementById('pull-progress-text');
  // Mostrar última linha do progresso
  const lines = data.trim().split('\n');
  progressText.textContent = lines[lines.length - 1];
}
