/**
 * PILOT — Edge · Paywall / scope-blokk
 * Bygd direkte fra wireframe/design-files-v2/screens/43-edge-paywall.html
 * URL: /edge-paywall-demo
 *
 * Én produksjonsskjerm: scope mangler, foreldre-samtykke pending.
 */

import { Video, Target, AlignLeft, Shield } from "lucide-react";

export default function EdgePaywallDemo() {
  return (
    <div className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Funksjon låst · video-scope mangler
          </div>
          <h1 className="mt-3 font-display text-[28px] font-medium leading-[1.15] tracking-tight">
            Video-arkivet er ikke aktivert for <em className="font-normal italic">Markus</em>
          </h1>
          <p className="mx-auto mt-3 max-w-[480px] text-[14px] leading-relaxed text-muted-foreground">
            Markus sine foresatte har ikke signert video-samtykke ennå. Familiens plan dekker funksjonen — vi mangler
            bare juridisk hjemmel. Når foresatt signerer via BankID, åpnes arkivet og du kan ta opp swings i økter
            framover.
          </p>

          {/* Features */}
          <div className="mt-8 grid grid-cols-2 gap-3 text-left">
            <Feature
              icon={<Video className="h-4 w-4" strokeWidth={1.5} />}
              title="Swing-video i 1080p"
              desc="Front, side, bak · slow-motion"
            />
            <Feature
              icon={<Target className="h-4 w-4" strokeWidth={1.5} />}
              title="AI-pose tracking"
              desc="23 punkter · automatisk"
            />
            <Feature
              icon={<AlignLeft className="h-4 w-4" strokeWidth={1.5} />}
              title="Notat-overlays"
              desc="Annotér frame-by-frame"
            />
            <Feature
              icon={<Shield className="h-4 w-4" strokeWidth={1.5} />}
              title="24 mnd retention"
              desc="Kryptert · S3-Frankfurt"
            />
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6">
            <div>
              <div className="font-display text-[28px] font-medium tabular-nums">
                0 kr
                <span className="ml-2 font-sans text-[12px] font-normal text-muted-foreground">
                  inkludert i Familie Pro
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary">
                Se hvilke scopes som mangler →
              </button>
              <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
                <Shield className="h-3.5 w-3.5" strokeWidth={1.5} />
                Be foresatt signere via BankID
              </button>
            </div>
          </div>
        </div>

        {/* Audit */}
        <div className="mt-5 rounded-lg border border-border bg-card p-6">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Hvorfor du ser denne · audit
          </h2>
          <dl className="mt-3 flex flex-col">
            <AuditRow label="Spiller" value="Markus Roinås Pedersen (U18)" />
            <AuditRow label="Scope etterspurt" value="video:record + video:read" />
            <AuditRow label="Scope-status" value={<span className="text-[#B8852A]">pending — sendt 09. mai 14:11</span>} />
            <AuditRow label="Hjemmel-kilde" value="foresatt-samtykke (art. 6 a + 8)" />
            <AuditRow label="Påminnelse" value="auto 11. mai 09:00" />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/30 p-4">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm bg-card text-primary">
        {icon}
      </div>
      <div>
        <div className="text-[13px] font-medium text-foreground">{title}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function AuditRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-[13px] last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
