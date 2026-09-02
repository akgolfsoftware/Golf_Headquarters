# Train-lock — kontrast, målt

GENERERT av `scripts/check-tl-kontrast.mjs` fra `src/styles/train-lock-tokens.css`. Ikke rediger. Datoen står i git-loggen, ikke her — ellers ville hver `npm run verify` skitnet til arbeidstreet. 40 par, 12 brudd.

Et brudd her er IKKE en ordre om å endre tokenet — Train-lock er fasit (CLAUDE.md invariant 2). Det er en ordre om å ikke bruke paret som brødtekst: bruk fargen som grafikk, som stor tekst (fra 21 px), eller bytt til `text`/`mute`. Endres et token, er det etter beslutning fra Anders.

## Lys

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

## Mørk

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
