/**
 * PILOT — Edge · Deaktivert konto
 * Bygd direkte fra wireframe/design-files-v2/screens/44-edge-suspended.html
 * URL: /edge-suspended-demo
 *
 * Én produksjonsskjerm: kontoen er pauset av foresatt.
 */

import { Lock, RefreshCw, FileDown, MessageCircle } from "lucide-react";

export default function EdgeSuspendedDemo() {
  return (
    <div className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-border bg-secondary/30 text-muted-foreground">
            <Lock className="h-9 w-9" strokeWidth={1.5} />
          </div>
          <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            audit-ref AK-SUS-2026-04812
          </div>
          <h1 className="mt-2 font-display text-[28px] font-medium leading-[1.15] tracking-tight">
            Kontoen er <em className="font-normal italic">midlertidig pauset</em>
          </h1>
          <p className="mx-auto mt-3 max-w-[480px] text-[14px] leading-relaxed text-muted-foreground">
            Foresatt satte kontoen på pause 09. mai kl 22:14. Grunn oppgitt: <i>«Pause i 4 uker — eksamen.»</i> Ingen
            data slettes — alt venter på deg.
          </p>
        </div>

        {/* Status */}
        <div className="mt-5 rounded-lg border border-border bg-card p-6">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Hva som skjer nå
          </h2>
          <dl className="mt-3 flex flex-col">
            <StatusRow label="Pauset av" value="Foresatt · Markus" />
            <StatusRow label="Pauset siden" value="09. mai 2026 · 22:14" />
            <StatusRow label="Planlagt slutt" value="06. juni 2026 (28 dager)" />
            <StatusRow label="Data bevart" value="alt · ingenting slettet" />
            <StatusRow
              label="Coach-tilgang"
              value={<span className="text-[#B8852A]">pause — Anders Kristiansen varslet</span>}
            />
            <StatusRow label="Fakturering" value="pauset — ingen trekk" />
          </dl>
        </div>

        {/* Actions */}
        <div className="mt-4 rounded-lg border border-border bg-card p-6">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Hva du kan gjøre
          </h2>
          <div className="mt-3 flex flex-col">
            <ActionRow
              icon={<RefreshCw className="h-4 w-4" strokeWidth={1.5} />}
              label="Be foresatt om å åpne pause-anken"
              cta="Send forespørsel"
            />
            <ActionRow
              icon={<FileDown className="h-4 w-4" strokeWidth={1.5} />}
              label="Last ned dine data (GDPR art. 15)"
              cta="Eksporter"
            />
            <ActionRow
              icon={<MessageCircle className="h-4 w-4" strokeWidth={1.5} />}
              label="Snakk med oss · personvern@akgolfhq.no"
              cta="Kontakt"
            />
          </div>
        </div>

        {/* Footer ctas */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button className="rounded-md border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-secondary">
            Logg ut
          </button>
          <button className="rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground hover:opacity-90">
            Be foresatt åpne kontoen
          </button>
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

function ActionRow({ icon, label, cta }: { icon: React.ReactNode; label: string; cta: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 text-[13px] last:border-b-0">
      <div className="flex items-center gap-3 text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        <span>{label}</span>
      </div>
      <button className="text-[12px] font-medium text-primary hover:underline">{cta} →</button>
    </div>
  );
}
