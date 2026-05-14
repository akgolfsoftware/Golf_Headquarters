"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { oppdaterPreferences } from "../actions";
import type { UserPreferences } from "@/lib/preferences";

export function NotifToggles({ initial }: { initial: UserPreferences }) {
  const router = useRouter();
  const [prefs, setPrefs] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);

  function setNotif(felt: keyof UserPreferences["notif"], value: boolean) {
    const oppdatert = {
      ...prefs,
      notif: { ...prefs.notif, [felt]: value },
    };
    setPrefs(oppdatert);
    startTransition(async () => {
      await oppdaterPreferences({ notif: oppdatert.notif });
      setLagret(true);
      router.refresh();
      setTimeout(() => setLagret(false), 1500);
    });
  }

  function setSpraak(s: "nb" | "en") {
    const oppdatert = { ...prefs, spraak: s };
    setPrefs(oppdatert);
    startTransition(async () => {
      await oppdaterPreferences({ spraak: s });
      setLagret(true);
      router.refresh();
      setTimeout(() => setLagret(false), 1500);
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          Notifikasjoner
        </h3>
        <Toggle
          label="E-post"
          beskrivelse="Sammendrag av planen og påminnelser"
          on={prefs.notif.epost}
          onChange={(v) => setNotif("epost", v)}
          disabled={pending}
        />
        <Toggle
          label="Push-varsler"
          beskrivelse="Sanntidsvarsler i nettleser/mobil"
          on={prefs.notif.push}
          onChange={(v) => setNotif("push", v)}
          disabled={pending}
        />
        <Toggle
          label="Påminnelse 1 time før økt"
          beskrivelse="Få påminnelse før en planlagt økt"
          on={prefs.notif.paaminnelse}
          onChange={(v) => setNotif("paaminnelse", v)}
          disabled={pending}
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          Språk
        </h3>
        <div className="flex gap-2">
          {(["nb", "en"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpraak(s)}
              disabled={pending}
              className={`rounded-md border px-4 py-2 text-sm transition-colors disabled:opacity-60 ${
                prefs.spraak === s
                  ? "border-primary bg-primary/5 font-semibold text-primary"
                  : "border-input bg-card text-foreground hover:border-border"
              }`}
            >
              {s === "nb" ? "Norsk bokmål" : "English"}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Engelsk-støtte kommer i en senere fase.
        </p>
      </section>

      {lagret && (
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
          Lagret ✓
        </span>
      )}
    </div>
  );
}

function Toggle({
  label,
  beskrivelse,
  on,
  onChange,
  disabled,
}: {
  label: string;
  beskrivelse: string;
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-md border border-border bg-card p-4 hover:border-input">
      <div className="min-w-0 flex-1">
        <div className="font-medium text-foreground">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{beskrivelse}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => !disabled && onChange(!on)}
        disabled={disabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
          on ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${
            on ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}
