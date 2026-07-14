# Arkiv — historiske plan-/analyse-/handover-dokumenter

Alt her er **utdatert eller ferdig fullført** og beholdt kun for historikk/sporbarhet.
Ikke bygg mot noe i denne mappen — bruk de levende kildene under. Ryddet 2026-07-14
(samme kveld som Talent · Sammenligning-porten) fordi `docs/` og `plans/` hadde vokst
til over 140 filer, de fleste snapshots fra juni/tidlig juli som var overtatt av nyere
dokumenter uten at de gamle ble fjernet.

## De levende kildene (bruk disse, ikke arkivet)

- **`docs/platform/NORDSTJERNE.md`** — målet appen aldri skal glemme, les først.
- **`docs/platform/AGENT-BRIEF.md`** — full plattformkontekst, start her.
- **`docs/STATUS-NÅ.md`** — snapshot: hvor plattformen står akkurat nå.
- **`docs/AAPNE-SPORSMAAL.md`** — register over alt uavklart/parkert/løst.
- **`docs/MASTER-SKJERMPLAN.md`** — autoritativ skjerm-liste + 6 haker per skjerm.
- **`plans/skjermplan-master.md`** — styringsdokument: scope, bølgerekkefølge, beslutninger.
- **`docs/platform/BUSINESS-RULES.md`** — låste forretningsregler (fasit).
- **`docs/REGLER-OPPLAST-2026-06-22.md`** — regel-klynger som er låst OPP, under avklaring.
- **`docs/skjermtekst/`** — ekte norsk UI-tekst per hovedskjerm, copy-kilde.
- **`docs/redesign-v2/`** — aktiv v2-redesign-kilde (byggeplan, kvalitetsplan, fasit-referanser).
- **`docs/VEIKART-BESTE-VERKTOY.md`** — løpende status-/arbeidslogg, nyere enn STATUS-NÅ.md
  i praksis (vurder å slå disse to sammen eller legge VEIKART til i CLAUDE.md sin kanon-liste).

Fire filer var arkivert her fra før (uendret i denne opprydden, notert for fullstendighet):

| Fil | Var | Erstattet av |
|---|---|---|
| `KONFLIKTER.md` | Design-vs-kode-avvik (handover steg 2, juni 2026) | Beslutningene er låst; se `docs/AAPNE-SPORSMAAL.md` |
| `baneguide-design-spec.md` | Baneguide IA-spec (fase 4, skrevet før designsystem-revisjonen) | `docs/redesign-v2/baneguide-designplan.md` |
| `master-skjermplan-endringslogg.md` | Kronologisk byggehistorikk, flyttet ut 2026-07-06 | `docs/MASTER-SKJERMPLAN.md` (dagens Endringslogg-seksjon) |

(Denne READMEen refererte tidligere til `SKJERM-STATUS.md`, `SKJERM-BYGGEPLAN.md`,
`BYGGELOGG-FLAGG.md` og `docs/PLAN-GJENSTAENDE.md` — ingen av disse finnes i repoet
lenger. Fjernet fra listen 2026-07-14 for å unngå å peke på filer som ikke finnes.)

## Arkivert 2026-07-14 (dokument-opprydding)

Gruppert på hva de var og hva som overtok jobben deres.

**`docs/` rot** — visjons-/plan-notater fra juni–tidlig juli, ingen kode-referanser, alle
erstattet av senere, mer konkrete dokumenter (`docs/redesign-v2/`, `docs/AGENCYOS-INVENTAR.md`,
`docs/funksjoner-og-plan-2026-07-10.md`, `docs/MASTER-SKJERMPLAN.md`):
`DATA-INVENTORY.md`, `ak-agency-os-plan.md`, `ak-formel-review-2026-06-28.md`,
`ak-golf-datadrevet-plattform-komplett.md`, `ak-golf-intelligence-konsolidering.md`,
`akformel-pposisjon-drillniva-plan-2026-06-30.md`, `datagolf-produktvisjon.md`,
`marketing-booking-forelder-auth-skjermer-desktop-mobil.md`, `plan-baneguide-dispersion.md`,
`plattform-oversikt-funksjoner-data.md`, `plattform-skjermer-indeks.md`,
`playerhq-agencyos-skjermer-desktop-mobil.md`, `tekst-plan.md` (copy-kilden er nå
`docs/skjermtekst/`), `ux-arkitektur.md`, `agencyos-beskrivelse.md`, `booking-admin-ai-plan.md`,
`hjernen-gjennomgang.html` + `treningsplanlegging-hjernen.md` (uklar innbyrdes
supersesjons-rekkefølge, arkivert sammen), `ordbok-evaluering-2026-07.md` (FØR-rapport for en
trim som alt er utført i `docs/ordbok-ak-golf-konsept.md`).

