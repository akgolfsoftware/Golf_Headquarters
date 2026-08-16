"use client";

/**
 * «Valgt coach»-select på rediger spiller (plan G2). Lagrer umiddelbart via
 * settValgtCoach (egen server action med egne guards) — feltet står utenfor
 * hovedskjemaets lagre-flyt fordi valget skal være eksplisitt og sporbart
 * (audit-logges for seg). Samme visuelle mønster som SelectFelt i
 * AdminSpillerRedigerV2.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/components/v2";
import { settValgtCoach } from "@/app/admin/(legacy)/spillere/[id]/rediger/actions";

export interface CoachValg {
  id: string;
  navn: string;
}

export function AdminValgtCoachSelectV2({
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
      <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>
        Valgt coach
      </span>
      <select
        value={valgtCoachId ?? ""}
        onChange={(e) => velg(e.target.value)}
        disabled={pending}
        style={{ display: "block", width: "100%", marginTop: 6, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 14px", fontSize: 13, color: T.fg, outline: "none", boxSizing: "border-box", opacity: pending ? 0.6 : 1 }}
      >
        <option value="">Ikke valgt (automatisk)</option>
        {coacher.map((c) => (
          <option key={c.id} value={c.id}>{c.navn}</option>
        ))}
      </select>
      <span style={{ display: "block", marginTop: 4, fontFamily: T.mono, fontSize: 10, color: error ? T.down : T.mut }}>
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
