# `designsystem/wang/` — lokalt speil

Speil av to Claude Design-prosjekter:

| Mappe | Prosjekt | Gjelder |
|---|---|---|
| `fasit/` | `6061a53c` «WANG årsplan redesign» (15.08.2026) | **Gjeldende fasit** for årsplan (elev + trener), kalender, samlinger, Skole, foreldre, økt-detalj og IUP-samtalen. Se `fasit/SYNC-STATUS.md`. |
| `skjermer/`, `komponenter/`, `grunnlag/`, `tokens/` | `3935e216` «WANG Golf — Årsplan (redesign 2026)» (10.08.2026) | Skjermer `6061a53c` ikke dekker (bl.a. `a1-skall`, `a2-hjem`) + merkevaregrunnlaget. |

Ved konflikt om en skjerm begge dekker vinner `6061a53c`.

**Dette er IKKE kilden.** Samme regel som for `designsystem/paper/`: Claude Design-prosjektet
er fasiten, dette speilet ligger her for rask lesing og for at designet skal være synlig i
PR-en. Det oppdateres ikke automatisk og kan henge etter.

Åpne en `.html`-fil direkte i nettleseren for å se skjermen. Hver fil viser mobil 390px i alle
fire tilstander (Suksess · Tom · Laster · Feil), deretter desktop 1280px, og avsluttes med en
«slik er det i dag / slik blir det»-sammenligning pluss designnotater.

| Mappe | Innhold |
|---|---|
| `grunnlag/` | Farger, typografi, flater og bevegelse — hentet fra `src/styles/wang-tokens.css` |
| `komponenter/` | Gjenbrukbare byggeklosser: knapper/chips, økt-kort i alle fire tilstander |
| `skjermer/` | Skjermdesign, én fil per skjerm |
| `tokens/` | Ren kopi av `src/styles/wang-tokens.css` — sammenlign med `diff` |

**Endrer du en token her, endre den i `src/styles/wang-tokens.css` i samme PR.** Det er
mottiltaket mot at redesignet og produksjonskoden divergerer (se
`docs/port/plan-design-wang-arsplan.md` §3).
