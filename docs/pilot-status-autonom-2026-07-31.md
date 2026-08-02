# Pilot-status — autonom 2t-kjøring 2026-07-31

**Gren:** `feature/schema-runde-sloyfe-v2`  
**Scope:** kode + docs, **ikke** design/Paper-port

## Ferdig i denne økten
| Blokk | Leveranse |
|-------|-----------|
| A | `registrerLydSamtykkeGitt` / `trekkLydSamtykke` + pilot-panel på recording |
| A | Personvern-utkast: avsnitt lyd/mindreårige |
| B | IndexedDB chunk-kø + kobling i recording-controls |
| C | `sjekkpunkt`/`fangstId` ved `acceptAndApplyPlanAction`; `hentSisteSjekkpunkt` |
| C | Kø viser foreslått sjekkpunkt fra suggestion |
| E | Fase0-sjekkliste + denne filen |

## Ikke ferdig / trenger deg
- DKIM, Vercel env, merge main — se `docs/pilot-fase0-sjekkliste.md`
- Ekte foresatt-e-post
- Før-kort UI dedikert (loader finnes: `hentSisteSjekkpunkt`)
- Group.kind / TradApning UI (schema klar)

## Slik tester du på 2 min
1. `/admin/recording` → velg spiller uten samtykke → «Registrer lydsamtykke (GITT)»
2. Start opptak skal bli tilgjengelig
3. Godkjenn en PlanAction med `sjekkpunkt` i suggestion → felt lagres på raden
