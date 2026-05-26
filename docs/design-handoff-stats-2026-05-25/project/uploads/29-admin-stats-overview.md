# Design-prompt 29 — `/admin/stats/overview` — Admin-dashboard

> Les `00-master-brief.md`.

**Side:** `akgolf.no/admin/stats/overview` — CoachHQ-intern
**Bruker:** Anders + andre ADMIN/COACH som vil se hvordan Stats-produktet ytrer
**Hovedoppdrag:** Få en oversikt på 30 sekunder over produktets helse + konvertering.

---

## Datakilder

```typescript
const STATS_ADMIN = {
  // Plausible-data (besøk, trafikk)
  besokSiste30Dager: number,
  topp10Sider: Array<{ url, besok, snittLesetid }>,
  trafikkkilder: { google, direkte, sosial, referer },
  konverteringTilSignup: number,         // % som registrerer konto
  konverteringTilPlayerHQ: number,       // % som blir abonnent

  // Database-status
  syncStatus: {
    datagolf: { sistKjort, status, antallSpillere },
    pgaPutt: { sistKjort, status },
    pgaApproach: { sistKjort, status },
    norskeTurneringer: { sistKjort, antallTurneringer },
  },

  // Bruker-aktivitet
  totalBrukere: number,
  brukereSomHarLagtInnSg: number,
  totalSgInputs: number,
  totalSammenligninger: number,

  // Moderering
  ventendeManuelleTurneringer: number,
  ventendeProfilEndringer: number,
  ventendeSlettForespørsler: number,

  // Health
  feilSisteUka: Array<{ tidspunkt, agent, melding }>,
};
```

---

## Designoppdrag

**Filosofi:** Pragmatisk admin-dashboard. Mono-tall, dense tabeller, lite "design"-pynt. Funksjonell før vakker.

### 1. Topp-bar — kompakt

```
ADMIN · STATS                                  Sist oppdatert: 13:42
```

### 2. KPI-grid — overordnet helse

4-rad grid:

```
BESØK SISTE 30D       SIGNUPS               PLAYERHQ-CONV        REVENUE
4 287                 87                    8 (9.2%)             2 400 kr
↑ 12%                 ↑ 23%                 ↑ 3%                 ↑ 18%
```

Hver KPI:
- Mono tall stort
- Endring fra forrige periode (% + lime/red arrow)
- Subtekst med kontekst

### 3. TRAFIKK-fordeling — donut

Mini donut-chart:

```
TRAFIKKILDER (30 dager)

Google search    62%
Direkte          21%
Sosial           11%
Referer           6%
```

### 4. TOP-10 sider — tabell

```
SIDE                                BESØK      SNITT TID    KONV.
/stats/pga/drive-distance           823        2:34         12%
/stats/sg-sammenlign                567        3:12         42%
/turneringer                        489        1:18         3%
/stats/spillere                     287        4:01         18%
...
```

Klikkbart per side.

### 5. SYNC-status — health-strøk

```
SYNC-STATUS

DataGolf skill-ratings       ✅ Mandag 06:00     1 299 spillere
PGA putt-distance            ✅ Mandag 07:00     10 bøtter
PGA approach                 ✅ Mandag 07:30     8 bøtter
Norske turneringer           ⚠️ Manuell          Sist 25. mai
Plausible-import             ❌ Feilet 06:32
                                                 [ Se logg → ]
```

### 6. BRUKER-aktivitet

```
TOTAL BRUKERE              SG-INPUTS REGISTRERT      SAMMENLIGNINGER
247                        89                        152

Aktive siste 7 dager       Nye konti siste 7 dager   Mest brukte ref
142                        12                        Rory McIlroy (32x)
```

### 7. MODERERING-status

```
MODERERINGSKO

Ventende manuelle turneringer:     4
Ventende profil-endringer:         2
Slett-forespørsler:                1 (haster — 3 dager gammel)

         [ Til moderering-side → ]
```

### 8. FEIL-logg

```
SISTE FEIL

13:42  pga-approach        ⚠️  Timeout fra DataGolf API
11:20  notion-sync         ⚠️  Rate limit hit
07:30  plausible-import    ❌  HTTP 500
                                                     [ Full logg → ]
```

### 9. RASKE HANDLINGER

Sidebar eller bunn-strip med hurtigvalg:

- "Kjør manuell sync av PGA-data"
- "Send ukentlig roundup nå"
- "Sjekk DB-helse"
- "Roter CRON_SECRET"

Med ett klikk hver, sender server-action eller åpner modal.

### 10. SISTE ENDRINGER

```
SISTE 5 GIT COMMITS

13:42 · feat(stats): markér alle PGA som LIVE
13:01 · feat(stats): NCAA + WAGR import
12:45 · feat(stats): PGA Tour playground (Fase 2 — første halvdel)
...

         [ Se full git-historikk → ]
```

---

## Mobile-tilpasning
- KPI-grid: 2x2
- Tabeller: 3-4 kolonner
- Detaljerte logger: stables

## Mikrointeraksjoner
- KPI-tall: subtle pulse hvis det er økning
- Sync-rad: hover viser full logg-melding
- "Kjør sync"-knapp: spinner + redirect til logg-side

## Inspirasjon
- vercel.com/dashboard (analytics-fokus)
- supabase.com/dashboard
- linear.app/admin (intern-feel)

## Output
- Komplett admin-page-sketch
- KPI-grid med arrow-endringer
- Sync-status-pattern
- Raske handlinger-strip
- Mobile-flow

## Implementasjon-notater
- Krever `requirePortalUser({ allow: ["ADMIN"] })`
- Plausible-data fetched via deres API
- Server-rendered med revalidate 300 (5 min)
- Live-update på sync-status via WebSocket eller polling

---

## Andre admin-sider å vurdere (kort)

Stretch hvis vi vil utvide:

| URL | Innhold |
|---|---|
| `/admin/stats/cron-status` | Detaljert per-cron-job status |
| `/admin/stats/users` | Tabell over alle Stats-brukere |
| `/admin/stats/finance` | Konvertering Stats → PlayerHQ abonnement |
| `/admin/stats/seo` | SEO-status per side |
