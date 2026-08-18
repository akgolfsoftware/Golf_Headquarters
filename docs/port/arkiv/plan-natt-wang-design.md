> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

# Nattplan — WANG-design, 10.–11. august 2026

Autonom økt med auto-godkjenning. Mål satt av Anders: **kunne legge inn den faktiske
årsplanen for trening i morgen tidlig**, med design klart for desktop og mobil.

Plan for selve porten: `docs/port/plan-design-wang-arsplan.md`.
Designprosjekt: Claude Design `3935e216-ee5b-4d83-8fbd-30e0ec5e7d98`.

---

## 0. Premisset som endret planen

**Innleggingsveien finnes allerede og virker.** `/admin/grupper/[id]/workbench` er en
fungerende årsplan-editor:

- `PeriodePalett` med sju typer: `GRUNN`, `SPESIAL`, `TURNERING`, `TESTUKE`, `FERIE`,
  `TRENINGSSAMLING`, `HELDAGSSAMLING`
- Dra-og-slipp på `WorkbenchAarsplan`-tidslinja
- Lagring via `coachLagreGruppePeriode` → `group_period_blocks`
- «Rull ut til N spillere» → kopierer gruppeplanen til individuelle årsplaner,
  hopper over overlapp uten å overskrive
- `/admin/grupper/[id]/timeplan` og `/arsplan/skoledata` for skoledata

**Konsekvens:** årsplanen kan legges inn i morgen tidlig uavhengig av designarbeidet.
Designet avgjør hvordan elevene *ser* planen, ikke om den kan *legges inn*.

Nattarbeidet er derfor ikke på kritisk vei mot morgenmålet. Det er verdifullt, men
det er ikke det som avgjør om du kommer i gang kl. 07.

---

## 1. Hva som faktisk er mulig i natt

Verifisert i containeren 10.08 kl. 20:

| Kapabilitet | Status | Konsekvens |
|---|---|---|
| `DATABASE_URL` / `DIRECT_URL` | **mangler** | Kan ikke kjøre appen mot ekte data |
| `.env.local` | **finnes ikke** | Skal ikke opprettes — jf. gotchas §«Aldri kopier .env» |
| Chromium + Playwright | **finnes** (`/opt/pw-browsers`) | Kan rendre og skjermbilde statisk HTML |
| `npm run verify` | **mulig** med dummy-env i skallet | Typer, lint, action-auth, bygg |
| `npm test` | **mulig** | 110 enhetstestfiler |
| Claude Design-skriving | **mulig** | Design kan produseres og lastes opp |
| Skjermbilde av kjørende app | **umulig** | Krever DB + innlogget bruker |

**Det som følger av dette:** designet kan bli ferdig og fotografert i natt. Koden kan bli
skrevet og typeverifisert, men **ikke visuelt verifisert mot ekte data**. Den verifikasjonen
må skje mot Vercel-preview i morgen, med deg innlogget.

---

## 2. Kvalitetsgaten i natt

Uendret der den kan holdes, eksplisitt redusert der den ikke kan:

**Holdes fullt ut:**
- `npm run verify && npm test` grønt før hver commit
- Norsk bokmål, Lucide-ikoner, aldri emoji
- Maks én primær handling per skjerm
- Mobil 390px designes først, deretter desktop 1280px
- Alle fire tilstander designes: Suksess · Tom · Laster · Feil
- Ingen direkte `prisma`-import i WANG-flaten (§8 i porteringsplanen)
- Ingen mørk modus — `.wang-tp` er enpalett
- `minWidth: 0` på hver grid/flex-beholder med lang tekst (gotcha 10.08)

**Kan ikke holdes i natt:**
- Klikk-verifisering i kjørende app
- Skjermbilde av ekte skjerm med ekte data

**Erstatning:** hver ferdig skjerm rendres som statisk HTML i Chromium og fotograferes på
390px og 1280px. Du får en samlet bildeserie å bla gjennom på iPhone i morgen tidlig.

