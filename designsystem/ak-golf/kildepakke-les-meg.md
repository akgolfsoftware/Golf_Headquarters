# AK Golf — kildepakke til Claude Design

Alt designeren trenger. Last opp hele mappa i Claude Design-prosjektet, og lim
inn `BESTILLING.md` som første melding.

Laget 01.09.2026.

## Hva ligger her

```
BESTILLING.md          Prompten. Lim inn denne som første melding.
logo/                  19 SVG-filer. Ukrenkelige — rendres fra fil, aldri gjenskapes.
tokens/                Farge, type, rom, bevegelse, instrument. Fasit i kode.
retningslinjer/        Elleve kapitler: merket, arkitektur, logo, farge, typografi,
                       rom, foto, språk, varianter, forbudt, instrumentet.
foto/                  43 bilder + katalog.md som beskriver hvert enkelt.
tekst/                 Ferdig tekst og merkeplattformen.
```

## Logofilene

| Fil | Brukes på |
|---|---|
| `ak-golf-logo-primary-on-light.svg` | Betonggrå og hvit flate — **standard** |
| `ak-golf-logo-primary-on-dark.svg` | Mørk flate |
| `ak-golf-logo-white-on-dark.svg` | Foto og film, mørk bakgrunn |
| `ak-golf-logo-white-mono.svg` | Én farge hvit — brodering, gravering |
| `ak-golf-logo-black-mono.svg` | Én farge sort |
| `ak-golf-logo-primary-mono.svg` | Én farge signalrød |
| `ak-golf-merke-kvadrat.svg` | Profilbilder |
| `ak-golf-favicon.svg` | Nettleserfane, leses ned til 16 px |
| `ak-golf-laas-<variant>.svg` | Logo + virksomhetsnavn, låst. Fem varianter |
| `ak-golf-laas-<variant>-pa-morkt.svg` | Samme, for mørk flate |

`ak-golf-logo-white-on-green.svg` er historisk. **Bruk den ikke.**

## Fotoene

Filnavnene er `ak-golf-01` til `ak-golf-44`. Nummeret matcher katalogen i
`foto/katalog.md`, som beskriver motiv og bruksområde for hvert bilde.

Nummer 40 finnes ikke — bildet er slettet (viste en person som ikke hører
hjemme i materiellet).

**Bildene er nedskalert til 1600 px bredde** for at pakken skal være håndterlig.
Originalene er 2400 px og ligger i kodebasen. Trenger du full oppløsning til
trykk, si fra.

**PUMA-logoen er retusjert bort** i #3, #9, #12, #14 og #41. De øvrige bildene
kan fortsatt ha den synlig — se katalogen.

## Tokens

CSS-variabler med prefiks `--ak-`. Alle kontrasttall i kommentarene er **målt**
med WCAG-formelen 01.09.2026, ikke anslått.

`farge.css` er den viktigste. Den inneholder regelen som bærer hele paletten:
**rødt betyr «se her»** — en måling, et tall, en handling. Aldri dekor.

## Rekkefølge å lese i

1. `BESTILLING.md` — hva som skal lages
2. `retningslinjer/01-merket.md` — hva AK Golf er
3. `retningslinjer/04-farge.md` — rommet og paletten
4. `retningslinjer/11-instrumentet.md` — det grafiske elementet
5. `retningslinjer/10-forbudt.md` — alt som er forbudt, på én side
6. `tekst/tekstkonsept.md` — ferdig tekst. Ikke skriv ny der denne finnes.
