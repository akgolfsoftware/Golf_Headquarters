---
name: ak-golf-hq-design
description: Use this skill to generate well-branded interfaces and assets for AK Golf HQ — the golf-coaching platform for AK Golf Group (PlayerHQ /portal, AgencyOS /admin, Marketing akgolf.no, Booking). Editorial sport-analytics aesthetic — forest #005840 + lime #D1F843 + cream #FAFAF7, Inter / Inter Tight / JetBrains Mono, norsk bokmål. Contains locked design tokens (layered primitives→semantic), brand assets, typography, flow-efficiency rules, a quality bar, the 83-component catalogue and the screen spec-model. Use for prototyping and production.
user-invocable: true
---

# AK Golf HQ — Design Skill

Ett designsystem, fire produkter. **Låst.** Aldri finn opp nye fonter, hex-verdier eller spacing-trinn utenfor det som er definert her.

*DataGolf møter The Athletic, hvis de møttes på Linear.*

## Les i denne rekkefølgen

1. **`SKILL.md`** (her) — låste beslutninger, produkter, token-metode, bruk, kvalitetsbar, harde regler.
2. **`README.md`** — de visuelle fundamentene (palett-rytme, typografi, knapper, ikoner, bevegelse, imagery). Master-referansen — les den før du bygger.
3. **`colors_and_type.css`** — de låste tokens som CSS-variabler, lagdelt (primitiver → semantikk → bruk). Importer i enhver HTML-prototype.
4. **`flyt-og-kvalitet.md`** — flyt-effektivitet (8 regler), strukturelle mønstre (sjekkliste), kvalitetsbar + AI-slop-test.
5. **Følge-artefakter** (sannhet ved siden av skillen — se egen seksjon).

## De fire produktene

| Produkt | Rute | Tema | Tone | Tetthet |
|---|---|---|---|---|
| **Marketing** | `akgolf.no` | Lyst | Editorial, foto-ledet | Romslig |
| **Booking** | `/booking` + `/portal/booking` | Lyst | Funksjonell, fokusert | Kompakt |
| **PlayerHQ** | `/portal` | **Alltid lyst** | Personlig, mobil-først | Tett |
| **AgencyOS** | `/admin` | **Alltid mørkt** (`.dark`) | Bloomberg / Linear | Maksimalt tett |

Stack: Next.js 16 · Tailwind v4 (CSS-first via `@theme`) · shadcn/ui · Inter + Inter Tight + JetBrains Mono.

## Låste beslutninger (juni 2026 — gjelder til Anders endrer dem)

- **App-navn:** coach-appen heter **AgencyOS** (`/admin`). «CoachHQ» er gammelt — bruk aldri i ny UI-tekst.
- **Tema per produkt:** PlayerHQ alltid **lyst**, AgencyOS alltid **mørkt**. **Ingen tema-toggle.**
- **Navne-kanon (demo):** spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen**. Alltid fulle navn. (Ekte coach «Markus Røinås Pedersen» på markedssidene — ikke bytt han ut.)
- **Abonnement:** PlayerHQ-tilgang er **gratis eller 300 kr/mnd** — **ingen tier-nivåer**. «Performance / Performance Pro» er **coaching-pakker** (antall økter), IKKE app-nivåer. **ELITE finnes ikke** (dødt enum — vis aldri i UI).
- **Planlegging bor i Workbench** — ett trykkpunkt dit, ikke en meny av kort. Samme i coachens spiller-Workbench.
- **Analyse samlet:** Analysere + TrackMan + Runder + SG er **én flate med faner**.

## Token-arkitektur (lagdelt — allerede i `colors_and_type.css`)

Tre lag, samme robuste metode som modne designsystemer bruker:

1. **Primitiver** — rå skala: `--forest-500`, `--lime-500`, `--cream-50` … **Bruk aldri direkte i komponenter.**
2. **Semantiske aliaser** — `--primary`, `--accent`, `--background`, `--border` … definert to ganger (lyst + `.dark`). Det er disse komponenter bygger mot.
3. **Bruk** — Tailwind-utilities (`bg-primary`, `text-foreground`) eller `var(--primary)`. I koden speiler `src/app/globals.css` nøyaktig disse.

