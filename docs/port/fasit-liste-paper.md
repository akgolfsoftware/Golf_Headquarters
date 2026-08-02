# Steg 2 — fasit-listen: Paper-skjerm ↔ ekte rute

**Skrevet:** 02.08.2026 · **Gjelder:** steg 2 i `docs/port/plan-designport-alle-skjermer.md`
**Endrer ingen skjerm.** Dette er kun en opptelling.

Kilder: `designsystem/paper/fase1/` (hentet i steg 1) og `docs/MASTER-SKJERMPLAN.md`.

---

## Det korte svaret

| | Antall |
|---|---:|
| Ekte skjermer i appen (redirect og utgåtte rader trukket fra) | **343** |
| Rader i MASTER-SKJERMPLAN totalt | 375 |
| …av disse ren redirect eller utgått | 32 |
| Paper-fasitskjermer på disk | **25** |
| Ekte ruter disse 25 dekker (mobil + desktop av samme rute teller én gang) | **19** |
| Skjermer som må designes uten fasit | **324** |

**Dekningsgrad: 19 av 343 skjermer — 5,5 %.**

Planen anslo 19 fasitskjermer. Det reelle tallet er 25 HTML-filer, men flere er mobil- og
desktop-versjoner av samme rute, så det dekker 19 ruter. Anslaget traff altså tilfeldigvis riktig
tall på feil grunnlag.

---

## De 25 fasitskjermene og rutene de svarer til

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

### Ikke en skjerm (1 fil)

| Paper-fil | Hva det er |
|---|---|
| `fangstsheet.html` | Komponentkort, ikke en rute. Hører til steg 5 (byggeklosser), ikke steg 7–9 |

---

## Hva som IKKE har fasit — de 324

Per seksjon, ekte skjermer uten en tegnet Paper-skjerm:

| Område | Ekte skjermer | Har fasit | Uten fasit |
|---|---:|---:|---:|
| PlayerHQ · Analysere | 41 | 1 | 40 |
| PlayerHQ · Meg | 28 | 1 | 27 |
| PlayerHQ · Planlegge | 25 | 2 | 23 |
| PlayerHQ · Coach | 20 | 0 | 20 |
| PlayerHQ · Gjennomføre | 18 | 0 | 18 |
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
| **Sum** | **343** | **19** | **324** |

Fire områder har null fasit i det hele tatt: **PlayerHQ Coach** (20), **PlayerHQ Gjennomføre**
inkludert hele live-økten (18), **AgencyOS Innsikt** (14) og **AgencyOS Min uke** (4).

WANG (`team-wang`) og GFGK (`gfgk-junior`) er ikke egne rader i MASTER-SKJERMPLAN i dag og
mangler både fasit og oppføring.

---

## Hva dette betyr for steg 7–9

De tre bølgene i planen kan nå tallfestes:

| Bølge | Skjermer | Med fasit | Må designes underveis |
|---|---:|---:|---:|
| 7 — PlayerHQ | 151 | 6 | 145 |
| 8 — AgencyOS | 121 | 10 | 111 |
| 9 — resten (marketing, booking, forelder, auth, system) | 71 | 3 | 68 |

Den viktigste konsekvensen: **95 % av skjermene har ingen fasit å måle mot.** Planens
arbeidsmåte — «skjermbilder side om side med Paper-fasiten i hver PR» — virker for 19 skjermer.
For de 324 andre må porten hvile på noe annet: byggeklossene fra steg 5 og retningslinjene i
`designsystem/paper/guidelines/`. Er de riktige, blir de fleste skjermene riktige uten at hver
enkelt er tegnet først.

Det taler for å legge mer vekt på steg 5 og 6 enn planen antyder, og for å behandle steg 7–9 som
komposisjonsarbeid framfor 324 enkeltdesign.

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
