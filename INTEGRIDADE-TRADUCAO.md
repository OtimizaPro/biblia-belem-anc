# Integridade da Traducao — Biblia Belem An.C 2025

**Data:** 2026-07-24
**Script:** `scripts/validate-translation.mjs`
**Tempo de execucao:** 0.2s

---

## Resumo

| Metrica | Valor | Status |
|---------|-------|--------|
| Livros analisados | 66 | PASS |
| Linhas de conteudo | 31.169 | - |
| Palavras proibidas | 1 | FAIL |
| Script grego vazado | 2 | WARN |
| Script hebraico vazado | 65934 | WARN |
| **Script alienigena ao projeto** | **378** | **FAIL** |
| Capitulos vs codice | 0 divergencias | PASS |
| Livros com issues | 40 | WARN |

---

## CRITICO — Scripts Alienigenas ao Projeto

Caracteres de sistemas de escrita que **nao existem em nenhum codice fonte**
(hebraico, aramaico e grego sao legitimos; os abaixo nao sao). Toda ocorrencia
e contaminacao do pipeline de traducao automatica e precisa de revisao humana
contra o codice, versiculo a versiculo.

| Script | Ocorrencias |
|--------|-------------|
| Arabe | 138 |
| Cirilico | 131 |
| CJK (chines) | 55 |
| Kana | 17 |
| Hangul | 16 |
| Devanagari | 9 |
| Armenio | 7 |
| Tailandes | 5 |

### Ocorrencias por livro

