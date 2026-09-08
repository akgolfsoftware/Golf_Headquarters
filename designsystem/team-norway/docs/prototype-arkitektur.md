# Klikkbar TN-prototype — arkitektur og navigasjonskontrakt

Besluttet 08.09.2026. Gjelder alle skjermer i `templates/`.

## Valg

| Spørsmål | Svar |
|---|---|
| Sammenheng | Skall-DC for navigasjon + ekte `<a href>` mellom skjermene. Hver skjerm kan åpnes alene. |
| Knappedekning | Ingen døde klikk. Hver knapp går til en tegnet skjerm eller en tegnet tilstand i samme skjerm. |
| Roller | TN-trener og Forelder. Rollen byttes i topplinjens brukerpille. |
| Player HQ / AgencyOS | Tegnes **ikke** her (Train-lock eier dem). Bare grenseflatene: delingsdialog, tilgangssperre, lisensnotat. |
| Forelderflate | Egen TN-forelderflate tegnes her: samtykke, reiseinfo, samlingsdetaljer, faktura. |
| Datalag | Egne data per skjerm (ingen delt mock-fil). |
| Startskjerm | TN-oversikt. |
| Viewporter | 1440 desktop **og** 390 mobil for hver skjerm. |

## Filkonvensjon

```
templates/<slug>/<Slug>.dc.html        desktop 1440 — eier @template-taggen
templates/<slug>/<Slug>Mobil.dc.html   mobil 390 — INGEN @template-tagg
templates/<slug>/ds-base.js            uendret
```

Bare én `@template`-tagg per mappe indekseres. Mobilvarianten står derfor
uten tagg og nås fra desktopvarianten og fra skjermregisteret.
Desktop og mobil har egne data i hver sin fil (brukervalg: egne data per skjerm).

Lenker er relative mellom mapper: `../tn-oversikt/TnOversikt.dc.html`.
Mobilvarianten lenker alltid til mobilvarianten.

## Funksjonsfasit fra repoet

Kilde: `akgolfsoftware/Golf_Headquarters@main`.

**Skrivehandlinger i Workbench** (`src/app/portal/planlegge/workbench/actions.ts`,
`WorkbenchV2Actions`): addSession, moveSession, updateSession, removeSession,
duplicateSession, duplicateWeek, applyTemplate, publish, publishDiff,
acceptPlan, rejectPlan, suggestWeek (Caddie), applySuggestion, lagrePeriode,
slettPeriode, searchTeknisk.

**Visninger** (`visning-url.ts`, `VisningPiller.tsx`): `aar`, `maned`, `uke`.
«Økt» finnes ikke som egen rute — økten åpnes som inspektør ved siden av
rutenettet. Agenda er TN-tillegg for dagsliste.

**Statuser**: DRAFT → PUBLISHED → IN_PROGRESS → COMPLETED.
Coach-skriv på en annen spillers rad gir `needsPlayerApproval: true`,
`approvalStatus: "PENDING"` — spilleren Godtar eller Avviser.

**Tilgangssperre** (`docs/natt/workbench/ACCESS-AND-GROUPS.md`,
`integration/player-hq.md`): treneren ser kun spillere med minst én aktiv
`GroupMembership` **eller** aktiv `CoachAccessEntitlement` fra kjøp.
Self-serve uten kjøpt coach-produkt er usynlig i Stall, Workbench og søk.
Dette er sperren TN-treneren møter i delingsdialogen: en TN-spiller uten
full Player HQ-tilgang kan ikke motta delt økt eller program.

**Gruppeplanlegging**: én gruppe-master-økt materialiserer én rad per aktivt
medlem (`origin: "GROUP"`). Endring på master propagerer til rader uten
`localOverride`; har spilleren redigert lokalt blir det
«Godta gruppeendring / Behold min versjon».

## Lisensnotat

Kildehenvisningen til Team Norway vises **kun som bunntekst i eksportert
program/PDF** (brukervalg 08.09.2026):

> Laget av Team Norway Golf. Kan brukes av AK Golf HQ med kildehenvisning.
> Ikke for videresalg.

## Puljer

1. **Workbench**: planlegg økt → publiser → del med spiller. *(ferdig)*
   `templates/workbench/Workbench.dc.html` + `WorkbenchMobil.dc.html`
2. Grupper → gruppepost → enkeltspiller
3. Bibliotekene: ukemaler, standardøkter, øvelsesbank, programmer
4. Uttak til samling
5. Testing: protokoll → gjennomføring → resultat
6. Turneringer
7. Dokumentdeling og samtykke *(+ forelderflate)*
8. Rangliste og referansenivåer
9. Trenerkatalog
