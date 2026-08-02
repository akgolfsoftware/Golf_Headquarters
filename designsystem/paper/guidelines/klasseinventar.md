# Klasseinventar — generert fra `_ds_bundle.js`

**Ikke skriv denne filen for hånd.** Den regenereres fra den kompilerte bundelen, som er det eneste stedet hele navnerommet finnes. En håndholdt liste speiler bare de filene man husket å se på: første versjon dekket `viz.jsx` og steg 2–3, men manglet navigasjonskomponentene fra steg 4 — derfor slapp `.akhq-tab` gjennom og Tabs arvet TabBars geometri.

Regenerer ved å kjøre denne i `run_script` som del av verifiseringssteget, etter hver kompilering. Skriptet ligger **som kodeblokk her, ikke som `.js`-fil** — en løs `.js` i prosjektet blir kompilert inn i `_ds_bundle.js` og knekker den (`await` på toppnivå).

```js
const b = await readFile('_ds_bundle.js');
const alle = new Set([...b.matchAll(/\.(akhq-[a-z0-9-]+)/g)].map(m => m[1]));
const lagret = new Set();
for (const blokk of b.matchAll(/@layer akhq-(?:base|container|modifier)\{([\s\S]*?)\n\}/g))
  for (const m of blokk[1].matchAll(/\.(akhq-[a-z0-9-]+)/g)) lagret.add(m[1]);
const navn = [...alle].sort();
const ulagret = navn.filter(n => !lagret.has(n));
log('klassenavn:', navn.length, '· ulagrede:', ulagret.length);
// Sjekk et planlagt navn: log(navn.includes('akhq-tab') ? 'TATT' : 'ledig');
```

## Status

**[målt 31.07.2026, ettermiddag]: 533 klassenavn i bundelen, 0 ulagrede.** Skriptet over er kjørt uendret mot den serverte `_ds_bundle.js` (343 632 byte, etag `1785476653578834`). Forrige måling var 345 navn den 30.07 — veksten kommer fra komponentene som er lagt inn 31.07 (skjemakontrollene, overleggene, ScoreGauge, kø- og skall-familiene m.fl.).

Lagmigreringen fra `kart/lagmigrering.md` holder: **ingen** klassenavn ligger utenfor `@layer`.

## ⚠ Bundelen mangler bølge P3

`_ds_bundle.js` er **ikke kompilert** siden `DataTable`, `FilterPills`, `Pagination`, `Stepper` og `KanbanKolonne` ble lagt inn i kilden. Listen «Alle klassenavn» under er derfor det kompilerte navnerommet slik det faktisk er nå — den er korrekt, men **ufullstendig** som kollisjonsgrunnlag: de 55 navnene fra de fem nye komponentene står i egen liste nederst, hentet fra kilden.

Verifisert, ikke antatt: `akhq-dt`, `akhq-fpill`, `akhq-pag`, `akhq-step` og `akhq-kan` forekommer **0 ganger** i den serverte bundelen. Kollisjonsoppslag mellom de 55 kildenavnene og de 533 bundelnavnene gir **0 treff**.

Regenerer denne filen umiddelbart etter neste kompilering: da skal tallet bli 588 og de to listene slås sammen til én.

## Før du lagrer en ny komponent

Søk etter HVERT klassenavn du planlegger — element-klasser også, ikke bare prefikset. `.akhq-tabs` var ledig mens `.akhq-tab` var tatt. Søk i **begge** listene under så lenge bundelen står ukompilert; søker du bare i den første, kan du ta et navn `DataTable` allerede eier.

## ULAGREDE navn

Ingen. Kolliderer du med et eksisterende navn likevel, sjekk først om det er lagt i `@layer` — et navn utenfor et lag taper alltid mot et navn i et lag, uansett spesifisitet.

## Alle klassenavn i kompilatet (533, målt 31.07.2026)

