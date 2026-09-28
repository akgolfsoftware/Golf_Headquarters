/**
 * WANG-trenerflaten: det ene rutekartet. Skallet (sidemeny, faner, mobilens
 * bunnrad og «Mer»-arket), proxyens innloggingssperre og skjermene leser alle
 * herfra. Ingen skjerm skal skrive en /team-wang-sti for hånd — bruk
 * `wangHref()` / `elevprofilHref()`.
 *
 * Kilde: Claude Design «WANG Golf UI prototype» (6cfa623c), fila
 * «WANG Golf Skjermoversikt.dc.html» — konstantene WG_SKJERMER, WG_MENY,
 * WG_ROLLEMENY og WG_MOBIL (runde 18, 28.09.2026). Beslutning: .claude/rules/
 * beslutninger.md §WANG I AK GOLF HQ ER BARE FOR SPORTSSJEF OG TRENER.
 *
 * Avvik fra tegningen (bevisst):
 *   - Tegningens stier med «?fane=» på /team-wang kolliderer med fellessiden
 *     (src/app/team-wang/page.tsx), som skal stå urørt og åpen. Hver skjerm har
 *     derfor sin egen sti under hovedpunktet sitt (/team-wang/i-dag/…,
 *     /team-wang/trening/… osv.).
 *   - WANG-00 Skjermoversikt og WANG-41 Gjennomgang er prototypeverktøy og
 *     finnes ikke i appen. Systemlenkene i menyen er Fellessiden og Logg ut.
 *   - WG-02 og WANG-06 (IUP) utgår 28.09. /team-wang/coach/iup/[elevId] skal
 *     videresende til elevprofilens IUP-fane (WANG-44).
 *   - Ikonene er Lucide (tegningen bruker Phosphor). Navnene her er
 *     lucide-react-komponentnavn; skallet slår dem opp i én fast tabell.
 */

export type WangRolle = "SPORTSSJEF" | "TRENER";

export const WANG_ROLLE_NAVN: Record<WangRolle, string> = { SPORTSSJEF: "Sportssjef", TRENER: "Trener" };

export type WangHovedpunktId = "idag" | "trening" | "tester" | "konkurranse" | "meldinger" | "elever" | "admin";

/** Ikonnavn skallet kan tegne. Nærmeste Lucide til tegningens Phosphor-ikon. */
export type WangIkon =
  | "Sunrise" | "Route" | "Dumbbell" | "Flag" | "Mail" | "BookUser" | "Settings"
  | "Bell" | "CalendarDays" | "Sun" | "Newspaper" | "ChartColumn" | "ChartBarBig" | "CalendarRange"
  | "CalendarCheck" | "SquareCheck" | "Timer" | "ListChecks" | "ClipboardList" | "ChartLine"
  | "Trophy" | "ListOrdered" | "Plane" | "Megaphone" | "Users" | "FolderClosed" | "Contact"
  | "CircleUser" | "Send" | "UsersRound" | "GraduationCap" | "NotebookPen" | "UserPlus"
  | "IdCard" | "Handshake" | "CalendarPlus" | "Search" | "Armchair" | "ArrowLeftRight";

export type WangSkjerm = {
  /** Skjerm-ID fra tegningen, f.eks. «WANG-42». */
  id: string;
  navn: string;
  /** Teksten på fanen. Mangler den, brukes navnet. */
  fane?: string;
  /** Kort navn (mobil). */
  kort: string;
  ikon: WangIkon;
  hovedpunkt: WangHovedpunktId;
  /** Sti uten parametre. Dynamiske deler skrives [navn], f.eks. /team-wang/elev/[elevId]. */
  sti: string;
  /** Ekstra stier som hører til samme skjerm (detaljsider). Samme [navn]-syntaks. */
  undersider?: string[];
  roller: WangRolle[];
  /** Vises bare som fane når skjermen er åpen (detaljskjerm under en annen). */
  under?: string;
  /** Skillelinje med etikett foran denne fanen (tegningens «deler»). */
  del?: string;
};

