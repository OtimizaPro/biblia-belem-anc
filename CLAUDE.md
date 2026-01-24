# CLAUDE.md - Bible Belem AnC 2025

> LEIA ESTE ARQUIVO ANTES DE QUALQUER ACAO NESTE MODULO

**Atualizado:** 22 de Janeiro de 2026

---

Projeto de traducao literal rigida da Biblia do grego koine e hebraico biblico para portugues brasileiro.

> **Filosofia:** "Voce le. E a interpretacao e sua."

**Posicao no Ecossistema:** `Site -> Blog -> Podcast -> Livrinho -> **Biblia** -> Comunidade -> Exeg.AI`

**Branch de Producao:** `main`

**Credenciais:** 1Password CLI (`op`)

---

## Inicializacao do Projeto

```bash
# 1. Instalar dependencias (se necessario)
npm install

# 2. Iniciar API (conecta D1 producao)
npm run dev:remote

# 3. Iniciar Leitor Kindle (em outro terminal)
cd leitor-kindle && npm run dev

# 4. Abrir no browser
# API: http://localhost:8787
# Leitor: http://localhost:4321
```

---

## Documentacao Detalhada (Atalhos)

| Arquivo | Descricao |
|---------|-----------|
| [README.md](README.md) | Documentacao completa da API (557 linhas) |
| [glossary/README.md](glossary/README.md) | Guia do sistema de glossario (139 linhas) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guia de contribuicao para desenvolvedores |
| [CHANGELOG_TRANSLATION_NOTES.md](CHANGELOG_TRANSLATION_NOTES.md) | Historico de alteracoes nas notas de traducao |
| [CHANGELOG_VERSE_REMOVAL.md](CHANGELOG_VERSE_REMOVAL.md) | Decisao historica: remocao de marcadores de versiculos |
| [docs/OPENAPI_NEW_ENDPOINTS.txt](docs/OPENAPI_NEW_ENDPOINTS.txt) | Novos endpoints OpenAPI |
| [.AnC Documentos/Registro tecnico do projeto.txt](.AnC%20Documentos/Registro%20tecnico%20do%20projeto.txt) | Registro tecnico completo (130 linhas) |
| [.AnC Documentos/Repos.txt](.AnC%20Documentos/Repos.txt) | Links, URLs e comandos uteis (77 linhas) |

---

## Comandos Rapidos

| Acao | Comando |
|------|---------|
| **API Dev Local** | `npm run dev` (porta 8787) |
| **API Dev Remoto** | `npm run dev:remote` (conecta D1 producao) |
| **API Deploy** | `npm run deploy` |
| **Tradutor Web** | `node tradutor-web/server.mjs` (porta 3333) |
| **Leitor Kindle** | `cd leitor-kindle && npm run dev` (porta 4321) |
| **Lint** | `npm run lint` |
| **Format** | `npm run format` |
| **Logs** | `npm run tail` |

### Deploy

```bash
# Deploy API para Cloudflare Workers
npm run deploy

# Deploy Site (leitor em producao) - executar no modulo Site
cd "../Site aculpaedasovelhas.org"
wrangler pages deploy . --project-name=aculpaedasovelhas --branch=master --commit-dirty=true
```

---

## Banco de Dados D1

- **Nome**: `biblia-belem`
- **ID**: `c068f4c2-6086-4755-a312-c3a5c5685345`
- **CLI**: `npx wrangler d1 execute biblia-belem --remote --command "SQL"`

| Tabela | Descricao |
|--------|-----------|
| `books` | 66 livros da Biblia |
| `verses` | Versiculos (~31.156) |
| `tokens` | Palavras/tokens (~441.646) |
| `glossary` | Glossario de traducoes |

**Progresso atual**: ~57% traduzido

---

## Estrutura Principal

```
src/                    # API Cloudflare Workers (Hono + TypeScript)
  index.ts             # Entry point
  types.ts             # TypeScript types
  routes/              # books, verses, tokens, glossary, glosses, translation-info
  data/                # translation-notes.json, editorial-decisions.json
  docs/                # openapi.ts
glossary/              # greek.json, hebrew.json, keep_original.json
scripts/               # Scripts de traducao e utilitarios
tradutor-web/          # Interface web + executavel Windows (porta 3333)
leitor-kindle/         # Leitor React estilo Kindle (porta 4321)
migrations/            # Migracoes do banco D1
.AnC Documentos/       # Documentacao tecnica interna
```

---

## Scripts de Traducao (scripts/)

| Script | Uso |
|--------|-----|
| `claude-translations.mjs [BOOK]` | Traducao via Claude API |
| `ollama-translate.mjs [BOOK]` | Traducao local (Ollama + GPU) |
| `auto-translate.mjs` | Traducao automatica em lote |
| `batch-translate-db.mjs` | Traducao batch direto no D1 |
| `apply-glossary.mjs` | Aplicar glossario existente |
| `list-untranslated.mjs` | Listar palavras nao traduzidas |
| `export-all-books.mjs` | Exportar todos os livros |
| `rebuild-verse-translations.mjs` | Reconstruir traducoes |
| `import-glossary-to-d1.mjs` | Importar glossario para D1 |
| `ollama-benchmark.mjs` | Benchmark de modelos Ollama |

---

## API Endpoints

