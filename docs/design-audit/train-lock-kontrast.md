# Train-lock — kontrast, målt

GENERERT av `scripts/check-tl-kontrast.mjs` fra `src/styles/train-lock-tokens.css` og `src/styles/train-lock-valgt.css`. Ikke rediger. Datoen står i git-loggen, ikke her — ellers ville hver `npm run verify` skitnet til arbeidstreet. 88 par, 25 brudd.

Tabellene skiller det eldre laget fra ZIP (4), valgt av Anders 10.09.2026. Brudd betyr at fargeparet ikke skal brukes som vanlig tekst. Fargene kan brukes i grafikk eller stor tekst når det aktuelle kontrastkravet holder; liten tekst bruker et målt lesbart par. Tintede flater og faktisk skjermbruk krever egen nettleserkontroll.

## Eldre lag — lys

| Tekst | Flate | Målt | Krav | | Merknad |
|---|---|---:|---:|---|---|
| `text` #111111 | `scene` #FFFFFF | **18,9:1** | 4,5:1 | holder |  |
| `text` #111111 | `elev` #F2F2F2 | **16,9:1** | 4,5:1 | holder |  |
| `text` #111111 | `dock` #E9E9EB | **15,6:1** | 4,5:1 | holder |  |
| `mute` #6E6E73 | `scene` #FFFFFF | **5,1:1** | 4,5:1 | holder | sekundærtekst · caps-etikett |
| `mute` #6E6E73 | `elev` #F2F2F2 | **4,5:1** | 4,5:1 | holder |  |
| `mute` #6E6E73 | `dock` #E9E9EB | **4,2:1** | 4,5:1 | **BRUDD** |  |
| `on-fill` #FFFFFF | `fill` #000000 | **21,0:1** | 4,5:1 | holder | primær CTA |
| `on-danger` #FFFFFF | `danger` #FF3B30 | **3,5:1** | 4,5:1 | **BRUDD** | Kø-badge |
| `danger` #FF3B30 | `scene` #FFFFFF | **3,5:1** | 4,5:1 | **BRUDD** | feilmelding som tekst |
| `danger` #FF3B30 | `elev` #F2F2F2 | **3,2:1** | 4,5:1 | **BRUDD** |  |
| `ok` #34C759 | `scene` #FFFFFF | **2,2:1** | 4,5:1 | **BRUDD** | PUBLISERT / Godta som tekst |
| `ok` #34C759 | `elev` #F2F2F2 | **2,0:1** | 4,5:1 | **BRUDD** |  |
| `warm` #B85C3D | `scene` #FFFFFF | **4,5:1** | 4,5:1 | holder | fullført-hake som tekst |
| `warm` #B85C3D | `elev` #F2F2F2 | **4,0:1** | 3,0:1 | holder | hake er grafikk |
| `warn` #FFD60A | `scene` #FFFFFF | **1,4:1** | 3,0:1 | **BRUDD** | warn-pille — grafikk |
| `warn` #FFD60A | `elev` #F2F2F2 | **1,3:1** | 3,0:1 | **BRUDD** |  |
| `viz-target` #0A84FF | `scene` #FFFFFF | **3,6:1** | 4,5:1 | **BRUDD** | StatusPill tone=info som tekst |
| `viz-target` #0A84FF | `elev` #F2F2F2 | **3,3:1** | 4,5:1 | **BRUDD** |  |
| `on-avatar` #201409 | `avatar` #B08968 | **5,7:1** | 4,5:1 | holder | initialer i ØR-sirkelen |
| `dim` #DDDDDE | `scene` #FFFFFF | **1,4:1** | 1,5:1 | **BRUDD** | spor/skjelett — skal bare synes |

## Eldre lag — mørk

