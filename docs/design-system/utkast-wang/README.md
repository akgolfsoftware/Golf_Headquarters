# WANG Toppidrett i nytt design: trenerskjermene

Status: **pakke 1 Grunnmur er godkjent 14.10.2026 (Anders: ja til aksefargene). Pakke 2 I dag tegnes.**

Gjelder trenerflaten i `/team-wang` i AK Golf HQ. Claude Design stenger 14.12, så Anders godkjente 14.10 at WANG tegnes i
repoet som HTML-utkast publisert som private Artifacts, samme metode som [PlayerHQ](../utkast-playerhq/README.md).
Anders går gjennom alt samlet til slutt (port 7).

## Rammer

- **Bare WANGs egne farger og skrifter.** Ingen AK-farger: ingen rust `#9B2415`, ingen sand eller grafitt, ingen
  Precision-akser. Kilde for verdiene: `src/styles/wang-tokens.css` og `AKSE_FARGE` i
  `src/app/team-wang/_components/ak-primitiver.tsx`. Skrift: Montserrat (overskrifter, tall) og Quattrocento Sans (brødtekst).
- **To roller: Trener og Sportssjef** (`.claude/rules/beslutninger.md` §WANG I AK GOLF HQ ER BARE FOR SPORTSSJEF OG TRENER,
  bekreftet av Anders 14.10). De ti rollene i `docs/planer/wang-fredrikstad-demoreise-og-produksjonsplan-2026-10-14.md` gjelder ikke her.
- **Menyen:** I dag · Trening · Tester · Konkurranse · Meldinger · Elever, og Administrasjon bare for sportssjef.
- **Fellessiden `/team-wang` holdes utenfor** og endres ikke.
- **Én IUP og ett testbatteri** for AK Golf, WANG og Team Norway (§ÉN IUP OG ETT TESTBATTERI). Kategori A–K erstatter E–A+.
- **Bare syntetiske data.** Elevene er mindreårige: «Elev 04», «Trener 1». Aldri ekte navn.
- Aldri sidelengs rulling. Tekst minst 4,5:1 i kontrast (stor tekst 3:1).

## Aksefargene (godkjent av Anders 14.10.2026)

| Akse | Farge | Søyle og prikk | Flate med tekst | Tekst på flaten |
|---|---|---|---|---|
| FYS | Navy | `#17446F` | `#17446F` | hvit |
| TEK | Teal | `#2E857D` | `#226F67` (WANGs `--wang-teal-text`) | hvit |
| SLAG | Oransje | `#F47B20` | `#F47B20` | mørk navy `#0F172A` |
| SPILL | Blå | `#007DB1` | `#007DB1` | hvit |
| TURN | Lilla | `#7F1975` | `#7F1975` | hvit |

Samme valg som koden har i dag (`AKSE_FARGE`, `PY_AXES`). To grep for kontrasten: TEK-flater bruker WANGs mørkere teal,
fordi hvit på `#2E857D` gir 4,4:1. SLAG-flater har mørk tekst, fordi hvit på oransje gir 2,7:1.

**Status bruker andre farger enn aksene:** mint er ok, gul venter, rosa haster eller feil, grå nøytral. Da betyr oransje
alltid SLAG og teal alltid TEK. Koden gjør det ikke i dag (se avvik 3).

## Pakkeplan

| Pakke | Skjermer | Fil | Status | Lenke |
|---|---|---|---|---|
| 1 Grunnmur | Skall og meny (390 og 1280, trener og sportssjef), aksefarger, pyramide, øktkort, ukefordeling, graf, knapper, status, felt | `grunnmur.html` | **Godkjent 14.10** (aksefargene, Anders) | https://claude.ai/artifact/BdfLCP5DzVrK15vEXKYeUt |
| 2 I dag | Dagens økter, det som krever handling, oppmøte på morgentrening, fravær | `idag.html` | | |
| 3 Trening | WANG-42 oversikt (planlagt mot gjennomført 4 uker, etterlevelse, per område og elev), årsplan, periode, måned, uke, økt | `trening.html` | | |
| 4 Tester | Testbatteriet, testdag-føring, resultater per elev, A–K-nivå, fysisk test hver sjette uke | `tester.html` | | |
| 5 Konkurranse | Turneringer, resultater per elev, samlinger med uttak | `konkurranse.html` | | |
| 6 Meldinger | Innboks, gruppeposter, post til én elev (foresatt leser under 18) | `meldinger.html` | | |
| 7 Elever | Elevliste, elevark, IUP-fanen (hentet fra PlayerHQ), fireukerssjekk, forslag til elevens plan | `elever.html` | | |
| 8 Administrasjon | Trenere og roller, samtykke og deling, timeplanføring, opptak (bare sportssjef) | `administrasjon.html` | | |
| 9 Samleside | Alle lenker på én side | `index.html` | | |

