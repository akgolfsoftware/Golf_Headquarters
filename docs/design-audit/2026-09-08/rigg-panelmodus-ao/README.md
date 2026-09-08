# AO-03 / AO-08 målt i panel-modus mot prod — 08.09.2026

Fase 1, økt 4 (`docs/superpowers/plans/2026-09-05-designport-fase-1-okt-4.md`, oppgave 4.5).
Begge er innebygde fasitpaneler, ikke hele skjermer: appen rendres i 1440×900 og utsnittet
klippes fra panelelementets øvre venstre hjørne med fasitrammens mål
(`tests/visual/README.md` §Panel-modus). Innlogget som `coachtest@akgolf.test` mot
`https://akgolf-hq.vercel.app`.

## AO-03 Ko 1440 — 4,76 % (23 140 / 486 400 px, ramme 760×640)

```bash
SHOT_BRUKER=coachtest@akgolf.test node scripts/train-lock-pixel-diff.mjs "AO-03 Ko 1440" \
  "/admin/ko?fane=agentko" dark 0 --viewport=1440x900 --selector='[data-screen-label="AO-03 Ko"]'
```

Hodet («Kø» + filterpillene) treffer fasitens plassering. Under det forskyves alt: appen har
ingen Pågår-seksjon (seed gir 0 pågående), og radenes høyre metadata/handling faller utenfor
utsnittet fordi panelet er 1144 px bredt i skallet mot fasitens 760. Raden står derfor som
`ukalibrert` / `kjent-layoutavvik`.

## AO-08 Godkjenn 1440 — 6,65 % (24 377 / 366 300 px, ramme 660×555 målt — 620 px innhold + 20 px padding)

```bash
SHOT_BRUKER=coachtest@akgolf.test node scripts/train-lock-pixel-diff.mjs "AO-08 Godkjenn 1440" \
  "/admin/ko?fane=agentgodkjenn" dark 0 --viewport=1440x900 --selector='[data-screen-label="AO-08 Godkjenn"]'
```

Fasitrammen har 20 px padding innenfor rammen; appens panel starter på x=0 i skallets innhold,
så hele innholdet ligger forskjøvet opp og til venstre. Kortstrukturen (uthevet sak med
Godkjenn/Avvis, deretter kompakte kort) stemmer med fasiten. `ukalibrert` /
`kjent-layoutavvik`.

Full avviksliste per skjerm står i filhodene til
`src/components/admin/v2/agenticos/AdminAgenticosKo.tsx` og `AdminAgenticosGodkjenn.tsx`.
