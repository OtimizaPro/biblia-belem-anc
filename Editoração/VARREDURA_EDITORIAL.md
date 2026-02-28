# Varredura Editorial — O livrinho

> Documentação do processo de revisão editorial para "O livrinho — A Culpa é das Ovelhas"

**Última atualização:** 08 de Fevereiro de 2026
**Versão do documento:** 4.0

---

## Objetivo

Garantir a consistência linguística, ortográfica e estilística do manuscrito antes da publicação, preservando a voz autoral e as convenções específicas da Escola Desvelacional Forense Belém an.C-2039.

---

## Regras Editoriais Obrigatórias

### 1. Designações Divinas — NUNCA TRADUZIR

As designações divinas devem permanecer na grafia original (grego/hebraico) com transliteração entre parênteses.

| Grafia Original | Transliteração | NUNCA usar        |
| --------------- | -------------- | ----------------- |
| Θεός            | Theos          | Deus              |
| Κύριος          | Kyrios         | Senhor            |
| Χριστός         | Christos       | Cristo (isolado)  |
| Πνεῦμα Ἅγιον    | Pneuma Hagion  | Espírito Santo    |
| יהוה            | yhwh           | Jeová, Javé, YHWH |
| אלהים           | Elohim         | Deus, deuses      |
| אדני            | Adonai         | Senhor            |
| שדי             | Shaddai        | Todo-Poderoso     |

**Regra crítica:** `yhwh` sempre em **minúsculas**. Nunca `YHWH`.

### 2. Nomes Próprios — NUNCA TRADUZIR, SEMPRE TRANSLITERAR

Nomes próprios (pessoas, cidades, regiões, povos) devem ser **transliterados** do hebraico/aramaico/grego — **nunca traduzidos** para o português.

| Hebraico/Grego | Transliteração | NUNCA usar |
| -------------- | -------------- | ---------- |
| בֵּית־לֶחֶם | Beit-Lechem | Belém |
| יְרוּשָׁלַיִם | Yerushalayim | Jerusalém |
| יְהוּדָה | Yehudah | Judá |
| יִשְׂרָאֵל | Yisra'el | Israel |
| שְׁלֹמֹה | Shelomoh | Salomão |
| מֹשֶׁה | Mosheh | Moisés |
| אֶפְרָתָה | Efratah | Efrata |
| Ἰησοῦς | Iesous | Jesus (no texto literal) |
| Παῦλος | Paulos | Paulo |

**Regra:** O significado etimológico pode aparecer como **nota explicativa** (ex.: "Beit-Lechem = casa de pão"), mas **nunca substituir** o nome próprio no texto da tradução.

**Princípio:** Tradução literal (*ipsis litteris*) preserva o som original dos nomes. Traduzir nomes próprios é uma prática herdada da tradição eclesiástica via latim — **rejeitada** pela metodologia Belém an.C-2039.

### 3. Capitalização de "livrinho" vs "Livrinho"

| Forma                    | Uso                                             | Exemplo                    |
| ------------------------ | ----------------------------------------------- | -------------------------- |
| **livrinho** (minúsculo) | Esta obra: "O livrinho — A Culpa é das Ovelhas" | "Este livrinho expõe..."   |
| **Livrinho** (maiúsculo) | O livro bíblico de Desvelação 10                | "João comeu o Livrinho..." |

**Nota:** O "l" minúsculo em "O livrinho" é um easter egg intencional — não corrigir.

### 4. Acentuação Portuguesa

Verificar todos os acentos obrigatórios em português:

| Tipo        | Exemplos      |
| ----------- | ------------- |
| Agudo       | é, á, í, ó, ú |
| Circunflexo | ê, ô, â       |
| Til         | ã, õ          |
| Cedilha     | ç             |

**Erros comuns a verificar:**

- "nao" → "não"
- "e" (verbo ser) → "é"
- "coletanea" → "coletânea"
- "copia/copias" → "cópia/cópias"
- "invencao" → "invenção"
- "citacao" → "citação"

### 5. Terminologia da Escola

| Termo Correto                | Nunca usar                 |
| ---------------------------- | -------------------------- |
| Desvelação                   | Apocalipse, Revelação      |
| Bíblia Belém An.C 2025       | outras grafias             |
| Escola Desvelacional Forense | outras variações           |
| Belém an.C-2039              | outras datas para a escola |

### 6. Formatação de Citações Bíblicas

Estrutura padrão:

```
"[Texto em português — tradução literal]"

"[Texto original grego/hebraico]"
[Referência] — [Fonte/Códice]. Nota: [Créditos técnicos]
```

### 7. Icebox — Material em Espera (NÃO É PARTE DO LIVRINHO)

Cada capítulo pode conter uma subpasta `Icebox/`. **Icebox NÃO faz parte do manuscrito oficial.**

| Regra  | Descrição                                                                                           |
| ------ | --------------------------------------------------------------------------------------------------- |
| **I1** | Conteúdo em `Icebox/` é rascunho, material em espera ou descartado                                  |
| **I2** | Icebox NUNCA deve ser citado como parte publicada do livrinho                                       |
| **I3** | Para contar como parte do livrinho, o conteúdo deve estar em um dos 15 arquivos canônicos (seção 7) |
| **I4** | Icebox pode ser promovido a canônico apenas por decisão explícita do autor                          |

### 8. Fluxo de Atualização — INDIVIDUAL → UNIFICADO (jamais o contrário)

O manuscrito opera com modelo **branch → main**:

```
┌──────────────────────┐
│  ARQUIVOS INDIVIDUAIS │  ← branch (edição acontece AQUI)
│  (capítulos 1-9 +    │
│   apêndices A/B/BIO/ │
│   Easter Eggs)        │
└──────────┬───────────┘
           │  merge (concatenação)
           ▼
┌──────────────────────┐
│  livrinho-v2.txt     │  ← main (SOMENTE LEITURA / gerado)
│  (arquivo unificado) │
└──────────────────────┘
```

**Regras absolutas:**

