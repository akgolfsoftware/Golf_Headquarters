"use client";

/**
 * PreferencesCard — varsel-preferanser, måleenhet og språk for /portal/meg.
 *
 * Holder lokal kopi av props mens brukeren endrer, og kaller onChange
 * (server action) for hver endring. Viser kort statusmelding ved lagring.
 */

import { useState, useTransition } from "react";
import { Globe, Ruler } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import type { UserPreferences } from "@/lib/preferences";

type PreferencesCardProps = {
  preferences: UserPreferences;
  onChange: (input: Partial<UserPreferences>) => Promise<void>;
};

const cardHeader =
  "border-b border-border px-6 py-4";
const cardTitle =
  "font-display text-lg font-bold tracking-[-0.015em] text-foreground";
const cardSub =
  "font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground";
const rowClass =
  "flex min-h-14 items-center gap-4 border-b border-border px-4 py-2 last:border-b-0";

function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={rowClass}>
      <span className="flex-1">
        <span className="block text-sm font-semibold tracking-[-0.005em] text-foreground">
          {label}
        </span>
        {sub && (
          <span className="mt-0.5 block font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            {sub}
          </span>
        )}
      </span>
      <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export function PreferencesCard({ preferences, onChange }: PreferencesCardProps) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function commit(next: Partial<UserPreferences>) {
    setFeedback(null);
    startTransition(async () => {
      try {
        await onChange(next);
        setFeedback("Lagret");
      } catch (err) {
        setFeedback(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className={cardHeader}>
        <h2 className={cardTitle}>Innstillinger</h2>
        <p className={cardSub}>Varsler, enhet og språk</p>
      </div>

      <div className="divide-y divide-border">
        <ToggleRow
          label="E-postvarsler"
          sub="Viktige oppdateringer på e-post"
          checked={preferences.notif.epost}
          onChange={(on) => commit({ notif: { ...preferences.notif, epost: on } })}
        />
        <ToggleRow
          label="Push-varsler"
          sub="Varsler i nettleseren"
          checked={preferences.notif.push}
          onChange={(on) => commit({ notif: { ...preferences.notif, push: on } })}
        />
        <ToggleRow
          label="Påminnelser"
          sub="Før planlagte økter"
          checked={preferences.notif.paaminnelse}
          onChange={(on) =>
            commit({ notif: { ...preferences.notif, paaminnelse: on } })
          }
        />
        <ToggleRow
          label="Meldinger fra coach"
          checked={preferences.notif.nyMeldingFraCoach}
          onChange={(on) =>
            commit({ notif: { ...preferences.notif, nyMeldingFraCoach: on } })
          }
        />

        <div className={rowClass}>
          <Ruler
            className="size-5 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="flex-1">
            <span className="block text-sm font-semibold tracking-[-0.005em] text-foreground">
              Måleenhet
            </span>
            <span className="mt-px block font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
              Meter eller yards
            </span>
          </span>
          <Select
            value={preferences.enhet}
            onChange={(e) => commit({ enhet: e.target.value as "meter" | "yards" })}
            disabled={pending}
            className="w-[120px]"
          >
            <option value="meter">Meter</option>
            <option value="yards">Yards</option>
          </Select>
        </div>

        <div className={rowClass}>
          <Globe
            className="size-5 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="flex-1">
            <span className="block text-sm font-semibold tracking-[-0.005em] text-foreground">
              Språk
            </span>
            <span className="mt-px block font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
              App-språk
            </span>
          </span>
          <Select
            value={preferences.spraak}
            onChange={(e) => commit({ spraak: e.target.value as "nb" | "en" })}
            disabled={pending}
            className="w-[120px]"
          >
            <option value="nb">Norsk</option>
            <option value="en">English</option>
          </Select>
        </div>
      </div>

      {feedback && (
        <div className="border-t border-border px-4 py-2">
          <p
            className={
              feedback === "Lagret"
                ? "text-sm text-success"
                : "text-sm text-destructive"
            }
          >
            {feedback}
          </p>
        </div>
      )}
    </section>
  );
}
