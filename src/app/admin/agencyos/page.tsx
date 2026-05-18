// AgencyOS — operativ hub for coach Anders.
// Speiler "AK Golf AgencyOS"-designet (Claude artifact, 2026-05-10): morgenbrief +
// KPIer + Til godkjenning + Dagens flyt + Stripe-panel + Caddie-aktivitet +
// connectors med direktelenker. All farge går via AK Golf-tokens (cream/forest/lime).

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileWarning,
  Inbox as InboxIcon,
  Mail,
  Sparkles,
  Trophy,
  Wallet,
  Wrench,
} from "lucide-react";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

type Connector = {
  name: string;
  href: string;
  blurb: string;
  status: "ok" | "warn" | "off";
  letter: string;
};

const CONNECTORS: Connector[] = [
  { name: "Gmail", href: "https://mail.google.com", blurb: "Innboks og utkast", status: "ok", letter: "M" },
  { name: "Google Calendar", href: "https://calendar.google.com", blurb: "Kalender og bookinger", status: "ok", letter: "C" },
  { name: "Notion", href: "https://notion.so", blurb: "Spillerlogg og sportsplan", status: "ok", letter: "N" },
  { name: "Stripe", href: "https://dashboard.stripe.com", blurb: "Abonnement og fakturaer", status: "ok", letter: "S" },
  { name: "Linear", href: "https://linear.app", blurb: "Tasks og prosjekter", status: "ok", letter: "L" },
  { name: "Slack", href: "https://slack.com", blurb: "Team-kommunikasjon", status: "ok", letter: "#" },
  { name: "Google Drive", href: "https://drive.google.com", blurb: "Dokumenter og bilder", status: "ok", letter: "D" },
  { name: "Figma", href: "https://figma.com", blurb: "Design-filer", status: "ok", letter: "F" },
  { name: "Vercel", href: "https://vercel.com/akgolfgroup-netizens-projects", blurb: "Deploys og logs", status: "ok", letter: "V" },
  { name: "Supabase", href: "https://supabase.com/dashboard", blurb: "Database og auth", status: "ok", letter: "Sb" },
];

const DAGER = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const MND = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];

function formatNok(ore: number): string {
  return new Intl.NumberFormat("nb-NO").format(Math.round(ore / 100));
}

