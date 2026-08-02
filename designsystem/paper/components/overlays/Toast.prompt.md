Toast er blekkflaten som bekrefter at noe gikk bra, og forsvinner selv.

```jsx
<Toast tone="ok">Ukeplan publisert til Emma</Toast>
<Toast tone="warn" duration={6000}>Synk feilet · prøver igjen om 30 s</Toast>
```

- **Forsvinner av seg selv = Toast.** Blir den stående til noe er løst eller lukket, er det `Banner`. Forklarer den noe som alltid er sant på stedet, er det `Callout`.
- `duration` er 4000 ms som standard. Lengre for meldinger med tall å lese, `0` bare når skjermen selv styrer fjerningen — en toast uten både varighet og eier blir en permanent flate, altså feil komponent.
- **Fargen ligger i prikken, ikke i flaten.** Flaten er alltid blekk med papirtekst; `tone` gir en 6px prikk i `--up-raw`/`--dn`/`--info`. En helfarget toast ville brutt papir/blekk-regelen og konkurrert med OneThingNow.
- `role="status"` + `aria-live="polite"` + `aria-atomic`: meldingen leses ferdig uten å avbryte. Bruk **aldri** `role="alert"` her — det er reservert blokkerende validering i Banner.
- Teksten skal kunne leses i det halvsekundet den er der: «Ukeplan publisert til Emma», ikke «Handlingen ble utført».
- Én toast om gangen. To samtidig legger seg oppå hverandre — trenger skjermen en kø, hører den i skjermen, ikke i komponenten.
- Innkomsten er en 160 ms fade + 6px løft, og hoppes over ved `prefers-reduced-motion`.
