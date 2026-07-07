# Claude Design — de to siste promptene før v14 (2026-07-07)

Kjør i rekkefølge: PROMPT 1 (beslutninger + rettelser) først, så PROMPT 2 (PlayerHQ-løftet).
Kopier én om gangen inn i prosjektet «AK Golf HQ Design System».

---

## PROMPT 1 — Lås beslutningene, rett P0-funnene, eksporter v14

```
BESLUTNINGER FRA ANDERS (2026-07-07) — lås, rett og eksporter v14.

DEL A — TRE BESLUTNINGER (lås i CLAUDE.md + beslutningsloggen):

1. PRIS: 299 kr/mnd BEKREFTET (B09 står). Produksjonsrepoet er migrert 300→299 i dag — konflikten
   er død. MEN: årsabonnement («PRO årlig 2690 kr») er IKKE besluttet innført. Fjern 2690-demoene
   eller merk dem tydelig «avventer beslutning» (structure.card-FAQ, okonomi-PAKKER, FakturaRad-
   eksempler). Oppdater B09 til å skille månedspris (låst) fra årspris (åpen).

2. CS-NIVÅER: CS50–CS100 BEKREFTET (B07 står). Repo-ordboken er oppdatert i dag. Ingen endring
   nødvendig i kit-et (demo-data allerede migrert 6. jul) — bare noter i B07 at repo-kanon nå
   matcher.

3. MØRK BAKGRUNN: variant B «løftet» er VALGT (Anders: «ikke for mørkt»). Gjør #141513 til
   default --graphite-0 i tokens/colors.css (kort #202120, hevet #282923 per lifted-rampa),
   fjern [data-bg-variant]-bryteren og A-varianten, og reverser 6. juli-senkningen til #060706
   overalt den ble speilet (colors.css, tailwind-theme-regen, workbench-data/diff/coldstart,
   phq-uke-mørk, workbench.html, shell-gradient). Re-verifiser kontrast på HELE graphite-rampa
   og alle -text-tokens mot ny base — med utregning, ikke skjønn. Oppdater B12 med addendum.

DEL B — P0-RETTELSER (alle verifisert med WCAG-utregning mot dagens verdier):

4. --text-faint: kommentaren «bekreftet ~4,85:1 mot --surface — over AA» er matematisk FEIL.
   Reelt: #6B6C64 gir 3,35:1 mot #171817 (mørk); #8E908C gir 2,85:1 mot sand-100 (lys).
   Sett mørk ≈ #8A8C86 og lys ≈ #686A66 (repoets verifiserte verdier, 4,87:1 / 4,83:1) — eller
   bedre — og rett kommentaren. NB: regn på nytt mot ny base fra punkt 3.

5. data-viz.css: kommentaren «L-fase sekvensiell rampe» på --phase-*-tokene bryter systemets egen
   regel (L-fase = læringstrinn; «fase» er reservert periodisering). Omdøp til «Periodiserings-
   rampe (Base→Peak)». Lag samtidig en mapping-tabell i CLAUDE.md mellom makro-fasene
   (Base/Forberedelse/Spesialisering/Taper/Peak/Overgang) og produksjonens PeriodeType
   (GRUNN/SPESIALISERING/TURNERING/EVALUERING/FERIE) — i dag finnes ingen bro, og Code trenger den.

6. Terminologi-rydding før eksport (repoets design-zip-qa-port feiler ellers på disse):
   - Engelsk «session» i kanonisk lag: AgendaRow.prompt.md («live session goes lime»),
     MaanedKalender.prompt.md, UkeKalender.prompt.md, calendar.card.html («sessions:»-datanøkler),
     DeltakerListe.prompt.md («Live Session»), Progress.prompt.md («4/12 sessions done»)
     → bruk «økt»/«økter» (datanøkler kan hete okter).
   - ✓-tegnet (U+2713) i guidelines/fargesystem-spec.html → bytt til Lucide check-ikon eller
     tekst — U+2700-området er forbudt i HTML per emoji-regelen.

7. STEMPLE AUDITEN OPPDATERT (guidelines/skjerm-plan-audit-2026-07-07.md): defekt A
   (talent DNA/pyramide-mislabeling) og defekt B (hardkodet Inter Tight i /admin/queue) ble
   FIKSET i produksjonsrepoet 7. juli (commit 964a8ce-serien), og repoet har deretter fjernet
   Inter Tight fullstendig (layout laster kun Familjen Grotesk/Inter/JetBrains Mono).
   Arkitekturspørsmålet i auditens punkt 3 er BESVART: JA — det hånd-rullede Tailwind-laget er
   akseptert kanon for driftsskjermene (kø/risiko/moderering/opptak/agenter), Anders 2026-07-07.
   Golfdata forblir kanon for golf-prestasjonsflater.

8. --axis-spill-text mørk #F0E6A8 er GODKJENT (14,07:1 mot surface, verifisert) — behold; repoet
   adopterer verdien i v14-synken. Ingen endring.

DEL C — EKSPORT: Når A+B er gjort og verifisert mot tilstandsgalleriet + tema-beviset:
eksporter v14 etter eksportreglene i CLAUDE.md (kun kanonisk lag: tokens/, components/,
templates/, handover/, skills/ak-terminologi/, styles.css, guidelines/, CLAUDE.md,
DEKNINGSKART.md, SKILL.md + refererte assets/ — ALDRI uploads/, scraps/, ui_kits/).
Regenerer handover/tailwind-theme.css fra token-generatoren FØR eksport (punkt 3 endrer basen).
```

