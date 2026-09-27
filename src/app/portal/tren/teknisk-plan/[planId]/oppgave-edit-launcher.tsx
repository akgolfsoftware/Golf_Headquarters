"use client";

/**
 * Klient-wrapper som gjør en spillers egen oppgave klikkbar for redigering
 * (samme edit-flyt som coachens DrillsPanel: OppgaveModal i edit-modus med
 * Logg reps / bilde-video-opplasting / kategori-felt).
 *
 * v2 (2026-07-18): visningen er v2-oppgavekortet (TekniskTaskKort). All logikk —
 * updateTaskBasics / logReps / uploadTaskMedia — er uendret.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import { TekniskTaskKort, type TekniskTaskKortProps } from "@/components/portal/v2/TekniskPlanV2";
import { OppgaveModal, type OppgaveDraft } from "@/components/teknisk-plan/oppgave-modal";
import { updateTaskBasics, logReps, startLiveSessionForTask } from "../actions";
import { uploadTaskMedia } from "@/lib/storage/task-media";
import { skalerBilde, MAKS_ACTION_BYTES } from "@/lib/klient/skaler-avatar";

function draftToBasicsPatch(draft: OppgaveDraft) {
  return {
    pNummer: draft.pNummer,
    pName: draft.pName,
    tittel: draft.tittel,
    beskrivelse: draft.beskrivelse || undefined,
    bildeUrl: draft.bildeUrl,
    videoUrl: draft.videoUrl,
    pyramide: draft.pyramide,
    omraade: draft.omraade,
    koller: draft.koller,
    motorikk: draft.motorikk ?? null,
    belastning: draft.belastning ?? null,
    press: draft.press ?? null,
    dimensjon: draft.dimensjon ?? null,
    maaleutstyr: draft.maaleutstyr ?? null,
    kategori: draft.kategori ?? null,
    repsMaalDry: draft.repsMaalDry,
    repsMaalLav: draft.repsMaalLav,
    repsMaalFull: draft.repsMaalFull,
  };
}

interface OppgaveEditLauncherProps {
  taskId: string;
  draft: OppgaveDraft;
  cardProps: Omit<TekniskTaskKortProps, "onClick">;
}

export function OppgaveEditLauncher({ taskId, draft, cardProps }: OppgaveEditLauncherProps) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [openSeq, setOpenSeq] = useState(0);
  const [startingOkt, setStartingOkt] = useState(false);

  function openEdit() {
    setOpenSeq((n) => n + 1);
    setOpen(true);
  }

  async function handleStartOkt() {
    setStartingOkt(true);
    try {
      const res = await startLiveSessionForTask(taskId);
      if (res.ok && res.url) {
        toast.success("Starter live-økt på oppgaven …");
        router.push(res.url);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke starte økt.");
      setStartingOkt(false);
    }
  }

  async function handleSubmit(next: OppgaveDraft) {
    if (!next.tittel.trim()) {
      toast.error("Oppgaven trenger en tittel.");
      return;
    }
    try {
      await updateTaskBasics(taskId, draftToBasicsPatch(next));
      toast.success("Oppgave oppdatert.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kunne ikke lagre oppgaven.");
    }
  }

  return (
    <>
      <TekniskTaskKort
        {...cardProps}
        onClick={openEdit}
        onStartOkt={handleStartOkt}
        isStartingOkt={startingOkt}
      />
      {open && (
        <OppgaveModal
          key={openSeq}
          open={open}
          onClose={() => setOpen(false)}
          initial={{ ...draft, id: taskId }}
          isEditing
          onSubmit={handleSubmit}
          onLogReps={(reps) => logReps(taskId, reps).then(() => router.refresh())}
          onUploadMedia={async (file, kind) => {
            // Server action-grensen (4 MB) avviser store filer FØR uploadTaskMedia
            // kjører: bilder nedskaleres på klienten, video sjekkes med ærlig feil.
            const sendes = kind === "bilde" ? await skalerBilde(file, 1600) : file;
            if (sendes.size > MAKS_ACTION_BYTES) {
              throw new Error("Fila er for stor (maks ~3,5 MB). Full videostøtte for større filer kommer.");
            }
            const fd = new FormData();
            fd.append("file", sendes);
            const res = await uploadTaskMedia(taskId, fd, kind);
            if (!res.ok) throw new Error(res.error);
            router.refresh();
            return res.url;
          }}
        />
      )}
    </>
  );
}