| Livro | Script | Trecho |
|-------|--------|--------|
| GEN | CJK (chines) | `争论` |
| GEN | CJK (chines) | `格拉` |
| GEN | CJK (chines) | `牧人` |
| GEN | CJK (chines) | `以谢克` |
| GEN | CJK (chines) | `并以谢克了` |
| GEN | CJK (chines) | `他们挖掘了` |
| GEN | CJK (chines) | `另一个` |
| GEN | CJK (chines) | `争论` |
| GEN | — | ... e mais 28 ocorrencias |
| EXO | Arabe | `يلي` |
| EXO | Arabe | `زة` |
| EXO | Hangul | `페터` |
| EXO | Hangul | `노다` |
| LEV | Cirilico | `к` |
| LEV | Arabe | `طة` |
| LEV | Arabe | `خذ` |
| LEV | Arabe | `ورو` |
| LEV | Hangul | `확장` |
| LEV | Hangul | `막` |
| LEV | Devanagari | `श` |
| LEV | Devanagari | `श` |
| NUM | CJK (chines) | `嵯里` |
| NUM | CJK (chines) | `而挪素乌姆` |
| NUM | CJK (chines) | `哈夸他伊姆` |
| NUM | CJK (chines) | `哈密克达什` |
| NUM | CJK (chines) | `而希基乌姆` |
| NUM | CJK (chines) | `巴俄姆` |
| NUM | CJK (chines) | `而挪素阿` |
| NUM | CJK (chines) | `帕达` |
| NUM | — | ... e mais 9 ocorrencias |
| DEU | Cirilico | `цор` |
| DEU | Cirilico | `н` |
| DEU | Cirilico | `биммаасе` |
| DEU | Arabe | `م` |
| JOS | CJK (chines) | `茨` |
| JOS | CJK (chines) | `耶和华` |
| JOS | CJK (chines) | `耶和华` |
| JOS | CJK (chines) | `耶和华` |
| JOS | Arabe | `ورو` |
| JOS | Arabe | `عبد` |
| JDG | CJK (chines) | `塔` |
| JDG | CJK (chines) | `哈` |
| JDG | Cirilico | `Шимшон` |
| JDG | Arabe | `ُ` |
| JDG | Arabe | `وتر` |
| JDG | Kana | `ッツ` |
| 1SA | CJK (chines) | `分散了` |
| 1SA | Cirilico | `Михаль` |
| 1SA | Cirilico | `на` |
| 1SA | Cirilico | `мацуда` |
| 1SA | Cirilico | `на` |
| 1SA | Cirilico | `мацуда` |
| 1SA | Cirilico | `Саулу` |
| 1SA | Cirilico | `Саулу` |
| 1SA | — | ... e mais 12 ocorrencias |
| 2SA | Cirilico | `Михаль` |
| 2SA | Cirilico | `Цива` |
| 2SA | Cirilico | `Цива` |
| 2SA | Cirilico | `Цива` |
| 2SA | Cirilico | `Ионафан` |
| 2SA | Cirilico | `Цива` |
| 2SA | Cirilico | `Цива` |
| 2SA | Cirilico | `кїкїр` |
| 2SA | — | ... e mais 18 ocorrencias |
| 1KI | CJK (chines) | `莊嚴` |
| 1KI | Cirilico | `ах` |
| 1KI | Cirilico | `ТА` |
| 1KI | Cirilico | `ХА` |
| 1KI | Arabe | `وش` |
| 1KI | Arabe | `ام` |
| 1KI | Arabe | `يروبعام` |
| 1KI | Arabe | `ن` |
| 1KI | — | ... e mais 4 ocorrencias |
| 2KI | Cirilico | `ах` |
| 2KI | Cirilico | `ладуш` |
| 2KI | Cirilico | `ЛИ` |
| 2KI | Arabe | `هو` |
| 2KI | Arabe | `روا` |
| 2KI | Arabe | `هو` |
| 2KI | Arabe | `يروبعام` |
| 2KI | Arabe | `عين` |
| 2KI | — | ... e mais 2 ocorrencias |
| 1CH | CJK (chines) | `斯` |
| 1CH | CJK (chines) | `茨` |
| 1CH | CJK (chines) | `褊` |
| 1CH | Cirilico | `хот` |
| 1CH | Cirilico | `ах` |
| 1CH | Arabe | `يوتم` |
| 1CH | Arabe | `يروبعام` |
| 1CH | Arabe | `م` |
| 1CH | — | ... e mais 8 ocorrencias |
| 2CH | CJK (chines) | `耶和华` |
| 2CH | Cirilico | `кїкїр` |
| 2CH | Cirilico | `Давид` |
| 2CH | Arabe | `م` |
| 2CH | Arabe | `ملکة` |
| 2CH | Arabe | `يروبعام` |
| 2CH | Arabe | `رون` |
| 2CH | Arabe | `يوتم` |
| 2CH | — | ... e mais 2 ocorrencias |
| EZR | CJK (chines) | `伺服你们` |
| EZR | Arabe | `تا` |
| NEH | Cirilico | `мїкїдем` |
| NEH | Cirilico | `ах` |
| EST | Cirilico | `ЛИТЛЕВОТ` |
| EST | Arabe | `حب` |
| JOB | Arabe | `ام` |
| JOB | Arabe | `نين` |
| JOB | Arabe | `هو` |
| JOB | Arabe | `وت` |
| JOB | Arabe | `هو` |
| JOB | Kana | `モデ` |
| JOB | Kana | `ミクドシム` |
| JOB | Kana | `ナン` |
| JOB | — | ... e mais 2 ocorrencias |
| PSA | CJK (chines) | `伺服祂` |
| PSA | CJK (chines) | `必述` |
| PSA | CJK (chines) | `我主` |
| PSA | CJK (chines) | `世世代代` |
| PSA | CJK (chines) | `必到` |
| PSA | CJK (chines) | `并述说` |
| PSA | CJK (chines) | `祂的公义` |
| PSA | CJK (chines) | `生` |
| PSA | — | ... e mais 25 ocorrencias |
| PRO | CJK (chines) | `耶和华` |
| PRO | Cirilico | `ода` |
| PRO | Cirilico | `ах` |
| PRO | Cirilico | `ТОВЕБА` |
| PRO | Cirilico | `ВІЗМА` |
| PRO | Cirilico | `ЙІБІЕНУ` |
| PRO | Cirilico | `КІЗАВІМ` |
| PRO | Cirilico | `ШОМЕА` |
| PRO | — | ... e mais 12 ocorrencias |
| SNG | CJK (chines) | `奠基础` |
| SNG | Arabe | `اك` |
| SNG | Kana | `ティ` |
| ISA | CJK (chines) | `什` |
| ISA | CJK (chines) | `并述说` |
| ISA | Cirilico | `ТОФ` |
| ISA | Cirilico | `гар` |
| ISA | Cirilico | `да` |
| ISA | Cirilico | `ад` |
| ISA | Cirilico | `ак` |
| ISA | Cirilico | `Меродах` |
| ISA | — | ... e mais 13 ocorrencias |
| JER | CJK (chines) | `　` |
| JER | CJK (chines) | `　` |
| JER | Cirilico | `ЛИ` |
| JER | Cirilico | `и` |
| JER | Cirilico | `вакхису` |
| JER | Cirilico | `и` |
| JER | Cirilico | `еихем` |
| JER | Cirilico | `ара` |
| JER | — | ... e mais 16 ocorrencias |
| LAM | Cirilico | `ЛЕХАВА` |
| LAM | Arabe | `دي` |
| LAM | Arabe | `اما` |
| EZK | CJK (chines) | `干事创业` |
| EZK | CJK (chines) | `里斯` |
| EZK | CJK (chines) | `里斯` |
| EZK | Cirilico | `Х` |
| EZK | Cirilico | `й` |
| EZK | Cirilico | `ан` |
| EZK | Arabe | `حيوات` |
| EZK | Arabe | `منضد` |
| EZK | — | ... e mais 19 ocorrencias |
| DAN | CJK (chines) | `氪` |
| DAN | CJK (chines) | `我主` |
| DAN | Cirilico | `Й` |
| DAN | Cirilico | `ум` |
| DAN | Cirilico | `еч` |
| DAN | Cirilico | `а` |
| DAN | Arabe | `ملكوته` |
| DAN | Arabe | `تا` |
| DAN | — | ... e mais 12 ocorrencias |
| HOS | Arabe | `يروبعام` |
| HOS | Arabe | `ملکو` |
| HOS | Arabe | `مو` |
| HOS | Arabe | `عليهم` |
| HOS | Arabe | `ورو` |
| HOS | Hangul | `엘` |
| HOS | Kana | `ヨタム` |
| AMO | Arabe | `شا` |
| AMO | Arabe | `دب` |
| OBA | Arabe | `كا` |
| JON | Arabe | `رت` |
| MIC | Kana | `タン` |
| HAB | Arabe | `مو` |
| HAB | Devanagari | `क` |
| HAB | Devanagari | `स` |
| HAG | Arabe | `زر` |
| ZEC | Cirilico | `гонев` |
| ZEC | Cirilico | `ка` |
| ZEC | Cirilico | `нисб` |
| ZEC | Cirilico | `ка` |
| ZEC | Cirilico | `гонев` |
| ZEC | Cirilico | `нисб` |
| ZEC | Arabe | `لن` |
| ZEC | Arabe | `نَطِيح` |
| ZEC | — | ... e mais 9 ocorrencias |
| MAL | CJK (chines) | `芬` |
| MAL | Cirilico | `ну` |
| MAL | Arabe | `ت` |

