/**
 * Foreldre-portal · landing (/forelder). Mobil-først (430px).
 *
 * Port av public/design-handover/agencyos/components-foreldre.html §2 (foreldre-
 * portal hjem) til ett-kolonne mobil-flyt. Lese-først: ingen handling på vegne
 * av barnet — kun innsyn (status, kommende, fakturaer, aktivitet).
 *
 * Lag:
 *   Hero      — avatar + hilsen + fokus-barn-kontekst (navn · coach · klubb)
 *   KPI 3-col — Økter·30d / Neste booking / Utestående
 *   Kommende  — bookinger + planlagte økter neste 7 dager (tag-piller)
 *   Fakturaer — siste 3 (beløp + status-pille)
 *   Aktivitet — barnets varsler (ikon-ring + tekst + tid)
 *   Lesemodus — fast notis: foreldre-portalen er kun innsyn
 *
 * Server component. Athletic-primitiver (AthleticAvatar, AthleticEyebrow,
 * AthleticBadge, KpiCard, KpiStrip) + DS-tokens. Ingen hardkodet hex, kun lucide.
 */

import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  CalendarClock,
  Check,
  ChevronRight,
  CreditCard,
  Eye,
  MapPin,
  MessageCircle,
  Trophy,
  Video,
  type LucideIcon,
} from "lucide-react";
import {
  AthleticAvatar,
  AthleticBadge,
  AthleticEyebrow,
  KpiCard,
  KpiStrip,
} from "@/components/athletic";
import type {
  ForelderAktivitet,
  ForelderFaktura,
  ForelderOversikt,
  KommendeBooking,
  KommendeOkt,
} from "@/lib/forelder";
import type { PaymentStatus, PyramidArea } from "@/generated/prisma/client";

const NB_UKEDAG = new Intl.DateTimeFormat("nb-NO", { weekday: "short" });
const NB_DAG_MND = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});
const NB_TID = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
});

function kr(ore: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(ore / 100);
}

function aktivitetRelativ(d: Date): string {
  const nå = new Date();
  const start = new Date(nå.getFullYear(), nå.getMonth(), nå.getDate());
  const mål = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((start.getTime() - mål.getTime()) / 86_400_000);
  if (diff === 0) return `I dag · ${NB_TID.format(d)}`;
  if (diff === 1) return `I går · ${NB_TID.format(d)}`;
  return NB_DAG_MND.format(d);
}

function initialer(navn: string): string {
  return (
    navn
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??"
  );
}

// ── Pyramide-akse → border-farge for økt-rader ────────────────────
const akseBar: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys",
  TEK: "bg-pyr-tek",
  SLAG: "bg-pyr-slag",
  SPILL: "bg-pyr-spill",
  TURN: "bg-pyr-turn",
};

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

// ── Varsel-type → ikon + ring-tone ────────────────────────────────
function aktivitetIkon(type: string): { Icon: LucideIcon; ring: string } {
  const t = type.toLowerCase();
  if (t.includes("booking") || t.includes("kalender"))
    return { Icon: CalendarCheck, ring: "text-muted-foreground" };
  if (t.includes("video")) return { Icon: Video, ring: "text-primary" };
  if (t.includes("melding") || t.includes("kommentar") || t.includes("coach"))
    return { Icon: MessageCircle, ring: "text-info" };
  if (t.includes("achievement") || t.includes("nivå") || t.includes("trophy"))
    return { Icon: Trophy, ring: "text-success" };
  if (t.includes("plan") || t.includes("logg") || t.includes("økt"))
    return { Icon: Check, ring: "text-success" };
  return { Icon: Bell, ring: "text-muted-foreground" };
}

function PanelHead({
  label,
  href,
  hrefLabel,
}: {
  label: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
        {label}
      </span>
      {href && hrefLabel && (
        <Link
          href={href}
          className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary hover:underline"
        >
          {hrefLabel}
          <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden />
        </Link>
      )}
    </div>
  );
}