---

## PROMPT 2 — PlayerHQ-løftet (kjør ETTER prompt 1, før eller etter eksport — men er den med i v14, desto bedre)

```
PlayerHQ-oppgradering — fra nøytral til signatur (Retning A, lys)

KONTEKST: ui_kits/playerhq/ + templates/playerhq-skjerm/. Kvalitetsmål: guidelines/premium-referanse.html
(«Presisjon, mikrointeraksjon, dataliv»). Kanon står fast: PlayerHQ default lys, aldri lime-TEKST/-ikon/
-outline på lys (lime-FYLL per B15-kontrakten er lov), Familjen Grotesk (display) / Inter (UI) /
JetBrains Mono (alle tall), Lucide-ikoner, norsk bokmål, tokens only, anbefalinger aldri sperrer.
Demo: Øyvind Rohjan. Dagslys-kravet (B21) gjelder: kritisk data ≥ 7:1, brødtekst ≥ 15–16 px.

PROBLEM 1 — SKJERMEN ER FOR NØYTRAL. Diagnose: alle blokker på Hjem er identiske grå surface-kort
(FormStatus, Mål-rad, AgendaRow, Heatmap-kort, AiTipCard har samme visuelle vekt), forest-grønn er
fraværende på flaten, lime finnes kun som utvannede tinter, og «ikon-sirkel + to linjer + chevron»
gjentas som generisk liste-grammatikk. Gjør:
1. TRE kortvekter: (a) ETT signaturmoment per skjerm — utvid dagens mørke data-hero til fullverdig
   hero-panel med stort mono-tall (48–60px tabular), SG-sparkline og lime-signal (lime lov i mørk
   innfelling); (b) medium handlingskort (dagens økt, neste fokus) med forest som aktiv aksent
   (venstrekant, ikonfarge, CTA); (c) stille rader for resten — hairline-separert liste UTEN
   kort-ramme.
2. Forest #005840 aktivt på lys flate: primær-CTA («Start økt» som rounded-full pill, mono
   uppercase), aktiv dag i DayStrip, venstrekant på live-økt.
3. Typografi opp: hilsen-h1 32–34px Familjen Grotesk med editorial italic på nøkkelord; ALLE tall
   mono/tabular; minst ett stort tall synlig above the fold.
4. Ta i bruk assets/imagery/ (peak-misty) i hero-panelet per bildekartets regler (foto KUN i mørkt
   kort på PlayerHQ-hjem, bak gradient — aldri bak brødtekst, aldri i konkurranse med data).
5. Bryt chevron-lista: «Mine mål & SG-Hub» og FormStatus får hver sin egen anatomi (mål med
   RingGauge-miniatyr, form med LoadChart-mikrosparkline fra premium-referansen).

PROBLEM 2 — TOPPMENYEN HAR IKKE FULL BREDDE. Diagnose: phq-shell.jsx har ingen topbar; brand-raden
ligger i scrollet innhold med 18px innrykk, og kit/mal sentrerer en 390px-kolonne slik at toppen ser
ut som en smal stripe. Gjør:
1. STICKY topbar i skallet (søsken til BottomNav): full bredde kant til kant (100 % av flaten),
   bakgrunn var(--surface) med blur + 1px hairline-bunn, safe-area-aware. Innholdet i baren
   (logo + «PLAYERHQ» + varsler + avatar) beholder 18px gutters — BAREN er full-bleed, ikke teksten.
2. Flytt brand-rad + varsler/avatar fra Hjem-innholdet opp i baren — identisk på alle faner, scroller
   aldri vekk. Hilsen-headeren blir igjen i innholdet.
3. I templates/playerhq-skjerm + alle phq-*.html: på brede viewports (≥768px) skal skallet
   demonstrere at baren strekker seg over hele flaten mens innholdet holder maks-bredde sentrert.

PROBLEM 3 — KONSEKVENT DESIGN. Alle PlayerHQ-skjermer (phq-home, -uke, -analyse, -meg, -mal,
-runder, -baneguide, -fysisk, -live) deler etter dette: samme sticky topbar fra skallet, samme
header-anatomi (eyebrow → display-tittel m/ italic → ev. lead), samme SectionLabel-mønster, samme
tre kortvekter, samme tilstands-sett (innhold/tom/laster/feil — Skeleton). Oppdater
templates/playerhq-skjerm/PlayerhqSkjerm.dc.html så fremtidige skjermer arver anatomien. Avvik
dokumenteres i guidelines/beslutninger.md eller finnes ikke.

LEVERANSE: oppdatert phq-shell.jsx (topbar) + phq-home.jsx (hierarki) + synlig ringvirkning på
minst phq-uke/phq-analyse/phq-meg + oppdatert skjermmal + før/etter-kort i guidelines/. Verifiser
mot tilstander.html, tema-beviset og fargesystem-spec — WCAG AA overalt, B21-dagslyskravet på
kritisk data, og husk at mørk base nå er #141513 (variant B fra forrige prompt).
```
