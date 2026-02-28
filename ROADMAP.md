# Roadmap - Biblia Belem An.C 2025

> **Visao:** Uma traducao biblica literal, open source, acessivel a todos.

---

## Status Atual

| Metrica | Valor |
|---------|-------|
| Livros | 66 |
| Versiculos | 31.287 |
| Tokens | 441.646 (100% pt_literal) |
| Progresso Traducao | **100%** |
| API Status | Producao |
| Leitor Web | Producao (React 19 + Vite 7) |
| Glossario | 12.000+ hebraico, 2.000+ grego |

---

## Q1 2026 (Janeiro - Marco)

### Concluido

- [x] API REST funcional (Hono + Cloudflare Workers)
- [x] Endpoints de livros, versiculos, tokens, glossario, glosses
- [x] Sistema de glossario grego/hebraico (14.000+ entradas)
- [x] Interface de leitura web (leitor-kindle)
- [x] Documentacao open source (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT)
- [x] Traducao completa — 441.646 tokens (100% pt_literal)
- [x] Visao interlinear (original + transliteracao + gloss)
- [x] Busca textual com filtro por testamento (AT/NT)
- [x] 6 camadas de leitura (N0-N5) com descricoes visiveis
- [x] Glossario integrado ao leitor (lema, morfologia, Strong's, notas)
- [x] Sugestao de glossario inline (POST /api/v1/glossary/suggest)
- [x] Tooltips editoriais (yhwh, Elohim, Theos, [OBJ], etc.)
- [x] Historico de leitura e progresso por livro
- [x] Anotacoes e destaques (4 cores + notas por versiculo)
- [x] Explorador de lema (busca rapida a partir do glossario)
- [x] Plano de leitura (3 planos: 1 ano, 6 meses, NT 90 dias)
- [x] Visao comparativa (original / transliteracao / literal PT-BR)
- [x] Exportar/imprimir capitulos
- [x] Service Worker para leitura offline
- [x] Swipe gestures para navegacao mobile
- [x] Slider de line-height para ajuste de espacamento
- [x] 3 temas (claro, sepia, escuro) + controle de fonte/tamanho
- [x] Testes automatizados (Vitest)
- [x] Rate limiting na API
- [x] Badges no README (CI, license, API status)

### Em Andamento

- [x] SDK JavaScript/TypeScript para consumo da API
- [x] Melhorar documentacao da API com exemplos detalhados

### Planejado

- [ ] Sistema de revisao peer-review para glossario
- [ ] Tradutor Web melhorado (Ollama)

---

## Q2 2026 (Abril - Junho)

### Traducao

- [ ] Revisar consistencia de termos traduzidos
- [ ] Expandir glossario com notas etimologicas
- [ ] Sistema de variantes textuais

### Tecnologia

- [ ] Cache distribuido com Cloudflare KV
- [ ] Webhooks para notificacao de atualizacoes
- [ ] PWA completo (manifest, icons, install prompt)

### Comunidade

- [ ] Programa de contribuidores verificados
- [ ] Badges para tradutores ativos
- [ ] Dashboard de contribuicoes

---

## Q3 2026 (Julho - Setembro)

### Tecnologia e Estudo

- [ ] App mobile (React Native ou PWA avancado)
- [ ] API de comparacao entre traducoes
- [ ] Aparato critico simplificado

- [ ] Ferramenta de estudo interlinear avancada
- [ ] Concordancia biblica integrada
- [ ] Mapa de referencias cruzadas

---

## Q4 2026 (Outubro - Dezembro)

### Integracao

- [ ] Integracao com exeg.ai (IA de exegese)
- [ ] API para apps de terceiros
- [ ] Plugin para Obsidian/Notion
- [ ] Exportacao para formatos (EPUB, PDF, USFM)

---

## 2027 e Alem

### Internacionalizacao

- [ ] Versao em ingles (English Literal Translation)
- [ ] Versao em espanhol
- [ ] Documentacao multilingue

### Midia

- [ ] Audio da traducao literal
- [ ] Videos educativos sobre traducao literal
- [ ] Publicacao impressa

---

## Como Contribuir com o Roadmap

### Sugerir Funcionalidades

1. Abra uma [Discussion](https://github.com/OtimizaPro/biblia-belem-anc/discussions)
2. Use a categoria "Ideas"
3. Descreva sua sugestao em detalhes

### Trabalhar em um Item

1. Verifique se ha uma Issue relacionada
2. Comente na Issue indicando interesse
3. Aguarde atribuicao por um mantenedor
4. Siga o [Guia de Contribuicao](CONTRIBUTING.md)

### Priorizacao

Itens sao priorizados com base em:

- Impacto na comunidade
- Alinhamento com a visao do projeto
- Disponibilidade de contribuidores
- Complexidade tecnica

---

## Legenda

| Simbolo | Significado |
|---------|-------------|
| [x]     | Concluido   |
| [ ]     | Planejado   |

---

**A Culpa e das Ovelhas**

> "Voce le. E a interpretacao e sua."

*Porque as ovelhas precisam conhecer a voz do Pastor*
