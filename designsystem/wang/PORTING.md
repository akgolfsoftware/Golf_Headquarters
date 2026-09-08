# PORTING — fra WANG-skjerm til kode

Målgruppe: Claude Code i AK Golf HQ-repoet (`akgolfsoftware/Golf_Headquarters`).
Mønster: `designsystem/train-lock/PORTING.md`. Alt som står der om filhode, verifikasjon og
stopp-regler gjelder også her — dette dokumentet dekker det som er **annerledes for WANG**.

Mål: porten skal være pikselnær mot skjermfilen, ikke «inspirert av». Er koden uenig med
tegningen, er koden feil.

---

## 0 · Regel nummer én

Les den faktiske skjermfilen i `designsystem/wang/`. Ikke skjermbilde, ikke hukommelse.
Hver ramme har inline `style` med eksakte tall. Kopier tallene.

Rekkefølge per skjerm:

1. `SKJERMREGISTER.md` — finn skjerm-ID, designfil, foreslått rute, roller, status.
2. `TILGANGSMATRISE.md` — **før** du skriver en linje UI. Hva rollen ser og ikke ser er
   skjermens viktigste kontrakt, ikke en detalj til slutt.
3. `DATAMODELL.md` — står skjermen som «venter på datamodell», stopp. Ikke improviser felter.
4. Les designfilen. Finn rammen: mobil 390 først, deretter `Desktop 1280`.
5. Sjekk om komponenten finnes i `src/app/team-wang/_components/` fra før. Hvis ja: gjenbruk.

Alle 35 skjermer finnes nå i **begge bredder**. Skjermbilde-gaten krever det, og ingen skjerm
skal merges på én bredde.

---

## 1 · Hva blir server, hva må være klient

Bygde ruter i dag: `/team-wang` (fellesside, fire faner), `/team-wang/logg-inn`,
`/team-wang/coach`, `/team-wang/coach/iup/[elevId]`. Komponentene bor i
`src/app/team-wang/_components/` og `_components/arsplan-2026-27/`.

**Server (default — ingen `"use client"`):**

| Hva | Hvorfor |
|---|---|
| `page.tsx` for hver rute | Henter data, avgjør tilgang, sender ferdig serialisert props ned |
| Tilgangssjekken | Rollen leses fra `GroupMember.role` på serveren. En klientsjekk er ingen sjekk. |
| All lesevisning som ikke har interaksjon | Fellessiden, elev-ark (B8), resultatliste (B3), protokoll-detalj (B2), skjermregisterets «kan bygges nå»-rader |
| `loading.tsx` | Se §4 — den kan ALDRI importere fra en `"use client"`-modul |
| Formatering av dato og tall | `Intl.*` med `nb-NO`, på serveren, én gang |

**Klient (`"use client"` — begrunnet per fil):**

| Hva | Hvorfor |
|---|---|
| Fanebytteren på fellessiden | Lokal `useState`, ingen navigasjon |
| `CalendarView` og årshjulet | Måned-/uke-/år-bytte, dagvalg, `ResizeObserver` |
| Testdag-føringen (B1) | Tastaturføring celle for celle + **må virke uten nett** (localStorage-kø) |
| Alle editorer: D1 punktsett, D4 timeplan, D9/D10 plan, B4 ukessammendrag | Skjemastate før lagring |
| Flervalget i elevlista (C1) | Valgt-sett i state, handling på de valgte |
| Post og tråder (D7, D8, D3) | Optimistisk innsending, lesetilstand |
| Segmentbyttere som ikke endrer URL | `.seg` i skjermfilene |

**Regelen:** en klientkomponent skal være det minste bladet som trenger state. Ikke gjør hele
siden til klient fordi én chip er trykkbar. Skolevelgeren i toppen (`.swb`) endrer URL-parameter
— den er en `<Link>`-liste på serveren, ikke en `useState`-dropdown.

---

## 2 · Token-broen

Alt bor under `.wang-tp`-scopet. Wrapperen settes én gang, øverst på `/team-wang`-layouten.
Ingen komponent under den setter farger selv.

- CSS-variabler: `src/styles/wang-tokens.css` — fasit.
- Speil for lesing: `designsystem/wang/tokens/wang-tokens.css` — byte-eksakt kopi. `diff` skal
  være tom. Endrer du en token i speilet, endre den i `src/styles/` i samme PR.
- Ingen hex i komponentkode. Kun `var(--wang-*)`, `var(--tint-*)`, `var(--cat-*)`,
  `var(--neutral-*)`, `var(--text-*)`, `var(--shadow-*)`, `var(--radius-*)`, `var(--space-*)`.

### Designverdi → token

