# Rutefasit v2 — portering, modellvalg og komponentfasit, for Claude Code

**Skrevet:** 2026-08-16 · erstatter v1 (2026-08-12) · **Kilde:** konsolideringsgatene W3/W4/W5/drift, talt mot kode på `main`
**Hentet fra Claude Design via MCP 17.08.2026** (`605a48cc-81e8-44bd-94d2-07d50a97370a`,
`kart/rutefasit-for-claude-code.md`). Zip-leveransen 16.08 inneholdt fortsatt v1 — v2 fantes
kun i designprosjektet. Menneskelesbar utgave der: `Rutekart v2 - portering og komponentfasit.html`.

> **Kontrakten og Claude-følelsen står i `CLAUDE.md` §Skjermarbeid**, ikke her — v2 sier det selv
> («legges i repoets `CLAUDE.md`, koster da 0 tokens per sesjon»). Denne fila eier tabellene:
> rute → mal-fasit → avvik → komponenter. Ikke dupliser reglene tilbake hit.

## Porteringsstrategi (token-økonomi)

1. **Én sesjon per mal-fasit, aldri per rute.** Les malens fasit-HTML ÉN gang, bygg/verifiser mal-komponenten, ta deretter alle variantrutene som diffs i samme kontekst.
2. **Variantruter åpner aldri fasit-HTML.** De kodes fra tre ting: avvikslinjen, komponentlisten (tabellene under), mal-komponentens fil i repoet. Trenger de mer → strøket én-linje-testen → stopp og meld.
3. **Les komponenter, ikke skjermer.** Slå opp props i komponentfila, ikke i fasit-HTML.
4. **Verifiser samlet:** m390 + d1280-skjermbilder i én batch på slutten av sesjonen → PP-W*-VARIANTS.
5. **Parallelliser per mappe** (aldri to sesjoner i samme filer). Godkjenning skjer på variants-loggen.
6. **Plan-modus kun der beslutninger tas** (mal-skjermer, strøkne ruter) — variantruter bygges direkte.

## Modellvalg

| Oppgaveklasse | Modell |
|---|---|
| Mal-skjerm førstegang · ruter som stryker én-linje-testen | Opus, plan-modus |
| Variantruter (≈90 % av volumet) | Sonnet |
| Pixel-pass på eksisterende V2 | Sonnet |
| Redirect-stubber, aliaser, lint, variants-logg, skjermbilder | Haiku / script |
| Gate-review per bølge før merge | Opus (kort sesjon) |

## Skall-pakkene (arves fra layout — skrives aldri per rute)

| Skall | Desktop | Mobil |
|---|---|---|
| PlayerHQ `/portal` | Topbar · Rail · Composer · CommandPalette · StatusBar | TabBar · BottomSheet (Composer kun Hjem) |
| AgencyOS `/admin` | Topbar · Rail · Composer · CommandPalette · Panel (380 px) · SpillerGruppeVeksler | TabBar · BottomSheet |
| Marketing/Auth | eget lett skall i malen — ingen Rail/Composer | samme, én kolonne |
| Forelder | Topbar · Tabs — ingen Composer | TabBar |

Komponentkolonnene under lister kun det som er unikt for skjermen.

## W3 — PlayerHQ (fasit-mappe `fase2/playerhq/`)

