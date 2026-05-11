/**
 * PILOT — Tilgangskontroll · alle brukere
 * Bygd fra wireframe/design-files-v2/screens/22-shared-tilgangskontroll.html
 * URL: /tilgang-demo
 *
 * Admin-skjerm: liste over aktive brukere, roller, scopes, audit-log.
 */

import { ChevronRight, MoreHorizontal, Plus, Search } from "lucide-react";

interface UserRow {
  initials: string;
  name: string;
  email: string;
  role: "Admin" | "Hovedcoach" | "Coach" | "Spiller" | "Forelder" | "Klubb" | "Pending";
  scope: string;
  lastActive: string;
  capCount: string;
  color: string;
  you?: boolean;
  pending?: boolean;
}

const USERS: UserRow[] = [
  { initials: "AK", name: "Anders Kristiansen", email: "anders@akgolf.no", role: "Admin", scope: "Alle klubber", lastActive: "Nå", capCount: "49 / 49", color: "#005840", you: true },
  { initials: "SP", name: "Sara Pedersen", email: "sara@akgolf.no", role: "Hovedcoach", scope: "GFGK + Mulligan", lastActive: "I dag 09:14", capCount: "32 / 49", color: "#005840" },
  { initials: "TN", name: "Tom Nilsen", email: "tom@akgolf.no", role: "Coach", scope: "Mulligan", lastActive: "For 2 t siden", capCount: "18 / 49", color: "#B8852A" },
  { initials: "MR", name: "Markus Roinås Pedersen", email: "markus@gmail.com", role: "Spiller", scope: "GFGK · Pro", lastActive: "For 30 min siden", capCount: "8 / 49", color: "#A32D2D" },
  { initials: "AP", name: "Anne Pedersen", email: "anne.pedersen@online.no", role: "Forelder", scope: "Markus (1 barn)", lastActive: "I går 22:14", capCount: "4 / 49", color: "#7a4e0e" },
  { initials: "BA", name: "Bossum GK Admin", email: "admin@bossum-gk.no", role: "Klubb", scope: "Bossum GK", lastActive: "For 4 dager siden", capCount: "12 / 49", color: "#0A1F18" },
  { initials: "?", name: "(Pending invitasjon)", email: "ny@mulligan.no", role: "Pending", scope: "Mulligan", lastActive: "Aldri", capCount: "—", color: "#9C9990", pending: true },
  { initials: "ES", name: "Emma Solberg", email: "emma.solberg@gmail.com", role: "Spiller", scope: "Mulligan · Pro", lastActive: "For 6 dager siden", capCount: "8 / 49", color: "#005840" },
];

const AUDIT = [
  { when: "11. mai 14:32 · Anders K.", txt: "Sara fikk plan.publish" },
  { when: "11. mai 09:14 · System", txt: "Tom logget inn fra ny enhet (iPhone, Fredrikstad)" },
  { when: "10. mai 16:42 · Anders K.", txt: "Anne fikk player.read.own for Markus" },
  { when: "10. mai 11:08 · System", txt: "3 pending-invitasjoner sendt" },
  { when: "08. mai 09:18 · Anders K.", txt: "Markus' plan.read.all tilbakekalt" },
  { when: "07. mai 18:22 · System", txt: "Bossum GK Admin nådde 30 dager uten innlogging" },
];

