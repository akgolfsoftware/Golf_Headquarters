# Fra testresultat til øvelse i økt · puttebånd — 27.09.2026

Bestilt av Anders 27.09.2026, etter runden om teknisk plan. Funksjonen er hentet fra prototypen «AK Golf Training Motor», utseendet følger Precision Athletics.

## Prinsipper
- Systemet foreslår, coachen bestemmer. Planen endres aldri automatisk. Alt som legges i en økt er utkast til coachen publiserer.
- Ett resultat avgjør ingenting alene. Observasjon er ikke diagnose; skjermen sier aldri hvorfor et resultat ble som det ble.
- Ingen helsedetaljer i testresultatet. Testforhold er bare ytre forhold (sted, underlag, vær). Dagsform, restitusjon og skade hører til PH-24.
- Referanseverdi for nivå er ikke vedtatt: «—» og «Referanse ikke satt».
- Merkelapper: **Test · måler** (legges aldri i økt) · **Øvelse i banken** (gjenbrukbar) · **Øvelse i økt · utkast** (mengde + AK-formel).

## AG-15 Tester (coach) · fanen Testdetalj
1. Testvelger for spilleren (ChoicePill).
2. Topp: siste gyldige resultat, enhet, retning, «Nivåreferanse — · Referanse ikke satt».
3. Testsignal: én setning, periode, antall gyldige av totalt, «Avvikende forhold holdt utenfor», «Observasjon, ikke diagnose». Under 3 gyldige: «For lite grunnlag», ingen kurve.
4. Resultathistorikk (DataTable → kortrader): dato, resultat, kilde, testforhold, trend («I trenden» / «Utenfor trenden»).
5. Coachens valg, tre ChoicePill med lik vekt: Ingen endring nå · Mer målrettet trening · Vurder teknisk oppgave. Hvert valg gir UndoToast. Spilleren ser status.
6. «Mer målrettet trening» → forslag fra øvelsesbanken: navn, akse, område, mengde, «Hvorfor» (én setning) + kilde. «Legg i økt» → ark med kommende økter → «Legg i økt som utkast» → kvittering på kortet med «Åpne økten» (AG-11).
7. «Vurder teknisk oppgave» → AG-TP-01 (`arg=fra-test`) med posisjon og område tomme og en infolinje om kilden. Ingenting fylt ut.
8. Tom: ingen resultater → «Tildel test». Ingen forslag → «Ingen øvelser i banken passer.» + «Opprett øvelse» (AG-14).

## PH-A07 Tester · utvikling (spiller)
Samme historikk og testsignal øverst. Status fra coachens valg: «Anders vurderer planen» (Mer målrettet / Vurder teknisk / ikke valgt) eller «Ingen endring nå». Handling: «Gjennomfør test på nytt» (PH-15). Ingen «Legg i økt».

## AG-11 Workbench (coach)
Øvelse med `from` viser kilde nederst på øktkortet og i øktpanelet: «Fra test · Putt 5–10 fot · 24.09» → AG-15, «Fra teknisk oppgave · P4.0» → AG-10. Treffmål 44 px.

## Datamodell (tillegg, godkjennes av Anders før migrering)
- `TestResult`: `conditions` (tekst), `conditionsDeviant` (bool, holdes utenfor trend), `source`.
- `TestDecision`: test, spiller, valg (`none` · `targeted` · `technical`), coach, dato, angret.
- `SessionExercise.origin`: `{ kind: "test" | "technical_task", refId, label, date }`.
- Forslag er avledet (område + dimensjon fra øvelsesbanken), ikke lagret; «Hvorfor» og kilde følger forslaget.

## AK-formelen med flere steg og miljøer (avklart av Anders 27.09.2026)
Formelen viser steget spilleren er på og hovedmiljøet. Rep-mål per steg og per miljø lagres hver for seg.

## Posisjonsnavn (avklart av Anders 27.09.2026)
Ordmasteren §5 gjelder i AG-10, AG-TP-01, AG-TP-02 og PH-TP-01 (`AK_VOCAB.P`).

## Puttebånd: seks
0–3 · 3–5 · 5–10 · 10–25 · 25–40 · 40+ fot. 19 treningsområder: 5 fullsving, 4 nærspill, 6 putting, 3 fysisk, 1 bane. Kilde: ak-formel-v2 og masterdokumentet for treningsplanlegging 21.09.2026.

Rettet (12 filer):
1. `assets/ak-vocabulary.js` — `AREAS.putting`, `PUTT_BANDS`, kommentar
2. `guidelines/ordmaster.md` — §3 (20 → 19 områder, båndlisten) og §7 (7 → 6 bånd)
3. `ui_kits/agencyos/screens/AG-14.jsx` — områdeliste i øvelsesbyggeren
4. `ui_kits/_shared/data-tp.js` — område i AG-TP-01 (alle 6 bånd)
5. `ui_kits/playerhq/data-meg.js` — PH-26 putte-lab
6. `ui_kits/_shared/data-trening.js` — PH-A05 soner (hadde 3–6 · 6–10 · 10–20 · 20+)
7. `ui_kits/playerhq/screens/PH-A2.jsx` — PH-A05 innsiktskort
8. `ui_kits/playerhq/screens/PH-A1.jsx` — PH-A01 putting-rad
9. `ui_kits/_shared/data-rd.js` — SG-detaljfelt putting (PH-RD-06/09)
10. `overlevering/round-sg-registration-2026-09-27.md` — SG-detaljfelt
11. `ui_kits/playerhq/data.js` + `screens/PH-14.jsx` — testen «Putting · 6 bånd» (60 putter)
12. `ui_kits/toppidrett/SGScreen.jsx` og `banekart-data.js` — kildemateriale, rettet for konsistens

## Audit
376 tilfeller, 0 avvik (alle endrede skjermer, fire tilstander, alle bredder, lyst og natt for PlayerHQ). Hardkodede farger i skjermfilene: 0.
