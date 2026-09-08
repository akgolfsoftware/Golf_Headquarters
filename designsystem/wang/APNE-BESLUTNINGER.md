# ÅPNE BESLUTNINGER — venter på Anders

Samlet, med hvilke skjermer hver enkelt blokkerer. Ingen av skjermene i pakken forutsetter et
svar — de tegner alternativene. Men flere av dem kan ikke **ferdigstilles** før svaret finnes.

Sortert etter hvor mye som står stille.

---

## 1 · Vurderingspunktene i rekrutteringen

**Blokkerer:** D1 (kan bygges som editor, ikke ferdigstilles), D2 og D3 (arver punktsettet).

Fire spørsmål, alle ubesvarte:

| Spørsmål | Hvorfor det ikke kan gjettes |
|---|---|
| **Hvor mange punkter?** | D1 tegner åtte plassholdere merket «ikke bestemt». Å finne på åtte navngitte punkter ville gjort et åpent spørsmål til fasit i koden. |
| **Hva heter de?** | Navnet på et vurderingspunkt om en mindreårig er en sportslig og juridisk beslutning, ikke en designbeslutning. |
| **Er vekten lik?** | D1 viser «Vekt 1,0» på alle. Ulik vekt endrer hva totalsummen betyr. |
| **Inngår skolekarakterer i summen, eller vises de separat?** | Dette er det eneste stedet i flaten der ordet «karakterer» er riktig. Om et vitnemålssnitt skal veies mot en trenervurdering er en policy, ikke en formel. |

**Tegnet som:** en konfigurasjonseditor. Punktene er «Punkt 1…8» med plassholder-merking, og
skjermen viser hva som må bestemmes. `Vurderingspunkt` og `Vurdering` er foreslått som separate
tabeller slik at punktsettet kan endres uten å ødelegge gamle tall.

**Konsekvens av å utsette:** D1 kan bygges og brukes som editor, men ingen skole kan begynne å
vurdere kandidater før settet finnes. Tall satt under et midlertidig sett må bære konfigurasjonen
de ble satt under.

---

## 2 · Kan en skole ha egne punkter i tillegg til det felles settet?

**Blokkerer:** D1 (punktsett-editoren), og delvis D3 (om skolene i det hele tatt kan sammenlignes).

To alternativer, begge støttet av tegningen:

- **Rent felles sett.** Alle WANG-skoler bruker samme punkter. Sammenlignbart på tvers, men gir
  ingen plass til det en enkelt skole faktisk vektlegger.
- **Felles grunnsett + skolens tillegg.** Skolen kan legge til egne punkter oppå. Mer riktig for
  skolen, men da er totalsummen ikke sammenlignbar mellom skoler — og D3 må slutte å antyde at
  den er det.

**Tegnet som:** `Vurderingspunkt.eier` (felles eller skole), og D1 sier rett ut at beslutningen
ligger hos Anders.

**Merk:** velges «felles + tillegg», bør totalsummen i D1 vises som to tall (felles og totalt),
ikke ett. Det er en designendring, ikke bare en modellendring.

---

## 3 · B4 — består `/team-wang/coach` som egen flate, eller blir den ren lesevisning?

**Blokkerer:** C6 (tegnet i to varianter), B4 ukessammendrag (hvor den bor), og hele
porteringsrekkefølgen for trenerflaten.

| Alternativ | Hva det betyr |
|---|---|
| **A · Lesevisning (anbefalt i C6)** | Treneren ser dagens økter, det som krever handling, og egne elever. Planlegging skjer i Workbench. WANG-flaten beholder fellessiden, elevens visning og foreldrevisningen. |
| **B · Redirect til Workbench** | `/team-wang/coach` sender treneren videre. WANG-flaten beholder ingenting av trenerarbeidet. Enklere å vedlikeholde, men treneren mister det skolespesifikke bildet — timeplan, prøveperioder, foreldremøter. |

**Tegnet som:** C6 viser begge, side om side, pluss «uten trenerrolle»-tilstanden som gjelder
uansett valg.

