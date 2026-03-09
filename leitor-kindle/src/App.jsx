import { useState, useEffect, useRef, useCallback } from 'react'

const API = 'https://biblia-belem-api.anderson-282.workers.dev'

// Book name aliases for GoTo navigation
const BOOK_ALIASES = {
  'genesis': 'GEN', 'gn': 'GEN', 'gen': 'GEN',
  'exodo': 'EXO', 'ex': 'EXO', 'exo': 'EXO',
  'levitico': 'LEV', 'lv': 'LEV', 'lev': 'LEV',
  'numeros': 'NUM', 'nm': 'NUM', 'num': 'NUM',
  'deuteronomio': 'DEU', 'dt': 'DEU', 'deu': 'DEU',
  'josue': 'JOS', 'js': 'JOS', 'jos': 'JOS',
  'juizes': 'JDG', 'jz': 'JDG', 'jdg': 'JDG',
  'rute': 'RUT', 'rt': 'RUT', 'rut': 'RUT',
  '1samuel': '1SA', '1sm': '1SA', '1sa': '1SA',
  '2samuel': '2SA', '2sm': '2SA', '2sa': '2SA',
  '1reis': '1KI', '1rs': '1KI', '1ki': '1KI',
  '2reis': '2KI', '2rs': '2KI', '2ki': '2KI',
  '1cronicas': '1CH', '1cr': '1CH', '1ch': '1CH',
  '2cronicas': '2CH', '2cr': '2CH', '2ch': '2CH',
  'esdras': 'EZR', 'ed': 'EZR', 'ezr': 'EZR',
  'neemias': 'NEH', 'ne': 'NEH', 'neh': 'NEH',
  'ester': 'EST', 'et': 'EST', 'est': 'EST',
  'jo': 'JOB', 'job': 'JOB',
  'salmos': 'PSA', 'sl': 'PSA', 'psa': 'PSA',
  'proverbios': 'PRO', 'pv': 'PRO', 'pro': 'PRO',
  'eclesiastes': 'ECC', 'ec': 'ECC', 'ecc': 'ECC',
  'cantares': 'SNG', 'ct': 'SNG', 'sng': 'SNG',
  'isaias': 'ISA', 'is': 'ISA', 'isa': 'ISA',
  'jeremias': 'JER', 'jr': 'JER', 'jer': 'JER',
  'lamentacoes': 'LAM', 'lm': 'LAM', 'lam': 'LAM',
  'ezequiel': 'EZK', 'ez': 'EZK', 'ezk': 'EZK',
  'daniel': 'DAN', 'dn': 'DAN', 'dan': 'DAN',
  'oseias': 'HOS', 'os': 'HOS', 'hos': 'HOS',
  'joel': 'JOL', 'jl': 'JOL', 'jol': 'JOL',
  'amos': 'AMO', 'am': 'AMO', 'amo': 'AMO',
  'obadias': 'OBA', 'ob': 'OBA', 'oba': 'OBA',
  'jonas': 'JON', 'jn': 'JON', 'jon': 'JON',
  'miqueias': 'MIC', 'mq': 'MIC', 'mic': 'MIC',
  'naum': 'NAM', 'na': 'NAM', 'nam': 'NAM',
  'habacuque': 'HAB', 'hc': 'HAB', 'hab': 'HAB',
  'sofonias': 'ZEP', 'sf': 'ZEP', 'zep': 'ZEP',
  'ageu': 'HAG', 'ag': 'HAG', 'hag': 'HAG',
  'zacarias': 'ZEC', 'zc': 'ZEC', 'zec': 'ZEC',
  'malaquias': 'MAL', 'ml': 'MAL', 'mal': 'MAL',
  'mateus': 'MAT', 'mt': 'MAT', 'mat': 'MAT',
  'marcos': 'MRK', 'mc': 'MRK', 'mrk': 'MRK',
  'lucas': 'LUK', 'lc': 'LUK', 'luk': 'LUK',
  'joao': 'JHN', 'jhn': 'JHN',
  'atos': 'ACT', 'at': 'ACT', 'act': 'ACT',
  'romanos': 'ROM', 'rm': 'ROM', 'rom': 'ROM',
  '1corintios': '1CO', '1co': '1CO',
  '2corintios': '2CO', '2co': '2CO',
  'galatas': 'GAL', 'gl': 'GAL', 'gal': 'GAL',
  'efesios': 'EPH', 'ef': 'EPH', 'eph': 'EPH',
  'filipenses': 'PHP', 'fp': 'PHP', 'php': 'PHP',
  'colossenses': 'COL', 'cl': 'COL', 'col': 'COL',
  '1tessalonicenses': '1TH', '1ts': '1TH', '1th': '1TH',
  '2tessalonicenses': '2TH', '2ts': '2TH', '2th': '2TH',
  '1timoteo': '1TI', '1tm': '1TI', '1ti': '1TI',
  '2timoteo': '2TI', '2tm': '2TI', '2ti': '2TI',
  'tito': 'TIT', 'tt': 'TIT', 'tit': 'TIT',
  'filemom': 'PHM', 'fm': 'PHM', 'phm': 'PHM',
  'hebreus': 'HEB', 'hb': 'HEB', 'heb': 'HEB',
  'tiago': 'JAS', 'tg': 'JAS', 'jas': 'JAS',
  '1pedro': '1PE', '1pd': '1PE', '1pe': '1PE',
  '2pedro': '2PE', '2pd': '2PE', '2pe': '2PE',
  '1joao': '1JN', '1jo': '1JN', '1jn': '1JN',
  '2joao': '2JN', '2jo': '2JN', '2jn': '2JN',
  '3joao': '3JN', '3jo': '3JN', '3jn': '3JN',
  'judas': 'JUD', 'jd': 'JUD', 'jud': 'JUD',
  'apocalipse': 'REV', 'ap': 'REV', 'rev': 'REV',
  'desvelacao': 'REV', 'des': 'REV',
}

const LAYER_DESCRIPTIONS = {
  0: 'Texto literal (original)',
  1: 'Glossario minimo',
  2: 'Marcacao morfologica',
  3: 'Reordenacao de leitura',
  4: 'Expansao de elipses',
  5: 'Alternativas lexicais',
}

// Editorial tooltips — marcadores e palavras nao traduzidas
const EDITORIAL_TOOLTIPS = {
  '[OBJ]': 'Objeto direto implicito/eliptico no original',
  '[grammatical_ellipsis]': 'Omissao gramatical proposital do original',
  '[interpretation_needed]': 'Ambiguidade genuina no texto original',
  'yhwh': 'Tetragrama (יהוה) — Nome proprio divino',
  'Elohim': 'Hebraico (אלהים) — preserva ambiguidade singular/plural',
  'Eloah': 'Hebraico (אלוה) — singular arcaico, predominante em Jo',
  'Adonai': 'Hebraico (אדני) — preserva distincao de yhwh',
  'Theos': 'Grego (Θεός) — preserva nuances theos vs ho Theos',
  'Iesous': 'Grego (Ἰησοῦς) — nome proprio, forma grega original',
  'Christos': 'Grego (Χριστός) — titulo, preserva carga semantica',
}

