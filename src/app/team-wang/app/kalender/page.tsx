import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  Clock3,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  TentTree,
} from "lucide-react";

import { hentWangBrukerkontekst } from "@/lib/wang-supabase/auth";
import {
  erWangKalenderRolle,
  hentWangKalender,
  velgWangKalenderfeed,
} from "@/lib/wang-supabase/calendar";
import type { WangCalendarEvent, WangEventKind } from "@/lib/wang-supabase/types";

import appStyles from "../app.module.css";
import styles from "./kalender.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kalender og samlinger — WANG Toppidrett",
  description: "Rolleavgrenset kalender for WANG Toppidrett.",
  robots: { index: false, follow: false },
};

const VIEW_FILTERS = {
  alle: { label: "Alle", kinds: null },
  trening: {
    label: "Trening",
    kinds: ["training", "self_training", "club_training"] satisfies WangEventKind[],
  },
  konkurranser: {
    label: "Konkurranser",
    kinds: ["competition"] satisfies WangEventKind[],
  },
  samlinger: { label: "Samlinger", kinds: ["camp"] satisfies WangEventKind[] },
} as const;

type ViewFilter = keyof typeof VIEW_FILTERS;

const EVENT_LABELS: Record<WangEventKind, string> = {
  school_lesson: "Skole",
  assessment: "Prøve / innlevering",
  training: "WANG-trening",
  competition: "Konkurranse",
  camp: "Samling",
  self_training: "Egentrening",
  club_training: "Klubbtrening",
};

function parseView(value: string | string[] | undefined): ViewFilter {
  return typeof value === "string" && value in VIEW_FILTERS ? (value as ViewFilter) : "alle";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Oslo",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  }).format(new Date(value));
}

function formatAccessExpiry(value: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  }).format(new Date(value));
}

function filterEvents(events: WangCalendarEvent[], view: ViewFilter) {
  const kinds = VIEW_FILTERS[view].kinds;
  return kinds ? events.filter((event) => kinds.includes(event.kind as never)) : events;
}

