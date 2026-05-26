# AK Golf Platform — CoachHQ — E-post-maler

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/email-templates`
- **Arketype:** F — Settings + profile (template-editor)
- **Tier-gating:** Pro+ (Free har faste systemmaler, Pro kan endre + lage egne)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/email-templates.html`
- **Audit:** `wireframe/audit/coachhq-email-templates.md`
- **Tilhørende modaler:** `NewTemplateModal`, `PreviewTemplateModal`, `SendTestEmailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

E-post-maler er teksten Anders sender ut til spillere og foreldre — velkomst-e-post, plan-publisert, fakturapåminnelse, oppfølging etter prøvetime. Skjermen lar Anders endre tekst, legge til variabler (`{firstName}`, `{planName}`), og forhåndsvise resultatet i renderet form. Pro-coach kan lage helt nye maler; Free får kun systemmaler.

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec. Split-view: mal-liste til venstre, editor til høyre.

### Venstre kolonne: Mal-liste (320px)

Søk-felt øverst + filter-chips: System / Egne / Auto-trigger / Manuell.

Liste:
- **System-maler (kan endres tekst, ikke struktur):**
  - Velkomst — ny spiller
  - Velkomst — ny forelder
  - Plan publisert
  - Plan oppdatert
  - Booking bekreftet
  - Faktura sendt
  - Faktura forfalt (1. påminnelse)
  - Faktura forfalt (2. påminnelse — strengere)
- **Egne maler (Pro):**
  - Sommer-camp invitasjon
  - Tilbakemelding etter prøvetime
  - Reaktiverings-mail (inaktiv >60d)
  - Fødselsdags-hilsen

Active-mal har accent venstre-border + bg.

CTA bunn: `+ Ny mal` → `NewTemplateModal`

### Høyre kolonne: Editor (når mal valgt)

#### Header
- Mal-navn (input, inline-edit)
- Status: "Aktiv" / "Draft" / "Deprecated"
- Type: Auto-trigger (`booking.confirmed`) eller Manuell

#### Toolbar
- Locale-velger: NO (default) / EN
- "Forhåndsvis →" → `PreviewTemplateModal` (rendet med mock-data)
- "Send test til meg →" → `SendTestEmailModal`
- "Endrings-historikk →" link

#### Form-felt
| Felt | Type |
|---|---|
| Subject | Input (max 80 tegn, viser counter) |
| Preheader (preview-tekst i innboks) | Input (max 120 tegn) |
| Body (rich-text editor) | WYSIWYG eller markdown-toggle |
| Footer (signatur) | Read-only (system-default) eller "Bruk egen →" |

#### Side-panel: Variabler (kollapsbart)

Liste over tilgjengelige variabler — klikk for å sette inn på cursor-pos:
- `{firstName}` — Spillerens fornavn
- `{lastName}` — Etternavn
- `{coachName}` — Coach-navn (Anders K)
- `{planName}` — Plan-tittel
- `{date}` — Dato (formatert NO)
- `{time}` — Klokkeslett
- `{facility}` — Fasilitet-navn
- `{amount}` — Beløp i kr (formatert)
- `{loginLink}` — Magic-link til PlayerHQ

Eksempel-rendering vises live i body når variabel settes inn.

### Save-bar (bunn)

Sticky med "1 endring ulagret" + Avbryt/Lagre/Lagre + send test.

### Farezone

- "Slett mal" — destructive (kun for egne maler, system-maler kan kun deprecates)

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Mal-rad (liste) | default, hover, active (accent border) |
| Variable-pill | default, hover (lift), klikk → settes inn på cursor-pos |
| WYSIWYG-toolbar (B/I/U/lenke/liste) | default, hover, active når formattering på |
| "Forhåndsvis" | default, hover, klikk → modal med rendet HTML i iframe |
| "Send test" | default, hover, loading, success (toast "Sendt til anders@akgolf.no") |
| Locale-toggle | default, hover, active per locale |
| Slett mal | default, hover destructive, klikk → confirm |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Empty (ingen valgt):** Stor sentrert tekst "Velg en mal til venstre, eller lag ny →"
- **Subject for langt:** Counter blir rød + warning "Mange e-postklienter trunkerer >50 tegn"
- **Variabel-error:** Hvis `{firstName}` ikke finnes for mottaker: warning ved forhåndsvisning
- **Tier-gate Free:** Editor er read-only for system-maler, "Pro: Endre maler → Oppgrader" banner

## Ønsket output fra Claude Design

1. Lyst tema, "Velkomst — ny spiller" valgt (full editor synlig)
2. Mørkt tema, "Sommer-camp invitasjon" valgt
3. Variabel-panel åpent, hover på `{firstName}` med insert-tooltip
4. Forhåndsvis-modal åpen med rendet e-post i iframe
5. Tier-gate (Free, system-mal i read-only)
6. Mobil ≤640px — liste blir dropdown øverst, editor full bredde

## Ikke-mål

- Ikke designe `NewTemplateModal`, `PreviewTemplateModal`, `SendTestEmailModal` (egen batch)
- Ikke implementere markdown→HTML-rendering (kode-jobb)
- Ikke designe e-post-stil-templates (HTML-design — egen prosjekt)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
