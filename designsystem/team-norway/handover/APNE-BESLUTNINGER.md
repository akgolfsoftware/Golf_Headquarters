# ÅPNE BESLUTNINGER

Alt som venter på Anders, samlet. Hver rad sier hvilke skjermer den blokkerer, og hva som
skjer hvis svaret går den ene eller den andre veien.

Designet har i alle tilfeller tegnet **ett** av alternativene, ikke begge. Der det er gjort,
står valget og begrunnelsen — det er ikke en gjetning som skal skjules, men en antakelse som
skal bekreftes eller korrigeres.

---

## B1 · Får spilleren legge inn turneringer selv?

**Blokkerer:** TN-17 (delvis — skjermen kan bygges, men rollelisten avhenger av svaret)

**Tegnet:** ja. Spilleren kan legge inn egne rader.

**Begrunnelsen:** college-turneringer er spillerens eget felt, og treneren ser dem ikke.
Alternativet er at spilleren sender en melding og treneren skriver tallet inn et sted uten
spor — og da er hele kildeprinsippet i TN-13 verdiløst.

**Motvekten som er tegnet inn:** belegg-kravet. Uten lenke eller filnavn på resultatlisten
blir raden **utkast** og teller ikke i rangliste eller uttak. Det gjør det uinteressant å
pynte på tallene.

**Underspørsmål:** skal utkast-rader være synlige for treneren umiddelbart, eller først når
belegget er lagt inn? Tegnet: umiddelbart, merket som utkast.

**Går svaret nei:** SP fjernes fra TN-17s rollelinje i `TILGANGSMATRISE.md`, og
`TnResultatKilde.registrertAvUserId` begrenses til gruppens trenere. Skjermen endres ikke.

---

## B2 · Kan bare sportssjef gi tilgang?

**Blokkerer:** TN-18 (delvis — skjermen kan bygges, men målgruppen avhenger av svaret)

**Tegnet:** ja, strengt. Sportssjef er eneste rolle som kan gi tilgang. En trener kan **ikke**
legge til en hjelpetrener i sin egen gruppe.

**Begrunnelsen:** tilgang til mindreåriges måledata bør ikke kunne delegeres nedover uten
spor. Kan trener A gi trener B tilgang, kan B gi C, og etter tre ledd vet ingen hvem som
åpnet døren.

**Går svaret ja til delegering:** TR legges til på TN-18 med et filtrert utsnitt — kun egne
grupper, kun `ASSISTANT`-rollen, aldri `COACH`. Skjermen har allerede kolonnen «grupper
personen når», som gjør det utsnittet lesbart. `tn_tilgangslogg` (finnes ikke ennå, se
kildelinjen i skjermens tabellfot) må da kunne skille «gitt av sportssjef» fra «gitt av
trener».

**Relatert, ikke tegnet:** en tredje rolle — «lesetilgang for skolekontakt» — finnes i TN-08
som `EksternLeserGruppe`. Den er ikke tegnet inn i TN-18 fordi det er uklart om den er en
**tilgang** (settes av sportssjef) eller et **samtykke** (settes av spilleren/foresatt).
Svaret avgjør hvilken skjerm den hører til.

---

## B3 · Kan «åpnet» måles, og hvem går invitasjonen til?

**Blokkerer:** TN-19 (statuslisten), `DATAMODELL.md` §2 (feltet `openedAt`)

**To spørsmål i ett.**

**Måling.** Tegnet: «åpnet» settes ved **lenkeklikk**, ikke ved sporingspiksel.
Sporingspiksel i e-post til mindreårige og deres foresatte er tvilsomt, og på SMS finnes
det ikke i det hele tatt. Alternativet er tre statuser i stedet for fem — sendt, fullført,
utløpt — og da mister treneren skillet mellom «har ikke sett den» og «har sett den, ikke
fullført», som er to helt ulike oppfølginger.

**Mottaker.** Uavklart: går invitasjonen til spilleren, foresatt, eller begge når spilleren
er under 15? Tegnet: e-post til spilleren med foresatt i kopi når spilleren er under 18;
SMS har ingen kopimottaker, så der må nummeret være foresattes. Det er en asymmetri som bør
bekreftes.

**Går svaret at sporing ikke er ønsket:** `openedAt` fjernes fra
`TnSpillerInvitasjon`, og statusutledningen faller til tre trinn. Skjermens trakt går fra
fire kort til tre. Statusen `IKKE LEVERT` beholdes uansett — den kommer fra serverens
avvisning, ikke fra sporing.

---

## B4 · Er studieår og NCAA-kollisjon egen modell?

**Blokkerer:** TN-15 Collegegruppen

**Uavklart.** Skjermen viser seks spillere over fire studieår, med NCAA-sesongen holdt mot
den norske. Spørsmålet er om det er:

- **felt på gruppemedlemskapet** (studieår som kolonne, kollisjonen beregnet), eller
- **egen modell** for collegetilhørighet med universitet, divisjon, sesongvindu og
  stipendstatus.

**Tegnet:** som om det er felt — skjermen viser studieår og universitet som tekst.
Kollisjonen er dokumentert i skjermen, ikke beregnet.

**Konsekvensen av svaret:** blir det egen modell, får TN-15 en `DATAMODELL.md`-seksjon og
flytter fra «venter på beslutning» til «venter på datamodell». Blir det felt, kan skjermen
bygges rett etter §6 (normalisert skole), fordi universitetsnavn har samme fritekstproblem
som skolenavn.

