# Bíblia Belém An.C 2025 - API

API REST para consulta da tradução bíblica literal rígida (ipsis litteris).

> **Filosofia:** "Você lê. E a interpretação é sua."

---

## Sobre o Projeto

A **Bíblia Belém An.C 2025** é uma tradução literal rígida orientada diretamente pelos códices canônicos, que preserva tempos verbais, ordem sintática e partículas, priorizando a estrutura do texto original sobre a fluidez.

### Princípios Metodológicos

- **Literalidade rígida** como regra primária
- **Preservação** de tempos verbais, ordem sintática e partículas
- **Zero interpretação** - elimina interferências interpretativas dos tradutores
- **Intervenção mínima** - quando inevitável, sinalizada com `[ ]`
- **Separação estrita** entre tradução e apoio interpretativo

**Autor:** Anderson Costa Belem

---

## URLs de Produção

| Serviço | URL |
|---------|-----|
| **API (Workers)** | https://biblia-belem-api.anderson-282.workers.dev |
| **API (Custom Domain)** | https://biblia.aculpaedasovelhas.org |
| **Interface de Leitura** | https://aculpaedasovelhas.org/ler-biblia.html |
| **Documentação** | https://biblia.aculpaedasovelhas.org/docs |

---

## Autenticação

**Nenhuma.** API pública, somente leitura.

## Headers Recomendados

```
Content-Type: application/json
```

## Formato de Resposta

Todas as respostas seguem o padrão:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "count": 66
  }
}
```

Em caso de erro:

```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

---

## Endpoints

### Health Check

```
GET /health
```

**Resposta:**
```json
{
  "status": "ok",
  "service": "biblia-belem-api",
  "version": "1.0.0",
  "timestamp": "2026-01-11T16:00:00.000Z"
}
```

---

### Livros

#### Listar todos os livros

```
GET /api/v1/books
GET /api/v1/books?testament=AT
GET /api/v1/books?testament=NT
```

**Parâmetros:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| testament | string | Filtrar por testamento: `AT` ou `NT` |

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "GEN",
      "name_pt": "Gênesis",
      "name_original": "בְּרֵאשִׁית",
      "testament": "AT",
      "trad_group": "HEB_TM",
      "chapters_count": 50,
      "canon_order": 1
    }
  ],
  "meta": { "count": 66 }
}
```

#### Detalhes de um livro

```
GET /api/v1/books/:code
```

**Exemplo:** `GET /api/v1/books/GEN`

---

### Versículos

#### Listar versículos de um capítulo

```
GET /api/v1/verses/:book/:chapter
```

**Exemplo:** `GET /api/v1/verses/GEN/1`

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 6383,
      "book_code": "GEN",
      "chapter": 1,
      "verse": 1,
      "text_original": "בְּרֵאשִׁית בָּרָא אֱלֹהִים...",
      "text_translated": "No-princípio criou Deus...",
      "language": "HE"
    }
  ],
  "meta": { "count": 31 }
}
```

#### Versículo único com tokens

```
GET /api/v1/verses/:book/:chapter/:verse
```

**Exemplo:** `GET /api/v1/verses/GEN/1/1`

#### Busca textual

```
GET /api/v1/verses/search?q=termo
GET /api/v1/verses/search?q=amor&book=JHN
GET /api/v1/verses/search?q=amor&testament=NT&limit=50
```

**Parâmetros:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| q | string | Termo de busca (obrigatório) |
| book | string | Filtrar por livro (código) |
| testament | string | Filtrar por testamento: `AT` ou `NT` |
| limit | number | Limite de resultados (padrão: 100) |

---

### Tokens (Palavras)

#### Tokens de um versículo

```
GET /api/v1/tokens/:verseId
```

**Exemplo:** `GET /api/v1/tokens/6383`

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 91039,
      "verse_id": 6383,
      "position": 1,
      "text_utf8": "בְּרֵאשִׁ֖ית",
      "script": "HE",
      "normalized": "בראשית",
      "pt_literal": "No-princípio"
    }
  ],
  "meta": { "count": 7 }
}
```

#### Vista interlinear

```
GET /api/v1/tokens/:verseId/interlinear
```

#### Análise morfológica

```
GET /api/v1/tokens/:verseId/morphology
```

---

### Glosses (Camadas de Anotação)

#### Glosses de um versículo

```
GET /api/v1/glosses/verse/:verseId
GET /api/v1/glosses/verse/:verseId?layer=N1
```

**Parâmetros:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| layer | string | Filtrar por camada: `N0`-`N5` |

#### Listar camadas disponíveis

```
GET /api/v1/glosses/layers
```

**Camadas:**
| Layer | Descrição |
|-------|-----------|
| N0 | Texto literal (imutável) |
| N1 | Glossário mínimo |
| N2 | Marcação morfológica |
| N3 | Reordenação de leitura |
| N4 | Expansão de elipses |
| N5 | Alternativas lexicais |

---

## Fontes Textuais

| Código | Fonte |
|--------|-------|
| BHSA | Biblia Hebraica Stuttgartensia |
| WLC | Westminster Leningrad Codex |
| SBLGNT | SBL Greek New Testament |
| TR1550 | Textus Receptus 1550 |
| Nestle 1904 | Crítica textual |

---

## Exemplos de Uso

### JavaScript/Fetch

```javascript
// Listar livros
const response = await fetch('https://biblia-belem-api.anderson-282.workers.dev/api/v1/books');
const { data } = await response.json();
console.log(data); // Array de 66 livros

