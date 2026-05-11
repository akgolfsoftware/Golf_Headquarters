/**
 * PILOT — CBAC-matrise (rolle × capability)
 * Bygd fra wireframe/design-files-v2/screens/21-shared-cbac-matrise.html
 * URL: /cbac-matrise-demo
 *
 * Admin-skjerm for Anders: gi/fjerne tilgang per capability per rolle.
 */

import { Download, Plus, Search, Star } from "lucide-react";

type Cell = "granted" | "override" | "denied";

interface CapRow {
  cap: string;
  destructive?: boolean;
  cells: Cell[];
}

interface CapSection {
  title: string;
  rows: CapRow[];
}

const ROLES = [
  { label: "Coach", count: 18 },
  { label: "Hovedcoach", count: 32 },
  { label: "Admin", count: 49 },
  { label: "Spiller", count: 8 },
  { label: "Forelder", count: 4 },
  { label: "Klubb", count: 12 },
];

const SECTIONS: CapSection[] = [
  {
    title: "Plans",
    rows: [
      { cap: "plan.read.own", cells: ["granted", "granted", "granted", "granted", "denied", "denied"] },
      { cap: "plan.read.all", cells: ["denied", "granted", "granted", "denied", "denied", "denied"] },
      { cap: "plan.create", cells: ["granted", "granted", "granted", "denied", "denied", "denied"] },
      { cap: "plan.publish", cells: ["denied", "override", "granted", "denied", "denied", "denied"] },
      { cap: "plan.delete", destructive: true, cells: ["denied", "denied", "granted", "denied", "denied", "denied"] },
    ],
  },
  {
    title: "Players",
    rows: [
      { cap: "player.read.own", cells: ["granted", "granted", "granted", "granted", "granted", "denied"] },
      { cap: "player.read.club", cells: ["granted", "granted", "granted", "denied", "denied", "granted"] },
      { cap: "player.invite", cells: ["granted", "granted", "granted", "denied", "denied", "granted"] },
      { cap: "player.delete", destructive: true, cells: ["denied", "denied", "granted", "denied", "denied", "denied"] },
    ],
  },
  {
    title: "Billing",
    rows: [
      { cap: "billing.read.own", cells: ["denied", "denied", "granted", "granted", "granted", "denied"] },
      { cap: "billing.write", cells: ["denied", "denied", "granted", "denied", "denied", "denied"] },
    ],
  },
  {
    title: "Settings",
    rows: [
      { cap: "settings.cbac.write", destructive: true, cells: ["denied", "denied", "granted", "denied", "denied", "denied"] },
      { cap: "settings.api.create", cells: ["denied", "denied", "granted", "denied", "denied", "denied"] },
    ],
  },
];

const OVERRIDES = [
  { initials: "SL", name: "Sara Pedersen", role: "Hovedcoach · GFGK", cap: "plan.publish", action: "granted", at: "12. mar 14:32", color: "#005840" },
  { initials: "TN", name: "Tom Nilsen", role: "Coach · Mulligan", cap: "player.invite", action: "granted", at: "03. apr 09:18", color: "#B8852A" },
  { initials: "AP", name: "Anne Pedersen", role: "Forelder · Markus", cap: "billing.read.own", action: "granted", at: "28. feb 19:44", color: "#7a4e0e" },
  { initials: "MR", name: "Markus Roinås Pedersen", role: "Spiller · Pro", cap: "plan.read.all", action: "revoked", at: "22. apr 11:02", color: "#A32D2D" },
];

export default function CbacMatriseDemo() {
  return (
    <div className="min-h-screen bg-background px-10 py-10 text-foreground">
      <div className="mx-auto max-w-[1280px]">
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Admin · Tilgang · CBAC-matrise
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Tilgang. <em className="font-normal italic">Hvem ser hva.</em>
          </h1>
          <p className="mt-3 max-w-[680px] text-[14px] text-muted-foreground">
            Klikk en celle for å gi eller fjerne tilgang. Destruktive endringer krever bekreftelse.
            Anders Kristiansen er super-admin og kan endre alle rader.
          </p>
        </header>

        {/* Filter-rad */}
        <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
          <div className="flex overflow-hidden rounded-md border border-border">
            <button className="bg-secondary px-3 py-1.5 text-[12px] font-medium text-foreground">Per rolle</button>
            <button className="border-l border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-secondary/50">Per capability</button>
            <button className="border-l border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-secondary/50">
              Per bruker <span className="ml-1 font-mono text-[10px] text-muted-foreground/70">7</span>
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-[12px]">
            <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
            <input className="bg-transparent text-[12px] outline-none placeholder:text-muted-foreground" placeholder="Søk capability" />
          </div>
          <Chip>Seksjon: alle</Chip>
          <Chip>Vis: alle</Chip>
          <div className="ml-auto flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-medium hover:bg-secondary">
              <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
              Eksporter CSV
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Ny rolle
            </button>
          </div>
        </div>

        {/* Matrise */}
        <div className="mb-8 overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  Capability
                </th>
                {ROLES.map((r) => (
                  <th key={r.label} className="px-3 py-3 text-center">
                    <div className="text-[13px] font-medium text-foreground">{r.label}</div>
                    <div className="font-mono text-[10px] tabular-nums text-muted-foreground">{r.count} cap</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map((sec) => (
                <>
                  <tr key={`sec-${sec.title}`} className="border-b border-border bg-background">
                    <td colSpan={7} className="px-5 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {sec.title}
                    </td>
                  </tr>
                  {sec.rows.map((row) => (
                    <tr key={row.cap} className="border-b border-border last:border-b-0">
                      <td className="px-5 py-2.5">
                        <span className="font-mono text-[12px] text-foreground">{row.cap}</span>
                        {row.destructive && (
                          <span className="ml-2 rounded-sm bg-[#FBE9E9] px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.04em] text-destructive">
                            Destruktiv
                          </span>
                        )}
                      </td>
                      {row.cells.map((c, idx) => (
                        <td key={idx} className="border-l border-border px-3 py-2.5 text-center">
                          <CellMark cell={c} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Override-panel */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-display text-[18px] font-semibold tracking-tight">Aktive overrides</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              Brukere med capabilities utover sin rolle-default
            </span>
            <span className="ml-auto rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {OVERRIDES.length} aktive
            </span>
          </div>
          <div className="divide-y divide-border">
            {OVERRIDES.map((o) => (
              <div key={o.name} className="grid grid-cols-[1fr_240px_140px_80px] items-center gap-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-[10px] font-semibold text-white"
                    style={{ background: o.color }}
                  >
                    {o.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-foreground">{o.name}</div>
                    <div className="text-[11px] text-muted-foreground">{o.role}</div>
                  </div>
                </div>
                <div className="font-mono text-[12px] text-muted-foreground">
                  {o.cap}{" "}
                  <span className={o.action === "granted" ? "text-[#1A7D56]" : "text-destructive"}>
                    {o.action === "granted" ? "+granted" : "−revoked"}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground">{o.at}</div>
                <button className="text-right text-[12px] font-medium text-primary hover:underline">Rediger</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CellMark({ cell }: { cell: Cell }) {
  if (cell === "granted") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 font-mono text-[14px] font-medium text-primary">
        ✓
      </span>
    );
  }
  if (cell === "override") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center gap-0.5 rounded-md bg-[#FFF0D6] font-mono text-[12px] font-medium text-[#B8852A]">
        ✓
        <Star className="h-2.5 w-2.5 fill-current" strokeWidth={1.5} />
      </span>
    );
  }
  return <span className="text-muted-foreground/40">–</span>;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
      {children}
    </span>
  );
}