---

## Palavras Preservadas (keep_original)

| Palavra | Ocorrencias | Status |
|---------|-------------|--------|
| yhwh | 8.504 | PASS |
| Elohim | 1.420 | PASS |
| Eloah | 34 | PASS |
| El | 271 | PASS |
| Adonai | 570 | PASS |
| Theos | 1.308 | PASS |
| Iesous | 914 | PASS |
| Christos | 517 | PASS |

---

## Cobertura por Livro

| # | Codigo | Nome | Test. | Cap | Linhas | Cob% | Fonte | CapOK | Issues |
|---|--------|------|-------|-----|--------|------|-------|-------|--------|
| 1 | GEN | Gênesis | AT | 50 | 1533 | 100.0% | - | - | 2 issues |
| 2 | EXO | Êxodo | AT | 40 | 1222 | 100.0% | - | - | 2 issues |
| 3 | LEV | Levítico | AT | 27 | 860 | 100.0% | - | - | 2 issues |
| 4 | NUM | Números | AT | 36 | 1290 | 100.0% | - | - | 2 issues |
| 5 | DEU | Deuteronômio | AT | 34 | 959 | 100.0% | - | - | 2 issues |
| 6 | JOS | Josué | AT | 24 | 658 | 100.0% | - | - | 2 issues |
| 7 | JDG | Juízes | AT | 21 | 618 | 100.0% | - | - | 2 issues |
| 8 | RUT | Rute | AT | 4 | 85 | 100.0% | - | - | 1 issues |
| 9 | 1SA | 1 Samuel | AT | 31 | 811 | 100.0% | - | - | 2 issues |
| 10 | 2SA | 2 Samuel | AT | 24 | 695 | 100.0% | - | - | 2 issues |
| 11 | 1KI | 1 Reis | AT | 22 | 817 | 100.0% | - | - | 2 issues |
| 12 | 2KI | 2 Reis | AT | 25 | 719 | 100.0% | - | - | 3 issues |
| 13 | 1CH | 1 Crônicas | AT | 29 | 943 | 100.0% | - | - | 2 issues |
| 14 | 2CH | 2 Crônicas | AT | 36 | 822 | 100.0% | - | - | 2 issues |
| 15 | EZR | Esdras | AT | 10 | 281 | 100.0% | - | - | 2 issues |
| 16 | NEH | Neemias | AT | 13 | 405 | 100.0% | - | - | 2 issues |
| 17 | EST | Ester | AT | 10 | 167 | 100.0% | - | - | 2 issues |
| 18 | JOB | Jó | AT | 42 | 1070 | 100.0% | - | - | 2 issues |
| 19 | PSA | Salmos | AT | 150 | 2527 | 100.0% | - | - | 2 issues |
| 20 | PRO | Provérbios | AT | 31 | 916 | 100.0% | - | - | 2 issues |
| 21 | ECC | Eclesiastes | AT | 12 | 222 | 100.0% | - | - | 1 issues |
| 22 | SNG | Cantares | AT | 8 | 117 | 100.0% | - | - | 2 issues |
| 23 | ISA | Isaías | AT | 66 | 1291 | 100.0% | - | - | 3 issues |
| 24 | JER | Jeremias | AT | 52 | 1364 | 100.0% | - | - | 2 issues |
| 25 | LAM | Lamentações | AT | 5 | 154 | 100.0% | - | - | 2 issues |
| 26 | EZK | Ezequiel | AT | 48 | 1273 | 100.0% | - | - | 2 issues |
| 27 | DAN | Daniel | AT | 12 | 357 | 100.0% | - | - | 2 issues |
| 28 | HOS | Oséias | AT | 14 | 197 | 100.0% | - | - | 2 issues |
| 29 | JOL | Joel | AT | 4 | 73 | 100.0% | - | - | 1 issues |
| 30 | AMO | Amós | AT | 9 | 146 | 100.0% | - | - | 2 issues |
| 31 | OBA | Obadias | AT | 1 | 21 | 100.0% | - | - | 2 issues |
| 32 | JON | Jonas | AT | 4 | 48 | 100.0% | - | - | 2 issues |
| 33 | MIC | Miquéias | AT | 7 | 105 | 100.0% | - | - | 2 issues |
| 34 | NAM | Naum | AT | 3 | 47 | 100.0% | - | - | 1 issues |
| 35 | HAB | Habacuque | AT | 3 | 56 | 100.0% | - | - | 2 issues |
| 36 | ZEP | Sofonias | AT | 3 | 53 | 100.0% | - | - | 1 issues |
| 37 | HAG | Ageu | AT | 2 | 38 | 100.0% | - | - | 2 issues |
| 38 | ZEC | Zacarias | AT | 14 | 211 | 100.0% | - | - | 2 issues |
| 39 | MAL | Malaquias | AT | 3 | 55 | 100.0% | - | - | 2 issues |
| 40 | MAT | Mateus | NT | 28 | 1068 | 100.0% | - | - | OK |
| 41 | MRK | Marcos | NT | 16 | 674 | 100.0% | - | - | OK |
| 42 | LUK | Lucas | NT | 24 | 1149 | 100.0% | - | - | OK |
| 43 | JHN | João | NT | 21 | 879 | 100.0% | - | - | OK |
| 44 | ACT | Atos | NT | 28 | 1002 | 100.0% | - | - | OK |
| 45 | ROM | Romanos | NT | 16 | 432 | 100.0% | - | - | OK |
| 46 | 1CO | 1 Coríntios | NT | 16 | 437 | 100.0% | - | - | OK |
| 47 | 2CO | 2 Coríntios | NT | 13 | 256 | 100.0% | - | - | OK |
| 48 | GAL | Gálatas | NT | 6 | 149 | 100.0% | - | - | OK |
| 49 | EPH | Efésios | NT | 6 | 155 | 100.0% | - | - | OK |
| 50 | PHP | Filipenses | NT | 4 | 104 | 100.0% | - | - | OK |
| 51 | COL | Colossenses | NT | 4 | 95 | 100.0% | - | - | OK |
| 52 | 1TH | 1 Tessalonicenses | NT | 5 | 89 | 100.0% | - | - | OK |
| 53 | 2TH | 2 Tessalonicenses | NT | 3 | 47 | 100.0% | - | - | OK |
| 54 | 1TI | 1 Timóteo | NT | 6 | 113 | 100.0% | - | - | OK |
| 55 | 2TI | 2 Timóteo | NT | 4 | 83 | 100.0% | - | - | OK |
| 56 | TIT | Tito | NT | 3 | 46 | 100.0% | - | - | OK |
| 57 | PHM | Filemom | NT | 1 | 25 | 100.0% | - | - | OK |
| 58 | HEB | Hebreus | NT | 13 | 303 | 100.0% | - | - | OK |
| 59 | JAS | Tiago | NT | 5 | 108 | 100.0% | - | - | OK |
| 60 | 1PE | 1 Pedro | NT | 5 | 105 | 100.0% | - | - | OK |
| 61 | 2PE | 2 Pedro | NT | 3 | 61 | 100.0% | - | - | OK |
| 62 | 1JN | 1 João | NT | 5 | 105 | 100.0% | - | - | OK |
| 63 | 2JN | 2 João | NT | 1 | 13 | 100.0% | - | - | OK |
| 64 | 3JN | 3 João | NT | 1 | 15 | 100.0% | - | - | OK |
| 65 | JUD | Judas | NT | 1 | 25 | 100.0% | - | - | OK |
| 66 | DES | Desvelação de Jesu | NT | 22 | 405 | 100.0% | - | - | 1 issues |

