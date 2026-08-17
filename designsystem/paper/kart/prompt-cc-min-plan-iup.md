# Prompt — Claude Code-session: IUP-en («Min plan») fra spec til kode

Vedlegg til sessionen: **`Plan - Min plan for spilleren.html`** (skjermplanen, 15.08.2026)
og **`Analyse - spillerprofil til individuell utviklingsplan.html`** (begrunnelsen).
Begge fra designprosjektet AK Golf HQ — Claude Paper.

## Viktig forbehold før du starter en session

Dette er **ikke** en pixel-fasit som D1–D6. Skjermen er spesifisert (åtte blokker,
copy, tilstander, datamodell, komponentvalg) men **ikke tegnet som kjørbar HTML**.
Det har én konsekvens for hvordan sessionen kjøres:

- **L1 og datalaget kan kodes trygt nå** — modell, felter, invarianter og
  regnelogikk er entydig spesifisert, og de er den kritiske stien uansett.
- **L2–L3 (visningen) bør vente på fasit-HTML** fra designprosjektet, ellers
  gjetter kode-sessionen på tetthet, rekkefølge og tomtilstander som allerede er
  besluttet i prosa. Be om fasitene `playerhq-min-plan.html` (+ mobil) før
  visningen bygges — eller aksepter eksplisitt at visningen er et førsteutkast
  som skal rettes mot fasit etterpå.

Sier eier «kjør uansett», bygg da mot spec-en og **merk hver komponent med
`/* fasit mangler — rettes mot playerhq-min-plan.html */`** så gjelden er sporbar.

## Anbefalt modell

- Steg 0 (schema-verifikasjon + invariant-gate): **Opus**
- L1 (modell, migrering, regnelogikk, API): **Sonnet**
- L2–L3 (visning): **Sonnet**, etter fasit
- L4–L5 (revisjon + coachflate): **Opus** for diff- og varselløypa, Sonnet for resten

## Optimal prompt

