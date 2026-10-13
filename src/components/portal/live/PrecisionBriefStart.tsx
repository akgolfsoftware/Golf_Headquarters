"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Knapp } from "@/components/precision/pa";

export function PrecisionBriefStart({ action }: { action: () => Promise<{ ok: true; href: string } | { ok: false; error: string }> }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const sending = useRef(false);
  const start = async () => {
    if (sending.current) return;
    sending.current = true; setPending(true); setError("");
    try {
      const result = await action();
      if (!result.ok) { setError(result.error); return; }
      router.push(result.href);
    } catch { setError("Økta kunne ikke åpnes. Prøv igjen; en pågående økt starter ikke på nytt."); }
    finally { sending.current = false; setPending(false); }
  };
  return <div>{error && <p className="pa-live__status" role="alert">{error}</p>}<Knapp size="xl" fullWidth data-od-id="brief-start" loading={pending} loadingText="Åpner økta …" onClick={() => void start()}>Start økta</Knapp></div>;
}
