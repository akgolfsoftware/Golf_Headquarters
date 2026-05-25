"use client";

/**
 * NotaterPanelContainer — kobler NotaterPanel (pure UI) til Prisma via
 * server actions og styrer modal-state for ny/rediger.
 *
 * NotaterPanel beholdes som pure presentational komponent. Container-en
 * mottar initialNotater fra server (Server Component i page.tsx), mapper
 * dem til CoachNotat-formatet og åpner NyNotatModal ved trigger.
 */

import { useMemo, useState } from "react";

import type { CoachNote } from "@/generated/prisma/client";
import {
  NotaterPanel,
  type CoachNotat,
} from "@/components/coachhq/workbench/panels/notater-panel";
import {
  NyNotatModal,
  type EditingNote,
} from "@/components/coachhq/workbench/ny-notat-modal";

type InitialNotat = Pick<
  CoachNote,
  "id" | "title" | "content" | "tags" | "isPrivate" | "createdAt"
>;

type NotaterPanelContainerProps = {
  spillerId: string;
  spillerName: string;
  initialNotater: InitialNotat[];
};

function tilCoachNotat(n: InitialNotat): CoachNotat {
  return {
    id: n.id,
    dato: n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt),
    tittel: n.title?.trim() || "Uten tittel",
    innhold: n.content,
    tags: n.tags,
    privat: n.isPrivate,
  };
}

export function NotaterPanelContainer({
  spillerId,
  spillerName,
  initialNotater,
}: NotaterPanelContainerProps) {
  const [editing, setEditing] = useState<EditingNote | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const notater = useMemo(
    () => initialNotater.map(tilCoachNotat),
    [initialNotater],
  );

  function handleNyNotat() {
    setEditing(undefined);
    setOpen(true);
  }

  function handleRedigerNotat(id: string) {
    const raw = initialNotater.find((n) => n.id === id);
    if (!raw) return;
    setEditing({
      id: raw.id,
      title: raw.title,
      content: raw.content,
      tags: raw.tags,
      isPrivate: raw.isPrivate,
    });
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    // Behold editing-state inntil modal lukker for å unngå flash
    setTimeout(() => setEditing(undefined), 200);
  }

  return (
    <>
      <NotaterPanel
        spillerId={spillerId}
        notater={notater}
        onNyNotat={handleNyNotat}
        onRedigerNotat={handleRedigerNotat}
      />
      <NyNotatModal
        open={open}
        onClose={handleClose}
        playerId={spillerId}
        playerName={spillerName}
        editingNote={editing}
      />
    </>
  );
}