// Buscar Gênesis 1
const gen1 = await fetch('https://biblia-belem-api.anderson-282.workers.dev/api/v1/verses/GEN/1');
const { data: verses } = await gen1.json();

// Tokens de Gn 1:1
const tokens = await fetch('https://biblia-belem-api.anderson-282.workers.dev/api/v1/tokens/6383');
const { data: words } = await tokens.json();
```

### Python

```python
import requests

BASE_URL = "https://biblia-belem-api.anderson-282.workers.dev"

# Listar livros
books = requests.get(f"{BASE_URL}/api/v1/books").json()["data"]

# Gênesis 1
gen1 = requests.get(f"{BASE_URL}/api/v1/verses/GEN/1").json()["data"]

# Buscar "amor" no NT
search = requests.get(f"{BASE_URL}/api/v1/verses/search", params={
    "q": "amor",
    "testament": "NT",
    "limit": 50
}).json()["data"]
```

### cURL

```bash
# Health check
curl https://biblia-belem-api.anderson-282.workers.dev/health

# Listar livros
curl https://biblia-belem-api.anderson-282.workers.dev/api/v1/books

# Gênesis 1
curl https://biblia-belem-api.anderson-282.workers.dev/api/v1/verses/GEN/1

# Tokens de Gn 1:1
curl https://biblia-belem-api.anderson-282.workers.dev/api/v1/tokens/6383
```

---

## Cache

Respostas são cacheadas por **1 hora** (3600 segundos) no edge da Cloudflare.

## CORS

API aceita requisições de **qualquer origem** (`Access-Control-Allow-Origin: *`).

---

## Stack Tecnológica

| Tecnologia | Uso |
|------------|-----|
| **TypeScript** | Linguagem principal (v5.7.0) |
| **Hono** | Framework web leve e rápido |
| **Cloudflare Workers** | Runtime serverless |
| **Cloudflare D1** | Banco de dados SQLite serverless |
| **Wrangler** | CLI para deploy e desenvolvimento |
| **ESLint** | Linting de código |
| **Prettier** | Formatação de código |

---

## Estrutura do Projeto

```text
Bible Belem AnC 2025/
├── src/
│   ├── index.ts          # Entry point da API Hono
│   ├── types.ts          # Interfaces TypeScript
│   └── routes/
│       ├── books.ts      # Rotas de livros
│       ├── verses.ts     # Rotas de versículos
│       ├── tokens.ts     # Rotas de tokens/palavras
│       ├── glosses.ts    # Rotas de glosses
│       └── glossary.ts   # Rotas do glossário
├── glossary/
│   ├── greek.json        # Glossário Grego -> PT-BR
│   ├── hebrew.json       # Glossário Hebraico -> PT-BR
│   └── README.md         # Documentação do glossário
├── scripts/              # Scripts de processamento
├── migrations/           # Migrações do banco D1
├── .AnC Documentos/      # Documentação interna
├── wrangler.toml         # Configuração Cloudflare
├── eslint.config.js      # Configuração ESLint
├── .prettierrc           # Configuração Prettier
├── tsconfig.json         # Configuração TypeScript
└── package.json          # Dependências e scripts
```

---

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor local
npm run dev:remote       # Servidor local conectado ao D1 remoto

# Deploy
npm run deploy           # Deploy para Cloudflare Workers

# Qualidade de Código
npm run lint             # Verificar problemas no código
npm run lint:fix         # Corrigir problemas automaticamente
npm run format           # Formatar código com Prettier
npm run format:check     # Verificar formatação

# Logs
npm run tail             # Ver logs em tempo real
```

---

## Desenvolvimento Local

```bash
# 1. Instalar dependências
npm install

# 2. Rodar localmente (conecta ao D1 remoto)
npm run dev:remote

# 3. Acessar
# http://localhost:8787/health
# http://localhost:8787/api/v1/books
```

---

## Estatísticas do Banco

| Tabela | Registros |
|--------|-----------|
| books | 66 |
| verses | 31.156 |
| tokens | 441.646 |

---

## Ecossistema "A Culpa é das Ovelhas"

Este projeto faz parte do ecossistema completo:

| Projeto | Descrição | URL |
|---------|-----------|-----|
| **Bible Belem AnC** | API da Bíblia (este projeto) | biblia.aculpaedasovelhas.org |
| **Site Institucional** | Portal principal | aculpaedasovelhas.org |
| **exeg.ai** | Plataforma de exegese com IA | plataforma.exeg.ai |
| **O Livrinho** | Livro "A Culpa é das Ovelhas" | aculpaedasovelhas.org/livrinho |
| **Blog** | Artigos e reflexões | aculpaedasovelhas.org/blog |

---

## Configuração Cloudflare

**Account ID:** `28248f850aef40d0c91531280962a88a`
**Database ID:** `c068f4c2-6086-4755-a312-c3a5c5685345`
**Database Name:** `biblia-belem`

---

## Contribuindo

### Glossário

Para contribuir com traduções, veja [glossary/README.md](glossary/README.md).

### Código

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faça commit: `git commit -m 'feat: minha feature'`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## Repositórios

- GitHub: [github.com/AndersonOtimiza](https://github.com/AndersonOtimiza)
- Organização: [github.com/orgs/OtimizaPro](https://github.com/orgs/OtimizaPro/dashboard)

---

## Licença

Proprietário - A Culpa é das Ovelhas
Copyright 2025 Anderson Costa Belem
