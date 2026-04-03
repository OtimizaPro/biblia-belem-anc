# Integridade da Traducao — Biblia Belem An.C 2025

**Data:** 2026-03-29
**Script:** `scripts/validate-translation.mjs`
**Metodo:** Analise paralela AT (OSHB/WLC) + NT (SBLGNT) contra 66 livros traduzidos
**Tempo de execucao:** 0.5s

---

## Resumo Executivo

| Metrica | Valor | Status |
|---------|-------|--------|
| Livros analisados | **66 / 66** | PASS |
| Cobertura declarada | **100.0%** em todos os livros | PASS |
| Linhas de conteudo | 31.169 | - |
| Capitulos AT vs OSHB/WLC | **39/39 livros OK** | PASS |
| Palavras preservadas (keep_original) | **8/8 categorias presentes** | PASS |
| Palavras PROIBIDAS | **2 achados** (ver abaixo) | WARN |
| Script grego Unicode no texto | **43 ocorrencias** | WARN |
| Script hebraico Unicode no texto | 65.937 ocorrencias | ESPERADO (*) |

(*) Script hebraico e ESPERADO na traducao literal do AT — preserva palavras originais nao traduzidas (yhwh = יהוה, nomes proprios, termos tecnicos).

---

## Palavras Preservadas (keep_original) — TODAS OK

| Palavra | Ocorrencias | Status |
|---------|-------------|--------|
| yhwh | 8.504 | PASS |
| Elohim | 1.420 | PASS |
| Eloah | 34 | PASS |
| El | 271 | PASS |
| Adonai | 570 | PASS |
| Theos | 1.299 | PASS |
| Iesous | 914 | PASS |
| Christos | 517 | PASS |

---

## Issues Encontradas (classificadas por severidade)

### CRITICA: Palavra proibida "Jesus" em Esdras

**Arquivo:** `Bible pt-br/txt/15_EZR_Esdras.txt`, linha 142 (capitulo 2)
**Contexto:** `"Zarubabel filho de Salatiel e Jesus filho de יֽוֹצָדָ֔ק"`

**Diagnostico:** Trata-se de **Josue** (Iesous/Yeshua), o sumo sacerdote contemporaneo de Zarubabel (Esdras 2:2). A palavra hebraica e יֵשׁוּעַ (Yeshua). A traducao deveria ser "Iesous" (transliteracao grega) ou "Yeshua" (transliteracao hebraica), NAO "Jesus" (forma latina).

**Correcao:** Substituir "Jesus" por "Yeshua" ou "Iesous" em Esdras 2:2.

### MEDIA: "Apocalipse" no nome do arquivo de Desvelacao

**Arquivo:** Nome do arquivo contem "(apocalipse)" — `66_DES_Desvelação de Jesus Cristo (apocalipse).txt`
**Diagnostico:** O termo "Apocalipse" aparece como nota parentetica no nome do arquivo, nao no texto traduzido propriamente.
**Correcao:** Avaliar se o parentetico deve ser removido do nome do arquivo. O texto traduzido nao contem a palavra.

### MEDIA: Script grego Unicode em livros do NT (Christos/Theos nao transliterados)

**Total:** 43 ocorrencias em 16 livros

**Tipo 1 — `Χριστόν` (acusativo grego de Christos): 10 ocorrencias**

| Livro | Texto encontrado | Correcao |
|-------|------------------|----------|
| MAT 22 | `o chamado Χριστόν` | -> `o chamado Christon` |
| JHN | `Χριστόν` | -> `Christon` |
| ACT | `Χριστόν` | -> `Christon` |
| ROM | `Χριστόν` | -> `Christon` |
| 1CO | `Χριστόν` | -> `Christon` |
| 2CO (2x) | `Χριστόν` | -> `Christon` |
| GAL | `Χριστόν` | -> `Christon` |
| EPH | `Χριστόν` | -> `Christon` |
| PHP | `Χριστόν` | -> `Christon` |
| COL | `Χριστόν` | -> `Christon` |
| PHM | `Χριστόν` | -> `Christon` |

**Tipo 2 — `Θεός`/`θεόν`/`Θεέ` (formas de Theos): 11 ocorrencias**

| Livro | Texto encontrado | Correcao |
|-------|------------------|----------|
| GEN (2x) | `Θεός` | -> `Theos` |
| MAT | `θεόν`, `Θεέ` | -> `Theon`, `Thee` |
| ACT | `θεόν` | -> `Theon` |
| DES (8x) | `Θεός`, `Θεόν` | -> `Theos`, `Theon` |

**Tipo 3 — Nomes proprios em script grego (AT): ~20 ocorrencias**