function BookingRad({ b }: { b: KommendeBooking }) {
  const pille =
    b.status === "VENT"
      ? "bg-warning/10 text-warning"
      : "bg-success/10 text-success";
  const pilleTekst = b.status === "VENT" ? "Vent" : "Betalt";
  return (
    <li className="relative grid grid-cols-[44px_1fr_auto] items-center gap-x-3 border-l-[3px] border-accent px-4 py-3">
      <div className="font-mono leading-none">
        <div className="text-base font-extrabold tracking-[-0.02em] text-foreground">
          {NB_UKEDAG.format(b.startAt)}
        </div>
        <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
          {NB_DAG_MND.format(b.startAt)}
        </div>
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-bold tracking-[-0.005em] text-foreground">
          {b.serviceName} · {b.durationMin} min
        </div>
        <div className="mt-0.5 truncate font-mono text-[10px] font-semibold tracking-[0.02em] text-muted-foreground">
          {b.locationName} · {NB_TID.format(b.startAt)}
          {b.coachName ? ` · ${b.coachName.split(" ")[0]}` : ""}
        </div>
      </div>
      <span
        className={`rounded-[4px] px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] ${pille}`}
      >
        {pilleTekst}
      </span>
    </li>
  );
}

function OktRad({ s }: { s: KommendeOkt }) {
  return (
    <li className="relative grid grid-cols-[44px_1fr_auto] items-center gap-x-3 px-4 py-3">
      <span
        aria-hidden
        className={`absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-full ${akseBar[s.pyramidArea]}`}
      />
      <div className="font-mono leading-none">
        <div className="text-base font-extrabold tracking-[-0.02em] text-foreground">
          {NB_UKEDAG.format(s.scheduledAt)}
        </div>
        <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
          {NB_DAG_MND.format(s.scheduledAt)}
        </div>
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-bold tracking-[-0.005em] text-foreground">
          {s.title}
        </div>
        <div className="mt-0.5 truncate font-mono text-[10px] font-semibold tracking-[0.02em] text-muted-foreground">
          Treningsøkt · {NB_TID.format(s.scheduledAt)}
        </div>
      </div>
      <span className="rounded-[4px] bg-secondary px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {akseNavn[s.pyramidArea]}
      </span>
    </li>
  );
}