| Regra  | Descrição                                                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **R1** | Toda edição de conteúdo deve ser feita no arquivo individual do capítulo correspondente                                                                                  |
| **R2** | O arquivo unificado (`livrinho-vN.txt`) é **gerado** pela concatenação dos individuais — NUNCA editado diretamente                                                       |
| **R3** | Após editar um ou mais individuais, regenerar o unificado concatenando os 15 arquivos na ordem canônica                                                                  |
| **R4** | Se o unificado estiver mais atualizado que um individual, extrair do unificado para o individual **uma única vez** como correção de sincronização, e depois seguir R1-R3 |
| **R5** | O script de concatenação usa separador `\n\n\n---\n\n\n` entre cada arquivo                                                                                              |

**Ordem canônica de montagem (17 arquivos):**

1. `1. Intro/Capítulo 1 — Introdução.txt`
2. `2. As Enganadas/Capítulo 2 — As Enganadas.txt`
3. `3. O Engano/Capítulo 3 — O Engano.txt`
4. `4. A Denúncia/Capítulo 4 — A Denúncia.txt`
5. `5. As Entidades/Capítulo 5 — As Entidades.txt`
6. `6. A Escola/Capítulo 6 — A Escola.txt`
7. `7. As Feras/Capítulo 7 — As Feras.txt`
8. `8. Desvela a fera do mar/Capítulo 8 — Desvela a Fera do Mar.txt`
9. `9. Desvela a fera da terra/Capítulo 9 — Desvela a Fera da Terra.txt`
10. `10. Desvela o enigma 666/Capítulo 10 — Desvela o Enigma 666.txt`
11. `11. Conclusão/Capítulo 11 — Conclusão.txt`
12. `10. Apendice/Apêndice A - exeg.ai.txt`
13. `10. Apendice/Apêndice B - Créditos Técnicos.txt`
14. `10. Apendice/Apêndice C - Stress Test — Moisés no Evangelho de João.txt`
15. `10. Apendice/Apêndice D — Axiomas Forenses.txt`
16. `10. Apendice/BIO do  Autor - Belem Anderson Costa.txt`
17. `10. Apendice/Meus Easter Eggs.txt`

**Scripts automatizados (v11+):**

- `tools/gerar_v11.py` — Concatenação dos 15 individuais na ordem canônica
- `tools/editorial_validator.py` — Validação editorial automatizada (todas as regras)
- `tools/build_v11.py` — Build completo: correções + extração + concatenação

**Analogia Git:** Cada arquivo individual é uma **branch**. O unificado é a **main**. Edições acontecem nas branches. O "commit para main" é a regeneração do unificado por concatenação.

---

## Processo de Varredura

### Metodologia: Múltiplas Passagens

A revisão editorial deve ser feita em **múltiplas varreduras sequenciais**, cada uma focando em aspectos específicos.

#### Varredura 1 — Leitura Estrutural

- Verificar estrutura geral do documento
- Identificar seções e subseções
- Mapear o fluxo narrativo

#### Varredura 2 — Ortografia e Acentuação

- Buscar palavras sem acentos obrigatórios
- Verificar concordância verbal e nominal
- Identificar erros de digitação

#### Varredura 3 — Consistência Terminológica

- Verificar designações divinas (yhwh minúsculo, grafias originais)
- Verificar capitalização de "livrinho" vs "Livrinho"
- Confirmar terminologia da Escola Desvelacional

#### Varredura 4 — Revisão Final

- Leitura completa do início ao fim
- Verificar coerência textual
- Identificar contradições ou inconsistências
- Validar datas, números e referências

### Técnica de Leitura

Para arquivos grandes (>2000 linhas):

1. Dividir em blocos de ~600 linhas
2. Ler sequencialmente do início ao fim
3. Anotar achados com número da linha
4. Compilar lista de correções antes de aplicar
5. Solicitar autorização do autor antes de editar

---

## Registro de Correções

### Formato de Documentação

Cada correção deve ser registrada no formato:

```
| Linha | Antes | Depois | Justificativa |
```

### Exemplo — Varreduras Realizadas (Fev/2026)

#### Varredura 3 — Correções Aplicadas

| Linha | Antes                         | Depois                        |
| ----- | ----------------------------- | ----------------------------- |
| 52    | "nao foi feito"               | "não foi feito"               |
| 60    | "copias dos originais"        | "cópias dos originais"        |
| 91    | "nao intencionalmente"        | "não intencionalmente"        |
| 273   | "coletanea", "copias"         | "coletânea", "cópias"         |
| 279   | "compelto"                    | "completo"                    |
| 287   | "coletanea", "estudada"       | "coletânea", "estudado"       |
| 2197  | "nao e invencao", "E citacao" | "não é invenção", "É citação" |

#### Varredura 4 — Correções Aplicadas

| Linha | Antes                                    | Depois                                 | Justificativa            |
| ----- | ---------------------------------------- | -------------------------------------- | ------------------------ |
| 4122  | "Somo 15 anos"                           | "São 15 anos"                          | Erro gramatical          |
| 4138  | "chamado erroneamente de 'A Desvelação'" | "chamado erroneamente de 'Apocalipse'" | Contradição lógica       |
| 4164  | "An.C - 2015" (3x)                       | "An.C - 2025"                          | Ano incorreto do projeto |

---

## Checklist Pré-Publicação

- [x] yhwh sempre em minúsculas (nunca YHWH) — v11 validado
- [x] "livrinho" minúsculo para esta obra — v11 validado
- [x] "Livrinho" maiúsculo para o livro bíblico — v11 validado
- [x] Designações divinas em grafia original + transliteração — v11 validado
- [x] Todos os acentos portugueses presentes — v11 corrigido (71x Belém→Belem)
- [x] "Desvelação" em vez de "Apocalipse" — v11 validado (uso pedagógico preservado)
- [x] Datas corretas (Bíblia = 2025, Escola = 2039) — v11 validado
- [x] Citações bíblicas com original + tradução — v11 validado
- [x] Referências e créditos atualizados — v11 validado
- [x] Mínimo de 4 varreduras completas realizadas — v11: 5+ varreduras
- [x] ÍNDICE completo (9 capítulos + 4 apêndices + BIO + Easter Eggs) — v11 corrigido
- [x] Zero marcadores editoriais — v11 corrigido (12 removidos)
- [x] Zero seções duplicadas — v11 corrigido (BIO duplicada removida)
- [x] Zero contradições internas — v11 auditado via cruzamento com dossiês
- [x] "Belem" sem acento (decisão autoral) — v11 padronizado

