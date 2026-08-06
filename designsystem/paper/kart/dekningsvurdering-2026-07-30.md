# Dekningsvurdering — 30.07.2026

Svar på avsnitt 9 i handover-dokumentet. Alt merket **[målt]** er målt denne økta,
i `kart/revisjon-gulv-rigg.html` eller ved kildeskann. Ingenting er bygget.

## 0 · Funn før målingene: riggen var knekt

`kart/revisjon-gulv-rigg.html` refererte fortsatt `NS.Input` — komponenten ble slettet i
rettelogg-punkt 4 (29.07), og React kaster «element type is invalid» ved render, som
avmonterer HELE roten. Riggen viste tom side og `riggOk: false` [målt]. **Rettet:**
Input-blokken fjernet fra riggen. All måling under er gjort etter rettelsen.
Lærdom til `gulvregel.md`: riggen må inn i portsjekkene nettopp fordi den knekker stille.

## 1 · Skallet (avsnitt 3) — hva biblioteket kan bygge i dag

Finnes og er målt grønne: `Rail` (48 px) · `TabBar` (44) · `Topbar` · `PageHeader` ·
`Panel` · `BottomSheet` · `Modal`/`ConfirmDialog`/`DropdownMenu` · `SkipLink` ·
`ThemeToggle` · `Breadcrumbs`.

Mangler — bekreftet fraværende i `components/` [målt: 0 filer]:
- **`Composer`** (K6) — mangler.
- **`StatusBar`** (K7) — mangler.
- **`CommandPalette`** (K5) — mangler, men fokuskontrakten er forberedt: `overlay-focus.jsx`
  navngir allerede CommandPalette som pålagt konsument av `useOverlayLayer`/`useRovingKeys`.

**Avvik i handoverens 6.1:** `Sheet` finnes IKKE som egen komponent [målt: ingen `Sheet.jsx`].
Paret er `Panel` + `BottomSheet`. «Panel og Sheet skal aldri divergere» leses som
Panel/BottomSheet.

Skall-konklusjon: desktop-treKolonner kan rendres i dag minus komponist og statuslinje;
mobil-skallet kan rendres komplett minus komponist. Bolk 2 står.

## 2 · Er `.akhq-kpi-*` en KPI-flis? [målt: kildelest begge]

Både komponentkartet og inventaret hadde delvis rett — det er **to** komponenter:
- `KpiCard` (`.akhq-kpi-*`): verdi + enhet + delta + meta, **uten flis-chrome** —
  rammen kommer fra konsumenten (Panel / `.akhq-card`).
- `KpiStripe` (`.akhq-stripe-*`): den ekte flisraden — surface, border, radius, og
  **container query** (`@container (max-width:520px)` → radbrekk). Kontraktens
  containerkrav er allerede implementert.

**K2 er derfor innramming/verifisering, ikke nybygg.** `StatRow` ≈ `KpiStripe` (finnes),
`StatTile` ≈ `KpiCard` i kort-chrome. Gjenstår: verifisere de to i panelbredder på de
faktiske flatene, og evt. en tynn `StatTile`-wrapper hvis kort-chromen skal eies av
komponenten.

## 3 · Dekker `viz.jsx` SG-baren og dispersion? [målt: kildelest]

`viz.jsx` (alle fire kopier re-eksporterer `data/viz.jsx`) er **kun hjelpere**:
tallformatering (`nf`/`sg`/`delta`), `ensureCss`, og `Region` (tom/laster/feil).
Ingen visualisering bor der.

Visualiseringene bor i `golfviz/`:
- **SG-baren: dekket** av `SgBreakdown`/`SgBar` — kategori (OTT/APP/ARG/PUTT), verdi,
  benchmark, skala-maks.
- **Dispersion: i hovedsak dekket** av `DispersionMap` — punkter, SD-ellipse, kølle,
  side/depth/count-stats. Det profilens Teknikk-fane krever utover dette er
  **baseline og hit-rate** — ikke i props i dag. K10 er en utvidelse av `DispersionMap`,
  ikke en ny `DispersionPlot`.

## 4 · De to uforklarte gulvbruddene — funnet og kategorisert

Revisjonens 14 brudd minus de 12 forklarte:
1. **`ListRow` hale-action, 40,0 px** — er `Button --sm` inne i ListRow, altså det
   *sjuende* medlemmet av Button--sm-klassen (handoveren telte seks). Kategori:
   Button--sm-arv. **Rettet automatisk av rettelogg-punkt 1: nå 44,0 px [målt].**
2. **`SkipLink`, 38,9 px [målt, fortsatt]** — kun synlig ved tastaturfokus, aldri
   truffet av grov peker. Kategori: kandidat til unntakslisten i `gulvregel.md` —
   men den må *navngis der*, ikke bare aksepteres stilltiende.

## 5 · Re-måling etter rettelogg 29.07 — grønt bekreftet [målt 30.07]

Alle rettelser verifisert i riggen: Button sm 44,0 · Tabs 44,0 · ThemeToggle 44,0 ·
Breadcrumbs 44,0 · QuickLinkBar 45,1 · DropdownMenu utløser + element 44,0 ·
ConfirmDialog 44,0 · Modal 44,0 · Banner (handling + lukk) 44,0 · OneThingNow 44,0 ·
StickyActionBar 44,0 · ListRow action 44,0. TimeGrid-boksen 20,0 med dokumentert
44 px `::after` — urørt.

Gjenstående rødt/ukjent:
- `SkipLink` 38,9 (pkt. 4.2 — avgjør unntak i `gulvregel.md`).
- **Nytt funn:** `Topbar` sitt søkefelt-input måler **20,9 px** og har ingen egen
  `.akhq-`-klasse [målt] — ikke i revisjonens 14. Må kategoriseres.
- `BottomSheet` fortsatt uten fokuserbar node [målt: 0 treff i riggen] — gjeldspunktet står.

## 6 · Klasseinventaret — anslag erstattet med måling

Skriptet kjørt mot fersk bundel: **345 klassenavn [målt]**, 109 layer-blokker.
29.07-anslaget bekreftet; `guidelines/klasseinventar.md` oppdatert til [målt].

## 7 · Konsekvens for byggerekkefølgen (avsnitt 7)

Rekkefølgen **står**, med tre justeringer:
- **Bolk 0 krymper:** gulvrettingene er alt utført og nå re-målt grønne. Gjenstår:
  `gulvregel.md` (finnes ikke [målt]), BottomSheet-fokusnoden, Topbar-inputen,
  SkipLink-avgjørelsen, riggen inn i portsjekkene.
- **Bolk 3 krymper:** K2 er innramming av KpiCard/KpiStripe, ikke nybygg (pkt. 2).
- **Bolk 5 krymper:** K10 er utvidelse av DispersionMap med baseline/hit-rate (pkt. 3).

Uendret å bygge fra null: K1 QueueCard + ProvenanceDisclosure, K5 CommandPalette,
K6 Composer, K7 StatusBar, K8 TabSet (Tabs-gulvet er nå 44 [målt] — underlaget er klart),
K9 DataTable, K11 YearTimeline, K12 VideoScrubber.
