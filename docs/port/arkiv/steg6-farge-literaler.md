> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

# Steg 6 — fargeliteraler ut av inline style

**Utført:** 03.08.2026 · **Endrer null piksler.** Dette er en ren navngiving, ikke en designendring.

---

## Hva ble gjort

136 unike hardkodede fargeverdier i `style={{}}` (410 forekomster, 130 filer — målt på
gjeldende `main`, litt lavere enn fase4s 139/419/132 fordi koden har beveget seg noe siden
02.08) fikk hver sin faste nøkkel under `T.farge.*` i `src/lib/v2/tokens.ts`, og forekomsten i
kildekoden ble erstattet med referansen. **Verdien er en eksakt kopi** av det som sto i JSX før
— ingen hex eller alpha er endret, avrundet eller slått sammen med naboverdier.

Metode: `scripts`-lignende engangsskript (ikke committet, samme mønster som fase4s
`tmp-gap-*.mjs`) som brace-matcher `style={{ … }}`, finner hver streng-literal inni, og:

- Er strengen **kun** fargen (f.eks. `background: "rgba(0,0,0,0.5)"`) → erstattes med
  `T.farge.svartA50` (bar identifier, ingen anførselstegn).
- Er fargen **del av** en sammensatt streng (gradient, `boxShadow` med flere ledd,
  `var(--x, #fallback)`) → streng-literalet konverteres til template literal med
  `${T.farge.xxx}` på riktig plass. Eksempel: `boxShadow: "0 28px 70px rgba(0,0,0,0.55)"` →
  `` boxShadow: `0 28px 70px ${T.farge.svartA55}` ``.

84 filer manglet import av `T` fra før og fikk `import { T } from "@/lib/v2/tokens";` satt inn.
62 av disse hadde `"use client"` som første linje — skriptet satte importen foran direktivet
først (Next.js-feil: direktivet må stå aller først), rettet i etterkant til riktig rekkefølge.
42 filer importerte allerede `T` via en annen sti (typisk `./core` sin re-eksport) og fikk et
duplikat fjernet.

## Hva ble IKKE gjort (bevisst utenfor steg 6)

- **Ingen sammenslåing av nærliggende alpha-verdier.** Fase4 foreslo 7 navngitte alpha-trinn
  som «dekker» flere naboverdier (f.eks. én `T.overlay` for alt fra 0.45 til 0.75). Det er en
  designbeslutning som endrer piksler på et ukjent antall skjermer — den er ikke tatt her.
  135 separate `T.farge.*`-nøkler står igjen som resultat; en senere konsolidering til et
  renere, tema-styrt sett er en egen, eksplisitt Anders-beslutning.
- **Ingen av `T.farge.*`-nøklene er tema-styrte** (samme mønster som `T.tee`/`T.milepael`/
  `T.wrapped` fra før — se `docs/port/steg5-kontroll.md`). De er rene konstanter. Om noen av
  dem egentlig burde variere med lys/mørk er ikke vurdert.
- **§4/§5 i `fase4-token-gap-analyse.md`** (radius/gap/font-synk-tester, CI-lint-gate mot nye
  fargeliteraler, verifisering av font-fallback i nettleser) er ikke rørt. Det er et eget,
  større «bølge 0 ferdig»-sikkerhetsnett, ikke del av «fjern de 419 fargene».
- **E-postmaler** (`src/lib/email/**`) er ikke i skopet i utgangspunktet — de bygger ren
  HTML-streng, ikke `style={{}}` JSX, og treffes ikke av uttrekket.

## Verifisert

`npm run verify` (prisma validate + generate, `tsc --noEmit`, `eslint --quiet src`,
`check-action-auth`, `next build` + `serwist build`) og `npm test` (903 tester) — alle grønne.
Ingen visuell verifisering er gjort (og skal ikke trenges — verdiene er bevist uendret), men
stikkprøve av diffen i `LiveActive.tsx`, `overlays.tsx` og `guardian-consent-banner.tsx` viser
korrekt oversettelse inkl. `var(--x, #fallback)`-mønsteret som fase4 §3b flagget som en felle.
