/**
 * Integrasjoner — /portal/meg/innstillinger/integrasjoner
 *
 * Mobil-først (430px) redesign mot athletic-designsystemet. Erstatter den
 * tidligere `meg.css`-baserte implementasjonen — kun DS-token-klasser nå.
 *
 * Koble PlayerHQ til eksterne datakilder slik at runder, shot-data, søvn og
 * puls samles ett sted. Kun TrackMan og Google Calendar har ekte backing i
 * databasen; resten vises som «tilgjengelig» til de faktisk kobles til.
 * Ingen oppdiktede sync-tidspunkter eller datapunkt-tall.
 */

import Link from "next/link";
import {
  ChevronLeft,
  RefreshCw,
  HelpCircle,
  Link2,
  Plug,
  ArrowRight,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatSync(d: Date | null | undefined): string {
  if (!d) return "Ikke synket enda";
  return `${d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} · ${d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`;
}

export default async function IntegrasjonerPage() {
  const user = await requirePortalUser();

  const [tmCount, tmLast, gcal] = await Promise.all([
    prisma.trackManSession.count({ where: { userId: user.id } }).catch(() => 0),
    prisma.trackManSession
      .findFirst({
        where: { userId: user.id },
        orderBy: { recordedAt: "desc" },
        select: { recordedAt: true, shotCount: true, source: true },
      })
      .catch(() => null),
    prisma.googleCalendarConnection
      .findUnique({ where: { userId: user.id } })
      .catch(() => null),
  ]);

  const tmConnected = tmCount > 0;
  const gcalConnected = !!gcal;

  // Kun ekte tilkoblinger telles. Ingen «alltid-på demo».
  const connectedCount = (tmConnected ? 1 : 0) + (gcalConnected ? 1 : 0);

  const tilkoblet: IntegrationCardProps[] = [];
  const tilgjengelig: IntegrationCardProps[] = [];

  // ── TrackMan ──────────────────────────────────────────────────
  if (tmConnected) {
    tilkoblet.push({
      status: "on",
      name: "TrackMan Performance Studio",
      category: "Shot-data · Range-økter",
      description:
        "Klubb-data, ballhastighet, launch og spin per slag fra studio-økter ved AK Golf-anlegget.",
      data: [
        { k: "Sist synket", v: formatSync(tmLast?.recordedAt) },
        {
          k: "Siste økt",
          v: tmLast ? `${tmLast.shotCount} slag · ${tmLast.source ?? "TrackMan"}` : "—",
        },
      ],
      logo: <TrackManLogo />,
    });
  } else {
    tilgjengelig.push({
      status: "off",
      name: "TrackMan Connect",
      category: "Range-økter · Shot-data",
      description:
        "Klubb-data, ballhastighet, launch og spin per slag. Kobles automatisk fra studio-økter ved AK Golf-anlegget.",
      logo: <TrackManLogo />,
    });
  }

  // ── Google Calendar ───────────────────────────────────────────
  if (gcalConnected) {
    tilkoblet.push({
      status: "on",
      name: "Google Calendar",
      category: "Kalender-synk",
      description:
        "Planlagte og fullførte økter skyves til Google Calendar. Synkroniseringen går én vei (PlayerHQ → kalender).",
      data: [
        { k: "Sist synket", v: formatSync(gcal?.lastSyncAt) },
        { k: "Status", v: gcal?.status === "ACTIVE" ? "Aktiv" : (gcal?.status ?? "—") },
      ],
      logo: <CalendarLogo />,
    });
  } else {
    tilgjengelig.push({
      status: "off",
      name: "Google Calendar",
      category: "Kalender-synk",
      description:
        "Skyv planlagte og fullførte økter til din personlige kalender. Synkroniseringen går én vei (PlayerHQ → kalender).",
      logo: <CalendarLogo />,
    });
  }

  // ── Tilgjengelig (uten backing — alltid «koble til») ──────────
  tilgjengelig.push(
    {
      status: "off",
      name: "GolfBox",
      category: "Handicap · Runder",
      description:
        "Handicap, registrerte runder og klubb-medlemskap fra norske golfklubber synkes automatisk.",
      logo: <GolfBoxLogo />,
    },
    {
      status: "off",
      name: "Apple Health",
      category: "Søvn · Puls · HRV",
      description:
        "Søvnkvalitet, hvilepuls og HRV fra iPhone og Apple Watch — brukes til form- og restitusjons-trender.",
      logo: <AppleHealthLogo />,
    },
    {
      status: "off",
      name: "Strava",
      category: "Kondisjon · Løping · Sykling",
      description:
        "Kondisjons-økter (løping, sykling, tur) logges som FYS-økter i pyramiden din.",
      logo: <StravaLogo />,
    },
    {
      status: "off",
      name: "Garmin Connect",
      category: "Steg · Treningsintensitet",
      description:
        "Daglige steg, hvilepuls, body-battery og treningsbelastning fra Garmin-klokken.",
      logo: <GarminLogo />,
    },
    {
      status: "off",
      name: "Spotify",
      category: "Treningsplaylister",
      description:
        "Knytt egne playlister til økt-typer. Starter automatisk når du trykker «Start økt».",
      proBadge: true,
      logo: <SpotifyLogo />,
    },
  );

  const totalCount = tilkoblet.length + tilgjengelig.length;

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-20 sm:px-6">
      {/* Tilbake */}
      <Link
        href="/portal/meg/innstillinger"
        className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
        Innstillinger
      </Link>

      {/* Header */}
      <header className="mt-3 space-y-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Meg · Innstillinger · Integrasjoner
        </span>
        <h1 className="font-display text-[28px] font-bold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[34px]">
          Koble til der{" "}
          <em
            className="not-italic"
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontStyle: "italic",
              color: "hsl(var(--primary))",
            }}
          >
            data finnes
          </em>
        </h1>
        <p className="text-sm text-muted-foreground">
          Samle handicap, runder, shot-data, søvn og puls ett sted — uten manuell
          jobb.
        </p>
      </header>

      {/* Status-strip */}
      <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card">
        <SummaryCell
          label="Tilkoblet"
          value={String(connectedCount)}
          unit={`/ ${totalCount}`}
          sub="aktive kilder"
        />
        <SummaryCell
          label="Sist synket"
          value={
            tmLast
              ? tmLast.recordedAt.toLocaleTimeString("nb-NO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"
          }
          sub={
            tmLast
              ? tmLast.recordedAt.toLocaleDateString("nb-NO", {
                  day: "2-digit",
                  month: "2-digit",
                })
              : "ingen synk enda"
          }
        />
      </div>

      {/* Tilkoblet */}
      {tilkoblet.length > 0 ? (
        <>
          <SectionHead title="Tilkoblet" count={`${tilkoblet.length} aktive`} />
          <div className="flex flex-col gap-3">
            {tilkoblet.map((card) => (
              <IntegrationCard key={card.name} {...card} />
            ))}
          </div>
        </>
      ) : (
        <>
          <SectionHead title="Tilkoblet" count="ingen enda" />
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
              <Plug className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="font-display text-base font-bold text-foreground">
              Ingen kilder tilkoblet
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Koble til en tjeneste nedenfor så samles dataene dine her automatisk.
            </p>
          </div>
        </>
      )}

      {/* Tilgjengelig */}
      <SectionHead
        title="Tilgjengelig"
        count={`${tilgjengelig.length} ikke tilkoblet`}
      />
      <div className="flex flex-col gap-3">
        {tilgjengelig.map((card) => (
          <IntegrationCard key={card.name} {...card} />
        ))}
      </div>

      {/* Hjelp */}
      <div className="mt-8 flex items-start gap-3.5 rounded-2xl border border-border bg-secondary/40 p-5">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
          <HelpCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="flex-1">
          <p className="font-display text-[15px] font-bold leading-tight text-foreground">
            Får du ikke koblet til?
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Vi har en kort guide for hver tjeneste — eller send oss et spørsmål, vi
            svarer innen 4 timer på hverdager.
          </p>
          <Link
            href="/portal/meg/help/kontakt"
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary"
          >
            Kontakt support
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Subkomponenter
// ============================================================

function SummaryCell({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-r border-border px-4 py-4 last:border-r-0 [&:nth-child(2)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0">
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-2xl font-extrabold leading-none tracking-[-0.02em] tabular-nums text-foreground">
        {value}
        {unit ? (
          <span className="ml-1 text-xs font-bold text-muted-foreground">{unit}</span>
        ) : null}
      </span>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
        {sub}
      </span>
    </div>
  );
}

function SectionHead({ title, count }: { title: string; count: string }) {
  return (
    <div className="mb-3 mt-8 flex items-baseline gap-2.5">
      <h2 className="font-display text-base font-bold tracking-[-0.015em] text-foreground">
        {title}
      </h2>
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

interface IntegrationCardProps {
  status: "on" | "off";
  name: string;
  category: string;
  description: string;
  data?: { k: string; v: string }[];
  logo: React.ReactNode;
  proBadge?: boolean;
}

function IntegrationCard(props: IntegrationCardProps) {
  const on = props.status === "on";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4">
      {props.proBadge ? (
        <span className="absolute right-4 top-4 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-accent-foreground">
          PRO
        </span>
      ) : null}

      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border [&_svg]:h-11 [&_svg]:w-11">
          {props.logo}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[15px] font-bold leading-tight tracking-[-0.012em] text-foreground">
            {props.name}
          </div>
          <div className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            {props.category}
          </div>
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
        {props.description}
      </p>

      {props.data ? (
        <dl className="mt-3 flex flex-col gap-1.5 rounded-xl bg-secondary/50 p-3">
          {props.data.map((d) => (
            <div key={d.k} className="flex items-center justify-between gap-2">
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
                {d.k}
              </dt>
              <dd className="truncate font-mono text-[11px] font-semibold tabular-nums text-foreground">
                {d.v}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-3.5 flex items-center gap-2">
        {on ? (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/[0.08] px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Tilkoblet
            </span>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Administrasjon i appen kommer snart"
              className="ml-auto inline-flex h-9 cursor-not-allowed items-center rounded-[10px] border border-border bg-card px-3.5 font-mono text-[11px] font-extrabold uppercase tracking-[0.04em] text-muted-foreground opacity-50"
            >
              Administrer · Kommer
            </button>
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label="Synk på nytt — kommer snart"
              title="Manuell synk kommer snart"
              className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-[10px] border border-border bg-card text-muted-foreground opacity-50"
            >
              <RefreshCw className="h-[15px] w-[15px]" strokeWidth={1.75} aria-hidden />
            </button>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" aria-hidden />
              Ikke tilkoblet
            </span>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Tilkobling kommer snart"
              className="ml-auto inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-[10px] bg-primary px-4 font-mono text-[11px] font-extrabold uppercase tracking-[0.04em] text-accent opacity-50"
            >
              <Link2 className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
              Koble til · Kommer
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Brand-logoer (SVG — merkevare-farger er bevisst hardkodet her,
// logoene er ikke del av designsystemet).
// ============================================================

function GolfBoxLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#0B5F30" />
      <path
        d="M12 6.5a5.5 5.5 0 1 0 5.5 5.5h-4.5"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function TrackManLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A0A0A" />
      <circle cx="9" cy="12" r="2.5" fill="#FF6B00" />
      <path
        d="M9 12 L18 8 M9 12 L18 12 M9 12 L18 16"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AppleHealthLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#FBFAF8" />
      <path
        d="M12 17.5s-5.5-3.4-5.5-7.5a3 3 0 0 1 5.5-1.7A3 3 0 0 1 17.5 10c0 4.1-5.5 7.5-5.5 7.5z"
        fill="#FB2F4D"
      />
    </svg>
  );
}

function CalendarLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" fill="#fff" stroke="#0A1F17" strokeWidth="1.6" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="#0A1F17" strokeWidth="1.4" />
      <line x1="8" y1="3" x2="8" y2="7" stroke="#0A1F17" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="16" y1="3" x2="16" y2="7" stroke="#0A1F17" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="6" y="13" width="4" height="3" rx="0.5" fill="#FB2F4D" />
      <rect x="14" y="13" width="4" height="3" rx="0.5" fill="#005840" />
    </svg>
  );
}

function StravaLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#FC4C02" />
      <path d="M9 17 L13.5 9 L17 15 L14.5 15 L13.5 13 L11.5 17 Z" fill="#fff" />
    </svg>
  );
}

function GarminLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#000" />
      <path d="M12 6 L17 17 L7 17 Z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 11 L14 15 L10 15 Z" fill="#007CC3" />
    </svg>
  );
}

function SpotifyLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#1DB954" />
      <path d="M7 10c3-1 7-1 10 1" stroke="#000" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M8 13c2.5-.8 5.5-.8 8 .8" stroke="#000" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M9 15.6c2-.5 4-.4 5.8.6" stroke="#000" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