```
.akhq-acc  .akhq-acc-body  .akhq-acc-chev  .akhq-acc-item  .akhq-acc-meta  .akhq-acc-sum
.akhq-avatar  .akhq-avatar--ink  .akhq-avatar--lg  .akhq-avatar--md  .akhq-avatar--outline  .akhq-avatar--sm
.akhq-badge  .akhq-badge--info  .akhq-badge--mut  .akhq-badge--ny  .akhq-badge--tag  .akhq-badge--up
.akhq-badge--warn  .akhq-badge-dot  .akhq-banner  .akhq-banner--info  .akhq-banner--privacy  .akhq-banner--warn
.akhq-banner-ic  .akhq-banner-lab  .akhq-banner-side  .akhq-banner-title  .akhq-banner-txt  .akhq-banner-wrap
.akhq-banner-x  .akhq-bb  .akhq-bb-brudd  .akhq-bb-brudd-b  .akhq-bb-brudd-h  .akhq-bb-brudd-t
.akhq-bb-del  .akhq-bb-fordeling  .akhq-bb-fyll  .akhq-bb-fyll--over  .akhq-bb-fyll--under  .akhq-bb-hd
.akhq-bb-lab  .akhq-bb-nokkel  .akhq-bb-nokkel--avvik  .akhq-bb-nokkel--ok  .akhq-bb-nokkel-l  .akhq-bb-nokkel-v
.akhq-bb-nokler  .akhq-bb-overstyr  .akhq-bb-prikk  .akhq-bb-skala  .akhq-bb-spor  .akhq-bb-sum
.akhq-bb-tegn  .akhq-bb-tegn-i  .akhq-bb-vindu  .akhq-btn  .akhq-btn--danger  .akhq-btn--ghost
.akhq-btn--primary  .akhq-btn--sm  .akhq-callout  .akhq-callout--info  .akhq-callout--privacy  .akhq-callout--warn
.akhq-callout-ic  .akhq-callout-lab  .akhq-callout-txt  .akhq-card  .akhq-cb  .akhq-cb-in
.akhq-cb-lst  .akhq-cb-lst--opp  .akhq-cb-opt  .akhq-cb-opt-note  .akhq-cb-tom  .akhq-cb-tr
.akhq-cb-tx  .akhq-cdlg  .akhq-cdlg--wide  .akhq-cdlg-act  .akhq-cdlg-b  .akhq-cdlg-conseq
.akhq-cdlg-kick  .akhq-cdlg-scrim  .akhq-cdlg-scrim--preview  .akhq-cdlg-t  .akhq-cgrid  .akhq-cgrid--three
.akhq-cgrid--two  .akhq-cgrid--wide  .akhq-cgrid-wrap  .akhq-chip  .akhq-chip--selected  .akhq-chip--static
.akhq-chip-x  .akhq-cmdk  .akhq-cmdk-foot  .akhq-cmdk-gr  .akhq-cmdk-in  .akhq-cmdk-item
.akhq-cmdk-list  .akhq-cmdk-scrim  .akhq-cmdk-sub  .akhq-cmdk-t  .akhq-cmdk-tom  .akhq-cmdk-top
.akhq-code  .akhq-code--fire  .akhq-code-in  .akhq-code-sr  .akhq-comp  .akhq-comp-box
.akhq-comp-c  .akhq-comp-chips  .akhq-comp-ctx  .akhq-comp-hint  .akhq-comp-in  .akhq-comp-right
.akhq-crumb-a  .akhq-crumbs  .akhq-dd  .akhq-dd-item  .akhq-dd-item--dn  .akhq-dd-item-note
.akhq-dd-lab  .akhq-dd-pop  .akhq-dd-pop--right  .akhq-dd-sep  .akhq-dd-trig  .akhq-disp
.akhq-disp-cap  .akhq-div  .akhq-div--flush  .akhq-div--tight  .akhq-div--v  .akhq-div-lab
.akhq-div-lab--start  .akhq-dot  .akhq-dots  .akhq-dots-grid  .akhq-dots-lab  .akhq-dots-legend
.akhq-dots-row  .akhq-dp  .akhq-dp-dag  .akhq-dp-ft  .akhq-dp-hd  .akhq-dp-lay
.akhq-dp-lay--right  .akhq-dp-mnd  .akhq-dp-nav  .akhq-dp-rutenett  .akhq-dp-snar  .akhq-dp-tom
.akhq-dp-trig  .akhq-dp-uke  .akhq-dp-ukedag  .akhq-dp-uketopp  .akhq-dp-ut  .akhq-drw
.akhq-drw--bred  .akhq-drw--venstre  .akhq-drw-bd  .akhq-drw-ft  .akhq-drw-hd  .akhq-drw-lab
.akhq-drw-scrim  .akhq-drw-scrim--preview  .akhq-drw-scrim--venstre  .akhq-drw-ttl  .akhq-drw-x  .akhq-empty
.akhq-error  .akhq-estate  .akhq-estate--sm  .akhq-estate--start  .akhq-estate-act  .akhq-estate-ic
.akhq-estate-title  .akhq-estate-txt  .akhq-estate-wrap  .akhq-fab  .akhq-fab--ic  .akhq-fab--overtab
.akhq-fab-ic  .akhq-ff  .akhq-ff--sm  .akhq-ff-ctl  .akhq-ff-krav  .akhq-ff-lab
.akhq-ff-lab--skjult  .akhq-fm  .akhq-fm--feil  .akhq-gap  .akhq-gap-avg  .akhq-gap-lab
.akhq-gap-range  .akhq-gap-row  .akhq-gap-track  .akhq-gap-val  .akhq-gauge  .akhq-gauge-arc
.akhq-gauge-hero  .akhq-gauge-sub-meta  .akhq-gauge-sub-val  .akhq-gauge-subs  .akhq-gauge-unit  .akhq-gauge-val
.akhq-goal  .akhq-goal-bar  .akhq-goal-fill  .akhq-goal-nums  .akhq-goal-target  .akhq-goal-val
.akhq-goal-win  .akhq-hole  .akhq-hole-num  .akhq-hole-sg  .akhq-holes  .akhq-itab
.akhq-itab-n  .akhq-kpi-delta  .akhq-kpi-meta  .akhq-kpi-unit  .akhq-kpi-val  .akhq-kvg
.akhq-kvg--one  .akhq-kvg--plain  .akhq-kvg--stack  .akhq-kvg-k  .akhq-kvg-pair  .akhq-kvg-v
.akhq-kvg-v--text  .akhq-kvg-wrap  .akhq-lab  .akhq-ladder  .akhq-lgroup  .akhq-lgroup--plain
.akhq-lgroup-label  .akhq-lmark  .akhq-lrow  .akhq-lrow--lead  .akhq-lrow--tap  .akhq-lrow-chev
.akhq-lrow-icon  .akhq-lrow-item  .akhq-lrow-main  .akhq-lrow-meta  .akhq-lrow-status  .akhq-lrow-title
.akhq-lrow-title--done  .akhq-lrow-trail  .akhq-lrow-value  .akhq-lstep  .akhq-lstep-meta  .akhq-lstep-title
.akhq-modal  .akhq-modal-actions  .akhq-modal-body  .akhq-modal-title  .akhq-mono  .akhq-nn
.akhq-nn-bar  .akhq-nn-fill  .akhq-nn-meta  .akhq-nn-next  .akhq-nn-now  .akhq-nn-pct
.akhq-nn-title  .akhq-now  .akhq-now-actions  .akhq-now-c  .akhq-now-desc  .akhq-now-label
.akhq-now-pulse  .akhq-now-title  .akhq-panel  .akhq-panel--bleed  .akhq-panel--flush  .akhq-panel--sm
.akhq-panel-action  .akhq-panel-body  .akhq-panel-foot  .akhq-panel-head  .akhq-panel-label  .akhq-panel-title
.akhq-panel-titles  .akhq-panel-wrap  .akhq-pb  .akhq-pb-date  .akhq-pb-unit  .akhq-pb-val
.akhq-pbar  .akhq-pbar--lg  .akhq-pbar--up  .akhq-pbar--warn  .akhq-pbar-fill  .akhq-pbar-lab
.akhq-pbar-num  .akhq-pbar-top  .akhq-pbar-track  .akhq-pctile  .akhq-pctile-band  .akhq-pctile-cohort
.akhq-pctile-marker  .akhq-pctile-scale  .akhq-pctile-suffix  .akhq-pctile-val  .akhq-phead  .akhq-phead-actions
.akhq-phead-kick  .akhq-phead-lead  .akhq-phead-meta  .akhq-phead-side  .akhq-phead-text  .akhq-phead-title
.akhq-phead-wrap  .akhq-pop  .akhq-pop-bd  .akhq-pop-ft  .akhq-pop-hd  .akhq-pop-lab
.akhq-pop-lay  .akhq-pop-lay--right  .akhq-pop-lay--top  .akhq-pop-lay--wide  .akhq-pop-trig  .akhq-pop-ttl
.akhq-pop-x  .akhq-prov  .akhq-prov-c  .akhq-prov-caret  .akhq-prov-cell  .akhq-prov-grid
.akhq-prov-k  .akhq-prov-run  .akhq-prov-sum  .akhq-prov-tom  .akhq-prov-v  .akhq-putt
.akhq-putt-fill  .akhq-putt-lab  .akhq-putt-n  .akhq-putt-row  .akhq-putt-track  .akhq-putt-val
.akhq-pyr  .akhq-pyr-fill  .akhq-pyr-name  .akhq-pyr-pct  .akhq-pyr-row  .akhq-pyr-text
.akhq-qc  .akhq-qc--forst  .akhq-qc--utsatt  .akhq-qc-actions  .akhq-qc-age  .akhq-qc-c
.akhq-qc-meta  .akhq-qc-snooze  .akhq-qc-sub  .akhq-qc-title  .akhq-qc-top  .akhq-qlink
.akhq-qlink-a  .akhq-qlink-arrow  .akhq-qlink-lab  .akhq-rad  .akhq-rad-in  .akhq-rad-mark
.akhq-rad-note  .akhq-rad-tx  .akhq-radar-key  .akhq-radar-legend  .akhq-radar-swatch  .akhq-rail
.akhq-rail-avatar  .akhq-rail-brand  .akhq-rail-item  .akhq-rail-spacer  .akhq-recap  .akhq-recap-basis
.akhq-recap-delta  .akhq-recap-deltas  .akhq-recap-prose  .akhq-rg  .akhq-rg--rad  .akhq-sab
.akhq-sab--stack  .akhq-sab-act  .akhq-sab-note  .akhq-sbar  .akhq-sbar-btn  .akhq-sbar-item
.akhq-sbar-sep  .akhq-sbar-v  .akhq-sbar-v--dn  .akhq-sbar-v--info  .akhq-sbar-v--up  .akhq-sc
.akhq-sc--fys  .akhq-sc--kompakt  .akhq-sc--laast  .akhq-sc--slag  .akhq-sc--spill  .akhq-sc--tek
.akhq-sc--turn  .akhq-sc--utkast  .akhq-sc--valgt  .akhq-sc-bunn  .akhq-sc-formel  .akhq-sc-merke
.akhq-sc-merker  .akhq-sc-note  .akhq-sc-omr  .akhq-sc-sr  .akhq-sc-tid  .akhq-sc-top
.akhq-sc-ttl  .akhq-scircle  .akhq-scrim  .akhq-search  .akhq-search-in  .akhq-seg
.akhq-seg-btn  .akhq-sel  .akhq-sel--sm  .akhq-sel-pil  .akhq-sel-w  .akhq-sgbar
.akhq-sgbar-fill  .akhq-sgbar-lab  .akhq-sgbar-track  .akhq-sgbar-val  .akhq-sgbar-zero  .akhq-shead
.akhq-shead-l  .akhq-shead-n  .akhq-shead-r  .akhq-shead-t  .akhq-sheet  .akhq-sheet-body
.akhq-sheet-handle  .akhq-sheet-scrim  .akhq-sheet-title  .akhq-sk  .akhq-sk--circle  .akhq-sk--num
.akhq-sk--text  .akhq-sk-line  .akhq-sk-stack  .akhq-skel  .akhq-skip  .akhq-slabel
.akhq-sld  .akhq-sld--dn  .akhq-sld--up  .akhq-sld-in  .akhq-sld-merke  .akhq-sld-note
.akhq-sld-skala  .akhq-sld-top  .akhq-sld-val  .akhq-srow  .akhq-srow-meta  .akhq-srow-right
.akhq-srow-title  .akhq-stripe  .akhq-stripe-c  .akhq-stripe-cell  .akhq-stripe-meta  .akhq-stripe-unit
.akhq-stripe-val  .akhq-ta  .akhq-ta--sm  .akhq-tab  .akhq-tabbar  .akhq-tabs
.akhq-tabs-wrap  .akhq-tg  .akhq-tg--compact  .akhq-tg--tall  .akhq-tg-body  .akhq-tg-col
.akhq-tg-col--today  .akhq-tg-day  .akhq-tg-day--today  .akhq-tg-ev  .akhq-tg-ev--bg  .akhq-tg-ev--free
.akhq-tg-ev-time  .akhq-tg-ev-title  .akhq-tg-gut  .akhq-tg-head  .akhq-tg-hour  .akhq-tg-hour--first
.akhq-tg-hour--last  .akhq-tg-now  .akhq-tg-scroll  .akhq-tg-wrap  .akhq-theme  .akhq-theme-sw
.akhq-ti  .akhq-ti--sm  .akhq-tip  .akhq-tip-kbd  .akhq-tip-lay  .akhq-tip-lay--under
.akhq-tip-trig  .akhq-tmode  .akhq-tmode-dot  .akhq-toast  .akhq-toast--info  .akhq-toast--inline
.akhq-toast--ok  .akhq-toast--warn  .akhq-toast-dot  .akhq-toggle  .akhq-toggle--disabled  .akhq-toggle-knob
.akhq-toggle-track  .akhq-topbar  .akhq-topbar-right  .akhq-trend  .akhq-trend-cap  .akhq-trend-pb
.akhq-val  .akhq-xp  .akhq-xp-bar  .akhq-xp-fill  .akhq-xp-num
```

