# FØR/UNDER/ETTER — skjermdesign for sløyfen

Skrevet 01.08.2026. Grunnlag: `docs/for-under-etter-spec.md` §5, §6, §7 i akgolf-hq-repoet.

**Dekning ved skriving: 8/223 · 90/151.** Dette dokumentet flytter ingen av dem — det er en
spesifikasjon, ikke en mal i `templates/`. **P7 (craft) er ikke vurdert for noe her.**

Dette designes her og kodes av en annen modell. Alt som står under er ment å være entydig nok
til å bygge fra uten å gjette. Der noe mangler i biblioteket, står det eksplisitt at det er ny
komponent — ikke som et forslag, men som en avgrenset jobb med anatomi.

---

## 0 · Fire avvik mellom oppdraget og systemet — lest, ikke omgått

Disse må avgjøres av eier. Jeg har designet etter systemet, ikke etter oppdragsteksten, og
sier her hvor de spriker.

**1. «Nøyaktig én oransje primærhandling per skjerm» finnes ikke som mekanisme.**
Det er ingen `--handling`-token i `tokens/akhq-tokens.css`. Oransje er `--accent #D97757`, og
`components/actions/Button.prompt.md` er kategorisk: *«Ingen fylt aksentvariant — oransje-
monopolet ligger i OneThingNow-seksjonen, ikke i knapper.»* En oransje knapp finnes altså ikke
å velge. Slik jeg har løst det: **hver skjerm har nøyaktig én `OneThingNow`** — det er skjermens
oransje — **og inne i den én blekk-primærknapp**. Intensjonen i oppdraget («én ting nå per
skjerm») holdes; virkemiddelet er systemets, ikke en ny oransje knapp.

**2. Godkjenningskortet kan ikke være oransje i det hele tatt.**
`QueueCard.prompt.md`: *«Ingen oransje i kortet. Oransjemonopolet er én jobb per skjerm; på Kø
er det ikke rammen rundt toppsaken.»* På `/admin/queue` er den ene oransje tingen allerede
brukt av skjermen, ikke av kortet. ETTER-kortet får derfor blekk-primær og ingen aksent. Det er
et bevisst brudd med oppdragsteksten, gjort fordi komponentregelen er eldre og mer spesifikk.

**3. `AKFormelChip` finnes ikke.** Spec-en §5 skriver «AKFormelChip (finnes)». Det stemmer ikke.
Formelen finnes i dag bare som `.akhq-sc-formel` inne i `components/calendar/SessionCard.jsx`
(mono 10,5 px, `letter-spacing .02em`, `--muted`, `overflow-wrap:anywhere`). `AKFormelChip` står
som planlagt i bølge P8. Under gjenbrukes `.akhq-sc-formel`-anatomien som en linje i kortet.
En egen komponent er en separat jobb og skal ikke smugles inn i denne.

**4. Verken opptaksknapp, timer eller offline-indikator finnes.** Tre nye komponenter kreves
(§4 nederst). Det er den reelle kostnaden ved UNDER-skjermen, og den er ikke null.

---

## 1 · Delt grunnlag for alle tre skjermer

**Tokens.** Verbatim fra `tokens/akhq-tokens.css`. Ingen nye, ingen omdøpte, ingen nye farger.
Verdier brukt under: `--bg #FAF9F5` · `--surface #FFFFFF` · `--soft #F0EEE6` ·
`--border #E8E6DC` · `--fg #141413` · `--muted #5F5B53` · `--cta #141413` · `--on-cta #FAF9F5` ·
`--accent #D97757` · `--accent-fg #B85C3D` · `--up #63784A` · `--dn #A85536` · `--info #46719F` ·
`--r 8px` · `--r-sm 6px` · `--r-pill 999px` · `--dur 160ms` · `--ease`.

**Type.** Poppins (`--ui`/`--disp`) på UI og overskrifter · Lora (`--body`) på prosa og du-form ·
IBM Plex Mono (`--mono`) på **alle** tall, med komma som desimalskille (`+0,3`, aldri `+0.3`).
Body: AgencyOS 13,5 px · PlayerHQ 14 px.

