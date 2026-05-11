/**
 * PILOT — Notifikasjons-taksonomi
 * Bygd fra wireframe/design-files-v2/screens/23-shared-notif-taksonomi.html
 * URL: /notif-taksonomi-demo
 *
 * Admin-skjerm: katalog over alle 28 varslings-typer plattformen kan sende.
 */

import { Bell, Mail, MessageSquare, Plus, Search } from "lucide-react";

type Channel = "push" | "email" | "sms";
type Status = "Aktiv" | "Draft" | "Deprecated";
type Cat = "Booking" | "Plan" | "Health" | "Billing" | "System" | "Marketing";

interface NotifRow {
  id: string;
  cat: Cat;
  audience: string;
  channels: Channel[];
  volume: string;
  status: Status;
  dead?: boolean;
}

const ROWS: NotifRow[] = [
  { id: "booking.confirmed", cat: "Booking", audience: "Spiller, Forelder", channels: ["push", "email"], volume: "1 240", status: "Aktiv" },
  { id: "booking.cancelled", cat: "Booking", audience: "Spiller, Coach", channels: ["push", "email", "sms"], volume: "84", status: "Aktiv" },
  { id: "booking.reminder.24h", cat: "Booking", audience: "Spiller", channels: ["push"], volume: "1 180", status: "Aktiv" },
  { id: "plan.published", cat: "Plan", audience: "Spiller", channels: ["push", "email"], volume: "47", status: "Aktiv" },
  { id: "plan.action.urgent", cat: "Plan", audience: "Coach", channels: ["push", "sms"], volume: "23", status: "Aktiv" },
  { id: "health.injury.logged", cat: "Health", audience: "Coach", channels: ["push"], volume: "14", status: "Aktiv" },
  { id: "billing.payment.failed", cat: "Billing", audience: "Spiller, Forelder, Admin", channels: ["push", "email", "sms"], volume: "3", status: "Aktiv" },
  { id: "system.security.suspicious", cat: "System", audience: "Bruker, Admin", channels: ["push", "email"], volume: "1", status: "Aktiv" },
  { id: "agent.recommendation.deload", cat: "Plan", audience: "Coach", channels: ["push"], volume: "12", status: "Aktiv" },
  { id: "agent.recommendation.escalation", cat: "Plan", audience: "Coach", channels: ["push", "sms"], volume: "4", status: "Aktiv" },
  { id: "tournament.signup.open", cat: "Booking", audience: "Spiller", channels: ["push", "email"], volume: "—", status: "Draft" },
  { id: "marketing.newsletter.monthly", cat: "Marketing", audience: "Spiller (opt-in)", channels: ["email"], volume: "0", status: "Aktiv", dead: true },
  { id: "legacy.email.welcome", cat: "System", audience: "Spiller", channels: ["email"], volume: "—", status: "Deprecated" },
];

const STATS = [
  { label: "booking.confirmed", count: "1 240", pct: 100 },
  { label: "booking.reminder.24h", count: "1 180", pct: 95 },
  { label: "marketing.newsletter", count: "380", pct: 32 },
  { label: "plan.published", count: "47", pct: 6 },
  { label: "billing.invoice.sent", count: "47", pct: 6 },
];

export default function NotifTaksonomiDemo() {
  return (
    <div className="min-h-screen bg-background px-10 py-10 text-foreground">
      <div className="mx-auto max-w-[1280px]">
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Admin · Notifikasjoner · Taksonomi
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Varsler. <em className="font-normal italic">28 typer. Hver med sin grunn.</em>
          </h1>
          <p className="mt-3 max-w-[680px] text-[14px] text-muted-foreground">
            Plattformens katalog over varslings-typer. Klikk en rad for å se mal, locale-varianter og send en test-melding.
          </p>
        </header>

        <div className="grid grid-cols-[1fr_320px] items-start gap-6">
          {/* Tabell */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                <input
                  className="w-[200px] bg-transparent text-[12px] outline-none placeholder:text-muted-foreground"
                  placeholder="Søk notif-id eller tekst"
                />
              </div>
              <Chip>Kategori: alle</Chip>
              <Chip>Audience: alle</Chip>
              <Chip>Kanal: alle</Chip>
              <Chip>Status: aktiv + draft</Chip>
              <button className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Ny notif-type
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="grid grid-cols-[1.4fr_100px_1fr_120px_80px_90px] gap-3 border-b border-border bg-secondary/40 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                <div>ID</div>
                <div>Kategori</div>
                <div>Audience</div>
                <div>Kanaler</div>
                <div className="text-right">Volum 30d</div>
                <div className="text-right">Status</div>
              </div>
              <div className="divide-y divide-border">
                {ROWS.map((r) => (
                  <div
                    key={r.id}
                    className={`grid grid-cols-[1.4fr_100px_1fr_120px_80px_90px] items-center gap-3 px-4 py-3 ${
                      r.dead ? "bg-[#FFF7E8]/50" : r.status === "Deprecated" ? "opacity-50" : "hover:bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: catColor(r.cat) }} />
                      <span className="font-mono text-[12px] text-foreground">{r.id}</span>
                    </div>
                    <div className="text-[12px] text-muted-foreground">{r.cat}</div>
                    <div className="text-[12px] text-muted-foreground">{r.audience}</div>
                    <div className="flex gap-1">
                      {r.channels.map((c) => (
                        <ChannelIcon key={c} channel={c} />
                      ))}
                    </div>
                    <div className={`text-right font-mono text-[12px] tabular-nums ${r.dead ? "text-[#B8852A]" : "text-foreground"}`}>
                      {r.volume}
                    </div>
                    <div className="text-right">
                      <StatusPill status={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statistikk */}
          <aside className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-display text-[15px] font-semibold tracking-tight">Statistikk</h3>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">Siste 30 dager</div>
            <div className="mt-4 font-display text-[32px] font-medium leading-none tracking-tight tabular-nums">4 248</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">Totalt sendt</div>

            <div className="mt-5 divide-y divide-border">
              <RateRow label="Åpningsrate (e-post)" value="62 %" />
              <RateRow label="Klikkrate (push)" value="18 %" />
              <RateRow label="SMS-leveringsrate" value="100 %" />
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Topp 5 mest sendte</h4>
              <div className="mt-3 flex flex-col gap-2.5">
                {STATS.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] text-foreground">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="relative h-1 w-[50px] overflow-hidden rounded-full bg-secondary">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${s.pct}%` }} />
                      </div>
                      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{s.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function catColor(cat: Cat): string {
  const map: Record<Cat, string> = {
    Booking: "#7a4e0e",
    Plan: "#005840",
    Health: "#A32D2D",
    Billing: "#B8852A",
    System: "#0A1F18",
    Marketing: "#9C9990",
  };
  return map[cat];
}

function ChannelIcon({ channel }: { channel: Channel }) {
  const map = {
    push: { icon: Bell, bg: "bg-primary/15", color: "text-primary" },
    email: { icon: Mail, bg: "bg-[#FFF0D6]", color: "text-[#B8852A]" },
    sms: { icon: MessageSquare, bg: "bg-accent/40", color: "text-accent-foreground" },
  };
  const { icon: Icon, bg, color } = map[channel];
  return (
    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${bg} ${color}`}>
      <Icon className="h-3 w-3" strokeWidth={1.5} />
    </span>
  );
}

function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Aktiv: "bg-[#E5F1EA] text-[#1A7D56]",
    Draft: "bg-[#FFF0D6] text-[#B8852A]",
    Deprecated: "bg-secondary text-muted-foreground",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[status]}`}>{status}</span>;
}

function RateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
      {children}
    </span>
  );
}