| I skjermfilen | Token |
|---|---|
| `#17446f` navy — hero, primærknapp, aktiv fane | `--wang-navy` |
| `#2e857d` teal — sekundærflate, «pågår» | `--wang-teal` |
| `#226f67` tekst på teal-tint | `--wang-teal-text` |
| `#49ca9f` mint — aksent, progresjon, fokusring | `--wang-mint` / `--focus-ring` |
| `#0d3050` tekst på mint-pille | `--wang-navy-deep-text` |
| `#f4f6f8` sidebakgrunn | `--bg-app` / `--neutral-50` |
| `#ffffff` kortflate | `--surface-card` |
| `rgba(255,255,255,.92)` sticky header | `--surface-header` |
| `#1e293b` / `#475569` brødtekst | `--text-primary` / `--text-secondary` |
| `rgba(255,255,255,.72 / .78 / .85)` på navy-hero | `--text-on-dark-dim` / `--text-on-dark-78` / `--text-on-dark-85` |
| `rgba(255,255,255,.06 / .12)` skillelinje på navy | `--overlay-on-dark-06` / `--overlay-on-dark-12` |
| `#e9edf1` hårstrek i kort | `--border-subtle` |
| `#f47b20` oransje — **konkurranse**, advarsel | `--cat-orange`, tekst `--cat-orange-text` |
| `#7f1975` lilla — **test og prøve** | `--cat-purple` |
| `#d12a5c` rosa — **merkedag**, sperret, mangler | `--cat-pink` |
| `#007db1` blå — **skole og fellesfag** | `--cat-blue`, tekst `--cat-blue-text` |
| `#fcd700` gul — spill-aksen | `--cat-yellow`, tekst `--cat-yellow-text` |
| `#d2d2d2` grå — inaktiv, ikke satt | `--cat-gray` / `--color-disabled` |
| `color-mix(... 9–13%, white)` chip-bakgrunn | `--tint-orange` … `--tint-purple`, `--tint-gray` |
| `border-radius: 26 / 20 / 16 / 999` | `--radius-card` / `--radius-card-sm` / `--radius-input` / `--radius-chip` |
| `0 8px 24px rgba(23,68,111,.08)` | `--shadow-card` |
| `0 4px 14px rgba(23,68,111,.06)` | `--shadow-card-sm` |
| `0 18px 40px rgba(15,23,42,.22)` | `--shadow-hero` |
| Montserrat 700/800 | `--font-brand` |
| Quattrocento Sans 400/700 | `--font-body` |
| 12px / 0.08em / uppercase etikett | `.t-label` (finnes i tokenfila) |
| 140 / 220 / 420 ms + `cubic-bezier(.22,1,.36,1)` | `--dur-fast` / `--dur` / `--dur-slow` + `--ease-out` |
| `scale(.97)` ved trykk | `.wang-pressable` + `--press-scale` |

**Kort har aldri ramme.** Hvit flate, radius, myk navy-tintet skygge — det er hele grepet.
En farget topplinje på et hvitt kort er ikke lov (rettet i fasiten 08.09.2026, tre steder).
Trenger raden en fargekode, bruk `.row-b`-stripen inne i kortet eller en tonet flate, ikke en
kant på kortet.

### Hendelsestypene — fem typer, fem farger

Rettet 08.09.2026. `konkurranse` fantes i designsystemet men var ikke i bruk, så turnering og
test delte lilla, og `hendelse` var oransje i koden mens designsystemet hadde den rosa.

| Type | Farge | Brukes til |
|---|---|---|
| `okt` | teal / mint | Økt, samling, egentrening |
| `konkurranse` | `--cat-orange` | Turnering, konkurranse, tellende runde |
| `prove` | `--cat-purple` | Test, prøve, heldagsprøve, eksamen |
| `skole` | `--cat-blue` | Fellesfag, ferie, planleggingsdag |
| `hendelse` | `--cat-pink` | Merkedag, foreldremøte, avslutning |

Port dette som `EventChipType` med fem varianter. En turnering skal aldri havne på `prove`.

---

## 3 · Komponenter

Skjermene bruker disse fra WANG-designsystemet (`b0c5e2c0`), alle via
`window.WANGTreningsplattformDesignSystem_be77fc.*` i designfilene:

| Komponent | Brukes i |
|---|---|
| `EventChip` | Årsplan, kalender, timeplan, prøveplan, turneringer |
| `IconChip` | Fellesside, inne/ute-kort, tomtilstander |
| `Tabs` | Kalenderens fire visninger, fanebytteren |
| `CalendarView` | Kalenderfanen — måned, uke, år, dagvalg |

I tillegg finnes `komponenter/knapper-og-chips.html` og `komponenter/okt-kort.html` i speilet
som byggeklosser med alle tilstander tegnet.

### Tre familier som IKKE finnes i designsystemet ennå

Skjermene tegner disse **inline** i dag. Det er en midlertidig løsning, ikke et mønster.