---

## Issues Encontradas

### GEN — Gênesis

- Script hebraico Unicode: 2666 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 10, Cirilico: 22, Arabe: 2, Hangul: 1, Devanagari: 1)

### EXO — Êxodo

- Script hebraico Unicode: 2355 ocorrências
- CRITICA: script alienigena ao projeto (Arabe: 2, Hangul: 2)

### LEV — Levítico

- Script hebraico Unicode: 1690 ocorrências
- CRITICA: script alienigena ao projeto (Cirilico: 1, Arabe: 3, Hangul: 2, Devanagari: 2)

### NUM — Números

- Script hebraico Unicode: 2944 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 9, Cirilico: 3, Arabe: 5)

### DEU — Deuteronômio

- Script hebraico Unicode: 2569 ocorrências
- CRITICA: script alienigena ao projeto (Cirilico: 3, Arabe: 1)

### JOS — Josué

- Script hebraico Unicode: 1253 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 4, Arabe: 2)

### JDG — Juízes

- Script hebraico Unicode: 1228 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 2, Cirilico: 1, Arabe: 2, Kana: 1)

### RUT — Rute

- Script hebraico Unicode: 50 ocorrências

### 1SA — 1 Samuel

- Script hebraico Unicode: 1769 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 1, Cirilico: 12, Arabe: 5, Hangul: 1, Devanagari: 1)

