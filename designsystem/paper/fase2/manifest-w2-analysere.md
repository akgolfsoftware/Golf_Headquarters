# W2 — manifest: PlayerHQ Analysere-undersider

**Skrevet:** 2026-08-08 · **Kilde:** `docs/port/w2-komponent-manifest-analysere.md` (repo, godkjent utkast).
**Konsolideringsfunn (verifisert mot kode, ikke gjettet):** kun 2 reelle ruter finnes under
`/portal/analys*` — det gamle anslaget «41 skjermer, 40 uten fasit» talte trolig faner/tilstander
som egne rader. Én rute er ren redirect (`/portal/analyse` → `/portal/analysere`, ikke tegnet).
Dermed 1 fil i denne bølgen, langt under ≤12-taket.

## Filer

| Rute | Fil | Mal | Tilstander | CTA |
|---|---|---|---|---|
| `/portal/analysere` | *(uendret — allerede fasit)* `fase1/playerhq-analyse.html` | §11 dashbord-rutenett (3 faner over dashbord-paneler) | F/T/L/E | «Legg inn [sone]-økt denne uka» (`.btn.now`, dokk) — trenger ny kode-PR som retter `.btn.now`-mønster + 720px-bredde, ikke ny tegning |
| `/portal/analysere/hull` | `fase2/playerhq/playerhq-analyse-hull.html` | §12 detaljside, todelt (Sone-kart + Hull for hull) | Suksess · Tom | Ingen primær «Én ting nå» — navigasjon via 2 faner + tilbakelenke til Analyse. Tom-tilstand har ingen CTA (informativ, viser vei via I dag-fanen) |

## Konsolideringsvedtak

- **`/portal/analyse`** — stub, ren `redirect("/portal/analysere")`. Ikke tegnet.
- **Talent-familie, `/portal/gameplan`, `/portal/datagolf`, `/portal/mal/trackman(/[id])`,
  `/portal/mal/runder(/[id])`** — egne dybdeskjermer utenfor Analysere-hub, ikke del av denne
  bølgen (egen PR-kø i repoet, se `skjermplan-tegnet-og-wireframe.md` §W2).

## Komponentbruk (hull-analysen)

Sone-kart-fanen: sone-diagram (4 blokker tee→innspill→nærspill→putt, koblet av linje) + SG-per-sone-stolper
(delt mønster med `playerhq-analyse.html` sin SgBreakdown) + per-sone-liste med mini-sparkline.
Hull for hull-fanen: KPI-fliser (score/mot par/snitt) + 18-hulls scorekort-tabell (klebrig hode,
egen scroll-container — DataTable-mønsteret, ikke kort-på-mobil) + varmekart UT/INN (én risikofarge,
`--dn`, aldri blandet med `--up`).

Begge faner har egen tom-tilstand (matcher kildekomponentens uavhengige `harData`-sjekk per fane):
Sone-kart viser sonene med «—» + forklaringskort når 0 SG-registreringer; Hull for hull viser
«ingen runder» + «for få runder til varmekart» (krav: min. 3 runder, `MIN_RUNDER` i
`src/lib/domain/hole-heatmap.ts`).

## Ikke rørt

`fase1/` er urørt. `fase2/playerhq/`s 11 W1-filer er urørt — denne leveransen legger til én 12. fil.
