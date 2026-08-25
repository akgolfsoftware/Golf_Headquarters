# D2 — Train-lock-tokens utledet til kode

> **OPPDATERT 25.08.2026 (Anders i økt) — fire av de ti spørsmålene er lukket.**
>
> ⚠ Punkt 1 og 2 under ble OVERSTYRT senere samme dag, i en egen økt. Teksten står
> med gjennomstreking + hva som gjelder nå, slik at ingen agent følger den utgåtte
> varianten. Punkt 3 (skinne 64 vs 232) er IKKE vurdert her — PR #590 er merget med
> rail 232, så de to påstandene spriker. Må avklares før bølge T deler opp porten.
>
> D2 ble bygget uten `docs/natt/D2-UNDERLAG-2026-08-25.md` §5, der Anders allerede hadde
> avgjort tolv punkter. Følgende gjelder nå:
>
> 1. ~~**Mørk som default (spm. 1): JA — men snus sammen med første portede skjerm.**~~
>    **OVERSTYRT SENERE SAMME DAG (Anders i økt): snudd NÅ, ikke ventet på første
>    portede skjerm.** Levert i PR #587 — `src/lib/v2/tema-default.ts` (delt regel) +
>    `layout.tsx` (SSR) + `V2Shell` (rute-veksling). Innvendingen over står likevel som
>    en advarsel: de uportede Paper-skjermene i `/portal` og `/admin` vises nå i sin
>    mørke Paper-variant, og er ikke kjørt gjennom skjermbilde-gaten i mørk.
> 2. ~~**Font (spm. 2): SF Pro i produktet, Poppins på markedssidene.**~~
>    **OVERSTYRT SENERE SAMME DAG (Anders i økt): «behold Poppins».** Poppins / Lora /
>    IBM Plex Mono er appens eneste fonter — også i produktet. Fra Train-lock arves
>    skala, vekter og tracking, ikke familien. `--tl-font-sans` peker på
>    `var(--font-poppins)`, `--tl-font-mono` på `var(--font-ibm-plex-mono)`.
> 3. **Agency-skinne 64 vs 232 (spm. 9): LUKKET — fast 64 px.** Ingen kollapset variant
>    bygges. HANDOFF-en er utdatert på dette punktet.
> 4. **Warn-token (manglet helt):** `#FFD60A` er nå navngitt som `--tl-warn` +
>    `--tl-warn-hair`, per Anders' beslutning om at både varm og gul skulle inn i
>    tabellen. Den lå kun som `--tl-viz-acceptable`, som er en annen rolle.
>
> Spørsmål 3, 4, 5, 6, 7, 8 og 10 (fokus, hover, disabled, lys-variant for warm,
> elevasjon, z-index, store tall) står fortsatt åpne — de er **ikke blokkerende** for
> skjermport og tas når de blir aktuelle.

**Dato:** 25.08.2026 · **Gren:** `claude/train-lock-tokens-bpezan` · **Omfang:** ÉN rad. Ingen skjermport.

Lukker den åpne forutsetningen i CLAUDE.md invariant 2 og `beslutninger.md`
(«Train-lock-tokens er ikke definert i `src/` ennå»).

---

## Hva som ble gjort

| Fil | Endring |
|---|---|
| `src/styles/train-lock-tokens.css` | **NY.** Alle Train-lock-tokens som `--tl-*`. Lys på `:root`, mørk på `html[data-v2-tema="dark"]`. Kun variabeldeklarasjoner. |
| `src/lib/v2/train-lock.ts` | **NY.** TS-speil `TL` + `TL_BREKK`. Peker kun på `var(--tl-*)` — ingen hex, så `check-token-gap` slipper allowlist. |
| `src/app/globals.css` | Én `@import` av tokenfila, ved siden av `paper-tokens.css`. |
| `src/styles/paper-tokens.css` | Kun kommentar: merket **UTGÅENDE**. Ingen verdi rørt. |
| `src/lib/v2/tokens.ts` | Kun kommentar: `T` merket **UTGÅENDE**. Ingen verdi rørt. |

**Null piksler flyttet.** Ingen komponent leser `--tl-*` eller `TL` ennå. Fordi alle
navn er prefikset kolliderer settet ikke med `--p-*`, `--v2-*` eller golfdata-settet.

**Ett sett, ikke to.** `AG-00 LOCK.dc.html` dokumenterer at AgencyOS arver PlayerHQ-
tokenene 1:1 (verifisert token for token). Train-lock er fasit for begge produkter.

---

## Fasit-filene tokenene kom fra

