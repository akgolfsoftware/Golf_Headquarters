# AK Golf HQ — felles prosjektinstruks

Les `docs/platform/AGENT-BRIEF.md` før du endrer filer. `START-HER.md` er inngangen for både mennesker og AI-verktøy.

**Gjeldende designautoritet 21.09.2026:** [AK Golf Design System og «App design»](docs/design-system/design-autoritet.md) styrer alt nytt designarbeid i AK Golf HQ. Dette er et bindende systemvalg, ikke en åpen kandidat. Train-lock og Paper er utgående og kan bare brukes som historikk eller funksjonsinventar. Det skal aldri spørres på nytt om de skal gjelde. Bare en ny, uttrykkelig beskjed fra Anders kan endre dette.

## Kildeorden

- Anders' gjeldende beskjed styrer oppgaven. Tidligere bestillinger i arkiv er ikke nye kjøreordrer.
- Produkt og forretningsregler: `docs/platform/BUSINESS-RULES.md`.
- Språk og begreper: `docs/treningsplanlegging.md` (eneste master for språk og planlegging).
- Årsplan, perioder og valg i Workbench: `docs/treningsplanlegging.md`.
- Designautoritet: `docs/design-system/design-autoritet.md`, deretter `designsystem/README.md`. Bruk den konkrete skjermversjonen Anders velger innen det gjeldende systemet; gamle tegninger og beslutninger er historikk.
- Faktisk oppførsel: koden og testene. Dokumentert intensjon er ikke bevis på ferdig funksjon.
- Nåstatus: `docs/STATUS-NÅ.md`. Arbeidsliste: `docs/MASTERPLAN-GJENSTAAENDE.md`. Historikk ligger under `docs/arkiv/`.

## Arbeidsmåte

Svar kort på norsk bokmål. Forklar faguttrykk. Utfør allerede bestilt arbeid uten å be om samme godkjenning igjen. Ved endring av omfang eller en uavklart produktbeslutning: avklar den konkrete beslutningen før avhengig arbeid.

Behold alle funksjoner, med minst mulig trykk og et enkelt grensesnitt. Vanskelig å forstå er et designproblem. Les berørt kode før du endrer den. Ikke gjeninnfør en gammel modell fordi et eldre dokument beskriver den.

Koden ligger i dette prosjektet. Ikke kopier eksterne agentkataloger inn i repoet eller gjør editor-agenter til AgenticOS-runtime. Bruk relevante tilgjengelige skills; de overstyrer aldri godkjent design eller produktregler.

## Skjermarbeid

Bruk den prosjektspesifikke skillen [AK HQ Design](.claude/skills/ak-hq-design/SKILL.md) ved brukerreiser, komponenter, wireframes, UI og designoverlevering. [Gjeldende designautoritet](docs/design-system/design-autoritet.md) styrer system og retning. Skillen samler arbeidsmåte og kvalitetskrav; konkrete skjermvarianter kan fortsatt velges før bygging uten at systemvalget åpnes på nytt. Startpakken og hovedprompten nås fra [designarbeidet](docs/design-system/ak-hq-designarbeid.md).

Bruk `designsystem/README.md` til å forstå dagens kilder og status. Train-lock og Paper er utgående. Ikke gjennomfør gamle porteringsplaner automatisk mens Anders viderefører designet i Claude Design.

Før skjermbygging: identifiser valgt designversjon, brukerreise, skjermer og tilstander. En bestilt versjon kan bygges selv om andre deler fortsatt utforskes. Bruk felles komponenter og designverdier for den valgte retningen. Avklar manglende designvalg før avhengig bygging; tekniske feil kan behandles uavhengig når rettingen er bestilt.

En skjerm er ferdig når funksjonen virker og Anders har sett appen ved siden av den valgte designversjonen: mobil 390 px og desktop, avtalte temaer og relevante tomme, lastende og feiltilstander. Registrer referanse, kontroll og avvik. Eksisterende Train-lock-kontrakter og kontroller beskriver dagens implementasjon; de må vurderes mot en ny bestilt retning. En token-import, en sitering eller grønn byggkontroll er ikke en visuell godkjenning.

## Data og sikkerhet

Ved endring i `src/`, `prisma/`, innlogging, betaling, filer, logger eller AI: les [ak-sikkerhet](.claude/skills/ak-sikkerhet/SKILL.md) og [ak-personvern](.claude/skills/ak-personvern/SKILL.md) før du skriver kode. De tre spørsmålene der stilles også før commit, via [verify-og-commit](.claude/skills/verify-og-commit/SKILL.md).

Hemmeligheter hører hjemme i ignorerte miljøfiler. Ikke skriv ut, kopier til dokumentasjon eller commit verdiene. Persondata skal ikke inn i sky-prompts, logger eller offentlig Git. Bruk syntetiske testdata. Ikke kjør seed-, import-, betalings-, e-post- eller databaseendringer som del av en dokumentkontroll.

Ikke endre databaseskjema, tilgangsregler, produksjonsoppsett eller `vercel.json` uten autorisasjon for den konkrete endringen. Les `.claude/rules/gotchas.md` før databasearbeid. Migrasjonshistorikken bygger ikke en tom database korrekt; ikke kjør `migrate dev`, `db push` eller `migrate deploy` mot den hostede basen. Oppskriften i `docs/utvikling/lokal-testdatabase.md` gjelder kun en separat, tom testdatabase.

**Forhåndsgodkjent lokal testing (Anders, 21.09.2026):** Som del av bestilt utvikling kan agenten automatisk starte Docker, opprette og vedlikeholde et separat lokalt Supabase-testmiljø, etablere prosjektets skjema der og opprette syntetiske testkontoer og testdata. Lagring, flytting, sletting av egne syntetiske testdata og publiseringsflyt kan prøves i dette miljøet uten nye godkjenningsspørsmål. Bruk egen prosjektidentitet, egne porter og separat, ignorert miljø-/Prisma-konfigurasjon. Kontroller at alle database- og Auth-mål er lokale før oppretting eller skriving; eksponer tjenestene bare lokalt. Ikke kopier produksjonsdata eller produksjonshemmeligheter, endre eksisterende miljøfiler eller sende e-post, betalinger eller andre ekte eksterne handlinger. Behold appens tilgangsvakter. Unntaket gjelder bare dette isolerte testmiljøet; hostede databaser, produksjonsoppsett, tilgangsregler i appen og deploy/publisering av appen krever fortsatt konkret autorisasjon.

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
