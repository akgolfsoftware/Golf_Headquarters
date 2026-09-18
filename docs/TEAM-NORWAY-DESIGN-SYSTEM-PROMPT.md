# Prompt — rent designsystem for Team Norway Golf

Lim inn i Open Design / Claude Design som **nytt designsystem** (ikke et app-prosjekt, ikke AgencyOS, ikke AK Golf). Last opp `team-norway-golf.png` som eneste merkevarefil.

---

Du lager et **rent designsystem for Team Norway Golf (TNG)**.

Dette er **ikke** et produkt for et akademi, en klubb eller en programvareleverandør. Det er den offisielle visuelle og språklige profilen til **Team Norway Golf** — Norges Golfforbunds toppidrettssatsing for utøvere 13 år og eldre. Målet er verdenstoppen: topp 125 Rolex Ranking (damer), topp 250 OWGR (menn).

**Forbudt i hele systemet:** AK Golf, AgencyOS, PlayerHQ, Paper, krem, gull, «sporty-elegant akademi», Inter som display, shadcn-default, lilla, neon, glassmorphism, emoji-ikoner. Ingen annen organisasjon skal synes. Ingen «powered by». Ingen dual-brand. Team Norway eier 100 % av profilen.

## 1. Logoen er loven

Bruk den opplastede filen `team-norway-golf.png` som **eneste** merkevarekilde.

- Rendres **alltid fra fil**. Aldri tegnes på nytt, aldri spor, aldri «rekonstruksjon i Figma».
- Merket **deles aldri opp**. Løven, typen og flagget er én enhet.
- **Ingen negativ versjon finnes.** På mørk flate ligger logoen på en **hvit plate** (padding 26–32 px, radius 14 px). Aldri inverter, aldri gjør den hvit, aldri drop-shadow i merkevarerød.
- Målt fra logoens piksler, ikke fra en palett du husker:
  - Navy 900 `#012B5D` — identitet, skinne, primær handling
  - Merkevarerød `#D70232` — kun identitet: logo, aktiv skinne i navigasjon, «denne utøveren» i data. **Aldri status.**
- Minste høyde i UI: 40 px (mobil meny), 46 px (rail), 76–96 px (retningslinje-kort).

## 2. Farge — tre lag, aldri bland

**Merkevare (fra logoen)**

| Token | Hex | Bruk |
|---|---|---|
| `--navy-900` | `#012B5D` | Identitet, knapper, aktiv tekst |
| `--navy-800` | `#01234C` | Hover på navy |
| `--navy-700` | `#033C7A` | Mellomtone |
| `--navy-600` | `#0A5199` | Lenke, info |
| `--navy-400` | `#4A85C0` | Data 2 |
| `--navy-100` | `#E3ECF6` | Aktiv rad, chip |
| `--navy-50` | `#F2F7FC` | Svak navy-flate |
| `--red-600` | `#D70232` | Merkevarerød |
| `--red-700` | `#A80126` | Press på rød |
| `--red-100` | `#FCE3E8` | Svak rød flate — sjelden |

**Nøytraler (kjølig gråblå — aldri varm krem)**

| Token | Hex |
|---|---|
| `--ink-900` | `#0C1219` tekst |
| `--ink-700` | `#33414F` |
| `--ink-500` | `#5E6E7F` sekundær |
| `--ink-400` | `#647280` tertiær |
| `--ink-300` | `#B9C4CE` kant default |
| `--ink-200` | `#DCE2E8` kant subtil |
| `--ink-100` | `#EDF1F4` sunken |
| `--ink-50` | `#F6F8FA` sideflate |
| `--white` | `#FFFFFF` kort |

**Status (funksjon — aldri merkevarerød)**

| Rolle | Hex | Tekst | Bakgrunn |
|---|---|---|---|
| Grønn | `#0E8A43` | `#076530` | `#E4F4EA` |
| Ravgul | `#B87503` | `#8A5602` | `#FDF1DC` |
| Statusrød | `#C2352B` | `#96241C` | `#FBE8E6` |
| Info | `#0A5199` | `#023B76` | `#E3ECF6` |

Statusrød og merkevarerød er **to ulike verdier**. «Avvik» er statusrød. Aktiv navigasjon er merkevarerød skinne 3×18 px.

**Data:** monokrom blårampe `#012B5D → #0A5199 → #3E8FC4 → #7FBBD9 → #C3DDEC`. Merkevarerød markerer **kun «denne utøveren»**.

**Mørk flate** (`#06111F`) kun til hero, seksjonsskille og presentasjon. Aldri skjema, aldri tabell.

Flater: side `--ink-50`, kort hvit, sunken `--ink-100`, invers `--navy-900`.

## 3. Typografi