| Kilde | Hva som er hentet |
|---|---|
| `designsystem/train-lock/HANDOFF.md` | Token-tabell mørk + lys, geometri, type, motion, komponentmål, brekkpunkter, viz-utvidelsen 24.08, hullkart-flater, warm `#B85C3D`, utkast-kant. |
| `designsystem/train-lock/TRAIN LOCK.dc.html` | §01 farge (9 mørke ruter med hex under) · §02 typeskala · §03 geometri/press/motion · §04 komponenter · §05 lys variant (9 lyse ruter). |
| `designsystem/train-lock/TRAIN VIZ.dc.html` | Viz-lås V1–V9: opasitetstrinn, ellipse, prikker, «én farge: hvit på sort». |
| `designsystem/train-lock/AG-00 LOCK.dc.html` | AgencyOS: samme tokens mørk + lys, samme typeskala. |
| `designsystem/train-lock/AX-01 Skall rail og tabbar.dc.html` | Skall/rail, scene `#000`, warm prikk `#B85C3D`, caps-bruk i toppen. |
| `A-16 / A-17 / AG-01 Cockpit lys` | Lys-verdier verifisert i faktiske lys-skjermer (grabber `#C7C7CC`, utkast-kant `#0000003D`). |

Alle verdier er lest ut av filene i denne økten. Ingen verdi er skrevet fra hukommelse.

---

## Tokenene som er utledet

**Farge — mørk (fasitens default) / lys**

`scene` #000000/#FFFFFF · `elev` #161616/#F2F2F2 · `dock` #1C1C1E/#E9E9EB ·
`hair` #FFFFFF14/#00000014 · `dim` #2C2C2E/#DDDDDE · `text` #F5F5F5/#111111 ·
`mute` #8E8E93/#6E6E73 · `fill`/`on-fill` #FFFFFF på #000000 / #000000 på #FFFFFF ·
`avatar` #B08968 med tekst #201409 (uendret) · `warm` #B85C3D ·
`danger` #FF453A/#FF3B30 · `ok` #30D158/#34C759 ·
`draft-border` #FFFFFF3D/#0000003D · `grabber` #3A3A3C/#C7C7CC.

Reglene følger med verdiene, i kommentarene: én hvit (lys: sort) primær CTA per skjerm ·
fullført = `warm` + hake, **aldri grønn** · `ok` bare «godkjent av coach» (Godta,
PUBLISERT) · `danger` bare feiltilstander · opaque material, ingen backdrop-filter ·
ingen gradient utenom `repeating-linear-gradient` som timeline-hairline.

**Geometri** — radius kort 20 · pille/dock/CTA 999 · skinne-rad 12 · felt 16 ·
ark 20 20 0 0. Loft 8/12/16/20. Hit ≥44, CTA 48, fangst-mic 60. Dock 358×64,
padding 8/10, 12 pt over home indicator. Rail Mac 64 (Agency) / 72 (Player),
skinne iPad 250, artefakt-panel 380, kilder-kolonne 220.

**Type** — 34/700 (−0.02em) · 26/700 (−0.01em) · 16/700 CTA · 15/600 kropp ·
13/400 meta · 11/600 caps (tracking 0.08em) · 9/600 caps-sm (0.06em) ·
store tall 56–104/700. Dynamic Type XL: 40/31/19/18/16/13. tabular-nums på alle tall.

**Motion** — easing `cubic-bezier(0.32, 0.72, 0, 1)` · press 0.97 / 180 ms ·
dock-aktiv 380 ms (0.9→1.05→1) · ark 440 ms · kort 520 ms med Y18 + stagger 70 ms ·
reduced-motion kryss-fade 180 ms · scrim `rgba(0,0,0,0.55)`.

**Tilstand som opasitet** (fasiten fargekoder aldri tilstand): negativ 0.4 ·
outlier/negativt tall 0.45 · muted rad / opptatt celle 0.5 · sekundær kø-rad 0.55.

**Viz** — target #0A84FF · good #30D158 · acceptable #FFD60A · disaster #FF453A
(KUN dispersion-bøtter, mållinje og publisert-merke) · prikk #B08968 ·
1σ-ellipse #FFFFFF29 linje / #FFFFFF08 fyll · hullkart-flater #111111 / #141414 /
#1A1A1A / #202020 / #171717 / #2A2A2A / #2C2C2E.

**Brekkpunkter** (`TL_BREKK`) — compact 390 · iPad smal 768 · iPad regular 1180 ·
Agency Mac-rail fra 1101 · Mac 1440. Chrome følger vindusbredden, aldri enheten.

---

## Verifisering

```
npx tsc --noEmit     → 0 feil
npm run lint         → 0 errors (81 warnings, alle forhåndseksisterende)
node scripts/check-token-gap.mjs → grønn
```

`npm ci` måtte kjøres først — cloud-utsjekken kom uten `node_modules`.
`DIRECT_URL` ble satt som dummy KUN i skallet for kommandoen. Ingen `.env`-fil rørt.

