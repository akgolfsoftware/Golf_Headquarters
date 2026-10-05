"use client";

/**
 * Kilde: AK Golf Precision Athletics PH-11 (Workbench for spiller).
 * Spillerens arbeidsflate for treningsplanlegging (år, periode, måned, uke, økt, volum, mål).
 * Monterer AG11Workbench med role="player" og routeSurface="player" i PlayerHQSkall.
 * Ingen hex-farger (kun CSS-variabler), 44-52px berøringsflater, full responsivitet (mobil 390px og desktop).
 */

import React from "react";
import { AG11Workbench, type AG11Niva, type AG11Side } from "@/components/admin/precision/AG11Workbench";
import type { WeekViewModel, SourceItem, PlanningGoalSummary } from "@/lib/domain/workbench/types";
import type { WorkbenchFysTurneringData } from "@/lib/workbench/fys-turnering-data";
import type { PlanReferanse } from "@/lib/workbench/plan-kontekst";

export interface PH11WorkbenchProps {
  playerId: string;
  spillerNavn: string;
  uke: WeekViewModel;
  kilder?: SourceItem[];
  goals?: PlanningGoalSummary[];
  fys: WorkbenchFysTurneringData;
  niva?: AG11Niva;
  side?: AG11Side;
  valgtOktId?: string;
  planKontekst?: PlanReferanse;
}

export function PH11Workbench({
  playerId,
  spillerNavn,
  uke,
  kilder = [],
  goals = [],
  fys,
  niva = "uke",
  side,
  valgtOktId,
  planKontekst,
}: PH11WorkbenchProps) {
  return (
    <AG11Workbench
      playerId={playerId}
      spillerNavn={spillerNavn}
      uke={uke}
      kilder={kilder}
      roster={[]}
      grupper={[]}
      goals={goals}
      fys={fys}
      niva={niva}
      side={side}
      valgtOktId={valgtOktId}
      routeSurface="player"
      role="player"
      planKontekst={planKontekst}
    />
  );
}