**Lag.** `@layer akhq-base, akhq-container, akhq-modifier;` i hver ny fil. Gulv skrives
`min-height: max(var(--row-min), var(--floor))` med **lengde i begge ledd** — `max(auto, 0px)`
er ugyldig CSS og dropper hele deklarasjonen uten advarsel.

**Ikoner.** Lucide, 20 px, stroke 1,5. Aldri emoji.

**Språk.** Norsk bokmål. Nærspill, aldri «kort spill». Ingen «Ingen data» — ekte tekst som peker
mot neste handling.

**`data-od-id`** på alt interaktivt, med rolleprefiks: `cta-` · `felt-` · `list-` · `panel-` ·
`nav-` · `kpi-`.

**Komponenter jeg bevisst ikke bruker:** `akhq-dt` (DataTable), `akhq-fpill`, `akhq-pag`,
`akhq-step`, `akhq-kan`. De er ikke i `_ds_bundle.js` per 31.07 og ville rendret tomt.

---

## 2 · FØR — før-kortet i `/admin/innboks`

**Jobb:** 30 sekunder før økta. Coachen skal vite hvor de slapp, og starte fangst uten å
navigere noe sted.

**Rute:** `/admin/innboks`, ett kort per økt i dagens kalender. Vises også automatisk når fangst
startes på en spiller — et før-kort eier må gå til, blir ikke lest.

### Anatomi

Ytterste flate er `components/actions/OneThingNow.jsx` — dette **er** skjermens ene oransje ting
(3 px `--accent` venstrekant, oransje mono-etikett med puls). `label="Neste økt"`.
Én per skjerm: er det tre økter i dag, er kun den nærmeste `OneThingNow`; resten er `Panel`.

Innhold, i rekkefølge:

| # | Element | Komponent / klasse | Innhold |
|---|---|---|---|
| 1 | Identitetslinje | `ListRow` `leading="avatar"` + `titleBadge`, i `ListGroup` | «Øyvind Rohjan» · badge «A3» (`StatusBadge kind="tag"`, fargeløs) · `trailing="value"` = «om 40 min» (mono) |
| 2 | Eyebrow | `SectionLabel` `.akhq-slabel` | DER DERE SLUTTET |
| 3 | Tråden | Lora 14,5 px `--fg`, maks 52ch | «Albue i P6 på lange jern. Sjekkpunktet var 7 av 10 slag.» |
| 4 | Eyebrow | `SectionLabel` | SIDEN SIST |
| 5 | Tre tall | `KpiStripe` `components/data/KpiStripe.jsx` | tre `items`, se under |
| 6 | Proveniens | `ProvenanceDisclosure` `.akhq-prov` | sammendragstekst «Hvorfor disse tallene» |
| 7 | Handling | `Button variant="primary"` inne i OneThingNows `actions` | «Start fangst» |

**Punkt 5 — nøyaktig tre, aldri flere.** `KpiStripe` med `items`:

```
{ label: "ØKTER",     value: 3,    unit: "av 4 planlagt", window: "14 d" }
{ label: "SG TILNÆRMING", value: 0.3, decimals: 1, delta: +0.3, deltaBasis: "14 dager", tone: "up" }
{ label: "RUNDER",    value: 0,    emptyText: "Ingen runder registrert" }
```

Er det flere enn tre signaler, **velger systemet de tre viktigste**. Dette er en redigering,
ikke en liste. Rangering: (a) signal som berører forrige sjekkpunkt, (b) største SG-endring
siste 14 dager, (c) planetterlevelse. Faller en av dem bort, rykker neste opp.

Tall er mono med komma-desimal. `delta` rendres «▲ +0,3 vs 14 dager» i `--up`/`--dn` — grønn
og leire er de eneste fargene på skjermen ved siden av OneThingNows kant.

