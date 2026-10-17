# Hjelpeartikler for PlayerHQ

Skrevet av Claude etter Anders' bestilling 16.10.2026 («Hjelpeartiklene skal du lage»). Erstatter de 18 titlene i
`src/app/portal/meg/help/data.ts`, der bare én artikkel hadde innhold. Teksten følger vedtakene i
`.claude/rules/beslutninger.md` og ordene i `docs/treningsplanlegging.md`.

**Status:** utkast, venter på Anders (port 7). Legges inn i `data.ts` når pakke 15 (`hjelp.html`) bygges.

**Kontrolleres når sidene bygges:** artiklene beskriver appen slik den blir etter porteringen (fanene I dag · Plan · Stats · Meg).
Der en knapp ennå ikke finnes i appen, står det i lista under. En artikkel publiseres ikke før det den beskriver, virker.

| Artikkel | Må finnes før publisering |
|---|---|
| Koble til TrackMan | Importknappen for TrackMan-filer i Stats › Trening (i dag brukes importen ingen steder i spillerportalen) |
| Sett din første målsetning | «Ny målsetning» i Workbench › Målsetninger (i dag går knappen til `/portal/ai/mal-bygger`) |
| Last ned dataene dine | Skjermen «Dataene dine» fra pakke 14 (i dag `/portal/meg/innstillinger/eksport`) |

To titler fra dagens liste er tatt ut fordi funksjonen ikke finnes: «Slik bytter du coach» og «Be om videoanalyse».
De er erstattet av «Skriv til coachen» og «Flytt eller avbestill en time».

---

## Komme i gang

### Registrer din første runde
*2 min lesing*

Trykk på hurtigknappen og velg «Registrer runde». Du velger mellom to måter:

- **Slag for slag:** du fører hvert slag med avstand, underlag og kølle, og puttene med lengde i fot. Det gir Strokes Gained og Tiger 5.
- **Bare score:** du fører antall slag per hull. Det gir brutto score, men ikke Strokes Gained.

Når runden er lagret, ser du brutto score, Strokes Gained per område og Tiger 5 med en gang. Runden ligger under Stats › Snittscore.

PlayerHQ bruker alltid brutto score, aldri netto.

### Koble til TrackMan
*2 min lesing*

TrackMan-økter legges inn som fil. Det finnes ingen direkte kobling til TrackMan-kontoen din.

1. Eksporter økta fra TrackMan som CSV eller som rapport.
2. Gå til Stats › Trening › TrackMan og velg «Importer økt».
3. Velg fila. Har du ikke fila, kan du ta bilde av skjermen, så leser appen av tallene. Sjekk tallene før du lagrer.

Coachen din kan også legge inn økta for deg etter en time. Økta vises med alle køller og slag, og tallene brukes i Stats.

### Sett din første målsetning
*3 min lesing*

En målsetning er det du sikter mot. Gå til Plan, trykk «Rediger» og velg Målsetninger.

- **Resultatmål** er et tall du vil nå, for eksempel HCP under 3,0 eller SG Innspill til 0,0.
- **Prosessmål** er noe du vil gjøre jevnlig, for eksempel å registrere alle runder slag for slag.

Gi målsetningen en frist og et nivå: år, periode, måned eller uke. Fremdriften regnes ut fra ekte data, som runder og tester, og vises med en strek for hvor du burde vært nå. Coachen ser målsetningene dine.

---

## Trening

### Pyramiden: FYS, TEK, SLAG, SPILL og TURN
*4 min lesing*

All trening i PlayerHQ tilhører én av fem akser, og fargen på en økt forteller hvilken:

- **FYS · Fysisk:** styrke, kraft, bevegelighet og kondisjon.
- **TEK · Teknisk:** bevegelsen i svingen, ofte uten ball eller på lav hastighet.
- **SLAG · Golfslag:** slag mot et mål: utslag, innspill, nærspill og putting.
- **SPILL · Spill:** på banen, med hull, valg og scoring.
- **TURN · Turnering:** turneringsrunder og det du gjør for å prestere der.

