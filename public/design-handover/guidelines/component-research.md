# Komponent-research — AK Golf HQ designsystem

Referansematrise for alle komponenter: eksisterende (16) + nødvendige. Brukes som
research-backbone. **Metode:** referanse for IA / interaksjon / datamønster — aldri
visuell kloning. Alle adapteres til systemet: lime = signal, mono-tall, hårfine kort,
mørkt som hjem. **Status kun lime / coral / grå.** Den kategoriske paletten
(`data-viz.css`) gjelder kun i charts.

Fetch-strategi: referanser hentes **just-in-time per komponent** når den bygges
(ikke alt på én gang). Kilder under er kandidat-URL-er for den fetchen.

---

## Allerede researchet (web_fetch utført)

**Arccos — Strokes Gained (SG-viz).** Trend-graf bygd på: drabar runde-selector ·
facet-toggle (av/på per del) · grå benchmark-bar (vs mål-handicap) · fargede linjer
per facet. Mål-forankret: sett mål → alt organiseres rundt det + «hvor du taper mest».
→ **AK:** SGTrend/SGRadar med akser OTT/APP/ARG/PUTT i kategorisk palett, grått
benchmark-bånd = mål/baseline, runde-selector + akse-toggle, «taper mest»→`AiTipCard`.

**TrainingPeaks — kalender + periodisering.** Kalender farges etter type ELLER
compliance; økt-kort med konfigurerbare datafelt (drag → større/mindre kort).
Periodisering: makro→meso→mikro, faser (oppbygging / høyintensitet / taper).
Compliance-skala (deres): grønn ±20% · gul · oransje · rød · grå uplanlagt.
→ **AK:** UkeKalender med type-farge + compliance-state; ukesammendrag-kolonne.
Periodiserings-tidslinje Base→Peak i sekvensiell rampe. **Compliance omskrevet til
lime (på plan) / coral (avvik) / grå (ikke fullført)** — eneste fargenøkkel vi låner.

---

## Eksisterende komponenter (16) — referanse / forbedring

Kjernen er solid; refs kun der en forbedring er aktuell.
- **core/** Icon, Button, Eyebrow, Tag(+CountBadge), Card — komplette. Button/Tag-varianter dekker behovet.
- **forms/** Input, CodeInput, Toggle, SegmentedTabs — komplette. (Combobox/Select er NYE, se under.)
- **data/** KpiTile, Sparkline, Progress, Pyramid — KpiTile er signatur; Pyramid kan kobles til kategorisk palett (FYS→TURN). Sparkline → grunnlag for SGTrend.
- **feedback/** AiTipCard, ListRow — AiTipCard er «prescription»-mønsteret (jf. Arccos «where to focus»).
- **calendar/** DayStrip, AgendaRow — mobil-grunnlag; UkeKalender/MånedKalender bygger oppå.
- **marketing/** FeaturedCard — komplett.

---

## Nødvendige komponenter (gruppert, P-merket)

### Kalender & tid (P0 — bygges nå)
- **UkeKalender** — 7-dagers tidsrutenett, økt-kort farget på type + compliance. Ref: TrainingPeaks (gjort). Mobil: faller tilbake på DayStrip+AgendaRow.
- **Periodiserings-tidslinje** — sesong-blokker (L-faser) + turnerings-markører (A/B/C). Ref: TrainingPeaks ATP-graf (gjort).
- **MånedKalender** — måned-grid, tetthet/heatmap per dag. Ref: TrainingPeaks kalender.
- **Dag-tidsplan** — vertikal timeplan. Ref: agenda-mønster (gjort via AgendaRow).
- **SlotPicker** — booking-tider (14-dagers + slot-grid). Ref: vår egen booking.jsx (alt bygget).
- **DatePicker** — standard. Ref: Radix/shadcn (kjent mønster, lav research-verdi).

### Data-viz (P0–P1)
- **SGTrend** — fler-akse linjegraf + benchmark-bånd + selector. Ref: Arccos (gjort).
- **Radar** — 4 SG-akser øyeblikksbilde. Ref: Arccos facet-breakdown (gjort). Fetch JIT: et radar-mønster om nødvendig.
- **DataTable** — sortér/filtrer, tett. Ref JIT: fetch coach-roster/stats-tabell (TrainingPeaks coach-guide / sports-leaderboard).
- **BarChart / Leaderboard-rad** — rangering, lime aktiv serie. Ref JIT: sports-leaderboard.
- **StatStrip** — rad av KpiTile (har grunnlag).

### Navigasjon (P0)
- **NavRail** (AgencyOS 54→244px hover-expand) — kjent mønster (Linear/Vercel-stil). Lav research.
- **BottomNav** (PlayerHQ 5-tab) — kjent mobil-mønster. Lav research.
- **Tabs / TopNav**, **Breadcrumb**, **Cmd+K-søk** — kjente. Lav research.

### Overlays (P0)
- **Modal · Sheet (bunn) · Drawer · Popover · Tooltip · Toast · Banner** — Radix/shadcn-mønstre, kjente. Lav research; fokus på token-tilpasning (skygge kun her).

### Skjema (P1)
- **Select/Dropdown · Combobox · Checkbox · Radio · Slider · Textarea · FileUpload · FormField (label+feil)** — Radix/shadcn. Lav research.

### Struktur (P1–P2)
- **Avatar(+gruppe) · Stepper/Wizard · Pagination · FilterPills · Accordion · Skeleton · EmptyState · Divider** — kjente. EmptyState: følg «ærlige tomme tilstander»-tonen.

### Domene-spesifikke (P1)
- **SpillerKort · ØktKort · BookingKort · FakturaRad · VarselRad · Samtykke-kort (forelder/BankID) · L-fase-badge · SG-splitt-kort** — komponeres av primitiver; ingen ekstern ref, drevet av repo-inventaret fra Claude Code.

---

## Fetch-kø (prioritert, JIT per komponent)
1. ✅ SG-viz — Arccos strokes-gained-analytics
2. ✅ Kalender/periodisering — TrainingPeaks athlete guide
3. DataTable / coach-roster — TrainingPeaks coach-guide (når DataTable bygges)
4. Leaderboard / stats-tabell — sports-stats-referanse (når Leaderboard bygges)
5. Resten: primitiver (nav/overlay/skjema) trenger ikke fetch — kjente mønstre, kun token-tilpasning.

> Domene-komponentene (SpillerKort osv.) vente på `docs/design-inventory/komponenter.md`
> fra Claude Code — den definerer eksakt hvilke felter/varianter de trenger.
