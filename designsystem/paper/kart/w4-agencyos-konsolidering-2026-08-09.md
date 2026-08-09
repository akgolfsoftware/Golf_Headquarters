# W4 — konsolideringsgate og manifest (AgencyOS), 2026-08-09

Anslaget i `docs/port/skjermplan-tegnet-og-wireframe.md` var **~111** (Stall 28 · Admin 18 ·
Planlegge 18 · Oversikt 16 · Gjennomføre 14 · Innsikt 14 · Min uke 4 · Meg 2). Talt mot kode på
`main`: **~128 `page.tsx` under `src/app/admin/`**, men størstedelen er ikke skjermer.

## Konsolideringsgate — vedtak til Anders

### 1. ~38 admin-ruter er redirect-stubber (under 600 byte)
Målt på filstørrelse, ikke antatt. `admin/(legacy)/`: `agenter` 182 B · `ai` 177 · `analysere` 348 ·
`board` 255 · `caddie` 344 · `coach-workbench` 328 · `kapasitet` 424 · `kommunikasjon` 477 ·
`mer` 271 · `okonomi` 274 · `plan-templates/[id]/effectiveness` 231 · `plans/new` 348 ·
`prosjekter` 423 · `risiko` 185 · `stall` 318 · `teknisk-plan/[spillerId]` 408 ·
`tester/tildel` 197 · `tilstander` 358. I v2-treet: `admin/page` 538 · `approvals` 255 ·
`approvals/[id]` 481 · `calendar` 240 · `calendar/maned` 316 · `finance` 282 · `messages` 244 ·
`oppfolging` 340 · `organisasjon` 352 · `plans/templates` (+ `[id]/rediger`, `[id]/effectiveness`,
`ny`) 267–331 · `talent` 465 · `talent/kohort` · `region` · `ressurser` · `wagr-benchmark`
(alle 201 B, samme fil-hash) · `uka` 279. **Tegnes ikke, kodes ikke.** — *Anbefalt ja.*

### 2. `(legacy)/*` med innhold er erstattet av v2, ikke av noe nytt
`availability`, `services`, `anlegg`, `kapasitet` → dekkes av **Bookinger og kapasitet**.
`drills*`, `godkjenninger/[id]`, `foresporsler`, `workspace/tildelt-meg`, `spillere/[id]/*`,
`live/[sessionId]/*` har alle en v2-rute som allerede er fasit eller tegnes her.
**Legacy-treet fases ut, ikke portes.** — *Anbefalt ja.*

### 3. Kø-familien er ÉN flate, ikke fem
`godkjenninger` · `handlingssenter` · `queue` · `approvals` (+`[id]`) · `foresporsler` er samme
jobb: si ja eller nei til noe en agent, en caddie eller en spiller har foreslått. Koden sier det
selv — `/admin/godkjenninger` slår sammen fire kilder (PlanAction, CaddieDraft, SessionRequest;
e-postutkast bor i innboks-epost). **Én tegnet mal.** — *Anbefalt ja.*

### 4. Oppsettet er ÉN mal med fire faner, ikke 18 skjermer
`settings` (org/team/tilgang) + `settings/api` · `calendar` · `security` · `periode-navn` ·
`periode-fordeling` · `tilgang` · `klubb/innstillinger` · `integrasjoner` · `team` (+`inviter`) ·
`gdpr` · `audit-log` · `feillogg` deler IA fullstendig. — *Anbefalt ja.*

### 5. Gruppe-familien er ÉN detaljside med faner
`grupper/[id]` + `arsplan` + `arsplan/skoledata` + `timeplan` + `workbench` er faner på samme
flate i koden allerede (samme loader, samme gruppe). `grupper` (lista) er §9-malen. — *Anbefalt ja.*

### 6. Plan- og malfamilien er ÉN master–detalj
`plans` (+`[planId]`), `plan-templates` (+`[id]`, `rediger`, `ny`), `teknisk-plan`, `okter`,
`drills/[id]/rediger` er lista + inspektørpanel. Effektivitetsvisningen er en blokk i panelet,
ikke en rute. — *Anbefalt ja.*

### 7. Har allerede fasit (fase1, pulje 4) — tegnes ikke på nytt
`agencyos` (cockpit) · `innboks` · `innboks-epost` · `kalender` (+ hendelse) · `spillere`
(+`[id]`) · `agencyos/okonomi` · `agencyos/live` · `agencyos/ak-stigen` · `agencyos/caddie*` ·
`agencyos/uka` · `profile` · `planlegge/workbench`. — *Anbefalt ja.*

### 8. Utenfor W4 — eget spor
`admin/workspace/*` (Notion, prosjekter, oppgaver), `admin/agents*`, `admin/agent-team`,
`admin/brief`, `admin/recording`, `admin/marketing`, `admin/reports`, `kommando/*` og
`meg/dispatch` · `meg/morgenbrief` er **AgencyOS drift/AgenticOS**, ikke coach-flater.
`agencyos-agenticos.html` er fasit for mønsteret; resten er en egen bølge når Anders vil.
`(internal)/demos/*` og `intern/komponenter/*` er interne demoer — ikke skjermer.
— *Anbefalt ja, med markering.*

