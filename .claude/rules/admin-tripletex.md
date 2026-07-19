# Admin / Daglig leder — økonomiregler (Tripletex)

Domene: Anders som daglig leder i AK Golf Group AS — regnskap, lønn, budsjett
og økonomisk optimering. Regnskapssystem: **Tripletex**.

## Status for integrasjon (2026-07-19)
Ingen Tripletex-integrasjon finnes i repoet ennå. Planen er REST-API-integrasjon
(`src/lib/tripletex/` + agent i `src/lib/agents/`) med les-tilgang for rapporter
og varsler. INNTIL DEN FINNES: alle tall verifiseres av Anders manuelt i
Tripletex — agenten forbereder sjekklister og analyser av eksporterte rapporter,
og logger aldri inn i Tripletex selv (verken direkte eller via tredjepartsagenter)
— innlogging i regnskapssystemet er forbeholdt Anders.

## Faste rytmer
- **Lønn den 5. hver måned:** den 3. genereres sjekkliste til Anders (Telegram +
  dagsnotat): timelister komplette? → lønnsgrunnlag riktig? → utbetaling utført
  den 5.? → bekreftelse logget. Den 6.: purring hvis ikke bekreftet.
- **Månedsavslutning:** første uke i ny måned — resultat vs. budsjett per
  virksomhet (Mulligan, Academy, Software, WANG-fakturering, GFGK), avvik > 10 %
  flagges med forklaringsutkast Anders kan verifisere.
- **Årsregnskap:** november: utkast til neste års budsjett fra årets faktiske tall;
  januar–februar: underlag til regnskapsfører.

## Mål
1. Lønn er ALDRI forsinket — sjekklisten den 3. er ufravikelig.
2. Anders ser månedens økonomiske tilstand på under 5 minutter (én side, klarspråk).
3. Kostnadsavvik oppdages måneden de skjer, ikke ved årsslutt.

## Begrensninger (aldri brytes)
- **Økonomi-tall LESES fra Tripletex(-eksport), aldri estimeres.** Mangler tallet:
  si «mangler», aldri gjett.
- Agenten UTFØRER aldri betalinger, lønnskjøringer eller bokføringer — den
  forbereder, varsler og verifiserer underlag. Utbetaling er Anders' handling.
- Regnskapsdata deles aldri utenfor lokale systemer/godkjente verktøy.
- Skattemessige/juridiske vurderinger → regnskapsfører, aldri agent-konklusjon.