| Tekst | Flate | Målt | Krav | | Merknad |
|---|---|---:|---:|---|---|
| `text` #F5F5F5 | `scene` #000000 | **19,3:1** | 4,5:1 | holder |  |
| `text` #F5F5F5 | `elev` #161616 | **16,6:1** | 4,5:1 | holder |  |
| `text` #F5F5F5 | `dock` #1C1C1E | **15,6:1** | 4,5:1 | holder |  |
| `mute` #8E8E93 | `scene` #000000 | **6,4:1** | 4,5:1 | holder | sekundærtekst · caps-etikett |
| `mute` #8E8E93 | `elev` #161616 | **5,6:1** | 4,5:1 | holder |  |
| `mute` #8E8E93 | `dock` #1C1C1E | **5,2:1** | 4,5:1 | holder |  |
| `on-fill` #000000 | `fill` #FFFFFF | **21,0:1** | 4,5:1 | holder | primær CTA |
| `on-danger` #FFFFFF | `danger` #FF453A | **3,4:1** | 4,5:1 | **BRUDD** | Kø-badge |
| `danger` #FF453A | `scene` #000000 | **6,2:1** | 4,5:1 | holder | feilmelding som tekst |
| `danger` #FF453A | `elev` #161616 | **5,3:1** | 4,5:1 | holder |  |
| `ok` #30D158 | `scene` #000000 | **10,4:1** | 4,5:1 | holder | PUBLISERT / Godta som tekst |
| `ok` #30D158 | `elev` #161616 | **9,0:1** | 4,5:1 | holder |  |
| `warm` #B85C3D | `scene` #000000 | **4,6:1** | 4,5:1 | holder | fullført-hake som tekst |
| `warm` #B85C3D | `elev` #161616 | **4,0:1** | 3,0:1 | holder | hake er grafikk |
| `warn` #FFD60A | `scene` #000000 | **14,9:1** | 3,0:1 | holder | warn-pille — grafikk |
| `warn` #FFD60A | `elev` #161616 | **12,8:1** | 3,0:1 | holder |  |
| `viz-target` #0A84FF | `scene` #000000 | **5,8:1** | 4,5:1 | holder | StatusPill tone=info som tekst |
| `viz-target` #0A84FF | `elev` #161616 | **5,0:1** | 4,5:1 | holder |  |
| `on-avatar` #201409 | `avatar` #B08968 | **5,7:1** | 4,5:1 | holder | initialer i ØR-sirkelen |
| `dim` #2C2C2E | `scene` #000000 | **1,5:1** | 1,5:1 | holder | spor/skjelett — skal bare synes |

## Valgt ZIP (4) — lys PlayerHQ/AgencyOS

| Tekst | Flate | Målt | Krav | | Merknad |
|---|---|---:|---:|---|---|
| `text` #111111 | `scene` #F2F1ED | **16,7:1** | 4,5:1 | holder |  |
| `text` #111111 | `elev` #FFFFFF | **18,9:1** | 4,5:1 | holder |  |
| `text` #111111 | `dock` #E9E9EB | **15,6:1** | 4,5:1 | holder |  |
| `mute` #69696E | `scene` #F2F1ED | **4,8:1** | 4,5:1 | holder | sekundærtekst · caps-etikett |
| `mute` #69696E | `elev` #FFFFFF | **5,5:1** | 4,5:1 | holder |  |
| `mute` #69696E | `dock` #E9E9EB | **4,5:1** | 4,5:1 | holder |  |
| `on-fill` #FFFFFF | `fill` #000000 | **21,0:1** | 4,5:1 | holder | primær CTA |
| `on-danger` #FFFFFF | `danger` #FF3B30 | **3,5:1** | 4,5:1 | **BRUDD** | Kø-badge |
| `danger` #FF3B30 | `scene` #F2F1ED | **3,1:1** | 4,5:1 | **BRUDD** | feilmelding som tekst |
| `danger` #FF3B30 | `elev` #FFFFFF | **3,5:1** | 4,5:1 | **BRUDD** |  |
| `ok` #34C759 | `scene` #F2F1ED | **2,0:1** | 4,5:1 | **BRUDD** | PUBLISERT / Godta som tekst |
| `ok` #34C759 | `elev` #FFFFFF | **2,2:1** | 4,5:1 | **BRUDD** |  |
| `warm-text` #111111 | `scene` #F2F1ED | **16,7:1** | 4,5:1 | holder | v3 liten tekst |
| `warm-text` #111111 | `elev` #FFFFFF | **18,9:1** | 4,5:1 | holder |  |
| `warm-ink` #B85C3D | `scene` #F2F1ED | **4,0:1** | 4,5:1 | **BRUDD** | v3 kilde: bare stor tekst på papir |
| `warm-ink` #B85C3D | `elev` #FFFFFF | **4,5:1** | 4,5:1 | holder |  |
| `warm` #D4611A | `scene` #F2F1ED | **3,4:1** | 4,5:1 | **BRUDD** | fullført-hake som tekst |
| `warm` #D4611A | `elev` #FFFFFF | **3,8:1** | 3,0:1 | holder | hake er grafikk |
| `warn` #FFD60A | `scene` #F2F1ED | **1,2:1** | 3,0:1 | **BRUDD** | warn-pille — grafikk |
| `warn` #FFD60A | `elev` #FFFFFF | **1,4:1** | 3,0:1 | **BRUDD** |  |
| `viz-target` #0A84FF | `scene` #F2F1ED | **3,2:1** | 4,5:1 | **BRUDD** | StatusPill tone=info som tekst |
| `viz-target` #0A84FF | `elev` #FFFFFF | **3,6:1** | 4,5:1 | **BRUDD** |  |
| `on-avatar` #201409 | `avatar` #B08968 | **5,7:1** | 4,5:1 | holder | initialer i ØR-sirkelen |
| `dim` #DDDDDE | `scene` #F2F1ED | **1,2:1** | 1,5:1 | **BRUDD** | spor/skjelett — skal bare synes |

