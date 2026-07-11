"use client";

import { useCallback, useState } from "react";
import type { LiveSessionKind } from "@/lib/agents/live-coach-agent";
import {
  savePlanSessionVideoNote,
  saveSessionV2VideoNote,
} from "@/lib/portal-live/actions";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";

type UploadResult = { ok: true } | { ok: false; error: string };

type Options = {
  userId: string;
  sessionId: string;
  kind: LiveSessionKind;
  drillId?: string | null;
};

export function useLiveCoachVideoUpload(opts: Options) {
  const [busy, setBusy] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const last = useCallback(
    async (file: File): Promise<UploadResult> => {
      setBusy(true);
      setFeil(null);
      try {
        const form = new FormData();
        form.append("bucket", STORAGE_BUCKETS.PLAYER_SWING_VIDEOS);
        form.append("file", file);
        form.append("path", `${opts.userId}/${Date.now()}-${file.name}`);

        const up = await fetch("/api/upload", { method: "POST", body: form });
        const upBody = (await up.json()) as { ok?: boolean; url?: string; error?: string };
        if (!up.ok || !upBody.ok || !upBody.url) {
          const msg = upBody.error ?? "Opplasting feilet";
          setFeil(msg);
          return { ok: false, error: msg };
        }

        const payload = {
          sessionId: opts.sessionId,
          videoUrl: upBody.url,
          drillId: opts.drillId ?? undefined,
        };
        const saved =
          opts.kind === "plan-session"
            ? await savePlanSessionVideoNote(payload)
            : await saveSessionV2VideoNote(payload);

        if (!saved.ok) {
          setFeil(saved.error);
          return saved;
        }
        return { ok: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Opplasting feilet";
        setFeil(msg);
        return { ok: false, error: msg };
      } finally {
        setBusy(false);
      }
    },
    [opts.drillId, opts.kind, opts.sessionId, opts.userId],
  );

  return { last, busy, feil };
}