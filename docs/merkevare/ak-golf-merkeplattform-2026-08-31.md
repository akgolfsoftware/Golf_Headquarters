# AK Golf — merkeplattform

Utkast 31.08.2026. STEG 18.1 i `docs/MASTERPLAN-GJENSTAAENDE.md`.
Fundamentet både merkevaresystemet (18.3–18.7) og prisingen (18.9) står på.
**Godkjent av Anders 31.08.2026** — se §8.

---

## 1. Hva AK Golf er

> **AK Golf er et utviklingssystem for golfspillere der hver anbefaling er
> forankret i en måling — ikke i en følelse.**

Ikke en golfpro som selger timer. Ikke en app. Et system der coachen tolker
målingene, planen bærer arbeidet mellom øktene, og spilleren til enhver tid vet
hva hen trener på og hvorfor.

Dette er ikke en ny idé påført utenfra. Det er allerede måten alt i huset er
bygget: TruthLayer-prinsippet (alt appen påstår om en spiller skal kunne spores
til en måling med dato og kilde), de tjue standardiserte testprotokollene,
P-posisjonene, Trackman i hver økt. **Merkevaren skal si høyt det systemet
allerede gjør.**

---

## 2. Hvem det er til for

> **LÅST 31.08.2026: junior- og spillerutvikling er det sentrale målet.**
> Merket handler om spilleren under utvikling — og juniorene står i sentrum.

| # | Hvem | Hva de faktisk vil ha | Betaler for i dag |
|---|---|---|---|
| 1 | **Junioren som vil noe — og forelderen som betaler** | Utvikling etter en plan, ikke etter dagsform. Forelderen vil se fremgangen uten å måtte spørre | Junior Academy · gruppeplasser · foreldreportalen |
| 2 | **Den ambisiøse voksne som har stoppet opp** | Å forstå hvorfor det ikke går framover lenger. Vil ha en diagnose, ikke flere råd | 1:1-coaching · PlayerHQ 299 kr/mnd |
| 3 | **Organisasjonen med talenter** (WANG, GFGK, Team Norway) | Felles språk og felles målesystem på tvers av trenere | Kontrakts-coaching · spillerlisenser fra 2027 |
| 4 | **Spilleren som trener alene** | Struktur uten å måtte kjøpe en coach. Inngangen til alt det andre | Gratis PlayerHQ → 299 kr/mnd |
| 5 | **Den lokale som vil slå baller i mørketiden** | Tilgang, pris og åpningstid. Bryr seg ikke om metodikk | Mulligan, timepris |

Det gode med valget: løftet i §3 gjelder ordrett for alle fire første. En forelder
vil ha nøyaktig det samme på vegne av barnet sitt som en voksen vil ha på egne
vegne. Merket trenger derfor ikke to språk.

**Én konsekvens som må håndteres:** med junior som primærpublikum er det
**forelderen som bestemmer og betaler**, ikke spilleren. Det flytter tyngdepunktet
i prisingen fra 299 kr/mnd på egen hånd til gruppeplass, semesterpris og
foreldreportal — og gjør foreldreflaten viktigere enn den er prioritert i dag.
Tas videre i 18.9, ikke her.

---

## 3. Løftet

> **Du skal aldri lure på hva du skal trene på, eller hvorfor.**

Under det, tre ting som gjør løftet konkret:

1. **Vi måler før vi endrer noe.** Ingen svingendring uten et tall som viser hvorfor.
2. **Planen lever mellom øktene.** Arbeidet slutter ikke når timen er over.
3. **Alt vi sier om spillet ditt kan etterprøves.** Dato og kilde på hvert tall.
   Er noe et estimat, står det.

Det tredje punktet er det ingen konkurrent kan kopiere uten å bygge om hele
måten de jobber på.

---

## 4. Hva AK Golf er alternativet til

Merket defineres like mye av hva det ikke er. Tre reelle alternativer spilleren
faktisk velger mellom:

| Alternativet | Hva som er galt med det | Hva AK Golf gjør i stedet |
|---|---|---|
| **Timen hos proffen** | Slutter når timen slutter. Neste gang starter på nytt, ofte med et nytt fokus. Ingen måling mellom gangene | Planen og målingene bærer videre. Neste økt bygger på forrige |
| **Å lære selv fra video og YouTube** | Uendelig med råd, null diagnose. Du vet ikke hvilket av tusen råd som gjelder deg | Kartleggingen sier hvilket problem som faktisk er ditt |
| **En treningsapp uten coach** | Registrerer hva du gjorde. Sier ingenting om hva du burde gjort | Tallene tolkes av en coach, og blir til økter |

Merk at ingen av disse er «dårlige mennesker som gjør en dårlig jobb». Formuleringen
i markedsmateriell skal aldri henge ut navngitte konkurrenter — den skal beskrive
**situasjonen spilleren kjenner seg igjen i**.

---

## 5. De fire bærebjelkene

Det merket kan bevise, ikke det det påstår. Alle fire finnes allerede.

1. **Målingen.** Trackman i hver økt, tjue standardiserte testprotokoller,
   P1–P10 på svingen, spredning og slaglengder som tall.
2. **Systemet.** En metodikk med eget språk — pyramiden, områdene, periodene.
   Ikke løse tips, men en struktur som gjentar seg.
