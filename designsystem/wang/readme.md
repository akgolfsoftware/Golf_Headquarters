# WANG Golf — Årsplan (redesign 2026)

Designprosjekt for **golfgruppa ved WANG Toppidrett Fredrikstad**. Opprettet 2026-08-10 for å
forbedre designet på årsplan-/treningsplanflaten før den bygges i kode.

Fasit for kode: dette prosjektet. Plan og skjermregnskap:
`docs/port/plan-design-wang-arsplan.md` i `akgolfsoftware/Golf_Headquarters`.

---

## Hva som skal forbedres

Flaten finnes allerede i kode (`src/app/team-wang/`) og har riktig merkevare, men er ikke
designet ferdig. Redesignet skal løfte den fra «fungerer» til «ferdig produkt».

Kjente svakheter å angripe:

1. **Årsplanen mangler et tydelig helhetsbilde.** Eleven ser uker og økter, men ikke sesongen
   som form — hvor er jeg, hva bygger vi mot, hva er neste milepæl.
2. **Trenerflaten og elevflaten er ikke koblet visuelt.** Samme plan, to språk.
3. **Tomme og ventende tilstander er ikke designet** — flere skjermer har kun suksess-varianten.
4. **Tetthet på mobil.** 390px er førsteinntrykket; flere kort er bygget desktop-først.

---

## Låste rammer (endres ikke i designet)

- **Kun golf.** Golfgruppa, ikke skolens øvrige idretter. Ingen idrettsvelger, ingen
  skoleadmin-/eier-/klubbtrener-roller. (Avklart 2026-08-10.)
- **Tre roller:** elev · foresatt · trener.
- **Norsk bokmål** i all tekst. Aldri emoji — ikonsettet er Lucide.
- **Én palett, ingen mørk modus.** Flaten er lys med vilje.
- **Maks én primær handling per skjerm.**
- **Mobil 390px designes først**, deretter desktop 1280px.
- **Merkevaren er WANG** på elev-/foreldreflaten. Trenerens planleggingsverktøy (AgencyOS)
  beholder sitt eget designsystem — det er et verktøy på tvers av flere virksomheter.

## Merkevaregrunnlag

Fargene, typografien og flatene ligger i `grunnlag/`. De er hentet fra kode
(`src/styles/wang-tokens.css`) og er allerede i produksjon — behandle dem som utgangspunkt,
ikke som noe som må gjenoppfinnes. Foreslå gjerne justeringer, men marker dem tydelig som
endringer.

- **Font:** Montserrat (merkevare/titler) + Quattrocento Sans (brødtekst).
- **Kjernefarger:** navy `#17446f`, teal `#2e857d`, mint `#49ca9f`.
- **Flate:** hvite kort på lys grå bakgrunn, myke navy-tintede skygger, **aldri ramme**.
- **Radius:** 26px på kort, 999px på chips.

## Skjermomfang

22 skjermer totalt: 14 elev/foreldre, 2 trener (WANG-merkevare), 6 i AgencyOS (eget
designsystem, utenfor dette prosjektet). Full liste med datastatus per skjerm ligger i
planen i repoet.

Prioriter i denne rekkefølgen — skjermene som kjører på ekte data først:

1. Årsplan/sesongoversikt (elev)
2. Ukevisning og økt-detalj
3. Trenerens årsplanvisning
4. Tester og utvikling
5. Foreldreflaten
