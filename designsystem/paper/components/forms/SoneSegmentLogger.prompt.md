# SoneSegmentLogger

Kondisjonssegmenter i live-økta: pågående segment, segmentbytte
(Oppvarming/Drag/Hvile × sone 1–5), og logg over avsluttede segmenter.

## Når den ikke skal brukes
Golf- eller FYS-drills — de logges med reps (`TallStepper`/`HurtigTapper`)
eller reps+vekt (`SettLogger`), ikke tid-i-sone.

## Kontrakt
- Typeknappene og sonesirklene er 36 px / 32 px synlig, 44 px ved grov
  peker — sirklene er tettere fordi det er fem av dem på rad.
- `role="status"` på det pågående segmentet så skjermleser fanger byttet
  uten at hele komponenten leses på nytt.
- Loggraden viser type · sone og varighet — aldri en vurdering av om
  segmentet var «bra».

## Målt
Typeknapp 36,0 px synlig / 44,0 px ved grov peker. Sonesirkel 32,0 px synlig
/ 44,0 px ved grov peker.
