# biblia-belem-sdk

SDK JavaScript/TypeScript para a API da **Biblia Belem An.C 2025** — traducao literal rigida das Escrituras Sagradas.

Zero dependencias. Funciona em Node.js 18+, Deno, Bun e browsers modernos.

## Instalacao

```bash
npm install biblia-belem-sdk
```

## Uso Rapido

```typescript
import { BibliaClient } from 'biblia-belem-sdk';

const biblia = new BibliaClient();

// Listar livros
const books = await biblia.getBooks();
console.log(books[0].name_pt); // "Genesis"

// Ler Genesis 1
const verses = await biblia.getChapter('GEN', 1);
for (const v of verses) {
  console.log(`${v.canonical_ref}: ${v.literal_pt}`);
}

// Buscar texto
const results = await biblia.search({ q: 'yhwh', testament: 'AT', limit: 10 });

// Visao interlinear (original + transliteracao + gloss)
const interlinear = await biblia.getInterlinear(6383);
for (const token of interlinear.interlinear) {
  console.log(`${token.original} → ${token.gloss}`);
}
```

## API

### Construtor

```typescript
const biblia = new BibliaClient({
  baseUrl: 'https://biblia.aculpaedasovelhas.org', // default
  timeout: 10000, // ms, default
  headers: {},    // headers customizados
});
```

### Livros

| Metodo | Retorno | Descricao |
| --- | --- | --- |
| `getBooks()` | `Book[]` | Listar todos os 66 livros |
| `getBook(code)` | `Book` | Detalhe de um livro (ex: GEN, MAT) |

### Versiculos

| Metodo | Retorno | Descricao |
| --- | --- | --- |
| `getChapter(book, chapter)` | `Verse[]` | Versiculos de um capitulo |
| `getVerse(book, chapter, verse)` | `Verse` | Versiculo especifico |

### Busca

| Metodo | Retorno | Descricao |
| --- | --- | --- |
| `search(options)` | `SearchResult[]` | Busca textual (retorna resultados) |
| `searchRaw(options)` | `ApiResponse<SearchResult[]>` | Busca com metadados (total, query) |

```typescript
// Opcoes de busca
interface SearchOptions {
  q: string;              // termo obrigatorio
  testament?: 'AT' | 'NT'; // filtro por testamento
  limit?: number;         // default: 20
  offset?: number;        // paginacao
}
```

### Tokens e Interlinear

| Metodo | Retorno | Descricao |
| --- | --- | --- |
| `getTokens(verseId)` | `Token[]` | Palavras individuais |
| `getInterlinear(verseId)` | `InterlinearData` | Original + transliteracao + gloss |
| `getMorphology(verseId)` | `Token[]` | Analise morfologica |

### Glossario

| Metodo | Retorno | Descricao |
| --- | --- | --- |
| `getGlossary(limit?)` | `GlossaryEntry[]` | Entradas do glossario |

### Informacoes de Traducao

| Metodo | Retorno | Descricao |
| --- | --- | --- |
| `getTranslationInfo()` | `object` | Visao geral |
| `getEditorialMarkers()` | `object` | Marcadores [OBJ], etc. |
| `getWordsNotTranslated()` | `object` | yhwh, Elohim, Theos, etc. |
| `getWordDetail(word)` | `object` | Detalhe de uma palavra |
| `getLayers()` | `ApiResponse` | Camadas de leitura (N0-N5) |

## Tipos Exportados

Todos os tipos sao exportados para uso em TypeScript:

```typescript
import type {
  Book,
  Verse,
  SearchResult,
  Token,
  InterlinearToken,
  InterlinearData,
  GlossaryEntry,
  SearchOptions,
  ApiResponse,
  BibliaClientOptions,
} from 'biblia-belem-sdk';
```

## Tratamento de Erros

Metodos lancam `Error` quando a API retorna `success: false`. Use `searchRaw()` ou `try/catch` para controle fino:

```typescript
try {
  const verse = await biblia.getVerse('GEN', 1, 999);
} catch (err) {
  console.error(err.message); // mensagem de erro da API
}
```

## Licenca

CC BY 4.0 — Belem Anderson Costa
