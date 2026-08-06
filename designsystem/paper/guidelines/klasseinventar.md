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

**[målt 03.08.2026]: 1148 klassenavn i bundelen, 0 ulagrede.** Skriptet over er kjørt uendret mot den kompilerte `_ds_bundle.js` (603 312 byte). Forrige måling var 533 navn den 31.07 — veksten kommer fra bølge P3 (DataTable, FilterPills, Pagination, Stepper, KanbanKolonne) og bølgene P4–P9, som nå er kompilert inn: kalender-, datavis-, golfdata-, trackman-, domene-, video- og skallfamiliene.

Lagmigreringen fra `kart/lagmigrering.md` holder: **ingen** klassenavn ligger utenfor `@layer`.

Bundelen er nå komplett som kollisjonsgrunnlag — listen under er hele navnerommet, målt, ikke lest fra kilden. Det finnes ingen sidelister lenger.

## Før du lagrer en ny komponent

Søk etter HVERT klassenavn du planlegger — element-klasser også, ikke bare prefikset. `.akhq-tabs` var ledig mens `.akhq-tab` var tatt. Listen under er hele navnerommet: ett oppslag er nok, men det må gjøres per navn.

## ULAGREDE navn

Ingen. Kolliderer du med et eksisterende navn likevel, sjekk først om det er lagt i `@layer` — et navn utenfor et lag taper alltid mot et navn i et lag, uansett spesifisitet.

## Alle klassenavn i kompilatet (1148, målt 03.08.2026)

