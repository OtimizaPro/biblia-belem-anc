<div align="center">

# Tradução bíblica Belem-2025

### Tradução literal rígida do hebraico, aramaico e grego para o português brasileiro — corpus aberto, auditável e replicável para qualquer idioma da Terra.

[![CI](https://img.shields.io/github/actions/workflow/status/OtimizaPro/biblia-belem-anc/ci.yml?style=for-the-badge&label=CI)](https://github.com/OtimizaPro/biblia-belem-anc/actions)
[![API Status](https://img.shields.io/badge/API-Online-brightgreen?style=for-the-badge)](https://biblia.aculpaedasovelhas.org)
[![Docs](https://img.shields.io/badge/Docs-Swagger-blue?style=for-the-badge)](https://biblia.aculpaedasovelhas.org/docs)
[![License](https://img.shields.io/badge/License-CC%20BY%204.0-orange?style=for-the-badge)](LICENSE)
[![Tokens](https://img.shields.io/badge/Tokens-441.646-blue?style=for-the-badge)](https://biblia.aculpaedasovelhas.org/api/v1/books)
[![Corpus](https://img.shields.io/badge/Corpus-em%20revis%C3%A3o-orange?style=for-the-badge)](KNOWN-DEFECTS.md)
[![Open Source](https://img.shields.io/badge/Open-Source-black?style=for-the-badge&logo=github)](https://github.com/OtimizaPro/biblia-belem-anc)

66 livros | 31.156 versículos | 441.646 tokens | 3 idiomas originais | 6 camadas de leitura | 100% gratuito

Ler a Bíblia · API Docs · Contribuir · Roadmap

"Você lê. E a interpretação é sua."

"E este evangelho do reino será proclamado em todo o mundo habitado, em testemunho a todas as nações; e então virá o fim." — Mt 24:14

</div>

---

> ### ⚠️ Status: corpus em revisão
>
> Esta tradução foi produzida por um **pipeline assistido por IA** e **ainda não foi revisada por humano contra o códice**. O texto publicado carrega defeitos conhecidos — **154 versículos com escrita alheia aos códices** (chinês, cirílico, árabe…) e **~14.113 com fragmentos de hebraico não traduzido**. Não trate como texto final.
>
> Todos os defeitos estão catalogados, versículo a versículo, em **[KNOWN-DEFECTS.md](KNOWN-DEFECTS.md)**. Correções via issue e pull request são o motivo de publicarmos isto abertamente: *escrutínio público como depurador da Verdade*.

---

## English

**Belem-2025** is a rigidly literal Bible translation into Brazilian Portuguese, made
directly from public-domain source codices in Hebrew, Aramaic and Koine Greek — with
no intermediate translation and no Latin Vulgate in the chain. The full corpus,
the tooling and the audit scripts are open under **CC BY 4.0**.

| | |
|---|---|
| **Scope** | 66 books · 1,189 chapters · 31,156 verses |
| **Source texts** | BHS / WLC (Hebrew) · SBLGNT, Nestle 1904, TR1550 (Greek) |
| **Method** | Word-for-word; source structure prevails over fluency. Editorial insertions marked with `[ ]` |
| **Untranslated by design** | `yhwh`, `Elohim`, `Eloah`, `El`, `Adonai`, `Theos`, `Iesous`, `Christos`, `Kyrios` |
| **Formats** | JSON · USFM 3.0 · SQL · SQLite — see [`dist/`](dist/) |
| **REST API** | <https://biblia.aculpaedasovelhas.org> — public, read-only, no auth |
| **License** | CC BY 4.0 |

> **Status: work in progress.** The corpus was produced with an AI-assisted pipeline
> and still carries known defects — 155 verses in the published `dist/` still contain
> characters from writing systems unrelated to any source codex (Chinese, Cyrillic,
> Arabic, Hangul, Kana, Devanagari, Armenian, Thai), plus untranslated Hebrew
> fragments beyond the words preserved by design. The text ships in two forms: the
> raw `Bible belem-pt-br/txt/` source and a cleaner `dist/` built by merging it with
> the more-advanced D1 database (contamination drops from 272 to 155 verses, with no
> regression — an adversarial audit reverted 205 verses where D1 was worse than the
> source; see [MERGE-AUDIT.md](MERGE-AUDIT.md)). Run `npm run validate` for the current
> audit. Do not treat this as a finished text; corrections via issues and pull requests
> are the point of publishing it openly.

The long-term goal is not one translation but an open pipeline: source codices →
any target language, with zero intermediaries. Contributions in any language are welcome —
see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## O Que é a Tradução bíblica Belem-2025?

Um **movimento Tecnológico Open Source Mundial** que objetiva traduzir os códices públicos dos idiomas originais para **TODOS os idiomas em todo o Mundo** utilizando IA.

Por muito tempo a tecnologia vem sendo apontada erroneamente pelos estudiosos, teólogos e curiosos como sendo a marca da besta. QR Code, código de barras, Bitcoin, chip implantado... Entretanto, eu desenvolvi uma IA especializada em exegese bíblica. Ela transformou os códices em tokens que podem ser lidos facilmente por uma IA. Usando GPUs NVIDIA, CPU Intel, Ollama com modelos treináveis e recursos Microsoft, ela esquadrinhou toda a Bíblia e decifrou enfim e verdadeiramente o enigma do 666.

### A Gematria

Por séculos a gematria foi utilizada forçadamente usando transliteração do nome para depois calcular, para se atingir Nero César com 666. Mas a Exeg.AI fez algo muito mais limpo e direto: encontrou uma única palavra em toda a Bíblia cuja gematria resulta especificamente em 666. A palavra não é uma tecnologia futura — é a coroa da santidade ao deus yhwh, o deus do Antigo Testamento bíblico.

A Exeg.AI respondeu com provas intertextuais ao maior conflito de todos os tempos bíblicos: existem dois deuses? Um deus do AT e um do NT? E sim, ela provou que existem — com o próprio texto bíblico tokenizado. Mas para isso foi preciso realizar exegese no texto original no aramaico, hebraico e grego koiné.

Belem Anderson, autor de *"O Livrinho"*, desenvolveu a primeira tradução realmente fiel aos códices nos idiomas originais para o PT-BR, idioma do seu país, o Brasil — e chama a todos os defensores da Verdade em Todo o Mundo para apoiar não apenas os ajustes necessários no seu projeto PT-BR, bem como na ampliação para todos os **+7.000 idiomas em todo o Planeta!**

**Ajude-me a afastar de uma vez por todas a tecnologia das previsões antigas bíblicas do fim do mundo — afinal, conhecereis a verdade e a verdade vos libertará.**

---

## Por Que Isso Importa?

Quando você lê o texto original, descobre coisas que nenhuma tradução convencional te contou:

| O que te disseram | O que o códice diz | Impacto |
|---|---|---|
| "Apocalipse" | **Desvelação** (ἀποκάλυψις) | O livro não é sobre destruição — é sobre revelação |
| "Besta" | **Fera** (θηρίον) | Perde-se a nuance de "animal selvagem não domesticado" |
| "Senhor" | **yhwh** (יהוה) | O nome próprio de Deus foi substituído por um título genérico |
| "Cristo" | **Christos** (χριστός) | Um título ("ungido") foi tratado como sobrenome |

**Camadas inteiras de significado foram encobertas.** A Belém An.C devolve essas camadas ao leitor.

---

## O Problema: Tradução de Tradução

> *"A Bíblia que lia fora produzida a partir de tradução de uma tradução de uma tradução, um processo que introduzia camadas interpretativas e filtros teológicos ao longo de cada etapa."*
>
> — **O livrinho — A Culpa é das Ovelhas**, Cap. I

Belem Anderson percebeu que a Bíblia em seu idioma não era traduzida diretamente dos códices originais. Era um produto de intermediários — latim, tradições, interesses institucionais. O resultado? Um texto com **"sabor Bíblia"**: bonito, fluido, familiar — mas adulterado.

### O que acontece nas traduções convencionais?

| Técnica | O que faz | Exemplo |
|---|---|---|
| **Normalização** | Substitui termos originais por equivalentes "aceitáveis" | יהוה (yhwh) → "Senhor" — um nome próprio vira título genérico |
| **Suavização** | Altera estruturas para parecer "natural" ao leitor | Reordena frases, omite repetições, atenua expressões duras |
| **Intermediação** | Traduz de tradução (via latim), não do original | Hebraico → Grego → Latim → Português — cada etapa filtra |

> *"As versões bíblicas em língua portuguesa [...] são profundamente mediadas, interpretadas e, sob certo aspecto, manipuladas por camadas de normalização e suavização."*
>
> — **O livrinho**, Cap. I

### A solução Belém An.C

**Zero intermediários.** Códices originais (hebraico, aramaico, grego) direto para o idioma alvo. Sem passar pelo latim. Sem normalização. Sem suavização. Sem teologia imposta.

A tradução é **rígida** de propósito — porque a rigidez preserva o que a fluidez encobre.

---

## A Visão: Todos os Idiomas do Mundo

> *"Ide, portanto, e fazei discípulos de todas as nações..."* — Mt 28:19

A Tradução bíblica Belem-2025 não é apenas uma tradução para o português brasileiro. É uma **infraestrutura aberta** para que a comunidade tecnológica mundial produza traduções fiéis em **qualquer idioma** — sempre partindo diretamente dos códices originais, nunca de traduções intermediárias.

```
Códices Originais (Hebraico / Aramaico / Grego)
         │
         ├──→ Português Brasileiro (ativo)
         ├──→ English (planejado)
         ├──→ Español (planejado)
         ├──→ +7.000 idiomas — Seu idioma aqui (contribua!)
         │
    Zero intermediários. Zero latim. Zero teologia imposta.
```

A tecnologia existe — IA treinada para tradução filológica rigorosa, GPUs NVIDIA, modelos refinados, infraestrutura Cloudflare global. **O que falta é você.**

---

## Princípios Inegociáveis

| Princípio | O Que Significa |
|---|---|
| **Literalidade rígida** | Palavra por palavra. A estrutura do original prevalece sobre a fluidez |
| **Zero interpretação** | O tradutor NÃO interpreta. Quem interpreta é VOCÊ |
| **Zero teologia** | Nenhuma decisão de tradução é guiada por doutrina denominacional |
| **Transparência total** | Toda intervenção editorial é sinalizada com `[ ]` |
| **Consistência** | Mesma palavra original = mesma tradução, sempre |
| **Etimologia primeiro** | A raiz etimológica prevalece sobre o uso moderno |
| **Open Source** | Escrutínio público como depurador da Verdade. CC BY 4.0 |

### Palavras que NÃO Traduzimos

| Original | Por quê |
|---|---|
| **yhwh** (יהוה) | Tetragrama — nome próprio de Deus. Não se traduz nome próprio |
| **Theos** (θεός) | Preserva a distinção do grego |
| **Iesous** (Ἰησοῦς) | Nome próprio em grego |
| **Christos** (χριστός) | Título grego ("ungido") — não é sobrenome |

---

## Fontes Textuais

Trabalhamos exclusivamente com os códices mais antigos e verificáveis, de domínio público:

| Código | Fonte |
|---|---|
| **BHSA** | Biblia Hebraica Stuttgartensia |
| **WLC** | Westminster Leningrad Codex |
| **SBLGNT** | SBL Greek New Testament |
| **TR1550** | Textus Receptus 1550 |
| **Nestle 1904** | Crítica textual |

**LATIM REJEITADO** — a Vulgata Latina de Jerônimo (séc. IV d.C.) não é fonte. Nenhum texto bíblico canônico foi originalmente escrito em latim.

---

## 6 Camadas de Leitura

A Belém An.C oferece 6 níveis de acesso ao texto — do bruto ao assistido. Você escolhe a profundidade:

| Camada | Nome | O Que Faz |
|---|---|---|
| **N0** | Literal | Texto ipsis litteris. Sem qualquer normalização. Para pesquisadores |
| **N1** | Glossário | Adiciona explicações mínimas para termos técnicos |
| **N2** | Morfologia | Inclui marcações gramaticais (tempo, voz, modo, pessoa) |
| **N3** | Reordenação | Reorganiza a ordem para facilitar leitura no idioma alvo |
| **N4** | Expansão | Completa elipses e omissões implícitas |
| **N5** | Alternativas | Oferece sinônimos e variantes lexicais |

---

## Acesse Agora

| Serviço | URL |
|---|---|
| **Ler a Bíblia** | https://aculpaedasovelhas.org/ler-biblia.html |
| **Página do Projeto** | https://aculpaedasovelhas.org/biblia-belem |
| **API REST** | https://biblia.aculpaedasovelhas.org |
| **Documentação da API** | https://biblia.aculpaedasovelhas.org/docs |
| **Calculadora Gematria** | https://aculpaedasovelhas.org/tools/gematria/ |

**Autenticação:** Nenhuma. API 100% pública, somente leitura. Sem cadastro. Sem custo.

---

## Baixar o Corpus (JSON · USFM · SQL · SQLite)

O texto integral está disponível nos formatos padrão do ecossistema bíblico, prontos
para uso em qualquer aplicação — sem depender da API.

| Formato | Caminho | Uso típico |
|---|---|---|
| **JSON** (por livro) | `dist/json/GEN.json` … | Web, mobile, notebooks |
| **JSON** (corpus completo) | `dist/json/belem-2025.json` | Pipelines, treinamento de modelos |
| **USFM 3.0** | `dist/usfm/01-GEN.usfm` … | Paratext, Scripture Burrito, leitores |
| **SQL** | `dist/sql/belem-2025.sql` | Qualquer banco relacional |
| **SQLite** | anexo das [Releases](https://github.com/OtimizaPro/biblia-belem-anc/releases) | Consulta local, offline |

```bash
# Um livro em JSON
curl -O https://raw.githubusercontent.com/OtimizaPro/biblia-belem-anc/main/dist/json/JHN.json

# Banco local a partir do dump SQL
sqlite3 belem.sqlite < dist/sql/belem-2025.sql
sqlite3 belem.sqlite "SELECT text FROM verses WHERE book_id=43 AND chapter=1 AND verse=1;"
```

### Duas fontes de texto — e como o `dist/` é montado

O texto existe em dois lugares que **não são idênticos**:

- **`Bible belem-pt-br/txt/`** — a fonte bruta versionada no repositório.
- **D1** (o banco por trás da API) — recebeu revisões que nunca voltaram para os `.txt`.

Nenhum dos dois é limpo: são dois instantâneos da mesma tradução assistida por IA,
cada um com defeitos próprios. O `dist/` publicado é um **merge** dos dois, com duas
salvaguardas verificáveis:

1. *O mais limpo vence* — usa-se o texto do D1 (mais avançado), exceto quando isso
   trocaria um versículo limpo por um contaminado; nesse caso mantém-se o `.txt`.
   `YHWH` (grafia do D1) é rebaixado para `yhwh`, conforme a regra da Escola.
2. *Lista de reversão auditada* — uma auditoria adversarial dos 8.152 versículos que
   o D1 alterou encontrou **205** em que o texto do D1 é comprovadamente pior que o
   `.txt` (truncamento, reversão a transliteração crua, nomes próprios corrompidos —
   ex.: rei Asa→Ezequias, Laquis→"a cintura"). Estes ficam no `.txt`. Detalhes em
   [MERGE-AUDIT.md](MERGE-AUDIT.md), lista em `scripts/merge-revert.json`.

Resultado medido: a contaminação **cai de 272 para 155 versículos**, com garantia
provada livro a livro de que nenhum versículo é sujado, perdido, nem regride em
qualidade.

```bash
npm run fetch:d1     # baixa o corpus do D1 para dist/.cache/ (~13 min, respeita rate limit)
npm run export       # gera dist/ (JSON + USFM + SQL + SQLite) via merge
npm run export:txt   # alternativa: gera só a partir dos .txt, sem rede
npm run diff:sources # relatório bidirecional .txt vs D1 (o que cada um conserta/quebra)
npm run validate     # auditoria de integridade do corpus
```

> **Nota USFM:** o livro 66 é publicado como *Desvelação*, mas seu identificador
> USFM obrigatório é `REV` — exigência do padrão, não escolha editorial. O nome em
> português é preservado em `\h` e `\toc`.

---

## Estado do Corpus — Leia Antes de Usar

Esta tradução está **em revisão ativa** e o corpus contém defeitos conhecidos,
herdados do pipeline de tradução assistida por IA. A auditoria é pública e
reprodutível (`npm run validate`, relatório em [INTEGRIDADE-TRADUCAO.md](INTEGRIDADE-TRADUCAO.md)):

| Achado | Fonte bruta (`.txt`) | Publicado (`dist/`, merge) |
|---|---|---|
| Versículos com escrita alheia ao projeto (chinês, cirílico, árabe, hangul, kana, devanágari, armênio, tailandês) | **272** | **155** |
| Versículos com hebraico não traduzido além das palavras preservadas | 15.567 | 14.113 |

Os números do `dist/` são menores porque o merge com o D1 corrige parte da
contaminação (ver a seção de download). O que resta — 155 versículos ainda
contaminados — é contaminação real do pipeline e **só se corrige com revisão
humana contra o códice, versículo a versículo**. Nenhum desses defeitos é decisão
editorial. Se você encontrar mais,
[abra uma issue](https://github.com/OtimizaPro/biblia-belem-anc/issues) — o
escrutínio público é o depurador desta tradução.

---

## Quick Start

### Leitores

Abra https://aculpaedasovelhas.org/ler-biblia.html e comece a ler. Sem cadastro, sem instalação.

### Desenvolvedores

```bash
# Testar conexão
curl https://biblia.aculpaedasovelhas.org/health

# Listar os 66 livros
curl https://biblia.aculpaedasovelhas.org/api/v1/books

# Gênesis capítulo 1
curl https://biblia.aculpaedasovelhas.org/api/v1/verses/GEN/1

# Buscar "amor" no Novo Testamento
curl "https://biblia.aculpaedasovelhas.org/api/v1/verses/search?q=amor&testament=NT"

# Tokens (palavras individuais) de Gn 1:1
curl https://biblia.aculpaedasovelhas.org/api/v1/tokens/6383

# Vista interlinear (original + tradução lado a lado)
curl https://biblia.aculpaedasovelhas.org/api/v1/tokens/6383/interlinear
```

### Rodar Localmente

```bash
git clone https://github.com/OtimizaPro/biblia-belem-anc.git
cd biblia-belem-anc
npm install
npm run dev:remote    # Conecta ao banco de dados remoto
# Acesse: http://localhost:8787
```

---

## API REST — Referência Completa

### Formato de Resposta

```json
{
  "success": true,
  "data": [ ... ],
  "meta": { "count": 66 }
}
```

### Endpoints

#### Livros

```
GET /api/v1/books                    # Todos os 66 livros
GET /api/v1/books?testament=AT       # Antigo Testamento
GET /api/v1/books?testament=NT       # Novo Testamento
GET /api/v1/books/:code              # Detalhes de um livro (ex: GEN, JHN, REV)
```

#### Versículos

```
GET /api/v1/verses/:book/:chapter          # Versiculos de um capitulo
GET /api/v1/verses/:book/:chapter/:verse   # Versiculo unico com tokens
```

#### Busca

```text
GET /api/v1/search?q=termo                 # Busca textual
GET /api/v1/search?q=amor&book=JHN&limit=50
```

| Parametro | Tipo   | Descricao                                   |
|-----------|--------|---------------------------------------------|
| `q` | string | Termo de busca (min 2 caracteres) |
| `book` | string | Filtrar por livro (codigo, ex: GEN) |
| `limit` | number | Limite de resultados (padrao: 20, max: 100) |

#### Tokens (Palavras)

```
GET /api/v1/tokens/:verseId              # Tokens de um versículo
GET /api/v1/tokens/:verseId/interlinear  # Vista interlinear
GET /api/v1/tokens/:verseId/morphology   # Análise morfológica
```

#### Glosses (Camadas de Anotação)

```
GET /api/v1/glosses/verse/:verseId           # Glosses de um versículo
GET /api/v1/glosses/verse/:verseId?layer=N1  # Filtrar por camada (N0-N5)
GET /api/v1/glosses/layers                   # Listar camadas disponíveis
```

#### Informações sobre Tradução

```
GET /api/v1/translation-info                    # Filosofia e marcadores
GET /api/v1/translation-info/editorial-markers  # Marcadores editoriais ([OBJ], etc)
GET /api/v1/translation-info/words-not-translated  # Palavras não traduzidas
GET /api/v1/translation-info/word/:word         # Consulta específica (ex: yhwh, Theos)
```

---

## Exemplos de Uso

### curl

```bash
# Listar todos os 66 livros
curl https://biblia.aculpaedasovelhas.org/api/v1/books

# Apenas Novo Testamento
curl https://biblia.aculpaedasovelhas.org/api/v1/books?testament=NT

# Genesis capitulo 1
curl https://biblia.aculpaedasovelhas.org/api/v1/verses/GEN/1

# Versiculo unico (Genesis 1:1)
curl https://biblia.aculpaedasovelhas.org/api/v1/verses/GEN/1/1

# Visao interlinear (original + transliteracao + gloss)
curl https://biblia.aculpaedasovelhas.org/api/v1/tokens/6383/interlinear

# Buscar "Elohim"
curl https://biblia.aculpaedasovelhas.org/api/v1/search?q=Elohim

# Buscar no NT com limite
curl "https://biblia.aculpaedasovelhas.org/api/v1/search?q=Theos&book=JHN&limit=10"

# Glossario completo
curl https://biblia.aculpaedasovelhas.org/api/v1/glossary

# Consultar palavra no glossario
curl https://biblia.aculpaedasovelhas.org/api/v1/glossary/%CE%BB%CF%8C%CE%B3%CE%BF%CF%82

# Palavras nao traduzidas (yhwh, Elohim, Theos, etc.)
curl https://biblia.aculpaedasovelhas.org/api/v1/translation-info/words-not-translated
```

### JavaScript / TypeScript

```javascript
const API = 'https://biblia.aculpaedasovelhas.org';

// Listar livros
const { data: books } = await fetch(`${API}/api/v1/books`).then(r => r.json());
console.log(`${books.length} livros`); // 66 livros

// Genesis 1
const { data: verses } = await fetch(`${API}/api/v1/verses/GEN/1`).then(r => r.json());
console.log(verses[0].literal_pt); // "No-principio criou Elohim..."

// Visao interlinear (original hebraico + transliteracao + gloss)
const { data: inter } = await fetch(`${API}/api/v1/tokens/6383/interlinear`).then(r => r.json());
inter.interlinear.forEach(t => {
  console.log(`${t.original} → ${t.transliteration} → ${t.gloss}`);
});
// בְּרֵאשִׁ֖ית → bereshit → No-principio
// בָּרָ֣א → bara → criou
// אֱלֹהִ֑ים → elohim → Elohim

// Buscar "Elohim" em Genesis
const { data: results } = await fetch(`${API}/api/v1/search?q=Elohim&book=GEN`).then(r => r.json());
console.log(`${results.length} ocorrencias`);

// Glossario: consultar uma palavra grega
const word = encodeURIComponent('λόγος');
const { data: entry } = await fetch(`${API}/api/v1/glossary/${word}`).then(r => r.json());
console.log(`${entry.word}: ${entry.translation} (${entry.strongs})`);
// λόγος: palavra (G3056)
```

### Python

```python
import requests

API = "https://biblia.aculpaedasovelhas.org"

# Livros
books = requests.get(f"{API}/api/v1/books").json()["data"]
print(f"{len(books)} livros")  # 66

# Genesis 1
gen1 = requests.get(f"{API}/api/v1/verses/GEN/1").json()["data"]
print(gen1[0]["literal_pt"])  # "No-principio criou Elohim..."

# Interlinear
inter = requests.get(f"{API}/api/v1/tokens/6383/interlinear").json()["data"]
for t in inter["interlinear"]:
    print(f'{t["original"]} -> {t["gloss"]}')

# Busca
results = requests.get(f"{API}/api/v1/search", params={"q": "Elohim", "limit": 5}).json()["data"]
for r in results:
    print(f'{r["book"]} {r["chapter"]}:{r["verse"]} — {r["text"]}')
```

---

## Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| **TypeScript** | Linguagem principal |
| **Hono** | Framework web ultrarrápido |
| **Cloudflare Workers** | Runtime serverless global |
| **Cloudflare D1** | Banco de dados SQLite na edge |
| **Wrangler** | CLI de deploy |
| **ESLint + Prettier** | Qualidade de código |

---

## Estrutura do Projeto

```
biblia-belem-anc/
├── src/
│   ├── index.ts              # Entry point da API
│   ├── types.ts              # Interfaces TypeScript
│   └── routes/
│       ├── books.ts          # /api/v1/books
│       ├── verses.ts         # /api/v1/verses
│       ├── tokens.ts         # /api/v1/tokens
│       ├── glosses.ts        # /api/v1/glosses
│       └── glossary.ts       # /api/v1/glossary
├── glossary/
│   ├── greek.json            # Glossário Grego → PT-BR
│   ├── hebrew.json           # Glossário Hebraico → PT-BR
│   └── README.md
├── scripts/                  # Scripts de processamento
├── migrations/               # Migrações D1
├── wrangler.toml             # Configuração Cloudflare
└── package.json
```

---

## Contribua — O Mundo Precisa de Você

Este projeto só existe porque é **Open Source**. A Palavra de Deus não pertence a nenhuma instituição. Pertence a todos.

### Como Você Pode Ajudar

| Perfil | Como Contribuir |
|---|---|
| **Desenvolvedor** | Melhore a API, adicione endpoints, otimize performance |
| **Estudioso de Grego/Hebraico** | Revise traduções, sugira glossário, valide etimologias |
| **Graduando em Teologia** | Use os códices tokenizados como fonte primária para seu TCC ou monografia. Questione o que te ensinaram — com o texto original na mão |
| **Mestrando / Doutorando** | Atualize suas teses com dados direto dos códices. Compare suas conclusões com a tradução literal rígida. Publique artigos acadêmicos baseados em evidência textual, não em tradição |
| **Professor / Pesquisador** | Refute nosso trabalho — com o próprio texto original. Se encontrar erro, abra uma Issue. Se confirmar, divulgue. O escrutínio público é o depurador da Verdade |
| **Seminário / Instituição** | Adote a Belém An.C como ferramenta de estudo comparativo. Desafie seus alunos a confrontar traduções convencionais com os códices |
| **Tradutor** | Ajude a traduzir para novos idiomas — inglês, espanhol, seu idioma |
| **Documentador** | Melhore docs, tutoriais, exemplos |
| **Qualquer pessoa** | Divulgue. Leia. Questione. Use |

### Início Rápido para Contribuidores

1. Leia os [Princípios Inegociáveis](#princípios-inegociáveis)
2. Consulte o [Guia de Contribuição](CONTRIBUTING.md)
3. Veja o [Glossário](glossary/README.md) para entender o formato
4. Abra uma Issue ou Discussion
5. Faça seu Fork e envie um Pull Request

```bash
# Fork e clone
git clone https://github.com/SEU-USUARIO/biblia-belem-anc.git
cd biblia-belem-anc
npm install
npm run dev:remote

# Antes de enviar
npm run lint && npm run format:check
```

---

## Roadmap

| Fase | Status | Meta |
|---|---|---|
| API REST funcional | **Concluído** | Livros, versículos, tokens, glosses |
| Glossário grego/hebraico | **Concluído** | Tradução literal rígida |
| Interface de leitura web | **Concluído** | https://aculpaedasovelhas.org/ler-biblia.html |
| Tradução ~57% concluída | **Em andamento** | Completar Novo Testamento |
| Tradução completa (66 livros) | Planejado | 100% dos 66 livros |
| Versão em inglês | Planejado | English Rigid Literal Translation |
| Versão em espanhol | Planejado | Traducción Literal Rígida |
| App mobile | Planejado | Leitura offline |
| Exportação EPUB/PDF/USFM | Planejado | Formatos acadêmicos |

Veja o [Roadmap completo](ROADMAP.md) para detalhes.

---

## Ecossistema "A Culpa é das Ovelhas"

A Tradução bíblica Belem-2025 faz parte de um ecossistema completo para estudo bíblico:

| Projeto | O Que É | URL |
|---|---|---|
| **Tradução bíblica Belem-2025** | A tradução literal (este projeto) | [biblia.aculpaedasovelhas.org](https://biblia.aculpaedasovelhas.org) |
| **Site Principal** | Portal do ecossistema | [aculpaedasovelhas.org](https://aculpaedasovelhas.org) |
| **exeg.ai** | IA treinada na Bíblia Belém | [exeg.ai](https://exeg.ai) |
| **O Livrinho** | Decodificação do Enigma 666 | [aculpaedasovelhas.org/livrinho](https://aculpaedasovelhas.org/livrinho.html) |
| **Artigos** | Exegese filológica rigorosa | [aculpaedasovelhas.org/artigos](https://aculpaedasovelhas.org/artigos/) |
| **Calculadora Gematria** | Valores numéricos das Escrituras | [aculpaedasovelhas.org/tools/gematria](https://aculpaedasovelhas.org/tools/gematria/) |

---

## O Convite

> *"A minha proposta foi contar com a COMUNIDADE TECNOLÓGICA MUNDIAL para produzir um texto Bíblico FIEL, IPSIS LITTERIS às cópias dos originais, sem que dependa de qualquer instituição — religiosa ou política."*
>
> — **O livrinho — A Culpa é das Ovelhas**, Cap. I

Desde o princípio, confessos e não confessos são Ovelhas irmãs. O único mandamento é: **Amar a Deus sobre todas as coisas e ao próximo como a si mesmo.**

Este projeto recebe pessoas de qualquer fé, com total liberdade para divergir. Aqui **ideias são alvos. Pessoas não.**

Você pode participar para provar que o autor está errado. Ou que Jesus Cristo está errado. Ou que Deus não existe.

**Se a Palavra de Deus não suportar o escrutínio da própria Palavra, então não é Deus.**

Mas se, no caminho, você descobrir que ela é perfeita, considere confessar sua fé em **JESUS CRISTO**, o Criador.

**Este é um movimento de proporções mundiais. Faça parte.**

---

## Sobre o Autor

**Belem Anderson Costa** — policial carioca (Inspetor de Polícia Penal do RJ — Complexo Prisional de Gericinó-Bangu), desenvolvedor e gerente de projeto de inovação e tecnologia. Autor de *"O Livrinho — A Culpa é das Ovelhas"*. Criador da **Escola Escatológica Desvelacional Forense "Belem an.C-2039"** — a única escola escatológica forense existente. Fundador da **Worktech Otimiza Benefícios**.

Neurodivergente Duplamente Excepcional.

---

## Licença

**CC BY 4.0** — Creative Commons Attribution 4.0 International

Você pode usar, copiar, modificar e distribuir livremente, desde que atribua crédito ao autor original.

```
Tradução bíblica Belem-2025 — Tradução literal por Belem Anderson Costa
https://github.com/OtimizaPro/biblia-belem-anc
Licenciado sob CC BY 4.0
```

---

<div align="center">

Tradução bíblica Belem-2025 — Porque as ovelhas precisam conhecer a voz do Pastor

A Palavra não pertence a nenhuma instituição. Pertence a todos.

"Você lê. E a interpretação é sua."

Copyright 2025-2026 Belem Anderson Costa - A Culpa é das Ovelhas

</div>
