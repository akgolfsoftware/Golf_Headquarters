# Prompt — videreutvikle Team Norway Golf Design System (ikke appen)

Lim inn i **samme Open Design-prosjekt** som zip-en `Team Norway Golf Design System`.  
**Ikke** lag et app-prosjekt. **Ikke** tegn Team Norway HQ, PlayerHQ, AgencyOS eller noen rute. Dette er merkevare + kommunikasjon.

---

Du eier **Team Norway Golf Design System**. Kilden er zip-en som allerede ligger i prosjektet (namespace `TeamNorwayGolfDesignSystem_3416f2`). Les `readme.md` først. Den er loven, med ett unntak: der readme merker noe som **proposal**, skal du enten (a) låse det med en retningslinje-kort og begrunnelse fra logoen, eller (b) merke det tydelig «forslag — venter på originalfil».

## Hva dette er

Et **komplett merkevaresystem** for Norges Golfforbunds toppidrettssatsing Team Norway Golf (TNG). Brukes til presentasjon, brev, e-post, rapport, program, tilbud, plakat, diplom, rollup, Instagram, Facebook, LinkedIn, Snapchat, TikTok, Reels, YouTube.

Nasjonen er det høyeste elementet. To flaggstreker, tynn geometrisk caps, mye hvitt. Lavt drama. Coach som snakker rett til spiller og foresatt.

## Hva dette ikke er

- Ingen app-skjermer. Ingen rail, ingen dekningsgrad, ingen workdesk, ingen IUP-flate.
- Ingen AK Golf, ingen AgencyOS, ingen PlayerHQ, ingen Paper, ingen krem, ingen gull, ingen Schibsted-som-merkevare her (det er et annet system).
- Ikke Norges Golfforbunds lilla årsrapport-palett (`assets/reference/` er **referanse, ikke tokens**).
- Ikke NFF «Team Norway» (fotball). Ikke Olympiatoppens merke.
- Ikke finn på et ikonbibliotek. Lucide er midlertidig substitusjon og skal stå merket som det.

## Bakken du står på (ikke rør uten kort)

**Logo — tre filer, aldri redraw**

| Fil | Bruk |
|---|---|
| `logo-team-norway-golf-transparent.png` | Primær, lys flate |
| `logo-team-norway-golf-knockout-white.png` | Hvit + rød strek på navy/foto/mørk |
| `logo-team-norway-golf-white.png` | Hvit plate, trykk |

Clearspace = høyden på flaggstrekene. Min 120 px skjerm / 30 mm trykk. Aldri farge om, strekk, skygge, annet typeface på ordmerket.

**Farge (målt fra logo-JPG)**

- Navy `#012B5D` — struktur, invers, lenke, primærknapp
- Rød `#D40E3A` — **aksent, én rød per komposisjon**, aldri brødtekst-bakgrunn
- Paper `#FFFFFF` · paper-2 `#F7F7F5` · ink `#141414`
- Fairway `#1F6B45` — kun success/kvalifisert
- Maks to bakgrunner per dekk/dokument: hvit og navy

**Type (substitusjon til original font kommer)**

- Display: **Jost Light 300**, ALL CAPS, tracking `.16em` — ordmerkets stemme
- Brød: **Lato 400**, 16/1.62, mål 66ch
- Data: **IBM Plex Mono**
- Display aldri under 24 px på 1920×1080. Brød aldri under 12 pt i trykk.
- Norsk: setningscase i overskrift og brød. Aldri Title Case.

**Én grafisk bevegelse:** FlagRule — navy 6 px + rød 6 px, gap 5 px. Den leder, typen følger. Ingen diagonal, ingen mønster, ingen tekstur, ingen gradient unntatt `--overlay-scrim` på foto.

**Form:** nesten kvadratisk (radius 0 / 2 / 4). Eneste pille er Switch. Flat som default. Skygge tintet navy.

**Bilde:** kjølig nordisk lys, vidt utsnitt, ingen filter. Tekst på foto **alltid** over navy-scrim. Sort-hvitt kun gruppe/miljø.

**Språk:** bokmål først. «vi / du». Kort, verb først, tall før ramme. Bruk: økt, samling, treningsuke, sesongmål, kvalifisering, rangering, spiller, lag, foresatt. Unngå: reise-som-metafor, unlock/potensial, superlativ uten tall, utropstegn.

## Oppgaven — gjør systemet verdensklasse uten å tegne produkt

Tegn **guideline-kort og kommunikasjonsmaler**. Ikke skjermer. Hvert kort: 700×… specimen, norsk eyebrow i Jost, ett prinsipp, ett forbud.

