# StatusBar

Skallets nederste linje på desktop. Mono, 26 px, periferisyn.

## Innhold

Fem celler i fast rekkefølge: **versjon/periode · agentfeil · MRR · innsikter · CANON**. De tre midterste er klikkbare — de er de tre som kan kreve at du gjør noe.

```jsx
<StatusBar items={[
  { label: "v2.4 · P3 SPES" },
  { label: "agentfeil", value: 1, tone: "dn", onClick: åpneAgenter },
  { label: "MRR", value: "184 200", onClick: åpneØkonomi },
  { label: "innsikter", value: 6, onClick: åpneInnsikt },
  { label: "CANON", value: "✓", tone: "up" }
]} />
```

## Regler

- **Skjules under 880 px.** Periferisyn finnes ikke på en telefon — det er ikke en plassbeslutning, det er en oppmerksomhetsbeslutning. Skjulingen bruker `@media`, ikke `@container`: statuslinjen er skall, og skallet styres av viewport (kontraktens to brytpunktmekanismer).
- **Maks tre klikkbare celler.** Er alt trykkbart, er ingenting periferi.
- **Gulvet løses med `::after`, ikke ved å vokse.** Linjen er 26 px fordi den skal ligge i utkanten av synsfeltet; treffsonen på de klikkbare cellene er 44 px og usynlig (gulvregel.md avsnitt 2, samme mønster som `TimeGrid`).
- **Tall er nøytrale til tallet selv er semantikken.** `tone` settes kun der retningen er poenget: agentfeil er `--dn` fordi ett er ett for mange; MRR er nøytral fordi 184 200 ikke er «bra» i seg selv.
- `role="status"` — endringer leses opp uten å stjele fokus.

## Tilstander

default · hover (`--fg`) · active · focus-visible (2 px `--focus`, offset 3) · celle uten handling (span, ikke button) · skjult under 880 px.
