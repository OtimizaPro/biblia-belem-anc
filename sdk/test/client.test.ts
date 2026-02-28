import { describe, it, expect } from 'vitest';
import { BibliaClient } from '../src/index.js';

const client = new BibliaClient();

describe('BibliaClient', () => {
  // ── Books ──────────────────────────────────────────────

  it('getBooks() retorna 66 livros', async () => {
    const books = await client.getBooks();
    expect(books).toHaveLength(66);
    expect(books[0].code).toBe('GEN');
    expect(books[0].name_pt).toBe('Gênesis');
    expect(books[0].testament).toBe('AT');
  });

  it('getBook("MAT") retorna Mateus', async () => {
    const book = await client.getBook('MAT');
    expect(book.code).toBe('MAT');
    expect(book.testament).toBe('NT');
    expect(book.chapters_count).toBe(28);
  });

  it('getBook() com codigo invalido lanca erro', async () => {
    await expect(client.getBook('INVALID')).rejects.toThrow();
  });

  // ── Verses ─────────────────────────────────────────────

  it('getChapter("GEN", 1) retorna versiculos', async () => {
    const verses = await client.getChapter('GEN', 1);
    expect(verses.length).toBeGreaterThan(0);
    expect(verses[0].canonical_ref).toContain('GEN 1:');
    expect(verses[0].literal_pt).toBeTruthy();
  });

  it('getVerse("GEN", 1, 1) retorna Genesis 1:1', async () => {
    const verse = await client.getVerse('GEN', 1, 1);
    expect(verse.canonical_ref).toBe('GEN 1:1');
    expect(verse.literal_pt).toContain('Elohim');
  });

  // ── Search ─────────────────────────────────────────────

  it('search() encontra resultados para "amor"', async () => {
    const results = await client.search({ q: 'amor', limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].book).toBeTruthy();
    expect(results[0].highlight).toContain('amor');
  });

  it('searchRaw() retorna meta com total', async () => {
    const response = await client.searchRaw({ q: 'yhwh', limit: 1 });
    expect(response.success).toBe(true);
    expect(response.meta?.total).toBeGreaterThan(0);
  });

  it('search() com filtro por testamento', async () => {
    const results = await client.search({ q: 'yhwh', testament: 'AT', limit: 3 });
    expect(results.length).toBeGreaterThan(0);
  });

  // ── Tokens ─────────────────────────────────────────────

  it('getTokens() retorna tokens de um versiculo', async () => {
    const tokens = await client.getTokens(6383);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[0].position).toBe(1);
    expect(tokens[0].text_utf8).toBeTruthy();
  });

  it('getInterlinear() retorna visao interlinear', async () => {
    const data = await client.getInterlinear(6383);
    expect(data.verse).toBeDefined();
    expect(data.interlinear.length).toBeGreaterThan(0);
    expect(data.interlinear[0].original).toBeTruthy();
    expect(data.interlinear[0].gloss).toBeTruthy();
  });

  it('getMorphology() retorna analise morfologica', async () => {
    const tokens = await client.getMorphology(6383);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[0].text_utf8).toBeTruthy();
    expect(tokens[0].script).toBeTruthy();
  });

  // ── Glossary ───────────────────────────────────────────

  it('getGlossary() retorna entradas', async () => {
    const entries = await client.getGlossary(3);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].word).toBeTruthy();
    expect(entries[0].translation).toBeTruthy();
  });

  // ── Translation Info ───────────────────────────────────

  it('getTranslationInfo() retorna visao geral', async () => {
    const info = await client.getTranslationInfo();
    expect(info).toBeDefined();
  });

  it('getEditorialMarkers() retorna marcadores', async () => {
    const markers = await client.getEditorialMarkers();
    expect(markers).toBeDefined();
  });

  it('getWordsNotTranslated() retorna categorias', async () => {
    const words = await client.getWordsNotTranslated();
    expect(words).toBeDefined();
  });

  // ── Options ────────────────────────────────────────────

  it('aceita baseUrl customizada', async () => {
    const custom = new BibliaClient({ baseUrl: 'https://biblia.aculpaedasovelhas.org/' });
    const books = await custom.getBooks();
    expect(books).toHaveLength(66);
  });

  it('timeout curto causa erro', async () => {
    const slow = new BibliaClient({ timeout: 1 });
    await expect(slow.getBooks()).rejects.toThrow();
  });
});
