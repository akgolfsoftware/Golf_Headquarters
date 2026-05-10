# AK Golf Platform — PlayerHQ — Min profil

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/meg/profil`
- **Arketype:** F — Settings + profile
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/playerhq/meg-profil.html`
- **Audit:** `wireframe/audit/playerhq-meg-profil.md`
- **Tilhørende modaler:** `AvatarUploadModal`, `ChangePasswordModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Min profil er stedet hvor Markus (eller en annen spiller) ser og endrer egen info. Profilbilde, kontakt, golf-info (HCP, klubb, dominant hånd), foreldre-relasjoner (hvis junior). Skjermen brukes typisk én gang ved onboarding, og deretter sjelden — kanskje når HCP endrer seg eller man bytter klubb.

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec. To-kolonne form-layout:

### Venstre kolonne (sticky 280px)

- Stor avatar (140x140) "Endre →" → `AvatarUploadModal`
- Navn (Geist 22px) + tier-badge under (Free/Pro/Elite)
- Kategori-pill (A/B/C…) under navn
- 3 stat-rader vertikalt:
  - "HCP +2,4" (JetBrains Mono)
  - "Klubb: GFGK"
  - "Coach: Anders Kristiansen"
- Lenke: "Se min offentlige profil →" (kun hvis Pro/Elite)

### Høyre kolonne (form-seksjoner)

**Seksjon: Personalia**
| Felt | Default |
|---|---|
| Fullt navn | "Markus Roinaas Pedersen" |
| Visningsnavn (i meldinger) | "Markus" |
| E-post | "markus@example.no" |
| Mobil | "+47 412 34 567" |
| Fødselsdato | "8. august 2008 (17 år)" |
| Adresse | "Bjørndalsbrott 12, 1605 Fredrikstad" |

**Seksjon: Golf-info**
| Felt | Default |
|---|---|
| HCP (auto fra GolfBox) | "+2,4" — read-only med "Sync fra GolfBox →" |
| GolfBox-ID | "12345678" — read-only |
| Hjemklubb | Dropdown: "Gamle Fredrikstad GK" |
| Sekundær-klubb | Dropdown: "Bossum GK" |
| Dominant hånd | Radio: "Høyre" / "Venstre" |
| Kjønn (NGF-rapportering) | Radio: "Mann" / "Kvinne" / "Annet/ønsker ikke svare" |
| Spiller-kategori | "A" — read-only ("Endres av coach Anders") |

**Seksjon: Foreldre / foresatte (junior)**

Vises kun hvis spiller er under 18.

| Relasjon | Navn | Kontakt | Tilgang |
|---|---|---|---|
| Mor | Anne Pedersen | anne@example.no, +47 911 22 333 | Full innsyn |
| Far | Tor Pedersen | tor@example.no, +47 922 33 444 | Kun fakturaer |

CTA: `+ Legg til forelder` → modal (utenfor batch)

**Seksjon: Personvern**
| Felt | Default |
|---|---|
| Vis HCP på leaderboard | Toggle (på) |
| Vis runde-historikk for klubbkamerater | Toggle (på) |
| Coach kan dele runder eksternt | Toggle (av) |

**Farezone**
- "Eksporter alle mine data" — secondary
- "Be om sletting av konto" — destructive (sender forespørsel til coach, ikke umiddelbar)

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Avatar (klikk) | default, hover (overlay "Endre"), klikk → modal |
| HCP "Sync fra GolfBox" | default, hover, loading (spinner), success (toast "HCP oppdatert: +2,4 → +2,3"), error |
| "Endres av coach Anders" tooltip | default, hover (popover med forklaring) |
| Forelder-rad | default, hover, klikk → rediger-modal |
| Tilgang-pill | default, hover (info-popover med scope-detaljer) |
| "Be om sletting" | default, hover (mørkere destructive), klikk → confirm + sender til coach |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Manglende GolfBox-ID:** Banner "Koble til GolfBox for auto-HCP →" (gul, dismissable)
- **Empty foreldre (junior):** "Ingen foreldre lagt til. Foreldre får tilgang til fakturaer og coaching →"
- **Sync-error:** "Kunne ikke hente fra GolfBox. Prøv igjen om litt."

## Ønsket output fra Claude Design

1. Lyst tema, junior-spiller (Markus 17 år) med 2 foreldre
2. Mørkt tema, voksen spiller (uten foreldre-seksjon)
3. HCP-sync pågår (loading + toast)
4. Empty-state foreldre
5. Hover på "Endres av coach"-tooltip
6. Mobil ≤640px — venstre kolonne stables på topp, form full bredde

## Ikke-mål

- Ikke designe `AvatarUploadModal`, `ChangePasswordModal` (egen pakke)
- Ikke designe foreldre-portal (egen Fase)
- Ikke designe GolfBox-OAuth-flyt (sync-knappen er bare trigger)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
