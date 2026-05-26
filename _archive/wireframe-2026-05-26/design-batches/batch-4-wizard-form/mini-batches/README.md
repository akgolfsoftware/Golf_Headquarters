# Mini-batches for Batch-4 (Wizard / Form)

18 design-pakker delt i 3 mini-batches. Kjør én sesjon per mini-batch i claude.ai/design.

## Rekkefølge og innhold

| Mini-batch | Antall | Innhold | Mønster |
|---|---|---|---|
| **4-A** | 6 | Auth + Onboarding — Login, Signup, Glemt passord, 2FA-setup, SSO-setup, Onboarding | Single form + multi-step wizard |
| **4-B** | 6 | Wizards i app — Plan-builder, Periodisering-agent, Ny økt-wizard, OnskeligOkt, Coach-melding, Import-assistent | Multi-step + single form (in-app) |
| **4-C** | 6 | Modaler — NewPlan, AIPlanGenerator, TemplateSelector, PlanApproval, Payment, BookingConfirmation | Modal-wizards + single-step modaler |

## Filer per mini-batch

For hver `4-X` finnes 3 filer:

- `4-X.md` — **Konsolidert spec** (ASCII-sanitised, lastes opp i Claude Design)
- `4-X-prompt.md` — **Custom prompt** (kopieres inn som første melding i sesjonen)
- `4-X-vedlegg.txt` — **Liste over HTML-filer** å laste opp som visuelle vedlegg

## Bruk

### Steg 1 — Start ny Claude Design-sesjon per mini-batch

Per mini-batch (start på 4-A først):

1. Åpne **`4-A-vedlegg.txt`** i editor — gir deg klikkbare filstier
2. Last opp i Claude Design:
   - System-kontekst (engang per session): `branding-style-guide.html` + `design-system-v2.md` + alle 20 fonter fra `for-claude-design/fonts/`
   - Mini-batch-spec: `4-A.md`
   - Alle HTML-vedlegg listet i `4-A-vedlegg.txt`
3. Åpne **`4-A-prompt.md`**, kopier hele PROMPT-blokken
4. Lim inn som første melding i Claude Design

### Steg 2 — Generer 6 skjermer av gangen

Claude Design genererer Pakke 1 → fortsetter rett til Pakke 2 → … → Pakke 6 (uten å vente mellom).

Etter alle 6: review samlet og godkjenn eller flagg feil.

### Steg 3 — Pilot-gate

**4-A er pilot for hele batch-4-mønsteret.** Etter 4-A er ferdig, evaluer:
- Fungerer 6-og-6-rytmen?
- Er kontekst beholdt over hele sesjonen?
- Er kvaliteten konsistent?
- Skiller arketype-D-mønsteret seg tydelig fra batch 1–3?

Hvis JA → kjør 4-B, 4-C etter samme oppskrift.
Hvis NEI → si fra, jeg justerer strategien før neste mini-batch.

## ASCII-sanitised

Alle filene i denne mappen er sanitised (ingen UTF-8-tegn som æ/ø/å, em-dash, smart quotes, box-drawing) — for å unngå Claude Designs encoding-bug. Norske tegn er erstattet med ae/oe/aa.

## Anti-AI-regler (felles for alle mini-batches)

- ALDRI "God morgen, [Navn]" eller "Welcome back" — bruk italic editorial-fragment
- Eksempler: *"Onsdag morgen. 2 minutter til du er logget inn."* / *"Sett opp 2FA. Det tar 90 sekunder."*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt
- Maks 3 lime-elementer (#D1F843) per skjerm
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr, ikke 1.600)
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout (ikke 3x1 uniform)

## Referanse-personer

- CoachHQ: Anders Kristiansen (hovedcoach)
- PlayerHQ: Markus Roinaas Pedersen (hovedspiller-eksempel)
- Andre spillere som vises: Henrik Nilsen, Anna Karlsen, Emma Solberg, Joachim Tangen, Lina Hellesund
