# Retusjerte bilder

PUMA-logoen er fjernet fra coach-klærne i disse fem. Originalene ligger urørt
ett nivå opp — vi overskriver dem aldri.

Fjernet 01.09.2026 fordi sponsoravtalen er ute (Anders). Metode: OpenCV-inpaint
med lyshetskorreksjon og matchet korn. Holder for skjerm og trykk opp til
omtrent A4; ved sterk forstørrelse ses fortsatt et svakt spor etter broderiets
skygge.

**Bruk disse framfor originalene.**

| Bilde | Status |
|---|---|
| #3 | Ren |
| #9 | Ren |
| #12 | Ren (gjort om 01.09 — første forsøk ga firkantet artefakt) |
| #14 | Ren |
| #41 | Ren. Portrettet av Anders |

## Hvorfor bare fem — og hva som skal til for resten

Metoden virker **kun der tekstilet er jevnt**. Alle fem over har en mørk,
ensfarget genser der inpaint har noe å fylle med.

Den feiler der stoffet har folder eller sterke lyssprang: tersklingen tolker
folden som en del av logoen, masken sluker hele området, og resultatet blir en
mørk firkant. Forsøkt på **#8** med tre ulike innstillinger — alle ga firkant.
Bildet er tilbakestilt til originalen.

Automatisk lokalisering fungerer heller ikke. Malsøk med logoen som mal ble
kjørt over alle 38 gjenstående bilder og ga **152 kandidater, alle falske** —
gress, trær og himmel. Logoene på avstand er for små og for lavkontrast.

## Bilder med synlig merkevare som IKKE er fjernet

Identifisert ved gjennomsyn 01.09.2026:

**PUMA på klær:** #2, #4, #5, #6, #7, #8, #13, #16, #39, #42
**Callaway:** #10 (tekst på regissørstol), #20 (bag, stor og lesbar),
#37 («PARADYM» på køllehode-trekk)

## To veier videre

1. **Manuell retusj** i Photoshop eller tilsvarende — content-aware fill med
   håndtegnet maske. Sikrest, og den eneste som takler folder.
2. **AI-inpainting** som tegner om området. Koster kreditter, og kan endre
   detaljer i bilder som var dyre å lage.

Ingen av delene bør gjøres uten at Anders har bestemt hvilken.
