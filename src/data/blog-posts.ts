/**
 * Hardkodede bloggposter — testdata inntil vi migrerer til ekte MDX-filer.
 */

export type BlogPost = {
  slug: string;
  tittel: string;
  undertittel: string;
  kategori: string;
  forfatter: string;
  dato: string;
  lestid: number;
  featured: boolean;
  innhold: string; // HTML string for enkel rendering
  tags: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "norske-17-aringer-og-putt",
    tittel: "Hvorfor norske 17-åringer er dårligere på putt",
    undertittel:
      "Vi tracket 14 247 putter over tre sesonger og fant et tydelig mønster. Norske juniorer er svakest i 3–5-meters-sonen — og her er trolig årsaken.",
    kategori: "Analyse",
    forfatter: "Anders Kristiansen",
    dato: "19. mai 2026",
    lestid: 7,
    featured: true,
    tags: ["Junior", "Putt", "Norge"],
    innhold: `
      <p>Vi tracker hver putt i Srixon Tour. Det gir et datasett på <strong>14 247 putter</strong> over de siste tre sesongene. Når vi sammenligner med Sverige Junior Open-tilsvarende sett, dukker et tydelig mønster opp: norske 17-åringer synker færre putter i 3- til 5-meters-sonen.</p>
      <div class="stats-pull-quote">
        <div class="stats-editorial-num" style="font-size:88px">82%</div>
        <div style="font-size:17px;font-weight:500;margin-top:12px">av PGA Tour-putter fra 3m går inn.</div>
        <div style="font-size:14px;margin-top:4px;opacity:0.75">Norsk junior-snitt: 45%</div>
      </div>
      <p>Forskjellen er størst på 5-meteren — det Broadie kaller "gjennombrudd-avstanden". Her synker svenske 17-åringer 24 % av puttene, mens norske ligger på 18 %. Over en sesong er det ca. <strong>1,4 birdies per spiller per måned</strong>.</p>
      <h2>Hvorfor?</h2>
      <p>Vi snakket med tre svenske juniortrenere. Alle tre nevner samme ting: <strong>speed control</strong>. Svenske akademier bruker fast 30 min per uke på speed-drills. I Norge er det ad-hoc.</p>
    `,
  },
  {
    slug: "sg-approach-er-alt",
    tittel: "SG: Approach er det viktigste du kan forbedre",
    undertittel:
      "Av alle SG-kategoriene er innspill den med høyest variasjon og størst potensial for forbedring blant amatører under HCP 10.",
    kategori: "SG-analyse",
    forfatter: "Anders Kristiansen",
    dato: "12. mai 2026",
    lestid: 5,
    featured: false,
    tags: ["SG", "Approach", "HCP"],
    innhold: `
      <p>Broadie-data fra 50 000+ runder viser at SG: Approach forklarer den største variansen mellom HCP 5 og scratch. Ikke putting — innspill.</p>
      <p>En typisk HCP 7-spiller taper 1,8 strokes per runde på innspill sammenlignet med Tour-snittet. Til sammenligning taper de bare 0,6 på putting.</p>
    `,
  },
  {
    slug: "norske-college-golfers-2026",
    tittel: "11 norske golfere starter på college i høst",
    undertittel:
      "Aldri har så mange norske juniorer fått college-tilbud i golf på ett år. Her er oversikten over hvem, hvor og hva det betyr for norsk golf.",
    kategori: "Norske spillere",
    forfatter: "Anders Kristiansen",
    dato: "5. mai 2026",
    lestid: 4,
    featured: false,
    tags: ["College", "Junior", "Norge"],
    innhold: `
      <p>Høsten 2026 starter 11 norske golfere på college i USA — rekord. Fem av dem er fra Øst-Norge, tre fra Vest, to fra Midt og én fra Sør.</p>
      <p>Det er AK Golf Stats som har sporet dette. Gjennom tre år med Srixon Tour-data, WAGR-rangeringer og College-søk-prosessen har vi bygget et bilde av hvilke spillere som er på vei til USA.</p>
    `,
  },
  {
    slug: "pga-sg-total-hovland",
    tittel: "Viktor Hovland og SG: Hva tallene sier",
    undertittel:
      "En dypdykk i Hovlands SG-data fra de siste to sesongene. Innspill dominerer, putting er bedre enn ryktet tilsier.",
    kategori: "PGA Tour",
    forfatter: "Anders Kristiansen",
    dato: "28. april 2026",
    lestid: 6,
    featured: false,
    tags: ["PGA Tour", "Hovland", "SG"],
    innhold: `
      <p>Viktor Hovlands PGA Tour-statistikk er fascinerende. SG: Approach-tallene hans er konsekvent i topp 15 på Tour, men det er SG: Around the Green som har fluktuert mest.</p>
      <p>Putting er bedre enn mange tror: +0.3 strokes per runde i 2025, opp fra −0.2 i 2023.</p>
    `,
  },
  {
    slug: "banedata-baerum-gk",
    tittel: "Bærum GK: Norges vanskeligste bane?",
    undertittel:
      "Slope 141, CR 74.5. Vi analyserte 487 runder spilt der de siste to sesongene. Resultatene er entydige — dette er tøffest.",
    kategori: "Banedata",
    forfatter: "Anders Kristiansen",
    dato: "20. april 2026",
    lestid: 4,
    featured: false,
    tags: ["Banedata", "Bærum GK", "Slope"],
    innhold: `
      <p>Av de 50 banene i AK Golf Stats-databasen er Bærum GK konsekvent den banene med lavest score-til-par-snitt. 487 runder spilt der i 2024-2025 gir et gjennomsnitt på +6.8 over par for deltakere i Srixon Tour.</p>
    `,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getFeaturedPost(): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.featured);
}

export function getNonFeaturedPosts(): BlogPost[] {
  return BLOG_POSTS.filter((p) => !p.featured);
}