### A. Lås merket (mangler i v1)

1. Logo do/don’t — 8 forbud: farge om, strekk, roter, skygge, outline, annen font, trekk fra hverandre, bruk strekene uten merket *som logo* (FlagRule er tillatt som linjal, ikke som erstatning for merket).
2. Knockout vs plate vs transparent — tre flater side om side med «bruk / ikke bruk».
3. Lockup med Norges Golfforbund — avstand, størrelsesforhold, når TNG står alene.
4. Minste størrelse i trykk og digital, inkludert caps/bag (NGF krever merket der).
5. Be om vektor: ett kort merket **MANGLER ORIGINAL** — AI/EPS/SVG. PNG skal ikke printes over A4.

### B. Lås type og grid

6. Ordmerke vs Jost — overlay/sammenligning. Behold Jost som substitusjon til originalen er navngitt.
7. Typografisk plakat: display 1–3, H1–H3, body lg/sm, caption, eyebrow, mono-tall med **komma-desimal 70,8** og dato **dd.mm.åååå**.
8. A4/A3/16:9/9:16/1:1-grid med `--gutter-page` og venstremargin. Én sterk venstrekant.
9. FlagRule i tre lengder: 24 / 64 / full høyde. Aldri som dekor i midten av et avsnitt.

### C. Lås farge og kontrast

10. Navy-skala og rød-skala som allerede finnes, pluss **kontrasttabell** (hvit på navy, navy på hvit, rød på hvit — rød på navy kun i strek, ikke i brød).
11. Semantic: fairway = kvalifisert/ok. Rød-700 = fare. Ikke bruk merkevarerød som error-fill på store flater.
12. Foto-scrim: tre styrker. Tekst alltid over scrim.

### D. Lås foto og bevegelse

13. Bilde do/don’t: vidt vs tight, farge vs s/h, scrim vs bar himmel, ingen duotone, ingen varmt filter, ingen stock-smil.
14. Motion-kort: 120/200/340 ms, fade og 8–16 px. Ingen bounce. `prefers-reduced-motion`.
15. Video: stills-board, 16:9 outro med knockout-logo, 9:16 safe zone (allerede i story-malen — gjør den til regelkort).

### E. Lås stemme

16. Stemmekort: tre gode / tre dårlige setninger.
17. Ordbok: spiller · økt · nærspill · innspill · samling · foresatt · TNG · IUP · RR · OWGR · WAGR.
18. CTA-kort: *Meld på* / *Les programmet* — to ord, ingen «her», ingen «klikk».

### F. Fullfør malene som system, ikke som kampanjer

Utvid **eksisterende** maler til å ha identisk anatomi:

| Mal | Må ha i v2 |
|---|---|
| Presentasjon | Åpner, seksjon, innhold, tall, sitat, foto, avslutning — 1920×1080 **og** 1280×720 |
| Brev | A4 med FlagRule, logo 46 px i topp, signatur, footer |
| Rapport | Forside, innhold + tabell, nøkkeltall i mono, signatur |
| Program | Uketabell, økt per dag |
| Tilbud / referat | Prislinjer, beslutninger |
| E-post | 600 px tabell, navy header, én CTA, footer uten «unsubscribe-teater» |
| Instagram | 1:1, 4:5, 9:16, karusell 3 — faktiske piksler |
| Facebook/LinkedIn | 1200×630, cover, event, banner |
| Story/Reels/YT | Safe zone + YT 1280×720 |
| Plakat / diplom / rollup | A3 navy, A3 hvit, A4 liggende, 850×2000 |

Hver mal: **lys variant + navy variant** der det gir mening. Dummy-copy på norsk, konkrete tall, ingen lorem. Én rød aksent.

### G. Det du ikke skal bygge

- Ingen app-UI-kit utover det som allerede ligger (Button, forms, Navbar, Tabs er nok til dokumentflater).
- Ingen CoverageCard, ingen DataTable for sportssjef, ingen 252 px rail.
- Ingen nye farger «for å spisse».
- Ingen rekonstruksjon av løven i vektor. Vent på original.

## Kvalitet

Tenk nasjonalt idrettsforbund, ikke startup. Hvitt, stillhet, to streker, ett merke. Hvis et kort kan fjernes uten at merkevaren faller, fjern det. Hvis du er i tvil: **logoen, navy, én rød, Jost caps, FlagRule, scrim.**

Når du er ferdig: oppdater `readme.md` med hva som er låst vs. venter på vektor/font fra oppdragsgiver. Ikke nevn noe annet merkenavn enn Team Norway Golf og Norges Golfforbund.
