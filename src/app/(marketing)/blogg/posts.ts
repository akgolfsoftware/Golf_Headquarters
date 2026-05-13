export type BlogPost = {
  slug: string;
  tittel: string;
  ingress: string;
  dato: string; // ISO YYYY-MM-DD
  forfatter: string;
  bilde: string;
  innhold: string[]; // paragrafer
};

export const POSTS: BlogPost[] = [
  {
    slug: "hvorfor-struktur-slar-talent",
    tittel: "Hvorfor struktur slår talent",
    ingress:
      "De fleste spillere som blir gode har én ting til felles — ikke ekstraordinært talent, men en plan de faktisk følger.",
    dato: "2026-05-10",
    forfatter: "Anders Kristiansen",
    bilde: "/images/akademy/coaching-tripod.jpg",
    innhold: [
      "Etter ti år som coach har jeg sluttet å bli imponert over talent. Jeg blir imponert over disiplin. Den spilleren som dukker opp tre ganger i uken med klar plan kommer alltid lenger enn den som har et fantastisk slag, men trener på føleri.",
      "Struktur betyr ikke at all gleden forsvinner. Tvert imot — når du vet hva du jobber med, og hvorfor, blir hver økt mer meningsfull. Du ser sammenhengen mellom tirsdagens chip-drill og lørdagens runde.",
      "Det er nettopp denne strukturen vi bygger inn i Academy. Treningsplan i PlayerHQ, fokusområder bestemt av siste runde, og en coach som ser fremgangen din uten å måtte spørre.",
    ],
  },
  {
    slug: "kortspill-er-hvor-runden-vinnes",
    tittel: "Kortspill er hvor runden vinnes",
    ingress:
      "Driveren får alle oppslagene, men det er innspillet til green og putten som avgjør om scoren blir minneverdig eller glemmebar.",
    dato: "2026-04-22",
    forfatter: "Markus Røinås Pedersen",
    bilde: "/images/akademy/putting-data.jpg",
    innhold: [
      "Når vi ser på runde-data fra spillerne våre i PlayerHQ, dukker det samme mønsteret opp gang på gang. Forskjellen mellom en god runde og en frustrerende runde ligger sjelden i fairwayene — den ligger innenfor 100 meter.",
      "Det er her du sparer slag. Et solid wedge-spill på 50–100 meter, paret med en putting-rutine du stoler på, gir score-utvikling som driver og jern aldri kan matche alene.",
      "I treningstimene mine starter vi nesten alltid på greenen. Ikke fordi det er det mest spennende — men fordi det er det som flytter scoren mest. Når spillerne mine forstår det, endrer hele forholdet til trening seg.",
    ],
  },
  {
    slug: "datadrevet-coaching-uten-overload",
    tittel: "Datadrevet coaching uten overload",
    ingress:
      "Trackman gir deg 50 tall per slag. Spørsmålet er ikke hvor mye data du har — det er hvilke tre tall du faktisk skal jobbe med denne uken.",
    dato: "2026-03-15",
    forfatter: "Anders Kristiansen",
    bilde: "/images/akademy/bunker-shot.jpg",
    innhold: [
      "Mange spillere blir overveldet av Trackman-skjermen. Det er forståelig — 50 målinger per slag, alle med tre desimaler, og en følelse av at alt må forbedres samtidig.",
      "Vi gjør det motsatte. I hver økt velger jeg ut maks tre tall som er relevante for det vi jobber med — kanskje attack angle, smash factor og spin loft. Resten skjuler vi bevisst.",
      "Resultatet er at spilleren forlater økten med klarhet, ikke kaos. Du vet hva du jobber med, du vet hva som skal endre seg, og du ser tallene bevege seg uke for uke i PlayerHQ. Det er datadrevet coaching som faktisk fungerer.",
    ],
  },
];