---

## B5 · Bor TN-13 Turneringsoversikt i Claw?

**Blokkerer:** TN-13, og indirekte TN-17 (som er dens underskjerm)

**Antatt:** ja. TN-13 bor i Claw under **Data**, som `/team-norway/turneringer` — ikke som
en delt rute `/admin/turneringer` i Train-lock.

**Hvorfor det er et reelt spørsmål:** turneringsdata er plattformdata. `Tournament`,
`TournamentEntry` og `TournamentResult` brukes av PlayerHQ, og GolfBox-synken er felles.
Er skjermen Train-locks, bidrar dette systemet kun med logo og skinnefarge — og TN-13
slettes fra Claw-speilet.

**Går svaret Train-lock:** TN-13 og TN-17 tegnes om i Train-lock-stil, og de to
malfilene arkiveres. Datamodell-forslagene i `DATAMODELL.md` §1 gjelder like fullt — de er
uavhengige av hvilket designsystem som eier flaten.

---

## B6 · Periodegrensene

**Blokkerer:** Årsplan-malen, Periodeplan-malen, TN-16 Månedsplan (fokuskolonnen)

**Uavklart i kildene, ikke i designet.** GRUNN slutter uke 10 eller 11; SPES starter uke 11,
12 eller 14. Kildene er uenige med seg selv.

Årsplanen bruker **uke 11 / uke 12** i påvente av avklaring. Fem punkter venter på svar i
`grunnlag-funn.md` §5.

Kanonisk per i dag, slik terminologikortet fører den:
**GRUNN** uke 44–11 · **SPES** uke 12–16 · **TURN** uke 17–42 · test/eval uke 43.

**Konsekvensen:** en portert årsplan med feil periodegrense flytter hver eneste økt i
visningen. Dette er den eneste åpne beslutningen som gir **synlig feil data** i en portert
skjerm, ikke bare et manglende felt.

---

## B7 · Adherence-regelen for rå px — verktøybegrensning, ikke designbeslutning

**Blokkerer ingen skjerm.** Tas med fordi den ellers gjenoppstår som «uryddet gjeld».

`_adherence.oxlintrc.json` **genereres av kompilatoren** i designprosjektet, fra `tokens/`
og `components/`, på hver tur. Regelen `Literal[value=/\b\d+px\b/]` er ikke utledet fra
noen kilde i prosjektet, og en håndredigering blir overskrevet ved neste kjøring.

Avgrensningen må derfor gjøres **i kompilatoren**, ikke i prosjektet og ikke i repoet.

Beslutningen er likevel tatt, og gjelder for mennesker som leser advarslene:

> Regelen gjelder **typografi og rom** — `font-size`, `padding`, `margin`, `gap`,
> `border-radius`. **Rammemål er unntatt**: `width`, `height`, `min-height`, `top`,
> `right`, `bottom`, `left`, `flex-basis`. En DC-mal kan bare stiles inline, og
> `390px` / `1440px` er selve formatet — ikke et avvik fra skalaen.

Til regelen er avgrenset i kompilatoren, er «null advarsler i `templates/`» ikke et
oppnåelig suksesskriterium. Det er en verktøybegrensning, ikke en designfeil, og det er
ført i `docs/ferdigstilling-2026-09-08.md` under «Kunne ikke rettes her».

**For porteringen betyr det ingenting:** repoet har sin egen regel
(ESLint `no-restricted-syntax` mot hex-litteraler i `.tsx`), og den gjelder uavhengig.

---

## B8 · Ekte vektorlogo

**Blokkerer ingen skjerm, men gjelder alle.**

Dagens `assets/logo/team-norway-golf.png` er beskåret fra en JPEG med
kompresjonsartefakter. Det finnes ingen ekte vektorversjon fra NGF.

De to SVG-ene i `talenthq` skal **ikke** brukes: de er håndtegnede tilnærminger med feil
strekproporsjoner, og fargene er flaggpaletter — `#BA0C2F`/`#00205B` er det norske flaggets
Pantone-par, `#EF2B2D`/`#002868` er det amerikanske. Ingen av dem er logoen.

Handling som venter: be NGF om ekte vektor, og rette `N-D2` i `beslutninger.md` samt begge
SVG-ene i talenthq til `#012B5D` / `#D70232`.

Til da er PNG-en fasit, og `Logo`-komponenten rendrer **alltid fra fil** — aldri gjenskapt
i markup.

---

## Sammendrag

| # | Beslutning | Blokkerer | Alvor |
|---|---|---|---|
| B6 | Periodegrensene | Årsplan, Periodeplan, TN-16 | **Gir synlig feil data.** Høyest |
| B5 | Bor TN-13 i Claw? | TN-13, TN-17 | Kan føre til at to skjermer slettes herfra |
| B4 | Studieår som modell eller felt? | TN-15 | Avgjør om skjermen venter på schema |
| B3 | Kan «åpnet» måles? Hvem inviteres? | TN-19 | To av fem statuser |
| B2 | Kan trener delegere tilgang? | TN-18 | Utvider målgruppen, endrer ikke skjermen |
| B1 | Får spilleren legge inn selv? | TN-17 | Utvider målgruppen, endrer ikke skjermen |
| B8 | Ekte vektorlogo | alle, kosmetisk | Venter på NGF |
| B7 | Adherence-regelen | ingen | Verktøybegrensning. Må løses i kompilatoren |
