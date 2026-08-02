# Hva kompilatoren leser — filtyper og trygge steder

Skrevet 28.07.2026, etter at `guidelines/klasseinventar.js` knakk hele `_ds_bundle.js`. Kartlagt mot `_ds_manifest.json` og bundelen, ikke gjettet. Les denne før du legger en ny verktøyfil noe sted.

## Konsumeres — havner i bundelen eller manifestet

| Endelse | Hvordan | Konsekvens av en feil |
|---|---|---|
| `.jsx` / `.tsx` | Transpileres og eksporteres på `window.<Namespace>` når filen har en søsken-`.d.ts` med samme PascalCase-navn. **Filer uten `.d.ts` trekkes også inn** som avhengigheter — `viz.jsx` og `overlay-focus.jsx` er ikke komponenter, men er i bundelen. | Syntaksfeil eller `await` på toppnivå knekker **hele** bundelen, ikke bare filen. Alle 35 kort blir tomme samtidig. |
| `.d.ts` | Definerer at søsken-`.jsx` er en komponent, og bærer prop-dokumentasjonen. | Uten den er komponenten ikke eksportert. Uten søsken-`.jsx` er den en foreldreløs `.d.ts` (`check_design_system` rapporterer det). |
| `.css` | `styles.css` og alt den `@import`-erer. I dag: `tokens/fonts.css`, `tokens/akhq-tokens.css`. Tokens og `@font-face` leses ut herfra — 73 tokens, 3 temaer, 3 merkefonter. | En CSS-syntaksfeil i importkjeden tar tokens og temaer. `guidelines/card-support.css` er **ikke** importert av `styles.css` og leses derfor ikke som tokenkilde. |
| `.html` med `@dsCard` på første linje | Blir et kort i Design System-fanen. 35 i dag. | Ingen kompileringsrisiko — et ødelagt kort er ødelagt alene. |
| `.dc.html` under `templates/<slug>/` med `@template` | Blir en template i plukkeren. 2 i dag. | Isolert på samme måte. |
| `thumbnail.html` i rot | Prosjektets flis på hjemmesiden. | Isolert. |

## Konsumeres ikke — trygt for verktøy og notater

- **`.md`** — 61 filer i `guidelines/` og `kart/`. Verifisert: ingen prosa fra dem finnes i bundelen. `.prompt.md` leses av mennesker og av meg, ikke av kompilatoren. **Dette er stedet for skript som skal kjøres i `run_script`** — legg dem som kodeblokk i en `.md`, slik `klasseinventar.md` gjør.
- **`.html` uten `@dsCard`** — måleriggen (`guidelines/terskelrigg.html`) og selvtesten ligger her. Verifisert utenfor bundelen. Trygt, og det riktige stedet for verktøy som må rendre i en nettleser.
- **`.json`** — bare `_ds_manifest.json` og `_adherence.oxlintrc.json` leses, og de skrives av kompilatoren. Egne datafiler er trygge.
- **`assets/`, `uploads/`** — filer, ikke kode.

## Reglene som følger av dette

1. **En løs `.js` i prosjektet er farlig.** Endelsen behandles som kode. Skal et skript lagres, legg det som kodeblokk i en `.md` — aldri som `.js`- eller `.jsx`-fil. Dette er hele grunnen til at denne filen finnes.
2. **`.jsx` er den eneste endelsen der en enkelt feil er global.** Alt annet feiler lokalt. Vær tilsvarende forsiktig ved batching av `.jsx`.
3. **Verktøy hører i `.md` (skript) eller `.html` uten `@dsCard` (rigger).** Begge er verifisert utenfor kompileringen.
4. **Sjekk `check_design_system` etter enhver ny fil med en konsumert endelse** — den rapporterer foreldreløse `.d.ts`, duplikate komponentnavn og kort som laster rå `.jsx`.