**Punkt 6:** `agent`, `data`, `rule` — tre celler, aldri to. `open` på maks én sak per skjerm,
den øverste. Ingen farge i utfellingen.

### Tilstander

- **content** — som over.
- **loading** — `Region state="loading"` rundt KpiStripe; identitetslinja og tråden vises straks
  de finnes. Skjelettet dekker aldri hele kortet.
- **tom tråd** (ingen godkjent `PlanAction` ennå, f.eks. første økt): seksjon 2–3 byttes mot
  Lora-linje «Første økt med denne spilleren. Det er ingen tråd å ta opp ennå.» Knappen står.
  **Aldri en tom skjerm** — punkt 3 i oppdraget.
- **tomt «siden sist»**: `KpiStripe` med `emptyText` per felt, aldri «Ingen data».
- **error** — `Region state="error"`: «Kunne ikke hente grunnlaget. Prøv igjen.» Knappen «Start
  fangst» står **likevel** — fangst skal aldri blokkeres av at et tall ikke lastet (invariant 1).

### Datakontrakt

- Sjekkpunkt: `PlanAction.sjekkpunkt` fra siste `status = ACCEPTED` på spilleren.
- Siden sist: `Signal`-rader nyere enn forrige økt · gjennomførte økter i PlayerHQ · `Round`.
- Ingen nye tabeller, ingen nye spørringer mot noe som ikke finnes.

### Mål

Lest på 30 sekunder. Konkret: maks tre punkter under «Siden sist», tråden på maks to linjer,
og «Start fangst» synlig uten scroll i 430 px container.

---

## 3 · UNDER — Fangst

**Jobb:** Fra telefonen løftes til opptaket går: under 20 sekunder. Én hånd. Ingen scrolling.

**Rute:** `/portal/...`-siden er feil sted — dette er coachens flate. Ligger under Spillere:
`/admin/spillere/[id]/fangst`, åpnet fra før-kortets «Start fangst». Ingen ny navigasjonsflate,
ingen ny fane i TabBar.

### Samtykkeporten — først, alltid

Dette er det ene stedet der invariant 1 ikke gjelder. Jussen, ikke treningen.

`LydSamtykke.status !== "GITT"` → **opptaksknappen rendres ikke.** Ikke grå, ikke deaktivert.
Borte. En deaktivert knapp inviterer til å finne veien rundt.

I stedet, på samme plass:

- `Callout tone="privacy"` (`components/feedback/Callout.jsx`) — **ingen venstrekant**, den er
  OneThingNows signatur. Ikon `laas` fra `Icon`.
- Tittel: «Venter på samtykke fra foresatt»
- Brødtekst (Lora, `--fg`): «Vi kan ikke ta opp lyd av Øyvind før foresatt har sagt ja. Purringen
  går til den e-postadressen som er registrert.»
- Én handling: `Button variant="primary"` «Send purring». Etter trykk: `Toast tone="ok"`
  «Purring sendt.» — flaten er blekk, fargen ligger i 6 px-prikken.

Server avviser `/api/recording/start` uansett hva klienten sender. Klientgatingen er kosmetikk.

### Anatomi (samtykke gitt)

Én skjerm, 430 px kolonne, ingen scroll. Ovenfra og ned:

| # | Element | Komponent / klasse | Detalj |
|---|---|---|---|
| 1 | Topplinje | `ListRow` `leading="avatar"` + `trailing="action"` | «Øyvind Rohjan» · haleknapp = lukk (`Button variant="ghost" size="sm"`, `aria-label="Avslutt fangst"`), 44 px gulv |
| 2 | AK-formel | `.akhq-sc-formel`-anatomi, som `<button>` | `TEK_TEE_L-BALL_CS60_M2_PR2` — mono 10,5 px, `--muted`. **Forhåndsutfylt** fra spillerens aktive plan for dagen. Trykk åpner `BottomSheet` for å endre. Treffsone 56 px via `::after`, den synlige linja er 16 px |
| 3 | Opptaksknapp | **ny komponent** `OpptakKnapp` | 96 px, sirkel, skjermens ene oransje ting |
| 4 | Tid | **ny komponent** `OpptakTid` | `02:14`, mono, `clamp(28px, 8cqi, 34px)`, tabulære sifre |
| 5 | Hurtigtagger | `Chip` `.akhq-chip`, tre stk. | 56 px høyde, `--r-pill`. Valgt = `--fg`-ramme + `--soft`-fyll, aldri farge |
| 6 | Lagringstilstand | **ny komponent** `LagringsStatus` | to adskilte tilstander, se under |

