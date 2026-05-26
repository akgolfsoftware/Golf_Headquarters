# Batch 4 — Wizard / Form (Arketype D)

**Antall pakker:** 18 (12 skjermer + 6 modaler)
**Status:** Klar for claude.ai/design
**Estimert tid:** 4–6 timer

## Hvorfor denne batchen nå

Arketype D (Wizard / Form) styrer alle flerstegs-flyter i plattformen — innlogging, onboarding, plan-bygging, øktoppretting, betaling og godkjenning. Når dette mønsteret er stabilt, kan resten av plattformens skjemaer bruke samme grunnmal. Batch 1 (Dashboard) etablerte estetikken; batch 2 (List) etablerte tabell-mønstre; batch 3 (Detail) etablerte tab-strukturer. **Denne batchen etablerer skjema-interaksjon og multi-step-validering.**

## Arketype D — felles spec (gjelder alle 18 pakker)

Disse mønstrene skal være konsistente på tvers av alle wizards og forms. Vis variasjon i innhold og felter, ikke i layout.

### Layout (multi-step)

```
┌─────────────────────────────────────────────┐
│  Sidebar  │  Hero (italic editorial title)  │
│           ├─────────────────────────────────┤
│           │  Steg-indikator (dots/numbers)  │
│           │  ● ─── ● ─── ○ ─── ○ ─── ○      │
│           ├─────────────────────────────────┤
│           │  Body (variabel høyde)          │
│           │  ┌───────────────────────────┐  │
│           │  │ Felt 1                    │  │
│           │  │ [_________________]       │  │
│           │  │                           │  │
│           │  │ Felt 2                    │  │
│           │  │ [_________________]       │  │
│           │  └───────────────────────────┘  │
│           ├─────────────────────────────────┤
│           │  Footer (sticky, 72px)          │
│           │  [Avbryt]      [← Tilbake] [→]  │
│           └─────────────────────────────────┘
```

### Layout (single form)

Full-bredde, hierarki via seksjoner, ikke steg. CTA i bunn (sticky for lange skjemaer).

### Felles regler

| Element | Regel |
|---|---|
| Steg-indikator | Dots eller numbers — **ALDRI** lineær progressbar (det signaliserer venting, ikke navigasjon) |
| Aktiv steg-prikk | `accent` (lime) for aktiv, `primary` for fullført, `muted` for ufullført |
| Klikkbar steg-prikk | Brukere kan hoppe TILBAKE til fullførte steg, ikke fremover |
| "Avbryt"-knapp | Alltid synlig (sekundær) — i venstre side av footer |
| "Tilbake"-knapp | Disabled på steg 1 — i høyre side, før "Neste" |
| "Fortsett →" / "Neste →" | Primary CTA (accent-pill) — alltid lengst til høyre |
| Submit-CTA | Bytter tekst fra "Neste →" til konkret handling: "Send forslag →", "Bestill nå", "Opprett konto", "Lagre" |

### States å designe (per skjerm)

| State | Når |
|---|---|
| Idle | Default — ingen interaksjon |
| Focus per felt | Når bruker klikker inn i felt (ring-token) |
| Validating | Mens felt valideres asynkront (passord, e-post, kode) — spinner i felt |
| Inline error | Etter validering feiler — rød tekst under felt + ikon |
| Inline success | Når felt er gyldig (sjeldent vist — kun på kritiske felt: passord, e-post) |
| Submitting | Når brukeren har klikket primary CTA — spinner i CTA, hele footer disabled |
| Success (final) | Etter vellykket submit — confetti / checkmark / redirect-melding |
| Error (submit) | Toast øverst i form — "Kunne ikke X. Prøv igjen." |

### Validering — inline per felt

- **Real-time** for: e-post-format, passord-styrke, kort-nummer, telefonnummer
- **On-blur** for: navn, valgfrie felt, dropdowns
- **On-submit** for: helhets-validering (alle påkrevde felt fylt, pyramide = 100%, etc.)

### Mobile (≤640px)

- Steg-indikator komprimerer til "Steg 2 av 5" tekst + dots
- Footer blir sticky-bunn med full-bredde knapper
- Avbryt blir tekst-link i topp-hjørne (ikke knapp i footer)

### Modal-spesifikke regler

- Max-width 720px, `rounded-xl` (12px), bakdrop `rgba(0,0,0,0.5)` med blur(4px)
- Header sticky 72px med tittel + steg-progress + lukk-X
- Footer sticky 72px med samme knappestruktur som full-skjerm
- Lukk-X eller "Avbryt" → confirm-popover hvis endringer er gjort
- Mobile: full-screen modal (`rounded-none`)

---

## Per-skjerm-pakker (12)

### Auth + Onboarding (6)
1. `01-auth-login.md` — Login (single form)
2. `02-auth-signup.md` — Signup (single form med inline-validering)
3. `03-auth-forgot-password.md` — Glemt passord (2-step)
4. `04-auth-2fa-setup.md` — 2FA-aktivering (3-step)
5. `05-auth-sso-setup.md` — SSO for org (4-step org-wizard)
6. `06-auth-onboarding.md` — Welcome-flyt (4-step)

### CoachHQ wizards (3)
7. `07-coachhq-plan-builder.md` — Plan-bygger (6-step)
8. `08-coachhq-periodisering-agent.md` — Periodisering-agent-form
12. `12-coachhq-import-assistent.md` — Import-assistent (3-step)

### PlayerHQ wizards (3)
9. `09-playerhq-ny-okt-wizard.md` — Ny økt-wizard (6-step)
10. `10-playerhq-onskeligokt.md` — Be om økt (single form)
11. `11-playerhq-coach-message-compose.md` — Skriv melding til coach

## Modal-pakker (6) — wizards som åpnes i modal-form

13. `13-modal-new-plan.md` — NewPlanModal (4-step) — duplikat fra batch 2-D, inkludert som arketype-referanse
14. `14-modal-ai-plan-generator.md` — AIPlanGeneratorModal (3-step + spinner)
15. `15-modal-template-selector.md` — TemplateSelectorModal (single-step velger)
16. `16-modal-plan-approval.md` — PlanApprovalModal (spiller godkjenner forslag)
17. `17-modal-payment.md` — PaymentModal (Stripe-elements)
18. `18-modal-booking-confirmation.md` — BookingConfirmationModal

## Slik bruker du hver pakke

Samme oppskrift som batch 1–3:

1. Last opp `branding-style-guide.html` + `design-system-v2.md` som system-kontekst (engang per session)
2. Per pakke: åpne `0X-{navn}.md`, last opp tilhørende HTML-wireframe, kopier prompt, iterer
3. Lim design-link tilbake til Claude Code

## Gate

Alle 18 pakker må være `APPROVED` før vi går til batch 5 (Fullscreen / Live).
