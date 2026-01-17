#!/bin/bash
# Exportador da Bíblia Belém An.C 2025 via D1
# Método: Literal Rígido - Fiel ao códice original

cd "v:/Projetos/Ecossistema aculpaedasovelhas/Bible Belem AnC 2025"

OUTPUT_DIR="export/txt"
mkdir -p "$OUTPUT_DIR"

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║       EXPORTADOR - BÍBLIA BELÉM An.C 2025                        ║"
echo "║       Via Cloudflare D1 - Tradução Literal Rígida                ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Lista de livros (ordem canônica)
BOOKS=(
  "GEN:Gênesis:50" "EXO:Êxodo:40" "LEV:Levítico:27" "NUM:Números:36" "DEU:Deuteronômio:34"
  "JOS:Josué:24" "JDG:Juízes:21" "RUT:Rute:4" "1SA:1_Samuel:31" "2SA:2_Samuel:24"
  "1KI:1_Reis:22" "2KI:2_Reis:25" "1CH:1_Crônicas:29" "2CH:2_Crônicas:36" "EZR:Esdras:10"
  "NEH:Neemias:13" "EST:Ester:10" "JOB:Jó:42" "PSA:Salmos:150" "PRO:Provérbios:31"
  "ECC:Eclesiastes:12" "SNG:Cantares:8" "ISA:Isaías:66" "JER:Jeremias:52" "LAM:Lamentações:5"
  "EZK:Ezequiel:48" "DAN:Daniel:12" "HOS:Oseias:14" "JOL:Joel:3" "AMO:Amós:9"
  "OBA:Obadias:1" "JON:Jonas:4" "MIC:Miqueias:7" "NAM:Naum:3" "HAB:Habacuque:3"
  "ZEP:Sofonias:3" "HAG:Ageu:2" "ZEC:Zacarias:14" "MAL:Malaquias:4"
  "MAT:Mateus:28" "MRK:Marcos:16" "LUK:Lucas:24" "JHN:João:21" "ACT:Atos:28"
  "ROM:Romanos:16" "1CO:1_Coríntios:16" "2CO:2_Coríntios:13" "GAL:Gálatas:6" "EPH:Efésios:6"
  "PHP:Filipenses:4" "COL:Colossenses:4" "1TH:1_Tessalonicenses:5" "2TH:2_Tessalonicenses:3"
  "1TI:1_Timóteo:6" "2TI:2_Timóteo:4" "TIT:Tito:3" "PHM:Filemom:1" "HEB:Hebreus:13"
  "JAS:Tiago:5" "1PE:1_Pedro:5" "2PE:2_Pedro:3" "1JN:1_João:5" "2JN:2_João:1"
  "3JN:3_João:1" "JUD:Judas:1" "REV:Apocalipse:22"
)

# Contador
COUNT=0
TOTAL=${#BOOKS[@]}

for ENTRY in "${BOOKS[@]}"; do
  IFS=':' read -r CODE NAME CHAPTERS <<< "$ENTRY"
  ((COUNT++))

  FILENAME=$(printf "%02d_%s_%s.txt" "$COUNT" "$CODE" "$NAME")
  FILEPATH="$OUTPUT_DIR/$FILENAME"

  echo "[$COUNT/$TOTAL] Exportando $NAME ($CODE)..."

  # Cabeçalho do arquivo
  cat > "$FILEPATH" << EOF
═══════════════════════════════════════════════════════════════════════
${NAME^^}
═══════════════════════════════════════════════════════════════════════

Tradução: Bíblia Belém An.C 2025
Método: Literal Rígido - Fiel ao códice original
Sem suavização. Sem normalização. Sem interferência do tradutor.

═══════════════════════════════════════════════════════════════════════

EOF

  # Query para todo o livro
  QUERY="SELECT v.chapter, v.verse, GROUP_CONCAT(t.pt_literal, ' ') as texto FROM books b JOIN verses v ON b.id = v.book_id JOIN tokens t ON v.id = t.verse_id WHERE b.code = '$CODE' AND t.pt_literal IS NOT NULL GROUP BY v.chapter, v.verse ORDER BY v.chapter, v.verse"

  # Executar query e processar
  npx wrangler d1 execute biblia-belem --remote --command "$QUERY" --json 2>/dev/null | \
    node -e "
      const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
      if (data[0] && data[0].results) {
        let currentChapter = 0;
        for (const row of data[0].results) {
          if (row.chapter !== currentChapter) {
            currentChapter = row.chapter;
            console.log('');
            console.log('── Capítulo ' + currentChapter + ' ──');
            console.log('');
          }
          console.log(row.verse + '  ' + (row.texto || '[sem tradução]'));
        }
      }
    " >> "$FILEPATH"

  # Rodapé
  echo "" >> "$FILEPATH"
  echo "───────────────────────────────────────────────────────────────────────" >> "$FILEPATH"
  echo "Fim de $NAME" >> "$FILEPATH"

  echo "  ✓ $FILENAME"
done

echo ""
echo "══════════════════════════════════════════════════════════════════════════"
echo "EXPORTAÇÃO CONCLUÍDA"
echo "Arquivos em: $OUTPUT_DIR"
echo "══════════════════════════════════════════════════════════════════════════"

# Criar índice
ls -la "$OUTPUT_DIR"