export default async function WangKalenderPage({
  searchParams,
}: {
  searchParams: Promise<{
    kalender?: string | string[];
    visning?: string | string[];
  }>;
}) {
  const context = await hentWangBrukerkontekst();
  if (context.status === "logged_out") {
    redirect("/team-wang/app/logg-inn?next=/team-wang/app/kalender");
  }

  if (context.status !== "ready" || !erWangKalenderRolle(context.profile.role)) {
    return (
      <main className={appStyles.accessState}>
        <section className={appStyles.accessCard} aria-labelledby="wang-calendar-access-title">
          <span className={appStyles.accessIcon}><LockKeyhole size={28} aria-hidden /></span>
          <span className={appStyles.eyebrow}>Tilgang avvist</span>
          <h1 id="wang-calendar-access-title">Kalenderen er ikke delt med denne rollen</h1>
          <p>Ingen elev-, gruppe- eller kalenderdata er vist.</p>
          <div className={appStyles.accessActions}>
            <Link href="/team-wang/app">Til WANG-oversikten</Link>
          </div>
        </section>
      </main>
    );
  }

  const data = await hentWangKalender(context.profile);
  const params = await searchParams;
  const requestedFeedId = typeof params.kalender === "string" ? params.kalender : undefined;
  const view = parseView(params.visning);
  const activeFeed = velgWangKalenderfeed(data, requestedFeedId);
  const events = activeFeed ? filterEvents(activeFeed.events, view) : [];
  const camps = activeFeed?.events.filter((event) => event.kind === "camp") ?? [];
  const isShared = activeFeed?.accessKind === "shared";
  const isLeadership = activeFeed?.accessKind === "leadership";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/team-wang/app" className={styles.backLink}>
          <ArrowLeft size={18} aria-hidden /> Til WANG-oversikten
        </Link>
        <div className={styles.headingRow}>
          <span className={styles.headingIcon}><CalendarDays size={26} aria-hidden /></span>
          <div>
            <span className={styles.eyebrow}>WANG Toppidrett Fredrikstad</span>
            <h1>Kalender og samlinger</h1>
          </div>
          <span className={styles.secureBadge}>
            <ShieldCheck size={16} aria-hidden /> Rolleavgrenset
          </span>
        </div>
        <p className={styles.intro}>
          {isLeadership
            ? "Skoleledelsen ser skole- og WANG-hendelser for aktive idretter ved egen skole. Elevens helse- og kontaktdata er ikke med."
            : "Skole- og WANG-hendelser er låst for eleven. Egen- og klubbtrening kan bare endres av eleven som opprettet dem."}
        </p>
      </header>

      {data.feeds.length === 0 ? (
        <section className={styles.emptyState} aria-labelledby="wang-calendar-empty-title">
          <CircleAlert size={28} aria-hidden />
          <h2 id="wang-calendar-empty-title">Ingen aktiv kalender</h2>
          <p>Rollen er gyldig, men ingen kalender er tildelt eller delt med kontoen.</p>
        </section>
      ) : (
        <>
          <section className={styles.scopeCard} aria-label="Aktiv kalender">
            <div>
              <span className={styles.eyebrow}>
                {isShared ? "Delt kalender" : isLeadership ? "Skolekalender" : "Aktiv kalender"}
              </span>
              <strong>{activeFeed?.label}</strong>
              <small>{activeFeed?.detail}</small>
            </div>
            <p>
              {activeFeed?.accessExpiresAt
                ? `Tilgang til ${formatAccessExpiry(activeFeed.accessExpiresAt)}`
                : activeFeed?.accessKind === "staff"
                  ? "Tilgang via aktiv sportstildeling"
                  : isLeadership
                    ? "Lesetilgang via skoleledelse"
                  : "Elevens egen kalender"}
            </p>
          </section>

          {data.feeds.length > 1 ? (
            <nav className={styles.feedTabs} aria-label="Velg kalender">
              {data.feeds.map((feed) => (
                <Link
                  key={feed.id}
                  href={`/team-wang/app/kalender?kalender=${feed.id}&visning=${view}`}
                  aria-current={feed.id === activeFeed?.id ? "page" : undefined}
                  className={feed.id === activeFeed?.id ? styles.feedTabActive : styles.feedTab}
                >
                  {feed.label}
                </Link>
              ))}
            </nav>
          ) : null}

          <nav className={styles.viewTabs} aria-label="Filtrer kalenderen">
            {(Object.keys(VIEW_FILTERS) as ViewFilter[]).map((filter) => (
              <Link
                key={filter}
                href={`/team-wang/app/kalender?kalender=${activeFeed?.id ?? ""}&visning=${filter}`}
                aria-current={filter === view ? "page" : undefined}
                className={filter === view ? styles.viewTabActive : styles.viewTab}
              >
                {VIEW_FILTERS[filter].label}
              </Link>
            ))}
          </nav>

          <div className={styles.contentGrid}>
            <section className={styles.agenda} aria-labelledby="wang-agenda-heading">
              <div className={styles.sectionHeading}>
                <div>
                  <span className={styles.eyebrow}>{VIEW_FILTERS[view].label}</span>
                  <h2 id="wang-agenda-heading">Planlagte hendelser</h2>
                </div>
                <p>{events.length} registrert</p>
              </div>

              {events.length > 0 ? (
                <div className={styles.eventList}>
                  {events.map((event) => (
                    <article key={event.id} className={styles.eventCard}>
                      <div className={styles.eventDate}>
                        <span>{formatDate(event.startsAt)}</span>
                        <strong>{formatTime(event.startsAt)}–{formatTime(event.endsAt)}</strong>
                      </div>
                      <div className={styles.eventBody}>
                        <div className={styles.eventMeta}>
                          <span>{EVENT_LABELS[event.kind]}</span>
                          {event.lockedForStudent ? (
                            <span className={styles.lockBadge}><LockKeyhole size={13} aria-hidden /> Låst</span>
                          ) : null}
                          {activeFeed?.accessKind === "staff" || isLeadership ? (
                            <span className={styles.statusBadge}>{event.status}</span>
                          ) : null}
                        </div>
                        <h3>{event.title}</h3>
                        <p><MapPin size={15} aria-hidden /> {event.place ?? "Sted ikke satt"}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>Ingen hendelser i denne visningen.</p>
              )}
            </section>

            <aside className={styles.campsPanel} aria-labelledby="wang-camps-heading">
              <div className={styles.campsIcon}><TentTree size={22} aria-hidden /></div>
              <span className={styles.eyebrow}>Samlinger</span>
              <h2 id="wang-camps-heading">Kommende samlinger</h2>
              {camps.length > 0 ? camps.map((camp) => (
                <article key={camp.id} className={styles.campCard}>
                  <strong>{camp.title}</strong>
                  <span><Clock3 size={14} aria-hidden /> {formatDate(camp.startsAt)}</span>
                  <span><MapPin size={14} aria-hidden /> {camp.place ?? "Sted ikke satt"}</span>
                </article>
              )) : (
                <p className={styles.emptyText}>Ingen samlinger er publisert i kalenderen.</p>
              )}
              {isShared || isLeadership ? (
                <p className={styles.privacyNote}>
                  Søvn, dagsform og helseopplysninger deles ikke i denne visningen.
                </p>
              ) : null}
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
