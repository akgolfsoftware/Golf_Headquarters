/**
 * PILOT — CoachHQ Bulk Approve (modal)
 * Bygd direkte fra wireframe/design-files-v2/modaler-D/d07-bulk-approve.html
 * URL: /bulk-approve-demo
 *
 * Mock-data: 5 agent-anbefalinger til godkjenning, mai 2026.
 */

import { X, ChevronDown, AlertTriangle, ArrowRight } from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

interface Row {
  sev: "urgent" | "warning" | "info";
  initials: string;
  avatarCls: string;
  name: string;
  action: string;
  agent: string;
  conf: string;
  open?: boolean;
  detail?: { body: string; before: string; after: string };
}

const ROWS: Row[] = [
  {
    sev: "warning",
    initials: "MP",
    avatarCls: "bg-[#005840] text-accent",
    name: "Markus R Pedersen",
    action: "— Pauseuke anbefalt før Sørlandsåpent",
    agent: "Deload-agent",
    conf: "87 %",
    open: true,
    detail: {
      body: "14 dager trening uten pause. SG-trend flater ut siste 5 dager — anbefaler full deload uke 23 før Sørlandsåpent.",
      before: "Uke 23 · 4 TEK-økter",
      after: "Uke 23 · 0 økter (pause)",
    },
  },
  {
    sev: "info",
    initials: "EH",
    avatarCls: "bg-[#16A34A] text-accent",
    name: "Emma Holm",
    action: "— Ny fase klar · gå til SLAG-fokus",
    agent: "Periodisering-agent",
    conf: "92 %",
  },
  {
    sev: "warning",
    initials: "JT",
    avatarCls: "bg-[#5E5C57] text-accent",
    name: "Jon Tellefsen",
    action: "— TEK-volum bør reduseres 40 % → 28 %",
    agent: "Volum-agent",
    conf: "78 %",
  },
  {
    sev: "info",
    initials: "IL",
    avatarCls: "bg-[#F4C430] text-[#4a3a07]",
    name: "Ine Larsen",
    action: "— Putte-grunnlag ferdig · åpne for green-lesing",
    agent: "Progresjon-agent",
    conf: "89 %",
  },
  {
    sev: "urgent",
    initials: "SN",
    avatarCls: "bg-[#a83232] text-accent",
    name: "Sondre Nilsen",
    action: "— Skadetegn detektert · pause-økt tirsdag",
    agent: "Health-agent",
    conf: "94 %",
  },
];

export default function BulkApproveDemo() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[720px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 pb-5 pt-6">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              CoachHQ · Approvals · bulk-modus
            </div>
            <h2 className="mt-1.5 font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
              Godkjenn 5 anbefalinger
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Sender til 5 spillere · varsel går ut umiddelbart etter bekreftelse.
            </p>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="px-8 pb-2">
          <div className="flex flex-col gap-1.5 pt-4">
            {ROWS.map((r) => (
              <BulkItem key={r.initials} row={r} />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            <span>
              Felles merknad{" "}
              <span className="font-medium normal-case tracking-normal">
                — valgfri, sendes til alle 5
              </span>
            </span>
          </div>
          <textarea
            className="mt-2 min-h-[88px] w-full rounded-md border-[1.5px] border-border bg-card px-3.5 py-3 text-[14px] leading-relaxed text-foreground focus:border-primary focus:outline-none"
            placeholder="Skriv en kort melding hvis du vil legge til kontekst …"
          />
          <div className="mt-1 flex justify-end font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
            0 / 280
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-md border border-[rgba(244,196,48,0.3)] bg-[rgba(244,196,48,0.1)] px-3.5 py-3 font-mono text-[12px] leading-relaxed text-[#8a6608]">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
            <div>5 spillere får varsel umiddelbart. Du kan ikke angre etter at du har bekreftet.</div>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Avbryt
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Godkjenn alle · 5
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}

function BulkItem({ row }: { row: Row }) {
  const sevCls =
    row.sev === "urgent"
      ? "bg-[rgba(197,48,48,0.12)] text-[#a83232]"
      : row.sev === "warning"
        ? "bg-[rgba(244,196,48,0.18)] text-[#8a6608]"
        : "bg-primary/10 text-primary";
  const sevLabel = row.sev[0].toUpperCase() + row.sev.slice(1);
  return (
    <div
      className={`overflow-hidden rounded-xl border-[1.5px] bg-card ${row.open ? "border-primary" : "border-border"}`}
    >
      <div className="grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-3 px-3.5 py-3 cursor-pointer">
        <span className={`rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.06em] ${sevCls}`}>
          {sevLabel}
        </span>
        <span
          className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full font-display text-[11px] font-semibold italic ${row.avatarCls}`}
        >
          {row.initials}
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-display text-[14px] font-semibold -tracking-[0.005em] text-foreground">{row.name}</span>
          <span className="text-[13px] text-muted-foreground">{row.action}</span>
          <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.05em] text-primary">
            {row.agent}
          </span>
        </div>
        <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{row.conf}</span>
        <span className={`text-muted-foreground transition-transform ${row.open ? "rotate-180 text-primary" : ""}`}>
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>
      {row.open && row.detail && (
        <div className="-mt-px border-t border-dashed border-border px-3.5 pb-3.5 pt-3.5" style={{ paddingLeft: 56 }}>
          <p className="mb-2 text-[13px] leading-relaxed text-muted-foreground">{row.detail.body}</p>
          <div className="mt-1.5 flex items-center gap-2 font-mono text-[12px]">
            <span className="text-muted-foreground line-through">{row.detail.before}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-bold text-primary">{row.detail.after}</span>
          </div>
        </div>
      )}
    </div>
  );
}
