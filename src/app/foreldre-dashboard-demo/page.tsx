/**
 * PILOT — Foreldreportal · Dashboard
 * Bygd direkte fra wireframe/design-files-v2/screens/36-foreldre-dashboard.html
 * URL: /foreldre-dashboard-demo
 *
 * Hjem-skjerm for forelder (Frode Roinås Pedersen) for barnet Markus (16 år, U18).
 */

import {
  AlertTriangle,
  CreditCard,
  FileDown,
  FileText,
  PauseCircle,
  ShieldCheck,
  UserCog,
} from "lucide-react";

export default function ForeldreDashboardDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-8 py-10">
        {/* Eyebrow */}
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Foreldreportal · Hjem
            </span>
            <h1 className="mt-1 font-display text-[32px] font-semibold tracking-tight leading-[1.1]">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[12px] font-mono text-muted-foreground tracking-[0.04em]">
            <span>Aktivt barn:</span>
            <b className="font-semibold text-foreground">Markus (16)</b>
          </div>
        </div>

        {/* Barn-veksler */}
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-card p-2">
          <KidCard initials="MR" name="Markus Roinås Pedersen" meta="16 år · HCP +2,4 · GFGK" active />
          <KidCard initials="EP" name="Emma Pedersen" meta="13 år · HCP 18,0 · GFGK" />
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-transparent px-3 py-2 text-[12px] font-medium text-muted-foreground hover:border-primary hover:text-primary">
            + Legg til barn
          </button>
        </div>

        {/* Hero */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-[#0A1F17] p-8 text-[#F5F4EE]">
          <div className="grid grid-cols-[1fr_320px] gap-8">
            <div>
              <h2 className="font-display text-[28px] font-medium leading-[1.15] tracking-tight">
                <em className="not-italic font-normal italic">Hei, Frode</em> — Markus har trent{" "}
                <b className="font-medium text-accent">3 ganger</b> denne uka.
              </h2>
              <p className="mt-3 max-w-[520px] text-[13px] leading-[1.55] text-[rgba(245,244,238,0.72)]">
                Belastningen ligger i grønt område, søvnen er stabil, og han har fullført 2 av 3 mål i ukens
                treningsplan. Én ting krever handling: medsamtykke for video- og helseopptak er ikke signert.
              </p>
              <div className="mt-6 flex flex-wrap gap-8">
                <HeroStat value="3" delta="+1" label="Økter · uke 19" />
                <HeroStat value="4,2 t" label="Total treningstid" />
                <HeroStat value="+2,4" delta="−0,3" label="HCP-trend" />
                <HeroStat value="7,2 / 10" label="Snitt-RPE" />
              </div>
            </div>
            <div className="rounded-xl border border-[rgba(245,244,238,0.12)] bg-[rgba(245,244,238,0.06)] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-accent">Neste økt</div>
              <div className="mt-2 text-[14px] font-medium text-[#F5F4EE]">
                TEK · Putt + chip med Anders
              </div>
              <div className="mt-1 font-mono text-[11px] tracking-[0.04em] text-[rgba(245,244,238,0.65)]">
                tor 14.05 · 16:00–17:00 · GFGK · gress 4
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[rgba(245,244,238,0.12)] pt-3">
                <span className="rounded-full bg-[rgba(209,248,67,0.18)] px-2 py-0.5 text-[11px] font-semibold text-accent">
                  90 min til reise
                </span>
                <button className="rounded-full bg-accent px-3 py-1 text-[12px] font-semibold text-[#0A1F17]">
                  Detaljer
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Alerts */}
        <section className="mb-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-[17px] font-medium tracking-tight">
              Krever oppmerksomhet{" "}
              <em className="ml-1 font-normal italic text-muted-foreground text-[14px]">· 3 saker</em>
            </h3>
            <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
              sortert: forfaller først
            </span>
          </div>
          <AlertRow
            tone="warn"
            icon={<AlertTriangle className="h-4 w-4" strokeWidth={1.5} />}
            title="Markus' medsamtykke mangler"
            sub="Fra onboarding 11.05 · forelder-signatur OK · forfaller 13.05 14:09"
            when="forfaller om 1 d 23 t"
            cta="Send påminnelse"
            ctaTone="primary"
          />
          <AlertRow
            tone="brand"
            icon={<FileText className="h-4 w-4" strokeWidth={1.5} />}
            title="Ukerapport uke 19 er klar"
            sub="Anders signerte rapporten 11.05 · 4 sider · 2 video-klipp"
            when="8 min siden"
            cta="Åpne rapport"
          />
          <AlertRow
            icon={<CreditCard className="h-4 w-4" strokeWidth={1.5} />}
            title="Faktura 0512-MR fornyer 28.05"
            sub="PlayerHQ Pro · 300 kr/mnd · Visa **1042 utløper i juli"
            when="17 dgr"
            cta="Oppdater kort"
          />
        </section>

        {/* Body grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Pyramide */}
          <section className="col-span-8 rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="font-display text-[16px] font-semibold tracking-tight">
                Markus' pyramide{" "}
                <em className="font-normal italic text-muted-foreground text-[13px]">· uke 19</em>
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                vs forrige uke · grønn = mål nådd
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              <PyrBar label="FYS" pct={88} color="var(--color-pyr-fys,#005840)" />
              <PyrBar label="TEK" pct={72} color="var(--color-pyr-tek,#1A7D56)" />
              <PyrBar label="SLAG" pct={54} color="var(--color-pyr-slag,#D1F843)" />
              <PyrBar label="SPILL" pct={38} color="var(--color-pyr-spill,#B8852A)" />
              <PyrBar label="TURN" pct={20} color="var(--color-pyr-turn,#5E5C57)" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4 border-t border-[var(--line-soft,#EFEDE6)] pt-4">
              <SmallStat label="Belastning" value="Grønn sone" sub="RPE 6,8 → 7,4 → 7,2" tone="success" />
              <SmallStat label="Søvn-snitt" value="7t 42m" sub="+ 14 min vs forrige uke" />
              <SmallStat label="Smerterapport" value="Ingen" sub="siste 11 dgr" />
            </div>
          </section>

          {/* Snarveier */}
          <section className="col-span-4 rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="font-display text-[16px] font-semibold tracking-tight">Snarveier</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                U18-forelder
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <QuickAction icon={<ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />} label="Trekk samtykke" sub="5 aktive scopes" />
              <QuickAction icon={<FileDown className="h-3.5 w-3.5" strokeWidth={1.5} />} label="Last ned alle data" sub="GDPR §15 · PDF/CSV" />
              <QuickAction icon={<UserCog className="h-3.5 w-3.5" strokeWidth={1.5} />} label="Bytt coach" sub="Foreslå reassign" />
              <QuickAction icon={<PauseCircle className="h-3.5 w-3.5" strokeWidth={1.5} />} label="Pause konto" sub="Inntil 90 dgr" />
            </div>
          </section>

          {/* Siste økter */}
          <section className="col-span-6 rounded-lg border border-border bg-card p-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-display text-[16px] font-semibold tracking-tight">
                Siste økter <em className="font-normal italic text-muted-foreground text-[13px]">· 7 dgr</em>
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                3 økter · 4t 12m
              </span>
            </div>
            <div>
              <SessionRow initials="AK" name="TEK · Putt-kalibrering" meta="man 06.05 · 16:00–17:30 · Anders K. · 1 video" min="90 min" rpe="8,2" />
              <SessionRow initials="AK" name="SPILL · Pitch fra 30–80 m" meta="ons 08.05 · 17:00–18:00 · Anders K." min="60 min" rpe="7,4" />
              <SessionRow initials="FP" name="FYS · Rotasjon og styrke" meta="fre 10.05 · 07:30–08:30 · Fysio Per" min="60 min" rpe="7,0" tone="muted" />
            </div>
            <a className="mt-2 inline-block font-mono text-[11px] uppercase tracking-[0.04em] text-primary underline">
              Se hele økt-historikken
            </a>
          </section>

          {/* Samtykke-status */}
          <section className="col-span-6 rounded-lg border border-border bg-card p-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-display text-[16px] font-semibold tracking-tight">
                Samtykke-status{" "}
                <em className="font-normal italic text-muted-foreground text-[13px]">· Markus</em>
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                5 av 6 aktive · 11.05
              </span>
            </div>
            <div>
              <ScopeMini name="Konto og profil" on />
              <ScopeMini name="Deling med coach" on />
              <ScopeMini name="Video- og lydopptak" on />
              <ScopeMini name="Helse- og bevegelsesdata" on />
              <ScopeMini name="Deling med GFGK" on />
              <ScopeMini name="Markedsføring (e-post)" />
            </div>
            <button className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium text-foreground hover:bg-secondary">
              Administrer samtykke
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function KidCard({ initials, name, meta, active = false }: { initials: string; name: string; meta: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-md px-3 py-2 ${
        active ? "bg-secondary" : "hover:bg-secondary/60"
      }`}
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
        {initials}
      </span>
      <div>
        <div className="text-[13px] font-medium leading-none">{name}</div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">{meta}</div>
      </div>
    </div>
  );
}

function HeroStat({ value, delta, label }: { value: string; delta?: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-[24px] font-medium tabular-nums leading-none text-[#F5F4EE]">
        {value}
        {delta && <span className="ml-2 text-[12px] font-medium text-accent">{delta}</span>}
      </div>
      <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-[rgba(245,244,238,0.55)]">
        {label}
      </div>
    </div>
  );
}

function AlertRow({
  tone,
  icon,
  title,
  sub,
  when,
  cta,
  ctaTone,
}: {
  tone?: "warn" | "brand";
  icon: React.ReactNode;
  title: string;
  sub: string;
  when: string;
  cta: string;
  ctaTone?: "primary";
}) {
  const wrap =
    tone === "warn"
      ? "border-[rgba(184,133,42,0.30)] bg-[#FFF6E0]"
      : tone === "brand"
        ? "border-[rgba(0,88,64,0.18)] bg-[rgba(0,88,64,0.06)]"
        : "border-border bg-card";
  const iconWrap =
    tone === "warn"
      ? "bg-[#B8852A] text-white"
      : tone === "brand"
        ? "bg-primary text-accent"
        : "bg-secondary text-muted-foreground";
  return (
    <div className={`mb-2 grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 rounded-lg border px-4 py-3 ${wrap}`}>
      <div className={`grid h-8 w-8 place-items-center rounded-md ${iconWrap}`}>{icon}</div>
      <div>
        <div className="text-[13px] font-medium text-foreground">{title}</div>
        <div className="mt-0.5 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">{sub}</div>
      </div>
      <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{when}</span>
      <button
        className={`rounded-md px-3 py-2 text-[12px] font-medium ${
          ctaTone === "primary"
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-transparent text-foreground hover:bg-secondary"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

function PyrBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="grid grid-cols-[60px_1fr_50px] items-center gap-3 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
      <span className="font-semibold uppercase text-foreground">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-right tabular-nums text-foreground">{pct} %</span>
    </div>
  );
}

function SmallStat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "success" }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-[18px] font-medium tabular-nums ${tone === "success" ? "text-[var(--status-success,#1A7D56)]" : "text-foreground"}`}>
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{sub}</div>
    </div>
  );
}

function QuickAction({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <button className="flex flex-col gap-2 rounded-md border border-border bg-transparent p-4 text-left transition-colors hover:border-primary">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-[rgba(0,88,64,0.06)] text-primary">{icon}</span>
      <span className="text-[12px] font-medium text-foreground">{label}</span>
      <span className="font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{sub}</span>
    </button>
  );
}

function SessionRow({ initials, name, meta, min, rpe, tone }: { initials: string; name: string; meta: string; min: string; rpe: string; tone?: "muted" }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-[var(--line-soft,#EFEDE6)] py-3 last:border-b-0">
      <span
        className={`grid h-9 w-9 place-items-center rounded-full font-display text-[11px] font-semibold ${
          tone === "muted" ? "bg-[var(--status-success,#1A7D56)] text-white" : "bg-secondary text-muted-foreground"
        }`}
      >
        {initials}
      </span>
      <div>
        <div className="text-[13px] font-medium leading-none">{name}</div>
        <div className="mt-1.5 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{meta}</div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[11px] text-muted-foreground">{min}</div>
        <div className="mt-0.5 font-mono text-[12px] font-semibold text-primary tabular-nums">RPE {rpe}</div>
      </div>
    </div>
  );
}

function ScopeMini({ name, on = false }: { name: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--line-soft,#EFEDE6)] py-2.5 text-[12px] last:border-b-0">
      <span className={on ? "text-foreground" : "text-muted-foreground"}>{name}</span>
      <span
        className={`font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${
          on ? "text-[var(--status-success,#1A7D56)]" : "text-muted-foreground"
        }`}
      >
        {on ? "aktiv" : "av"}
      </span>
    </div>
  );
}
