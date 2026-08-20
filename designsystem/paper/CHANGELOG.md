# CHANGELOG — siden zip 16.08.2026 21:11

Én linje per fil. **Merket utgått = filen står, med utgått-notis i toppen — aldri slettet fra zip-en.**
Generert 20.08.2026. Grunnlag for resynk av repo-speilet.

## Nytt
- `fase2/playerhq/playerhq-onboarding-tillegg.html` — NY skjerm: onboarding-tillegget (treningstid + fasiliteter med fysiske mål). Fire tilstander, m390/d1280, lys/mørk.
- `fase1/workbench-periodemal.html` — NY 20.08 (FASIT skjerm 2 av 8): periodemal-flyten (økter per pyramide → skall-økter → kø av ufylte).
- `fase2/manifest-utkast-playerhq-okt-detalj.md` — NY: manifest for utvidelsen.
- `fase2/manifest-utkast-playerhq-teknisk-plan.md` — NY: manifest for utvidelsen.
- `fase2/manifest-utkast-playerhq-live-okt.md` — NY: manifest for utvidelsen.
- `fase2/manifest-utkast-playerhq-live-summary.md` — NY: manifest for utvidelsen.
- `fase2/manifest-utkast-agencyos-gruppe-detalj.md` — NY: manifest for utvidelsen.
- `fase2/manifest-utkast-playerhq-profil.md` — NY: manifest for utvidelsen + profil-avklaringen.
- `fase2/manifest-utkast-playerhq-innstillinger.md` — NY: manifest for Standard/Tour-bryteren.
- `fase2/manifest-utkast-playerhq-onboarding-tillegg.md` — NY: manifest for den nye skjermen.
- `fase2/manifest-utkast-workbench-periodemal.md` — NY: manifest + periodemal-avklaringen.
- `kart/rutefasit-for-claude-code.md` — NY (gjenoppstått som tillegg): nye/endrede ruter + de 8 nye komponentene. Fullregisteret bor i repoets `docs/port/rutefasit.md`.
- `CHANGELOG.md` — NY: denne fila.
- `kart/fundament-avvik-2026-08-18.md` — NY 18.08.
- `fase2/agencyos/agencyos-agenticos-hub.html` + `agencyos-agent-detalj.html` + tilhørende manifest-utkast — NY 18.08 (AgenticOS-sporet).

## Endret
- `fase1/workbench-desktop.html` — omskrevet 20.08 til FASIT skjerm 1 av 8: årstidslinje (d1280 + m390), skall-økter i begge rammer, m390-rammen erstatter workbench-mobil.
- `fase2/playerhq/playerhq-okt-detalj.html` — + rediger-tilstand (R), teknikk-dimensjon per drill, motorikk-velger kun på fullsving.
- `fase2/playerhq/playerhq-teknisk-plan.html` — + målmatrise (motorikk × miljø), rep-telling per fokus, statusrapport med spredning i trening/bane-trening/konkurranse.
- `fase1/playerhq-live-okt.html` — + hurtigtapp +5/+10/+25, FYS-serielogging (reps + vekt), kondisjon per sone-segment, spontan drill, pausetelling.
- `fase1/playerhq-live-summary.html` — + tre stjernerader (fokus/gjennomføring/mestring) og total pausetid.
- `fase2/agencyos/agencyos-gruppe-detalj.html` — + «denne økta blir nå din egen»-tilstanden, hovedcoach-begrepet, laster/feil-tilstand.
- `fase2/playerhq/playerhq-profil.html` — + «hvem ser deg» (navngitte trenere + utmelding), testhistorikk, grupper; utpekt som eneste profil-fasit.
- `fase2/playerhq/playerhq-innstillinger.html` — + Visning-gruppe med Standard/Tour-bryteren.
- `VOKABULAR.md` — oppdatert 20.08: 19 områder, seks puttebånd, merking på drillen, én teknikk-dimensjon per drill, treningsblokker.
- `readme.md` — telling og opprydding oppdatert 20.08.
- `github.md` — synk-logg oppdatert 17.08 og 20.08.

## Merket utgått (står i zip-en med notis i toppen)
- `fase1/spillerprofil.html` — UTGÅTT 20.08: erstattet av `fase2/playerhq/playerhq-profil.html` (eneste profil-fasit).
- `fase2/agencyos/agencyos-periodemal.html` — UTGÅTT 20.08: erstattet av `fase1/workbench-periodemal.html` (eneste periodemal-fasit).

## Slettet (Anders' 17.08-regel: erstattede dokumenter slettes — git bevarer)
- `fase1/workbench-mobil.html` — slettet 20.08; m390-fasiten bor i `fase1/workbench-desktop.html`.
- `fase1/workbench-okt-editor.html` — slettet 20.08 (utkast; økt-redigering bor nå i `fase2/playerhq/playerhq-okt-detalj.html` R-tilstanden og Workbench-flyten).
- `export/` (design-zip + gamle workbench-standaloner), `design_handoff_rutefasit_agenticos/`, `Rutekart - alle ruter uten egen fasit.html` — slettet 20.08.
- `kart/rutefasit-for-claude-code.md` (v2-kopien) — flyttet til repoet 17.08 som `docs/port/rutefasit.md`; gjenoppstått her som tillegg (se Nytt).

## Sjekk mot brief §5 (utført 20.08.2026)
1. Ingen doble fasiter uten utgått-merke: profil og periodemal er avklart, merkene står i toppen av de utgåtte filene.
2. Hver ny/endret rute har rad i `kart/rutefasit-for-claude-code.md` med avvik i én setning.
3. Alle 8 nye komponenter er navngitt i manifestene og samlet i rutefasit-tillegget.
4. Tilstander: alle utvidede skjermer har suksess/tom/laster/feil (gruppe-detalj fikk laster/feil i denne runden); m390+d1280 og lys/mørk følger husmønsteret per fil.
5. Ingen skjerm tegner eget skall — nye seksjoner gjenbruker w3/w4-basene og filenes egne rammer.
