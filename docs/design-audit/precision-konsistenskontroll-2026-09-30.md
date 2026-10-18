# Konsistens og lesbarhet — kontrollgrunnlag 30.09.2026

Dette er en egen statisk kontroll av eksporten **før** de bestilte rettingene i Claude Design. Den er ikke en tilgjengelighetsgodkjenning og beskriver ikke ferdig skyendring. Ny eksport skal sammenlignes og undersøkes etterpå.

## Bekreftede verdier

Plex Sans brukes til tekst og Plex Mono til tall. Avstander følger 4/8-trinn. Standard hjørner er 8 px, dialog 12 px, pill 999 px; kort har ingen skygge. Skjermrammen har 56 px topplinje, 64 px bunnmeny og maksimalt 1200 px innhold. Eksisterende komponenter og semantiske fargeverdier er kilden; nye parallelle definisjoner skal ikke innføres.

## Kontrast som krever oppfølging

For vanlig meningsbærende tekst er målet minst 4,5:1. Større tekst har annet krav og inaktive/dekorative elementer har unntak. Se [W3C kontrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Produktets 44 px treffmål er et eget strengere mål; [W3C minimum for treffmål](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) har også unntak.

Beregningene under gjelder deklarerte farger, alfabakgrunn over kortflaten og standard temaer. Sammenligning bruker uavrundet verdi. Faktisk bakgrunn, størrelse, overstyring og bruk må kontrolleres i nettleseren før et konkret element klassifiseres.

| Tema | Tekst / bakgrunn | Forhold | Vanlig tekst ≥4,5 |
|---|---|---:|---|
| lyst | `--text-primary` / `--surface-page` | 14.393:1 | Ja |
| lyst | `--text-secondary` / `--surface-page` | 7.594:1 | Ja |
| lyst | `--text-muted` / `--surface-page` | 4.531:1 | Ja |
| lyst | `--text-faint` / `--surface-card` | 3.619:1 | Krever kontroll |
| lyst | `--axis-fys-fg` / `--axis-fys-bg` | 4.234:1 | Krever kontroll |
| lyst | `--axis-tek-fg` / `--axis-tek-bg` | 4.742:1 | Ja |
| lyst | `--axis-slag-fg` / `--axis-slag-bg` | 5.685:1 | Ja |
| lyst | `--axis-spill-fg` / `--axis-spill-bg` | 4.818:1 | Ja |
| lyst | `--axis-turn-fg` / `--axis-turn-bg` | 5.721:1 | Ja |
| natt | `--text-primary` / `--surface-page` | 18.346:1 | Ja |
| natt | `--text-secondary` / `--surface-page` | 7.933:1 | Ja |
| natt | `--text-muted` / `--surface-page` | 7.933:1 | Ja |
| natt | `--text-faint` / `--surface-card` | 3.258:1 | Krever kontroll |
| natt | `--axis-fys-fg` / `--axis-fys-bg` | 5.919:1 | Ja |
| natt | `--axis-tek-fg` / `--axis-tek-bg` | 5.863:1 | Ja |
| natt | `--axis-slag-fg` / `--axis-slag-bg` | 5.539:1 | Ja |
| natt | `--axis-spill-fg` / `--axis-spill-bg` | 5.061:1 | Ja |
| natt | `--axis-turn-fg` / `--axis-turn-bg` | 5.584:1 | Ja |

`--text-faint` brukes blant annet i metainformasjon, antall på faner og navn på menygrupper (`components/components.css` linje 123, 175 og 192). Kontroller disse som meningsbærende tekst; bruk en egnet eksisterende tekstverdi der kontrasten er for svak. Inaktive kontrollknapper undersøkes separat. FYS-merket bruker `--axis-fys-fg` mot `--axis-fys-bg` (linje 96), og komponenten viser 11 px tekst som standard og 13 px i stor variant. Bevar aksefarge som identitet, og korriger tekstlesbarheten uten en ny profil. Endringer i den godkjente PH-01-referansen blir en ny variant som Anders skal se; den gamle referansen forblir godkjent.

## Kontrollpunkter for leveransen

- Ett aktivt oppsett av hver komponent og skjerm-ID; historiske hjelpere og videresendinger skilles fra aktive navigasjonspunkter.
- Samme tekststil, avstand, hjørner, ikoner og kontrollstørrelser gjennom PlayerHQ/AgencyOS, med avtalte egne profiler bevart.
- Ett valgt objekt gjennom hver reise: økt, spiller, oppgave og uke bevares også ved tilbake/avbryt.
- Synlig valgt verdi, inkludert historisk teknisk fokus; ingen stille nullstilling.
- Ensartet lagring, feil, tomt innhold, lasting, publisering, angre og ulagrede endringer. Prototype og fungerende serverlagring merkes hver for seg.
- Tastatur, fokus etter dialog, navn på ikonknapper og meningsbærende kontrast undersøkes på de faktisk endrede skjermene.
- Mobil 390 px og desktop 1280 px, lys/natt og data/tom/laster/feil måles. Manglende skjerm eller klar-signal er feil.
- Alle trykkbare kontroller har eksakt mål i frosset knappkart; ingen generell «åpner riktig skjerm»-tekst.
- Ny eksport, kontrollsum, arkivregister og skjermgodkjenning peker på samme versjon.

[Maskinlesbar beregning](precision-kontrastgrunnlag-2026-09-30.json), [bestilling og leveringsstatus](../design-system/claude-design-konsolidering-2026-09-30.md) og [Grok-overlevering](../design-system/grok-build-overlevering.md).
