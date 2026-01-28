# CLAUDE.md - Biblia Belem AnC 2025

> LEIA ESTE ARQUIVO ANTES DE QUALQUER ACAO NESTE MODULO

**Atualizado:** 26 de Janeiro de 2026

---

## Resumo Executivo

| Item | Valor |
|------|-------|
| **Projeto** | API REST da traducao biblica literal rigida |
| **Filosofia** | "Voce le. E a interpretacao e sua." |
| **Ecossistema** | Site -> Blog -> Podcast -> Livrinho -> **Biblia** -> Comunidade -> Exeg.AI |
| **Branch** | `main` |
| **Credenciais** | 1Password CLI (`op`) |
| **Progresso** | ~57% traduzido |

---

## Inicializacao Rapida

```bash
npm install                              # Instalar deps
npm run dev:remote                       # API (porta 8787)
cd leitor-kindle && npm run dev          # Leitor (porta 4321)
```

---

## Atalhos para Documentacao

> **IMPORTANTE:** Use estes atalhos em vez de duplicar conteudo aqui

| Categoria | Arquivo | Linhas | Conteudo |
|-----------|---------|--------|----------|
| **API Completa** | [README.md](README.md) | 607 | Endpoints, exemplos, respostas |
| **Glossario** | [glossary/README.md](glossary/README.md) | 139 | Sistema de traducao literal |
| **Contribuicao** | [CONTRIBUTING.md](CONTRIBUTING.md) | 295 | Setup dev, PRs, tradutores |
| **Roadmap** | [ROADMAP.md](ROADMAP.md) | 162 | Planejamento Q1-Q4 2026 |
| **Seguranca** | [SECURITY.md](SECURITY.md) | 114 | Politica de vulnerabilidades |
| **Auditoria** | [SECURITY-AUDIT.md](SECURITY-AUDIT.md) | 363 | SQL injection, XSS, deps |
| **Changelog Notas** | [CHANGELOG_TRANSLATION_NOTES.md](CHANGELOG_TRANSLATION_NOTES.md) | 123 | Marcadores [OBJ], yhwh |
| **Changelog Versiculos** | [CHANGELOG_VERSE_REMOVAL.md](CHANGELOG_VERSE_REMOVAL.md) | 84 | Decisao remocao de versiculos |
| **OpenAPI Novos** | [docs/OPENAPI_NEW_ENDPOINTS.txt](docs/OPENAPI_NEW_ENDPOINTS.txt) | 50 | Endpoints editorial-decisions |
| **Registro Tecnico** | [.AnC Documentos/Registro tecnico do projeto.txt](.AnC%20Documentos/Registro%20tecnico%20do%20projeto.txt) | 130 | Stack, objetivo, licenca |
| **Repos/URLs** | [.AnC Documentos/Repos.txt](.AnC%20Documentos/Repos.txt) | 77 | Cloudflare, GitHub, URLs |
| **Wiki** | [wiki-content/Home.md](wiki-content/Home.md) | 50 | Navegacao wiki |

---

## Comandos Essenciais

| Acao | Comando |
|------|---------|
| API Dev (remoto) | `npm run dev:remote` |
| API Deploy | `npm run deploy` |
| Leitor Kindle | `cd leitor-kindle && npm run dev` |
| Tradutor Web | `node tradutor-web/server.mjs` |
| Lint/Format | `npm run lint && npm run format` |
| Logs Workers | `npm run tail` |

---

## Deploy

```bash
# API (Cloudflare Workers)
npm run deploy

# Site (Cloudflare Pages) - executar no modulo Site
cd "../Site aculpaedasovelhas.org"
wrangler pages deploy . --project-name=aculpaedasovelhas --branch=master --commit-dirty=true
```

---

## Banco de Dados D1

| Item | Valor |
|------|-------|
| Nome | `biblia-belem` |
| ID | `c068f4c2-6086-4755-a312-c3a5c5685345` |
| CLI | `npx wrangler d1 execute biblia-belem --remote --command "SQL"` |

