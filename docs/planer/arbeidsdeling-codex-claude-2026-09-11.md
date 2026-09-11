# Arbeidsdeling — Codex og Claude Code

Oppdatert 11.09.2026 etter Anders' bestilling om å fullføre og samle neste oppgaver. [Masterplanen](../MASTERPLAN-GJENSTAAENDE.md) eier videre rekkefølge.

| Pakke | Gjennomført arbeid | Nåstatus |
|---|---|---|
| D2-PLAN / R3 | Codex bygget adapteren for eldre planøkter og 11 kontrolltilfeller | Samlet fra `0c060141c`; [rapport](../design-audit/plan-legacy-2026-09-11.md). Innlogget reise gjenstår |
| D2-PH06 / R2 | Claude leverte testpakken i PR #837. Codex bygget deretter valgt hierarki og rettet lagring/testbevis etter review | [Oppdatert rapport](../design-audit/playerhq-ph06-2026-09-11.md). Komponentprøvd, ikke visuelt godkjent av Anders |
| Manuell SG | Separat oppgave leverte funksjon, skjermarbeid og tester | Samlet i main via PR #836 |
| Produktplan/intervju | Separat oppgave utarbeidet funksjonsregister, funksjonskort og intervjuguide | Integrert som arbeidsunderlag; ingen intervjusvar eller produktvedtak er oppfunnet |

Den tidligere [Claude-prompten](claude-code-sonnet-5-ph06-prompt.md) bevares som overleveringshistorikk. Arbeidsmappen den viser til er ryddet etter PR #837 og skal ikke antas å eksistere. Det er ingen aktiv Claude-kodeoppgave fra denne overleveringen.

Samlingsoppgaven eier nå masterplan/status og ferdige grenrester. Separate øktmodeller, globale designverdier og start-/logg-/fullføringskø er bevart. Bare de to sammendragslagringene er endret for å bevare separate felt og planspeil ved feil. Ingen databaseoppsett, roller eller produksjonskonfigurasjon er endret.

Neste oppgave velges fra masterplanens prioriterte liste, med konkrete filer, datakontrakter og ferdigkriterier. Ikke start samme arbeid på nytt fra gammel prompt eller historisk arbeidsgren.
