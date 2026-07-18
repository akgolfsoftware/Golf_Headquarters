"use client";

/**
 * Klient-wrapper som kobler «Ny oppgave»/«Legg til oppgave»-knappene til
 * OppgaveModal og createTask-actionen.
 *
 * Ansvar (uendret datalogikk):
 *   1. Holde modal-åpen/lukket-state.
 *   2. Bygge en tom OppgaveDraft for en gitt P-posisjon.
 *   3. Mappe OppgaveDraft → TaskInput (løser felt-mismatchen: m→miljo, pr→prPress,
 *      omraadeTab er UI-only og droppes, tm/hit-rate-mål renses for tomme felter).
 *   4. Kalle createTask og refreshe ruten ved suksess.
 *
 * v2 (2026-07-18): trigger-knappen bruker v2-Knapp — modalen og all logikk er som før.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import { Knapp } from "@/components/v2";
import {
  OppgaveModal,
  type OppgaveDraft,
  type TmGoalDraft,
  type HitRateGoalDraft,
} from "@/components/teknisk-plan/oppgave-modal";
import { SG_BUCKETS } from "@/components/teknisk-plan/constants";
import { createTask, type TaskInput } from "../actions";

/** En P-posisjon kan velges som mål for ny oppgave. */
export interface PositionTarget {
  pNummer: string;
  pName: string;
}

/** Tom draft for en ny oppgave i gitt posisjon (samme defaults som modalens UI). */
function emptyDraft(target: PositionTarget): OppgaveDraft {
  const omraadeTab = "Tee" as keyof typeof SG_BUCKETS;
  return {
    pNummer: target.pNummer,
    pName: target.pName,
    tittel: "",
    beskrivelse: "",
    pyramide: "TEK",
    omraadeTab,
    omraade: SG_BUCKETS[omraadeTab][0],
    koller: [],
    repsMaalDry: 0,
    repsMaalLav: 0,
    repsMaalFull: 0,
    tmGoals: [],
    hitRateGoals: [],
    drillIds: [],
  };
}

/** TM-mål: dropp rader uten tallfestet baseline/mål, ellers coerce "" → tall. */
function mapTmGoals(drafts: TmGoalDraft[]): TaskInput["tmGoals"] {
  const mapped = drafts
    .filter((g) => g.baselineValue !== "" && g.targetValue !== "")
    .map((g) => ({
      metric: g.metric,
      klubb: g.klubb,
      baselineValue: Number(g.baselineValue),
      targetValue: Number(g.targetValue),
      targetType: g.targetType,
      comparison: g.comparison,
    }));
  return mapped.length ? mapped : undefined;
}

/** Hit-rate-mål: dropp rader med uutfylte tall, ellers coerce "" → tall. */
function mapHitRateGoals(drafts: HitRateGoalDraft[]): TaskInput["hitRateGoals"] {
  const mapped = drafts
    .filter(
      (g) =>
        g.requiredHits !== "" &&
        g.windowSize !== "" &&
        g.corridorMin !== "" &&
        g.corridorMax !== "",
    )
    .map((g) => ({
      metric: g.metric,
      klubb: g.klubb,
      protocol: g.protocol,
      windowSize: Number(g.windowSize),
      requiredHits: Number(g.requiredHits),
      corridorMin: Number(g.corridorMin),
      corridorMax: Number(g.corridorMax),
    }));
  return mapped.length ? mapped : undefined;
}

/** OppgaveDraft → TaskInput. Løser felt-mismatchen mellom modal og action. */
function draftToTaskInput(planId: string, draft: OppgaveDraft): TaskInput {
  return {
    planId,
    pNummer: draft.pNummer,
    pName: draft.pName,
    tittel: draft.tittel,
    beskrivelse: draft.beskrivelse || undefined,
    pyramide: draft.pyramide,
    // omraadeTab er kun UI-state for sub-fane-valg — sendes ikke videre.
    omraade: draft.omraade,
    koller: draft.koller,
    lFase: draft.lFase ?? null,
    cs: draft.cs ?? null,
    miljo: draft.m ?? null, // m → miljo
    prPress: draft.pr ?? null, // pr → prPress
    repsMaalDry: draft.repsMaalDry,
    repsMaalLav: draft.repsMaalLav,
    repsMaalFull: draft.repsMaalFull,
    tmGoals: mapTmGoals(draft.tmGoals),
    hitRateGoals: mapHitRateGoals(draft.hitRateGoals),
  };
}

interface OppgaveLauncherProps {
  planId: string;
  /** Posisjon som ny oppgave legges til i når knappen trykkes. */
  target: PositionTarget;
  /** Knapp-utseende — primær (lime) eller stiplet ghost for tom posisjon. */
  variant: "primary" | "ghost-dashed";
  /** Knapp-tekst. */
  label: string;
}

export function OppgaveLauncher({ planId, target, variant, label }: OppgaveLauncherProps) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  // OppgaveModal initialiserer draft-state kun ved mount. Bump nøkkelen hver
  // gang vi åpner så modalen remounter med en fersk, tom draft.
  const [openSeq, setOpenSeq] = useState(0);

  function openModal() {
    setOpenSeq((n) => n + 1);
    setOpen(true);
  }

  async function handleSubmit(draft: OppgaveDraft) {
    if (!draft.tittel.trim()) {
      toast.error("Oppgaven trenger en tittel.");
      return;
    }
    try {
      await createTask(draftToTaskInput(planId, draft));
      setOpen(false);
      toast.success("Oppgave lagt til.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke lagre oppgaven.");
    }
  }

  return (
    <>
      {variant === "primary" ? (
        <Knapp icon="plus" onClick={openModal}>
          {label}
        </Knapp>
      ) : (
        <Knapp icon="plus" ghost full onClick={openModal} style={{ borderStyle: "dashed" }}>
          {label}
        </Knapp>
      )}

      <OppgaveModal
        key={openSeq}
        open={open}
        onClose={() => setOpen(false)}
        initial={emptyDraft(target)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
