---
name: ak-prompt-master
description: Lag en presis, kopierbar prompt når Anders ber om en prompt eller ønsker å forbedre en bestilling. Bruk prompt-engineer som felles arbeidsmåte og ak-hq-design ved design av AK Golf HQ.
metadata:
  version: "5"
  reviewed: "2026-09-13"
---

# AK Prompt Master

Dette er den korte inngangen til [prompt-engineer](../prompt-engineer/SKILL.md), som eier promptarbeidsmåten. Ikke vedlikehold parallelle modelltabeller her.

1. Les den faktiske bestillingen og relevant tilgjengelig underlag. I AK Golf HQ gjelder brukerens siste beskjed foran historiske designlåser. Ved produktdesign: bruk [ak-hq-design](../ak-hq-design/SKILL.md) og den aktive retningen [Atletisk intelligens](../ak-hq-design/references/atletisk-intelligens.md).
2. Lever en kort anbefaling av arbeidsmåte og deretter én komplett kopierbar prompt, normalt XML med oppgave, kontekst, kilder, krav, leveranse og kontrollerbare ferdigkriterier. Lange prompter kan også leveres som lokal tekstfil.
3. Behold brukerens valgte miljø/modell. Ikke oppgi modellnavn, tilgjengelighet, pris, kvote eller effort-nivå fra hukommelsen. Dersom et nytt valg er nødvendig: verifiser mot gjeldende verktøy eller offisiell dokumentasjon. Ukjent pris oppgis som ukjent; ingen konstruert kostnadsklasse.
4. Bruk eksisterende autorisasjon. Ikke legg inn nye godkjenningsstopp for vanlig designarbeid, kode, dokumenter eller reversible rettinger som allerede er bestilt. Eksterne meldinger, produksjonsendringer og andre handlinger følger sesjonens faktiske autorisasjon.
5. Still spørsmål bare om nødvendige opplysninger som ikke kan hentes fra tilgjengelige kilder. Fortsett uavhengige deler. Ikke be om skjult intern tankerekke; be om kort begrunnelse, bevis og avvik.
6. En prompt er ikke en ferdig app. Skill tegnet, klikkbart, implementert, testet og valgt av Anders. Verifisering skal være konkret og forholdsmessig, uavhengig av modell.

## Videreføring og komplette pakker

- Avklar fra samtalen om arbeidet starter blankt eller viderefører en kandidat. Ved videreføring: bruk siste faktiske prosjektfiler, bevar utført arbeid og velg neste ledige versjon. En eldre ZIP er et datert sammenligningsgrunnlag, ikke ordre om å erstatte nyere filer.
- Siste svar fra et designverktøy er **rapportert status** til filene og kontrollen er undersøkt. Ta med rapporten med kilde og bevisgrense; ikke presenter for eksempel «0 uløste tokens» som egen verifisering.
- Ved «komplett ZIP»: lever én styrende hovedprompt, tydelig startfil, nødvendige anonymiserte kilder, funksjons-/reisekart, leveransekontrakt, kontrollkrav, kilde-/filmanifest og faktiske kontrollsummer. Kontroller arkivet etter pakking. Ingen absolutt lokal sti må være eneste tilgang til en nødvendig kilde.
- Historiske prompter skal ikke konkurrere med hovedprompten. Merk referansemateriale med rolle, dato og begrensning. Bevar allerede valgte delomfang, særlig Team Norways designvalg i prosjektets gjeldende designregister — fra 22.09.2026 er det «Team Norway App», ikke Claw.
- For AK Golf HQ: kryssjekk funksjonsfamilier, detaljerte funksjonskort, reiser og ruter hver for seg. Bruk `FAM:`, `KORT:` og `REISE:` når ID-er kan kollidere. Én klikkbar familierepresentant beviser ikke et ferdig funksjonskort.
- Tokenarbeid skal følge [videreføring og tokenkontroll](../ak-hq-design/references/videreforing-og-tokenkontroll.md): les faktiske navn før bruk, kontroller koblingen per aktiv fil og mål de faktiske komponentene. Riktig farge alene beviser ikke korrekt kobling.

Når Anders starter blankt i Claude Design, skal prompten be om både et nytt Design System v0.1 og representative skjermer som beviser systemet. Ikke send mottakeren tilbake til eksisterende implementerte designverdier som visuell fasit.

Ingen personopplysninger eller hemmeligheter i sky-prompts. Bruk syntetiske eksempler og kontroller vedlegg før eksport.
