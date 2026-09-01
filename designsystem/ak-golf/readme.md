# AK Golf — merkevaresystem

Fasit for **merket**: logo, farge, typografi, tone, foto, marked og materiell —
for hele konsernet. Låst av Anders 31.08.2026
(`.claude/rules/beslutninger.md` §AK GOLF BLIR PARAPLYMERKE).

**Dette systemet styrer ikke produktskjermene.** PlayerHQ, AgencyOS og Forelder
følger Train-lock (`designsystem/train-lock/`, CLAUDE.md invariant 2).
`/team-norway/*` følger Claw (`designsystem/team-norway/`). Ved konflikt om en
produktskjerm vinner Train-lock; om merket vinner AK Golf; på Team Norways egne
skjermer vinner Claw. **Ingen skjerm har to fasiter.**

## Les i denne rekkefølgen

| Fil | Svarer på |
|---|---|
| `guidelines/01-merket.md` | Hva AK Golf er, løftet, hvem det er til for |
| `guidelines/02-arkitektur.md` | Hvordan de fem virksomhetene henger sammen |
| `guidelines/03-logo.md` | Filer, klaringssone, minstestørrelse, hva som gjenstår |
| `guidelines/04-farge.md` | Paletten, med målte kontrasttall |
| `guidelines/05-typografi.md` | Tre fonter, skala — og mono-regelen |
| `guidelines/06-rom-og-geometri.md` | Romskala, radius, dybde |
| `guidelines/07-foto.md` | Hvordan AK Golf-foto ser ut, og samtykke |
| `guidelines/08-sprak.md` | Tone, skrivemåte, det vi aldri sier |
| `guidelines/09-varianter.md` | Hvordan en virksomhet settes opp |
| `guidelines/10-forbudt.md` | Alt som er forbudt, på én side |
| `guidelines/11-instrumentet.md` | Rutenettet, målestokken, krysset — og regelen som holder dem ærlige |

## Kode

```
tokens/grunnlag.css    minste sett som gjør en flate til AK Golf
tokens/fonter.css      IBM Plex-familien fra Google Fonts
tokens/farge.css       merkefarger + fem varianttoner, alle målt
tokens/type.css        tre roller, ti trinn
tokens/rom.css         4-skala, radius, dybde
tokens/bevegelse.css   fart og kurver
tokens/instrument.css  rutenett, målestokk, kryss
tokens/semantikk.css   rolle-navn (--surface-*, --text-*, --radius-*)
```

Logofilene ligger i `public/logos/` (sju vektorvarianter), ikke her — de er i
drift i appen og skal ha én adresse.

## Grunnlaget

- Merkeplattformen: `docs/merkevare/ak-golf-merkeplattform-2026-08-31.md` (18.1)
- Arbeidet: `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 18
- Grunnpaletten er hentet fra `src/app/globals.css` §`--mk-*`, som er i drift på
  markedssidene. Ingen farge som allerede var i bruk er endret.

## Masteren

**Claude Design-prosjektet «AK Golf Designsystem»**
(`3e5c851c-4b78-41ab-8ced-7b11048838f9`) er master. Denne mappen er speilet —
samme arbeidsdeling som Claw/Team Norway.

**Det som bare finnes i masteren:**

```
components/    sju kategorier — flate, handling, maaling, melding, merke,
               navigasjon, skjema. Hver med .jsx, .d.ts og .prompt.md
ui_kits/       ti ferdige flater — markedsside, kampanje, presentasjon,
               dokument, epost, sosialt, fysisk, foreldrerapport, varianter,
               plakat-temaer
assets/        logo og foto, samme filer som public/logos og public/brand/foto
SKILL.md       designerens egen inngang til systemet
```

**Bygg aldri noe som finnes der.** Trenger du en knapp, et kort eller en hel
markedsside — hent den, ikke tegn den på nytt.

**Ved konflikt vinner masteren.** Speilet kan henge etter; er du i tvil om en
verdi, les fra Claude Design og synk hit etterpå.
