"use client";

/**
 * Lydsamtykke på /admin/recording:
 * 1) Primær: send e-post til foresatt (VENTER til de bekrefter)
 * 2) Manuelt GITT for myndig (SELV) eller nødstilfelle
 */

import { useState, useTransition } from "react";
import {
  registrerLydSamtykkeGitt,
  sendLydSamtykkeForesattEpost,
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
  const [epost, setEpost] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [visManuell, setVisManuell] = useState(false);
  const [gittAv, setGittAv] = useState<"SELV" | "FORESATT">("SELV");

  function sendEpost() {
    setFeil(null);
    setOk(null);
    start(async () => {
      const res = await sendLydSamtykkeForesattEpost({
        playerId,
        foresattEpost: epost,
      });
      if (!res.ok) {
        setFeil(res.error);
        return;
      }
      setOk(res.message ?? "E-post sendt.");
      router.refresh();
    });
  }

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
        Venter på samtykke — {playerNavn}
      </p>
      <p className="text-[12px] text-muted-foreground">
        Send e-post til foresatt. De åpner lenken og sier ja. Opptak starter
        først da. (DKIM må være grønn så e-posten ikke havner i spam.)
      </p>

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
          autoComplete="email"
        />
      </label>

      <button
        type="button"
        onClick={sendEpost}
        disabled={pending || !epost.trim()}
        className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
      >
        {pending ? "Sender …" : "Send samtykke til foresatt"}
      </button>

      <button
        type="button"
        onClick={() => setVisManuell((v) => !v)}
        className="self-start text-[12px] font-medium text-muted-foreground underline-offset-2 hover:underline"
      >
        {visManuell ? "Skjul manuell registrering" : "Manuell registrering (myndig / nød)"}
      </button>

      {visManuell && (
        <div className="flex flex-col gap-2 border-t border-border pt-2">
          <label className="flex flex-col gap-1 text-[12px]">
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              Gitt av
            </span>
            <select
              value={gittAv}
              onChange={(e) => setGittAv(e.target.value as "SELV" | "FORESATT")}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-[13px]"
            >
              <option value="SELV">Selv (myndig)</option>
              <option value="FORESATT">Foresatt (manuelt)</option>
            </select>
          </label>
          {gittAv === "FORESATT" && (
            <p className="text-[11px] text-muted-foreground">
              Bruker e-postfeltet over som dokumentasjon. Foretrekk e-postlenke
              når det er mulig.
            </p>
          )}
          <button
            type="button"
            onClick={lagreGitt}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-[13px] font-medium text-foreground disabled:opacity-50"
          >
            {pending ? "Lagrer …" : "Registrer GITT uten e-post"}
          </button>
        </div>
      )}

      {feil && <p className="text-[12px] text-destructive">{feil}</p>}
      {ok && <p className="text-[12px] text-foreground">{ok}</p>}
    </div>
  );
}
