# TidsPyramide

Anbefalt tidsfordeling — timer/år — over de fem pyramide-aksene, som klikkbar pyramide + anbefalingskort. Porten av kategorisystemets «Anbefalt tidsfordeling»-bånd, kanon-korrigert.

## Bruk
```jsx
<TidsPyramide
  aarsmodell={{ fys: 180, tek: 200, slag: 230, spill: 270, turn: 420, total: 1300, tw: 20, rd: 4, rh: "5,25" }}
  perUke="30"
  valgt={selLevel}
  onVelg={setSelLevel}
/>
```

## Domenefasit
- **KANONISK rekkefølge apex→base: TURN øverst, FYS fundament** (bredder 64→100 %). Navn: Fysisk · Teknikk · Slag · Spill · Turnering — aldri «Teknisk»/«Golfslag».
- Akse-farger = `--axis-*`; **etiketten står i gutteren** med `--axis-*-text` (fargeblind-backup med 3-bokstavs kode, aldri lime-tekst på lys) — baren bærer ingen tekst, så kontrast holder i begge tema-matriser.
- Anbefalingskortet: `--signal`-ramme + signal-tint (lys → forest automatisk). Viser timer (mono, mellomrom som tusenskille), % av total, akse-note og for TURN nedbrytingen «uker × runder × timer = t/år». Totallinje «Totalt ≈ X t/år · Y t/uke».
- Alle tall er estimat — hosten viser estimat-merket (KategoriStige gjør det).

## Tilstander
Uten `aarsmodell` → ærlig tomtekst. Kontrollert (`valgt`/`onVelg`) eller ukontrollert (intern state, default `turn`).

## Komponerer
Bånd 2 i `KategoriStige`; gjenbrukbar alene i PlayerHQ («hva kreves på neste nivå»). Slektning av `PyramideFasett` (motiv) — denne er interaktiv budsjettvelger.
