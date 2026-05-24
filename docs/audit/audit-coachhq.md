# Audit CoachHQ — 2026-05-24

## Sammendrag
- Totalt: 130 ruter (page.tsx + layout.tsx) under `src/app/admin/`
- OK: 86
- Stub/Bug/Mangler design: 13
- Redirect: 11
- Form/Action: 20

## Topp 10 prioriterte fixes

1. `/admin/spillere/[id]/rediger` — hardkodet hex-palett (#E5E3DD, #FAFAF7, #5E5C57, #005840, #D1F843, #0A1F17, #BFE933, #F1EEE5) brukt overalt i className via `bg-[#hex]` og `text-[#hex]`. Skal være semantiske tokens. ~30+ forekomster.
2. `/admin/spillere/[id]/profil` — samme problem: ti-talls hardkodet hex (#E5E3DD, #FBFAF5, #005840, #D1F843, #0A1F17, #5E5C57, #F1EEE5).
3. `/admin/spillere/[id]/plan/[planId]` — hardkodet hex i className/style + Tailwind-arbitrære farger (bg-amber-100, bg-emerald-100 etc. for drill-kategori — kan være OK som data, men gradient `#003A2A`/`#005840` linje 364 er ikke det.
4. `/admin/spillere/[id]/page.tsx` — Tailwind-arbitrære hex `bg-[#005840]`, `text-[#D1F843]` for tier-badges (linje 54-58, 74-76) og `border-[#E5E3DD]` mange steder.
5. `/admin/okter/page.tsx` — pyramide-fargepalett hardkodet med hex (`bg-[#16A34A]`, `bg-[#005840]`, `bg-[#D1F843]`, `bg-[#F4C430]`, `bg-[#5E5C57]`) linje 42-54. Bør bruke `var(--color-pyr-*)`-tokens som andre sider gjør.
6. `/admin/grupper/page.tsx` + `/admin/groups/page.tsx` — duplikate ruter for samme funksjonalitet (grupper på norsk, groups på engelsk). `groups/page.tsx` bruker `var(--gradient-avatar-*)`, `grupper/page.tsx` bruker hex-gradienter direkte. Sammenslå til én rute.
7. `/admin/calendar` vs `/admin/kalender` vs `/admin/calendar/maned` vs `/admin/kalender/maned`/`uke` — 4 ruter for samme funksjonalitet (engelsk vs norsk + ulike vy-struktur). Konsolider til norsk variant og redirect engelsk.
8. `/admin/bookings` vs `/admin/bookinger` — duplikate ruter. Konsolider.
9. `/admin/anlegg` vs `/admin/locations` + `/admin/facilities` — `anlegg` er samle-side med tabs som importerer Locations/Facilities som under-tabs. Konsolider URL-er.
10. `/admin/reports/page.tsx` — Server Actions er stub med `console.log` (linje 16, 21, 27, 33). Ingen faktisk rapportgenerering implementert.

## Per rute (gruppert etter top-level)

### /admin (root + agencyos + brief + board + queue + oppfolging)

| Rute | Status | Shell brukt | Merknader |
|---|---|---|---|
| /admin | Redirect | — | → /admin/agencyos |
| /admin/layout | OK | AdminShell | krever ADMIN/COACH |
| /admin/agencyos | OK | tab-layout | AgencyOSLayout + CoachHome |
| /admin/agencyos/layout | OK | tab-nav | AgencyOSTabNav |
| /admin/agencyos/caddie | OK | PageHeader | mock-modus indikert |
| /admin/agencyos/caddie/aktivitet | OK | egen client | Caddie-aktivitet timeline |
| /admin/agencyos/okonomi | OK | PageHeader | Stripe KPI |
| /admin/agencyos/spillere | OK | PageHeader | søkbar tabell |
| /admin/agencyos/uka | OK | PageHeader | 7-dagers kanban |
| /admin/board | Redirect | — | → /admin/spillere?view=tavle |
| /admin/brief | OK | PageHeader+AgentStrip | AI-brief, anthropic |
| /admin/queue | OK | PageHeader | oppfolgings-kort |
| /admin/oppfolging | Redirect | — | re-eksporterer Queue |

### /admin/spillere + elever

| Rute | Status | Shell brukt | Merknader |
|---|---|---|---|
| /admin/spillere | OK | PageHeader | kort/tabell/tavle views |
| /admin/spillere/ny | Form | Wizard | spiller-onboarding-wizard |
| /admin/spillere/[id] | OK | DetailShell | tab-basert detail |
| /admin/spillere/[id]/profil | Mangler design | egen header | mange hex-farger |
| /admin/spillere/[id]/rediger | Mangler design | egen header | ekstrem hex-palett |
| /admin/spillere/[id]/plan/[planId] | Mangler design | egen header | hex + Tailwind ad-hoc |
| /admin/spillere/[id]/tester | OK | egen screen | test-modul-v2 |
| /admin/spillere/[id]/tildel-test | Form | modal-screen | test-modul-v2 |
| /admin/elever | Redirect | — | → /admin/spillere?view=tabell |
| /admin/elever/[id] | OK | egen 360 | 360-profil med tabs |
| /admin/elever/[id]/ai | OK | PageHeader | CoachAI chat |
| /admin/elever/[id]/light | OK | PageHeader | mobil-vennlig |
| /admin/elever/[id]/rediger | Form | PageHeader | rediger-spiller-form |
| /admin/elever/[id]/sammenligning | OK | PageHeader | side-om-side stats |
| /admin/elever/ny | Form | PageHeader | ny spiller-form |
| /admin/stall | OK | HubFrame | hub Del 3 |

### /admin/grupper + groups

| Rute | Status | Shell brukt | Merknader |
|---|---|---|---|
| /admin/grupper | Bug | PageHeader | duplikat av /groups, hex-gradienter |
| /admin/grupper/[id] | OK | DetailShell | pixel-perfekt |
| /admin/groups | OK | PageHeader | bruker CSS-tokens for gradienter |
| /admin/groups/[id] | OK | PageHeader | gruppe-detalj |

### /admin/talent

| Rute | Status | Shell brukt | Merknader |
|---|---|---|---|
| /admin/talent/layout | OK | feature-flag gate | FEATURES.TALENT |
| /admin/talent | Mangler design | PageHeader | hex i SVG-talent-kart |
| /admin/talent/[playerId] | OK | DetailShell | 360-profil radar |
| /admin/talent/discovery | OK | PageHeader | scout-feed |
| /admin/talent/kohort | OK | PageHeader | K3 kohort-analyse |
| /admin/talent/radar | OK | PageHeader | radar-oversikt |
| /admin/talent/radar/[playerId] | Form | PageHeader | radar-form |
| /admin/talent/region | OK | PageHeader | norge-pin-kart |
| /admin/talent/ressurser | OK | PageHeader | ressurs-bibliotek |
| /admin/talent/sammenligning | OK | PageHeader | 2-3 spillere overlay |
| /admin/talent/wagr-benchmark | OK | PageHeader | NGF-kategorier |
| /admin/talent/wagr-import | OK | HubFrame | redesignet, ikke stub |

### /admin/planlegge + plans + plan-templates + drills + tournaments + okter + videoer + teknisk-plan

| Rute | Status | Shell brukt | Merknader |
|---|---|---|---|
| /admin/planlegge | OK | HubFrame | hub design |
| /admin/plans | OK | PageHeader | kanban-view |
| /admin/plans/[planId] | OK | DetailShell | plan-detalj |
| /admin/plans/new | Form | egen wizard | PlanWizard + AI-panel |
| /admin/plans/templates | OK | PageHeader | mal-bibliotek |
| /admin/plans/templates/ny | Stub | EmptyState | "kommer i v2" tekst synlig |
| /admin/plans/templates/[id]/rediger | Form | egen editor | TemplateEditor |
| /admin/plans/templates/[id]/effectiveness | OK | PageHeader | effekt-detalj |
| /admin/plan-templates | Redirect | — | → /admin/plans/templates |
| /admin/plan-templates/ny | Form | PageHeader | NewTemplateForm |
| /admin/plan-templates/[id] | OK | PageHeader | TemplateDetail |
| /admin/plan-templates/[id]/rediger | Form | PageHeader | TemplateEditor |
| /admin/drills | OK | egen grid | DrillGrid mock-data |
| /admin/drills/[id] | OK | egen detail | drill-detail-actions |
| /admin/drills/[id]/rediger | Form | egen form | DrillEditForm |
| /admin/tournaments | OK | PageHeader | tour-pills |
| /admin/tournaments/[id] | OK | DetailShell | turnering-detalj |
| /admin/tournaments/ny | Form | PageHeader | NyTurneringWizard |
| /admin/okter | Bug | PageHeader | pyramide hex-palett |
| /admin/videoer | OK | PageHeader | video-bibliotek |
| /admin/teknisk-plan | OK | PageHeader | oversikt teknisk plan |
| /admin/teknisk-plan/[spillerId] | OK | egen | per-spiller teknisk plan |

### /admin/gjennomfore + kalender + calendar + bookinger + bookings + anlegg + locations + facilities + availability + kapasitet + capacity + services + trackman

| Rute | Status | Shell brukt | Merknader |
|---|---|---|---|
| /admin/gjennomfore | OK | HubFrame | hub design |
| /admin/gjennomfore/okter/[id] | Mangler design | egen header | hex gradients linje 96, 109, 364 |
| /admin/kalender | OK | KalenderRoot | client-fork m/ demo-data |
| /admin/kalender/maned | OK | PageHeader | ManedGrid client |
| /admin/kalender/uke | OK | PageHeader | UkeGrid client |
| /admin/calendar | Bug | PageHeader | duplikat /kalender |
| /admin/calendar/maned | Bug | PageHeader | duplikat /kalender/maned |
| /admin/bookinger | OK | PageHeader | BookingerView |
| /admin/bookings | Bug | PageHeader | duplikat /bookinger |
| /admin/bookings/ny | Form | PageHeader | NyBookingForm |
| /admin/anlegg | OK | PageHeader+TabStrip | importerer Locations/Facilities |
| /admin/anlegg/[id] | OK | DetailShell | hex i style (linje 148) |
| /admin/locations | OK | PageHeader | lokasjon-kort |
| /admin/facilities | OK | PageHeader | uke-grid |
| /admin/facilities/[id] | OK | PageHeader | fasilitet-detalj |
| /admin/availability | Mangler design | PageHeader | hex `#B8852A`, `#FFFBF5`, `#003A2A` |
| /admin/capacity | OK | egen | heatmap belegg |
| /admin/kapasitet | OK | PageHeader | ukes-belegg (duplikat capacity?) |
| /admin/services | OK | PageHeader | tjenester-katalog |
| /admin/trackman | OK | PageHeader | trackman-sesjoner |

### /admin/analysere + analyse + analytics + lag-snitt + tester + godkjenninger + approvals + foresporsler + reports + runder + tilstander + finance

| Rute | Status | Shell brukt | Merknader |
|---|---|---|---|
| /admin/analysere | OK | HubFrame | hub design |
| /admin/analyse | OK | PageHeader+sidebar | 3-panel layout |
| /admin/analytics | OK | egen | heatmap+trend+toggle |
| /admin/lag-snitt | Mangler design | PageHeader | oklch arbitrære i FOKUS-palett |
| /admin/tester | OK | egen screen | test-modul-v2 |
| /admin/tester/[id] | OK | DetailShell | test-resultat detalj |
| /admin/tester/tildel/[spillerId] | Form | modal | tildel-modal |
| /admin/godkjenninger | Redirect | — | re-eksporterer Approvals |
| /admin/approvals | OK | PageHeader | agent-inbox |
| /admin/approvals/[id] | OK | egen client | godkjenning-detalj |
| /admin/foresporsler | OK | PageHeader | økt-forespørsler |
| /admin/reports | Stub | egen | server-actions er `console.log` |
| /admin/runder | OK | PageHeader | runde-tabell |
| /admin/tilstander | OK | PageHeader | livssyklus-status |
| /admin/finance | OK | PageHeader | stripe-stats |

### /admin/organisasjon + klubb + integrasjoner + settings + team + audit + agents + email-templates + profile + meg + reach + hjelp + workspace + innboks + messages + kommunikasjon + notion-* + recording

| Rute | Status | Shell brukt | Merknader |
|---|---|---|---|
| /admin/organisasjon | OK | HubFrame | hub design |
| /admin/klubb/innstillinger | OK | PageHeader | klubb-cards |
| /admin/integrasjoner | OK | PageHeader | integrasjons-dashboard |
| /admin/settings | OK | HubFrame | hub sub-side |
| /admin/settings/api | OK | PageHeader | API-keys |
| /admin/settings/calendar | OK | PageHeader | Google Calendar |
| /admin/settings/security | OK | PageHeader+Setup2FA | 2FA |
| /admin/settings/tilgang | OK | PageHeader | CBAC-matrise read-only |
| /admin/team | OK | PageHeader | team-cards |
| /admin/team/inviter | Form | PageHeader | InviterCoachForm |
| /admin/audit | OK | PageHeader | audit-log-tabell |
| /admin/audit-log | OK | hub-frame CSS | hub-pattern |
| /admin/audit-log/[id] | OK | egen | audit-event-detalj |
| /admin/agents | OK | PageHeader | agent-liste |
| /admin/agents/[agentId] | OK | PageHeader | agent-detalj |
| /admin/email-templates | OK | PageHeader | e-postmaler |
| /admin/email-templates/[id]/rediger | Form | EditorClient | 2-pane editor |
| /admin/profile | Form | egen | EditProfileForm |
| /admin/meg | OK | egen tab-bar | sticky tabs |
| /admin/reach | OK | egen client | engagement-dashboard |
| /admin/hjelp | OK | PageHeader | help-center |
| /admin/workspace | OK | egen WorkspaceHero | min uke |
| /admin/workspace/notion | OK | egen | NotionConnection setup |
| /admin/workspace/oppgaver | OK | egen | views: liste/kanban/kalender |
| /admin/workspace/oppgaver/[id] | OK | egen | task-detalj |
| /admin/workspace/prosjekter | OK | egen | prosjekt-grid |
| /admin/workspace/tildelt-meg | OK | HubFrame | redesignet |
| /admin/innboks | OK | PageHeader+TabStrip | samle-side |
| /admin/messages | OK | SplitInboxShell | meldings-tråder |
| /admin/messages/_components/conversation | — | — | komponent, "Kommer snart"-tooltip på V2-knapper (kommentar) |
| /admin/kommunikasjon | OK | TabBar | seksjon-redirect |
| /admin/notion-oppgaver | Stub | EmptyState | "Venter på Notion-kobling" |
| /admin/notion-prosjekter | Redirect | — | → /admin/workspace/prosjekter |
| /admin/recording | OK | PageHeader | sesjon-opptak |

## Observasjoner

### Duplikate ruter (norsk vs engelsk)
- `grupper` vs `groups` — to ulike implementasjoner, ikke redirect
- `kalender` vs `calendar` (+ `/maned`, `/uke`) — to forskjellige design
- `bookinger` vs `bookings` — to forskjellige tabell-design
- `kapasitet` vs `capacity` — overlappende funksjon
- `tester` (CoachHQ) vs `tester/[id]` (DetailShell) — konsistent
- `godkjenninger` re-eksporterer `approvals` — OK
- `oppfolging` re-eksporterer `queue` — OK
- `plan-templates` redirect → `plans/templates` — OK

### Hex-farger (mest alvorlig)
- 16 sider har hardkodet hex-fargene `#005840`, `#D1F843`, `#0A1F17`, `#FAFAF7`, `#E5E3DD`, `#5E5C57`, `#F1EEE5` etc.
- Nesten alle skal være `bg-primary`, `text-primary-foreground`, `text-foreground`, `bg-background`, `border-border`, `text-muted-foreground`, `bg-secondary`.
- Mest berørt: `/admin/spillere/[id]/rediger`, `/admin/spillere/[id]/profil`, `/admin/spillere/[id]/page.tsx`, `/admin/okter`, `/admin/grupper`, `/admin/talent/page.tsx`, `/admin/availability`, `/admin/spillere/[id]/plan/[planId]`.

### Sidebar-branding
- `AdminShell` håndterer sidebar — ingen direkte "AK GOLF"-tekst i pages, kun i `workspace/prosjekter` linje 165 som selskaps-tag (data, ikke branding).

### Stub-shells
- Ingen `CoachhqStubShell`/`CoachhqStubsShell` brukes lenger — alle 6 sider som tidligere brukte den er migrert (kommentarer dokumenterer dette).

### Synlige "kommer snart"/v2-tekster
- `/admin/plans/templates/ny` — explicit EmptyState "Mal-redigering kommer i v2"
- `/admin/notion-oppgaver` — EmptyState "Venter på Notion-kobling"
- `/admin/reports` — server actions er stub (`console.log`)
- `/admin/messages` — disabled-knapper med "kommer snart" tooltip (mindre kritisk)

### Layouts
- `/admin/layout.tsx` — AdminShell, krever ADMIN/COACH
- `/admin/agencyos/layout.tsx` — AgencyOSTabNav (5 tabs)
- `/admin/talent/layout.tsx` — feature-flag-gate (notFound hvis off)

### Hub-bruk (HubFrame)
8 sider bruker `HubFrame` korrekt: `/admin/analysere`, `/admin/planlegge`, `/admin/gjennomfore`, `/admin/organisasjon`, `/admin/stall`, `/admin/settings`, `/admin/talent/wagr-import`, `/admin/workspace/tildelt-meg`.

### DetailShell-bruk
6 sider bruker `DetailShell` korrekt: `/admin/spillere/[id]`, `/admin/grupper/[id]`, `/admin/talent/[playerId]`, `/admin/tester/[id]`, `/admin/anlegg/[id]`, `/admin/tournaments/[id]`.

### AdminHero/PageHeader-bruk
Majoritet av list/oversikt-sider bruker `AdminHero as PageHeader` — konsistent.