---

## Det som IKKE lot seg utlede — spørsmål til Anders

1. ~~**Mørk som default.**~~ **BESVART 25.08.2026 (Anders, i økt): JA — `/portal` og
   `/admin` er snudd til mørk default.** Regelen bor nå i `src/lib/v2/tema-default.ts`
   (`onsketTema`), som både rot-layout (SSR) og `V2Shell` (rute-veksling) kaller — den
   var duplisert i to filer før. Bryteren vinner fortsatt: `ak-v2-tema`-cookien
   overstyrer defaulten begge veier. Uendret: `/auth` er lys (låst PP-A/A4),
   `/forelder` er lys (omfang uavklart, T4), landingssidene alltid lyse.
   Tokenene ligger som før lys på `:root` / mørk på `[data-v2-tema="dark"]` — det er
   defaulten som er snudd, ikke mekanismen. Låst av
   `src/lib/__tests__/tema-default.test.ts`.

2. ~~**Font.**~~ **BESVART 25.08.2026 (Anders, i økt): POPPINS BEHOLDES.** Fasitens
   «SF Pro Display/Text» tas ikke i bruk — Poppins / Lora / IBM Plex Mono er appens
   eneste fonter, også i produktet (CLAUDE.md §Stack står uendret). Fra Train-lock
   arves **skala, vekter og tracking** (34/700 · 26/700 · 16/700 · 15/600 · 13/400 ·
   11/600 caps 0.08em), ikke familien. `--tl-font-sans` peker nå på
   `var(--font-poppins)` og `--tl-font-mono` på `var(--font-ibm-plex-mono)`, med
   samme fallback-kjeder som `--font-sans`/`--font-mono` i `globals.css`. Ikke
   gjeninnfør en fjerde font. Dette var den eneste harde konflikten mellom fasiten
   og den låste stacken — den er lukket.

3. **Fokus-tilstand finnes ikke i fasiten.** Null `:focus`, `outline` eller
   fokusring i noen av de 177 designfilene — designet er tegnet touch-først. Vi trenger en
   synlig tastaturfokus for tilgjengelighet. Ingen token er oppfunnet her.
   **Hvilken fokusmarkering?** (Nærmeste fasit-mønster er ringen fra profilsirkelen:
   2 px gap + 2.5 px `fill` — den ville fungert som fokusring i begge varianter.)

4. **Hover er nesten ikke tegnet.** Eneste hover i fasiten er `a:hover` (tekst → `fill`),
   utledet som `--tl-text-hover`. Ingen hover på kort, rader eller knapper.
   **Trenger desktop-flatene (AgencyOS Mac) en hover-tilstand — og hvilken?**

5. **Disabled har ingen egen token.** Fasiten viser sperret handling som `dock`-flate
   (#1C1C1E) + `mute` tekst + caps-forklaring (JV «STENGT», WB sperret Publiser),
   altså komponert av eksisterende tokens. Det er dokumentert i kommentarene, men
   det finnes ingen generell disabled-opasitet. **OK, eller skal vi ha én?**

6. **Lys-variant mangler for tre ting:** warm-haken (`#B85C3D` antatt uendret — samme
   som Paper sin `--p-logo-dot`), 1σ-ellipsen (speilet til `#00000029`/`#00000008`
   som plassholder), og hullkartet (står med mørke flater i begge varianter).
   **Skal disse tegnes i lys, eller er antakelsene riktige?**

7. **Elevasjon/skygge finnes ikke.** Alle `box-shadow` i dc-filene er enten
   mockup-rammen rundt telefonen/skjermen eller en ring (profilsirkel, «i dag»-prikk).
   Kort løftes med flate (`elev`), ikke med skygge. Ingen shadow-token er laget —
   bekreft at det er riktig lest.

8. **Z-index-skala mangler.** Fasiten definerer ingen (Paper har `--p-z-*`).
   Ark/scrim/dock-lagene må få en skala når første skjerm portes. Dessuten:
   `--ak-topbar-h` og `--ak-cookie-h` (gotchas.md) er app-mekanikk uten motpart i
   fasiten — de må overleve porten.

9. **Agency-skinne 64 vs 232 er UAVKLART i HANDOFF selv** (linje 355, radius-passet
   24.08). `--tl-rail-mac` står på 64 fordi §Meny per enhet sier «rail 64».

10. **Store tall er et intervall (56–104), ikke en skala.** Begge endene er tokens
    (`--tl-text-num-min/max`); hvilket trinn hver skjerm bruker avgjøres i skjerm-PR-en.

---

## Anti-scope holdt

Ingen skjerm portet · ingen komponent, side eller rute rørt · ingen Paper-token
slettet eller endret (kun merket utgående) · ingen DB-endring · ingen ny avhengighet.
