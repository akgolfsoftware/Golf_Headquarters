# Claude Design-prompter: UTFORDRINGER & SOSIAL (5 skjermer)

> Lim inn felles designspec fra `00-shared-spec.md` øverst i HVER prompt.
> Hver prompt nedenfor er én skjerm — bestill HTML-fil med inline CSS, 1440px viewport.
> Disse skjermene er for **PlayerHQ** — sosiale / gamification-features.
> Bruker: Markus R., 16 år, A1, HCP 4.2.

---

## PlayerHQ-shell (gjelder alle 5 skjermer)

- **Tema:** Lyst (`--background: #FAFAF7`).
- **Sidebar:** Mørk 240px, `bg: #061210`, lime accent på aktiv modul.
- **Sidebar-moduler:** Hjem · Tren · Mål · Statistikk · Utfordringer · Profil · Varsler.
- **Topbar:** 64px, hvit, søk + varsel-bjelle (med rød count-prikk) + Markus' avatar.
- **PageHeader:** eyebrow → tittel (Inter Tight 36px med 1 italic Instrument Serif) → sub.
- **Aldri "Velkommen tilbake".**

---

## Prompt 10.1 — Utfordringer-oversikt

```
Du er senior UI/UX-designer for AK Golf HQ. Design UTFORDRINGER-OVERSIKT for PlayerHQ — listevisning av aktive utfordringer.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Utfordringer-oversikt
URL: /portal/utfordringer
Bruker: Markus R.

### Layout
- PlayerHQ-sidebar 240px. "Utfordringer" aktiv (lime accent).
- Topbar 64px.
- Innhold padding 32px.

### PageHeader
- Eyebrow: "PLAYERHQ · UTFORDRINGER · 3 AKTIVE".
- Tittel: "Hvem *slår deg* denne uken?"
- Sub: "3 aktive · 2 invitasjoner · 7 fullført denne sesongen."

### Sub-nav (tabs)
Aktive (3) · Invitasjoner (2) · Tidligere (7) · Lag en utfordring. "Aktive" aktiv.

### Filter-rad
- Type-chips: Alle · Peer-2-peer · Klubb · Akademi · Open. "Alle" aktiv.
- Sortering: "Slutter snart ▾".
- CTA høyre: "+ Ny utfordring" (primary).

### Aktive utfordringer (3 kort, full bredde, vertikal stack)

**1. Putt-konsistens 7 dager**
- Bakgrunn: var(--card), ramme, padding 24px, radius 16px.
- Topp-rad:
  - Type-pill: "PEER-2-PEER" (mono 11px uppercase).
  - Pyramide-pill: SLAG.
  - Status-pill: ◉ AKTIV · 3 DAGER IGJEN (lime).
- Tittel: "Putt-konsistens 7 dager" (Inter Tight 22px).
- Sub: "Henrik N. utfordret deg 7. mai. Flest 3-fot putter inn av 50 på 7 dager vinner."
- Stats-rad (3 kolonner):
  - Din score: 38/50 (mono 28px).
  - Henriks score: 42/50 (mono 28px, gul varselfarge).
  - Tid igjen: 3d 14t (mono).
- Mini-leaderboard:
  ```
  #1  Henrik N.    42/50   ▲
  #2  Markus R.    38/50   (du)
  ```
- CTA-rad: "Logg neste runde" (primary) · "Se detaljer →" (ghost).

**2. Streak-konkurranse mai**
- Type-pill: "KLUBB · GFGK" .
- Pyramide-pill: FYS.
- Status-pill: ◉ AKTIV · 18 DAGER IGJEN.
- Tittel: "Lengste FYS-streak i mai".
- Sub: "Klubbutfordring · 14 deltakere · 1500 kr trening-gavekort til vinneren."
- Stats:
  - Din streak: 12 dager (mono).
  - Lengste i klubben: 16 (Sofie K.).
  - Plassering: #3 av 14.
- CTA: "Logg dagens FYS" (primary).

**3. Driver gate-test mai**
- Type-pill: "AKADEMI · ÅPEN".
- Pyramide-pill: TEK.
- Status-pill: ◉ AKTIV · 11 DAGER IGJEN.
- Tittel: "Best Driver gate-score mai".
- Sub: "47 deltakere · beste enkelt-test teller · vinnerprov 3× 1t Trackman-tid."
- Stats:
  - Din beste: 9/10 (mono).
  - Best i akademi: 10/10 (Sofie K.).
  - Plassering: #4 av 47.
- CTA: "Logg ny test" · "Se leaderboard".

### Caddie-banner (nederst)
- Lyst kort, eyebrow "CADDIE":
- "Du leder ikke noen av tre utfordringer. Henrik har vunnet 4 av 5 putt-utfordringer mot deg. Vurder 10 min putting hver dag denne uka."

### Editorial moment
"*slår deg*" italic.

Lever én HTML-fil. Realistisk dummy-data. Ingen emoji.
```

