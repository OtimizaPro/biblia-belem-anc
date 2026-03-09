#!/usr/bin/env python3
"""
DSS D1 Ingestion — Load extracted DSS manuscripts into Cloudflare D1.
Generates SQL statements for batch insertion via Wrangler.

Usage:
    python scripts/dss_ingest_d1.py                     # Generate SQL for all
    python scripts/dss_ingest_d1.py --biblical-only      # Only biblical manuscripts
    python scripts/dss_ingest_d1.py --sigla 1Qisaa       # Single manuscript
    python scripts/dss_ingest_d1.py --manuscripts-only   # Only manuscript catalog (no tokens)
    python scripts/dss_ingest_d1.py --execute            # Execute via wrangler d1

Generated SQL is saved to dss-data/ingest/ for review before execution.
"""
import argparse
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

BIBLE_DIR = Path(__file__).resolve().parent.parent
DSS_TEXTS_DIR = BIBLE_DIR / "dss-data" / "texts"
CATALOG_FILE = BIBLE_DIR / "dss-data" / "catalog.json"
INGEST_DIR = BIBLE_DIR / "dss-data" / "ingest"

# SQL escape helper
def sql_escape(val):
    if val is None:
        return "NULL"
    if isinstance(val, (int, float)):
        return str(val)
    s = str(val).replace("'", "''")
    return f"'{s}'"


def generate_manuscripts_sql(catalog: dict) -> str:
    """Generate INSERT statements for dss_manuscripts table."""
    lines = ["-- DSS Manuscripts catalog\n"]
    for ms in catalog["manuscripts"]:
        books_json = json.dumps(ms.get("canonical_books", []))
        lines.append(
            f"INSERT OR IGNORE INTO dss_manuscripts "
            f"(sigla, name, is_biblical, language, cave, site, canonical_books_json, "
            f"total_words, total_fragments, total_lines, source, license) VALUES ("
            f"{sql_escape(ms['sigla'])}, "
            f"{sql_escape(ms.get('name', ''))}, "
            f"{1 if ms['is_biblical'] else 0}, "
            f"{sql_escape(','.join(ms.get('language', ['HE'])))}, "
            f"{ms.get('cave') or 'NULL'}, "
            f"{sql_escape(ms.get('site', 'Qumran'))}, "
            f"{sql_escape(books_json)}, "
            f"{ms.get('total_words', 0)}, "
            f"{ms.get('total_fragments', 0)}, "
            f"{ms.get('total_lines', 0)}, "
            f"'ETCBC/dss', 'CC-BY-NC 4.0');"
        )
    return "\n".join(lines)


def generate_tokens_sql(sigla: str, ms_data: dict, batch_size: int = 500) -> list[str]:
    """Generate INSERT statements for dss_tokens and dss_verses.
    Returns list of SQL file contents (batched for D1 limits).
    """
    batches = []
    current_batch = [f"-- Tokens for {sigla}\n"]
    count = 0

    # Get manuscript ID reference
    ms_id_ref = f"(SELECT id FROM dss_manuscripts WHERE sigla = {sql_escape(sigla)})"

    # Verses
    for v in ms_data.get("verses", []):
        current_batch.append(
            f"INSERT OR IGNORE INTO dss_verses "
            f"(manuscript_id, book, chapter, verse, text_dss) VALUES ("
            f"{ms_id_ref}, "
            f"{sql_escape(v['book'])}, "
            f"{v['chapter']}, "
            f"{v['verse']}, "
            f"{sql_escape(v['text'])});"
        )
        count += 1
        if count >= batch_size:
            batches.append("\n".join(current_batch))
            current_batch = [f"-- Tokens for {sigla} (continued)\n"]
            count = 0

    # Tokens (only first 5000 per manuscript to avoid D1 limits)
    max_tokens = 5000
    for i, t in enumerate(ms_data.get("tokens", [])[:max_tokens]):
        current_batch.append(
            f"INSERT INTO dss_tokens "
            f"(manuscript_id, position, glyph, glyph_translit, lemma, lemma_translit, "
            f"sp, ps, nu, gn, morpho, lang, book, chapter, verse) VALUES ("
            f"{ms_id_ref}, "
            f"{i}, "
            f"{sql_escape(t.get('glyph', ''))}, "
            f"{sql_escape(t.get('glyph_translit', ''))}, "
            f"{sql_escape(t.get('lemma', ''))}, "
            f"{sql_escape(t.get('lemma_translit', ''))}, "
            f"{sql_escape(t.get('sp', ''))}, "
            f"{sql_escape(t.get('ps', ''))}, "
            f"{sql_escape(t.get('nu', ''))}, "
            f"{sql_escape(t.get('gn', ''))}, "
            f"{sql_escape(t.get('morpho', ''))}, "
            f"{sql_escape(t.get('lang', ''))}, "
            f"{sql_escape(t.get('book', ''))}, "
            f"{t.get('chapter') or 'NULL'}, "
            f"{t.get('verse') or 'NULL'});"
        )
        count += 1
        if count >= batch_size:
            batches.append("\n".join(current_batch))
            current_batch = [f"-- Tokens for {sigla} (continued)\n"]
            count = 0

    if current_batch and len(current_batch) > 1:
        batches.append("\n".join(current_batch))

    return batches