function FakturaRad({ f }: { f: ForelderFaktura }) {
  const p = fakturaPille(f.status);
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold text-foreground">
          {f.beskrivelse}
        </div>
        <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
          {NB_DAG_MND.format(f.createdAt)}
          {f.childName ? ` · ${f.childName}` : ""}
        </div>
      </div>
      <div className="flex items-center gap-3">
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
  const { Icon, ring } = aktivitetIkon(a.type);
  const innhold = (
    <div className="grid grid-cols-[26px_1fr] items-start gap-3 py-3">
      <span
        className={`grid h-[26px] w-[26px] place-items-center rounded-full border border-border bg-card ${ring}`}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="text-[13px] leading-snug text-foreground">{a.title}</div>
        {a.body && (
          <div className="mt-0.5 truncate text-[12px] text-muted-foreground">{a.body}</div>
        )}
        <div className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          {aktivitetRelativ(a.createdAt)}
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

export function ForelderOversiktView({ data }: { data: ForelderOversikt }) {
  // Tomtilstand — ingen barn koblet.
  if (!data.fokusBarn) {
    return (
      <div className="mx-auto w-full max-w-[460px] space-y-5 px-1 py-1">
        <header>
          <AthleticEyebrow>FORELDREPORTAL · OVERSIKT</AthleticEyebrow>
          <h1 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
            Velkommen
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Du er ikke koblet til noen barn ennå.
          </p>
        </header>
        <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
          <Bell className="mx-auto h-7 w-7 text-muted-foreground/50" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-sm text-muted-foreground">
            Be spilleren sende en invitasjon fra sin profil, eller kontakt support.
          </p>
        </div>
      </div>
    );
  }

  const barn = data.fokusBarn;
  const fornavn = barn.name.split(" ")[0] ?? barn.name;
  const time = new Date().getHours();
  const hilsen =
    time < 10 ? "God morgen" : time < 17 ? "God dag" : time < 22 ? "God kveld" : "God natt";

  // Sub-linje: "VISER <NAVN> · COACH <X> · <KLUBB>"
  const subDeler = [
    `VISER ${fornavn.toUpperCase()}`,
    data.coachNavn ? `COACH ${data.coachNavn.split(" ").slice(-1)[0].toUpperCase()}` : null,
    data.klubb ? data.klubb.toUpperCase() : null,
  ].filter(Boolean);

  // KPI-verdier
  const nb = data.kpi.nesteBooking;
  const bookingVerdi = nb ? NB_UKEDAG.format(nb.startAt) : "—";
  const bookingUnit = nb ? NB_TID.format(nb.startAt) : undefined;
  const bookingSub = nb ? `${nb.locationName} · ${nb.durationMin} min` : "Ingen kommende";

  const utestVerdi =
    data.kpi.utestaaendeAntall > 0
      ? new Intl.NumberFormat("nb-NO").format(Math.round(data.kpi.utestaaendeOre / 100))
      : "0";

  // Slå sammen bookinger + treningsøkter, sorter på tid, vis topp 4.
  const kommende = [
    ...data.kommendeBookinger.map((b) => ({ kind: "booking" as const, at: b.startAt, b })),
    ...data.kommendeOkter.map((s) => ({ kind: "okt" as const, at: s.scheduledAt, s })),
  ]
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-[460px] space-y-5 px-1 py-1">
      {/* Hero */}
      <header>
        <AthleticEyebrow>FORELDREPORTAL · OVERSIKT</AthleticEyebrow>
        <div className="mt-4 flex items-center gap-4">
          <AthleticAvatar
            src={barn.avatarUrl}
            initials={initialer(barn.name)}
            size="xl"
            borderColor="card"
            className="h-16 w-16 text-lg shadow-[0_8px_24px_rgba(0,88,64,0.18)]"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
              {hilsen},{" "}
              <em className="font-display font-normal italic text-primary">{fornavn}</em>
            </h1>
            {subDeler.length > 0 && (
              <p className="mt-1 font-mono text-[11px] font-semibold tracking-[0.04em] text-muted-foreground">
                {subDeler.join(" · ")}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Utestående-varsel */}
      {data.kpi.utestaaendeAntall > 0 && (
        <Link
          href="/forelder/fakturaer"
          className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3.5 transition-colors hover:bg-warning/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" strokeWidth={1.75} aria-hidden />
          <div className="min-w-0">
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

      {/* KPI 3-col */}
      <KpiStrip cols={3} className="gap-3">
        <KpiCard
          label="Økter · 30 d"
          value={data.kpi.okter30d}
          unit="økter"
          size="md"
        />
        <KpiCard label="Neste" value={bookingVerdi} unit={bookingUnit} size="md" />
        <KpiCard label="Utestående" value={utestVerdi} unit="kr" size="md" />
      </KpiStrip>
      <p className="-mt-2 font-mono text-[10px] font-semibold tracking-[0.04em] text-muted-foreground">
        {bookingSub}
      </p>

      {/* Kommende */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <PanelHead label="KOMMENDE · 7 DAGER" href="/forelder/bookinger" hrefLabel="Se alle" />
        {kommende.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <CalendarClock className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
            <p className="mt-2.5 text-[13px] text-muted-foreground">
              Ingen bookinger eller økter de neste 7 dagene.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {kommende.map((k) =>
              k.kind === "booking" ? (
                <BookingRad key={`b-${k.b.id}`} b={k.b} />
              ) : (
                <OktRad key={`s-${k.s.id}`} s={k.s} />
              ),
            )}
          </ul>
        )}
      </section>

      {/* Fakturaer */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <PanelHead label="FAKTURAER · SISTE 3" href="/forelder/fakturaer" hrefLabel="Historikk" />
        {data.fakturaer.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <CreditCard className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
            <p className="mt-2.5 text-[13px] text-muted-foreground">Ingen fakturaer registrert.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.fakturaer.map((f) => (
              <FakturaRad key={f.id} f={f} />
            ))}
          </ul>
        )}
      </section>

      {/* Siste aktivitet */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <PanelHead label="SISTE AKTIVITET" />
        <div className="px-4">
          {data.aktivitet.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Bell className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
              <p className="mt-2.5 text-[13px] text-muted-foreground">Ingen aktivitet ennå.</p>
            </div>
          ) : (
            <ul>
              {data.aktivitet.map((a) => (
                <AktivitetRad key={a.id} a={a} />
              ))}
            </ul>
          )}
        </div>
      </section>

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

      {/* Bytt barn — vises kun ved flere barn */}
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
          <AthleticBadge variant="neutral">{data.antallBarn}</AthleticBadge>
        </Link>
      )}
    </div>
  );
}