---

## Prompt 10.2 — Utfordring-detalj

```
Du er senior UI/UX-designer for AK Golf HQ. Design UTFORDRING-DETALJ for PlayerHQ.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Utfordring-detalj
URL: /portal/utfordringer/putt-konsistens-7d
Bruker: Markus R.

### Layout
- PlayerHQ-sidebar. "Utfordringer" aktiv.
- Topbar 64px.
- Innhold padding 32px, max-width 1200px.

### Breadcrumb
"Utfordringer / Putt-konsistens 7 dager".

### PageHeader
- Eyebrow: "PEER-2-PEER · SLAG · 3 DAGER IGJEN".
- Tittel: "Putt-konsistens *7 dager.*"
- Sub: "Henrik N. utfordret deg 7. mai. Frist: 14. mai 23:59."
- Status-pill: ◉ AKTIV.
- Actions: "Trekk meg" (destructive ghost) · "Del" (ghost).

### KPI-strip (4 kort)
1. Din score: 38/50 (mono 32px).
2. Henriks score: 42/50 (mono 32px, varselfarge — du ligger bak).
3. Differanse: -4 (mono).
4. Tid igjen: 3d 14t (mono).

### Hoved-grid (2 kolonner: 55/45)

**Venstre — Regler + leaderboard**

*Regler-kort:*
- Eyebrow: "REGLER".
- Punktliste:
  - 50 putter fra nøyaktig 3 fot (91 cm).
  - Indoor (M2) eller outdoor (M3/M4).
  - Logg etter hver økt — minimum 10 putter per økt.
  - Den med flest innom etter 7 dager vinner.
  - Likt? Lengste enkelt-streak avgjør.
- Eyebrow: "INNSATS".
- Tekst: "Taperen betaler vinnerens lunsj på 19. hull etter neste runde."

*Leaderboard (innen utfordringen):*
- Tabell, kun 2 deltakere:
  ```
  #1   Henrik N.       42 / 50    84%   Streak: 14
  #2   Markus R.       38 / 50    76%   Streak: 11   ← du
  ```

**Høyre — Logg + historikk**

*Score-form (logg nytt resultat):*
- Eyebrow: "LOGG NY ØKT".
- Felt:
  - Dato (default i dag).
  - Antall putter (default 10).
  - Antall innom (input).
  - Notat (valgfri tekst).
- CTA: "Lagre" (primary).
- Hjelpetekst: "Du har logget 4 økter siden start. Henrik har logget 5."

*Logg-historikk:*
- Eyebrow: "DINE LOGGER".
- Tabell:
  | Dato | Putter | Innom | % |
  |---|---|---|---|
  | 12. mai | 10 | 8 | 80% |
  | 11. mai | 10 | 7 | 70% |
  | 9. mai | 15 | 12 | 80% |
  | 8. mai | 15 | 11 | 73% |
  | Total | 50 | 38 | 76% |

### Aktivitet-feed (full bredde, under)
- Eyebrow: "AKTIVITET".
- Liste, kronologisk nyeste øverst:
  - "12. mai 19:14 — Henrik N. logget 9/10 putter."
  - "12. mai 17:02 — Du logget 8/10 putter."
  - "11. mai 16:30 — Henrik N. logget 10/10. Personal best!"
  - "11. mai 15:45 — Du logget 7/10 putter."
  - ... (10 til).

### Editorial moment
"*7 dager*" italic.

Lever én HTML-fil. Realistisk dummy-data.
```

---

## Prompt 10.3 — Ny utfordring