Én fil og én PR per pakke. Hver skjerm i 390 og 1280, med tom, laster og feil.
Kilder for innhold: `designsystem/wang/SKJERMREGISTER.md`, `designsystem/wang/TILGANGSMATRISE.md` og vedtakene i
`.claude/rules/beslutninger.md`. WANG og Team Norway foreslår endringer i elevens plan; eleven bestemmer.

## Slik lages en skjerm

1. Ny fil i denne mappen. Mal: `grunnmur.html`.
2. `<link rel="stylesheet" href="felles/wang.css">`, Google Fonts-lenken fra malen, og egen `<style>` bare for det skjermen trenger.
3. Skjermen ligger i `<template id="skjerm"><div class="app" data-fane="trening"><main class="innhold">…</main></div></template>`.
   `felles/wang.js` bygger topplinje, sidemeny, bunnmeny og Mer-arket. Undersider: `data-skall="tilbake" data-tilbake="Elever"`.
4. `<script src="felles/wang.js"></script><script>WANGUtkast.start({ etter: fn, tom: {tittel, tekst, knapp}, laster: '…', feil: '…' })</script>`.
   Flere skjermer i én fil: `WANGUtkast.start({ skjermer: { id: { mal, etter, tom, laster, feil } } })` med velger `data-skjerm` og lenker `data-gaa`.
   Velgerne på siden: `data-bredde` (mob, pc), `data-rolle` (trener, sportssjef), `data-tilstand` (data, tom, laster, feil).
5. Kontroll: `NODE_PATH=<hovedrepo>/node_modules node kilder/sjekk.js $PWD/<fil>.html <ut>` gir skjermbilder,
   måler sidelengs rulling i 390 og 360 px, samler JS-feil og måler kontrasten på all tekst. Se på bildene før publisering.
   Tekst over gradient eller bilde måles ikke automatisk (står som «manuelt»); helteflatens lyseste punkt gir 6,1:1 for hvit tekst.
6. Publiser med Artifact: `file_path` = skjermfila, `root` = denne mappen, `files` = `felles/*` og bildene den bruker.

Bildene i `bilder/` er kopier fra PlayerHQ-utkastene (FYS-bildet er Unsplash, Victor Freitas). Logoene er fra
`designsystem/wang/assets/`.

## Avvik i koden i dag (ikke rettet, bare registrert)

1. **AK-rust i WANG-flaten.** `src/app/team-wang/WangToppidrettPrecisionView.tsx` bruker `#9B2415` fire steder: linje 272
   (lenken «Meld fravær»), 292 (Award-ikonet ved nasjonale fysiske tester), 442 (varselikonet i fraværsdialogen) og 479
   (knappen «Bekreft fravær»). Samme fil bruker også AK sand og grafitt (`#DDD9D1`, `#141413`). Skal bli WANG-tokens:
   rosa for bekreft fravær, navy for vanlige handlinger.
2. **Delte AK-komponenter i WANG.**
   - `src/components/workbench/Trenerforslag.tsx` (brukt i `src/app/team-wang/coach/iup/[elevId]/page.tsx`): grunnstilen
     bruker AK-tokens (`--surface-1`, `--border-default`, `--surface-inverse`, `--text-inverse`, `--type-body-s`).
     WANG-varianten (`wangPanel`, `wangKnapp`) overstyrer bare deler av dem.
   - `src/components/workbench/SamlingsprogramKontroll.tsx` (brukt i `src/app/team-wang/coach/coach-arsplan.tsx`):
     WANG-stilen viser til `--bg-surface`, som ikke finnes i `wang-tokens.css`.
   - `src/components/v2/toppbar-hoyde.ts` (brukt i `coach-arsplan.tsx` og `_components/wang-fellesside.tsx`): ingen farger,
     bare høyden på topplinja. Det er en avhengighet til AKs v2-skall, ikke et fargeavvik.
3. **Status har samme farge som aksene.** `STATUS_FARGE` i `ak-primitiver.tsx` bruker oransje for «På vei» og teal for
   «Nådd», som er SLAG og TEK. Utkastet bruker gul og mint.
4. **Teal og oransje som tekst.** `--wang-teal` på hvitt er 4,4:1 og `--cat-orange` 2,7:1. Koden bruker allerede
   `-text`-variantene der den er riktig; nye skjermer skal gjøre det samme.

## Nytt i utkastet som ikke finnes i `wang-tokens.css`

- `--rosa-tekst: #A81F49`: rosa tekst på rosa tint. WANGs `#D12A5C` gir bare 4,2:1 der. Forslag til nytt token.
