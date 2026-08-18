> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

# Nattordre til Grok — fullfør skjermporten

**Skrevet:** 06.08.2026 kveld · **Gjelder:** natten 06.–07.08.2026
**Erstatter ikke** `GROK-BUILD-BRIEF.md` — utvider den. Ved konflikt vinner dette dokumentet
for natten, `CLAUDE.md` og `.claude/rules/` vinner alltid over begge.

---

## 0. Det viktigste først — les dette to ganger

**Du skal bygge alt. Du skal IKKE merge noe.**

Alle PR-er du åpner i natt er **draft** og blir liggende til Anders har sett dem i morgen tidlig.
Dette er ikke en formalitet — det er den ene regelen som ble brutt 06.08 formiddag, og resultatet
var 34 skjermer merget til `main` på under 3 timer uten at et eneste skjermbilde ble tatt.
Én av dem (`/portal/meg`) rendret i full skjermbredde på desktop i stedet for smal kolonne, og
feilen ble først oppdaget da Anders tilfeldigvis åpnet siden på PC-en sin. Det er nøyaktig den
typen feil «bygg fort, sjekk siden» produserer.

Regelen for natten:
1. **Aldri `git push` til `main`.** Uansett hvor triviell endringen er.
2. **Aldri merge din egen PR.** Ikke engang en du er sikker på.
3. **Alle PR-er = draft**, med skjermbilder i beskrivelsen som bevis.
4. Er du i tvil om et designvalg: **bygg det ikke**. Skriv det i `AAPNE-SPORSMAL.md`
   (se §7) og gå videre til neste skjerm. En uløst skjerm er billig; en feil merget skjerm
   koster en runde med opprydding.

Målet i morgen tidlig er at Anders skal kunne bla gjennom skjermbilder i én omgang og si
ja/nei per batch — ikke at koden allerede står i produksjon.

---

## 1. Logo i sidemenyen — det er en ekte feil her, fiks den først

**Dette er PR nummer 1 i natt. Alt annet venter til denne er åpnet.**

### Feilen

`src/components/v2/core.tsx` linje 50, i `LogoAK`:

```tsx
<circle cx="4840" cy="3620" r="310" fill={T.lime}></circle>
```

Prikken i logoen fylles med `T.lime`. Det er det **avviklede** fargesystemet.
`designsystem/paper/guidelines/ak-golf-logo-bruk.md` sier eksplisitt:

> Det gamle AK-fargesystemet (`#005840` mørk grønn, `#D1F843` lime) er **utgått**.
> Logoen kjører nå i Anthropic-paletten.

Logoen rendres i navigasjonsskinnen på **hver eneste innloggede skjerm**
(`shell.tsx` linje 460, `<LogoAK size={26} />`), så feilen er synlig i hele appen.

### Hva som er riktig (fra `ak-golf-logo-bruk.md`, som er fasit)

