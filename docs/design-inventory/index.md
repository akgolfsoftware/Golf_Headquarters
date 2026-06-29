# Design-inventar — skjerm- & interaksjons-nivå (kode-verifisert)

> Branch `docs/design-inventory` · READ-ONLY på kildekode · hver påstand har `fil:linje` ellers `UVERIFISERT`.
> Generert 2026-06-29.

## Skjerm-tellinger (verifisert via `find src/app/**/page.tsx`)
| Flate | `page.tsx`-ruter | Fil |
|---|--:|---|
| Marketing (`(marketing)`) | 72 (27 hoved + **45 stats — EGET SPOR**) | `marketing.md` / `.json` |
| PlayerHQ (`/portal` + `(fullscreen)`) | 153 | `portal.md` / `.json` |
| AgencyOS (`/admin`) | 146 | `admin.md` / `.json` |
| Forelder (`/forelder` + `/inviter`) | 11 + 1 | `forelder.md` / `.json` |
| Auth (`/auth`) | 11 | `auth.md` / `.json` ✅ |
| **Sum** | **~422 ruter** | |

Pluss ikke-rute-skjermer (modaler/sheets/wizard-steg/tom-laster-feil-suksess) — talt per skjerm i flate-filene.

## Metodikk (viktig — forklarer hvorfor dette er stort)
1. **Elementene bor sjelden i `page.tsx`.** Sidene er ofte server-komponenter som rendrer ko-lokaliserte
   klient-komponenter (skjemaer, lister, modaler) der knappene/inputene faktisk er. Element-nivå krever
   **page → komponent-sporing** (eks: `auth/login/page.tsx` → `login-form.tsx`).
2. **Hver distinkte UI-tilstand er en «skjerm»:** modal, sheet, drawer, wizard-steg, tom/laster/feil/suksess.
3. **Verifisering:** hvert element/skjerm-felt siterer `fil:linje`. Ikke-verifiserbart = `UVERIFISERT`.
4. **Responsiv:** desktop + mobil-oppførsel noteres per element der koden har breakpoints (`md:`, `lg:`, `max-md:`).

## Status på denne kjøringen
- ✅ **Auth** — komplett (11 skjermer; `login` fullt element-verifisert som format-fasit).
- ✅ **`komponenter.md`** — komponentbibliotek (athletic 40 / ui 22 / shared 38) + GAP-analyse.
- ⏳ **Marketing, PlayerHQ, AgencyOS, Forelder** — gjenstår. Se «Plan» under.

## Plan for de fire store flatene
Marketing (72), PlayerHQ (153) og AgencyOS (146) er for store til å spores skjerm→komponent på element-
nivå i én økt. Anbefalt: **parallelle agenter per flate/seksjon** (egen del-kjøring) som hver skriver
sin `<flate>.md`/`.json` etter samme skjema som `auth.*`. Dette er en stor jobb (mange filer, høyt
token-forbruk) — bør bekreftes før full kjøring. Alternativ: element-nivå kun for P0-skjermer + skjerm-
nivå for resten.

## Lesehjelp
- `<flate>.md` — menneskelesbare tabeller (skjermer + elementer).
- `<flate>.json` — maskinlesbar speiling (skjema i prompten).
- `navigasjon.md` — IA/sitemap + nøkkelflyt-diagrammer (gjenstår til flatene er kartlagt).
- `komponenter.md` — bibliotek + gap.