3. **Utviklingsløpet.** AK-stigen tar junioren fra første golfskole til
   turneringsspill i navngitte trinn. Få ting vil foreldre ha sterkere enn å se
   hvilket trinn barnet står på, og hva som skal til for det neste.
4. **Plassen i norsk golf.** Sportssjef i Gamle Fredrikstad GK, coach ved WANG
   Toppidrett, tilknytning til Team Norway Golf. Viser at systemet brukes der det
   stilles krav, ikke bare på privattimer.

> **LÅST 31.08.2026 — MORAD nevnes ikke.** Mac O'Grady og MORAD skal **ikke**
> nevnes i publikumsvendt tekst: ikke på nettsidene, ikke i markedsføring, ikke i
> coach-biografier. Tre steder i produksjon brøt dette og er rettet 31.08:
> `src/app/(marketing)/om-oss/page.tsx`, `src/app/(marketing)/coacher/[slug]/page.tsx`,
> `src/app/auth/onboarding/onboarding-wizard.tsx`. P-posisjoner og MORAD som
> **internt fagspråk** i produktet består — det er metodikk, ikke merkevarebygging.

**Advarsel om bærebjelke 4:** WANG, GFGK og Team Norway er relasjoner, ikke
produkter. De skal aldri framstilles slik at en leser tror hen kjøper tilgang til
dem. Nevnes som troverdighet, med presis ordbruk, og aldri med bilder av
mindreårige uten samtykke.

---

## 6. Tonen

AK Golf høres ut som Anders. Det er ikke tilfeldig — det er den ene tingen som
ikke kan kopieres.

**Slik snakker vi:**

- Direkte. Poenget først, forklaringen etter.
- Presist. «Åtte av ti 7-jern lander høyre for pinnen» slår «du sliter med retningen».
- Faguttrykk beholdes, men oversettes i samme setning.
- Vi sier ifra når noe ikke virker. Nyttig motstand foran høflig enighet.
- Korte setninger. Én tanke om gangen.

**Slik snakker vi aldri:**

| Aldri | Fordi |
|---|---|
| «Ta golfen din til neste nivå» | Sier ingenting. Kunne stått hos hvem som helst |
| «Vi brenner for golf» | Alle sier det. Ingen tror det |
| «Unlock your potential» | Engelsk floskel i norsk tekst |
| «Garantert 5 slag lavere» | Umulig å måle rettferdig, og ulovlig å love |
| Utropstegn og emoji | Skriker. AK Golf trenger ikke skrike |

**Prøven:** les setningen høyt. Ville Anders sagt den til en spiller på rangen?
Nei — skriv den om.

---

## 7. Virksomhetene under paraplyen

| Virksomhet | Rolle i merket | Hvor mye AK Golf skal synes |
|---|---|---|
| **AK Golf Junior Academy** | Bærer det sentrale målet. AK-stigen er dens eget språk | Fullt ut, med egen identitetsfarge |
| **AK Golf Academy** | Definerer løftet og metoden alt annet arver | Fullt ut. Dette *er* AK Golf |
| **AK Golf HQ / PlayerHQ** | Beviset. Systemet gjort til noe du kan holde i hånda | Fullt ut, men produktflatene styres av Train-lock |
| **Mulligan Indoor Golf** | Anlegg som står på egne ben. Selger tilgang, ikke metodikk | **Ikke knyttet direkte til AK Golf-merket.** Promoteres av AK Golf |
| **Skarpnord Golf Products** | Utstyr som følger metoden. Tidlig fase | Lav profil til det har omsetning |

> **LÅST 31.08.2026 — Mulligan står for seg selv.** Ingen «en del av AK Golf»-avsender.
> Anlegget beholder egen identitet og egne kunder. AK Golf **promoterer** Mulligan —
> lenker dit, anbefaler det som treningssted, bruker det i egne økter — men merkene
> blandes ikke. Det holder rigor-merket rent og lar Mulligan snakke til folk som bare
> vil slå baller.

**WANG-coachingen** er ikke en virksomhet, men en leveranse til en kunde. Den
opptrer som en variant under paraplyen, ikke som et eget merke — det er dette som
lukker punkt 22 i beslutningskøen.

---

## 8. Hva som er låst, og hva som står igjen

Merkeplattformen er godkjent 31.08.2026. Fire svar fra Anders lukket den:

1. **Junior- og spillerutvikling er det sentrale målet.** Primærpublikum er
   junioren og forelderen; den voksne spilleren følger etter, med samme løfte.
2. **Løftet er godkjent** — «Du skal aldri lure på hva du skal trene på, eller hvorfor.»
3. **MORAD nevnes ikke offentlig.** Ute av all publikumsvendt tekst, består internt.
4. **Mulligan knyttes ikke direkte, men promoteres.**

**Ett spørsmål junior-valget åpner:** når forelderen er den som bestemmer og
betaler, blir foreldreportalen en salgsflate og ikke bare en innsynsflate. Det er
en prioriteringsendring, ikke en merkevaresak — tas i 18.9.

**Neste steg er 18.3: merkearkitekturen.** Hver virksomhet får sin plass, sin
identitetsfarge og sine logoregler under paraplyen.