---

## Ferramentas Recomendadas

| Ferramenta  | Uso                                  |
| ----------- | ------------------------------------ |
| Claude Code | Varredura automatizada com IA        |
| VS Code     | Edição manual com busca/substituição |
| Grep/Regex  | Busca de padrões específicos         |

### Padrões de Busca Úteis

```regex
# Encontrar YHWH em maiúsculas
YHWH

# Encontrar palavras sem acento (exemplos)
\bnao\b
\be\b(?=\s+[a-z])  # "e" que deveria ser "é"
\bcoletanea\b
\bcopia[s]?\b

# Encontrar "livrinho" para verificar capitalização
[Ll]ivrinho
```

---

## Contato

Para dúvidas sobre o processo editorial:

- **Autor:** Belem Anderson Costa
- **Email:** ascom@otimiza.pro

---

## Histórico de Revisões

| Data       | Versão | Descrição                                                                                                                 |
| ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-03 | 1.0    | Documento inicial — 4 varreduras completas                                                                                |
| 2026-02-04 | 2.0    | Editoração completa da Zona B + Apêndices                                                                                 |
| 2026-02-04 | 3.0    | Geração v2: 10 capítulos + seções forenses                                                                                |
| 2026-02-04 | 3.1    | Expansão LILIT + correção YHWH + documentos forenses                                                                      |
| 2026-02-04 | 3.2    | Reconstrução livrinho-v2.txt a partir dos 13 arquivos individuais                                                         |
| 2026-02-05 | 3.3    | Inserção evidência ἀγοράζω + tráfico espiritual de vidas humanas                                                          |
| 2026-02-05 | 3.4    | Inserção tefillin (Cap. VII) + consolidador 666 (Cap. VIII) + ponte diademas (Cap. VI)                                    |
| 2026-02-05 | 3.5    | Catálogo forense de assassinatos de Moisés (Cap. VII) — 10 episódios, contagem total                                      |
| 2026-02-05 | 3.6    | Seção "Jesus Denuncia Moisés" (Cap. VII) — 6 passagens de Jo + Jo 3:14 ὄφις/Dragão                                        |
| 2026-02-05 | 3.7    | Seção "A Reedição" (Cap. IX) — tese da apropriação, 6 provas, Des 15:3 tropaion/deboche                                   |
| 2026-02-08 | 4.0    | **AUDITORIA FORENSE COMPLETA + v11**: 91 correções, cruzamento dossiês, scripts automatizados, BIO dedup, ÍNDICE completo |

---

### Varredura 2.0 — Editoração Completa (04/Fev/2026)

**Zona B (linhas 1156-1582): Capítulo V — As Feras**

O capítulo inteiro estava completamente sem acentos gráficos (provável colagem de fonte ASCII). Correções aplicadas em 6 passes:

| Passe             | Método              | Correções | Exemplos                                                                                                                                                                                       |
| ----------------- | ------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Script 1          | Regex word-boundary | 738       | não, já, até, também, Desvelação, cabeças, método, capítulo, códices, possível, estômago                                                                                                       |
| Script 2          | Regex + contexto    | 257       | depressão, visão, habitação, túnica, discípulos, egípcio, CABEÇA, ALIANÇA, MOISÉS, José, Arão                                                                                                  |
| Script 3          | Regex residual      | 69        | ação, multidão, criação, voluntário, ministério, três, água, são                                                                                                                               |
| Script 4          | Frases exatas       | 37        | "cabeça é Abraão", "Moisés é o mediador", Jerusalém, circuncisão, glória                                                                                                                       |
| Script 5          | Frases exatas       | 29        | opinião, título, Torá, blasfêmia, davídica, fé, crê                                                                                                                                            |
| Script 6 + manual | Final sweep         | 59        | Satanás, pé, bastão, diálogo, JOSÉ, família, cárcere, Transformação, propiciatório, Três, Abirão, metáfora, pagãos, representação, difíceis, notações, numéricas, canônicos, Acusação, matá-lo |

**Total: ~1.189 correções de acentuação na Zona B**

**Sobrecorreções identificadas e revertidas:**

- "exeg.aí" → "exeg.ai" (4 ocorrências — script alterou o domínio)
- "explícita é inequívoca" → "explícita e inequívoca" (conjunção, não verbo)
- "a ele é a sua descendência" → "a ele e a sua descendência" (conjunção)
- "específica areia" → "especifica areia" (verbo, não adjetivo)
- "perpétua a morte" → "perpetua a morte" (verbo, não adjetivo)
- "branco; é o que estava" → "branco; e o que estava" (conjunção)
- "legítima genocídios" → "legitima genocídios" (verbo, não adjetivo)

**Correções terminológicas:**

- Linha 1475: "an.C-2025" → "an.C-2039" (ano da escola, não da tradução)

**Apêndices incluídos (linhas 1797-1902):**

- Apêndice A — Exeg.AI e o Ecossistema
- Apêndice B — Nota Técnica e Créditos
- Apêndice C — Stress Test: Moisés no Evangelho de João
- Apêndice D — Axiomas Forenses (E-FM-018, Bloco 1, E-DC-006)
- Sobre o Autor (BIO)
- Meus Easter Eggs

**Arquivos sincronizados:**

- `livrinho.txt` — manuscrito principal (1.902 linhas)
- `livrinho.html` — cópia sincronizada
- `5. As Feras/5. As Feras - Capitulo V.txt` — capítulo individual

### Checklist Pós-Varredura 2.0

