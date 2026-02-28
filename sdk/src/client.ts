import type {
  ApiResponse,
  BibliaClientOptions,
  Book,
  GlossaryEntry,
  InterlinearData,
  SearchOptions,
  SearchResult,
  Token,
  Verse,
} from './types.js';

const DEFAULT_BASE_URL = 'https://biblia.aculpaedasovelhas.org';
const DEFAULT_TIMEOUT = 10_000;

export class BibliaClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeout: number;

  constructor(options: BibliaClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.headers = options.headers ?? {};
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
  }

  // ── Helpers ──────────────────────────────────────────────

  private async request<T>(path: string): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json', ...this.headers },
        signal: controller.signal,
      });

      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('json')) {
        return { success: false, error: `Unexpected content-type: ${contentType}` };
      }

      return (await res.json()) as ApiResponse<T>;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    } finally {
      clearTimeout(timer);
    }
  }

  private unwrap<T>(response: ApiResponse<T>): T {
    if (!response.success || response.data === undefined) {
      throw new Error(response.error ?? 'API request failed');
    }
    return response.data;
  }

  // ── Books ────────────────────────────────────────────────

  /** Listar todos os 66 livros */
  async getBooks(): Promise<Book[]> {
    return this.unwrap(await this.request<Book[]>('/api/v1/books'));
  }

  /** Detalhes de um livro pelo codigo (ex: GEN, EXO, MAT) */
  async getBook(code: string): Promise<Book> {
    return this.unwrap(await this.request<Book>(`/api/v1/books/${encodeURIComponent(code)}`));
  }

  // ── Verses ───────────────────────────────────────────────

  /** Versiculos de um capitulo inteiro */
  async getChapter(book: string, chapter: number): Promise<Verse[]> {
    return this.unwrap(
      await this.request<Verse[]>(`/api/v1/verses/${encodeURIComponent(book)}/${chapter}`)
    );
  }

  /** Versiculo especifico */
  async getVerse(book: string, chapter: number, verse: number): Promise<Verse> {
    return this.unwrap(
      await this.request<Verse>(
        `/api/v1/verses/${encodeURIComponent(book)}/${chapter}/${verse}`
      )
    );
  }

  // ── Search ───────────────────────────────────────────────

  /** Busca textual com resposta completa (data + meta) */
  async searchRaw(options: SearchOptions): Promise<ApiResponse<SearchResult[]>> {
    const params = new URLSearchParams({ q: options.q });
    if (options.testament) params.set('testament', options.testament);
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));
    return this.request<SearchResult[]>(`/api/v1/search?${params}`);
  }

  /** Busca textual (retorna apenas resultados) */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    return this.unwrap(await this.searchRaw(options));
  }

  // ── Tokens ───────────────────────────────────────────────

  /** Tokens (palavras) de um versiculo pelo verseId */
  async getTokens(verseId: number): Promise<Token[]> {
    return this.unwrap(await this.request<Token[]>(`/api/v1/tokens/${verseId}`));
  }

  /** Visao interlinear (original + transliteracao + gloss) */
  async getInterlinear(verseId: number): Promise<InterlinearData> {
    return this.unwrap(
      await this.request<InterlinearData>(`/api/v1/tokens/${verseId}/interlinear`)
    );
  }

  /** Analise morfologica dos tokens */
  async getMorphology(verseId: number): Promise<Token[]> {
    return this.unwrap(await this.request<Token[]>(`/api/v1/tokens/${verseId}/morphology`));
  }

  // ── Glossary ─────────────────────────────────────────────

  /** Listar entradas do glossario */
  async getGlossary(limit?: number): Promise<GlossaryEntry[]> {
    const params = limit ? `?limit=${limit}` : '';
    return this.unwrap(await this.request<GlossaryEntry[]>(`/api/v1/glossary${params}`));
  }

  // ── Glosses ──────────────────────────────────────────────

  /** Camadas de leitura disponiveis (N0-N5) */
  async getLayers(): Promise<ApiResponse<unknown[]>> {
    return this.request<unknown[]>('/api/v1/glosses/layers');
  }

  // ── Translation Info ─────────────────────────────────────

  /** Visao geral das notas de traducao */
  async getTranslationInfo(): Promise<unknown> {
    return this.unwrap(await this.request<unknown>('/api/v1/translation-info'));
  }

  /** Marcadores editoriais ([OBJ], [grammatical_ellipsis], etc.) */
  async getEditorialMarkers(): Promise<unknown> {
    return this.unwrap(
      await this.request<unknown>('/api/v1/translation-info/editorial-markers')
    );
  }

  /** Palavras nao traduzidas (yhwh, Elohim, Theos, etc.) */
  async getWordsNotTranslated(): Promise<unknown> {
    return this.unwrap(
      await this.request<unknown>('/api/v1/translation-info/words-not-translated')
    );
  }

  /** Detalhe de uma palavra especifica */
  async getWordDetail(word: string): Promise<unknown> {
    return this.unwrap(
      await this.request<unknown>(`/api/v1/translation-info/word/${encodeURIComponent(word)}`)
    );
  }
}
