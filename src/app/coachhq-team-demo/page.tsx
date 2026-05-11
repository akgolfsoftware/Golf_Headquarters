/**
 * CoachHQ — Team (v2 m/ utvidet)
 * Bygd fra wireframe/design-files-v2/screens/25-coachhq-team.html
 * URL: /coachhq-team-demo
 *
 * Workload, vakt-rotasjon, swap-forespørsler. Hvem som har kapasitet,
 * hvem som står på vakt i kveld, hvem som ber om hjelp.
 */

import { AlertCircle, Plus, UserPlus } from "lucide-react";

type Role = "hc" | "co" | "junior";
type WorkloadTone = "ok" | "normal" | "warn" | "danger";

type Coach = {
  initials: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  isYou?: boolean;
  workload: { value: number; max: number; pct: number; tone: WorkloadTone };
  certs: { label: string; tone: "brand" | "spill" | "fys" | "warn" }[];
  shift: { label: string; tone: "tonight" | "swap" | "normal" | "off" };
};

const coaches: Coach[] = [
  {
    initials: "AK",
    name: "Anders Kristiansen",
    email: "anders@akgolf.no",
    role: "hc",
    avatarColor: "var(--primary, #005840)",
    isYou: true,
    workload: { value: 15, max: 20, pct: 75, tone: "ok" },
    certs: [{ label: "PGA·B", tone: "brand" }],
    shift: { label: "i kveld", tone: "tonight" },
  },
  {
    initials: "TA",
    name: "Tom Andersen",
    email: "tom@akgolf.no",
    role: "co",
    avatarColor: "#B8852A",
    workload: { value: 19, max: 20, pct: 95, tone: "danger" },
    certs: [
      { label: "PGA·A", tone: "brand" },
      { label: "TPI", tone: "spill" },
    ],
    shift: { label: "to 09–17", tone: "normal" },
  },
  {
    initials: "SP",
    name: "Sara Pedersen",
    email: "sara@akgolf.no",
    role: "co",
    avatarColor: "#005840",
    workload: { value: 11, max: 20, pct: 55, tone: "normal" },
    certs: [{ label: "PGA·B", tone: "brand" }],
    shift: { label: "swap?", tone: "swap" },
  },
  {
    initials: "MA",
    name: "Mette Aas",
    email: "mette@akgolf.no",
    role: "co",
    avatarColor: "#7a4e0e",
    workload: { value: 16, max: 20, pct: 80, tone: "warn" },
    certs: [
      { label: "PGA·A", tone: "brand" },
      { label: "FYS", tone: "fys" },
    ],
    shift: { label: "fr 13–18", tone: "normal" },
  },
  {
    initials: "JK",
    name: "Jonas Kristoffersen",
    email: "jonas@akgolf.no",
    role: "co",
    avatarColor: "#A32D2D",
    workload: { value: 12, max: 20, pct: 60, tone: "normal" },
    certs: [{ label: "PGA·B", tone: "brand" }],
    shift: { label: "ma 09–17", tone: "normal" },
  },
  {
    initials: "KS",
    name: "Kine Storaas",
    email: "kine@akgolf.no",
    role: "junior",
    avatarColor: "#0A1F18",
    workload: { value: 4, max: 10, pct: 40, tone: "ok" },
    certs: [{ label: "u/oppl.", tone: "warn" }],
    shift: { label: "helg", tone: "off" },
  },
  {
    initials: "PE",
    name: "Per Eikeland",
    email: "per@akgolf.no",
    role: "co",
    avatarColor: "#9C9990",
    workload: { value: 10, max: 20, pct: 50, tone: "ok" },
    certs: [
      { label: "PGA·B", tone: "brand" },
      { label: "MT", tone: "fys" },
    ],
    shift: { label: "on 09–17", tone: "normal" },
  },
];

type WeekDay = { d: string; coaches: string; you?: boolean; today?: boolean; off?: boolean };

const week: WeekDay[] = [
  { d: "MA 11", coaches: "AK · TA", you: true, today: true },
  { d: "TI 12", coaches: "TA · MA" },
  { d: "ON 13", coaches: "PE · SP" },
  { d: "TO 14", coaches: "AK · TA", you: true },
  { d: "FR 15", coaches: "MA · JK" },
  { d: "LØ 16", coaches: "– vakt –", off: true },
  { d: "SØ 17", coaches: "– vakt –", off: true },
];