- [x] yhwh sempre em minúsculas (82 ocorrências, todas corretas)
- [x] YHWH maiúsculo: 0 ocorrências (correto)
- [x] "Deus" tradução proibida: 0 ocorrências (correto)
- [x] "Senhor" tradução proibida: 0 ocorrências (correto)
- [x] "livrinho" minúsculo para esta obra
- [x] "Livrinho" maiúsculo para o livro bíblico
- [x] Designações divinas em grafia original + transliteração
- [x] Todos os acentos portugueses restaurados
- [x] "Desvelação" em vez de "Apocalipse"
- [x] Datas corretas (Bíblia = 2025, Escola = 2039)
- [x] Apêndices incluídos ao final da obra
- [x] 6 varreduras completas realizadas

---

### Varredura 3.0 — Geração v2 e Seções Forenses (04/Fev/2026)

**Reestruturação completa para v2 — 10 capítulos:**

A pedido do autor, o manuscrito foi reestruturado de 6 seções (v1) para 10 capítulos (v2), com geração de arquivos individuais por capítulo e um arquivo unificado.

| Capítulo | Arquivo                                  | Linhas | Origem                                         |
| -------- | ---------------------------------------- | ------ | ---------------------------------------------- |
| I        | Capítulo 1 — Introdução.txt              | 97     | Novo (gerado)                                  |
| II       | Capítulo 2 — As Enganadas.txt            | 278    | Extraído de livrinho.txt L324-599              |
| III      | Capítulo 3 — A Denúncia.txt              | ~1.050 | Merge L18-323 + L600-1068 + 11 seções forenses |
| IV       | Capítulo 4 — A Escola.txt                | 91     | Extraído de livrinho.txt L1069-1155            |
| V        | Capítulo 5 — As Feras.txt                | 38     | Extraído L1156-1166 + novo                     |
| VI       | Capítulo 6 — Desvela a Fera do Mar.txt   | 209    | Extraído L1167-1341                            |
| VII      | Capítulo 7 — Desvela a Fera da Terra.txt | 150    | Extraído L1343-1462                            |
| VIII     | Capítulo 8 — Desvela o Enigma 666.txt    | 122    | Extraído L1463-1554                            |
| IX       | Capítulo 9 — Conclusão.txt               | 246    | Extraído L1555-1795                            |
| X        | Apêndice (4 arquivos)                    | —      | Pré-existentes                                 |

**Seções forenses geradas no Capítulo 3 — "Lista das Entidades":**

| Seção                               | Status          | Fonte Principal                      | Dados                                                                 |
| ----------------------------------- | --------------- | ------------------------------------ | --------------------------------------------------------------------- |
| QUEM É YHWH                         | Completa        | DOSSIE_YHWH.txt                      | 22 evidências, axioma E-DC-006 sa'ir, nezer hakodesh=666              |
| QUEM É EL ELYON                     | Completa        | DOSSIE_EL_ELYON.txt                  | 27 evidências de 5 fontes                                             |
| QUEM É EL SHADDAI                   | Completa        | DOSSIE_SHADDAI.txt                   | 7 evidências, cadeia Shaddai→Pantokrator→Jesus                        |
| QUEM É ELOHIM                       | Completa        | DOSSIE_ELOHIM.txt + ELOHIM_STATS.txt | 28 evidências + censo 2.616 ocorrências, p=1.21e-76                   |
| QUEM É ADONAI                       | Completa        | DOSSIE_ADONAI.txt                    | 855 tokens, taxonomia vocálica, Adonikam 666                          |
| QUEM É LILIT                        | Completa        | DOSSIE_LILIT.txt                     | 19 evidências, hapax 441.649 tokens, 6 Easter Eggs, fraude tradutória |
| QUEM É A ENTIDADE DO SINAI          | Movida → dossiê | DOSSIE_ENTIDADE_SINAI.txt            | 10 evidências, contraste Sinai/Sião (Heb 12), E-DC-006                |
| QUEM É A ENTIDADE DA SARÇA          | Movida → dossiê | DOSSIE_ENTIDADE_SARCA.txt            | 11 evidências, 4 designações sobrepostas, Atos 7:30-35                |
| QUEM É A ENTIDADE QUE LUTA COM JACÓ | Movida → dossiê | DOSSIE_ENTIDADE_JACO.txt             | 9 evidências, fuga da luz, ish/Elohim/malakh                          |
| QUEM É A ENTIDADE DE GÊNESIS 1      | Movida → dossiê | DOSSIE_ENTIDADE_GENESIS1.txt         | 12 evidências, bara vs yatsar, tov 7x, Logos=Criador                  |
| QUEM É A ENTIDADE DE GÊNESIS 2      | Movida → dossiê | DOSSIE_ENTIDADE_GENESIS2.txt         | 12 evidências, primeiro sangue, bloqueio árvore da vida               |

**Arquivo unificado:**

- `livrinho-v2.txt` — 2.453 linhas (atualizado em 05/Fev/2026)

**Verificação pós-geração:**

- Zero placeholders restantes no Capítulo 3
- Zero placeholders no livrinho-v2.txt
- Todos os 9 capítulos presentes no arquivo unificado

**Axiomas incorporados (sessão anterior):**

- E-DC-006: "O sa'ir é o marcador textual do sistema de yhwh" — stress test 11/11 (ROCHA)
- E-FM-018: yhwh = Fera do Mar — stress test 11/11 (ROCHA)
- Bloco 1: nezer hakodesh = 666 (CONSOLIDADO)

---

### Varredura 3.1 — Expansão Lilit + Correções YHWH (04/Fev/2026)

**Seção QUEM É LILIT expandida:**

Ficha inicial (5 linhas) substituída por seção forense completa (11 resultados numerados + síntese) a partir do DOSSIE_LILIT.txt (850 linhas, 19 evidências).

