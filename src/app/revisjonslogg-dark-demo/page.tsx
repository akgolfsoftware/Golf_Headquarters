/**
 * PILOT — CoachHQ Revisjonslogg
 * Bygd fra wireframe/design-files-v2/04-revisjonslogg-dark.html
 * URL: /revisjonslogg-dark-demo
 */
import {
  Copy,
  Download,
  Pencil,
  Plus,
  Search,
  ShieldOff,
  ShieldCheck,
  Trash2,
  Bot,
  ChevronDown,
} from "lucide-react";

type EvtType = "create" | "update" | "delete" | "auth" | "agent" | "auth-fail";

type Evt = {
  id: string;
  time: string;
  type: EvtType;
  title: React.ReactNode;
  meta: string[];
  failed?: boolean;
  diffLabel?: string;
};

const DAY_1: { date: string; weekday: string; count: number; events: Evt[] } = {
  date: "11. mai 2026",
  weekday: "onsdag",
  count: 6,
  events: [
    {
      id: "1",
      time: "14:32:18",
      type: "update",
      title: (
        <>
          <b>
            <a href="#" className="text-primary underline-offset-2 hover:underline">
              Anders Kristiansen
            </a>
          </b>{" "}
          oppdaterte plan <b>«Sommer-toppform»</b> for{" "}
          <b>
            <a href="#" className="text-primary underline-offset-2 hover:underline">
              Markus Roinås Pedersen
            </a>
          </b>
        </>
      ),
      diffLabel: "Vis endring",
      meta: ["192.168.1.84", "Mac · Chrome 134", "CBAC: Hovedcoach", "req: 4f8a-2c91"],
    },
    {
      id: "2",
      time: "13:58:04",
      type: "agent",
      title: (
        <>
          <b>Periodiserings-agent</b> foreslo pauseuke for{" "}
          <b>
            <a href="#" className="text-primary underline-offset-2 hover:underline">
              Markus Roinås Pedersen
            </a>
          </b>{" "}
          før Sørlandsåpent · venter på godkjenning
        </>
      ),
      meta: ["system", "agent-pipeline v2.3.1", "conf: 0,87", "req: ag-92f1-bb14"],
    },
    {
      id: "3",
      time: "11:42:51",
      type: "create",
      title: (
        <>
          <b>
            <a href="#" className="text-primary underline-offset-2 hover:underline">
              Sara Pedersen
            </a>
          </b>{" "}
          registrerte ny spiller <b>«Tobias Lindberg»</b> i kategori A
        </>
      ),
      meta: ["192.168.1.91", "Win · Edge 128", "CBAC: Coach", "req: 8b1d-7a44"],
    },
    {
      id: "4",
      time: "10:18:33",
      type: "delete",
      title: (
        <>
          <b>
            <a href="#" className="text-primary underline-offset-2 hover:underline">
              Anders Kristiansen
            </a>
          </b>{" "}
          slettet booking <b>«Studio 3 · 11.05 14:00»</b> · årsak: fasilitet under
          vedlikehold
        </>
      ),
      diffLabel: "Vis raw JSON",
      meta: ["192.168.1.84", "Mac · Chrome 134", "CBAC: Hovedcoach", "req: 2c91-4f8a"],
    },
    {
      id: "5",
      time: "08:04:12",
      type: "auth",
      title: (
        <>
          <b>
            <a href="#" className="text-primary underline-offset-2 hover:underline">
              Anders Kristiansen
            </a>
          </b>{" "}
          logget inn med passord + TOTP · 2FA godkjent
        </>
      ),
      meta: ["192.168.1.84", "Mac · Chrome 134", "session: 7e4a-…", "req: au-1d2f-9001"],
    },
    {
      id: "6",
      time: "02:14:08",
      type: "auth-fail",
      title: (
        <>
          <b>Ukjent</b> forsøkte å logge inn som <b>anders@akgolf.no</b> · feil passord
          (3/5 forsøk)
        </>
      ),
      failed: true,
      meta: ["185.34.219.12 · Romania", "Linux · curl/8.4", "Blokkert · IP rate-limit"],
    },
  ],
};

