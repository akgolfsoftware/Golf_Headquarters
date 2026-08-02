# Designdekning — AK Golf HQ (2026-07-29)

Revisjons- og tellejobb. Ingen kode er endret, ingenting er designet. Hver rad har et bevis:
enten en filsti i repoet eller en sti inn i et konkret Claude Design-prosjekt. Det som ikke er
verifisert direkte er merket `[antatt]`. Følgedokument til
`docs/funksjonsinventar-2026-07-29.md`, som svarer på *hva som finnes*. Dette svarer på
*hvor mye av det som er designet — og mot hva*.

Metodikk: fire parallelle research-agenter (PlayerHQ · AgencyOS · Foreldreportal+klubbflater+auth ·
skjermplan-avvik), hver med eget avgrenset område og krav om filsti per påstand.

---

## Tallene (siter disse)

**Fasit er «AK Golf HQ — Claude Paper»** (`https://claude.ai/design/p/605a48cc-81e8-44bd-94d2-07d50a97370a`),
bekreftet av Anders 29.07.2026. Alt annet designarbeid som finnes, tilhører kanoner som er avviklet.

| Produkt | Skjermer i nevneren | 1 FULLT | 2 DELVIS | 3 IKKE DESIGNET | Dekning |
|---|---|---|---|---|---|
| **PlayerHQ** | 113 | 1 | 110 | 2 | **0,9 %** |
| **AgencyOS** | 84 | 1 | 83 | 0 | **1,2 %** |
| **Foreldreportal** | 11 | 0 | 11 | 0 | **0 %** |
| **Klubbflater** (GFGK/GFGK-junior/WANG) | 10 | 0 | 0 | 10 | **0 %** |
| **Auth + interne verktøy** | 15 | 0 | 12 | 3 | **0 %** |
| **TOTALT** | **233** | **2** | **216** | **15** | **0,9 %** |

**Scope-beslutning 29.07 (etter at tallene over ble målt):** Anders besluttet at klubbflatene
(10 skjermer) designes i egne designsystem-prosjekter, ikke i Claude Paper. Nevneren for
Claude Paper-arbeidet er dermed **223**, og arbeidsordren i Claude Paper
(`kart/arbeidsordre-komplett-system-2026-07-29.md`) bruker det tallet. Tabellen over står
uendret som måling av hele plattformen.