export const WANG_SKJERMER: readonly WangSkjerm[] = [
  // I dag
  { id: "WANG-43", navn: "Elever som trenger deg", fane: "Trenger deg", kort: "Trenger deg", ikon: "Bell", hovedpunkt: "idag", sti: "/team-wang/i-dag", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-30", navn: "Kalender og uke", kort: "Kalender", ikon: "CalendarDays", hovedpunkt: "idag", sti: "/team-wang/i-dag/kalender", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WG-01", navn: "Morgentrening og uke", kort: "Uke", ikon: "Sunrise", hovedpunkt: "idag", sti: "/team-wang/i-dag/uke", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-12", navn: "Ukessammendrag", kort: "Uke", ikon: "Newspaper", hovedpunkt: "idag", sti: "/team-wang/i-dag/ukessammendrag", roller: ["SPORTSSJEF", "TRENER"] },
  // Trening
  { id: "WANG-42", navn: "Treningsoversikt", fane: "Oversikt", kort: "Oversikt", ikon: "ChartColumn", hovedpunkt: "trening", sti: "/team-wang/trening", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-29", navn: "Årsplan og periode", kort: "Årsplan", ikon: "Route", hovedpunkt: "trening", sti: "/team-wang/trening/arsplan", roller: ["SPORTSSJEF", "TRENER"], del: "Plan" },
  { id: "WANG-16", navn: "Periodeplan", kort: "Periode", ikon: "ChartBarBig", hovedpunkt: "trening", sti: "/team-wang/trening/periode", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-17", navn: "Månedsplan", kort: "Måned", ikon: "CalendarRange", hovedpunkt: "trening", sti: "/team-wang/trening/maned", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-18", navn: "Kalender og økt", kort: "Økt", ikon: "CalendarCheck", hovedpunkt: "trening", sti: "/team-wang/trening/okter", undersider: ["/team-wang/trening/okter/[oktId]"], roller: ["SPORTSSJEF", "TRENER"], del: "Økter" },
  { id: "WANG-04", navn: "Morgenøkter", kort: "Morgenøkt", ikon: "Sun", hovedpunkt: "trening", sti: "/team-wang/trening/morgenokter", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-38", navn: "Oppmøte", kort: "Oppmøte", ikon: "SquareCheck", hovedpunkt: "trening", sti: "/team-wang/trening/oppmote", roller: ["SPORTSSJEF", "TRENER"] },
  // Tester
  { id: "WG-03", navn: "Fysiske tester", kort: "Tester", ikon: "Dumbbell", hovedpunkt: "tester", sti: "/team-wang/tester", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-08", navn: "Testdag", kort: "Testdag", ikon: "Timer", hovedpunkt: "tester", sti: "/team-wang/tester/testdag", undersider: ["/team-wang/tester/testdag/[testdagId]"], roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-37", navn: "Testkø", kort: "Testkø", ikon: "ListChecks", hovedpunkt: "tester", sti: "/team-wang/tester/ko", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-22", navn: "Testprotokoller", kort: "Protokoller", ikon: "ClipboardList", hovedpunkt: "tester", sti: "/team-wang/tester/protokoller", undersider: ["/team-wang/tester/protokoller/[protokollId]"], roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-23", navn: "Resultater per elev", kort: "Resultater", ikon: "ChartLine", hovedpunkt: "tester", sti: "/team-wang/tester/resultater", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-39", navn: "Rangering", kort: "Rangering", ikon: "Trophy", hovedpunkt: "tester", sti: "/team-wang/tester/rangering", roller: ["SPORTSSJEF", "TRENER"] },
  // Konkurranse
  { id: "WANG-10", navn: "Turneringer", kort: "Turneringer", ikon: "Flag", hovedpunkt: "konkurranse", sti: "/team-wang/konkurranse", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-11", navn: "Turneringsdetalj", kort: "Detalj", ikon: "ListOrdered", hovedpunkt: "konkurranse", sti: "/team-wang/konkurranse/turnering/[turneringId]", roller: ["SPORTSSJEF", "TRENER"], under: "WANG-10" },
  { id: "WANG-09", navn: "Samlinger og uttak", kort: "Samlinger", ikon: "Plane", hovedpunkt: "konkurranse", sti: "/team-wang/konkurranse/samlinger", undersider: ["/team-wang/konkurranse/samlinger/[samlingId]"], roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-27", navn: "Golfstatistikk", kort: "Statistikk", ikon: "ChartColumn", hovedpunkt: "konkurranse", sti: "/team-wang/konkurranse/statistikk", roller: ["SPORTSSJEF", "TRENER"] },
  // Meldinger
  { id: "WANG-13", navn: "Gruppeposter", kort: "Poster", ikon: "Megaphone", hovedpunkt: "meldinger", sti: "/team-wang/meldinger", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-14", navn: "Post til elev", kort: "Post", ikon: "Mail", hovedpunkt: "meldinger", sti: "/team-wang/meldinger/post", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-15", navn: "Foreldremøte", kort: "Møte", ikon: "Users", hovedpunkt: "meldinger", sti: "/team-wang/meldinger/foreldremote", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-21", navn: "Dokumenter", kort: "Dokumenter", ikon: "FolderClosed", hovedpunkt: "meldinger", sti: "/team-wang/meldinger/dokumenter", roller: ["SPORTSSJEF", "TRENER"] },
  // Elever
  { id: "WANG-07", navn: "Elever", kort: "Elever", ikon: "Contact", hovedpunkt: "elever", sti: "/team-wang/elever", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-44", navn: "Elevprofil", kort: "Profil", ikon: "CircleUser", hovedpunkt: "elever", sti: "/team-wang/elev/[elevId]", roller: ["SPORTSSJEF", "TRENER"], under: "WANG-07" },
  { id: "WANG-45", navn: "Fireukerssjekk", kort: "Sjekk", ikon: "ClipboardList", hovedpunkt: "elever", sti: "/team-wang/elever/fireukerssjekk", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-46", navn: "Forslag til elev", kort: "Forslag", ikon: "Send", hovedpunkt: "elever", sti: "/team-wang/elever/forslag", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WG-05", navn: "Trenerflate", kort: "Trener", ikon: "UsersRound", hovedpunkt: "elever", sti: "/team-wang/coach", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-05", navn: "Skole og fravær", kort: "Fravær", ikon: "GraduationCap", hovedpunkt: "elever", sti: "/team-wang/elever/skole-fravaer", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WG-04", navn: "Prøveplan", kort: "Prøveplan", ikon: "NotebookPen", hovedpunkt: "elever", sti: "/team-wang/elever/proveplan", roller: ["SPORTSSJEF", "TRENER"] },
  { id: "WANG-20", navn: "Inviter elev", kort: "Inviter", ikon: "UserPlus", hovedpunkt: "elever", sti: "/team-wang/elever/inviter", roller: ["SPORTSSJEF", "TRENER"] },
  // Administrasjon (bare Sportssjef)
  { id: "WANG-19", navn: "Trenere og roller", kort: "Trenere", ikon: "IdCard", hovedpunkt: "admin", sti: "/team-wang/admin/trenere", roller: ["SPORTSSJEF"] },
  { id: "WANG-34", navn: "Samtykkeoversikt", kort: "Samtykke", ikon: "Handshake", hovedpunkt: "admin", sti: "/team-wang/admin/samtykke", roller: ["SPORTSSJEF"] },
  { id: "WANG-26", navn: "Timeplanføring", kort: "Timeplan", ikon: "CalendarPlus", hovedpunkt: "admin", sti: "/team-wang/admin/timeplan", roller: ["SPORTSSJEF"] },
  { id: "WANG-31", navn: "Rekruttering", kort: "Rekruttering", ikon: "Search", hovedpunkt: "admin", sti: "/team-wang/admin/rekruttering", roller: ["SPORTSSJEF"] },
  { id: "WANG-32", navn: "Plasser", kort: "Plasser", ikon: "Armchair", hovedpunkt: "admin", sti: "/team-wang/admin/plasser", roller: ["SPORTSSJEF"] },
  { id: "WANG-33", navn: "Koordinering mellom skoler", kort: "Koordinering", ikon: "ArrowLeftRight", hovedpunkt: "admin", sti: "/team-wang/admin/koordinering", roller: ["SPORTSSJEF"] },
];

export type WangHovedpunkt = { id: WangHovedpunktId; navn: string; kort: string; ikon: WangIkon; faner: string[] };

/** Rekkefølgen og fanene er tegningens WG_MENY. */
export const WANG_HOVEDPUNKTER: readonly WangHovedpunkt[] = [
  { id: "idag", navn: "I dag", kort: "I dag", ikon: "Sunrise", faner: ["WANG-43", "WANG-30", "WG-01", "WANG-12"] },
  { id: "trening", navn: "Trening", kort: "Trening", ikon: "Route", faner: ["WANG-42", "WANG-29", "WANG-16", "WANG-17", "WANG-18", "WANG-04", "WANG-38"] },
  { id: "tester", navn: "Tester", kort: "Tester", ikon: "Dumbbell", faner: ["WG-03", "WANG-08", "WANG-37", "WANG-22", "WANG-23", "WANG-39"] },
  { id: "konkurranse", navn: "Konkurranse", kort: "Konkurranse", ikon: "Flag", faner: ["WANG-10", "WANG-11", "WANG-09", "WANG-27"] },
  { id: "meldinger", navn: "Meldinger", kort: "Meldinger", ikon: "Mail", faner: ["WANG-13", "WANG-14", "WANG-15", "WANG-21"] },
  { id: "elever", navn: "Elever", kort: "Elever", ikon: "BookUser", faner: ["WANG-07", "WANG-44", "WANG-45", "WANG-46", "WG-05", "WANG-05", "WG-04", "WANG-20"] },
  { id: "admin", navn: "Administrasjon", kort: "Admin", ikon: "Settings", faner: ["WANG-19", "WANG-34", "WANG-26", "WANG-31", "WANG-32", "WANG-33"] },
];

/** Tegningens WG_ROLLEMENY: Trener ser seks hovedpunkter, Sportssjef sju. */
export const WANG_ROLLEMENY: Record<WangRolle, WangHovedpunktId[]> = {
  TRENER: ["idag", "trening", "tester", "konkurranse", "meldinger", "elever"],
  SPORTSSJEF: ["idag", "trening", "tester", "konkurranse", "meldinger", "elever", "admin"],
};

/** Tegningens WG_MOBIL: fire faste valg i bunnraden. Resten ligger under «Mer». */
export const WANG_MOBIL: readonly WangHovedpunktId[] = ["idag", "trening", "tester", "elever"];

/** Faner i elevprofilen (WANG-44), i tegningens rekkefølge. */
export const WANG_ELEVPROFIL_FANER = [
  { id: "plan", navn: "Plan" },
  { id: "stats", navn: "Stats" },
  { id: "tester", navn: "Tester" },
  { id: "iup", navn: "IUP" },
  { id: "samtaler", navn: "Samtaler" },
  { id: "turneringer", navn: "Turneringer" },
] as const;
export type WangElevprofilFane = (typeof WANG_ELEVPROFIL_FANER)[number]["id"];

export const WANG_LOGG_INN = "/team-wang/logg-inn";
export const WANG_FELLESSIDE = "/team-wang";
/** Første side etter innlogging for trener og sportssjef. */
export const WANG_START = "/team-wang/i-dag";

const SKJERM_ETTER_ID = new Map(WANG_SKJERMER.map((s) => [s.id, s]));

export function wangSkjerm(id: string): WangSkjerm {
  const s = SKJERM_ETTER_ID.get(id);
  if (!s) throw new Error(`Ukjent WANG-skjerm: ${id}`);
  return s;
}

/**
 * Lenke til en skjerm. Dynamiske deler fylles fra `params`
 * (wangHref("WANG-11", { turneringId: "abc" })). Mangler en verdi, kastes feil
 * i stedet for å lage en halv lenke.
 */
export function wangHref(id: string, params: Record<string, string> = {}, sok?: Record<string, string>): string {
  const sti = wangSkjerm(id).sti.replace(/\[([^\]]+)\]/g, (_, navn: string) => {
    const v = params[navn];
    if (!v) throw new Error(`Mangler ${navn} for ${id}`);
    return encodeURIComponent(v);
  });
  const q = sok ? new URLSearchParams(sok).toString() : "";
  return q ? `${sti}?${q}` : sti;
}

export function elevprofilHref(elevId: string, fane: WangElevprofilFane = "plan"): string {
  return wangHref("WANG-44", { elevId }, fane === "plan" ? undefined : { fane });
}

export function lesElevprofilFane(verdi: string | string[] | undefined): WangElevprofilFane {
  const v = Array.isArray(verdi) ? verdi[0] : verdi;
  return WANG_ELEVPROFIL_FANER.find((f) => f.id === v)?.id ?? "plan";
}

function stiTilRegex(sti: string): RegExp {
  const kropp = sti
    .split("/")
    .map((del) => (/^\[[^\]]+\]$/.test(del) ? "[^/]+" : del.replace(/[.*+?^${}()|\\]/g, "\\$&")))
    .join("/");
  return new RegExp(`^${kropp}/?$`);
}

const MONSTRE: { skjerm: WangSkjerm; re: RegExp; lengde: number }[] = WANG_SKJERMER.flatMap((skjerm) =>
  [skjerm.sti, ...(skjerm.undersider ?? [])].map((sti) => ({ skjerm, re: stiTilRegex(sti), lengde: sti.length })),
).sort((a, b) => b.lengde - a.lengde);

/** Skjermen en sti tilhører (uten søkestreng), eller null. Mest spesifikke sti vinner. */
export function finnWangSkjerm(pathname: string): WangSkjerm | null {
  const sti = pathname.split("?")[0].split("#")[0];
  return MONSTRE.find((m) => m.re.test(sti))?.skjerm ?? null;
}

/** Stiene proxyen skal kreve innlogging for. Fellessiden, logg-inn og statiske filer er åpne. */
export function erWangTrenerSti(pathname: string): boolean {
  return finnWangSkjerm(pathname) !== null
    || WANG_SKJERMER.some((s) => pathname.startsWith(`${s.sti.split("/[")[0]}/`))
    || pathname.startsWith("/team-wang/elev/")
    || pathname.startsWith("/team-wang/coach/");
}

export function kanSeSkjerm(skjerm: WangSkjerm, rolle: WangRolle): boolean {
  return skjerm.roller.includes(rolle);
}

export type WangMenyvalg = {
  id: WangHovedpunktId;
  navn: string;
  kort: string;
  ikon: WangIkon;
  href: string;
  aktiv: boolean;
};

export type WangFane = {
  id: string;
  etikett: string;
  /** Etiketten i nedtrekkslisten på mobil («Plan · Årsplan og periode»). */
  valgEtikett: string;
  del?: string;
  href: string | null;
  aktiv: boolean;
};

export type WangMeny = {
  hovedpunkter: WangMenyvalg[];
  mobil: WangMenyvalg[];
  mer: WangMenyvalg[];
  aktivSkjerm: WangSkjerm | null;
  aktivtHovedpunkt: WangHovedpunkt | null;
  faner: WangFane[];
};

/**
 * Menyen for en rolle og en sti — tegningens wgMenyVals(). Faner vises bare når
 * hovedpunktet har mer enn én synlig fane. En fane med `under` vises bare når
 * den er åpen, og har da ingen lenke (den krever en valgt elev/turnering).
 */
export function byggWangMeny(rolle: WangRolle, pathname: string): WangMeny {
  const aktivSkjerm = finnWangSkjerm(pathname);
  const synlig = (id: string) => {
    const s = SKJERM_ETTER_ID.get(id);
    return !!s && !s.under && kanSeSkjerm(s, rolle);
  };
  const punkter = WANG_ROLLEMENY[rolle]
    .map((id) => WANG_HOVEDPUNKTER.find((h) => h.id === id))
    .filter((h): h is WangHovedpunkt => !!h && h.faner.some(synlig));
  const aktivtHovedpunkt = aktivSkjerm ? punkter.find((h) => h.faner.includes(aktivSkjerm.id)) ?? null : null;

  const valg = (h: WangHovedpunkt): WangMenyvalg => {
    const forste = wangSkjerm(h.faner.find(synlig) ?? h.faner[0]);
    return { id: h.id, navn: h.navn, kort: h.kort, ikon: h.ikon, href: forste.sti, aktiv: h === aktivtHovedpunkt };
  };
  const hovedpunkter = punkter.map(valg);
  const mobil = hovedpunkter.filter((h) => WANG_MOBIL.includes(h.id));
  const mer = hovedpunkter.filter((h) => !WANG_MOBIL.includes(h.id));

  let faner: WangFane[] = [];
  if (aktivtHovedpunkt) {
    let gjeldendeDel = "";
    faner = aktivtHovedpunkt.faner
      .filter((id) => synlig(id) || id === aktivSkjerm?.id)
      .map((id) => {
        const s = wangSkjerm(id);
        if (s.del) gjeldendeDel = s.del;
        const etikett = s.fane ?? s.navn;
        return {
          id,
          etikett,
          valgEtikett: gjeldendeDel ? `${gjeldendeDel} · ${etikett}` : etikett,
          del: s.del,
          href: s.sti.includes("[") ? null : s.sti,
          aktiv: id === aktivSkjerm?.id,
        };
      });
    if (faner.length < 2) faner = [];
  }
  return { hovedpunkter, mobil, mer, aktivSkjerm, aktivtHovedpunkt, faner };
}
