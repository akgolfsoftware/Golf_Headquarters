/**
 * PILOT — Klubb-admin · Dashboard
 * Bygd direkte fra wireframe/design-files-v2/screens/52-klubb-dashboard.html
 * URL: /klubb-dashboard-demo
 */

import { AlertTriangle, ArrowRight, Check, CircleDot } from "lucide-react";

export default function KlubbDashboardDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-8 py-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              GFGK Klubb-portal · Dashboard
            </div>
            <h1 className="mt-1 font-display text-[32px] font-semibold tracking-tight leading-[1.1]">
              Klubb-dashboard
            </h1>
          </div>
          <div className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
            Mandag 11. mai · uke 20 · sesong 2026
          </div>
        </div>

        {/* Hero */}
        <section className="mb-5 grid grid-cols-2 gap-6 overflow-hidden rounded-2xl border border-border bg-[#0A1F17] p-7 text-[#F5F4EE]">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
              Mandag 11. mai · uke 20 · sesong 2026
            </div>
            <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.1] tracking-tight">
              Velkommen tilbake. <br />2 turneringer går live{" "}
              <em className="not-italic font-normal italic text-accent">i dag</em>.
            </h2>
            <p className="mt-3 max-w-[480px] text-[13px] leading-[1.5] text-[rgba(245,244,238,0.65)]">
              Borre Open R2 spilles nå · NM Q-school R1 starter 20. mai med 6 av 7 spillere klare. To
              foresatte mangler samtykke — flagget under.
            </p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-md bg-accent px-3 py-2 text-[12px] font-semibold text-[#0A1F17]">
                Følg live scoring
              </button>
              <button className="rounded-md border border-[rgba(245,244,238,0.15)] bg-[rgba(245,244,238,0.08)] px-3 py-2 text-[12px] font-medium text-[#F5F4EE]">
                Send dagens purringer (2)
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 self-start">
            <Kpi label="Spillere i ranking" v="23" delta="↑ 3 mnd" det="7 i nasjonal top 50" />
            <Kpi label="Aktive samtykker" v="94 %" delta="+6 %" det="3 utestående · 2 forfalt" />
            <Kpi label="RSVP-rate" v="73 %" delta="+12 %" det="SMS-pilot driver økning" />
            <Kpi label="Klubb-snitt rank" v="42" delta="↑ 8 plasser" det="M. Pedersen #14 · ny rekord" />
          </div>
        </section>

        {/* Three stat-cards */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <StatCard label="Borre Open R2 · live" v="9/18" delta="50 % spilt" det="S. Karlsen leder klubb-feltet · −2 (T6)" pct={50} />
          <StatCard label="NM Q-school R1 · 20.05" v="5/7" delta="RSVP" det="Frist 17.05 · 6 dgr · 2 forfalt" pct={71} />
          <StatCard label="Klubbmesterskap · 25.05" v="38/52" delta="påmeldt" det="Påmeldingsfrist 23.05 · 12 dgr" pct={73} />
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-4">
          {/* Calendar */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-baseline justify-between font-display text-[14px] font-semibold tracking-tight">
              Mai 2026
              <small className="font-mono text-[10px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                10 arrangementer
              </small>
            </h3>
            <div className="mb-1 grid grid-cols-7 gap-1 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((d) => (
                <span key={d} className="py-1 text-center">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              <CalCell n="28" muted />
              <CalCell n="29" muted />
              <CalCell n="30" muted />
              <CalCell n="1" />
              <CalCell n="2" ev="trening U18" tone="training" />
              <CalCell n="3" />
              <CalCell n="4" />
              <CalCell n="5" />
              <CalCell n="6" ev="trening U16" tone="training" />
              <CalCell n="7" />
              <CalCell n="8" />
              <CalCell n="9" />
              <CalCell n="10" ev="Borre R1" tone="cup" />
              <CalCell n="11" ev="R2 · live" tone="cup" today />
              <CalCell n="12" today ev="i dag" />
              <CalCell n="13" ev="trening" tone="training" />
              <CalCell n="14" />
              <CalCell n="15" />
              <CalCell n="16" />
              <CalCell n="17" />
              <CalCell n="18" />
              <CalCell n="19" />
              <CalCell n="20" ev="NM Q R1" tone="away" />
              <CalCell n="21" ev="NM R2" tone="away" />
              <CalCell n="22" ev="NM R3 cut" tone="away" />
              <CalCell n="23" />
              <CalCell n="24" ev="KM kvalik" tone="tournament" />
              <CalCell n="25" ev="KM final" tone="tournament" />
              <CalCell n="26" />
              <CalCell n="27" ev="trening" tone="training" />
              <CalCell n="28" />
              <CalCell n="29" />
              <CalCell n="30" />
              <CalCell n="31" />
              <CalCell n="1" muted />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
              <Legend color="rgba(26,125,86,0.20)" label="Trening" />
              <Legend color="#0A1F17" label="Klubb-turnering" />
              <Legend color="rgba(184,133,42,0.30)" label="Bortekamp" />
              <Legend color="white" border label="Andre" />
            </div>
          </section>

          {/* Activity */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-baseline justify-between font-display text-[14px] font-semibold tracking-tight">
              Aktivitet · i dag
              <small className="font-mono text-[10px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                auto-oppdatert
              </small>
            </h3>
            <div>
              <ActRow t="14:31" icon={<CircleDot className="h-3 w-3" strokeWidth={1.5} />} title="M. Pedersen birdie hull 6 → −2 (T6)." sub="Borre Open R2" />
              <ActRow t="14:18" tone="warn" icon={<AlertTriangle className="h-3 w-3" strokeWidth={1.5} />} title="R. Johansen double hull 2 — projisert over cut-line." sub="Coach varslet." />
              <ActRow t="13:42" tone="ok" icon={<Check className="h-3 w-3" strokeWidth={1.5} />} title="Liva Forsberg bekreftet RSVP for KM U16." />
              <ActRow t="12:18" tone="ok" icon={<Check className="h-3 w-3" strokeWidth={1.5} />} title="M. Forsberg fullført BankID-samtykke (foto/video)." />
              <ActRow t="11:04" tone="dng" icon={<AlertTriangle className="h-3 w-3" strokeWidth={1.5} />} title="L. Berge avslo SMS-purring · «ringer i ettermiddag»." sub="Eskalert." />
              <ActRow t="10:38" icon={<ArrowRight className="h-3 w-3" strokeWidth={1.5} />} title="Anders K. sendte 6 påminnelser via SMS." />
              <ActRow t="09:00" icon={<CircleDot className="h-3 w-3" strokeWidth={1.5} />} title="Borre Open R2 tee-off · 6 spillere fra GFGK." />
              <ActRow t="07:32" icon={<ArrowRight className="h-3 w-3" strokeWidth={1.5} />} title="Buss avgikk GFGK klubbhus → Borre (1 t 25 min)." />
              <ActRow t="07:15" tone="ok" icon={<Check className="h-3 w-3" strokeWidth={1.5} />} title="Sjekkliste R2: spillere møtt · utstyr · ID kontrollert." />
            </div>
          </section>
        </div>

        <div className="mt-4 grid grid-cols-[1.4fr_1fr] gap-4">
          {/* Leaderboard */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-baseline justify-between font-display text-[14px] font-semibold tracking-tight">
              Klubb-leaderboard · sesong-poeng
              <small className="font-mono text-[10px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                NGF · U18
              </small>
            </h3>
            <div className="flex flex-col gap-2">
              <LbmRow pos="#14" highlight initials="MR" name="Markus Roinås Pedersen" sub="U18 G · HCP +2,4 · ↑ 6 plasser" pts="1 548" />
              <LbmRow pos="#22" initials="SK" name="Sondre Karlsen" sub="U18 G · HCP 1,2 · ↑ 2" pts="1 124" />
              <LbmRow pos="#28" initials="EH" name="Eira Hopstad" sub="U18 J · HCP 2,8 · ↑ 3" pts="812" />
              <LbmRow pos="#34" initials="TF" name="Tobias Fjell" sub="U18 G · HCP 0,6 · ↑ 4" pts="688" />
              <LbmRow pos="#42" initials="RJ" name="Ruth Johansen" sub="U18 J · HCP 4,1 · ↓ 2" pts="514" />
              <LbmRow pos="#51" initials="NB" name="Noa Berge" sub="U16 G · HCP 8,2 · ↑ 8 (ny i ranking)" pts="412" />
              <LbmRow pos="#62" initials="JN" name="Jonas Næss" sub="U18 G · HCP 3,4 · ↓ 5" pts="298" />
            </div>
          </section>

          {/* Tasks */}
          <section className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-baseline justify-between font-display text-[14px] font-semibold tracking-tight">
              Mine oppgaver
              <small className="font-mono text-[10px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                3 av 8 fullført
              </small>
            </h3>
            <div className="flex flex-col gap-2">
              <Task done title="Send buss-info R2 til foresatte" sub="kl. 07:30 · fullført 06:14" />
              <Task done title="Kontroller ID + utstyr · 6 spillere" sub="før avreise · fullført 07:15" />
              <Task done title="Bekreft kontakt med Larvik GK" sub="NM Q-school logistikk · fullført 09:42" />
              <Task title="Ring L. Berge (Noa) — RSVP og BankID" sub="eskalert · 7 dgr forfalt · senest i dag 16:00" />
              <Task title="Bestill rom Scandic Larvik for 5 spillere + 2 coacher" sub="frist 14.05 · 3 dgr igjen" />
              <Task title="Godkjenn pikejunior-uttak KM final 25.05" sub="uttak ferdig fra L. Hammer · venter signatur" />
              <Task title="Send månedsrapport til styret" sub="14 dager · rapport-utkast 80 % klar" />
              <Task title="Sjekk forsikring U14-laget sommerleir" sub="If Sport · sjekk vilkår · ikke hastet" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, v, delta, det }: { label: string; v: string; delta: string; det: string }) {
  return (
    <div className="rounded-xl border border-[rgba(245,244,238,0.10)] bg-[rgba(245,244,238,0.05)] p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[rgba(245,244,238,0.5)]">
        {label}
      </div>
      <div className="mt-1.5 font-display text-[26px] font-semibold leading-none tracking-tight">
        {v}
        <span className="ml-1.5 font-mono text-[11px] font-medium tracking-[0.02em] text-accent">{delta}</span>
      </div>
      <div className="mt-1.5 font-mono text-[10px] tracking-[0.04em] text-[rgba(245,244,238,0.5)]">{det}</div>
    </div>
  );
}

function StatCard({ label, v, delta, det, pct }: { label: string; v: string; delta: string; det: string; pct: number }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 font-display text-[22px] font-semibold leading-none tracking-tight">
        {v}
        <span className="ml-1.5 font-mono text-[11px] font-medium tracking-[0.02em] text-[var(--status-success,#1A7D56)]">
          {delta}
        </span>
      </div>
      <div className="mt-1.5 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{det}</div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CalCell({ n, ev, tone, today, muted }: { n: string; ev?: string; tone?: "training" | "cup" | "tournament" | "away"; today?: boolean; muted?: boolean }) {
  const base =
    tone === "training"
      ? "bg-[rgba(26,125,86,0.10)] border border-[rgba(26,125,86,0.20)]"
      : tone === "cup"
        ? "bg-[#0A1F17] text-white border-transparent"
        : tone === "tournament"
          ? "bg-white border border-border"
          : tone === "away"
            ? "bg-[rgba(184,133,42,0.12)] border border-[rgba(184,133,42,0.25)]"
            : today
              ? "bg-foreground text-background"
              : "bg-secondary";
  const evColor =
    tone === "training"
      ? "text-[var(--status-success,#1A7D56)]"
      : tone === "cup"
        ? "text-accent"
        : tone === "tournament"
          ? "text-primary"
          : tone === "away"
            ? "text-primary"
            : today
              ? "text-background"
              : "text-primary";
  return (
    <div
      className={`relative flex aspect-square flex-col justify-between rounded-sm p-1.5 font-mono text-[10px] tracking-[0.02em] ${
        muted ? "text-[var(--ink-disabled,#C4C0B8)]" : tone === "cup" ? "text-white" : "text-muted-foreground"
      } ${base}`}
    >
      <span>{n}</span>
      {ev && <span className={`text-[9px] font-semibold leading-tight ${evColor}`}>{ev}</span>}
    </div>
  );
}

function Legend({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-sm"
        style={{ background: color, border: border ? "1px solid var(--border,#E5E3DD)" : undefined }}
      />
      {label}
    </span>
  );
}

function ActRow({
  t,
  icon,
  title,
  sub,
  tone,
}: {
  t: string;
  icon: React.ReactNode;
  title: string;
  sub?: string;
  tone?: "warn" | "ok" | "dng";
}) {
  const iconStyle =
    tone === "warn"
      ? "bg-[#FFF0D6] text-[#B8852A]"
      : tone === "ok"
        ? "bg-[rgba(26,125,86,0.12)] text-[var(--status-success,#1A7D56)]"
        : tone === "dng"
          ? "bg-[rgba(163,45,45,0.10)] text-destructive"
          : "bg-[rgba(0,88,64,0.06)] text-primary";
  return (
    <div className="flex gap-2.5 border-b border-[var(--line-soft,#EFEDE6)] py-2.5 text-[12px] last:border-b-0">
      <span className="w-12 flex-shrink-0 pt-0.5 text-right font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
        {t}
      </span>
      <span className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full ${iconStyle}`}>{icon}</span>
      <div className="flex-1 leading-tight">
        <span className="text-foreground">{title}</span>
        {sub && <em className="ml-1 not-italic text-muted-foreground">{sub}</em>}
      </div>
    </div>
  );
}

function LbmRow({ pos, highlight, initials, name, sub, pts }: { pos: string; highlight?: boolean; initials: string; name: string; sub: string; pts: string }) {
  return (
    <div className="grid grid-cols-[36px_1fr_60px] items-center gap-2.5 rounded-md bg-secondary px-3 py-2">
      <span className={`text-center font-mono text-[11px] font-semibold tracking-[0.04em] ${highlight ? "text-primary" : "text-muted-foreground"}`}>
        {pos}
      </span>
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[rgba(0,88,64,0.06)] font-display text-[10px] font-semibold text-primary">
          {initials}
        </span>
        <div>
          <div className="text-[12px] font-medium leading-tight">{name}</div>
          <div className="mt-0.5 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{sub}</div>
        </div>
      </div>
      <span className="text-right font-display text-[14px] font-semibold tracking-tight">{pts}</span>
    </div>
  );
}

function Task({ done, title, sub }: { done?: boolean; title: string; sub: string }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-md bg-secondary px-3 py-2.5 text-[12px] leading-tight ${done ? "opacity-60" : ""}`}>
      <span
        className={`mt-0.5 grid h-4 w-4 flex-shrink-0 place-items-center rounded-sm border-[1.5px] ${
          done ? "border-[var(--status-success,#1A7D56)] bg-[var(--status-success,#1A7D56)] text-white" : "border-muted-foreground"
        }`}
      >
        {done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      <div>
        <div className={`text-foreground ${done ? "line-through" : ""}`}>
          <b className="font-semibold">{title}</b>
        </div>
        <div className="mt-1 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
