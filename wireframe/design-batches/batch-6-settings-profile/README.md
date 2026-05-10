# Batch 6 — Settings + Profile (Arketype F)

**Antall pakker:** 22 (19 skjermer + 3 modaler)
**Status:** Klar for claude.ai/design
**Estimert tid:** 5–7 timer

## Hvorfor denne batchen nå

Settings, profil og kapabilitets-konfig er det som binder hele plattformen sammen. Når Anders eller en spiller endrer profilbilde, slår av e-post-varsler, eller justerer en CBAC-rolle, skal alt skje i **samme visuelle ramme** — uansett hvilket produkt (CoachHQ, PlayerHQ, eller tverrgående admin). Pilot-batchene 1–5 etablerte hvordan vi viser data; denne batchen etablerer **hvordan vi endrer data**.

Når Arketype F er stabil, kan alle framtidige settings-flater (klubb-settings i akgolf-portal, foreldreportal-settings) bruke samme grunnmal.

## Arketype F — felles spec (gjelder alle 19 skjermer + 3 modaler)

Disse mønstrene skal være konsistente på tvers av alle settings/profile-skjermer. Vis variasjon i innhold og form-felter, ikke i layout.

### Layout

```
+--------------------------------------------------+
|  Sidebar  |  Hero (italic editorial title)       |
|           +--------------------------------------+
|  (prod-   |  Settings-sub-nav (sticky, vertikal) |
|   sidebar)|  - Profil                            |
|           |  - Sikkerhet                         |
|           |  - Varsler                           |
|           |  - API + integrasjoner               |
|           |  - Abonnement                        |
|           |                                      |
|           |  --------+---------------------------|
|           |          |  Form-seksjon             |
|           |          |  +---------------------+  |
|           |          |  | Felt 1   [Endre ->]|  |
|           |          |  +---------------------+  |
|           |          |  +---------------------+  |
|           |          |  | Felt 2 (toggle)  () |  |
|           |          |  +---------------------+  |
|           |          |                           |
|           |          |  [Avbryt]  [Lagre]        |
|           +--------------------------------------+
```

Tre-kolonne-layout: produkt-sidebar (CoachHQ to-lags rail+nav, PlayerHQ tab-bar mobil eller venstre-sidebar desktop), settings-sub-nav (vertikal liste, sticky), og form-area med seksjoner.

### Read-only-felter med "Endre →"-link

Default visning av et felt er **read-only** — verdien vises som tekst med "Endre →"-link i høyre. Klikk åpner inline-edit (input + Lagre/Avbryt) eller modal (for store endringer som passord, avatar, kansellering).

Dette gjør at skjermen ser rolig ut når man kommer inn, og man kan ikke endre noe ved et uhell.

### Per-felt-lagring vs save-bar

Default: **per-felt-lagring** (klikk Endre, gjør endring, klikk Lagre, toast bekrefter). Save-bar bunnen brukes kun når flere felter henger sammen (f.eks. notifikasjons-preferanser hvor du krysser av flere bokser før du lagrer alt).

Save-bar er sticky bunn med `[Avbryt] [Lagre endringer]`. Vises kun når formen er dirty.

### Toggle-grupper med tydelige labels

Toggle-switcher har alltid **både label og description**. Eksempel:

```
[ Push-varsler                       ]  ()
  Få varsler i nettleseren når
  noe haster.
```

Toggle-track: `--muted` av, `--accent` på. Sirkel-thumb hvit, 16px. Ingen "ON/OFF"-tekst inni — kun visuell state.

### Form-felt-mønster

| Felt-type | Default | Validering | Hjelpe-tekst |
|---|---|---|---|
| Text input | Read-only "Endre →" → input | Inline rød tekst under | Muted 12px under input |
| Avatar | Read-only thumbnail "Endre →" → AvatarUploadModal | Filsize/type-error i modal | "Min 256x256, PNG/JPG, maks 5 MB" |
| Toggle | Default-state vises | Ingen | Description under label |
| Select/dropdown | Read-only label "Endre →" → select | Required-validering | Muted 12px |
| Passord | Maskert som `••••••••` "Endre →" → ChangePasswordModal | Inni modal | "Min 12 tegn, 1 stort, 1 tall" |
| Sletting | Destructive-knapp i farezone bunn | Confirm-modal | "Dette kan ikke angres" |

