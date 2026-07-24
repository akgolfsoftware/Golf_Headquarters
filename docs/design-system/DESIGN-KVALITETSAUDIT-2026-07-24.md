# Design-kvalitetsaudit — komplett gjennomgang UI/UX, wireframing, animasjon (2026-07-24)

> **Hva dette er:** evidensbasert gjennomgang av HELE design-laget — regler, fasit, planer,
> skills, wireframe-leveranser og faktisk kode — med en prioritert plan for å gjøre det optimalt.
> **Metode:** alle design-dokumenter lest mot faktisk kode i `src/` (tokens, primitiver, motion,
> skjermer). Ingen antakelser — hvert funn har filreferanse.
> **Forhold til andre planer:** dette dokumentet er design-søsteren til
> `plans/kvalitetsplan-verdensklasse.md` (teknisk kvalitet). Bølge-rekkefølgen V1–V6 i
> `DESIGN-EVOLUSJON-2026-07-23.md` står — funnene her mapper inn i den.
> **GO-regel:** per `ak-design-evolution`-skillen gjør vi kun plan + diagnose uten Anders' GO.
> Unntak: kanon-vedlikehold (døde/feilaktige kildefiler) som ikke endrer design.

---

## 1. Det som allerede holder verdensklasse-nivå (ikke rør)

| Lag | Bevis |
|---|---|
| **Ett bevegelsesspråk** | 180 ms `cubic-bezier(0.2,0,0,1)` definert ÉN gang (`src/lib/v2/hooks.ts` EASE + `T.ease`); press-scale, fokusring, hover-løft, drag-løft/landing, fade/sheet-inn — alt i `src/components/v2/core.tsx` |
| **Reduced motion** | Sentralt honorert (`reduced()` + `@media (prefers-reduced-motion)`) i core, skeletons, golfdata-sparkline/gauge/heatmap |
| **Dataliv** | `useCountUp` (600 ms, komma-desimal, fortegn) + `useMount` — tall lever, aldri hopper |
| **Token-arkitektur** | `--v2-*` mørk + lys i `globals.css`, TS-speil `src/lib/v2/tokens.ts` (`T`), tema per produkt låst med før-paint-script + B28 (PlayerHQ tvinges lys) |
| **Gates** | `check-no-hex` med ratchet-baseline · ESLint v2 drift-prevention (hex + off-grid Tailwind) · husky |
| **Beslutningskanon** | FASIT §3/§3b (enkelhet + B-pakke) er operative dommerregler, ikke fluff; 124 komponenter i Claude Design med full trippel (jsx + d.ts + prompt) |
| **Grunn-a11y** | 426 `aria-label` i komponenter, `v2-focus`-ring overalt, 44 px touch-mål, `env(safe-area-inset-bottom)`, Escape-lukking i ark |

Konklusjonen i `DESIGN-EVOLUSJON-2026-07-23.md` («fundamentet er profft, ikke nytt system —
finpuss flaggskip-flyter») bekreftes av koden. Det som mangler er **konsistens i anvendelsen**,
ikke systemet selv.

---

## 2. Funn — avvik, drift og hull (prioritert)

### D1 — Død token-kilde med FEIL verdier `src/styles/v2/tokens.css` (kanon-integritet, P0)

Fila importeres **ingen steder** (kun `patterns.css` er importert i `globals.css`), men ligger
som «fasit-utseende» kilde med gale verdier: `--v2-bg: #0D0E0D` (ekte fasit: `#131513`),
gammel navnekonvensjon (`--v2-panel-2` vs. ekte `--v2-panel2`) og gammel tint. I tillegg peker
kommentaren i `src/app/manifest.ts` på denne fila. Risiko: neste agent/designer leser feil
fasit og porter gale verdier.
**Tiltak (ingen design-GO nødvendig):** slett fila, pek manifest-kommentaren på
`globals.css`, og la `src/styles/v2/patterns.css` stå igjen som eneste CSS i mappa.

### D2 — Ordbok-brudd i spiller-UI (P1 — bryter låst regel)

Engelske fagtermer i PlayerHQ der ordboken krever norsk klarspråk:

- `TreningLoggV2.tsx`: «Off the tee» / «Approach» / «Around green» som labels
- `LeaderboardV2.tsx`: «SG ARG»
- `portal/analysere/hull/page.tsx`: «Off the tee»
- `portal/statistikk/[metric]/page.tsx`: «Approach»

Fasit (FASIT §3b + design-system-regel): tee-slag · innspill · nærspill i spillerflater; koder
(OTT/APP/ARG) er OK som *kompakt kode med HjelpTips*, aldri som eneste label.
**Tiltak:** tekstpass mot `docs/skjermtekst/` — små, kirurgiske endringer, del av V1.

### D3 — HjelpTips-dekning er ~35 % (P1 — bryter LÅST «?»-regel)

