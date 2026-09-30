/** Prøvefil for AG-16a Gruppedetalj og faste tider. Syntetiske data, ingen ekte spillere. */
import { UsersRound } from "lucide-react";
import { AG16Gruppedetalj, AG16Timeplan } from "@/components/admin/precision/AG16Gruppe";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, LasterTilstand } from "@/components/precision/pa";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { Natt } from "./_natt";
import type { GruppeDetaljV2Data } from "@/components/admin/v2/GruppeDetaljV2";
import type { GruppeTimeplanV2Data } from "@/components/admin/v2/GruppeTimeplanV2";

export const sti = "/admin/grupper/g1";

const medlem = (i: number, navn: string, over: Partial<GruppeDetaljV2Data["medlemmer"][number]> = {}): GruppeDetaljV2Data["medlemmer"][number] => ({
  id: `m${i}`, userId: `u${i}`, navn, avatarUrl: null, homeClub: "Testklubb", erHjelpetrener: false, erTrener: false, erPro: false,
  schoolYear: i % 2 ? "VG1" : "VG2", hcp: 10 + i, runder90d: i, planNavn: "Vinterplan", planAndel: 40 + i, planDone: 4, planTotal: 10, ...over,
});

const samling = (i: number, tittel: string) => ({ id: `s${i}`, title: tittel, startAt: `2026-10-0${i}T14:00:00.000Z`, location: "Range", recurring: null, maxParticipants: 12 });

const data: GruppeDetaljV2Data = {
  id: "g1", navn: "Testgruppe Mini U10", type: "Klubb", antallMedlemmer: 4, antallHjelpetrenere: 1, snittHcp: "12,5", totalRunder: 9, proAndel: 25, antallSamlinger: 3,
  coachNavn: "Test Coach", coachEpost: "test.coach@eksempel.no",
  nesteSamling: { ...samling(1, "Gruppetrening"), description: null },
  kommendeSamlinger: [samling(1, "Gruppetrening"), samling(2, "Banespill med et langt navn som må brytes pent"), samling(3, "Fellessamling")],
  medlemmer: [
    medlem(1, "Ola Testesen"),
    medlem(2, "Kari Testdatter med et svært langt navn som må brytes", { homeClub: "Testklubb med et svært langt navn som ikke får sprenge raden", hcp: null, planNavn: null }),
    medlem(3, "Per Testmann", { erHjelpetrener: true }),
    medlem(4, "Test Coach To", { erTrener: true }),
  ],
  trinnValg: ["VG1", "VG2"], aktivtTrinn: null,
  kandidater: [{ id: "k1", name: "Ny Testspiller", hcp: 14.2, homeClub: "Testklubb" }],
  trenerKandidater: [{ id: "t1", name: "Ny Testcoach", hcp: null, homeClub: null }],
};
const maler = [{ id: "p1", name: "Vinterplan Mini", varighetUker: 8, sessionCount: 16 }];

const rad = (i: number, tittel: string, recurring: string | null, start: string, slutt: string) => ({ id: `r${i}`, title: tittel, description: null, startAt: start, endAt: slutt, location: "Range", recurring, maxParticipants: 12 });
const tp: GruppeTimeplanV2Data = {
  groupId: "g1", navn: "Testgruppe Mini U10", totaltAntall: 5,
  faste: [rad(1, "Gruppetrening", "WEEKLY", "2026-10-01T14:00:00.000Z", "2026-10-01T15:00:00.000Z"), rad(2, "Spill 9 hull med et langt navn som må brytes pent på smal skjerm", "WEEKLY", "2026-10-04T08:00:00.000Z", "2026-10-04T10:00:00.000Z")],
  kommende: [rad(3, "Fellessamling", null, "2026-10-10T07:00:00.000Z", "2026-10-10T09:00:00.000Z")],
  tidligere: [rad(4, "Gruppetrening", null, "2026-09-24T14:00:00.000Z", "2026-09-24T15:00:00.000Z")],
  focusId: null,
};

const medRolle = (n: React.ReactNode) => <AdminRolleProvider erAdmin>{n}</AdminRolleProvider>;

const grunn: Record<string, React.ReactNode> = {
  data: medRolle(<AG16Gruppedetalj navn="Test Coach" data={data} maler={maler} antallFaste={2} kanSlette />),
  tom: medRolle(<AG16Gruppedetalj navn="Test Coach" data={{ ...data, antallMedlemmer: 0, antallHjelpetrenere: 0, medlemmer: [], trinnValg: [], nesteSamling: null, kommendeSamlinger: [], antallSamlinger: 0, snittHcp: "—", totalRunder: 0, proAndel: 0, coachNavn: null, coachEpost: null }} maler={[]} antallFaste={0} kanSlette />),
  // Tegningens laster-tilstand. Runtime bruker den generiske V2Laster i grupper/loading.tsx (ren serverkomponent, CSP-regelen) — avvik meldt i PR.
  laster: medRolle(<AgencyOSSkall navn="Test Coach"><div className="pa-side"><LasterTilstand text="Henter gruppen …" /></div></AgencyOSSkall>),
  feil: medRolle(<AgencyOSSkall navn="Test Coach"><div className="pa-side"><FeilTilstand icon={UsersRound} title="Gruppen kunne ikke hentes" text="Ingen medlemskap er endret. Prøv igjen." code="FEIL 503" /></div></AgencyOSSkall>),
  timeplan: medRolle(<AG16Timeplan navn="Test Coach" data={tp} />),
  "timeplan-fokus": medRolle(<AG16Timeplan navn="Test Coach" data={{ ...tp, focusId: "r3" }} />),
  "timeplan-tom": medRolle(<AG16Timeplan navn="Test Coach" data={{ ...tp, totaltAntall: 0, faste: [], kommende: [], tidligere: [] }} />),
  "timeplan-feil": medRolle(<AgencyOSSkall navn="Test Coach"><div className="pa-side"><FeilTilstand icon={UsersRound} title="Timeplanen kunne ikke hentes" text="Ingen tider er endret. Prøv igjen." code="FEIL 503" /></div></AgencyOSSkall>),
};

/** Nattvariant av hver tilstand (tegningen er målt i natt for alle tilstander). */
const nattVarianter = Object.fromEntries(Object.entries(grunn).map(([k, v]) => [`${k}-natt`, <Natt key={k}>{v}</Natt>]));

export const tilstander = { ...grunn, ...nattVarianter };

export const natt = Object.keys(nattVarianter);