```
Du er senior UI/UX-designer for AK Golf HQ. Design NY UTFORDRING-WIZARD for PlayerHQ.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Ny utfordring (wizard)
URL: /portal/utfordringer/ny
Bruker: Markus R.

### Layout
- PlayerHQ-sidebar. "Utfordringer" aktiv.
- Topbar 64px.
- Innhold padding 32px, max-width 880px sentrert.

### Breadcrumb
"Utfordringer / Ny".

### PageHeader
- Eyebrow: "NY UTFORDRING · STEG 2 AV 4".
- Tittel: "Hva *konkurrerer* dere om?"
- Sub: "Du bestemmer reglene. Inviterte spillere må akseptere før utfordringen starter."

### Steg-indikator (horisontal, full bredde, sticky)
4 sirkler med koblings-linjer:
1. ◉ Type (gjennomført, lime).
2. ◉ Detaljer (aktiv, lime fylt).
3. ○ Inviter (kommende, muted).
4. ○ Bekreft (kommende, muted).
Linjer mellom: lime mellom 1-2, muted mellom 2-3-4.

### Skjema (vis steg 2 — "Detaljer")

*Card 1: Hva måles?*
- Eyebrow: "MÅL".
- Radio-gruppe (3 alternativer som kort):
  - ◉ Antall slag innom mål (eks: putter inn av 50).
  - ○ Beste enkeltprestasjon (eks: best gate-score).
  - ○ Streak / antall dager på rad.

*Card 2: Pyramide og område*
- Eyebrow: "KATEGORI".
- Pyramide-chip-rad: FYS · TEK · SLAG (valgt, lime ring) · SPILL · TURN.
- Område-dropdown: "Putt 0-3 ft" (valgt). Alternativer: TEE / INN200 / .../ PUTT 0-3 / ...
- Praksistype-chips: B · R · K · S (ingen valgt).

*Card 3: Parametre*
- Eyebrow: "PARAMETRE".
- Input-grid (2 kolonner):
  - "Totalt antall forsøk": 50 (number-input, mono).
  - "Minimum per økt": 10.
  - "Avstand": 3 fot (91 cm).
  - "Tillatte miljø": [M2] [M3] [M4] (multi-select chips).
- Toggle: "Tillat indoor-logging" (på).

*Card 4: Varighet og innsats*
- Eyebrow: "VARIGHET".
- Date-range: 14. mai 2026 — 21. mai 2026 (7 dager).
- Quick-velger: 3 dg · 7 dg (aktiv) · 14 dg · 30 dg · Egendefinert.
- Eyebrow: "INNSATS (VALGFRI)".
- Tekst-input: "Taperen betaler vinnerens lunsj på 19. hull etter neste runde."

### Forhåndsvisning (sticky høyre-kort, 300px, hvis plass — eller nederst)
- Eyebrow: "FORHÅNDSVISNING".
- Mini-versjon av utfordring-kortet:
  - Type-pill: "PEER-2-PEER".
  - Pyramide-pill: SLAG.
  - Tittel: "Putt-konsistens 7 dager".
  - Sub: "50 putter fra 3 ft · 7 dager · taper betaler lunsj".

### Navigasjon (footer-rad)
- ← Tilbake (ghost).
- "Neste: Inviter spillere →" (primary).
- "Lagre som kladd" (link).

### Editorial moment
"*konkurrerer*" italic.

Lever én HTML-fil. Realistisk dummy-data.
```

---

## Prompt 10.4 — Achievements

