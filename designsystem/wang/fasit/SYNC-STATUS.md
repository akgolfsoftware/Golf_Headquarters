# WANG-fasit — synkstatus

## GJELDENDE FASIT (25.08.2026) — overstyrer alt under denne linjen

`arsplan-2026-27/WANG Arsplan 2026-27.dc.html` — levert av Anders som ferdig zip
(«WANG Toppidrett Årsplan Design (1).zip», ikke via `DesignSync`/MCP) 25.08.2026.
**Helt ny informasjonsarkitektur** for fellessiden: fire faner **Trening / Skole / Kalender /
Foreldre** (hero + årshjul-søyler + pyramide + månedsplan + ukeplan + øktplaner under
Trening), ikke `Oversikt/Plan/Skole/Foreldre` med `Sesong/Kalender/Samlinger`-underfaner som
under. Ingen RSVP/chat på foreldrefanen (Anders' beslutning 25.08.2026: fjernes, siden bygges
1:1 etter fasiten).

**Denne fasiten dekker IKKE samme skjermer som `6061a53c` under** — det er en fullstendig
redesign av samme feature, ikke et tillegg. `6061a53c`- og `3935e216`-mirrorene under er
**historikk**, ikke gjeldende fasit. Se avviksanalysen i porteringsplanens samtale
(2026-08-25) for full sammenligning mot koden som faktisk finnes i dag i `/team-wang`.

Datakontrakten er lagt inn i kode som `src/app/team-wang/_data/arsplan-fasit-2026-27.ts`
(steg 1 av porteringsplanen). README + DATA-KONTRAKT.md fra pakken ligger speilet i
`docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27/`.

---

## Eldre historikk (ikke lenger gjeldende fasit)

| | |
|---|---|
| Claude Design-prosjekt | `6061a53c-659e-42a9-ae34-031a69b61843` — «WANG årsplan redesign» |
| Fil | `WANG Golf - Redesign 2026.dc.html` |
| Speilet | 2026-08-15 |
| Hentet med | `DesignSync` (`get_file`) |

Speilet av dette prosjektet er det den nåværende koden i `/team-wang` faktisk er bygget
etter (fanene Oversikt/Plan/Skole/Foreldre m/ Sesong/Kalender/Samlinger). Det er nå erstattet
av 25.08-fasiten over.

### Forholdet til `designsystem/wang/skjermer/`

Mappa `skjermer/` er et enda **eldre** speil av prosjektet `3935e216` («WANG Golf — Årsplan
(redesign 2026)»), utpekt som fasit i `docs/port/plan-design-wang-arsplan.md` §B2 den
10.08.2026. Anders leverte `6061a53c` den 15.08.2026, som gjaldt for skjermene den dekket.
`3935e216` er ikke slettet — den dekket skjermer (`a1-skall`, `a2-hjem`) som `6061a53c` ikke
tok for seg. Begge er nå historikk sammenlignet med 25.08-fasiten øverst i dette dokumentet.

## Skjermer i denne fasiten

Alle vises i to bredder (mobil 390 · desktop 1280) og fire tilstander
(Suksess · Laster · Tom · Feil), med designnotat «slik er det i dag / slik blir det» per skjerm.

| Nøkkel | Skjerm |
|---|---|
| `plan_sesong` | Plan · Sesong — årsplanen som to spor |
| `plan_kalender` | Plan · Kalender |
| `plan_samlinger` | Plan · Samlinger |
| `skole_rute` | Skole · Skoleår |
| `skole_timeplan` | Skole · Timeplan |
| `skole_vurdering` | Skole · Vurdering |
| `foreldre` | Foreldre |
| `okt` | Økt-detalj |
| `iup` | IUP-samtale (ny skjerm) |
| `trener` | Trener · årsplan |

## Ny tabell som fasiten forutsetter

`GroupPeriodGoal` — ett fokusområde per elev per periode (akse, tittel, egentid, målemetode,
status, egenvurdering, trenervurdering). Uten den har elevsporet «Min utviklingsplan» og hele
IUP-samtalen ingen kilde.
