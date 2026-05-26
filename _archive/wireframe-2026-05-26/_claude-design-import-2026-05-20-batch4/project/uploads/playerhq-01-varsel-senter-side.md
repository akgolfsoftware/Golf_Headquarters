# PlayerHQ — Varselsenter (full side)

**Rute:** `/varsler` i PlayerHQ.

## Kontekst
Spiller (Markus Røinås Pedersen, hcp 4.2) trykker på bjelle-ikonet i header eller "Se alle"-link fra varsel-dropdown. Lander på en full side som samler ALLE varsler — kategorisert og filtrerbart.

## Formål
- Gi spilleren full oversikt over alle hendelser
- Tillate filtrering, søk, masseaksjon (marker lest, slett)
- Vise gamle varsler i tidslinjeform (gruppert per dag/uke)

## Layout

**Header (sticky øverst):**
- Tittel "Varsler" (Inter Tight 700, 32px)
- Sekundær linje "12 uleste · 84 totalt" (JetBrains Mono 13px, muted)
- Høyre side: knapper "Marker alle som lest", "Innstillinger" (filled forest + outline)

**Filter-bar (under header):**
- Pill-knapper: Alle (default aktiv, lime bg), Coach (3), Bookinger (2), AI (1), Betaling, System
- Søkefelt høyre med Lucide Search-ikon

**Innhold — gruppert tidslinje:**

```
I dag · torsdag 20. mai
├── 09:14  [Coach]    Anders sendte ny økt for tirsdag
├── 08:30  [AI]       AI-Caddie foreslår ny drill (chipping)
└── 07:45  [System]   Onboarding-flyt fullført

I går · onsdag 19. mai
├── 18:22  [Booking]  Time på Performance Studio bekreftet
├── 14:05  [Coach]    Anders svarte på spørsmål om jernspill
└── ...

Denne uka
└── Mandag 17. mai — 4 hendelser (sammenslått)

Tidligere
└── Forrige uke — 11 hendelser
```

Hver varsel-rad:
- Tidstempel (mono, muted)
- Kategori-badge (lime/forest border, små capslocks)
- Tittel (Inter 500)
- Underlinje (muted, 13px)
- Avatar/ikon-thumb venstre (40px)
- Høyre: Lucide MoreHorizontal for kontekstmeny

## Interaksjon
- Klikk rad: åpner detalj-drawer (varsel-detalj-drawer)
- Hover: subtle bg `#F8F6EF`
- Uleste har lime-prikk venstre kant
- Sveip høyre på mobil: marker lest
- Sveip venstre: slett

## Tomtilstand
"Ingen varsler her. Du er à jour." + tegning av en kalm forest-tone illustrasjon (linjer).

## Branding
Cream bg, forest tekst, lime accent for uleste prikker. JetBrains Mono for tidstempel.