```
Du er senior UI/UX-designer for AK Golf HQ. Design ACHIEVEMENTS for PlayerHQ.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Achievements
URL: /portal/mal/achievements
Bruker: Markus R.

### Layout
- PlayerHQ-sidebar. "Mål" aktiv.
- Sub-nav (Mål): Mål · Statistikk · Leaderboard · Milepæler · Achievements (aktiv).
- Innhold padding 32px.

### PageHeader
- Eyebrow: "PLAYERHQ · ACHIEVEMENTS · 28 AV 84 LÅST OPP".
- Tittel: "Det du *har samlet.*"
- Sub: "28 oppnådd · 56 igjen · seneste: 'Sub-par-runde' 22. desember 2025."

### KPI-strip (4 kort)
1. Oppnådde: 28 (mono 32px).
2. Totalt mulig: 84 (mono 32px).
3. Progress: 33% (mono, accent).
4. Sjeldenste: "Eagle" (mono 16px, sub: "1.4% av spillere har den").

### Filter-rad
- Kategori-chips: Alle · TEK · SLAG · SPILL · TURN · FYS · STREAK · SOSIAL. "Alle" aktiv.
- Status: Alle · Oppnådd · Låst.
- Sortering: "Sist oppnådd ▾" / "Vanskelighet" / "Sjeldenhet".

### Badges-grid (6 kolonner, 16 rader synlig)

Hver badge-celle (140×160px):
- Sirkulær badge 80px (Lucide-ikon i midten, currentColor):
  - Oppnådd: fylt accent-bakgrunn, lime stroke.
  - Låst: grå bakgrunn, muted stroke, 40% opacity.
- Tittel under (Geist 12px, sentrert).
- Sjeldenhet-prosent (mono 10px, muted): "12% har den".
- Hover: tooltip med kriterier.

**Eksempler å vise (24 stk minimum):**

*Oppnådde (12 første):*
1. ✓ **Første runde** — Lucide flag · 100% har den.
2. ✓ **Sub-singel HCP** — Lucide trending-down · 18% · oppnådd 14. juni 2025.
3. ✓ **Eagle** — Lucide star · 1.4% · oppnådd 12. apr 2025.
4. ✓ **Sub-par-runde** — Lucide award · 6% · oppnådd 22. des 2025.
5. ✓ **10-dagers streak** — Lucide flame · 32% · oppnådd 18. apr 2026.
6. ✓ **Klubbmester junior** — Lucide trophy · 4% · oppnådd 10. okt 2025.
7. ✓ **100 økter** — Lucide check-circle · 28% · oppnådd 30. mai 2025.
8. ✓ **500 økter** — Lucide check-circle-2 · 12% · oppnådd 4. apr 2026.
9. ✓ **WAGR-debutant** — Lucide globe · 8% · oppnådd 3. mai 2026.
10. ✓ **Tidlig opp** (5 økter før 07:00) — Lucide sunrise · 22% · oppnådd 12. mar 2026.
11. ✓ **Vinterkriger** (15 økter des-feb) — Lucide snowflake · 18% · oppnådd 14. feb 2026.
12. ✓ **Pyramide-balanse** (alle 5 trent i samme uke) — Lucide triangle · 24% · oppnådd 7. apr 2026.

*Låste (12 neste, vis som greyed):*
13. ○ **Hole-in-one** — Lucide target · 0.8% har den.
14. ○ **Albatross** — Lucide bird · 0.2%.
15. ○ **HCP plus** — 2% · "Kom under 0.0".
16. ○ **30-dagers streak** — 12% · "Du er på 12 nå".
17. ○ **1000 økter** — 4%.
18. ○ **Vinn 5 peer-utfordringer** — 14% · "Du har 1".
19. ○ **NM-deltaker** — 8% · "Påmeldt — låses opp etter tee-off".
20. ○ **WAGR topp 50** — 1.2% · "Du er #4 i akademi".
21. ○ **Internasjonal turnering** — 3%.
22. ○ **Coach 5 nye spillere** — 6% · "(når du blir mentor)".
23. ○ **6 under på 9 hull** — 2.4%.
24. ○ **Eagle på par 4** — 0.6%.

### Mest sjeldne — du har den (kort, full bredde)
- Eyebrow: "SJELDENT".
- Stor badge-ikon (Lucide star, 120px, accent).
- Tittel: "Eagle" (Inter Tight 28px).
- Sub: "Kun 1.4% av AK Golf-spillere har denne. Du fikk den 12. apr 2025 — par 5 hull 7 GFGK, 3-jern fra 215m."

### Editorial moment
"*har samlet*" italic.

Lever én HTML-fil. Realistisk dummy-data. Ingen emoji — kun Lucide-ikoner.
```

---

## Prompt 10.5 — Varsler

