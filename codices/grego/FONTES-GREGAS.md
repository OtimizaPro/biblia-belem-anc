# Fontes Academicas do Novo Testamento Grego

> Documento de referencia para o projeto Biblia Belem An.C 2025
> Atualizado: 29 de Marco de 2026

---

## Sumario

Este documento cataloga as fontes textuais gregas de dominio publico e acesso aberto
utilizadas como base para a traducao literal do Novo Testamento na Biblia Belem An.C 2025.
Todas as fontes listadas possuem analise morfologica associada e estao disponibilizadas
em repositorios academicos abertos no GitHub.

| Fonte | Tradicao Textual | Licenca | Repositorio |
|-------|-------------------|---------|-------------|
| SBLGNT | Texto Critico (ecletico) | CC BY 4.0 | morphgnt/sblgnt |
| Nestle 1904 | Texto Critico (ecletico) | CC0 (morfologia) | biblicalhumanities/Nestle1904 |
| Robinson-Pierpont (RP2018) | Texto Bizantino Majoritario | Dominio Publico (Unlicense) | byztxt/byzantine-majority-text |

---

## 1. SBLGNT - SBL Greek New Testament

### Descricao Academica

O SBL Greek New Testament (SBLGNT) e uma edicao critica do Novo Testamento grego
publicada pela Society of Biblical Literature (SBL) em 2010, editada por Michael W. Holmes.
O texto foi estabelecido por comparacao e avaliacao de quatro edicoes criticas modernas:
Westcott-Hort (1881), Tregelles (1857-1879), Robinson-Pierpont Byzantine (2005) e
a edicao da NIV (Hodges-Farstad/NA).

O repositorio `morphgnt/sblgnt` combina o texto do SBLGNT com a analise morfologica
do projeto MorphGNT, editado por James K. Tauber.

### Dados Bibliograficos

- **Editor do texto:** Michael W. Holmes
- **Editor da morfologia:** James K. Tauber
- **Citacao academica:** Tauber, J. K., ed. (2017) *MorphGNT: SBLGNT Edition*. Version 6.12 [Data set]. DOI: 10.5281/zenodo.376200
- **Repositorio:** https://github.com/morphgnt/sblgnt
- **Quantidade de arquivos:** 27 (um por livro do NT)
- **Convencao de nomes:** `##-[Abrev]-morphgnt.txt` (ex: `01-Mt-morphgnt.txt`)

### Licenciamento

O SBLGNT opera com licenciamento dual:

| Componente | Licenca |
|------------|---------|
| **Texto SBLGNT** | Creative Commons Attribution 4.0 International (CC BY 4.0) |
| **Analise morfologica MorphGNT** | Creative Commons Attribution-ShareAlike 3.0 (CC BY-SA 3.0) |

**Termos da CC BY 4.0 (texto):**
- Reproducao e compartilhamento integral ou parcial: PERMITIDO
- Criacao de obras derivadas: PERMITIDO
- Uso em qualquer formato de midia: PERMITIDO
- Uso mundial, livre de royalties, perpetuo e irrevogavel
- **Obrigacao:** Atribuicao ao criador, aviso de licenca, indicacao de modificacoes

**Termos da CC BY-SA 3.0 (morfologia):**
- Mesmos direitos da CC BY, com a obrigacao adicional de que obras derivadas
  devem manter a mesma licenca (ShareAlike)

### Formato dos Dados

Cada arquivo contem uma linha por token (palavra), com 7 campos separados por espaco:

| Campo | Descricao | Exemplo |
|-------|-----------|---------|
| 1. Referencia | Livro + capitulo + versiculo (BBCCVV) | `010101` (Mt 1:1) |
| 2. Classe gramatical | Categoria morfologica | `N-` (substantivo) |
| 3. Codigo de parsing | Pessoa, tempo, voz, modo, caso, numero, genero, grau | `----NSF-` |
| 4. Texto com pontuacao | Palavra como aparece no texto | `Biblos` |
| 5. Palavra sem pontuacao | Forma isolada | `Biblos` |
| 6. Forma normalizada | Forma padronizada | `biblos` |
| 7. Lema | Forma de dicionario | `biblos` |

### Codigos de Parsing

