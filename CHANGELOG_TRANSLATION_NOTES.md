# Resumo de Alterações - Seção de Notas de Tradução

Data: 20 de janeiro de 2026

## 🎯 Objetivo Alcançado

Adicionar documentação completa sobre por que palavras estão em colchetes e por que certas palavras não são traduzidas na Bíblia Belém An.C 2025.

---

## 📝 Mudanças Realizadas

### 1. **Arquivo de Configuração: `glossary/keep_original.json`**
- ✅ Atualizado com estrutura aprimorada incluindo motivos detalhados
- ✅ Adicionada documentação sobre `yhwh` (Tetragramaton)
- ✅ Explicações claras para: yhwh, Theos, Iesous, Christos
- ✅ Adicionada filosofia: "Você lê. E a interpretação é sua."

### 2. **Novo Arquivo de Dados: `src/data/translation-notes.json`**
Criado arquivo centralizado com documentação completa:
- Marcadores editoriais (`[OBJ]`, etc) com razões e exemplos
- Palavras não traduzidas com contexto histórico
- Diretrizes de uso na API

### 3. **Nova Rota: `src/routes/translation-info.ts`**
Implementados 4 novos endpoints:
- `GET /api/v1/translation-info` - Visão geral completa
- `GET /api/v1/translation-info/editorial-markers` - Explicação de colchetes
- `GET /api/v1/translation-info/words-not-translated` - Palavras não traduzidas
- `GET /api/v1/translation-info/word/:word` - Consulta de palavra específica

### 4. **Atualização da API Principal: `src/index.ts`**
- ✅ Importado novo módulo de translation-info
- ✅ Montada a nova rota `/api/v1/translation-info`
- ✅ Atualizado endpoint raiz com nova seção de endpoints

### 5. **Documentação OpenAPI: `src/docs/openapi.ts`**
- ✅ Adicionado novo tag "Tradução"
- ✅ Documentados 4 novos endpoints na especificação OpenAPI
- ✅ Incluídos exemplos e descrições detalhadas

### 6. **Conversão de YHWH para yhwh**
- ✅ Convertido em todos os 66 livros da Bíblia em português
- ✅ Total de conversões: múltiplas ocorrências em cada livro
- ✅ Exemplo: "E-disse yhwh Deus" (estava: "E-disse YHWH Deus")

### 7. **README.md**
- ✅ Adicionada seção completa sobre novos endpoints
- ✅ Exemplos de uso inclusos
- ✅ Respostas JSON demonstradas

---

## 🔍 Exemplos de Uso

### Consultar por que [OBJ] está em colchetes
```bash
curl http://localhost:8787/api/v1/translation-info/editorial-markers
```

### Entender por que yhwh não é traduzido
```bash
curl http://localhost:8787/api/v1/translation-info/word/yhwh
```

### Resposta Esperada
```json
{
  "success": true,
  "data": {
    "word": "yhwh",
    "category": "yhwh",
    "original_hebrew": "יהוה",
    "reason_not_translated": "Tetragramaton - Nome sagrado de Deus em hebraico..."
  }
}
```

---

## 📊 Validação

✅ **ESLint**: Sem erros  
✅ **TypeScript**: Tipagem correta  
✅ **Prettier**: Formatação OK  
✅ **API**: Endpoints respondendo corretamente  

---

## 🎨 Estrutura de Dados

### translation-notes.json
```
- philosophy: Filosofia do projeto
- editorial_markers:
  - [OBJ]: Objeto Direto (com exemplos)
  - [grammatical_ellipsis]: Elipse
  - [interpretation_needed]: Interpretação
- words_not_translated:
  - yhwh: Tetragramaton hebraico
  - Theos: Termo grego para Deus
  - Iesous: Nome Jesus em grego
  - Christos: Cristo em grego
```

---

## 📌 Notas Importantes

1. **yhwh em minúscula**: Convenção para consistência nas respostas JSON
2. **Filosofia preservada**: "Você lê. E a interpretação é sua."
3. **Literalidade rígida**: Mantida em todos os dados
4. **Tradução transparente**: Cada decisão é documentada

---

## 🚀 Próximas Sugestões

- [ ] Adicionar mais marcadores editoriais conforme necessário
- [ ] Expandir exemplos bíblicos para cada marcador
- [ ] Internacionalizar documentação para outras línguas
- [ ] Criar interface UI para consultar notas de tradução