def main():
    parser = argparse.ArgumentParser(description="DSS D1 Ingestion")
    parser.add_argument("--sigla", "-s", help="Ingest single manuscript")
    parser.add_argument("--biblical-only", action="store_true")
    parser.add_argument("--manuscripts-only", action="store_true", help="Only catalog, no tokens")
    parser.add_argument("--execute", action="store_true", help="Execute via wrangler d1")
    parser.add_argument("--local", action="store_true", default=True, help="Use --local flag with wrangler")
    args = parser.parse_args()

    INGEST_DIR.mkdir(parents=True, exist_ok=True)

    # Load catalog
    if not CATALOG_FILE.exists():
        print("ERROR: Run dss_catalog.py first")
        sys.exit(1)

    with open(CATALOG_FILE, encoding="utf-8") as f:
        catalog = json.load(f)

    # Step 1: Generate manuscripts SQL
    print("Generating manuscripts SQL...")
    ms_sql = generate_manuscripts_sql(catalog)
    ms_file = INGEST_DIR / "001_manuscripts.sql"
    with open(ms_file, "w", encoding="utf-8") as f:
        f.write(ms_sql)
    print(f"  -> {ms_file} ({len(catalog['manuscripts'])} manuscripts)")

    if args.manuscripts_only:
        print("Done (manuscripts only)")
        return

    # Step 2: Generate token SQL per manuscript
    if args.sigla:
        siglas = [args.sigla]
    elif args.biblical_only:
        siglas = [m["sigla"] for m in catalog["manuscripts"] if m["is_biblical"]]
    else:
        # Default: biblical manuscripts only (non-biblical would be too large for D1)
        siglas = [m["sigla"] for m in catalog["manuscripts"] if m["is_biblical"]]

    print(f"Generating token SQL for {len(siglas)} manuscripts...")
    total_files = 0

    for i, sigla in enumerate(siglas):
        safe = sigla.replace("/", "_").replace("\\", "_")
        ms_file = DSS_TEXTS_DIR / f"{safe}.json"
        if not ms_file.exists():
            continue

        with open(ms_file, encoding="utf-8") as f:
            ms_data = json.load(f)

        batches = generate_tokens_sql(sigla, ms_data)
        for j, batch in enumerate(batches):
            out_file = INGEST_DIR / f"tokens_{safe}_{j:03d}.sql"
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(batch)
            total_files += 1

        if (i + 1) % 50 == 0:
            print(f"  [{i+1}/{len(siglas)}] processed...")

    print(f"\nGenerated {total_files} SQL files in {INGEST_DIR}")
    print(f"\nTo execute:")
    print(f"  # Apply schema first:")
    print(f"  npx wrangler d1 execute biblia-belem --local --file=migrations/004_dss_manuscripts.sql")
    print(f"  # Then ingest manuscripts:")
    print(f"  npx wrangler d1 execute biblia-belem --local --file=dss-data/ingest/001_manuscripts.sql")
    print(f"  # Then token files (in order):")
    print(f"  for f in dss-data/ingest/tokens_*.sql; do npx wrangler d1 execute biblia-belem --local --file=$f; done")


if __name__ == "__main__":
    main()
