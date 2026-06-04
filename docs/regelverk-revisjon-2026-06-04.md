# Revisjon: utdaterte regler og dokumenter som kan forvirre Claude (4. juni 2026)

> Fire parallelle lese-agenter gikk gjennom regel-laget (CLAUDE.md, AGENTS.md, .claude/rules), planene i docs/, design-dokumentene/skills, og koden i src/. Mål: finne alt som motsier den gjeldende sannheten og dermed kan få Claude til å bygge feil ting med selvtillit.

## Hovedbildet

Den største faren er ikke ett enkelt dokument — det er at **beslutningene vi tok i denne sesjonen (tema per produkt, navne-kanon, Planlegge→Workbench, FYS avventer, skjerm-sammenslåing) bor i notatene mine og i docs/, men IKKE i hovedinstruksen Claude leser hver gang (CLAUDE.md + .claude/rules).** Neste økt vil Claude lese den gamle CLAUDE.md — som bruker gammelt app-navn, ingen navne-kanon, og peker til feil design-mappe. Da bygger den etter utdaterte regler.

Oppryddingen er billig. Det meste er tekstrettelser i noen få filer + arkivering av gamle planer.

---

## HØY prioritet (rydd først — disse styrer hva Claude bygger)

### H1 · Hovedinstruksen mangler dagens beslutninger
- **Kilde:** `CLAUDE.md` (rot)
- **Problem:** Sier ingenting om tema per produkt, navne-kanon (Markus Berg / Anders Kristiansen), Planlegge→Workbench, FYS-avventer, eller skjerm-sammenslåing. Disse er bestemt, men lever bare i `docs/handoff-gjennomgang-2026-06-04.md` og auto-minnet.
- **Risiko:** Neste økt bygger Claude etter gamle antakelser (6-kort Planlegge, tema-toggle, gamle navn).
- **Tiltak:** Legg inn en kort «Låste beslutninger (juni 2026)»-seksjon i CLAUDE.md.

### H2 · Design-porting-regelen peker på en mappe som ikke finnes
- **Kilde:** `.claude/rules/design-porting-gate.md`
- **Problem:** Sier «port fra v10-designet (`public/design-handover/v10/`)». Den mappa finnes ikke. Den ferske handoffen ligger i `public/design-handover/AK Golf HQ Design System/`.
- **Risiko:** En LÅST regel sender Claude til en sti som ikke eksisterer → den gjetter, eller porter fra feil/gammel kilde.
- **Tiltak:** Oppdater stien i regelen til den faktiske handover-mappa.

### H3 · CLAUDE.md peker Claude til GAMMEL design-handover som «master»
- **Kilde:** `CLAUDE.md` mappestruktur: «`docs/design-handoff-komplett/` # Master design docs (les disse)»
- **Problem:** Det er mai-handoffen. Den ferske (4. juni) ligger i `public/design-handover/`. Mai-versjonen bruker gammelt navn (CoachHQ) og gammel tier.
- **Risiko:** Claude leser to uker gammelt design som fasit.
- **Tiltak:** Endre peker i CLAUDE.md til den ferske handover-mappa; merk mai-mappa som arkiv.

### H4 · ELITE-tier er «dødt», men ligger igjen i kode og typer
- **Kilde:** `prisma/schema.prisma` (enum `ELITE`), + TS-typer `"GRATIS"|"PRO"|"ELITE"` i bl.a. `src/app/admin/stall/stall-client.tsx`, `src/app/admin/spillere/page.tsx`, `src/app/portal/meg/profil/rediger/profil-rediger-form.tsx` (sistnevnte med egen ELITE-styling).
- **Problem:** Gjeldende modell er 2-tier (GRATIS + PRO 300 kr/mnd). ELITE skal ikke vises. Men typene og en styling-tabell tillater det fortsatt.
- **Risiko:** Claude ser ELITE i typene, antar den er gyldig, og bygger ELITE-visning. `forelder/okonomi` sin tierLabel mangler ELITE-gren og kan kræsje på en ELITE-record.
- **Merk — IKKE forveksle:** «Performance» og «Performance Pro» er noe ANNET — det er coaching-pakkene (2 vs 4 credits), ikke abonnement-tier. De er korrekte. Forvirringen er at tier (GRATIS/PRO) og pakke (Performance/Performance Pro) blandes i copy.
- **Tiltak:** Avgjør: fjern ELITE helt (schema + typer), eller la enum ligge dødt men stram typene til `"GRATIS"|"PRO"`. Avklar tier vs pakke i CLAUDE.md.

### H5 · Coach-appens navn brukes om hverandre (AgencyOS vs CoachHQ)
- **Kilde:** Master-skjermplan + git + minne sier **AgencyOS** («het tidligere CoachHQ»). MEN den ferske design-READMEen (`public/design-handover/.../README.md`), `docs/design-handoff-komplett/`, flere skills (`coachhq-arkitektur`), og ~20 steder i `src/` (eyebrows som «CoachHQ · Perioder», kommentarer) sier fortsatt CoachHQ.
- **Risiko:** Claude vet ikke hvilket navn som er offisielt, blander dem i UI-tekst, eller tror det er to ulike apper.
- **Tiltak:** Bekreft at AgencyOS er det offisielle navnet (master-planen sier det), så ryddes CoachHQ-referansene. NB: dette er en bekreftelse Anders bør gi før vi masse-rydder.