```
Du er senior UI/UX-designer for AK Golf HQ. Design VARSLER for PlayerHQ.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Varsler
URL: /portal/varsler
Bruker: Markus R.

### Layout
- PlayerHQ-sidebar 240px. "Varsler" aktiv (lime accent).
- Topbar 64px (bjelle-ikon har rød count-prikk med "7").
- Innhold padding 32px, max-width 1000px sentrert.

### PageHeader
- Eyebrow: "PLAYERHQ · VARSLER · 7 ULESTE".
- Tittel: "Hva *har skjedd?*"
- Sub: "7 uleste · 18 totalt siste 7 dager."

### Action-rad (sticky)
- Filter-chips: Alle (18) · Uleste (7) · Coach (4) · Utfordringer (5) · Økter (6) · Betaling (1) · System (2). "Alle" aktiv.
- Sortering: "Nyeste ▾".
- CTA høyre: "Marker alle som lest" (ghost) · Innstillinger-ikon.

### Varsler-liste (vertikal, full bredde)

Hver rad (88px høyde, padding 24px):
- Venstre: ikon-sirkel 40px (Lucide, kategorifarge).
- Midten:
  - Tittel (Geist 15px medium, om ulest: bold + lime venstre-streck 3px).
  - Tekst (Geist 14px, muted).
  - Tid (mono 11px, muted).
- Høyre: CTA eller "..." (3-prikks-meny).
- Hover: lett bg-shift.

**18 varsler (kronologisk nyeste øverst):**

1. **● COACH · 13. mai 14:18** — "Anders kommenterte på Driver gate-test"
   - Tekst: "Markus — fokus på bakswing-tempo. Du akselererer for tidlig."
   - CTA: "Les →".
   - Status: ulest (lime stripe).
2. **● UTFORDRING · 13. mai 12:42** — "Henrik N. logget 9/10 putter"
   - Tekst: "Han leder Putt-konsistens 7 dager med 42-38."
   - CTA: "Logg du også →".
   - Ulest.
3. **● ØKT · 13. mai 09:00** — "Ny økt lagt til: 14:30 i dag"
   - Tekst: "Driver gate-test + jernkonsistens 7i · 75 min · M2 simulator."
   - CTA: "Se økt →".
   - Ulest.
4. **● UTFORDRING · 13. mai 08:15** — "Du ble invitert til 'Lengste drive uke 20'"
   - Tekst: "Sofie K. inviterte deg. Akademi · 12 deltakere · slutter 19. mai."
   - CTA: "Aksepter" (primary) · "Avslå".
   - Ulest.
5. **● COACH · 12. mai 19:30** — "Anders bekreftet plan uke 20"
   - Tekst: "3 ekstra M3 approach-økter lagt inn. Se årsplan."
   - CTA: "Se uke 20 →".
   - Ulest.
6. **● MÅL · 12. mai 17:14** — "Du nådde 'WAGR-debutant'"
   - Tekst: "T9 i Oslo Open Junior ga deg 12 WAGR-poeng."
   - CTA: "Se badge →".
   - Ulest.
7. **● BETALING · 12. mai 06:00** — "Faktura for mai sendt"
   - Tekst: "Coaching mai 2026 · 4900 kr · forfaller 26. mai."
   - CTA: "Se faktura →".
   - Ulest.
8. ○ **ØKT · 11. mai 21:02** — "Økt logget: Bane Bogstad 9 hull"
   - Tekst: "4 timer · SG total +1.1 · god putting (+0.8)."
   - Lest.
9. ○ **UTFORDRING · 11. mai 16:45** — "Streak-konkurranse mai: dag 11 ✓".
10. ○ **COACH · 10. mai 14:22** — "Anders la inn ny øvelse: Random klubb-skifte".
11. ○ **SYSTEM · 10. mai 09:00** — "Ny versjon av PlayerHQ tilgjengelig".
12. ○ **ØKT · 9. mai 18:30** — "Påminnelse: Approach-økt i morgen 14:00".
13. ○ **UTFORDRING · 8. mai 20:14** — "Henrik N. logget 7/10 putter".
14. ○ **MÅL · 8. mai 12:00** — "Måned-rapport: 78% suksess (+4pp)".
15. ○ **COACH · 7. mai 11:30** — "Anders avlyste økt onsdag 8. mai 17:00".
16. ○ **UTFORDRING · 7. mai 09:00** — "Ny utfordring fra Henrik: Putt-konsistens 7 dager".
17. ○ **SYSTEM · 6. mai 14:00** — "Statistikk siste 30 dager er klar".
18. ○ **ØKT · 6. mai 09:00** — "Påminnelse: TEK-økt 7i konsistens".

**Kategorifarger på ikon-sirkler:**
- COACH: var(--primary) bg, hvit ikon (Lucide message-circle).
- UTFORDRING: accent bg, mørk ikon (Lucide swords).
- ØKT: TEK-farge #005840, hvit ikon (Lucide calendar).
- MÅL: accent bg, mørk ikon (Lucide target).
- BETALING: muted bg, foreground-ikon (Lucide receipt).
- SYSTEM: secondary bg, muted-foreground ikon (Lucide info).

### Tom state (vis under listen, ikke aktiv her — kun hvis 0 varsler)
- Sentrert: Lucide bell-off 48px muted.
- Tekst: "Ingen varsler. Du er a jour."

### Editorial moment
"*har skjedd?*" italic.

Lever én HTML-fil. Realistisk dummy-data. Ingen emoji — kun Lucide-ikoner.
```
