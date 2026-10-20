# Tema: lys og mørk

Samordnet med `src/lib/v2/tema-default.ts`, `src/app/layout.tsx` og de låste beslutningene 10.09.2026. Dette beskriver temaoppførselen; [designkartet](../../designsystem/README.md) velger den visuelle fasiten.

| Flate | Standard uten lagret valg | Lagret valg |
|---|---|---|
| PlayerHQ `/portal` | Mørk | Lys/mørk-cookie vinner |
| AgencyOS `/admin` | Mørk | Lys/mørk-cookie vinner |
| Forelder `/forelder` | Lys | Lys/mørk-cookie vinner |
| Auth `/auth` | Lys | Den felles temafunksjonen tar hensyn til cookie |
| Landingssider, inkludert offentlig booking | Lys | Alltid lys, også ved mørk-cookie |
| Andre ruter | Mørk i felles temafunksjon | Eget merkeskall kan styre sin flate; kontroller faktisk layout |

`onsketTema(path, temaCookie, erLandingsside)` er den felles funksjonen. Rot-layouten bruker listen `LANDINGSSIDER`; `V2Shell` samordner tema ved navigasjon. Cookie heter `ak-v2-tema`.

Train-lock bruker sort/hvit scene og produktets vedtatte fonter. Det gamle dokumentet fra juli beskrev motsatt standard på flere flater og er erstattet. Ikke gjeninnfør Paper-variabler eller en egen temafunksjon fra den teksten.

Kontroller både første sidelasting og navigasjon mellom ruter, med og uten cookie. Et korrekt attributt beviser ikke korrekt kontrast eller komplett styling; det krever skjermkontrollen i `tests/visual/README.md`.
