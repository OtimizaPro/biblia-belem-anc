# Contribuindo para a API Bíblia Belem An.C

Obrigado por seu interesse em contribuir!

## Tipos de Contribuição

### Para Desenvolvedores

1. **Bug Fixes** - Correções de bugs na API
2. **Features** - Novas funcionalidades
3. **Performance** - Otimizações
4. **Docs** - Melhorias na documentação

### Para Tradutores

Para sugestões de tradução, contribua no repositório [glossary-belem](https://github.com/OtimizaPro/glossary-belem).

## Setup de Desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/OtimizaPro/biblia-belem-anc.git
cd biblia-belem-anc

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env

# Execute em desenvolvimento
npm run dev
```

## Estrutura do Projeto

```
src/
├── index.ts          # Entry point
├── types.ts          # TypeScript types
├── routes/
│   ├── books.ts      # /books endpoints
│   ├── verses.ts     # /verses endpoints
│   ├── tokens.ts     # /tokens endpoints
│   ├── glosses.ts    # /glosses endpoints
│   └── glossary.ts   # /glossary endpoints
└── docs/
    └── openapi.ts    # API documentation
```

## Padrões de Código

- **TypeScript** - Tipagem estrita
- **ESLint** - Linting (execute `npm run lint`)
- **Prettier** - Formatação (execute `npm run format`)

## Processo de Pull Request

1. Fork o repositório
2. Crie branch: `feature/descricao` ou `fix/descricao`
3. Faça commits descritivos
4. Execute testes e linting
5. Abra PR para branch `develop`
6. Aguarde revisão

## Commits

Use commits semânticos:

```
feat: adiciona endpoint de busca
fix: corrige parsing de tokens gregos
docs: atualiza documentação da API
refactor: reorganiza rotas
```

## Testes

```bash
# Executar testes
npm test

# Executar com coverage
npm run test:coverage
```

## Deploy

O deploy para Cloudflare Workers é automático via GitHub Actions quando merge para `main`.

## Dúvidas

Abra uma **Discussion** ou **Issue** para dúvidas.

---

**Ecossistema A Culpa é das Ovelhas**
