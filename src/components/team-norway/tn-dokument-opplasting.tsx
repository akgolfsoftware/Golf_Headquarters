"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TN } from "@/lib/v2/team-norway";
import { TnKnapp } from "./core";

type Feilbart = { ok: true } | { ok: false; feil: string };

/**
 * TN-11 «Last opp fil» — frittstående opplasting til gruppens dokumentbibliotek.
 * Går ALLTID via den avgrensede POST-ruten (`/api/team-norway/dokumenter`),
 * aldri via en server action: 50 MB-grensen skal kun gjelde denne ene ruten,
 * ikke Next sin globale `serverActions.bodySizeLimit`.
 */
export function TnDokumentOpplasting({ groupId }: { groupId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function velgFil() {
    inputRef.current?.click();
  }

  function filValgt() {
    const fil = inputRef.current?.files?.[0];
    if (!fil || pending) return;
    setFeil(null);
    const form = new FormData();
    form.set("file", fil);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/team-norway/dokumenter?groupId=${encodeURIComponent(groupId)}`, { method: "POST", body: form });
        if (!(res.headers.get("content-type") ?? "").includes("application/json")) throw new Error("Opplasting feilet");
        const svar: Feilbart = await res.json();
        if (!svar.ok) setFeil(svar.feil);
        else router.refresh();
      } catch { setFeil("Opplasting feilet. Prøv igjen."); }
      finally { if (inputRef.current) inputRef.current.value = ""; }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input ref={inputRef} type="file" disabled={pending} accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx" onChange={filValgt} style={{ display: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {feil && <span role="alert" style={{ fontFamily: TN.font.body, fontSize: TN.text.xs, color: TN.status.redText }}>{feil}</span>}
        <div style={{ flex: 1 }} />
        <TnKnapp variant="primaer" onClick={velgFil} disabled={pending}>
          {pending ? "Laster opp …" : "Last opp fil"}
        </TnKnapp>
      </div>
    </div>
  );
}