Regelen (2026-07-11): ingen v2-skjerm er ferdig uten `HjelpTips` på alle tall/fagord.
Målt: 42 av 119 filer i `src/components/portal/v2/` bruker `HjelpTips`; 62 nøkler finnes i
`src/lib/v2/hjelpetekster.ts`. Mange skjermer viser SG/ACWR/CS-tall uten «?».
**Tiltak:** skjerm-for-skjerm-pass, ★-skjermene i MASTER først; nye nøkler i tekstbanken,
aldri ad-hoc tekst (regelen står).

### D4 — Motion-språket er ikke helhetlig anvendt (P1 craft — kjernen i V6)

Systemet finnes, men nøkkelflater bruker det ikke:

- **`BunnArk`** (delt mobil-sheet, `src/components/v2/bunn-ark.tsx`) har **ingen
  inn-/ut-animasjon** — `v2-sheet-in`-klassen finnes i core, men brukes ikke der arket faktisk
  vises. Backdropen fader heller ikke.
- **`SerieMeny`** (AgencyKalenderV2) er en egen inline-overlay uten animasjon.
- **golfdata-komponentene** (Sparkline, RingGauge, Heatmap, StatusDot) har hver sin
  motion-implementasjon utenfor det sentrale språket (overgangs-lag, men verdt å vite).
- **`patterns.css` «living animations»** (itinPulse, nowPulse m.fl.) er et parallelt
  animasjonsvokabular som overlapper delvis med core-klassene.

**Tiltak (V6):** én motion-katalog: alle overlays bruker `v2-sheet-in`/fade + backdrop-fade;
SerieMeny over på BunnArk/delt overlay; katalogiser patterns.css-animasjonene i FASIT slik at
nye skjermer velger fra katalogen i stedet for å lage nye.

### D5 — v2-kjerneklassene injiseres runtime i stedet for statisk CSS (P2)

`core.tsx` `ensureStyles()` lager et `<style>`-element klient-side ved første import. Det gir
(a) FOUC-risiko før hydrering (press/fokus/fade-klasser finnes ikke i SSR-HTML), (b) to
kilder for v2-CSS (runtime-streng + `patterns.css`).
**Tiltak:** flytt klassene til `src/styles/v2/patterns.css` (statisk import finnes allerede);
`ensureStyles` fjernes. Null visuell endring — kun kildeflytting.

### D6 — 8pt-grid-gaten treffer ikke v2-idiomet (P2 — regel/kode-drift)

ESLint-regelen blokkerer off-grid *Tailwind-klasser* (`p-3`, `p-5` …), men v2-flatene bruker
**inline styles** (`gap: 6`, `padding: "8px 9px"`, `fontSize: 11.5`) portet 1:1 fra
Claude Design-mockups. Gaten og kanon peker altså på ulike ting.
**Tiltak (dokumentasjon, ikke kode):** presisér i FASIT §2 at 8pt gjelder *layout-nivå*
(seksjoner, kort-gap = `T.gap` 16), mens komponent-interiør følger mockup-pikslene (mockup er
fasit). Alternativet — å håndheve 8pt i inline styles — ville tvinge redesign av godkjente
mockups og anbefales ikke.

### D7 — Wireframe-kilden er ekstern og kan ikke verifiseres i repo (P2 — prosessrisiko)

`docs/design-system/wireframes/` har 2 HTML-filer; de ekte wireframene/mockupene (124
komponenter, ui_kits, 3-retningstester) bor i Claude Design (eksternt). Regelen «design →
system → prod, aldri fikse design bare i prod» kan dermed ikke revideres i git — drift mellom
mockup og prod er usynlig til noen ser etter manuelt.
**Tiltak (beslutning hos Anders):** enten (a) periodisk eksport av godkjente v2-mockups til
`docs/design-system/` (f.eks. ved hver bølge-avslutning), eller (b) eksplisitt vedta at
Claude Design er eneste fasit og skrive det i `design-system/README.md` + akseptere manuell
diff. Anbefaling: (a) light-versjon — eksport kun av *endrede* kits per bølge.

### D8 — Tilgjengelighet: sterk grunnmur, tre hull (P2)

1. **Ingen fokus-felle** i `BunnArk`/`SerieMeny` (`role="dialog"` + `aria-modal` er satt, men
   Tab vandrer ut av dialogen; fokus flyttes ikke inn ved åpning).
2. **Kontrast i lys tema er ikke verifisert** — `--v2-mut` på cream-canvas o.l. bør måles én
   gang mot WCAG AA og dokumenteres i FASIT.
3. **Ingen automatisert a11y-sjekk** — vurder `@axe-core/playwright` på ★-skjermene i
   smoke-suiten (kobles til KS-5 i kvalitetsplanen).

### D9 — Design-docs: historikk blandet med fasit (P3 — kobles til KS-7)