Nevneren er 233, ikke 282: 32 skjermer er kategori 4 (rene redirects, ADMIN-gatede demoverktøy,
`kommando/*`-redirects, Anders' personlige `meg/*`-dashbord) og telles ikke inn, per oppdraget.
Kategori 4 er listet i produkt-tabellene, men holdt utenfor prosenten.

**Setningen Anders kan sitere:** *«Designet er 0,9 % komplett mot funksjonsinventaret. To av 233
skjermer finnes som ferdig flate i Claude Paper. Komponentfundamentet under dem er derimot nesten
ferdig — 19 av 20 komposisjonsmønstre har komponent.»*

### Det sekundære tallet: mot den avviklede v2-kanonen

Nesten hele kategori 2-massen er ikke tom. 89 av de 233 skjermene har en ferdig designet flate i
det **gamle** designsystemet (`AK Golf HQ Design System`, `bb9b2b1d`) — kanonen hvis designlåser ble
bevisst tømt 25.07.2026 (`.claude/rules/beslutninger.md`). Målt mot den er dekningen **38,2 %**.

Dette tallet er ikke fasit, men det er ikke uten verdi heller: det er forskjellen på en skjerm som
skal designes fra bunnen og en som skal *oversettes* fra en kjent flate til Claude Paper-språket.
Kolonnen «v2-kanon» i produkt-tabellene viser hvilke det gjelder.

### Hvorfor tallet er så lavt — og hvorfor det ikke er alarmerende

Claude Paper ble startet 28.07.2026, altså i forgårs. Prosjektet er i Fase A, som eksplisitt er
komponentbygging, ikke skjermbygging. Det har **63 komponenter** i ni familier, tokens, logoregler
og en ferdig fokuskontrakt for overlays — og **to** eksempelskjermer.

Prosjektet har gjort sin egen fullstendighetsrevisjon samme dag som dette dokumentet
(`kart/revisjon-2026-07-29.md`), og den er like ubehagelig ærlig:

> «Nevneren er 3 skjermer [målt], ikke 66. […] De 66 skjermene `kart/nattrapport.md` viser til,
> finnes ikke i prosjektet [målt: 0 filer].»

> «47 komponenter brukes av null skjermer [målt: 63 − 16].»

Med andre ord: 0,9 % er ikke et tegn på at noe har gått galt. Det er tallet man skal ha på dag to
av en skjermfase som ikke har begynt. Det farlige ville vært å tro at de 89 v2-skjermene fortsatt
teller.

---

## Kildene som faktisk finnes

| Prosjekt | Type | Status | Skjermer | Komponenter |
|---|---|---|---|---|
| [AK Golf HQ — Claude Paper](https://claude.ai/design/p/605a48cc-81e8-44bd-94d2-07d50a97370a) | Designsystem | **FASIT** (fra 28.07.2026) | 2 | 63 |
| [AK Golf HQ Design System](https://claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d) | Designsystem | Avviklet 25.07.2026 | 89 | ~45 |

**Claude Paper — de to skjermene:**
- `templates/agencyos-dashboard/AgencyosDashboard.dc.html` — coach-dashboard (rail + topbar +
  «Én ting nå» + KPI-stripe + fire paneler)
- `templates/playerhq-idag/PlayerhqIdag.dc.html` — spillerens dagsskjerm (430 px-kolonne + tab-bar)

**Claude Paper — komponentfamiliene:** actions (3) · calendar (1) · data (6) · feedback (3) ·
forms (9) · golfviz (9) · layout (9) · navigation (9) · overlays (6) · primitives (3) · progress (7).
Ett kjent hull: `DataTable` (sorterbar kolonneheader), som per prosjektets egen revisjon etterspørres
av null skjermer i dag og derfor er «det billigste hullet som finnes».

**Open Design ble sjekket og forkastet som kilde.** Daemonen kjører (`127.0.0.1:58804`), men den
lokale installasjonen inneholder kun juni-prototyper (11.–13. juni 2026) og ingen av de tre
prosjektene skillen `open-design-sync` navngir (`akgolf-skjerm-godkjenning`, `brand-product-23ecce`,
`akgolf-verdensklasse-ui`). Skillen er utdatert og bør rettes.

---

## Klassifiseringsregelen som er brukt

| Kategori | Krav |
|---|---|
| **1 FULLT DESIGNET** | Ferdig, koherent flate i Claude Paper `templates/` |
| **2 DELVIS DESIGNET** | Har ferdig v2-komponent i koden og/eller designet skjerm i den avviklede v2-kanonen — men ingen Claude Paper-flate. Dette er «kun i legacy-utseende» |
| **3 IKKE DESIGNET** | Verken designskjerm i noen kanon eller v2-komponent. Ren funksjonell markup |
| **4 IKKE RELEVANT** | Rene redirects, interne demo-/utviklerverktøy, sider inventaret flagger som DØD/proxy-blokkert. Nevnt, men utenfor prosenten |

En ferdig v2-komponent i koden er altså bevisst **ikke** nok for kategori 1. Grunnen er at
Claude Paper er et annet visuelt språk enn v2 — varmt papir/blekk, Poppins/Lora/IBM Plex Mono,
egne tokens — så en v2-komponent er en skjerm som skal skrives om, ikke en som er ferdig.
Det er den strenge lesningen, og den er valgt fordi den er den eneste som gir et tall en
designfase kan avsluttes mot.

---

# Del 1 — PlayerHQ (`src/app/portal`)

45 funksjonsområder, 122 sider (inventarets egen «Sider»-kolonne; se avviksnotat nederst i delen).
Kolonnen **v2** viser om det finnes en designet flate i den avviklede v2-kanonen — det er
forskjellen på «skal oversettes» og «skal designes fra bunnen».

| Funksjonsområde | Sider | Kat | v2 | Bevis | Kommentar |
|---|---|---|---|---|---|
| Hjem | 1 | **1** | ✓ | Claude Paper `templates/playerhq-idag/PlayerhqIdag.dc.html` · `src/components/portal/v2/HjemV2.tsx` | Eneste PlayerHQ-skjerm i ny fasit |
| Live økt-gjennomføring | 5 | 2 | ✓ | v2-kanon `ui_kits/playerhq/live-tapper` · ingen v2-komponent i `src/app/portal/(fullscreen)/live/[sessionId]/` | Designskjerm uten komponent |
| Runde-føring | 2 | 2 | ✓ | v2-kanon `ui_kits/playerhq/runde-logg` · `src/app/portal/(fullscreen)/runde/{live,logg}/page.tsx` | Designskjerm uten komponent |
| Testing | 5 | 2 | – | `src/components/portal/v2/{TesterV2,NyTestV2,NyTestEgenV2}.tsx` | Komponent uten designskjerm |
| Turneringslogg — liste | 1 | 2 | – | `src/components/portal/v2/TurneringerV2.tsx` | |
| Turneringslogg — detalj | 1 | 4 | – | `src/components/portal/v2/TurneringDetaljV2.tsx` | DØD — proxy-blokkert |
| FYS-plan | 1 | 4 | – | `src/app/portal/tren/fys-plan/page.tsx` | DØD — proxy-blokkert |
| Teknisk plan (builder) | 1 | 4 | ✓ | v2-kanon `ui_kits/v2/phq-teknisk-plan` · `src/components/portal/v2/TekniskPlanV2.tsx` | Designet OG bygget, men proxy-blokkert |
| Plan-feiring | 1 | 2 | – | `src/components/portal/v2/FeiringV2.tsx` | |
| Gjennomfør (Gjør-hub) | 2 | 2 | ✓ | v2-kanon `ui_kits/v2/phq-okt` · `src/components/portal/v2/{GjorV2,OktV2,OktPlanlagtV2}.tsx` | Kjernerute i bunn-nav |
| Trening-verktøy | 3 | 4 | ✓ | v2-kanon `break-tabell`, `putte-laboratoriet` · `src/components/portal/v2/{BreakTabellV2,PutteLabV2,TreningLoggV2}.tsx` | DØD — 0 innlenker |
| Fysisk | 1 | 2 | – | `src/components/portal/v2/FysiskV2.tsx` | `ui_kits/agencyos/fysisk` er coach-flaten, ikke denne |
| Kalender | 1 | 2 | ✓ | v2-kanon `ui_kits/playerhq/kalender` · `src/components/portal/v2/KalenderV2.tsx` | |
| Planlegging/Workbench | 3 | 2 | ✓ | v2-kanon `phq-ukeplan`, `phq-plan-bygger`, `hifi-sg-workbench-bro` · `src/components/portal/v2/{PlanV2,PlanByggerV2,WorkbenchV2,WorkbenchV2Mobil}.tsx` | Mobil + desktop i v2 |
| Mål-hub | 3 | 2 | – | `src/components/portal/v2/{MalHubV2,MalDetaljV2,MalByggerV2}.tsx` | |
| Leaderboard | 1 | 2 | – | `src/components/portal/v2/LeaderboardV2.tsx` | Foreldreløs via legacy-nav |
| Runde-logging | 5 | 2 | ✓ | v2-kanon `runde-logg` (×2) · `src/components/portal/v2/{RunderV2,RundeDetaljV2}.tsx` | `mal/runder/{ny,hull,slag}` kun v2-primitiver |
| TrackMan | 2 | **3** | – | `src/app/portal/{trackman,mal/trackman}/**/page.tsx` — ingen v2-import | Ren funksjonell markup |
| SG-hub coach-modus | 3 | 4 | ✓ | v2-kanon `ui_kits/playerhq/sg-hub` · `src/components/portal/v2/CoachSgHub*V2.tsx` | DØD — feilplassert under `/portal/` |
| AI-verktøy | 3 | 2 | – | `src/components/portal/v2/{ForeslaDrillV2,ForeslaTurneringV2,AiMalByggerV2}.tsx` | 1 ferdig + 2 døde |
| Øvelsesbibliotek | 2 | 2 | – | `src/components/portal/v2/{OvelsesbankV2,DrillDetaljV2}.tsx` | |
| Analyse (hovedflate) | 1 | 2 | ✓ | v2-kanon `phq-analyse-desktop` · `src/components/portal/v2/AnalysereV2.tsx` | Kun desktop designet — mobil mangler |
| Hull-analyse | 1 | 2 | – | `src/components/portal/v2/AnalysereHullV2.tsx` | |
| Statistikk-drilldown | 1 | 2 | – | `src/components/portal/v2/StatistikkMetrikkV2.tsx` | Foreldreløs, 0 lenker |
| Del runde | 1 | 2 | – | `src/components/portal/v2/DelRundeV2.tsx` | «Lukk» → 404 |
| DataGolf | 1 | 2 | – | `src/components/portal/v2/DataGolfV2.tsx` | |
| Gameplan (banebibliotek) | 3 | 2 | ✓ | v2-kanon `ui_kits/v2/baneguide` · `src/components/portal/v2/GameplanV2.tsx` | Kun hub har komponent |
| Booking-flyt | 7 | 2 | ✓ | v2-kanon `phq-booking` · 7 komponenter i `src/components/portal/v2/Booking*.tsx` | Full v2-dekning 7/7 |
| Mine bookinger | 2 | 2 | ✓ | v2-kanon `phq-booking` · `src/app/portal/meg/bookinger/` uten egen komponent | |
| Abonnement/betaling | 6+1 | 2 | – | `src/components/portal/v2/{MegAbonnementV2,MegAvbestillV2,MegFakturaV2}.tsx` | 3 undersider uten komponent |
| Profil/kontoinnstillinger | 15+2 | 2 | – | 10 komponenter i `src/components/portal/v2/{MinProfil,Innstillinger*,Meg*}V2.tsx` | `ai-coach`, `personvern`, `2fa` mangler komponent |
| Hjelp/support | 4 | 2 | – | `src/components/portal/v2/MegHelp*V2.tsx` | `help/kontakt` uten komponent |
| Feedback | 1 | 2 | – | `src/components/portal/v2/MegFeedbackV2.tsx` | |
| Helse/skadelogg | 2 | 2 | – | `src/components/portal/v2/{MegHelseV2,MegSymptomNyV2}.tsx` | `logSymptom` lagrer ikke — funksjonshull |
| Foresatte-oversikt | 1 | 2 | – | `src/components/portal/v2/MegForeldreV2.tsx` | |
| Dokumenter | 1 | 2 | – | `src/components/portal/v2/MegDokumenterV2.tsx` | |
| Varsler | 1 | 2 | – | `src/components/portal/v2/VarslerV2.tsx` | |
| Utfordringer | 2 | 2 | – | `src/components/portal/v2/{UtfordringerV2,UtfordringDetaljV2}.tsx` | |
| Venner/sosial | 2 | 2 | ✓ | v2-kanon `phq-venner` · `src/app/portal/venner/VennerClient.tsx` (ingen v2-komponent) | Designskjerm uten komponent |
| Talent/utviklingsplan | 5 | 2 | ✓ | v2-kanon `utvikling`, `phq-utviklingsplan` · 7 `Talent*V2`-komponenter | Full v2-dekning |
| Spiller-detalj (generisk) | 1 | 2 | – | `src/components/portal/v2/SpillerDetaljV2.tsx` | |
| Ønskelig økt | 2 | 2 | – | `src/components/portal/v2/OnskeligOkt*V2.tsx` | |
| Meldinger til coach | 3 | 2 | – | `src/components/portal/v2/{CoachMeldingerV2,CoachMeldingNyV2}.tsx` | Tråd-detalj er blindvei (`24e142bf`) |
| Spørsmål til coach | 3 | 2 | – | `src/components/portal/v2/CoachSporsmal*V2.tsx` | |
| Coach-hub + 5 underskjermer | 6 | 2 | ✓ | v2-kanon `phq-coach`, `sg-hub` · 6 `Coach*V2`-komponenter | 5 av 6 nås kun via legacy-nav |

**PlayerHQ:** kat 1 = 1 side · kat 2 = 110 · kat 3 = 2 · kat 4 = 9. Nevner 113 → **0,9 %**.
Mot v2-kanon: 30 sider fullt designet → 26,5 %.

*Avviksnotat:* PlayerHQ-tabellen i inventaret har **45 rader, ikke 46**, og «Sider»-kolonnen
summerer til **122, ikke 117** (inventarets overskrift). Tallene er beholdt uendret her.
Verifisert underveis: `src/components/planlegge-v2/` inneholder kun `icons.tsx`, `styles.css`
og `ruvector.db` — ingen skjermkomponenter. `src/components/test-modul-v2/` finnes ikke i repoet,
til tross for at `CLAUDE.md` lister den under mappestrukturen.

---

# Del 2 — AgencyOS (`src/app/admin`)

23 funksjonsområder, 84 sider.

| Funksjonsområde | Sider | Kat | v2 | Bevis | Kommentar |
|---|---|---|---|---|---|
| Cockpit/hub | 6 | **1** (1 side) / 2 (5) | ✓ | Claude Paper `templates/agencyos-dashboard/AgencyosDashboard.dc.html` · v2-kanon `index`, `morgenbrief`, `dispatch` · `src/components/admin/v2/{CockpitV2,AdminHandlingssenterV2,AdminUkaV2,AiDispatchPanelV2}.tsx` | Eneste AgencyOS-flate i ny fasit |
| Innboks/varsler | 3 | 2 | ✓ | v2-kanon `innboks`, `triage`, `triage-lys` · `src/components/admin/v2/{InnboksEpostV2,TriageV2,VarslerClientV2}.tsx` | Lys + mørk designet i v2 |
| Godkjenninger | 1 | 2 | ✓ | v2-kanon `godkjenninger` · `src/components/admin/v2/AdminGodkjenninger*V2.tsx` | |
| Booking-administrasjon | 3 | 2 | – | `src/components/admin/v2/{AdminBookingerV2,AdminBookingDetaljV2,AdminAvailabilityV2}.tsx` | Claude Paper `kart/ikke-bygget-enna.md` lister «booking» som utsatt |
| Workspace/Notion | 3 | 2 | – | `src/components/admin/v2/AdminWorkspaceV2.tsx` | Ingen designskjerm i noen kanon |
| Spilleroversikt/stall | 3 | 2 | ✓ | v2-kanon `stall`, `stall-tidslinje`, `spiller-dashboard` · `src/components/admin/v2/{StallV2,SpillerDashboardV2}.tsx` | |
| Workbench/planlegging per spiller | 11 | 2 | ✓ | v2-kanon `workbench`, `workbench-lys`, `workbench-mobile`, `plans` · `src/components/admin/v2/{CoachWorkbenchMount,WorkbenchMobilV2,AdminPlanleggeV2}.tsx` | Mobil + desktop i v2 |
| Spiller-analyse/fremgang/tester | 3 | 2 | ✓ | v2-kanon `analyse`, `utviklingsplan` · `src/components/admin/v2/AdminSpiller{Analyse,Fremgang,Tester}V2.tsx` | |
| Grupper | 6 | 2 | – | `src/components/admin/v2/{GrupperV2,GruppeDetaljV2,GruppeTimeplanV2,PeriodeFordelingV2}.tsx` | Ingen gruppeskjerm i noen kanon |
| Caddie (AI-chat) | 3 | 2 | ✓ | v2-kanon `caddie` · `src/components/admin/v2/AdminCaddie*V2.tsx` | |
| Agenter/agent-team | 3 | 2 | ✓ | v2-kanon `agent-team`, `agencyos-fokus` · `src/components/admin/v2/{AdminAgentTeamV2,AdminAgenterV2}.tsx` | |
| Talent | 2 | 2 | ✓ | v2-kanon `talent`, `agencyos-talent` · `src/components/admin/v2/AdminTalent*V2.tsx` | |
| Rapporter/analyse (stall) | 4 | 2 | – | `src/components/admin/v2/{AdminReportsV2,AdminComplianceV2,AdminRunderV2}.tsx` | Ingen stall-rapportskjerm designet |
| Tester (administrasjon) | 2 | 2 | ✓ | v2-kanon `agencyos-tester` · `src/components/admin/v2/AdminTesterV2.tsx` | |
| TrackMan | 2 | 2 | ✓ | v2-kanon `trackman` · `src/components/admin/v2/AdminTrackmanV2.tsx` | |
| Turneringer | 4 | 2 | ✓ | v2-kanon `turneringer`, `wizards` · `src/components/admin/v2/{AdminTurneringerV2,TurneringWizardV2}.tsx` | `dubletter` er orphaned |
| Kalender | 3 | 2 | ✓ | v2-kanon `kalender`, `min-kalender`, `agencyos-kalender` · `src/components/admin/v2/AgencyKalenderV2.tsx` | Claude Paper lister «kalender» som utsatt |
| Økonomi | 1 | 2 | ✓ | v2-kanon `okonomi` · `src/components/admin/v2/AdminOkonomiV2.tsx` | Claude Paper lister «okonomi» som utsatt |
| Klubbinnstillinger/organisasjon | 6+1 | 2 | ✓ | v2-kanon `org`, `kart-lokasjon` · 8 komponenter i `src/components/admin/v2/Admin{Klubb,Settings,ApiKeys,Security,Anlegg}*V2.tsx` | `settings/security` + `settings/api` orphaned |
| Team/tilgang | 4 | 2 | `[antatt]` | `src/components/admin/v2/{AdminTeamV2,AdminInviterCoachV2,AdminTilgangV2,AdminAuditLogV2}.tsx` | `ui_kits/agencyos/styring` kan dekke CBAC — ikke innholdsverifisert |
| Marketing-admin | 1 | 2 | – | `src/components/admin/v2/AdminMarketingV2.tsx` | `ui_kits/marketing/*` er offentlige sider, ikke admin-flaten |
| Øktgjennomføring/live | 3 | 2 | ✓ | v2-kanon `live`, `live-okt`, `agencyos-recording` · 7 `Admin{Live,Okter,Gjennomfore,Recording}*V2.tsx` | De to 404-lenkene er kodefeil, ikke designhull |
| Øvrig/verktøy | 6 | 2 | delvis | v2-kanon `drills` · `src/components/admin/v2/{AdminDrills*,AdminVideoerV2,AdminEmail*,AdminHjelpV2,AdminProfilV2}.tsx` | Kun drill-editoren designet; video/e-post/hjelp/profil ikke |

**AgencyOS:** kat 1 = 1 side · kat 2 = 83 · kat 3 = 0 · kat 4 = 0. Nevner 84 → **1,2 %**.
Mot v2-kanon: 57 sider fullt designet → 67,9 %. AgencyOS er det klart best dekkede produktet
i den gamle kanonen — og har dermed mest å *oversette*, ikke mest å designe fra bunnen.

---

# Del 3 — Foreldreportalen (`src/app/forelder`)

9 funksjonsområder, 11 sider. Alle 11 bruker `V2Shell` + en dedikert `Forelder*V2`-komponent.
Den gamle kanonen har nøyaktig **én** forelder-skjerm; Claude Paper har ingen.

| Funksjonsområde | Sider | Kat | v2 | Bevis | Kommentar |
|---|---|---|---|---|---|
| Ukentlig oversikt | 1 | 2 | ✓ | v2-kanon `ui_kits/forelder/index` + `templates/forelder-skjerm` · `src/components/portal/v2/ForelderV2.tsx` | Eneste forelder-flate med designskjerm |
| Ukerapport (duplikat) | 1 | 2 | – | `src/components/portal/v2/ForelderUkerapportV2.tsx` | Foreldreløs, 0 innlenker |
| Se barns utvikling | 2 | 2 | – | `src/components/portal/v2/ForelderBarn{,Detalj}V2.tsx` | |
| Se bookinger | 1 | 2 | – | `src/components/portal/v2/ForelderBookingerV2.tsx` | |
| Melding til coach | 1 | 2 | – | `src/components/portal/v2/ForelderCoachV2.tsx` | Funksjonelt redusert (kun e-post-CTA) |
| Økonomi/fakturaer | 2 | 2 | – | `src/components/portal/v2/Forelder{Okonomi,Fakturaer}V2.tsx` | |
| Samtykke (GDPR) | 1 | 2 | – | `src/components/portal/v2/ForelderSamtykkeV2.tsx` | |
| Varsler | 1 | 2 | – | `src/components/portal/v2/ForelderVarslerV2.tsx` | Foreldreløs |
| Innstillinger | 1 | 2 | – | `src/components/portal/v2/ForelderInnstillingerV2.tsx` | Foreldreløs |

**Foreldreportal:** kat 1 = 0 · kat 2 = 11 · kat 3 = 0 · kat 4 = 0. Nevner 11 → **0 %**.
Mot v2-kanon: 1 side → 9,1 %.

`src/components/forelder/sidebar.tsx` finnes, men `ForelderSidebar`/`ForelderMobileNav` rendres
ingen steder — gammel nav, ikke v2. Det er årsaken til de tre foreldreløse sidene.

---

# Del 4 — Klubbflater (GFGK-junior, team-GFGK, team-WANG)

6 funksjonsområder, 10 sider. **Hele gruppen er kategori 3.**

Verifisert: ingen klubbflate-skjermer i noen av de to akgolf-hq-designprosjektene, og
`find src/components -iname "*gfgk*" -o -iname "*wang*" -o -iname "*team*"` gir kun
`admin/team/team-kit.tsx`, `admin/v2/AdminTeamV2.tsx` og `admin/v2/AdminAgentTeamV2.tsx` —
alle AgencyOS CBAC-team, ikke klubbflater. Klubbsidene importerer kun
`@/components/gruppe-kalender/flere-grupper-kalender` og `@/components/shared/empty-state`.

| Funksjonsområde | Sider | Kat | Bevis | Kommentar |
|---|---|---|---|---|
| GFGK junior microsite (forside, gruppe, kalender, treningsplaner) | 4 | **3** | `src/app/gfgk-junior/` · ingen designskjerm, null v2-komponenter | Ekte data via `hentGfgkGruppe()`, men udesignet |
| GFGK junior veilederdel (oversikt + artikkel) | 2 | **3** | `src/app/gfgk-junior/veileder*` | 1048-linjers statisk tekst-array |
| team-gfgk foreldremøte-deck | 1 | **3** | `src/app/team-gfgk/` + `data.ts` (4756 linjer hardkodet) | Frittstående delingslenke, 0 innlenker |
| team-wang fellesside (4 faner) | 1 | **3** | `src/app/team-wang/page.tsx` · øktinnhold statisk i `wang-plan.ts` | Leser ekte `Group`/`GroupPeriodBlock` |
| team-wang coach-årsplan | 1 | **3** | `src/app/team-wang/coach/page.tsx` | Kildekommentar: «Demo-data; ingen ekte auth/DB ennå» |
| team-wang innlogging (forspill) | 1 | **3** | `src/app/team-wang/logg-inn/page.tsx` | WANG-brandet forspill foran `/auth/login` |

**Klubbflater:** kat 3 = 10 av 10. Nevner 10 → **0 %** i begge kanoner.

WANG og GFGK har egne Claude Design-prosjekter (`dbcb611f`, `be77fcdb`, `900a7d58`, `4f02d790`,
`1751a89c`), men de dekker klubbinnhold — årsplaner, treningsprogram, lag-NM — ikke disse
skjermene i akgolf-hq. Klubbflatene er den eneste gruppen i hele plattformen som aldri har vært
gjennom en designrunde i noen kanon.

---

# Del 5 — Auth/onboarding og interne verktøy

17 funksjonsområder, 38 sider (faktiske `page.tsx`; inventaret teller 13+18 reelle skjermer).

| Funksjonsområde | Sider | Kat | v2 | Bevis | Kommentar |
|---|---|---|---|---|---|
| Innlogging | 1 | 2 | ✓ | v2-kanon `ui_kits/auth/index` + `templates/auth-skjerm` · `src/components/portal/v2/LoginV2.tsx` | Eneste auth-flate med designskjerm |
| Registrering | 1 | 2 | – | `src/components/portal/v2/SignupV2.tsx` | |
| Passord glemt/tilbakestill | 2 | 2 | – | `src/components/portal/v2/{ForgotPassword,ResetPassword}V2.tsx` | |
| E-post-verifisering | 1 | 2 | – | `src/components/portal/v2/CheckEmailV2.tsx` | |
| Utlogget-skjerm | 1 | 2 | – | `src/components/portal/v2/LoggetUtV2.tsx` | |
| Foreldresamtykke-flyt | 2 | 2 | – | `src/components/portal/v2/{GuardianConsentV2,SamtykkeVenterV2}.tsx` | Full GDPR-kjede i kode |
| Onboarding-veiviser | 2 | 2 | – | `src/components/auth/onboarding/wizard-chrome.tsx` | Dedikert veiviser-chrome, ingen designskjerm |
| BankID-plassholder | 1 | 2 | – | `src/components/portal/v2/BankIDV2.tsx` | 100 % statisk, «kommer post-beta» |
| Invitasjon forelder (token) | 1 | 2 | – | `wizard-chrome.tsx` + `@/components/v2`-primitiver | Ingen dedikert skjermkomponent |
| Stripe checkout-gjenopptak | 1 | **3** | – | `src/app/auth/checkout-resume/page.tsx` — ingen komponent-import | Ren serverlogikk |
| Onboard coach/klubb (wizard) | 2 | **3** | – | `src/components/onboarding/onboarding-shell.tsx` (ikke v2) | 0 innlenker; ingen `Klubb`-modell |
| Post-login-routing | 1 | 4 | – | `src/app/auth/etter-innlogging/page.tsx` | Ren ruting |
| `logg-inn` → `login` | 1 | 4 | – | `src/app/auth/logg-inn/page.tsx` | Ren `permanentRedirect` |
| Komponent-demobibliotek | 6 | 4 | – | `src/app/intern/komponenter/` | ADMIN-gatet, mock |
| Kommando-flate | 6 | 4 | – | `src/app/kommando/` | Alle rene redirects til `/admin/*` |
| Meg (Telegram-bot-dashbord) | 3 | 4 | – | `src/app/meg/` | Anders' personlige verktøy, egen Supabase |
| Design-lab + wizard-demoer | 6 | 4 | – | `src/app/(internal)/` | ADMIN-gatet, mock |

**Auth + interne:** kat 1 = 0 · kat 2 = 12 · kat 3 = 3 · kat 4 = 23. Nevner 15 → **0 %**.
Mot v2-kanon: 1 side → 6,7 %.

---

# Del 6 — Avvik mellom MASTER-SKJERMPLAN og virkeligheten

`docs/MASTER-SKJERMPLAN.md` har **375 tabellrader** som dekker **360 unike ruter**, mot **449**
`page.tsx` i koden og **282** reelle skjermer i inventaret. Planen skiller ikke mellom «reell
skjerm» og «ren redirect», så den kan verken bekrefte eller motsi 282-tallet.

| # | Type avvik | Omfang | Bevis | Hva som er riktig |
|---|---|---|---|---|
| 1 | Grønn hake på proxy-blokkert skjerm | 7 rader (101–107, 116) | `src/lib/portal/tren-workbench-redirect.ts:6–14` fanger `aarsplan`/`teknisk-plan`/`turneringer`/`fys-plan`, kalt fra `src/proxy.ts`. `grep -c tab src/app/portal/planlegge/workbench/page.tsx` → **0** | Koden er ✓, men ingen bruker når dem. «Adresse-ok» og «Flyt» skal være `–` |
| 2 | Grønn hake på blindveiene fra 22.-juli-kuttet | 5 rader (119, 202, 206, 209, 213) | `git show --stat 24e142bf`: `coach/plans/[planId]` −464 linjer, `coach/melding/[id]` −120, `coach/[coachId]` −215, `utfordringer/ny` −75, `coach/ovelser/ny` −31 | Radene er datert 16.–17. juli. Rad 213 er verst: to v2-komponenter lenker til en fil som ikke finnes → 404 |
| 3 | Rediger-øvelse uten innlenking, likevel grønn | 1 rad (214) | Fil kun i `src/app/portal/(legacy)/coach/ovelser/[id]/rediger/`, 0 innlenker | Å redigere en øvelse er i praksis umulig via UI |
| 4 | Feil redirect-påstand — er reelt 404 | 1 rad (417) | `src/app/admin/kalender/uke` finnes ikke; ingen regel i `next.config.ts`. Lenket fra `src/app/admin/gjennomfore/page.tsx:99` | `/admin/kalender/uke` = 404. Motsatt: `/admin/locations` redirecter riktig (`next.config.ts:63`) — inventaret tar begge som 404, kun den ene stemmer |
| 5 | Orphaned sider scoret som ferdige | 12 rader | `tournaments/dubletter`, `videoer`, `settings/api`, `settings/security`, `reach`, `talent/wagr-import`, `recording`, `stats/overview`, `stats/moderering`, `forelder/{ukerapport,innstillinger,varsler}` | Planens 6 haker måler ikke oppdagbarhet. Rad 458 er verst: markert «LUKKET 17. jul», men GDPR-slettekøen er uoppnåelig for coach |
| 6 | Duplikate rader for samme rute | 13 ruter / 28 rader | `/portal/mal/sg-hub` (159, 679, 686), `/` (578, 614, 619), `/portal/analysere` (153, 680) m.fl. | Radene i linje ~670–700 er en Claude Design-drop-off-liste, ikke skjermrader — dobbelt bokføring |
| 7 | Wildcard-rader skjuler 56 sider | 3 rader (612, 639, 640) | `/stats/**` = 45 `page.tsx`, `(internal)/demos/**` = 5, `intern/komponenter/**` = 6 | `/stats/*` er 45 offentlige sider uten en eneste egen rad |
| 8 | Feil parameternavn | 1 rad (368) | Faktisk mappe: `src/app/gfgk-junior/gruppe/[gruppe]/page.tsx` | `[u10-u19]` → `[gruppe]` |
| 9 | Reelle ruter som mangler helt | 43 ruter | Maskinell diff kode↔plan | AgencyOS 17 · PlayerHQ 10 · auth 3 · interne 7 · klubb 5 · div 1 |
| 10 | Spøkelsesrader uten kode | **0 uflaggede** | 6 finnes (104, 157, 191–192, 193–194), alle korrekt `~~gjennomstreket~~` med «RUTE FINNES IKKE» | Ingen avvik — denne delen av planen er sunn |
| 11 | Ingen kolonne for reell skjerm vs. redirect | Hele dokumentet | Inventaret skiller 282/93; planen har ingen tilsvarende felt | Planen kan ikke svare «hvor mange skjermer har vi egentlig» |

De 43 manglende rutene i detalj — **AgencyOS (17):** `/admin/uka`, `/admin/agent-team`,
`/admin/agenter`, `/admin/ai`, `/admin/mer`, `/admin/prosjekter`, `/admin/risiko`,
`/admin/drills/forslag`, `/admin/drills/ny`, `/admin/tester/tildel`, `/admin/bookinger/[id]`,
`/admin/trackman/[sessionId]`, `/admin/grupper/[id]/workbench`, `/admin/spillere/[id]/plan`,
`/admin/settings/periode-fordeling`, `/admin/plan-templates/[id]/effectiveness`,
`/admin/agencyos/caddie/dashbord`. **PlayerHQ (10):** `/portal/baneguide` (+`[baneId]`,
+`/hull/[nr]`), `/portal/datagolf`, `/portal/fysisk`, `/portal/trackman`, `/portal/utviklingsplan`,
`/portal/coach/sporsmal`, `/portal/live/[sessionId]`, `/portal/meg/innstillinger/ai-coach`.
**Auth (3):** `/auth/logg-inn`, `/auth/etter-innlogging`, `/auth/checkout-resume`.
**Interne (7):** `/kommando/*` ×6, `/meg`. **Klubb (5):** `/gfgk-junior/gruppe/[gruppe]`,
`/gfgk-junior/veileder/[slug]`, `/team-gfgk`, `/team-wang/coach`, `/team-wang/logg-inn`.
**Div (1):** `/dev-banekart`.

## Forslag til oppdatering av MASTER-SKJERMPLAN (til godkjenning — ikke utført)

**1. Legg til en syvende hake: «Nåbar».** Dette er det viktigste funnet i hele revisjonen. De seks
hakene måler om en skjerm er *bygget*, ikke om noen kan *komme dit*. Minst 25 fullt fungerende
skjermer er usynlige for brukeren de er laget for — proxy-blokkert, uten navlenke, eller lenket
fra en sidebar som aldri rendres. Med en «Nåbar»-kolonne (✓ = lenket fra nav/Cmd+K eller synlig
CTA, `–` = kun via direkte URL) blir hele klassen synlig i tabellen i stedet for i en fotnote.
Uten den vil planen fortsette å påstå at ting er ferdig som ingen kan bruke.

**2. Rett de 25 radene som motsier virkeligheten, i én runde.** De sju proxy-blokkerte
`/portal/tren/*`-radene settes til `–` på Adresse-ok og Flyt, med merknad om at
`tren-workbench-redirect.ts` fanger dem og at Workbench aldri leser `?tab=`. De fem blindveiene
dateres om til 22. juli og settes til `–` på Flyt/Funker. Rad 417 rettes til 404. De tolv
orphan-radene beholder byggehakene, men får `Nåbar = –`.

**3. Legg inn de 43 manglende rutene.** Ta AgencyOS- og PlayerHQ-radene som ekte rader; la
`/kommando/*`, `/meg/*` og `/dev-banekart` få én samlerad hver merket «internt, ikke i navigasjon».

**4. Rydd tellingen.** Flytt Claude Design-drop-off-listen (linje ~670–700) til et eget vedlegg —
den gir i dag dobbelt bokføring for 13 ruter. Gi `/stats/*` sine 45 sider en egen underseksjon,
eller si eksplisitt at marketing er utenfor planens scope (slik inventaret gjør). Rett
`[u10-u19]` → `[gruppe]`.

**5. Skriv inn forholdet til inventaret i toppen**, så neste økt slipper å gjøre avstemmingen på
nytt: «375 rader dekker 360 av 449 ruter; se `docs/funksjonsinventar-2026-07-29.md` for skillet
mellom reelle skjermer og redirects.»

**6. Legg til en designkolonne — men mot Claude Paper, ikke mot v2.** «Design»-haken i planen betyr
i dag «designet i en eller annen kanon», og 15 av 16 grønne AgencyOS-haker viser til den avviklede
v2-kanonen. Enten omdøpes haken til «Design (v2, avviklet)», eller den nullstilles og settes på nytt
etter hvert som Claude Paper-flatene lages. Å la den stå som «Design ✓» er den enkeltendringen som
mest sannsynlig får en fremtidig økt til å tro at designfasen er ferdig.

---

# Del 7 — Prioritert liste over høyest-verdi gap

Rangert på verdi, ikke på hvor lett det er. Signalene er «Verdi»-kolonnen i MASTER-SKJERMPLAN og
asymmetri-avsnittet i funksjonsinventaret (§ 1.6). Dette er **forslag til neste steg** — ingenting
er utført.

**1 · Klubbflatene (10 skjermer, kategori 3, 0 % i begge kanoner).** Den eneste gruppen som aldri
har vært gjennom en designrunde. Samtidig er det den mest utadvendte: `team-gfgk` er en delbar
foreldremøte-presentasjon, `gfgk-junior` er en offentlig microsite, og `team-wang` er flaten 11
WANG-elever og foreldrene deres møter. Dette er plattformens ansikt mot folk som ikke er kunder
ennå. Neste steg: avklar om disse skal inn i Claude Paper i det hele tatt, eller om de hører til
i klubbenes egne designprosjekter — det er en scope-beslutning, ikke en designoppgave.

**2 · De to Claude Paper-skjermene må bli tre-fire før dekningen kan måles meningsfullt.**
Prosjektets egen revisjon sier det rett ut: «komplett måles i dag mot 3 skjermer», og 47 av 63
komponenter brukes av null skjermer. Et komponentbibliotek som er tre ganger større enn skjermene
som bruker det, er ikke verifisert — det er antatt. Neste steg: velg de 3–4 skjermene som
tilsammen bruker flest av de 47 ubrukte komponentene (golfviz-familien på 9 er den største
blokken, og den har null skjermer i dag), og bygg dem. Da får biblioteket sin første ekte test.

**3 · TrackMan i PlayerHQ (2 skjermer, eneste kategori 3 i PlayerHQ).** Alt annet i PlayerHQ har
minst en v2-komponent å oversette fra. TrackMan har ingenting — verken designskjerm eller
v2-komponent — og er samtidig kjernen i «TrackMan Truth Layer», som er det strategiske
vekst-initiativet mot AI Coach til $10M ARR. Å ha den ene udesignede flaten i PlayerHQ akkurat
der er en dårlig match mot prioriteringene. `components/golfviz/DispersionMap` og `GappingChart`
finnes allerede i Claude Paper og er bygget for nettopp dette.

**4 · Foreldreportalen (11 skjermer, 0 % mot fasit, 9 % mot v2).** Foreldre er de som betaler,
og de har den svakeste designdekningen av alle innloggede flater. Ti av elleve sider har en
`Forelder*V2`-komponent, men ingen designet flate — så jobben er ren oversettelse, ikke
nybygging. Billigste vei fra 0 % til noe reelt.

**5 · De to gapene asymmetri-avsnittet peker på — begge er designoppgaver, ikke kodeoppgaver.**
(a) Ingen admin-side lar coachen bygge en Gameplan/sikte-plan for en spiller, selv om alle
skrive-actions finnes på spillersiden. (b) Ingen spiller-side viser AI-forslagene som venter på
godkjenning hos coachen — spilleren ser ikke at noe er «på vei». Begge trenger en skjerm som ikke
finnes i noen kanon, og begge lukker et hull der plattformen i dag oppfører seg ulikt mot de to
brukergruppene.

**6 · `DataTable` — det billigste hullet, men ikke det mest verdifulle ennå.** 19 av 20
komposisjonsmønstre har komponent; hullet er sorterbar tabell, som per revisjonen etterspørres av
null skjermer i dag. Den blokkerer derimot `LedgerTable`, `BudgetVarianceRow` og
`RankedInsightList` — altså hele økonomi-familien. Bygg den når økonomiskjermene skal designes,
ikke før.

**Bevisst ikke på lista:** de ~25 uoppdagbare skjermene fra funksjonsinventarets Del 5. De er
fortsatt den billigste og mest lønnsomme jobben i hele plattformen, men de er en navigasjons- og
lenkejobb, ikke en designjobb. De hører hjemme i kodesporet, og de bør gjøres uansett hva
designfasen bestemmer.
