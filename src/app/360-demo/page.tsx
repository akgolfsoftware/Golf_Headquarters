/**
 * PILOT — CoachHQ 360-profil
 * Bygd direkte fra wireframe/design-files-v2/coachhq-A/01-360-profil.html
 * URL: /admin/360-demo
 *
 * Bruker mock-data for Markus Roinås Pedersen. Bytt til Prisma-henting senere.
 */

export default function Profil360Demo() {
  return (
    <div className="min-h-screen bg-[var(--color-card,#FFFFFF)] text-foreground">
      {/* Hero-row */}
      <header className="grid grid-cols-[96px_1fr_auto] items-center gap-6 border-b border-border pb-5 pt-1 mb-6">
        <Avatar />
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Elever · 360-profil
          </span>
          <h1 className="mt-1 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
            <em className="font-medium italic">Markus</em> Roinås Pedersen
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[13px] text-muted-foreground">
            <Pill tone="info">Kategori A · Elite</Pill>
            <span className="text-[var(--ink-disabled,#C4C0B8)]">·</span>
            <span>WANG Toppidrett</span>
            <span className="text-[var(--ink-disabled,#C4C0B8)]">·</span>
            <span>17 år</span>
            <span className="text-[var(--ink-disabled,#C4C0B8)]">·</span>
            <span>
              Coach:{" "}
              <b className="font-medium text-foreground">Anders Kristiansen</b>
            </span>
            <span className="text-[var(--ink-disabled,#C4C0B8)]">·</span>
            <Pill tone="success">På plan</Pill>
          </div>
        </div>
        <div className="flex gap-7 border-l border-border pl-6">
          <QuickStat label="HCP" value="+2,4" />
          <QuickStat label="SG 12u" value="+0,8" up />
          <QuickStat label="Plan" value="13" of="/19" />
          <QuickStat label="Til peak" value="21d" />
        </div>
      </header>

      {/* Action-strip */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Spiller-handlinger
        </span>
        <ActionItem tone="info">
          <b>3</b> økter siste uke
        </ActionItem>
        <ActionItem tone="warn">
          <b>1</b> agent-justering venter
        </ActionItem>
        <ActionItem tone="success">
          <b>+0,38</b> SG siste 30d
        </ActionItem>
        <ActionItem>
          <b>72 %</b> turnerings-volum (lavt)
        </ActionItem>
        <button className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
          Send melding
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Book ny økt
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {["Pyramide", "SG", "TrackMan", "Tester", "Plan", "Tournaments", "Notater"].map(
          (tab, i) => (
            <button
              key={tab}
              className={`relative px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
                i === 0
                  ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* Pyramide-grid (donut + 2x2 stat-rich) */}
      <div className="mb-4 grid grid-cols-[1.4fr_1fr] gap-4">
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4.5 flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Pyramide-snitt · uke 21 · Spesifikk-fase
              </div>
              <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                Hvordan tiden fordeles akkurat nå
              </h3>
              <p className="mt-1 max-w-[360px] text-[12px] leading-[1.5] text-muted-foreground">
                Faktisk siste 7 dager vs. plan-target. Klikk et segment for detalj-drawer.
              </p>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              16 t loggført
            </span>
          </div>
          <div className="grid grid-cols-[220px_1fr] items-center gap-9">
            <Donut />
            <div className="flex flex-col gap-2.5">
              <TierRow
                color="var(--color-pyr-fys,#005840)"
                name="FYS · fysisk fundament"
                sub="Mobilitet, styrke, rotasjon"
                value="18 %"
                delta="på plan"
              />
              <TierRow
                color="var(--color-pyr-tek,#1A7D56)"
                name="TEK · teknikk"
                sub="Sving-arbeid, video"
                value="32 %"
                delta="+4 % vs target"
                deltaTone="success"
              />
              <TierRow
                color="var(--color-pyr-slag,#D1F843)"
                name="SLAG · slagprogresjon"
                sub="Range, sand, putte"
                value="24 %"
                delta="på plan"
                deltaTone="muted"
              />
              <TierRow
                color="var(--color-pyr-spill,#B8852A)"
                name="SPILL · banespill"
                sub="9- og 18-hulls"
                value="14 %"
                delta="−3 %"
                deltaTone="warning"
              />
              <TierRow
                color="var(--color-pyr-turn,#5E5C57)"
                name="TURN · turnering"
                sub="Konkurransepuls"
                value="12 %"
                delta="på plan"
                deltaTone="muted"
                last
              />
            </div>
          </div>
        </section>

        {/* 2x2 Stat-rich */}
        <section className="grid grid-cols-2 gap-3">
          <StatRich label="SG total" value="+1,24" delta="+0,38" sub="snitt over 6 runder" valueColor="success" />
          <StatRich label="Adherence" value="92 %" delta="+4 %" sub="13 av 19 økter på plan" />
          <StatRich label="Volum · uker" value="4,2" delta="stabilt" deltaTone="flat" sub="økter/uke · 30d snitt" />
          <StatRich label="Test-PR" value="14" delta="2 nye" sub="personlige rekorder" />
        </section>
      </div>

      {/* Heatmap */}
      <section className="rounded-lg border border-border bg-card px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              12 ukers historikk · fordelt på pyramide-lag
            </div>
            <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              Hva ble trent når
            </h3>
            <p className="mt-1 text-[12px] leading-[1.5] text-muted-foreground">
              Mørkere = mer tid den uka. Hover en celle for tid + dato.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground">
            <LegendCell color="var(--surface-alt,#F1EEE5)" border="var(--line-soft,#EFEDE6)" label="0 t" />
            <LegendCell color="rgba(0,88,64,0.25)" label="2 t" />
            <LegendCell color="var(--brand-primary,#005840)" label="5 t+" />
          </div>
        </div>
        <div className="mt-3.5 grid grid-cols-[60px_repeat(12,1fr)] gap-1.5">
          <div />
          {["u10", "u11", "u12", "u13", "u14", "u15", "u16", "u17", "u18", "u19", "u20", "u21"].map((u) => (
            <div key={u} className="text-center font-mono text-[10px] font-medium text-muted-foreground">
              {u}
            </div>
          ))}

          <HmRow label="FYS" levels={[2, 3, 2, 1, 2, 3, 4, 3, 2, 1, 2, 2]} tier="fys" />
          <HmRow label="TEK" levels={[1, 2, 3, 3, 4, 4, 3, 4, 4, 3, 4, 4]} tier="tek" />
          <HmRow label="SLAG" levels={[1, 2, 3, 3, 3, 4, 3, 3, 4, 3, 3, 3]} tier="slag" />
          <HmRow label="SPILL" levels={[1, 1, 2, 2, 3, 3, 4, 3, 2, 2, 1, 2]} tier="spill" />
          <HmRow label="TURN" levels={[1, 1, 1, 2, 3, 1, 2, 4, 3, 2, 3, 2]} tier="turn" />
        </div>
      </section>
    </div>
  );
}

function Avatar() {
  return (
    <div className="relative grid h-24 w-24 place-items-center rounded-full bg-primary text-white">
      <span className="font-display text-[36px] font-semibold leading-none">M</span>
      <span
        className="absolute right-0.5 bottom-0.5 h-[18px] w-[18px] rounded-full border-[3px] border-[var(--surface,#FAFAF7)] bg-accent"
        aria-label="online"
      />
    </div>
  );
}

function Pill({ tone = "muted", children }: { tone?: "info" | "success" | "muted" | "warning"; children: React.ReactNode }) {
  const styles: Record<NonNullable<typeof tone>, string> = {
    info: "bg-primary/10 text-primary",
    success: "bg-[#E5F1EA] text-[#1A7D56]",
    warning: "bg-[#FFF0D6] text-[#B8852A]",
    muted: "bg-secondary text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}

function QuickStat({ label, value, of, up }: { label: string; value: string; of?: string; up?: boolean }) {
  return (
    <div className="text-center">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1.5 font-mono text-[22px] font-semibold tabular-nums leading-none ${
          up ? "text-[var(--status-success,#1A7D56)]" : ""
        }`}
      >
        {value}
        {of && <span className="text-muted-foreground text-[14px]">{of}</span>}
      </div>
    </div>
  );
}

function ActionItem({ tone, children }: { tone?: "info" | "warn" | "success"; children: React.ReactNode }) {
  const bg =
    tone === "info"
      ? "bg-primary/8 text-primary"
      : tone === "warn"
        ? "bg-[#FFF0D6] text-[#B8852A]"
        : tone === "success"
          ? "bg-[#E5F1EA] text-[#1A7D56]"
          : "bg-secondary text-muted-foreground";
  return (
    <button
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-80 ${bg}`}
    >
      {children}
    </button>
  );
}

function Donut() {
  const gradient =
    "conic-gradient(var(--color-pyr-fys,#005840) 0deg 65deg, var(--color-pyr-tek,#1A7D56) 65deg 180deg, var(--color-pyr-slag,#D1F843) 180deg 266deg, var(--color-pyr-spill,#B8852A) 266deg 317deg, var(--color-pyr-turn,#5E5C57) 317deg 360deg)";
  return (
    <div className="relative h-[220px] w-[220px] rounded-full" style={{ background: gradient }}>
      <div
        className="absolute inset-9 rounded-full bg-card"
        style={{ boxShadow: "inset 0 0 0 1px var(--line-soft, #EFEDE6)" }}
      />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <div className="font-mono text-[36px] font-medium tabular-nums leading-none">16,0t</div>
        <div className="mt-1 font-medium uppercase tracking-[0.10em] text-[10px] leading-none text-muted-foreground">
          siste 7 dager
        </div>
      </div>
    </div>
  );
}

function TierRow({
  color,
  name,
  sub,
  value,
  delta,
  deltaTone = "success",
  last = false,
}: {
  color: string;
  name: string;
  sub: string;
  value: string;
  delta: string;
  deltaTone?: "success" | "muted" | "warning";
  last?: boolean;
}) {
  const tone =
    deltaTone === "success"
      ? "text-[var(--status-success,#1A7D56)]"
      : deltaTone === "warning"
        ? "text-[var(--status-warning,#B8852A)]"
        : "text-muted-foreground";
  return (
    <div className={`grid grid-cols-[36px_1fr_auto] items-center gap-3 py-2 ${last ? "" : "border-b border-[var(--line-soft,#EFEDE6)]"}`}>
      <div className="h-3 w-3 rounded-[3px]" style={{ background: color }} />
      <div>
        <div className="text-[13px] font-semibold leading-none">{name}</div>
        <div className="mt-1 text-[11px] leading-none text-muted-foreground">{sub}</div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[16px] font-semibold tabular-nums leading-none">{value}</div>
        <div className={`mt-1 text-[10px] font-medium leading-none ${tone}`}>{delta}</div>
      </div>
    </div>
  );
}

function StatRich({
  label,
  value,
  delta,
  sub,
  valueColor,
  deltaTone = "up",
}: {
  label: string;
  value: string;
  delta: string;
  sub: string;
  valueColor?: "success";
  deltaTone?: "up" | "flat";
}) {
  const deltaStyle =
    deltaTone === "up"
      ? "bg-[#E5F1EA] text-[#1A7D56]"
      : "bg-secondary text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
        <span className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${deltaStyle}`}>
          {delta}
        </span>
      </div>
      <div
        className={`mt-3.5 mb-1.5 font-mono text-[32px] font-medium tabular-nums leading-none -tracking-tight ${
          valueColor === "success" ? "text-[var(--status-success,#1A7D56)]" : ""
        }`}
      >
        {value}
      </div>
      <div className="text-[12px] leading-[1.4] text-muted-foreground">{sub}</div>
    </div>
  );
}

function LegendCell({ color, label, border }: { color: string; label: string; border?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-3.5 w-3.5 rounded-[3px]"
        style={{ background: color, border: border ? `1px solid ${border}` : undefined }}
      />
      {label}
    </span>
  );
}

function HmRow({
  label,
  levels,
  tier,
}: {
  label: string;
  levels: number[];
  tier: "fys" | "tek" | "slag" | "spill" | "turn";
}) {
  const colorFor = (lvl: number) => {
    if (lvl === 0) return "bg-[var(--surface-alt,#F1EEE5)] border border-[var(--line-soft,#EFEDE6)]";
    if (tier === "fys") {
      return ["bg-[rgba(22,163,74,0.10)]", "bg-[rgba(22,163,74,0.25)]", "bg-[rgba(22,163,74,0.55)]", "bg-[#16A34A]"][lvl - 1];
    }
    if (tier === "slag") {
      return ["bg-[rgba(209,248,67,0.20)]", "bg-[rgba(209,248,67,0.40)]", "bg-[rgba(209,248,67,0.55)]", "bg-accent"][lvl - 1];
    }
    if (tier === "spill") {
      return ["bg-[rgba(184,133,42,0.10)]", "bg-[rgba(184,133,42,0.25)]", "bg-[rgba(184,133,42,0.55)]", "bg-[var(--color-pyr-spill,#B8852A)]"][lvl - 1];
    }
    if (tier === "turn") {
      return ["bg-[rgba(94,92,87,0.10)]", "bg-[rgba(94,92,87,0.25)]", "bg-[rgba(94,92,87,0.55)]", "bg-[var(--color-pyr-turn,#5E5C57)]"][lvl - 1];
    }
    return ["bg-[rgba(0,88,64,0.10)]", "bg-[rgba(0,88,64,0.25)]", "bg-[rgba(0,88,64,0.50)]", "bg-primary"][lvl - 1];
  };
  return (
    <>
      <div className="flex items-center font-mono text-[10px] font-semibold text-muted-foreground">{label}</div>
      {levels.map((lvl, i) => (
        <div key={i} className={`aspect-square rounded-[4px] ${colorFor(lvl)}`} />
      ))}
    </>
  );
}
