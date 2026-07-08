# Gap-register — designsystem-mangler under oppryddingen

Løpende liste over komponenter/varianter som mangler i Claude Design-prosjektet og som
skjermene trenger. Claude Code APPENDER nye gap hit per bølge (regel: meld gap, ikke improviser).
Når alle bølger i Fase 4 er ferdige, blir denne lista ÉN samlet gap-fyll-prompt til Claude
Design — vi re-importerer, og lukker gapene i én siste pass. Dette erstatter «Claude
Design-runden» i kjøreboka: den flyttes fra før migreringen til ETTER, som gap-fyll.

Status: ÅPEN (venter) · I-DS (lagt i Claude Design) · LUKKET (portet + tatt i bruk).

## Reframing av de 5 første (min designvurdering)

Ikke fem nye komponenter — **to nye + tre utvidelser**. Speil før du finner opp.

| # | Gap | Brukt | Løsning (anbefalt) | Type | Status |
|---|---|---|---|---|---|
| 1 | Status-prikk | 5 steder (gml `pulse-dot`/`presence-dot`) | NY primitiv `StatusDot`: live/online/prioritet/idle. Bruk `--signal` (flipper forest↔lime automatisk per modus), `--destructive`, `--text-muted` → lime-invarianten løses av tokenene. Puls respekterer `prefers-reduced-motion`. | NY | ÅPEN |
| 2 | Aksefordelings-bar | fordeling FYS/TEK/SLAG/SPILL/TURN | NY primitiv: stablet horisontal bar, 5 segment i `--axis-*`, %-verdier i mono med enhet. Sjekk overlapp mot `TidsPyramide` først — dette er den kompakte 1-bar-varianten, ikke pyramiden. | NY | ÅPEN |
| 3 | Års-gantt for AK-perioder | `/portal/tren/aarsplan` | UTVID `Periodeplan`: la `Phase` godta fritt navngitte perioder (behold L-fase som variant). Gantt-visualen er allerede riktig — kun navnemodellen låser. IKKE ny komponent. | UTVID | ÅPEN |
| 4 | «År» i VisningsVelger | kalender-visningsbytte | UTVID `VisningsVelger`: legg `År` som gyldig `KalenderVisning`. Triviell. | UTVID | ÅPEN |
| 5 | Warn-variant på Tag | gul/oransje status | UTVID `Tag`: `warn`-variant via `--warning`-token (finnes i v14). Triviell. | UTVID | ÅPEN |

## Bølge 2 — /portal
(Claude Code appender nye gap her)

## Bølge 3 — /admin
(Claude Code appender nye gap her)

## Bølge 4 — marketing + forelder
(Claude Code appender nye gap her)
