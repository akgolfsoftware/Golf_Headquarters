"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { importerSkoledata } from "./actions";

const EKSEMPEL = `# YYYY-MM-DD|TRINN(valgfritt)|KATEGORI|Tittel|Notat(valgfritt)
# KATEGORI: TIME | PROVE | HELDAGSPROVE | EKSAMEN | FERIE | SKOLETUR | ANNET
2026-10-05|VG1|PROVE|Norsk HM|
2026-10-19||FERIE|Høstferie|Hele uken
2026-02-23|VG2|SKOLETUR|Tur til Oslo|`;

export function SkoledataForm({ groupId }: { groupId: string }) {
  const [pending, startTransition] = useTransition();
  const [resultat, setResultat] = useState<{ ok: boolean; melding: string; feil: string[] } | null>(null);

  function send(formData: FormData) {
    startTransition(async () => {
      const svar = await importerSkoledata(groupId, formData);
      setResultat(
        svar.ok
          ? { ok: true, melding: `${svar.antall} rader lagt inn.`, feil: svar.feil }
          : { ok: false, melding: "Importen feilet.", feil: svar.feil },
      );
    });
  }

  return (
    <form action={send} className="space-y-4">
      <div>
        <label className="mb-1 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Skoleår
        </label>
        <input
          name="schoolYear"
          defaultValue="2026/2027"
          className="w-40 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
        />
      </div>

      <div>
        <label className="mb-1 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Data — ett rad per linje
        </label>
        <textarea
          name="data"
          rows={14}
          defaultValue={EKSEMPEL}
          spellCheck={false}
          className="w-full rounded-lg border border-border bg-background p-3 font-mono text-[12px] text-foreground"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Importerer …" : "Importer"}
      </Button>

      {resultat && (
        <div className={`rounded-lg border p-3 text-[13px] ${resultat.ok ? "border-emerald-600/40 bg-emerald-600/10" : "border-destructive/40 bg-destructive/10"}`}>
          <p className="font-semibold text-foreground">{resultat.melding}</p>
          {resultat.feil.length > 0 && (
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-muted-foreground">
              {resultat.feil.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
