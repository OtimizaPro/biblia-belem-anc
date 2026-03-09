#!/usr/bin/env python3
"""
DSS Catalog Generator — Dead Sea Scrolls Manuscript Inventory
Generates a comprehensive JSON catalog of all ~1001 manuscripts
from the ETCBC/dss Text-Fabric dataset.

Usage:
    python scripts/dss_catalog.py
    python scripts/dss_catalog.py --output dss-data/catalog.json
    python scripts/dss_catalog.py --biblical-only
    python scripts/dss_catalog.py --stats
"""
import argparse
import json
import sys
from pathlib import Path
from collections import Counter

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding="utf-8")

DSS_TF_PATH = Path(__file__).resolve().parent.parent / "dss-data" / "tf" / "1.8"

# Mapping of ETCBC book abbreviations to canonical book codes
BOOK_MAP = {
    "Gn": "GEN", "Ex": "EXO", "Lv": "LEV", "Nm": "NUM", "Dt": "DEU",
    "Jos": "JOS", "Jdc": "JDG", "Rt": "RUT", "1Sm": "1SA", "2Sm": "2SA",
    "1Rg": "1KI", "2Rg": "2KI", "1Ch": "1CH", "2Ch": "2CH",
    "Esr": "EZR", "Neh": "NEH", "Est": "EST",
    "Job": "JOB", "Ps": "PSA", "Prv": "PRO", "Qoh": "ECC", "Ct": "SNG",
    "Is": "ISA", "Jr": "JER", "Thr": "LAM", "Ez": "EZK", "Dn": "DAN",
    "Hos": "HOS", "Joel": "JOL", "Am": "AMO", "Ob": "OBA", "Jon": "JON",
    "Mi": "MIC", "Nah": "NAH", "Hab": "HAB", "Zph": "ZEP",
    "Hag": "HAG", "Zch": "ZEC", "Mal": "MAL",
}

# Common scroll names to human-readable descriptions
SCROLL_NAMES = {
    "1Qisaa": "Great Isaiah Scroll",
    "1Qisab": "Isaiah Scroll b",
    "1QS": "Community Rule (Serekh ha-Yahad)",
    "1QSa": "Rule of the Congregation",
    "1QSb": "Rule of Blessings",
    "1QpHab": "Pesher Habakkuk",
    "1QM": "War Scroll",
    "1QHa": "Thanksgiving Hymns (Hodayot)",
    "CD": "Damascus Document (Cairo Genizah)",
    "11Q19": "Temple Scroll",
    "11Q13": "Melchizedek Document",
    "4Q246": "Son of God Document (Aramaic Apocalypse)",
}


def load_tf():
    """Load Text-Fabric DSS data."""
    if not DSS_TF_PATH.exists():
        print(f"ERROR: DSS data not found at {DSS_TF_PATH}")
        print("Run: git clone https://github.com/ETCBC/dss.git dss-data")
        sys.exit(1)

    from tf.fabric import Fabric

    TF = Fabric(locations=str(DSS_TF_PATH), silent="deep")
    features = "scroll biblical book chapter verse sp lang type fragment line"
    api = TF.load(features, silent="deep")
    return api


def extract_cave(sigla: str) -> int | None:
    """Extract cave number from scroll sigla (e.g., '4Q246' -> 4)."""
    for i, c in enumerate(sigla):
        if c == "Q" and i > 0:
            try:
                return int(sigla[:i])
            except ValueError:
                pass
    return None


