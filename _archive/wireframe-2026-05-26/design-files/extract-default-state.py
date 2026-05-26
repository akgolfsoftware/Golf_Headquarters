#!/usr/bin/env python3
"""
Ekstraherer default-state (state #1) fra hver broken state-katalog-HTML
fra Claude Design-bundlen.

Strategi:
  - Les hele HTML-fila
  - Finn FØRSTE <section class="ab" data-screen-label="01 ..."> -- dette er default
  - Behold <head> (inkluderer CSS-link), bytt ut <body> med kun den ene section
  - Skriv ut som "ekstrakert" HTML

Output blir produksjons-klar HTML — én skjerm per fil i full størrelse.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Optional

BUNDLE_ROOT = Path("/tmp/akgolf-design-import/ak-golf-hq-main/project")
REPO_ROOT = Path("/Users/anderskristiansen/Developer/akgolf-hq")
OUT_ROOT = REPO_ROOT / "wireframe/design-files/screens-extracted"
CLEAN_OUT = REPO_ROOT / "wireframe/design-files/screens-clean"


def extract_section(html: str, label_pattern: str = r'01\b') -> Optional[str]:
    """Ekstraher første <section class="ab" data-screen-label="01 ..."> ... </section>."""
    # Finn start av første matching section
    pattern = re.compile(
        rf'<section\s+class="ab[^"]*"\s+data-screen-label="({label_pattern}[^"]*)"',
        re.IGNORECASE
    )
    m = pattern.search(html)
    if not m:
        return None

    start = m.start()
    # Finn slutt — naa neste <section class="ab" eller </body>
    next_pattern = re.compile(r'<section\s+class="ab\b|</body>', re.IGNORECASE)
    next_m = next_pattern.search(html, m.end())
    end = next_m.start() if next_m else len(html)

    return html[start:end].strip()


def extract_cap_section(html: str) -> Optional[str]:
    """For cap-title-stil (live/agent-skjermer): hent ut FØRSTE <section class="e-cap-stack">
    eller tilsvarende som inneholder default-state'n.

    Strukturen er typisk:
      <section class="e-cap-stack">
        <h2 class="cap-title">1 — Default</h2>
        <p>...</p>
        <div class="e-frame">[INNHOLDET vi vil ha]</div>
      </section>
      <section class="e-cap-stack">  <- state 2
        ...

    Vi vil ha første <div class="e-frame ...">[INNHOLDET]</div> — skjermen selv,
    uten cap-title-header.
    """
    # Finn første <div class="e-frame ...">
    frame_pattern = re.compile(r'<div\s+class="e-frame[^"]*"[^>]*>', re.IGNORECASE)
    m = frame_pattern.search(html)
    if not m:
        return None

    # Finn matching </div> ved å telle nesting
    start = m.start()
    pos = m.end()
    depth = 1
    while depth > 0 and pos < len(html):
        next_open = html.find('<div', pos)
        next_close = html.find('</div>', pos)
        if next_close == -1:
            break
        if next_open != -1 and next_open < next_close:
            depth += 1
            pos = next_open + 4
        else:
            depth -= 1
            pos = next_close + 6
    return html[start:pos].strip()


def extract_head(html: str) -> str:
    """Hent ut <head>-innholdet."""
    m = re.search(r'(<head[^>]*>.*?</head>)', html, re.DOTALL | re.IGNORECASE)
    return m.group(1) if m else ""


def fix_css_paths(content: str) -> str:
    """Bytter relative CSS-paths slik at de peker korrekt fra ny lokasjon."""
    # ../colors_and_type.css -> ../colors_and_type.css (samme nivå)
    # _shared/arketype-x.css -> ../_shared/arketype-x.css
    content = re.sub(r'href="_shared/', 'href="../_shared/', content)
    return content


def remove_label_chrome(section_html: str) -> str:
    """Fjern .ab-label-rabb (den lille linjen som sier 'Kanban · lyst (default) · 1448 × 980')."""
    return re.sub(
        r'<div\s+class="ab-label[^"]*">.*?</div>\s*(?=<div\s+class="ab-frame")',
        '',
        section_html,
        count=1,
        flags=re.DOTALL
    )


def build_clean_html(head: str, section: str, title: str = "Skjerm") -> str:
    """Bygg ren standalone-HTML fra hode + én section."""
    section = remove_label_chrome(section)
    section = fix_css_paths(section)
    head = fix_css_paths(head)
    return f"""<!DOCTYPE html>