Bunnen bærer toppen. Fordelingen endrer seg gjennom året: mer FYS og TEK i grunnperioden, mer SPILL og TURN i turneringsperioden. Plan viser timene per akse for uka, måneden og året.

Fordelingen er et forslag, ikke en sperre. Workbench sier fra når uka avviker fra det måneden har fordelt, men stopper ingenting.

### Bygg treningsuka i Workbench
*3 min lesing*

Gå til Plan og trykk «Rediger». Workbench har nivåene År, Periode, Måned, Uke og Målsetninger.

- En ny uke starter aldri tom: forrige uke kopieres, og du endrer det som skal være annerledes.
- Legg til en økt, velg øvelser fra Øvelsesbanken, og dra økta til riktig dag.
- «Gjenta» legger samme økt i flere uker.

Planen henger sammen. Endrer du en uke, teller det med en gang i måneden, perioden og året. Uka viser hva som er lagt inn mot det måneden har fordelt. Endrer du en økt coachen la inn, får coachen beskjed.

### Øvelser for området der du taper mest
*3 min lesing*

Stats › Strokes Gained viser hvor du taper slag: utslag, innspill, nærspill eller putting. Det området med mest tapt er stedet å starte.

Åpne Øvelsesbanken og filtrer på området. Hver øvelse viser akse, sted, mengde og hva du måler. «Legg i plan» legger øvelsen i en økt i uka.

Strokes Gained trenger nok runder før det sier noe sikkert: under fire runder vises ingen konklusjon, og fra fire til sju runder er tallene foreløpige.

### Les TrackMan-tallene
*5 min lesing*

TrackMan-tallene står på engelsk, som i TrackMan selv. De viktigste:

- **Club Speed:** køllehodets fart ved treff.
- **Club Path:** retningen køllehodet beveger seg i ved treff, i grader. For en høyrehendt spiller betyr minus ut-til-inn og pluss inn-til-ut.
- **Face Angle:** hvor køllebladet peker ved treff.
- **Attack Angle:** om køllen går ned eller opp gjennom ballen.
- **Smash Factor:** ballfart delt på køllefart. Høyere betyr bedre treff.
- **Carry:** hvor langt ballen flyr før den lander.

Stats › Trening › TrackMan viser én økt med alle køller, og spredningen for hver kølle.

---

## Coaching

### Skriv til coachen
*2 min lesing*

Bjella øverst åpner Innboks. Der skriver du til coachen, og der kommer svar, forslag til nye tider og endringer i planen.

Meldinger kan i dag ikke ha vedlegg. Video fra treningen legger du inn i Live-økta, på øvelsen du gjorde.

### Forbered en coachingtime
*3 min lesing*

- Registrer rundene dine slag for slag, så coachen ser hvor du taper slag.
- Skriv i Innboks hva du vil jobbe med, dagen før.
- Ta med det du har testet siden sist.

Etter timen får du et sammendrag fra coachen i Innboks. Øktene coachen legger i planen, dukker opp i uka. Kvitter med «Forstått» når du har lest det.

### Flytt eller avbestill en time
*2 min lesing*

Gå til Meg › Bookinger og åpne timen.

- **Flytt:** velg en ny ledig tid innenfor coachens tilgjengelighet. Det kan du gjøre selv så lenge det er mer enn 24 timer til timen. Flytting trekker ikke klipp, og coachen får beskjed.
- **Avbestill mer enn 24 timer før:** du får klippet tilbake, eller pengene refundert.
- **Avbestill 24 timer før eller senere:** timen avbestilles, men du får ikke klippet eller pengene tilbake.

Avlyser coachen timen, får du alltid alt tilbake.

---

## Booking og betaling

### Book en time
*2 min lesing*

Gå til Meg › Bookinger og velg «Book time». Velg coach, type økt og en ledig tid. Bare tider innenfor coachens tilgjengelighet vises.

Har du coaching-pakke, betaler du med et klipp. Ellers betaler du med kort eller Apple Pay. Timen er bekreftet med en gang betalingen er gjennomført, og du får bekreftelse på e-post.