**Punkt 2 er ikke pynt.** Eier fyller aldri ut noe fra scratch (regel 3). Er det ingen plan for
dagen, forhåndsutfylles siste brukte formel for spilleren, med `--muted` og teksten uendret —
ikke tomme felter.

**Punkt 5 — de tre taggene er ikke faste.** De genereres:
1. Forrige økts sjekkpunkt, komprimert til ett til to ord («P6»).
2. Spillerens åpne fokusområde («Lav punkt»).
3. Siste tagg brukt på denne spilleren («Tempo»).

Det er her sløyfen lukkes: FØR-kortets sjekkpunkt kommer tilbake som noe du treffer med tommelen.
Er det færre enn tre kilder, vises færre tagger — aldri utfyllingstagger.

**Punkt 6 — offline vist ærlig.** To tilstander som **aldri** slås sammen:

| Tilstand | Tekst | Farge |
|---|---|---|
| Skrevet til IndexedDB | «Lagret lokalt» | `--muted`, ◆ i `--fg` |
| Lastet opp og bekreftet | «Lastet opp» | `--muted`, ◆ i `--up` |
| Kø med ventende biter | «3 biter venter på nett» | `--muted`, tall i mono, ◆ i `--info` |

UI-en viser aldri «lagret» før biten faktisk ligger i IndexedDB. Ingen av dem er en feiltilstand
— derfor ingen `--dn`, ingen `Banner`. Mister du dekning på rangen, er det normalt.

### Trykkmål

Alle interaktive elementer 56 px, satt som `min-height: max(56px, var(--floor))`. Det er et
navngitt avvik **oppover** fra P4-gulvet på 44 px, med samme begrunnelse som `FAB` bruker for
sine 56: dette treffes med hanske, i vind, uten å se ned. Opptaksknappen 96 px.

### Tilstander

klar · tar opp · pause · lagrer · kø · uten samtykke · uten nett · feil ved mikrofontilgang
(`Banner tone="warn"`: «Appen får ikke tilgang til mikrofonen. Sjekk tillatelser i telefonen.»).

### Mål

Under 20 sekunder fra løftet telefon til opptak går. Trinnene: åpne PWA (allerede innlogget) →
spiller forhåndsvalgt fra dagens kalender → ett trykk. Tre trinn. Er spilleren ikke i kalenderen,
fire. Er den fjerde nødvendig oftere enn hver femte gang, er kalenderkoblingen feil, ikke skjermen.

---

## 4 · ETTER — godkjenningskortet i `/admin/queue`

**Jobb:** To minutter etter økta. Coachen godkjenner eller redigerer det systemet har forfattet.
Aldri skriver fra scratch.

**Rute:** `/admin/queue`, i «Løst»-kolonnen som allerede står tom og venter.

### Anatomi

Bygger på `components/queue/QueueCard.jsx` (`.akhq-qc`) — ikke et nytt kort.
**Ingen oransje i kortet** (§0 punkt 2).

```
sender="Øktoppsummering"   kind="coaching"   age="16 t"
title="Øyvind Rohjan · fanget i går 16:42"
first                      (blekkramme, --fg 40 % — øverste sak)
primaryLabel="Godkjenn og send"
provenance={{ agent, data, rule, run }}
```

`children` (kortets kropp), i rekkefølge:

| # | Element | Komponent / klasse | Innhold |
|---|---|---|---|
| 1 | Eyebrow | `SectionLabel` | OBSERVASJON |
| 2 | Observasjon | Lora 14,5 px `--fg` | «Låser høyre albue i P6, mister lav punkt på lange jern.» |
| 3 | Eyebrow | `SectionLabel` | FORESLÅTT ØVELSE |
| 4 | Øvelse + formel | tekstlinje + `.akhq-sc-formel` | «Albue-vegg mot P6» / `TEK_TEE_L-KØLLE_CS40_M1_PR1` |
| 5 | Bytt | tekstlenke, 12,5 px `--muted`, uten understrek | «Bytt øvelse» — **ikke knapp** |
| 6 | Eyebrow | `SectionLabel` | NESTE SJEKKPUNKT |
| 7 | Sjekkpunkt | `FormField` + `TextInput` | forhåndsutfylt «Holder albuen i P6 på 7 av 10 slag» |
| 8 | Eyebrow | `SectionLabel` | MELDING TIL SPILLER |
| 9 | Melding | `FormField` + `Textarea` `.akhq-ta` `rows={4}` | forhåndsutfylt, redigerbar |
| 10 | Proveniens | `ProvenanceDisclosure` | kollapset: «Hvorfor dette forslaget» |

Punkt 9, forhåndsutfylt tekst — ordrett:

> «Bra økt i dag. Fokuset fram til neste gang er albuen i P6 — se øvelsen jeg la i planen din.»

Punkt 5 er tekstlenke og ikke knapp av én grunn: `QueueCard` tillater én primærhandling, og
`Panel.action` tar én ting. To knapper ville gjort «bytt» like tungt som «godkjenn».

**Punkt 10 svarer på «hvorfor dette tallet».** Tre celler, aldri to:

```
agent: "Øktoppsummering"
data:  "Fangst 31.07 16:42 · 4 min 12 s · tagger P6, Lav punkt · plan uke 31"
rule:  "Sjekkpunkt fra 24.07 var albue i P6, 7 av 10. Måloppnåelse 4 av 10 i denne økta."
run:   { at: "16:49", duration: "6,2 s", id: "kj-9107" }
```

`rule` er der «hvorfor dette tallet» faktisk besvares: 7 av 10 kom fra forrige sjekkpunkt, 4 av
10 er målt i denne økta. Mangler `rule`, er saken ikke agentgenerert, og komponenten sier det
selv — aldri tre tankestreker.

### Godkjenn og send

Én blekk-primærknapp. Ett trykk gjør fire ting **i én transaksjon**:

1. `PlanAction.status = ACCEPTED`
2. Øvelsen skrives til spillerens plan via v2-sync-helperne (plan-live-synk-invarianten — aldri
   direkte skriving)
3. `sjekkpunkt` lagres og blir neste FØR-korts tråd
4. Meldingen sendes til spilleren

Feiler ett av dem, feiler alle. Halvveis godkjenning er verre enn ingen. Ved feil:
`Toast tone="warn"` «Ingenting ble sendt. Forslaget står fortsatt i køen.» — og kortet blir
stående uendret.

### Tilstander

default · redigert (feltene er skitne — knappeteksten er uendret, ingen «Lagre»-tilstand) ·
utsatt (`snoozedUntil` demper kortet, `StatusBadge tone="info"` med tidspunkt, «Hent tilbake» —
snooze skjuler aldri) · sender · feilet · tom kolonne (`EmptyState`: «Ingenting venter på deg.
Køen er tom.» — tom kø skrives som god nyhet).

### Datakontrakt

`PlanAction` — ikke `CoachingTask`. Den finnes allerede med `suggestion` (Json), `status`,
`agentName`, `coachId`, `provenance` og riktig indeks. Trengs: `actionType` utvides med
`SESSION_FOLLOWUP`, og to felt legges til:

```prisma
sjekkpunkt  String?   // teksten som blir neste FØR-korts sjekkpunkt
fangstId    String?   // hvilken fangst forslaget kom fra
```

`suggestion`-blobben valideres med zod ved lesing. `as unknown as T` er forbudt (invariant 6).
Schema-endringen er additiv og kjøres med kirurgisk `db execute` — ikke `migrate dev`,
ikke `db push`.