| Rute | Mal-fasit | Avvik (hele forskjellen) | Komponenter |
|---|---|---|---|
| /portal/meg/innstillinger | playerhq-innstillinger.html | hub — malen som den er | ListGroup, ListRow, Toggle, StickyActionBar |
| …/innstillinger/varsler | playerhq-innstillinger.html | kun varselgruppa | ListGroup, Toggle |
| …/innstillinger/sprak | playerhq-innstillinger.html | radioliste nb/en | Radio |
| …/innstillinger/okter | playerhq-innstillinger.html | standardvarighet + påminnelsestid | Select, SegmentControl |
| …/innstillinger/anlegg | playerhq-innstillinger.html | liste med hjemmeanlegg først | ListRow, Radio |
| …/innstillinger/ai-coach | playerhq-innstillinger.html | tone + forslagsmengde + av/på | SegmentControl, Slider, Toggle |
| …/innstillinger/personvern | playerhq-innstillinger.html | samtykker + eksport + sletting nederst, aldri aksent | Checkbox, Button, ConfirmDialog |
| …/innstillinger/sikkerhet | playerhq-innstillinger.html | passord + 2FA | FormField, TextInput, Toggle, CodeInput |
| …/innstillinger/integrasjoner | playerhq-innstillinger.html | tilkoblede tjenester med status per rad | ListRow, StatusBadge, Button |
| /portal/meg/abonnement | playerhq-abonnement.html | malen som den er | KeyValueGrid, ListRow, Button |
| …/abonnement/faktura/[id] | playerhq-abonnement.html | kvitteringsdetalj, nedlastbar PDF | KeyValueGrid, Button |
| …/abonnement/kort/ny | playerhq-abonnement.html | kortskjema (Stripe-element) | FormField, TextInput |
| …/abonnement/avbestill | playerhq-abonnement.html | bekreftelse: hva du mister og når | Callout, ConfirmDialog |
| …/abonnement/oppgrader/flyt | playerhq-abonnement.html | pakkevalg → betaling | Stepper, FeaturedCard, Button |
| /portal/meg/helse (+ symptom/ny) | playerhq-helse.html | symptom/ny er BottomSheet-ark; FYS-score «—» til formel vedtatt | VelvaereKort, TrendBand, Sparkline, BottomSheet, Slider, EmptyState |
| /portal/booking/ny (+bekreft, bekreftet) | playerhq-booking-ny.html | query-drevet veiviser; uten pakke → redirect /coaching | Stepper, DayStrip, TimeGrid, SessionCard, StickyActionBar |
| /portal/booking/[bookingId] | playerhq-booking-mine.html | §12 kvitteringsdetalj | KeyValueGrid, SessionCard, StatusBadge |
| /portal/booking/coach/[id] · anlegg/[id] | playerhq-booking-mine.html | §12 detaljkort | Avatar, KeyValueGrid, ListGroup |
| /portal/coach (+ melding/[id]) | playerhq-coach-hub.html | hub + tråd — malen som den er | MeldingsTraad, ListRow, Tabs |
| /portal/coach/ai | playerhq-coach-hub.html | trådmalen med AI-avsender | MeldingsTraad |
| /portal/coach/ovelser · videoer | playerhq-coach-hub.html | §10 liste | ListRow, FilterPills |
| /portal/coach/plans | playerhq-coach-hub.html | periodeliste | Periodeplan, ListRow |
| /portal/coach/sg-hub | playerhq-coach-hub.html | §9 tabell | DataTable |
| /portal/coach/sporsmal (+[id], ny) | playerhq-coach-hub.html | liste + tråd + skjema | ListRow, MeldingsTraad, Textarea |
| /portal/talent/mitt-niva · roadmap | playerhq-talent.html | de to tilstandene i malen; FEATURES.TALENT av → notFound | NivaStige, PyramidProgress, GoalProgress |
| /portal/talent (+ min-plan) | playerhq-talent.html | sammenstilling av samme data (åpent: hub → redirect?) | NivaStige, BenchmarkBadge |
| /portal/talent/sammenligning | playerhq-talent.html | kohorttabell på §9 | DataTable, BenchmarkBadge |
| /portal/meg/help (+kategori, artikkel, kontakt) | gfgk-veileder-artikkel.html | GFGK-artikkelmalen med PlayerHQ-chrome | Breadcrumbs, SectionHeader, SearchField, ListRow |

**Utgår (Haiku):** 10 `(legacy)/coach/*`-stubber · `meg/innstillinger/eksport`, `meg/sikkerhet`, `meg/abonnement/oppgrader` · 5 aliaser.