def generate_catalog(api, biblical_only=False):
    """Generate catalog of all DSS manuscripts."""
    F = api.F
    L = api.L

    scrolls = list(F.otype.s("scroll"))
    catalog = []

    for s in scrolls:
        sigla = F.scroll.v(s) or ""
        if not sigla:
            continue

        is_biblical = bool(F.biblical.v(s))
        if biblical_only and not is_biblical:
            continue

        words = L.d(s, otype="word")
        fragments = L.d(s, otype="fragment")
        lines = L.d(s, otype="line")

        # Detect languages used
        langs = set()
        for w in words[:200]:  # sample first 200 words
            lang = F.lang.v(w)
            if lang:
                langs.add(lang)

        # Detect canonical book (for biblical scrolls)
        books = set()
        chapters = set()
        for w in words[:500]:
            bk = F.book.v(w)
            ch = F.chapter.v(w)
            if bk:
                books.add(bk)
            if ch:
                chapters.add(ch)

        canonical_books = []
        for bk in sorted(books):
            code = BOOK_MAP.get(bk, bk)
            canonical_books.append({"etcbc": bk, "code": code})

        cave = extract_cave(sigla)
        human_name = SCROLL_NAMES.get(sigla, "")

        entry = {
            "sigla": sigla,
            "name": human_name,
            "is_biblical": is_biblical,
            "language": sorted(langs) if langs else ["HE"],
            "cave": cave,
            "site": "Qumran" if cave else "Unknown",
            "canonical_books": canonical_books,
            "total_words": len(words),
            "total_fragments": len(fragments),
            "total_lines": len(lines),
            "chapters_attested": sorted(chapters) if chapters else [],
        }
        catalog.append(entry)

    # Sort: biblical first, then by sigla
    catalog.sort(key=lambda x: (not x["is_biblical"], x["sigla"]))
    return catalog


def print_stats(catalog):
    """Print summary statistics."""
    total = len(catalog)
    biblical = sum(1 for c in catalog if c["is_biblical"])
    non_biblical = total - biblical

    total_words = sum(c["total_words"] for c in catalog)
    total_frags = sum(c["total_fragments"] for c in catalog)

    caves = Counter(c["cave"] for c in catalog if c["cave"])

    print(f"\n{'='*60}")
    print(f"  DEAD SEA SCROLLS — CATALOG STATISTICS")
    print(f"{'='*60}")
    print(f"  Total manuscripts:    {total:,}")
    print(f"  Biblical:             {biblical:,}")
    print(f"  Non-biblical:         {non_biblical:,}")
    print(f"  Total words:          {total_words:,}")
    print(f"  Total fragments:      {total_frags:,}")
    print(f"\n  BY CAVE:")
    for cave in sorted(caves.keys()):
        print(f"    Cave {cave:>2}: {caves[cave]:>4} manuscripts")

    # Top 10 largest scrolls
    by_size = sorted(catalog, key=lambda x: x["total_words"], reverse=True)[:15]
    print(f"\n  TOP 15 LARGEST MANUSCRIPTS:")
    for c in by_size:
        bib = "BIB" if c["is_biblical"] else "   "
        books = ", ".join(b["code"] for b in c["canonical_books"]) if c["canonical_books"] else ""
        print(f"    {c['sigla']:>15} {bib} {c['total_words']:>6} words  {books}")

    # Biblical book coverage
    book_coverage = Counter()
    for c in catalog:
        if c["is_biblical"]:
            for b in c["canonical_books"]:
                book_coverage[b["code"]] += 1
    if book_coverage:
        print(f"\n  BIBLICAL BOOK COVERAGE (manuscripts per book):")
        for book, count in book_coverage.most_common():
            print(f"    {book:>5}: {count:>3} manuscripts")

    print(f"{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(description="DSS Catalog Generator")
    parser.add_argument(
        "--output", "-o",
        default=str(Path(__file__).resolve().parent.parent / "dss-data" / "catalog.json"),
        help="Output JSON file path",
    )
    parser.add_argument("--biblical-only", action="store_true", help="Only include biblical manuscripts")
    parser.add_argument("--stats", action="store_true", help="Print statistics only (no file output)")
    args = parser.parse_args()

    print("Loading Text-Fabric DSS data...")
    api = load_tf()

    print("Generating catalog...")
    catalog = generate_catalog(api, biblical_only=args.biblical_only)

    if args.stats:
        print_stats(catalog)
        return

    # Save catalog
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    output = {
        "_metadata": {
            "source": "ETCBC/dss (Martin Abegg transcriptions)",
            "format": "Text-Fabric 1.8",
            "license": "CC-BY-NC 4.0",
            "generated_by": "dss_catalog.py",
            "total_manuscripts": len(catalog),
            "total_biblical": sum(1 for c in catalog if c["is_biblical"]),
            "total_non_biblical": sum(1 for c in catalog if not c["is_biblical"]),
        },
        "manuscripts": catalog,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Catalog saved to {output_path}")
    print(f"  {len(catalog)} manuscripts cataloged")

    print_stats(catalog)


if __name__ == "__main__":
    main()
