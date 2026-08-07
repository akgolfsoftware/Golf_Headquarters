# 08 — Bekreftelse: hva Anders ønsker å oppnå

**Dato:** 2026-08-07  
**Kontekst:** Etter inventar av Toshiba MORAD-arkivet + Masterbrain-rebuild.

---

## Bekreftelse (slik jeg forstår det)

Du vil bygge en **AI-coach som er en klone av deg som coach** — ikke en generisk golf-chatbot.

Det betyr tre lag samtidig:

### 1. Din coaching-identitet (hvordan du tenker og snakker)
- MORAD / Mac O'Grady som faglig DNA (Skype, e-post, skoler, personlig svinganalyse)
- CANON / AK-formel / pyramide / periodisering slik *du* bruker det med spillere
- Dine invarianter: aldri finne på metodikk, SG er hypotese, drills bare fra fasit
- Tone og beslutningsmønster fra AgencyOS / PlayerHQ / live-økt — som om det er du som coach

### 2. Ubegrenset kunnskapsdybde (det du ikke kan holde i hodet alene)
- Hele videoarkivet (~780 GB): forelesninger, practice, short game, Skype, modell-svinger
- Destillert til **søkbar, versjonert kunnskap** (transkripsjoner → chunks → ordbok → entities)
- TrackMan / SG / ball flight som **sannhetssignaler**, ikke erstatning for coaching-dømmekraft
- Putting og short game som **søskenhjerner**, ikke tvunget inn i P1–P10

### 3. Hard law knowledge OS (Masterbrain)
- Fasit i `knowledge/` — agenter adlyder struktur, ikke prose
- RAG er støtte, ikke lov
- Drill-bank kun det du har validert
- Skalerer til mange spillere (PlayerHQ) og din drift (AgencyOS) uten at kvaliteten dilutes

**Én setning:**  
Du vil at systemet skal *tenke og velge som Anders med Mac/MORAD i ryggen*, men *huske og hente mer enn noe menneske kan* — fra ditt eget arkiv — uten noensinne å late som det vet noe som ikke finnes i fasiten.

---

## Hva det *ikke* er

- Ikke «ChatGPT med golf-prompt»
- Ikke YouTube-drill-generator
- Ikke å dumpe 796 GB video inn i en modell og håpe
- Ikke å erstatte deg i relasjonen — det er din **ubegreensede assistent/klone** for plan, diagnose, drills og oppfølging

---

## Hvordan videoarkivet inngår (retning, ikke implementert her)

| Steg | Hva | Hvorfor |
|------|-----|---------|
| A | Behold video på disk / cold storage | Rå sannhet |
| B | Transkripsjon der det finnes tale (delvis gjort: 71 lectures) | Tekst agenter kan bruke |
| C | Chunk + embed → RAG support | «Husk» Macs ord med kilde |
| D | Destillér til entities (faults, drills, ordbok, putting) | Det agenter *adlyder* |
| E | Din stemme: coaching-sessions, Notion, second-brain | Kloner *deg*, ikke bare Mac |
| F | Eval mot holdout + dine godkjenninger | Beviser at klonen ikke dikt |

Video uten destillasjon = arkiv.  
Video + Masterbrain-lover = **ubegrenset coach-hjerne under din kontroll**.

---

## Forutsetning som nettopp ble fikset

Klonen kan ikke få lov til å finne på drills mens banken er tom.  
Det er fikset i kode (drill-forslag + fabrikk). Uten den loven ville «ubegrenset kunnskap» blitt «ubegrenset dikt».
