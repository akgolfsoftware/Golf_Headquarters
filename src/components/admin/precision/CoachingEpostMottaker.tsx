"use client";
import { useEffect, useState } from "react";
import { lesCoachingEpostUtkast } from "@/lib/email/coaching-oppfolging-actions";
import Link from "next/link";

export function CoachingEpostMottaker({ actionId }: { actionId: string }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof lesCoachingEpostUtkast>>>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    lesCoachingEpostUtkast(actionId).then((value) => { if (active) { setData(value); setError(!value); } }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [actionId]);
  return <div style={{ display: "grid", gap: 8, font: "var(--type-body)", marginBottom: 12 }}>
    {error ? <p role="alert">Mottaker eller grunnlag er ikke tilgjengelig. Oppdater køen før godkjenning.</p> : !data ? <p role="status">Kontrollerer mottaker og booking …</p>
      : <><p style={{ margin: 0 }}>Til: <strong>{data.name ?? "Bestilleren"}</strong> · {data.email}</p><p style={{ margin: 0 }}>Emne: {data.subject}</p>
        {data.voiceHref && <Link href={data.voiceHref}>Les godkjent sjekkpunkt i spillerprofilen</Link>}
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>Godkjenning klargjør e-postutkastet. Ingenting sendes.</p></>}
  </div>;
}
