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
    <div className="space-y-8">
      {/* Spesifikke varsler */}
      <section className="space-y-1">
        <h3 className="font-display text-base font-semibold tracking-tight">
          Varsler
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Velg hvilke hendelser du vil varsles om.
        </p>
        <ToggleRad
          label="Nye meldinger fra coach"
          beskrivelse="Varsles når coachen din sender deg en melding"
          on={prefs.notif.nyMeldingFraCoach}
          onChange={(v) => setNotif("nyMeldingFraCoach", v)}
          disabled={pending}
        />
        <ToggleRad
          label="Treningsplan oppdatert"
          beskrivelse="Varsles når coachen endrer treningsplanen din"
          on={prefs.notif.treningsplanOppdatert}
          onChange={(v) => setNotif("treningsplanOppdatert", v)}
          disabled={pending}
        />
        <ToggleRad
          label="Bookingbekreftelse"
          beskrivelse="Bekreftelse og påminnelse for bookede tider"
          on={prefs.notif.bookingbekreftelse}
          onChange={(v) => setNotif("bookingbekreftelse", v)}
          disabled={pending}
        />
        <ToggleRad
          label="Ukentlig fremdrifts-rapport"
          beskrivelse="Oppsummering av uken — trening, mål og fremgang"
          on={prefs.notif.ukentligRapport}
          onChange={(v) => setNotif("ukentligRapport", v)}
          disabled={pending}
        />
        <ToggleRad
          label="Turneringsresultater"
          beskrivelse="Varsles når turneringsresultater er registrert"
          on={prefs.notif.turneringsresultater}
          onChange={(v) => setNotif("turneringsresultater", v)}
          disabled={pending}
        />
      </section>

      {/* Kanal-innstillinger */}
      <section className="space-y-1">
        <h3 className="font-display text-base font-semibold tracking-tight">
          Kanaler
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Hvordan du mottar varsler.
        </p>
        <ToggleRad
          label="E-post"
          beskrivelse="Sammendrag av planen og påminnelser på e-post"
          on={prefs.notif.epost}
          onChange={(v) => setNotif("epost", v)}
          disabled={pending}
        />
        <ToggleRad
          label="Push-varsler"
          beskrivelse="Sanntidsvarsler i nettleser og mobil"
          on={prefs.notif.push}
          onChange={(v) => setNotif("push", v)}
          disabled={pending}
        />
        <ToggleRad
          label="Påminnelse 1 time før økt"
          beskrivelse="Få påminnelse rett før en planlagt økt starter"
          on={prefs.notif.paaminnelse}
          onChange={(v) => setNotif("paaminnelse", v)}
          disabled={pending}
        />
      </section>

      {/* Språk */}
      <section className="space-y-4">
        <h3 className="font-display text-base font-semibold tracking-tight">
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
          Lagret
        </span>
      )}
    </div>
  );
}

function ToggleRad({
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
    <label className="flex cursor-pointer items-center justify-between border-b border-border py-2 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{beskrivelse}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => !disabled && onChange(!on)}
        disabled={disabled}
        className={`relative ml-4 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
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
