> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

# Morgensjekk 07.08.2026 — gjennomgang av Groks nattarbeid

**Mål:** komme gjennom alle draft-PR-ene på 15–20 minutter, ikke én time.
Du ser på skjermbilder og sier ja/nei — du leser ikke kode.

---

## Steg 1 — les rapporten først (2 min)

`docs/port/NATTRAPPORT-2026-08-07.md`

Se spesielt etter:
- Hvor mange PR-er ble åpnet, og hvor mange skjermer de dekker
- **Hvilke PR-er mangler CI-dekning** (CI var upålitelig i kveld — Grok skal ha notert det per PR)
- Åpne spørsmål i `docs/port/AAPNE-SPORSMAL.md`
- Feil Grok fant i eksisterende kode

**Rødt flagg:** står det «alt ferdig» uten forbehold, eller mangler CI-kolonnen — da har
rapporten sannsynligvis ikke blitt skrevet ærlig. Se ekstra nøye på skjermbildene da.

---

## Steg 2 — sjekk at ingenting er merget (30 sek)

```bash
git log --oneline origin/main -15
```

Alle nattens commits skal ligge på `feature/paper-*`-grener, **ingen på `main`**.
Ser du nattarbeid på `main` er gaten brutt igjen — si fra, ikke bygg videre på det.

---

## Steg 3 — logo-PR-en først (2 min)

Dette var PR nr. 1 i nattordren, og den påvirker **hver eneste innloggede skjerm**.

Se på skjermbildet av skinnen:
- [ ] Prikken i logoen er **oransje/terrakotta**, ikke lime-grønn
- [ ] Mørk skinne → prikken er `#D97757`
- [ ] Lys flate (om den vises der) → prikken er `#B85C3D`, ikke samme oransje
- [ ] Bokstavene er uendret

Godkjenn denne først — alle andre skjermbilder vil vise logoen, så feil her sprer seg.

---

## Steg 4 — bla gjennom skjermbildene (10–15 min)

For hver PR, se på de fire bildene (390px lys/mørk, 1280px lys/mørk) og still fire spørsmål:

1. **Bredde:** er innholdet i en rolig midtkolonne på desktop, eller strekker det seg
   ut i full skjermbredde? (Full bredde er kun riktig for Hjem, Konsoll, Workbench,
   brede tabeller og fullskjerm-moduser.)
2. **Én oransje:** tell de oransje handlingene. Er det mer enn én, er det feil.
3. **Mørk modus:** er all tekst lesbar? (Kjent felle: `primary` og `accent` er samme
   lime-farge i mørkt tema → usynlig tekst.)
4. **Følelsen:** ser dette ut som noe Anthropic kunne sendt, eller som et admin-panel?

**Ja/nei per PR.** Er du i tvil på én skjerm — la den ligge og gå videre. Én utsatt skjerm
koster ingenting; én feil merget skjerm koster en opprydding.

---

## Steg 5 — merge de godkjente (2 min)

Merge kun de du faktisk har sett og sagt ja til. De andre blir liggende som draft.

**Merk:** CI kan fortsatt være nede. Er den det, er Vercel-preview-bygget (`Ready` i
PR-kommentaren) det nærmeste du kommer en byggeverifisering. Enhetstestene kjører kanskje
ikke i det hele tatt — det er én grunn til å se ekstra nøye på skjermbildene.

---

## Steg 6 — ta beslutningene som blokkerer videre arbeid (5 min)

Disse står i `AAPNE-SPORSMAL.md` og i nattordren §4. Grok kunne ikke bygge dem uten deg:

**Dubletter — skal de slås sammen?**
- `/portal/mal/bygger` vs `/portal/ai/mal-bygger` (begge «lag mål med AI»)
- `/portal/drills` vs `/portal/coach/ovelser` (samme øvelsesbibliotek)
- `/portal/utviklingsplan` vs `/portal/talent/min-plan` + `/roadmap`
- `/turneringer` vs `/stats/turneringer`
- `/admin/klubb/innstillinger` vs `/admin/settings`
- `/admin/turnering-kart` vs `/admin/tournaments`
- `/admin/agencyos/uka` vs `/admin/kalender`
- `/admin/teknisk-plan` vs `/admin/plans`

**Den store:** 8 AgencyOS-flater sier alle «her er det som venter på deg» — `innboks`,
`innboks-epost`, `varsler`, `queue`, `handlingssenter`, `godkjenninger`,
`workspace/tildelt-meg`, `foresporsler`. Skal «Kø» i skinnen bli den ene huben?

**Fra før:** testprotokoller 20/21/25 · DataGolf-plassering (blokkerer 45 `/stats`-skjermer) ·
chat/meldinger (krever nye databasemodeller — egen plan, ikke en skjermjobb)

---

## Steg 7 — infrastruktur som må fikses uansett (din side)

- **GitHub Actions plukker ikke opp jobber.** Sjekk Settings → Actions → Runners.
  Uten CI er lokal kjøring eneste gate — det holder ikke på sikt.
- **Branch protection på `main`:** krev godkjenning fra en annen enn PR-åpneren.
  Uten det kan enhver agent self-merge, som skjedde 06.08 med 34 PR-er.

---

## Hva «lanseringsklar» faktisk krever etter denne runden

Skjermporten er én del. Dette står igjen uansett hvor mye Grok rakk i natt:

- [ ] Alle skjermer sett og godkjent av deg (denne runden + de utsatte)
- [ ] Sammenslåingene besluttet og bygget
- [ ] Chat/meldinger bygget (nye Prisma-modeller + migrasjon)
- [ ] `/stats`-flyttingen avklart og gjennomført
- [ ] CI grønt og pålitelig
- [ ] Betalingsflyt testet ende-til-ende mot Stripe
- [ ] GDPR-gjennomgang (samtykke, sletting, mindreårige)
- [ ] Ytelse under last + reell brukertest

Ingen av disse kan hakes av på skjermbilder alene.
