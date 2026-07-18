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
import { updateTaskBasics, logReps } from "../actions";
import { uploadTaskMedia } from "@/lib/storage/task-media";

function draftToBasicsPatch(draft: OppgaveDraft) {
  return {
    tittel: draft.tittel,
    beskrivelse: draft.beskrivelse || undefined,
    pyramide: draft.pyramide,
    omraade: draft.omraade,
    koller: draft.koller,
    lFase: draft.lFase ?? null,
    cs: draft.cs ?? null,
    miljo: draft.m ?? null,
    prPress: draft.pr ?? null,
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

  function openEdit() {
    setOpenSeq((n) => n + 1);
    setOpen(true);
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
      <TekniskTaskKort {...cardProps} onClick={openEdit} />
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
            const fd = new FormData();
            fd.append("file", file);
            const res = await uploadTaskMedia(taskId, fd, kind);
            router.refresh();
            return res.url;
          }}
        />
      )}
    </>
  );
}