---

## MIDDELS prioritet

### M1 · Flere «gjeldende planer» i docs/ konkurrerer
- **Kilde:** `docs/skjermplan.md` (30. mai), `docs/plan-gjenstaende-2026-06-01.md`, `docs/launch-plan.md` (udatert), `docs/ultra-review-2026-05.md`.
- **Problem:** Disse presenterer seg som planer, men er erstattet av nyere (`MASTER-SKJERMPLAN.md`, `konsolidert-plan-2026-06-02.md`, `ferdigstillingsplan-mvp-2026-06-03.md`).
- **Risiko:** Claude plukker en foreldet plan og jobber mot feil status/rekkefølge.
- **Tiltak:** Flytt de fire til `docs/_arkiv/` (eller merk «FORELDET — se MASTER-SKJERMPLAN» øverst).

### M2 · Gamle skjerm-manifester er fra før beslutningene
- **Kilde:** `docs/skjerm-manifest-playerhq.md` og `-agencyos.md` (1. juni).
- **Problem:** Tegner 6-kort Planlegge-hub, nevner «Performance»-tier-valg, bruker dels gammelt navn — alt fra før 4. juni-beslutningene.
- **Tiltak:** Merk øverst: «Referanse — se MASTER-SKJERMPLAN + konsolidert-plan for gjeldende.»

### M3 · Demo-navn i koden er fortsatt de gamle
- **Kilde:** `src/` demo/preview-data: «Magnus Strand», «Markus R.P.», «Magnus Berg», «Andreas Kragerud» (bl.a. `portal/(fullscreen)/tren/workbench-client.tsx` viser «Markus R.P.» i UI, `intern/komponenter/agency-kit` har «Andreas Kragerud»).
- **Problem:** Gjeldende kanon er spiller = Markus Berg, coach = Anders Kristiansen.
- **Risiko:** Claude kopierer gamle navn til ny demo-data.
- **Tiltak:** Erstatt ved neste runde gjennom skjermene (lav hast — det er demo-data, ikke ekte brukere).

### M4 · Eksterne «design-vendor»-skills kan forgifte stilen
- **Kilde:** `.claude/skills/design-vendor/` (mange stilarter: claymorphism, cosmic, brutalist osv.) + `docs/design-resources/README.md` som peker dit.
- **Problem:** Disse er generelle inspirasjons-stiler, ikke AK-stil. Designsystemet er LÅST.
- **Risiko:** «Bruk dashboard-skill» kan dra en fremmed designfilosofi inn i AK-komponenter.
- **Tiltak:** Skriv tydelig i `design-resources/README.md` at kun `ak-golf-hq-design` gjelder for dette prosjektet; vendor-skills er inspirasjon, aldri kilde.

---

## LAV prioritet / verifiser

### L1 · Mulig tema-«toggle»-rest (usikkert)
- En agent mente å se en `toggle-theme`-handling i en kommando-palett; en annen fant ingen `next-themes`/`useTheme` i `src/`. Sprikende funn.
- **Tiltak:** Verifiser manuelt om det finnes en tema-veksler i kommando-paletten. Hvis ja: fjern (tema er låst per produkt). Hvis nei: ingen handling.

### L2 · Wireframe-regelen kan være foreldet
- CLAUDE.md har en regel «ikke les fra `wireframe/`». Uklart om mappa fortsatt finnes.
- **Tiltak:** Sjekk om `wireframe/` finnes. Hvis slettet: behold regelen som ufarlig, eller fjern den.

---

## Tiltaksliste, prioritert (med tidsestimat)

| # | Tiltak | Type | Tid |
|---|---|---|---|
| 1 | Legg «Låste beslutninger (juni 2026)» inn i CLAUDE.md (tema, navn, Planlegge→Workbench, FYS, sammenslåing) | Regel | Raskt |
| 2 | Rett `design-porting-gate.md` til riktig handover-mappe | Regel | Raskt |
| 3 | Endre CLAUDE.md sin design-master-peker til fersk handover, merk mai som arkiv | Regel | Raskt |
| 4 | Bekreft app-navn (AgencyOS), så rydd CoachHQ i regler/skills/eyebrows | Navn | Medium |
| 5 | Avgjør ELITE-tier (fjern eller stram typer) + avklar tier vs pakke i CLAUDE.md | Kode+regel | Medium |
| 6 | Arkivér 4 foreldede planer (skjermplan, plan-gjenstaende, launch-plan, ultra-review) | Docs | Raskt |
| 7 | Merk gamle manifester «referanse — se MASTER-SKJERMPLAN» | Docs | Raskt |
| 8 | Klargjør at kun ak-golf-hq-design gjelder (design-resources README) | Docs | Raskt |
| 9 | Bytt demo-navn til Markus Berg / Anders Kristiansen ved neste skjerm-runde | Kode | Løpende |
| 10 | Verifiser tema-toggle-rest + wireframe-mappe | Sjekk | Raskt |

**Det Claude leser som fasit (skal stoles på):** `CLAUDE.md` (etter oppdatering), `src/app/globals.css` (tokens), `docs/MASTER-SKJERMPLAN.md` (skjermer), `public/design-handover/AK Golf HQ Design System/` (ferskt design), auto-minnet (beslutninger).

**Ingen kildefiler er endret i denne revisjonen — kun denne rapporten er skrevet.**