const DAY_2: { date: string; weekday: string; count: number; events: Evt[] } = {
  date: "10. mai 2026",
  weekday: "tirsdag",
  count: 4,
  events: [
    {
      id: "7",
      time: "16:48:22",
      type: "update",
      title: (
        <>
          <b>
            <a href="#" className="text-primary underline-offset-2 hover:underline">
              Anders Kristiansen
            </a>
          </b>{" "}
          endret pris-matrise for <b>«Mulligan · Studio 1»</b>
        </>
      ),
      diffLabel: "Vis endring",
      meta: ["192.168.1.84", "Mac · Chrome 134", "CBAC: Admin", "req: 6c11-3e09"],
    },
    {
      id: "8",
      time: "15:12:05",
      type: "update",
      title: (
        <>
          <b>
            <a href="#" className="text-primary underline-offset-2 hover:underline">
              Tom Andersen
            </a>
          </b>{" "}
          endret CBAC-rolle for{" "}
          <b>
            <a href="#" className="text-primary underline-offset-2 hover:underline">
              Sara Pedersen
            </a>
          </b>{" "}
          fra Coach → Hovedcoach
        </>
      ),
      meta: ["192.168.1.77", "Mac · Safari 17", "CBAC: Admin", "req: ad-2208-441b"],
    },
    {
      id: "9",
      time: "11:00:00",
      type: "agent",
      title: (
        <>
          <b>Faktura-agent</b> genererte 38 mai-fakturaer og merket for review
        </>
      ),
      meta: ["system", "cron: monthly-billing", "jobs ok: 38/38", "req: fa-mai-2026"],
    },
    {
      id: "10",
      time: "09:24:51",
      type: "create",
      title: (
        <>
          <b>
            <a href="#" className="text-primary underline-offset-2 hover:underline">
              Anders Kristiansen
            </a>
          </b>{" "}
          opprettet test-batch <b>«NGF screening · uke 20»</b> for 7 spillere
        </>
      ),
      meta: ["192.168.1.84", "Mac · Chrome 134", "CBAC: Hovedcoach", "req: t-ngf-2020"],
    },
  ],
};

export default function RevisjonsloggDarkDemo() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        {/* Hero */}
        <header className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              CoachHQ · Sikkerhet · Capability audit.read
            </div>
            <h1 className="mt-2 font-display text-[36px] leading-[1.1] tracking-tight">
              <em className="font-normal italic">
                1 247 hendelser siste 7 dager. Alt logget.
              </em>
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Compliance-verktøy · 8 aktører (5 mennesker, 3 agenter) · GDPR-eksport
              tilgjengelig
            </p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              <Copy className="h-4 w-4" />
              Kopier filter-link
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <Download className="h-4 w-4" />
              Eksporter
            </button>
          </div>
        </header>

        {/* KPI strip */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <Kpi label="Hendelser · 7d" value="1 247" delta="+12,3 %" deltaTone="up" foot="vs forrige uke" />
          <Kpi label="Aktive aktører" value="8" foot="5 mennesker · 3 agenter" />
          <Kpi
            label="Slett-hendelser"
            value="12"
            foot="Alle med årsak loggført"
            footTone="success"
          />
          <Kpi
            label="Sikkerhets-events"
            value="3"
            valueTone="warning"
            foot="mislyktede login · IP-allowlist"
          />
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="flex-1 text-[13.5px] text-muted-foreground">
            Søk aktør, entitet eller action
          </span>
          {["Alle handlinger", "Create", "Update", "Delete", "Auth", "Agent"].map(
            (c, i) => (
              <Chip key={c} active={i === 0}>
                {c}
              </Chip>
            )
          )}
          <span className="h-5 w-px bg-border" />
          <Chip>Aktør: alle</Chip>
          <Chip>Entitet: alle</Chip>
          <Chip>
            <span className="inline-flex items-center gap-1.5">
              Siste 7 dager
              <ChevronDown className="h-2.5 w-2.5" />
            </span>
          </Chip>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-[1fr_320px] gap-8 items-start">
          {/* Timeline */}
          <div>
            <DateHeader date={DAY_1.date} weekday={DAY_1.weekday} count={DAY_1.count} />
            <Timeline events={DAY_1.events} />

            <DateHeader date={DAY_2.date} weekday={DAY_2.weekday} count={DAY_2.count} />
            <Timeline events={DAY_2.events} />
          </div>

          {/* Rail */}
          <aside className="sticky top-6">
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-3.5 font-display text-[14px] font-semibold tracking-tight">
                Filter-oppsummering
              </h3>
              <div className="mb-4 text-[13px] text-muted-foreground">
                Viser{" "}
                <b className="font-mono font-medium text-foreground">47</b> hendelser
                siste 7 dager
              </div>

              <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
                Top aktører
              </div>
              <BarRow label="Anders K" pct={100} value={28} />
              <BarRow label="Sara P" pct={43} value={12} />
              <BarRow label="Periodiserings-agent" pct={25} value={7} accent />
              <BarRow label="Tom A" pct={14} value={4} />
              <BarRow label="Faktura-agent" pct={11} value={3} accent />

              <div className="mt-5 mb-2.5 font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
                Top entiteter
              </div>
              <BarRow label="Plan" pct={100} value={18} />
              <BarRow label="Spiller" pct={67} value={12} />
              <BarRow label="Booking" pct={56} value={10} />
              <BarRow label="Faktura" pct={28} value={5} />
              <BarRow label="Konfig" pct={11} value={2} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  deltaTone,
  valueTone,
  foot,
  footTone,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down";
  valueTone?: "warning";
  foot: string;
  footTone?: "success";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-[32px] font-medium leading-none tracking-tight tabular-nums ${
          valueTone === "warning" ? "text-[#B8852A]" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[12px]">
        {delta && (
          <span
            className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
              deltaTone === "up"
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {delta}
          </span>
        )}
        <span
          className={footTone === "success" ? "text-primary" : "text-muted-foreground"}
        >
          {foot}
        </span>
      </div>
    </div>
  );
}

