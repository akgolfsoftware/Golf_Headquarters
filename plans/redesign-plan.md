# Redesign-plan — «få skjermene til å SE ut som mockup-ene»

**Dato:** 2026-07-08 · **Status:** utkast til godkjenning · **Styring:** underlagt
[`plans/skjermplan-master.md`](skjermplan-master.md) og [`docs/MASTER-SKJERMPLAN.md`](../docs/MASTER-SKJERMPLAN.md).
Dette er ikke en ny kanon — det er utførelsesplanen for det *visuelle* laget nå som
grunnmuren (token-/komponent-oppryddingen, Fase 0–5) er på plass.

## Hvorfor denne planen finnes nå

Oppryddingen byttet byggematerialet (ett token-sett, ett golfdata-bibliotek) UTEN å
endre utseendet — med vilje. Derfor ser appen fortsatt ut som før. Dette dokumentet
dekker det motsatte: **komponere hver skjerm om så den matcher sin mockup** i Claude
Design-prosjektets `ui_kits/`. Det er her appen begynner å se ny ut.

## Fasit per skjerm finnes allerede

Designprosjektet har ferdige skjerm-mockup-er (hentes via DesignSync):
- `ui_kits/playerhq/*` · `ui_kits/agencyos/*` · `ui_kits/marketing/*` · `ui_kits/forelder/*` · `ui_kits/auth/*`
- `guidelines/oppskrifter/*.md` — skjerm-oppskrifter (dashboard, datatabell, kalender, booking, forelder-rapport, mobil)
- `*.card.html` per komponentgruppe + `guidelines/tilstander.html` (tilstandsgalleri)

Så vi trenger ikke oppfinne layout — vi måler hver app-skjerm mot dens mockup.

## Nåstatus (fra MASTER-SKJERMPLAN, Design-hake)

| Design-hake | Antall | Betyr |
|---|---|---|
| ✓ (v14-komponert) | 27 | Ferdig — matcher kanon |
| ~ (delvis) | 17 | Anatomi-løftet, ikke full komposisjon |
| – (gammel look) | ~296 | Ikke rørt visuelt ennå |

De 296 er IKKE 296 like store jobber: mange er små/interne/lav-trafikk. Planen
prioriterer **signaturskjermene** (det Anders ser daglig og viser fram) først.

## Metode per skjerm (fem-punktsloopen, uendret fra masterplanen)

1. Hent skjermens mockup fra `ui_kits/` (DesignSync) — det er fasiten.
2. Komponer skjermen om fra `golfdata/`-komponenter (finnes ikke en komponent → meld gap, ikke improviser).
3. Behold ekte data + ruter (redesign er visuelt — ikke rør datalag/flyt uten grunn).
4. Verifiser: `npm run verify` · begge moduser mot tilstandsgalleriet · desktop+mobil · tastatur · domenesjekk.
5. Oppdater MASTER-SKJERMPLAN-raden (Design-hake → ✓) i samme commit.

## Staging — signatur først, én bølge = én økt, review mellom hver

**Bølge R1 — PlayerHQ signatur (det spilleren ser mest):**
`/portal` (Hjem) · `/portal/analysere` (Min golf — alt ✓ allerede, kryssjekk) ·
`/portal/mal/sg-hub` · `/portal/talent` (nylig løftet, ferdigstill) · `/portal/gjennomfore`.
Mål: spillerens hverdag ser ut som phq-mockup-ene.

**Bølge R2 — AgencyOS signatur (det coachen ser mest):**
`/admin` (dashboard) · `/admin/stall` · `/admin/spillere/[id]` · `/admin/coach-workbench` ·
`/admin/analysere`. Mål: coach-cockpiten matcher agencyos-mockup-ene (mørk graphite-look).

**Bølge R3 — Marketing (offentlig ansikt):**
`/` forside · `/coaching` · `/anlegg` · `/playerhq` · `/priser`. Høy synlighet, lav kompleksitet.
NB: her ligger gap #14 (lime-pulsprikk på mørk hero) — løses her.

**Bølge R4 — Forelder + auth:**
`/forelder/*` (5 skjermer) · `/auth/*` (login/signup/bankid/onboarding).

**Bølge R5+ — resten per hub**, i trafikk-rekkefølge, til Design-haken er ✓ over hele lista.

## Rekkefølge mot resten av arbeidet

1. **Fase 5 (opprydding)** — slett gammelt athletic + rydd globals.css. Liten, ren, gjøres først (eller parallelt) så redesignet bygger på et helt rent tre.
2. **Redesign R1 → R5** — som over, med review mellom hver bølge.
3. Datamodell-avhengige skjermer (Workbench v2, Live-økt v2, treningsanalyse) følger
   `skjermplan-master.md` sine bølger — de trenger drill-nivå-datamodellen først (egen blokker,
   se `plans/design-implementering-neste-steg.md` Steg 2).

## Åpne beslutninger til Anders (før R1 starter)

1. **Fase 5 først, eller redesign først?** Anbefaling: Fase 5 først (liten, rydder treet).
2. **Signaturrekkefølge:** spiller (R1) eller coach (R2) først? Anbefaling: spiller — størst daglig bruk.
3. **Ambisjonsnivå per skjerm:** 1:1 mot mockup, eller mockup som retning med rom for justering? Anbefaling: 1:1 der mockup finnes, meld gap ellers.
