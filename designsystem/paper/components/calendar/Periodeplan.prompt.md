# Periodeplan

Sesongbåndet. Blokkbredde = uker. GRUNN / SPES / TURN er lukket union.

```jsx
<Periodeplan dataOdId="aarshjul" selected="spes-host" onSelectPeriod={aapne}
  nowPct={22} nowLabel="uke 32" startLabel="aug 2026" endLabel="jul 2027"
  periods={[
    { id: "grunn-host", type: "GRUNN", label: "Grunnperiode", weeks: 16 },
    { id: "spes-host", type: "SPES", label: "Spesialisering", weeks: 18 },
    { id: "turn-var", type: "TURN", label: "Turnering", weeks: 10 },
  ]} />
```

- Grensen mot `Stepper`: Stepper er prosess-steg uten varighet (gjennomført/
  gjeldende/kommende); Periodeplan bærer TID — bredden ER informasjonen.
- Typene er lukket: AK-periodiseringen har GRUNN/SPES/TURN. En fjerde type
  legges inn i `TYPER` i biblioteket — aldri per skjerm.
- Farger: GRUNN `--info`, SPES `--fg`, TURN `--up` — samme toneunivers som
  SessionCard (TURN er `--up` fordi turnering er sesongens toppunkt). Tonen
  bor i toppkanten; blokkflaten er `--surface`.
- `nowPct` regnes av konsumenten (Oslo-korrekt ukelogikk bor i appen).
  Båndet får tekstlig sammendrag via `role="img"` + `aria-label` — blokkene
  under er de faktiske treffmålene når `onSelectPeriod` finnes.
- Container-terskel 480 px: ukene ryker og høyden går 56→44 — typelabelen
  står, for den er hva perioden ER.
- Uten `onSelectPeriod` rendres blokkene som div-er — lese-artefakter
  (foreldreportalen) skal ikke ha døde knapper.