## Ikke i kompilatet — bølge P3, lest fra kilden (55, 31.07.2026)

Disse er **ikke** målt mot bundelen, fordi de ikke finnes i den ennå. De er lest ut av
`components/data/DataTable.jsx`, `components/layout/FilterPills.jsx`, `Pagination.jsx`,
`Stepper.jsx` og `KanbanKolonne.jsx`.

```
.akhq-dt  .akhq-dt--romslig  .akhq-dt--tett  .akhq-dt-cap  .akhq-dt-fot  .akhq-dt-pil
.akhq-dt-scroll  .akhq-dt-sk  .akhq-dt-sort  .akhq-dt-td  .akhq-dt-td--ned  .akhq-dt-td--opp
.akhq-dt-td--sterk  .akhq-dt-td--tall  .akhq-dt-th  .akhq-dt-th--tall  .akhq-dt-th-in  .akhq-dt-tom
.akhq-dt-tr  .akhq-dt-wrap  .akhq-fpill  .akhq-fpill--rad  .akhq-fpill-lab  .akhq-fpill-n
.akhq-fpill-nullstill  .akhq-fpill-p  .akhq-fpill-wrap  .akhq-kan  .akhq-kan--flat  .akhq-kan--over
.akhq-kan-hale  .akhq-kan-liste  .akhq-kan-merk  .akhq-kan-n  .akhq-kan-tit  .akhq-kan-tom
.akhq-kan-topp  .akhq-kan-wrap  .akhq-pag  .akhq-pag--enkel  .akhq-pag-b  .akhq-pag-hopp
.akhq-pag-ikon  .akhq-pag-tall  .akhq-pag-tell  .akhq-pag-wrap  .akhq-step  .akhq-step--kompakt
.akhq-step-el  .akhq-step-nr  .akhq-step-ok  .akhq-step-sr  .akhq-step-strek  .akhq-step-tx
.akhq-step-wrap
```
