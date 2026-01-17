# Glossario Biblia Belem An.C 2025

Sistema de traducao literal rigida do grego/hebraico para portugues.

> **Filosofia:** "Voce le. E a interpretacao e sua."

---

## Sobre o Glossario

O glossario e parte fundamental da traducao literal rigida da Biblia Belem An.C 2025.
Ele mapeia palavras do grego koine e hebraico biblico para traducoes literais em portugues,
mantendo a fidelidade estrutural ao texto original.

---

## Principios da Traducao

1. **Fidelidade ao codice original** - Sem suavizacao
2. **Literalidade** - Palavra por palavra quando possivel
3. **Sem normalizacao** - Preservar estrutura original
4. **Sem interferencia do tradutor** - Minima interpretacao
5. **Transparencia** - Intervencoes editoriais sinalizadas com `[ ]`

---

## Palavras que Permanecem no Original

| Categoria | Palavras |
|-----------|----------|
| Deus | Theos, Theou, Theon, Theo |
| Jesus | Iesous, Iesou |
| Cristo | Christos, Christou |

---

## Como Contribuir

### 1. Via Pull Request (GitHub)

1. Fork o repositorio
2. Edite o arquivo `glossary/greek.json`
3. Adicione traducoes no formato:

```json
{
  "palavra_grega": {
    "translation": "traducao_literal",
    "strongs": "G1234",
    "notes": "observacoes opcionais"
  }
}
```

4. Abra um Pull Request

### 2. Via API

```bash
POST /api/v1/glossary/suggest
Content-Type: application/json

{
  "word": "logos",
  "translation": "palavra",
  "strongs": "G3056",
  "contributor": "seu_nome"
}
```

### 3. Via Issues

Abra uma Issue com:

- Palavra grega/hebraica
- Traducao sugerida
- Referencia (Strong's number)
- Justificativa

---

## Estrutura dos Arquivos

```text
glossary/
├── greek.json          # Glossario Grego -> PT-BR
├── hebrew.json         # Glossario Hebraico -> PT-BR
├── keep_original.json  # Palavras que nao devem ser traduzidas
└── README.md           # Este arquivo
```

---

## Fontes Textuais

| Codigo | Fonte |
|--------|-------|
| BHSA | Biblia Hebraica Stuttgartensia |
| WLC | Westminster Leningrad Codex |
| SBLGNT | SBL Greek New Testament |
| TR1550 | Textus Receptus 1550 |
| Nestle1904 | Critica textual |

---

## Recursos de Referencia

- [Strong's Greek Dictionary](https://github.com/morphgnt/strongs-dictionary-xml)
- [STEPBible Data](https://github.com/STEPBible/STEPBible-Data)
- [Open Scriptures](https://github.com/openscriptures/strongs)

---

## API Endpoints do Glossario

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| `/api/v1/glossary` | GET | Listar todas as entradas |
| `/api/v1/glossary/:word` | GET | Buscar traducao de uma palavra |
| `/api/v1/glossary/suggest` | POST | Sugerir nova traducao |
| `/api/v1/glossary/search` | GET | Buscar por termo |

---

## Links Uteis

- **API de Producao:** https://biblia.aculpaedasovelhas.org
- **Interface de Leitura:** https://aculpaedasovelhas.org/ler-biblia.html
- **exeg.ai (IA de Exegese):** https://plataforma.exeg.ai
- **Repositorio GitHub:** https://github.com/AndersonOtimiza

---

## Licenca

CC BY 4.0 - Atribuicao requerida

Copyright 2025 Anderson Costa Belem - A Culpa e das Ovelhas
