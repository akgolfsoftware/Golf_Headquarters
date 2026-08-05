# Steg 2 — fasit-listen: Paper-skjerm ↔ ekte rute

**Skrevet:** 02.08.2026 · **Oppdatert:** 05.08.2026 (re-kjørt mot Claude Design-prosjektet
`605a48cc`, som nå er ENESTE kilde — ikke en lokal speil-mappe, se `README.md` i denne mappa).
**Gjelder:** steg 2 i `docs/port/plan-designport-alle-skjermer.md`.
**Endrer ingen skjerm.** Dette er kun en opptelling.

Kilder: Claude Design-prosjektet `605a48cc` → `fase1/` (hentet via `claude-design`-MCP,
sist listet 05.08.2026) og `docs/MASTER-SKJERMPLAN.md`. Designprosjektets `templates/`,
`kart/wf/` og `uploads/` er IKKE kilde — designeren har selv merket dem historikk/utgått
(`templates/_UTGÅTT.md`, 01.08.2026).

---

## Det korte svaret

| | Antall |
|---|---:|
| Ekte skjermer i appen (redirect og utgåtte rader trukket fra) | **343** |
| Rader i MASTER-SKJERMPLAN totalt | 375 |
| …av disse ren redirect eller utgått | 32 |
| Paper-fasitskjermer på disk | **33** (opp fra 25 — 8 nye siden 02.08, se under) |
| Ekte ruter disse 32 dekker (mobil + desktop av samme rute teller én gang; 2 filer uten rute trukket fra) | **25** |
| Skjermer som må designes uten fasit | **318** |

**Dekningsgrad: 25 av 343 skjermer — 7,3 %.**

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
| `agencyos-ak-stigen.html` | Ingen ekte rute ennå — ny flate, ikke i MASTER-SKJERMPLAN | ~03.08.2026 |
| `agencyos-live-session.html` | Ingen ekte rute ennå — trolig coach-siden av live-økt, ikke bekreftet mot kode | ~03.08.2026 |

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

`/portal/(fullscreen)/live/[sessionId]/logger` og `/tapper` har fortsatt ingen fasit.

### Ikke en skjerm (1 fil)

| Paper-fil | Hva det er |
|---|---|
| `fangstsheet.html` | Komponentkort, ikke en rute. Hører til steg 5 (byggeklosser), ikke steg 7–9 |

### Uten ekte rute i dag (2 filer)

| Paper-fil | Merknad |
|---|---|
| `agencyos-ak-stigen.html` | Ny flate (juniorvisning AK-stigen), ikke i MASTER-SKJERMPLAN eller kode i dag |
| `agencyos-live-session.html` | Trolig coach-siden av live-økt; ingen tilsvarende rute funnet i `src/app/admin` |

---

## Hva som IKKE har fasit — de 318

Per seksjon, ekte skjermer uten en tegnet Paper-skjerm (oppdatert 05.08.2026 — kun
PlayerHQ Gjennomføre-raden er endret, resten er ikke re-kartlagt mot kode og kan selv
være noe stale):

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

WANG (`team-wang`) og GFGK (`gfgk-junior`) er ikke egne rader i MASTER-SKJERMPLAN i dag og
mangler både fasit og oppføring.

---

## Hva dette betyr for steg 7–9

De tre bølgene i planen kan nå tallfestes:

| Bølge | Skjermer | Med fasit | Må designes underveis |
|---|---:|---:|---:|
| 7 — PlayerHQ | 151 | 12 | 139 |
| 8 — AgencyOS | 121 | 10 | 111 |
| 9 — resten (marketing, booking, forelder, auth, system) | 71 | 3 | 68 |

Den viktigste konsekvensen står ved lag selv om tallet er bedre: **93 % av skjermene har
ingen fasit å måle mot.** Planens arbeidsmåte — «skjermbilder side om side med Paper-fasiten
i hver PR» — virker for 25 skjermer. For de 318 andre må porten hvile på noe annet:
byggeklossene fra steg 5 og retningslinjene i `guidelines/` i Claude Design-prosjektet
(`605a48cc`). Er de riktige, blir de fleste skjermene riktige uten at hver enkelt er tegnet
først.

Det taler for å legge mer vekt på steg 5 og 6 enn planen antyder, og for å behandle steg 7–9 som
komposisjonsarbeid framfor 318 enkeltdesign.

---

## Åpne punkter

1. **`agencyos-agenticos.html` → hvilken rute?** AI-laget finnes i dag spredt på `/admin/agent-team`,
   `/admin/agents`, `/admin/godkjenninger` og `/admin/agencyos` (AI-dispatch-panelet). Fasitskjermen
   ser ut til å samle dem. Om det er en ny samleflate eller en redesign av `/admin/agent-team` er
   ikke avgjort — det er en produktbeslutning, ikke en designbeslutning.
2. **`workbench-turnering.html` → hvilken rute?** Turneringer finnes både som `/admin/tournaments`,
   `/admin/turnering-kart` og `/portal/tren/turneringer`. Filnavnet plasserer den i Workbench, men
   ingen av dagens ruter heter det.
3. **WANG og GFGK mangler i MASTER-SKJERMPLAN.** Bør legges inn før bølge 9, ellers blir de
   glemt — de er ikke med i de 343.
