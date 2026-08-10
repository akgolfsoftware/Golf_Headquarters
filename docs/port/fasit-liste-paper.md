# Steg 2 — fasit-listen: Paper-skjerm ↔ ekte rute

**Skrevet:** 02.08.2026 · **Oppdatert:** 2026-08-10 (tegningen er FERDIG — W1–W6 er alle
tegnet, 79 fasit-HTML. Tallene under sto på «25 av 343» fra 06.08 og var da over fire dager
utdaterte).
**Gjelder:** steg 2 i `docs/port/plan-designport-alle-skjermer.md`.
**Denne fila** = fasit ↔ rute. **`portstatus-paper.md`** = hva som er portet og godkjent.
**Styrende plan er ikke lenger denne** — det er `PIXEL-PERFECT-PLAN-COMPLETE.md` (PP-0…PP-10).

Kilder: Claude Design-prosjektet `605a48cc` (hentet via `claude-design`-MCP, sist listet
**2026-08-10**) og speilet `designsystem/paper/`. Speilet er verifisert i synk med prosjektet
samme dag: 33 filer i `fase1/`, 46 i `fase2/`, 8 templates — samme filer begge steder.
Designprosjektets `kart/wf/` og `uploads/` er IKKE kilde, og `templates/` er strukturreferanse
(shell-fasit), ikke egne skjermer — designeren har merket den gamle bruken utgått
(`templates/_UTGÅTT.md`, 01.08.2026).

---

## Det korte svaret (2026-08-10)

| | Antall |
|---|---:|
| **Tegnede Paper-fasitskjermer** | **79** — 33 i `fase1/` + 46 i `fase2/` |
| …av disse i fase2 | PlayerHQ 30 · AgencyOS 6 · marketing 2 · auth 2 · WANG 2 · GFGK 2 · forelder 1 · system 1 |
| Templates (shell-fasit, ikke egne ruter) | 8 |
| Komponenter i biblioteket | 138 |
| **Tegning gjenstående** | **0 for in-scope** — W1–W6 er alle tegnet |
| **Pixel-signert av Anders** | **0 av 79** |
| Kodet chrome, ikke signert (`[~]`) | 52 |
| Ikke bygget (`[ ]`) | 35 (inkl. de 8 templates-radene) |

**Dekningen er ikke lenger «25 av 343».** Strategien endret seg 09.08: kjernen (fase1 + W1 + W2)
har 1:1-fasit, og resten dekkes av **maler** — 6 maler i W3 dekker 17 Meg/Booking-ruter, 6 i W4
dekker admin-restene, 6 i W5 dekker ~63 marketing/auth/forelder/system-ruter. Én tegnet mal +
variant-sjekk per rute erstatter én tegning per skjerm. Derfor er 79 fasit nok til å dekke alle
**in-scope** ruter.

**Eksplisitt utenfor** (se `PIXEL-PERFECT-PLAN-COMPLETE.md` §1.2): `(marketing)/stats/*` (~45),
drift/AgenticOS-dyp (~14), redirect-stubber, `(legacy)/*` som erstattes, og interne demoer.

**Flaskehalsen er sign-off, ikke tegning og ikke kode.** Ingen skjerm har kryss. Sign-off krever
skjermbilder side om side mot fasit — og de kan per 10.08 ikke lages mot en Vercel-preview, fordi
Preview-miljøet mangler `DATABASE_URL` (alle DB-sider svarer 500). Se `NATTRAPPORT-2026-08-10.md`
og PR #389/#390.

Tallgrunnlaget under (343 skjermer, tabellen i §«Hva som IKKE har fasit») er **historikk fra
05.–06.08** og er beholdt for sporbarhet. Det er ikke re-talt mot kode etter at mal-strategien
ble innført, og skal ikke brukes som dekningsregnskap lenger.

**Endring siden 02.08.2026:** 8 nye fasitskjermer levert av designeren — 6 i PlayerHQ
Gjennomføre/live-økt-familien (som sto med **0 fasit** i tabellen under §Hva som IKKE har
fasit) + AgencyOS AK-stigen og Live-session:

| Ny Paper-fil | Ekte rute | Levert |
|---|---|---|
| `playerhq-live-brief.html` | `/portal/(fullscreen)/live/[sessionId]/brief` | 04.08.2026 |
| `playerhq-live-okt.html` | `/portal/(fullscreen)/live/[sessionId]/active` | 04.08.2026 |
| `playerhq-live-summary.html` | `/portal/(fullscreen)/live/[sessionId]/summary` | 04.08.2026 |
| `playerhq-runde-live.html` | `/portal/(fullscreen)/runde/live` | 04.08.2026 |
| `playerhq-runde-logg.html` | `/portal/(fullscreen)/runde/logg` | 04.08.2026 |
| `playerhq-test-gjennomfor.html` | `/portal/(fullscreen)/tren/tester/[testId]/gjennomfor` | 04.08.2026 |
| `agencyos-ak-stigen.html` | `/admin/agencyos/ak-stigen` (ny rute 2026-08-06, PR #343) | ~03.08.2026 |
| `agencyos-live-session.html` | `/admin/agencyos/live` (PR #341) | ~03.08.2026 |

De seks første lukker **6 av 8** skjermer i «PlayerHQ · Gjennomføre»-raden som tidligere hadde
0 fasit (se tabell §Hva som IKKE har fasit — oppdatert under). Gjenstår uten fasit i den
familien: `logger` og `tapper`-rutene under `live/[sessionId]/` (ingen fasit tegnet ennå).
De to siste (ak-stigen, live-session) har ingen tilsvarende rute i appen i dag — avklares
som del av steg 8/9-planlegging, ikke rutet inn her på gjetning.

---

## De 33 fasitskjermene og rutene de svarer til

### PlayerHQ (5 filer → 5 ruter)

| Paper-fil | Ekte rute | Merknad |
|---|---|---|
| `playerhq-chat-desktop.html` | `/portal` | Hjem, chat-først |
| `playerhq-chat-mobil.html` | `/portal` | samme rute, mobil |
| `playerhq-plan.html` | `/portal/planlegge` | |
| `playerhq-analyse.html` | `/portal/analysere` | 5-fane analyseflate |
| `playerhq-meg.html` | `/portal/meg` | |
| `playerhq-booking.html` | `/portal/booking` | |

### AgencyOS (13 filer → 9 ruter)

| Paper-fil | Ekte rute | Merknad |
|---|---|---|
| `agencyos-konsoll-desktop.html` | `/admin/agencyos` | cockpit |
| `agencyos-konsoll-mobil.html` | `/admin/agencyos` | samme rute, mobil |
| `agencyos-innboks.html` | `/admin/innboks` | |
| `agencyos-innboks-mobil.html` | `/admin/innboks` | samme rute, mobil |
| `agencyos-kalender.html` | `/admin/kalender` | |
| `agencyos-kalender-mobil.html` | `/admin/kalender` | samme rute, mobil |
| `agencyos-spillere.html` | `/admin/spillere` | stall-lista |
| `agencyos-spillere-mobil.html` | `/admin/spillere` | samme rute, mobil |
| `spillerprofil.html` | `/admin/spillere/[id]` | spiller-detalj |
| `agencyos-okonomi.html` | `/admin/agencyos/okonomi` | NB: `/admin/okonomi` og `/admin/finance` er begge rene redirects hit |
| `agencyos-innstillinger.html` | `/admin/settings` | `/admin/organisasjon` redirecter hit |
| `agencyos-agenticos.html` | `/admin/agent-team` | AI-laget. Se åpent punkt 1 under |
| `workbench-turnering.html` | `/admin/turnering-kart` eller `/admin/tournaments` | Se åpent punkt 2 |

### Workbench (2 filer → 1 rute, delt komponent)

| Paper-fil | Ekte rute | Merknad |
|---|---|---|
| `workbench-desktop.html` | `/admin/spillere/[id]/workbench` | samme `WorkbenchV2`-komponent som spillersiden |
| `workbench-mobil.html` | `/portal/planlegge/workbench` | mobilvarianten er spillerens inngang til samme komponent |

Workbench er hevstangen i hele porten: én komponent, to inngangsruter, og den er kjernen i både
PlayerHQ Planlegge og AgencyOS Planlegge.

### Fellesflater (3 filer → 3 ruter)

| Paper-fil | Ekte rute |
|---|---|
| `innlogging.html` | `/auth/login` |
| `foreldreportal.html` | `/forelder` |
| `booking.html` | `/booking` (marketing) |

### PlayerHQ Gjennomføre/live-økt (6 filer → 6 ruter, nye 04.08.2026)

| Paper-fil | Ekte rute |
|---|---|
| `playerhq-live-brief.html` | `/portal/(fullscreen)/live/[sessionId]/brief` |
| `playerhq-live-okt.html` | `/portal/(fullscreen)/live/[sessionId]/active` |
| `playerhq-live-summary.html` | `/portal/(fullscreen)/live/[sessionId]/summary` |
| `playerhq-runde-live.html` | `/portal/(fullscreen)/runde/live` |
| `playerhq-runde-logg.html` | `/portal/(fullscreen)/runde/logg` |
| `playerhq-test-gjennomfor.html` | `/portal/(fullscreen)/tren/tester/[testId]/gjennomfor` |

`/portal/(fullscreen)/live/[sessionId]/logger` er alias for `active` (stubbe-funn i W1) —
`tapper` fikk fasit i W1, se neste seksjon.

### W1-wireframes, batch-godkjent av Anders 05.08.2026 (11 filer → 11 ruter)

Tegnet i `fase2/playerhq/` i Claude Design (605a48cc) etter konsolideringsgaten
(18 → 11 skjermer, fire vedtak — se `docs/port/skjermplan-tegnet-og-wireframe.md` §W1).
Godkjent wireframe = fasit, samme status som `fase1/`-filene.

| Paper-fil (fase2/playerhq/) | Ekte rute | Merknad |
|---|---|---|
| `playerhq-okt-detalj.html` | `/portal/gjennomfore/[id]` | Slått sammen med `/portal/tren/[sessionId]/planlagt` — én økt-detalj med planlagt/gjennomført-tilstand |
| `playerhq-live-tapper.html` | `/portal/(fullscreen)/live/[sessionId]/tapper` | |
| `playerhq-feiring.html` | `/portal/tren/feiring/[planId]` | |
| `playerhq-fys-plan.html` | `/portal/tren/fys-plan` | FYS-score er ærlig plassholder — formelen avventer |
| `playerhq-teknisk-plan.html` | `/portal/tren/teknisk-plan/[planId]` | |
| `playerhq-tester-hub.html` | `/portal/tren/tester` | Testantall (20/21/25) fortsatt uavklart — blokkerer PR-E-koding, ikke fasiten |
| `playerhq-test-detalj.html` | `/portal/tren/tester/[testId]` | `/ny` og `/ny/egen` utgår — flyttet inn i Workbenchs Testbatteri-ark |
| `playerhq-turneringer.html` | `/portal/tren/turneringer` | |
| `playerhq-turnering-detalj.html` | `/portal/tren/turneringer/[id]` | |
| `playerhq-drills.html` | `/portal/drills` | `tren/ovelser` (+ `/[id]`) er redirects hit |
| `playerhq-drill-detalj.html` | `/portal/drills/[id]` | |

**Konsolideringsvedtak (Anders' ja per punkt, 05.08):** `/portal/gjennomfore` utgår (Hjem +
Plan dekker den, ruten blir redirect) · økt-detalj-rutene slått sammen · tester 4 → 2 ·
`/portal/planlegge/bygger` utgår (chat + Workbench dekker planbygging).

### Ikke en skjerm (1 fil)

| Paper-fil | Hva det er |
|---|---|
| `fangstsheet.html` | Komponentkort, ikke en rute. Hører til steg 5 (byggeklosser), ikke steg 7–9 |

### Tidligere uten rute — nå portet (2026-08-06)

| Paper-fil | Rute nå | PR |
|---|---|---|
| `agencyos-ak-stigen.html` | `/admin/agencyos/ak-stigen` | #343 |
| `agencyos-live-session.html` | `/admin/agencyos/live` | #341 |
| `workbench-turnering.html` | Zoom «Turnering» i WorkbenchV2 (ikke egen tournaments-rute) | #342 |
| `fangstsheet.html` | Komponent `FangstModal` (fortsatt ikke egen rute) | #344 |

---

## Hva som IKKE har fasit — de 318 (HISTORIKK 05.08, ikke gjeldende)

> ⚠ **Utdatert siden 09.08.2026.** Denne seksjonen ble skrevet før W2–W6 ble tegnet og før
> mal-strategien. Alle radene under har nå fasit, enten 1:1 eller via mal. Beholdt for
> sporbarhet — bruk §«Det korte svaret» øverst som dekningsregnskap.

Per seksjon, ekte skjermer uten en tegnet Paper-skjerm. **NB: tabellen er opptellingen fra
05.08 morgen — W1-godkjenningen samme kveld er IKKE regnet inn i radene.** For
Gjennomføre- og Planlegge-radene er §W1 over fasit: W1 dekket 12 av de tilsammen 35
skjermene i de to radene og vedtok at 4 utgår/slås sammen. Radene re-telles mot kode når
W1-konsolideringen er kodet (per bølge-leveransen i skjermplanen), ikke her på forhånd —
mobil/desktop-par, redirects og sammenslåinger gjør at fil→rad ikke er 1:1. Resten av
tabellen er ikke re-kartlagt mot kode og kan selv være noe stale:

| Område | Ekte skjermer | Har fasit | Uten fasit |
|---|---:|---:|---:|
| PlayerHQ · Analysere | 41 | 1 | 40 |
| PlayerHQ · Meg | 28 | 1 | 27 |
| PlayerHQ · Planlegge | 25 | 2 | 23 |
| PlayerHQ · Coach | 20 | 0 | 20 |
| PlayerHQ · Gjennomføre | 18 | **6** | **12** |
| PlayerHQ · Booking | 7 | 1 | 6 |
| PlayerHQ · Talent | 5 | 0 | 5 |
| PlayerHQ · Aliaser | 5 | 0 | 5 |
| PlayerHQ · Hjem | 2 | 1 | 1 |
| AgencyOS · Stall | 30 | 2 | 28 |
| AgencyOS · Admin | 19 | 1 | 18 |
| AgencyOS · Planlegge | 19 | 1 | 18 |
| AgencyOS · Oversikt | 18 | 2 | 16 |
| AgencyOS · Gjennomføre | 15 | 1 | 14 |
| AgencyOS · Innsikt | 14 | 0 | 14 |
| AgencyOS · Min uke | 4 | 0 | 4 |
| AgencyOS · Meg | 2 | 0 | 2 |
| Marketing | 41 | 1 | 40 |
| Forelder | 12 | 1 | 11 |
| Auth | 11 | 1 | 10 |
| System og interne | 7 | 0 | 7 |
| **Sum** | **343** | **25** | **318** |

Tre områder har fortsatt null fasit i det hele tatt: **PlayerHQ Coach** (20),
**AgencyOS Innsikt** (14) og **AgencyOS Min uke** (4). **PlayerHQ Gjennomføre** har ikke
lenger null — 6 av 18 er dekket siden 04.08.2026 (se §PlayerHQ Gjennomføre/live-økt over).

WANG (`team-wang`) og GFGK (`gfgk-junior`) var ikke egne rader i skjermopptellingen og
mangler både fasit og oppføring.

---

## Hva dette betyr nå (oppdatert 2026-08-10)

Bølgetabellen som sto her («7 — PlayerHQ 151 skjermer, 23 med fasit …») er **utgått**. Den
regnet én tegning per skjerm, og konkluderte med at «93 % av skjermene har ingen fasit å måle
mot». Begge deler er passert:

- **W1–W6 er tegnet.** Ingen in-scope skjerm mangler fasit lenger.
- **Mal-strategien løste volumet.** 18 maler (6 i W3, 6 i W4, 6 i W5) dekker de ~100 rutene som
  ellers ville krevd hver sin tegning. Metoden er: implementer malen 100 % pixel, så arver alle
  ruter som deler den layouten — deretter en kort variant-sjekk per rute (tittel, tom tilstand,
  primær handling).
- **Steg 7–9-strukturen er avløst av PP-0…PP-10.** Se `PIXEL-PERFECT-PLAN-COMPLETE.md`.

Det som står ved lag fra den gamle konklusjonen er poenget om byggeklossene: er primitivene i
`components/` og reglene i `guidelines/` riktige, blir skjermene riktige uten at hver enkelt
måles for seg. Det er nettopp det mal-pixel bygger på.

---

## Åpne punkter

1. **`agencyos-agenticos.html` → hvilken rute?** AI-laget finnes i dag spredt på `/admin/agent-team`,
   `/admin/agents`, `/admin/godkjenninger` og `/admin/agencyos` (AI-dispatch-panelet). Fasitskjermen
   ser ut til å samle dem. Om det er en ny samleflate eller en redesign av `/admin/agent-team` er
   ikke avgjort — det er en produktbeslutning, ikke en designbeslutning.
2. **`workbench-turnering.html` → hvilken rute?** Turneringer finnes både som `/admin/tournaments`,
   `/admin/turnering-kart` og `/portal/tren/turneringer`. Filnavnet plasserer den i Workbench, men
   ingen av dagens ruter heter det.
3. **WANG og GFGK mangler i skjermopptellingen.** Bør telles med før bølge 9, ellers blir de
   glemt — de er ikke med i de 343.