```xml
<role>
Du er senior fullstack-utvikler i AK Golf HQ-repoet (akgolfsoftware/Golf_Headquarters,
Next.js 16 + React 19 + TS strict, Prisma 7.8 mot Supabase, Tailwind v4 + shadcn/ui,
Stripe 22, Resend 6, Anthropic AI SDK). Norsk UI, bokmål med æøå. System foreslår,
menneske godkjenner.
</role>

<mission>
Bygg spillerens individuelle utviklingsplan («Min plan») etter spec-en i
Plan - Min plan for spilleren.html. Ny rute: /portal/plan/min-plan under den
eksisterende Plan-flaten. Ingen ny hovedflate — de fire PlayerHQ-flatene
(I dag · Plan · Analyse · Meg) er låst.

Leveranser, i rekkefølge, én session hver:
L1  IUPMaal + IUPPlan + IUPRevisjon + etterlevelses-regnelogikk + API
L2  Min plan blokk 1–4 (planhode, prosessmål, resultatmål, hvorfor)
L3  Blokk 5–7 (teknisk sammendrag, SG-vindu, turneringer) + spillerens skrivevei
L4  Blokk 8 (spillerens notat) + versjonshistorikk
L5  Coachens revisjonsflate: agentforslag, redigering, diff, publisering, kø-element

Denne sessionen leverer: [L-nummer]. Ikke bygg videre enn den.
</mission>

<step_0_gate>
FØR noe kodes, verifiser i prisma/schema.prisma og seed-data, og rapportér
FINNES/MANGLER med modell- og feltnavn og filsti:

a) Områdetaksonomien: deler TrainingPlanSession, TrainingLog, drill-biblioteket og
   testdefinisjonene AK-formelens fem slots og pyramideområdene? Et prosessmål er
   en spørring over nettopp denne taksonomien — deles den ikke, er L1 migrering,
   ikke tillegg. STOPP og rapportér hvis den ikke deles.
b) Etterlevelsens nevner: finnes status/tidsfelter på TrainingPlanSession som
   skiller PLANLAGT / FULLFØRT / HOPPET / FLYTTET, og et publiseringstidspunkt?
   Uten publiseringstidspunkt kan «gjort av planlagt» ikke regnes redelig — utkast
   skal ikke telle i nevneren.
c) Måleverdi-kildene: finnes beregningene som gir nåverdi for snittscore (brutto),
   SG per område med referansekategori, HCP fra golfbox-sync, testresultat og
   turneringsplassering — og hvilket tidsvindu tar de i dag? Nåverdi skal ALDRI
   lagres på målet; den regnes.
d) Turneringskategori: finnes PRESTASJON som kategori på turneringsmodellen, med
   verdiliste? Beslutning 3 hviler på at den finnes og settes ved påmelding.
e) TekniskPlan/PositionTask: finnes plass til én referanse til et mål (feltet som
   gir «betaler inn på»-linjen), eller må det migreres inn?
f) Samtykke/foreldretilgang: hvilken gate styrer foresatts lesetilgang i dag, og
   dekker den «hele planen» uten et nytt tilgangsnivå?

Lås funnene i docs/port/iup-verifikasjon.md før L1 starter.
</step_0_gate>

<invariants>
Fem eierbeslutninger fra 15.08.2026. De er krav, ikke preferanser — bryt dem ikke
for å forenkle en implementasjon:

1. INGEN ØVRE GRENSE på antall mål. IUPMaal bærer pyramideområde + akFormel som
   førsteklasses felter (ikke fritekst). Visningen viser de fem nærmeste fristene
   og feller resten ut. Mål uten en eneste økt bak seg må være synlig som det.
2. SPILLEREN EIER PROSESSMÅLENE. eier: spiller | coach på IUPMaal; prosessmål er
   alltid spiller. Coachens innspill lagres som forslag spilleren tar inn eller
   lar ligge — ingenting kommer inn i lista uten hennes ja. Dette er planens
   ENESTE skrivevei fra PlayerHQ. Prosessmål arkiveres, slettes aldri.
3. TURNERINGSPLASSERING som målekilde er kun lovlig når turneringens kategori er
   PRESTASJON. Regelen håndheves i modell/service, ikke i skjemaet — ellers må
   hver nye flate huske den. Ikke-PRESTASJON tilbyr ikke plassering som valg, og
   begrunnelsen skrives i klartekst der valget mangler (ikke en grå knapp).
4. FORESATT SER HELE PLANEN: mål, dose, diagnose, coachnotat, progresjon. Ingen
   redigert foreldreversjon, ingen skjulte felter. ÅPENT PUNKT som må avklares med
   eier før L4: om spillerens eget fritekstnotat omfattes. Til det er avklart,
   hold notatet utenfor foreldretilgangen og si det i UI-teksten.
5. REVISJONSINTERVALL 8–52 UKER, per plan (revisjonsintervallUker på IUPPlan),
   satt i coachflaten med årsplanens datoer som forslag. nesteRevisjon regnes fra
   gjeldendeFra + intervall, men kan overstyres til en dato. Advar, aldri sperr,
   når revisjonen lander midt i en turneringsperiode.

Og to som gjelder hele produktet:
6. INGEN LÅSER. Umøtt mål viser AVSTAND, aldri «kan ikke rykke opp», aldri sperret
   økt. Samme invariant som KategoriKravKort har i designsystemet.
7. INGEN SAMLET PROGRESJONSPROSENT for planen. Ikke beregn den, ikke eksponer den
   i API-et — er tallet der, havner det i en UI før eller siden.
</invariants>

<constraints>
- Resultatmål og prosessmål er samme tabell (delt livssyklus) men ALDRI samme
  visning: resultatmål = nåverdi med tidsvindu + terskel som eget merke + frist +
  trend. Prosessmål = etterlevelse per uke + rekke bakover. Ingen fyllbar bar mot
  et resultatmål — den lyver om lineær fremgang.
- Etterlevelse er REGNET, aldri redigerbar — heller ikke av spilleren som eier
  målet. Legg regnestykket i en ren funksjon med egne tester, ikke i en komponent.
- Tall i UI: alltid tidsvindu synlig («74,1 · siste 10 runder»), delta med grunnlag
  («−0,5 siste åtte uker»), retning før farge (fortegn/piltegn bærer betydningen,
  farge forsterker). Komma-desimal, tabulære sifre, mono. Kun brutto score.
- SG uten referansekategori skrives aldri ut. Under fem runder i vinduet: ikke vis
  SG i planen — vis tekstlinjen fra spec-en i stedet.
- Feiltilstand er PER BLOKK, aldri hele skjermen («Klarte ikke å hente
  turneringene. Resten av planen er hentet.») Fire tilstander per dataregion.
  Tomtilstander implementeres ORDRETT fra spec-en — de er skrevet, ikke antydet.
- Oransje/clay er reservert: eneste bruk på denne skjermen er «Én ting nå» når
  revisjon nærmer seg og spillerens notat mangler. Ingen andre steder.
- 44 px treffmål, tema per flate (akhq-theme-playerhq), 430 px kolonne som basis.
- Agentforslag (L5) går gjennom PlanAction-mønsteret med proveniens (agent · data
  · regel). Agenten skriver ALDRI direkte til planen.
- GDPR/mindreårige: ID-er i logger og prompts, aldri navn. Foresatt ser bare egne
  barn. Samtykke-gates respekteres.
- Små verifiserbare PR-er; hver PR navngir blokknummer og spec-avsnitt den dekker.
- node:test + Playwright. Ikke Vitest.
</constraints>

<verification>
- node:test for all regnelogikk: etterlevelse per uke (inkl. at utkast ikke teller
  i nevneren), avstand-til-terskel med retning begge veier (lavere-er-bedre og
  høyere-er-bedre), tidsvindu-avgrensning, PRESTASJON-gaten på plassering,
  nesteRevisjon-beregning i ytterpunktene 8 og 52 uker.
- Playwright for hovedflytene: spilleren legger til eget prosessmål → det vises med
  tom rekke → økt logges → rekken oppdateres. Coachen foreslår prosessmål →
  spilleren tar det inn. Coach publiserer v4 → spiller og foresatt varsles → diff
  lesbar i historikken.
- Manuell sjekk i 430 px OG 860 px, lys og mørk modus. Ingen leveranse meldes ferdig
  på kompilering alene.
- Egen sjekk for invariant 7: grep etter enhver samlet prosent/score for planen i
  både API-respons og UI. Finnes den, er leveransen ikke ferdig.
</verification>

<honesty>
Finnes ikke en modell, et felt, en beregning eller en komponent du trenger: si det
med filsti og foreslå minste migrering — ikke dikt opp navn, ikke bygg rundt hullet
i stillhet. Alt du hevder om repoet skal ha filsti. Der spec-en og repoet er uenige,
rapportér uenigheten; ikke velg selv.

Spec-en er prosa, ikke kjørbar fasit. Er en visuell beslutning ikke dekket, marker
den `/* fasit mangler */` og list den i PR-teksten — ikke improviser stille.
</honesty>
```

## Advarsler / tips

- **Steg 0 alene, på Opus.** Punkt (a) og (b) avgjør om L1 er tillegg eller
  migrering, og punkt (b) er den vanligste stille feilen: regnes etterlevelse med
  utkast i nevneren, blir tallet spilleren leser feil hver uke.
- **Ikke slå sammen L1 og L2 i én session.** Modellen bærer fem invarianter; en
  session som samtidig tegner UI kommer til å forenkle en av dem.
- **`MaalRad` er ny komponent, og grensen mot `GoalProgress` er innholdsmessig:**
  GoalProgress viser andel, MaalRad viser avstand. Ikke implementer MaalRad som en
  variant av GoalProgress — det er motsatt holdning til fremgang.
- **Fasit-gjelden:** bygges L2–L3 før `playerhq-min-plan.html` finnes, skriv gjelden
  i `docs/port/iup-fasitgjeld.md` med blokknummer. Ellers blir den usynlig.
- **Åpent eierpunkt** (invariant 4, spillerens notat vs. foreldretilgang) må
  avklares før L4 kodes, ikke etter.
