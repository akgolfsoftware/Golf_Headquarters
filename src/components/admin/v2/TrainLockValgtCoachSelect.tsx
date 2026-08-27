"use client";

/**
 * «Valgt coach»-select på rediger spiller — Train-lock (T4, 27.08.2026).
 * TL-port av AdminValgtCoachSelectV2 (samme server action, samme atferd:
 * lagres umiddelbart, sporbart, utenfor hovedskjemaets lagre-flyt).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import { settValgtCoach } from "@/app/admin/(legacy)/spillere/[id]/rediger/actions";

export interface CoachValg {
  id: string;
  navn: string;
}

export function TrainLockValgtCoachSelect({
  spillerId,
  valgtCoachId,
  coacher,
}: {
  spillerId: string;
  valgtCoachId: string | null;
  coacher: CoachValg[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);

  function velg(coachId: string) {
    setError(null);
    setLagret(false);
    startTransition(async () => {
      const res = await settValgtCoach(spillerId, coachId === "" ? null : coachId);
      if (res.ok) {
        setLagret(true);
        router.refresh();
      } else {
        setError(res.error ?? "Lagring feilet. Prøv igjen.");
      }
    });
  }

  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: TL.vekt.caps,
          letterSpacing: TL.track.capsSm,
          textTransform: "uppercase",
          color: TL.mute,
        }}
      >
        Valgt coach
      </span>
      <select
        value={valgtCoachId ?? ""}
        onChange={(e) => velg(e.target.value)}
        disabled={pending}
        style={{
          display: "block",
          width: "100%",
          height: 44,
          marginTop: 6,
          borderRadius: TL.radius.field,
          border: "none",
          background: TL.dock,
          padding: "0 14px",
          fontSize: 15,
          color: TL.text,
          outline: "none",
          boxSizing: "border-box",
          opacity: pending ? 0.6 : 1,
        }}
      >
        <option value="">Ikke valgt (automatisk)</option>
        {coacher.map((c) => (
          <option key={c.id} value={c.id}>
            {c.navn}
          </option>
        ))}
      </select>
      <span style={{ display: "block", marginTop: 4, fontSize: 12, color: error ? TL.warn : TL.mute }}>
        {error
          ? error
          : pending
            ? "Lagrer …"
            : lagret
              ? "Lagret — varsler og coach-flater bruker denne."
              : "Lagres umiddelbart. «Ikke valgt» = utledes fra program/gruppe."}
      </span>
    </label>
  );
}
