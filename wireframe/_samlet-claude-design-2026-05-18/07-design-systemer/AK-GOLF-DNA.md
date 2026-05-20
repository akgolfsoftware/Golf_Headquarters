# AK Golf HQ — Master Design DNA

> **Hva dette er:** Den eneste sannheten for hvordan AK Golf HQ skal designes.
> Brukes som referanse for alle Claude Code/Design-sesjoner som rører UI.
> Sist oppdatert: 2026-05-17

---

## 1. Brand-essens

**AK Golf HQ er** Bloomberg Terminal møter The New York Times for golf-coaching.

- **Premium uten å være pretensiøst** — datatetthet med ro
- **Editorial luksus** — Inter Tight italic gir signature-følelse
- **Norsk presisjon** — bokmål, æøå, ingen amerikanismer
- **Verktøy for proff bruk** — ikke "fun"-app, ikke gamification-overload
- **Anti-AI-slop** — bevisste design-valg, ingen generisk shadcn-standard

**Tone-eksempler:**
- ✅ "Du har 3 økter i dag, neste 09:30 m/ Markus."
- ❌ "Hei der!! 🎉 La oss krushe dagens trening!"

---

## 2. Faste tokens (ALDRI overstyre)

Fra `src/app/globals.css`:

| Token | Lyst | Mørkt | Bruk |
|---|---|---|---|
| `--background` | `#FAFAF7` (off-white) | `#0F2A22` (forest-deep) | Sider-bakgrunn |
| `--foreground` | `#0A1F17` | `#F5F4EE` | Primær tekst |
| `--card` | `#FFFFFF` | `#163027` | Kort-bakgrunn |
| `--primary` | `#005840` (forest) | `#D1F843` (lime) | CTA |
| `--accent` | `#D1F843` (lime) | `#D1F843` | Highlights |
| `--border` | `#E5E3DD` | `#2B4F42` | Linjer |

**Radius:** 16px (`--radius: 1rem`)
**Spacing:** 8pt grid (8, 16, 24, 32, 40, 48, 64) — aldri 5/7/9px

---

## 3. Typografi-hierarki

| Bruk | Font | Vekt | Stil | Eksempel |
|---|---|---|---|---|
| Hero h1 | Inter Tight | 400 | italic | "Anders" (på Hub) |
| Display | Inter Tight | 400 | italic | "Krysstabuler all aktivitet" |
| Section | Inter | 600 | regular | "Dagens første prioritet" |
| Body | Inter | 400 | regular | Standard tekst |
| Eyebrow | JetBrains Mono | 500 | uppercase, tracking 0.1em | "CoachHQ · Hub" |
| Tall | JetBrains Mono | 600 | tabular-nums | KPI-verdier |

Responsive: hero h1 skalerer `text-[28px] sm:text-[40px] md:text-[56px]` (aldri konstant 64px på mobil).

---

## 4. Skill-matrise (hvilken skill per skjerm-gruppe)

Hver skjerm i hele plattformen tilhører én av disse gruppene. Bruk angitt skill + brand-DNA — ikke noe annet.

| Gruppe | Skjermer | Skill | Brand-DNA | Eksempel-ruter |
|---|---|---|---|---|
| **A — CoachHQ Hub** | 3 | `dashboard` + `bento` | `airtable` | `/admin/agencyos`, `/admin/brief` |
| **B — CoachHQ Spillere** | 4 | `dashboard` | `linear.app` | `/admin/spillere`, `/admin/elever/[id]`, `/admin/talent` |
| **C — CoachHQ Kalender** | 4 | `dashboard` | `linear.app` | `/admin/calendar`, `/admin/kalender` (S8-10) |
| **D — CoachHQ Plans + Analyse** | 8 | `dashboard` + `editorial` | `airtable` + `notion` | `/admin/plans/*`, `/admin/analyse` |
| **E — CoachHQ Tjenester** | 5 | `corporate` | `cal` | `/admin/services`, `/admin/anlegg`, `/admin/facilities/[id]` |
| **F — CoachHQ Settings** | 6 | `clean` + `minimal` | `linear.app` | `/admin/settings/*`, `/admin/profile` |
| **G — PlayerHQ Hjem + Mål** | 6 | `bento` | `linear.app` | `/portal`, `/portal/mal/*` |
| **H — PlayerHQ Trening** | 6 | `bento` + `dashboard` | `linear.app` | `/portal/tren/*` |
| **I — PlayerHQ Coach** | 5 | `clean` | `linear.app` | `/portal/coach/*` |
| **J — PlayerHQ Profil** | 10 | `clean` + `minimal` | `apple` | `/portal/meg/*`, `/portal/varsler` |
| **K — PlayerHQ Live** | 1 | `bold` + `cosmic` | `claude` | `/portal/(fullscreen)/live/[sessionId]` |
| **L — Foreldreportal** | 7 | `clean` | `airbnb` | `/forelder/*` |
| **M — Marketing + Auth** | 11 | `contemporary` + `bold` | `apple` + `cal` | `/`, `/booking`, `/auth/*` |

**Total: 13 grupper, 76 produksjons-skjermer.**

---

## 5. Brand-DNA-mapping — hvorfor disse?

### `linear.app` for det meste av PlayerHQ + CoachHQ-lister
- Rolig, fokusert, profesjonelt
- Tabulær densitet uten å føles travel
- Sjekk `docs/design-resources/brand-references/linear.app/DESIGN.md`

