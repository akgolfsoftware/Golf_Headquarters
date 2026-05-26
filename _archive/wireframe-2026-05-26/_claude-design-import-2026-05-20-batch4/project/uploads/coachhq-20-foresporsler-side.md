# CoachHQ — Forespørsler-side

**Rute:** `/admin/foresporsler`.

## Kontekst
Forespørsler = ting eksterne sender INN til AK Golf: bli ny spiller, kontakt om sponsoravtale, presse, foreldre med spørsmål. Innboks for ny-trafikk.

## Formål
- Triage av inn-forespørsler
- Score lead-kvalitet automatisk
- Konvertere til ny spiller / sponsor / arkiv

## Layout

**Header:**
- "Forespørsler · 7 nye" Inter Tight 700 32px
- "3 høy prioritet · 2 venter svar" mono
- Filter: Alle | Bli spiller | Sponsor | Presse | Annet
- "Eksporter" outline + "Søk" felt

**Tabell:**
Kolonner:
- Mottatt (mono "2t siden")
- Type-pille
- Avsender (navn + e-post small)
- Tema-ekstrakt (first 80 tegn av melding)
- AI-score-badge: lime "Høy", forest "Medium", muted "Lav"
- Status: NY / SVART / KONVERTERT / ARKIVERT (pill)
- Action: "Åpne" link

Klikk rad → drawer høyre med full melding + AI-utkast på svar + "Konverter til ny spiller"/"Arkiver"-knapper.

**Stat-strip bunn:**
"Konverteringsrate siste 30d: 38% · Snitt-respons: 4t 12m"

## Branding
Cream bg, hvit tabell, lime AI-score-pill, forest CTA.
