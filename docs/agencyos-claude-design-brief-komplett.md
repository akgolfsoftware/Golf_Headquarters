# Claude Design-brief — AgencyOS (komplett)

> Komplett design-brief for hele AgencyOS: coach-verktøyet + business-laget + det nye
> AI-laget + coachens fulle innsyn i utøveren (PlayerHQ-data). Lim hele blokken under
> inn i Claude Design. Forankret i den ekte koden (`admin-nav.ts`, MASTER-SKJERMPLAN,
> screen-context, Prisma-schema) — IKKE oppfunnet, for å unngå IA-drift.
> Kilder: `docs/platform/screen-context/all-screens.md`, `docs/platform/user-flows/agencyos.html`,
> `docs/agencyos-beskrivelse.md`. Fasit-DS: `public/design-handover/AK Golf HQ Design System/`.

---

```
Oppdrag: Design «AgencyOS» — det komplette operativsystemet for Anders Kristiansen
(CEO + hovedcoach, AK Golf Group). AgencyOS er ETT sted der han gjør tre ting:
(1) følger opp utøverne sine i verdensklasse, (2) styrer AI-verktøyene og dagen sin,
(3) driver business-en. Mørkt «terminal»-tema. UI-tekst på norsk bokmål (æ, ø, å).

═══════════════════════════════════════════════════════════════════
0. HANDOVER-GRADE — KODEKLAR, INGEN STUBS (HARDEST REGEL, GJELDER ALT)
═══════════════════════════════════════════════════════════════════
- INGEN stub-, placeholder- eller skisse-skjermer. Gå RETT til ferdige, KODEKLARE skjermer i
  HELE Claude Design. Aldri «TODO», grå tomme bokser, «kommer senere» eller halvferdige flater.
- KODEKLAR = klar for direkte handover til Claude Code UTEN mer designarbeid: komplett layout,
  ekte komponenter fra designsystemet, eksakte tokens/farger/fonter/ikoner (ingen gjetting),
  ALLE tilstander (normal, tom, laster, feil, lang tekst), DESKTOP + MOBIL, og interaksjoner +
  navigasjon spesifisert. Demo-data = realistisk AK-data, aldri «Lorem».
- HVIS en EKSISTERENDE skjerm eller design ikke allerede er 100 % klar for handover til Claude Code:
  RETT DEN I DENNE RUNDEN. Ikke utsett, ikke lever som «nesten». Oppdater til kodeklar standard nå.
- KVALITETSBAR 10/10 mot AK-fasiten: før HVER skjerm leveres, sjekk mot designsystemet (tokens,
  lime kun som signal, kun Lucide, mono-tall, 8pt-grid, norsk bokmål) og fiks hvert avvik til 0.

═══════════════════════════════════════════════════════════════════
1. VIKTIGST — Anders har ADHD. Design for det (HARD føring):
═══════════════════════════════════════════════════════════════════
- Én tydelig ting i fokus per skjerm. Det viktigste er størst. Aldri 12 like bokser.
- Rolig og ryddig, aldri overveldende. Bruk tomrom. Skjul detaljer til de trengs.
- «Hva nå?» alltid åpenbart — dagens viktigste / neste handling fremst.
- Lime-aksent (#D1F843) KUN på det ene som krever oppmerksomhet nå (haster / NÅ / aktiv).
  Det er blikk-ankeret. Aldri lime overalt.
- Forutsigbar, identisk layout-logikk på alle skjermer. Ingen overraskelser.
- Synlig fremdrift gir momentum: hake, fremdriftslinje, «3/5».
- Minimal input: smarte standarder, få valg per handling.

═══════════════════════════════════════════════════════════════════
2. LÅST informasjonsarkitektur — venstre sidebar. IKKE finn opp ny nav.
═══════════════════════════════════════════════════════════════════
Toppbar: ordmerke «AGENCYOS» + dato + sol/måne-toggle (lys/mørk, standard mørk) + avatar-meny.

Sidebar-seksjoner (eksakt rekkefølge):
• DAGLIG: Oversikt · Min uke (Ukeoversikt, Oppgaver, Tildelt meg)
• AI & ARBEID: Agenter · Agent-team · Prosjekter
• STALL & TALENT: Spillere · Stall · Grupper · Talent (radar, sammenligning, WAGR-import)
• OPERASJON: Workbench · Handlingssenter · Planlegge (treningsplaner, plan-maler,
  drill-bibliotek, økter, teknisk plan, turneringer) · Gjennomføre (kalender,
  bookinger & kapasitet, anlegg, tilgjengelighet, tjenester, TrackMan, opptak)
• ANALYSE: Stall-analyse · Risiko · Lag-snitt · Tester · Runder · Compliance · Reach · Rapporter
• INNBOKS: Forespørsler · Godkjenninger · Meldinger
• SYSTEM: Økonomi · Team · Integrasjoner · AI-agenter (bakgrunn) · E-postmaler · Audit-logg · Innstillinger

═══════════════════════════════════════════════════════════════════
3. SKJERMENE — hva hver gjør (gruppert etter sidebaren)
═══════════════════════════════════════════════════════════════════
DAGLIG
- Oversikt (cockpit, hjem): dagens bilde i ett blikk — KPI (spillere, bookinger,
  forespørsler, åpne oppgaver), fokus-spiller, dagens øktliste, varsler, AI-status,
  agent-team-fremdrift. Dette er hjertet — gjør «hva skjer i dag» krystallklart.
- Min uke: ukeoversikt (kanban/dager), Oppgaver (til-do med prosjekt + frist + haster),
  Tildelt meg.

AI & ARBEID (det nye laget)
- Agenter: chat mot 4 AI-er (Claude, Gemini, Grok, Ollama) med modellvelger. Rolig flate.
- Agent-team: definer ÉN oppgave → flere AI-er jobber sekvensielt (Research → Utkast →
  Gjennomgang) med live fremdrift per steg + resultat + historikk.
- Prosjekter: kort-rutenett, samler oppgaver og AI-arbeid under et prosjekt.

STALL & TALENT
- Spillere: full stall-tabell med SG-sparkline, aktivitetsstatus, filter på gruppe/program, bulk-eksport.
- Spiller-detalj: coachens 360-visning av én utøver (se seksjon 4 — den viktigste flaten).
- Stall / Grupper: gruppestyring og medlemmer.
- Talent: talent-radar (nivå per dimensjon), sammenligning, WAGR-import.

OPERASJON
- Workbench: coachens planleggingsverktøy per spiller — bygg/rediger treningsplan,
  godkjenn spillerens justeringsforespørsler, sett mål, periodisering, planlegg mot turneringer.
- Handlingssenter: alt som krever handling, samlet og prioritert.
- Planlegge: Treningsplaner (kanban per status), Plan-maler, Drill-bibliotek (filtrer på
  pyramide-område/fasilitet), Økter, Teknisk plan, Turneringer.
- Gjennomføre: Kalender (uke/måned med bookinger + gruppeøkter + blokkert tid), Bookinger
  & kapasitet (godkjenn/avvis, kapasitetsring), Anlegg, Tilgjengelighet, Tjenester,
  TrackMan (range-økter), Opptak (video).

ANALYSE
- Stall-analyse: SG og fremgang på tvers av stallen. Risiko: hvem er i faresonen.
  Lag-snitt: gruppens snitt over tid. Tester: NGF-test-matrise (PGA topp 40 → Scratch),
  tildel tester. Runder: alle registrerte runder. Compliance. Reach. Rapporter (eksport).

INNBOKS
- Forespørsler: spillernes økt-forespørsler — godkjenn/avslå, foreslå tid.
- Godkjenninger: plan-justeringer + benchmark-oppdateringer som krever ditt ja.
- Meldinger: meldingssenter, sortert etter haster.

SYSTEM
- Økonomi: inntekt/utgift, cash flow, abonnementer. Team: brukere/roller. Integrasjoner.
  AI-agenter: bakgrunns-agenter (round/test/trackman) som jobber automatisk. E-postmaler.
  Audit-logg. Innstillinger.

═══════════════════════════════════════════════════════════════════
4. COACHENS UTØVER-360 — verdensklasse oppfølging (DEN VIKTIGSTE FLATEN)
═══════════════════════════════════════════════════════════════════
Spiller-detalj skal gi Anders FULLT innblikk i én utøver på én skjerm — alt han som
coach trenger for å følge opp på toppnivå. Vis disse dimensjonene, samlet og rolig:

- Hero: navn, bilde, HCP, hjemmeklubb, status (aktiv / skadet / ferie), nivå/talent-badge.
- DAGLIG TRENING: dagens planlagte økt + hva som faktisk er gjennomført (logg).
- UKENTLIG TRENING: ukens plan vs. gjennomført, pyramide-fordeling (TEK/FYS/SLAG/SPILL).
- TOTAL TRENING & BELASTNING: treningsvolum og generell belastning over tid (akutt vs.
  kronisk last), med rolig graf/heatmap. Flagg overbelastning eller for lav last.
- ÅRSPLAN / PERIODISERING: hvor i sesongen (grunntrening/spesifikk/turnering), neste fase.
- TURNERINGER: kommende og nylige turneringer + resultat, planlagt rundt.
- TRENINGSSAMLING: planlagte samlinger (NY dimensjon — design en enkel samlings-blokk i
  årsplanen + deltakerliste).
- FERIE / FRAVÆR / SKADE: perioder spilleren er borte (data finnes som «Leave»).
- SKOLE: skole-/studiebelastning og viktige datoer (NY dimensjon — for WANG-utøvere;
  design en enkel skole-kontekst-rad: skole, eksamensperioder, treningstid vs. skoletid).
- HELSE / RESTITUSJON: søvn, hvilepuls, egenrapportering — status-indikator.
- SG & FORM: SG-pyramide, siste runder, testresultater, TrackMan-trend.
- MÅL: aktive mål og status.
- KOMMUNIKASJON & OPPFØLGING: coach-notater, siste meldinger, og ÉN tydelig
  «følg opp»-handling (send melding / juster plan / book økt) — verdensklasse oppfølging
  = lett å se hva som trengs og gjøre det med ett trykk.

Designprinsipp for denne flaten: ett blikk skal svare «hvordan ligger denne utøveren an,
og hva er mitt neste trekk?» — uten å scrolle gjennom rot.

═══════════════════════════════════════════════════════════════════
5. BUSINESS / ENTREPRENØR-LAGET
═══════════════════════════════════════════════════════════════════
AgencyOS er også Anders' business-cockpit som eier:
- Økonomi: inntekt, utgift, cash flow, abonnementer/pakker — full kontroll i ett blikk.
- Reach / markedsføring + Rapporter: hvordan virksomheten vokser.
- Agent-team brukt på business-oppgaver (f.eks. «Lag markedsplan Q3», «Skriv tilbud»).
- Integrasjoner + Team: drift av selskapet.
Mål: kontroll og oversikt over ALLE deler — coach OG entreprenør OG eier — samme sted.

═══════════════════════════════════════════════════════════════════
6. KOMPLETTE USER FLOWS (design disse som sammenhengende reiser)
═══════════════════════════════════════════════════════════════════
A. DAGEN (kjerneflyt): Login → Oversikt (hva haster i dag) → Innboks/Forespørsler/
   Godkjenninger (rydd) → åpne dagens fokus-spiller (Utøver-360) → forbered/juster plan
   i Workbench → gjennomfør coaching (kalender/booking) → logg → tilbake til Oversikt.
B. UTØVER-OPPFØLGING: Spillere → Utøver-360 → se belastning/form/skole/turneringer →
   ÉN oppfølgingshandling (melding / planjustering / book) → bekreftet.
C. PLANLEGGING: Årsplan/periodisering → ukeplan → økter (drills) → publiser til spiller →
   spiller ber om justering → Godkjenninger → oppdatert.
D. AI-ARBEID: Agenter (spør) eller Agent-team (sett team på en oppgave) → resultat →
   lagre i Prosjekt / lag Oppgave → følg opp.
E. BUSINESS: Økonomi (status) → Reach/Rapporter → Agent-team på markeds-/salgsoppgave →
   leveranse.

═══════════════════════════════════════════════════════════════════
7. DESIGN-DNA — eksakte verdier, ikke gjett
═══════════════════════════════════════════════════════════════════
Mørkt «terminal»-tema (standard):
- Bakgrunn #07100C · Kort #11221A · Tekst #EAF2EC · Dempet #9DB0A4 · Kantlinje #243A2E
- Lime #D1F843 (mørk tekst #0A1F17 oppå) · OK #4FD08A · Advarsel #E8B43C · Feil #F0683E
- Fonter: Inter (UI), Inter Tight (overskrift/display), JetBrains Mono (alle tall + småetiketter)
- Ikoner: kun Lucide-stil, 1.5px strek. INGEN emoji.
- 8pt-grid. Data-tette flater (dashboard, tabeller, kalender) kan bruke 12–14px tetthet
  (Bloomberg-aktig), men hold helheten rolig.

═══════════════════════════════════════════════════════════════════
8. LEVERANSE
═══════════════════════════════════════════════════════════════════
Design hele AgencyOS i sammenhengende stil, mørkt tema, desktop ~1280px.
Prioriter i denne rekkefølgen:
1) Oversikt (cockpit) — hjertet.
2) Utøver-360 (Spiller-detalj) — verdensklasse oppfølging.
3) AI & arbeid (Agenter, Agent-team, Prosjekter).
4) Resten av modulene etter sidebaren.
Hold ADHD-føringene synlige i HVER skjerm. Følg den låste sidebaren. Marker «skole» og
«treningssamling» som nye dimensjoner som skal designes inn i Utøver-360 / årsplanen.
```

---

## Slik bruker du den (3 steg)
1. Kopier hele blokken over.
2. Lim inn i Claude Design, send.
3. Send skjermene tilbake til meg → jeg porter dem inn via design-gaten.