### 2SA — 2 Samuel

- Script hebraico Unicode: 1423 ocorrências
- CRITICA: script alienigena ao projeto (Cirilico: 22, Arabe: 1, Kana: 1, Tailandes: 1, Armenio: 1)

### 1KI — 1 Reis

- Script hebraico Unicode: 1656 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 1, Cirilico: 3, Arabe: 4, Hangul: 1, Tailandes: 3)

### 2KI — 2 Reis

- Script grego Unicode: 1 ocorrências
- Script hebraico Unicode: 1569 ocorrências
- CRITICA: script alienigena ao projeto (Cirilico: 3, Arabe: 5, Hangul: 1, Devanagari: 1)

Script grego encontrado:
- `Βενινώη` (posicao 79344)

### 1CH — 1 Crônicas

- Script hebraico Unicode: 1964 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 3, Cirilico: 2, Arabe: 6, Hangul: 2, Kana: 3)

### 2CH — 2 Crônicas

- Script hebraico Unicode: 1887 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 1, Cirilico: 2, Arabe: 5, Hangul: 1, Kana: 1)

### EZR — Esdras

- Script hebraico Unicode: 790 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 1, Arabe: 1)

### NEH — Neemias

- Script hebraico Unicode: 961 ocorrências
- CRITICA: script alienigena ao projeto (Cirilico: 2)