---

## 5 · Nye komponenter denne leveransen krever

Tre stykker. Ingen av dem finnes i noen mappe i dag — verifisert mot hele `components/`.
Hver følger filtrippelen `.jsx` + `.d.ts` + `.prompt.md` + `<navn>.card.html` med `@dsCard`.

### `OpptakKnapp` — `components/actions/OpptakKnapp.jsx` · `.akhq-opk`

96 px sirkel. Skjermens ene oransje ting, og derfor **aldri sammen med `OneThingNow` eller
`FAB`** på samme skjerm — to oransje konkurrerer, og da er ingen av dem den ene.

- Klar: `--accent`-ring 3 px, `--surface`-fyll, 28 px prikk i `--accent`.
- Tar opp: fylt `--accent`, hvit firkant (stopp) 24 px. Dette er **den ene** fylte
  aksentflaten utenfor marketing/innlogging, og trenger eiers ja: `--on-accent #141413` er
  tekstfargen som er definert for den situasjonen.
- Pulsen (2 s, `--ease`) hoppes over ved `prefers-reduced-motion`.
- `aria-label` alltid satt: «Start opptak» / «Stopp opptak». Ikke bare ikon.
- `min-height: max(96px, var(--floor))`.

Underklasser: `-ring`, `-kjerne`, `-puls`. Modifikator: `--tar-opp`, `--pause`.

### `OpptakTid` — `components/data/OpptakTid.jsx` · `.akhq-otid`

`mm:ss`, mono, `font-variant-numeric: tabular-nums`, `clamp(28px, 8cqi, 34px)`, `--fg`.
`role="timer"` + `aria-live="off"` (et sekundvis oppdatert felt som leses høyt, er ubrukelig).
Over 59:59 → `h:mm:ss`. Ingen farge, ingen tone — tid er ikke et utfall.

### `LagringsStatus` — `components/feedback/LagringsStatus.jsx` · `.akhq-lagr`

Tre tilstander, aldri slått sammen: `lokalt` · `lastet-opp` · `kø`. 6 px ◆ + tekst 12,5 px
`--muted`. `role="status"`, `aria-live="polite"`. Prikken bærer fargen (`--fg` / `--up` /
`--info`), aldri flaten — samme prinsipp som `Toast`. Antall ventende biter i mono.
**Ingen `--dn`:** manglende dekning er normaltilstand på rangen, ikke en feil.

---

## 6 · Rekkefølge for den som koder

1. `LydSamtykke` + server-gating. Uten den er UNDER ulovlig å bygge, ikke bare uferdig.
   Avhenger av at DKIM/Resend virker.
2. IndexedDB-køen i fangst. **Høyest teknisk risiko i hele leveransen** — alt annet er skjermer,
   dette er data som forsvinner hvis det er feil.
3. `PlanAction` + de to feltene + `SESSION_FOLLOWUP`.
4. ETTER-kortet. Bruker bare komponenter som finnes i bundelen i dag.
5. FØR-kortet.
6. De tre nye komponentene, og først da UNDER-skjermen.

ETTER før UNDER er ikke en forglemmelse: godkjenningskortet avgjør datamodellen alt annet henger
på, og det er den eneste av de tre som kan bygges uten ny komponent.

---

## 7 · Hva denne fila ikke gjør

- **Melder ikke P7.** Ingen av de tre skjermene er craft-vurdert mot
  `uploads/agencyos-dashboard-claude-paper.html`. Det er eiers.
- **Flytter ikke dekningen.** 8/223 · 90/151 står uendret.
- **Rører ikke** `kart/wf/`, TimeGrid, de 47 foreldreløse komponentene, de ni **[natt]**-
  beslutningene, K2, `BarnProgresjonKort`, `DeltakerListe`, `FokusSpillerBlokk`.
- **Bygger ikke** noen av de fem ukompilerte komponentene inn i en skjerm.
