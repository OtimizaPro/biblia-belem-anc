# CLAUDE.md - Biblia Belem AnC 2025

> LEIA ESTE ARQUIVO ANTES DE QUALQUER ACAO NESTE MODULO

**Atualizado:** 27 de Fevereiro de 2026

---

## Resumo Executivo

| Item | Valor |
|------|-------|
| **Projeto** | API REST da traducao biblica literal rigida |
| **Filosofia** | "Voce le. E a interpretacao e sua." |
| **Ecossistema** | Site -> Blog -> Podcast -> Livrinho -> **Biblia** -> Comunidade -> Exeg.AI |
| **Branch** | `main` |
| **Credenciais** | 1Password CLI (`op`) |
| **Progresso** | 100% tokens traduzidos (441.646/441.646) |
| **GitHub** | [biblia-belem-anc](https://github.com/OtimizaPro/biblia-belem-anc) (Public) |
| **Licenca** | CC BY 4.0 |

---

## Inicializacao Rapida

```bash
npm install                              # Instalar deps
npm run dev:remote                       # API (porta 8787)
cd leitor-kindle && npm run dev          # Leitor (porta 4321)
node tradutor-web/server.mjs             # Tradutor Web (porta 3333)
```

---

## Atalhos para Documentacao

> **IMPORTANTE:** Use estes atalhos em vez de duplicar conteudo aqui.
> Arquivos grandes NAO devem ser lidos inteiros — use offset/limit.

### Documentacao Principal

| Categoria | Arquivo | Linhas | Conteudo |
|-----------|---------|--------|----------|
| **API Completa** | [README.md](README.md) | 470 | Endpoints, exemplos, respostas, badges |
| **Glossario** | [glossary/README.md](glossary/README.md) | 138 | Sistema de traducao literal |
| **Contribuicao** | [CONTRIBUTING.md](CONTRIBUTING.md) | 294 | Setup dev, PRs, tradutores |
| **Roadmap** | [ROADMAP.md](ROADMAP.md) | 161 | Planejamento Q1-Q4 2026 |
| **Seguranca** | [SECURITY.md](SECURITY.md) | 113 | Politica de vulnerabilidades |
| **Auditoria** | [SECURITY-AUDIT.md](SECURITY-AUDIT.md) | 362 | SQL injection, XSS, deps |
| **Codigo Conduta** | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | 93 | Diretrizes da comunidade |

### Changelogs e Decisoes

| Categoria | Arquivo | Linhas | Conteudo |
|-----------|---------|--------|----------|
| **Changelog Notas** | [CHANGELOG_TRANSLATION_NOTES.md](CHANGELOG_TRANSLATION_NOTES.md) | 122 | Marcadores [OBJ], yhwh |
| **Changelog Versiculos** | [CHANGELOG_VERSE_REMOVAL.md](CHANGELOG_VERSE_REMOVAL.md) | 83 | Decisao remocao de versiculos |
| **OpenAPI Novos** | [docs/OPENAPI_NEW_ENDPOINTS.txt](docs/OPENAPI_NEW_ENDPOINTS.txt) | 46 | Endpoints editorial-decisions |

### Documentacao Editorial (arquivos grandes — ler com offset/limit)

| Categoria | Arquivo | Linhas | Conteudo |
|-----------|---------|--------|----------|
| **Varredura Editorial** | [Editoracao/VARREDURA_EDITORIAL.md](Editora%C3%A7%C3%A3o/VARREDURA_EDITORIAL.md) | 785 | Regras editoriais, 4 passagens, checklist |
| **Agente Editoracao** | [Editoracao/AGENTE DE EDITORACAO DE LIVROS.txt](Editora%C3%A7%C3%A3o/AGENTE%20DE%20EDITORA%C3%87%C3%83O%20DE%20LIVROS.txt) | 405 | Agente de editoracao de livros |
| **CLAUDE.md Editorial** | [Editoracao/CLAUDE.md](Editora%C3%A7%C3%A3o/CLAUDE.md) | 111 | Indice da pasta O Livrinho/Editoracao |

### Documentacao Interna

| Categoria | Arquivo | Linhas | Conteudo |
|-----------|---------|--------|----------|
| **Registro Tecnico** | [.AnC Documentos/Registro tecnico do projeto.txt](.AnC%20Documentos/Registro%20tecnico%20do%20projeto.txt) | 129 | Stack, objetivo, licenca |
| **Repos/URLs** | [.AnC Documentos/Repos.txt](.AnC%20Documentos/Repos.txt) | 76 | Cloudflare, GitHub, URLs |
| **Wiki** | [wiki-content/Home.md](wiki-content/Home.md) | 51 | Navegacao wiki |

### Templates GitHub

| Categoria | Arquivo | Linhas |
|-----------|---------|--------|
| **PR Template** | [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) | 51 |
| **Bug Report** | [.github/ISSUE_TEMPLATE/bug-report.yml](.github/ISSUE_TEMPLATE/bug-report.yml) | 60 |
| **Feature Request** | [.github/ISSUE_TEMPLATE/feature-request.yml](.github/ISSUE_TEMPLATE/feature-request.yml) | 46 |
| **Sugestao Traducao** | [.github/ISSUE_TEMPLATE/translation-suggestion.yml](.github/ISSUE_TEMPLATE/translation-suggestion.yml) | 117 |
| **Funding** | [.github/FUNDING.yml](.github/FUNDING.yml) | 7 |

---

## Comandos Essenciais

| Acao | Comando |
|------|---------|
| API Dev (local) | `npm run dev` |
| API Dev (remoto) | `npm run dev:remote` |
| API Deploy | `npm run deploy` |
| Leitor Kindle | `cd leitor-kindle && npm run dev` |
| Tradutor Web | `node tradutor-web/server.mjs` |
| Tradutor Desktop | `cd tradutor-app && npm start` |
| Lint | `npm run lint` |
| Lint Fix | `npm run lint:fix` |
| Format | `npm run format` |
| Format Check | `npm run format:check` |
| Type Check | `npm run typecheck` |
| Build (dry-run) | `npm run build` |
| CI Completo | `npm run ci` |
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

## CI/CD (GitHub Actions)

| Workflow | Trigger | Acoes |
|----------|---------|-------|
| **CI** (ci.yml) | Push/PR em `main`, `develop` | lint, format:check, typecheck, build dry-run |
| **Deploy** (deploy.yml) | Push em `main` | Deploy via `cloudflare/wrangler-action@v3` |

**Secrets necessarios:** `CF_API_TOKEN`, `CF_ACCOUNT_ID`
**Node:** v20

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
| verses | 31.287 (31.156 com tokens traduzidos) |
| tokens | 441.646 (100% com pt_literal) |
| glossary | variavel |
| glossary_suggestions | variavel |

### Schema D1 (resumo de migrations/002_glossary.sql)

- `glossary`: id, word, translation, strongs, notes, contributor, status, created_at, updated_at
- `glossary_suggestions`: id, word, translation, strongs, notes, contributor, status, reviewer, reviewed_at, created_at
- Indices: idx_glossary_word, idx_glossary_strongs, idx_glossary_status, idx_suggestions_status

---

## Estrutura do Projeto

```
src/                        # API Hono + TypeScript (Cloudflare Workers)
  index.ts                  # Entry point (144 linhas) - CORS, cache, security headers, rotas
  types.ts                  # TypeScript types (74 linhas) - Env, Book, Verse, Token, Gloss, ApiResponse
  routes/
    books.ts                # GET /api/v1/books (78 linhas)
    verses.ts               # GET /api/v1/verses/:book/:chapter (228 linhas)
    search.ts               # GET /api/v1/verses/search (169 linhas)
    tokens.ts               # GET /api/v1/tokens/:verseId (195 linhas)
    glossary.ts             # GET /api/v1/glossary (260 linhas)
    glosses.ts              # GET /api/v1/glosses (120 linhas)
    translation-info.ts     # GET /api/v1/translation-info (114 linhas)
  data/
    translation-notes.json  # Notas de traducao, marcadores, palavras nao traduzidas (78 linhas)
    editorial-decisions.json # Decisoes editoriais, remocao versiculos (39 linhas)
  docs/
    openapi.ts              # OpenAPI/Swagger spec
glossary/                   # Dados de traducao (NAO ler inteiros)
  hebrew.json               # ~12.000 entradas, 1.7 MB
  greek.json                # ~2.000 entradas, 172 KB
  keep_original.json        # 8 categorias: yhwh, Elohim, Eloah, El, Theos, Iesous, Christos, Adonai
  untranslated_REV.txt      # 2.013 linhas - passagens nao traduzidas de Revelacao
scripts/                    # Scripts de traducao e analise
tradutor-web/               # Interface web Ollama (porta 3333)
tradutor-app/               # App desktop Electron (BibliaTradutor.exe)
leitor-kindle/              # Leitor React Kindle-style (porta 4321)
  src/                      # React 19 + Vite 7
  dist/                     # Build de producao
Editoracao/                 # Documentacao editorial (varredura, agente)
Bible pt-br/txt/            # 66 livros traduzidos em PT-BR (~31.000 linhas total)
migrations/                 # Migracoes D1 (002_glossary.sql)
.AnC Documentos/            # Documentacao interna + imagens
.github/                    # CI/CD, templates, funding
wiki-content/               # Wiki markdown
references/                 # Material de referencia
```

---

## Endpoints da API

### Endpoints Implementados

| Metodo | Endpoint | Uso |
|--------|----------|-----|
| GET | `/` | Info da API + lista de endpoints |
| GET | `/health` | Health check |
| GET | `/docs` | OpenAPI spec (JSON) |
| GET | `/docs/openapi.json` | OpenAPI spec (alias) |
| GET | `/api/v1/books` | Listar 66 livros |
| GET | `/api/v1/books/:code` | Detalhe de 1 livro |
| GET | `/api/v1/verses/:book/:chapter` | Versiculos de um capitulo |
| GET | `/api/v1/verses/:book/:chapter/:verse` | Versiculo especifico |
| GET | `/api/v1/verses/search?q=termo` | Busca textual |
| GET | `/api/v1/tokens/:verseId` | Tokens de um versiculo |
| GET | `/api/v1/tokens/:verseId/interlinear` | Visao interlinear |
| GET | `/api/v1/tokens/:verseId/morphology` | Analise morfologica |
| GET | `/api/v1/glosses/verse/:verseId` | Glosses de um versiculo |
| GET | `/api/v1/glosses/layers` | Camadas de leitura disponiveis |
| GET | `/api/v1/glossary` | Glossario completo |
| GET | `/api/v1/translation-info` | Visao geral notas de traducao |
| GET | `/api/v1/translation-info/editorial-markers` | Marcadores editoriais |
| GET | `/api/v1/translation-info/words-not-translated` | Palavras nao traduzidas |
| GET | `/api/v1/translation-info/word/:word` | Detalhe de uma palavra |

### Middleware Ativo

- **CORS**: origin `*`, metodos GET/OPTIONS/POST
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Cache**: `/api/*` com cache publico de 1 hora

> **Documentacao completa:** Ver [README.md](README.md)

---

## Scripts de Traducao

| Script | Uso |
|--------|-----|
| `claude-translations.mjs [BOOK]` | Traducao via Claude API |
| `ollama-translate.mjs [BOOK]` | Traducao via Ollama local |
| `batch-translate-db.mjs` | Batch traducao D1 |
| `apply-glossary.mjs` | Aplicar glossario aos textos |
| `list-untranslated.mjs` | Listar pendentes |
| `export-all-books.mjs` | Exportar livros para TXT |

---

## Subprojetos

### Leitor Kindle (leitor-kindle/)

| Item | Valor |
|------|-------|
| Stack | React 19 + Vite 7 |
| Porta | 4321 |
| Build | `vite build` |
| Descricao | Leitor estilo Kindle para a Biblia |

### Tradutor Web (tradutor-web/)

| Item | Valor |
|------|-------|
| Stack | Node.js puro (server.mjs) |
| Porta | 3333 |
| Descricao | Interface web para Ollama traducao local |

### Tradutor Desktop (tradutor-app/)

| Item | Valor |
|------|-------|
| Stack | Electron 28 + electron-builder |
| Executavel | BibliaTradutor.exe (37.7 MB) |
| Build | `electron-builder --win` |
| AppId | `org.aculpaedasovelhas.biblia-tradutor` |
| Descricao | Tradutor local Ollama + CUDA |

---

## URLs de Producao

| Servico | URL |
|---------|-----|
| API Workers | https://biblia-belem-api.anderson-282.workers.dev |
| API Custom | https://biblia.aculpaedasovelhas.org |
| Leitor | https://aculpaedasovelhas.org/ler-biblia.html |
| Docs | https://biblia.aculpaedasovelhas.org/docs |
| GitHub | https://github.com/OtimizaPro/biblia-belem-anc |
| Funding | https://aculpaedasovelhas.org/colabore.html |

---

## Stack Tecnica (de package.json e configs)

### Dependencias de Producao

| Pacote | Versao | Uso |
|--------|--------|-----|
| hono | ^4.6.0 | Framework web (Cloudflare Workers) |
| @anthropic-ai/sdk | ^0.71.2 | API Claude para traducao |
| dotenv | ^17.2.3 | Variaveis de ambiente |
| applicationinsights | ^3.13.0 | Telemetria |

### Dependencias de Desenvolvimento

| Pacote | Versao | Uso |
|--------|--------|-----|
| wrangler | ^4.0.0 | CLI Cloudflare Workers |
| typescript | ^5.7.0 | Linguagem |
| eslint | ^9.39.2 | Linter |
| prettier | ^3.7.4 | Formatter |
| playwright | ^1.57.0 | Testes E2E |
| @cloudflare/workers-types | ^4.20241218.0 | Tipos Cloudflare |

### Configuracao TypeScript (tsconfig.json)

| Opcao | Valor |
|-------|-------|
| target | ES2022 |
| module | ESNext |
| moduleResolution | bundler |
| strict | true |
| jsx | react-jsx (hono/jsx) |
| types | @cloudflare/workers-types |

### Configuracao Wrangler (wrangler.toml)

| Opcao | Valor |
|-------|-------|
| name | biblia-belem-api |
| main | src/index.ts |
| compatibility_date | 2024-12-01 |
| compatibility_flags | nodejs_compat |
| account_id | 28248f850aef40d0c91531280962a88a |
| workers_dev | true |
| custom_domain | biblia.aculpaedasovelhas.org |

### Prettier (.prettierrc)

```json
{ "semi": true, "singleQuote": true, "tabWidth": 2, "trailingComma": "es5", "printWidth": 100 }
```

### ESLint (eslint.config.js)

- Base: eslint recommended + typescript-eslint recommended + prettier
- Regras: `no-explicit-any: warn`, `no-unused-vars: warn` (ignora `_` prefixo)
- Ignora: node_modules, .wrangler, *.js, *.mjs, scripts/

---

## Tipos TypeScript (src/types.ts)

| Tipo | Campos-chave |
|------|-------------|
| **Env** | DB: D1Database, ENVIRONMENT: string |
| **Book** | id, code, name_pt, name_original, testament (AT/NT), trad_group, chapters_count, canon_order |
| **Verse** | id, book_id, chapter, verse, text_original, text_transliterated, text_translated, language (HE/ARM/GRC) |
| **Token** | id, verse_id, position, text_original, text_transliterated, lemma, morph_code, gloss |
| **Gloss** | id, verse_id, layer (N0-N5), text |
| **ApiResponse\<T\>** | success, data?, error?, meta? (count, page, total) |

---

## Principios da Traducao

1. **Literalidade rigida** - Palavra por palavra
2. **Fidelidade ao codice** - Sem suavizacao
3. **Zero interpretacao** - Sem interferencia do tradutor
4. **Transparencia** - Intervencoes com `[ ]`
5. **Sem versiculos** - Estrutura capitular original (versiculos sao construcao editorial de ~1551)

### Palavras Nao Traduzidas (8 categorias — keep_original.json)

| Palavra | Origem | Original | Motivo |
|---------|--------|----------|--------|
| yhwh | Hebraico | יהוה | Tetragrama - nome proprio divino |
| Elohim | Hebraico | אֱלֹהִים | Preserva ambiguidade singular/plural |
| Eloah | Hebraico | אֱלוֹהַּ | Singular arcaico (predominante em Jo) |
| El | Hebraico | אֵל | Forma curta e primitiva |
| Adonai | Hebraico | אדני | Preserva distincao de yhwh |
| Theos | Grego | Θεός | Preserva nuances theos vs ho Theos |
| Iesous | Grego | Ἰησοῦς | Nome proprio - forma grega original |
| Christos | Grego | Χριστός | Titulo - preserva carga semantica |

**Proibido:** A palavra "Deus" e LATIM e NUNCA deve aparecer na traducao.

### Marcadores Editoriais

| Marcador | Significado |
|----------|-------------|
| `[OBJ]` | Objeto direto implicito/eliptico no original |
| `[grammatical_ellipsis]` | Omissao gramatical proposital |
| `[interpretation_needed]` | Ambiguidade genuina no original |

### Fontes Textuais

BHSA, WLC, SBLGNT, TR1550, Nestle1904

---

## Glossarios (NAO ler inteiros)

| Arquivo | Entradas | Tamanho | Conteudo |
|---------|----------|---------|----------|
| glossary/hebrew.json | ~12.000 | 1.7 MB | Termos hebraicos + traducoes |
| glossary/greek.json | ~2.000 | 172 KB | Termos gregos + traducoes |
| glossary/keep_original.json | 8 categorias | ~3 KB | Palavras que NAO devem ser traduzidas |
| glossary/untranslated_REV.txt | 2.013 linhas | - | Passagens nao traduzidas de Revelacao |

---

## Textos Biblicos (Bible pt-br/txt/)

66 livros em formato TXT. Total ~31.000 linhas.

**Livro especial:** `66_DES_Desvelacao de Jesus Cristo (apocalipse).txt` (485 linhas) — versao com nome corrigido (Desvelacao, nao Apocalipse).

> **REGRA:** "Desvelacao" e o termo correto — NUNCA "Apocalipse"

---

## Aprendizados da IA

### API vs Leitor (Confusao Comum)

| Componente | Comando | Porta | Tipo |
|------------|---------|-------|------|
| API | `npm run dev:remote` | 8787 | Backend JSON (Hono) |
| Leitor | `cd leitor-kindle && npm run dev` | 4321 | Frontend React (Vite) |
| Tradutor Web | `node tradutor-web/server.mjs` | 3333 | Interface Ollama |

**Regra:** Interface visual = `leitor-kindle/` (localhost:4321)

### Deploy Branches

| Projeto | Production Branch |
|---------|-------------------|
| aculpaedasovelhas (Pages) | master |
| biblia-belem-anc (Workers) | main |

### Testes

- Testes E2E: Playwright instalado mas `npm test` ainda nao configurado
- CI roda: lint + format:check + typecheck + build dry-run
- Script de teste manual: `scripts/test-search-api.mjs`

### Backups SQL

- `backup_biblia.sql` (71 MB) — backup completo do D1
- `backup_pre_fix.sql` (70.9 MB) — backup pre-correcao

### Imagens do Projeto

- `Arqquitetura Bible Belem AnC.png` — Diagrama de arquitetura
- `Projeto Tecnico Bible Belem AnC.png` — Projeto tecnico
- `.AnC Documentos/pastas do projeto Bible.png` — Estrutura de pastas
