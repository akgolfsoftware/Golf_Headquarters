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

## Kode

```
tokens/farge.css      merkefarger + fem identitetsfarger, alle målt
tokens/type.css       tre fonter, ni trinn
tokens/rom.css        4-skala, radius, dybde
tokens/bevegelse.css  fart og kurver
```

Logofilene ligger i `public/logos/` (sju vektorvarianter), ikke her — de er i
drift i appen og skal ha én adresse.

## Grunnlaget

- Merkeplattformen: `docs/merkevare/ak-golf-merkeplattform-2026-08-31.md` (18.1)
- Arbeidet: `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 18
- Grunnpaletten er hentet fra `src/app/globals.css` §`--mk-*`, som er i drift på
  markedssidene. Ingen farge som allerede var i bruk er endret.

## Masteren

Anders oppretter Claude Design-prosjektet som blir master for AK Golf. Denne
mappen er speilet koden leser — samme arbeidsdeling som Claw/Team Norway.
