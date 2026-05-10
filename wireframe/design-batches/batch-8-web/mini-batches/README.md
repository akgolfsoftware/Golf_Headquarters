# Mini-batches for Batch 8 — Web (akgolf.no)

30 web-sider er delt opp i 6 mini-batches a 5 sider hver. Hver mini-batch
genereres i en sammenhengende claude.ai/design-sesjon.

## Hvorfor dele opp i mini-batches

Claude.ai/design henger naar du laster opp 30+ vedlegg samtidig. 5 sider
per sesjon er det optimale for kvalitet og hastighet. Hver mini-batch tar
~60-90 minutter aa produsere.

## Mini-batch-oversikt

| Mini-batch | Tema | Pakker | Tone |
|---|---|---|---|
| 8-A | Forside, om, coaches, tjenester | 1-5 | Mørk hero + editorial |
| 8-B | Tjeneste/anlegg-detail, priser, kontakt | 6-10 | Konvertering |
| 8-C | Blogg, cases, B2B-klubb | 11-15 | Editorial + social proof |
| 8-D | B2B-bedrift, talent, junior, sponsorer, jobb | 16-20 | Pitch + partnerskap |
| 8-E | Sammenlign, FAQ, legal | 21-25 | Hjelp + tillit |
| 8-F | 404/500, footer, nav, newsletter | 26-30 | Komponenter + edge cases |

## Filer per mini-batch

Hver mini-batch har 3 filer:

1. `8-X.md` — samlet spec for alle 5 pakker (per-pakke-detaljer)
2. `8-X-prompt.md` — copy-paste-prompt til claude.ai/design
3. `8-X-vedlegg.txt` — liste over HTML-filer + system-kontekst som maa lastes opp

## Hvordan kjore en mini-batch

1. Apne `8-X-vedlegg.txt` og last opp ALLE listede filer i claude.ai/design (system-kontekst forst, sa pakker)
2. Kopier hele `8-X-prompt.md` inn som forste melding
3. Vent — Claude genererer alle 5 sider i ett lop
4. Lim design-link tilbake til Claude Code per pakke i tracker

## Felles regler (gjelder ALLE mini-batches)

- **Designsystem:** bruk eksakt token-navn, aldri hardkode hex
- **Norsk bokmaal:** AE/OE/AA, komma som desimal (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator:** `1 600 kr` ikke `1.600`
- **Maks 2 lime-elementer pr view:** lime er for accent, ikke wallpaper
- **8pt-grid:** spacing 8/16/24/32/40/48/64
- **Lucide-ikoner:** 1.5px stroke, currentColor
- **Inter Tight** for display, **Inter** for body, **JetBrains Mono** for tall
- **Italic Instrument Serif** kun pa editorial momenter (sitater, hero-keywords)

## Anti-AI-regler (KRITISK for web-sider)

- **ALDRI** "Velkommen!" eller "Hei kjaere kunde" — bruk italic editorial
- **ALDRI** corporate-floskler: "synergi", "best in class", "world-class", "neste generasjon"
- **ALDRI** generiske CTA-er: "Lær mer" — bruk konkret: `Book intro →`, `Se priser →`, `Snakk med oss →`
- **ALDRI** stock-foto-vibes — referer til ekte coaches, ekte spillere, ekte anlegg
- **ALDRI** lim emojis i UI — Lucide-ikoner ONLY
- **ALDRI** drop-shadow-overload — flat med subtile borders

## Tonale stikkord per mini-batch

- **8-A** (forside, om): Editorial, varmt, ambisiose, ekte
- **8-B** (priser, kontakt): Klart, transparent, lett aa beslutte
- **8-C** (blogg, cases, klubb): Faglig, social proof, ekte tall
- **8-D** (talent, junior, partnerskap): Selektivt prestisje + tilgjengelig junior
- **8-E** (sammenlign, FAQ, legal): Hjelpsomt, ryddig, tillitsbyggende
- **8-F** (errors, komponenter): Konsekvent, robust, lett-humoristisk pa 404

## Reelle navn og priser (gjelder hele batch)

| Type | Verdi |
|---|---|
| CEO / Head Coach | Anders Kristiansen |
| Coaches | Julie Solem, Markus R. Pedersen, Emil Halvorsen, Sara Lien |
| Klubb-partnere | Bossum, GFGK (Fredrikstad GK), Mulligan Indoor, Drobak GK |
| Tech-partnere | TrackMan, Mizuno, Sbanken, WANG Toppidrett |
| 1:1 coaching | 1 600 kr/time |
| Pro-abo | 299 kr/mnd |
| Elite-abo | 799 kr/mnd |
| Junior | 1 200 kr/mnd (alt inkludert) |
| Telefon | +47 482 35 700 |
| Adresse | Storgata 12, 1607 Fredrikstad |

## Output per skjerm

Per pakke i mini-batch:
1. Hovedskjerm i lyst tema (default for web)
2. Mobil <=640px hvor layout endres
3. Hover-state pa kritiske CTA-er
4. Empty/loading/error hvor relevant
5. Mørk variant kun for landing-hero (sjelden full side)
