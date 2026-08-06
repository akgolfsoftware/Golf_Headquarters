# FormField — tilordning skrevet FØR bygging

Skrevet 28.07.2026, før første linje kode. Asserteres etter. Et avvik er et normalt utfall —
kravet er at det blir synlig og begrunnet, ikke at prediksjonen treffer.

## Utgangspunktet som ble oppdaget først

`components/forms/Input.jsx` **eier allerede en feltanatomi**: `.akhq-field`, `.akhq-label`,
`.akhq-hint`, `.akhq-err`. FormField er derfor ikke en tom tomt — den er en beslutning om eierskap.

To gyldige veier:

| | Vei | Konsekvens |
|---|---|---|
| **a** | FormField eier anatomien; `Input` refaktoreres til å konsumere den | Riktig sluttilstand. Rører en ferdigmeldt komponent, og resultatet kan ikke ses i Design System-fanen før serveren rekompilerer (se K1 i nattrapporten) |
| **b** | FormField får egne klassenavn; `Input` står urørt til den migreres bevisst | Ingenting eksisterende brekker. Midlertidig funksjonsduplisering — to måter å bygge et felt på |

**Valgt: b.** Begrunnelse: natten kan ikke verifisere en endring i `Input` visuelt (serveren kompilerer
ikke), og en uverifiserbar refaktorering av anatomien ~20 komponenter skal arve er nøyaktig den feilen
som forplanter seg lineært. Migreringen er køført som **K5** med anbefaling.

Dupliseringen er av *funksjon*, ikke av *deklarasjon* — ingen klassenavn kolliderer, så ingen regel
taper stille mot en annen.

## Klassetilordning

| Klasse | Lag | Jobb |
|---|---|---|
| `.akhq-ff` | `akhq-base` | rot: kolonne, `--gap` |
| `.akhq-ff-lab` | `akhq-base` | etikett |
| `.akhq-ff-krav` | `akhq-base` | påkrevd-markør |
| `.akhq-ff-ctl` | `akhq-base` | kontrollsporet — bærer `min-width:0` |
| `.akhq-ff-hint` | `akhq-base` | hjelpetekst |
| `.akhq-ff-err` | `akhq-base` | feilmelding, `--dn` |
| `.akhq-ff--sm` | `akhq-modifier` | tettere variant, setter kun `--gap` |

**Ingen `akhq-container`-lag og ingen wrapper.** FormField legger ikke om på egen bredde — den er en
kolonne som arver bredden sin. Skjelettet er tydelig: wrapper kun når komponenten faktisk må query
seg selv. En container-type her ville vært et tomt lag som senere leses som en terskel som finnes.

**Ingen egen `--floor`.** FormField har ingen interaktive elementer — kontrollen den pakker eier sitt
eget treffmål. `--floor: 0` ville vært riktig, men å deklarere den her inviterer til at noen setter
den, og gulvet ville da bo to steder.

## Assertioner etter bygging

1. Alle sju klasser i forventet lag, 0 utenfor `@layer`.
2. Ingen klassenavn kolliderer med `.akhq-field`/`.akhq-label`/`.akhq-hint`/`.akhq-err`.
3. `label` → `htmlFor` treffer kontrollens `id`; `aria-describedby` peker på hint **eller** feil.
4. `aria-invalid` settes når og bare når `error` er satt.
5. Hint og feil vises aldri samtidig.
6. Høyde målt, ikke anslått.
