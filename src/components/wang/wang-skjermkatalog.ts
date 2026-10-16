// Katalog over skjermene i WANG-trenerflaten (id, navn, område, roller).
// Inneholder ingen personer. Tidligere en del av wang-data.ts, som hadde
// oppdiktede elever og ble fjernet 16.10.2026 (skjermkontroll 15.10, funn 4).

export interface WangSkjermDef {
  id: string;
  navn: string;
  kort?: string;
  fane?: string;
  omraade: "idag" | "trening" | "tester" | "konkurranse" | "meldinger" | "elever" | "admin" | "system";
  fil?: string;
  hash?: string;
  r?: string;
  sti?: string;
  dg?: string;
  under?: string;
  arkiv?: boolean;
  som?: string;
  aapen?: boolean;
  skjul?: string[];
  roller: ("Sportssjef" | "Trener")[];
  beskrivelse?: string;
  ikon?: string;
  [key: string]: unknown;
}


export const WANG_SKJERMER_KATALOG: WangSkjermDef[] = [
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B18",
    "id": "WANG-43",
    "navn": "Elever som trenger deg",
    "kort": "Trenger deg",
    "fane": "Trenger deg",
    "ikon": "ph-bell-simple",
    "hash": "trenger",
    "r": "trenger",
    "sti": "/team-wang/i-dag",
    "omraade": "idag"
  },
  {
    "id": "WANG-30",
    "navn": "Kalender og uke",
    "kort": "Kalender",
    "ikon": "ph-calendar-blank",
    "fil": "B10",
    "hash": "kalender",
    "r": "kalender",
    "sti": "/team-wang?fane=kalender",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "idag"
  },
  {
    "id": "WG-01",
    "navn": "Morgentrening og uke",
    "kort": "Uke",
    "ikon": "ph-sun-horizon",
    "fil": "B1",
    "hash": "uke",
    "r": "uke",
    "sti": "/team-wang",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "idag"
  },
  {
    "id": "WANG-12",
    "navn": "Ukessammendrag",
    "kort": "Uke",
    "ikon": "ph-newspaper",
    "fil": "B4",
    "hash": "uke",
    "r": "uke",
    "sti": "/team-wang/coach/ukessammendrag",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "idag"
  },
  {
    "id": "WANG-42",
    "navn": "Treningsoversikt",
    "kort": "Oversikt",
    "fane": "Oversikt",
    "ikon": "ph-chart-bar",
    "fil": "B17",
    "hash": "oversikt",
    "r": "oversikt",
    "sti": "/team-wang/trening",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WANG-29",
    "navn": "Årsplan og periode",
    "kort": "Årsplan",
    "ikon": "ph-path",
    "fil": "B10",
    "hash": "trening",
    "r": "trening",
    "sti": "/team-wang?fane=trening",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WANG-16",
    "navn": "Periodeplan",
    "kort": "Periode",
    "ikon": "ph-chart-bar-horizontal",
    "fil": "B6",
    "hash": "periode",
    "r": "periode",
    "sti": "/team-wang/plan/periode",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WANG-17",
    "navn": "Månedsplan",
    "kort": "Måned",
    "ikon": "ph-calendar-dots",
    "fil": "B6",
    "hash": "maned",
    "r": "maned",
    "sti": "/team-wang/plan/maned",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WANG-18",
    "navn": "Kalender og økt",
    "kort": "Økt",
    "ikon": "ph-calendar-check",
    "fil": "B6",
    "hash": "kalender",
    "r": "kalender",
    "sti": "/team-wang?fane=kalender&okt=[id]",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WANG-04",
    "navn": "Morgenøkter",
    "kort": "Morgenøkt",
    "ikon": "ph-sun",
    "fil": "B2",
    "hash": "morgen",
    "r": "morgen",
    "sti": "/team-wang/morgenokter",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WANG-38",
    "navn": "Oppmøte",
    "kort": "Oppmøte",
    "ikon": "ph-check-square",
    "fil": "B14",
    "hash": "oppmote",
    "r": "oppmote",
    "sti": "/team-wang/coach/oppmote",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WG-02",
    "navn": "IUP · Utgår 28.09",
    "kort": "IUP",
    "ikon": "ph-target",
    "fil": "B1",
    "hash": "iup",
    "r": "iup",
    "sti": "/team-wang/coach/iup/[elevId]",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "under": "WANG-06",
    "utgar": "28.09.2026",
    "erstattet": "WANG-44",
    "omraade": "trening"
  },
  {
    "id": "WANG-06",
    "navn": "IUP-oversikt · Utgår 28.09",
    "kort": "IUP",
    "ikon": "ph-list-checks",
    "fil": "B2",
    "hash": "iup",
    "r": "iup",
    "sti": "/team-wang/iup",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "utgar": "28.09.2026",
    "erstattet": "WANG-44",
    "omraade": "trening"
  },
  {
    "id": "WG-03",
    "navn": "Fysiske tester",
    "kort": "Tester",
    "ikon": "ph-barbell",
    "fil": "B1",
    "hash": "tester",
    "r": "tester",
    "sti": "/team-wang/tester",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "tester"
  },
  {
    "id": "WANG-08",
    "navn": "Testdag",
    "kort": "Testdag",
    "ikon": "ph-timer",
    "fil": "B3",
    "hash": "testdag",
    "r": "testdag",
    "sti": "/team-wang/coach/test/[id]",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "tester"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B19",
    "id": "WANG-48",
    "navn": "Testbatteri",
    "kort": "Batteri",
    "ikon": "ph-list-checks",
    "hash": "oversikt",
    "r": "oversikt",
    "sti": "/team-wang/tester/batteri",
    "fane": "Batteri",
    "omraade": "tester"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B19",
    "id": "WANG-48A",
    "navn": "Testoppsett",
    "kort": "Oppsett",
    "ikon": "ph-sliders",
    "hash": "variant",
    "r": "variant",
    "sti": "/team-wang/tester/[test]",
    "omraade": "tester"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B19",
    "id": "WANG-48B",
    "navn": "Scorekort",
    "kort": "Scorekort",
    "ikon": "ph-note-pencil",
    "hash": "kort",
    "r": "kort",
    "sti": "/team-wang/tester/[test]/[spiller]",
    "omraade": "tester"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B19",
    "id": "WANG-48C",
    "navn": "Testhistorikk",
    "kort": "Historikk",
    "ikon": "ph-clock-counter-clockwise",
    "hash": "hist",
    "r": "hist",
    "sti": "/team-wang/tester/historikk/[spiller]",
    "omraade": "tester"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B19",
    "id": "WANG-49",
    "navn": "Felles testdag",
    "kort": "Felles testdag",
    "ikon": "ph-users-three",
    "hash": "testdag",
    "r": "testdag",
    "sti": "/team-wang/tester/testdag/[id]",
    "fane": "Felles testdag",
    "omraade": "tester"
  },
  {
    "id": "WANG-37",
    "navn": "Testkø",
    "kort": "Testkø",
    "ikon": "ph-list-checks",
    "fil": "B14",
    "hash": "tester",
    "r": "tester",
    "sti": "/team-wang/coach/tester",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "tester"
  },
  {
    "id": "WANG-22",
    "navn": "Testprotokoller",
    "kort": "Protokoller",
    "ikon": "ph-clipboard-text",
    "fil": "B8",
    "hash": "protokoll",
    "r": "protokoll",
    "sti": "/team-wang/protokoll",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "tester"
  },
  {
    "id": "WANG-23",
    "navn": "Resultater per elev",
    "kort": "Tester",
    "ikon": "ph-chart-line-up",
    "fil": "B8",
    "hash": "tester",
    "r": "tester",
    "sti": "/team-wang/elev/[id]/tester",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "tester"
  },
  {
    "id": "WANG-39",
    "navn": "Rangering",
    "kort": "Rangering",
    "ikon": "ph-ranking",
    "fil": "B14",
    "hash": "rangering",
    "r": "rangering",
    "sti": "/team-wang/coach/rangering",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "tester"
  },
  {
    "id": "WANG-10",
    "navn": "Turneringer",
    "kort": "Turneringer",
    "ikon": "ph-flag-pennant",
    "fil": "B4",
    "hash": "turneringer",
    "r": "turneringer",
    "sti": "/team-wang/turneringer",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "konkurranse"
  },
  {
    "id": "WANG-11",
    "navn": "Turneringsdetalj",
    "kort": "Detalj",
    "ikon": "ph-list-numbers",
    "fil": "B4",
    "hash": "turnering/nmj",
    "r": "turnering",
    "sti": "/team-wang/turnering/[id]",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "under": "WANG-10",
    "omraade": "konkurranse"
  },
  {
    "id": "WANG-09",
    "navn": "Samlinger og uttak",
    "kort": "Samlinger",
    "ikon": "ph-airplane-tilt",
    "fil": "B3",
    "hash": "samlinger",
    "r": "samlinger",
    "sti": "/team-wang/samlinger",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "konkurranse"
  },
  {
    "id": "WANG-27",
    "navn": "Golfstatistikk",
    "kort": "Statistikk",
    "ikon": "ph-chart-bar",
    "fil": "B9",
    "hash": "statistikk",
    "r": "statistikk",
    "sti": "/team-wang/statistikk",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50",
    "navn": "DataGolf",
    "kort": "DataGolf",
    "ikon": "ph-chart-bar",
    "hash": "oversikt",
    "r": "oversikt",
    "sti": "/team-wang/konkurranse/datagolf",
    "dg": "DG-01",
    "fane": "DataGolf",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.02",
    "navn": "Proffkatalog",
    "kort": "Proffkatalog",
    "ikon": "ph-chart-line",
    "hash": "katalog",
    "r": "katalog",
    "sti": "/team-wang/konkurranse/datagolf/katalog",
    "dg": "DG-02",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.03",
    "navn": "Proffprofil",
    "kort": "Proffprofil",
    "ikon": "ph-chart-line",
    "hash": "profil",
    "r": "profil",
    "sti": "/team-wang/konkurranse/datagolf/profil",
    "dg": "DG-03",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.04",
    "navn": "Topplister",
    "kort": "Topplister",
    "ikon": "ph-chart-line",
    "hash": "topp",
    "r": "topp",
    "sti": "/team-wang/konkurranse/datagolf/topp",
    "dg": "DG-04",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.05",
    "navn": "Elev mot proff",
    "kort": "Elev mot proff",
    "ikon": "ph-chart-line",
    "hash": "sammen",
    "r": "sammen",
    "sti": "/team-wang/konkurranse/datagolf/sammen",
    "dg": "DG-05",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.06",
    "navn": "Innspill-tak",
    "kort": "Innspill-tak",
    "ikon": "ph-chart-line",
    "hash": "innspill",
    "r": "innspill",
    "sti": "/team-wang/konkurranse/datagolf/innspill",
    "dg": "DG-06",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.07",
    "navn": "Fra funn til forslag",
    "kort": "Fra funn til forslag",
    "ikon": "ph-chart-line",
    "hash": "forslag",
    "r": "forslag",
    "sti": "/team-wang/konkurranse/datagolf/forslag",
    "dg": "DG-07",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.08",
    "navn": "Norske proffer",
    "kort": "Norske proffer",
    "ikon": "ph-chart-line",
    "hash": "norske",
    "r": "norske",
    "sti": "/team-wang/konkurranse/datagolf/norske",
    "dg": "DG-08",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.09",
    "navn": "Kilde og dekning",
    "kort": "Kilde og dekning",
    "ikon": "ph-chart-line",
    "hash": "kilde",
    "r": "kilde",
    "sti": "/team-wang/konkurranse/datagolf/kilde",
    "dg": "DG-09",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "id": "WANG-13",
    "navn": "Gruppeposter",
    "kort": "Poster",
    "ikon": "ph-megaphone-simple",
    "fil": "B5",
    "hash": "poster",
    "r": "poster",
    "sti": "/team-wang/gruppe/poster",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "meldinger"
  },
  {
    "id": "WANG-14",
    "navn": "Post til elev",
    "kort": "Post",
    "ikon": "ph-envelope-simple",
    "fil": "B5",
    "hash": "post",
    "r": "post",
    "sti": "/team-wang/post",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "meldinger"
  },
  {
    "id": "WANG-15",
    "navn": "Foreldremøte",
    "kort": "Møte",
    "ikon": "ph-users-four",
    "fil": "B5",
    "hash": "mote",
    "r": "mote",
    "sti": "/team-wang/foreldremote",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "meldinger"
  },
  {
    "id": "WANG-21",
    "navn": "Dokumenter",
    "kort": "Dokumenter",
    "ikon": "ph-folder-simple",
    "fil": "B7",
    "hash": "dokumenter",
    "r": "dokumenter",
    "sti": "/team-wang/dokumenter",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "meldinger"
  },
  {
    "id": "WANG-07",
    "navn": "Elever",
    "kort": "Elever",
    "ikon": "ph-address-book",
    "fil": "B18",
    "hash": "elever",
    "r": "elever",
    "sti": "/team-wang/elever",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "elever"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B18",
    "id": "WANG-44",
    "navn": "Elevprofil",
    "kort": "Profil",
    "ikon": "ph-user-circle",
    "hash": "profil/sofie",
    "r": "profil",
    "sti": "/team-wang/elev/[id]?fane=plan|stats|tester|iup|samtaler|turneringer",
    "under": "WANG-07",
    "omraade": "elever"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B18",
    "id": "WANG-45",
    "navn": "Fireukerssjekk",
    "kort": "Sjekk",
    "ikon": "ph-clipboard-text",
    "hash": "sjekk",
    "r": "sjekk",
    "sti": "/team-wang/fireukerssjekk",
    "omraade": "elever"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B18",
    "id": "WANG-46",
    "navn": "Forslag til elev",
    "kort": "Forslag",
    "ikon": "ph-paper-plane-tilt",
    "hash": "forslag",
    "r": "forslag",
    "sti": "/team-wang/forslag",
    "omraade": "elever"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B18",
    "id": "WANG-47",
    "navn": "Skjema og kildeversjoner",
    "kort": "Kilder",
    "ikon": "ph-books",
    "hash": "kilde",
    "r": "kilde",
    "sti": "/team-wang/kilder",
    "fane": "Kilder",
    "omraade": "elever"
  },
  {
    "id": "WG-05",
    "navn": "Trenerflate",
    "kort": "Trener",
    "ikon": "ph-users-three",
    "fil": "B1",
    "hash": "coach",
    "r": "coach",
    "sti": "/team-wang/coach",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "elever"
  },
  {
    "id": "WANG-05",
    "navn": "Skole og fravær",
    "kort": "Fravær",
    "ikon": "ph-graduation-cap",
    "fil": "B2",
    "hash": "fravaer",
    "r": "fravaer",
    "sti": "/team-wang/skole-fravaer",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "elever"
  },
  {
    "id": "WG-04",
    "navn": "Prøveplan",
    "kort": "Prøveplan",
    "ikon": "ph-exam",
    "fil": "B1",
    "hash": "prove",
    "r": "prove",
    "sti": "/team-wang/proveplan",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "elever"
  },
  {
    "id": "WANG-20",
    "navn": "Inviter elev",
    "kort": "Inviter",
    "ikon": "ph-user-plus",
    "fil": "B7",
    "hash": "inviter",
    "r": "inviter",
    "sti": "/team-wang/tilgang/inviter",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "elever"
  },
  {
    "id": "WANG-19",
    "navn": "Trenere og roller",
    "kort": "Trenere",
    "ikon": "ph-identification-badge",
    "fil": "B7",
    "hash": "trenere",
    "r": "trenere",
    "sti": "/team-wang/tilgang/trenere",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "admin"
  },
  {
    "id": "WANG-34",
    "navn": "Samtykkeoversikt",
    "kort": "Samtykke",
    "ikon": "ph-handshake",
    "fil": "B18",
    "hash": "samtykke",
    "r": "samtykke",
    "sti": "/team-wang/admin/samtykke",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "admin"
  },
  {
    "id": "WANG-26",
    "navn": "Timeplanføring",
    "kort": "Timeplan",
    "ikon": "ph-calendar-plus",
    "fil": "B9",
    "hash": "timeplan",
    "r": "timeplan",
    "sti": "/team-wang/skole/timeplan",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "admin"
  },
  {
    "id": "WANG-31",
    "navn": "Rekruttering",
    "kort": "Rekruttering",
    "ikon": "ph-magnifying-glass",
    "fil": "B12",
    "hash": "rekruttering",
    "r": "rekruttering",
    "sti": "/team-wang/rekruttering",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "admin"
  },
  {
    "id": "WANG-32",
    "navn": "Plasser",
    "kort": "Plasser",
    "ikon": "ph-chair",
    "fil": "B12",
    "hash": "plasser",
    "r": "plasser",
    "sti": "/team-wang/plasser",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "admin"
  },
  {
    "id": "WANG-33",
    "navn": "Koordinering mellom skoler",
    "kort": "Koordinering",
    "ikon": "ph-arrows-left-right",
    "fil": "B12",
    "hash": "koordinering",
    "r": "koordinering",
    "sti": "/team-wang/rekruttering/koordinering",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "admin"
  },
  {
    "id": "WANG-28",
    "navn": "Hjem",
    "kort": "Hjem",
    "ikon": "ph-house",
    "fil": "B10",
    "hash": "hjem",
    "r": "hjem",
    "sti": "/team-wang",
    "roller": [],
    "arkiv": true,
    "som": "sofie",
    "aapen": true,
    "omraade": "system"
  },
  {
    "id": "WANG-36",
    "navn": "Foresattflaten",
    "kort": "Foresatt",
    "ikon": "ph-users",
    "fil": "B13",
    "hash": "foresatt",
    "r": "foresatt",
    "sti": "/team-wang/foresatt",
    "roller": [],
    "arkiv": true,
    "som": "kari",
    "omraade": "system"
  },
  {
    "id": "WANG-25",
    "navn": "Skolefanen",
    "kort": "Skole",
    "ikon": "ph-student",
    "fil": "B9",
    "hash": "skole",
    "r": "skole",
    "sti": "/team-wang?fane=skole",
    "roller": [],
    "arkiv": true,
    "som": "sofie",
    "omraade": "system"
  },
  {
    "id": "WANG-35",
    "navn": "Helse og belastning",
    "kort": "Helse",
    "ikon": "ph-first-aid-kit",
    "fil": "B13",
    "hash": "helse",
    "r": "helse",
    "sti": "/team-wang/helse",
    "roller": [],
    "arkiv": true,
    "som": "silje",
    "omraade": "system"
  },
  {
    "id": "WANG-24",
    "navn": "Logg inn og tilstander",
    "kort": "Logg inn",
    "ikon": "ph-sign-in",
    "fil": "B8",
    "hash": "logg-inn",
    "r": "logg-inn",
    "sti": "/team-wang/logg-inn",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "system"
  },
  {
    "id": "WANG-00",
    "navn": "Skjermoversikt",
    "kort": "Oversikt",
    "ikon": "ph-list-bullets",
    "fil": "B0",
    "hash": "",
    "r": "",
    "sti": "/team-wang/skjermer",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "system"
  },
  {
    "id": "WANG-41",
    "navn": "Gjennomgang",
    "kort": "Gjennomgang",
    "ikon": "ph-chat-circle-text",
    "fil": "B16",
    "hash": "",
    "r": "gjennomgang",
    "sti": "/team-wang/gjennomgang",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "system"
  }
];
