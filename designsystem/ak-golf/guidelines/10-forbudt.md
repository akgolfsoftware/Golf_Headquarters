# 10 · Det som er forbudt

Én side, så ingen trenger å lete.

## Merket

- **MORAD og Mac O'Grady i publikumsvendt tekst.** Aldri. Internt fagspråk i
  produktet består.
- **«En del av AK Golf» på Mulligan Indoor Golf.** Anlegget står for seg selv.
- **Bilder av mindreårige uten skriftlig foreldresamtykke.** Alle
  identifiserbare barn, også i gruppebilder.
- **WANG, GFGK og Team Norway framstilt som noe man kan kjøpe tilgang til.**
  De er relasjoner, ikke produkter.
- **Navngitte konkurrenter hengt ut.** Beskriv situasjonen, ikke personen.

## Formen

- Ingen fjerde font. (Archivo Narrow, Poppins, IBM Plex Mono. Lora er ute.)
- Ingen farge utenfor `tokens/farge.css`.
- Ingen gradient over merkefarger.
- Ingen Poppins over vekt 600. 700 er kun Archivo Narrow.
- Ingen caps på en hel setning i brødtekst.
- **Ingen serif.** Instrument-retningen har ingen.
- **Ingen falske instrumenter:** rutenett med tall på aksene, kurver uten
  data, spredninger uten målinger, akser uten enhet. Formen skal ikke påstå
  noe teksten ikke kan dekke.
- Ingen to instrumentelementer på samme flate.
- Ingen avstand utenfor 4-skalaen.
- Ingen pill-radius på et kort.
- Ingen animasjon som bare skal få oppmerksomhet.
- Ingen emoji. Ikoner er Lucide.

## Språket

- Ingen utropstegn.
- Ingen markedsføringsklisjéer (`08-sprak.md`).
- Ingen engelske floskler i norsk tekst.
- Ingen tall om en spiller uten dato og kilde, eller merking som estimat.
- Ingen garantier om resultat.
- **Ingen vitnesbyrd.** Ingen spillersitater, ingen anmeldelser, ingen
  stjerner. Vis målingen i stedet — se `08-sprak.md`.

## Grensene mot de andre systemene

- **AK Golf-tokens skal aldri inn i en produktskjerm.** PlayerHQ, AgencyOS og
  Forelder bruker `--tl-*` (Train-lock). Ingen skjerm har to fasiter.
- **AK Golf-merket skal aldri inn på `/team-norway/*`.** Der gjelder Claw.
- **Paper finnes ikke.** Ingen `--p-*`, ingen `T`, ingen Paper-CSS. Vakten
  `scripts/check-ingen-paper.mjs` håndhever det.
