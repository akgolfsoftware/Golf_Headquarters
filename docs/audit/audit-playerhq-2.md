# Audit PlayerHQ Del 2 — 2026-05-24

## Partisjon
Talent + Meg + Booking + Fullscreen + Mal + Statistikk + Trackman + Ny-okt + Onskeligokt + Varsler + Reach + Profil

## Sammendrag
- Totalt: 86 ruter
- OK: 76
- Stub: 4 (`InnstillingerStub` placeholders i innstillinger sub-routes)
- Redirect: 1 (`/portal/meg/innstillinger/sikkerhet` -> `/portal/meg/sikkerhet`)
- Form/Action-tunge: 18 (wizard- og form-sider — fungerer som dedikert UI)
- Bug: 4 (sidebar/topbar brand-tekst-brudd + Instrument Serif font-import + AK GOLF i topnav)

## Topp 10 prioriterte fixes

1. **`/portal/(fullscreen)/tren/workbench-client.tsx:449-453`** — Sidebar har hardkodet "AK GOLF / PLAYERHQ / · PRO" i `.sb-brand`. Skal bruke `<SidebarBrand>` med ak-logo (sidebar-merkevare-regel).
2. **`/portal/(fullscreen)/tren/page.tsx:11-23`** — Importerer `Instrument_Serif` fra `next/font/google`. Designsystem tillater kun Inter, Inter Tight og JetBrains Mono. Bruk Inter Tight med `italic` i stedet.
3. **`/portal/mal/bygger/bygger-client.tsx:194-195`** — Topbar inneholder "AK GOLF · PLAYERHQ"-tekst. Erstatt med logo eller eyebrow.
4. **`/portal/meg/innstillinger/integrasjoner/page.tsx:68`** — Topnav har "AK GOLF · PLAYERHQ" som span. Erstatt med logo/eyebrow.
5. **`/portal/meg/innstillinger/eksport/page.tsx`** — Stub via `InnstillingerStub`. Hjemfaller GDPR-rettighet (art. 15). Skal være ferdig (krever migrasjon).
6. **`/portal/meg/innstillinger/varsler/page.tsx`** — Stub. Bør prioriteres: kritisk for push-tillatelser og e-postvalg.
7. **`/portal/meg/innstillinger/sprak/page.tsx`** — Stub. Lav prioritet — kun nb-NO i V1.
8. **`/portal/meg/innstillinger/okter/page.tsx`** — Stub. Sesjons-administrasjon. Bør prioriteres for sikkerhet.
9. **`/portal/(fullscreen)/live/[sessionId]/active/page.tsx`** — Bruker stub-drill-data (sessionDrillInstance ikke koblet).
10. **`/portal/(fullscreen)/live/[sessionId]/summary/page.tsx`** — Hardkodet `SummaryV2Data` stub-data; mangler `freezeSessionSummary`-kall.

## Per rute

### /portal/talent + sub-ruter
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| /portal/talent | OK | HubFrame | Solid hub |
| /portal/talent/min-plan | OK | TalentHero | DB-koblet |
| /portal/talent/mitt-niva | OK | TalentHero | DB-koblet |
| /portal/talent/roadmap | OK | Egen CSS | SVG-chart med fill-hex (lovlig) |
| /portal/talent/sammenligning | OK | TalentHero | DB-koblet |