| Resultado | Conteúdo                                                                       | Tipo                |
| --------- | ------------------------------------------------------------------------------ | ------------------- |
| 1         | Hapax legomenon absoluto — 1 ocorrência em 441.649 tokens                      | Computacional       |
| 2         | Gênero feminino inequívoco (sufixo ית-)                                        | Morfológico         |
| 3         | Contexto: julgamento de Edom/Seir (Is 34:5-15)                                 | Contextual          |
| 4         | Co-ocorrência com sa'ir (axioma E-DC-006)                                      | Intertextual        |
| 5         | Circularidade Seir: yhwh origina-se de Seir → julga Seir → Lilit habita ruínas | Narrativo           |
| 6         | Espelho estrutural Is 34:11-15 ↔ Des 18:2                                      | Easter Egg (72/100) |
| 7         | Inversão manoach (descanso → não-descanso)                                     | Easter Egg (58/100) |
| 8         | Tema gêmeo Lilit ↔ Prostituta (noite/deserto)                                  | Easter Egg (45/100) |
| 9         | Abolição do domínio da noite (Des 21:25/22:5)                                  | Easter Egg (65/100) |
| 10        | APAGAMENTO TRADUTÓRIO SISTEMÁTICO — denúncia                                   | Fraude              |
| 11        | FRAUDE NO BANCO DE DADOS D1 — erros de tradução                                | Fraude              |

**Correções YHWH maiúsculo (8 ocorrências em 2 arquivos):**

| Antes                  | Depois                 | Arquivo                  |
| ---------------------- | ---------------------- | ------------------------ |
| ESCONDERAM YHWH        | ESCONDERAM yhwh        | livrinho-v2.txt + Cap. 3 |
| QUEM É YHWH            | QUEM É yhwh            | livrinho-v2.txt + Cap. 3 |
| SANTO A YHWH           | SANTO A yhwh           | livrinho-v2.txt + Cap. 3 |
| qodesh laYHWH          | qodesh layhwh          | livrinho-v2.txt + Cap. 3 |
| DESIGNAÇÃO PRÉ-YHWH    | DESIGNAÇÃO PRÉ-yhwh    | livrinho-v2.txt + Cap. 3 |
| FUSÃO COM YHWH         | FUSÃO COM yhwh         | livrinho-v2.txt + Cap. 3 |
| CO-OCORRÊNCIA COM YHWH | CO-OCORRÊNCIA COM yhwh | livrinho-v2.txt + Cap. 3 |
| YHWH BUSCA MATAR       | yhwh BUSCA MATAR       | livrinho-v2.txt + Cap. 3 |

**Documentos forenses produzidos nesta sessão:**

| Documento                         | Localização       | Conteúdo                                                                       |
| --------------------------------- | ----------------- | ------------------------------------------------------------------------------ |
| TESE_ADONAI_POS_MAPEAMENTO_D1.txt | .FORENSE/DOSSIES/ | Tese: vocalização massorética como arma de classificação teológica. 5 achados. |
| ARTIGO_ELOHIM_FILOLOGICO.txt      | .FORENSE/DOSSIES/ | Artigo filológico: censo 2.616 ocorrências Elohim, p=1.21e-76. 7 seções.       |

**Delta do manuscrito:**

- Antes: 2.397 linhas, 42.005 palavras
- Depois: 2.421 linhas, 43.221 palavras (+25 linhas, +1.216 palavras)
- Zero placeholders restantes
- YHWH maiúsculo: apenas em referências a nomes de arquivo (DOSSIE_YHWH.txt)

### Checklist Pós-Varredura 3.1

- [x] yhwh sempre em minúsculas — 8 violações corrigidas, 0 restantes
- [x] YHWH maiúsculo: apenas em nomes de arquivo (correto)
- [x] "Deus" tradução proibida: 2 ocorrências metalinguísticas (legítimas)
- [x] "Senhor" tradução proibida: 0 ocorrências (correto)
- [x] QUEM É LILIT: seção completa com 11 resultados forenses
- [x] Fraude massorética incluída na seção de denúncia (resultados 10 e 11)
- [x] Tese Adonai formalizada e referenciada no dossiê
- [x] Artigo Elohim verificado e conforme regras editoriais

---

### Varredura 3.2 — Reconstrução do Arquivo Unificado (04/Fev/2026)

**Operação:** Reconstrução completa do `livrinho-v2.txt` a partir dos 13 arquivos individuais de capítulo.

**Arquivos-fonte (ordem de montagem):**

| #   | Arquivo                                                                   | Linhas |
| --- | ------------------------------------------------------------------------- | ------ |
| 1   | `1. Intro/Capítulo 1 — Introdução.txt`                                    | 96     |
| 2   | `2. As Enganadas/Capítulo 2 — As Enganadas.txt`                           | 274    |
| 3   | `3. A Denúncia/Capítulo 3 — A Denúncia.txt`                               | 1.051  |
| 4   | `4. A Escola/Capítulo 4 — A Escola.txt`                                   | 90     |
| 5   | `5. As Feras/Capítulo 5 — As Feras.txt`                                   | 37     |
| 6   | `6. Desvela a fera do mar/Capítulo 6 — Desvela a Fera do Mar.txt`         | 208    |
| 7   | `7. Desvela a fera da terra/Capítulo 7 — Desvela a Fera da Terra.txt`     | 149    |
| 8   | `8. Desvela o enigma 666/Capítulo 8 — Desvela o Enigma 666.txt`           | 121    |
| 9   | `9. Conclusão/Capítulo 9 — Conclusão.txt`                                 | 245    |
| 10  | `10. Apendice/Apêndice A - exeg.ai.txt`                                   | 25     |
| 11  | `10. Apendice/Apêndice B - Créditos Técnicos.txt`                         | 17     |
| 12  | `10. Apendice/Apêndice C - Stress Test — Moisés no Evangelho de João.txt` | ~80    |
| 13  | `10. Apendice/Apêndice D — Axiomas Forenses.txt`                          | ~150   |
| 14  | `10. Apendice/BIO do Autor - Belem Anderson Costa.txt`                    | 35     |
| 15  | `10. Apendice/Meus Easter Eggs.txt`                                       | 17     |

**Separador entre arquivos:** `\n\n\n---\n\n\n` (3 linhas em branco + `---` + 3 linhas em branco)

**Stats do arquivo reconstruído:**

| Métrica     | Valor   |
| ----------- | ------- |
| Linhas      | 2.426   |
| Palavras    | 43.222  |
| Caracteres  | 267.657 |
| Bytes UTF-8 | 282.537 |

