# Delt brief — design-inventar (LES FØRST, hele)

Du er én av flere agenter som kartlegger `akgolf-hq` for et skjerm-for-skjerm redesign. Du skriver ÉN markdown-fil med skjermkort. Du endrer ALDRI kildekode. Du committer IKKE og pusher IKKE.

## Ufravikelig verifiseringsprinsipp
Hver påstand peker på fil/rute/linje, ELLER merkes `UVERIFISERT`. Ikke finn på navn, ruter, tokens, komponenter eller datakilder. **Koden er fasit** — les page.tsx + komponentene den importerer + server-actions/loaders den kaller. Der kode og docs spriker: rapporter hva koden faktisk gjør, med fil:linje.

## Faktagrunnlag (les ved behov, ikke dupliser)
- Token-kilde: `src/app/globals.css` (`.dark`-blokk + `@theme inline`) + `src/lib/design-tokens.ts`. AgencyOS mørk canvas er nær-svart `#0A0B0A` (retunet 2026-06-28), PlayerHQ lyst cream `#FAFAF7`. Lime `#D1F843` = eneste aksent.
- Nav: portal `src/components/portal/{sidebar,bottom-nav,sub-nav}.tsx`; admin `src/components/admin/agencyos-{sidebar,topbar,mobile-nav}.tsx`; forelder `src/components/forelder/sidebar.tsx`.
- Data: `prisma/schema.prisma`. Auth: `src/lib/auth/{getCurrentUser,requirePortalUser}.ts` + `src/proxy.ts`.
- Designprototyper: `.dc.html`-filer i repoet (søk etter matchende navn).

## Skjermkort-mal (bruk EKSAKT dette per skjerm)
```
### [rute]
- Fil:
- Flate:
- Rolle/gating:
- Jobb (1 setning):
- Data vist (felt → kilde):
- Komponenter: (delte/lokale, med filsti)
- Layout og hierarki: (primær CTA, sekundær, nav-plassering, seksjonsrekkefølge)
- Tilstander: loading / empty / error / success / tier-gated — finnes eller MANGLER
- Interaksjoner: (element → handling/destinasjon)
- AK-domene vist: (CS/M/PR/kategori/L-fase/SG/PEI/økt-ID — eller ingen)
- Designfil-referanse: (matchende .dc.html — ellers «ingen prototype»)
- Nåværende designkvalitet: ferdig / halvferdig / stygg / inkonsistent + konkrete problemer
- Redesign-prioritet: P0 / P1 / P2 / P3
```

## Effektivitet (viktig — du har mange ruter)
- Stub/redirect/tynne skjermer: kort kort (3–5 felt holder; marker «stub» + prioritet). Rike skjermer: fullt kort.
- Verifiser ved å åpne page.tsx; for data/komponenter les importene. Ikke gjett — hellere `UVERIFISERT` enn påfunn.
- Marker foreldreløse skjermer (ingen nav lenker dit) når du kan se det.

## Output
Skriv KUN din tildelte fil under `docs/design/`. Start med `# <flate> — skjermkort (kode-verifisert 2026-06-29)` + en kort 2–3 linjers oppsummering (antall ruter, dominerende mønster, største gjeld), så ett kort per rute. Ikke rør andre filer. Ikke commit. Returner en kort oppsummering (antall kort skrevet, største funn) til orkestratoren.
