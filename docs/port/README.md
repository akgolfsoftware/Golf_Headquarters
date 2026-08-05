# docs/port/ — designport-dokumenter

Fase 0–4-dokumentene her (`fase0`–`fase4`, `steg5-kontroll`, kontroll-filene) er
**frosset underlag** — historikk fra kartleggingen, vedlikeholdes ikke.

`fasit-liste-paper.md` er derimot **levende** — oppdateres når Claude Design-prosjektet
(`605a48cc`, «AK Golf HQ — Claude Paper») får nye fasitskjermer.

Én levende plan: `plan-designport-alle-skjermer.md` — full Paper-port av skjermene, **i gang**
siden Anders overstyrte invariant 2 eksplisitt 2026-08-03 (se
`.claude/rules/beslutninger.md` §Tema/design). Ikke lenger betinget av noen pilot-evaluering.

**`designsystem/paper/` er et lokalt speil av Claude Design-prosjektet** (hentet ned i PR #254,
02.08.2026, ikke lenger kun på grenen `chore/paper-speil-lokal`). Det er IKKE kilden — Claude
Design-prosjektet `605a48cc` er. Speilet må re-synkes derfra. **Kjent per 05.08.2026: speilet
er utdatert** — `designsystem/paper/fase1/` har 25 skjermer, det ekte prosjektet har 33 (8 nye,
se `fasit-liste-paper.md`). Sjekk om speilet faktisk fortsatt brukes noe sted i verify-/CI-steg
før neste re-sync — er det bare dokumentasjon som leser det, kan det holde å oppdatere det ved
neste steg-2-kjøring i stedet for på hver design-endring.
