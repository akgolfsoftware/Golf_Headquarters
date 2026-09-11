# Feillogg — læring for videre arbeid

## 10.09.2026 — motstridende prosjektkilder

**Problem:** flere oppsettsguider og verktøykopier anbefalte ulike designsystemer. En mekanisk Claude→Codex-erstatning laget ugyldige `.Codex/`-stier og endret navn på designleveranser. Historiske ferdigpåstander ble lest som nåstatus.

**Rettet:** felles prosjektinstruks, designkart per flate, delte skills/hooks, klart merket historikk og kontroller av struktur og lenker. Se [prosjektkartet](vedlikehold/prosjektkart.md).

**Varig regel:** vedlikehold én kilde per tema. Ikke dupliser styrende tekst mellom AI-verktøy. Ikke kall en funksjon ferdig ut fra en sitering, tokenimport eller gammel statuslinje.

[Full tidligere feillogg](arkiv/opprydding-2026-09-10/feillogg.md) er bevart. Nye læringspunkter skal beskrive konkret årsak, retting og hvordan gjentakelse hindres.

## 11.09.2026 — dokumentcommit skjuler samlet Vercel-bygg

**Problem:** `ignoreCommand` sammenligner bare `HEAD^` med `HEAD`. Siste commit i PR #835 var dokumentasjon; derfor ble både Git-preview og CLI-redeploy avbrutt selv om grenen inneholdt seks tidligere kodeleveranser. GitHub viste Vercel som grønn med teksten «Canceled by Ignored Build Step».

**Håndtering:** faktisk deploy-status ble kontrollert. Separat kildeopplasting til preview ble avvist av automatisk godkjenningskontroll og ikke gjennomført. PR-en ble flettet etter brukerens uttrykkelige merge-bestilling og grønn GitHub CI; preview er ikke rapportert som bestått. Ingen konfigurasjon ble endret.

**Videre kontroll:** les Vercels faktiske byggstatus og kodeversjon, ikke bare PR-merket. En eventuell endring av dokumentfilteret er en egen, konkret konfigurasjonsoppgave.
