-- Migration: Tabela de Glossário para contribuição comunitária
-- Bíblia Belém An.C 2025

-- Tabela principal do glossário
CREATE TABLE IF NOT EXISTS glossary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL UNIQUE,           -- Palavra grega/hebraica
  translation TEXT NOT NULL,           -- Tradução PT-BR literal
  strongs TEXT,                        -- Número Strong's (ex: G3056)
  notes TEXT,                          -- Observações/justificativas
  contributor TEXT DEFAULT 'system',   -- Quem contribuiu
  status TEXT DEFAULT 'approved',      -- approved, pending, rejected
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Tabela de sugestões (para revisão)
CREATE TABLE IF NOT EXISTS glossary_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  strongs TEXT,
  notes TEXT,
  contributor TEXT DEFAULT 'anonymous',
  status TEXT DEFAULT 'pending',       -- pending, approved, rejected
  reviewer TEXT,                       -- Quem revisou
  reviewed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_glossary_word ON glossary(word);
CREATE INDEX IF NOT EXISTS idx_glossary_strongs ON glossary(strongs);
CREATE INDEX IF NOT EXISTS idx_glossary_status ON glossary(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON glossary_suggestions(status);

-- Inserir dados iniciais do glossário (palavras mais comuns)
INSERT OR IGNORE INTO glossary (word, translation, strongs, contributor, status) VALUES
('Ἀποκάλυψις', 'Revelação', 'G602', 'system', 'approved'),
('ἄγγελος', 'anjo', 'G32', 'system', 'approved'),
('ἅγιος', 'santo', 'G40', 'system', 'approved'),
('αἰών', 'era', 'G165', 'system', 'approved'),
('ἀμήν', 'amém', 'G281', 'system', 'approved'),
('Ἀρνίον', 'Cordeiro', 'G721', 'system', 'approved'),
('βασιλεία', 'reino', 'G932', 'system', 'approved'),
('δόξα', 'glória', 'G1391', 'system', 'approved'),
('δοῦλος', 'servo', 'G1401', 'system', 'approved'),
('ἐκκλησία', 'assembleia', 'G1577', 'system', 'approved'),
('ἑπτά', 'sete', 'G2033', 'system', 'approved'),
('θρόνος', 'trono', 'G2362', 'system', 'approved'),
('κύριος', 'Senhor', 'G2962', 'system', 'approved'),
('λόγος', 'palavra', 'G3056', 'system', 'approved'),
('μαρτυρία', 'testemunho', 'G3141', 'system', 'approved'),
('νικάω', 'vencer', 'G3528', 'system', 'approved'),
('οὐρανός', 'céu', 'G3772', 'system', 'approved'),
('Παντοκράτωρ', 'Todo-Poderoso', 'G3841', 'system', 'approved'),
('πνεῦμα', 'espírito', 'G4151', 'system', 'approved'),
('φωνή', 'voz', 'G5456', 'system', 'approved');