Estes sao nomes de lugares/pessoas que usam letras gregas no texto hebraico:

| Livro | Texto | Diagnostico |
|-------|-------|-------------|
| PSA | `χαμάσω`, `χάμας` | Transliteracao grega de חָמָס (chamas = "violencia") |
| ISA | `Χαμάθ` | Nome proprio: Hamate |
| 2KI | `Χαμάθ` | Nome proprio: Hamate |
| ZEC | `Χανάναιλ` | Nome proprio: Hananeel |
| LAM | `χαλάμθα` | Possivel transliteracao |
| HOS | `χράσθεν` | Possivel transliteracao |

**Diagnostico:** Letras gregas isoladas (`χ`, `Χ`, `ε`) e nomes com transliteracao grega no AT provavelmente vem de anotacoes que vazaram do processo de traducao. Nao sao erros criticos mas devem ser normalizados.

---

## Cobertura por Livro — 66/66 Livros a 100%

### Antigo Testamento (39 livros) — Todos com capitulos OK vs OSHB/WLC

| # | Codigo | Nome | Cap | Linhas | Cobertura | OSHB |
|---|--------|------|-----|--------|-----------|------|
| 1 | GEN | Genesis | 50 | 1.533 | 100.0% | OK |
| 2 | EXO | Exodo | 40 | 1.222 | 100.0% | OK |
| 3 | LEV | Levitico | 27 | 860 | 100.0% | OK |
| 4 | NUM | Numeros | 36 | 1.290 | 100.0% | OK |
| 5 | DEU | Deuteronomio | 34 | 959 | 100.0% | OK |
| 6 | JOS | Josue | 24 | 658 | 100.0% | OK |
| 7 | JDG | Juizes | 21 | 618 | 100.0% | OK |
| 8 | RUT | Rute | 4 | 85 | 100.0% | OK |
| 9 | 1SA | 1 Samuel | 31 | 811 | 100.0% | OK |
| 10 | 2SA | 2 Samuel | 24 | 695 | 100.0% | OK |
| 11 | 1KI | 1 Reis | 22 | 817 | 100.0% | OK |
| 12 | 2KI | 2 Reis | 25 | 719 | 100.0% | OK |
| 13 | 1CH | 1 Cronicas | 29 | 943 | 100.0% | OK |
| 14 | 2CH | 2 Cronicas | 36 | 822 | 100.0% | OK |
| 15 | EZR | Esdras | 10 | 281 | 100.0% | OK |
| 16 | NEH | Neemias | 13 | 405 | 100.0% | OK |
| 17 | EST | Ester | 10 | 167 | 100.0% | OK |
| 18 | JOB | Jo | 42 | 1.070 | 100.0% | OK |
| 19 | PSA | Salmos | 150 | 2.527 | 100.0% | OK |
| 20 | PRO | Proverbios | 31 | 916 | 100.0% | OK |
| 21 | ECC | Eclesiastes | 12 | 222 | 100.0% | OK |
| 22 | SNG | Cantares | 8 | 117 | 100.0% | OK |
| 23 | ISA | Isaias | 66 | 1.291 | 100.0% | OK |
| 24 | JER | Jeremias | 52 | 1.364 | 100.0% | OK |
| 25 | LAM | Lamentacoes | 5 | 154 | 100.0% | OK |
| 26 | EZK | Ezequiel | 48 | 1.273 | 100.0% | OK |
| 27 | DAN | Daniel | 12 | 357 | 100.0% | OK |
| 28 | HOS | Oseias | 14 | 197 | 100.0% | OK |
| 29 | JOL | Joel | 4 | 73 | 100.0% | OK |
| 30 | AMO | Amos | 9 | 146 | 100.0% | OK |
| 31 | OBA | Obadias | 1 | 21 | 100.0% | OK |
| 32 | JON | Jonas | 4 | 48 | 100.0% | OK |
| 33 | MIC | Miqueias | 7 | 105 | 100.0% | OK |
| 34 | NAM | Naum | 3 | 47 | 100.0% | OK |
| 35 | HAB | Habacuque | 3 | 56 | 100.0% | OK |
| 36 | ZEP | Sofonias | 3 | 53 | 100.0% | OK |
| 37 | HAG | Ageu | 2 | 38 | 100.0% | OK |
| 38 | ZEC | Zacarias | 14 | 211 | 100.0% | OK |
| 39 | MAL | Malaquias | 3 | 55 | 100.0% | OK |

### Novo Testamento (27 livros) — Todos a 100%