## Valgt ZIP (4) — mørk PlayerHQ/AgencyOS

| Tekst | Flate | Målt | Krav | | Merknad |
|---|---|---:|---:|---|---|
| `text` #F5F5F5 | `scene` #000000 | **19,3:1** | 4,5:1 | holder |  |
| `text` #F5F5F5 | `elev` #161616 | **16,6:1** | 4,5:1 | holder |  |
| `text` #F5F5F5 | `dock` #1C1C1E | **15,6:1** | 4,5:1 | holder |  |
| `mute` #8E8E93 | `scene` #000000 | **6,4:1** | 4,5:1 | holder | sekundærtekst · caps-etikett |
| `mute` #8E8E93 | `elev` #161616 | **5,6:1** | 4,5:1 | holder |  |
| `mute` #8E8E93 | `dock` #1C1C1E | **5,2:1** | 4,5:1 | holder |  |
| `on-fill` #000000 | `fill` #FFFFFF | **21,0:1** | 4,5:1 | holder | primær CTA |
| `on-danger` #FFFFFF | `danger` #FF453A | **3,4:1** | 4,5:1 | **BRUDD** | Kø-badge |
| `danger` #FF453A | `scene` #000000 | **6,2:1** | 4,5:1 | holder | feilmelding som tekst |
| `danger` #FF453A | `elev` #161616 | **5,3:1** | 4,5:1 | holder |  |
| `ok` #30D158 | `scene` #000000 | **10,4:1** | 4,5:1 | holder | PUBLISERT / Godta som tekst |
| `ok` #30D158 | `elev` #161616 | **9,0:1** | 4,5:1 | holder |  |
| `warm-text` #E8752A | `scene` #000000 | **7,0:1** | 4,5:1 | holder | v3 liten tekst |
| `warm-text` #E8752A | `elev` #161616 | **6,0:1** | 4,5:1 | holder |  |
| `warm-ink` #E8752A | `scene` #000000 | **7,0:1** | 4,5:1 | holder | v3 kilde: bare stor tekst på papir |
| `warm-ink` #E8752A | `elev` #161616 | **6,0:1** | 4,5:1 | holder |  |
| `warm` #E8752A | `scene` #000000 | **7,0:1** | 4,5:1 | holder | fullført-hake som tekst |
| `warm` #E8752A | `elev` #161616 | **6,0:1** | 3,0:1 | holder | hake er grafikk |
| `warn` #FFD60A | `scene` #000000 | **14,9:1** | 3,0:1 | holder | warn-pille — grafikk |
| `warn` #FFD60A | `elev` #161616 | **12,8:1** | 3,0:1 | holder |  |
| `viz-target` #0A84FF | `scene` #000000 | **5,8:1** | 4,5:1 | holder | StatusPill tone=info som tekst |
| `viz-target` #0A84FF | `elev` #161616 | **5,0:1** | 4,5:1 | holder |  |
| `on-avatar` #201409 | `avatar` #B08968 | **5,7:1** | 4,5:1 | holder | initialer i ØR-sirkelen |
| `dim` #2C2C2E | `scene` #000000 | **1,5:1** | 1,5:1 | holder | spor/skjelett — skal bare synes |
