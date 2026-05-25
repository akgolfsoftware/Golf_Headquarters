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
- **Caddie** — AI-assistent for coach (intern)
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
- `akgolf.no/portal` (PlayerHQ)
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

## Brand-personlighet

| Egenskap | Beskrivelse |
|---|---|
| **Stemme** | Klok coach, ikke entusiastisk assistent |
| **Toneart** | Quiet confidence — sikker, ikke høyrøstet |
| **Estetikk** | Premium Scandinavian minimal |
| **Inspirasjon** | Kinfolk magazine + fin arkitektur (NOT Bleacher Report eller GolfDigest) |
| **Modus** | Editorial luxury, ikke sporty/loud |

**Beskriv aldri appen som:**
- "Den ultimate golf-appen"
- "Få bedre score nå!"
- "Revolusjonerer hvordan du spiller golf"

**Beskriv heller som:**
- "Plattformen for ambisiøse golfere"
- "Coaching som virker"
- "Din vei til neste nivå"

## Brand-prinsipper (5 grunnregler)

1. **Aldri overselg** — la data og resultater snakke
2. **Aldri støy** — hvit plass og typografi over animasjoner
3. **Aldri "amerikansk"** — vi er nordisk, ikke California
4. **Alltid coach-perspektiv** — det handler om utvikling, ikke spilling
5. **Alltid målbar** — vi viser konkret fremgang, ikke vibber

## Bruk i marketing

**Hero-typografi:**
- Inter Tight italic for navnet "AK Golf"
- Aldri all-caps "AK GOLF" som rene bokstaver

**Bildebruk:**
- Foto av grønn golf-bane i lavt lys (morgen/kveld)
- Aldri stock-foto av smilende business-folk
- Aldri "klassiske golf-prowidde" (gamle hvite menn på golf-bane)
- Helst nordiske baner (GFGK, Larvik, etc.)

## Brand-farger (overordnede)

Se [02-DESIGN-SYSTEM.md](./02-DESIGN-SYSTEM.md) for teknisk spec.

Hovedpalett:
- **Forest green:** `#005840` (primary) — selvsikkerhet, modenhet
- **Lime accent:** `#D1F843` (accent) — fremgang, energi
- **Warm cream:** `#FAFAF7` (background) — varme, ikke kald hvit
- **Dyp grønn-svart:** `#0A1F17` (foreground) — kontrast, men ikke ren svart