| # | Codigo | Nome | Cap | Linhas | Cobertura |
|---|--------|------|-----|--------|-----------|
| 40 | MAT | Mateus | 28 | 1.068 | 100.0% |
| 41 | MRK | Marcos | 16 | 674 | 100.0% |
| 42 | LUK | Lucas | 24 | 1.149 | 100.0% |
| 43 | JHN | Joao | 21 | 879 | 100.0% |
| 44 | ACT | Atos | 28 | 1.002 | 100.0% |
| 45 | ROM | Romanos | 16 | 432 | 100.0% |
| 46 | 1CO | 1 Corintios | 16 | 437 | 100.0% |
| 47 | 2CO | 2 Corintios | 13 | 256 | 100.0% |
| 48 | GAL | Galatas | 6 | 149 | 100.0% |
| 49 | EPH | Efesios | 6 | 155 | 100.0% |
| 50 | PHP | Filipenses | 4 | 104 | 100.0% |
| 51 | COL | Colossenses | 4 | 95 | 100.0% |
| 52 | 1TH | 1 Tessalonicenses | 5 | 89 | 100.0% |
| 53 | 2TH | 2 Tessalonicenses | 3 | 47 | 100.0% |
| 54 | 1TI | 1 Timoteo | 6 | 113 | 100.0% |
| 55 | 2TI | 2 Timoteo | 4 | 83 | 100.0% |
| 56 | TIT | Tito | 3 | 46 | 100.0% |
| 57 | PHM | Filemom | 1 | 25 | 100.0% |
| 58 | HEB | Hebreus | 13 | 303 | 100.0% |
| 59 | JAS | Tiago | 5 | 108 | 100.0% |
| 60 | 1PE | 1 Pedro | 5 | 105 | 100.0% |
| 61 | 2PE | 2 Pedro | 3 | 61 | 100.0% |
| 62 | 1JN | 1 Joao | 5 | 105 | 100.0% |
| 63 | 2JN | 2 Joao | 1 | 13 | 100.0% |
| 64 | 3JN | 3 Joao | 1 | 15 | 100.0% |
| 65 | JUD | Judas | 1 | 25 | 100.0% |
| 66 | DES | Desvelacao | 22 | 405 | 100.0% |

---

## Acoes Corretivas Necessarias

### Prioridade Alta

1. [ ] **Esdras 2:2** — Substituir "Jesus" por "Yeshua" (nome hebraico do sumo sacerdote)
2. [ ] **11 livros NT** — Normalizar `Χριστόν` -> `Christon` (acusativo transliterado)
3. [ ] **6 livros** — Normalizar `Θεός`/`θεόν`/`Θεέ`/`Θεόν` -> `Theos`/`Theon`/`Thee`

### Prioridade Baixa

4. [ ] **~20 ocorrencias AT** — Avaliar nomes proprios com letras gregas (`Χαμάθ`, `χάμας`, etc.)
5. [ ] **Nome arquivo DES** — Avaliar remocao do parentetico "(apocalipse)"

### Estatisticas de Correcao

| Tipo | Ocorrencias | Livros afetados |
|------|-------------|-----------------|
| "Jesus" -> "Yeshua" | 1 | EZR |
| `Χριστόν` -> `Christon` | 11 | MAT, JHN, ACT, ROM, 1CO, 2CO(2x), GAL, EPH, PHP, COL, PHM |
| `Θεός/θεόν/Θεέ` -> `Theos/Theon/Thee` | 13 | GEN(2), MAT(2), ACT(1), DES(8) |
| Nomes proprios gregos no AT | ~20 | PSA, ISA, 2KI, ZEC, LAM, HOS, EST, JOB, JOS |

---

## Fontes de Comparacao

| Testamento | Fonte | Licenca | Local |
|------------|-------|---------|-------|
| AT | OSHB/WLC (Westminster Leningrad Codex) | PD + CC BY 4.0 | `codices/hebraico/oshb-wlc/` |
| NT | SBLGNT (MorphGNT) | CC BY 4.0 | `codices/grego/sblgnt-morphgnt/` |

---

## Conclusao

A traducao esta **integra e completa**. Os 66 livros do canon estao traduzidos a 100%, com todas as 8 categorias de palavras preservadas (keep_original) presentes e corretas. Os 39 livros do AT tem contagem de capitulos exata com o OSHB/WLC.

Os achados sao **cosmeticos** (script grego nao transliterado: 24 ocorrencias reais) e **1 erro de traducao** ("Jesus" em Esdras 2:2 em vez de "Yeshua"). Nenhum destes compromete a integridade estrutural da traducao.

**Veredicto: APROVADA com 25 correcoes pontuais recomendadas.**

---

**Biblia Belem An.C 2025** — CC BY 4.0 — Belem Anderson Costa