### Status-indikatorer

- **Lagret:** grønn `Check`-ikon + "Lagret kl 14:32" som forsvinner etter 3 sek
- **Lagring pågår:** spinner inni "Lagre"-knapp + disabled state
- **Feil:** rød tekst inline + "Prøv igjen"-link
- **Uendret siden sist:** ingen indikator (default)

### Farezone

Destructive aksjoner (slett konto, kanseller abonnement, slett API-nøkkel) ligger i en **farezone** nederst på skjermen — separat seksjon med `border-destructive/30` og `bg-destructive/5`. Headern: "Farlig sone". Knappene er destructive og krever alltid confirm-modal.

### Empty / loading / error / success

- **Loading:** Skeleton-form med 4 felt-rader (label-bar + input-bar)
- **Error (lagring):** Inline rød tekst + retry-link (`Prøv igjen`)
- **Success:** Grønn toast bunn-høyre "Endring lagret" — forsvinner etter 3 sek
- **Tom seksjon:** F.eks. "Ingen API-nøkler ennå. Lag din første →"

### Mobil-versjon

- Sub-nav blir horisontal scroll-tab eller dropdown øverst
- Form-area tar full bredde
- Save-bar blir sticky bunn med full bredde-knapper
- Modaler blir bottom-sheet

### Responsive breakpoints

- Desktop: ≥1024px — full 3-kolonne (sidebar + sub-nav + form)
- Tablet: 768–1023px — sidebar collapses til ikoner, sub-nav synlig
- Mobil: ≤640px — sub-nav blir tab-bar, form full bredde

---

## Per-skjerm-pakker (22)

### CoachHQ Settings (5)
1. `01-coachhq-coach-profil.md` — Coach-profil (egen profil-side)
2. `02-coachhq-settings-bruker.md` — Bruker-innstillinger
3. `03-coachhq-settings-sikkerhet.md` — Sikkerhet (2FA, sesjoner)
4. `04-coachhq-settings-api.md` — API-nøkler + webhooks
5. `05-coachhq-tilgjengelighet.md` — Coach-kalender (åpningstider)

### PlayerHQ Settings (4)
6. `06-playerhq-meg-profil.md` — Min profil
7. `07-playerhq-meg-helse.md` — Helse (skader, restitusjon)
8. `08-playerhq-meg-notif.md` — Varsler
9. `09-playerhq-meg-abonnement.md` — Abonnement (Free/Pro/Elite)

### Tverrgående settings (5)
10. `10-shared-innstillings-layout.md` — Felles settings-layout
11. `11-shared-cbac-matrise.md` — CBAC matrise (rolle x capability)
12. `12-shared-tilgangskontroll.md` — Tilgangskontroll
13. `13-shared-notifikasjons-taxonomy.md` — Notif-taksonomi
14. `14-shared-design-tokens.md` — Design-tokens (intern viewer)

### CoachHQ verktøy (5)
15. `15-coachhq-team.md` — Coach-team (utvidet)
16. `16-coachhq-groups.md` — Grupper (utvidet)
17. `17-coachhq-email-templates.md` — E-post-maler
18. `18-coachhq-agenter.md` — Agent-konfig
19. `19-coachhq-teknisk-plan.md` — Teknisk plan (intern roadmap)

### Modaler (3)
20. `20-modal-avatar-upload.md` — AvatarUploadModal
21. `21-modal-change-password.md` — ChangePasswordModal
22. `22-modal-cancel-subscription.md` — CancelSubscriptionModal

## Slik bruker du hver pakke

Samme oppskrift som batch 1–5:

1. Last opp `branding-style-guide.html` + `design-system-v2.md` som system-kontekst (én gang per session)
2. Per pakke: åpne `0X-{navn}.md`, last opp tilhørende HTML-wireframe, kopier prompt, iterer
3. Lim design-link tilbake til Claude Code

## Gate

Alle 22 pakker må være `APPROVED` før vi går til batch 7 (other) eller fortsetter med implementasjon.