### EST — Ester

- Script hebraico Unicode: 514 ocorrências
- CRITICA: script alienigena ao projeto (Cirilico: 1, Arabe: 1)

### JOB — Jó

- Script hebraico Unicode: 2849 ocorrências
- CRITICA: script alienigena ao projeto (Arabe: 5, Kana: 3, Devanagari: 1, Armenio: 1)

### PSA — Salmos

- Script hebraico Unicode: 8162 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 11, Cirilico: 2, Arabe: 20)

### PRO — Provérbios

- Script hebraico Unicode: 2820 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 1, Cirilico: 13, Arabe: 4, Kana: 1, Tailandes: 1)

### ECC — Eclesiastes

- Script hebraico Unicode: 646 ocorrências

### SNG — Cantares

- Script hebraico Unicode: 536 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 1, Arabe: 1, Kana: 1)

### ISA — Isaías

- Script grego Unicode: 1 ocorrências
- Script hebraico Unicode: 6104 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 2, Cirilico: 7, Arabe: 6, Kana: 2, Armenio: 4)

Script grego encontrado:
- `ε` (posicao 39301)

### JER — Jeremias

- Script hebraico Unicode: 5515 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 2, Cirilico: 17, Arabe: 5)

### LAM — Lamentações

- Script hebraico Unicode: 502 ocorrências
- CRITICA: script alienigena ao projeto (Cirilico: 1, Arabe: 2)

### EZK — Ezequiel

- Script hebraico Unicode: 5456 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 3, Cirilico: 3, Arabe: 16, Hangul: 3, Kana: 1, Devanagari: 1)

### DAN — Daniel

- Script hebraico Unicode: 2126 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 2, Cirilico: 4, Arabe: 11, Hangul: 1, Kana: 1, Armenio: 1)

### HOS — Oséias

- Script hebraico Unicode: 781 ocorrências
- CRITICA: script alienigena ao projeto (Arabe: 5, Hangul: 1, Kana: 1)

### JOL — Joel

- Script hebraico Unicode: 298 ocorrências

### AMO — Amós

- Script hebraico Unicode: 571 ocorrências
- CRITICA: script alienigena ao projeto (Arabe: 2)

### OBA — Obadias

- Script hebraico Unicode: 83 ocorrências
- CRITICA: script alienigena ao projeto (Arabe: 1)

### JON — Jonas

- Script hebraico Unicode: 130 ocorrências
- CRITICA: script alienigena ao projeto (Arabe: 1)

### MIC — Miquéias

- Script hebraico Unicode: 368 ocorrências
- CRITICA: script alienigena ao projeto (Kana: 1)

### NAM — Naum

- Script hebraico Unicode: 237 ocorrências

### HAB — Habacuque

- Script hebraico Unicode: 275 ocorrências
- CRITICA: script alienigena ao projeto (Arabe: 1, Devanagari: 2)

### ZEP — Sofonias

- Script hebraico Unicode: 184 ocorrências

### HAG — Ageu

- Script hebraico Unicode: 113 ocorrências
- CRITICA: script alienigena ao projeto (Arabe: 1)

### ZEC — Zacarias

- Script hebraico Unicode: 701 ocorrências
- CRITICA: script alienigena ao projeto (Cirilico: 6, Arabe: 11)

### MAL — Malaquias

- Script hebraico Unicode: 189 ocorrências
- CRITICA: script alienigena ao projeto (CJK (chines): 1, Cirilico: 1, Arabe: 1)

### DES — Desvelação de Jesus Cristo (apocalipse)

- PROIBIDA: "Apocalipse" encontrada 1x

---

## Fontes de Comparacao

| Testamento | Fonte | Licenca | Local |
|------------|-------|---------|-------|
| AT | OSHB/WLC (Westminster Leningrad Codex) | PD + CC BY 4.0 | `codices/hebraico/oshb-wlc/` |
| NT | SBLGNT (MorphGNT) | CC BY 4.0 | `codices/grego/sblgnt-morphgnt/` |

---

**Biblia Belem An.C 2025** — CC BY 4.0 — Belem Anderson Costa
