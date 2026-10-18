/**
 * Hjelpeartiklene i PlayerHQ (pakke 15). Tekst: docs/design-system/utkast-playerhq/hjelpeartikler.md,
 * skrevet av Claude etter Anders' bestilling 16.10.2026 (beslutninger.md §PRØVEUKE …).
 *
 * En artikkel publiseres først når det den beskriver, virker i appen (`publisert`). Upubliserte
 * artikler vises ikke i lister, søk eller på egen adresse.
 * Rettet mot appen 17.10: passordbyttet ber ikke om nåværende passord, målsetninger lages fra
 * Plan › Målsetninger («Ny målsetning»), og tofaktor lover ikke kode ved innlogging.
 */

export type HjelpPunkt = { fet?: string; tekst: string };
export type HjelpBlokk =
  | { t: "p"; fet?: string; tekst: string }
  | { t: "liste"; punkter: HjelpPunkt[] }
  | { t: "nr"; punkter: string[] };

export type HjelpKategoriSlug = "komme-i-gang" | "trening" | "coaching" | "booking" | "konto" | "statistikk";

export type HjelpArtikkel = {
  slug: string;
  kategori: HjelpKategoriSlug;
  tittel: string;
  lesetid: number;
  publisert: boolean;
  /** Når artikkelen ikke er publisert: hva som mangler i appen. */
  venterPaa?: string;
  blokker: HjelpBlokk[];
};

export type HjelpKategori = { slug: HjelpKategoriSlug; tittel: string; ingress: string; kort: string };

export const HJELP_KATEGORIER: HjelpKategori[] = [
  { slug: "komme-i-gang", tittel: "Komme i gang", kort: "Første runde, TrackMan, første målsetning", ingress: "Det du trenger for å komme i gang: første runde, TrackMan-øktene og den første målsetningen." },
  { slug: "trening", tittel: "Trening", kort: "Pyramiden, uka, øvelser", ingress: "Hvordan pyramiden, uka og øvelsene henger sammen, og hvordan du bruker Stats til å trene på det som teller mest." },
  { slug: "coaching", tittel: "Coaching", kort: "Meldinger, før timen, flytte timen", ingress: "Hvordan du jobber med coachen i PlayerHQ: meldinger, forberedelse og timene dine." },
  { slug: "booking", tittel: "Booking og betaling", kort: "Klipp, Gratis og Full, booking", ingress: "Booking av timer, klipp i coaching-pakken, og forskjellen på Gratis og Full." },
  { slug: "konto", tittel: "Konto", kort: "Passord, tofaktor, dataene dine", ingress: "Innlogging, tofaktor, og hvordan du laster ned eller sletter dataene dine." },
  { slug: "statistikk", tittel: "Stats", kort: "Strokes Gained, rundene", ingress: "Hva Strokes Gained betyr, og hvordan du leser sammendraget etter en runde." },
];

