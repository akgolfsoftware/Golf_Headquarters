# Designregler for diagrammer, lister og bevegelse

Gjelder AgencyOS og PlayerHQ innenfor [gjeldende designautoritet](design-autoritet.md) (Precision Athletics). Dette dokumentet
oppfinner ikke en ny stil; det samler det som er bygget og målt 23.10.2026 (første designrunde,
[logg](../design-audit/2026-10-23-designrunde-1.md)). Farger, hjørner og typografi hentes fra tokens i
`agencyos-ny.css` og `playerhq-ny.css`, ikke fra dette dokumentet.

## Arbeidsmåte for videre UI-arbeid

1. Forstå brukeroppgaven og finn skjermens utkast i `docs/design-system/utkast-*/`.
2. Finn komponenter og regler som kan gjenbrukes (tabellen nederst).
3. Utform endringen med skillen `ak-hq-design` (og `frontend-design` der det er relevant). Skillene styrer
   ikke stilen; Precision Athletics gjør det.
4. Bygg med bibliotekene som allerede er installert og de eksisterende datakontraktene.
5. Gå gjennom endrede filer mot Vercel Web Interface Guidelines
   (`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`).
6. Mål i nettleser: 390, 768 og 1440 px, ingen sidelengs rulling, ingen konsollfeil, tastaturflyt.
7. Oppdater dette dokumentet når en ny, gjenbrukbar beslutning er tatt.

## Diagrammer (Recharts 3)

- Ett spørsmål per diagram. `RundeUtvikling` svarer på «går scoren ned?».
- Bare sammenlignbare data: tellende runder (18 hull eller ukjent hullantall). Det som utelates, står i
  fotnoten under diagrammet («2 ni-hullsrunder er ikke med»).
- Under tre punkter tegnes ingen kurve. Manglende runde er aldri null.
- Rette linjer (`type="linear"`): `monotone` tegner verdier som ikke finnes.
- Samme tall som i diagrammet står som tekst over det («Første 79 · siste 72 · endring −7 slag · beste 71»), og
  flaten har `role="img"` med samme oppsummering. Hover er tillegg, ikke eneste vei.
- Ingen animasjon (`isAnimationActive={false}`): kurven forklarer ingen endring i grensesnittet.
- Høyde 200 px, 240 px fra 1024 px. `ResponsiveContainer` fyller flaten.
- Farger: `var(--graphite-900)` linje, `var(--sand-300)` rutenett, `var(--graphite-600)` aksetekst i mono 11 px.
  Rust er forbeholdt signal og brukes ikke i diagram.
- Kurve for én spiller om gangen. «Hele stallen» blander nivåer og får ingen kurve.

## Lister og sortering

- 41 spillere eller 14 runder er fortsatt kortlister, ikke tabeller. Avansert tabellogikk (TanStack Table)
  innføres først når en liste trenger flere kolonner som skal sorteres samtidig.
- Sortering med tre valg eller færre er knapper i `.chips` med `aria-pressed`, ikke nedtrekk (jf. `Nedtrekk.tsx`).
  Knappene er 44 px høye.
- Standardrekkefølge er «Trenger deg» på Stall. Overskriftens metatekst følger valget («Sortert etter navn»).
- Handicap sorteres lavest først; pluss-handicap er bedre enn scratch (`+1,2` = −1,2); ukjent handicap sist.
  Logikken ligger i `src/lib/admin/stall-sortering.ts` og er testet.
- Gjenstår: valg av sortering og filtre lagres ikke i URL (heller ikke søk og gruppefilter i dag).

## Datoer

- Dags-strenger parses med `Date.UTC`, formateres med `Europe/Oslo` (se `.claude/rules/gotchas.md` §Tid og datoer).
- Ukestart mandag. Datoformat `dd.mm.åååå`, kortform `dd.mm` på akser.
- Datovelger (kalender) er ikke tatt i bruk ennå; se logg for begrunnelse.

## Bevegelse

- Bevegelse forklarer en tilstandsendring eller utelates. Rene CSS-overganger er standard.
- `prefers-reduced-motion: no-preference` er vilkår for all animasjon (som i `agencyos-ny-teknisk.css`).
- Motion (biblioteket) er ikke installert og trengs ikke før en interaksjon ikke lar seg løse med CSS.

## Mobil

- 390 px er ytterkant. `scrollWidth` skal være lik skjermbredden.
- Treffflater minst 44 px. Aksetekst under 12 px bare i mono på diagram.
- Flex/grid-barn med tekst har `min-width: 0` (arvet fra `.agn-s *`).

## Gjenbruk

| Behov | Bruk |
|---|---|
| Side og topp | `Topp`, `Seksjon`, `Tom`, `Feil`, `Laster` fra `components/admin/agencyos-ny/ny` |
| Kort | `.agn-s .kort`, `.undertittel`, `.forklar`, `.kilde` |
| Valgknapper | `.chips` med `aria-pressed` |
| Nedtrekk (fem valg eller flere) | `components/precision/Nedtrekk` |
| Diagram | `RundeUtvikling` som mønster; data bygges i en ren funksjon under `src/lib/admin/` med test |
