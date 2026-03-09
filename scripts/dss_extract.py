#!/usr/bin/env python3
"""
DSS Data Extractor — Extract manuscript texts from Text-Fabric to JSON.
Exports individual manuscript files with full token data (text, lemma, morphology).

Usage:
    python scripts/dss_extract.py                    # Extract all manuscripts
    python scripts/dss_extract.py --sigla 1Qisaa     # Extract single manuscript
    python scripts/dss_extract.py --biblical-only     # Only biblical manuscripts
    python scripts/dss_extract.py --summary           # Print extraction summary
"""
import argparse
import json
import sys
from pathlib import Path
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")

DSS_TF_PATH = Path(__file__).resolve().parent.parent / "dss-data" / "tf" / "1.8"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "dss-data" / "texts"

FEATURES = (
    "scroll biblical book chapter verse "
    "glyph glyphe glypho glex glexe glexo "
    "lex lexe lexo sp ps nu gn lang "
    "full fulle fullo morpho type "
    "fragment line punc punce after"
)


def load_tf():
    """Load Text-Fabric DSS data."""
    if not DSS_TF_PATH.exists():
        print(f"ERROR: DSS data not found at {DSS_TF_PATH}")
        sys.exit(1)
    from tf.fabric import Fabric
    TF = Fabric(locations=str(DSS_TF_PATH), silent="deep")
    api = TF.load(FEATURES, silent="deep")
    return api


def extract_scroll(api, scroll_node):
    """Extract all data for a single scroll."""
    F = api.F
    L = api.L
    T = api.T

    sigla = F.scroll.v(scroll_node) or ""
    is_biblical = bool(F.biblical.v(scroll_node))

    # Get all words
    words = L.d(scroll_node, otype="word")
    fragments = L.d(scroll_node, otype="fragment")
    lines = L.d(scroll_node, otype="line")

    # Detect languages
    langs = set()
    books_found = set()
    for w in words:
        lang = F.lang.v(w)
        if lang:
            langs.add(lang)
        bk = F.book.v(w)
        if bk:
            books_found.add(bk)

    # Extract fragment structure
    fragment_data = []
    for frag in fragments:
        frag_name = F.fragment.v(frag) or ""
        frag_lines = L.d(frag, otype="line")
        frag_words = L.d(frag, otype="word")

        line_texts = []
        for ln in frag_lines:
            line_num = F.line.v(ln)
            line_words = L.d(ln, otype="word")
            text_parts = []
            for w in line_words:
                g = F.glyph.v(w) or ""
                p = F.punc.v(w) or ""
                a = F.after.v(w) or ""
                text_parts.append(g + p + a)
            line_texts.append({
                "line": line_num,
                "text": "".join(text_parts).strip(),
            })

        fragment_data.append({
            "fragment": frag_name,
            "total_lines": len(frag_lines),
            "total_words": len(frag_words),
            "lines": line_texts,
        })

    # Extract tokens with full annotation
    tokens = []
    for w in words:
        token = {
            "glyph": F.glyph.v(w) or "",
            "glyph_translit": F.glyphe.v(w) or "",
            "glyph_source": F.glypho.v(w) or "",
            "lemma": F.lex.v(w) or "",
            "lemma_translit": F.lexe.v(w) or "",
            "glex": F.glex.v(w) or "",
            "sp": F.sp.v(w) or "",
            "ps": F.ps.v(w) or "",
            "nu": F.nu.v(w) or "",
            "gn": F.gn.v(w) or "",
            "morpho": F.morpho.v(w) or "",
            "lang": F.lang.v(w) or "",
            "book": F.book.v(w) or "",
            "chapter": F.chapter.v(w),
            "verse": F.verse.v(w),
        }
        tokens.append(token)

    # Build verse-level text for biblical scrolls
    verses = []
    if is_biblical:
        verse_groups = defaultdict(list)
        for t in tokens:
            if t["book"] and t["chapter"] and t["verse"]:
                key = (t["book"], t["chapter"], t["verse"])
                verse_groups[key].append(t["glyph"])

        for (book, chapter, verse), glyphs in sorted(verse_groups.items()):
            verses.append({
                "book": book,
                "chapter": chapter,
                "verse": verse,
                "text": " ".join(g for g in glyphs if g),
            })

    result = {
        "sigla": sigla,
        "is_biblical": is_biblical,
        "languages": sorted(langs) if langs else ["HE"],
        "canonical_books": sorted(books_found),
        "total_words": len(words),
        "total_fragments": len(fragments),
        "total_lines": len(lines),
        "total_tokens": len(tokens),
        "fragments": fragment_data,
        "tokens": tokens,
    }

    if verses:
        result["verses"] = verses

    return result


def main():
    parser = argparse.ArgumentParser(description="DSS Data Extractor")
    parser.add_argument("--sigla", "-s", help="Extract specific manuscript by sigla")
    parser.add_argument("--biblical-only", action="store_true", help="Only biblical")
    parser.add_argument("--summary", action="store_true", help="Summary only")
    parser.add_argument("--output-dir", "-o", default=str(OUTPUT_DIR))
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print("Loading Text-Fabric DSS data...")
    api = load_tf()
    F = api.F

    scrolls = list(F.otype.s("scroll"))

    if args.sigla:
        scrolls = [s for s in scrolls if F.scroll.v(s) == args.sigla]
        if not scrolls:
            print(f"ERROR: Manuscript '{args.sigla}' not found")
            sys.exit(1)

    if args.biblical_only:
        scrolls = [s for s in scrolls if F.biblical.v(s)]

    total = len(scrolls)
    print(f"Extracting {total} manuscripts...")

    extracted = 0
    total_tokens = 0

    for i, s in enumerate(scrolls):
        sigla = F.scroll.v(s) or f"unknown_{i}"

        if args.summary:
            words = api.L.d(s, otype="word")
            bib = "BIB" if F.biblical.v(s) else "   "
            print(f"  [{i+1:>4}/{total}] {sigla:>15} {bib} {len(words):>6} words")
            total_tokens += len(words)
            continue

        print(f"  [{i+1:>4}/{total}] Extracting {sigla}...", end="", flush=True)

        data = extract_scroll(api, s)
        total_tokens += data["total_tokens"]

        # Sanitize filename (replace / with _)
        safe_name = sigla.replace("/", "_").replace("\\", "_")
        out_file = output_dir / f"{safe_name}.json"

        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        extracted += 1
        print(f" {data['total_tokens']:,} tokens -> {out_file.name}")

    print(f"\nDone: {extracted} manuscripts extracted, {total_tokens:,} total tokens")
    if not args.summary:
        print(f"Output directory: {output_dir}")


if __name__ == "__main__":
    main()