export const HJELP_ARTIKLER: HjelpArtikkel[] = [
  {
    slug: "registrer-din-forste-runde", kategori: "komme-i-gang", tittel: "Registrer din første runde", lesetid: 2, publisert: true,
    blokker: [
      { t: "p", tekst: "Trykk på hurtigknappen og velg «Registrer runde». Du velger mellom to måter:" },
      { t: "liste", punkter: [
        { fet: "Slag for slag:", tekst: "du fører hvert slag med avstand, underlag og kølle, og puttene med lengde i fot. Det gir Strokes Gained og Tiger 5." },
        { fet: "Bare score:", tekst: "du fører antall slag per hull. Det gir brutto score, men ikke Strokes Gained." },
      ] },
      { t: "p", tekst: "Når runden er lagret, ser du brutto score, Strokes Gained per område og Tiger 5 med en gang. Runden ligger under Stats › Snittscore." },
      { t: "p", tekst: "PlayerHQ bruker alltid brutto score, aldri netto." },
    ],
  },
  {
    slug: "koble-til-trackman", kategori: "komme-i-gang", tittel: "Koble til TrackMan", lesetid: 2, publisert: false,
    venterPaa: "Importknappen for TrackMan-filer i Stats › Trening",
    blokker: [
      { t: "p", tekst: "TrackMan-økter legges inn som fil. Det finnes ingen direkte kobling til TrackMan-kontoen din." },
      { t: "nr", punkter: [
        "Eksporter økta fra TrackMan som CSV eller som rapport.",
        "Gå til Stats › Trening › TrackMan og velg «Importer økt».",
        "Velg fila. Har du ikke fila, kan du ta bilde av skjermen, så leser appen av tallene. Sjekk tallene før du lagrer.",
      ] },
      { t: "p", tekst: "Coachen din kan også legge inn økta for deg etter en time. Økta vises med alle køller og slag, og tallene brukes i Stats." },
    ],
  },
  {
    slug: "sett-din-forste-malsetning", kategori: "komme-i-gang", tittel: "Sett din første målsetning", lesetid: 3, publisert: true,
    blokker: [
      { t: "p", tekst: "En målsetning er det du sikter mot. Gå til Plan › Målsetninger og trykk «Ny målsetning»." },
      { t: "liste", punkter: [
        { fet: "Resultatmål", tekst: "er et tall du vil nå, for eksempel HCP under 3,0 eller SG Innspill til 0,0." },
        { fet: "Prosessmål", tekst: "er noe du vil gjøre jevnlig, for eksempel å registrere alle runder slag for slag." },
      ] },
      { t: "p", tekst: "Gi målsetningen en frist. Fremdriften regnes ut fra ekte data, som runder og tester. Coachen ser målsetningene dine." },
    ],
  },
  {
    slug: "pyramiden", kategori: "trening", tittel: "Pyramiden: FYS, TEK, SLAG, SPILL og TURN", lesetid: 4, publisert: true,
    blokker: [
      { t: "p", tekst: "All trening i PlayerHQ tilhører én av fem akser, og fargen på en økt forteller hvilken:" },
      { t: "liste", punkter: [
        { fet: "FYS · Fysisk:", tekst: "styrke, kraft, bevegelighet og kondisjon." },
        { fet: "TEK · Teknisk:", tekst: "bevegelsen i svingen, ofte uten ball eller på lav hastighet." },
        { fet: "SLAG · Golfslag:", tekst: "slag mot et mål: utslag, innspill, nærspill og putting." },
        { fet: "SPILL · Spill:", tekst: "på banen, med hull, valg og scoring." },
        { fet: "TURN · Turnering:", tekst: "turneringsrunder og det du gjør for å prestere der." },
      ] },
      { t: "p", tekst: "Bunnen bærer toppen. Fordelingen endrer seg gjennom året: mer FYS og TEK i grunnperioden, mer SPILL og TURN i turneringsperioden. Plan viser timene per akse for uka, måneden og året." },
      { t: "p", tekst: "Fordelingen er et forslag, ikke en sperre. Workbench sier fra når uka avviker fra det måneden har fordelt, men stopper ingenting." },
    ],
  },
  {
    slug: "bygg-treningsuka", kategori: "trening", tittel: "Bygg treningsuka i Workbench", lesetid: 3, publisert: true,
    blokker: [
      { t: "p", tekst: "Gå til Plan og trykk «Rediger». Workbench har nivåene År, Periode, Måned, Uke og Målsetninger." },
      { t: "liste", punkter: [
        { tekst: "En ny uke starter aldri tom: forrige uke kopieres, og du endrer det som skal være annerledes." },
        { tekst: "Legg til en økt, velg øvelser fra Øvelsesbanken, og dra økta til riktig dag." },
        { tekst: "«Gjenta» legger samme økt i flere uker." },
      ] },
      { t: "p", tekst: "Planen henger sammen. Endrer du en uke, teller det med en gang i måneden, perioden og året. Uka viser hva som er lagt inn mot det måneden har fordelt. Endrer du en økt coachen la inn, får coachen beskjed." },
    ],
  },
  {
    slug: "ovelser-der-du-taper-mest", kategori: "trening", tittel: "Øvelser for området der du taper mest", lesetid: 3, publisert: true,
    blokker: [
      { t: "p", tekst: "Stats › Strokes Gained viser hvor du taper slag: utslag, innspill, nærspill eller putting. Det området med mest tapt er stedet å starte." },
      { t: "p", tekst: "Åpne Øvelsesbanken og filtrer på området. Hver øvelse viser akse, sted, mengde og hva du måler. «Legg i plan» legger øvelsen i en økt i uka." },
      { t: "p", tekst: "Strokes Gained trenger nok runder før det sier noe sikkert: under fire runder vises ingen konklusjon, og fra fire til sju runder er tallene foreløpige." },
    ],
  },
  {
    slug: "les-trackman-tallene", kategori: "trening", tittel: "Les TrackMan-tallene", lesetid: 5, publisert: true,
    blokker: [
      { t: "p", tekst: "TrackMan-tallene står på engelsk, som i TrackMan selv. De viktigste:" },
      { t: "liste", punkter: [
        { fet: "Club Speed:", tekst: "køllehodets fart ved treff." },
        { fet: "Club Path:", tekst: "retningen køllehodet beveger seg i ved treff, i grader. For en høyrehendt spiller betyr minus ut-til-inn og pluss inn-til-ut." },
        { fet: "Face Angle:", tekst: "hvor køllebladet peker ved treff." },
        { fet: "Attack Angle:", tekst: "om køllen går ned eller opp gjennom ballen." },
        { fet: "Smash Factor:", tekst: "ballfart delt på køllefart. Høyere betyr bedre treff." },
        { fet: "Carry:", tekst: "hvor langt ballen flyr før den lander." },
      ] },
      { t: "p", tekst: "Stats › Trening › TrackMan viser én økt med alle køller, og spredningen for hver kølle." },
    ],
  },
  {
    slug: "skriv-til-coachen", kategori: "coaching", tittel: "Skriv til coachen", lesetid: 2, publisert: true,
    blokker: [
      { t: "p", tekst: "Bjella øverst åpner Innboks. Der skriver du til coachen, og der kommer svar, forslag til nye tider og endringer i planen." },
      { t: "p", tekst: "Meldinger kan i dag ikke ha vedlegg. Video fra treningen legger du inn i Live-økta, på øvelsen du gjorde." },
    ],
  },
  {
    slug: "forbered-en-coachingtime", kategori: "coaching", tittel: "Forbered en coachingtime", lesetid: 3, publisert: true,
    blokker: [
      { t: "liste", punkter: [
        { tekst: "Registrer rundene dine slag for slag, så coachen ser hvor du taper slag." },
        { tekst: "Skriv i Innboks hva du vil jobbe med, dagen før." },
        { tekst: "Ta med det du har testet siden sist." },
      ] },
      { t: "p", tekst: "Etter timen får du et sammendrag fra coachen i Innboks. Øktene coachen legger i planen, dukker opp i uka. Kvitter med «Forstått» når du har lest det." },
    ],
  },
  {
    slug: "flytt-eller-avbestill-en-time", kategori: "coaching", tittel: "Flytt eller avbestill en time", lesetid: 2, publisert: true,
    blokker: [
      { t: "p", tekst: "Gå til Meg › Bookinger og åpne timen." },
      { t: "liste", punkter: [
        { fet: "Flytt:", tekst: "velg en ny ledig tid innenfor coachens tilgjengelighet. Det kan du gjøre selv så lenge det er mer enn 24 timer til timen. Flytting trekker ikke klipp, og coachen får beskjed." },
        { fet: "Avbestill mer enn 24 timer før:", tekst: "du får klippet tilbake, eller pengene refundert." },
        { fet: "Avbestill 24 timer før eller senere:", tekst: "timen avbestilles, men du får ikke klippet eller pengene tilbake." },
      ] },
      { t: "p", tekst: "Avlyser coachen timen, får du alltid alt tilbake." },
    ],
  },
  {
    slug: "book-en-time", kategori: "booking", tittel: "Book en time", lesetid: 2, publisert: true,
    blokker: [
      { t: "p", tekst: "Gå til Meg › Bookinger og velg «Book time». Velg coach, type økt og en ledig tid. Bare tider innenfor coachens tilgjengelighet vises." },
      { t: "p", tekst: "Har du coaching-pakke, betaler du med et klipp. Ellers betaler du med kort eller Apple Pay. Timen er bekreftet med en gang betalingen er gjennomført, og du får bekreftelse på e-post." },
    ],
  },
  {
    slug: "klipp-forklart", kategori: "booking", tittel: "Klipp forklart", lesetid: 2, publisert: true,
    blokker: [
      { t: "p", tekst: "Coaching-pakkene gir klipp hver måned: Performance gir 2, Performance Pro gir 4. Én coachet time trekker ett klipp." },
      { t: "liste", punkter: [
        { tekst: "Klippet trekkes når timen bookes." },
        { tekst: "Klippene fylles opp når pakken fornyes. Klipp du ikke har brukt, følger ikke med til neste måned." },
        { tekst: "Avbestiller du mer enn 24 timer før, får du klippet tilbake." },
      ] },
      { t: "p", tekst: "Meg › Abonnement viser hvor mange klipp du har igjen." },
    ],
  },
  {
    slug: "gratis-og-full", kategori: "booking", tittel: "Gratis og Full", lesetid: 3, publisert: true,
    blokker: [
      { t: "p", tekst: "PlayerHQ har to nivåer." },
      { t: "liste", punkter: [
        { fet: "Gratis", tekst: "koster ingenting og utløper aldri. Du kan registrere runder, se Stats med Strokes Gained, ta tester og booke timer." },
        { fet: "Full", tekst: "gir hele appen: Plan og Workbench, treningsøkta og Caddie i tillegg. Full koster 299 kr/mnd eller 2 690 kr/år." },
      ] },
      { t: "p", fet: "Full er inkludert", tekst: "hvis du har coaching-pakken Performance eller Performance Pro, eller er med i en gruppe AK Golf driver, som GFGK Junior, WANG Toppidrett eller AK Golf Academy." },
      { t: "p", fet: "Første gang du velger Full", tekst: "får du én uke før første trekk. Du legger inn kort, og kan si opp før uka er over. Etter det trekkes beløpet automatisk." },
    ],
  },
  {
    slug: "endre-passord", kategori: "konto", tittel: "Endre passord", lesetid: 1, publisert: true,
    blokker: [
      { t: "p", tekst: "Gå til Meg › Innstillinger › Sikkerhet og velg Passord. Skriv det nye passordet to ganger. Passordet må ha minst 8 tegn. Har du vært logget inn lenge, ber vi deg logge inn på nytt først." },
      { t: "p", tekst: "Har du glemt passordet, trykker du «Glemt passord» på innloggingssiden og får en lenke på e-post." },
      { t: "p", tekst: "Logger du inn med Google, har du ikke eget passord i PlayerHQ. Passordet styres hos Google." },
    ],
  },
  {
    slug: "sla-pa-tofaktor", kategori: "konto", tittel: "Slå på tofaktor", lesetid: 2, publisert: true,
    blokker: [
      { t: "p", tekst: "Tofaktor betyr at kontoen din har en kode fra telefonen i tillegg til passordet." },
      { t: "nr", punkter: [
        "Gå til Meg › Innstillinger › Sikkerhet og velg Tofaktor.",
        "Skann koden med en kodeapp, for eksempel Google Authenticator eller 1Password.",
        "Skriv de seks sifrene appen viser.",
      ] },
      { t: "p", tekst: "Mister du telefonen, skriver du til oss fra e-posten kontoen er registrert på, så hjelper vi deg inn igjen." },
    ],
  },
  {
    slug: "last-ned-dataene-dine", kategori: "konto", tittel: "Last ned dataene dine", lesetid: 2, publisert: true,
    blokker: [
      { t: "p", tekst: "Gå til Meg › Innstillinger › Dataene dine og trykk «Last ned dataene mine». Du får én fil (JSON) med alt som er lagret om deg: profil, runder og slag, økter, tester, TrackMan-økter, målsetninger, bookinger, betalinger og meldinger. Du får også en e-post om at dataene er lastet ned." },
      { t: "p", tekst: "Vil du slette kontoen, gjør du det under Meg › Innstillinger › Konto. Du skriver SLETT, og forespørselen går til AK Golf." },
    ],
  },
  {
    slug: "hva-betyr-strokes-gained", kategori: "statistikk", tittel: "Hva betyr Strokes Gained?", lesetid: 4, publisert: true,
    blokker: [
      { t: "p", tekst: "Strokes Gained viser hvor mange slag du vinner eller taper per runde i hvert område: utslag, innspill, nærspill og putting. Tallet regnes ut for hvert slag: hvor langt fra hullet du var før og etter, sammenlignet med hva en referansespiller bruker fra samme sted." },
      { t: "liste", punkter: [
        { tekst: "Pluss betyr at du vant slag. Minus betyr at du tapte." },
        { tekst: "Stats sammenligner deg som standard med neste kategori. Det tallet er et estimat og merket slik." },
        { tekst: "Du kan også slå på sammenligning med PGA Tour." },
      ] },
      { t: "p", tekst: "Strokes Gained krever runder ført slag for slag. Under fire runder vises ingen konklusjon, fra fire til sju er tallene foreløpige. Utslag og innspill er sikre fra 12 runder, nærspill og putting fra 24." },
    ],
  },
  {
    slug: "les-rundesammendraget", kategori: "statistikk", tittel: "Les rundesammendraget", lesetid: 3, publisert: true,
    blokker: [
      { t: "p", tekst: "Når du har lagret en runde, ser du sammendraget:" },
      { t: "liste", punkter: [
        { fet: "Brutto score", tekst: "og scorekortet hull for hull." },
        { fet: "Strokes Gained", tekst: "per område, med det området du tapte mest i markert." },
        { fet: "Tiger 5:", tekst: "fem enkle feil som koster slag, som bogey fra innenfor 130 m og bom på enkel up and down. Noen av dem krever at runden er ført slag for slag." },
      ] },
      { t: "p", tekst: "Sammendraget ligger under Stats › Snittscore, og coachen ser det samme." },
    ],
  },
];

