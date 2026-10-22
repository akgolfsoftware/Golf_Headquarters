/** Prøvefil for AG-16 Gruppa (/admin/grupper/[id]). Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG16Gruppe } from "@/components/admin/precision/AG16Gruppe";
import type { GruppeDetaljV2Actions, GruppeDetaljV2Data, MedlemRad } from "@/lib/admin/grupper/typer";

export const sti = "/admin/grupper/g1";

const medlem = (i: number, navn: string, ekstra: Partial<MedlemRad> = {}): MedlemRad => ({
  id: `m${i}`, userId: `p${i}`, navn, avatarUrl: null, homeClub: "Testklubb", erHjelpetrener: false, erTrener: false, erPro: i % 2 === 0,
  schoolYear: i % 3 === 0 ? "VG2" : "VG1", hcp: 4 + i, runder90d: 3, planNavn: null, planAndel: 0, planDone: 0, planTotal: 0, ...ekstra,
});

const data: GruppeDetaljV2Data = {
  id: "g1", navn: "Testgruppe Utvikling med et ganske langt navn", type: "Klubb", antallMedlemmer: 6, antallHjelpetrenere: 1,
  snittHcp: "7,4", totalRunder: 18, proAndel: 50, antallSamlinger: 3, etterlevelsePct: 82, coachNavn: "Test Coach", coachEpost: "coach@eksempel.no",
  nesteSamling: { id: "s1", title: "Gruppetrening", startAt: "2026-10-29T15:00:00Z", location: "Bossum", recurring: "WEEKLY", maxParticipants: 12, description: "Nærspill og putting." },
  kommendeSamlinger: [
    { id: "s1", title: "Gruppetrening", startAt: "2026-10-29T15:00:00Z", location: "Bossum", recurring: "WEEKLY", maxParticipants: 12 },
    { id: "s2", title: "Heldagssamling med et langt navn som må brytes", startAt: "2026-11-07T08:00:00Z", location: null, recurring: null, maxParticipants: null },
  ],
  medlemmer: [
    medlem(0, "Test Coach", { erTrener: true, hcp: null, schoolYear: null }),
    medlem(1, "Henrik Aas"), medlem(2, "Emma Berg"), medlem(3, "Mats Lie med et langt etternavn"), medlem(4, "Ida Strand"),
    medlem(5, "Assist Test", { erHjelpetrener: true }),
  ],
  trinnValg: ["VG1", "VG2"], aktivtTrinn: null, kandidater: [], trenerKandidater: [],
};
const tomData: GruppeDetaljV2Data = { ...data, antallMedlemmer: 0, antallHjelpetrenere: 0, snittHcp: "—", totalRunder: 0, etterlevelsePct: null, nesteSamling: null, kommendeSamlinger: [], medlemmer: [], trinnValg: [] };

const K = ({ t }: { t: string }) => <button type="button" className="knapp sek">{t}</button>;
const actions: GruppeDetaljV2Actions = {
  StartOktButton: () => <K t="Start økt" />,
  LeggTilSpillerButton: () => <K t="Legg til spiller" />,
  FjernMedlemButton: () => <button type="button" className="knapp spok">Fjern</button>,
  SeAlleTimePlanButton: () => <K t="Se alle" />,
  DetaljerButton: () => <K t="Detaljer" />,
  AapneButton: () => <K t="Åpne" />,
  SlettGruppeButton: () => <button type="button" className="knapp spok">Slett gruppa</button>,
};

const Vis = (d: GruppeDetaljV2Data) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach"><AG16Gruppe data={d} actions={actions} /></AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = { data: Vis(data), tom: Vis(tomData) };
