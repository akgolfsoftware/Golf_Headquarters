# Kodegjennomgang 2026-06-11 — hele dagens prod-leveranse (72 commits)

> Max-effort review: 9 finder-vinkler + sikkerhetsvinkel → 51 kandidater →
> uavhengig verifisering (CONFIRMED/PLAUSIBLE/REFUTED) → gap-sweep.
> 6 kandidater REFUTED og fjernet. Funn under er verifisert med siterte linjer.

## TOPP 15 (alvorligst først)

```json
[
  {"file":"src/lib/portal-hjem/hjem-data.ts","line":178,"summary":"KRITISK: Alle økt-lenker peker på /portal/gjennomfore/{id} — ruten finnes ikke (kun page.tsx). 5 lenkesteder (hjem-data 178/197, gjennomfore-data 69/90, planlegge-data 93).","failure_scenario":"Spiller trykker «Start økt»/økt-rad på Hjem, Gjennomføre eller Planlegge → 404 i produksjon NÅ. Kjerneflyten trening er død."},
  {"file":"src/app/admin/live/[sessionId]/brief/actions.ts","line":45,"summary":"HØY/IDOR ×3: sendBriefTilSpiller + sendLiveMelding (active/actions.ts:49) + lagreCoachVurdering (summary/actions.ts:50) henter økt på klient-sessionId uten coachId-filter — kun rollesjekk.","failure_scenario":"Enhver innlogget coach kan skrive brief/meldinger/vurdering inn i en ANNEN coachs økt (lagreCoachVurdering overskriver også notes destruktivt)."},
  {"file":"src/app/portal/(fullscreen)/live/[sessionId]/summary/actions.ts","line":87,"summary":"HØY: Coach-brief/melding gjør completedSummary truthy → freezeSessionSummary-guarden returnerer coach-objektet som «frosset summary» og ekte stats fryses aldri; ingen spillerflate leser coachBrief/coachMessages.","failure_scenario":"Coach sender brief før økt → spiller ser den aldri; når økten fullføres returneres {coachBrief} med totalReps/drills undefined i stedet for ekte snapshot. Read-modify-write uten transaksjon gir også lost-update."},
  {"file":"src/app/portal/mal/runder/[id]/page.tsx","line":225,"summary":"HØY regresjon: Slag-registrering strandet — SlagWizard + UpGameImportModal mistet eneste render-sted i omskrivingen; shot-by-shot ulenket. Ingen flyt kan produsere Shot-data lenger.","failure_scenario":"Alle nye runder viser «Hull-for-hull mangler» for alltid; per-slag-SG-grunnlaget kan aldri fylles fra appen."},
  {"file":"src/app/portal/meg/innstillinger/page.tsx","line":108,"summary":"HØY compliance-regresjon: GDPR dataeksport + slett konto mistet eneste UI-inngang (Personvern-seksjonen falt ut av innstillinger-omskrivingen; sidene finnes men er ulenket).","failure_scenario":"Spiller (app med helsedata + mindreårige) finner ingen vei til dataeksport/sletting — GDPR-rettigheter unreachable fra UI."},
  {"file":"src/lib/portal-hjem/hjem-data.ts","line":128,"summary":"HØY: 4 flater (Hjem, Gjennomføre, Planlegge, Varsler) bruker serverens lokale tid uten timeZone:'Europe/Oslo' — Vercel kjører UTC; ingen TZ satt i repo/vercel.json.","failure_scenario":"Alle klokkeslett vises 1–2 t feil i prod, og «i dag»-vinduet skifter kl 01/02 norsk tid: økter/varsler havner på feil dag, «God kveld» blir «Hei»."},
  {"file":"src/app/portal/tren/tester/[testId]/gjennomfor/actions.ts","line":55,"summary":"HØY/IDOR: Test-detalj, gjennomfør og lagreTestResultat sjekker kun at testen finnes — ikke visibility/eier (katalogen filtrerer, dypsidene gjør ikke).","failure_scenario":"Spiller B med en annen spillers PRIVATE custom-test-id kan se protokollen og lagre resultater mot den (dempes kun av cuid-gjetting)."},
  {"file":"src/lib/portal-meg/profil-data.ts","line":188,"summary":"MIDDELS: To divergerende gratis-regler for samme Abonnementskort — profil-data: monthlyCredits>0; abonnement-siden: harPakke||!erPro (den låste regelen).","failure_scenario":"GRATIS-tier-spiller uten pakke ser «300 kr/mnd · Faktureres månedlig» på /portal/meg, men «Gratis» på /portal/meg/abonnement — selvmotsigende fakturainfo."},
  {"file":"src/lib/portal-analysere/analysere-data.ts","line":71,"summary":"MIDDELS: «Runder '25» = take:20 uten årsfilter (teller fjorårsrunder, maks 20); to-par hardkodet score−72 (course.par hentes ikke); «18 hull» hardkodet.","failure_scenario":"Spiller med 31 runder ser «Runder '25: 20»; 70 på par-70-bane vises som «−2»; Best kan være fjorårsrunde."},
  {"file":"src/lib/portal-hjem/hjem-data.ts","line":280,"summary":"MIDDELS: «Neste tee»-meta formaterer startDate (dato uten klokkeslett) som tee-tid + hardkoder «18 hull» — mot filens egen «aldri falske tall»-regel.","failure_scenario":"Alle turneringer viser «00:00» (UTC) / «02:00» (Oslo) som starttid — oppdiktet klokkeslett presentert som fakta."},
  {"file":"src/lib/portal-analysere/analysere-data.ts","line":131,"summary":"MIDDELS: Tester-fanen setter grønn ok-badge ved score ≥70 på tvers av alle testtyper/enheter — bryter låst beslutning (FYS-referanser skal være nøytrale til formelen låses).","failure_scenario":"Benkpress 60 kg = nøytral, CHS 110 mph = grønn — vilkårlig faglig signal uten forankring."},
  {"file":"src/app/admin/agencyos/spillere/page.tsx","line":100,"summary":"MIDDELS: «Skylder»-flagget = minst én FAILED Payment noensinne — uten tidsvindu eller sjekk på senere vellykket trekk.","failure_scenario":"Ett avvist kort i mars (betalt på nytt samme dag) gir permanent «Skylder» i stallen — coach purrer kunde som ikke skylder."},
  {"file":"src/app/portal/mal/runder/[id]/page.tsx","line":153,"summary":"MIDDELS: Scorekortet teller hullscore som antall Shot-rader og ignorerer isPenalty-flagget (slag-wizard/UpGame modellerer straff som flagg/samlerad).","failure_scenario":"Hull med vannball (3 slag + 1 straff-flagg) vises som 3 — feil farge, og scorekort-sum motsier runde.score i H1 på samme skjerm."},
  {"file":"src/app/portal/tren/turneringer/page.tsx","line":62,"summary":"MIDDELS regresjon-klynge: turneringspåmelding strandet (TurneringerInteraktiv + /ny ulenket; Workbench oppretter ikke entries); resultat-LOGGING strandet (gammel client orphanet); intet dato-gulv + filter etter take.","failure_scenario":"Spiller kan ikke melde seg på turnering noe sted; loggede resultater kan ikke lenger registreres; fjorårs-entries vises som kommende."},
  {"file":"src/components/workbench/workbench.tsx","line":119,"summary":"MIDDELS: Workbench-inspektøren initieres med demo-økt (defaultSelectedSession(WEEK_DAYS)) mens uka rendrer ekte data; + «Send melding» sender ?spiller= som innboksen aldri leser (åpner vilkårlig tråd).","failure_scenario":"Coach ser fabrikkert økt (ONS 28/5) i inspektøren ved load, og «Send melding» på en spiller åpner nyeste tråd i stedet — risiko for melding til feil spiller."}
]
```