**Workbench-fasit-kjeden** — `workbench-diff-audit-2026-06-30.md`, `workbench-fasit.md`,
`workbench-funksjoner-roller.md`, `workbench-statusrapport-2026-06-30.md` — hele kjeden er
erstattet av `docs/redesign-v2/workbench-fasit-analyse-2026-07-12.md` +
`docs/redesign-v2/fasit-agencyos-workbench/` (den aktive fasiten).

**`design-bestillinger/`** (D1/D4/D6) — designbestillinger mot det gamle v13-kitet, forbigått
av v2-redesignbeslutningen (9. juli).

**`design-inventory/`** (20 `.md`-filer) — kodeverifisert skjerm-/funksjonsaudit fra 29. juni,
erstattet av `docs/redesign-v2/funksjonskart-*.md` + `docs/AGENCYOS-INVENTAR.md`. De 5
`.json`-rådumpene bak analysen (`admin.json`, `auth.json`, `forelder.json`, `marketing.json`,
`portal.json`) hadde ingen selvstendig verdi utover `.md`-tolkningen og er slettet, ikke arkivert.

**`flyt-inventar/`** (5 filer) — «~94 døde knapper»-audit fra 17. juni, fulgt opp og lukket via
senere I7/R1/R2-oppryddingsarbeid (se `docs/VEIKART-BESTE-VERKTOY.md`).

**`opprydding/`** (01–05 + `knip-rapport-2026-07-12.txt`) — kjørebok for token-konvergens- og
design-handover-ZIP-arbeidsflyten som `.claude/rules/design-system-regel.md` sier ble erstattet
av v2-redesignbeslutningen 9. juli; `public/design-handover/` (målmappen) finnes ikke lenger.
`docs/opprydding/i7-tilbakeknapp-kandidater-2026-07-12.txt` ble IKKE arkivert — har fortsatt
åpne gjenstående punkter per `docs/VEIKART-BESTE-VERKTOY.md`.

**`platform/`-undersett** — `CLAUDE-DESIGN-PROMPT.md` (24. juni handover-prompt, forbigått av
v2/DesignSync), `IA-RYDDEPLAN.md` (selv-merket «✅ utført» 25. juni), `SKJERM-KNAPP-KART.md`
(erstattet av `docs/MASTER-SKJERMPLAN.md` + `docs/AGENCYOS-INVENTAR.md`),
`screen-context/all-screens.md` (selv-merket «kan ha driftet» 3. juli), `user-flows/*.html`
(udaterte flow-mockups, ingen kodereferanser).

**`plans/` → `plans/arkiv/`** — `design-implementering-neste-steg.md`, `redesign-konsolidering.md`,
`redesign-plan.md` (alle bygget på den samme token-konvergens-grunnmuren som er erstattet av
v2-redesignet), `plan-fullforing-perfeksjon-2026-07.md` (FASE-strukturen er overtatt av senere
bølgeplaner), `opprydding-og-ferdigstilling.md` (selv-merket «FASE 1+2 ferdig» 2. juli),
`analyse-samling.md` (planen er utført — `/portal/analysere` finnes med 5 faner),
`legacy-portering-prioritet.md` (bekreftet 100 % ferdig 14. juli — se
`docs/MASTER-SKJERMPLAN.md` Endringslogg, Bølge 3.37).

## Ikke rørt i denne rydden (bevisst)

- **`docs/gdpr-behandlingsregister.md`** — mulig juridisk gjeldende dokument (GDPR-
  behandlingsregister); rørt ikke uten Anders' bekreftelse på om den er erstattet av
  `docs/gdpr/rettigheter-status.md` eller fortsatt er den gjeldende registreringen.
