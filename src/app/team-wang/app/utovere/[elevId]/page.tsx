import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CircleAlert,
  Database,
  LockKeyhole,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react";

import { hentWangBrukerkontekst } from "@/lib/wang-supabase/auth";
import {
  erWangKalenderRolle,
  hentWangUtoverprofilMedPlan,
} from "@/lib/wang-supabase/calendar";
import {
  erWangUtoveroversiktRolle,
} from "@/lib/wang-supabase/data";
import type { WangCalendarEvent, WangEventKind } from "@/lib/wang-supabase/types";

import appStyles from "../../app.module.css";
import styles from "./profil.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Utøverprofil — WANG Toppidrett",
  description: "Rolleavgrenset grunnprofil for WANG Toppidrett.",
  robots: { index: false, follow: false },
};

interface WangUtoverprofilPageProps {
  params: Promise<{ elevId: string }>;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const EVENT_LABELS: Record<WangEventKind, string> = {
  school_lesson: "Skole",
  assessment: "Prøve / innlevering",
  training: "WANG-trening",
  competition: "Konkurranse",
  camp: "Samling",
  self_training: "Egentrening",
  club_training: "Klubbtrening",
};

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Oslo",
  }).format(new Date(value));
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  }).format(new Date(value));
}

function EventRow({ event }: { event: WangCalendarEvent }) {
  return (
    <li className={styles.eventRow}>
      <div>
        <span>{EVENT_LABELS[event.kind]}</span>
        <strong>{event.title}</strong>
      </div>
      <time dateTime={event.startsAt}>
        {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
      </time>
    </li>
  );
}

export default async function WangUtoverprofilPage({ params }: WangUtoverprofilPageProps) {
  const { elevId } = await params;
  const context = await hentWangBrukerkontekst();

  if (context.status === "logged_out") {
    const next = encodeURIComponent(`/team-wang/app/utovere/${elevId}`);
    redirect(`/team-wang/app/logg-inn?next=${next}`);
  }

  if (context.status !== "ready" || !erWangUtoveroversiktRolle(context.profile.role)) {
    return (
      <main className={appStyles.accessState}>
        <section className={appStyles.accessCard} aria-labelledby="wang-athlete-access-title">
          <span className={appStyles.accessIcon}><LockKeyhole size={28} aria-hidden /></span>
          <span className={appStyles.eyebrow}>Tilgang avvist</span>
          <h1 id="wang-athlete-access-title">Utøverprofilen er ikke tilgjengelig for denne rollen</h1>
          <p>Ingen elev-, gruppe-, helse- eller kontaktdata er vist.</p>
          <div className={appStyles.accessActions}>
            <Link href="/team-wang/app">Til WANG-oversikten</Link>
          </div>
        </section>
      </main>
    );
  }

  const profileData = await hentWangUtoverprofilMedPlan(context.profile, elevId);

  if (!profileData) {
    return (
      <main className={appStyles.accessState}>
        <section className={appStyles.accessCard} aria-labelledby="wang-athlete-missing-title">
          <span className={appStyles.accessIcon}><CircleAlert size={28} aria-hidden /></span>
          <span className={appStyles.eyebrow}>Ikke tilgjengelig</span>
          <h1 id="wang-athlete-missing-title">Utøveren finnes ikke i ditt omfang</h1>
          <p>Profilen finnes ikke, eller rollen din har ikke tilgang til gruppen.</p>
          <div className={appStyles.accessActions}>
            <Link href="/team-wang/app/utovere">Til utøverlisten</Link>
          </div>
        </section>
      </main>
    );
  }

  const { athlete, schedule } = profileData;
  const schoolEvents = schedule.weekEvents.filter(
    (event) => event.kind === "school_lesson" || event.kind === "assessment",
  );
  const canOpenCalendar = erWangKalenderRolle(context.profile.role);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/team-wang/app/utovere" className={styles.backLink}>
          <ArrowLeft size={18} aria-hidden /> Til utøverlisten
        </Link>
        <div className={styles.profileHeading}>
          <span className={styles.avatar} aria-hidden>{initials(athlete.name)}</span>
          <div>
            <span className={styles.eyebrow}>{athlete.isDemo ? "Fiktive demonstrasjonsdata" : "Utøverprofil"}</span>
            <h1>{athlete.name}</h1>
            <p>{athlete.grade} · {athlete.sport.name} · {athlete.group.name}</p>
          </div>
          <span className={styles.databaseBadge}><Database size={16} aria-hidden /> Databasekoblet</span>
        </div>
      </header>

      <section className={styles.factGrid} aria-label="Profilgrunnlag">
        <article>
          <UserRound size={20} aria-hidden />
          <span>Skole</span>
          <strong>{athlete.schoolName ?? "Skole ikke koblet"}</strong>
        </article>
        <article>
          <Trophy size={20} aria-hidden />
          <span>Idrett</span>
          <strong>{athlete.sport.name}</strong>
        </article>
        <article>
          <BookOpen size={20} aria-hidden />
          <span>Gruppe</span>
          <strong>{athlete.group.name}</strong>
        </article>
        <article>
          <CalendarDays size={20} aria-hidden />
          <span>Skoleår</span>
          <strong>{athlete.group.schoolYear}</strong>
        </article>
      </section>

      <aside className={styles.privacyNotice} aria-label="Personvern">
        <ShieldCheck size={20} aria-hidden />
        <div>
          <strong>Kun godkjent profilgrunnlag</strong>
          <span>Denne siden henter ikke søvn, dagsform, morgeninnsjekk, telefonnummer eller e-post.</span>
        </div>
      </aside>

      <section className={styles.moduleSection} aria-labelledby="wang-athlete-modules-title">
        <span className={styles.eyebrow}>Databasekoblet plan</span>
        <h2 id="wang-athlete-modules-title">Utøverens arbeidsflater</h2>
        <div className={styles.moduleGrid}>
          <article>
            <CalendarDays size={22} aria-hidden />
            <h3>Denne uken</h3>
            {schedule.weekEvents.length > 0 ? (
              <ul className={styles.eventList}>
                {schedule.weekEvents.map((event) => <EventRow key={event.id} event={event} />)}
              </ul>
            ) : (
              <p>Ingen kalenderhendelser er registrert denne uken.</p>
            )}
            {canOpenCalendar ? (
              <Link href={`/team-wang/app/kalender?kalender=${athlete.group.id}`}>
                Åpne gruppekalenderen
              </Link>
            ) : (
              <span>Full kalender ikke koblet for rollen</span>
            )}
          </article>
          <article>
            <Trophy size={22} aria-hidden />
            <h3>Konkurranser</h3>
            {schedule.upcomingCompetitions.length > 0 ? (
              <ul className={styles.eventList}>
                {schedule.upcomingCompetitions.map((event) => <EventRow key={event.id} event={event} />)}
              </ul>
            ) : (
              <p>Ingen kommende konkurranser er registrert i kalendergrunnlaget.</p>
            )}
            <span>Inntil tre kommende</span>
          </article>
          <article>
            <BookOpen size={22} aria-hidden />
            <h3>Skole</h3>
            {schoolEvents.length > 0 ? (
              <ul className={styles.eventList}>
                {schoolEvents.map((event) => <EventRow key={event.id} event={event} />)}
              </ul>
            ) : (
              <p>Ingen skoletimer, prøver eller innleveringer er registrert denne uken.</p>
            )}
            <span>Kun kalendergrunnlag</span>
          </article>
        </div>
      </section>
    </main>
  );
}