## W4 — AgencyOS (fasit-mappe `fase2/agencyos/`)

| Rute | Mal-fasit | Avvik | Komponenter |
|---|---|---|---|
| /admin/godkjenninger · handlingssenter · queue · approvals(+[id]) · foresporsler | agencyos-godkjenninger.html | ÉN flate — rutene bak pillene nås fra ⌘K | QueueCard, ProvenanceDisclosure, FilterPills, Panel, ConfirmDialog, Toast |
| /admin/grupper | agencyos-gruppe-detalj.html | §9-liste av grupper | DataTable, SpillerKort |
| /admin/grupper/[id] (+arsplan, skoledata, timeplan, workbench) | agencyos-gruppe-detalj.html | faner på samme flate, samme loader | Tabs, PageHeader, Periodeplan/YearTimeline (arsplan), TimeGrid (timeplan), KanbanKolonne (workbench), DataTable (skoledata) |
| /admin/bookinger | agencyos-bookinger.html | malen som den er | UkeKalender, TimeGrid, VisningsVelger, AgendaRow |
| …/bookinger/[id] | agencyos-bookinger.html | kvitteringsdetalj på §12 | KeyValueGrid, SessionCard, StatusBadge |
| …/bookinger/ny | agencyos-bookinger.html | tjeneste → tid → spiller (samme tre steg som PlayerHQ) | Stepper, TimeGrid, SpillerKort |
| (legacy) availability · kapasitet · services · anlegg | agencyos-bookinger.html | «Tjenester og åpningstid»-kortet som egen flate | ListGroup, BudgetBar (kapasitet), Toggle |
| /admin/plans (+[planId]) | agencyos-planbibliotek.html | [planId] = inspektørpanelet i full bredde | CardGrid, FilterPills, Panel, OektKort |
| /admin/plan-templates (+[id], rediger, ny) | agencyos-planbibliotek.html | skjema på malstrukturen; effectiveness = Effekt-blokka i full bredde | FormField, Textarea, BarChart (effekt) |
| /admin/teknisk-plan · okter | agencyos-planbibliotek.html | okter = §9 tabell | DataTable, OektKort |
| /admin/tournaments (+[id], ny, dubletter) · turnering-kart | agencyos-turneringer.html | dubletter = §12-sammenslåing i malen | DataTable, TurneringNedtelling, StatusBadge, MaanedKalender (kart), ConfirmDialog (sammenslåing) |
| /admin/settings (+api, calendar, security, periode-*, tilgang) | agencyos-oppsett.html | avvik per fane står i malen og w4-notatet | Tabs, FormField, Toggle, Select, KeyValueGrid |
| /admin/klubb/innstillinger · integrasjoner · team(+inviter) | agencyos-oppsett.html | team/inviter = én rad i skjema | StatusBadge (integrasjoner), FormField, ListRow |
| /admin/gdpr · audit-log · feillogg | agencyos-oppsett.html | «System og logg» — destruktivt nederst, aldri aksent | DataTable, ConfirmDialog, Callout |

**Utgår (Haiku):** ~38 redirect-stubber (<600 B) · ⚠ «~26 `(legacy)`-ruter med v2-erstatning» er MOTBEVIST mot kode 17.08 — 21 legacy-admin-ruter har ekte innhold, kun ÉN har faktisk v2-erstatning. IKKE bruk som slettliste, se PORTPLAN §A0.

## W5 — Marketing · Auth · Forelder · System (`fase2/marketing|auth|forelder|system/`)

