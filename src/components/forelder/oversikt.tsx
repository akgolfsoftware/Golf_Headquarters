/**
 * Foreldre-portal · landing (/forelder). Hybrid design-system.
 *
 * Lag:
 *   1. Editorial hero — eyebrow + display title (italic forest) + sub
 *   2. KPI strip — HCP / Neste booking / Streak (3-col, mono, tabular)
 *   3. Featured focus card — forest gradient, lime accents, drill progress
 *   4. Ukesrapport — coach avatar "AK", note, tag pills
 *   5. Kommende bookinger — date-box + meta + status pill
 */

import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  Eye,
  MapPin,
  Target,
} from "lucide-react";
import type {
  ForelderAktivitet,
  ForelderFaktura,
  ForelderOversikt,
  KommendeBooking,
} from "@/lib/forelder";
import type { PaymentStatus, PyramidArea } from "@/generated/prisma/client";

// ── Dato-formatering (nb-NO) ────────────────────────────────────────
const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const NB_DAG = new Intl.DateTimeFormat("nb-NO", { day: "numeric" });
const NB_MND_KORT = new Intl.DateTimeFormat("nb-NO", { month: "short" });
const NB_TID = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
});
const NB_DAG_MND = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});

function kr(ore: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(ore / 100);
}

function hilsenOrd(): string {
  const h = new Date().getHours();
  if (h < 10) return "God morgen";
  if (h < 17) return "God dag";
  if (h < 22) return "God kveld";
  return "God natt";
}

// ── Pyramide-akse → norsk navn ────────────────────────────────────
const akseNavn: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

// ── Faktura-status → pille ────────────────────────────────────────
function fakturaPille(s: PaymentStatus): { tekst: string; klasse: string } {
  if (s === "SUCCEEDED") return { tekst: "Betalt", klasse: "bg-success/10 text-success" };
  if (s === "FAILED") return { tekst: "Feilet", klasse: "bg-destructive/10 text-destructive" };
  if (s === "REFUNDED" || s === "PARTIALLY_REFUNDED")
    return { tekst: "Refundert", klasse: "bg-secondary text-muted-foreground" };
  return { tekst: "Forfaller", klasse: "bg-warning/10 text-warning" };
}

// ── Varsel-type → ikon ─────────────────────────────────────────────
function AktivitetIkon({ type }: { type: string }) {
  const t = type.toLowerCase();
  const cls = "h-3.5 w-3.5";
  if (t.includes("booking") || t.includes("kalender"))
    return <CalendarCheck className={cls} strokeWidth={1.75} aria-hidden />;
  if (t.includes("target") || t.includes("plan") || t.includes("økt"))
    return <Target className={cls} strokeWidth={1.75} aria-hidden />;
  return <Bell className={cls} strokeWidth={1.75} aria-hidden />;
}

// ── Aktivitet relativ tid ─────────────────────────────────────────
function relativTid(d: Date): string {
  const nå = new Date();
  const start = new Date(nå.getFullYear(), nå.getMonth(), nå.getDate());
  const mål = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((start.getTime() - mål.getTime()) / 86_400_000);
  if (diff === 0) return `I dag · ${NB_TID.format(d)}`;
  if (diff === 1) return `I går · ${NB_TID.format(d)}`;
  return NB_DAG_MND.format(d);
}

// ── Delkomponenter ────────────────────────────────────────────────