**Konsekvens av å utsette:** B4 (ukessammendrag), D9 og D10 (plan) vet ikke hvilken flate de bor
i. De kan tegnes ferdig — de er det — men ikke rutes.

---

## 4 · Timeplanen — føres den i D4, eller importeres den?

**Blokkerer:** D4 (editor eller visning), C9 (elevens visning arver formen), D5 (prøveplanen leser
samme kilde).

Om timeplanen skal importeres fra skolens eget administrative system, er D4 en **visning** med
lesetilgang og ingen «Legg til time»-knapp. Føres den i WANG, er D4 en **editor** — og noen må
eie fagkatalogen, lærerregisteret og romregisteret.

**Tegnet som:** editor, med ukemal + unntak. Blir svaret «import», er redigeringskolonnen i D4
det eneste som må vekk — resten står.

---

## 5 · Volumkategoriene teknikk / spill / fysisk

**Blokkerer:** D9 (periodeplan), D10 (månedsplan og avviksberegningen).

Kategorisettet er **ikke definert noe sted**. Det er antatt i D9 og D10 fordi planlegging uten
kategorier ikke kan vises som annet enn ett tall. Årshjulets egne akser er fem
(`TEK`, `SLAG`, `SPILL`, `TURN`, `FYS`) — tre og fem er ikke samme sett, og avviksberegningen kan
ikke summere på tvers av to definisjoner.

**Må bestemmes:** hvilket sett som gjelder for planlegging. Alternativt at D9/D10 bruker
årshjulets fem akser og de tre kategoriene forsvinner.

---

## 6 · Personvern i koordineringen mellom skoler

**Blokkerer:** D3 (kan ikke bygges), og delvis D2.

Hvor mye får én WANG-skole se om en annen skoles kontakt med en **mindreårig kandidat**?

Tegningen viser status, tidsstempel og ansvarlig — og skjuler vurderingstall og notater. Det er et
designforslag, ikke en juridisk vurdering. Om selve det å vite at «Oslo sendte tilbud 01.09 16.40»
er greit å dele mellom skoler, er ikke et spørsmål design kan svare på.

**Relatert:** hvem får varsel når en annen skole flagger en kandidat du selv har flagget —
sportssjef alene, eller også ansvarlig trener? D3 er tegnet for sportssjef.

---

## 7 · Grensen mot PlayerHQ

**Blokkerer:** D12 (inviter elev).

Tre spørsmål:

- Hvem eier kontoen — PlayerHQ eller WANG?
- Hva får WANG tilbake ved fullført registrering?
- Hva skjer om eleven avbryter halvveis? (D12 tegner «åpnet, ikke fullført» som en egen status.)

---

## 8 · Sletteregler og lagringstid for filer

**Blokkerer:** B5 (dokumenter), D7 (video, 18 MB-vedlegg).

Ikke avklart hvor lenge en video skal ligge, hvem som kan slette, eller om et dokument delt med
foresatte blir borte når eleven slutter. Tegningene viser opplaster og dato, men ingen levetid.

---

## 9 · Foreldremøte-referatet

**Blokkerer:** ingenting — men verdt å bekrefte.

D6 er tegnet slik at **referatet publiseres manuelt** av kontaktlærer. Det oppstår ikke av seg
selv når møtet er over. Er intensjonen at det skal være obligatorisk, må det stå som et krav i
modellen, ikke som en vane.

---

## Fem spørsmål fra vurderingen 02.09 — status

| Spørsmål | Status |
|---|---|
| B4 · trenerflatens skjebne | **Fortsatt åpent** — se §3 |
| B5 · skole- og foreldredata | Delvis besvart av D4/D6/D8, men eierskapet er åpent — se §4 |
| VG-filterets beregning | Fortsatt åpent, ikke tegnet i denne pakken |
| Periodegrenser | Tegnet i D9: **overlapp er tillatt, ingen validering**. Bekreft. |
| Kildelinje før eller etter testdag-føring | **Besvart av porteringspakken:** kildelinjen først. Den blokkerer fem skjermer (B1, B3, B8, C5, D1), testdag-føringen blokkerer én. Se `PORTING.md` §3. |
