/** Prøvefil for TN-19 Trenere og tilgang i retning «Skrå» (pakke 6). Syntetiske data. */
import { TnTilgangVisning, type TnTilgangVisningsrad } from "@/components/team-norway/tn-tilgang-visning";

export const sti = "/team-norway/tilgang";

const d = (a: number, m: number, dag: number) => new Date(Date.UTC(a, m - 1, dag));
const rader: TnTilgangVisningsrad[] = [
  { userId: "u1", navn: "Sportssjef", epost: "sportssjef@eksempel.no", rolle: "COACH", joinedAt: d(2025, 1, 1), endedAt: null, status: "AKTIV" },
  { userId: "u2", navn: "Trener 1", epost: "trener1@eksempel.no", rolle: "COACH", joinedAt: d(2025, 8, 1), endedAt: null, status: "AKTIV" },
  { userId: "u3", navn: "Trener 2", epost: "trener2@eksempel.no", rolle: "ASSISTANT", joinedAt: d(2026, 3, 1), endedAt: null, status: "AKTIV" },
  { userId: "u4", navn: "Trener 3", epost: "trener3@eksempel.no", rolle: "ASSISTANT", joinedAt: d(2024, 1, 1), endedAt: d(2026, 6, 30), status: "UTLØPT" },
];

const leggTil = async () => ({ ok: true as const });

export const tilstander = {
  liste: <TnTilgangVisning brukerNavn="Sportssjef" gruppeId="g1" gruppeNavn="Landslag junior" rader={rader} egenId="u1" leggTil={leggTil as never} />,
};
