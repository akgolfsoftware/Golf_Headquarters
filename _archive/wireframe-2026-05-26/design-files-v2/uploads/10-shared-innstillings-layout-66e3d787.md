# AK Golf Platform — Shared — Innstillings-layout

## Identitet

- **Produkt:** Shared / cross-cutting
- **URL:** Ikke en faktisk URL — referanse-skjerm for hvordan settings-mønsteret bygges
- **Arketype:** F — Settings + profile (master-template)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/innstillings-layout.html`
- **Audit:** finnes ikke — denne pakken ER spec
- **Tilhørende modaler:** Ingen direkte

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Innstillings-layout er **mal-skjermen** alle settings-flater i hele plattformen bygger på. CoachHQ-settings, PlayerHQ-meg-skjermer, framtidig klubb-admin og foreldreportal-settings — alt arver herfra. Når en designer eller utvikler trenger å vite "hvordan ser en settings-side ut?", er svaret denne pakken.

## Layout — UNIKT for denne skjermen

Skjermen viser 3 stadier av samme layout side-om-side (eller stacked på mobil), som referanse:

### Visning A: Empty state (ingen data lastet)

Standard 3-kolonne med:
- Sidebar (produkt-spesifikk, her blank for nøytralitet)
- Settings-sub-nav vertikal liste:
  - Profil (active)
  - Sikkerhet
  - Varsler
  - API
  - Abonnement
- Form-area med skeleton (4 felt-skeleton-rader)

### Visning B: Read-only default

Samme layout, men:
- Sub-nav viser "Profil" som aktiv (accent-bg + venstre 4px accent-border)
- Form-area har 4 felt-rader:
  - "Fullt navn: Anders Kristiansen [Endre →]"
  - "E-post: anders@akgolf.no [Endre →]"
  - "Mobil: +47 412 34 567 [Endre →]"
  - "Avatar: [thumbnail] [Endre →]"
- Save-bar skjult (form clean)

### Visning C: Active edit (inline-edit + dirty form)

Samme layout, men:
- "E-post"-feltet er i edit-mode: input-felt med fokus, value selected, [Avbryt] [Lagre] knapper inline
- Save-bar synlig nederst: "1 endring ulagret" + Avbryt/Lagre
- Toast i hjørnet: "E-post oppdatert kl 14:32" (success-state fra forrige edit)

### Designsystem-tokens dokumentert (sidebar høyre)

Liten "spec-card" på høyre side viser:
- Sub-nav active-state: `bg-primary/10 border-l-2 border-primary text-primary font-medium`
- Sub-nav default: `text-muted-foreground hover:bg-muted hover:text-foreground`
- Felt-row: `border-b border-border py-4 flex items-center justify-between`
- Edit-link: `text-sm text-primary hover:underline`
- Save-bar: `sticky bottom-0 bg-background/95 backdrop-blur border-t border-border py-3 px-6`
- Farezone: `border border-destructive/30 bg-destructive/5 rounded-lg p-6 mt-12`

## Pyramide / hierarki regler

1. **Sub-nav** sticky til venstre (eller dropdown øverst på mobil)
2. **Form-seksjoner** har én H3-tittel + valgfritt description-tekst under
3. **Felter** er minst 56px høye (touch-target)
4. **Read-only først** — alltid. Edit-mode er en bevisst handling.
5. **Save-bar kun hvis multi-felt-form** — ellers per-felt-lagring med inline-toast
6. **Farezone alltid nederst**, separert med 48px+ margin

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Sub-nav-item | default, hover, active (4px venstre-border + bg accent/10) |
| Felt-row | default, hover (subtil bg-muted/30) |
| "Endre →" link | default, hover (underline) |
| Inline-edit input | fokus, valid, invalid (rød border) |
| "Lagre" inline | default, loading, success (grønn check fade) |
| Save-bar | hidden, slide-in fra bunn |
| Toast | slide-in høyre, auto-dismiss 3 sek |

## Empty / loading / error

Mønster:
- **Loading:** Skeleton-form (4 rader)
- **Error:** Per-felt rød tekst + retry-link
- **Save-error:** Toast destructive "Kunne ikke lagre. Prøv igjen."
- **Konflikt:** Hvis felt er endret av annen sesjon: "Verdien ble endret av annen enhet. Last på nytt? →"

## Ønsket output fra Claude Design

1. Visning A (empty/skeleton) lyst tema
2. Visning B (read-only) lyst tema
3. Visning C (edit + save-bar) lyst tema
4. Visning B mørkt tema
5. Mobil ≤640px — sub-nav blir dropdown øverst, save-bar full bredde nederst
6. Spec-card med token-dokumentasjon synlig

## Ikke-mål

- Ikke designe konkrete settings-flater (de finnes i pakker 1–9)
- Ikke implementere generic settings-component i kode (det skjer i framtidig refactor)
- Ikke designe wizard-flow (det er Arketype D, ikke F)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