function Chip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-medium ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function DateHeader({
  date,
  weekday,
  count,
}: {
  date: string;
  weekday: string;
  count: number;
}) {
  return (
    <div className="sticky top-0 z-[5] mt-6 mb-2 flex items-center gap-3.5 bg-background py-2">
      <span className="rounded-full bg-foreground px-3 py-1 font-display text-[13px] font-semibold tracking-tight text-background">
        {date} · {weekday}
      </span>
      <span className="text-[12px] text-muted-foreground">
        {count} hendelser{count > 4 ? " i dag" : ""}
      </span>
      <span className="ml-1 h-px flex-1 bg-border" />
    </div>
  );
}

function Timeline({ events }: { events: Evt[] }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
      {events.map((e) => (
        <EvtCard key={e.id} evt={e} />
      ))}
    </div>
  );
}

function EvtCard({ evt }: { evt: Evt }) {
  const pillStyles: Record<EvtType, string> = {
    create: "bg-accent/20 text-[var(--color-pyr-fys,#005840)]",
    update: "bg-primary/10 text-primary",
    delete: "bg-destructive/10 text-destructive",
    auth: "bg-[#FFF0D6] text-[#B8852A]",
    agent: "bg-muted text-muted-foreground",
    "auth-fail": "bg-destructive/10 text-destructive",
  };
  const iconStyles: Record<EvtType, string> = {
    create: "border-accent bg-accent/20 text-[var(--color-pyr-fys,#005840)]",
    update: "border-primary bg-primary/10 text-primary",
    delete: "border-destructive bg-destructive/10 text-destructive",
    auth: "border-[#B8852A] bg-[#FFF0D6] text-[#B8852A]",
    agent: "border-muted-foreground bg-muted text-muted-foreground",
    "auth-fail": "border-destructive bg-destructive/10 text-destructive",
  };
  const Icon = ({ type }: { type: EvtType }) => {
    if (type === "create") return <Plus className="h-3.5 w-3.5" />;
    if (type === "update") return <Pencil className="h-3.5 w-3.5" />;
    if (type === "delete") return <Trash2 className="h-3.5 w-3.5" />;
    if (type === "auth") return <ShieldCheck className="h-3.5 w-3.5" />;
    if (type === "auth-fail") return <ShieldOff className="h-3.5 w-3.5" />;
    return <Bot className="h-3.5 w-3.5" />;
  };

  const pillLabel =
    evt.type === "auth-fail"
      ? "Auth · mislyktet"
      : evt.type.charAt(0).toUpperCase() + evt.type.slice(1);

  return (
    <div className="relative mb-3.5">
      <div
        className={`absolute -left-8 top-3.5 z-[1] grid h-6 w-6 place-items-center rounded-full border-2 ${iconStyles[evt.type]}`}
      >
        <Icon type={evt.type} />
      </div>
      <div
        className={`rounded-lg border bg-card px-4 py-3.5 transition-shadow hover:shadow-sm ${
          evt.failed ? "border-destructive/25" : "border-border"
        }`}
      >
        <div className="mb-1 flex items-center gap-3">
          <span className="font-mono text-[12px] font-medium text-muted-foreground tabular-nums">
            {evt.time}
          </span>
          <span
            className={`rounded-sm px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] ${pillStyles[evt.type]}`}
          >
            {pillLabel}
          </span>
        </div>
        <div className="mb-2 text-[14px] leading-[1.5] text-foreground">{evt.title}</div>
        {evt.diffLabel && (
          <span className="inline-flex cursor-pointer items-center gap-1.5 border-b border-dotted border-muted-foreground py-0.5 font-mono text-[11.5px] text-muted-foreground hover:text-foreground">
            {evt.diffLabel} →
          </span>
        )}
        <div className="mt-2.5 flex flex-wrap gap-3.5 border-t border-border pt-2.5 font-mono text-[11px] text-muted-foreground">
          {evt.meta.map((m, i) => (
            <span key={i} className={evt.failed && i < 3 ? "text-destructive" : ""}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarRow({
  label,
  pct,
  value,
  accent,
}: {
  label: string;
  pct: number;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="mb-2 grid grid-cols-[90px_1fr_40px] items-center gap-2.5 text-[12px]">
      <span className="text-foreground">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${accent ? "bg-accent" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-right font-mono text-[11px] text-muted-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}