export default function TilgangDemo() {
  return (
    <div className="min-h-screen bg-background px-10 py-10 text-foreground">
      <div className="mx-auto max-w-[1280px]">
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Admin · Tilgang
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Brukerne. <em className="font-normal italic">Hvem har nøkkel.</em>
          </h1>
          <p className="mt-3 max-w-[680px] text-[14px] text-muted-foreground">
            8 aktive brukere fordelt på 3 klubber. Velg en eller flere for å endre rolle, scope eller suspendere.
          </p>
        </header>

        {/* KPI-strip */}
        <div className="mb-6 grid grid-cols-4 gap-3">
          <Kpi label="Aktive brukere" value="47" delta="+3 siste 30d" tone="default" />
          <Kpi label="Pending invitasjoner" value="3" delta="1 utløpt" tone="warn" />
          <Kpi label="Inaktive > 90d" value="5" delta="vurder opprydding" tone="muted" />
          <Kpi label="Admin-rolle" value="2" delta="Anders + Sara" tone="muted" />
        </div>

        <div className="grid grid-cols-[1fr_320px] items-start gap-6">
          {/* Brukerliste */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                <input
                  className="w-[240px] bg-transparent text-[12px] outline-none placeholder:text-muted-foreground"
                  placeholder="Søk navn, e-post eller rolle"
                />
              </div>
              <Chip>Rolle: alle</Chip>
              <Chip>Status: alle</Chip>
              <Chip>Scope: alle</Chip>
              <Chip mono>↓ Sist aktiv</Chip>
              <button className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Inviter bruker
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="grid grid-cols-[24px_1.6fr_120px_1fr_140px_120px_32px] gap-3 border-b border-border bg-secondary/40 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                <div></div>
                <div>Bruker</div>
                <div>Rolle</div>
                <div>Scope</div>
                <div>Sist aktiv</div>
                <div>Capabilities</div>
                <div></div>
              </div>
              <div className="divide-y divide-border">
                {USERS.map((u) => (
                  <div
                    key={u.email}
                    className={`grid grid-cols-[24px_1.6fr_120px_1fr_140px_120px_32px] items-center gap-3 px-4 py-3 ${
                      u.you ? "bg-accent/10" : u.pending ? "bg-[#FFF7E8]/40" : "hover:bg-secondary/30"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-sm border border-border ${u.you ? "opacity-30" : ""}`} />
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-[10px] font-semibold text-white"
                        style={{ background: u.color }}
                      >
                        {u.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                          {u.name}
                          {u.you && <span className="font-mono text-[10px] text-primary">(deg)</span>}
                        </div>
                        <div className="truncate font-mono text-[11px] text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                    <div>
                      <RolePill role={u.role} />
                    </div>
                    <div className="text-[12px] text-muted-foreground">{u.scope}</div>
                    <div className="text-[12px] text-muted-foreground">{u.lastActive}</div>
                    <div className="inline-flex items-center gap-1 font-mono text-[12px] tabular-nums text-foreground">
                      {u.capCount}
                      <ChevronRight className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <button className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary">
                      <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit-log */}
          <aside className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <h3 className="font-display text-[15px] font-semibold tracking-tight">Live audit-log</h3>
            </div>
            <div className="flex flex-col gap-3">
              {AUDIT.map((a, i) => (
                <div key={i} className="flex flex-col gap-0.5 border-b border-border pb-3 last:border-b-0">
                  <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">{a.when}</span>
                  <span className="text-[12px] leading-relaxed text-foreground">{a.txt}</span>
                </div>
              ))}
            </div>
            <button className="mt-3 text-[12px] font-medium text-primary hover:underline">
              Se full audit-log
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: "default" | "warn" | "muted" }) {
  const deltaCls = tone === "warn" ? "text-[#B8852A]" : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-[28px] font-medium leading-none tracking-tight tabular-nums">{value}</div>
      <div className={`mt-1.5 text-[11px] ${deltaCls}`}>{delta}</div>
    </div>
  );
}

function RolePill({ role }: { role: UserRow["role"] }) {
  const styles: Record<UserRow["role"], string> = {
    Admin: "bg-foreground text-accent",
    Hovedcoach: "bg-primary/15 text-primary",
    Coach: "bg-[#FFF0D6] text-[#B8852A]",
    Spiller: "bg-accent/40 text-accent-foreground",
    Forelder: "bg-secondary text-muted-foreground",
    Klubb: "bg-[#E5E1F0] text-[#5848A8]",
    Pending: "bg-[#F1EEE5] text-muted-foreground italic",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${styles[role]}`}>{role}</span>;
}

function Chip({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground ${
        mono ? "font-mono" : ""
      }`}
    >
      {children}
    </span>
  );
}