### Checklist Pós-Varredura 3.2

- [x] 9 capítulos presentes (I a IX) nas posições corretas
- [x] 4 apêndices presentes (A, B, BIO, Easter Eggs)
- [x] yhwh sempre em minúsculas: 139 ocorrências — correto
- [x] YHWH maiúsculo: 6 ocorrências, todas referências a nomes de arquivo (DOSSIE_YHWH.txt) — aceitável
- [x] "Deus": 2 ocorrências metalinguísticas (crítica à tradução) — aceitável
- [x] "Senhor": 1 ocorrência em citação bíblica (Mt 22:44) — aceitável
- [x] "Apocalipse": 17 ocorrências em contexto de contraste/explicação
- [x] Separadores de tabela markdown intactos (6 linhas com `------`)
- [x] Zero placeholders no arquivo final
- [x] Designações divinas em grafia original preservadas

---

### Varredura 3.3 — Evidência ἀγοράζω e Tráfico Espiritual (05/Fev/2026)

**Operação:** Inserção de bloco argumentativo no Capítulo 9 (Conclusão) do `livrinho-v2.txt`.

**Ponto de inserção:** Após L1907 (tese existente sobre a marca) e antes de L1909 (easter eggs AT).

**Conteúdo inserido (~15 linhas):**

| Elemento      | Conteúdo                                                                            |
| ------------- | ----------------------------------------------------------------------------------- |
| Prova lexical | ἀγοράζω (agorazō) — 5 ocorrências na Desvelação, todas sobre posse de vidas humanas |
| Des 5:9       | ἠγόρασας τῷ Θεῷ ἐν τῷ αἵματί σου — Jesus comprou pessoas com sangue                 |
| Des 14:3-4    | οἱ ἠγορασμένοι / ἠγοράσθησαν — 144.000 foram comprados (voz passiva)                |
| Des 13:17     | ἀγοράσαι ἢ πωλῆσαι — releitura: posse espiritual, não comércio material             |
| Paulo         | 1 Co 7:23 — ἠγοράσθητε τιμῆς — fostes comprados por preço                           |
| Des 18:13     | σωμάτων, καὶ ψυχὰς ἀνθρώπων — corpos e almas como mercadoria                        |
| Síntese       | Dois sistemas disputam posse: Cordeiro compra com sangue vs Fera marca com χάραγμα  |

**Dossiê vinculado:** DOSSIE_TRAFICO_VIDAS_HUMANAS.txt (Bloco 103, Categoria XIII)

**Delta do manuscrito:**

- Antes: 2.421 linhas
- Depois: ~2.436 linhas (+15 linhas)

### Checklist Pós-Varredura 3.3

- [x] yhwh em minúsculas: não aparece no bloco inserido
- [x] Designações divinas em grafia original: Θεός (não "Deus")
- [x] "Desvelação" usado em todo o bloco (nunca "Apocalipse")
- [x] Citações bíblicas com grego original + tradução literal + referência
- [x] Tom autoral forense-narrativo consistente com o manuscrito
- [x] Fluxo narrativo verificado (L1900-1950 relido após inserção)

---

### Varredura 3.4 — Evidência Material Tefillin + Cadeia VI→VII→VIII (05/Fev/2026)

**Operação:** Inserções cruzadas em 3 capítulos + dossiê, criando cadeia argumentativa fechada sobre a marca da fera.

**Inserções realizadas:**

| Capítulo                | Conteúdo inserido                                                          | Função             |
| ----------------------- | -------------------------------------------------------------------------- | ------------------ |
| **VII — Fera da Terra** | Nova seção "A EVIDÊNCIA MATERIAL: O OBJETO FÍSICO"                         | Inserção principal |
|                         | Cadeia de comando: yhwh ordena (EXO 13:1), Moisés transmite (EXO 13:3)     | Prova textual      |
|                         | Descrição tefillin shel yad (braço) + shel rosh (cabeça)                   | Evidência material |
|                         | 4 passagens da Torá dentro do objeto (estrutura autorreferencial)          | Mecanismo          |
|                         | Prática viva como evidência material — a marca existe há 3.000 anos        | Conclusão forense  |
| **VIII — Enigma 666**   | Parágrafo consolidador: nezer hakodesh + tefillin = duas camadas           | Síntese            |
|                         | Camada sacerdotal (placa de ouro = 666) + camada popular (tefillin)        | Sistema completo   |
| **VI — Fera do Mar**    | Parágrafo-ponte: diademas/nezer → aparato de marcação corporal             | Antecipação        |
|                         | Remissão ao Cap. VII                                                       | Referência cruzada |
| **DOSSIE_666.txt**      | Seção "Tefillin: A Evidência Material da Marca"                            | Dossiê             |
|                         | Tabela comparativa 9 elementos (QUEM ORDENA = yhwh, QUEM EXECUTA = Moisés) | Evidência          |

**Cadeia argumentativa construída:**

- Cap. VI (Fera do Mar): diademas/nezer como aparato de marcação → ponte para VII
- Cap. VII (Fera da Terra): tefillin como objeto físico com 3.000 anos → a marca já existe
- Cap. VIII (Enigma 666): nezer hakodesh (sacerdotal) + tefillin (popular) = sistema completo

**Delta do manuscrito:**

- Antes: 2.439 linhas
- Depois: 2.453 linhas (+14 linhas)

### Checklist Pós-Varredura 3.4

- [x] Inserções em 3 capítulos + 1 dossiê
- [x] Referências cruzadas entre Cap. VI → VII → VIII coerentes
- [x] Cadeia de comando yhwh → Moisés documentada com versículos
- [x] Tefillin descrito com evidência material verificável
- [x] Sistema de duas camadas (sacerdotal + popular) articulado no Cap. VIII
- [x] Dossiê 666 atualizado com subsecção tefillin

---

### Varredura 3.5 — Catálogo Forense de Assassinatos de Moisés (05/Fev/2026)