```
.akhq-acc  .akhq-acc-body  .akhq-acc-chev  .akhq-acc-item  .akhq-acc-meta  .akhq-acc-sum
.akhq-afb  .akhq-afb--tynn  .akhq-afb--uten-legend  .akhq-afb-band  .akhq-afb-l  .akhq-afb-legend
.akhq-afb-pct  .akhq-afb-seg  .akhq-afb-seg--info  .akhq-afb-seg--ink  .akhq-afb-seg--mid  .akhq-afb-seg--soft
.akhq-afb-seg--up  .akhq-afb-sw  .akhq-afb-wrap  .akhq-agr  .akhq-agr--avlyst  .akhq-agr--ferdig
.akhq-agr--fys  .akhq-agr--naa  .akhq-agr--slag  .akhq-agr--spill  .akhq-agr--tek  .akhq-agr--turn
.akhq-agr-c  .akhq-agr-hale  .akhq-agr-meta  .akhq-agr-naa  .akhq-agr-slutt  .akhq-agr-sr
.akhq-agr-tid  .akhq-agr-ttl  .akhq-agr-wrap  .akhq-aitip  .akhq-aitip--dempet  .akhq-aitip-c
.akhq-aitip-ev  .akhq-aitip-kick  .akhq-aitip-txt  .akhq-aitip-wrap  .akhq-aitip-x  .akhq-akf
.akhq-akf--fylt  .akhq-akf-sep  .akhq-akf-txt  .akhq-avatar  .akhq-avatar--ink  .akhq-avatar--lg
.akhq-avatar--md  .akhq-avatar--outline  .akhq-avatar--sm  .akhq-badge  .akhq-badge--info  .akhq-badge--mut
.akhq-badge--ny  .akhq-badge--tag  .akhq-badge--up  .akhq-badge--warn  .akhq-badge-dot  .akhq-banner
.akhq-banner--info  .akhq-banner--privacy  .akhq-banner--warn  .akhq-banner-ic  .akhq-banner-lab  .akhq-banner-side
.akhq-banner-title  .akhq-banner-txt  .akhq-banner-wrap  .akhq-banner-x  .akhq-bb  .akhq-bb-brudd
.akhq-bb-brudd-b  .akhq-bb-brudd-h  .akhq-bb-brudd-t  .akhq-bb-del  .akhq-bb-fordeling  .akhq-bb-fyll
.akhq-bb-fyll--over  .akhq-bb-fyll--under  .akhq-bb-hd  .akhq-bb-lab  .akhq-bb-nokkel  .akhq-bb-nokkel--avvik
.akhq-bb-nokkel--ok  .akhq-bb-nokkel-l  .akhq-bb-nokkel-v  .akhq-bb-nokler  .akhq-bb-overstyr  .akhq-bb-prikk
.akhq-bb-skala  .akhq-bb-spor  .akhq-bb-sum  .akhq-bb-tegn  .akhq-bb-tegn-i  .akhq-bb-vindu
.akhq-bch  .akhq-bch--lav  .akhq-bch-benk  .akhq-bch-benk-lab  .akhq-bch-kat  .akhq-bch-katrad
.akhq-bch-kol  .akhq-bch-plot  .akhq-bch-stolpe  .akhq-bch-stolpe--over  .akhq-bch-stolpe--under  .akhq-bch-vrd
.akhq-bch-wrap  .akhq-bmb  .akhq-bmb--dn  .akhq-bmb--info  .akhq-bmb--up  .akhq-bmb-basis
.akhq-btn  .akhq-btn--danger  .akhq-btn--ghost  .akhq-btn--primary  .akhq-btn--sm  .akhq-callout
.akhq-callout--info  .akhq-callout--privacy  .akhq-callout--warn  .akhq-callout-ic  .akhq-callout-lab  .akhq-callout-txt
.akhq-card  .akhq-cb  .akhq-cb-in  .akhq-cb-tx  .akhq-cch  .akhq-cch--info
.akhq-cch-a  .akhq-cch-b  .akhq-cch-kat  .akhq-cch-katrad  .akhq-cch-kol  .akhq-cch-legend
.akhq-cch-plot  .akhq-cch-sw  .akhq-cch-sw--a  .akhq-cch-sw--b  .akhq-cch-vrd  .akhq-cch-vrdrad
.akhq-cch-wrap  .akhq-cdlg  .akhq-cdlg--wide  .akhq-cdlg-act  .akhq-cdlg-b  .akhq-cdlg-conseq
.akhq-cdlg-kick  .akhq-cdlg-scrim  .akhq-cdlg-scrim--preview  .akhq-cdlg-t  .akhq-cgrid  .akhq-cgrid--three
.akhq-cgrid--two  .akhq-cgrid--wide  .akhq-cgrid-wrap  .akhq-chip  .akhq-chip--selected  .akhq-chip--static
.akhq-chip-x  .akhq-cmb  .akhq-cmb-in  .akhq-cmb-lst  .akhq-cmb-lst--opp  .akhq-cmb-opt
.akhq-cmb-opt-note  .akhq-cmb-tom  .akhq-cmb-tr  .akhq-cmdk  .akhq-cmdk-foot  .akhq-cmdk-gr
.akhq-cmdk-in  .akhq-cmdk-item  .akhq-cmdk-list  .akhq-cmdk-scrim  .akhq-cmdk-sub  .akhq-cmdk-t
.akhq-cmdk-tom  .akhq-cmdk-top  .akhq-code  .akhq-code--fire  .akhq-code-in  .akhq-code-sr
.akhq-comp  .akhq-comp-box  .akhq-comp-c  .akhq-comp-chips  .akhq-comp-ctx  .akhq-comp-hint
.akhq-comp-in  .akhq-comp-right  .akhq-crumb-a  .akhq-crumbs  .akhq-dd  .akhq-dd-item
.akhq-dd-item--dn  .akhq-dd-item-note  .akhq-dd-lab  .akhq-dd-pop  .akhq-dd-pop--right  .akhq-dd-sep
.akhq-dd-trig  .akhq-dfk  .akhq-dfk--tett  .akhq-dfk-felt  .akhq-dfk-fra  .akhq-dfk-hode
.akhq-dfk-ny  .akhq-dfk-pil  .akhq-dfk-rad  .akhq-dfk-til  .akhq-dfk-verdier  .akhq-dfk-wrap
.akhq-diag  .akhq-diag--kompakt  .akhq-diag-ev  .akhq-diag-ev-pkt  .akhq-diag-ev-rad  .akhq-diag-kick
.akhq-diag-neste  .akhq-diag-neste-lab  .akhq-diag-neste-txt  .akhq-diag-ttl  .akhq-diag-txt  .akhq-diag-wrap
.akhq-disp  .akhq-disp-cap  .akhq-disp-hit  .akhq-disp-hit-v  .akhq-div  .akhq-div--flush
.akhq-div--tight  .akhq-div--v  .akhq-div-lab  .akhq-div-lab--start  .akhq-dot  .akhq-dots
.akhq-dots-grid  .akhq-dots-lab  .akhq-dots-legend  .akhq-dots-row  .akhq-dp  .akhq-dp-dag
.akhq-dp-ft  .akhq-dp-hd  .akhq-dp-lay  .akhq-dp-lay--right  .akhq-dp-mnd  .akhq-dp-nav
.akhq-dp-rutenett  .akhq-dp-snar  .akhq-dp-tom  .akhq-dp-trig  .akhq-dp-uke  .akhq-dp-ukedag
.akhq-dp-uketopp  .akhq-dp-ut  .akhq-dprev  .akhq-dprev--tett  .akhq-dprev-mer  .akhq-dprev-scroll
.akhq-dprev-tab  .akhq-dprev-td  .akhq-dprev-th  .akhq-dprev-tr  .akhq-dprev-wrap  .akhq-drw
.akhq-drw--bred  .akhq-drw--venstre  .akhq-drw-bd  .akhq-drw-ft  .akhq-drw-hd  .akhq-drw-lab
.akhq-drw-scrim  .akhq-drw-scrim--preview  .akhq-drw-scrim--venstre  .akhq-drw-ttl  .akhq-drw-x  .akhq-dstrip
.akhq-dstrip--ramme  .akhq-dstrip-d  .akhq-dstrip-dt  .akhq-dstrip-m  .akhq-dstrip-sr  .akhq-dstrip-ud
.akhq-dstrip-wrap  .akhq-dt  .akhq-dt--romslig  .akhq-dt--tett  .akhq-dt-cap  .akhq-dt-fot
.akhq-dt-pil  .akhq-dt-scroll  .akhq-dt-sk  .akhq-dt-sort  .akhq-dt-td  .akhq-dt-td--ned
.akhq-dt-td--opp  .akhq-dt-td--sterk  .akhq-dt-td--tall  .akhq-dt-th  .akhq-dt-th--tall  .akhq-dt-th-in
.akhq-dt-tom  .akhq-dt-tr  .akhq-dt-wrap  .akhq-empty  .akhq-error  .akhq-estate
.akhq-estate--sm  .akhq-estate--start  .akhq-estate-act  .akhq-estate-ic  .akhq-estate-title  .akhq-estate-txt
.akhq-estate-wrap  .akhq-fab  .akhq-fab--ic  .akhq-fab--overtab  .akhq-fab-ic  .akhq-feat
.akhq-feat--soft  .akhq-feat-act  .akhq-feat-kick  .akhq-feat-ttl  .akhq-feat-txt  .akhq-feat-wrap
.akhq-ff  .akhq-ff--sm  .akhq-ff-ctl  .akhq-ff-krav  .akhq-ff-lab  .akhq-ff-lab--skjult
.akhq-fleks  .akhq-fleks--anker  .akhq-fleks-ik  .akhq-fm  .akhq-fm--feil  .akhq-fpill
.akhq-fpill--rad  .akhq-fpill-lab  .akhq-fpill-n  .akhq-fpill-nullstill  .akhq-fpill-p  .akhq-fpill-wrap
.akhq-gap  .akhq-gap-avg  .akhq-gap-lab  .akhq-gap-range  .akhq-gap-row  .akhq-gap-track
.akhq-gap-val  .akhq-gauge  .akhq-gauge-arc  .akhq-gauge-hero  .akhq-gauge-sub-meta  .akhq-gauge-sub-val
.akhq-gauge-subs  .akhq-gauge-unit  .akhq-gauge-val  .akhq-goal  .akhq-goal-bar  .akhq-goal-fill
.akhq-goal-nums  .akhq-goal-target  .akhq-goal-val  .akhq-goal-win  .akhq-hjp  .akhq-hjp-panel
.akhq-hjp-panel--hoyre  .akhq-hjp-trig  .akhq-hjp-ttl  .akhq-hjp-txt  .akhq-hmap  .akhq-hmap--tett
.akhq-hmap-celle  .akhq-hmap-celle--i1  .akhq-hmap-celle--i2  .akhq-hmap-celle--i3  .akhq-hmap-celle--i4  .akhq-hmap-kollab
.akhq-hmap-rad  .akhq-hmap-radlab  .akhq-hmap-skala  .akhq-hmap-trinn  .akhq-hmap-wrap  .akhq-hole
.akhq-hole-num  .akhq-hole-sg  .akhq-holes  .akhq-itab  .akhq-itab-n  .akhq-kan
.akhq-kan--flat  .akhq-kan--over  .akhq-kan-hale  .akhq-kan-liste  .akhq-kan-merk  .akhq-kan-n
.akhq-kan-tit  .akhq-kan-tom  .akhq-kan-topp  .akhq-kan-wrap  .akhq-kfjell  .akhq-kfjell--lav
.akhq-kfjell-klab  .akhq-kfjell-klab--fokus  .akhq-kfjell-krav  .akhq-kfjell-labrad  .akhq-kfjell-legend  .akhq-kfjell-lstrek
.akhq-kfjell-lstrek--krav  .akhq-kfjell-omriss  .akhq-kfjell-svg  .akhq-kfjell-wrap  .akhq-kkrav  .akhq-kkrav--tett
.akhq-kkrav-hode  .akhq-kkrav-lab  .akhq-kkrav-merke  .akhq-kkrav-merke--gap  .akhq-kkrav-naa  .akhq-kkrav-navn
.akhq-kkrav-rad  .akhq-kkrav-status  .akhq-kkrav-verdi  .akhq-kkrav-wrap  .akhq-kolle  .akhq-kolle--tett
.akhq-kolle-antall  .akhq-kolle-carry  .akhq-kolle-cv  .akhq-kolle-hode  .akhq-kolle-navn  .akhq-kolle-rad
.akhq-kolle-rlab  .akhq-kolle-rv  .akhq-kolle-spred  .akhq-kolle-wrap  .akhq-kpi-delta  .akhq-kpi-meta
.akhq-kpi-unit  .akhq-kpi-val  .akhq-kvg  .akhq-kvg--one  .akhq-kvg--plain  .akhq-kvg--stack
.akhq-kvg-k  .akhq-kvg-pair  .akhq-kvg-v  .akhq-kvg-v--text  .akhq-kvg-wrap  .akhq-lab
.akhq-ladder  .akhq-lavv  .akhq-lavv--tett  .akhq-lavv-hd  .akhq-lavv-hd-k  .akhq-lavv-hd-l
.akhq-lavv-klab  .akhq-lavv-null  .akhq-lavv-rad  .akhq-lavv-spor  .akhq-lavv-stolpe  .akhq-lavv-stolpe--flagg
.akhq-lavv-vrd  .akhq-lavv-wrap  .akhq-lbar  .akhq-lbar--flat  .akhq-lbar-act  .akhq-lbar-blokk
.akhq-lbar-naa  .akhq-lbar-neste  .akhq-lbar-wrap  .akhq-lch  .akhq-lch--lav  .akhq-lch-kat
.akhq-lch-katrad  .akhq-lch-kol  .akhq-lch-note  .akhq-lch-plot  .akhq-lch-stolpe  .akhq-lch-stolpe--over
.akhq-lch-stolpe--under  .akhq-lch-vindu  .akhq-lch-vrd  .akhq-lch-wrap  .akhq-lekk  .akhq-lekk--tett
.akhq-lekk-basis  .akhq-lekk-fyll  .akhq-lekk-fyll--verst  .akhq-lekk-hode  .akhq-lekk-lab  .akhq-lekk-navn
.akhq-lekk-note  .akhq-lekk-rad  .akhq-lekk-spor  .akhq-lekk-v  .akhq-lekk-wrap  .akhq-lfb
.akhq-lfb--uten-steg  .akhq-lfb-prikk  .akhq-lfb-prikk--forbi  .akhq-lfb-prikk--naa  .akhq-lfb-steg  .akhq-lgroup
.akhq-lgroup--plain  .akhq-lgroup-label  .akhq-lmark  .akhq-lrow  .akhq-lrow--lead  .akhq-lrow--tap
.akhq-lrow-chev  .akhq-lrow-icon  .akhq-lrow-item  .akhq-lrow-main  .akhq-lrow-meta  .akhq-lrow-status
.akhq-lrow-title  .akhq-lrow-title--done  .akhq-lrow-trail  .akhq-lrow-value  .akhq-lstat  .akhq-lstat--invers
.akhq-lstat--pause  .akhq-lstat--slutt  .akhq-lstat-prikk  .akhq-lstat-tid  .akhq-lstep  .akhq-lstep-meta
.akhq-lstep-title  .akhq-lwin  .akhq-lwin-band  .akhq-lwin-hode  .akhq-lwin-kolle  .akhq-lwin-lab
.akhq-lwin-m  .akhq-lwin-m--ut  .akhq-lwin-naa  .akhq-lwin-p  .akhq-lwin-rad  .akhq-lwin-spor
.akhq-lwin-v  .akhq-lwin-wrap  .akhq-mkal  .akhq-mkal--tett  .akhq-mkal-d  .akhq-mkal-d--ute
.akhq-mkal-d--valgt  .akhq-mkal-dot  .akhq-mkal-dot--fys  .akhq-mkal-dot--slag  .akhq-mkal-dot--spill  .akhq-mkal-dot--tek
.akhq-mkal-dot--turn  .akhq-mkal-dots  .akhq-mkal-dt  .akhq-mkal-fler  .akhq-mkal-idagm  .akhq-mkal-rad
.akhq-mkal-sr  .akhq-mkal-udag  .akhq-mkal-uke  .akhq-mkal-wrap  .akhq-modal  .akhq-modal-actions
.akhq-modal-body  .akhq-modal-title  .akhq-mono  .akhq-mtr  .akhq-mtr-boble  .akhq-mtr-dagskille
.akhq-mtr-m  .akhq-mtr-m--meg  .akhq-mtr-meta  .akhq-mtr-wrap  .akhq-nfok  .akhq-nfok--kompakt
.akhq-nfok-act  .akhq-nfok-ev  .akhq-nfok-hvorfor  .akhq-nfok-kick  .akhq-nfok-plan  .akhq-nfok-plan-lab
.akhq-nfok-plan-txt  .akhq-nfok-ttl  .akhq-nfok-wrap  .akhq-nn  .akhq-nn-bar  .akhq-nn-fill
.akhq-nn-meta  .akhq-nn-next  .akhq-nn-now  .akhq-nn-pct  .akhq-nn-title  .akhq-now
.akhq-now-actions  .akhq-now-c  .akhq-now-desc  .akhq-now-label  .akhq-now-pulse  .akhq-now-title
.akhq-nstige  .akhq-nstige-maal  .akhq-nstige-niva  .akhq-nstige-niva--forbi  .akhq-nstige-niva--maal  .akhq-nstige-niva--naa
.akhq-nstige-strek  .akhq-nstige-wrap  .akhq-oekt  .akhq-oekt--gjennomfort  .akhq-oekt-bunn  .akhq-oekt-fokus
.akhq-oekt-o-n  .akhq-oekt-o-rad  .akhq-oekt-ovelser  .akhq-oekt-status  .akhq-oekt-status--ok  .akhq-oekt-tid
.akhq-oekt-topp  .akhq-oekt-ttl  .akhq-oekt-wrap  .akhq-pag  .akhq-pag--enkel  .akhq-pag-b
.akhq-pag-hopp  .akhq-pag-ikon  .akhq-pag-tall  .akhq-pag-tell  .akhq-pag-wrap  .akhq-panel
.akhq-panel--bleed  .akhq-panel--flush  .akhq-panel--sm  .akhq-panel-action  .akhq-panel-body  .akhq-panel-foot
.akhq-panel-head  .akhq-panel-label  .akhq-panel-title  .akhq-panel-titles  .akhq-panel-wrap  .akhq-pb
.akhq-pb-date  .akhq-pb-unit  .akhq-pb-val  .akhq-pbar  .akhq-pbar--lg  .akhq-pbar--up
.akhq-pbar--warn  .akhq-pbar-fill  .akhq-pbar-lab  .akhq-pbar-num  .akhq-pbar-top  .akhq-pbar-track
.akhq-pctile  .akhq-pctile-band  .akhq-pctile-cohort  .akhq-pctile-marker  .akhq-pctile-scale  .akhq-pctile-suffix
.akhq-pctile-val  .akhq-perpl  .akhq-perpl-band  .akhq-perpl-blk  .akhq-perpl-blk--grunn  .akhq-perpl-blk--spes
.akhq-perpl-blk--turn  .akhq-perpl-blk--valgt  .akhq-perpl-fot  .akhq-perpl-naa  .akhq-perpl-typ  .akhq-perpl-uker
.akhq-perpl-wrap  .akhq-pfas  .akhq-pfas-bar  .akhq-pfas-f  .akhq-pfas-f--fys  .akhq-pfas-f--slag
.akhq-pfas-f--spill  .akhq-pfas-f--tek  .akhq-pfas-f--turn  .akhq-pfas-f--valgt  .akhq-pfas-fyll  .akhq-pfas-omr
.akhq-pfas-sr  .akhq-pfas-vrd  .akhq-pfas-wrap  .akhq-phead  .akhq-phead-actions  .akhq-phead-kick
.akhq-phead-lead  .akhq-phead-meta  .akhq-phead-side  .akhq-phead-text  .akhq-phead-title  .akhq-phead-wrap
.akhq-pmod  .akhq-pmod-basis  .akhq-pmod-d  .akhq-pmod-fyll  .akhq-pmod-fyll--over  .akhq-pmod-hode
.akhq-pmod-lab  .akhq-pmod-naa  .akhq-pmod-rad  .akhq-pmod-ref  .akhq-pmod-refv  .akhq-pmod-spor
.akhq-pmod-v  .akhq-pmod-wrap  .akhq-pop  .akhq-pop-bd  .akhq-pop-ft  .akhq-pop-hd
.akhq-pop-lab  .akhq-pop-lay  .akhq-pop-lay--right  .akhq-pop-lay--top  .akhq-pop-lay--wide  .akhq-pop-trig
.akhq-pop-ttl  .akhq-pop-x  .akhq-posm  .akhq-posm--aktiv  .akhq-prail  .akhq-prail--uten-labels
.akhq-prail-labrad  .akhq-prail-linje  .akhq-prail-mark  .akhq-prail-note  .akhq-prail-note-v  .akhq-prail-plab
.akhq-prail-plab--aktiv  .akhq-prail-spor  .akhq-prail-stopp  .akhq-prail-vindu  .akhq-prail-wrap  .akhq-prov
.akhq-prov-c  .akhq-prov-caret  .akhq-prov-cell  .akhq-prov-grid  .akhq-prov-k  .akhq-prov-run
.akhq-prov-sum  .akhq-prov-tom  .akhq-prov-v  .akhq-putt  .akhq-putt-fill  .akhq-putt-lab
.akhq-putt-n  .akhq-putt-row  .akhq-putt-track  .akhq-putt-val  .akhq-pyr  .akhq-pyr-fill
.akhq-pyr-name  .akhq-pyr-pct  .akhq-pyr-row  .akhq-pyr-text  .akhq-qc  .akhq-qc--forst
.akhq-qc--utsatt  .akhq-qc-actions  .akhq-qc-age  .akhq-qc-c  .akhq-qc-meta  .akhq-qc-snooze
.akhq-qc-sub  .akhq-qc-title  .akhq-qc-top  .akhq-qlink  .akhq-qlink-a  .akhq-qlink-arrow
.akhq-qlink-lab  .akhq-rad  .akhq-rad-in  .akhq-rad-mark  .akhq-rad-note  .akhq-rad-tx
.akhq-radar-key  .akhq-radar-legend  .akhq-radar-swatch  .akhq-rail  .akhq-rail-avatar  .akhq-rail-brand
.akhq-rail-item  .akhq-rail-spacer  .akhq-recap  .akhq-recap-basis  .akhq-recap-delta  .akhq-recap-deltas
.akhq-recap-prose  .akhq-rg  .akhq-rg--rad  .akhq-sab  .akhq-sab--stack  .akhq-sab-act
.akhq-sab-note  .akhq-sbar  .akhq-sbar-btn  .akhq-sbar-item  .akhq-sbar-sep  .akhq-sbar-v
.akhq-sbar-v--dn  .akhq-sbar-v--info  .akhq-sbar-v--up  .akhq-sc  .akhq-sc--fys  .akhq-sc--kompakt
.akhq-sc--laast  .akhq-sc--slag  .akhq-sc--spill  .akhq-sc--tek  .akhq-sc--turn  .akhq-sc--utkast
.akhq-sc--valgt  .akhq-sc-bunn  .akhq-sc-formel  .akhq-sc-merke  .akhq-sc-merker  .akhq-sc-note
.akhq-sc-omr  .akhq-sc-sr  .akhq-sc-tid  .akhq-sc-top  .akhq-sc-ttl  .akhq-scircle
.akhq-scor  .akhq-scor--kompakt  .akhq-scor-c  .akhq-scor-c--lab  .akhq-scor-c--par  .akhq-scor-c--sum
.akhq-scor-ni  .akhq-scor-s  .akhq-scor-s--birdie  .akhq-scor-s--bogey  .akhq-scor-s--dobbel  .akhq-scor-s--eagle
.akhq-scor-tot  .akhq-scor-tot-lab  .akhq-scor-tot-rel  .akhq-scor-tot-v  .akhq-scor-wrap  .akhq-scrim
.akhq-search  .akhq-search-in  .akhq-seg  .akhq-seg-btn  .akhq-sel  .akhq-sel--sm
.akhq-sel-pil  .akhq-sel-w  .akhq-sgbar  .akhq-sgbar-fill  .akhq-sgbar-lab  .akhq-sgbar-track
.akhq-sgbar-val  .akhq-sgbar-zero  .akhq-sgt  .akhq-sgt--kompakt  .akhq-sgt-basis  .akhq-sgt-delta
.akhq-sgt-delta-v  .akhq-sgt-hero  .akhq-sgt-hero--dn  .akhq-sgt-hero--up  .akhq-sgt-lab  .akhq-sgt-wrap
.akhq-sgvx  .akhq-sgvx--ramme  .akhq-sgvx-alle  .akhq-sgvx-ant  .akhq-sgvx-navn  .akhq-sgvx-v
.akhq-sgvx-wrap  .akhq-shead  .akhq-shead-l  .akhq-shead-n  .akhq-shead-r  .akhq-shead-t
.akhq-sheet  .akhq-sheet-body  .akhq-sheet-handle  .akhq-sheet-scrim  .akhq-sheet-title  .akhq-sk
.akhq-sk--circle  .akhq-sk--num  .akhq-sk--text  .akhq-sk-line  .akhq-sk-stack  .akhq-skel
.akhq-skip  .akhq-slabel  .akhq-sld  .akhq-sld--dn  .akhq-sld--up  .akhq-sld-in
.akhq-sld-merke  .akhq-sld-note  .akhq-sld-skala  .akhq-sld-top  .akhq-sld-val  .akhq-spk
.akhq-spk--flat  .akhq-spk-c  .akhq-spk-kl  .akhq-spk-kpi  .akhq-spk-kv  .akhq-spk-meta
.akhq-spk-navn  .akhq-spk-topp  .akhq-spk-wrap  .akhq-srow  .akhq-srow-meta  .akhq-srow-right
.akhq-srow-title  .akhq-ssk  .akhq-ssk--kompakt  .akhq-ssk-basis  .akhq-ssk-hero  .akhq-ssk-hode
.akhq-ssk-kolle  .akhq-ssk-lab  .akhq-ssk-legend  .akhq-ssk-lp  .akhq-ssk-maal  .akhq-ssk-seg
.akhq-ssk-seg--hael  .akhq-ssk-seg--senter  .akhq-ssk-seg--taa  .akhq-ssk-strike  .akhq-ssk-sw  .akhq-ssk-v
.akhq-ssk-wrap  .akhq-step  .akhq-step--kompakt  .akhq-step-el  .akhq-step-nr  .akhq-step-ok
.akhq-step-sr  .akhq-step-strek  .akhq-step-tx  .akhq-step-wrap  .akhq-stk  .akhq-stk-basis
.akhq-stk-felt  .akhq-stk-flab  .akhq-stk-flagg  .akhq-stk-flagg-pkt  .akhq-stk-flagg-rad  .akhq-stk-fv
.akhq-stk-fv--dn  .akhq-stk-fv--mut  .akhq-stk-fv--up  .akhq-stk-grid  .akhq-stk-wrap  .akhq-stripe
.akhq-stripe-c  .akhq-stripe-cell  .akhq-stripe-meta  .akhq-stripe-unit  .akhq-stripe-val  .akhq-t5
.akhq-t5-basis  .akhq-t5-navn  .akhq-t5-prikk  .akhq-t5-prikk--avvik  .akhq-t5-rad  .akhq-t5-sum
.akhq-t5-sum-lab  .akhq-t5-sum-v  .akhq-t5-tall  .akhq-t5-wrap  .akhq-ta  .akhq-ta--sm
.akhq-tab  .akhq-tabbar  .akhq-tabs  .akhq-tabs-wrap  .akhq-tg  .akhq-tg--compact
.akhq-tg--tall  .akhq-tg-body  .akhq-tg-col  .akhq-tg-col--today  .akhq-tg-day  .akhq-tg-day--today
.akhq-tg-ev  .akhq-tg-ev--bg  .akhq-tg-ev--free  .akhq-tg-ev-time  .akhq-tg-ev-title  .akhq-tg-gut
.akhq-tg-head  .akhq-tg-hour  .akhq-tg-hour--first  .akhq-tg-hour--last  .akhq-tg-now  .akhq-tg-scroll
.akhq-tg-wrap  .akhq-theme  .akhq-theme-sw  .akhq-ti  .akhq-ti--sm  .akhq-tip
.akhq-tip-kbd  .akhq-tip-lay  .akhq-tip-lay--under  .akhq-tip-trig  .akhq-tlj  .akhq-tlj--tett
.akhq-tlj-c  .akhq-tlj-marg  .akhq-tlj-prikk  .akhq-tlj-rad  .akhq-tlj-rad--dn  .akhq-tlj-rad--info
.akhq-tlj-rad--naa  .akhq-tlj-rad--up  .akhq-tlj-tid  .akhq-tlj-ttl  .akhq-tlj-txt  .akhq-tlj-verdi
.akhq-tlj-wrap  .akhq-tmode  .akhq-tmode-dot  .akhq-tms  .akhq-tms--tett  .akhq-tms-felt
.akhq-tms-flab  .akhq-tms-fv  .akhq-tms-grid  .akhq-tms-h-pkt  .akhq-tms-h-rad  .akhq-tms-hode
.akhq-tms-hoyde  .akhq-tms-lab  .akhq-tms-okt  .akhq-tms-wrap  .akhq-tned  .akhq-tned--naa
.akhq-tned-enhet  .akhq-tned-frist  .akhq-tned-frist-v  .akhq-tned-hero  .akhq-tned-lab  .akhq-tned-meta
.akhq-tned-navn  .akhq-tned-tall  .akhq-tned-wrap  .akhq-toast  .akhq-toast--info  .akhq-toast--inline
.akhq-toast--ok  .akhq-toast--warn  .akhq-toast-dot  .akhq-toggle  .akhq-toggle--disabled  .akhq-toggle-knob
.akhq-toggle-track  .akhq-topbar  .akhq-topbar-right  .akhq-traj  .akhq-traj--lav  .akhq-traj-fot
.akhq-traj-nokkel  .akhq-traj-nv  .akhq-traj-skudd  .akhq-traj-snitt  .akhq-traj-svg  .akhq-traj-wrap
.akhq-trend  .akhq-trend-cap  .akhq-trend-pb  .akhq-ukal  .akhq-ukal--kompakt  .akhq-ukal-body
.akhq-ukal-btn  .akhq-ukal-btn--ik  .akhq-ukal-hd  .akhq-ukal-nav  .akhq-ukal-range  .akhq-ukal-titler
.akhq-ukal-uke  .akhq-ukal-wrap  .akhq-val  .akhq-vscrub  .akhq-vscrub--kompakt  .akhq-vscrub-in
.akhq-vscrub-mark  .akhq-vscrub-naa  .akhq-vscrub-spor  .akhq-vscrub-tid  .akhq-vscrub-wrap  .akhq-vvelg
.akhq-vvelg--blokk  .akhq-vvelg-btn  .akhq-vvelg-wrap  .akhq-vvk  .akhq-vvk--tett  .akhq-vvk-basis
.akhq-vvk-hode  .akhq-vvk-lab  .akhq-vvk-navn  .akhq-vvk-note  .akhq-vvk-p  .akhq-vvk-p--fylt
.akhq-vvk-prikker  .akhq-vvk-pv  .akhq-vvk-rad  .akhq-vvk-v  .akhq-vvk-wrap  .akhq-xp
.akhq-xp-bar  .akhq-xp-fill  .akhq-xp-num  .akhq-ytl  .akhq-ytl-ev  .akhq-ytl-ev--samling
.akhq-ytl-ev--test  .akhq-ytl-ev--turn  .akhq-ytl-grid  .akhq-ytl-l  .akhq-ytl-legend  .akhq-ytl-mlab
.akhq-ytl-mnd  .akhq-ytl-naa  .akhq-ytl-prikk  .akhq-ytl-sw  .akhq-ytl-sw--samling  .akhq-ytl-sw--test
.akhq-ytl-sw--turn  .akhq-ytl-wrap
```
