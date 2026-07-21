# Design-system-regel — v2 (retning C «Presis») er kanon

Oppdatert 20. juli 2026. Retning C valgt 9. juli; tokens + tema per produkt låst i
`docs/design-system/FASIT.md`.

## Målbildet: v2-generasjonen

- **Kanon-kilde:** Claude Design «AK Golf HQ Design System»
  (`claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d`) — `tokens/v2/**`,
  `components/**`, `ui_kits/v2/**` + playerhq/agencyos-kits.
- **Retning C «Presis» er valgt** — Linear/Notion-tetthet i AK-merkevare.
- **Tema (låst):** PlayerHQ alltid lys · AgencyOS lys/mørk (standard mørk) · se FASIT.
- Rekkefølge: **design → system → prod.** Aldri fikse design bare i prod.
- Skills: `akgolf-design-system` (tokens) + `ak-designekspert` (tenking). Ikke
  `ak-golf-hq-design` (utdatert).

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

## Praktisk beslutningsregel

| Skal gjøre | Gjør |
|---|---|
| Bugfiks på gammel skjerm (golfdata) | golfdata OK |
| Ny skjerm / redesign | Claude Design v2-mockup først, deretter port til `src/components/v2` |
| Farge/spacing/type | Kun `--v2-*` / `T` / `tokens/v2/tokens.css` |
| Usikker stil | `docs/design-system/FASIT.md` |

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

## Enkelhet og færrest trykk (LÅST — Anders 2026-07-21)

**Kraftig under panseret · enkelt i ansiktet.**

1. **Alle funksjoner beholdes** — redesign skjuler/prioriterer, kaster ikke muligheter uten GO.
2. **Minst mulig trykk** til «det jeg skal gjøre nå» (mål: 1–2 trykk fra hub for primærjobb).
3. **Super enkelt** — forstås på første lesning av ikke-teknisk bruker.
4. **Vanskelig = feil design** — fiks flyt/hierarki; legg ikke bare på mer tekst.

**Skjerm er ikke ferdig før:** 5-sekunders-test OK · én primær CTA · tom tilstand med én vei videre · klarspråk/ordbok.  
Full tekst: `docs/design-system/FASIT.md` §3.

## Design-veiledning

`.claude/skills/ak-designekspert` + `docs/design-system/FASIT.md`.  
Arkiv (ikke fasit): `docs/arkiv/redesign-v2/`. Andre generiske design-skills skal ikke brukes.