export const HJELP_FAQ: { sporsmal: string; svar: string }[] = [
  { sporsmal: "Hvordan registrerer jeg en runde?", svar: "Trykk på hurtigknappen og velg «Registrer runde». Før slag for slag, så regnes Strokes Gained og brutto score ut med en gang." },
  { sporsmal: "Hvor planlegger jeg treningen?", svar: "I Plan. «Rediger» åpner Workbench med År, Periode, Måned, Uke og Målsetninger." },
  { sporsmal: "Hva koster appen?", svar: "Gratis koster ingenting. Full koster 299 kr/mnd eller 2 690 kr/år, og er inkludert i coaching-pakkene Performance og Performance Pro." },
  { sporsmal: "Hvordan når jeg coachen?", svar: "Bjella øverst åpner Innboks. Der skriver du til coachen, og der kommer forslag og svar." },
];

export const publiserteArtikler = () => HJELP_ARTIKLER.filter((a) => a.publisert);
export const artiklerIKategori = (slug: string) => publiserteArtikler().filter((a) => a.kategori === slug);
export const finnArtikkel = (slug: string) => publiserteArtikler().find((a) => a.slug === slug) ?? null;
export const finnKategori = (slug: string) => HJELP_KATEGORIER.find((k) => k.slug === slug) ?? null;

/** Ren tekst for søk: tittel og alle blokker. */
export function artikkelTekst(a: HjelpArtikkel): string {
  return [a.tittel, ...a.blokker.flatMap((b) => b.t === "liste" ? b.punkter.map((p) => `${p.fet ?? ""} ${p.tekst}`) : b.t === "nr" ? b.punkter : [`${b.fet ?? ""} ${b.tekst}`])].join(" ");
}