**Operação:** Inserção de catálogo completo numerado de todos os assassinatos cometidos ou ordenados por Moisés na Torá, com contagem total consolidada.

**Arquivo editado:** `7. Desvela a fera da terra/Capítulo 7 — Desvela a Fera da Terra.txt`

**Ponto de inserção:** Dentro da seção "MOISÉS COMO 'ASSASSINO DESDE O PRINCÍPIO'", após o parágrafo sobre Êxodo 2:12 e antes de "A MARCA DA FERA: MÃO DIREITA E TESTA".

**Conteúdo inserido:**

| Elemento              | Descrição                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Subtítulo             | "O CATÁLOGO FORENSE: MORTES POR MOISÉS NA TORÁ"                                                                     |
| Episódios catalogados | 10 episódios numerados com referência bíblica, contagem e papel de Moisés                                           |
| Contagem total        | Mínimo 41.953 mortos (números explícitos) + milhares não contabilizados (Midiã, Siom, Ogue)                         |
| Classificação         | 5 categorias de papel: assassino pessoal, ordenou execuções, comandante militar, invocou julgamento, causa indireta |
| Síntese forense       | Conexão com João 8:44 — "pelas obras conhecereis"                                                                   |

**Episódios catalogados:**

| #   | Episódio            | Referência               | Mortos              | Papel de Moisés   |
| --- | ------------------- | ------------------------ | ------------------- | ----------------- |
| 1   | O egípcio           | Êxodo 2:11-12            | 1                   | Assassino pessoal |
| 2   | Bezerro de ouro     | Êxodo 32:25-29           | ~3.000              | Ordenou           |
| 3   | Blasfemador         | Levítico 24:10-23        | 1                   | Ordenou           |
| 4   | Violador do Shabat  | Números 15:32-36         | 1                   | Ordenou           |
| 5   | Rebelião de Core    | Números 16:1-35          | 250+ famílias       | Invocou           |
| 6   | Praga pós-Core      | Números 17:6-15          | 14.700              | Indireto          |
| 7   | Baal-Peor           | Números 25:1-9           | exec. + 24.000      | Ordenou           |
| 8   | Guerra contra Midiã | Números 31:1-54          | dezenas de milhares | Ordenou           |
| 9   | Reino de Siom       | Núm 21:21-31; Dt 2:26-37 | herem total         | Comandante        |
| 10  | Reino de Ogue       | Núm 21:33-35; Dt 3:1-7   | herem 60 cidades    | Comandante        |

**Delta do manuscrito:**

- Antes: 2.453 linhas (Capítulo 7: 175 linhas)
- Depois: 2.526 linhas (Capítulo 7: ~248 linhas, +73 linhas)
- livrinho-v2.txt regenerado: 2.526 linhas, 46.620 palavras

### Checklist Pós-Varredura 3.5

- [x] yhwh em minúsculas em todo o bloco inserido
- [x] Nenhuma designação divina traduzida
- [x] "Desvelação" usado (nunca "Apocalipse")
- [x] Referências bíblicas com livro + capítulo + versículo
- [x] Tom forense-narrativo consistente com o manuscrito
- [x] Catálogo integrado ao fluxo da seção "ASSASSINO DESDE O PRINCÍPIO"
- [x] livrinho-v2.txt regenerado corretamente (13 arquivos concatenados)

---

### Varredura 3.6 — Seção "Jesus Denuncia Moisés" (05/Fev/2026)

**Operação:** Inserção de nova seção forense no Capítulo 7 (Fera da Terra) com todas as declarações de Jesus sobre Moisés no evangelho de João (texto certificado pela Escola).

**Arquivo editado:** `7. Desvela a fera da terra/Capítulo 7 — Desvela a Fera da Terra.txt`

**Ponto de inserção:** Após "A IMAGEM QUE FALA: A ARCA DA ALIANÇA" e antes de "MOISÉS COMO ASSASSINO DESDE O PRINCÍPIO".

**Conteúdo inserido:**

| Seção                | Conteúdo                                                                                                                                                                | Passagem  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| A SERPENTE LEVANTADA | Jo 3:14 — ὕψωσεν τὸν ὄφιν = levantou a serpente (ὄφις = Des 12:9 Dragão). Moisés exaltou eikona do Dragão. Jesus levantado para VENCER — mesmo verbo, operação inversa. | João 3:14 |
| O ACUSADOR           | Jo 5:45 — κατηγορῶν = acusador. Mesmo lexema de Des 12:10 (Satanás). Moisés = função do Dragão.                                                                         | João 5:45 |
| NÃO MOISÉS           | Jo 6:32 — οὐ Μωϋσῆς = NÃO Moisés. Nega fonte. ἀληθινόν = o que Moisés deu não era verdadeiro.                                                                           | João 6:32 |
| LEI E MORTE          | Jo 7:19 — Lei atribuída a Moisés (não ao Pai). Conectada ao desejo de matar Jesus (ἀποκτεῖναι).                                                                         | João 7:19 |
| LEI VS GRAÇA         | Jo 1:17 — ἐδόθη (passivo, Moisés recebe) vs ἐγένετο (ativo, Jesus É). Dois sistemas opostos.                                                                            | João 1:17 |
| TRANSMISSOR          | Jo 7:22 — Circuncisão não é de Moisés, é dos pais. Moisés = transmissor = papel da fera da terra.                                                                       | João 7:22 |
| SÍNTESE              | 6 marcadores forenses: kategorōn, ophis, ou Moyses, apokteinai, edothē, transmissor.                                                                                    | —         |

**Referência cruzada adicionada:** Na seção da serpente de bronze (L86 original), frase conectando Nm 21:9 a Jo 3:14 e Des 12:9.

**Critério metodológico:** Apenas textos certificados pela Escola (Jo, 1-3 Jo, Dan, Des). Sinóticos (Mt, Mc, Lc) NÃO utilizados como fonte de parâmetro.

**Delta do manuscrito:**

- Antes: 2.526 linhas (Capítulo 7: 248 linhas)
- Depois: 2.636 linhas (Capítulo 7: 302 linhas, +54 linhas)
- livrinho-v2.txt regenerado: 2.636 linhas, 47.986 palavras

