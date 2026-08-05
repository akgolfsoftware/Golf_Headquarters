StatusBadge er et ikke-klikkbart merke i mono-versaler, 20px høyt, `--r-pill`. Er merket klikkbart eller filtrerende, er det `Chip` — ikke dette.

```jsx
<StatusBadge tone="up" dot>Godkjent</StatusBadge>
<StatusBadge tone="warn">Avvik</StatusBadge>
<StatusBadge tone="mut">Venter</StatusBadge>
<StatusBadge tone="ny">Ny</StatusBadge>
<StatusBadge kind="tag">SPESIALISERING</StatusBadge>
<StatusBadge kind="tag">LAV_HAST</StatusBadge>
```

## kind="tag" er permanent fargeløs — bindende

AK-vokabularet fargekodes aldri: GRUNN / SPESIALISERING / TURNERING, FYS / TEK / SLAG / SPILL / TURN, A–K, og AK-formel v2-verdiene — motorikk (UTEN_BALL / LAV_HAST / AUTO), belastning (INNENDORS / TRENINGSOMRADE / BANE / KONKURRANSE), press (ALENE / OBSERVERT / KONKURRANSE / TURNERING). Ingen av dem får farge, verken nå eller per skjerm senere. To grunner, og de gjelder alle 81 skjermer:

1. Vokabularet har for mange verdier for paletten. Tre aksentfarger kan ikke bære 30+ koder uten å finne opp farger utenfor tokenbaselinen.
2. Datasemantikken er allerede tatt: grønn (`--up`) betyr *bedre*, leire (`--dn`) betyr *attention*. En periodetype er ikke bedre eller verre enn en annen — farget ville den lyve.

Tag er `transparent` fyll, `--border` kant, `--muted` tekst. Trenger en skjerm å skille koder visuelt, gjøres det med gruppering, rekkefølge eller mono-tegnbredde — ikke farge. Spørsmålet er avgjort; ikke ta det opp per skjerm.

## Toner i kind="status"

- `up` godkjent, bedret, innenfor krav · `warn` avvik, forfalt, blokkerende · `info` nøytral opplysning (kilde, dokumenttype som *tilstand*) · `mut` venter, passiv, utkast.
- `ny` er blekkfylt, ikke oransje og ikke grønn: nyhet er ingen verdivurdering, og oransje er reservert OneThingNow.
- `dot` når merket står i en tett rad og fargen alene må registreres raskt. Aldri dot uten tekst — farge er ikke eneste bærer av mening.
- Teksten bærer alltid betydningen selv («Avvik», ikke bare rød pille). Ingen `aria-label` — det som skal leses, står i merket.
