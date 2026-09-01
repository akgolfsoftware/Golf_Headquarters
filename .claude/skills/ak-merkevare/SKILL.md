---
name: ak-merkevare
description: |
  Finjusterer AK Golf-MERKET — marked, materiell, presentasjon, sosiale medier,
  e-post, trykk, foto og tekst. Fasit er VERKSTEDET: grunn #E8E4DC, signal #B83217
  (betyr «se her»), IBM Plex Sans Condensed / Sans / Mono, instrumentlaget
  (rutenett 56px, målestokk, kryss). Krem #FAF9F5, clay #D97757, Poppins, Lora,
  Archivo og Paper er UTE av merket.
  Bruk ved: markedsside, landingsside, kampanje, presentasjon, roll-up, plakat,
  visittkort, e-post, nyhetsbrev, innlegg, story, brevark, tilbud, profilklær,
  logobruk, favicon, fotovalg, merketekst, tagline, tone, trykkfarger.
  Trigger også uten ordet «design»: «finpuss», «juster», «ser dette riktig ut»,
  «sjekk mot merket», «kan vi skrive», «hvilket bilde».
  IKKE for produktskjermer i /portal, /admin eller /forelder — der gjelder
  Train-lock (designsystem/train-lock/). IKKE for /team-norway/* — der gjelder
  Claw (designsystem/team-norway/).
version: "1.0"
updated: "2026-09-01"
---

# AK Merkevare — verkstedet

Du finjusterer AK Golfs merkevare. Ikke produktet. Grensen er absolutt, og den er
det første du sjekker: **er dette en skjerm inne i appen?** Da er du feil skill.
Si det, og pek på `designsystem/train-lock/` — `DESIGN-SYSTEM.md` for visuelle
verdier, `SCREEN-INDEX.md` for å finne skjermen, `HANDOFF.md` for struktur.
Ved konflikt vinner HANDOFF på struktur og DESIGN-SYSTEM på verdier.

Fasit i repoet: `designsystem/ak-golf/`. Les `guidelines/` før du dømmer noe.

## Rommet

Merket hører hjemme i et **verksted**, ikke i et klubbhus. Det følger av hva
Academy står for: *langsiktig utvikling, oppfølging, og å trene optimalt og
spesifikt — uavhengig av hvilket nivå spilleren er på.*

Den siste delen avgjør alt. De fleste golfmerker signaliserer eksklusivitet og
sier «her må du være god nok» før noen har lest et ord. AK Golf sier det motsatte.
**Ingenting skal se premium ut.** Et godt verktøy er ikke pyntet — det er nøyaktig.

Ser du noe som ligner klubbhus — gull, marmor, seriff, dyp jaktgrønn, ornament —
er det feil, uansett hvor pent det er.

## Verdiene du måler mot

```
Grunn          #E8E4DC   varm betonggrå
Grunn senket   #DDD8CE
Ark            #FFFFFF
Tekst          #1F1D1A   13,3:1
Dempet         #57534B   6,0:1
Svak           #8B857A   2,9:1 — ALDRI brødtekst
Linje          #D2CCC0   ·  hard #B8B1A3
Signal         #B83217   4,7:1  ·  fyll #C4361B  ·  hvit på fyll 6,0:1
Fag            #2C6E63   4,7:1  metoden, ikke målingen
Mørk grunn     #22201C   ark #2C2925  tekst #F2EFE8  signal #E8654A
```

Varianttoner: Junior `#4A6B33` · Academy låner signalet · HQ `#2B5F87` ·
Organisasjon `#4A4F58` · Products `#7A5A22`.

Fonter: **IBM Plex Sans Condensed** (600/700, overskrift) · **IBM Plex Sans**
(400/500/600, brødtekst) · **IBM Plex Mono** (400/500, alt som er målt).
700 er kun Condensed.

Skala: `11 · 13 · 15 · 17 · 21 · 26 · 34 · 48 · 72 · 112`. Display fra 48 og opp
har linjeavstand 0,94. Rom: 4-basis. Radius: knapp 6 · kort 10 · panel 16 ·
pill kun på knapp.

## De fire reglene som avgjør mest

**1 · Rødt betyr «se her».** En måling, et tall, en handling. Aldri dekor, aldri
stemning, aldri fem røde ting på samme flate. Ser du rødt brukt som pynt, er det
den viktigste rettelsen på flaten.

**2 · Mono betyr målt.** Et tall som kommer fra en måling settes i mono. Et tall
som ikke gjør det, settes ikke i mono. Estimater merkes som estimat.

**3 · Instrumentlaget lyver ikke.** Rutenett i bakgrunnen er tekstur. Rutenett
med tall på aksene er en påstand — da må tallene være målt, med dato og kilde.
Ingen kurver uten data, ingen akser uten enhet. Ett instrumentelement per flate.

**4 · TrackMan-parametere: engelsk, stor forbokstav.** **Attack Angle**, aldri
«angrepsvinkel» og aldri «attack angle». Samme for Club Path, Face Angle, Dynamic
Loft, Smash Factor, Ball Speed, Club Speed, Launch Angle, Spin Rate, Spin Axis,
Carry, Total, Dispersion, Landing Angle, Low Point, Swing Direction. Behold
parameteren, forklar den i setningen etter. Gjelder ikke golfspråket ellers.

## Slik finjusterer du

Gå gjennom i denne rekkefølgen. Stopp ved første som feiler — den er alltid
viktigere enn de under.

1. **Rommet.** Ser dette ut som et verksted eller et klubbhus?
2. **Signalet.** Er rødt brukt til noe som betyr noe, eller til pynt?
3. **Kontrast.** Mål den. Ikke anslå. Under 4,5:1 for tekst er en feil, ikke en
   smakssak. `#8B857A` er aldri brødtekst.
4. **Mono.** Står de målte tallene i mono? Står noe uten måling i mono?
5. **Typografi.** Riktig font i riktig rolle? Condensed på overskrift, Sans på
   brødtekst? Poppins over 600 er alltid feil (Poppins skal ikke være der i det
   hele tatt).
6. **Rom.** Er hvert avstandsmål på 4-skalaen? 22 px er feil — velg 20 eller 24.
7. **Mobil 390.** Fungerer det stående, ute, i sollys? Det er den viktigste
   visningen, ikke desktop.
8. **Språket.** Klisjéer? Utropstegn? Vitnesbyrd? TrackMan oversatt?

## Aldri

- **MORAD eller Mac O'Grady** i publikumsvendt tekst.
- **Vitnesbyrd** — ingen spillersitater, anmeldelser eller stjerner. Vis målingen.
- **Bilder av mindreårige** uten skriftlig foreldresamtykke, hvert barn.
- **«En del av AK Golf» på Mulligan** — anlegget står utenfor paraplyen.
- **WANG, GFGK, Team Norway** framstilt som noe man kan kjøpe tilgang til.
- Gradienter. Seriffer. Emoji (ikoner er Lucide). Farge utenfor paletten.
- Klisjéer: «ta golfen til neste nivå», «vi brenner for», «unlock your potential».
- Garantier om resultat.

## Når du er i tvil

Les setningen høyt: **ville en erfaren coach sagt den til en spiller på rangen?**
Nei — skriv om.

Og for form: **kan fargen fjernes uten at flaten slutter å virke?** Nei — da
bærer den for mye.

## Filene

```
designsystem/ak-golf/tokens/       farge · type · rom · bevegelse · instrument
designsystem/ak-golf/guidelines/   elleve kapitler, 04 og 11 er de viktigste
designsystem/ak-golf/merkebok.html visuell fasit, tolv sider
docs/merkevare/ak-golf-tekstkonsept-2026-09-01.md   ferdig tekst
designsystem/ak-golf/foto/katalog.md               43 bilder beskrevet
public/logos/                                       19 SVG-er
```

**Bygg aldri en logolås for hånd** — filene finnes. **Skriv aldri ny tekst der
tekstkonseptet har den.** **Finn aldri på fotoretning** — katalogen beskriver
hvert bilde.

## Målt, ikke anslått

Oppgir du et kontrasttall, skal det være regnet ut. WCAG-formelen:

```python
def lin(c):
    c /= 255
    return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
def lum(h):
    h = h.lstrip("#"); r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b)
def kontrast(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return round((hi + 0.05) / (lo + 0.05), 2)
```

Det er merkets eget prinsipp brukt på seg selv: alt vi påstår skal kunne
etterprøves.
