/** Prøvefil for AG-A03 Gruppeanalyse (Stall › Grupper › Stats) og Etterlevelse. Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AGA03Analyse, type AGA03Props } from "@/components/admin/precision/AGA03Analyse";
import type { GruppeAnalyseData } from "@/lib/admin/analyse/gruppe-analyse";
import { Natt } from "./_natt";
import Loading from "@/app/admin/analyse/loading";
import Feil from "@/app/admin/analyse/error";

export const sti = "/admin/analyse";
export const natt = ["natt"];

const analyse: GruppeAnalyseData = {
  uker: 4,
  grupper: [
    { id: "g1", navn: "Testgruppe Mini U10", kategori: "A2", antallSpillere: 8, medPlan: 7, datadekningPct: 88, etterlevelsePct: 92, gjennomfortMin: 1380, planlagtMin: 1500 },
    { id: "g2", navn: "Testgruppe Basis U13 med et langt navn som må brytes pent", kategori: "A3", antallSpillere: 6, medPlan: 3, datadekningPct: 50, etterlevelsePct: 61, gjennomfortMin: 610, planlagtMin: 1000 },
    { id: "g3", navn: "Testgruppe uten forfalte økter", kategori: null, antallSpillere: 4, medPlan: 0, datadekningPct: 0, etterlevelsePct: null, gjennomfortMin: 0, planlagtMin: 0 },
  ],
  spillere: [
    { id: "s1", navn: "Test Spiller A med et navn som er langt nok til å teste brekk", etterlevelsePct: 84, gjennomfortMin: 420, planlagtMin: 500 },
    { id: "s2", navn: "Test Spiller B", etterlevelsePct: null, gjennomfortMin: 0, planlagtMin: 0 },
  ],
  samlet: { antallSpillere: 18, etterlevelsePct: 78 },
};
const hub: AGA03Props["hub"] = {
  nSpillere: 18, periodeLabel: "siste 8 uker", sgSnitt: "−0,42", okterDenneUken: 31, udekket: 4, trackmanOkter: 12,
  kategorier: [
    { key: "tee", label: "Tee", verdi: "+0,10", pct: 12, negativ: false },
    { key: "innspill", label: "Innspill", verdi: "−0,38", pct: 47, negativ: true },
    { key: "rundt", label: "Rundt", verdi: "−0,05", pct: 6, negativ: true },
    { key: "putt", label: "Putt", verdi: "−0,09", pct: 11, negativ: true },
  ],
  harKategoriData: true,
  lekkasjeTekst: "Lekkasje i stallen: Innspill er stallens svakeste kategori.",
};
const tomAnalyse: GruppeAnalyseData = { uker: 4, grupper: [], spillere: [], samlet: { antallSpillere: 0, etterlevelsePct: null } };

const Vis = (p: Partial<AGA03Props>) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">
      <AGA03Analyse tilstand="data" fane="stall" hub={hub} analyse={analyse} {...p} />
    </AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: Vis({}),
  etterlevelse: Vis({ fane: "etterlevelse" }),
  tom: Vis({ tilstand: "tom", hub: null, analyse: tomAnalyse }),
  laster: <AdminRolleProvider erAdmin><Loading /></AdminRolleProvider>,
  feil: <AdminRolleProvider erAdmin><Feil error={Object.assign(new Error("prøve"), { digest: "prove-503" })} reset={() => {}} /></AdminRolleProvider>,
  natt: <Natt>{Vis({ fane: "etterlevelse" })}</Natt>,
};


/* Tillatt-liste: bare den forventede feilloggen fra error.tsx i feil-tilstanden ("[v2/error]")
   holdes utenfor konsollmålingen. Alle andre konsollfeil slipper gjennom og feiler målingen. */
if (typeof location !== "undefined" && new URLSearchParams(location.search).get("t") === "feil") {
  const opprinnelig = console.error.bind(console);
  console.error = (...args: unknown[]) => { if (args[0] === "[v2/error]") return; opprinnelig(...args); };
}