- **Display og brød:** Schibsted Grotesk. Norsk, tett, nøytral. Aldri Inter, aldri system-ui som merkevare.
- **Mono:** IBM Plex Mono. Alt som **måles** — tall, dato, kildelinje, eyebrow, roller.
- Skala: micro 11 px / xs 13 / sm 14 / base 16 / lg 18 / h3 21 / h2 28 / h1 36 / display 48.
- Vekter: 400, 500, 600, 700, 900. Overskrifter 700, tall i mono 600.
- Tracking: display −0.035 em, heading −0.02 em, eyebrow 0.16 em uppercase.
- Desimal: **70,8** (komma). Tusen: **1 842**. Dato: **dd.mm.åååå**. Klokke 24h.

## 4. Rom, form, bevegelse

- 4 px-base. Kort-gutter 28 px. Seksjon 64 px. Innhold 28×32. Rail **252 px**. Toppbar **64 px**. Mobil bunnbar **76 px**.
- Radius: xs 6 / sm 10 / md 14 / lg 20 / xl 28 / full pille.
- Skygge er **lag**, ikke glød: sm, md, lg. Ingen colored shadow.
- **Diagonalen** er systemets ene bevegelse: store flater kuttet på skrå (~4°, 56 px kutt). Brukes på hero og seksjonsskille, aldri på knapper eller tabell.
- Motion: press 120 ms, fast 160, base 200, sheet 420. Ease out cubic. Press-scale 0.97. Ingen bounce på data.

## 5. Interaksjon og tilstander

Hver komponent har: hvile · hover · trykk · fokus · deaktivert.

- Primærknapp: pille, navy-900, hvit tekst, høyde 44 desktop / 52 mobil.
- Sekundær: pille, 1 px `--ink-300`, navy tekst.
- Fokus: `0 0 0 3px rgba(10,81,153,.28)`.
- Ikoner: Lucide, 20 px, strek 1,75. Aldri emoji. Aldri tegn som ikon.
- **Hver skjerm skylder fire tilstander:** suksess · tom · laster · feil. Tom er ærlig («ingen har samtykket»), ikke en illustrasjon. Laster er skjelett i `--ink-100`, ikke spinner-karneval. Feil viser sist kjente tall med tidsstempel når det finnes, pluss «Prøv å hente på nytt».

**Kildelinje — ett format, ingen unntak:**  
`Målt dd.mm.åååå · protokoll vN · initialer`  
Mangler tall: skriv **ukjent** eller **—**. Aldri 0 som erstatning.

## 6. Språk (Norsk, NGF)

Ordbok — bruk denne, ikke synonymer:

- **spiller** (aldri elev, aldri atlet)
- **økt** (aldri session)
- **nærspill** (aldri kortspill)
- **innspill** med to n
- **utøver** kun når NGF-setningen krever det; ellers spiller
- Forkortelser: **TNG** Team Norway Golf · **IUP** individuell utviklingsplan · **RR** Rolex Ranking · **OWGR** · **WAGR**

Utviklingsprosessen (alltid denne rekkefølgen):  
1 Målbilde · 2 Planer · 3 Gjennomføring · 4 Evaluering

Oppfølgingsområder: Strategisk · Teknisk · Fysisk · Mentalt · Sosialt

Uketype: **Utviklingsuke · Vedlikeholdsuke · Turneringsuke**. Aldri bygg/topp/deload.

Roller i UI: sportssjef · trener · hjelpetrener · spiller · foresatt. Aldri coach som merkevareord på TNG-flaten.

## 7. Komponentsett å tegne i systemet

Tegn **systemkort**, ikke appruter:

1. **Logo** — lys flate / mørk flate med hvit plate / forbud (oppdelt, invertert, drop shadow)
2. **Farge** — merkevare, nøytral, status, data, mørk
3. **Type** — skala + to familier
4. **Rom & radius**
5. **Diagonal + motion**
6. **Button, Badge, Input, Select, Card** — alle fem tilstander
7. **Rail 252** — logo på hvit plate, 3 px rød skinne på aktiv, navy-100 bak aktiv rad, seks grupper: Daglig · Uttak · Skoler · Kommunikasjon · Data · Administrasjon
8. **CoverageCard** — dekningsgrad øverst, brutt ned i fire trinn
9. **MetricTile, StatBar, ScaleRating, DataTable** — mono-tall, rød kun «denne»
10. **TruthLayer** — kildelinje-eksempler
11. **Tom / laster / feil** — tre plakater
12. **Terminologi-plakat** — ordbok + prosess + områder

Ikke design hele appen i denne oppgaven. Dette *er* designsystemet. Skjermer kommer i et eget prosjekt som **binder** dette systemet.

## 8. Tone

Kjølig, nøytral, norsk, toppidrett. Lite teater. Høy tetthet uten støy. Tall skal tåle å bli lest av en sportssjef på 6 sekunder. Ingen motivasjonsplakater. Ingen «journey». Ingen lilla AI-glow.

Når du er i tvil: **logoen, navy, rød skinne, Schibsted, kildelinje.**