### `airtable` for CoachHQ Hub + datatabeller
- Datatetthet + kolor-koding + status-piller
- Bra for tjenester, bookinger, økonomi
- Sjekk `docs/design-resources/brand-references/airtable/DESIGN.md`

### `apple` for marketing + spiller-profil
- Premium-luksus, hvit luft, editorial typography
- Bygger tillit hos foreldre og betalende kunder
- Sjekk `docs/design-resources/brand-references/apple/DESIGN.md`

### `cal` for booking-flow
- Konvertering-optimalisert, kalender-fokus
- Velbeprøvd for å redusere abandonment
- Sjekk `docs/design-resources/brand-references/cal/DESIGN.md`

### `notion` for analyse + plans
- Fleksibel layout, dokument-aktig
- Bra for langformat-analyse + AI-output
- Sjekk `docs/design-resources/brand-references/notion/DESIGN.md`

### `claude` for live-økt
- Mørk, intens, fokusert
- Sjekk `docs/design-resources/brand-references/claude/DESIGN.md`

---

## 6. Komponent-mønstre (gjenbrukes overalt)

| Komponent | Fil | Bruk overalt |
|---|---|---|
| `PageHeader` | `src/components/shared/page-header.tsx` | Topp på hver side: eyebrow + titleLead + titleItalic + sub |
| `EmptyState` | `src/components/shared/empty-state.tsx` | Når liste er tom |
| `KpiCard` (inline) | — | Stat-kort med tall, label, delta-pil |
| `PyramideBar` | `src/components/shared/calendar/PyramideBar.tsx` | 5-segments pyramide-fordeling |
| `SessionCard` | `src/components/shared/calendar/SessionCard.tsx` | Økt-blokk i kalender |

**Når du oppretter ny komponent:** se om en eksisterende kan utvides først.

---

## 7. Iterasjons-flyt (samme mønster for hver skjerm-gruppe)

```
STEG 1 (i Claude Code): Audit
  └─ Bruk Explore-agent: "Audit nåværende /admin/spillere — hvilke komponenter, hvor er hex-farger, hva mangler responsiv?"

STEG 2 (i Claude Design eller Claude Code): Design
  └─ Prompt-mal:
     "Bruk skill `dashboard` fra .claude/skills/design-vendor/dashboard/
      og brand-DNA fra docs/design-resources/brand-references/linear.app/DESIGN.md.
      
      Følg AK-GOLF-DNA.md (typografi, tokens, spacing).
      
      Redesign Gruppe B (CoachHQ Spillere) — 4 skjermer:
      [list rutene]
      
      Lever HTML-mockup i wireframe/design-files-v3/B-coachhq-spillere/
      én fil per skjerm. Lim inn alle felt fra Prisma User-modellen som
      er relevant."

STEG 3 (i Claude Code): Implementer
  └─ "Implementer wireframe/design-files-v3/B-coachhq-spillere/*.html
      som Next.js Server Components. Følg eksisterende mønster i
      src/app/admin/spillere/. Dispatch 4 parallelle subagenter
      (én per skjerm)."

STEG 4 (i Claude Code): Verifiser
  └─ Type-check, build, deploy, manuell sjekk på prod.
```

**Estimert per gruppe:** 1-2 timer aktiv tid + 30 min review.

---

## 8. Konsistens-regler (skal aldri brytes)

1. **Aldri hex-farger i kode** — kun semantiske tokens (`bg-card`, `text-primary`)
2. **Aldri emojier i UI** — bruk Lucide-ikoner
3. **Aldri amerikansk dato** — norsk format (`13.05.26` eller `13. mai`)
4. **Aldri norske tegn ASCII-fallback** — alltid æ/ø/å
5. **Aldri mer enn 3 fonter** — Inter, Inter Tight, JetBrains Mono
6. **Aldri konstant font-size på hero** — alltid responsive (`sm:` + `md:`)
7. **Aldri shadcn-default uten polish** — bruk eksisterende komponent-mønstre
8. **Aldri ny ikoner-pakke** — kun Lucide React

---

## 9. Anbefalt rekkefølge for fullstendig redesign

| Sprint | Grupper | Estimat | Hvorfor først |
|---|---|---|---|
| 1 | A (Hub), G (PlayerHQ Hjem) | 4 t | Brukernes første kontakt |
| 2 | B (Spillere), C (Kalender) | 4 t | Mest brukte daglig |
| 3 | D (Plans + Analyse) | 4 t | Anders' hovedverktøy |
| 4 | H (Trening), I (Coach), K (Live) | 4 t | Spillerens hovedflyt |
| 5 | E (Tjenester), F (Settings), J (Profil) | 4 t | Konfigurasjon |
| 6 | L (Forelder), M (Marketing+Auth) | 4 t | Foreldre + konvertering |

**Total: ~24 timer Claude Design + Claude Code spredt over 2-3 uker.**

Kan parallelliseres med 2-3 sesjoner samtidig → 1 uke veggtid.

---

## 10. Referanse-filer (alltid lim inn øverst i Claude-prompter)

```
@docs/design-resources/AK-GOLF-DNA.md
@src/app/globals.css
@docs/design-resources/brand-references/[brand]/DESIGN.md
@.claude/skills/design-vendor/[skill]/SKILL.md
```

Med disse 4 filene som kontekst får du konsistente resultater hver gang.