**Classes gramaticais:** A (adjetivo), C (conjuncao), D (adverbio), I (interjeicao),
N (substantivo), P (preposicao), RA (artigo), RD (pronome demonstrativo),
RI (pronome interrogativo/indefinido), RP (pronome pessoal), RR (pronome relativo),
V (verbo), X (particula).

**Parsing verbal:** Pessoa (1/2/3), Tempo (P=presente, I=imperfeito, F=futuro,
A=aoristo, X=perfeito, Y=mais-que-perfeito), Voz (A=ativa, M=media, P=passiva),
Modo (I=indicativo, D=imperativo, S=subjuntivo, O=optativo, N=infinitivo, P=participio).

**Parsing nominal:** Caso (N=nominativo, G=genitivo, D=dativo, A=acusativo, V=vocativo),
Numero (S=singular, P=plural), Genero (M=masculino, F=feminino, N=neutro).

---

## 2. Nestle 1904 - Novum Testamentum Graece

### Descricao Academica

O texto base e a edicao de 1904 do *Novum Testamentum Graece* de Eberhard Nestle,
publicada pela British and Foreign Bible Society. Esta edicao e particularmente significativa
por representar o texto critico grego na transicao entre o seculo XIX e XX, antes das
revisoes extensivas que resultariam no Nestle-Aland (NA) a partir de 1927.

