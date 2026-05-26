# AK Golf Platform — Auth — 2FA-aktivering

## Identitet

- **Produkt:** Auth (delt — også tilgjengelig fra Innstillinger > Sikkerhet)
- **URL:** `/2fa-setup`
- **Arketype:** D — Wizard / Form (3-step multi-step)
- **Tier-gating:** Tilgjengelig på alle tiers, påkrevd for Coach-rolle på Elite-tier
- **HTML-referanse:** `wireframe/screen-deck/auth/2fa-setup.html`
- **Audit:** `wireframe/audit/auth-2fa-setup.md`
- **Tilhørende skjermer:** Login (pakke 1) — 2FA-prompt vises etter login når 2FA er aktivt

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. Samme to-spalters auth-layout. **3-step wizard** — steg-indikator (dots, ikke linær progressbar) øverst i form-card.

## Spec — hva skjermen er for

Aktiverer to-faktor-autentisering med TOTP (Google Authenticator, Authy, 1Password). Tre steg:
- **Steg 1:** Velg metode (Authenticator-app er anbefalt; SMS er fallback)
- **Steg 2:** Skann QR-kode med app + skriv inn 6-sifret kode for å bekrefte
- **Steg 3:** Lagre backup-koder (8 stk) — kritisk for recovery

## Layout — UNIKT for denne skjermen

To-spalters auth-layout. Venstre tittel italic Instrument Serif: "Sikre kontoen din.", subtittel: "2FA tar 2 minutter å sette opp og beskytter deg mot 99% av angrep."

Form-card høyre, max-width 520px (litt bredere enn Login for å romme QR-kode):

### Steg-indikator (sticky, øverst i card)

3 dots: ● — ○ — ○ (eller fullført/aktiv/ufullført states). Tekst under: "Steg 1 av 3 · Velg metode"

### Steg 1 — Velg metode

To store kort (stack vertikalt på tablet/mobil, side-om-side på desktop):
- **Authenticator-app** (anbefalt — accent-badge "Anbefalt" øverst-høyre): Ikon `Smartphone`, tittel "Authenticator-app", undertekst "Google Authenticator, Authy, 1Password, etc."
- **SMS** (sekundær, dempet): Ikon `MessageSquare`, tittel "SMS", undertekst "Mottak via tekstmelding. Mindre sikkert."

Footer: `Avbryt` + `Neste →`

### Steg 2 — Skann + bekreft

- **QR-kode** sentrert (240×240px), accent-border 2px, `rounded-lg`
- **Manuell setup-link** under QR: "Kan ikke skanne? [Vis nøkkel manuelt]" → ekspanderer til monospace-tekst-felt med setup-key
- **6-sifret kode-felt** — 6 separate boks-input (auto-fokus til neste når sifret tastes), `JetBrains Mono`, sentrert
- **Validering inline:** "Koden stemmer ikke. Prøv igjen." (rød) eller "✓ Koden er godkjent" (accent)
- Footer: `← Tilbake` + `Bekreft og fortsett →`

### Steg 3 — Backup-koder

- **Tittel:** "Skriv ned eller lagre disse"
- **Advarselsboks** (warning-bg): "Disse kodene lar deg logge inn uten telefonen. Lagre dem trygt — du får ikke se dem igjen."
- **8 koder** i grid 2×4, JetBrains Mono, hver kode som copy-on-click chip (eks: `7K3M-9P2Q`)
- **Aksjons-knapper:** `Last ned som tekstfil` + `Kopier alle` + `Skriv ut`
- **Sjekkboks (påkrevd):** "Jeg har lagret kodene trygt"
- Footer: `← Tilbake` + `Fullfør →` (disabled til checkbox er krysset)

## Klikkbare elementer

| Element | States |
|---|---|
| Steg-indikator-prikk | static, klikkbar tilbake til fullførte steg |
| Metode-kort (steg 1) | default, hover (lift + accent ring), valgt (accent border + ring) |
| QR-kode | static (display only) |
| "Vis nøkkel manuelt"-link | default, hover, focus, klikk → ekspanderer setup-key |
| 6-sifret kode-boks | default, focus (auto-advance), filled, error (rød ramme), success (accent ramme) |
| Bekreft-CTA | default, hover, disabled (kode <6 siffer), loading ("Verifiserer …"), success (accent-flash) |
| Backup-kode-chip | default, hover, klikk-to-copy, copied (kort "Kopiert ✓"-toast) |
| "Last ned" / "Kopier alle" / "Skriv ut" | default, hover, focus |
| Sjekkboks | uvalgt, valgt, focus |
| `Avbryt` | default, hover, focus, klikk → confirm-popover hvis steg >1 |
| `← Tilbake` | default, hover, disabled (steg 1) |
| `Neste →` / `Bekreft og fortsett →` / `Fullfør →` | default, hover, active, disabled, loading |

## Empty / loading / error / success-states

- **Steg 2 koden feil:** Inline error under kode-felt + felter shake-animasjon (subtil)
- **Steg 2 verifisering loading:** Spinner i CTA, "Verifiserer …"
- **Steg 3 nedlasting:** Ingen state-endring (browser-download)
- **Submit final success:** Confetti-animasjon + tittel "2FA er aktivert" + CTA `Fortsett til portalen →`
- **Submit error:** Toast: "Kunne ikke aktivere 2FA. Prøv igjen."

## Mobile (≤640px)

Brand-strip 120px topp. QR-kode krymper til 200×200px. 6-sifret kode-felt blir 6 store bokser med store fingre-mål (44×56px). Backup-koder grid blir 1×8 (én kolonne).

## Ønsket output fra Claude Design

1. Steg 1 lyst tema (Authenticator anbefalt-card hover)
2. Steg 2 lyst tema (QR-kode synlig, kode-felter tomme)
3. Steg 2 lyst tema, validering-error (kode feil, shake)
4. Steg 2 lyst tema, success (kode godkjent ✓)
5. Steg 3 lyst tema (8 backup-koder + advarsel)
6. Steg 3 lyst tema, en kode "Kopiert ✓"-toast
7. Submit success (confetti + "2FA er aktivert")
8. Mørkt tema, steg 2
9. Mobil ≤640px, steg 2

## Ikke-mål

- Ikke designe SMS-flyten i detalj (samme grunnlayout — telefonnummer-felt i steg 2 i stedet for QR)
- Ikke designe 2FA-prompt på Login (egen mini-skjerm: 6-sifret kode etter passord)
- Ikke designe disable-2FA-flyten (egen pakke under Innstillinger > Sikkerhet)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