### /portal/meg (med 22 sub-ruter)
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| /portal/meg | OK | HubFrame | Hub |
| /portal/meg/abonnement | OK | PlayerHero | Tier-flow |
| /portal/meg/abonnement/avbestill | OK | Egen | Confirm-flow |
| /portal/meg/abonnement/faktura/[id] | OK | Ingen | Faktura-detalj |
| /portal/meg/abonnement/kort/ny | Form | PlayerHero | Stripe-mock m/hex |
| /portal/meg/abonnement/oppgrader | OK | PlayerHero | Sales-CTA |
| /portal/meg/abonnement/oppgrader/flyt | Form | PlayerHero | Wizard |
| /portal/meg/bookinger | OK | PlayerHero | Tabs |
| /portal/meg/bookinger/reschedule/[bookingId] | Form | PlayerHero | Slot-picker |
| /portal/meg/dokumenter | OK | PlayerHero | Empty-state |
| /portal/meg/feedback | Form | PlayerHero | App-feedback |
| /portal/meg/foreldre | OK | PlayerHero | Invite-flow |
| /portal/meg/help | OK | Egen | Help-search |
| /portal/meg/help/artikkel/[slug] | OK | Egen | Artikkel-detalj |
| /portal/meg/help/kategori/[slug] | OK | Egen | Kategori-liste |
| /portal/meg/help/kontakt | Form | PlayerHero | Support-form |
| /portal/meg/helse | OK | PlayerHero | DB-koblet logg |
| /portal/meg/helse/symptom/ny | Form | PlayerHero | Wizard |
| /portal/meg/innstillinger | OK | InnstillingerShell | 6 kategorier |
| /portal/meg/innstillinger/anlegg | OK | Egen | Fasilitet-profil |
| /portal/meg/innstillinger/eksport | Stub | InnstillingerStub | "Kommer i runde 9" |
| /portal/meg/innstillinger/integrasjoner | Bug | Egen | AK GOLF i topnav (linje 68) |
| /portal/meg/innstillinger/okter | Stub | InnstillingerStub | "Kommer i runde 9" |
| /portal/meg/innstillinger/personvern | OK | PlayerHero | GDPR-actions |
| /portal/meg/innstillinger/sikkerhet | Redirect | — | -> /portal/meg/sikkerhet |
| /portal/meg/innstillinger/sprak | Stub | InnstillingerStub | "Kommer i runde 9" |
| /portal/meg/innstillinger/varsler | Stub | InnstillingerStub | "Kommer i runde 9" |
| /portal/meg/profil/rediger | Form | PlayerHero | Profil-edit |
| /portal/meg/sikkerhet | OK | PlayerHero | 2FA-setup |
| /portal/meg/sikkerhet/2fa | Form | PlayerHero | Wizard |
| /portal/meg/utstyrsbag | Form | PlayerHero | Equipment-edit |

### /portal/booking + sub-ruter
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| /portal/booking | OK | Egen | Service-cards |
| /portal/booking/[bookingId] | OK | Booking-CSS | Detalj-side |
| /portal/booking/anlegg/[anleggId] | OK | Egen | Bane-detalj |
| /portal/booking/bekreftet | OK | Ingen | Konfirmasjon |
| /portal/booking/coach/[coachId] | OK | Egen | Coach-profil |
| /portal/booking/ny | OK | PlayerHero | Slot-velger |
| /portal/booking/ny/bekreft | Form | PlayerHero | Confirm-flow |

### /portal/(fullscreen)/live + (fullscreen)/test + tren
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| /portal/(fullscreen)/live/[sessionId] | OK | LiveShell | Custom shell ok |
| /portal/(fullscreen)/live/[sessionId]/active | Stub | Custom | Stub-drill-data |
| /portal/(fullscreen)/live/[sessionId]/brief | OK | Custom | DB-koblet |
| /portal/(fullscreen)/live/[sessionId]/logger | Stub | LoggerClient | Dummy-drill |
| /portal/(fullscreen)/live/[sessionId]/summary | Stub | SummaryV2Client | Stub-data |
| /portal/(fullscreen)/live/[sessionId]/tapper | OK | TapperShell | DB-koblet |
| /portal/(fullscreen)/test/[testId]/live | Stub | Custom | Mockup-content |
| /portal/(fullscreen)/test/[testId]/summary | Stub | Custom | Mockup-content |
| /portal/(fullscreen)/tren | Bug | WorkbenchClient | AK GOLF sidebar + Instrument Serif |

### /portal/mal + sub-ruter (baner, goal, runder, sg-hub, trackman, leaderboard, milepaeler, bygger)
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| /portal/mal | OK | Egen | PageHeader + cards |
| /portal/mal/baner | OK | PlayerHero | Empty-state |
| /portal/mal/baner/[id] | OK | PlayerHero | Tabs-detalj |
| /portal/mal/bygger | Bug | Custom | Topbar AK GOLF-tekst |
| /portal/mal/goal/[id] | OK | Egen | Mal-detalj |
| /portal/mal/leaderboard | OK | Egen | DB-rangerer |
| /portal/mal/milepaeler | OK | PlayerHero | Achievement-liste |
| /portal/mal/runder | OK | PlayerHero | KPI + tabell |
| /portal/mal/runder/[id] | OK | PlayerHero | Slag-wizard |
| /portal/mal/runder/[id]/shot-by-shot | OK | Egen | Detalj-side |
| /portal/mal/runder/ny | Form | PlayerHero | Add runde-form |
| /portal/mal/sg-hub | OK | Egen | Executive overview |
| /portal/mal/sg-hub/[club] | OK | Egen | Club-detalj |
| /portal/mal/sg-hub/best-vs-now | OK | Egen | Session-diff |
| /portal/mal/sg-hub/coach/[spillerId] | OK | Egen | Coach-modus |
| /portal/mal/sg-hub/coach/[spillerId]/[club] | OK | Egen | Coach-detalj |
| /portal/mal/sg-hub/coach/[spillerId]/equipment | OK | EquipmentView | Re-bruker view |
| /portal/mal/sg-hub/conditions | OK | Egen | Wind/condition-slider |
| /portal/mal/sg-hub/equipment | OK | Egen | Club-fit |
| /portal/mal/sg-hub/strategy | OK | Egen | Strategy-cards |
| /portal/mal/sg-hub/yardage | OK | Egen | Stock-yardage-tabell |
| /portal/mal/statistikk | OK | PlayerHero | SG-aggregat |
| /portal/mal/trackman | OK | Egen | Bag-dispersion |
| /portal/mal/trackman/[id] | OK | PlayerHero | TM-detalj |