export default function CoachhqTeamDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          CoachHQ · Team · uke 20 · mai 2026
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Teamet. <em className="italic text-muted-foreground">Hvem som har plass.</em>
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          7 coacher · 38 spillere fordelt. Tom er på 95 % — overvei å flytte
          spillere. Sara har bedt om bytte.
        </p>
      </header>

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        <Kpi label="Aktive coacher" value="7" delta="av 7" />
        <Kpi label="Spillere totalt" value="38" delta="5,4 / coach" />
        <Kpi label="Avg workload" value="68 %" delta="balansert" />
        <Kpi label="Pending swap" value="1" delta="Sara vs Tom" deltaTone="warn" />
      </div>

      <div className="grid grid-cols-[1fr_340px] items-start gap-6">
        {/* Coach-tabell */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Chip active>Alle coacher</Chip>
            <Chip>Hovedcoach</Chip>
            <Chip>Coach</Chip>
            <Chip>Junior</Chip>
            <Chip>↓ Workload</Chip>
            <button className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
              <UserPlus size={14} strokeWidth={1.5} />
              Inviter coach
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="grid grid-cols-[48px_220px_110px_1fr_100px_90px_24px] gap-4 border-b border-border bg-[var(--surface-alt,#F1EEE5)] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <div />
              <div>Coach</div>
              <div>Rolle</div>
              <div>Workload (spillere)</div>
              <div>Sertif.</div>
              <div className="text-right">Vakt</div>
              <div />
            </div>
            {coaches.map((coach) => (
              <CoachRow key={coach.email} coach={coach} />
            ))}
          </div>
        </div>

        {/* Right pane */}
        <aside className="sticky top-6 flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <div>
            <h3 className="font-display text-[16px] font-semibold text-foreground">
              Uke 20 · Vakt-rotasjon
            </h3>
            <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
              11.–17. mai
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {week.map((wd) => (
              <div
                key={wd.d}
                className={`flex aspect-square flex-col items-center gap-1 rounded-sm border px-1 pt-1.5 ${
                  wd.you
                    ? "border-primary/25 bg-primary/8"
                    : "border-[var(--line-soft,#EFEDE6)] bg-[var(--surface-alt,#F1EEE5)]"
                } ${wd.off ? "opacity-40" : ""} ${
                  wd.today ? "ring-2 ring-primary" : ""
                }`}
              >
                <span
                  className={`font-mono text-[9px] tracking-[0.04em] ${
                    wd.you ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {wd.d}
                </span>
                <span
                  className={`text-center font-mono text-[9px] font-semibold leading-tight ${
                    wd.you ? "text-primary" : "text-foreground"
                  }`}
                >
                  {wd.coaches}
                </span>
              </div>
            ))}
          </div>

          {/* Swap-card */}
          <div>
            <h4 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Innkommende swap
            </h4>
            <div className="rounded-md border border-primary/20 bg-primary/8 p-3.5">
              <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-primary">
                <span>Sara → Tom</span>
                <span className="font-normal normal-case tracking-normal text-muted-foreground">
                  10. mai · 14:32
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-foreground">
                <strong className="font-medium">Sara</strong> ber om bytte på{" "}
                <strong className="font-medium">torsdag 14. mai 09–17</strong>.
                Foreslår å ta hennes{" "}
                <strong className="font-medium">fredag 13–18</strong> i bytte.
                Tom har ikke svart.
              </p>
              <div className="mt-2.5 flex gap-2">
                <button className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90">
                  Godkjenn på Toms vegne
                </button>
                <button className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary">
                  Send påminnelse
                </button>
              </div>
            </div>
          </div>

          {/* Workload-tip */}
          <div>
            <h4 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Workload-tips
            </h4>
            <div className="flex gap-2.5 rounded-md border border-[#A32D2D]/20 bg-[#A32D2D]/6 p-3 text-[12px] leading-snug text-muted-foreground">
              <AlertCircle
                size={16}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0 text-[#A32D2D]"
              />
              <div>
                <strong className="font-medium text-foreground">
                  Tom er på 95 %.
                </strong>{" "}
                Vurder å flytte 2 spillere til Per (50 %) eller Sara (55 %).
              </div>
            </div>
          </div>

          {/* Anlegg-strip */}
          <div className="border-t border-border pt-3">
            <h4 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Lokasjoner
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <Chip>GFGK · 4 coacher</Chip>
              <Chip>Mulligan Borre · 2 coacher</Chip>
              <Chip>Mobil · 1 coach</Chip>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CoachRow({ coach }: { coach: Coach }) {
  const rowBg = coach.workload.tone === "danger"
    ? "bg-[#A32D2D]/4"
    : coach.isYou
      ? "bg-primary/4"
      : "bg-card";
  return (
    <div
      className={`grid grid-cols-[48px_220px_110px_1fr_100px_90px_24px] items-center gap-4 border-b border-[var(--line-soft,#EFEDE6)] px-5 py-4 text-[13px] last:border-b-0 hover:bg-[var(--surface-alt,#F1EEE5)]/60 ${rowBg}`}
    >
      <div
        className="grid h-10 w-10 place-items-center rounded-full font-mono text-[12px] font-semibold text-white"
        style={{ background: coach.avatarColor }}
      >
        {coach.initials}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1 truncate font-medium text-foreground">
          {coach.name}
          {coach.isYou && (
            <span className="font-mono text-[10px] font-normal text-primary">
              (deg)
            </span>
          )}
        </div>
        <div className="truncate font-mono text-[11px] text-muted-foreground">
          {coach.email}
        </div>
      </div>
      <div>
        <RolePill role={coach.role} />
      </div>
      <div className="flex items-center gap-2.5">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-alt,#F1EEE5)]">
          <div
            className={`absolute left-0 top-0 bottom-0 rounded-full ${workloadFill(coach.workload.tone)}`}
            style={{ width: `${coach.workload.pct}%` }}
          />
          <div
            className="absolute -top-1 -bottom-1 w-px bg-foreground/30"
            style={{ left: "88%" }}
          />
        </div>
        <span
          className={`min-w-[54px] text-right font-mono text-[11px] tabular-nums ${
            coach.workload.tone === "danger"
              ? "text-[#A32D2D]"
              : "text-foreground"
          }`}
        >
          {coach.workload.value} / {coach.workload.max}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {coach.certs.map((c) => (
          <CertPill key={c.label} tone={c.tone}>
            {c.label}
          </CertPill>
        ))}
      </div>
      <div className="flex justify-end">
        <ShiftPill tone={coach.shift.tone}>{coach.shift.label}</ShiftPill>
      </div>
      <div className="text-center text-muted-foreground">›</div>
    </div>
  );
}

function RolePill({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    hc: "bg-primary text-primary-foreground",
    co: "bg-primary/8 text-primary border border-primary/20",
    junior: "bg-[#E8E5DC] text-muted-foreground",
  };
  const labels: Record<Role, string> = {
    hc: "Hovedcoach",
    co: "Coach",
    junior: "Junior",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${styles[role]}`}
    >
      {labels[role]}
    </span>
  );
}

function CertPill({
  tone,
  children,
}: {
  tone: "brand" | "spill" | "fys" | "warn";
  children: React.ReactNode;
}) {
  const styles = {
    brand: "bg-primary/8 text-primary border-primary/20",
    spill:
      "bg-[var(--color-pyr-spill,#B8852A)]/10 text-[#7a4e0e] border-[var(--color-pyr-spill,#B8852A)]/25",
    fys: "bg-primary/6 text-foreground border-primary/15",
    warn: "bg-[var(--color-pyr-spill,#B8852A)]/10 text-[#7a4e0e] border-[var(--color-pyr-spill,#B8852A)]/25",
  };
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function ShiftPill({
  tone,
  children,
}: {
  tone: "tonight" | "swap" | "normal" | "off";
  children: React.ReactNode;
}) {
  const styles = {
    tonight: "bg-primary/8 text-primary border-primary/25",
    swap: "bg-[var(--color-pyr-spill,#B8852A)]/10 text-[#7a4e0e] border-[var(--color-pyr-spill,#B8852A)]/25",
    normal:
      "bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground border-border",
    off: "bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground border-border opacity-40",
  };
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function Kpi({
  label,
  value,
  delta,
  deltaTone,
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone?: "warn";
}) {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-3.5">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-[24px] font-medium tabular-nums tracking-tight">
        {value}
      </div>
      <div
        className={`mt-0.5 font-mono text-[11px] ${
          deltaTone === "warn" ? "text-[#A32D2D]" : "text-muted-foreground"
        }`}
      >
        {delta}
      </div>
    </div>
  );
}

function Chip({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

// Suppress unused warnings (defensive: keep Plus available for future button)
void Plus;

function workloadFill(tone: WorkloadTone): string {
  switch (tone) {
    case "ok":
      return "bg-[var(--status-success,#1A7D56)]";
    case "warn":
      return "bg-[var(--status-warning,#B8852A)]";
    case "danger":
      return "bg-[#A32D2D]";
    default:
      return "bg-primary";
  }
}
