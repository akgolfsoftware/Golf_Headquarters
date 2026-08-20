# Plan — treningsplanlegging: fra spec til ferdige skjermer

**Skrevet:** 20.08.2026, bestilt av Anders samme dag. **Utførende modell for kodefasene:
Opus 5** (Anders' beslutning 20.08). Denne planen styrer treningsplanleggings-sporet;
skjermporten generelt styres fortsatt av `docs/port/PORTPLAN.md`, og totalbildet av
`docs/MASTERPLAN-GJENSTAAENDE.md` — denne planen erstatter ingen av dem, den kobler
spec-arbeidet inn i dem.

**Kildene (leses av hver utførende økt før arbeid):**
`docs/spec-treningsplanlegging-2026-08-19.md` (fasit for alt besluttet) ·
`docs/analyse-treningsplanlegger-2026-08-20.md` (v1-fasering, risikoer) ·
`docs/gap-evaluering-treningsplanlegging-2026-08-20.md` (relevans-matrise, AI-kartlegging) ·
`docs/FASIT-AK-GOLF-HQ.md` (vokabular) · `.claude/rules/gotchas.md` (før all kode).

---

## Fase 0 — Lukk spec-en (1–2 økter, kan starte umiddelbart)

| # | Leveranse | Gate |
|---|---|---|
| 0.1 | Revidert relevans-matrise: motorikk kun fullsving, puttingdimensjoner på alle puttebånd, forslag til bunker-/fullsving-dimensjoner | Anders korrigerer og godkjenner |
| 0.2 | Lukke de åpne punktene: motorikk-erstatning i datamodellen, innsyn bakover ved gruppe-exit, FYS-programmet manuelt i v1 | Anders svarer |
| 0.3 | FYS-øvelsesbank-listen (120–150 standardøvelser, dokument til gjennomsyn) | Anders stryker/legger til |
| 0.4 | Spec markeres **KOMPLETT** + ny seksjon «Kontrakt for bygging» (hva v1 er, rett fra analysens fasering) | Anders sier «spec komplett» |

Varslinger/signal-lag står bevisst utenfor (utsatt av Anders 20.08) — planlegges i egen
runde, blokkerer ikke fase 1–3.

## Fase 1 — Grunnmur i kode (Opus 5 — ingen skjermer, kun datamodell og domene)

| # | Leveranse |
|---|---|
| 1.1 | Én øktfamilie: V2-løpet (`TrainingSessionV2` → drill → logg) gjøres kanonisk; dobbeltskriving til de andre familiene fryses og fjernes |
| 1.2 | v2-vokabular i skjema: nytt belastning-felt, typet 17-område (aldri fri tekst), Paper press-navn, motorikk kun på fullsving-områder, puttingdimensjoner som typet enum |
| 1.3 | Teknisk plan: målmatrise motorikk × belastning per arbeidsoppgave, auto-telling mot riktig celle, statusfelter for den løpende statusrapporten, hovedcoach-varselkrok |
| 1.4 | Gruppesynk: `sourceGroupSessionId` + `groupId` + `detachedAt` på øktkopien, løsrivelses-regelen i `src/lib/domain/`, kun-fremover ved innmelding |
| 1.5 | Øktstatus med årsak (avlyst/slettet/hoppet over), spontan-drill-merke, hovedcoach-felt, fasilitetsfelter (rangelengde, maks puttelengde, muligheter) |
| 1.6 | Migrering kirurgisk via `db execute` (gotchas §Schema-endringer — aldri migrate dev/db push/deploy), enhetstester per domenemodul |

**Gate:** `npm run verify` + `npm test` grønt. Ingen synlig UI-endring i denne fasen.
Alle «KRITISK»-radene fra AI-kartleggingen (gap-evalueringen §2) skal være fanget her —
det er dataene v2-AI-en aldri kan rekonstruere i etterkant.

## Fase 2 — Nytt Workbench-design i Claude Design (Anders + Claude, FØR skjermkode)

Wireframe-først-regelen gjelder: ingen skjerm kodes uten tegnet fasit. Designet gjøres i
Claude Paper-prosjektet (`605a48cc`), zip leveres, speilet resynkes.

| # | Leveranse |
|---|---|
| 2.1 | Claude lager design-brief fra spec-en — komplett skjermliste med innhold, tilstander og Paper-krav, klar til å limes inn i Claude Design |
| 2.2 | Anders kjører designet i Claude Design; skjermene tegnes m390 + d1280, lys + mørk |
| 2.3 | Zip → resynk `designsystem/paper/` + `SYNC-STATUS.md` + én MCP-sammenligning (CLAUDE.md-regelen mot utdatert zip) |

**Skjermene som må tegnes (fra spec-en):**

1. Workbench-kalender: uke (mobil-standard) + måned (desktop) + årstidslinje med perioder,
   blokk-merker (fritt datospenn), turneringer og tester; pyramidefarger; gruppemerking
2. Periodemal-flyten: grovplanlegg med antall økter per pyramide → skall-økter med merkelapp
3. Økt-editoren: relevans-styrte felter (putt-drill viser aldri motorikk), teknisk oppgave
   inn i økt, testprotokoll inn i økt
4. Teknisk utviklingsplan: slag → P-posisjon → arbeidsoppgave, drag-and-drop-prioritet,
   fargekoden, målmatrisen, den løpende statusrapporten (spredning i tre kontekster)
5. Live-økt v2: drill-kort med alt planlagt, timere, +5/+10/+25, hopp over/spontan/talenotat,
   FYS-serielogging (reps + vekt), oppsummeringskortet
6. Gruppeplanlegging i AgencyOS + «fra hvilken gruppe»-merking i spillerens kalender
7. Spillerprofilen: teknisk plan-status, testhistorikk, mål, medier, grupper/«hvem ser deg»
8. Standard/Tour-toggle i innstillinger + onboarding-tillegget (treningstid, fasiliteter
   med fysiske mål)

**Gate:** fasit-HTML finnes for alle åtte før fase 3 starter.

## Fase 3 — Port til kode (Opus 5 — én økt per mal-fasit, PORTPLAN-regimet)

| # | Innhold |
|---|---|
| 3.1 | Følger PORTPLAN-regimet fullt ut: mal-sesjoner, avvikslinjer, variantruter åpner aldri fasit-HTML, komponent-oppslag i repoet |
| 3.2 | Rekkefølge for dette sporet: Workbench-kalender → økt-editor → teknisk plan → live-økt → gruppe → spillerprofil → onboarding/toggle |
| 3.3 | Skjermbilde-gaten per skjerm: 390px først, deretter 1280px, lys OG mørk, fire tilstander, klikkverifisert, fasit ved siden — Anders skal SE hver skjerm før merge |
| 3.4 | Git per sesjon: gren → verify → PR → Anders' ja → merge → slett gren. Aldri main uten ja |
| 3.5 | Resten av PORTPLAN (B2–B6-sesjonene utenfor dette sporet) fortsetter i samme regime etterpå eller parallelt i egne økter |

## Fase 4 — Verifisering og idriftsetting

| # | Innhold |
|---|---|
| 4.1 | e2e for kjerneflyten: planlegg → live-økt → auto-telling → analyse; offline-test av live-økta |
| 4.2 | Analysekortene v1: Treningsmiksen (pyramide × område, plan mot faktisk) + P-progresjonen |
| 4.3 | Gruppene legges ferdig inn (WANG Toppidrett, GFGK-gruppene, Academy) — spillere godkjent i gruppe FØR lansering |
| 4.4 | Prod-røyktest + skjermbilde-runde til Anders |

## Modell- og øktdisiplin

- **Opus 5** utfører fase 1 og 3 (Anders' beslutning 20.08). Fase 0 og design-briefen i
  fase 2 kan gjøres av inneværende økt-modell. Anders kjører selve designet i Claude Design.
- Én økt per fase-del, maks 2 timer, `/lagre-sesjon` + `/clear` mellom. Aldri to fasedeler
  i samme økt.
- Hver utførende økt starter med å lese kildene øverst i dette dokumentet + relevant
  PORTPLAN-seksjon. Ingen økt antar noe spec-en ikke sier — uavklart = spør Anders.

## Beslutningskø til Anders (gatene i rekkefølge)

1. Godkjenne denne planen
2. Fase 0: korrigere relevans-matrisen · svare på de åpne punktene · godkjenne
   FYS-øvelseslisten · si «spec komplett»
3. Fase 2: kjøre Workbench-designet i Claude Design og levere zip
4. Fase 3: se og godkjenne hver skjerm (skjermbilde-gaten) + ja til hver merge
