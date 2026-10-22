/** Prøvefil for Min profil (trenerprofilen) i retning «Skrå». Syntetiske data. */
import { TnTrenerprofilVisning } from "@/components/team-norway/skjermer/tn-trenerprofil-visning";
import type { TnTrenerprofil } from "@/lib/domain/tn-trenerprofil";

export const sti = "/team-norway/profil";

const kontekst = { gruppe: { id: "g1", name: "Team Norway Golf" }, rolle: "COACH", erSpiller: false, kanAdministrere: false };
const dato = (m: number, d: number) => new Date(Date.UTC(2026, m, d, 10));
const full: TnTrenerprofil = {
  kontekst,
  navn: "Trener Eksempel-Langnavnsen",
  epost: "trener.eksempel-langnavnsen@golfforbundet.no",
  telefon: "900 00 000",
  gruppeRolle: "COACH",
  medlemSiden: new Date(Date.UTC(2025, 2, 1)),
  spillereIGruppa: 14,
  delte: ["Spiller A", "Spiller B", "Spiller C", "Spiller D med et langt dobbelt etternavn"].map((navn, i) => ({ id: `s${i}`, navn })),
  forslag: [
    { id: "f1", spillerNavn: "Spiller A", status: "Venter på spilleren", opprettet: dato(9, 20) },
    { id: "f2", spillerNavn: "Spiller B", status: "Godtatt", opprettet: dato(9, 14) },
    { id: "f3", spillerNavn: "Spiller C", status: "Avvist", opprettet: dato(9, 2) },
  ],
};
const tom: TnTrenerprofil = { ...full, telefon: null, delte: [], forslag: [], medlemSiden: null, gruppeRolle: null };

export const tilstander = {
  full: <TnTrenerprofilVisning brukerNavn="Trener Eksempel-Langnavnsen" erAdmin={false} visDataGolf={false} p={full} />,
  tom: <TnTrenerprofilVisning brukerNavn="Admin" erAdmin visDataGolf p={tom} />,
};
