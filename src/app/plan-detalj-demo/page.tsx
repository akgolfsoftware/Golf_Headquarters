/**
 * PILOT - CoachHQ Plan-detalj
 * Bygd direkte fra wireframe/design-files-v2/coachhq-A/03-plan-detalj.html
 * URL: /plan-detalj-demo
 *
 * Mock-data for Sommer-toppform-plan til Markus Roinas Pedersen.
 */

import { FileDown, Copy, Pencil } from "lucide-react";

type PyrKey = "fys" | "tek" | "slag" | "spill" | "turn";

const PYR_COLOR: Record<PyrKey, string> = {
  fys: "var(--color-pyr-fys, #005840)",
  tek: "var(--color-pyr-tek, #1A7D56)",
  slag: "var(--color-pyr-slag, #D1F843)",
  spill: "var(--color-pyr-spill, #B8852A)",
  turn: "var(--color-pyr-turn, #5E5C57)",
};

export default function PlanDetaljDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Page head */}
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Treningsplaner · Aktiv · Markus R. Pedersen · Kategori A
        </span>
        <h1 className="mt-2 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
          <em className="font-medium italic">Sommer-toppform</em> · 8 ukers periode
        </h1>
        <p className="mt-2 max-w-[720px] text-[13px] leading-[1.5] text-muted-foreground">
          9. mai – 1. juli 2026 · Peak Sørlandsåpent (2.–4. juni) · 32 økter totalt.
          Periodiserings-agent overvåker fasebytter og foreslår justeringer ved avvik over 10 %.
        </p>
      </header>

      {/* Action-strip */}
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
        <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Plan-handlinger
        </span>
        <ActionItem tone="info">
          <b>13/19</b> økter fullført
        </ActionItem>
        <ActionItem tone="success">
          <b>92 %</b> adherence
        </ActionItem>
        <ActionItem tone="warn">
          <b>1</b> agent-justering venter
        </ActionItem>
        <ActionItem>
          <b>21 d</b> til peak
        </ActionItem>
        <button className="ml-auto inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
          <FileDown className="h-4 w-4" strokeWidth={1.5} />
          Eksporter PDF
        </button>
        <button className="inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
          <Copy className="h-4 w-4" strokeWidth={1.5} />
          Dupliser
        </button>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
          <Pencil className="h-4 w-4" strokeWidth={1.5} />
          Rediger plan
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border">
        {[
          { label: "Oversikt", num: null },
          { label: "Faser", num: 5, active: true },
          { label: "Økter", num: 32 },
          { label: "Pyramide", num: null },
          { label: "Progresjon", num: null },
          { label: "Notater", num: null },
        ].map((tab) => (
          <button
            key={tab.label}
            className={`relative inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition-colors ${
              tab.active
                ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.num !== null && (
              <span className="rounded-sm bg-secondary px-2 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                {tab.num}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Timeline strip */}
      <section className="mb-4 rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              8-ukers tidslinje · auto-generert av periodiserings-agent
            </div>
            <h3 className="mt-2 font-display text-[18px] font-semibold leading-snug">
              Faseinndeling og pyramide-vekting per uke
            </h3>
            <p className="mt-2 text-[12px] leading-[1.5] text-muted-foreground">
              Lyse striper viser dominerende pyramide-lag. Klikk en uke for å zoome inn.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
            u21 · Spesifikk
          </span>
        </div>

        {/* Uke-rad */}
        <div className="grid grid-cols-[80px_repeat(8,1fr)] gap-px rounded-md bg-border p-px">
          <div className="bg-card" />
          {[
            { num: "u19", date: "9 mai", now: false },
            { num: "u20", date: "16 mai", now: false },
            { num: "u21", date: "23 mai · NÅ", now: true },
            { num: "u22", date: "30 mai", now: false },
            { num: "u23", date: "2 jun", now: false },
            { num: "u24", date: "6 jun", now: false },
            { num: "u25", date: "13 jun", now: false },
            { num: "u26", date: "20 jun", now: false },
          ].map((w) => (
            <div
              key={w.num}
              className="bg-card py-2 text-center"
              style={w.now ? { background: "rgba(209,248,67,0.15)" } : undefined}
            >
              <div className="font-mono text-[11px] font-semibold text-muted-foreground">
                {w.num}
              </div>
              <div className="mt-1 text-[10px] font-medium text-muted-foreground">
                {w.date}
              </div>
            </div>
          ))}
        </div>

        {/* Faser-bar */}
        <TimelineBar label="Faser">
          <BarFill left={0} width={25} color={PYR_COLOR.fys}>
            Base
          </BarFill>
          <BarFill left={25} width={12.5} color={PYR_COLOR.tek}>
            Forb.
          </BarFill>
          <BarFill left={37.5} width={37.5} color={PYR_COLOR.slag} textDark>
            Spesifikk · NÅ
          </BarFill>
          <BarFill left={75} width={10} color={PYR_COLOR.turn}>
            Taper
          </BarFill>
          <BarFill left={85} width={15} color={PYR_COLOR.spill}>
            Peak · Sørlandsåpent
          </BarFill>
        </TimelineBar>

        {/* SLAG-vekt */}
        <TimelineBar label="SLAG-vekt" thin>
          <BarFill left={0} width={25} color="rgba(209,248,67,0.25)" />
          <BarFill left={25} width={12.5} color="rgba(209,248,67,0.45)" />
          <BarFill left={37.5} width={37.5} color="rgba(209,248,67,0.85)" />
          <BarFill left={75} width={10} color="rgba(209,248,67,0.55)" />
          <BarFill left={85} width={15} color="rgba(209,248,67,0.30)" />
        </TimelineBar>

        {/* SPILL-vekt */}
        <TimelineBar label="SPILL-vekt" thin>
          <BarFill left={0} width={25} color="rgba(184,133,42,0.20)" />
          <BarFill left={25} width={12.5} color="rgba(184,133,42,0.40)" />
          <BarFill left={37.5} width={37.5} color="rgba(184,133,42,0.55)" />
          <BarFill left={75} width={10} color="rgba(184,133,42,0.75)" />
          <BarFill left={85} width={15} color="rgba(184,133,42,1)" />
        </TimelineBar>
      </section>

      {/* Phase grid */}
      <div className="grid grid-cols-[1.3fr_1fr] gap-4">
        <div className="flex flex-col gap-4">
          <PhaseCard
            num="Fase 1"
            statusPill={{ label: "Fullført", tone: "success" }}
            name="Base"
            dates="9.–22. mai · 2 uker · 8 økter"
            pct="100 %"
            pctLabel="Fullført"
            pyr={[
              { key: "fys", value: 30 },
              { key: "tek", value: 35 },
              { key: "slag", value: 15 },
              { key: "spill", value: 12 },
              { key: "turn", value: 8 },
            ]}
            sessions={[
              { value: "8/8", label: "Økter" },
              { value: "14,2 t", label: "Volum" },
              { value: "100 %", label: "Adherence" },
              { value: "+0,4", label: "SG-delta", success: true },
            ]}
          />

          <PhaseCard
            num="Fase 2"
            statusPill={{ label: "Fullført", tone: "success" }}
            name="Forberedelse"
            dates="23.–29. mai · 1 uke · 4 økter"
            pct="100 %"
            pctLabel="Fullført"
            pyr={[
              { key: "fys", value: 18 },
              { key: "tek", value: 32 },
              { key: "slag", value: 25 },
              { key: "spill", value: 18 },
              { key: "turn", value: 7 },
            ]}
            sessions={[
              { value: "4/4", label: "Økter" },
              { value: "7,5 t", label: "Volum" },
              { value: "100 %", label: "Adherence" },
              { value: "+0,2", label: "SG-delta", success: true },
            ]}
          />

          <PhaseCard
            num="Fase 3 · AKTIV"
            statusPill={{ label: "Pågår · u 21", tone: "lime" }}
            name="Spesifikk"
            dates="30. mai – 1. juni · 3 uker · 12 økter"
            pct="64 %"
            pctLabel="På plan"
            current
            pyr={[
              { key: "fys", value: 10 },
              { key: "tek", value: 15 },
              { key: "slag", value: 35 },
              { key: "spill", value: 30 },
              { key: "turn", value: 10 },
            ]}
            highlightKey="slag"
            sessions={[
              { value: "7/12", label: "Økter" },
              { value: "13,8 t", label: "Volum så langt" },
              { value: "88 %", label: "Adherence" },
              { value: "+0,2", label: "SG-delta", success: true },
            ]}
          />

          <PhaseCard
            num="Fase 4"
            statusPill={{ label: "Planlagt", tone: "muted" }}
            name="Taper"
            dates="2.–4. juni · 3 dager · 2 økter"
            pct="—"
            pctLabel="Starter om 9 d"
            pctMuted
            pyr={[
              { key: "fys", value: 5 },
              { key: "tek", value: 10 },
              { key: "slag", value: 30 },
              { key: "spill", value: 35 },
              { key: "turn", value: 20 },
            ]}
          />

          <PhaseCard
            num="Fase 5"
            statusPill={{ label: "Planlagt", tone: "muted" }}
            name="Peak"
            dates="2.–4. juni · Sørlandsåpent · 3 turneringsrunder"
            pct="—"
            pctLabel="Mål: top-5"
            pctMuted
          />
        </div>

        <aside className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            <KpiCard label="SG total" value="+1,24" sub="+0,38 i fase 3" valueSuccess />
            <KpiCard label="Volum" value="35,5 t" sub="av 52,8 t budsjett" />
            <KpiCard label="Adherence" value="92 %" sub="13/19 økter" />
          </div>

          <section className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-display text-[16px] font-semibold leading-snug">
              Kommende økter · denne uka
            </h3>

            <SessionRow
              date="tor 22"
              time="10:00"
              title="Range · jernspill 100-150 m"
              layer="slag"
              layerLabel="SLAG"
              duration="90 min"
              meta="TrackMan"
              status={{ label: "I dag", tone: "lime" }}
            />
            <SessionRow
              date="fre 23"
              time="14:30"
              title="9-hulls scoringsrunde"
              layer="spill"
              layerLabel="SPILL"
              duration="2 t"
              meta="Bjaavann"
              status={{ label: "Planlagt", tone: "muted" }}
            />
            <SessionRow
              date="lør 24"
              time="09:00"
              title="Putte · 6-fots drill"
              layer="slag"
              layerLabel="SLAG"
              duration="45 min"
              meta="Hjemme-putte"
              status={{ label: "Planlagt", tone: "muted" }}
            />
            <SessionRow
              date="søn 25"
              time="11:00"
              title="18-hulls turnerings-sim"
              layer="turn"
              layerLabel="TURN"
              duration="4 t"
              meta="Bjaavann · gult tee"
              status={{ label: "Planlagt", tone: "muted" }}
            />
            <SessionRow
              date="man 26"
              time="08:00"
              title="FYS · mobilitet + rotasjon"
              layer="fys"
              layerLabel="FYS"
              duration="60 min"
              meta="Egentrening"
              status={{ label: "Planlagt", tone: "muted" }}
              last
            />
          </section>
        </aside>
      </div>
    </div>
  );
}

function ActionItem({
  tone,
  children,
}: {
  tone?: "info" | "warn" | "success";
  children: React.ReactNode;
}) {
  const bg =
    tone === "info"
      ? "bg-primary/10 text-primary"
      : tone === "warn"
        ? "bg-[#FFF0D6] text-[#B8852A]"
        : tone === "success"
          ? "bg-[#E5F1EA] text-[#1A7D56]"
          : "bg-secondary text-muted-foreground";
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-md px-2 py-2 text-[12px] font-medium transition-opacity hover:opacity-80 ${bg}`}
    >
      {children}
    </button>
  );
}

function TimelineBar({
  label,
  thin,
  children,
}: {
  label: string;
  thin?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-2 grid grid-cols-[80px_1fr] items-center gap-2 py-1">
      <div className="font-mono text-[11px] font-semibold text-muted-foreground">
        {label}
      </div>
      <div
        className="relative overflow-hidden rounded-md bg-secondary"
        style={{ height: thin ? 18 : 28 }}
      >
        {children}
      </div>
    </div>
  );
}

function BarFill({
  left,
  width,
  color,
  children,
  textDark,
}: {
  left: number;
  width: number;
  color: string;
  children?: React.ReactNode;
  textDark?: boolean;
}) {
  return (
    <div
      className={`absolute top-0 flex h-full items-center px-2 font-mono text-[11px] font-semibold ${
        textDark ? "text-foreground" : "text-white"
      }`}
      style={{ left: `${left}%`, width: `${width}%`, background: color }}
    >
      {children}
    </div>
  );
}

type PyrEntry = { key: PyrKey; value: number };

function PhaseCard({
  num,
  statusPill,
  name,
  dates,
  pct,
  pctLabel,
  pctMuted,
  current,
  pyr,
  highlightKey,
  sessions,
}: {
  num: string;
  statusPill: { label: string; tone: "success" | "lime" | "muted" };
  name: string;
  dates: string;
  pct: string;
  pctLabel: string;
  pctMuted?: boolean;
  current?: boolean;
  pyr?: PyrEntry[];
  highlightKey?: PyrKey;
  sessions?: { value: string; label: string; success?: boolean }[];
}) {
  return (
    <section
      className={`rounded-lg bg-card p-6 ${
        current ? "border-2 border-accent" : "border border-border"
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-sm px-2 py-1 font-mono text-[10px] font-semibold ${
                current
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {num}
            </span>
            <Pill tone={statusPill.tone}>{statusPill.label}</Pill>
          </div>
          <h2 className="font-display text-[22px] font-bold leading-[1.1] tracking-tight">
            {name}
          </h2>
          <div className="mt-2 font-mono text-[12px] text-muted-foreground">
            {dates}
          </div>
        </div>
        <div className="text-right">
          <div
            className={`font-mono text-[28px] font-semibold tabular-nums leading-none ${
              pctMuted ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {pct}
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {pctLabel}
          </div>
        </div>
      </div>

      {pyr && (
        <>
          <div className="mt-2 flex h-2 gap-1 overflow-hidden rounded-sm bg-secondary">
            {pyr.map((p) => (
              <div
                key={p.key}
                style={{ width: `${p.value}%`, background: PYR_COLOR[p.key] }}
              />
            ))}
          </div>
          <div className="mt-2 mb-4 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
            {pyr.map((p) => (
              <span key={p.key} className="inline-flex items-center gap-2">
                <i
                  className="h-2 w-2 rounded-sm"
                  style={{ background: PYR_COLOR[p.key] }}
                />
                {highlightKey === p.key ? (
                  <b className="font-semibold text-foreground">
                    {p.key.toUpperCase()} {p.value} %
                  </b>
                ) : (
                  <>
                    {p.key.toUpperCase()} {p.value} %
                  </>
                )}
              </span>
            ))}
          </div>
        </>
      )}

      {sessions && (
        <div className="flex justify-between border-t border-border pt-4">
          {sessions.map((s) => (
            <div key={s.label}>
              <div
                className={`font-mono text-[16px] font-semibold tabular-nums leading-none ${
                  s.success ? "text-[#1A7D56]" : ""
                }`}
              >
                {s.value}
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Pill({
  tone,
  children,
}: {
  tone: "success" | "lime" | "muted";
  children: React.ReactNode;
}) {
  const styles =
    tone === "success"
      ? "bg-[#E5F1EA] text-[#1A7D56]"
      : tone === "lime"
        ? "bg-accent text-accent-foreground"
        : "bg-secondary text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles}`}
    >
      {children}
    </span>
  );
}

function KpiCard({
  label,
  value,
  sub,
  valueSuccess,
}: {
  label: string;
  value: string;
  sub: string;
  valueSuccess?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 mb-1 font-mono text-[24px] font-semibold tabular-nums leading-none ${
          valueSuccess ? "text-[#1A7D56]" : ""
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] leading-[1.3] text-muted-foreground">{sub}</div>
    </div>
  );
}

function SessionRow({
  date,
  time,
  title,
  layer,
  layerLabel,
  duration,
  meta,
  status,
  last,
}: {
  date: string;
  time: string;
  title: string;
  layer: PyrKey;
  layerLabel: string;
  duration: string;
  meta: string;
  status: { label: string; tone: "lime" | "muted" };
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[60px_1fr_auto] items-center gap-2 py-2 ${
        last ? "" : "border-b border-border"
      }`}
    >
      <div className="font-mono text-[11px] font-semibold leading-tight">
        {date}
        <span className="mt-1 block font-sans text-[10px] font-normal text-muted-foreground">
          {time}
        </span>
      </div>
      <div>
        <div className="text-[13px] font-semibold leading-tight">{title}</div>
        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <i
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: PYR_COLOR[layer] }}
            />
            {layerLabel} · {duration}
          </span>
          <span>{meta}</span>
        </div>
      </div>
      <Pill tone={status.tone}>{status.label}</Pill>
    </div>
  );
}
