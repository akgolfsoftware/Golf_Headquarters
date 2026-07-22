# Komplett plan — alle resterende oppgaver

**Dato:** 2026-07-22  
**Gren:** `design/b-pass-playerhq-agencyos` (PR #118)  
**Hard regel:** Én jobb → én inngang → én motor. Aldri duplikat.  
**For deg:** Enkel norsk, én pakke om gangen. Si **GO + pakkenummer**.

---

## 0. Hva som allerede er ferdig (ikke gjør om)

| Område | Status |
|---|---|
| PlayerHQ / AgencyOS / Forelder / Auth (produktflyt) redesign | Ferdig i app (0 GAP ruter) |
| Stats B-pass (status + primær CTA) | I PR #118 |
| Skills: AgencyOS, workbench, AgenticOS, formel, OD, designekspert v8 | På plass (+ SKILLS-GATE i HQ) |
| **TrackMan MVP** | Én import, HTML=CSV shots, snitt-TM-mål, fullsving-match |
| **Full sving-flate** i teknisk plan | Filter + TM-progresjon + import-CTA |
| **Test → TM-baseline-forslag** | PlanAction `TM_BASELINE_PROPOSE` (godkjenn) |
| **Runde:** Fortsett-kladd, UpGame synlig, lagret-CTA | Ferdig i PR |

**Siste commits (HQ):**  
`65fbabcf` docs(skills) · `5a54359c` feat(trackman) …

---

## 1. Prioritet — anbefalt rekkefølge

```
P0  Lansering / penger / tillit
P1  Flagship: Workbench + AgenticOS synlig
P2  TrackMan/teknisk plan polish (etter MVP)
P3  Runde / SG polish
P4  Marketing + offentlig stats
P5  Intern / team / OD-daemon
```

---

## 2. P0 — Må før ekte/betalende brukere

| # | Oppgave | Hvorfor | Ferdig når | Hvem |
|---|---|---|---|---|
| **P0.1** | DKIM for `send.akgolf.no` (Resend) | E-post i spam ellers | Signup/reset lander i innboks | Anders + DNS |
| **P0.2** | Aktiverings-/velkomstflyt til ~31 spillere | 0 har logget inn | Minst én spiller innlogget i prod | Anders + kode-støtte |
| **P0.3** | Stripe live-nøkler kun i Vercel (test lokalt) | Betaling 1. aug | Avklart i panel | Anders |
| **P0.4** | Beslutning: `akgolf.no` → Vercel når klar (nå Acuity) | Domene ≠ app | DNS peker riktig | Anders |
| **P0.5** | Merge PR #118 bare når du sier **merge** | Ingen stille main | PR merget / avvist | Anders |

**Anbefaling:** P0.1 → P0.2 først. Uten innlogging hjelper ikke ny kode.

---

## 3. P1 — Flagship (hovedinntekt)

### P1-A Workbench (begge roller)

| # | Oppgave | Ferdig når |
|---|---|---|
| **P1.A1** | Coach workbench: publiser → spiller ser uke uten forvirring | 1 trykk publish, spiller ser samme uke |
| **P1.A2** | Spiller workbench: kun les/utfør det som er publisert | Ingen «skjult coach-utkast» som ser ut som plan |
| **P1.A3** | Notion Calendar-planlegging (hvis fortsatt gap) | Økt lander i HQ-kalender etter kjent flyt |
| **P1.A4** | Touch/iPad DnD — manuell verifisering på din enhet | Du har dratt økt på iPad |

Skill: `workbench-planlegging`

### P1-B AgenticOS (AI trygg og synlig)

| # | Oppgave | Ferdig når |
|---|---|---|
| **P1.B1** | Godkjenningskø viser TrackMan- og test-forslag tydelig (inkl. `TM_BASELINE_PROPOSE`) | Coach/spiller forstår «hva foreslås» på 5 s |
| **P1.B2** | Godkjenn baseline fra UI (én knapp → `acceptAndApply` / apply) | Baseline flytter etter nikk, ikke bare i DB-script |
| **P1.B3** | AI-hub / Caddie: AgencyOS-navn overalt (0 «CoachHQ» i UI) | Grep UI-tekst ren |
| **P1.B4** | Daily brief bruker ferske signaler (runde + TM + test) | Brief nevner siste import/runde når data finnes |

Skill: `agenticos`

---

## 4. P2 — TrackMan / teknisk plan (etter MVP)

| # | Oppgave | Ferdig når | Notat |
|---|---|---|---|
| **P2.1** | Duplikat-advarsel ved lik session (dato+antall slag) | Modal spør «fortsett likevel?» | Lett |
| **P2.2** | Manuell override av match i import-modal (velg oppgave) | Du kan tvinge P/oppgave | UX |
| **P2.3** | Dispersjon/stabilitet kun der data finnes (eksisterende session-UI) | Ikke ny app | TM7 |
| **P2.4** | Én kanonisk TrackMan-inngang i Analyse-IA (redirect legacy) | Ingen død `/portal/trackman` | Rydd |
| **P2.5** | Whitelist-tester: UI-hint «kan sette baseline på full sving» | Etter test ser du lenke til forslag | TM5 polish |
| **P2.6** | E2E smoke: CSV → TmGoal i teknisk plan | Automatisert eller manuell sjekkliste | TM8 |

**Ikke uten GO:** GolfBox personlig runde, Arccos, HIT_RATE fra range-CSV, egen FullSving-app.

---

## 5. P3 — Runde / SG

| # | Oppgave | Ferdig når |
|---|---|---|
| **P3.1** | Live runde B-pass polish (færre trykk der det fortsatt er tungt) | Du klarer hull uten å gi opp midt i |
| **P3.2** | Hurtigmodus score (valgfri, inne i **samme** motor) | Kun hvis P3.1 fortsatt for tung — ikke ny app |
| **P3.3** | UpGame: tydelig «SG full / delvis / mangler» etter import | Oppsummering på norsk |
| **P3.4** | Round-agent: forslag synlig i AgenticOS etter runde | Du ser «forslag venter» uten å grave |
| **P3.5** | (Valgfri GO) GolfBox personlig score-import | Egen bølge |

---

## 6. P4 — Marketing + offentlig stats

| # | Oppgave | Omfang | Ferdig når |
|---|---|---|---|
| **P4.1** | Marketing B-pass / V2 der det mangler | ~forside, priser, coaching, blogg… | Konsistent med brand, én CTA-hierarki |
| **P4.2** | Stats-hub polish (utover B-pass status) | PGA, baner, spillere, verktøy… | Ikke «halvferdig»-følelse |
| **P4.3** | SEO/metatekster på nøkkel-landingssider | Etter innhold er låst | Klar for organisk trafikk |

Skill: `akgolf-design-system`, `ak-designekspert`  
**Ikke bland** med PlayerHQ-navigasjon.

---

## 7. P5 — Intern / infrastruktur / design-tooling

| # | Oppgave | Ferdig når |
|---|---|---|
| **P5.1** | Open Design daemon (Node-modul mismatch 145 vs 115) | OD MCP fungerer på maskinen din |
| **P5.2** | Team WANG / GFGK junior merkevaresider polish | Egen stil OK, ikke PlayerHQ-kopi |
| **P5.3** | Intern komponent-lab / Meg-assistent | Kun internt |
| **P5.4** | claude-config sync: løs stuck rebase på `~/.claude` | Auto-sync grønn igjen |
| **P5.5** | `/portal/ny-okt` ekte Prisma-lagring (hvis fortsatt stub) | Økt lagres i DB |

---

## 8. Skills — status og lagring

| Skill | Hvor | Status |
|---|---|---|
| agencyos-arkitektur, agenticos, workbench-planlegging, ak-formel-drills, open-design-sync | `~/.claude/skills/` | Finnes på disk |
| playerhq-arkitektur, playerhq-live-session, akgolf-design-system | `~/.claude/skills/` | Oppdatert |
| coachhq-* | `~/.claude/skills/` | DEPRECATED redirect |
| ak-designekspert v8 | `akgolf-hq/.claude/skills/` | **Committed + pushet** `65fbabcf` |
| SKILLS-GATE.md | `docs/design-system/plattform-design-2026-07-21/` | **Committed + pushet** |

**Merk:** `~/.claude` git er midt i en **rebase** (auto-sync). Skills ligger lokalt; remote-sync kan henge. Pakke **P5.4** rydder det.

### Skill-bruk ved implementasjon (rekkefølge)

1. akgolf-design-system  
2. ak-designekspert  
3. playerhq-arkitektur **eller** agencyos-arkitektur  
4. workbench-planlegging  
5. ak-formel-drills  
6. agenticos  
7. playerhq-live-session  
8. open-design-sync  
9. verify-og-commit  

---

## 9. Leveransebølger (praktisk)

| Bølge | Innhold | Si |
|---|---|---|
| **Nå** | Skills i HQ ✅ | — |
| **L1** | P1.B1–B2 (godkjenning TM-baseline i UI) | `GO L1` |
| **L2** | P1.A1–A2 (workbench publish-sløyfe) | `GO L2` |
| **L3** | P2.1–P2.2 + P2.6 (import polish + smoke) | `GO L3` |
| **L4** | P3.1 + P3.3–P3.4 (runde polish) | `GO L4` |
| **L5** | P0 med deg (DKIM, aktivering, Stripe, DNS) | `GO L5` + din panel-tid |
| **L6** | P4 marketing/stats | `GO L6` |
| **L7** | P5.1 OD + P5.4 claude-config | `GO L7` |

**Anbefalt neste:** **L1** (liten, synlig, lukker test→full sving-løkka) deretter **L2**.

---

## 10. Suksess for «plattform klar nok»

1. Spiller kan logge inn og se **publisert** uke.  
2. Coach kan godkjenne AI-forslag (inkl. TM-baseline) uten å miste tillit.  
3. TrackMan-import oppdaterer full sving-tallene korrekt.  
4. Runde kan fortsettes og importeres uten to konkurrerende apper.  
5. E-post og betaling er avklart før 1. august.  
6. PR #118 merget bare på ditt **merge**.

---

## 11. Eksplisitt utenfor scope (til du sier GO)

- Ny FullSving-app / tabell  
- GolfBox/Arccos som full runde-pipeline  
- Force-push til main  
- Auto-endring av teknisk plan uten godkjenning  

---

## 12. Start

Si f.eks.:

- **`GO L1`** — godkjenning TM-baseline i UI  
- **`GO L2`** — workbench publish-sløyfe  
- **`GO L5`** — vi tar P0 sammen (du gjør panel, jeg forbereder sjekklister/kode)  
- **`merge 118`** — kun når du vil flette til main  

Eller: **én setning** om hva som haster mest for deg denne uka.
