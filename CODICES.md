# CODICES.md - Catalogo de Fontes Originais

> Biblia Belem An.C 2025 - Traducao Literal Rigida
> "Voce le. E a interpretacao e sua."

**Atualizado:** 29 de Marco de 2026
**Autor:** Belem Anderson Costa
**Licenca:** CC BY 4.0

---

## Principio Fundamental

> Zero intermediarios. Codices originais (Hebraico / Aramaico / Grego) direto para Portugues.
> **LATIM REJEITADO** — a Vulgata Latina de Jeronimo NAO e fonte. Nenhum texto biblico canonico foi originalmente escrito em latim.

---

## Indice

1. [Visao Geral das Fontes](#visao-geral-das-fontes)
2. [Fontes Hebraicas (Antigo Testamento)](#fontes-hebraicas-antigo-testamento)
3. [Fontes Gregas (Novo Testamento)](#fontes-gregas-novo-testamento)
4. [Manuscritos do Mar Morto (DSS)](#manuscritos-do-mar-morto-dss)
5. [Grandes Codices Unciais](#grandes-codices-unciais)
6. [Papiros Biblicos](#papiros-biblicos)
7. [Repositorios Academicos Baixados](#repositorios-academicos-baixados)
8. [Cadeia de Custodia Textual](#cadeia-de-custodia-textual)
9. [Validacao da Traducao](#validacao-da-traducao)

---

## Visao Geral das Fontes

### Fontes Primarias da Traducao

| # | Codigo | Nome Completo | Idioma | Testamento | Tipo | Licenca |
|---|--------|---------------|--------|------------|------|---------|
| 1 | **BHSA** | Biblia Hebraica Stuttgartensia Amstelodamensis | Hebraico | AT | Texto critico + morfologia | CC BY-NC 4.0 |
| 2 | **WLC** | Westminster Leningrad Codex (OSHB) | Hebraico | AT | Texto diplomatico | Public Domain + CC BY 4.0 |
| 3 | **SBLGNT** | SBL Greek New Testament (MorphGNT) | Grego Koine | NT | Texto critico + morfologia | CC BY 4.0 |
| 4 | **TR1550** | Textus Receptus / Robinson-Pierpont 2018 | Grego Koine | NT | Texto majoritario | Public Domain |
| 5 | **Nestle1904** | Nestle Greek New Testament 1904 | Grego Koine | NT | Texto critico classico | CC0 (morfologia) |
| 6 | **DSS** | Dead Sea Scrolls (ETCBC/dss) | Hebraico, Aramaico | AT + sectarios | Manuscritos Qumran | CC BY-NC 4.0 |

### Fontes de Referencia e Comparacao

| # | Codigo | Nome | Tipo | Relevancia |
|---|--------|------|------|------------|
| 7 | **Sinaiticus** | Codex Sinaiticus (Aleph/01) | Uncial grego sec. IV | NT completo mais antigo |
| 8 | **Vaticanus** | Codex Vaticanus (B/03) | Uncial grego sec. IV | LXX + NT (ate Hb 9:14) |
| 9 | **Alexandrinus** | Codex Alexandrinus (A/02) | Uncial grego sec. V | Melhor testemunha de Desvelacao |
| 10 | **STEPBible** | Tyndale House Cambridge Data | Dados lexicais | Strong's estendido, morfologia |
| 11 | **P45-P47** | Papiros Chester Beatty | Papiro grego sec. III | Mais antigos papiros extensos do NT |
| 12 | **P66/P75** | Papiros Bodmer | Papiro grego sec. II-III | Joao e Lucas mais antigos |

### Fontes REJEITADAS

| Fonte | Idioma | Motivo da Rejeicao |
|-------|--------|-------------------|
| **Vulgata Latina** | Latim | Traducao de traducao. Nenhum texto canonico foi escrito em latim |
| **Septuaginta (LXX)** | Grego | Traducao grega do AT hebraico — usada apenas como referencia, NAO como fonte |
| **Peshitta** | Siriaco | Traducao siriaca — referencia secundaria apenas |
| **Tradicao eclesiastica** | - | NAO e fonte de autoridade textual |

---

## Fontes Hebraicas (Antigo Testamento)

### 1. BHSA — Biblia Hebraica Stuttgartensia Amstelodamensis

| Item | Valor |
|------|-------|
| **Instituicao** | Eep Talstra Centre for Bible and Computer (ETCBC), VU Amsterdam |
| **Manuscrito base** | Codex Leningradensis (Firkovich B 19A), 1008-1009 EC |
| **Formato** | Text-Fabric (Python) |
| **Dados** | 100+ features: morfologia, sintaxe (arvores de clausulas), fonologia, lexico, ketiv/qere |
| **Repositorio** | https://github.com/ETCBC/bhsa |
| **DOI** | 10.17026/dans-z6y-skyh |
| **Licenca** | CC BY-NC 4.0 |
| **Local** | `codices/hebraico/` (referencia) |
| **Uso no projeto** | Fonte primaria para tokens hebraicos, morfologia, lemas |

**Sobre o Codex Leningradensis:**
- Manuscrito completo mais antigo da Biblia Hebraica inteira
- Copiado em Cairo, 1008-1009 EC, por Samuel ben Jacob
- Baseado nos manuscritos de Aaron ben Moses ben Asher (escola massortica de Tiberias)
- Atualmente na Biblioteca Nacional da Russia, Sao Petersburgo
- Serviu de base para BHS (1977) e BHQ (em andamento)

### 2. WLC — Westminster Leningrad Codex (via OSHB)

| Item | Valor |
|------|-------|
| **Instituicao** | Westminster Theological Seminary + Open Scriptures |
| **Manuscrito base** | Codex Leningradensis (mesmo do BHSA) |
| **Formato** | OSIS XML, JSON |
| **Dados** | Texto acentuado, numeros Strong aumentados, codigos morfologicos, IDs imutaveis |
| **Repositorio** | https://github.com/openscriptures/morphhb |
| **Licenca** | Public Domain (texto) + CC BY 4.0 (morfologia/lemas) |
| **Local** | `codices/hebraico/oshb-wlc/` |
| **Uso no projeto** | Verificacao cruzada, numeros Strong, morfologia alternativa |

**Diferenca BHSA vs WLC:**
- Ambos derivam do Codex Leningradensis
- BHSA: processamento computacional (ETCBC), com sintaxe de arvore
- WLC/OSHB: transcricao diplomatica com Strong's aumentado
- Projeto usa ambos para validacao cruzada

### Manuscrito Fonte Comum: Codex Leningradensis

```
Codex Leningradensis (1008-1009 EC)
    │
    ├── BHSA (ETCBC, VU Amsterdam) ─── morfologia + sintaxe
    │       │
    │       └── D1 tokens table (text_utf8, morph_code, lemma)
    │
    └── WLC/OSHB (Westminster) ─── Strong's + XML
            │
            └── glossary/hebrew.json (traducoes literais)
```

---

## Fontes Gregas (Novo Testamento)

### 3. SBLGNT — SBL Greek New Testament (MorphGNT)

| Item | Valor |
|------|-------|
| **Editor** | Michael W. Holmes (Society of Biblical Literature) |
| **Morfologia** | James K. Tauber (MorphGNT) |
| **Formato** | 27 arquivos TSV (1 por livro), 7 colunas |
| **Colunas** | referencia, parte-fala, parsing, texto, palavra, normalizada, lema |
| **Repositorio** | https://github.com/morphgnt/sblgnt |
| **DOI** | 10.5281/zenodo.376200 |
| **Licenca** | CC BY 4.0 (texto) + CC BY-SA 3.0 (morfologia) |
| **Local** | `codices/grego/sblgnt-morphgnt/` |
| **Uso no projeto** | Fonte primaria para tokens gregos do NT |

### 4. Nestle 1904

| Item | Valor |
|------|-------|
| **Editor original** | Eberhard Nestle (1904) |
| **Digitalizacao** | Diego Renato dos Santos |
| **Morfologia** | Ulrik Sandborg-Petersen |
| **Formato** | CSV, XML, XHTML |
| **Diferencial** | Sistema de tagging duplo (funcional + formal), lematizacao BDAG/ANLEX |
| **Repositorio** | https://github.com/biblicalhumanities/Nestle1904 |
| **Licenca** | CC0 (morfologia — dominio publico) |
| **Local** | `codices/grego/nestle1904/` |
| **Uso no projeto** | Critica textual, comparacao de variantes |

### 5. Textus Receptus / Robinson-Pierpont 2018

| Item | Valor |
|------|-------|
| **Editor** | Dr. Maurice A. Robinson & William G. Pierpont |
| **Base** | Tradicao textual Bizantina (majoritaria) |
| **Formato** | CSV (Unicode), TEI-XML |
| **Diferencial** | Aparato critico comparando NA28/ECM, numeros Strong |
| **Repositorio** | https://github.com/byztxt/byzantine-majority-text |
| **Licenca** | Unlicense (dominio publico) |
| **Local** | `codices/grego/textus-receptus-byz/` |
| **Uso no projeto** | Referencia para tradicao textual bizantina, variantes do TR1550 |

### Relacao entre Fontes Gregas

```
Manuscritos Originais (sec. I-II)
    │
    ├── Papiros (P45, P46, P47, P66, P75...)
    │
    ├── Codices Unciais (Sinaiticus, Vaticanus, Alexandrinus...)
    │       │
    │       ├── Tradicao Alexandrina ──> Nestle 1904 ──> NA28 ──> SBLGNT
    │       │
    │       └── Tradicao Bizantina ──> Textus Receptus 1550 ──> Robinson-Pierpont 2018
    │
    └── Biblia Belem An.C 2025
            │
            ├── SBLGNT (base primaria, texto critico)
            ├── Nestle 1904 (comparacao, variantes)
            └── RP2018/TR1550 (tradicao majoritaria)
```

---

## Manuscritos do Mar Morto (DSS)

### 6. Dead Sea Scrolls — ETCBC/dss

| Item | Valor |
|------|-------|
| **Projeto** | CACCHT (Creating Annotated Corpora of Classical Hebrew Texts) |
| **Transcricoes** | Martin Abegg |
| **Framework** | Text-Fabric (Python) |
| **Total** | ~1.001 manuscritos de Qumran (cavernas 1-11) |
| **Biblicos** | 266 manuscritos biblicos |
| **Nao-biblicos** | 735 manuscritos sectarios |
| **Repositorio** | https://github.com/ETCBC/dss |
| **DOI** | 10.5281/zenodo.168822533 |
| **Licenca** | CC BY-NC 4.0 |
| **Local** | `dss-data/` (submodulo git) |
| **Migracao D1** | `migrations/004_dss_manuscripts.sql` |
| **API** | `src/routes/dss.ts` (6 endpoints) |

### Manuscritos DSS Chave para o Projeto

| Sigla | Nome | Conteudo | Palavras | Relevancia |
|-------|------|----------|----------|------------|
| **1QIsa-a** | Grande Rolo de Isaias | Isaias completo | 24.078 | Unico livro AT completo de Qumran |
| **11QPsa** | Rolo dos Salmos | Salmos (ordem diferente) | ~4.000 | Variantes textuais significativas |
| **4QSam-a** | Samuel | 1-2 Samuel | ~3.500 | Variantes pre-masorreticas |
| **1QS** | Regra da Comunidade | Sectario | ~6.000 | Contexto historico |
| **4Q246** | Filho de Deus | Aramaico | ~100 | "Filho do Altissimo" — pre-cristao |
| **11Q13** | Melquisedec | Sectario | ~300 | Exegese de Lv 25, Is 61, Sl 82 |
| **4QDan-a** | Daniel | Daniel 1-8 | ~1.200 | Hebraico + Aramaico |
| **1QpHab** | Pesher Habacuque | Comentario | ~2.500 | Metodo interpretativo de Qumran |

### Imagens DSS

| Recurso | URL | Acesso |
|---------|-----|--------|
| **Leon Levy Digital Library** | https://www.deadseascrolls.org.il | Gratuito, alta resolucao |
| **Israel Museum** | https://www.imj.org.il/en/wings/shrine-book | Gratuito |
| **Google Arts & Culture** | Buscar "Dead Sea Scrolls" | Gratuito |

**Documentacao detalhada:** `codices/dss-imagens/ACESSO-DSS-IMAGENS.md`

---

## Grandes Codices Unciais

> Codices unciais sao manuscritos em pergaminho escritos em maiusculas gregas (sec. IV-V).
> NAO sao fontes diretas da traducao, mas servem como referencia de verificacao.

### Codex Sinaiticus (Aleph / 01)

| Item | Valor |
|------|-------|
| **Data** | Meados do sec. IV (~340-360 EC) |
| **Conteudo** | LXX parcial + **NT completo** (mais antigo NT inteiro) + Barnabe + Pastor de Hermas |
| **Formato** | 4 colunas por pagina, 400+ folhas |
| **Locais fisicos** | British Library, Univ. Leipzig, Mosteiro Sta. Catarina (Sinai), Bibl. Nacional Russia |
| **Digital** | https://codexsinaiticus.org (transcricao + imagens alta res) |
| **Variantes notaveis** | Ausencia de Mc 16:9-20, Jo 7:53-8:11, Comma Johanneum |
| **Documentacao** | `codices/papiros/CODEX-SINAITICUS.md` |

### Codex Vaticanus (B / 03)

| Item | Valor |
|------|-------|
| **Data** | c. 300-350 EC |
| **Conteudo** | LXX quase completa + NT ate Hebreus 9:14 (sem Desvelacao, sem Pastorais) |
| **Formato** | 3 colunas, 759 folhas, formato quase quadrado |
| **Local fisico** | Biblioteca Apostolica Vaticana (Vat.gr.1209) |
| **Digital** | https://digi.vatlib.it (IIIF) |
| **Nota famosa** | Marginal em Hb 1:3: "Tolo e ignaro, deixa a leitura antiga!" |
| **Documentacao** | `codices/papiros/CODEX-VATICANUS.md` |

### Codex Alexandrinus (A / 02)

| Item | Valor |
|------|-------|
| **Data** | c. 400-440 EC |
| **Conteudo** | LXX + NT (lacunas em Mt, Jo, 2Co) + 1-2 Clemente |
| **Formato** | 2 colunas, texto misto (Bizantino nos Evangelhos, Alexandrino nas Epistolas) |
| **Local fisico** | British Library (Royal MS 1 D V-VIII) |
| **Relevancia especial** | **Melhor testemunha uncial para Desvelacao** — crucial para "O Livrinho" |
| **Documentacao** | `codices/papiros/CODEX-ALEXANDRINUS.md` |

### Comparacao dos Tres Grandes Codices

| Criterio | Sinaiticus | Vaticanus | Alexandrinus |
|----------|-----------|-----------|-------------|
| Data | ~350 EC | ~325 EC | ~425 EC |
| NT completo | **Sim** | Ate Hb 9:14 | Sim (com lacunas) |
| Desvelacao | Sim | **NAO** | **Sim (melhor)** |
| Tipo textual | Alexandrino | Alexandrino | Misto |
| Acesso digital | Excelente | Bom | Bom |

---

## Papiros Biblicos

> Papiros sao os mais antigos testemunhos do texto do NT (sec. II-IV).
> Documentacao completa em `codices/papiros/FONTES-PAPIROS-IMAGENS.md`.

### Papiros Prioritarios para o Projeto

| Papiro | Data | Conteudo | Local | Relevancia |
|--------|------|----------|-------|------------|
| **P46** | c. 200 | Paulinas (Rm, 1-2Co, Gl, Ef, Fp, Cl, 1Ts, Hb) | Chester Beatty + Michigan | Mais antigo corpus paulino |
| **P66** | c. 200 | Joao 1-21 | Bibl. Bodmer, Genebra | Joao mais antigo quase completo |
| **P75** | c. 175-225 | Lucas 3-24, Joao 1-15 | Biblioteca Vaticana | Concordancia com Vaticanus |
| **P45** | c. 250 | Evangelhos + Atos | Chester Beatty | Mais antigo papiro extenso dos Evangelhos |
| **P47** | c. 280 | Desvelacao 9:10-17:2 | Chester Beatty | **Mais antigo de Desvelacao** — "O Livrinho" |
| **P52** | c. 125 | Joao 18:31-33, 37-38 | Rylands, Manchester | Fragmento NT mais antigo conhecido |
| **P.Fouad 266** | sec. I AEC | LXX Deuteronomio | Cairo | **Preserva Tetragrama (yhwh) em grego** |

### Acesso Digital a Papiros

| Repositorio | URL | Conteudo |
|-------------|-----|----------|
| **CSNTM** | https://manuscripts.csntm.org | Imagens alta res de manuscritos gregos |
| **INTF/NT.VMR** | https://ntvmr.uni-muenster.de | Sala de manuscritos virtuais |
| **Papyri.info** | https://papyri.info | Banco de dados de papiros |
| **IIIF** | Varios | Protocolo interoperavel de imagens |

---

## Repositorios Academicos Baixados

> Dados textuais computacionais baixados de centros academicos para validacao.

### Diretorio `codices/`

```
codices/
├── hebraico/
│   ├── FONTES-HEBRAICAS.md           # Documentacao academica AT
│   └── oshb-wlc/                     # Westminster Leningrad Codex (40 livros XML)
│       └── wlc/*.xml                 # Texto hebraico morfologicamente anotado
│
├── grego/
│   ├── FONTES-GREGAS.md              # Documentacao academica NT
│   ├── sblgnt-morphgnt/              # SBLGNT com morfologia MorphGNT
│   │   └── *.txt                     # 27 livros NT (TSV, 7 colunas)
│   ├── nestle1904/                   # Nestle 1904 com morfologia
│   │   ├── morph/                    # CSV + XML morfologico
│   │   ├── xhtml/                    # 27 livros XHTML
│   │   └── glosses/                  # Glossas interlineares
│   └── textus-receptus-byz/          # Robinson-Pierpont 2018
│       ├── csv-unicode/              # CSV com/sem variantes
│       └── tei-xml-unicode/          # TEI-XML
│
├── papiros/
│   ├── FONTES-PAPIROS-IMAGENS.md     # Catalogo de papiros e colecoes
│   ├── CODEX-SINAITICUS.md           # Referencia academica
│   ├── CODEX-VATICANUS.md            # Referencia academica
│   └── CODEX-ALEXANDRINUS.md         # Referencia academica
│
├── dss-imagens/
│   └── ACESSO-DSS-IMAGENS.md         # Guia de acesso Leon Levy + Israel Museum
│
└── dados-academicos/
    ├── stepbible-data/               # Tyndale House Cambridge
    │   ├── Lexicons/                 # Strong's estendido (HE + GR)
    │   ├── Morphology codes/         # Codigos morfologicos
    │   ├── Tagged-Bibles/            # Biblias anotadas
    │   └── Translators Amalgamated/  # TAHOT + TAGNT
    └── strongs-lexicon/              # Open Scriptures
        ├── hebrew/                   # Strong's hebraico (XML, JSON)
        └── greek/                    # Strong's grego (XML, JSON)
```

### Submodulo Existente

```
dss-data/                             # Git submodule (ETCBC/dss)
├── catalog.json                      # 1.001 manuscritos catalogados
├── texts/                            # ~997 arquivos JSON com transcricoes
├── ingest/                           # 544 SQLs para ingestao no D1
└── comparisons/                      # Analises comparativas
```

---

## Cadeia de Custodia Textual

> Rastreabilidade completa: do manuscrito fisico ao token traduzido no D1.

### Antigo Testamento

```
Manuscrito Fisico                    Repositorio Digital              Banco de Dados
─────────────────                    ───────────────────              ──────────────
Codex Leningradensis ─────────────> BHSA (ETCBC) ──────────────────> D1: tokens
  (1008-1009 EC)                    + WLC/OSHB                         (text_utf8,
  Bibl. Nacional Russia                                                 morph_code,
                                                                        lemma,
Manuscritos Qumran ──────────────> ETCBC/dss ──────────────────────> D1: dss_tokens
  (sec. III AEC - I EC)             (Text-Fabric)                      (glyph,
  Cavernas 1-11                                                         lemma,
                                                                        morpho)
```

### Novo Testamento

```
Manuscrito Fisico                    Repositorio Digital              Banco de Dados
─────────────────                    ───────────────────              ──────────────
Papiros (P45-P75...) ┐
Sinaiticus (~350 EC) ├─ edic. crit. > SBLGNT (MorphGNT) ──────────> D1: tokens
Vaticanus (~325 EC)  ┤               + Nestle 1904                     (text_utf8,
Alexandrinus (~425 EC)┘               + RP2018/TR1550                   morph_code,
                                                                        lemma,
                                                                        pt_literal)
```

### Pipeline de Traducao

```
Codice Original (HE/ARM/GRC)
    │
    ├──[1]── Token extraido (text_utf8)
    │
    ├──[2]── Glossario aplicado (glossary/hebrew.json + greek.json)
    │           │
    │           └── keep_original.json (8 palavras NAO traduzidas)
    │
    ├──[3]── Traducao IA dual-GPU (Ollama qwen2.5:14b)
    │           ├── GPU-0 (RTX 5060 Ti): AT / port 11434
    │           └── GPU-1 (RTX 4060): NT / port 11435
    │
    ├──[4]── Traducao Claude API (pre-computed, ~1.400 palavras)
    │
    ├──[5]── Batch hardcoded (~115+ palavras frequentes)
    │
    └──[6]── Validacao editorial (marcadores [OBJ], [grammatical_ellipsis])
                │
                └── D1: tokens.pt_literal (441.646 tokens, 100% traduzidos)
```

---

## Validacao da Traducao

### Palavras NAO Traduzidas (8 categorias)

> Estas palavras permanecem no original por principio de literalidade rigida.
> Documentadas em `glossary/keep_original.json`.

| Palavra | Hebraico/Grego | Validacao BHSA | Validacao SBLGNT | Status |
|---------|----------------|----------------|-------------------|--------|
| yhwh | יהוה | BHSA: 6.828 ocorrencias | N/A (AT apenas) | Preservado |
| Elohim | אֱלֹהִים | BHSA: 2.602 ocorrencias | N/A | Preservado |
| Eloah | אֱלוֹהַּ | BHSA: 57 ocorrencias (predominante em Jo) | N/A | Preservado |
| El | אֵל | BHSA: 236 ocorrencias | N/A | Preservado |
| Adonai | אֲדֹנָי | BHSA: 439 ocorrencias | N/A | Preservado |
| Theos | Θεός | N/A | SBLGNT: 1.317 ocorrencias | Preservado |
| Iesous | Ἰησοῦς | N/A | SBLGNT: 917 ocorrencias | Preservado |
| Christos | Χριστός | N/A | SBLGNT: 529 ocorrencias | Preservado |

### Palavra PROIBIDA

| Palavra | Idioma | Status |
|---------|--------|--------|
| **Deus** | LATIM | **NUNCA deve aparecer na traducao** |

### Verificacao de Integridade

| Verificacao | Metodo | Frequencia |
|-------------|--------|------------|
| Token count vs fonte | `list-untranslated.mjs` | Sob demanda |
| Glossario vs BHSA/SBLGNT | `apply-glossary.mjs` | Apos atualizacao |
| DSS vs canonico | `src/routes/dss.ts` (endpoint /compare) | Via API |
| Exportacao TXT | `export-all-books.mjs` | Apos traducao |
| Marcadores editoriais | `editorial-validator.mjs` | CI/CD |

---

## Estatisticas do Banco de Dados

| Tabela | Registros | Cobertura |
|--------|-----------|-----------|
| books | 66 | 100% (canon 66 livros) |
| verses | 31.287 | 31.156 com traducao |
| tokens | 441.646 | **100% com pt_literal** |
| glossary | variavel | Comunidade |
| dss_manuscripts | ~1.001 | Qumran completo |
| dss_tokens | variavel | Morfologia DSS |

---

## Fontes Academicas e Instituicoes

### Centros de Pesquisa

| Instituicao | Pais | Contribuicao |
|-------------|------|-------------|
| ETCBC, VU Amsterdam | Holanda | BHSA, DSS (Text-Fabric) |
| Westminster Theological Seminary | EUA | WLC/OSHB |
| Society of Biblical Literature | EUA | SBLGNT |
| Tyndale House, Cambridge | Reino Unido | STEPBible Data |
| INTF, Universidade de Munster | Alemanha | NT.VMR, aparato critico |
| Israel Antiquities Authority | Israel | Dead Sea Scrolls (Leon Levy) |
| CSNTM, Dallas | EUA | Digitalizacao de manuscritos |

### Bibliotecas com Manuscritos Fisicos

| Biblioteca | Local | Manuscritos Relevantes |
|------------|-------|----------------------|
| Biblioteca Nacional da Russia | Sao Petersburgo | Codex Leningradensis |
| British Library | Londres | Sinaiticus (parte), Alexandrinus |
| Biblioteca Vaticana | Roma | Vaticanus, P75 |
| Universidade de Leipzig | Leipzig | Sinaiticus (parte) |
| Mosteiro Sta. Catarina | Sinai, Egito | Sinaiticus (parte) |
| Chester Beatty Library | Dublin | P45, P46, P47 |
| Biblioteca Bodmer | Genebra | P66, P72, P75 |
| John Rylands Library | Manchester | P52 (fragmento mais antigo NT) |

---

## Licencas, Atribuicoes e Compatibilidade

> **ATENCAO:** O projeto Biblia Belem An.C 2025 e licenciado como **CC BY 4.0** (permite uso comercial).
> Nem todas as fontes academicas sao compativeis com uso comercial.
> Esta secao documenta o status de cada fonte e as acoes necessarias.

### Mapa Completo de Licencas

| Fonte | Licenca | Dominio Publico? | Uso Comercial? | Compativel CC BY 4.0? |
|-------|---------|:----------------:|:--------------:|:---------------------:|
| WLC texto | **Public Domain** | SIM | SIM | SIM |
| Nestle1904 morfologia | **CC0** | SIM | SIM | SIM |
| RP2018 / TR1550 | **Unlicense** | SIM | SIM | SIM |
| Strong's (Open Scriptures) | **Public Domain** | SIM | SIM | SIM |
| WLC morfologia/lemas (OSHB) | CC BY 4.0 | Nao | SIM (com atribuicao) | SIM |
| SBLGNT texto | CC BY 4.0 | Nao | SIM (com atribuicao) | SIM |
| STEPBible Data | CC BY 4.0 | Nao | SIM (com atribuicao) | SIM |
| MorphGNT (morfologia SBLGNT) | CC BY-SA 3.0 | Nao | SIM (com atribuicao + share-alike) | PARCIAL (*) |
| **BHSA** (ETCBC) | **CC BY-NC 4.0** | Nao | **NAO** | **NAO** |
| **DSS** (ETCBC/dss) | **CC BY-NC 4.0** | Nao | **NAO** | **NAO** |
| Leon Levy DSS imagens | Uso educacional | Nao | Consultar termos | VERIFICAR |

(*) CC BY-SA 3.0 exige que obras derivadas usem a mesma licenca. A morfologia do MorphGNT
aplicada aos tokens do D1 pode requerer que esses dados especificos sejam share-alike.

### ALERTA: Conflito de Licenca Identificado

As duas fontes do **ETCBC** (VU Amsterdam) usam **CC BY-NC 4.0**, que **proibe uso comercial**.

| Fonte ETCBC | Dados no Projeto | Risco |
|-------------|------------------|-------|
| **BHSA** | Se tokens AT no D1 foram extraidos do BHSA (morfologia, sintaxe) | A API comercial pode violar CC BY-NC |
| **DSS** (ETCBC/dss) | `dss-data/`, tabelas `dss_*` no D1, endpoints `/api/v1/dss/` | Endpoints DSS sao derivados de dados NC |

### Resolucao Recomendada

#### Para o Antigo Testamento (tokens AT)

| Acao | Descricao | Status |
|------|-----------|--------|
| **Migrar fonte AT para WLC/OSHB** | Usar WLC (Public Domain) + OSHB morfologia (CC BY 4.0) como fonte primaria | RECOMENDADO |
| **BHSA como referencia apenas** | Manter BHSA em `codices/` para consulta academica, NAO derivar dados da API | RECOMENDADO |
| **Verificar origem dos tokens** | Auditar se `text_utf8` e `morph_code` no D1 vieram do BHSA ou do WLC | PENDENTE |

**Nota:** Ambos (BHSA e WLC) derivam do mesmo manuscrito fisico — o **Codex Leningradensis**. O texto hebraico em si e o mesmo. A diferenca esta nos **metadados computacionais** (morfologia, sintaxe, anotacoes) que cada projeto adicionou. O texto puro do Codex Leningradensis e dominio publico (manuscrito de 1008 EC). O que o ETCBC cobra licenca NC e pelo trabalho computacional de anotacao.

**Acao pratica:** Se os tokens AT no D1 usam apenas `text_utf8` (texto hebraico puro) + `morph_code` do OSHB (CC BY 4.0) + `lemma` do OSHB, entao NAO ha conflito. Se usam arvores sintaticas ou features exclusivos do BHSA, ha conflito.

#### Para os Manuscritos do Mar Morto (DSS)

| Acao | Descricao | Status |
|------|-----------|--------|
| **Separar endpoints DSS** | Marcar `/api/v1/dss/` como non-commercial ou educacional | RECOMENDADO |
| **Ou: licenca especifica** | Contatar ETCBC/VU Amsterdam para licenca de uso no projeto | ALTERNATIVA |
| **Ou: substituir dados** | Usar transcricoes DSS de dominio publico (se existirem) | INVESTIGAR |

**Nota:** As transcricoes dos DSS sao de Martin Abegg. Nao ha alternativa open-source equivalente em dominio publico com o mesmo nivel de anotacao.

#### Para o MorphGNT (CC BY-SA 3.0)

| Acao | Descricao | Status |
|------|-----------|--------|
| **Atribuir MorphGNT** | Incluir credito a James K. Tauber nos endpoints que usam morfologia NT | RECOMENDADO |
| **Ou: usar Nestle1904** | Morfologia Nestle1904 e CC0 (dominio publico) — sem restricao | ALTERNATIVA |

### Cadeia de Custodia Corrigida (compativel CC BY 4.0)

```
FONTE COMPATIVEL (CC BY 4.0)             FONTE RESTRITA (CC BY-NC 4.0)
════════════════════════════              ═══════════════════════════════

AT: WLC/OSHB (PD + CC BY 4.0)            BHSA (CC BY-NC) ──> referencia apenas
    │                                     DSS (CC BY-NC) ──> endpoints separados
    └──> D1: tokens (text_utf8,
         morph_code, lemma, pt_literal)

NT: SBLGNT (CC BY 4.0)
    + Nestle1904 (CC0)
    + RP2018 (PD)
    │
    └──> D1: tokens (text_utf8,
         morph_code, lemma, pt_literal)
```

### Atribuicoes Obrigatorias (para conformidade)

Incluir em `/docs`, README.md e respostas da API:

```
Fontes textuais:
- Westminster Leningrad Codex (WLC) — Public Domain
- Open Scriptures Hebrew Bible (OSHB) — CC BY 4.0
  Westminster Theological Seminary / Open Scriptures
- SBL Greek New Testament — CC BY 4.0
  Michael W. Holmes, Society of Biblical Literature
- MorphGNT morphology — CC BY-SA 3.0
  James K. Tauber
- Nestle 1904 Greek NT — CC0
  Diego Renato dos Santos / Ulrik Sandborg-Petersen
- Robinson-Pierpont 2018 Byzantine Text — Public Domain
  Maurice A. Robinson & William G. Pierpont
- STEPBible Data — CC BY 4.0
  Tyndale House, Cambridge
- Dead Sea Scrolls data — CC BY-NC 4.0 (non-commercial)
  ETCBC/CACCHT, Martin Abegg transcriptions
```

---

## Como Verificar uma Traducao

### Passo a Passo

1. **Identificar o token** no D1: `SELECT * FROM tokens WHERE verse_id = X`
2. **Verificar a fonte original:**
   - Hebraico: comparar `text_utf8` com OSHB XML (`codices/hebraico/oshb-wlc/wlc/`)
   - Grego: comparar com SBLGNT (`codices/grego/sblgnt-morphgnt/`)
3. **Checar glossario:** `glossary/hebrew.json` ou `glossary/greek.json`
4. **Verificar se e keep_original:** `glossary/keep_original.json`
5. **Comparar com DSS (se AT):** API `/api/v1/dss/compare/:sigla/:chapter/:verse`
6. **Exportar e revisar:** `node scripts/export-all-books.mjs`

### Comando Rapido de Verificacao

```bash
# Verificar progresso de traducao
node scripts/check-progress.mjs

# Listar tokens nao traduzidos de um livro
node scripts/list-untranslated.mjs GEN

# Comparar DSS com canonico
curl "http://localhost:8787/api/v1/dss/compare/1Qisaa/1/1"
```

---

## Referencias Bibliograficas

1. Elliger, K. & Rudolph, W. (eds.) *Biblia Hebraica Stuttgartensia*. 5th ed. Deutsche Bibelgesellschaft, 1997.
2. Holmes, M.W. (ed.) *The Greek New Testament: SBL Edition*. Society of Biblical Literature, 2010.
3. Nestle, E. *Novum Testamentum Graece*. 1904.
4. Robinson, M.A. & Pierpont, W.G. *The New Testament in the Original Greek: Byzantine Textform 2018*.
5. Abegg, M. *Dead Sea Scrolls Transcriptions*. ETCBC/CACCHT, CC BY-NC 4.0.
6. Tov, E. *Textual Criticism of the Hebrew Bible*. 3rd ed. Fortress Press, 2012.
7. Metzger, B.M. & Ehrman, B.D. *The Text of the New Testament*. 4th ed. Oxford, 2005.

---

**Biblia Belem An.C 2025** — *Traducao literal rigida por Belem Anderson Costa*
**CC BY 4.0** — https://github.com/OtimizaPro/biblia-belem-anc
