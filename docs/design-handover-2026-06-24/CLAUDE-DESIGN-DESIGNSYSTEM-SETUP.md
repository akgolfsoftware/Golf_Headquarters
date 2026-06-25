# Design-system-oppsett for Claude Design — AK Golf HQ

> **Bruk:** Opprett et NYTT design-system-prosjekt i Claude Design (atskilt fra skjerm-prosjektet ditt).
> Lim inn blokken under. Da bygger Claude Design tokens + komponenter som gjenbrukbare byggeklosser,
> og fremtidige skjerm-design arver dem automatisk. (Erstatter ikke skjermene dine — lever ved siden av.)

---

```
Opprett et design system for AK Golf HQ — en data-tett golf-coaching-plattform. Definer tokens + gjenbrukbare komponenter i lyst OG mørkt tema, så hver fremtidig skjerm arver dem og blir konsekvent.

TOKENS
Farger: cream #FAFAF7 (base, aldri ren hvit) · paper #FFFFFF (kort) · sand #F1EEE5 · border #E5E3DD · #C9C6BD (sterkere skille) · muted #5E5C57 · ink #0A1F17 (tekst) · forest #005840 (merke/primær) · lime #D1F843 (signal). Status: ok #1A7D56 · warn #B8852A · urgent #A32D2D · info #2563EB. Pyramide-akser: Fysisk forest · Teknisk warn · Golfslag info · Spill lime · Turnering urgent.
Type: Inter (UI/brødtekst) · Inter Tight (display/hero, tett tracking, italic-aksent) · JetBrains Mono (ALLE tall/eyebrows/KPI, tabular-nums). Skala: Display-XL 56–72 · Display-L 36–44 · Title 20–24 · Body 14–16 (line-height 1.5) · Caption 12–13 · Mono-data 11–14 · Eyebrow 10–11 uppercase tracking 0.1em.
Nøytral-rampe (dybde uten farge): cream → paper → sand → border → #C9C6BD → muted → ink.
Elevasjon (varm, lav): hvile = kun hårlinje · kort = 0 1px 2px rgba(10,31,23,.04), 0 2px 8px rgba(10,31,23,.04) · overlay = 0 8px 24px rgba(10,31,23,.10). Aldri kald grå skygge.
Spacing: 8pt-grid (8/16/24/32/48/64), data-tett 12/14. Radius: 8/14/20/28/full (knapper helt runde). Hårfine 1px-linjer organiserer rader/celler — ikke bokser overalt.
Regler: lime kun som signal (ALDRI lime tekst på lys bakgrunn — mørk tekst på lime). Tallet er helten. Tett men organisert. Kun Lucide-ikoner (1,5px). Ingen emoji. Tema: PlayerHQ lyst · AgencyOS mørk «terminal» + lys-toggle · Forelder/Marketing lyst.

KOMPONENTER (bygg hver som gjenbrukbar, lyst + mørkt):
1. Button — varianter lime / forest / ghost. Rounded-full pill, JetBrains Mono 12px bold uppercase. Min 44px høyde på mobil.
2. Badge — ok / warn / urgent / lime / primary / neutral. Liten pill, mono uppercase.
3. Eyebrow — mono 10–11px uppercase, muted, tracking 0.1em.
4. KpiCard — eyebrow + stort mono display-tall + signert delta (▲▼ + farge). Hårlinje-skille mellom kort.
5. SgBar — kategorinavn + lime fyll-bar + mono verdi (strokes-gained per område).
6. PyramidProgress — fem-akse pyramide med akse-fargene over.
7. StatTable — tett tabell, hårfine rad-skiller, mono tabular-tall, avatar-celle. Rad ≥md → kort <md.
8. StatusPill — status med farget prikk (lime = aktiv/nå, urgent = haster).
9. Avatar — initialer eller foto, sirkel, tone regelstyrt (lime = aktiv i dag).
10. EmptyState + Skeleton — tom-tilstand med «neste handling»; skeleton-puls som matcher innholdets form (aldri spinner).

Disse komponentene skal se IDENTISKE ut på tvers av alle skjermer — det er det som gir konsistens. Bruk forest som primærhandling, lime kun som signal, mono på alle tall.
```

---

*Etter at design systemet er satt opp: lim master-prompten (`CLAUDE-DESIGN-PROMPT-V2.md`) inn i skjerm-prosjektet ditt, og be om skjermer per pulje (`CLAUDE-DESIGN-PULJER.md`). Da bygges skjermene av disse byggeklossene.*
