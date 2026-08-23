# Kroppsøving VG1–VG3 — kompetansemål (Udir, offisiell læreplan)

Kilde: [udir.no/lk20/kro01-05](https://www.udir.no/lk20/kro01-05) · Fagkode **KRO01-05** (LK20, gjeldende).
Kroppsøving er fellesfag for alle utdanningsprogram — WANG-elevene har både dette OG Toppidrett
(se `kompetansemaal-toppidrett-vg.md`). Bokmål, hentet 2026-08-23 fra kv186/kv187/kv188.

## Kompetansemål etter vg1 — kv186

Eleven skal kunne:
1. trene på og skape nye varianter av lek, bevegelsesaktivitet og dans sammen med andre
2. planlegge og gjennomføre metoder for øvelse og trening for å oppnå individuelle mål, også når
   man ikke fullt ut kan delta i aktiviteten
3. bruke egne ferdigheter og kunnskaper til å samarbeide og bidra til å gjøre andre gode i
   aktivitet og samspill
4. forebygge skader ved bevegelsesaktiviteter og utføre grunnleggende førstehjelp
5. bruke kart og digitale verktøy på en måte som sikrer trygg ferdsel for seg selv og for andre
6. bruke lokale tradisjoner for ferdsel i naturen under vekslende årstider

## Kompetansemål etter vg2 — kv187

Eleven skal kunne:
1. gjennomføre leker, idrettsaktiviteter og andre bevegelsesaktiviteter og forstå hvordan ulike
   aktiviteter påvirker og utvikler koordinasjon, styrke, utholdenhet og bevegelighet
2. utføre trening på egen hånd og reflektere over hvordan fysisk aktivitet kan fremme god psykisk
   og fysisk helse og bidra til en helsefremmende livsstil etter avsluttet skolegang og i
   framtidig arbeidsliv
3. praktisere regler for å delta i ulike bevegelsesaktiviteter og medvirke til læring for andre
4. planlegge og gjennomføre uteaktiviteter til ulike årstider, der formålet er å ha gode
   naturopplevelser
5. praktisere bærekraftig ferdsel i naturen og gjennomføre friluftslivsaktiviteter i nærområdet

## Kompetansemål etter vg3 — kv188

Eleven skal kunne:
1. øve på og utvikle kunnskaper og ferdigheter i ulike bevegelsesaktiviteter ut fra egne
   forutsetninger
2. planlegge, gjennomføre og vurdere egentrening og forklare hvordan dette kan medvirke til en
   fysisk aktiv og helsefremmende livsstil etter avsluttet skolegang
3. beskrive og drøfte sammenhenger mellom bevegelse, kropp, trening og helse i samfunnet
4. samarbeide om å løse praktiske oppgaver i et læringsfellesskap og ut fra øvelse og aktivitet
   reflektere over hvordan egen medvirkning kan påvirke andre
5. planlegge og gjennomføre uteaktiviteter og friluftslivsaktiviteter i nærområdet

## Golf-/toppidrett-relevante mål (kan lenkes til en treningsøkt)

De fleste Kroppsøving-målene er generelle (dans, friluftsliv, orientering) og passer bedre på
skolens ordinære kroppsøvingstimer enn på en golføkt på GFGK. Direkte relevante for en
golf-/basistreningsøkt:
- **Vg1 KM2:** egne mål for øvelse/trening, også ved redusert deltakelse (skade/sykdom).
- **Vg1 KM3:** bruke ferdigheter til å gjøre andre gode — relevant for gruppeøkter.
- **Vg2 KM1:** koordinasjon, styrke, utholdenhet, bevegelighet — FYS-økter.
- **Vg2 KM2:** egentrening + fysisk/psykisk helse — relevant for periodeplanlegging.
- **Vg3 KM1:** bevegelsesaktiviteter ut fra egne forutsetninger — differensiering.
- **Vg3 KM2:** planlegge/gjennomføre/vurdere egentrening — periodeplan/IUP.
- **Vg3 KM3:** sammenheng bevegelse/kropp/trening/helse — teorielement i økt.

Rent skolefaglig (ikke golføkt-relevante, men gjelder skolens egne kroppsøvingstimer):
Vg1 KM1 (dans), KM4 (førstehjelp), KM5 (kart/digitale verktøy), KM6 (friluftsliv/årstider);
Vg2 KM3 (regler/dommerrolle), KM4–5 (uteaktivitet/friluftsliv); Vg3 KM4–5 (samarbeid i
læringsfellesskap, uteaktivitet/friluftsliv).

## Kode-konvensjon i AK Golf HQ

Lagres i `competence_goals`-tabellen med `classYear` (VG1/VG2/VG3), `curriculumCode`
("KRO01-05"), `goalNumber` (1-indeksert som over, egen telling per læreplan — kolliderer ikke
med IDR05-02s goalNumber-serie), `text` (målteksten ordrett). Seedes i `prisma/seed.ts` →
`seedCompetenceGoals()` sammen med Toppidrett-målene.