function timeStr(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

export default async function AgencyOSPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const now = new Date();
  const dagStart = new Date(now);
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagSlutt.getDate() + 1);

  const ukeStart = new Date(dagStart);
  ukeStart.setDate(ukeStart.getDate() - ((ukeStart.getDay() + 6) % 7));
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const mndStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const mndSlutt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);
  const seksti = new Date(now);
  seksti.setDate(seksti.getDate() - 60);

  const [
    pendingNotifications,
    dagensBookinger,
    ukensBookinger,
    innbetaltMnd,
    utestaende,
    sisteAktivitet,
    aktiveSpillere,
    ventendeGodkjenninger,
    spillereUtenPlan,
    testerForfaller,
    utestaendeFakturaCount,
  ] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id, readAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.booking.findMany({
      where: {
        startAt: { gte: dagStart, lt: dagSlutt },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      orderBy: { startAt: "asc" },
      include: { user: true, serviceType: true, location: true, facility: true },
      take: 12,
    }),
    prisma.booking.count({
      where: {
        startAt: { gte: ukeStart, lt: ukeSlutt },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amountOre: true },
      where: {
        status: "SUCCEEDED",
        paidAt: { gte: mndStart, lt: mndSlutt },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amountOre: true },
      where: { status: "PENDING" },
    }),
    prisma.auditLog.findMany({
      where: { actorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    // Aktive spillere = PLAYER med lastLoginAt siste 30 dager
    prisma.user.count({
      where: { role: "PLAYER", lastLoginAt: { gte: tretti } },
    }),
    // Ventende godkjenninger
    prisma.planAction.count({ where: { status: "PENDING" } }),
    // Spillere uten aktiv treningsplan
    prisma.user.count({
      where: {
        role: "PLAYER",
        trainingPlans: { none: { isActive: true } },
      },
    }),
    // Tester forfaller — spillere uten testresultat siste 60 dager
    prisma.user.count({
      where: {
        role: "PLAYER",
        testResults: { none: { takenAt: { gte: seksti } } },
      },
    }),
    // Utestående faktura (count, ikke beløp)
    prisma.payment.count({ where: { status: "PENDING" } }),
  ]);

  // Mine spilleres turneringer (neste 30 dager)
  const tretti_frem = new Date(now);
  tretti_frem.setDate(tretti_frem.getDate() + 30);
  const kommendeEntries = await prisma.tournamentEntry.findMany({
    where: {
      tournamentId: { not: null },
      tournament: {
        startDate: { gte: dagStart, lt: tretti_frem },
      },
    },
    include: {
      tournament: { select: { id: true, name: true, startDate: true } },
      user: { select: { id: true, name: true } },
    },
    orderBy: { tournament: { startDate: "asc" } },
  });

  // Grupper per turnering
  const tourneyMap = new Map<
    string,
    {
      id: string;
      name: string;
      startDate: Date;
      spillere: { id: string; name: string }[];
    }
  >();
  for (const e of kommendeEntries) {
    if (!e.tournament) continue;
    const eks = tourneyMap.get(e.tournament.id);
    if (eks) {
      eks.spillere.push({ id: e.user.id, name: e.user.name ?? "?" });
    } else {
      tourneyMap.set(e.tournament.id, {
        id: e.tournament.id,
        name: e.tournament.name,
        startDate: e.tournament.startDate,
        spillere: [{ id: e.user.id, name: e.user.name ?? "?" }],
      });
    }
  }
  const turneringerMedSpillere = Array.from(tourneyMap.values()).slice(0, 6);

  const innbetaltOre = innbetaltMnd._sum.amountOre ?? 0;
  const utestaendeOre = utestaende._sum.amountOre ?? 0;
  const fornavn = user.name?.split(" ")[0] ?? "Anders";

  const datolinje = `${DAGER[now.getDay()]} ${now.getDate()}. ${MND[now.getMonth()]}`;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`AgencyOS · ${datolinje} · ${timeStr(now)}`}
        titleLead={`God morgen, ${fornavn}.`}
        titleItalic="Her er dagen."
        sub={`Du har ${dagensBookinger.length} timer i dag og ${ukensBookinger} bookinger denne uka. Caddie holder utkast klare i innboksen din.`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/brief"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-secondary"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              Daglig brief
            </Link>
            <Link
              href="/admin/calendar"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Calendar className="h-4 w-4" />
              Åpne kalender
            </Link>
          </div>
        }
      />

      {/* KPI-strip — operativ status */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label="Aktive spillere"
          value={String(aktiveSpillere)}
          unit="siste 30 d"
          note="I porteføljen"
          tone="good"
        />
        <KpiCard
          label="Timer denne uka"
          value={String(ukensBookinger)}
          unit="bookinger"
          note={`${dagensBookinger.length} i dag`}
          tone="good"
        />
        <KpiCard
          label={`Innbetalt · ${MND[now.getMonth()]}`}
          value={formatNok(innbetaltOre)}
          unit="kr"
          note="Stripe · denne måneden"
          tone="good"
        />
        <KpiCard
          label="Godkjenninger"
          value={String(ventendeGodkjenninger)}
          unit="venter"
          note={ventendeGodkjenninger === 0 ? "Alt klart" : "Krever Anders"}
          tone={ventendeGodkjenninger === 0 ? "good" : "warn"}
        />
      </div>

      {/* Hub bunn-rad — risikosignaler */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RiskCard
          icon={ClipboardList}
          label="Spillere uten plan"
          value={String(spillereUtenPlan)}
          note={
            spillereUtenPlan === 0
              ? "Alle har aktiv treningsplan"
              : "Trenger plan-utkast fra Caddie"
          }
          href="/admin/spillere?view=tabell&status=uten-plan"
          tone={spillereUtenPlan > 0 ? "warn" : "good"}
        />
        <RiskCard
          icon={AlertTriangle}
          label="Tester forfaller"
          value={String(testerForfaller)}
          note={
            testerForfaller === 0
              ? "Alle har test siste 60 d"
              : "Skal kalles inn til test"
          }
          href="/portal/tren/tester"
          tone={testerForfaller > 0 ? "warn" : "good"}
        />
        <RiskCard
          icon={FileWarning}
          label="Utestående faktura"
          value={`kr ${formatNok(utestaendeOre)}`}
          note={
            utestaendeFakturaCount === 0
              ? "Ingen åpne fakturaer"
              : `${utestaendeFakturaCount} faktura${utestaendeFakturaCount === 1 ? "" : "er"} auto-purres`
          }
          href="/admin/finance"
          tone={utestaendeOre > 0 ? "warn" : "good"}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
        {/* Hovedkolonne */}
        <div className="space-y-8 lg:col-span-2">
          {/* Til godkjenning */}
          <section className="rounded-lg border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Til <em>godkjenning</em>
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  Caddie holder dem klare — du sier ja, nei eller redigerer
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {pendingNotifications.length} venter
              </span>
            </div>
            {pendingNotifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Innboks er tom. Caddie har håndtert alt.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {pendingNotifications.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.link ?? "/portal/varsler"}
                      className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-secondary/40"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent-foreground">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                          {n.type} · {n.createdAt.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                        </div>
                        <h4 className="mt-0.5 truncate text-sm font-semibold text-foreground">
                          {n.title}
                        </h4>
                        {n.body && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
                        )}
                      </div>
                      <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-border px-6 py-4 text-center">
              <Link
                href="/portal/varsler"
                className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
              >
                Se alle varsler →
              </Link>
            </div>
          </section>

          {/* Dagens flyt */}
          <section className="rounded-lg border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Dagens <em>flyt</em>
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {dagensBookinger.length} timer · sortert kronologisk
                </p>
              </div>
              <Link
                href="/admin/calendar"
                className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
              >
                Full kalender →
              </Link>
            </div>
            {dagensBookinger.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Ingen bookinger i dag. Bruk dagen til å forberede uka.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {dagensBookinger.map((b) => {
                  const navn = b.user?.name ?? b.guestName ?? "Gjest";
                  const initialer = navn
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  return (
                    <li key={b.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-14 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {timeStr(b.startAt)}
                      </div>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[11px] font-semibold tabular-nums">
                        {initialer}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {navn} · {b.serviceType.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {b.location.name}
                          {b.facility ? ` · ${b.facility.name}` : ""}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-sm bg-accent/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
                        {b.status === "CONFIRMED" ? "Bekreftet" : "Avventer"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Mine spilleres turneringer */}
          <section className="rounded-lg border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Mine spilleres <em>turneringer</em>
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Neste 30 dager · {turneringerMedSpillere.length} turneringer · {kommendeEntries.length} påmeldinger
                </p>
              </div>
              <Link
                href="/admin/tournaments"
                className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
              >
                Alle turneringer →
              </Link>
            </div>
            {turneringerMedSpillere.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Ingen påmeldinger neste 30 dager.
                </p>
                <Link
                  href="/admin/tournaments"
                  className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
                >
                  Meld på spillere →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {turneringerMedSpillere.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/admin/tournaments/${t.id}`}
                      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/40"
                    >
                      <div className="w-14 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {t.startDate.toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {t.name}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                          {t.spillere.length} spiller
                          {t.spillere.length === 1 ? "" : "e"} påmeldt
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        {t.spillere.slice(0, 4).map((s) => (
                          <span
                            key={s.id}
                            title={s.name}
                            className="grid h-7 w-7 place-items-center rounded-full border-2 border-card font-mono text-[10px] font-semibold text-white"
                            style={{ background: avatarBg(s.name) }}
                          >
                            {initialsFromName(s.name)}
                          </span>
                        ))}
                        {t.spillere.length > 4 && (
                          <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-secondary font-mono text-[10px] font-semibold text-foreground">
                            +{t.spillere.length - 4}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidekolonne — sticky så den følger scroll i hovedkolonnen */}
        <aside className="space-y-8 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1">
          {/* Stripe-panel */}
          <section className="rounded-lg border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
              <h3 className="font-display text-sm font-semibold tracking-tight">
                Stripe · denne <em>måneden</em>
              </h3>
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
              >
                Åpne →
              </a>
            </div>
            <dl className="divide-y divide-border">
              <MoneyRow label="Innbetalt" value={`kr ${formatNok(innbetaltOre)}`} tone="good" />
              <MoneyRow label="Utestående" value={`kr ${formatNok(utestaendeOre)}`} tone={utestaendeOre > 0 ? "warn" : ""} />
            </dl>
            <div className="border-t border-border px-6 py-4">
              <Link
                href="/admin/finance"
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
              >
                <Wallet className="h-3 w-3" /> Internt regnskap
              </Link>
            </div>
          </section>

          {/* Caddie-aktivitet */}
          <section className="rounded-lg border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
              <h3 className="font-display text-sm font-semibold tracking-tight">
                Caddie · <em>aktivitet</em>
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Siste 24 t
              </span>
            </div>
            {sisteAktivitet.length === 0 ? (
              <p className="px-6 py-6 text-center text-sm text-muted-foreground">
                Ingen aktivitet ennå.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {sisteAktivitet.map((a) => (
                  <li key={a.id} className="px-6 py-4">
                    <div className="text-sm text-foreground">{a.action}</div>
                    {a.target && (
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">{a.target}</div>
                    )}
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {a.createdAt.toLocaleString("nb-NO", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Connectors */}
          <section className="rounded-lg border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
              <h3 className="font-display text-sm font-semibold tracking-tight">
                Mine <em>connectors</em>
              </h3>
              <Link
                href="/admin/integrasjoner"
                className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
              >
                Admin →
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {CONNECTORS.map((c) => (
                <li key={c.name}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/40"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary font-mono text-[11px] font-semibold">
                      {c.letter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">{c.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{c.blurb}</div>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        c.status === "ok"
                          ? "bg-primary"
                          : c.status === "warn"
                            ? "bg-destructive"
                            : "bg-muted-foreground"
                      }`}
                    />
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Snarveier */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-sm font-semibold tracking-tight">
              Caddie <em>snarveier</em>
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <QuickLink href="/admin/innboks" icon={InboxIcon} label="Innboks" />
              <QuickLink href="/admin/calendar" icon={Calendar} label="Kalender" />
              <QuickLink href="/admin/elever" icon={Mail} label="Spillere" />
              <QuickLink href="/admin/agents" icon={Wrench} label="AI-agenter" />
            </div>
          </section>
        </aside>
      </div>

      {/* Caddie-chat-stub */}
      <div className="sticky bottom-4 z-30 mx-auto max-w-3xl rounded-full border border-border bg-card px-4 py-2 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
            C
          </div>
          <input
            disabled
            placeholder='Spør Caddie — "send vinterpakke til Bjørn", "flytt onsdag", "hvem skylder meg penger?"'
            className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground sm:inline">
            kommer snart
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------- delkomponenter ----------

function KpiCard({
  label,
  value,
  unit,
  note,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  note: string;
  tone: "good" | "warn";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-2xl font-semibold tabular-nums text-foreground">
          {value}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">{unit}</span>
      </div>
      <div
        className={`mt-1 font-mono text-[10px] uppercase tracking-[0.10em] ${
          tone === "warn" ? "text-destructive" : "text-primary"
        }`}
      >
        {note}
      </div>
    </div>
  );
}

function MoneyRow({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-baseline justify-between px-6 py-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={`font-mono text-sm font-semibold tabular-nums ${
          tone === "good" ? "text-primary" : tone === "warn" ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function RiskCard({
  icon: Icon,
  label,
  value,
  note,
  href,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
  href: string;
  tone: "good" | "warn";
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${
            tone === "warn"
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {label}
          </div>
          <div
            className={`mt-0.5 font-display text-xl font-semibold tabular-nums ${
              tone === "warn" ? "text-destructive" : "text-foreground"
            }`}
          >
            {value}
          </div>
          <div className="mt-1 text-xs text-muted-foreground group-hover:text-foreground">
            {note}
          </div>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
    </Link>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-4 py-2 text-sm transition-colors hover:bg-secondary"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
