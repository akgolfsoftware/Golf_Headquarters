# Desktop Import — Sprint 0 Foundation Docs

**Importert til repo:** 2026-05-10
**Original lokasjon:** `~/Desktop/akgolf-hq-docs/`

Disse 9 dokumentene var produksjonsklare designsystem- og spec-dokumenter som lå utenfor repo. Importert hit slik at de blir versjonert, søkbare og refererbare fra design-pipelinen.

## Filer

| Fil | Rolle | Bruk i design-pipeline |
|---|---|---|
| **`branding-style-guide.html`** | Komplett visuelt designsystem (interaktiv HTML) | **Lastes opp i claude.ai/design som visuell systemreferanse** |
| `design-system.md` | Tekstuell sannhetskilde for alle tokens | Sammen med `wireframe/brain/design-system-v2.md` |
| `branding.md` | Designretning per overflate (PlayerHQ/CoachHQ/Landing) | Per-skjerm-pakke header |
| `design-inspiration.md` | 13 analyserte skjermbilder + stilreferanser | For "hvorfor ser det slik ut"-kontekst |
| `screen-builder.md` | Skjerm-byggings-oppskrift | Sjekkliste i hver design-pakke |
| `2026-05-10-component-library.md` | Implementasjonsplan for 15 nye komponenter | Per-skjerm-pakke peker hit hvis ny komponent trengs |
| `handover-akgolf-hq.md` | Sprint-plan og overflate-beskrivelse | Kontekst |
| `periodisering-agent-spec.md` | Periodiseringsagent-spesifikasjon | For agent-relaterte skjermer (CoachHQ Periodisering) |
| `periodisering-agent-config.md` | Periodiseringsagent-konfigurasjon | Som over |

## Hvordan disse forholder seg til andre kilder

| Spørsmål | Hvor finner jeg svar |
|---|---|
| Hvilke farge-tokens finnes? | `design-system.md` (tekst) eller `branding-style-guide.html` (visuelt) |
| Hva er anti-AI-reglene? | `branding.md` eller `design-inspiration.md` |
| Hvilke komponenter eksisterer / mangler? | `2026-05-10-component-library.md` |
| Hva er sprint-planen? | `handover-akgolf-hq.md` |
| Hvilke nye skjermer er planlagt? | `wireframe/inventory/build-list.md` |
| Hva ser hver skjerm ut som (lo-fi)? | `wireframe/screen-deck/{produkt}/*.html` |
| Hva er klikkbart i hver skjerm? | `wireframe/audit/*.md` |

## Viktig

**Disse dokumentene er kanoniske** — `design-system-v2.md` (i parent-mappen) er en kortere versjon for praktisk Claude Code-bruk, men ved konflikt vinner dokumentene her.

**Heritage Grid (M3) er DEPRECATED.** Forbudte legacy tokens listet i `design-system.md` skal IKKE brukes i nye design.
