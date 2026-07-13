"use client";

/**
 * useLiveMediaUpload (Bølge 5, 2026-07-13) — generalisering av
 * useLiveCoachVideoUpload: laster opp BÅDE video (swing-bucket +
 * video-notat + swing-analyse) og bilde (attachments-bucket + bilde-notat,
 * ingen analyse) fra live-økta. Video for plan-økter går via
 * savePlanSessionVideoNote som før; bilder støttes kun for V2-økter
 * (plan-økter bruker tapper-flyten uten media).
 */

import { useCallback, useState } from "react";
import type { LiveSessionKind } from "@/lib/agents/live-coach-agent";
import {
  savePlanSessionVideoNote,
  saveSessionV2VideoNote,
  saveSessionV2ImageNote,
} from "@/lib/portal-live/actions";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";

type UploadResult = { ok: true } | { ok: false; error: string };

type Options = {
  userId: string;
  sessionId: string;
  kind: LiveSessionKind;
  drillId?: string | null;
};

export function useLiveMediaUpload(opts: Options) {
  const [busy, setBusy] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const last = useCallback(
    async (file: File, comment?: string): Promise<UploadResult> => {
      setBusy(true);
      setFeil(null);
      try {
        const erBilde = file.type.startsWith("image/");
        if (erBilde && opts.kind !== "session-v2") {
          const msg = "Bilder støttes kun i live-økter.";
          setFeil(msg);
          return { ok: false, error: msg };
        }

        const bucket = erBilde
          ? STORAGE_BUCKETS.MESSAGE_ATTACHMENTS
          : STORAGE_BUCKETS.PLAYER_SWING_VIDEOS;
        const form = new FormData();
        form.append("bucket", bucket);
        form.append("file", file);
        form.append(
          "path",
          erBilde
            ? `${opts.userId}/live/${opts.sessionId}/${Date.now()}-${file.name}`
            : `${opts.userId}/${Date.now()}-${file.name}`,
        );

        const up = await fetch("/api/upload", { method: "POST", body: form });
        const upBody = (await up.json()) as { ok?: boolean; url?: string; error?: string };
        if (!up.ok || !upBody.ok || !upBody.url) {
          const msg = upBody.error ?? "Opplasting feilet";
          setFeil(msg);
          return { ok: false, error: msg };
        }

        const saved = erBilde
          ? await saveSessionV2ImageNote({
              sessionId: opts.sessionId,
              imageUrl: upBody.url,
              drillId: opts.drillId ?? undefined,
              comment,
            })
          : opts.kind === "plan-session"
            ? await savePlanSessionVideoNote({
                sessionId: opts.sessionId,
                videoUrl: upBody.url,
                drillId: opts.drillId ?? undefined,
              })
            : await saveSessionV2VideoNote({
                sessionId: opts.sessionId,
                videoUrl: upBody.url,
                drillId: opts.drillId ?? undefined,
              });

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
