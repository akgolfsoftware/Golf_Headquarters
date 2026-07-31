"use client";

/**
 * Midlertidig pilot-UI: coach registrerer lydsamtykke som GITT (inntil
 * foresatt-e-post + DKIM er på plass). Vises når valgt spiller mangler GITT.
 */

import { useState, useTransition } from "react";
import {
  registrerLydSamtykkeGitt,
  trekkLydSamtykke,
} from "@/lib/recording/lyd-samtykke-actions";
import { useRouter } from "next/navigation";

type Props = {
  playerId: string;
  playerNavn: string;
  harGitt: boolean;
};

export function LydSamtykkePilotPanel({
  playerId,
  playerNavn,
  harGitt,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [gittAv, setGittAv] = useState<"SELV" | "FORESATT">("FORESATT");
  const [epost, setEpost] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function lagreGitt() {
    setFeil(null);
    setOk(null);
    start(async () => {
      const res = await registrerLydSamtykkeGitt({
        playerId,
        gittAv,
        foresattEpost: gittAv === "FORESATT" ? epost || null : null,
      });
      if (!res.ok) {
        setFeil(res.error);
        return;
      }
      setOk("Samtykke registrert som GITT. Opptak kan starte.");
      router.refresh();
    });
  }

  function trekk() {
    setFeil(null);
    setOk(null);
    start(async () => {
      const res = await trekkLydSamtykke({ playerId });
      if (!res.ok) {
        setFeil(res.error);
        return;
      }
      setOk("Samtykke trukket. Nye opptak er sperret.");
      router.refresh();
    });
  }

  if (harGitt) {
    return (
      <div className="flex flex-1 flex-col gap-2 rounded-md border border-border bg-card px-4 py-3">
        <p className="text-[13px] font-medium text-foreground">
          Lydsamtykke GITT — {playerNavn}
        </p>
        <button
          type="button"
          onClick={trekk}
          disabled={pending}
          className="self-start text-[12px] font-medium text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
        >
          Trekk samtykke
        </button>
        {feil && <p className="text-[12px] text-destructive">{feil}</p>}
        {ok && <p className="text-[12px] text-foreground">{ok}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 rounded-md border border-border bg-card px-4 py-3">
      <p className="text-[13px] font-medium text-foreground">
        Venter på samtykke fra foresatt
      </p>
      <p className="text-[12px] text-muted-foreground">
        Pilot: registrer GITT her inntil e-postflyt er klar. Ordlyden lagres som
        kopi.
      </p>
      <label className="flex flex-col gap-1 text-[12px]">
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          Gitt av
        </span>
        <select
          value={gittAv}
          onChange={(e) => setGittAv(e.target.value as "SELV" | "FORESATT")}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-[13px]"
        >
          <option value="FORESATT">Foresatt</option>
          <option value="SELV">Selv (myndig)</option>
        </select>
      </label>
      {gittAv === "FORESATT" && (
        <label className="flex flex-col gap-1 text-[12px]">
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            Foresatt e-post
          </span>
          <input
            type="email"
            value={epost}
            onChange={(e) => setEpost(e.target.value)}
            placeholder="navn@epost.no"
            className="rounded-md border border-border bg-background px-2 py-1.5 text-[13px]"
          />
        </label>
      )}
      <button
        type="button"
        onClick={lagreGitt}
        disabled={pending}
        className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
      >
        {pending ? "Lagrer …" : "Registrer lydsamtykke (GITT)"}
      </button>
      {feil && <p className="text-[12px] text-destructive">{feil}</p>}
      {ok && <p className="text-[12px] text-foreground">{ok}</p>}
    </div>
  );
}