const EDITORIAL_PATTERN = (() => {
  const keys = Object.keys(EDITORIAL_TOOLTIPS)
    .sort((a, b) => b.length - a.length)
    .map(k => {
      const e = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return k.startsWith('[') ? e : `\\b${e}\\b`
    })
  return new RegExp(`(${keys.join('|')})`, 'g')
})()

function renderVerseText(text) {
  if (!text) return '\u2014'
  const parts = text.split(EDITORIAL_PATTERN)
  return parts.map((part, i) => {
    if (EDITORIAL_TOOLTIPS[part]) {
      return <span key={i} className="editorial-word" title={EDITORIAL_TOOLTIPS[part]}>{part}</span>
    }
    return part
  })
}

// Reading plans — chapters per day organized by book
const READING_PLANS = {
  year: { name: 'Biblia em 1 ano', days: 365, perDay: 3 },
  half: { name: 'Biblia em 6 meses', days: 182, perDay: 6 },
  nt90: { name: 'Novo T. em 90 dias', days: 90, perDay: 3, testament: 'NT' },
}

function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

function App() {
  const [books, setBooks] = useState([])
  const [currentBook, setCurrentBook] = useState(null)
  const [chapter, setChapter] = useState(1)
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || getSystemTheme())
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('fontSize')) || 18)
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('fontFamily') || 'serif')
  const [showOriginal, setShowOriginal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedVerse, setSelectedVerse] = useState(null)
  const [interlinear, setInterlinear] = useState(null)
  const [loadingInterlinear, setLoadingInterlinear] = useState(false)
  const [activeToken, setActiveToken] = useState(null)
  const [toast, setToast] = useState(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showGoto, setShowGoto] = useState(false)
  const [gotoValue, setGotoValue] = useState('')
  const [gotoError, setGotoError] = useState('')
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]') } catch { return [] }
  })
  const [showFavorites, setShowFavorites] = useState(false)
  const [activeLayer, setActiveLayer] = useState(0) // 0 = literal (default), 1-5 = suavizacao
  const [layerTexts, setLayerTexts] = useState({}) // { verseId: { N1: text, N2: text, ... } }
  const [loadingLayer, setLoadingLayer] = useState(false)
  const [glossaryCache, setGlossaryCache] = useState({}) // { word: { data } }
  const [loadingGlossary, setLoadingGlossary] = useState(false)
  const [searchFilter, setSearchFilter] = useState('all') // 'all' | 'AT' | 'NT'
  const [lineHeight, setLineHeight] = useState(() => Number(localStorage.getItem('lineHeight')) || 1.8)
  // Feature: Contribute glossary
  const [suggestForm, setSuggestForm] = useState(null) // { word, translation, contributor }
  const [suggestLoading, setSuggestLoading] = useState(false)
  // Feature: Reading history & progress
  const [readChapters, setReadChapters] = useState(() => {
    try { return JSON.parse(localStorage.getItem('readChapters') || '{}') } catch { return {} }
  })
  const [showHistory, setShowHistory] = useState(false)
  // Feature: Annotations & highlights
  const [annotations, setAnnotations] = useState(() => {
    try { return JSON.parse(localStorage.getItem('annotations') || '{}') } catch { return {} }
  })
  const [annotatingVerse, setAnnotatingVerse] = useState(null) // verse key being annotated
  const [annotationNote, setAnnotationNote] = useState('')
  // Feature: Reading plan
  const [showPlan, setShowPlan] = useState(false)
  const [activePlan, setActivePlan] = useState(() => localStorage.getItem('activePlan') || null)
  const [planProgress, setPlanProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('planProgress') || '{}') } catch { return {} }
  })
  // Feature: Comparative view
  const [showComparative, setShowComparative] = useState(false)
  // Feature: Export
  const [showExport, setShowExport] = useState(false)

  const searchInputRef = useRef(null)
  const touchStartX = useRef(null)
  const gotoInputRef = useRef(null)
  const searchTimerRef = useRef(null)

  // Register Service Worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  // Show toast helper
  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  // Apply theme
  useEffect(() => {
    document.documentElement.className = theme === 'light' ? '' : theme
    localStorage.setItem('theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      const colors = { light: '#ffffff', sepia: '#f4efe4', dark: '#1a1a1a' }
      meta.content = colors[theme] || '#ffffff'
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Apply font family
  useEffect(() => {
    document.body.classList.toggle('sans-serif', fontFamily === 'sans-serif')
    localStorage.setItem('fontFamily', fontFamily)
  }, [fontFamily])

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  useEffect(() => {
    localStorage.setItem('lineHeight', lineHeight)
  }, [lineHeight])

  // Save favorites
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  // Save annotations
  useEffect(() => {
    localStorage.setItem('annotations', JSON.stringify(annotations))
  }, [annotations])

  // Save reading history
  useEffect(() => {
    localStorage.setItem('readChapters', JSON.stringify(readChapters))
  }, [readChapters])

  // Save reading plan
  useEffect(() => {
    if (activePlan) localStorage.setItem('activePlan', activePlan)
    else localStorage.removeItem('activePlan')
  }, [activePlan])
  useEffect(() => {
    localStorage.setItem('planProgress', JSON.stringify(planProgress))
  }, [planProgress])

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement
      const progress = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100
      setScrollProgress(Math.min(100, Math.max(0, progress || 0)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Swipe gestures for chapter navigation
  useEffect(() => {
    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
    const handleTouchEnd = (e) => {
      if (touchStartX.current === null) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      touchStartX.current = null
      if (Math.abs(dx) < 80) return // minimum swipe distance
      if (dx > 0) goToPrev()
      else goToNext()
    }
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  })

  // Load books
  useEffect(() => {
    fetch(`${API}/api/v1/books`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          setBooks(data.data)
          // Restore saved position
          const savedBook = localStorage.getItem('lastBook')
          const savedChapter = Number(localStorage.getItem('lastChapter')) || 1
          const found = savedBook && data.data.find(b => b.code === savedBook)
          if (found) {
            setCurrentBook(found)
            setChapter(savedChapter)
          } else {
            setCurrentBook(data.data[0])
          }
        }
      })
      .catch(() => setError('Erro ao carregar livros. Verifique sua conexao.'))
  }, [])

  // Load chapter
  useEffect(() => {
    if (!currentBook) return
    setLoading(true)
    setError(null)
    setSelectedVerse(null)
    setInterlinear(null)
    setActiveToken(null)
    // Save position
    localStorage.setItem('lastBook', currentBook.code)
    localStorage.setItem('lastChapter', chapter)
    // Track reading history
    const readKey = `${currentBook.code}_${chapter}`
    setReadChapters(prev => prev[readKey] ? prev : { ...prev, [readKey]: Date.now() })
    fetch(`${API}/api/v1/verses/${currentBook.code}/${chapter}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          setVerses(data.data)
        } else {
          setError('Capitulo sem conteudo traduzido ainda.')
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Erro ao carregar capitulo. Tente novamente.')
        setLoading(false)
      })
  }, [currentBook, chapter])

  // Load interlinear
  const loadInterlinear = async (verseId) => {
    setLoadingInterlinear(true)
    try {
      const r = await fetch(`${API}/api/v1/tokens/${verseId}/interlinear`)
      const data = await r.json()
      if (data.success && data.data) {
        setInterlinear(data.data)
      }
    } catch (e) {
      console.error(e)
      showToast('Erro ao carregar interlinear')
    } finally {
      setLoadingInterlinear(false)
    }
  }

  // Load glosses layer for a verse
  const loadLayer = async (verseId, level) => {
    if (level === 0) { setActiveLayer(0); return }
    const layerKey = `N${level}`
    // Check cache
    if (layerTexts[verseId]?.[layerKey]) {
      setActiveLayer(level)
      return
    }
    setLoadingLayer(true)
    try {
      const r = await fetch(`${API}/api/v1/glosses/verse/${verseId}?layer=${layerKey}`)
      const data = await r.json()
      if (data.success && data.data?.length > 0) {
        setLayerTexts(prev => ({
          ...prev,
          [verseId]: { ...prev[verseId], [layerKey]: data.data[0].text }
        }))
        setActiveLayer(level)
      } else {
        showToast(`Nivel ${level} indisponivel para este versiculo`)
      }
    } catch {
      showToast('Erro ao carregar camada')
    } finally {
      setLoadingLayer(false)
    }
  }

  // Load all available layers for a verse at once
  const loadAllLayers = async (verseId) => {
    if (layerTexts[verseId]?.loaded) return
    try {
      const r = await fetch(`${API}/api/v1/glosses/verse/${verseId}`)
      const data = await r.json()
      if (data.success && data.data) {
        const layers = {}
        data.data.forEach(g => { layers[g.layer] = g.text })
        layers.loaded = true
        setLayerTexts(prev => ({ ...prev, [verseId]: { ...prev[verseId], ...layers } }))
      }
    } catch { /* silent - layers just won't be available */ }
  }

  // Glossary lookup — try original form first, then normalized
  const lookupGlossary = async (original, normalized) => {
    const key = original || normalized
    if (!key || glossaryCache[key] !== undefined) return
    setLoadingGlossary(true)
    try {
      // Try original form first (glossary entries preserve capitalization)
      const r1 = await fetch(`${API}/api/v1/glossary/${encodeURIComponent(original || normalized)}`)
      const d1 = await r1.json()
      if (d1.success && d1.data) {
        setGlossaryCache(prev => ({ ...prev, [key]: d1.data }))
        return
      }
      // Fallback: try normalized form if different
      if (normalized && normalized !== original) {
        const r2 = await fetch(`${API}/api/v1/glossary/${encodeURIComponent(normalized)}`)
        const d2 = await r2.json()
        if (d2.success && d2.data) {
          setGlossaryCache(prev => ({ ...prev, [key]: d2.data }))
          return
        }
      }
      setGlossaryCache(prev => ({ ...prev, [key]: null }))
    } catch {
      setGlossaryCache(prev => ({ ...prev, [key]: null }))
    } finally {
      setLoadingGlossary(false)
    }
  }

  // Submit glossary suggestion
  const submitSuggestion = async () => {
    if (!suggestForm?.word || !suggestForm?.translation) return
    setSuggestLoading(true)
    try {
      const r = await fetch(`${API}/api/v1/glossary/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestForm),
      })
      const data = await r.json()
      if (data.success) {
        showToast('Sugestao enviada para revisao!')
        setSuggestForm(null)
      } else {
        showToast(data.error || 'Erro ao enviar sugestao')
      }
    } catch {
      showToast('Erro de conexao')
    } finally {
      setSuggestLoading(false)
    }
  }

  // Annotation helpers
  const getAnnotationKey = (verse) => `${currentBook.code}_${chapter}_${verse.verse}`
  const toggleHighlight = (verse, color) => {
    const key = getAnnotationKey(verse)
    setAnnotations(prev => {
      const existing = prev[key]
      if (existing?.color === color) {
        const { color: _, ...rest } = existing
        return Object.keys(rest).length ? { ...prev, [key]: rest } : (() => { const { [key]: __, ...r } = prev; return r })()
      }
      return { ...prev, [key]: { ...existing, color } }
    })
  }
  const saveAnnotationNote = (verse) => {
    const key = getAnnotationKey(verse)
    setAnnotations(prev => {
      if (!annotationNote.trim()) {
        const existing = prev[key]
        if (existing) {
          const { note: _, ...rest } = existing
          return Object.keys(rest).length ? { ...prev, [key]: rest } : (() => { const { [key]: __, ...r } = prev; return r })()
        }
        return prev
      }
      return { ...prev, [key]: { ...prev[key], note: annotationNote.trim() } }
    })
    setAnnotatingVerse(null)
    setAnnotationNote('')
    showToast('Nota salva')
  }

  // Reading progress per book
  const getBookProgress = (bookCode, chaptersCount) => {
    let count = 0
    for (let i = 1; i <= chaptersCount; i++) {
      if (readChapters[`${bookCode}_${i}`]) count++
    }
    return Math.round((count / chaptersCount) * 100)
  }

  // Export chapter
  const exportChapter = (format) => {
    if (!verses.length) return
    const lines = verses.map(v => `${v.verse} ${v.literal_pt || v.readable_pt || ''}`)
    const header = `${currentBook.name_pt} ${chapter}`
    const text = `${header}\n${'—'.repeat(header.length)}\n\n${lines.join('\n')}\n\n— Biblia Belem An.C 2025`
    if (format === 'copy') {
      navigator.clipboard.writeText(text).then(() => showToast('Capitulo copiado!'))
    } else if (format === 'print') {
      const w = window.open('', '_blank')
      w.document.write(`<html><head><title>${header}</title><style>body{font-family:Georgia,serif;max-width:680px;margin:40px auto;line-height:1.8;font-size:16px}h1{text-align:center}p{margin:4px 0}.vn{color:#999;font-size:0.75em;vertical-align:super}</style></head><body><h1>${header}</h1>`)
      verses.forEach(v => {
        w.document.write(`<p><span class="vn">${v.verse}</span> ${v.literal_pt || v.readable_pt || ''}</p>`)
      })
      w.document.write('<hr><p style="text-align:center;color:#999;font-size:0.9em">Biblia Belem An.C 2025</p></body></html>')
      w.document.close()
      w.print()
    }
    setShowExport(false)
  }

  // Lema search — open search pre-filled with a word
  const searchLema = (word) => {
    if (!word) return
    setShowSearch(true)
    setSearchQuery(word)
    setTimeout(() => {
      searchInputRef.current?.focus()
      doSearch(word, 'all')
    }, 150)
  }

  // Reading plan helpers
  const getPlanChapters = (planKey) => {
    if (!planKey || !books.length) return []
    const plan = READING_PLANS[planKey]
    if (!plan) return []
    const filtered = plan.testament ? books.filter(b => b.testament === plan.testament) : books
    const chapters = []
    filtered.forEach(b => {
      for (let c = 1; c <= b.chapters_count; c++) {
        chapters.push({ bookCode: b.code, bookName: b.name_pt, chapter: c })
      }
    })
    return chapters
  }
  const getPlanDayChapters = (planKey, day) => {
    const all = getPlanChapters(planKey)
    const plan = READING_PLANS[planKey]
    if (!plan) return []
    const start = (day - 1) * plan.perDay
    return all.slice(start, start + plan.perDay)
  }
  const getPlanTotalDays = (planKey) => {
    const all = getPlanChapters(planKey)
    const plan = READING_PLANS[planKey]
    if (!plan) return 0
    return Math.ceil(all.length / plan.perDay)
  }

  // Search with optional testament filter
  const doSearch = useCallback((q, filter) => {
    if (q.length < 2) { setSearchResults([]); return }
    setSearchLoading(true)
    fetch(`${API}/api/v1/search?q=${encodeURIComponent(q)}&limit=50`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          let results = data.data
          if (filter && filter !== 'all') {
            const atBooks = new Set(books.filter(b => b.testament === 'AT').map(b => b.code.toLowerCase()))
            const ntBooks = new Set(books.filter(b => b.testament === 'NT').map(b => b.code.toLowerCase()))
            const allowed = filter === 'AT' ? atBooks : ntBooks
            results = results.filter(r => allowed.has(r.book?.toLowerCase()))
          }
          setSearchResults(results.slice(0, 30))
        } else {
          setSearchResults([])
        }
        setSearchLoading(false)
      })
      .catch(() => {
        setSearchResults([])
        setSearchLoading(false)
      })
  }, [books])

  const handleSearchInput = (val, filter) => {
    setSearchQuery(val)
    const f = filter !== undefined ? filter : searchFilter
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => doSearch(val, f), 400)
  }

  const navigateToResult = (result) => {
    const book = books.find(b => b.code.toLowerCase() === result.book || b.code === result.book.toUpperCase())
    if (book) {
      setCurrentBook(book)
      setChapter(result.chapter)
      setShowSearch(false)
      setSearchQuery('')
      setSearchResults([])
    }
  }

  // GoTo navigation
  const handleGoto = (input) => {
    setGotoError('')
    const text = input.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/\s+/g, ' ')

    // Try to parse "book chapter" or "book chapter:verse"
    const match = text.match(/^(\d?\s*[a-z]+)\s*(\d+)?/)
    if (!match) {
      setGotoError('Formato: "Joao 3" ou "Gn 1"')
      return
    }

    const bookInput = match[1].replace(/\s/g, '')
    const chapterNum = match[2] ? Number(match[2]) : 1

    // Find by alias or by code
    const code = BOOK_ALIASES[bookInput] || bookInput.toUpperCase()
    const book = books.find(b => b.code === code)

    if (!book) {
      setGotoError('Livro nao encontrado')
      return
    }

    if (chapterNum < 1 || chapterNum > book.chapters_count) {
      setGotoError(`Capitulo invalido (1-${book.chapters_count})`)
      return
    }

    setCurrentBook(book)
    setChapter(chapterNum)
    setShowGoto(false)
    setGotoValue('')
  }

  // Favorites
  const toggleFavorite = (verse) => {
    const key = `${currentBook.code}-${chapter}-${verse.verse}`
    const exists = favorites.find(f => f.key === key)
    if (exists) {
      setFavorites(favorites.filter(f => f.key !== key))
      showToast('Removido dos favoritos')
    } else {
      setFavorites([...favorites, {
        key,
        bookCode: currentBook.code,
        bookName: currentBook.name_pt,
        chapter,
        verse: verse.verse,
        text: (verse.literal_pt || verse.readable_pt || '').slice(0, 120)
      }])
      showToast('Adicionado aos favoritos')
    }
  }

  const isFavorite = (verse) => {
    return favorites.some(f => f.key === `${currentBook.code}-${chapter}-${verse.verse}`)
  }

  const navigateToFavorite = (fav) => {
    const book = books.find(b => b.code === fav.bookCode)
    if (book) {
      setCurrentBook(book)
      setChapter(fav.chapter)
      setShowFavorites(false)
    }
  }

  // Random verse
  const goToRandom = () => {
    if (!books.length) return
    const book = books[Math.floor(Math.random() * books.length)]
    const ch = Math.floor(Math.random() * book.chapters_count) + 1
    setCurrentBook(book)
    setChapter(ch)
    showToast(`${book.name_pt} ${ch}`)
  }

  const handleVerseClick = (verse) => {
    if (selectedVerse?.id === verse.id) {
      setSelectedVerse(null)
      setInterlinear(null)
      setActiveToken(null)
      setActiveLayer(0)
    } else {
      setSelectedVerse(verse)
      setActiveToken(null)
      setActiveLayer(0)
      loadInterlinear(verse.id)
      loadAllLayers(verse.id)
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
    window.scrollTo(0, 0)
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
    window.scrollTo(0, 0)
  }

  const handleCopy = (verse) => {
    const text = `${verse.literal_pt || verse.readable_pt} — ${currentBook.name_pt} ${chapter}:${verse.verse}`
    navigator.clipboard.writeText(text).then(() => showToast('Copiado!'))
  }

  const handleShare = (verse) => {
    const text = `${verse.literal_pt || verse.readable_pt} — ${currentBook.name_pt} ${chapter}:${verse.verse}`
    if (navigator.share) {
      navigator.share({ text }).then(() => showToast('Compartilhado!'))
    } else {
      navigator.clipboard.writeText(text).then(() => showToast('Link copiado!'))
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Don't trigger when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return

      // Close any open modal with Escape
      if (e.key === 'Escape') {
        if (showSearch) { setShowSearch(false); return }
        if (showShortcuts) { setShowShortcuts(false); return }
        if (showGoto) { setShowGoto(false); return }
        if (showFavorites) { setShowFavorites(false); return }
        if (showHistory) { setShowHistory(false); return }
        if (showPlan) { setShowPlan(false); return }
        if (showExport) { setShowExport(false); return }
        if (showSettings) { setShowSettings(false); return }
        return
      }

      if (e.key === 'ArrowLeft') { goToPrev(); e.preventDefault() }
      if (e.key === 'ArrowRight') { goToNext(); e.preventDefault() }
      if (e.key === '/' || (e.key === 's' && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault()
        setShowSearch(true)
        setTimeout(() => searchInputRef.current?.focus(), 100)
      }
      if (e.key === 'g') {
        setShowGoto(true)
        setTimeout(() => gotoInputRef.current?.focus(), 100)
      }
      if (e.key === 't') {
        setTheme(t => t === 'light' ? 'sepia' : t === 'sepia' ? 'dark' : 'light')
      }
      if (e.key === 'f') {
        setFontFamily(f => f === 'serif' ? 'sans-serif' : 'serif')
      }
      if (e.key === '?' || e.key === 'h') {
        setShowShortcuts(true)
      }
      if (e.key === 'b') {
        setShowFavorites(true)
      }
      if (e.key === 'r') {
        goToRandom()
      }
      if (e.key === 'p') {
        setShowPlan(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showSearch, showShortcuts, showGoto, showFavorites, showSettings, showHistory, showPlan, showExport, books, currentBook, chapter])

  // Focus search/goto on open
  useEffect(() => {
    if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 100)
  }, [showSearch])
  useEffect(() => {
    if (showGoto) setTimeout(() => gotoInputRef.current?.focus(), 100)
  }, [showGoto])

  if (!currentBook && !error) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Carregando Biblia...</p>
      </div>
    )
  }

  if (!currentBook && error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button className="btn-retry" onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    )
  }

  return (
    <>
      {/* Progress bar */}
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="nav-group">
            <select
              className="select"
              value={currentBook.code}
              onChange={e => handleBookChange(e.target.value)}
              aria-label="Selecionar livro"
            >
              <optgroup label="Antigo Testamento">
                {books.filter(b => b.testament === 'AT').map(b => {
                  const p = getBookProgress(b.code, b.chapters_count)
                  return <option key={b.code} value={b.code}>{b.name_pt}{p > 0 ? ` (${p}%)` : ''}</option>
                })}
              </optgroup>
              <optgroup label="Novo Testamento">
                {books.filter(b => b.testament === 'NT').map(b => {
                  const p = getBookProgress(b.code, b.chapters_count)
                  return <option key={b.code} value={b.code}>{b.name_pt}{p > 0 ? ` (${p}%)` : ''}</option>
                })}
              </optgroup>
            </select>

            <button className="btn" onClick={goToPrev} aria-label="Capitulo anterior" disabled={chapter === 1 && books[0]?.code === currentBook.code}>
              &#8592;
            </button>
            <select
              className="select"
              value={chapter}
              onChange={e => setChapter(Number(e.target.value))}
              style={{width: 60, textAlign: 'center'}}
              aria-label="Selecionar capitulo"
            >
              {Array.from({length: currentBook.chapters_count}, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
            <button className="btn" onClick={goToNext} aria-label="Proximo capitulo" disabled={chapter === currentBook.chapters_count && books[books.length-1]?.code === currentBook.code}>
              &#8594;
            </button>
          </div>

          <div className="nav-group" style={{position: 'relative'}}>
            <button className="btn-icon" onClick={() => { setShowSearch(true) }} aria-label="Buscar" title="Buscar (/)">
              &#128269;
            </button>
            <button className="btn-icon" onClick={() => { setShowGoto(true) }} aria-label="Ir para versiculo" title="Ir para (G)">
              &#8634;
            </button>
            <button className="btn-icon" onClick={() => setShowFavorites(true)} aria-label="Favoritos" title="Favoritos (B)">
              &#9733;
            </button>
            <button className="btn-icon" onClick={goToRandom} aria-label="Capitulo aleatorio" title="Aleatorio (R)">
              &#127922;
            </button>
            <button className="btn-icon" onClick={() => setShowHistory(true)} aria-label="Historico de leitura" title="Historico">
              &#128197;
            </button>
            <button className="btn-icon" onClick={() => setShowPlan(true)} aria-label="Plano de leitura" title="Plano (P)">
              &#128218;
            </button>
            <button className="btn-icon" onClick={() => setShowExport(true)} aria-label="Exportar capitulo" title="Exportar">
              &#128190;
            </button>
            <button className="btn-icon" onClick={() => setShowSettings(!showSettings)} aria-label="Configuracoes" title="Configuracoes">
              &#9881;
            </button>

            {showSettings && (
              <div className="settings-panel">
                <button className="settings-close" onClick={() => setShowSettings(false)} aria-label="Fechar configuracoes">&#10005;</button>

                <div className="settings-row">
                  <span className="settings-label">Tema</span>
                  <div className="theme-btns">
                    <button
                      className={`theme-btn theme-light ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => setTheme('light')}
                      title="Claro"
                      aria-label="Tema claro"
                    />
                    <button
                      className={`theme-btn theme-sepia ${theme === 'sepia' ? 'active' : ''}`}
                      onClick={() => setTheme('sepia')}
                      title="Sepia"
                      aria-label="Tema sepia"
                    />
                    <button
                      className={`theme-btn theme-dark ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => setTheme('dark')}
                      title="Escuro"
                      aria-label="Tema escuro"
                    />
                  </div>
                </div>

                <div className="settings-row">
                  <span className="settings-label">Fonte</span>
                  <div className="font-family-btns">
                    <button
                      className={`font-family-btn serif ${fontFamily === 'serif' ? 'active' : ''}`}
                      onClick={() => setFontFamily('serif')}
                    >
                      Serif
                    </button>
                    <button
                      className={`font-family-btn sans ${fontFamily === 'sans-serif' ? 'active' : ''}`}
                      onClick={() => setFontFamily('sans-serif')}
                    >
                      Sans
                    </button>
                  </div>
                </div>

                <div className="settings-row">
                  <span className="settings-label">Tamanho: {fontSize}px</span>
                  <div className="font-controls">
                    <button className="btn" onClick={() => setFontSize(f => Math.max(14, f - 1))} aria-label="Diminuir fonte">A-</button>
                    <input
                      type="range"
                      className="font-slider"
                      min="14"
                      max="32"
                      value={fontSize}
                      onChange={e => setFontSize(Number(e.target.value))}
                      aria-label="Tamanho da fonte"
                    />
                    <button className="btn" onClick={() => setFontSize(f => Math.min(32, f + 1))} aria-label="Aumentar fonte">A+</button>
                  </div>
                </div>

                <div className="settings-row">
                  <span className="settings-label">Espacamento: {lineHeight.toFixed(1)}</span>
                  <div className="font-controls">
                    <button className="btn" onClick={() => setLineHeight(h => Math.max(1.2, +(h - 0.1).toFixed(1)))} aria-label="Diminuir espacamento">-</button>
                    <input
                      type="range"
                      className="font-slider"
                      min="1.2"
                      max="2.4"
                      step="0.1"
                      value={lineHeight}
                      onChange={e => setLineHeight(Number(e.target.value))}
                      aria-label="Espacamento entre linhas"
                    />
                    <button className="btn" onClick={() => setLineHeight(h => Math.min(2.4, +(h + 0.1).toFixed(1)))} aria-label="Aumentar espacamento">+</button>
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

                <div className="settings-row" style={{marginBottom: 0}}>
                  <button className="btn" onClick={() => setShowShortcuts(true)} style={{width: '100%'}}>
                    Atalhos de teclado (?)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reader */}
      <main className="reader" style={{fontSize: `${fontSize}px`, lineHeight}}>
        <h1 className="chapter-title">{currentBook.name_pt} {chapter}</h1>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="btn-retry" onClick={() => {
              setError(null)
              setLoading(true)
              fetch(`${API}/api/v1/verses/${currentBook.code}/${chapter}`)
                .then(r => r.json())
                .then(data => {
                  if (data.success && data.data) setVerses(data.data)
                  else setError('Capitulo sem conteudo traduzido ainda.')
                  setLoading(false)
                })
                .catch(() => { setError('Erro ao carregar. Tente novamente.'); setLoading(false) })
            }}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {verses.map(verse => {
              const annKey = getAnnotationKey(verse)
              const ann = annotations[annKey]
              return (
              <div key={verse.id}>
                <div
                  className={`verse ${ann?.color ? `highlight-${ann.color}` : ''}`}
                  onClick={() => handleVerseClick(verse)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') handleVerseClick(verse) }}
                >
                  <span className="verse-num">{verse.verse}</span>
                  <span className="verse-text">{renderVerseText(verse.literal_pt || verse.readable_pt)}</span>
                  {ann?.note && <span className="verse-note-indicator" title={ann.note}>&#128221;</span>}

                  {showOriginal && verse.text_original && (
                    <div className={`original ${verse.language === 'GRC' ? 'greek' : ''}`}>
                      {verse.text_original}
                    </div>
                  )}
                </div>

                {selectedVerse?.id === verse.id && (
                  <div className="verse-actions">
                    <div className="actions-row">
                      <button className="btn" onClick={() => handleCopy(verse)}>
                        &#128203; Copiar
                      </button>
                      <button className="btn" onClick={() => handleShare(verse)}>
                        &#128228; Compartilhar
                      </button>
                      <button className="btn" onClick={() => toggleFavorite(verse)}>
                        {isFavorite(verse) ? '\u2605 Salvo' : '\u2606 Favoritar'}
                      </button>
                    </div>

                    {/* Highlights & Annotations */}
                    <div className="actions-row" style={{marginTop: 6}}>
                      <span className="settings-label" style={{marginBottom: 0, lineHeight: '28px'}}>Destacar:</span>
                      {['yellow', 'green', 'blue', 'pink'].map(c => (
                        <button
                          key={c}
                          className={`highlight-dot highlight-dot-${c} ${ann?.color === c ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleHighlight(verse, c) }}
                          title={c}
                          aria-label={`Destacar ${c}`}
                        />
                      ))}
                      <button
                        className="btn"
                        style={{marginLeft: 'auto', fontSize: 12}}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (annotatingVerse === annKey) { setAnnotatingVerse(null) }
                          else { setAnnotatingVerse(annKey); setAnnotationNote(ann?.note || '') }
                        }}
                      >
                        &#128221; Nota
                      </button>
                    </div>
                    {annotatingVerse === annKey && (
                      <div className="annotation-form">
                        <textarea
                          className="annotation-input"
                          placeholder="Sua anotacao pessoal..."
                          value={annotationNote}
                          onChange={e => setAnnotationNote(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          rows={3}
                        />
                        <div className="actions-row">
                          <button className="btn" onClick={(e) => { e.stopPropagation(); saveAnnotationNote(verse) }}>Salvar nota</button>
                          <button className="btn" onClick={(e) => { e.stopPropagation(); setAnnotatingVerse(null) }}>Cancelar</button>
                        </div>
                      </div>
                    )}

                    {/* Camadas de suavizacao / normalizacao */}
                    <div className="layer-section">
                      <span className="settings-label">
                        Nivel de normalizacao PT-BR
                      </span>
                      <div className="layer-slider-row">
                        <span className="layer-label-edge">Literal</span>
                        <div className="layer-btns">
                          {[0, 1, 2, 3, 4, 5].map(level => {
                            const layerKey = `N${level}`
                            const available = level === 0 || !!layerTexts[verse.id]?.[layerKey]
                            return (
                              <button
                                key={level}
                                className={`layer-btn ${activeLayer === level ? 'active' : ''} ${!available && level > 0 ? 'unavailable' : ''}`}
                                onClick={(e) => { e.stopPropagation(); loadLayer(verse.id, level) }}
                                disabled={loadingLayer}
                                title={level === 0 ? 'Literal (original)' : LAYER_DESCRIPTIONS[level]}
                              >
                                {level}
                              </button>
                            )
                          })}
                        </div>
                        <span className="layer-label-edge">Suave</span>
                      </div>
                      <div className="layer-desc">N{activeLayer}: {LAYER_DESCRIPTIONS[activeLayer]}</div>
                      {activeLayer > 0 && layerTexts[verse.id]?.[`N${activeLayer}`] && (
                        <div className="layer-text">
                          <div className="layer-text-label">
                            N{activeLayer}: {LAYER_DESCRIPTIONS[activeLayer]}
                          </div>
                          <div className="layer-text-content">
                            {layerTexts[verse.id][`N${activeLayer}`]}
                          </div>
                        </div>
                      )}
                      {loadingLayer && <div className="spinner-small"></div>}
                    </div>

                    {loadingInterlinear && (
                      <div className="spinner-small"></div>
                    )}

                    {/* Comparative view toggle */}
                    {interlinear && !loadingInterlinear && (
                      <div className="actions-row" style={{marginTop: 8}}>
                        <button
                          className={`btn ${showComparative ? 'btn-active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); setShowComparative(!showComparative) }}
                          style={{fontSize: 12}}
                        >
                          &#9776; {showComparative ? 'Ocultar comparativo' : 'Vista comparativa'}
                        </button>
                      </div>
                    )}

                    {/* Comparative columns */}
                    {showComparative && interlinear && !loadingInterlinear && (
                      <div className="comparative-view">
                        <div className="comparative-col">
                          <div className="comparative-header">Original</div>
                          <div className="comparative-text" style={{direction: verse.language === 'GRC' ? 'ltr' : 'rtl'}}>
                            {interlinear.interlinear.map((t, i) => <span key={i}>{t.original} </span>)}
                          </div>
                        </div>
                        <div className="comparative-col">
                          <div className="comparative-header">Transliteracao</div>
                          <div className="comparative-text">
                            {interlinear.interlinear.map((t, i) => <span key={i}>{t.transliteration} </span>)}
                          </div>
                        </div>
                        <div className="comparative-col">
                          <div className="comparative-header">Literal PT-BR</div>
                          <div className="comparative-text">
                            {interlinear.interlinear.map((t, i) => <span key={i}>{t.gloss} </span>)}
                          </div>
                        </div>
                      </div>
                    )}

                    {interlinear && !loadingInterlinear && (
                      <div className="interlinear">
                        <span className="settings-label">Vista Interlinear — toque na palavra para detalhes</span>
                        <div className="interlinear-words">
                          {interlinear.interlinear.map((token, i) => (
                            <div
                              key={i}
                              className={`interlinear-word ${activeToken === i ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                const newIdx = activeToken === i ? null : i
                                setActiveToken(newIdx)
                                if (newIdx !== null && (token.original || token.lemma)) {
                                  lookupGlossary(token.original, token.lemma)
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  const newIdx = activeToken === i ? null : i
                                  setActiveToken(newIdx)
                                  if (newIdx !== null && (token.original || token.lemma)) {
                                    lookupGlossary(token.original, token.lemma)
                                  }
                                }
                              }}
                            >
                              <span className="int-original">{token.original}</span>
                              <span className="int-translit">{token.transliteration}</span>
                              <span className="int-gloss">{token.gloss}</span>
                              {activeToken === i && (() => {
                                const gKey = token.original || token.lemma
                                const gEntry = gKey ? glossaryCache[gKey] : undefined
                                return (
                                  <div className="glossary-panel">
                                    {token.lemma && (
                                      <div className="glossary-row">
                                        <span className="glossary-label">Forma normalizada</span>
                                        <span className="glossary-value">{token.lemma}</span>
                                      </div>
                                    )}
                                    {(token.morphDescription || token.morphology) && (
                                      <div className="glossary-row">
                                        <span className="glossary-label">Morfologia</span>
                                        <span className="glossary-value">{token.morphDescription || token.morphology}</span>
                                      </div>
                                    )}
                                    {loadingGlossary && gKey && gEntry === undefined && (
                                      <div className="spinner-small"></div>
                                    )}
                                    {gEntry && (
                                      <>
                                        {gEntry.translation && (
                                          <div className="glossary-row">
                                            <span className="glossary-label">Traducao (glossario)</span>
                                            <span className="glossary-value">{gEntry.translation}</span>
                                          </div>
                                        )}
                                        {gEntry.strongs && (
                                          <div className="glossary-row">
                                            <span className="glossary-label">Strong's</span>
                                            <span className="glossary-value glossary-strongs">{gEntry.strongs}</span>
                                          </div>
                                        )}
                                        {gEntry.notes && (
                                          <div className="glossary-row">
                                            <span className="glossary-label">Notas</span>
                                            <span className="glossary-value glossary-notes">{gEntry.notes}</span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                    {gKey && gEntry === null && !loadingGlossary && (
                                      <div className="glossary-row">
                                        <span className="glossary-empty">Sem entrada no glossario</span>
                                        {!suggestForm && (
                                          <button
                                            className="btn glossary-suggest-btn"
                                            onClick={(e) => { e.stopPropagation(); setSuggestForm({ word: gKey, translation: '', contributor: '' }) }}
                                          >
                                            Sugerir traducao
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    {suggestForm && suggestForm.word === gKey && (
                                      <div className="glossary-suggest-form" onClick={e => e.stopPropagation()}>
                                        <input
                                          className="glossary-suggest-input"
                                          type="text"
                                          placeholder="Traducao sugerida"
                                          value={suggestForm.translation}
                                          onChange={e => setSuggestForm(f => ({ ...f, translation: e.target.value }))}
                                        />
                                        <input
                                          className="glossary-suggest-input"
                                          type="text"
                                          placeholder="Seu nome (opcional)"
                                          value={suggestForm.contributor}
                                          onChange={e => setSuggestForm(f => ({ ...f, contributor: e.target.value }))}
                                        />
                                        <div className="actions-row">
                                          <button className="btn" onClick={submitSuggestion} disabled={suggestLoading || !suggestForm.translation}>
                                            {suggestLoading ? 'Enviando...' : 'Enviar'}
                                          </button>
                                          <button className="btn" onClick={() => setSuggestForm(null)}>Cancelar</button>
                                        </div>
                                      </div>
                                    )}
                                    {/* Lema explorer button */}
                                    {gKey && (
                                      <button
                                        className="btn glossary-search-btn"
                                        onClick={(e) => { e.stopPropagation(); searchLema(token.gloss || gKey) }}
                                        title="Buscar ocorrencias desta palavra"
                                      >
                                        &#128270; Ver ocorrencias
                                      </button>
                                    )}
                                  </div>
                                )
                              })()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
            })}

            <p style={{textAlign: 'center', marginTop: 48, color: 'var(--text2)', fontSize: '0.9em'}}>
              — Fim de {currentBook.name_pt} {chapter} —
            </p>
          </>
        )}
      </main>

      {/* Atribuição ao final do capítulo — An.C = Anderson Costa */}
      <div className="chapter-attribution">
        Bíblia Belem An.C 2025 — Tradução literal por Belem Anderson Costa
      </div>

      {/* Barra de atribuição fixa — marca d'água visual */}
      <div className="attribution-bar">
        Bíblia Belem An.C 2025 · Belem Anderson Costa · CC BY 4.0
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <button className="btn" onClick={goToPrev} aria-label="Capitulo anterior">&#8592; Anterior</button>
          <span className="footer-info">{currentBook.name_pt} {chapter}</span>
          <button className="btn" onClick={goToNext} aria-label="Proximo capitulo">Proximo &#8594;</button>
        </div>
      </footer>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* Search modal */}
      {showSearch && (
        <div className="search-overlay" onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]) }}>
          <div className="search-panel" onClick={e => e.stopPropagation()}>
            <div className="search-header">
              <span>&#128269;</span>
              <input
                ref={searchInputRef}
                className="search-input"
                type="text"
                placeholder="Buscar na Biblia..."
                value={searchQuery}
                onChange={e => handleSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); setSearchResults([]) } }}
              />
              <button className="btn-icon" onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]) }} aria-label="Fechar busca">&#10005;</button>
            </div>
            <div className="search-filter-row">
              {['all', 'AT', 'NT'].map(f => (
                <button
                  key={f}
                  className={`search-filter-btn ${searchFilter === f ? 'active' : ''}`}
                  onClick={() => { setSearchFilter(f); if (searchQuery.length >= 2) handleSearchInput(searchQuery, f) }}
                >
                  {f === 'all' ? 'Toda Biblia' : f === 'AT' ? 'Antigo T.' : 'Novo T.'}
                </button>
              ))}
            </div>
            <div className="search-results">
              {searchLoading && <div className="spinner-small"></div>}
              {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="search-empty">Nenhum resultado para &ldquo;{searchQuery}&rdquo;</div>
              )}
              {searchResults.map((r, i) => (
                <div key={i} className="search-result" onClick={() => navigateToResult(r)}>
                  <div className="search-result-ref">{r.book?.toUpperCase()} {r.chapter}:{r.verse}</div>
                  <div className="search-result-text" dangerouslySetInnerHTML={{ __html: r.highlight || r.text }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GoTo modal */}
      {showGoto && (
        <div className="goto-overlay" onClick={() => { setShowGoto(false); setGotoValue(''); setGotoError('') }}>
          <div className="goto-panel" onClick={e => e.stopPropagation()}>
            <h3>Ir para...</h3>
            <input
              ref={gotoInputRef}
              className="goto-input"
              type="text"
              placeholder="Ex: Joao 3, Gn 1, Sl 23"
              value={gotoValue}
              onChange={e => { setGotoValue(e.target.value); setGotoError('') }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleGoto(gotoValue)
                if (e.key === 'Escape') { setShowGoto(false); setGotoValue(''); setGotoError('') }
              }}
            />
            {gotoError && <div className="goto-error">{gotoError}</div>}
            <div className="goto-hint">Nome do livro + capitulo. Aceita abreviacoes (Gn, Ex, Jo, Rm...)</div>
          </div>
        </div>
      )}

      {/* Shortcuts modal */}
      {showShortcuts && (
        <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-panel" onClick={e => e.stopPropagation()}>
            <h3>Atalhos de Teclado</h3>
            <div className="shortcut-row"><span>Capitulo anterior</span><span className="shortcut-key">&#8592;</span></div>
            <div className="shortcut-row"><span>Proximo capitulo</span><span className="shortcut-key">&#8594;</span></div>
            <div className="shortcut-row"><span>Buscar</span><span className="shortcut-key">/</span></div>
            <div className="shortcut-row"><span>Ir para...</span><span className="shortcut-key">G</span></div>
            <div className="shortcut-row"><span>Alternar tema</span><span className="shortcut-key">T</span></div>
            <div className="shortcut-row"><span>Alternar fonte</span><span className="shortcut-key">F</span></div>
            <div className="shortcut-row"><span>Favoritos</span><span className="shortcut-key">B</span></div>
            <div className="shortcut-row"><span>Aleatorio</span><span className="shortcut-key">R</span></div>
            <div className="shortcut-row"><span>Plano de leitura</span><span className="shortcut-key">P</span></div>
            <div className="shortcut-row"><span>Fechar modal</span><span className="shortcut-key">Esc</span></div>
            <div style={{marginTop: 16, textAlign: 'center'}}>
              <button className="btn" onClick={() => setShowShortcuts(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Favorites modal */}
      {showFavorites && (
        <div className="favorites-overlay" onClick={() => setShowFavorites(false)}>
          <div className="favorites-panel" onClick={e => e.stopPropagation()}>
            <div className="favorites-header">
              <h3>Favoritos ({favorites.length})</h3>
              <button className="btn-icon" onClick={() => setShowFavorites(false)} aria-label="Fechar favoritos">&#10005;</button>
            </div>
            <div className="favorites-list">
              {favorites.length === 0 && (
                <div className="favorites-empty">Nenhum favorito salvo. Toque em um versiculo e depois em &ldquo;Favoritar&rdquo;.</div>
              )}
              {favorites.map((fav) => (
                <div key={fav.key} className="favorite-item" onClick={() => navigateToFavorite(fav)}>
                  <div className="favorite-text">
                    <div className="favorite-ref">{fav.bookName} {fav.chapter}:{fav.verse}</div>
                    <div className="favorite-verse">{fav.text}</div>
                  </div>
                  <button
                    className="favorite-remove"
                    onClick={(e) => { e.stopPropagation(); setFavorites(favorites.filter(f => f.key !== fav.key)); showToast('Removido') }}
                    aria-label="Remover favorito"
                    title="Remover"
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History modal */}
      {showHistory && (
        <div className="search-overlay" onClick={() => setShowHistory(false)}>
          <div className="search-panel" onClick={e => e.stopPropagation()} style={{maxHeight: '80vh'}}>
            <div className="favorites-header">
              <h3>Historico de Leitura</h3>
              <button className="btn-icon" onClick={() => setShowHistory(false)} aria-label="Fechar">&#10005;</button>
            </div>
            <div className="favorites-list">
              {books.length > 0 && books.map(b => {
                const progress = getBookProgress(b.code, b.chapters_count)
                if (progress === 0) return null
                return (
                  <div key={b.code} className="history-book-item">
                    <div className="history-book-header">
                      <span className="history-book-name">{b.name_pt}</span>
                      <span className="history-book-pct">{progress}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{width: `${progress}%`}} />
                    </div>
                    <div className="history-chapters">
                      {Array.from({length: b.chapters_count}, (_, i) => i + 1).map(ch => (
                        <button
                          key={ch}
                          className={`history-ch-btn ${readChapters[`${b.code}_${ch}`] ? 'read' : ''}`}
                          onClick={() => {
                            const book = books.find(bk => bk.code === b.code)
                            if (book) { setCurrentBook(book); setChapter(ch); setShowHistory(false) }
                          }}
                          title={`Cap. ${ch}${readChapters[`${b.code}_${ch}`] ? ' (lido)' : ''}`}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
              {Object.keys(readChapters).length === 0 && (
                <div className="favorites-empty">Nenhum capitulo lido ainda. Comece a navegar pela Biblia!</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reading Plan modal */}
      {showPlan && (
        <div className="search-overlay" onClick={() => setShowPlan(false)}>
          <div className="search-panel" onClick={e => e.stopPropagation()} style={{maxHeight: '80vh'}}>
            <div className="favorites-header">
              <h3>Plano de Leitura</h3>
              <button className="btn-icon" onClick={() => setShowPlan(false)} aria-label="Fechar">&#10005;</button>
            </div>
            <div className="favorites-list" style={{padding: 16}}>
              {!activePlan ? (
                <div className="plan-selector">
                  <p style={{color: 'var(--text2)', fontSize: 14, marginBottom: 16}}>Escolha um plano de leitura:</p>
                  {Object.entries(READING_PLANS).map(([key, plan]) => (
                    <button
                      key={key}
                      className="btn plan-option"
                      onClick={() => { setActivePlan(key); setPlanProgress({}) }}
                    >
                      {plan.name} ({plan.perDay} cap/dia)
                    </button>
                  ))}
                </div>
              ) : (
                <div className="plan-active">
                  <div className="plan-active-header">
                    <span style={{fontWeight: 600}}>{READING_PLANS[activePlan]?.name}</span>
                    <button className="btn" style={{fontSize: 11}} onClick={() => { setActivePlan(null); setPlanProgress({}) }}>Trocar plano</button>
                  </div>
                  <div className="plan-progress-summary">
                    {(() => {
                      const total = getPlanTotalDays(activePlan)
                      const done = Object.keys(planProgress).filter(k => planProgress[k]).length
                      const pct = total ? Math.round((done / total) * 100) : 0
                      return (
                        <>
                          <div className="progress-track" style={{marginBottom: 8}}>
                            <div className="progress-fill" style={{width: `${pct}%`}} />
                          </div>
                          <span style={{fontSize: 12, color: 'var(--text2)'}}>{done} de {total} dias ({pct}%)</span>
                        </>
                      )
                    })()}
                  </div>
                  <div className="plan-days" style={{maxHeight: '50vh', overflowY: 'auto'}}>
                    {Array.from({length: Math.min(getPlanTotalDays(activePlan), 365)}, (_, d) => d + 1).map(day => {
                      const chapters = getPlanDayChapters(activePlan, day)
                      if (!chapters.length) return null
                      return (
                        <div key={day} className={`plan-day ${planProgress[day] ? 'done' : ''}`}>
                          <label className="plan-day-label">
                            <input
                              type="checkbox"
                              checked={!!planProgress[day]}
                              onChange={() => setPlanProgress(p => ({ ...p, [day]: !p[day] }))}
                            />
                            <span className="plan-day-num">Dia {day}</span>
                          </label>
                          <span className="plan-day-chapters">
                            {chapters.map(c => `${c.bookName} ${c.chapter}`).join(', ')}
                          </span>
                          {!planProgress[day] && chapters.length > 0 && (
                            <button
                              className="btn plan-day-go"
                              onClick={() => {
                                const c = chapters[0]
                                const book = books.find(b => b.code === c.bookCode)
                                if (book) { setCurrentBook(book); setChapter(c.chapter); setShowPlan(false) }
                              }}
                            >
                              Ir
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export modal */}
      {showExport && (
        <div className="shortcuts-overlay" onClick={() => setShowExport(false)}>
          <div className="shortcuts-panel" onClick={e => e.stopPropagation()}>
            <h3>Exportar {currentBook.name_pt} {chapter}</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16}}>
              <button className="btn" onClick={() => exportChapter('copy')}>&#128203; Copiar texto do capitulo</button>
              <button className="btn" onClick={() => exportChapter('print')}>&#128424; Imprimir capitulo</button>
              <button className="btn" onClick={() => setShowExport(false)} style={{marginTop: 8}}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
