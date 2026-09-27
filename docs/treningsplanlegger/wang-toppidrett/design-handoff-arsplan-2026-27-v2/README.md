# Design-handoff v2 — Årsplan 2026/27 (22.09.2026)

Erstatter ikke `design-handoff-arsplan-2026-27/` (25.08-handoffen) — den brukes fortsatt som
referanse for datakontraktens form. Denne mappa dokumenterer at `/team-wang`s innhold er
oppdatert mot to kilder samme dag:

1. **Design:** Claude Design-prosjektet «Årsplan Golf WANG Golf Fredrikstad»
   (`779d22c8-1828-46d6-ab11-9fad5472e06f`, mal `wang-golf-fellesside`), bygget på gjeldende
   designsystem «WANG Toppidrett Designsystem» (`3580374e`). Fire faner: Trening, Skole,
   Kalender, Foreldre — samme struktur som `/team-wang` allerede hadde.
2. **Innhold:** den godkjente årsplanen i `kilde/` — kopi av
   `claude-cowork/wang-toppidrett/kunnskap/arsplan-2026-27-pakke-claude-chat/leveranser/`
   på Drive, slik den var 22.09.2026 (periodebrev, månedsplan, ukeplan, øktmaler,
   terminliste-utkast). Fasiten er fortsatt Drive-mappa, ikke denne kopien.

## Hva som ble rettet i `src/app/team-wang/_data/arsplan-fasit-2026-27.ts`

- Samlingsukene var feil (uke 1 og uke 7) — rettet til uke 3–4 (Alicante, 16.–30.01, 14 dager,
  bekreftet av Anders 22.09.2026). Uke 7-samlingen fantes aldri.
- Lagt til fysiske tester (16.10 er allerede uke 42 sin fredag · 27.11 · 08.01 · 19.02 · 02.04
  · 11.06) og fredagsrotasjonen i GRUNN (hospitering uke 47 og 51).
- Uke 42 fikk egen logikk: IUP-jobbing mandag/onsdag, testsamling NGF Oslo torsdag 15.10,
  fysisk test fredag 16.10 — i stedet for ordinær TURN-mal.
- To høstturneringer lagt til fra AK Golf HQs turneringsdatabase (ikke NGFs terminliste, som
  bare dekker våren 2027): Region Tour 5/Torsdagsturnering uke 34, Srixon Tour Finale uke 39.
  Begge bør verifiseres mot GolfBox før publisering.
- VG3 skriftlig eksamen (uke 20) lagt til; bekreftet at eksamen (hverdager) og turnering
  (helg) ikke kolliderer i uke 19/21/22/23.

## Ikke gjort i denne runden

- Vårens turneringsdatoer (Norgescup/Østlandstour/Srixon Tour/NM) — fortsatt «ikke lagt inn
  ennå» i NGFs eget utkast, se `kilde/00-terminliste-2027-utkast.md`.
- Samlingsdager uten overnatting (7–14 stk./år) utover 15.10 — Anders ba om å vente med disse.
- Full visuell sammenligning mot Claude Design-skjermene (foto, gradienter, kalenderens
  måneds-/år-visning) — det som er gjort nå er datakorrekthet i den eksisterende komponent-
  strukturen, ikke pikselgjennomgang. Fortsatt «port 7» før dette er en ferdig skjerm.