| Tabela | Quantidade |
|--------|------------|
| books | 66 |
| verses | 31.156 |
| tokens | 441.646 |
| glossary | variavel |

---

## Estrutura do Projeto

```
src/                    # API Hono + TypeScript (Cloudflare Workers)
  index.ts             # Entry point
  types.ts             # TypeScript types
  routes/              # books, verses, tokens, glossary, glosses, translation-info
  data/                # translation-notes.json, editorial-decisions.json
  docs/                # openapi.ts
glossary/              # greek.json, hebrew.json, keep_original.json
scripts/               # Traducao: claude-translations.mjs, ollama-translate.mjs, etc
tradutor-web/          # Interface web (porta 3333)
leitor-kindle/         # Leitor React Kindle-style (porta 4321)
migrations/            # Migracoes D1
.AnC Documentos/       # Documentacao interna
```

---

## Endpoints Principais

| Metodo | Endpoint | Uso |
|--------|----------|-----|
| GET | `/health` | Health check |
| GET | `/docs` | OpenAPI spec |
| GET | `/api/v1/books` | Listar livros |
| GET | `/api/v1/verses/:book/:chapter` | Versiculos |
| GET | `/api/v1/verses/search?q=termo` | Busca |
| GET | `/api/v1/tokens/:verseId` | Tokens |
| GET | `/api/v1/glossary` | Glossario |
| GET | `/api/v1/translation-info` | Notas traducao |

> **Documentacao completa:** Ver [README.md](README.md) secao Endpoints

---

## Scripts de Traducao

| Script | Uso |
|--------|-----|
| `claude-translations.mjs [BOOK]` | Claude API |
| `ollama-translate.mjs [BOOK]` | Ollama local |
| `batch-translate-db.mjs` | Batch D1 |
| `apply-glossary.mjs` | Aplicar glossario |
| `list-untranslated.mjs` | Listar pendentes |
| `export-all-books.mjs` | Exportar livros |

---

## URLs de Producao

| Servico | URL |
|---------|-----|
| API Workers | https://biblia-belem-api.anderson-282.workers.dev |
| API Custom | https://biblia.aculpaedasovelhas.org |
| Leitor | https://aculpaedasovelhas.org/ler-biblia.html |
| Docs | https://biblia.aculpaedasovelhas.org/docs |
| GitHub | https://github.com/OtimizaPro/biblia-belem-anc |

---

## Stack Tecnica

| Item | Valor |
|------|-------|
| Runtime | Cloudflare Workers |
| Framework | Hono 4.6.0 |
| Linguagem | TypeScript 5.7.0 |
| Banco | Cloudflare D1 (SQLite) |
| CLI | Wrangler 4.0.0 |
| Traducao | Anthropic SDK 0.71.2 |

---

## Principios da Traducao

1. **Literalidade rigida** - Palavra por palavra
2. **Fidelidade ao codice** - Sem suavizacao
3. **Zero interpretacao** - Sem interferencia do tradutor
4. **Transparencia** - Intervencoes com `[ ]`
5. **Sem versiculos** - Estrutura capitular original

### Palavras Nao Traduzidas

| Palavra | Motivo |
|---------|--------|
| yhwh | Tetragramaton hebraico |
| Theos | Termo grego - Deus |
| Iesous | Nome grego - Jesus |
| Christos | Titulo grego - ungido |

### Fontes Textuais

BHSA, WLC, SBLGNT, TR1550, Nestle1904

---

## Aprendizados da IA

### API vs Leitor (Confusao Comum)

| Componente | Comando | Porta | Tipo |
|------------|---------|-------|------|
| API | `npm run dev:remote` | 8787 | Backend JSON |
| Leitor | `cd leitor-kindle && npm run dev` | 4321 | Frontend React |

**Regra:** Interface visual = `leitor-kindle/` (localhost:4321)

### Deploy Branches

| Projeto | Production Branch |
|---------|-------------------|
| aculpaedasovelhas (Pages) | master |
| biblia-belem-anc (Workers) | main |

---

## Licenca

CC BY 4.0 - Copyright 2025 Anderson Costa Belem
