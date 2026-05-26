# Design-prompt 20 — `/admin/stats/moderering` — Coach modereringsside

> Les `00-master-brief.md`.

**Side:** `akgolf.no/admin/stats/moderering` — CoachHQ-intern
**Bruker:** Coach / Admin (kun ADMIN + COACH roles)
**Hovedoppdrag:** Holde norsk spillerbase rein. Effektiv arbeidsflyt for å godkjenne/avvise manuelle innlegg + spillerprofil-redigeringer.

---

## Datakilder

```typescript
const MODERERINGSKO = {
  // Manuelle turneringer fra spillere (sourceOrigin=MANUAL)
  ventendeTurneringer: Array<{
    id, navn, location, startDate, format, tour, tier,
    createdBy: { name, email },
    createdAt,
    flaggetAvAndre: number,         // hvor mange har flagget
    moeglingeDubletter: Array<{ id, name, similarity }>,
  }>,

  // Spillerprofil-endringer (foreslått av spiller selv eller andre)
  ventendeProfilEndringer: Array<{
    id, playerId, playerName,
    foreslattAv: { name, email },
    endringer: { felt, fra, til },[],
    grunn: string,
  }>,

  // Manuelle resultat-innlegg (fra spillere som la inn for andre)
  ventendeResultater: Array<{
    id, playerId, playerName, turneringNavn, dato,
    rounds, totalScore, position,
    innleggerNavn, innleggerEpost,
    flaggetAvAndre: number,
  }>,

  // Slett-forespørsler (GDPR)
  ventendeSlettForespørsler: Array<{
    id, playerId, playerName,
    forespurAv: string,
    grunn: string,
    mottatt: Date,
  }>,
};

// Stats om aktivitet
const STATS = {
  godkjentDenneUka: 23,
  avvistDenneUka: 4,
  ventende: 12,
};
```

---

## Designoppdrag

**Filosofi:** Intern CoachHQ — funksjonell før vakker. Tabular, tett, effektiv. Coach skal kunne handle alt i én økt på 15 min.

### 1. Hero — kompakt arbeidsmiljø

Liten hero — denne siden handler om handling, ikke marketing.

```
ADMIN · STATS

Moderering
                                      12 ventende
```

- Eyebrow lite
- Headline normal
- Sub: antall ventende-tall fremtredende

### 2. KPI-strip — arbeidsmengde

```
VENTENDE      DENNE UKA GJORT      GJENNOMSNITT-TID    FLAGG/UKE
12            27                   1.5 min             3
```

Liten mono-strip øverst som viser status.

### 3. Tab-bar — kategorier

```
[ Turneringer (4) ] [ Resultater (5) ] [ Profil-endringer (2) ] [ Slett-forespørsler (1) ]
```

Aktiv tab har lime accent.

### 4. KO-LISTE — tabular workflow

Hver tab viser samme tabular pattern. Eksempel for Turneringer:

```
┌──┬──────────────────────────────────────────────────────────────────┐
│☐ │ MANUELL TURNERING        DATO       SPILLER      FLAGG    HANDLING│
├──┼──────────────────────────────────────────────────────────────────┤
│☐ │ GFGK Klubbmesterskap      26. mai   Marius L.    0       [✓] [✗] │
│  │ junior · 1 dag · GFGK                                              │
│  │ Mulig dubletter (1):                                              │
│  │   • Gamle Fredrikstad Klubbmesterskap (Srixon)                    │
│  │   → [Merge] [Forskjellig]                                          │
├──┼──────────────────────────────────────────────────────────────────┤
│☐ │ Eclectic Tour 3           1. juni   Sofie N.     3       [✓] [✗] │
│  │ lokal · 1 dag · Oslo GK · ⚠ FLAGGET                               │
│  │ Mulige dubletter: ingen                                            │
└──┴──────────────────────────────────────────────────────────────────┘
```

Hver rad:
- Checkbox for batch-handlinger
- Hovedinfo (turneringsnavn, dato, kategori)
- Spiller som la inn (navn, klikkbar)
- Flagg-antall (rødt hvis 3+)
- Action-buttons: ✓ godkjenn, ✗ avvis

**Expanded view:**
- Klikk en rad → utvid med detaljer
- Vis mulige dubletter
- "Merge" eller "Forskjellig"-handling

### 5. BATCH-HANDLINGER

Når 1+ checkboxes er valgt, vis sticky bunn-bar:

```
3 valgt  |  [✓ Godkjenn alle] [✗ Avvis alle] [Merge alle med (velg)]
```

### 6. EKSEMPEL — RESULTAT-tab

Skiller seg fra turneringer:

```
┌──┬────────────────────────────────────────────────────────────┐
│☐ │ SPILLER          TURNERING       SCORE       INNLEGGER     │
├──┼────────────────────────────────────────────────────────────┤
│☐ │ Anders H.        OT Øst 7        R1 72, R2 75   Far A. K.  │
│  │ 18 år · Oslo GK  (lokal)         T-12           ⚠ ny e-post │
│  │                                                              │
│  │ → [Godkjenn] [Avvis] [Sjekk OLYO-data direkte]              │
└──┴────────────────────────────────────────────────────────────┘
```

### 7. EKSEMPEL — PROFIL-ENDRINGER-tab

```
┌──┬───────────────────────────────────────────────────────────┐
│☐ │ SPILLER          ENDRING                  FORESLÅTT AV    │
├──┼───────────────────────────────────────────────────────────┤
│☐ │ Anders Halvorsen klubb: Oslo GK → Bærum GK   Spiller selv │
│  │                  Grunn: "Skiftet i jan 2026"               │
│  │                                                             │
│  │ → [Godkjenn] [Avvis] [Be om bevis]                        │
└──┴───────────────────────────────────────────────────────────┘
```

### 8. SLETT-FORESPØRSLER (GDPR)

Mer fremtredende behandling — krever ekstra forsiktighet:

```
GDPR · SLETT-FORESPØRSEL

Spiller:   Maria Olsen (slug: maria-olsen-2008)
Forespurd: Hege Olsen <hege@email.no> (mor)
Mottatt:   23. mai 2026
Grunn:     "Datteren min vil ikke være offentlig synlig"

KONSEKVENS:
• Sletter PublicPlayer + 47 PublicPlayerEntry-rader
• Markerer 47 turneringer som "anonym deltaker"
• Sender bekreftelse til hege@email.no

         [ Bekreft sletting ] [ Avvis med begrunnelse ]
```

### 9. HISTORIKK-tab

Etter de aktive køene, en "historikk"-tab:

```
SISTE HANDLINGER

24. mai 14:35    Godkjent: Anders K.    GFGK Klubbmesterskap
24. mai 14:32    Avvist:   Anders K.    "Eclectic Tour 3" (spam)
23. mai 11:20    Merget:   Anders K.    "Oslo GK Mesterskap" → "OGK Mesterskap"
...
```

Filter på dato + handler + type.

### 10. NOTIFIKASJONER

Inline alerts øverst hvis det er noe akutt:

```
⚠ 3 nye slett-forespørsler siden i går
⚠ "Eclectic Tour 3" har 5 flagg — bør behandles
```

### 11. SØKEHJELP

For hver moderasjonshandling, "Search elsewhere"-link:
- "Sjekk OLYO sin offisielle kalender →" (åpner i ny tab)
- "Sjekk om turneringen finnes i Srixon-katalogen →"
- "Søk navn i NGF-database →"

Spar coach tid.

---

## Mobile-tilpasning

Denne siden er primært for desktop. Mobile får simplified view:
- Hver rad blir et kort
- Action-buttons stables
- Batch-handlinger skjules på mobile (bytte til en-om-gangen)

## Mikrointeraksjoner

- Godkjenn-knapp: instant lime fill + rad fader ut
- Avvis: rad blir lyserød + fader ut
- Sticky batch-bar: skyves inn fra bunn når checkbox er valgt
- Notifikasjoner i topp: subtil pulse hvis ulest

---

## Inspirasjon

1. **Linear inbox** — tabular ko med batch-handlinger
2. **GitHub PR review queue** — clear actions per rad
3. **Stripe Radar / fraud queue** — moderasjons-arbeidsflyt med rikt kontekst

## Output

- Komplett page-sketch
- Ko-rad i 3 varianter (turnering / resultat / profil-endring)
- Expanded-view-modus
- GDPR-slett-modal (kritisk handling)
- Batch-bar
- Mobile-flow

---

## Implementasjon-notater

- Krever `requirePortalUser({ allow: ["ADMIN", "COACH"] })`
- Server-rendered med revalidatePath etter hver handling
- E-postvarsel ved sletting (Resend-integrasjon)
- Audit-logg: hver handling logges i `AuditLog`-tabell (vi har det)