| Rute | Mal-fasit | Avvik | Komponenter |
|---|---|---|---|
| (marketing)/ + 13 sider | marketing-side.html | tre skallvarianter i malen: hero+bevis / pris / prosa — velg per rute | FeaturedCard, CardGrid, KpiStripe (bevis), Accordion (faq), Button, Divider |
| coacher · anlegg · blogg · cases · turneringer (+[slug]) | marketing-katalog.html | §10 liste + §12 detalj, samme mal uansett innholdstype | CardGrid, ListRow, FilterPills, SearchField, Avatar, Pagination, KeyValueGrid |
| 13 auth-ruter + /onboard/* | auth-flyt.html | tilstander i malen; logg-inn/login = alias (åpent: redirect) | FormField, TextInput, Button, Callout, CodeInput, Banner, FieldMessage |
| guardian-consent/[token] · lyd-samtykke/[token] · samtykke-venter · onboarding/forelder · inviter/forelder/[token] | auth-samtykke.html | samtykke aldri forhåndshuket, punkt for punkt | Checkbox, ListGroup, Callout, Button, StatusBadge (venter) |
| /forelder/* (9 undersider) | forelder-barn.html | én mal med fanevisninger; personvernlinjen står i visningen | Tabs, KpiCard, ListRow, KeyValueGrid, Banner, DataTable (fakturaer), StatusBadge |
| /offline · 404 · 500 · vedlikehold · 403 · FEATURES-gate | system-tilstander.html | globalt mønster i rot-layoutene, IKKE per rute (lukker P4); vedlikehold/403 mangler ruter | EmptyState, Banner, Button, Skeleton |

## Drift/AgenticOS (`fase2/agencyos/`)

| Rute | Mal-fasit | Avvik | Komponenter |
|---|---|---|---|
| /admin/agenticos (NY) | agencyos-agenticos-hub.html | malen som den er; redirects fra agents, agent-team, kommando/* | QueueCard, StatusCircleRow, LiveStatus, KpiStripe, ListRow, Panel |
| /admin/agents/[agentId] | agencyos-agent-detalj.html | én mal; manuelle agenter får kjøringsskjemaet | Tidslinje (kjøringssteg), StatusBadge, ProvenanceDisclosure, FormField, DataTable (historikk) |
| /admin/brief (+ meg/dispatch, meg/morgenbrief) | eksisterende V2 | pixel-pass mot Paper; dispatch/morgenbrief → redirect (åpent) | MeldingsTraad, Composer |
| /admin/recording | eksisterende V2 | pixel-pass; pipeline-stegene som i huben | VideoScrubber, PositionMarker, Tidslinje |
| /admin/workspace (+notion, prosjekter) | eksisterende V2 | pixel-pass; oppgavesystem-valget (KommandoTask vs Notion) er åpent | KanbanKolonne, ListRow |
| /admin/marketing · reports | agencyos-oppsett.html-mønsteret | inngang fra huben; egen fasit kun hvis én-linje-testen stryker | Tabs, KpiCard, DataTable, FilterPills |

## Utenfor denne fila

- **`(marketing)/stats/*` (~45):** blokkert av PR-F — egen designrunde (W7-stats), ikke mal-varianter.
- **Alle ruter med egen fasit:** styres av `PAPER-ZIP-CHECKLIST.md`, ikke denne.
- **Redirect-stubber og `(legacy)`:** kodes aldri mot denne fila.
- **Komponentnavn** = designsystemets vokabular (`components/` i designprosjektet). Mangler repo-motstykket, bygges komponenten først — én gang — og gjenbrukes; aldri inline per skjerm.

## Verifisert mot kode (17.08.2026)

Tabellene over er designfasit. Målingen mot `main` @ `382a14c0` står i `docs/port/PORTPLAN.md`:
25 av 54 rader stryker én-linje-testen, og 4 av 5 «Utgår»-påstander stemmer ikke mot koden —
særlig «~26 `(legacy)`-ruter med v2-erstatning», der kun ÉN har faktisk erstatning.
**Les PORTPLAN §A0 før du bruker «Utgår»-linjene som slettliste.**

---

## W8 — Treningsplanlegging (nye og endrede ruter, zip 20.08.2026)

| Rute | Mal-fasit | Avvik (hele forskjellen) | Komponenter |
|---|---|---|---|
| /portal/onboarding/trening **(NY)** | `fase2/playerhq/playerhq-onboarding-tillegg.html` | — (egen mal) | TallStepper (NY), DagVelger (NY), MaaleFelt (NY) |
| /portal/meg/innstillinger **(endret)** | `fase2/playerhq/playerhq-innstillinger.html` | Ny Visning-gruppe med Standard/Tour-radiovalg — ellers uendret. | — (RadioGroup-rader finnes) |
| /portal/meg/profil **(endret)** | `fase2/playerhq/playerhq-profil.html` | Nå eneste profil-fasit (fase1/spillerprofil.html utgått); + «hvem ser deg», testhistorikk og grupper som tre nye kort. | — |
| /portal/gjennomfore/[id] **(endret)** | `fase2/playerhq/playerhq-okt-detalj.html` | + rediger-tilstand og teknikk-dimensjon per drill (motorikk-velger KUN på fullsving). | TallStepper (NY) |
| /portal/tren/teknisk-plan/[planId] **(endret)** | `fase2/playerhq/playerhq-teknisk-plan.html` | + målmatrise (motorikk × miljø), rep-telling per fokus og statusrapport med spredning i tre kontekster. | MaalMatrise (NY) |
| Sløyfa UNDER **(endret)** | `fase1/playerhq-live-okt.html` | + hurtigtapp +5/+10/+25, FYS-serielogging, kondisjon per sone-segment, spontan drill og pausetelling. | HurtigTapper (NY), SettLogger (NY), SoneSegmentLogger (NY), TallStepper (NY) |
| Sløyfa ETTER **(endret)** | `fase1/playerhq-live-summary.html` | + tre stjernerader (fokus/gjennomføring/mestring) og total pausetid. | StjerneRad (NY) |
| /admin/grupper/[id] **(endret)** | `fase2/agencyos/agencyos-gruppe-detalj.html` | + «denne økta blir nå din egen»-tilstanden (frigi ved avlysing), hovedcoach-begrepet, og laster/feil-tilstand. | — (ConfirmDialog finnes) |
| Workbench · periodemal **(avklart)** | `fase1/workbench-periodemal.html` | Eneste fasit for flyten (antall økter per pyramide → skall-økter → kø av ufylte); `fase2/agencyos/agencyos-periodemal.html` er utgått. | — |
| Workbench · kalender **(uendret 20.08-fasit)** | `fase1/workbench-desktop.html` | Årstidslinje + skall-økter finnes allerede i både d1280 og m390; ingen ny utvidelse i denne runden. | — |

## Nye komponenter samlet (Sonnet må bygge disse — de finnes IKKE i `_ds_bundle.js`)
- **TallStepper** — numerisk stepper (− / verdi / +, 44 px mål). Brukes i okt-detalj rediger, live-øktas FYS-logging og onboarding-tillegget.
- **MaalMatrise** — rutenett motorikk × miljø, reps gjort/mål per celle, «—» = ikke planlagt, nådd = --up. Ordet «belastning» vises aldri.
- **HurtigTapper** — +5/+10/+25-rad under hovedtapperne i live-økt.
- **SettLogger** — FYS-serielogging: reps + vekt (2,5 kg-steg), «Logg sett», sett-liste.
- **SoneSegmentLogger** — kondisjonssegmenter: Oppvarming/Drag/Hvile, sone 1–5, tid per segment.
- **StjerneRad** — 1–5-vurdering med SVG-stjerner (fylt = --fg, aldri oransje).
- **DagVelger** — 7-dagers flervalgsrad for foretrukne treningsdager.
- **MaaleFelt** — tallfelt med enhetsetikett (m/fot) og forklaringslinje.

Detaljene per skjerm står i `fase2/manifest-utkast-*.md` (ett manifest per ny/utvidet skjerm, 20.08.2026).