## Sekundærfunn (verifisert, under cap)
- Payment-/fakturahistorikk usynlig for spiller (abonnement→dokumenter-lenken viser Document, ikke Payment). [B2]
- Helse: 14-dagers tabell + sparkline + vekt/notater-visning fjernet — lagres men vises aldri. [B6]
- Kontakt-skjema uten rate-limit/honeypot (lib/rate-limit finnes, ikke brukt) → Resend-kvote/innboks-flom. [S4]
- sok_minne ikke subject-scopet (admin-gated i dag, latent cross-person-lekkasje). [S7]
- NEXT_REDIRECT svelges i live-actions try/catch (utlogget får toast, ikke login). [K9]
- Optimistisk varsel-toggle uten rollback. [K10]
- To protocol-parsere divergerer (NGF-steg vises ikke på detalj; gjennomfør virker). [K13]
- KpiCard mobil mangler unit-prop (latent). [K14] · CANCELLED-økter som fokus (latent til avlys-feature). [K1/K4]
- «MARKUS»-pill igjen i coach-tester-radar + «Øyvind'»-genitiv ×5. [SWEEP 5-6]
- Profil-HCP uten server-validering (999/Infinity passerer). [SWEEP 7]
- Ytelse: getHjemData ~8 serielle DB-roundtrips + ubegrenset round.findMany; testDefinition full scan; innboks henter AI-tråder + full messages-JSON; hjem-hero rå <img> ~600KB. [EFF]
- ~4 700 linjer død kode etterlatt (analyse-hub-kjeden, tester-trioen, slag-wizard*, varsler-kjeden, turneringer-interaktiv*, innstillinger, runde-ny, abonnement-views) — *delvis = strandede funksjoner over. [SIMPL]
- Duplisering: 2 protocol-parsere, TALLORD ×2, ukenummer-algoritmer ×2 (ulike!), SGBar ×2, KpiRute vs KpiCard, pill-knappstrenger ×13, seksjons-byggesteiner ×8, [--primary]-triks ×4, px-1-gutter-stabling ×7, dual-tree-skjermer. [REUSE/ALT]
- parTemplate gjetter hullmiks + holeScores sendes men persisteres aldri (datamodell-hull: per-hull-par/scores). [ALT]
- REFUTED (ikke reelle): Notification.link/Document.url-injeksjon (ingen bruker-skrivevei + noopener), «resultater vises aldri» (de vises — loggingen er strandet).

## Tverrgående rotårsak
B1/B3/B4/B6 + resultat-logging er regresjoner fra Fase 2-«paritet»-omskrivingene:
porting-gaten verifiserte UTSEENDE mot fasit, ikke FUNKSJONS-bevaring. Gate-læring:
omskrivinger må diffe gammel sides handlinger/lenker og re-etablere eller bevisst-dokumentere hver.
