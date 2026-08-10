# `designsystem/wang/` — lokalt speil

Speil av Claude Design-prosjektet **«WANG Golf — Årsplan (redesign 2026)»**
(`3935e216-ee5b-4d83-8fbd-30e0ec5e7d98`).

**Dette er IKKE kilden.** Samme regel som for `designsystem/paper/`: Claude Design-prosjektet
er fasiten, dette speilet ligger her for rask lesing og for at designet skal være synlig i
PR-en. Det oppdateres ikke automatisk og kan henge etter.

Åpne en `.html`-fil direkte i nettleseren for å se skjermen. Hver fil viser mobil 390px i alle
fire tilstander (Suksess · Tom · Laster · Feil), deretter desktop 1280px, og avsluttes med en
«slik er det i dag / slik blir det»-sammenligning pluss designnotater.

| Mappe | Innhold |
|---|---|
| `grunnlag/` | Farger, typografi, flater og bevegelse — hentet fra `src/styles/wang-tokens.css` |
| `skjermer/` | Skjermdesign, én fil per skjerm |

**Endrer du en token her, endre den i `src/styles/wang-tokens.css` i samme PR.** Det er
mottiltaket mot at redesignet og produksjonskoden divergerer (se
`docs/port/plan-design-wang-arsplan.md` §3).