Trenger du en farge som ikke finnes: legg den inn som token først, og spør Anders. Aldri hardkod hex i en komponent.

## Slik bruker du skillen

**Throwaway visuelt artefakt** (mockup, utforsknings-HTML, slide):
- Importer `colors_and_type.css` øverst. Bruk semantiske tokens — aldri ny hex.
- Kopier logoer fra `assets/` ved behov. Norsk bokmål-copy; engelsk for golf-sjargong (Strokes Gained, Tour).

**Produksjonskode i monorepoet:**
- `src/components/athletic/` er sannhet — **gjenbruk**. `globals.css` speiler disse tokens.
- Lucide-react eneste ikon-bibliotek (1.5px stroke, ingen emoji). 8pt-grid (`p-3/p-5/p-7` forbudt).
- Editorial italic via `<em className="font-normal italic text-primary">` i Inter Tight-overskrifter. Aldri serif.

**Designe / planlegge en skjerm:**
- Slå opp skjermen i **skjerm-spec-modellen** (`docs/skjermplan/`) for tilstander, modaler og handlinger.
- Bygg fra **komponent-katalogen** (de 83 athletic-komponentene) — ikke nye byggeklosser uten grunn.

## Følge-artefakter (sannhet ved siden av skillen)

| Artefakt | Hvor | Hva |
|---|---|---|
| **Komponent-galleri** (83) | Kode: `src/components/athletic/` · Drive: `software/akgolf-hq/komponenter-2026-06-15/index.html` | Hver byggekloss, tro gjengitt |
| **Skjerm-spec-modell** | Repo: `docs/skjermplan/` · Drive: `software/akgolf-hq/skjermplan-2026-06-15/` | Hver skjerm + tilstander/modaler/handlinger |
| **Brand guide** (visuell) | Drive: `software/akgolf-hq/akgolf-hq-designsystem-2026-06-15.html` | Farger/fonter/spacing å se |
| **Tokens i kode** | `src/app/globals.css` | Speiler `colors_and_type.css` |

## Kvalitetsbar (ekstern smak, AK-tilpasset)

- **AI-slop-testen:** hvis noen kan se grensesnittet og si «AI laget dette» uten tvil — stryk og bygg om. MEN: AK sine **låste signaturer** (mono-eyebrow, lime venstrekant på event-kort, cream-bg + hvite kort, editorial Inter Tight-italic) er **bevisst merkevarestemme** — de er *svaret* på «ikke vær generisk», ikke brudd på det. Der generelle smaks-regler (f.eks. impeccable) forbyr disse på tvers — **AK-kanon vinner**, fordi de er en forpliktet, navngitt brand-stemme.
- **Kontrast:** brødtekst ≥ 4,5:1. Aldri lysegrå «for eleganse».
- **Bevegelse:** ease-out, 150–250 ms, `prefers-reduced-motion` alltid gated. Ingen bounce/elastic.
- **Lever én løsning, produksjonsklar.** Ikke to varianter, ikke prototype.
- Mer i `flyt-og-kvalitet.md`.

## Harde regler — aldri bryt

1. Ingen nye fonter. Inter / Inter Tight / JetBrains Mono. Punktum.
2. Ingen nye hex-verdier. Kun semantiske tokens eller navngitte primitiver.
3. Ingen emoji i UI. Bruk Lucide.
4. Ingen to varianter av samme ting. Lever én løsning, lås.
5. Ingen serif-italic. Inter Tight italic er signaturen.
6. Ingen `p-3`/`p-5`/`p-7`/`p-9`. 8pt-grid only.
7. Ingen store flate lime-flater. Lime er aksent (aktiv/valgt/NÅ), ikke kanvas.
8. PlayerHQ alltid lyst, AgencyOS alltid mørkt. Ingen tier-nivåer i UI. ELITE vises aldri.

## Når forespørselen er vag — spør

1. Hvilket produkt (Marketing / Booking / PlayerHQ / AgencyOS)?
2. Mobil eller desktop først?
3. Ekte data eller demo-data?