**Netto: ~128 ruter → ~38 stubber ut → ~26 legacy fases ut → 12 har fasit → 6 nye maler
dekker resten av coach-flatene. Drift/AgenticOS (~14) skilles ut som eget spor.**

## Tegnet i denne økten (6 wireframes + 2 delte filer)

| Fil | Rute(r) den er fasit for | Mal | Tilstander |
|---|---|---|---|
| `agencyos-godkjenninger.html` | `/admin/godkjenninger`, `handlingssenter`, `queue`, `approvals`(+`[id]`), `foresporsler` | §11 kø + §12 diff | Kø · Tom · Laster |
| `agencyos-gruppe-detalj.html` | `/admin/grupper/[id]` + `arsplan`, `skoledata`, `timeplan`, `workbench`; `/admin/grupper` som liste | §12 detalj + faner | Full gruppe · Uten medlemmer |
| `agencyos-bookinger.html` | `/admin/bookinger`(+`[id]`, `ny`), `(legacy)/availability`, `kapasitet`, `services`, `anlegg` | §11 dashbord + §9 tabell | Full uke · Uten finanstilgang · Tom uke |
| `agencyos-planbibliotek.html` | `/admin/plans`(+`[planId]`), `plan-templates`(+4), `teknisk-plan`, `okter` | §10 liste + inspektør | Maler · Aktive planer · Ingen maler |
| `agencyos-turneringer.html` | `/admin/tournaments`(+`[id]`, `ny`, `dubletter`), `turnering-kart`, `spillere/[id]/turnering-kobling` | §9 tabell + §12 sammenslåing | Sesong · Dubletter · Tom |
| `agencyos-oppsett.html` | `/admin/settings`(+6), `klubb/innstillinger`, `integrasjoner`, `team`(+`inviter`), `gdpr`, `audit-log`, `feillogg` | §8 skjema + faner | Admin · Coach (uten adgang) |
| `w4-base.css` | — | tokens + AgencyOS-skall | akhq-tokens v3.1 **verbatim** |
| `w4-demo.js` | — | delt demo-rigg | tilstand + faner + tema |

**Samme avvik fra W1-formen som W3:** tokens ligger i `w4-base.css` fordi batchen er 6 filer med
identisk skall. Verdiene er kopiert verbatim fra fase1. Endres tokens, endres fase1, `w3-base.css`
og `w4-base.css` samtidig.

Alle seks: mørk rail 64 px, body 13,5 px, `data-od-id` på alt interaktivt, norsk bokmål,
44 px trykkflater, lys + mørk via `data-theme` (`akhq-theme-agencyos`), CTA er blekk —
oransje kun der en kontekstuell «Én ting nå» faktisk finnes (kun turneringsfilen har én).

## Avvikslinjer — undersider som følger malene

**Oppsett:** `api` = nøkler med opprettet/sist brukt · `calendar` = synk og standardvarighet ·
`security` = 2FA-krav + sesjoner · `periode-navn` og `periode-fordeling` = feltene i Organisasjon ·
`tilgang` = matrisen · `team/inviter` = én rad i skjema · `gdpr`/`audit-log`/`feillogg` = System og
logg, destruktive handlinger nederst og aldri i aksentfarge.

**Bookinger:** `[id]` = kvitteringsdetalj på §12 · `ny` = tjeneste → tid → spiller (samme
tre-stegsform som PlayerHQs `booking/ny`) · `services`/`anlegg` = «Tjenester og åpningstid»-kortet
som egen flate.

**Planer:** `[planId]` = panelet i full bredde · `plan-templates/ny` og `rediger` = skjema på
malstrukturen · `effectiveness` = Effekt-blokka i full bredde · `okter` = §9 tabell over økter.

## Åpne punkter til Anders

1. **Drift/AgenticOS-sporet (vedtak 8):** skal `workspace`, `agents`, `brief`, `recording`,
   `reports`, `marketing` og `kommando/*` tegnes som egen bølge — eller er de interne nok til å
   leve på AgenticOS-fasiten som den er?
2. **Kapasitet-nevneren:** koden regner kapasitet som andel av ukas timeluker (17 t × 7 dager),
   ikke anleggskapasitet — audit-funn 7. Tegnet slik. Bekreft at det er tallet du vil se.
3. **Legacy-utfasing (vedtak 2):** kan `(legacy)`-treet slettes når v2-rutene er kodet, eller skal
   det stå som fallback en sesong?
4. **Godkjenn-samlet:** «Godkjenn 3 lavrisiko samlet» er tegnet som én knapp uten bekreftelse.
   Lavrisiko er definert i koden (`LOW_RISK_ACTION_TYPES`) — si fra hvis den skal ha bekreftelse.

## Regnskap

W6 la +10 ruter (343 → 353). W3 tegnet 6 maler. W4 tegner 6 nye fasitfiler som dekker
coach-delen av AgencyOS. Gjenstår i bølgeplanen: **W5** (Marketing 40 + Forelder 11 + Auth 10 +
System 7) — marketing trenger egen visuell avklaring før tegning, jf. skjermplanen.
