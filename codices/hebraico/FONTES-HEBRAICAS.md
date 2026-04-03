# Fontes Hebraicas Academicas para a Biblia Belem An.C 2025

> Documento de referencia academica das fontes textuais hebraicas utilizadas e disponiveis para o projeto de traducao literal.

**Data:** 29 de Marco de 2026
**Projeto:** Biblia Belem An.C 2025 — Traducao Literal Rigida
**Licenca deste documento:** CC BY 4.0

---

## Indice

1. [BHSA — Biblia Hebraica Stuttgartensia Amstelodamensis](#1-bhsa--biblia-hebraica-stuttgartensia-amstelodamensis)
2. [WLC — Westminster Leningrad Codex (via OSHB)](#2-wlc--westminster-leningrad-codex-via-oshb)
3. [Comparativo das Fontes](#3-comparativo-das-fontes)
4. [Mapeamento para a Biblia Belem An.C](#4-mapeamento-para-a-biblia-belem-anc)
5. [Referencias Academicas](#5-referencias-academicas)

---

## 1. BHSA — Biblia Hebraica Stuttgartensia Amstelodamensis

### 1.1 Descricao Academica

A BHSA e uma representacao computacional (text-fabric) do texto da Biblia Hebraica enriquecida com anotacoes linguisticas abrangentes. O dataset foi compilado pelo **Eep Talstra Centre for Bible and Computer (ETCBC)** da Vrije Universiteit Amsterdam (VU Amsterdam), Holanda.

O nome "Amstelodamensis" distingue esta edicao digital da Biblia Hebraica Stuttgartensia (BHS) impressa, publicada pela Deutsche Bibelgesellschaft (Sociedade Biblica Alema). A BHSA representa decadas de trabalho academico em codificacao linguistica do texto hebraico biblico.

### 1.2 Repositorio e Acesso

| Item | Valor |
|------|-------|
| **Repositorio GitHub** | https://github.com/ETCBC/bhsa |
| **Documentacao** | https://etcbc.github.io/bhsa/ |
| **Instituicao** | Eep Talstra Centre for Bible and Computer, VU Amsterdam |
| **Formato de dados** | Text-Fabric (TF) |
| **DOI** | 10.17026/dans-z6y-skyh |
| **Versoes disponiveis** | Multiplas versoes desde 2011 ate o presente (dados historicos imutaveis) |

### 1.3 Licenca

**CC BY-NC 4.0 (Creative Commons Atribuicao-NaoComercial 4.0 Internacional)**

- Permitido: download, processamento, modificacao, criacao de aplicacoes
- Permitido: uso em pesquisa e publicacao de resultados
- Proibido: uso comercial sem consentimento da Deutsche Bibelgesellschaft
- Obrigatorio: atribuicao via DOI 10.17026/dans-z6y-skyh

> **NOTA para Biblia Belem An.C:** O projeto e open source (CC BY 4.0) e sem fins comerciais, portanto compativel com a licenca CC BY-NC 4.0 da BHSA para fins de pesquisa e estudo.

### 1.4 Dados Disponiveis

#### Camadas Linguisticas

| Camada | Descricao | Relevancia para Traducao |
|--------|-----------|--------------------------|
| **Morfologia** | Genero (gn), numero (nu), pessoa (prs), parte do discurso (sp), estado (st), raiz verbal (vbs), tempo verbal (vt) | Essencial para traducao literal rigida |
| **Sintaxe** | Estruturas de clausula, frase e sentenca; relacoes funcionais (mother, distributional parent) | Crucial para compreensao da estrutura hebraica |
| **Fonologia** | Representacoes foneticas das palavras hebraicas (modulo phono) | Util para transliteracoes |
| **Lexico** | Lexema (lex), glosa (gloss), frequencia (rank_lex, rank_occ), vocabulario (voc_lex) | Base para glossarios |
| **Texto** | Consoantes hebraicas (g_cons), palavras completas (g_word), variantes UTF-8 | Texto-fonte primario |
| **Variantes** | Leituras ketiv-qere | Fundamental para decisoes editoriais |
| **Discurso** | Dominio, funcao, relacao (domain, function, rela) | Contextualizacao |
| **Paragrafos** | Marcadores de paragrafo (pargr) | Estruturacao textual |

#### Tipos de Objeto (Hierarquia Textual)

| Nivel | Descricao |
|-------|-----------|
| **Livro** (book) | 39 livros do Tanakh |
| **Capitulo** (chapter) | Divisoes capitulares |
| **Versiculo** (verse) | Divisoes versiculares |
| **Sentenca** (sentence) | Unidade sintatica superior |
| **Clausula** (clause) | Unidade sintatica intermediaria |
| **Frase** (phrase) | Agrupamento sintagmatico |
| **Palavra** (word) | Unidade lexical |
| **Morfema** (morpheme) | Unidade morfologica minima |

#### Mais de 100 Features Linguisticas

Incluem, entre outras: genero, numero, pessoa, parte do discurso, estado construto/absoluto, raiz verbal, tronco verbal (qal, nifal, piel, pual, hifil, hofal, hitpael), tempo verbal, lexema, glosa, frequencia, formas graficas em consoantes e com pontuacao, variantes ketiv/qere, marcadores de paragrafo, funcoes discursivas.

#### Modulos Complementares

| Modulo | Conteudo |
|--------|----------|
| **bhsa-min** | Versao minima do dataset |
| **phono** | Dados fonologicos |
| **parallels** | Referencias cruzadas entre versiculos paralelos |
| **valence** | Valencia verbal — regencia de verbos especificos |
| **trees** | Estruturas sintaticas em arvore |
| **bridging** | Pontes entre versoes |
| **pipeline** | Pipeline de processamento |
| **shebanq** | Interface de consulta online |

#### Projetos Relacionados (Familia ETCBC)

| Projeto | Descricao |
|---------|-----------|
| **DSS (Dead Sea Scrolls)** | Manuscritos do Mar Morto — mesmo formato text-fabric |
| **Extra-biblical texts** | Textos extra-biblicos |
| **Peshitta** | Traducao siriaca |

### 1.5 Como Acessar os Dados

```bash
# Via Text-Fabric (Python)
pip install text-fabric

# Navegador de linha de comando
text-fabric etcbc/bhsa

# Em Jupyter Notebook
from tf.app import use
A = use('etcbc/bhsa', hoist=globals())
```

Os dados sao baixados automaticamente para o diretorio local `~/text-fabric-data/` na primeira execucao.

### 1.6 Comando para Download Direto do Repositorio

```bash
# Clone completo (todas as versoes — varios GB)
git clone https://github.com/ETCBC/bhsa.git

# Clone superficial (apenas ultima versao)
git clone --depth 1 https://github.com/ETCBC/bhsa.git

# Dados TF ficam em: bhsa/tf/
```

---

## 2. WLC — Westminster Leningrad Codex (via OSHB)

### 2.1 Descricao Academica

O **Westminster Leningrad Codex (WLC)** e uma edicao digital do Codex Leningradensis (Firkovich B 19A), o mais antigo manuscrito completo da Biblia Hebraica, datado de 1008-1009 d.C. A edicao digital foi preparada pelo **J. Alan Groves Center for Advanced Biblical Research** do Westminster Theological Seminary (Philadelphia, EUA).

O acesso aos dados e feito atraves do projeto **Open Scriptures Hebrew Bible (OSHB)**, que enriquece o texto do WLC com lematizacao e anotacao morfologica colaborativa.

### 2.2 Repositorio e Acesso

| Item | Valor |
|------|-------|
| **Repositorio GitHub** | https://github.com/openscriptures/morphhb |
| **Homepage do Projeto** | http://openscriptures.github.io/morphhb/ |
| **Pacote npm** | https://www.npmjs.com/package/morphhb |
| **Instituicao** | Open Scriptures / Westminster Theological Seminary |
| **Formato primario** | OSIS XML |
| **Formatos derivados** | JSON (via script Perl ou Python/Docker) |

### 2.3 Licenca

| Componente | Licenca |
|------------|---------|
| **Texto do WLC** | **Dominio Publico** |
| **Dados de lema e morfologia** | **CC BY 4.0 (Creative Commons Atribuicao 4.0 Internacional)** |
| **Atribuicao** | Creditar o "Open Scriptures Hebrew Bible Project" |

> **NOTA para Biblia Belem An.C:** Licenca totalmente compativel. O texto e dominio publico e os dados morfologicos sao CC BY 4.0, alinhados com a licenca CC BY 4.0 do projeto Biblia Belem.

### 2.4 Dados Disponiveis

#### Formato OSIS XML

Os arquivos XML no diretorio `wlc/` contem o texto hebraico completo com tres atributos por palavra:

| Atributo | Exemplo | Descricao |
|----------|---------|-----------|
| **Lemma** | `c/m/6529` | Numeros Strong aumentados com prefixos morfologicos separados por `/` |
| **Morph** | `HC/R/Ncmsc` | Codigo morfologico completo (parte do discurso, genero, numero, estado, etc.) |
| **ID** | `018xz` | Identificador unico e imutavel (2 digitos = numero do livro KJV + sufixo aleatorio) |

#### Codificacao Morfologica

O sistema de codigos morfologicos segue a convencao:

| Codigo | Significado |
|--------|-------------|
| **H** | Hebraico |
| **A** | Aramaico |
| **N** | Substantivo (Noun) |
| **V** | Verbo |
| **C** | Conjuncao |
| **R** | Preposicao |
| **D** | Adverbio |
| **c** | Construto (estado) |
| **a** | Absoluto (estado) |
| **m** | Masculino |
| **f** | Feminino |
| **s** | Singular |
| **p** | Plural |

#### Numeros Strong Aumentados

O sistema de lematizacao utiliza numeros Strong com extensoes:

- Prefixos separados por `/` indicam morfemas gramaticais (artigo, conjuncao, preposicao)
- Exemplo: `c/m/6529` = conjuncao + preposicao + lexema Strong #6529

#### Estrutura do Repositorio

| Diretorio | Conteudo |
|-----------|----------|
| `wlc/` | Arquivos OSIS XML — texto completo com lema e morfologia |
| `HomeFiles/` | Recursos do website do projeto |
| `MAPM/` | Material comparativo de "Miqra according to the Mesorah" |
| `structure/` | Demonstracao de formatacao baseada em cantilacao |
| `parsing/` | Utilitarios de processamento |

### 2.5 Notas Tecnicas Importantes

- **NFC Normalization:** O projeto deliberadamente NAO aplica normalizacao Unicode NFC, conforme o SBL Hebrew User Manual, para preservar a codificacao autentica dos caracteres hebraicos.
- **Identificadores imutaveis:** Os IDs de palavra sao permanentes e nao mudam entre versoes, permitindo referencias estaveis.

### 2.6 Comando para Download

```bash
# Clone completo
git clone https://github.com/openscriptures/morphhb.git

# Dados XML ficam em: morphhb/wlc/

# Conversao para JSON (requer Perl)
cd morphhb
perl morphhbXML-to-JSON.pl

# Conversao para JSON por livro (requer Docker)
docker run ... --splitByBook

# Ou instalar via npm
npm install morphhb
```

---

## 3. Comparativo das Fontes

| Criterio | BHSA (ETCBC) | WLC (OSHB) |
|----------|--------------|------------|
| **Texto-base** | BHS (Codex Leningradensis) | WLC (Codex Leningradensis) |
| **Manuscrito subjacente** | Firkovich B 19A (1008-1009 d.C.) | Firkovich B 19A (1008-1009 d.C.) |
| **Instituicao** | VU Amsterdam (ETCBC) | Westminster Theological Seminary |
| **Licenca texto** | CC BY-NC 4.0 | Dominio Publico |
| **Licenca anotacoes** | CC BY-NC 4.0 | CC BY 4.0 |
| **Formato primario** | Text-Fabric (TF) | OSIS XML |
| **Formatos derivados** | Python API | JSON, npm |
| **Morfologia** | Sim (100+ features) | Sim (codigos OSHB) |
| **Sintaxe** | Sim (clausula, frase, sentenca, arvores) | Nao |
| **Fonologia** | Sim (modulo phono) | Nao |
| **Lexico/Lema** | Sim (lexema proprio) | Sim (Strong aumentado) |
| **Variantes ketiv/qere** | Sim | Sim |
| **Analise sintatica em arvore** | Sim (modulo trees) | Nao |
| **Valencia verbal** | Sim (modulo valence) | Nao |
| **Paralelos textuais** | Sim (modulo parallels) | Nao |
| **Cantilacao** | Sim | Sim (estrutura) |
| **Linguagem de acesso** | Python (Text-Fabric) | XML/JSON/JavaScript |
| **Uso comercial** | Requer permissao DBS | Livre (texto PD, dados CC BY) |
| **Profundidade linguistica** | Superior (academia computacional) | Boa (lema + morfologia) |
| **Facilidade de integracao** | Media (requer Text-Fabric) | Alta (XML/JSON padrao) |

---

## 4. Mapeamento para a Biblia Belem An.C

### 4.1 Relevancia das Fontes

A Biblia Belem An.C 2025 utiliza como fontes primarias os codices hebraicos mais antigos e verificaveis de dominio publico. Ambas as fontes academicas descritas neste documento derivam do **Codex Leningradensis** (Firkovich B 19A), o manuscrito masoretico completo mais antigo existente.

### 4.2 Utilizacao na Traducao

| Recurso da Fonte | Aplicacao na Biblia Belem An.C |
|-------------------|-------------------------------|
| **Texto consonantal** | Base para traducao literal rigida palavra-por-palavra |
| **Morfologia (BHSA/OSHB)** | Validacao de genero, numero, pessoa, estado — essencial para literalidade |
| **Sintaxe (BHSA)** | Compreensao da estrutura de clausulas e frases hebraicas |
| **Lexema/Strong (OSHB)** | Correlacao com glossarios `hebrew.json` (~12.000 entradas) |
| **Fonologia (BHSA)** | Base para transliteracoes no campo `text_transliterated` da API |
| **Variantes ketiv/qere** | Decisoes editoriais documentadas em `CHANGELOG_TRANSLATION_NOTES.md` |
| **Arvores sintaticas (BHSA)** | Desambiguacao de construcoes complexas |
| **Valencia verbal (BHSA)** | Identificacao de objetos diretos implicitos (marcador `[OBJ]`) |

### 4.3 Mapeamento de Livros

A Biblia Belem An.C contem 66 livros (canon protestante). Ambas as fontes hebraicas cobrem os 39 livros do Antigo Testamento (Tanakh).

### 4.4 Palavras Preservadas sem Traducao

As 8 categorias de palavras mantidas no original (conforme `keep_original.json`) podem ser validadas contra ambas as fontes:

| Palavra | Validacao via BHSA | Validacao via OSHB |
|---------|--------------------|--------------------|
| yhwh (יהוה) | Lexema `JHWH` | Strong H3068/H3069 |
| Elohim (אֱלֹהִים) | Lexema `>LHJM` | Strong H430 |
| Eloah (אֱלוֹהַּ) | Lexema `>LWH` | Strong H433 |
| El (אֵל) | Lexema `>L` | Strong H410 |
| Adonai (אדני) | Lexema `>DNWJ` | Strong H136 |
| Theos (Θεος) | N/A (grego) | N/A (grego) |
| Iesous (Ἰησοῦς) | N/A (grego) | N/A (grego) |
| Christos (Χριστος) | N/A (grego) | N/A (grego) |

### 4.5 Tabelas da API D1 e Correspondencia

| Tabela D1 | Campo | Fonte Academica Correspondente |
|-----------|-------|-------------------------------|
| `tokens` | `text_original` | BHSA `g_word` / OSHB texto XML |
| `tokens` | `text_transliterated` | BHSA modulo `phono` |
| `tokens` | `lemma` | BHSA `lex` / OSHB `lemma` (Strong) |
| `tokens` | `morph_code` | BHSA features morfologicas / OSHB `morph` |
| `tokens` | `gloss` | BHSA `gloss` / glossarios proprios |
| `tokens` | `pt_literal` | Traducao Belem (441.646 tokens, 100%) |
| `verses` | `text_original` | Texto reconstituido de ambas as fontes |
| `glossary` | `strongs` | OSHB numeros Strong aumentados |
| `glossary` | `word` | BHSA lexema / OSHB lema |

---

## 5. Referencias Academicas

### BHSA

- **Publicacao principal:** Roorda, Dirk; van Peursen, Wido. "Coding the Hebrew Bible." *Research Data Journal for the Humanities and Social Sciences*, vol. 1, 2016. DOI: [10.1163/24523666-01000011](https://doi.org/10.1163/24523666-01000011)
- **Dataset DOI:** [10.17026/dans-z6y-skyh](https://doi.org/10.17026/dans-z6y-skyh)
- **Instituicao:** Eep Talstra Centre for Bible and Computer (ETCBC), Vrije Universiteit Amsterdam
- **Software:** Text-Fabric — https://github.com/annotation/text-fabric

### WLC / OSHB

- **Projeto:** Open Scriptures Hebrew Bible Project — http://openscriptures.github.io/morphhb/
- **Texto-base:** Westminster Leningrad Codex, J. Alan Groves Center for Advanced Biblical Research
- **Manuscrito:** Codex Leningradensis (Firkovich B 19A), datado de 1008-1009 d.C., preservado na Biblioteca Nacional Russa, Sao Petersburgo
- **Padrao XML:** OSIS (Open Scripture Information Standard) — http://bibletechnologies.net/
- **Pacote npm:** https://www.npmjs.com/package/morphhb

### Outras Referencias

- **BHS impressa:** Elliger, K.; Rudolph, W. (eds.). *Biblia Hebraica Stuttgartensia*. 5th ed. Stuttgart: Deutsche Bibelgesellschaft, 1997.
- **SBL Hebrew:** Society of Biblical Literature. *SBL Hebrew User Manual*. (Orientacoes sobre codificacao Unicode do hebraico biblico.)

---

## Apendice: URLs para Download Direto

| Fonte | URL |
|-------|-----|
| BHSA (repositorio completo) | https://github.com/ETCBC/bhsa |
| BHSA (dados Text-Fabric) | https://github.com/ETCBC/bhsa/tree/master/tf |
| BHSA (via pip) | `pip install text-fabric` + `text-fabric etcbc/bhsa` |
| WLC/OSHB (repositorio completo) | https://github.com/openscriptures/morphhb |
| WLC (arquivos OSIS XML) | https://github.com/openscriptures/morphhb/tree/master/wlc |
| OSHB (pacote npm JSON) | `npm install morphhb` |
| ETCBC DSS (Mar Morto) | https://github.com/ETCBC/dss |
| Text-Fabric (software) | https://github.com/annotation/text-fabric |

---

*Documento compilado para o projeto Biblia Belem An.C 2025 — traducao literal rigida dos codices para o portugues brasileiro.*
*"Voce le. E a interpretacao e sua."*
