# Claude Design — prompt-pakke (nytt design)

> Ferdige prompts å lime inn i Claude Design. **Lim inn PREAMBELEN først** i et nytt prosjekt, deretter spor-prompten du vil jobbe på. Bytt `{VALGT RETNING}` med A (Skog Premium), B (Editorial Lys) eller C (Terminal) når du har valgt.
> Bygger på: `00-MASTER-BRIEF.md`, `skjerm-inventar-konsolidering.md`, `flyt-inventar/00-OPPSUMMERING.md`.

---

## PREAMBEL (lim inn først)

```
Du designer et HELT NYTT visuelt uttrykk for AK Golf HQ — en elite golf-coaching-plattform. Ankeret: «DataGolf møter The Athletic, på Linear». Datadrevet, rolig, presist. Tall er helter. Norsk bokmål, «du»-tiltale.

LÅST: lime #D1F843 er signaturfargen og skal være den distinkte accenten (primær-CTA, aktiv tilstand, KPI-puls, fokus) — krydder, aldri store flate felt, aldri lime tekst på lime. ALT ANNET er fritt (tema, bakgrunn, typografi, komponentstil).

VALGT RETNING: {VALGT RETNING — beskriv kort, f.eks. «mørk forest-grønn, glassmorphism, glødende lime data-viz»}.

ABSOLUTT VIKTIGST:
1. STILL MEG SÅ MANGE SPØRSMÅL SOM MULIG. Ikke anta noe. Ved flere tolkninger: spør. Ved et visuelt valg som kan påvirke hvordan en funksjon fungerer: spør.
2. WORKBENCH: jeg designer Workbench-flyten selv (funksjoner, hva-er-hva, hva-gjør-hva). IKKE overstyr eller motsi den. Der forslaget ditt kan kollidere med Workbench: spør meg FØRST.
3. INGEN DØDE KNAPPER. Hver knapp må ha en tydelig destinasjon/handling. Hver kjernehandling ≤ 2 trykk, med tydelig «neste steg».
4. RIKE KOMPONENTER. Lag mange, visuelt sterke varianter for å vise ulik data/innhold — ikke ett kort gjentatt. Dette er høyt prioritert.
5. Alle tilstander på hver dataflate: innhold · tomt · laster (skeleton, ikke spinner) · feil.

REGLER: Tall i mono, norsk format (komma-desimal «48,3», mellomrom-tusenskille, «48 %», 24t «14:30»). Ingen emoji — Lucide-ikoner. Demo-navn: spiller = Øyvind Rohjan (HCP 4,2), coach = Anders Kristiansen. Abonnement: GRATIS eller PRO (aldri «ELITE», aldri Performance/Pro som app-nivå). FYS-testresultater = plassholder-tall.

Bekreft at du har forstått, og start med å stille meg spørsmålene dine før du designer.
```

---

## SPOR 1 — PlayerHQ (spilleren, mobil-først)

```
Vi designer PlayerHQ — spillerens app, mobil-først, «hva gjør JEG i dag». Anbefalt tema: lyst (spilleren er ute i sol) — men bekreft med meg.

Skjermer (kjerne først):
- Hjem (dagens økt, KPI-strip HCP/SG/neste, coach-notat, bunn-nav)
- Planlegge → ÉTT trykk inn i Workbench (ikke kort-meny) [SPØR meg om Workbench-detaljer]
- Analyse: ÉN flate med faner (SG · Runder · TrackMan · Tester)
- Gjennomføre: dagens program → start økt ≤2 trykk, logg resultat 1 trykk
- Live-økt (fullskjerm): brief → aktiv (logg video/foto/notat) → oppsummering
- Drills (bibliotek + detalj)
- Booking (oversikt, ny booking-wizard, detalj)
- Coach-seksjon (meldinger, spørsmål, notater, planer, øvelser, videoer)
- Talent (junior: min plan, mitt nivå, roadmap, sammenligning)
- Meg (abonnement, helse, utstyrsbag, innstillinger, sikkerhet, hjelp)
- Utfordringer, Varsler

VIKTIG — disse knappene er døde i dag og MÅ få ekte destinasjon (eller fjernes):
forsidens «Logg runde/Alle mål/Nytt mål» (pekte til fjernet modul), «Lagre økt» (havnet på 404), opprett ny fys-plan (manglet), coach-øvelse-kort (pekte feil), 11 placeholder-knapper på Planlegge desktop, live-øktens logg-knapper, «Oppgrader til Pro» (feil rute).

Still meg spørsmålene dine, så designer vi Hjem først.
```

