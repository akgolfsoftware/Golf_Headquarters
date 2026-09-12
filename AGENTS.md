# AK Golf HQ — felles prosjektinstruks

Les `docs/platform/AGENT-BRIEF.md` før du endrer filer. `START-HER.md` er inngangen for både mennesker og AI-verktøy.

**Designstatus 11.09.2026:** Anders starter blankt i Claude Design og utvikler AK Golf HQ Design System v0.1 for PlayerHQ, AgencyOS og AgenticOS. Aktiv smaksretning er «Atletisk intelligens»: sportslig PlayerHQ, operativt rolig AgencyOS og mørk fokusmodus når oppgaven krever det. Eksisterende design, navigasjon, fonter, farger og komponentvalg er arbeidsunderlag, ikke visuell fasit. Se `designsystem/README.md` og `.claude/skills/ak-hq-design/references/atletisk-intelligens.md`.

## Kildeorden

- Anders' gjeldende beskjed styrer oppgaven. Tidligere bestillinger i arkiv er ikke nye kjøreordrer.
- Produkt og forretningsregler: `docs/platform/BUSINESS-RULES.md`.
- Treningsfag og begreper: `docs/FASIT-AK-GOLF-HQ.md` og ordbøkene i `docs/`.
- Designstatus og eksisterende referanser: `designsystem/README.md`. Bruk den konkrete versjonen Anders velger for den aktuelle byggeoppgaven; gamle tegninger og beslutninger er ikke automatisk gjeldende fasit.
- Faktisk oppførsel: koden og testene. Dokumentert intensjon er ikke bevis på ferdig funksjon.
- Nåstatus: `docs/STATUS-NÅ.md`. Arbeidsliste: `docs/MASTERPLAN-GJENSTAAENDE.md`. Historikk ligger under `docs/arkiv/`.

## Arbeidsmåte

Svar kort på norsk bokmål. Forklar faguttrykk. Utfør allerede bestilt arbeid uten å be om samme godkjenning igjen. Ved endring av omfang eller en uavklart produktbeslutning: avklar den konkrete beslutningen før avhengig arbeid.

Behold alle funksjoner, med minst mulig trykk og et enkelt grensesnitt. Vanskelig å forstå er et designproblem. Les berørt kode før du endrer den. Ikke gjeninnfør en gammel modell fordi et eldre dokument beskriver den.

Koden ligger i dette prosjektet. Ikke kopier eksterne agentkataloger inn i repoet eller gjør editor-agenter til AgenticOS-runtime. Bruk relevante tilgjengelige skills; de overstyrer aldri godkjent design eller produktregler.

## Skjermarbeid

Bruk den prosjektspesifikke skillen [AK HQ Design](.claude/skills/ak-hq-design/SKILL.md) ved brukerreiser, komponenter, wireframes, UI og designoverlevering. Les [Atletisk intelligens](.claude/skills/ak-hq-design/references/atletisk-intelligens.md) for den aktive retningen. Skillen samler arbeidsmåte og kvalitetskrav; Design System v0.1 utvikles fra blankt lerret og visuelle valg forblir åpne til Anders velger en versjon for den aktuelle byggeoppgaven. Startpakken og hovedprompten nås fra [designarbeidet](docs/design-system/ak-hq-designarbeid.md).

Bruk `designsystem/README.md` til å forstå dagens kilder og status. Train-lock, AK Golf, WANG, Team Norway og Canvas er eksisterende referanser, ikke låste valg. Ikke gjennomfør gamle porteringsplaner automatisk mens Anders reviderer designet i Claude Design.

Før skjermbygging: identifiser valgt designversjon, brukerreise, skjermer og tilstander. En bestilt versjon kan bygges selv om andre deler fortsatt utforskes. Bruk felles komponenter og designverdier for den valgte retningen. Avklar manglende designvalg før avhengig bygging; tekniske feil kan behandles uavhengig når rettingen er bestilt.

En skjerm er ferdig når funksjonen virker og Anders har sett appen ved siden av den valgte designversjonen: mobil 390 px og desktop, avtalte temaer og relevante tomme, lastende og feiltilstander. Registrer referanse, kontroll og avvik. Eksisterende Train-lock-kontrakter og kontroller beskriver dagens implementasjon; de må vurderes mot en ny bestilt retning. En token-import, en sitering eller grønn byggkontroll er ikke en visuell godkjenning.

## Data og sikkerhet

Hemmeligheter hører hjemme i ignorerte miljøfiler. Ikke skriv ut, kopier til dokumentasjon eller commit verdiene. Persondata skal ikke inn i sky-prompts, logger eller offentlig Git. Bruk syntetiske testdata. Ikke kjør seed-, import-, betalings-, e-post- eller databaseendringer som del av en dokumentkontroll.

Ikke endre databaseskjema, tilgangsregler, produksjonsoppsett eller `vercel.json` uten autorisasjon for den konkrete endringen. Les `.claude/rules/gotchas.md` før databasearbeid. Migrasjonshistorikken bygger ikke en tom database korrekt; ikke kjør `migrate dev`, `db push` eller `migrate deploy` mot den hostede basen. Oppskriften i `docs/utvikling/lokal-testdatabase.md` gjelder kun en separat, tom testdatabase.

## Git-arbeidsflyt

Arbeid på egen gren (`codex/` for Codex). Bevar andres endringer. Kontroller diffen før commit. Ikke push til main, merge, publiser eller deploy uten Anders' uttrykkelige bestilling. Aldri omgå kontrollene med `--no-verify`.

`npm run verify` er kvalitetskontrollen; `npm test` kjører testene. De gjeldende kommandoene står i `package.json`. For dokument- og mappearbeid: kjør også `npm run prosjekt:sjekk`. Rapporter hva som faktisk er testet, og hva som fortsatt er uverifisert.

## Vedlikehold av prosjektet

Felles skills vedlikeholdes i `.claude/skills/`; `.agents/skills` peker dit. Felles hook-kode ligger i `.claude/hooks/`; `.codex/hooks` peker dit. Ikke lag redigerte kopier med verktøynavn byttet ut. CLAUDE.md og QWEN.md er innganger til denne filen.

Nye planer: `docs/planer/`. Daterte målinger: `docs/design-audit/` eller `docs/beslutningsgrunnlag/`. Utgåtte instrukser: `docs/arkiv/`. Lokale skjermbilder og private sikkerhetskopier skal aldri legges i `public/` eller Git. Se `docs/vedlikehold/prosjektkart.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
