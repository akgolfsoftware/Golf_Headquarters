"use client";

import { useMemo, useState } from "react";
import { Sun, Users, Inbox, Calendar, Clock, ClipboardCheck, Settings } from "lucide-react";
import { AgencySidebar, type AgencyNavGroup } from "@/components/athletic/shell/agency-sidebar";
import { DataTable, type Column, type SortState } from "@/components/athletic/data-table";
import { Pagination } from "@/components/athletic/pagination";
import { StatusPill, type StatusTone } from "@/components/athletic/status-pill";
import { RoleBadge, PeriodeTag, SeverityDot } from "@/components/athletic/agency-tags";

// Bolk 1-demo: AgencySidebar + DataTable + indicators med mock-data.
// Isolert _dev-rute for visuell verifisering mot docs/agency-build/preview/.

const groups: AgencyNavGroup[] = [
  {
    label: "Daglig",
    items: [
      { href: "/admin/brief", label: "Daglig brief", icon: Sun, primary: true, badge: { value: 4, tone: "lime" } },
      { href: "/intern/komponenter/agency-kit", label: "Stallen", icon: Users, primary: true, badge: { value: 38 } },
      { href: "/admin/innboks", label: "Innboks", icon: Inbox, badge: { value: 4, tone: "alert" } },
    ],
  },
  {
    label: "Planlegging",
    items: [
      { href: "/admin/kalender", label: "Kalender", icon: Calendar, kbd: "⌘1" },
      { href: "/admin/bookinger", label: "Bookinger", icon: Clock, badge: { value: 12 } },
    ],
  },
  {
    label: "Utvikling",
    items: [
      { href: "/admin/tester", label: "Tester", icon: ClipboardCheck, badge: { value: 7 } },
      { href: "/admin/drift", label: "Drift", icon: Settings },
    ],
  },
];

type Player = {
  id: string;
  initials: string;
  name: string;
  group: "WANG" | "GFGK" | "AKA";
  okter: number;
  sg: number;
  status: { tone: StatusTone; label: string };
  sev: "hi" | "md" | "lo" | "ok";
  periode: "GRUNN" | "SPES" | "TURN";
};

const PLAYERS: Player[] = [
  { id: "1", initials: "ØR", name: "Øyvind Rohjan", group: "WANG", okter: 12, sg: 0.42, status: { tone: "behind", label: "2 økter bak" }, sev: "hi", periode: "TURN" },
  { id: "2", initials: "SK", name: "Sofie K.", group: "GFGK", okter: 8, sg: -0.18, status: { tone: "guide", label: "Ønsker veiledning" }, sev: "md", periode: "SPES" },
  { id: "3", initials: "KL", name: "Karl Ludvig", group: "GFGK", okter: 15, sg: 0.31, status: { tone: "active", label: "Aktiv" }, sev: "ok", periode: "TURN" },
  { id: "4", initials: "EB", name: "Emilie B.", group: "AKA", okter: 6, sg: 0.05, status: { tone: "active", label: "Aktiv" }, sev: "lo", periode: "GRUNN" },
  { id: "5", initials: "JH", name: "Jonas H.", group: "GFGK", okter: 0, sg: -0.44, status: { tone: "inactive", label: "5 dg inaktiv" }, sev: "hi", periode: "GRUNN" },
  { id: "6", initials: "TN", name: "Tuva N.", group: "WANG", okter: 11, sg: 0.22, status: { tone: "active", label: "Aktiv" }, sev: "ok", periode: "SPES" },
  { id: "7", initials: "OA", name: "Ola A.", group: "AKA", okter: 9, sg: 0.14, status: { tone: "warn", label: "Test forfalt" }, sev: "md", periode: "GRUNN" },
];

const fmt = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2).replace(".", ",")}`;

export default function AgencyKitDemo() {
  const [mode, setMode] = useState<"expanded" | "rail">("expanded");
  const [sort, setSort] = useState<SortState>({ key: "okter", dir: "desc" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return PLAYERS;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...PLAYERS].sort((a, b) => {
      const av = a[sort.key as keyof Player];
      const bv = b[sort.key as keyof Player];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [sort]);

  const columns: Column<Player>[] = [
    {
      key: "name", header: "Spiller", sortable: true, width: "1fr",
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary font-display text-[10px] font-bold text-foreground">{p.initials}</span>
          <span className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{p.name}</span>
            <PeriodeTag kind={p.periode} />
          </span>
        </div>
      ),
    },
    { key: "group", header: "Gruppe", sortable: true, render: (p) => <RoleBadge role={p.group === "WANG" ? "ASSISTENT" : p.group === "GFGK" ? "COACH" : "FYS"} /> },
    { key: "okter", header: "Økter 30d", sortable: true, align: "right", render: (p) => <span className="font-mono tabular-nums text-foreground">{p.okter}</span> },
    { key: "sg", header: "SG-trend", sortable: true, align: "right", render: (p) => <span className={`font-mono tabular-nums ${p.sg > 0 ? "text-success" : "text-destructive"}`}>{fmt(p.sg)}</span> },
    { key: "status", header: "Status", render: (p) => <StatusPill tone={p.status.tone}>{p.status.label}</StatusPill> },
    { key: "sev", header: "", align: "center", render: (p) => <SeverityDot level={p.sev} /> },
  ];

  return (
    <div className="flex h-screen bg-background">
      <AgencySidebar
        groups={groups}
        mode={mode}
        onToggle={() => setMode((m) => (m === "expanded" ? "rail" : "expanded"))}
        org={{ initials: "GF", name: "GFGK Akademi", sub: "38 spillere · pro" }}
        user={{ initials: "AK", name: "Andreas Kragerud", role: "Head coach", presence: "online" }}
        statusLine="4 ØKTER I DAG"
      />

      <main className="flex-1 overflow-auto p-8">
        <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          AgencyOS · Bolk 1-demo · sidebar + datatable + indicators
        </div>
        <h1 className="mb-6 font-display text-2xl font-bold tracking-tight text-foreground">
          Stallen — <em className="font-normal italic text-primary">38 spillere</em>
        </h1>

        <div className="overflow-hidden rounded-[12px] border border-border bg-card">
          <DataTable
            columns={columns}
            rows={sorted}
            rowId={(p) => p.id}
            sort={sort}
            onSort={setSort}
            selectable
            selected={selected}
            onToggle={(id) =>
              setSelected((s) => {
                const n = new Set(s);
                if (n.has(id)) n.delete(id);
                else n.add(id);
                return n;
              })
            }
            onToggleAll={(ids) => setSelected((s) => (s.size === ids.length ? new Set() : new Set(ids)))}
          />
          <Pagination page={page} pageSize={7} total={38} onPage={setPage} />
        </div>
      </main>
    </div>
  );
}
