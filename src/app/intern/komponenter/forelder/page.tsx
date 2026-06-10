"use client";

import { MinorGate } from "@/components/forelder/minor-gate";
import { ApprovalCard, type ApprovalRequest } from "@/components/forelder/approval-card";
import { MessageComposer, ReadReceiptList, type Receipt } from "@/components/forelder/parent-comm";

const approvals: ApprovalRequest[] = [
  { kind: "payment", who: "AK Golf Academy", what: "Mars-faktura for Øyvind — coaching-abonnement Pro", meta: "1 200 kr · forfall 5. juni" },
  { kind: "booking", who: "Coach Andreas", what: "Avbestilling av økt fredag 30/5 (mindre enn 24t — krever samtykke)", meta: "Credit returneres ved godkjenning" },
  { kind: "video", who: "Coach Andreas", what: "Vil dele en treningsvideo av Øyvind' innspill med stallen", meta: "00:42 · GFGK TM 3" },
];

const receipts: Receipt[] = [
  { initials: "EM", name: "Eva Mor", state: "clicked", when: "08:12" },
  { initials: "OF", name: "Ola Far", state: "read", when: "07:50" },
  { initials: "KH", name: "Kari H.", state: "unread" },
  { initials: "PB", name: "Per B.", state: "bounce", when: "07:45" },
];

export default function ForelderDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto w-[1000px] max-w-full space-y-8">
        <header>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Foreldreportal · Bolk 3-demo
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Foreldre — <em className="font-normal italic text-primary">samtykke, godkjenning, kommunikasjon</em>
          </h1>
        </header>

        <div className="grid grid-cols-[430px_1fr] gap-8">
          {/* MinorGate */}
          <section>
            <div className="mb-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Mindreårig-gate (GDPR)</div>
            <MinorGate />
          </section>

          {/* Approvals */}
          <section>
            <div className="mb-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Godkjenninger</div>
            <div className="space-y-3">
              {approvals.map((a, i) => <ApprovalCard key={i} request={a} />)}
            </div>
          </section>
        </div>

        {/* Communication */}
        <div className="grid grid-cols-[1fr_360px] gap-8">
          <section>
            <div className="mb-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Coach → foreldre</div>
            <MessageComposer recipients={["Alle foreldre · GFGK junior", "Eva Mor"]} />
          </section>
          <section>
            <div className="mb-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Kvitteringer</div>
            <div className="rounded-[12px] border border-border bg-card px-4 py-2">
              <ReadReceiptList receipts={receipts} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