### Klipp forklart
*2 min lesing*

Coaching-pakkene gir klipp hver måned: Performance gir 2, Performance Pro gir 4. Én coachet time trekker ett klipp.

- Klippet trekkes når timen bookes.
- Klippene fylles opp når pakken fornyes. Klipp du ikke har brukt, følger ikke med til neste måned.
- Avbestiller du mer enn 24 timer før, får du klippet tilbake.

Meg › Abonnement viser hvor mange klipp du har igjen.

### Gratis og Full
*3 min lesing*

PlayerHQ har to nivåer.

- **Gratis** koster ingenting og utløper aldri. Du kan registrere runder, se Stats med Strokes Gained, ta tester og booke timer.
- **Full** gir hele appen: Plan og Workbench, treningsøkta og Caddie i tillegg. Full koster 299 kr/mnd eller 2 690 kr/år.

**Full er inkludert** hvis du har coaching-pakken Performance eller Performance Pro, eller er med i en gruppe AK Golf driver, som GFGK Junior, WANG Toppidrett eller AK Golf Academy.

**Første gang du velger Full** får du én uke før første trekk. Du legger inn kort, og kan si opp før uka er over. Etter det trekkes beløpet automatisk.

---

## Konto

### Endre passord
*1 min lesing*

Gå til Meg › Innstillinger › Sikkerhet og velg Passord. Skriv nåværende passord først, så det nye. Passordet må ha minst 8 tegn.

Har du glemt passordet, trykker du «Glemt passord» på innloggingssiden og får en lenke på e-post.

Logger du inn med Google, har du ikke eget passord i PlayerHQ. Passordet styres hos Google.

### Slå på tofaktor
*2 min lesing*

Tofaktor betyr at du trenger en kode fra telefonen i tillegg til passordet når du logger inn på en ny enhet.

1. Gå til Meg › Innstillinger › Sikkerhet og velg Tofaktor.
2. Skann koden med en kodeapp, for eksempel Google Authenticator eller 1Password.
3. Skriv de seks sifrene appen viser.

Mister du telefonen, skriver du til oss fra e-posten kontoen er registrert på, så hjelper vi deg inn igjen.

### Last ned dataene dine
*2 min lesing*

Gå til Meg › Innstillinger › Dataene dine og trykk «Last ned dataene mine». Du får én fil (JSON) med alt som er lagret om deg: profil, runder og slag, økter, tester, TrackMan-økter, målsetninger, bookinger, betalinger og meldinger. Du får også en e-post om at dataene er lastet ned.

Vil du slette kontoen, gjør du det under Meg › Innstillinger › Konto. Du skriver SLETT, og forespørselen går til AK Golf.

---

## Stats

### Hva betyr Strokes Gained?
*4 min lesing*

Strokes Gained viser hvor mange slag du vinner eller taper per runde i hvert område: utslag, innspill, nærspill og putting. Tallet regnes ut for hvert slag: hvor langt fra hullet du var før og etter, sammenlignet med hva en referansespiller bruker fra samme sted.

- Pluss betyr at du vant slag. Minus betyr at du tapte.
- Stats sammenligner deg som standard med neste kategori. Det tallet er et estimat og merket slik.
- Du kan også slå på sammenligning med PGA Tour.

Strokes Gained krever runder ført slag for slag. Under fire runder vises ingen konklusjon, fra fire til sju er tallene foreløpige. Utslag og innspill er sikre fra 12 runder, nærspill og putting fra 24.

### Les rundesammendraget
*3 min lesing*

Når du har lagret en runde, ser du sammendraget:

- **Brutto score** og scorekortet hull for hull.
- **Strokes Gained** per område, med det området du tapte mest i markert.
- **Tiger 5:** fem enkle feil som koster slag, som bogey fra innenfor 130 m og bom på enkel up and down. Noen av dem krever at runden er ført slag for slag.

Sammendraget ligger under Stats › Snittscore, og coachen ser det samme.
