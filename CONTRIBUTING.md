# Contribuindo para a Bíblia Belém An.C 2025

Obrigado por seu interesse em contribuir para uma tradução bíblica literal e open source!

> **Filosofia:** "Você lê. E a interpretação é sua."

---

## Tipos de Contribuidores

### Desenvolvedores TypeScript/JavaScript

Contribua com a API REST, melhorias de performance, novos endpoints.

**Requisitos:**

- Node.js 20+
- Familiaridade com TypeScript e Hono
- Conhecimento básico de Cloudflare Workers (opcional)

### Estudiosos de Grego/Hebraico

Contribua com traduções literais, revisões etimológicas, sugestões de glossário.

**Requisitos:**

- Conhecimento de grego koiné ou hebraico bíblico
- Familiaridade com Strong's Concordance
- Capacidade de fornecer justificativas acadêmicas

### Tradutores

Ajude na revisão e consistência das traduções existentes.

**Requisitos:**

- Domínio do português brasileiro
- Entendimento dos princípios de tradução literal
- Atenção a detalhes

### Documentadores

Melhore a documentação, tutoriais, exemplos de uso.

**Requisitos:**

- Boa escrita em português ou inglês
- Familiaridade com Markdown

---

## Princípios Inegociáveis

Toda contribuição **deve** respeitar estes princípios:

| Princípio | Descrição |
|-----------|-----------|
| **Literalidade** | Palavra-por-palavra sempre que possível |
| **Transparência** | Intervenções editoriais marcadas com `[ ]` |
| **Consistência** | Mesma palavra original = mesma tradução |
| **Neutralidade** | Zero viés denominacional ou teológico |
| **Etimologia** | Priorizar raiz etimológica sobre uso moderno |

### Palavras que NÃO Traduzimos

| Original | Motivo |
|----------|--------|
| yhwh | Tetragrama - Nome próprio divino |
| Theos | Preserva distinção do grego |
| Iesous | Nome próprio em grego |
| Christos | Título grego (ungido) |

---

## Como Contribuir: Código

### Setup de Desenvolvimento

```bash
# 1. Fork e clone
git clone https://github.com/SEU-USUARIO/biblia-belem-anc.git
cd biblia-belem-anc

# 2. Instale dependências
npm install

# 3. Execute em desenvolvimento (conecta ao D1 remoto)
npm run dev:remote

# 4. Acesse
# http://localhost:8787/health
# http://localhost:8787/api/v1/books

# 5. Verifique qualidade antes de commitar
npm run lint
npm run format:check
npm run typecheck
```

### Estrutura do Projeto

```
src/
├── index.ts          # Entry point da API
├── types.ts          # TypeScript interfaces
├── routes/
│   ├── books.ts      # GET /api/v1/books
│   ├── verses.ts     # GET /api/v1/verses
│   ├── tokens.ts     # GET /api/v1/tokens
│   ├── glosses.ts    # GET /api/v1/glosses
│   └── glossary.ts   # GET /api/v1/glossary
└── docs/
    └── openapi.ts    # Documentação OpenAPI
```

### Processo de Pull Request

1. **Crie uma branch** a partir de `main`:
   - `feature/descricao` - Para novas funcionalidades
   - `fix/descricao` - Para correções de bugs
   - `docs/descricao` - Para documentação

2. **Faça commits semânticos:**

   ```
   feat: adiciona endpoint de busca avançada
   fix: corrige parsing de tokens gregos
   docs: atualiza documentação da API
   refactor: reorganiza rotas de versículos
   chore: atualiza dependências
   ```

3. **Execute verificações locais:**

   ```bash
   npm run lint && npm run format:check && npm run typecheck
   ```

4. **Abra PR para branch `main`**

5. **Aguarde revisão** (mínimo 1 aprovação)

---

## Como Contribuir: Tradução

### Via Issue (Recomendado para Iniciantes)

1. Acesse [Issues](https://github.com/OtimizaPro/biblia-belem-anc/issues)
2. Clique "New Issue"
3. Escolha o template **"Sugestão de Tradução"**
4. Preencha todos os campos obrigatórios:
   - Palavra original (grego/hebraico)
   - Transliteração
   - Número Strong's
   - Tradução sugerida
   - Justificativa etimológica
   - Exemplos bíblicos
5. Aguarde revisão de um mantenedor

### Via Pull Request (Contribuidores Experientes)

1. Fork o repositório
2. Edite `glossary/greek.json` ou `glossary/hebrew.json`
3. Use o formato:

```json
{
  "palavra_original": "tradução_literal"
}
```

Ou formato estendido com metadados:

```json
{
  "G3056": {
    "original": "λόγος",
    "transliteration": "logos",
    "literal": "palavra",
    "notes": "Raiz etimológica indica 'o que é dito'"
  }
}
```

4. Valide o JSON:

   ```bash
   # Windows PowerShell
   Get-Content glossary/greek.json | ConvertFrom-Json

   # Linux/Mac
   jq empty glossary/greek.json
   ```

5. Abra PR com justificativa completa

---

## Processo de Revisão

```
1. CI Automatizado
   └── Lint, Format, Typecheck

2. Revisão por Mantenedor
   └── Verificação de princípios

3. Revisão por Especialista (traduções)
   └── Validação etimológica

4. Merge
   └── Após 1+ aprovações

5. Deploy Automático
   └── Cloudflare Workers
```

---

## Recursos Úteis

### Ferramentas de Estudo

| Ferramenta | URL | Uso |
|------------|-----|-----|
| Blue Letter Bible | https://www.blueletterbible.org | Concordância Strong's |
| STEPBible | https://www.stepbible.org | Análise interlinear |
| Perseus Digital Library | http://www.perseus.tufts.edu | Léxicos gregos |
| Biblia Hebraica | https://tanach.us | Texto hebraico |

### Léxicos Acadêmicos

- **BDAG** - Bauer-Danker Greek-English Lexicon
- **HALOT** - Hebrew and Aramaic Lexicon of the OT
- **Louw-Nida** - Greek-English Lexicon of the NT
- **BDB** - Brown-Driver-Briggs Hebrew Lexicon

### Documentação do Projeto

- [README.md](README.md) - Documentação da API
- [glossary/README.md](glossary/README.md) - Sistema de glossário
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Código de conduta

---

## Boas Práticas

### Para Código

- ✅ Mantenha funções pequenas e focadas
- ✅ Use TypeScript estrito (sem `any`)
- ✅ Documente endpoints novos no OpenAPI
- ✅ Siga o padrão de resposta existente (`success`, `data`, `meta`)
- ❌ Não introduza dependências desnecessárias
- ❌ Não altere comportamento de endpoints existentes sem discussão

### Para Traduções

- ✅ Priorize a raiz etimológica
- ✅ Mantenha consistência (mesma palavra = mesma tradução)
- ✅ Forneça referências acadêmicas
- ✅ Considere o contexto original
- ❌ Não traduza com base em tradições denominacionais
- ❌ Não priorize fluidez sobre literalidade
- ❌ Não insira interpretações no texto

---

## Dúvidas?

| Canal | Uso |
|-------|-----|
| **Issues** | Bugs, sugestões de features |
| **Discussions** | Perguntas gerais, ideias |
| **Pull Requests** | Contribuições de código/tradução |

---

## Reconhecimento

Contribuidores são reconhecidos em:

- README.md (seção Contributors)
- Release notes
- Créditos da tradução

---

**Ecossistema A Culpa é das Ovelhas**

> "Você lê. E a interpretação é sua."

*Porque as ovelhas precisam conhecer a voz do Pastor*
