"use client";

/**
 * Klient-wrapper som gjør en spillers egen TaskCard klikkbar for redigering
 * (runde 2 · 2026-07-14) — samme edit-flyt som coachens DrillsPanel allerede
 * har (drills-panel.tsx), bare for spiller-siden av Teknisk plan der ingen
 * edit-inngang fantes tidligere. Åpner OppgaveModal i edit-modus, som gir
 * tilgang til Logg reps / bilde-video-opplasting / kategori-felt.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import { TaskCard, type TaskCardProps } from "@/components/teknisk-plan/task-card";
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
  cardProps: Omit<TaskCardProps, "onClick">;
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
      <TaskCard {...cardProps} onClick={openEdit} />
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
