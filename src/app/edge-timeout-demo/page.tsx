/**
 * PILOT — Edge · Sesjon-timeout
 * Bygd direkte fra wireframe/design-files-v2/screens/45-edge-timeout.html
 * URL: /edge-timeout-demo
 *
 * Én produksjonsskjerm: idle 28:30, 47 sek til lås.
 */

import { Check, Lock } from "lucide-react";

export default function EdgeTimeoutDemo() {
  // Countdown ring: 90s window, 47s remaining
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = 47 / 90;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        {/* Countdown ring */}
        <div className="relative h-40 w-40">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 152 152">
            <circle cx="76" cy="76" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="6" />
            <circle
              cx="76"
              cy="76"
              r={radius}
              fill="none"
              stroke="#B8852A"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-mono text-[32px] font-semibold tabular-nums leading-none text-foreground">
              00:47
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              til lås
            </div>
          </div>
        </div>

        <h1 className="mt-8 font-display text-[32px] font-medium leading-[1.15] tracking-tight">
          Er du her <em className="font-normal italic">ennå?</em>
        </h1>
        <p className="mt-3 max-w-[520px] text-[14px] leading-relaxed text-muted-foreground">
          Vi låser sesjonen om 47 sekunder for å beskytte spiller-data. Klikk «Bli logget på» for å fortsette, eller la
          nedtellingen gå — alle ulagrede notater er allerede auto-lagret.
        </p>

        {/* Status */}
        <div className="mt-8 w-full rounded-lg border border-border bg-card p-6 text-left">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Status
          </h2>
          <dl className="mt-3 flex flex-col">
            <StatusRow label="Pålogget som" value="Anders Kristiansen · anders@akgolf.no" />
            <StatusRow label="Inaktiv siden" value="14:19 (28 min 13 sek)" />
            <StatusRow
              label="Sist auto-lagret"
              value={<span className="text-[#1A7D56]">14:21 — alle endringer trygt lagret</span>}
            />
            <StatusRow label="Hva som låses" value="denne fanen + alle åpne CoachHQ-vinduer" />
            <StatusRow label="Etter lås" value="BankID re-auth · ~6 sek" />
          </dl>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground hover:opacity-90">
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
            Bli logget på (47 s)
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-secondary">
            <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
            Lås nå og logg ut
          </button>
        </div>

        <div className="mt-6 max-w-[480px] font-mono text-[10px] leading-relaxed tracking-[0.04em] text-muted-foreground">
          tip · idle-tid kan settes per organisasjon i sikkerhet · standard 30 min for CoachHQ, 60 min for PlayerHQ, 15
          min for admin
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-[13px] last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
