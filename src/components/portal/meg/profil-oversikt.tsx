/**
 * Profil-oversikt — PlayerHQ landing (/portal/meg). Mobil-først (430px).
 *
 * Port av spec i public/design-handover/_prompts/SKJERMER-RUNDE-2-...md §8:
 *   Header (avatar 80px + navn + meta "HCP · klubb · Pro credits" + badge)
 *   KPI 3-col (Runder / Beste / Snitt)
 *   Klikkbare rader (Innboks / Fakturaer / Bookinger / Innstillinger / Abonnement)
 *   "Logg ut" ghost destructive
 *
 * Server component. Bruker athletic-primitiver (AthleticAvatar, AthleticBadge,
 * KpiStrip/KpiCard) + DS-tokens. Ingen hardkodet hex, ingen emoji (kun lucide).
 * Radene er nav-lenker (Lucide-ikon + tittel + meta + chevron) — egen idiom,
 * ikke QueueList (som er avatar-basert for spiller-lister).
 */

import Link from "next/link";
import {
  ChevronRight,
  CreditCard,
  Inbox,
  LogOut,
  type LucideIcon,
  Receipt,
  Settings,
  CalendarClock,
} from "lucide-react";
import { AthleticAvatar } from "@/components/athletic/avatar";
import { AthleticBadge } from "@/components/athletic/badge";
import { KpiCard, KpiStrip } from "@/components/athletic/kpi";
import { logout } from "@/lib/auth/logout";
import { formatKr, type ProfilOversikt } from "@/lib/portal-meg/profil-data";

type RowProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  meta: string;
  /** Lite tall-merke til høyre for tittelen (uleste/utestående). */
  count?: number;
  countTone?: "lime" | "warn";
};

function ProfilRow({ href, icon: Icon, title, meta, count, countTone = "lime" }: RowProps) {
  return (
    <Link
      href={href}
      className="grid grid-cols-[36px_1fr_auto] items-center gap-x-3 px-1 py-3.5 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    >
      <span className="grid h-9 w-9 place-items-center rounded-md bg-secondary text-foreground">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate text-[14px] font-semibold leading-tight tracking-[-0.005em] text-foreground">
            {title}
          </span>
          {count != null && count > 0 && (
            <span
              className={
                countTone === "warn"
                  ? "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive/15 px-1.5 font-mono text-[10px] font-bold tabular-nums text-destructive"
                  : "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[10px] font-bold tabular-nums text-primary"
              }
            >
              {count}
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
          {meta}
        </span>
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-muted-foreground/60"
        strokeWidth={2}
        aria-hidden
      />
    </Link>
  );
}

export function ProfilOversiktView({ data }: { data: ProfilOversikt }) {
  const fakturaMeta =
    data.fakturaer.utestaaende > 0
      ? `${data.fakturaer.utestaaende} utestående${data.fakturaer.sumKr != null ? ` · ${formatKr(data.fakturaer.sumKr)}` : ""}`
      : "Ingen utestående fakturaer";

  const innboksMeta =
    data.innboks.sisteTittel != null
      ? `${data.innboks.sisteTittel}${data.innboks.sisteNaar ? ` · ${data.innboks.sisteNaar}` : ""}`
      : "Ingen meldinger ennå";

  const bookingMeta = data.nesteBooking.tekst ?? "Ingen kommende timer";

  return (
    <div className="mx-auto w-full max-w-[460px] space-y-5 px-4 py-5 sm:px-0">
      {/* Header */}
      <header className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-4">
          <AthleticAvatar
            src={data.avatarUrl}
            initials={data.initialer}
            size="xl"
            borderColor="card"
            className="h-20 w-20 text-xl"
          />
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-foreground">
              {data.navn}
            </h1>
            {data.metaDeler.length > 0 && (
              <p className="mt-1 font-mono text-[11px] font-semibold tracking-[0.04em] text-muted-foreground">
                {data.metaDeler.join(" · ")}
              </p>
            )}
            <div className="mt-2.5">
              <AthleticBadge variant={data.badge.variant}>{data.badge.label}</AthleticBadge>
            </div>
          </div>
        </div>
      </header>

      {/* KPI 3-col */}
      <KpiStrip cols={3} className="gap-3">
        <KpiCard label="Runder" value={data.kpi.runder} size="md" />
        <KpiCard label="Beste" value={data.kpi.beste} size="md" />
        <KpiCard label="Snitt" value={data.kpi.snitt} size="md" />
      </KpiStrip>

      {/* Klikkbare rader */}
      <nav
        aria-label="Min profil"
        className="divide-y divide-border rounded-xl border border-border bg-card px-2.5"
      >
        <ProfilRow
          href="/portal/varsler"
          icon={Inbox}
          title="Innboks"
          meta={innboksMeta}
          count={data.innboks.uleste}
          countTone="lime"
        />
        <ProfilRow
          href="/portal/meg/abonnement"
          icon={Receipt}
          title="Fakturaer"
          meta={fakturaMeta}
          count={data.fakturaer.utestaaende}
          countTone="warn"
        />
        <ProfilRow
          href="/portal/meg/bookinger"
          icon={CalendarClock}
          title="Bookinger"
          meta={bookingMeta}
        />
        <ProfilRow
          href="/portal/meg/innstillinger"
          icon={Settings}
          title="Innstillinger"
          meta="Profil, fasiliteter, varsler"
        />
        <ProfilRow
          href="/portal/meg/abonnement"
          icon={CreditCard}
          title="Abonnement"
          meta="Endre plan, betaling, oppgrader"
        />
      </nav>

      {/* Logg ut */}
      <form action={logout}>
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-destructive/30 bg-transparent px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-1"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Logg ut
        </button>
      </form>
    </div>
  );
}
