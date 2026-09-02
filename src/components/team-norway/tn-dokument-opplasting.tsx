"use client";

import { useRef, useState, useTransition } from "react";
import { TN } from "@/lib/v2/team-norway";
import { TnKnapp } from "./core";

type Feilbart = { ok: true } | { ok: false; feil: string };

/** TN-11 «Last opp fil» — frittstående opplasting til gruppens dokumentbibliotek. */
export function TnDokumentOpplasting({ last }: { last: (form: FormData) => Promise<Feilbart> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function velgFil() {
    inputRef.current?.click();
  }

  function filValgt() {
    const fil = inputRef.current?.files?.[0];
    if (!fil) return;
    setFeil(null);
    const form = new FormData();
    form.set("file", fil);
    startTransition(async () => {
      const svar = await last(form);
      if (!svar.ok) setFeil(svar.feil);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input ref={inputRef} type="file" onChange={filValgt} style={{ display: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {feil && <span style={{ fontFamily: TN.font.body, fontSize: TN.text.xs, color: TN.status.redText }}>{feil}</span>}
        <div style={{ flex: 1 }} />
        <TnKnapp variant="primaer" onClick={velgFil}>
          {pending ? "Laster opp …" : "Last opp fil"}
        </TnKnapp>
      </div>
    </div>
  );
}
