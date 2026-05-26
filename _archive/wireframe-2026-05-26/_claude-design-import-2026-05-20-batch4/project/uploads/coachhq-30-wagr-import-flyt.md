# CoachHQ — WAGR-import-flyt

**Rute:** `/admin/talent/wagr-import`.

## Kontekst
World Amateur Golf Ranking (WAGR) publiserer ukentlige rangeringer. Anders importerer disse for å berike spiller-profilene.

## Formål
- Hente fersk WAGR-data (manuell trigger)
- Mappe WAGR-spillere mot interne spillere
- Vise diff: hvem klatret, hvem sank

## Layout

**Header:**
- "WAGR-import" Inter Tight 700 32px
- "Siste import: i går 18:30 · 4 832 spillere i database" mono
- "Importer på nytt" forest fill

**Import-status-card:**
- Lucide Download stort venstre + "Klar for import" muted hvis ingen pågående
- Ved kjørende: progress-bar med "Henter side 12 av 48..." mono live-tekst

**Diff-tabell etter import:**
Topp 50 endringer for AK Golf-spillere:
| Spiller | Forrige rank | Ny rank | Endring | Trend |
|---|---|---|---|---|
| Markus | 4 920 | 4 832 | ↑ 88 | lime |
| Sofie | 8 110 | 8 245 | ↓ 135 | destructive light |

**Mapping-seksjon:**
"5 nye norske amatører funnet" + tabell der Anders kan klikke "Match" mot eksisterende profil eller "Opprett ny".

**Logg-historikk:**
Liste over siste 10 importer med tidspunkt + antall endringer.

## Branding
Cream bg, hvit panel, forest Lucide-ikon, lime ↑ / red ↓.