**Skjermbilde-gaten brytes ikke.** Alt arbeid går på
`claude/wang-toppidrett-arsplan-rci1up`, PR #393 forblir **draft**, og ingenting merges til
main. Auto-godkjenning gjelder min arbeidssløyfe — ikke porten til main.

---

## 3. Nattens rekkefølge

Sortert slik at det mest verdifulle er ferdig først, i tilfelle natten tar slutt før planen.

### Fase 1 — Innleggings-beredskap (~30 min, høyest prioritet)

Målet ditt er å legge inn planen kl. 07. Denne fasen sikrer det.

1. Les gjennom innleggingsveien i kode og skriv **`docs/wang-arsplan-innlegging.md`**:
   en konkret oppskrift — hvilken URL, hvilke sju periodetyper betyr hva, hvordan
   «rull ut» oppfører seg, hva som skjer med overlapp.
2. Kartlegg hva `GroupPeriodBlock` **ikke** kan lagre i dag (mål, tester, pyramidefordeling,
   IUP), slik at du vet hva du må notere utenfor systemet i morgen.
3. Ingen kodeendring i denne fasen — den er ren beredskap.

### Fase 2 — Design, skallet (~1 t)

4. **A1 Skall** — header, faner, bunnmeny, hero-kort. Mobil 390 først.
5. **A2 Hjem/I dag** — elevens landingsflate.

Alt annet arver herfra. Disse to designes ferdig og fotograferes før noe annet startes.

### Fase 3 — Design, planen (~3 t)

De fem skjermene som kjører på ekte AgencyOS-data — høyest verdi per skjerm.

6. **A3 Årsplan/sesongoversikt** — helhetsbildet som mangler i dag. Hovedjobben i natt.
7. **A4 Periodedetalj**
8. **A5 Månedskalender**
9. **A6 Ukevisning**
10. **A7 Økt-detalj**

### Fase 4 — Design, resten (~3 t)

11. A8 Turneringer · A13 Tester · A14 Utvikling
12. A9–A12 (skole, samlinger, foreldre) — designes med **tydelig demo-merking**, siden
    dataene ikke finnes.
13. B1–B2 trenerflatene.

### Fase 5 — Kode (resten av natten)

Kun skjermer som **ikke** krever ny datamodell. Rekkefølge: skallet → årsplan → uke →
økt-detalj. Hver skjerm: implementer, `npm run verify && npm test`, commit.

**Stopp-punkt:** kode aldri en skjerm hvis designet ikke er ferdig og fotografert. Halvferdig
design blir halvferdig kode.

---

## 4. Hva du får i morgen tidlig

1. **Oppskrift på innlegging** — så du kommer i gang uten å lete.
2. **Bildeserie av alle designede skjermer**, 390px og 1280px, sendt i samtalen så den er
   synlig fra iPhone.
3. **PR #393 oppdatert** med design + den koden som rakk å bli ferdig, fortsatt draft.
4. **Ærlig statusliste:** hva som er ferdig, hva som ikke rakk, hva som er kodet men ikke
   visuelt verifisert.

---

## 5. Det jeg ikke lover

- **Ikke 16 ferdige skjermer i kode.** Ferdig-definisjonen i porteringsplanen har ti punkter
  per skjerm, og to av dem krever kjørende app med ekte data. Det finnes ikke i natt.
- **Ikke merge til main.** Draft-PR, du bestemmer i morgen.
- **Ikke ny datamodell.** `prisma/schema.prisma` er ask-beskyttet av `beskytt.mjs`, og en
  autonom økt skal ikke røre den. Skjermer som trenger nye felter (mål, tester, pyramide,
  IUP i årsplanen) designes, men kodes ikke.
- **Ikke skoledata/foreldredata som ekte.** De sju demo-flatene forblir merket demo.
