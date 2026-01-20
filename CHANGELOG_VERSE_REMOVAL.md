# Changelog - Remoção de Marcadores de Versículos

Data: 20 de janeiro de 2026

## 📌 Motivo Histórico

Os livros bíblicos originais **não possuíam divisão em versículos**:

- **Estrutura Capítular**: Presente nos manuscritos originais
- **Divisão em Capítulos**: Introduzida no século XII (Estêvão Langton)
- **Divisão em Versículos**: Introduzida no século XVI (Robert Estienne - 1551)

## 🎯 Decisão Tomada

A Bíblia Belém An.C 2025 **remove os marcadores de versículos** enquanto mantém a estrutura capítular.

### Motivos:

1. **Literalidade Rígida**: Volta à estrutura original dos códices
2. **Fidelidade Histórica**: Reflete como os textos foram originalmente compostos
3. **Sem Interpretação**: Não impõe construções posteriores ao leitor
4. **Coerência com Filosofia**: "Você lê. E a interpretação é sua."

## ✅ Implementação

### Arquivos Afetados

- **66 livros bíblicos**
- **31.156 marcadores de versículos removidos**
- **Estrutura capítular mantida intacta**

### Exemplo

**Antes:**
```
── Capítulo 1 ──

1  No-princípio criou Deus [OBJ] os-céus...
2  E-a-terra era sem-forma e-vazia...
3  E-disse Deus haja luz...
```

**Depois:**
```
── Capítulo 1 ──

No-princípio criou Deus [OBJ] os-céus...
E-a-terra era sem-forma e-vazia...
E-disse Deus haja luz...
```

## 📊 Impacto na API

### Novo Padrão de Leitura

- Ainda é possível referenciar versículos pela posição (contando linhas)
- Mas o texto não impõe numeração artificial
- Capítulos permanecem como estrutura legítima

### Endpoints Afetados

- `GET /api/v1/verses/:book/:chapter` - Continua funcionando com estrutura capítular
- Textos retornados agora sem marcadores de versículos

## 🔍 Documentação

Esta decisão deve ser documentada em:

1. **Seção "Notas sobre Versículos"** no README
2. **Endpoint `/api/v1/translation-info`** - Nova categoria explicativa
3. **Glossário/Keep Original** - Motivo editorial documentado

## 📚 Referências Históricas

- **Códices Originais**: Continuum de texto (sem divisões)
- **Septuaginta/LXX**: Apenas divisões de livros
- **Vulgata (Jérônimo, 390 d.C.)**: Capítulos não presentes
- **Stephen Langton (1150s)**: Primeiro a adicionar divisão capítular
- **Robert Estienne (1551)**: Primeira Bíblia com versículos

---

**Conclusão**: Esta mudança reflete um compromisso com a fidelidade histórica e literalidade rígida da tradução.