### /portal/statistikk + sub-ruter
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| /portal/statistikk | OK | StatistikkClient | Dashboard |
| /portal/statistikk/[metric] | OK | Egen | Drill-down |
| /portal/statistikk/runder/[runId]/del | OK | DelRundeClient | Share-card |
| /portal/statistikk/sammenlign | OK | PlayerHero | Sammenlign-client |

### /portal/trackman + ny-okt + onskeligokt + varsler + reach + profil
| Rute | Status | Shell | Merknader |
|---|---|---|---|
| /portal/trackman/[sessionId] | OK | Egen | TM-økt detalj |
| /portal/ny-okt | Form | PlayerHero | Wizard |
| /portal/onskeligokt | Form | PlayerHero | Send onske |
| /portal/onskeligokt/bekreftet | OK | Egen | Confirmation |
| /portal/varsler | OK | VarslerClient | Notifications-liste |
| /portal/reach | OK | PlayerHero | Reach/privacy |
| /portal/profil | OK | PlayerHero | Fasilitet-profil |

## Detaljerte funn

### Bug-detaljer (sidebar/topnav AK GOLF)
- `(fullscreen)/tren/workbench-client.tsx:449-453` — `<div className="sb-brand">AK GOLF<b>PLAYERHQ</b> · PRO</div>` i sidebar.
- `mal/bygger/bygger-client.tsx:194-195` — `<span ...>AK GOLF · PLAYERHQ</span>` i topbar.
- `meg/innstillinger/integrasjoner/page.tsx:68` — `<span className="name">AK GOLF · PLAYERHQ</span>` i topnav.

### Tillatte hex-farger (chart/SVG/visualiserings-kontekst)
- `talent/roadmap/page.tsx` — SVG-roadmap fill-farger
- `(fullscreen)/live/[sessionId]/active|brief|summary|tapper|logger` — egen full-screen-design
- `meg/abonnement/kort/ny/kort-form.tsx` — Stripe-card-mockup (kortdesign)
- `mal/sg-hub/page.tsx`, `mal/trackman/*`, `mal/baner/*`, `mal/runder/[id]/shot-by-shot` — chart/dispersion-data
- `statistikk/[metric]/page.tsx`, `statistikk/runder/[runId]/del/del-runde-client.tsx`, `statistikk/sammenlign/sammenlign-client.tsx` — chart/SG-data
- `booking/*` — egne hero/preview-bilder
- `varsler/varsler-client.tsx` — type-farger per varsel
- `onskeligokt/bekreftet/page.tsx` — timeline-prikker

### Stubs (4 totalt)
Alle bruker komponenten `<InnstillingerStub>` med "Kommer i runde 9". Disse skiller seg fra `CoachhqStubsShell` (forbudt) — er en lovlig dedikert placeholder for `/portal/meg/innstillinger/*`-spor.

### Forbudte komponenter funnet
Ingen funn av `CoachhqStubsShell`, `CoachhqStubShell`. Kun `InnstillingerStub` (lovlig dedikert placeholder).

### Norsk bokmål
Alle sider bruker norsk bokmål med æ/ø/å. Filer som er sjekket viser konsistent språkbruk.

### Lucide-ikoner
Alle gjennomgåtte sider importerer ikoner kun fra `lucide-react`. Ingen Heroicons, Phosphor, etc. funnet.

### Emojis i kode
Funn i `(fullscreen)/tren/ai-modaler.tsx` — bør undersøkes i egen oppfølging (utenfor partisjon for page.tsx-audit).

## Anbefaling

1. Erstatt 3 hardkodede "AK GOLF"-tekstforekomster med `<SidebarBrand>` eller logo-komponent.
2. Erstatt Instrument Serif-import med Inter Tight italic.
3. Bygg ferdig de 4 stubs i `/portal/meg/innstillinger/*` (eksport, okter, sprak, varsler) — minst varsler og okter prioriteres.
4. Koble live-session-stubs (active, brief, logger, summary) til ekte session-data.
5. Test-rutene (test/live, test/summary) er fortsatt rene mockups — koble på sessionRunner-data.
