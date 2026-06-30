# WORKBENCH — KOMPLETT TRENINGSSLØYFE (plan + spec)

> **Hva dette er:** Den samlende planen for å gjøre Workbench til én lukket sløyfe på tvers av
> **planlegging → gjennomføring → analysering → evaluering**, inkl. stats og tester.
> Bygger på `Workbench (hovedskjerm).dc.html` (5 zoom-nivåer, dra-og-slipp, quick-edit, AI-periodiser).
>
> ⚠️ **Workbench-funksjonen eies av Anders.** Alt merket ⚠️ rører kjernelogikk (objekt-modell, tilstands-
> maskin, fan-out, tilbakekobling) og må bekreftes med ham før koding. Alt annet er additivt/visuelt.

---

## 0 · Prinsipp
Workbench er **identisk for spiller og coach** — én komponent. Forskjellen er kun:
- Coach får **scope-velger** (spiller *eller* gruppe), bulk-redigering og «send standardplan».
- Gruppeøkt **fan-out**-propageres til hvert medlems plan.

Den store gevinsten: **ett `Økt`-objekt og ett `Evaluering`-objekt som lever gjennom alle fire fasene**, så fasene slutter å være separate skjermer og blir én ring.

---

## 1 · Spinen — to delte objekter

### `Økt` (TreningsØkt)
| Felt | Type | Settes i |
|---|---|---|
| `id`, `spillerId` \| `gruppeId` | ref | Planlegging |
| `pyramide` | Fysisk/Teknisk/Golfslag/Spill/Turnering | Planlegging |
| `omrade` | f.eks. «Nærspill < 30 m» | Planlegging |
| `akFormel` | {CS-nivå, L-fase, praksis, press} | Planlegging |
| `drills[]`, `tmParams[]` | ref øvelsesbank | Planlegging |
| `planlagtSgEffekt` | tall (forventet) | Planlegging |
| `booking` | {anlegg, bås, tid} | Logistikk |
| `status` | enum (§3) | alle |
| `loggedReps[]`, `video[]`, `rpe` | målt | Gjennomføring |
| `faktiskSgEffekt` | beregnet | Analysering |
| `evalueringId` | ref | Evaluering |

### `Evaluering`
| Felt | Verdi |
|---|---|
| `scope` | økt \| uke \| periode \| sesong |
| `maaloppnaelse` | % mot delmål |
| `sgDelta` | per kategori, tidsvindu |
| `coachVurdering`, `spillerVurdering` | 1–5 + notat |
| `nesteAnbefaling` | strukturert → mater Planlegging |

Støtteobjekter finnes alt (`Plan/Periode`, `Mål`, `Test`, `Runde`); det nye er at de skriver til/leser fra Økt og Evaluering.

---

## 2 · Tilstandsmaskin ⚠️
```
PLANLAGT → BOOKET → KLAR → PÅGÅR → LOGGET → VURDERT → LUKKET
   │          │                       │        └── feeds Evaluering
   │          └── anlegg+bås reservert
   └── AVLYST / FLYTTET → oppfølgingskø
```
| Overgang | Trigger | Data |
|---|---|---|
| PLANLAGT→BOOKET | coach binder anlegg/tid | `booking` |
| KLAR→PÅGÅR | spiller «Start økt» | tidsstempel |
| PÅGÅR→LOGGET | reps/video/RPE | rådata |
| LOGGET→VURDERT | økt-review 1–5 | `Evaluering(økt)` |
| auto AVLYST | ikke startet innen frist | → oppfølging |

---

## 3 · Per fase: inn → funksjon → ut → trigger

**A · Planlegging** — inn: Mål + siste Test + SG-profil → generér periode-skjelett → ut: `Periode[]` + `Økt[PLANLAGT]`. Regel: svakeste SG-kategori får +1 ukevolum-vekt. ⚠️ test låser blokk-startnivå.