### Livros e Versiculos

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/health` | Health check |
| GET | `/docs` | Documentacao OpenAPI |
| GET | `/api/v1/books` | Listar livros |
| GET | `/api/v1/books/:code` | Detalhes de um livro |
| GET | `/api/v1/verses/:book/:chapter` | Versiculos do capitulo |
| GET | `/api/v1/verses/:book/:chapter/:verse` | Versiculo unico + tokens |
| GET | `/api/v1/verses/search?q=termo` | Busca textual |

### Tokens e Analise

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/tokens/:verseId` | Tokens de um versiculo |
| GET | `/api/v1/tokens/:verseId/interlinear` | Vista interlinear |
| GET | `/api/v1/tokens/:verseId/morphology` | Analise morfologica |
| GET | `/api/v1/glosses/verse/:verseId` | Glosses de versiculo |
| GET | `/api/v1/glosses/layers` | Camadas disponiveis (N0-N5) |

### Glossario

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/glossary` | Listar glossario |
| GET | `/api/v1/glossary/:word` | Buscar traducao de palavra |
| GET | `/api/v1/glossary/search` | Buscar no glossario |
| POST | `/api/v1/glossary/suggest` | Sugerir nova traducao |

### Informacoes de Traducao

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/translation-info` | Notas de traducao |
| GET | `/api/v1/translation-info/editorial-markers` | Marcadores editoriais ([OBJ], etc) |
| GET | `/api/v1/translation-info/words-not-translated` | Palavras nao traduzidas |
| GET | `/api/v1/translation-info/word/:word` | Consulta palavra especifica |

---

## Configuracao Tecnica

| Item            | Valor                                    |
|-----------------|------------------------------------------|
| **Cache**       | 1 hora (3600s) no edge Cloudflare        |
| **CORS**        | Aceita qualquer origem (`*`)             |
| **Autenticacao**| Nenhuma (API publica, somente leitura)   |

---

## Principios da Traducao

1. **Literalidade rigida** - Palavra por palavra
2. **Fidelidade ao codice** - Sem suavizacao
3. **Zero interpretacao** - Sem interferencia do tradutor
4. **Transparencia** - Intervencoes sinalizadas com `[ ]`
5. **Sem versiculos** - Estrutura capitular original

---

## Palavras Nao Traduzidas

| Palavra | Motivo |
|---------|--------|
| `yhwh` | Tetragramaton hebraico |
| `Theos` | Termo grego para Deus |
| `Iesous` | Nome grego de Jesus |
| `Christos` | Titulo grego (ungido) |

---

## URLs de Producao

| Servico               | URL                                                      |
|-----------------------|----------------------------------------------------------|
| **API (Workers)**     | <https://biblia-belem-api.anderson-282.workers.dev>      |
| **Leitor Biblia**     | <https://aculpaedasovelhas.org/ler-biblia>               |
| **Leitor Biblia Alt** | <https://aculpaedasovelhas.org/biblia-belem.html>        |
| **Documentacao API**  | <https://biblia-belem-api.anderson-282.workers.dev/docs> |
| **GitHub**            | <https://github.com/OtimizaPro/biblia-belem-anc>         |

---

## Fontes Textuais

| Codigo | Fonte |
|--------|-------|
| BHSA | Biblia Hebraica Stuttgartensia |
| WLC | Westminster Leningrad Codex |
| SBLGNT | SBL Greek New Testament |
| TR1550 | Textus Receptus 1550 |
| Nestle1904 | Critica textual |

---

## Dependencias Principais

| Pacote         | Versao | Uso                         |
|----------------|--------|-----------------------------|
| Hono           | 4.6.0  | Framework web para Workers  |
| TypeScript     | 5.7.0  | Tipagem estatica            |
| Wrangler       | 4.0.0  | CLI Cloudflare              |
| Anthropic SDK  | 0.71.2 | Traducao via Claude API     |
| Cloudflare D1  | -      | Banco de dados SQLite       |

---

## Aprendizados da IA (Erros e Correcoes)

### 2026-01-22: Confusao API vs Leitor

**Erro:** Ao iniciar o projeto, abri a URL da API (`biblia-belem-api.anderson-282.workers.dev`) ao inves do Leitor Kindle.

**Causa:** Nao distingui corretamente entre:

- **API** = Backend REST (porta 8787) - retorna JSON
- **Leitor** = Frontend React (porta 4321) - interface visual

**Correcao:**

| Componente    | Comando                            | Porta | Tipo     |
|---------------|------------------------------------|-------|----------|
| API           | `npm run dev:remote`               | 8787  | Backend  |
| Leitor Kindle | `cd leitor-kindle && npm run dev`  | 4321  | Frontend |

**Regra:** Para abrir interface cliente, usar `leitor-kindle/` (localhost:4321), NAO a URL da API.

### 2026-01-22: Deploy Cloudflare Pages - Branch Correto

**Erro:** Site com ERR_TOO_MANY_REDIRECTS apos push para `main`.

**Causa:** Cloudflare Pages estava configurado com Production Branch = `master`, nao `main`.

**Solucao:**

```bash
# Deploy manual para branch correto (master = production)
wrangler pages deploy . --project-name=aculpaedasovelhas --branch=master --commit-dirty=true
```

**Regra:** Sempre verificar qual branch e o Production antes de fazer push:

```bash
wrangler pages project list  # Ver configuracao
```

| Projeto           | Production Branch |
|-------------------|-------------------|
| aculpaedasovelhas | master            |
| biblia-belem-anc  | main              |

---

## Licenca

CC BY 4.0 - Atribuicao requerida

Copyright 2025 Anderson Costa Belem - A Culpa e das Ovelhas
