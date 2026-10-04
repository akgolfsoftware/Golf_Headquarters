/** Prøvefil for PH-IUP-01 Fireukerssjekk. Bare syntetiske data. */
import { CloudOff, RotateCw } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, Knapp, LasterTilstand } from "@/components/precision/pa";
import { PHIUP01Fireukerssjekk } from "@/components/portal/precision/PHIUP01Fireukerssjekk";
import { fireukerOmraader, fireukerRunde } from "@/lib/iup/fireukerssjekk";
import type { FireukerData } from "@/lib/iup/fireukerssjekk-data";

export const sti = "/portal/iup/fireukerssjekk";

const runde = fireukerRunde("2026-09-23");
const forrigeRunde = fireukerRunde("2026-09-23", -1);
const prosessmal = [
  { id: "syn-pm-1", tittel: "Rutine før hvert slag på banen, under 20 sekunder" },
  { id: "syn-pm-2", tittel: "Registrer dagsform hver morgen før skolen" },
  { id: "syn-pm-3", tittel: "Putting 3–6 fot · 15 min tre dager i uka" },
];
const svarFor = (niva: "UNG" | "JUNIOR", f: (i: number) => number, andel = 1) => {
  const alle = fireukerOmraader(niva).flatMap((o) => o.sporsmal);
  return Object.fromEntries(alle.slice(0, Math.round(alle.length * andel)).map((s, i) => [s.id, f(i)]));
};
const forrigeSvar = svarFor("JUNIOR", (i) => 2 + (i % 3));

const base = (niva: "UNG" | "JUNIOR", over: Partial<FireukerData> = {}): FireukerData => ({
  runde, niva, prosessmal, revisjon: 0, lagret: null,
  forrige: niva === "JUNIOR" ? { runde: forrigeRunde, besvarelse: { versjon: "iup-2027", niva, status: "LEVERT", svar: forrigeSvar, prosessmal: { "syn-pm-1": "JA", "syn-pm-2": "DELVIS", "syn-pm-3": "NEI" } } } : null,
  historikk: [
    { ukeFra: forrigeRunde.ukeFra, ukeTil: forrigeRunde.ukeTil, versjon: "iup-2027", levert: "2026-08-30" },
    { ukeFra: 10, ukeTil: 13, versjon: "iup-2025", levert: "2025-03-30" },
  ],
  serSvarene: "Anders, WANG og Team Norway ser svarene",
  ...over,
});

const delvis = base("JUNIOR", { revisjon: 4, lagret: { levert: null, besvarelse: { versjon: "iup-2027", niva: "JUNIOR", status: "UTKAST", svar: svarFor("JUNIOR", (i) => 3 + (i % 2), 0.3), prosessmal: { "syn-pm-1": "JA" } } } });
const levert = base("JUNIOR", { revisjon: 9, lagret: { levert: "2026-09-26", besvarelse: { versjon: "iup-2027", niva: "JUNIOR", status: "LEVERT", svar: svarFor("JUNIOR", (i) => Math.min(5, 3 + (i % 3))), prosessmal: { "syn-pm-1": "JA", "syn-pm-2": "JA", "syn-pm-3": "DELVIS" } } } });

/** Legger en ikke-sendt lagring i køen på enheten før skjermen vises (lagringsfeil). */
function MedKo({ data }: { data: FireukerData }) {
  try {
    localStorage.setItem(`iup27-fireuker-ko:${data.runde.periodeStart}:${data.niva}`, JSON.stringify({
      type: "UTVIKLINGSSJEKK", periodeStart: data.runde.periodeStart, periodeSlutt: data.runde.periodeSlutt,
      forventetRevisjon: data.revisjon, requestId: "00000000-0000-4000-8000-000000000001",
      besvarelse: { versjon: "iup-2027", niva: data.niva, status: "UTKAST", svar: svarFor(data.niva, () => 4, 0.2), prosessmal: { "syn-pm-1": "DELVIS" } },
    }));
  } catch { /* ingen lagring i prøven */ }
  return <PHIUP01Fireukerssjekk data={data} uleste={0} />;
}

const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}><div className="pa-side">{children}</div></PlayerHQSkall>;

export const tilstander = {
  data: <PHIUP01Fireukerssjekk data={delvis} uleste={0} />,
  omrade: <PHIUP01Fireukerssjekk data={delvis} uleste={0} startSteg={3} />,
  lever: <PHIUP01Fireukerssjekk data={delvis} uleste={0} startSteg={8} />,
  tom: <PHIUP01Fireukerssjekk data={base("JUNIOR", { forrige: null, historikk: [] })} uleste={0} />,
  ung: <PHIUP01Fireukerssjekk data={base("UNG")} uleste={0} />,
  ko: <MedKo data={base("JUNIOR", { revisjon: 2 })} />,
  levert: <PHIUP01Fireukerssjekk data={levert} uleste={0} />,
  laster: <Skall><LasterTilstand text="Henter fireukerssjekken …" /></Skall>,
  feil: <Skall><FeilTilstand icon={CloudOff} title="Fireukerssjekken kunne ikke hentes" text="Ingen svar er endret. Prøv igjen." code="FEIL 503 · IUP · 04.10.2026" retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw">Prøv igjen</Knapp>} /></Skall>,
};
