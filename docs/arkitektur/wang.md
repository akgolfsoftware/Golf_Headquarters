# WANG Toppidrett — Skoleflaten

Dato: 26. september 2026
Plassering i kodebasen: `src/app/team-wang/`, `src/app/team-wang/_data/`, `src/app/team-wang/_components/`

---

## 1. Hva WANG-flaten er

WANG Toppidrett-flaten er skreddersydd for golfprogrammet ved WANG Toppidrett Fredrikstad, der Anders Kristiansen er hovedtrener. Den fungerer som bindeleddet mellom videregående skole, LK20-læreplanen for programfaget Toppidrett, treningsplanleggingen og utøvernes helhetlige skolehverdag.

Flaten har et **skarpt skille mellom en åpen fellesdel og en lukket trenerdel**, utformet for å ivareta personvern for mindreårige skoleelever.

---

## 2. Ruter og oppbygning (6 ruter)

WANG Toppidrett består av **6 ruter** (alle er `page.tsx`):

1. `/team-wang`: Åpen fellesside for elever, foresatte og skolen.
2. `/team-wang/coach`: Trenerens lukkede årsplan- og administrasjonsverktøy.
3. `/team-wang/coach/iup/[elevId]`: Samtaleskjema for Individuell Utviklingsplan (IUP).
4. `/team-wang/logg-inn`: Dedikert innloggingsside med WANG-profil.
5. `/team-wang/rekruttering`: Informasjonsside om søknad og opptak.
6. `/team-wang/toppidrett`: Presentasjon av faget Toppidrett Golf.

---

## 3. Skillet mellom åpen fellesside og coach-side

Skillet i tilgang er fundamentalt for GDPR og barnevern:

- **Fellessiden (`/team-wang`):** Er **helt åpen uten innlogging**. Den er laget for å kunne deles med elever, lærere og foreldre via lenke. Siden viser kun aggregert gruppeinformasjon, fag, lærere, rom og skolens offisielle ferier og samlingsdatoer. Den viser **aldri** elevnavn, e-postadresser, bilder eller andre personopplysninger.
- **Trenerflaten (`/team-wang/coach`):** Viser full elevliste (roster) med navn, fravær, progresjon og lenker til den enkelte elevs IUP-samtaler. Siden er dobbelt sikret:
  1. I `src/proxy.ts` (linje 208 og 225) fanges all trafikk til `/team-wang/coach` og krever aktiv sesjon.
  2. I `src/app/team-wang/coach/page.tsx` krever `requirePortalUser` rollen `ADMIN` eller `COACH`, og sjekker i tillegg at treneren har et aktivt medlemskap i akkurat WANG Toppidrett-gruppen (`hentWangCoachGruppeId`).

Sitat fra `src/app/team-wang/coach/page.tsx` (linje 9–14):
> *«WANG Årsplan (Coach) – trenerverktøy. Siden viser roster med elevnavn og IUP-lenker — PII om mindreårige. I tillegg til innlogging og global rolle må coach/hjelpetrener ha aktivt medlemskap i akkurat WANG Toppidrett-gruppen. (...) Fellessiden (/team-wang) er åpen ved siden av, men den er navnefri.»*

---

## 4. Datamodeller som brukes

WANG-flaten trekker veksler på:

- **Skole og timeplan:** `SchoolScheduleEntry` (timeplan: dag, start, slutt, fag, rom, lærer), `CompetenceGoal` (Udirs offisielle LK20-kompetansemål for Toppidrett VG1–VG3).
- **Grupper og tilhørighet:** `Group` (WANG-gruppen), `GroupMember` (elever og trenere tilknyttet WANG).
- **Perioder og sesong:** `TrainingPeriod` (perioder farget med LK20-kompetansemål).
- **Statisk fasit:** `src/app/team-wang/_data/arsplan-fasit-2026-27.ts` (WANGs godkjente årsplanfasit levert 25.08.2026).

---

## 5. Hva som virker faktisk i dag

1. **Årsplan 2026/27 med 4 faner (`/team-wang`):**
   - **Trening:** Viser periodiseringen (GRUNN, SPES, TURN, REST) og ukentlig timefordeling.
   - **Skole:** Timeplan med fag, skoletimer og romfordeling.
   - **Kalender:** Samlinger, turneringer, vurderingsuker og skoleferier.
   - **Foreldre:** Informasjon til foresatte om forventninger, samtykker og kontaktlinjer.
2. **IUP-samtaleverktøy (`/team-wang/coach/iup/[elevId]`):** Coachen kan føre strukturerte samtaler med eleven om tekniske, fysiske og mentale mål, trivsel på skolen og balansen mellom skolearbeid og golftrening.
3. **Elevliste med IUP-status (`/team-wang/coach`):** Treneren ser hvilke elever som mangler IUP-samtale dette semesteret og kan åpne elevens profil direkte.

---

## 6. Hva som er hardkodet eller uferdig

- **Statiske TypeScript-fasitdata i stedet for database-rader:** Skolens faste timeplan, lærernavn, rom og feriekalender er kodet direkte inn i `src/app/team-wang/_data/arsplan-fasit-2026-27.ts`. Hvis skolen bytter rom eller lærer midt i semesteret, krever det kodeendring og redeploy snarere enn enkel redigering i admin-grensesnittet.
- **Ingen integrasjon mot skolens administrative system:** WANG-flaten snakker ikke med Visma InSchool, Vigilo eller Feide. Fravær og karakterer må føres manuelt i skolens egne systemer.
- **Begrenset elev-interaktivitet på WANG-siden:** Elever kan ikke redigere egne mål eller levere oppgaver direkte i `/team-wang`. Elevens registrering skjer i PlayerHQ, mens WANG-siden fungerer som et informasjons- og oversiktsspeil.