`plattform-design-2026-07-21/` inneholder 3 DAGSPLAN-filer, KVELD-RAPPORT ×2,
AUTONOM-FREMGANG, RESTERENDE-PLAN m.m. — arbeidslogger fra juli-sprintene ligger side om side
med levende fasit. Levende er: FASIT, TEMA-LYS-MORK, DESIGN-EVOLUSJON, KOMPONENTSTATUS,
B-KLOSSER, GJENSTAENDE-SKJERMER, SKJERM-FAMILIER + gate-filene.
**Tiltak:** flytt arbeidslogger til `docs/arkiv/design/` med indeks (del av KS-7).

### D10 — Manglende overgangs-animasjon på navigasjon (P3 — mulig V6-kandidat)

Fane-/sidebytte (f.eks. Analysere-faner) skjer uten overgang. Next 16 støtter View
Transitions; en 150–200 ms crossfade i samme motion-språk ville løfte følelsen uten ny
avhengighet. **Kun etter GO V6** — og aldri på bekostning av hastighet.

---

## 3. Optimal plan — rekkefølge og kobling til eksisterende bølger

Ingenting her åpner nytt design-scope; alt mapper inn i V1–V6 (DESIGN-EVOLUSJON) og
KS-strømmene (kvalitetsplanen):

| Steg | Funn | Bølge/strøm | Krever GO? |
|---|---|---|---|
| 1. Kanon-integritet | D1 (slett død tokens.css) + D6 (presisér 8pt i FASIT) + D9 (arkiver logger) | vedlikehold / KS-7 | Nei — vedlikehold |
| 2. Regel-etterlevelse på ★-skjermer | D2 (ordbok) + D3 (HjelpTips) | **V1** | «GO V1» |
| 3. Motion + overlays | D4 (BunnArk/SerieMeny/katalog) + D5 (statisk CSS) | **V6** | «GO V6» |
| 4. A11y-pass | D8 (fokus-felle, kontrastmåling, axe-smoke) | V6 / KS-5 | «GO V6» |
| 5. Wireframe-synk | D7 | prosessbeslutning | Anders velger a/b |
| 6. Navigasjonsovergang | D10 | V6 (valgfri) | «GO V6» |

**Definisjonen av ferdig per steg:** skjerm-testen i FASIT §3 bestått (5 s · én CTA ·
trykk-tall · tom tilstand · klarspråk) + MASTER-haker oppdatert i samme commit + `npm run
verify` grønn.

---

## 4. Skjerm-test-protokoll (operasjonalisert — brukes i hver bølge)

For hver ★-skjerm i `docs/MASTER-SKJERMPLAN.md`:

1. **Squint:** ett hierarki? Ett fokus?
2. **5 sekunder:** standpunkt + neste steg uten å scrolle?
3. **Trykk-tall:** primærjobb på 1–2 trykk fra hub?
4. **Tilstander:** tom / laster / feil / suksess — alle med én vei videre?
5. **Én lime-jobb:** kun én grønn handling (lys: forest)?
6. **Ordbok + «?»:** nærspill/innspill/tee-slag; HjelpTips på hvert tall/fagord?
7. **Tommel 390:** primær CTA i tommel-sonen; 44 px mål?
8. **Motion:** inn-animasjon fra katalogen; reduced-motion respektert?
9. **Tema:** riktig per produkt (PlayerHQ lys · AgencyOS mørk default)?

Punkt 4, 6 og 9 kan delvis håndheves i e2e (tom-tilstand-tekst, forbudte engelske termer i
portal-DOM, `data-v2-tema`) — kobles til KS-5.

---

## 5. Karakterer (målt nå → mål etter plan)

| Akse | Nå | Etter | Hva flytter den |
|---|---|---|---|
| Tokens + tema | 9/10 | 9,5 | D1 (én kilde, null drift) |
| Komponentsystem | 8/10 | 9 | D4-katalog + gap-regel etterlevd |
| Motion/animasjon | 6,5/10 | 9 | D4 + D5 + D10 (ett språk, faktisk brukt overalt) |
| Klarspråk/ordbok | 7/10 | 9,5 | D2 + D3 (ordbok + «?» på alt) |
| Tilgjengelighet | 7/10 | 9 | D8 (felle + kontrast + axe) |
| Wireframe→prod-sporbarhet | 5/10 | 8 | D7 (synk per bølge) |
| Docs-hygiene (design) | 6/10 | 9 | D9 (fasit adskilt fra logg) |

---

## 6. Hva som IKKE skal gjøres (anti-mål, arvet + bekreftet)

- Ikke nytt tokensett, ikke mørk PlayerHQ, ikke eksternt skin (Whoop/Linear-farger).
- Ikke håndheve 8pt inne i komponenter på tvers av godkjente mockups (D6-avklaringen).
- Ikke innføre framer-motion e.l. — CSS-språket på 180 ms dekker behovet, null avhengigheter.
- Ikke 361-skjermers redesign-batch — kun bølgene, ★ først.