| Element | Lys flate | Mørk flate (`--rail` #141413) |
|---|---|---|
| Wordmark (bokstavene) | `#141413` | `#FAF9F5` |
| **Prikken** | **`#B85C3D`** (`--accent-fg`) | **`#D97757`** (`--accent`) |

**Hvorfor to ulike prikkfarger:** rå `#D97757` måler 2,96:1 mot `--bg` og 2,69:1 mot `--soft`
— begge under 3:1 og dermed for svak kontrast på lys flate. Derfor `#B85C3D` der.
Dette er målt i guideline-dokumentet, ikke en smaksvurdering. Ikke «forenkle» til én farge.

### Oppgave

1. Rett `LogoAK` slik at prikken bruker aksent-tokenet (ikke `T.lime`), og at den løser seg til
   `#B85C3D` på lys flate og `#D97757` på mørk. Wordmark følger `color`-propen som i dag.
2. Sjekk at logoen i skinnen (`shell.tsx`) faktisk får riktig variant — skinnen er alltid mørk
   (`--rail`), så der skal prikken være `#D97757`.
3. **Ikke** legg inn en ny SVG-fil eller bytt til `<img>`. Den innebygde SVG-en er riktig
   tilnærming (den arver tema); det er kun fargen som er feil.
   Filene i `public/logos/` og `designsystem/paper/assets/` er for andre bruksområder
   (marketing, trykk) — ikke bytt skinnens logo til en av dem.
4. Aksentregelen står ved lag: prikken er det **eneste** stedet aksentfargen brukes utenom
   primærhandling og fokusring. Ikke innfør aksent noe annet sted i skinnen.

**Skjermbilde-bevis:** skinnen i lys OG mørk modus, zoomet nok til at prikkefargen er synlig.

---

## 2. Bredde — desktop, mobil og alt imellom

### Mekanismen finnes allerede (bygget i kveld, PR #370)

`V2Shell` har nå en `bredde`-prop:

```tsx
<V2Shell aktiv="meg" bredde="kolonne" nav={PLAYERHQ_NAV} ...>
```

| Verdi | Effekt | Når |
|---|---|---|
| `"kolonne"` | Sentrerer innholdet: **720px** (PlayerHQ) / **74ch** (AgencyOS) | Standard for de fleste skjermer |
| `"full"` | Ingen begrensning (dagens oppførsel, default) | Kun skjermer som eier sin egen flerkolonne-layout |

Bredde-tallene er låst av Anders 05.08 og står i `monsterdokument-paper.md` §1.

### Hvilken verdi en skjerm skal ha

**Bruk `"kolonne"`** på alt som leses ovenfra og ned: detaljsider, skjemaer, innstillinger,
lister, hjelpesider, kvitteringer. Dette er de aller fleste skjermene.

**Bruk `"full"`** kun når skjermen har en ekte flerkolonne-layout den styrer selv:
- Hjem/`/portal` og konsollen/`/admin/agencyos` (tråd + artefaktpanel)
- Workbench (kalender-rutenett)
- Skjermer med bred `DataTable` som må scrolle horisontalt
- Fullskjerm live-moduser (`(fullscreen)`-rutene)

**Er du i tvil → `"kolonne"`.** Feil retning her (for smal) ser rart ut, men er trygt og
lett å rette. Feil andre vei (full bredde) er nøyaktig Meg-feilen.

### Ferdig i kveld — ikke gjør om igjen

`/portal/meg` + alle 28 undersider har allerede fått `bredde="kolonne"` (PR #370, draft).
Ikke rør de filene.

### Andre brytepunkter (fra `monsterdokument-paper.md` §1)

- **≥1181px:** tre kolonner (skinne 64px + hovedkolonne + artefaktpanel)
- **641–1180px:** skinne + hovedkolonne, artefaktpanel blir bunn-ark
- **≤640px:** mobil — bunnfaner, composer bunnfestet med `env(safe-area-inset-bottom)`
- **Artefaktpanel:** 380px (AgencyOS) / 360px (PlayerHQ)
- Skinnen er **alltid 64px** og alltid mørk

**Skjermbilder skal tas på 390px og 1280px** (skjermbilde-gaten). Har en skjerm en ekte
tre-kolonne-layout, ta gjerne 1440px i tillegg så artefaktpanelet er synlig.

---

## 3. Optimalisert wireframing — jobb etter mønster, ikke etter område

Dette er den viktigste effektivitetsendringen i natt. **Ikke** gå område for område
(PlayerHQ → AgencyOS → marketing). Da hopper du mellom ulike layouter hele tiden og må
ta stilling til det samme spørsmålet på nytt for hver skjerm.

**Gå etter mal-kategori i stedet.** `monsterdokument-paper.md` §5–12 definerer mønstrene.
Bygg alle skjermer med samme mal etter hverandre — da er beslutningen tatt én gang og
gjenbrukt N ganger:

| Rekkefølge | Mal | §  | Typiske komponenter |
|---|---|---|---|
| 1 | **Detaljside** | §12 | `PageHeader` + `Panel` + `KeyValueGrid` |
| 2 | **Liste/tabell** | §9–10 | `DataTable` / `ListRow` + `FilterPills` |
| 3 | **Dashbord** | §11 | `KpiStripe` + `CardGrid` |
| 4 | **Skjema/flerstegsflyt** | §8 | `FormField` + `Stepper` |
| 5 | **Innstillinger** | §12 | `SectionHeader` + `Panel` + rader |

**Grensetestene som avgjør hvilken mal** (siter dem, ikke gjett):
- Bare én verdi per rad → **liste** (`ListRow`), ikke tabell (§9)
- Har raden intern struktur eller fargekodet verdi → **`DataTable`**, ikke `KeyValueGrid` (§12)
- Bytter *hva* du ser → `Tabs`. Bestemmer *hvor mye av det samme* → `FilterPills` (§10)
- Posisjon i en flyt med mening → `Stepper`. Posisjon i et datasett uten mening → `Pagination` (§8)

### Fire ting som sparer tid før du begynner

1. **14 skjermer skal ikke røres i det hele tatt:** `/intern/komponenter/*` (6) og `/demos/*` (5)
   er interne demoer med fiktive data. `/meg`, `/meg/dispatch`, `/meg/morgenbrief` (3) er Anders'
   personlige driftsverktøy, ikke del av produktet. Hopp over alle 14.
2. **`/stats/*` (45 skjermer) skal IKKE portes i natt.** Anders har besluttet (04.08) at
   DataGolf-skjermene skal flyttes inn i PlayerHQ, men omfang og plassering er **ikke avklart**.
   Å porte dem der de står nå er sannsynligvis bortkastet arbeid. Hopp over hele `/stats`.
3. **Alle 93 redirect-stubber er ikke skjermer.** De er 4–20 linjer med `redirect()`.
   Full liste: kjør `node scripts/paper-port-triage.mjs src/app/portal` (og `src/app/admin`).
4. **113 PlayerHQ- og 111 AgencyOS-skjermer bruker allerede v2-komponentene.** De arver Paper-
   paletten automatisk. For de fleste er jobben *kun* å sette riktig `bredde`-prop og verifisere
   — ikke å bygge om skjermen. Ikke rekomponer noe som allerede står riktig.

**Reell arbeidsmengde etter disse fire:** langt nærmere ~200 skjermer enn 362, og de fleste av
dem er en `bredde`-prop + en verifisering.

---

## 3b. Følelsen: appen skal oppleves som Claude desktop/mobil

**Anders' føring:** AK Golf HQ skal føles og se ut som Claude-appen (desktop og mobil) i
interaksjon og opplevelse — ikke som et tradisjonelt dashbord med kort og widgets.

Dette er allerede innebygd i Paper-fasiten — `playerhq-chat-desktop.html` og
`agencyos-konsoll-desktop.html` ER Claude-mønsteret. Bygg mot dem, så følger følelsen med.
Konkret betyr det:

**Skallet (samme som Claude Code / Claude desktop):**
- Smal mørk skinne til venstre (64px), aldri en bred sidemeny med tekstlenker
- Én rolig midtkolonne som leses ovenfra og ned (720px / 74ch) — ikke et rutenett av bokser
- Artefaktpanel til høyre (360/380px) som viser «tingen vi snakker om» — plan, økt, rapport
- **Composer festet nederst**, alltid tilgjengelig, aldri i scroll-flyten
- På mobil: bunnfaner + composer rett over dem, artefaktet blir bunn-ark

**Interaksjonen:**
- **Samtale først, skjema sist.** Brukeren skal kunne skrive/si hva de vil, ikke lete i menyer.
- **Artefakt, ikke ny side.** «Lag en økt» åpner et kort i panelet — ikke en ny rute med
  tilbakeknapp. Dette er `FASE-1.md` beslutning 3 og er bindende.
- **Én ting nå.** Maks én oransje handling synlig per skjermtilstand. Alt annet er blekk.
  Dette er Claudes «ett tydelig neste steg»-følelse, oversatt til dette produktet.
- **Systemet snakker uoppfordret når det har noe å si** («Dagens økt starter om 40 min»),
  men avbryter aldri med modaler.
- **Vis arbeidet.** AI-svar viser arbeidslinjer (hva ble slått opp, hvor lang tid) og en
  `<details>` «Hvorfor dette tallet» — samme åpenhet som Claude viser verktøybruk.
  Dette er påkrevd på alle AI-svar (`FASE-1.md` §2).

**Roen (det som skiller Claude fra et typisk SaaS-dashbord):**
- Papirfarget flate, ikke hvitt-på-blått. Lora til prosa, Poppins til UI, mono til tall.
- Ingen dekorativ farge. Ingen fargede badges for status. Ingen emoji.
- Rikelig luft. Én ting av gangen. Aldri fem konkurrerende CTA-er.
- Bevegelse kun der den forklarer noe (ark som glir opp, svar som strømmer inn) —
  aldri animasjon som pynt.

**Test på hver skjerm før du tar skjermbildet:** ser dette ut som noe Anthropic kunne sendt,
eller ser det ut som et admin-panel? Er svaret nummer to, sjekk mot fasiten på nytt.

---

## 4. Skjermer som skal slås sammen — men IKKE i natt uten videre

Jeg har lest alle 362 skjermbeskrivelsene og funnet reelle dubletter. **De fleste av disse
krever en produktbeslutning fra Anders og skal derfor IKKE bygges i natt.** De står her så du
ikke bruker natten på å porte to skjermer som skal bli én.

### 4a. Allerede besluttet av Anders — kan bygges i natt

Disse er vedtatt tidligere og aldri gjennomført. Bygg dem, men **én PR hver**:

| Vedtak | Dato | Hva som skal skje |
|---|---|---|
| `/portal/gjennomfore` utgår | 05.08 | Blir redirect til `/portal` |
| Økt-detalj slås sammen | 05.08 | `/portal/gjennomfore/[id]` + `/portal/tren/[sessionId]/planlagt` → én skjerm med planlagt/fullført-tilstand |
| `/portal/planlegge/bygger` utgår | 05.08 | Chat + Workbench dekker planbygging |

### 4b. Nesten sikre dubletter — SPØR, ikke bygg

Skriv disse i `AAPNE-SPORSMAL.md`, ikke rør dem:

- `/portal/mal/bygger` vs `/portal/ai/mal-bygger` — begge «lag mål med AI-veiviser»
- `/portal/drills` vs `/portal/coach/ovelser` — samme øvelsesbibliotek
- `/portal/coach/melding/*` vs `/portal/coach/sporsmal/*` — to parallelle meldingssystemer
- `/portal/utviklingsplan` vs `/portal/talent/min-plan` + `/talent/roadmap`
- `/turneringer` vs `/stats/turneringer` — to turneringslister på marketing
- `/admin/klubb/innstillinger` vs `/admin/settings`
- `/admin/turnering-kart` vs `/admin/tournaments`
- `/admin/agencyos/uka` vs `/admin/kalender`
- `/admin/teknisk-plan` vs `/admin/plans`

### 4c. Den store: 8 AgencyOS-flater sier alle «her er det som venter på deg»

`innboks` · `innboks-epost` · `varsler` · `queue` · `handlingssenter` · `godkjenninger` ·
`workspace/tildelt-meg` · `foresporsler`

Dette er skinnens «Kø»-hub som ikke er én hub ennå. **Rør ikke** — dette er en IA-beslutning
Anders må ta, ikke en portingsjobb.

### 4d. Ikke lag egne wireframes for disse

`/portal/meg/innstillinger/okter`, `/portal/meg/innstillinger/ai-coach` og `/auth/bankid`
er «kommer snart»-plassholdere. Bruk **ett** felles «kommer snart»-mønster
(`Banner tone="info"` per §12), ikke tre bespoke skjermer.

---

## 4b. To tekniske oppgaver i tillegg til skjermene

Disse kommer fra `docs/port/LANSERINGSGAP-2026-08-06.md` og er mekaniske — mønsteret finnes
allerede i koden. Ta dem **etter** logo-PR-en, men gjerne før skjermarbeidet hvis du vil ha
noe lavrisiko å varme opp på. **Én PR hver, draft som alt annet.**

### Oppgave A — rate limiting på de resterende API-rutene

**Situasjon:** 12 av 57 ruter under `src/app/api/` har rate limiting. 45 mangler det.

**Mønsteret finnes:** `src/lib/rate-limit.ts` (Upstash Redis). Se hvordan
`src/app/api/caddie/chat/route.ts` og `src/app/api/admin/coach-ai/route.ts` bruker det.

**Gjør:**
1. Kartlegg hvilke ruter som mangler (`grep -rL "rate-limit\|rateLimit" src/app/api --include="route.ts"`)
2. Legg på samme mønster. Velg grense etter hva ruten gjør:
   - Skriver til DB eller kaller eksternt API → streng grense
   - Ren lesing → romsligere
   - Webhooks fra Stripe → **ikke rør**, de har egen signaturvalidering og skal ikke rate-limites
3. `npm run verify && npm test` grønt

**Ikke gjør:** ikke endre `src/lib/rate-limit.ts` selv, ikke installer nye pakker, ikke rør
webhook-ruter (`/api/stripe/webhook`, andre innkommende webhooks).

### Oppgave B — bredde-gate i CI

**Situasjon:** `monsterdokument-paper.md` §1 låser kolonnebredde, men ingenting sjekker det.
Derfor kunne 280 sider mangle den uten at noen merket det.

**Gjør:** utvid `scripts/check-token-gap.mjs` (eller lag et søsterskript kalt fra samme sted i
`verify`) som **feiler** når en fil rendrer `<V2Shell` uten en eksplisitt `bredde`-prop.

Krav til skriptet:
- Meldingen skal si hvilken fil og hva som må gjøres — ikke bare «feil»
- Skal kunne kjøres alene (`node scripts/<navn>.mjs`) og gi 0 ved suksess
- **Kjør det på hele repoet før du committer** — finner du flere filer som mangler propen enn
  du rekker å rette, ikke koble gaten inn i `verify` ennå. Da leverer du skriptet + en liste
  over gjenstående filer i nattrapporten, og lar `verify` være urørt. **En rød hovedgren er
  verre enn en manglende gate.**

---

## 5. Arbeidsflyt per skjerm (følges nøyaktig)

```bash
git checkout main && git pull origin main
git checkout -b feature/paper-<kortnavn>
# ... bygg ÉN skjerm ...
npm run verify && npm test        # begge grønt, ellers ikke commit
node scripts/check-token-gap.mjs  # ingen hardkodet hex/px
git add <kun filene for denne skjermen>
git commit -m "fix(<omrade>): port <rute> til Paper-fasit"
git push -u origin feature/paper-<kortnavn>
# → åpne PR som DRAFT
```

**Miljø:** trenger `prisma generate` en DB-URL, sett en **dummy** i skallet
(`export DIRECT_URL=postgresql://dummy:dummy@localhost:5432/dummy`) — aldri kopier `.env*`,
aldri les innholdet, aldri lim det noe sted. Se `.claude/rules/gotchas.md`.

### ⚠ CI er upålitelig akkurat nå — lokal verifisering er eneste sikre gate

Verifisert 06.08 kveld: GitHub Actions plukker ikke opp jobber. En manuelt trigget kjøring på
PR #370 sto i kø i 15 minutter uten at noen runner tok den, og ble avbrutt (`cancelled`, tom
steg-liste — den startet aldri). `ci.yml` har en kommentar fra 19.07 om samme problem for
push/PR-trigget kjøring.

**Konsekvens for deg i natt:**
- **Lokal `npm run verify && npm test` er ikke en formalitet — det er den ENESTE reelle
  kvalitetssjekken.** Kjør den fullt ut på hver eneste PR. Ikke hopp over `npm test` fordi
  «det er bare en breddeendring».
- **Ikke vent på grønn CI** før du går videre til neste skjerm — den kommer kanskje aldri.
- **Noter CI-status per PR i nattrapporten:** «CI kjørte grønt» / «CI kjørte aldri (runner)» /
  «CI feilet — årsak». Anders må vite hvilke PR-er som kun er lokalverifisert, så han vet hvilke
  som trenger ekstra blikk i morgen. Ikke skriv «verifisert» hvis det kun er lokalt.

**Én skjerm = én branch = én PR.** Ingen «mens jeg var der»-opprydding i andre filer.

### PR-beskrivelsen skal inneholde

```markdown
## Venter på Anders' ja
**Rute:** /portal/... · **Fasit:** <fil> eller <mønsterdokument §N>
**Bredde:** kolonne / full — begrunnelse i én linje

### Skjermbilder
- [ ] 390px lys  - [ ] 390px mørk
- [ ] 1280px lys - [ ] 1280px mørk
(lim inn bildene her)

### Sjekket
- [ ] npm run verify + npm test grønt
- [ ] check-token-gap grønt
- [ ] Maks ÉN oransje handling synlig
- [ ] Logo i skinnen: riktig prikkfarge
- [ ] Norsk bokmål, tekst fra docs/skjermtekst/
```

---

## 6. Harde forbud (fra `CLAUDE.md` + `gotchas.md`)

Aldri:
- Push til `main` · merge egen PR · force-push · slette remote-grener
- Røre `.env*`, `prisma/schema.prisma`, `src/lib/env.ts`, `vercel.json`, `.github/workflows/*`
- Kjøre `prisma migrate dev`, `prisma db push`, `prisma migrate deploy` (alle tre er ødelagte
  i dette repoet — se `gotchas.md` §Schema-endringer)
- `vercel deploy --prod`
- Installere nye npm-pakker
- Emoji i UI (kun Lucide-ikoner)
- `as unknown as T` for forretningskritiske data
- Sperre-tekst («du kan ikke...») — anbefalinger sperrer aldri (invariant 1)
- `className="dark"` — `data-v2-tema` er eneste tema-mekanisme
- `accent` som tekstfarge på `primary` (usynlig i mørkt tema — bruk `-foreground`-paret)

---

## 7. Når du blir usikker

Opprett/oppdater `docs/port/AAPNE-SPORSMAL.md` med:

```markdown
## <rute>
**Spørsmål:** <hva du ikke vet>
**Hvorfor det blokkerer:** <én setning>
**Mitt forslag:** <hva du ville gjort, hvis du har et>
```

Deretter **gå videre til neste skjerm**. Ikke gjett, ikke bygg en ny komponent på egen hånd,
ikke improviser et mønster mønsterdokumentet ikke dekker.

Kjente åpne punkter du IKKE skal prøve å løse i natt:
- Testprotokoller 20 vs 21 vs 25 (blokkerer testbatteriet)
- DataGolf-plassering (blokkerer hele `/stats`)
- Chat/meldinger krever nye Prisma-modeller + migrasjon — **egen plan, ikke en skjermjobb**
- Skjemavalidering/lagre-rad er udekket i mønsterdokumentet §8

---

## 8. Rapport til Anders i morgen tidlig

Skriv `docs/port/NATTRAPPORT-2026-08-07.md`:

1. **Bygget:** liste med PR-nummer + rute + bredde-valg
2. **Ikke bygget:** hvilke skjermer, og hvorfor (én linje hver)
3. **Åpne spørsmål:** peker til `AAPNE-SPORSMAL.md`
4. **Feil funnet underveis:** ting som var galt i eksisterende kode
5. **Ærlig status:** hva som gjenstår før lansering — ikke pynt på tallet

**Rapporten skal være til å stole på.** Skriv «ikke verifisert» der du ikke har verifisert.
En rapport som sier «alt ferdig» når det ikke er det, er verre enn ingen rapport — det var
nettopp det som gjorde at Meg-feilen overlevde til produksjon.

---

## 9. Om «lanseringsklar»

Anders' mål er at prosjektet skal være lanseringsklart. Vær ærlig om hva én natt kan levere:

**Kan bli ferdig i natt:** skjermport (bredde, tokens, logo, «Én ting nå»-mønsteret) på de
skjermene som ikke er blokkert av en produktbeslutning.

**Kan IKKE bli ferdig i natt, og skal ikke forsøkes:**
- Skjermbilde-gaten — krever Anders' øyne, det er hele poenget
- De ~12 sammenslåingene i §4b/4c — krever produktbeslutninger
- Chat/meldinger — krever nye databasemodeller
- `/stats`-flyttingen — krever avklaring
- Reell brukertesting, ytelse under last, GDPR-gjennomgang, betalingsflyt ende-til-ende

Skriv derfor i nattrapporten hva som **faktisk** gjenstår. «Lanseringsklar» er Anders' vurdering
å ta når han har sett skjermene — ikke en hake du kan sette selv.
