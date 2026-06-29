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

## Status på denne kjøringen — BASISPASS FERDIG (alle 5 flater)
| Flate | Skjermer | Elementer (P0) | Fil |
|---|--:|--:|---|
| Auth | 11 | 9 (`login` fasit) | `auth.md` / `.json` ✅ |
| Forelder | 12 | skjerm-nivå | `forelder.md` / `.json` ✅ |
| Marketing | 72 (27+45 stats) | 21 (forsiden) | `marketing.md` / `.json` ✅ |
| PlayerHQ | 153 (+3 ghost) | 43 (7 P0-skjermer) | `portal.md` / `.json` ✅ |
| AgencyOS | 146 | 90 (P0 + Innboks/Workbench) | `admin.md` / `.json` ✅ |
| **Sum** | **~394 ruter** | **~163 elementer** | |

- ✅ **`komponenter.md`** — komponentbibliotek (athletic 40 / ui 22 / shared 38) + GAP-analyse + kalender/tidslinje enumerert.
- ✅ **`navigasjon.md`** — IA/sitemap per flate + 8 nøkkelflyt.
- Hver flate har desktop+mobil-note + `layoutArchetype` på hver skjerm (basispass-krav a).
- Element-detalj (knapp-for-knapp) er gjort for P0-skjermene per flate; resten er skjerm-nivå.

## Gjenstår (Alt 3 — full element-detalj, prioritert rekkefølge)
Neste fase tar element-detalj for ALLE skjermer per flate, i rekkefølge:
**Forelder (kvalitetsprøve) → PlayerHQ (153) → AgencyOS (146) → resten av Marketing.**
Hver skjerm spores page→klient-komponent og hvert element får `fil:linje` eller `UVERIFISERT`.

## Lesehjelp
- `<flate>.md` — menneskelesbare tabeller (skjermer + elementer).
- `<flate>.json` — maskinlesbar speiling (skjema i prompten).
- `navigasjon.md` — IA/sitemap + nøkkelflyt-diagrammer (gjenstår til flatene er kartlagt).
- `komponenter.md` — bibliotek + gap.