---

## SPOR 2 — AgencyOS (coachen, desktop + mobil)

```
Vi designer AgencyOS — coachens kontrolltårn, «hvem trenger MEG nå». Anbefalt tema: mørkt (svingstudio/desktop, tette tabeller) — men full mobil må også fungere. Bekreft med meg.

Skjermer (kjerne først):
- Cockpit (dagens timeline, «hvem trenger meg»-kø, KPI-rad, innboks-snutt)
- Stall: spillerliste (data-tett) + spiller-360 (profil/plan/analyse/workbench)
- Handlingssenter: innboks + forespørsler + godkjenninger + oppfølgingskø samlet med faner [SPØR meg om sammenslåingen]
- Planlegging: treningsplaner, plan-maler, Workbench [SPØR — jeg bygger Workbench selv], tildel plan/test til gruppe ≤2 trykk
- Kalender + booking + anlegg (locations/facilities) + kapasitet
- Tester, Drills, Analyse (stall-analyse/innsikt/dashboard — hjelp meg navngi de tre)
- Talent (radar, sammenligning, WAGR)
- Live-økt (coach-perspektiv), Gjennomføre
- Økonomi, Organisasjon/innstillinger/team, Workspace

VIKTIG — døde knapper i dag som MÅ løses: gruppe-detalj (~7 døde knapper), workspace/oppgaver (hele flaten uten handlere), gjennomføre-CTA-er, tester-detalj (alle 3 knapper), og lenker til kuttede ruter (Anlegg, Plan-maler, «Se alle»→approvals). Typo bookings/bookinger.

Still meg spørsmålene dine, så designer vi Cockpit først.
```

---

## SPOR 3 — Forelderportal (mobil + desktop, lesemodus)

```
Vi designer Forelderportalen — innsyn for foreldre, lesemodus (ingen handling på vegne av barn). Tema: lyst, rolig, ikke-teknisk.

Skjermer: Hjem (barnets fokus/uke), Barn-liste + barn-profil, Bookinger, Fakturaer/Økonomi, Ukerapport, Samtykke (GDPR), Varsler, Innstillinger.

Denne flaten er allerede ren (ingen døde knapper). Fokus: rolig, tillitsvekkende, lettlest. Still spørsmål, så starter vi på Hjem.
```

---

## SPOR 4 — Auth / Onboarding

```
Vi designer auth + onboarding. Tema: lyst, sentrerte kort.
Skjermer: login, signup, glemt/reset passord, sjekk e-post, onboarding-wizard (spiller/coach/klubb/forelder), foreldresamtykke-flyt, BankID (placeholder).
Allerede ren flyt. Fokus: minimal friksjon, tydelig fremdrift i wizards. Still spørsmål, så starter vi på login + signup.
```

---

## SPOR 5 — Marketing (akgolf.no)

```
Vi designer marketing-sidene (salg/lead). Tema: lyst, editorial, samme DNA.
Skjermer: Hjem, Coaching-pakker, Coacher, Anlegg, Booking-landing, Cases, Turneringer, Priser, Junior, PlayerHQ-pitch, Kontakt/Om-oss.
NB: stats-plattformen (/stats) er et eget produkt — egen runde senere.
To ekte døde knapper å fikse: stats «Lek deg med putt-data» og «Sjekk om jeg er her».
Still spørsmål, så starter vi på Hjem.
```