**B · Gjennomføring** — inn: `Økt[KLAR]` → Live-økt fanger reps/video/RPE → ut: `Økt[LOGGET]`. Hver rep tagges `{drill, L-fase, resultat}` for senere attribusjon.

**C · Analysering** — inn: `Økt[LOGGET]` + Runde/TrackMan → beregn `faktiskSgEffekt`. Attribusjon = planlagt fokus vs. faktisk SG-bevegelse, samme kategori/vindu. Drill-effektivitet = Δ SG / reps over rullerende 200-slags vindu.

**D · Evaluering** — inn: `Økt[VURDERT]` + `sgDelta` + `maaloppnaelse` → auto-retrospektiv → ut: `Evaluering(periode)` med `nesteAnbefaling`. ⚠️ `nesteAnbefaling` pre-fyller neste planleggingsrunde.

---

## 4 · Tilbakekoblings-kanter (gjør linje → ring)
```
Test ─► Plan         (resultat = startnivå)
Plan ─► Økt          (genererer planlagte økter)
Økt(logget) ─► SG    (faktisk effekt)
SG ─► Analyse ─► Evaluering
Evaluering ─► Plan   ⚠️ (neste periode pre-fylt)  ◄── lukker ringen
RPE/volum ─► Belastningsvakt ─► Plan (taper/justér)
```
Uten `Evaluering → Plan` er det fortsatt en åpen linje. Den kanten er poenget.

---

## 5 · Automasjonsregler
| Når | Hvis | Da |
|---|---|---|
| Økt LOGGET | faktisk SG < planlagt − 0,3 | flagg «drill virker ikke» |
| Ukeslutt | etterlevelse < 70 % | roll manglende + varsle |
| 7-dagers volum | ACWR > 1,5 | ⚠️ blokkér høy-intensitet, foreslå hvile |
| 14 dg før turnering | — | auto-taper volum −40 % |
| Test fullført | nytt nivå | oppdater pyramide + foreslå justering |
| Periode lukket | — | retrospektiv + foreldrerapport |

---

## 6 · Gruppe-semantikk ⚠️
Gruppeøkt = **mal-instans**, ikke delt objekt:
- Opprett `Økt(gruppeId)` → **fan-out** kopierer til hvert medlem som egen `Økt(spillerId)` med egen status/logg.
- Mal-endring → **diff-propagering**: «3 av 8 har startet — oppdater kun de 5 urørte?»

---

## 7 · Funksjons-backlog (Workbench-interne, fra analysen)
**Coach-skalering:** scope-dropdown · send standardplan · ⚠️ gruppe-propagering · bulk-redigering · klon plan.
**Intelligens:** auto-fyll fra svakeste SG · ⚠️ ACWR-belastning · auto-taper · konflikt-vakt.
**Lukket sløyfe:** planlagt vs gjennomført + compliance · ⚠️ auto-rejustering · faktisk vs forventet SG.
**Periodisering:** makro/meso/mikro · turneringskalender-import · junior skole/hvile-blokker.
**Samarbeid:** «Ønsk økt» → godkjenningskø · kommentarer per økt · endringsvarsler.
**Logistikk:** bind økt til anlegg/bås/tid · coach-tidsbudsjett.
**Motivasjon:** plan-fullføringsring · streak · neste-økt-kort på hjem.

---

## 8 · NYE funksjoner — kvalitet · automatisering · effektivitet

### Kvalitet
- **Data-kvalitetsscore** per spiller: hvor pålitelig er SG (antall runder/økter med data) + nudge for å fylle hull.
- **Konfidens på SG**: vis usikkerhet (n=…) så coach ikke overreagerer på lite datagrunnlag.
- **Aldersjusterte benchmark-normer** per pyramidetrinn (mot kohort/WAGR) som mål og evaluering måles mot.
- **Evidens-tagget øvelsesbank**: hver drill bærer aggregert SG-løft på tvers av stallen → coach velger det som faktisk virker.
- **Plan-kvalitetsindikator**: balanse mellom pyramidetrinn, periodiserings-sunnhet, nok varianttrening — score før publisering.