<html lang="nb">
{head}
<body style="background:var(--surface);margin:0;padding:0">
{section}
</body>
</html>
"""


def process_file(src: Path, dst: Path) -> dict:
    """Konverter én state-katalog-fil til produksjons-klar fil."""
    html = src.read_text(encoding="utf-8")

    # Tell hvor mange states som finnes
    caps = len(re.findall(r'cap-title', html))
    labels = len(re.findall(r'data-screen-label', html))

    if caps + labels <= 1:
        return {"file": src.name, "skipped": "already-clean", "caps": caps, "labels": labels}

    head = extract_head(html)
    section = extract_section(html)

    # Hvis ikke data-screen-label, prøv cap-title-mønster (live/agent-skjermer)
    if section is None and caps > 0:
        cap_frame = extract_cap_section(html)
        if cap_frame:
            # Wrappe i en standalone "section"-stil — bare bruk e-canvas-class i body
            section = cap_frame

    if section is None:
        return {"file": src.name, "skipped": "no-default-section", "caps": caps, "labels": labels}

    title = src.stem
    clean = build_clean_html(head, section, title)
    dst.write_text(clean, encoding="utf-8")
    return {"file": src.name, "written": str(dst.relative_to(REPO_ROOT)), "caps": caps, "labels": labels}


def main():
    results = {"converted": [], "skipped": [], "errors": []}

    # Process screens/, final/, pilot/ — alle har broken state-katalog
    for subdir_name in ["screens", "final", "pilot", "screens-batch-3"]:
        src_dir = BUNDLE_ROOT / subdir_name
        if not src_dir.exists():
            continue

        out_dir = OUT_ROOT / subdir_name
        out_dir.mkdir(parents=True, exist_ok=True)

        for src_file in sorted(src_dir.glob("*.html")):
            dst_file = out_dir / src_file.name
            try:
                result = process_file(src_file, dst_file)
                if "written" in result:
                    results["converted"].append(result)
                else:
                    results["skipped"].append(result)
                    # Kopier som-er hvis allerede ren
                    if result.get("skipped") == "already-clean":
                        dst_file.write_text(src_file.read_text(encoding="utf-8"), encoding="utf-8")
            except Exception as e:
                results["errors"].append({"file": src_file.name, "error": str(e)})

    # Skriv sammendrag
    summary = OUT_ROOT / "_summary.md"
    summary.write_text(f"""# Ekstrakt-sammendrag

**Konvertert (state-katalog → produksjons-klar):** {len(results['converted'])}
**Skipped (allerede ren / kopiert):** {len(results['skipped'])}
**Feil:** {len(results['errors'])}

## Konvertert

{chr(10).join(f"- {r['file']} (var {r['caps']}c+{r['labels']}l → 1)" for r in results['converted'])}

## Skipped

{chr(10).join(f"- {r['file']}: {r.get('skipped', 'unknown')}" for r in results['skipped'])}

## Feil

{chr(10).join(f"- {r['file']}: {r['error']}" for r in results['errors'])}
""", encoding="utf-8")

    print(f"Konvertert: {len(results['converted'])}")
    print(f"Skipped: {len(results['skipped'])}")
    print(f"Feil: {len(results['errors'])}")
    print(f"\nDetaljer i {summary}")


if __name__ == "__main__":
    main()
