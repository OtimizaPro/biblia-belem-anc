const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Status
  checkOllama: () => ipcRenderer.invoke('check-ollama'),
  checkGpu: () => ipcRenderer.invoke('check-gpu'),
  loadGlossaries: () => ipcRenderer.invoke('load-glossaries'),
  getDbStats: () => ipcRenderer.invoke('get-db-stats'),
  getBooks: () => ipcRenderer.invoke('get-books'),

  // Tradução
  translateWord: (word, language) => ipcRenderer.invoke('translate-word', word, language),
  startTranslation: (bookCode, model) => ipcRenderer.invoke('start-translation', bookCode, model),
  stopTranslation: () => ipcRenderer.invoke('stop-translation'),

  // Ollama
  startOllama: () => ipcRenderer.invoke('start-ollama'),
  pullModel: (model) => ipcRenderer.invoke('pull-model', model),

  // Events
  onTranslationOutput: (callback) => ipcRenderer.on('translation-output', (_, data) => callback(data)),
  onTranslationComplete: (callback) => ipcRenderer.on('translation-complete', (_, code) => callback(code)),
  onPullProgress: (callback) => ipcRenderer.on('pull-progress', (_, data) => callback(data))
});