### Automatisering
- **Smart-scheduling** ⚠️: constraint-solver plasserer planlagte økter i ledige bås/tider fra availability/kapasitet automatisk.
- **Regelmotor (coach-konfigurerbar)** ⚠️: «hvis SG putting < 0 i 3 runder → legg inn putte-blokk» — coachen bygger egne if→then.
- **Naturlig språk → plan**: «gi Øyvind to wedge-økter og en runde denne uka» genererer økter (AI-Caddie utvidet).
- **Auto-rapporter på kadens**: uke→spiller, måned→forelder, periode→klubb — uten manuelt arbeid.
- **Plateau-/regress-deteksjon** ⚠️: oppdager stagnasjon i en kategori → trigger intervensjonsforslag.
- **Adaptive nudges**: påminnelser tilpasset når spilleren faktisk pleier å logge/trene.

### Effektivitet (coach-leverage)
- **Stall-cockpit koblet til Workbench-avvik**: «hvem trenger meg» drives av etterlevelse/SG-trend/ubookede økter.
- **Multi-select bulk-handlinger** på tvers av spillere (flytt/avlys/erstatt for mange samtidig).
- **Mal-arv**: endre en master-mal → forslag om å oppdatere avledede spiller-planer (med diff).
- **Command palette (⌘K) i Workbench**: alt — bytt spiller, send plan, legg økt — uten mus.
- **Gjenbrukbare mikrosykluser**: 3-dagers lego-blokker som dras inn som enhet.
- **Batch-godkjenning**: spiller/AI foreslår økter → coach godkjenner mange i én kø.

### Data & integrasjon
- **TrackMan-auto-import**, Arccos/Garmin for runder, kalender-sync (iCal/Google).
- **Offline-modus** på range; synk ved nett.
- **Versjonering + audit** på planendringer; «angre periode».
- ⚠️ **Metodikk-A/B**: sammenlign to plan-tilnærminger på like spillere i kohort (eksperiment-modus).

---

## 9 · Byggrekkefølge (anbefalt)
1. ⚠️ Avklar med Anders: `Økt`/`Evaluering`-objekt, tilstandsmaskin, fan-out, `Evaluering→Plan`-kant.
2. Coach-modus i Workbench (scope-dropdown, send plan, gruppe-propagering) — *kopi finnes: `Workbench (hovedskjerm) v2 - coach-modus.dc.html`*.
3. Gjennomføring↔plan-kobling (status LOGGET, compliance).
4. Evaluerings-flate (økt- + periode-retrospektiv) — **den manglende skjermen**.
5. Analyse-attribusjon (faktisk vs forventet SG).
6. Automasjonsregler + rapporter.
7. Kvalitets- og integrasjonslag.

> Knytt hver bygd flate til `KOMPLETT-SKJERMKART.md` og `Rute-til-fil-register`.

---

## 10 · SWOT + interaktivitet
Strategisk SWOT av hele Workbench + dypdykk i interaktivitet (utover dra-og-slipp): se `WORKBENCH-SWOT-OG-INTERAKTIVITET.md`. Hovedgrep derfra: lever **minste komplette ring** først (plan→gjennomfør→enkel evaluering→pre-fyll neste), avlast logging-friksjon før funksjons-dybde, og bekreft ⚠️-kjernen med Anders nå.

## 11 · Total-audit (status per flate/knapp/funksjon + datakoblinger)
Komplett gjennomgang av hver Workbench-flate, -visning, -knapp og -funksjon — hva som er koblet vs. visuell skinn vs. mangler — pluss kart over alle data-kanter inn/ut (Workbench som nav): `WORKBENCH-TOTAL-AUDIT.md`. Nøkkelfunn: 5 ferdige skjermer manglet i pakken (nå lagt inn); Evaluerings-flaten er en tom stub som må bygges; flertallet av datakoblingene er visuelle, ikke wiret.
