# AgencyOS — hva det er og hva det gjør

> Komplett beskrivelse av AgencyOS slik det skal være etter at det nye AI- og
> kommandosenter-laget (bygget på `/kommando`) **merges inn i den eksisterende
> AgencyOS** (`/admin`). Ikke en separat app — ett operativsystem.
> Relatert: `docs/ak-agency-os-plan.md`, `docs/ak-agency-os-claude-design-prompt.md`.

## Kort: hva AgencyOS er

AgencyOS er Anders' operativsystem for å drive AK Golf Group. Ett sted der han
gjør **to ting som før var adskilt i hodet**:

1. **Driver coaching-virksomheten** — spillere, økter, planer, bookinger, analyse, økonomi.
2. **Styrer sin egen dag og sine AI-verktøy** — chat med flere AI-er, AI-team som løser oppgaver, egne oppgaver og prosjekter.

Det vi bygde som «AK Agency OS» på `/kommando` (Dashboard, Agenter, Oppgaver,
Kalender, Prosjekter, Agent-team) er **AI- og kommandosenter-laget**. Det er ikke
en ny app ved siden av — det **merges inn i AgencyOS** og blir den agentiske
ryggraden i coach-appen Anders allerede bruker.

## Hva det gjør — i klartekst

- Samler alt Anders trenger for å drive virksomheten på **ett sted**.
- Lar ham **snakke med flere AI-er** (Claude, Gemini, Grok, Ollama) — hver med sin rolle.
- Lar ham sette **AI-team** til å løse en oppgave sammen (research → utkast → gjennomgang).
- Holder **oversikt over dagen**: avtaler, oppgaver, frister, hva som haster.
- Kobler arbeidet til **spillere og prosjekter**, så ingenting faller mellom stoler.
- Er **designet for ADHD**: én ting i fokus, rolig flate, «hva nå?» alltid synlig.

## Modulene (det merget AgencyOS)

Følger den eksisterende sidebar-strukturen. **Fet** = nytt lag som merges inn.

**Daglig**
- **Oversikt (cockpit)** — hjemskjerm: dagens bilde, hva haster, AI-status, fremdrift på team.
- Min uke · **Oppgaver** · Tildelt meg — personlige oppgaver. Oppgaver-modulen fra
  kommandosenteret (prosjekt-kobling + frist) **merges inn her** — samme sted, ikke duplikat.

**Stall & talent**
- Spillere · Stall · Grupper · Talent (radar / sammenligning / WAGR-import).

**Operasjon**
- Workbench (all planlegging) · Handlingssenter · Planlegge (treningsplaner, maler,
  drill-bibliotek, økter, teknisk plan, turneringer) · Gjennomføre (kalender, bookinger
  & kapasitet, anlegg, tilgjengelighet, tjenester, TrackMan, opptak).
- Kalender-modulen fra kommandosenteret er **samme kalender** (`/admin/kalender`) —
  ingen ny kalender, men den viser nå også AI-relevante oppgavefrister.

**Analyse**
- Stall-analyse · Risiko · Lag-snitt · Tester · Runder · Compliance · Reach · Rapporter.

**AI & arbeid (det nye laget som merges inn)**
- **Agenter (chat)** — snakk med Claude / Gemini / Grok / Ollama, hver med rolle.
  Utvider dagens Caddie fra én modell til flere.
- **Agent-team** — flere AI-er jobber sekvensielt på én oppgave (Research → Utkast →
  Gjennomgang) med live fremdrift. Bygger på dagens `/admin/agents` + Caddie.
- **Prosjekter** — samle oppgaver og AI-arbeid under et prosjekt.

**Innboks**
- Forespørsler · Godkjenninger · Meldinger.

**System**
- Økonomi · Team · Integrasjoner · AI-agenter (bakgrunns-agenter) · E-postmaler ·
  Audit-logg · Innstillinger.

## AI-laget samlet — kjernen i merge

AgencyOS har **allerede** AI på tre nivåer i dag:
1. **Caddie** — assistenten i cockpiten (chat mot Claude, kan foreslå handlinger du godkjenner).
2. **Bakgrunns-agenter** (`/admin/agents`) — round-agent, test-agent, trackman-agent m.fl.
   som jobber automatisk i bakgrunnen.
3. **Godkjenningsflyt** — AI foreslår, Anders godkjenner.

Det nye laget legger til:
- **Flermodell-chat** (ikke bare Claude — også Gemini, Grok, lokal Ollama).
- **Agent-team** (flere AI-er på én oppgave, med synlig fremdrift).
- **Personlige oppgaver + prosjekter** som AI-arbeidet kan knyttes til.

**Merge = disse smelter til ÉN agentisk flate**, ikke to konkurrerende «AI-steder».
Caddie + Agenter + Agent-team + bakgrunns-agenter = AgencyOS' samlede AI-lag.

## Hvordan merges det konkret (status + neste steg)

I dag lever det nye laget på `/kommando` (egen test-flate, Etappe 1–3 bygget og verifisert).
**Merge** betyr å folde det inn under `/admin` (AgencyOS) og dedupe mot det som finnes:

| Nytt lag (/kommando) | Merges inn i AgencyOS som |
|---|---|
| Oppgaver | `/admin/workspace/oppgaver` (finnes) — utvides med prosjekt + frist |
| Kalender | `/admin/kalender` (finnes) — viser også AI-/oppgavefrister |
| Agenter (chat) | Utvidet Caddie / egen «Agenter»-flate i AgencyOS |
| Agent-team | Ny flate, knyttet til `/admin/agents` |
| Prosjekter | Ny flate i AgencyOS |
| Dashboard-paneler | Foldes inn i Oversikt-cockpiten |

Selve kode-merge-en er en egen jobb. Denne beskrivelsen er **målet** den jobber mot.

## Hvorfor — ADHD

Ett OS, ikke fem apper. Én hjemskjerm som sier «hva nå». AI som faktisk **gjør**
jobber, ikke bare svarer. Rolig, forutsigbart, med synlig fremdrift — så det er lett
å gjennomføre og følge opp, ikke bare starte.