| Familie | Hva den er | Tegnet inline i |
|---|---|---|
| **Testresultat med kildelinje** | Måling + verdi + forrige + kildelinje (dato · protokollversjon · hvem målte). Kildelinjen er hele poenget: uten den kan ingen vite om tallet er sammenlignbart. | B1, B3, B8, C5, D1 |
| **Samling med uttak** | Samlingskort + kriterium + tatt ut / ikke tatt ut med grunn + svarstatus per elev. Kriteriet må stå skrevet før navn kan publiseres. | B9, C2, D2 |
| **Turneringsrad** | Turnering + dato + bane + runder + plassering, i samme form enten den er kommende eller gjennomført. Plassering er aldri fargelagt som god eller dårlig. | B7, C4, D5 |

**Bygg disse tre som delte komponenter i `src/app/team-wang/_components/`, ikke kopier dem per
skjerm.** Fem skjermer med fem varianter av kildelinjen er den enkleste måten å miste
TruthLayer-garantien på. Rekkefølge: kildelinjen først (den blokkerer flest skjermer), så
turneringsraden, så uttaket.

---

## 4 · Tom, laster og feil

Alle tre er tegnet per skjerm. Ingen av dem skal improviseres.

**Kjent gotcha, ikke en preferanse:** en `loading.tsx` i dette repoet kan **ALDRI** importere
fra en `"use client"`-modul. Next-grensen gjør at et klientimport i `loading.tsx` river hele
segmentets suspense-grense. Skeletons er derfor **ren markup** — divs med
`background: linear-gradient(...)`, `border-radius`, faste høyder. Ingen hooks, ingen
`framer-motion`, ingen delt `<Skeleton>` fra en klientmodul.

```
src/app/team-wang/<rute>/loading.tsx     ← ren markup, ingen import fra klientmodul
```

- **Laster:** skeleton har formen til innholdet som kommer. Aldri en spinner midt på siden.
  Se `skjermer-batch2/c8-systemtilstander.html`.
- **Feil:** tar én seksjon, ikke hele siden. Raden sier hva som ikke ble hentet og tilbyr
  «Prøv igjen». Resten av siden står urørt.
- **Tom:** hel setning som sier hvorfor den er tom og hva som fyller den. Aldri en tabell med
  kolonneoverskrifter og null rader. Finnes ikke tallet i datamodellen, er svaret tomtilstand
  med hel setning — aldri en plassholderverdi.
- **Uten nett:** kun testdag-føringen (B1) må virke offline. Tallene lagres lokalt og flaten
  sier tydelig at de ikke er sendt.
- **403:** «Denne siden er lukket» + hvem som kan gi tilgang. Aldri en ny innloggingsprompt.

---

## 5 · Regler som gjelder hele flaten

- Norsk bokmål. Du-form til elev og foresatt.
- Ingen emoji. Lucide-ikoner, stroke 2, `currentColor`.
- Én lys palett. Ingen mørk modus på `/team-wang` — tokens finnes i speilet, men
  26.08-beslutningen gjelder ikke denne flaten.
- **Aldri ekte elevnavn** i noen tegning, fixture eller testdata. «Elev 04», «Kandidat B».
- Eksempeldata merkes «eksempel» i UI-teksten.
- **«Vurdering», aldri «karakterer»** — unntatt i D1, der skolens egne karakterer fra vitnemålet
  faktisk inngår. Der er ordet riktig, og bare der.
- Ingen nye designverdier. Trenger du en farge som ikke står i tokenfila: stopp og spør.
- Fellessiden er navnefri med vilje. Se `TILGANGSMATRISE.md`.

---

## 6 · Rekkefølge for en porteringssession

1. Token-broen + de tre manglende komponentfamiliene — én PR, ingen skjermer.
2. Skjermene som står «kan bygges nå» i `SKJERMREGISTER.md`, én PR per familie.
3. Datamodell-avhengige skjermer i rekkefølgen `DATAMODELL.md` angir (skoleregisteret først —
   det låser opp flest).
4. `/team-wang/coach`-flaten helt til slutt: B4 er ikke avgjort (se `APNE-BESLUTNINGER.md`).

Lever alltid: filer endret · hvilke rammer og bredder som er dekket · hva som gjenstår.

---

## 7 · Stopp-regler

Stopp og spør istedenfor å gjette:

- Skjermen står «venter på datamodell» eller «venter på beslutning» i registeret.
- Du er i ferd med å innføre en farge, radius eller avstand som ikke står i tokenfila.
- Du er i ferd med å kopiere kildelinjen, uttaket eller turneringsraden inn i en skjerm i
  stedet for å bruke den delte komponenten.
- Et tall i UI-et finnes ikke i datamodellen.
- Du er i ferd med å legge rollen på brukeren (`UserRole.COACH`) i stedet for på gruppen
  (`GroupMember.role`).
- En skjerm mangler en tilstand koden trenger — den skal **tegnes** først, ikke improviseres.
- **Schema:** `prisma migrate dev`, `db push` og `migrate deploy` er alle blokkert i dette
  repoet. Additive endringer kjøres kirurgisk med `db execute`. Modellene i `DATAMODELL.md` er
  forslag, ikke migrasjoner.
