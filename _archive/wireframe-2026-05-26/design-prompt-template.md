# Prompt-mal for claude.ai/design

**Bruk:** Når jeg lager en design-pakke for én skjerm, kopierer jeg denne malen og fyller inn `{{...}}`-feltene. Du laster opp resultatet i claude.ai/design sammen med vedleggene.

**Vedlegg som lastes opp i Claude Design (i denne rekkefølgen):**
1. `wireframe/brain/design-system-v2.md` (system-kontekst — én gang per session)
2. HTML-wireframe for skjermen (visuell referanse)
3. Tilhørende modal-HTML-er (hvis relevant)

---

## Mal — kopier ALT under denne linja per skjerm

---

# AK Golf Platform — {{Produkt}} — {{Skjerm-navn}}

## Identitet

- **Produkt:** {{CoachHQ | PlayerHQ | Auth | Web | Booking}}
- **URL:** {{/admin/hub}}
- **Arketype:** {{A — Dashboard | B — List+filter | C — Detail+tabs | D — Wizard/Form | E — Fullscreen/Live | F — Settings | G — Other}}
- **Tier-gating:** {{Alle | Pro | Elite — eller "ikke relevant"}}
- **HTML-referanse:** `wireframe/screen-deck/{{produkt/skjerm.html}}` (lastet opp som vedlegg)
- **Tilhørende modaler:** {{Liste, eller "ingen"}}

## Designsystem

Bruk `design-system-v2.md` som er lastet opp som system-kontekst. Eksakte token-navn — IKKE hardkode hex-verdier eller font-størrelser.

**Krav:**
- 8pt-grid for all spacing (4, 8, 12, 16, 24, 32, 40, 48, 64)
- Lucide-ikoner (24px, 1.5px stroke, currentColor)
- Norsk bokmål, æ/ø/å, komma som desimaltegn, 24-timer
- Ingen emojier
- Maks 3 lime (`accent`) elementer synlige
- Asymmetrisk bento-grid på dashboards (ikke 3×1 uniform)

## Spec fra wireframe-inventory

{{Kopier inn relevant rad/avsnitt fra inventory/{coachhq,playerhq,cross-cutting}-inventory.md — typisk:
- Formål med skjermen
- Hovedkomponenter
- KPI-er som vises
- Klikkbare elementer (CTA, knapper, ikoner)
- Datakilder
- Tier-gating-detaljer
- Mobile vs desktop-hensyn
}}

## Layout-anvisning (parsed fra HTML-wireframe)

{{Komponentliste i hierarki, f.eks.:

- **Header**
  - Hero-greeting (italic Inter Tight, 36px) — "{{tekst}}"
  - Sub-greeting (caption) — "{{tekst}}"
- **KPI-strip** (asymmetrisk 4-kort)
  - Kort 1: HCP-trend (stort tall + sparkline)
  - Kort 2: Antall økter denne uken (brøk-format)
  - Kort 3: SG-trend (radar-thumbnail)
  - Kort 4: Streak (uke-pills)
- **Bento-modul-rad**
  - Stor modul: Pyramide-progresjon (60% bredde)
  - Liten modul: Neste økt (40% bredde)
- **Aktivitets-feed** (full bredde, scroll)
}}

## Klikkbare elementer som må designes (states)

{{Liste fra audit/{{skjerm}}.md, f.eks.:

| Element | Hvilke states må designes |
|---|---|
| "Ny plan"-CTA (primary button) | default, hover, active, focus, disabled, loading |
| "Eksporter"-icon-button | default, hover, active, focus, dropdown-open |
| Status-pill (klikkbar for inline-edit) | default, hover, edit-mode, saving, error |
| Tab-bytte (Plan / Sessions / Tester) | default per tab, active per tab, hover per tab |
| Filter-chip (multi-select) | default, hover, selected, disabled |
}}

## Tilhørende modaler (lastet opp som ekstra vedlegg)

{{Liste, f.eks.:
- `shared/modals/new-plan.html` — åpnes fra "Ny plan"-CTA
- `shared/modals/plan-share.html` — åpnes fra "..."-meny på hver plan-rad
}}

## Empty / loading / error-states

- **Empty:** {{Beskrivelse — f.eks. "Ingen planer ennå. Vis CTA 'Lag din første plan' med illustrasjon."}}
- **Loading:** {{Skeleton som matcher layout — vis 3 rader med skeleton-kort}}
- **Error:** {{Vis error-state med retry-knapp og link til support}}

## Ønsket output fra Claude Design

1. **Hovedskjerm** i lyst tema (default)
2. **Hovedskjerm** i mørkt tema (`.dark`-versjon)
3. **Mobil-versjon** (≤640px) — sidebar collapsed til bunnav
4. **Hover-states** vist som annotert variant
5. **Loading-state** som egen variant
6. **Empty-state** som egen variant
7. **Error-state** som egen variant

## Begrensninger og krav

- **IA er fast** — ikke endre informasjonsarkitektur fra wireframen. Hvis noe er uklart, spør heller enn å gjette.
- **Designsystem-tokens er hellige** — ikke introduser nye farger eller spacing-verdier.
- **Anti-AI-regler** (fra design-system-v2.md, del 1):
  - Ingen 3×1 uniform grid
  - Ingen flat avatar-row som primær-mønster
  - Ingen "Welcome back, [Name]!" — bruk italic editorial greeting
  - Asymmetri og hierarki

## Når du er ferdig

Lim **link til Claude Design-resultatet** tilbake til Claude Code. Jeg oppdaterer tracker.

---

## Eksempel — utfylt for CoachHQ Hub

(Se `design-batches/batch-1-dashboard/01-coachhq-hub.md` for et komplett utfylt eksempel når Fase 1 starter.)
