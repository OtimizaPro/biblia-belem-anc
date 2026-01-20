import { useState, useEffect } from 'react'

const API = 'https://biblia-belem-api.anderson-282.workers.dev'

function App() {
  const [books, setBooks] = useState([])
  const [currentBook, setCurrentBook] = useState(null)
  const [chapter, setChapter] = useState(1)
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('fontSize')) || 18)
  const [showOriginal, setShowOriginal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedVerse, setSelectedVerse] = useState(null)
  const [interlinear, setInterlinear] = useState(null)

  // Apply theme
  useEffect(() => {
    document.documentElement.className = theme === 'light' ? '' : theme
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  // Load books
  useEffect(() => {
    fetch(`${API}/api/v1/books`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          setBooks(data.data)
          setCurrentBook(data.data[0])
        }
      })
      .catch(console.error)
  }, [])

  // Load chapter
  useEffect(() => {
    if (!currentBook) return
    setLoading(true)
    setSelectedVerse(null)
    setInterlinear(null)
    fetch(`${API}/api/v1/verses/${currentBook.code}/${chapter}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          setVerses(data.data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [currentBook, chapter])

  // Load interlinear
  const loadInterlinear = async (verseId) => {
    try {
      const r = await fetch(`${API}/api/v1/tokens/${verseId}/interlinear`)
      const data = await r.json()
      if (data.success && data.data) {
        setInterlinear(data.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleVerseClick = (verse) => {
    if (selectedVerse?.id === verse.id) {
      setSelectedVerse(null)
      setInterlinear(null)
    } else {
      setSelectedVerse(verse)
      loadInterlinear(verse.id)
    }
  }

  const handleBookChange = (code) => {
    const book = books.find(b => b.code === code)
    if (book) {
      setCurrentBook(book)
      setChapter(1)
    }
  }

  const goToPrev = () => {
    if (chapter > 1) {
      setChapter(c => c - 1)
    } else {
      const idx = books.findIndex(b => b.code === currentBook.code)
      if (idx > 0) {
        const prevBook = books[idx - 1]
        setCurrentBook(prevBook)
        setChapter(prevBook.chapters_count)
      }
    }
  }

  const goToNext = () => {
    if (chapter < currentBook.chapters_count) {
      setChapter(c => c + 1)
    } else {
      const idx = books.findIndex(b => b.code === currentBook.code)
      if (idx < books.length - 1) {
        setCurrentBook(books[idx + 1])
        setChapter(1)
      }
    }
  }

  if (!currentBook) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Carregando Bíblia...</p>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="nav-group">
            <select
              className="select"
              value={currentBook.code}
              onChange={e => handleBookChange(e.target.value)}
            >
              <optgroup label="Antigo Testamento">
                {books.filter(b => b.testament === 'AT').map(b => (
                  <option key={b.code} value={b.code}>{b.name_pt}</option>
                ))}
              </optgroup>
              <optgroup label="Novo Testamento">
                {books.filter(b => b.testament === 'NT').map(b => (
                  <option key={b.code} value={b.code}>{b.name_pt}</option>
                ))}
              </optgroup>
            </select>

            <button className="btn" onClick={goToPrev} disabled={chapter === 1 && books[0]?.code === currentBook.code}>
              ←
            </button>
            <select
              className="select"
              value={chapter}
              onChange={e => setChapter(Number(e.target.value))}
              style={{width: 60, textAlign: 'center'}}
            >
              {Array.from({length: currentBook.chapters_count}, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
            <button className="btn" onClick={goToNext} disabled={chapter === currentBook.chapters_count && books[books.length-1]?.code === currentBook.code}>
              →
            </button>
          </div>

          <div className="nav-group" style={{position: 'relative'}}>
            <button className="btn-icon" onClick={() => setShowSettings(!showSettings)} title="Configurações">
              ⚙️
            </button>

            {showSettings && (
              <div className="settings-panel">
                <div className="settings-row">
                  <span className="settings-label">Tema</span>
                  <div className="theme-btns">
                    <button
                      className={`theme-btn theme-light ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => setTheme('light')}
                      title="Claro"
                    />
                    <button
                      className={`theme-btn theme-sepia ${theme === 'sepia' ? 'active' : ''}`}
                      onClick={() => setTheme('sepia')}
                      title="Sépia"
                    />
                    <button
                      className={`theme-btn theme-dark ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => setTheme('dark')}
                      title="Escuro"
                    />
                  </div>
                </div>

                <div className="settings-row">
                  <span className="settings-label">Tamanho da Fonte: {fontSize}px</span>
                  <div className="font-controls">
                    <button className="btn" onClick={() => setFontSize(f => Math.max(14, f - 1))}>A-</button>
                    <input
                      type="range"
                      className="font-slider"
                      min="14"
                      max="28"
                      value={fontSize}
                      onChange={e => setFontSize(Number(e.target.value))}
                    />
                    <button className="btn" onClick={() => setFontSize(f => Math.min(28, f + 1))}>A+</button>
                  </div>
                </div>

                <div className="settings-row">
                  <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'}}>
                    <input
                      type="checkbox"
                      checked={showOriginal}
                      onChange={e => setShowOriginal(e.target.checked)}
                    />
                    <span>Mostrar texto original</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reader */}
      <main className="reader" style={{fontSize: `${fontSize}px`}}>
        <h1 className="chapter-title">{currentBook.name_pt} {chapter}</h1>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {verses.map(verse => (
              <div key={verse.id}>
                <div
                  className="verse"
                  onClick={() => handleVerseClick(verse)}
                >
                  <span className="verse-num">{verse.verse}</span>
                  <span className="verse-text">{verse.literal_pt || verse.readable_pt || '—'}</span>

                  {showOriginal && verse.text_original && (
                    <div className={`original ${verse.language === 'GRC' ? 'greek' : ''}`}>
                      {verse.text_original}
                    </div>
                  )}
                </div>

                {selectedVerse?.id === verse.id && (
                  <div className="verse-actions">
                    <div className="actions-row">
                      <button className="btn" onClick={() => {
                        navigator.clipboard.writeText(`${verse.literal_pt || verse.readable_pt} — ${currentBook.name_pt} ${chapter}:${verse.verse}`)
                      }}>
                        📋 Copiar
                      </button>
                      <button className="btn" onClick={() => {
                        if (navigator.share) {
                          navigator.share({text: `${verse.literal_pt || verse.readable_pt} — ${currentBook.name_pt} ${chapter}:${verse.verse}`})
                        }
                      }}>
                        📤 Compartilhar
                      </button>
                    </div>

                    {interlinear && (
                      <div className="interlinear">
                        <span className="settings-label">Vista Interlinear</span>
                        <div className="interlinear-words">
                          {interlinear.interlinear.map((token, i) => (
                            <div key={i} className="interlinear-word" title={token.morphDescription || token.morphology}>
                              <span className="int-original">{token.original}</span>
                              <span className="int-translit">{token.transliteration}</span>
                              <span className="int-gloss">{token.gloss}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <p style={{textAlign: 'center', marginTop: 48, color: 'var(--text2)', fontSize: '0.9em'}}>
              — Fim de {currentBook.name_pt} {chapter} —
            </p>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <button className="btn" onClick={goToPrev}>← Anterior</button>
          <span className="footer-info">{currentBook.name_pt} {chapter}</span>
          <button className="btn" onClick={goToNext}>Próximo →</button>
        </div>
      </footer>
    </>
  )
}

export default App