O texto digital foi preparado por Diego Renato dos Santos (https://sites.google.com/site/nestle1904/)
e enriquecido com analise morfologica por Ulrik Sandborg-Petersen, com marcacao XML
por Jonathan Robie. A morfologia baseia-se primariamente no trabalho do Dr. Maurice A.
Robinson, adaptado para o texto Nestle 1904.

### Dados Bibliograficos

- **Autor original:** Eberhard Nestle (1851-1913)
- **Edicao:** *Novum Testamentum Graece*, 1904
- **Texto digital:** Diego Renato dos Santos
- **Morfologia:** Ulrik Sandborg-Petersen (baseado em Robinson)
- **Marcacao XML:** Jonathan Robie
- **Versao atual:** 1.3 (abril de 2017)
- **Repositorio:** https://github.com/biblicalhumanities/Nestle1904

### Licenciamento

| Componente | Licenca |
|------------|---------|
| **Morfologia** | CC0 - Dominio Publico (biblicalhumanities.org renunciou todos os direitos) |
| **Outros componentes** | Variaveis por subdiretorio (consultar README de cada pasta) |

### Estrutura do Repositorio

| Diretorio | Conteudo |
|-----------|----------|
| `morph/` | Analise morfologica com lematizacao |
| `xml/` | Texto com marcacao XML estruturada |
| `glosses/` | Glossas (auxilios de vocabulario) |
| `xhtml/` | Texto formatado para visualizacao |
| `xquery/` | Scripts de consulta ao texto |

### Formato dos Dados Morfologicos

Arquivo tabulado com 7 colunas por token:

| Campo | Descricao | Exemplo |
|-------|-----------|---------|
| 1. Referencia | OSIS book ID + capitulo + versiculo | `Matt 1:1` |
| 2. Texto grego | Unicode politonico com pontuacao original | `Biblos` |
| 3. Tag funcional | Classificacao morfologica semantica | `N-NSF` |
| 4. Tag formal | Classificacao baseada na forma visivel | `N-NSF` |
| 5. Numero Strong | Referencia lexica + TVM (Tense-Voice-Mood) | `G976` |
| 6. Lema | Forma raiz conforme BDAG/ANLEX | `biblos` |
| 7. Forma normalizada | Palavra sem pontuacao, acentos ajustados | `biblos` |

### Duplo Sistema de Tagging

O Nestle 1904 oferece dois sistemas paralelos de classificacao morfologica:

- **Tag Funcional:** Distingue semanticamente voz media e passiva com base no
  significado da palavra no contexto
- **Tag Formal:** Marca apenas distincoes visiveis na forma morfologica da palavra,
  sem inferencia semantica

Esta distincao e particularmente relevante para a traducao literal, onde a forma
do texto deve prevalecer sobre interpretacoes semanticas.

### Lematizacao Aprimorada

A lematizacao vai alem da numeracao de Strong, capturando lemas ausentes do
Textus Receptus (base original de Strong). As formas de dicionario seguem os
padroes do BDAG (*A Greek-English Lexicon of the New Testament*) e ANLEX
(*Analytical Lexicon of the Greek New Testament*).

---

## 3. Robinson-Pierpont 2018 - Texto Bizantino Majoritario

### Descricao Academica

A edicao Robinson-Pierpont (RP) e uma reconstrucao do Novo Testamento grego
baseada na tradicao textual bizantina (tambem chamada "Texto Majoritario"),
editada pelo Dr. Maurice A. Robinson e William G. Pierpont. Esta tradicao
textual representa a forma do texto grego preservada na maioria dos manuscritos
existentes (aprox. 80-90% dos manuscritos gregos do NT).

A edicao RP2018 e a versao recomendada, corrigindo "numerosos erros de acentuacao,
respiracao e pontuacao" presentes na edicao RP2005, alem de atualizar o aparato
critico para refletir diferencas com o NA28 e a Editio Critica Maior (ECM).

### Relacao com o Textus Receptus

O Texto Bizantino Majoritario e o ancestral textual do Textus Receptus (TR).
O TR de Stephanus (1550) e Erasmo (1516) foram compilados a partir de um
pequeno numero de manuscritos bizantinos tardios. A edicao Robinson-Pierpont
representa uma reconstrucao mais rigorosa e abrangente dessa mesma tradicao
textual, baseada na totalidade dos manuscritos bizantinos disponiveis.

| Aspecto | Textus Receptus (1550) | Robinson-Pierpont (2018) |
|---------|------------------------|--------------------------|
| Base manuscrita | ~6 manuscritos tardios | Totalidade dos MSS bizantinos |
| Metodologia | Compilacao editorial (Erasmo/Stephanus) | Critica textual do tipo majoritario |
| Aparato critico | Ausente | Inclui comparacao com NA28/ECM |
| Acesso digital | Diversos projetos | byztxt/byzantine-majority-text |

### Dados Bibliograficos

- **Editores:** Maurice A. Robinson e William G. Pierpont
- **Edicao recomendada:** RP2018 (atualizada ate julho de 2023)
- **Repositorio:** https://github.com/byztxt/byzantine-majority-text
- **Edicoes impressas:** Disponiveis gratuitamente via Internet Archive (RP2005 e RP2018)

### Licenciamento

**Licenca: Dominio Publico (Unlicense)**

Todo o codigo e texto estao explicitamente em dominio publico, permitindo uso
e distribuicao irrestritos. Nao ha qualquer restricao de uso, atribuicao ou
compartilhamento.

### Formatos Disponiveis

| Formato | Diretorio | Descricao |
|---------|-----------|-----------|
| Parsed (BETA) | `source/Strongs/` | Sem acentos, com tags morfologicas e numeros Strong |
| Full (BETA) | `source/CCAT/` | Com acentos, respiracoes, diacriticos e aparato critico |
| Unicode CSV | `csv-unicode/` | Formato planilha padronizado |
| TEI-XML | `tei-xml/` | Marcacao estruturada, compativel com CollateX e MSS do INTF Munster |

### Dados Morfologicos e Strong

O formato parsed inclui:
- Texto grego (sem acentos na versao parsed, com acentos na versao full)
- Codigos morfologicos no sistema Robinson
- Numeros de Strong para cada token
- Aparato critico com variantes em relacao ao NA28 e ECM (versao full)

### Ensaio Academico

O repositorio inclui o ensaio do Prof. Robinson sobre a superioridade da
forma textual bizantina, disponivel em ingles e espanhol na pasta `essay/`.

---

## 4. Mapeamento para a Biblia Belem An.C 2025

### Fontes Textuais Declaradas

Conforme `keep_original.json` e documentacao do projeto, as fontes textuais
do Novo Testamento grego na Biblia Belem An.C 2025 sao:

- **SBLGNT** - Texto critico ecletico (base primaria)
- **Nestle 1904** - Texto critico historico (referencia comparativa)
- **TR1550** - Textus Receptus de Stephanus (referencia da tradicao recebida)

### Uso na Traducao

| Fonte | Papel na Traducao | Justificativa |
|-------|-------------------|---------------|
| SBLGNT | Base textual primaria para o NT | Edicao critica moderna, morfologia completa, licenca aberta |
| Nestle 1904 | Comparacao e verificacao | Texto critico pre-NA, duplo sistema de tagging, dominio publico |
| Robinson-Pierpont / Bizantino | Variantes e tradicao majoritaria | Representa a forma textual da maioria dos manuscritos |
| TR1550 (via Bizantino) | Referencia historica | Ancestral textual da KJV e traducoes reformadas |

### Principio de Literalidade

A traducao literal rigida da Biblia Belem An.C 2025 utiliza estas fontes para:

1. **Estabelecer o texto base** a partir do SBLGNT com analise token-a-token
2. **Verificar leituras variantes** comparando SBLGNT, Nestle 1904 e Bizantino
3. **Preservar a morfologia** usando os codigos de parsing para traducao precisa
4. **Manter termos nao traduzidos** (yhwh, Elohim, Theos, Iesous, Christos, etc.)
   conforme definido em `glossary/keep_original.json`
5. **Sinalizar intervencoes** com marcadores editoriais (`[OBJ]`, `[grammatical_ellipsis]`)

### Dados Morfologicos na API

Os tokens morfologicos expostos pela API (`/api/v1/tokens/:verseId`) refletem
a estrutura de 7 campos do MorphGNT/SBLGNT:

| Campo API | Origem |
|-----------|--------|
| `text_original` | Campo 4 (texto com pontuacao) |
| `text_transliterated` | Transliteracao do campo 5 |
| `lemma` | Campo 7 (lema) |
| `morph_code` | Campo 3 (codigo de parsing) |
| `gloss` | Glossario `glossary/greek.json` (~2.000 entradas) |

---

## 5. Repositorios e Links de Referencia

### Repositorios Primarios

| Repositorio | URL | Licenca |
|-------------|-----|---------|
| MorphGNT SBLGNT | https://github.com/morphgnt/sblgnt | CC BY 4.0 (texto) + CC BY-SA 3.0 (morfologia) |
| Nestle 1904 | https://github.com/biblicalhumanities/Nestle1904 | CC0 (morfologia) |
| Byzantine Majority Text | https://github.com/byztxt/byzantine-majority-text | Dominio Publico (Unlicense) |

### Repositorios Relacionados

| Repositorio | URL | Descricao |
|-------------|-----|-----------|
| MorphGNT (organizacao) | https://github.com/morphgnt | Organizacao guarda-chuva do projeto MorphGNT |
| Biblical Humanities | https://github.com/biblicalhumanities | Coletivo de recursos digitais biblicos |
| SBLGNT website | https://sblgnt.com | Pagina oficial do SBLGNT |
| Open Scriptures | https://github.com/openscriptures | Projetos de texto biblico aberto |

### DOIs e Citacoes

- **MorphGNT SBLGNT:** DOI 10.5281/zenodo.376200
- **Nestle 1904 Morphology:** v1.3, abril 2017
- **Robinson-Pierpont:** RP2018, atualizado julho 2023

---

## 6. Notas sobre Compatibilidade de Licencas

| Fonte | Licenca | Compativel com CC BY 4.0 do projeto? |
|-------|---------|--------------------------------------|
| SBLGNT (texto) | CC BY 4.0 | Sim - identica |
| SBLGNT (morfologia) | CC BY-SA 3.0 | Sim - compativel com atribuicao |
| Nestle 1904 (morfologia) | CC0 | Sim - dominio publico, sem restricoes |
| Robinson-Pierpont | Unlicense | Sim - dominio publico, sem restricoes |

**Obrigacoes de atribuicao:**
- SBLGNT: Citar Michael W. Holmes (texto) e James K. Tauber/MorphGNT (morfologia)
- Nestle 1904: Citar biblicalhumanities.org e Ulrik Sandborg-Petersen
- Robinson-Pierpont: Nenhuma obrigacao legal, mas citacao academica e boa pratica

---

*Biblia Belem An.C 2025 - Traducao literal rigida dos codices para o portugues brasileiro*
*Licenca: CC BY 4.0 - Copyright 2025-2026 Belem Anderson Costa*