function KpiCell({
  label,
  value,
  sub,
  border,
}: {
  label: string;
  value: string;
  sub?: string;
  border?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-[3px] px-[10px] py-[11px]${border ? " border-r border-border" : ""}`}
    >
      <span className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-[20px] font-bold tabular-nums leading-none tracking-[-0.02em] text-foreground">
        {value}
      </span>
      {sub && (
        <span className="font-mono text-[9.5px] font-semibold text-muted-foreground">{sub}</span>
      )}
    </div>
  );
}

function BookingRad({ b }: { b: KommendeBooking }) {
  const pille =
    b.status === "VENT"
      ? "bg-warning/10 text-warning"
      : "bg-success/10 text-success";
  const pilleTekst = b.status === "VENT" ? "Venter" : "Betalt";

  return (
    <li className="grid grid-cols-[40px_1fr_auto] items-center gap-3 px-4 py-3">
      {/* Date box */}
      <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-secondary">
        <span className="font-mono text-[14px] font-bold leading-none text-primary">
          {NB_DAG.format(b.startAt)}
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.06em] text-muted-foreground">
          {NB_MND_KORT.format(b.startAt)}
        </span>
      </div>
      {/* Content */}
      <div className="min-w-0">
        <div className="truncate text-[13px] font-bold tracking-[-0.005em] text-foreground">
          {b.serviceName}
        </div>
        <div className="mt-0.5 truncate font-mono text-[10px] font-semibold tracking-[0.02em] text-muted-foreground">
          {b.locationName} · {NB_TID.format(b.startAt)}
          {b.coachName ? ` · ${b.coachName.split(" ")[0]}` : ""}
        </div>
      </div>
      {/* Status pill */}
      <span
        className={`shrink-0 rounded-[4px] px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] ${pille}`}
      >
        {pilleTekst}
      </span>
    </li>
  );
}

function FakturaRad({ f }: { f: ForelderFaktura }) {
  const p = fakturaPille(f.status);
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold text-foreground">{f.beskrivelse}</div>
        <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
          {NB_DAG_MND.format(f.createdAt)}
          {f.childName ? ` · ${f.childName}` : ""}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[13px] font-extrabold tabular-nums tracking-[-0.005em] text-foreground">
          {kr(f.amountOre)}
        </span>
        <span
          className={`rounded-[4px] px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] ${p.klasse}`}
        >
          {p.tekst}
        </span>
      </div>
    </li>
  );
}

function AktivitetRad({ a }: { a: ForelderAktivitet }) {
  const innhold = (
    <div className="flex items-start gap-3 py-3">
      <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground">
        <AktivitetIkon type={a.type} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] leading-snug text-foreground">{a.title}</div>
        {a.body && (
          <div className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">{a.body}</div>
        )}
        <div className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          {relativTid(a.createdAt)}
        </div>
      </div>
    </div>
  );
  return (
    <li className="border-b border-border last:border-b-0">
      {a.link ? (
        <Link
          href={a.link}
          className="block rounded-md transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {innhold}
        </Link>
      ) : (
        innhold
      )}
    </li>
  );
}

// ── Hoved-komponent ───────────────────────────────────────────────

export function ForelderOversiktView({ data }: { data: ForelderOversikt }) {
  // Tom tilstand — ingen barn koblet
  if (!data.fokusBarn) {
    return (
      <div className="mx-auto w-full max-w-[460px] space-y-5 px-1 py-1">
        <header>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            FORELDREPORTAL · OVERSIKT
          </span>
          <h1 className="mt-1 font-display text-[28px] font-bold leading-[1.1] tracking-[-0.03em]">
            Velkommen,{" "}
            <em className="font-medium italic text-primary">forelder</em>
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Du er ikke koblet til noen barn ennå.
          </p>
        </header>
        <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
          <Bell className="mx-auto h-7 w-7 text-muted-foreground/50" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-[13px] text-muted-foreground">
            Be spilleren sende en invitasjon fra sin profil, eller kontakt support.
          </p>
        </div>
      </div>
    );
  }

  const barn = data.fokusBarn;
  const fornavn = barn.name.split(" ")[0] ?? barn.name;
  const datoStr =
    NB_DATO.format(new Date()).charAt(0).toUpperCase() + NB_DATO.format(new Date()).slice(1);

  // KPI-verdier
  const nb = data.kpi.nesteBooking;
  const nesteVerdi = nb ? NB_DAG.format(nb.startAt) : "—";
  const nesteSub = nb
    ? `${NB_MND_KORT.format(nb.startAt)} · ${NB_TID.format(nb.startAt)}`
    : "Ingen kommende";
  const hcpVerdi = barn.hcp !== null ? barn.hcp.toFixed(1) : "—";
  const okterVerdi = data.kpi.okter30d.toString();

  // Focus card — bruk kommendeOkter som aktivitetsmetrikk
  const planSessions = data.kommendeOkter.length;
  const okterDone = data.kpi.okter30d;
  const pct = planSessions > 0 ? Math.min(100, Math.round((okterDone / planSessions) * 100)) : 0;

  // Ukesrapport — hent siste faktura som "note" eller fallback
  const sisteAktivitet = data.aktivitet[0] ?? null;
  const sisteFaktura = data.fakturaer[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-[460px] space-y-5 px-1 py-1">
      {/* ── Seksjon 1: Editorial hero ────────────────────────── */}
      <header className="pt-1">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {datoStr}
        </span>
        <h1 className="mt-1 font-display text-[28px] font-bold leading-[1.1] tracking-[-0.03em]">
          {hilsenOrd()},{" "}
          <em className="font-medium italic text-primary">{fornavn}</em>
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {barn.name} har {data.kpi.okter30d} treningsøkt{data.kpi.okter30d === 1 ? "" : "er"} siste 30 dager
          {data.coachNavn ? ` · Coach ${data.coachNavn.split(" ")[0]}` : ""}
          {data.klubb ? ` · ${data.klubb}` : ""}
        </p>
      </header>

      {/* Utestående-varsel */}
      {data.kpi.utestaaendeAntall > 0 && (
        <Link
          href="/forelder/fakturaer"
          className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3.5 transition-colors hover:bg-warning/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" strokeWidth={1.75} aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-foreground">
              {data.kpi.utestaaendeAntall} utestående faktura
              {data.kpi.utestaaendeAntall === 1 ? "" : "er"} · {kr(data.kpi.utestaaendeOre)}
            </div>
            <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Trykk for å se fakturaer
            </div>
          </div>
          <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={2} aria-hidden />
        </Link>
      )}

      {/* ── Seksjon 2: KPI strip ─────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-3">
          <KpiCell label="HCP" value={hcpVerdi} border />
          <KpiCell label="Neste økt" value={nesteVerdi} sub={nesteSub} border />
          <KpiCell label="Streak · 30d" value={okterVerdi} sub="treningsøkter" />
        </div>
      </div>

      {/* ── Seksjon 3: Featured focus card ───────────────────── */}
      <div
        className="relative overflow-hidden rounded-xl p-[18px] text-white"
        style={{ background: "linear-gradient(150deg,#005840,#003d2d)" }}
      >
        {/* Radial lime glow */}
        <div
          className="pointer-events-none absolute -right-6 -top-10 h-40 w-40 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(209,248,67,0.2),transparent 68%)" }}
        />

        {/* Eyebrow */}
        <div className="font-mono text-[8.5px] font-bold uppercase tracking-[0.12em] text-white/55 mb-[10px]">
          Denne ukens fokus · {fornavn}
        </div>

        {planSessions === 0 ? (
          <>
            <div className="font-display text-[22px] font-bold leading-[1.15] tracking-[-0.025em]">
              Ingen aktiv plan
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-white/70">
              {fornavn} har ingen planlagte økt de neste 7 dagene. Coachen setter opp plan i Workbench.
            </p>
          </>
        ) : (
          <>
            <div className="font-display text-[22px] font-bold leading-[1.15] tracking-[-0.025em]">
              {data.kommendeOkter[0]?.title ?? "Treningsplan"}
            </div>
            {data.kommendeOkter[0] && (
              <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-white/60">
                {akseNavn[data.kommendeOkter[0].pyramidArea]} ·{" "}
                {NB_TID.format(data.kommendeOkter[0].scheduledAt)}
              </div>
            )}

            {/* Progress bar */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className="font-mono text-[9.5px] font-bold"
                style={{ color: "#D1F843" }}
              >
                {okterDone} av {planSessions} drills fullført
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: "#D1F843" }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Seksjon 4: Ukesrapport / coach note ──────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-start gap-3 p-4">
          {/* AK avatar */}
          <div
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[12px] font-bold"
            style={{ color: "#D1F843" }}
            aria-label="Coach AK"
          >
            AK
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[15px] font-bold tracking-[-0.02em] text-foreground">
              {data.coachNavn ?? "Coach"} · Ukesrapport
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {sisteAktivitet?.body ??
                sisteAktivitet?.title ??
                sisteFaktura?.beskrivelse ??
                `${fornavn} er i god utvikling. Fortsett med det planlagte programmet.`}
            </p>
            {/* Tag pills */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {data.kpi.okter30d} økter
              </span>
              {barn.hcp !== null && (
                <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  HCP {hcpVerdi}
                </span>
              )}
              {data.kpi.utestaaendeAntall > 0 && (
                <span className="rounded-full bg-warning/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-warning">
                  {data.kpi.utestaaendeAntall} faktura
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Seksjon 5: Kommende bookinger ─────────────────────── */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
            Kommende bookinger
          </span>
          <Link
            href="/forelder/bookinger"
            className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary hover:underline"
          >
            Se alle
            <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden />
          </Link>
        </div>

        {data.kommendeBookinger.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <CalendarClock className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
            <p className="mt-2.5 text-[13px] text-muted-foreground">
              Ingen bookinger de neste 7 dagene.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.kommendeBookinger.slice(0, 3).map((b) => (
              <BookingRad key={b.id} b={b} />
            ))}
          </ul>
        )}
      </section>

      {/* Fakturaer */}
      {data.fakturaer.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
              Fakturaer · Siste 3
            </span>
            <Link
              href="/forelder/fakturaer"
              className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary hover:underline"
            >
              Historikk
              <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {data.fakturaer.map((f) => (
              <FakturaRad key={f.id} f={f} />
            ))}
          </ul>
        </section>
      )}

      {/* Siste aktivitet */}
      {data.aktivitet.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
              Siste aktivitet
            </span>
          </div>
          <div className="px-4">
            <ul>
              {data.aktivitet.map((a) => (
                <AktivitetRad key={a.id} a={a} />
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Lesemodus-notis */}
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-card p-3.5">
        <Eye className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
        <div>
          <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-foreground">
            Lesemodus
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Foreldre-portalen er kun for å følge med — booking og logging gjøres av {fornavn}{" "}
            selv. Du varsles når en godkjenning trengs.
          </p>
        </div>
      </div>

      {/* Bytt barn — kun ved flere barn */}
      {data.antallBarn > 1 && (
        <Link
          href="/forelder/barn"
          className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} aria-hidden />
            <span className="text-[13px] font-semibold text-foreground">
              Se alle {data.antallBarn} barn
            </span>
          </div>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[11px] font-bold text-muted-foreground">
            {data.antallBarn}
          </span>
        </Link>
      )}
    </div>
  );
}
