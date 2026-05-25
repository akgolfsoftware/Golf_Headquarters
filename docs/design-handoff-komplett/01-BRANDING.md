# 01 — Branding

## Brand-navn
**AK Golf** (overordnet brand, paraply for selskapet AK Golf Group AS)

## Brand-hierarki

```
AK Golf Group AS (holding under Skarpnord Invest AS)
└── AK Golf HQ (paraply-konsept for hele plattformen)
    ├── PlayerHQ — spillerportal (akgolf.no/portal)
    ├── CoachHQ — coach-/admin-portal (akgolf.no/admin)
    └── Foreldreportal — for foresatte (akgolf.no/forelder)
```

## Tagline
**"Coaching, plan og fremgang i én app"**

## Sub-brander
- **Caddie** — AI-assistent for coach + spillerportal
- **Workbench** — det daglige dashbordet i begge portaler

## Logo

**Visuell beskrivelse:**
- Lime-gul + dyp forest-grønn
- Lucide-icon-style (rene linjer, ikke fotografisk)
- Brukes som favicon (32px) + app-icon (192px, 512px) + i sidebar (40px circle)

**Plassering i sidebar:**
- **Komponent:** `<SidebarBrand variant="..." role="..." />`
- **Variants:** `coach`, `player`, `forelder`
- **Rendering:** sentrert logo + tekst "PLAYERHQ · PRO" (eller "COACHHQ · HEAD COACH")
- **ALDRI** hardkode "AK GOLF"-tekst alene — det er forbudt regel

## Domener
- `akgolf.no` (hovedside, marketing)
- `akgolf.no/portal` (PlayerHQ — workbench-v2 er nå default)
- `akgolf.no/admin` (CoachHQ)
- `akgolf.no/forelder` (Foreldreportal)
- `booking.akgolf.no` (booking, kommer senere som subdomain)

## Sosiale medier
- Status: bygges når plattformen lanseres
- Plassholder-handles: `@akgolfhq`

## E-post-domener
- `velkommen@akgolf.no` (velkomst-e-poster)
- `post@akgolf.no` (generell)
- `support@akgolf.no` (kunde-service)
- `personvern@akgolf.no` (GDPR-henvendelser)

---

## ⚡ Brand-personlighet (oppdatert 2026-05-25)

**Retning:** Athletic Editorial — én hybrid som forener atletikk-app-energi med editorial-magasinkvalitet. Se [13-ATHLETIC-EDITORIAL.md](./13-ATHLETIC-EDITORIAL.md) for full visuell spec.

| Egenskap | Beskrivelse |
|---|---|
| **Stemme** | Klok coach, ikke entusiastisk assistent |
| **Toneart** | Quiet confidence — sikker, ikke høyrøstet |
| **Estetikk** | Athletic editorial (Strategy C: dark moments på lys base) |
| **Inspirasjon** | Zonixx + Whoop + Strava Pro × Kinfolk × Apple Fitness+ |
| **Fotografering** | Ekte AK Golf Academy-bilder (41 WebP-foto, ikke stock) |
| **Modus** | Premium — uten å være "luxury crypto" eller "loud sport" |

**Beskriv aldri appen som:**
- "Den ultimate golf-appen"
- "Få bedre score nå!"
- "Revolusjonerer hvordan du spiller golf"
- "Mer enn bare en app"

**Beskriv heller som:**
- "Plattformen for ambisiøse golfere"
- "Coaching som virker"
- "Din vei til neste nivå"
- "Hvor coachen og spilleren møtes"

---

## Brand-prinsipper (5 grunnregler)

1. **Aldri overselg** — la data og resultater snakke
2. **Aldri støy** — hvit plass og typografi over animasjoner
3. **Aldri "amerikansk"** — vi er nordisk, ikke California
4. **Alltid coach-perspektiv** — det handler om utvikling, ikke spilling
5. **Alltid målbar** — vi viser konkret fremgang, ikke vibber

---

## Visuelle pilarer (athletic editorial)

### 1. Lys cream-bakgrunn + utvalgte dark moments
- Default `bg-background` (#FAFAF7 cream)
- Selektivt — 1-2 dark moments per skjerm (`bg-foreground` med hvit tekst)
- Dark moments brukes for countdown, hovedhandling, eller dramatic-highlight

### 2. Real photography (AK Golf Academy)
- 41 WebP-foto i `/public/images/akgolf/AK-Golf-Academy-{1-44}.webp`
- Brukes med dark gradient overlay: `from-black/85 via-black/55 to-black/20`
- Bilde 1 = lavt-vinkel swing (best for PlayerHQ-hjem hero)
- Bilde 44 = drill-fokus (best for drill-bibliotek)

### 3. Inter Tight italic på hilsen
- Hero-tittel: "Hei, **Øyvind**." med fornavn i italic + lime accent
- 48-60px display på desktop
- Aldri all-caps "AK GOLF" som rene bokstaver

### 4. Display-tall (dramatic)
- Countdown: 80-120px tabular Inter Tight bold
- KPI-stats: 32px tabular i stat-tiles
- HCP / SG: 16-18px tabular inline

### 5. Editorial section dividers
- Lime accent-strek (`h-px w-8 bg-accent`) + eyebrow + display-tittel
- Mellom alle seksjoner — gir rolig rytme

---

## Bildebruk

**Bruk:**
- Ekte AK Golf Academy-foto (i `/public/images/akgolf/`)
- Foto av grønn golf-bane i lavt lys (morgen/kveld) — for marketing
- Helst nordiske baner (GFGK, Larvik, etc.)
- Ekte spillere når de gir samtykke

**Aldri:**
- Stock-foto av smilende business-folk
- "Klassiske golf-prowidde" (gamle hvite menn på golf-bane)
- AI-generert fotografi (foreløpig — vil vurderes når kvaliteten matcher AK-foto)

---

## Brand-farger (overordnede)

Se [02-DESIGN-SYSTEM.md](./02-DESIGN-SYSTEM.md) for teknisk spec.

Hovedpalett:
- **Forest green:** `#005840` (primary) — selvsikkerhet, modenhet
- **Lime accent:** `#D1F843` (accent) — fremgang, energi
- **Warm cream:** `#FAFAF7` (background) — varme, ikke kald hvit
- **Dyp grønn-svart:** `#0A1F17` (foreground) — kontrast + dark moments

---

## Pivot-historie

| Versjon | Retning | Status |
|---|---|---|
| v0 (pre-2026-05) | Generisk SaaS-dashboard | Forkastet — for kjedelig |
| v1 (mai 2026) | Editorial luxury (Kinfolk-inspirert) | Forkastet — for stiv |
| **v2 (2026-05-25)** | **Athletic editorial (Zonixx × Kinfolk × AK foto)** | **Live på akgolf.no/portal** |

v2 kom etter at Anders viste til Zonixx-referansebilder og AK Golf Academy-foto-biblioteket. Strategy C ("dark moments på lys base") ble valgt fordi den balanserer drama med rolig luksus.
