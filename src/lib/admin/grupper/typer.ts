/**
 * Datakontraktene for Grupper (AG-16) og Gruppa. Flyttet hit fra
 * components/admin/v2/GrupperV2 og GruppeDetaljV2 19.10.2026, så sidene i nytt
 * design ikke importerer fra det gamle designet.
 */
import type React from "react";

export interface FastTid {
  id: string;
  dag: string;
  tid: string;
  tittel: string;
  sted: string | null;
}
export interface GruppeV2 {
  id: string;
  navn: string;
  antallMedlemmer: number;
  nesteOkt: string | null;
  faste: FastTid[];
}
export interface GrupperData {
  grupper: GruppeV2[];
}

export type SamlingRad = {
  id: string;
  title: string;
  startAt: string;
  location: string | null;
  recurring: string | null;
  maxParticipants: number | null;
};

export type MedlemRad = {
  id: string;
  userId: string;
  navn: string;
  avatarUrl: string | null;
  homeClub: string | null;
  erHjelpetrener: boolean;
  erTrener: boolean;
  erPro: boolean;
  schoolYear: string | null;
  hcp: number | null;
  runder90d: number;
  planNavn: string | null;
  planAndel: number;
  planDone: number;
  planTotal: number;
};

export type GruppeDetaljV2Data = {
  id: string;
  navn: string;
  type: string;
  antallMedlemmer: number;
  antallHjelpetrenere: number;
  snittHcp: string;
  totalRunder: number;
  proAndel: number;
  antallSamlinger: number;
  coachNavn: string | null;
  coachEpost: string | null;
  nesteSamling: (SamlingRad & { description: string | null }) | null;
  kommendeSamlinger: SamlingRad[];
  medlemmer: MedlemRad[];
  trinnValg: string[];
  aktivtTrinn: string | null;
  kandidater: { id: string; name: string; hcp: number | null; homeClub: string | null }[];
  trenerKandidater: { id: string; name: string; hcp: number | null; homeClub: string | null }[];
};

export type GruppeDetaljV2Actions = {
  StartOktButton: React.ComponentType;
  LeggTilSpillerButton: React.ComponentType<{
    groupId: string;
    kandidater: { id: string; name: string; hcp: number | null; homeClub: string | null }[];
    trenerKandidater: { id: string; name: string; hcp: number | null; homeClub: string | null }[];
  }>;
  FjernMedlemButton: React.ComponentType<{ groupId: string; userId: string; navn: string }>;
  SeAlleTimePlanButton: React.ComponentType<{ groupId: string }>;
  DetaljerButton: React.ComponentType<{ groupId: string; scheduleId: string }>;
  AapneButton: React.ComponentType<{ groupId: string; scheduleId: string }>;
  SlettGruppeButton: React.ComponentType<{
    groupId: string;
    navn: string;
    antallMedlemmer: number;
    antallSamlinger: number;
  }>;
};
