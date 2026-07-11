# Design-system-regel — v2-redesign pågår

Oppdatert 9. juli 2026 (Anders' beslutning: komplett redesign av hele appen).
Erstatter regelen av 8. juli som låste kanon til v13/golfdata.

## Målbildet: v2-generasjonen

Anders har bestilt et **helt nytt designspråk** for hele plattformen (PlayerHQ, AgencyOS,
forelder, auth OG markedssidene) — Notion/Linear/Bloomberg-inspirert, funnet via Mobbin,
bygget i AK Golf-merkevaren. Styringsplan: `~/.claude/plans/breezy-forging-brook.md`
(fase 0–6) + `docs/redesign-v2/`.

- **Kanon-kilde er fortsatt det levende Claude Design-prosjektet** («AK Golf HQ Design
  System», `claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d`), hentet via
  DesignSync. v2 bygges der som ny generasjon: `ui_kits/v2/**` + `tokens/v2/**`.
- **Designretning avgjøres av Anders** i fase 3 (tre retningsforslag). Før retningen er
  valgt er INGEN visuell stil låst — heller ikke tema-strategien (lys/mørk per app).
- Rekkefølgen er ufravikelig: **design → system → prod.** Skjermer implementeres først
  når mockupen deres er godkjent av Anders. Aldri fikse design direkte i prod.

## Hva som beholdes uansett retning

- **AK Golf-merkevaren:** logo, fargene (forest `#005840` · lime `#D1F843` · cream ·
  graphite) — brukes av v2, men skala/tetthet/tema er fritt.
- **Informasjonen** dagens skjermer bærer (datakontraktene) — hva som vises, ikke hvordan.
- Produktregler (ikke design, røres aldri): anbefalinger aldri sperrer · brutto score ·
  norsk bokmål + ordboken (ARG=Nærspill) · Lucide-ikoner, aldri emoji.
- **Gap-regelen:** finnes ikke komponenten/mønsteret i kanon → meld gapet til Anders,
  aldri improviser ad-hoc UI.

## Overgangs-laget: v13/golfdata

`src/components/athletic/golfdata/` + `src/styles/golfdata-tokens.css` (v13/v14-porten)
er nå et **overgangs-lag**, ikke målbildet:

- Eksisterende skjermer står på golfdata til de rekomponeres mot godkjent v2-mockup
  (fase 5–6, bølge for bølge).
- Vedlikehold/bugfiks i golfdata er OK. IKKE bygg nye store flater mot v13-kitene uten
  at Anders har bedt om det — nye flater venter på v2-retningen.
- ESLint-gaten mot det gamle athletic-biblioteket består (utvides med v2-sti i fase 6).

`src/components/ui/` (shadcn-primitivene for skjema/overlay) er fortsatt unntatt.

## Praktisk beslutningsregel (inntil v2-retning er valgt)

| Skal gjøre | Gjør |
|---|---|
| Bugfiks/vedlikehold på eksisterende skjerm | golfdata som før |
| Ny skjerm/stor flate | STOPP — venter på v2-retningsvalget (fase 3) |
| Designe v2 | I Claude Design-prosjektet under `ui_kits/v2/`, per plan |
| Farge/spacing/type i v2 | AK-fargene beholdes; alt annet defineres i `tokens/v2/` |

## Prioritet (Anders 2026-07-11): fullfør v2 på ALLE skjermer

Retning C er valgt og fase 6 pågår. Gjeldende prioritet er å få hver gjenværende
golfdata-skjerm over på v2, bølge for bølge (Bølge A = PlayerHQ-detaljskjermer,
B = AgencyOS-detaljskjermer, C = auth, D = halen). Én skjerm per commit;
master-skjermplanens haker oppdateres i samme commit.

## «?»-forklaringer (LÅST regel, Anders 2026-07-11)

Ingen v2-skjerm er ferdig uten `HjelpTips` («?»-ikonet, `src/components/v2/hjelp.tsx`) på
**alle tall og faguttrykk** brukeren kan lure på (SG, ACWR, CS-nivå, L-fase, TrackMan-tall,
HCP, WAGR osv.). All forklaringstekst bor i `src/lib/v2/hjelpetekster.ts` — aldri ad-hoc
tekst i skjermfiler. Mangler en nøkkel: legg den til i tekstbanken (klarspråk, norsk bokmål,
ordboken gjelder — «nærspill», aldri «kort spill»). Gjelder både nybygg og ombygging.

## Design-veiledning

`.claude/skills/ak-designekspert` + referansebildene og Mobbin-prinsippene i
`docs/redesign-v2/`. Andre generiske design-skills skal ikke brukes.