### Checklist Pós-Varredura 3.6

- [x] yhwh em minúsculas em todo o bloco inserido (2 ocorrências, corretas)
- [x] Designações divinas em grafia original: Theos, Christos (nunca traduzidas)
- [x] "Desvelação" usado (nunca "Apocalipse")
- [x] Citações com grego transliterado + tradução literal + referência
- [x] Tom forense-narrativo consistente com o manuscrito
- [x] Apenas textos certificados (Jo) como fonte — nenhum Sinótico
- [x] livrinho-v2.txt regenerado corretamente (13 arquivos concatenados)

---

### Varredura 4.0 — Auditoria Forense Completa + Geração v11 (08/Fev/2026)

**Operação:** Auditoria forense completa do manuscrito v10 (3.852 linhas) — cruzamento de cada argumentação com dossiês investigativos, seguida de revisão editorial automatizada e geração da v11 de publicação.

**Fonte:** livrinho-v10.txt (MASTER na data, mais recente que individuais)

**Sincronização aplicada (R4):** v10 estava mais atualizado que os individuais (6 inclusões de 08/02/2026 com marcadores [NOVO]). Extraídas seções de v10 para individuais como correção única de sync.

#### Auditoria Forense — Cruzamento com Dossiês

**Agente Cap III vs 6 Dossiês de Entidades:**

- 45 afirmações auditadas
- 82.2% totalmente corroboradas (37/45)
- 8.9% parcialmente corroboradas (4/45)
- 6.7% sem dossiê correspondente (3/45 — Elohim estatístico)
- 0 discrepâncias factuais

**Agente Cap IX + Apêndices vs Dossiês:**

- Cadeia axiomática ROCHA intacta: Dragão → yhwh/Fera do Mar → Moisés/Fera da Terra → 666/nezer hakodesh
- 8 gaps identificados (G1-G8)
- 2 discrepâncias menores (D1-D2)
- Gap mais crítico: G2 (seção Eufrates sem dossiê — autor decidiu manter como está)

**Veredicto:** Manuscrito substancialmente alinhado com base investigativa. Correções predominantemente editoriais.

#### Correções Aplicadas (91 total)

| ID  | Correção                                                              | Quantidade | Severidade |
| --- | --------------------------------------------------------------------- | ---------- | ---------- |
| C1  | "DENÚCIA" → "DENÚNCIA" (typo no ÍNDICE)                               | 1          | CRITICA    |
| C2  | Remoção de marcadores [NOVO — INCLUSÃO] e [FIM DA INCLUSÃO]           | 12         | CRITICA    |
| C3  | Remoção da BIO duplicada (1ª ocorrência, entre Cap IX e Apêndice A)   | 1 seção    | CRITICA    |
| C4  | ÍNDICE completado com Apêndice C (Stress Test) e Apêndice D (Axiomas) | 2 linhas   | ALTA       |
| C5  | "YHWH NASCE DAS ÁGUAS" → "yhwh NASCE DAS ÁGUAS" (título axioma)       | 1          | ALTA       |
| C6  | "KODESH LAYHWH" → "KODESH LAyhwh"                                     | 3          | ALTA       |
| C7  | "Belém" → "Belem" (decisão autoral: sem acento)                       | 71         | MEDIA      |

#### Decisões do Autor Registradas

| Questão                   | Decisão                                             |
| ------------------------- | --------------------------------------------------- |
| Acento em "Belem"         | Sem acento — "Belem" em todo o manuscrito           |
| BIO duplicada             | Remover 1ª (pós-Cap IX), manter 2ª (pós-Apêndice D) |
| Seção Eufrates sem dossiê | Manter como está                                    |

#### Scripts Criados

| Script                         | Função                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tools/editorial_validator.py` | Validação editorial automatizada — verifica todas as regras (yhwh, acentos, marcadores, termos proibidos, Apocalipse, datas, duplicatas, ÍNDICE) |
| `tools/gerar_v11.py`           | Concatenação dos 15 individuais na ordem canônica com separador padrão                                                                           |
| `tools/build_v11.py`           | Build completo: lê v10, aplica correções, extrai seções, escreve individuais, concatena v11                                                      |

#### Validação Automatizada

**v10 (antes):** 158 problemas (13 CRITICAS, 18 ALTAS, 127 MEDIAS)
**v11 (depois):** 57 achados (0 CRITICAS, 15 ALTAS, 42 MEDIAS) — todos falsos positivos confirmados:

- 15 ALTAS: uso metalinguístico legítimo de "Deus", "Senhor", "Todo-Poderoso", "Apocalipse" em contexto pedagógico
- 42 MEDIAS: separadores estruturais (`---`, `═══`) entre capítulos/seções (formatação intencional)

#### Delta do Manuscrito

- v10: 3.852 linhas, ~64.150 palavras
- v11: 3.810 linhas, 62.730 palavras, 409.616 bytes UTF-8
- Diferença: -42 linhas (BIO duplicada + marcadores removidos), -2 linhas ÍNDICE adicionadas

### Checklist Pós-Varredura 4.0

- [x] yhwh em minúsculas — 0 violações (YHWH corrigido no axioma)
- [x] Designações divinas NUNCA traduzidas — uso metalinguístico preservado
- [x] "Desvelação" usado — "Apocalipse" apenas em contexto pedagógico
- [x] "Belem" sem acento — 71 correções Belém→Belem
- [x] ÍNDICE completo — 9 capítulos + 4 apêndices + BIO + Easter Eggs
- [x] Zero marcadores editoriais — 12 removidos
- [x] Zero BIO duplicada — 1ª removida, 2ª canônica preservada
- [x] Datas corretas — Bíblia=2025, Escola=2039
- [x] Cruzamento forense completo — Cap III (82.2% corroborado), Cap IX (ROCHA intacta)
- [x] livrinho-v11.txt gerado via `tools/gerar_v11.py` (15 arquivos concatenados)

---

_Documento gerado como parte do processo editorial de "O livrinho — A Culpa é das Ovelhas"_
