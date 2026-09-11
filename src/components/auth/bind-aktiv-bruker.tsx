"use client";

import { useEffect } from "react";
import { settAktivBrukerId } from "@/lib/offline-queue/eier";

/** Binder Prisma-bruker-id til denne fanen. Utlogging fjerner pekeren, ikke kladdene. */
export function BindAktivBruker({ userId }: { userId: string }) {
  useEffect(() => {
    if (typeof window === "undefined" || !userId) return;
    settAktivBrukerId(window.sessionStorage, userId);
  }, [userId]);
  return null;
}
