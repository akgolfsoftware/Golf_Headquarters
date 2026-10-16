import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CalendarRange,
  CircleAlert,
  Clock3,
  Database,
  LockKeyhole,
} from "lucide-react";

import { hentWangBrukerkontekst } from "@/lib/wang-supabase/auth";
import {
  erWangWorkbenchRolle,
  hentWangWorkbencher,
  velgWangWorkbenchGruppe,
} from "@/lib/wang-supabase/data";
import type { WangPlanLevel } from "@/lib/wang-supabase/types";

import appStyles from "../app.module.css";
import styles from "./workbench.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workbench — WANG Toppidrett",
  description: "Rolleavgrenset Workbench for WANG Toppidrett.",
  robots: { index: false, follow: false },
};

const PLAN_LEVELS: Array<{ level: WangPlanLevel; label: string }> = [
  { level: "year", label: "Årsplan" },
  { level: "period", label: "Periodeplan" },
  { level: "month", label: "Månedsplan" },
  { level: "week", label: "Ukeplan" },
  { level: "session", label: "Øktplan" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Oslo",
  }).format(new Date(`${value}T12:00:00Z`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  }).format(new Date(value));
}

export default async function WangWorkbenchPage({
  searchParams,
}: {
  searchParams: Promise<{ gruppe?: string | string[] }>;
}) {
  const context = await hentWangBrukerkontekst();

  if (context.status === "logged_out") {
    redirect("/team-wang/app/logg-inn?next=/team-wang/app/workbench");
  }

  if (context.status !== "ready" || !erWangWorkbenchRolle(context.profile.role)) {
    return (
      <main className={appStyles.accessState}>
        <section className={appStyles.accessCard} aria-labelledby="wang-workbench-access-title">
          <span className={appStyles.accessIcon}><LockKeyhole size={28} aria-hidden /></span>
          <span className={appStyles.eyebrow}>Tilgang avvist</span>
          <h1 id="wang-workbench-access-title">Workbench er for sportssjef og trener</h1>
          <p>Ingen gruppe-, plan- eller elevdata er vist.</p>
          <div className={appStyles.accessActions}>
            <Link href="/team-wang/app">Til WANG-oversikten</Link>
          </div>
        </section>
      </main>
    );
  }

  const assignments = await hentWangWorkbencher(context.profile);
  const { gruppe } = await searchParams;
  const requestedGroupId = typeof gruppe === "string" ? gruppe : undefined;
  const activeGroup = velgWangWorkbenchGruppe(assignments, requestedGroupId);
  const activeAssignment = activeGroup
    ? assignments.find((assignment) =>
        assignment.groups.some((group) => group.id === activeGroup.id),
      ) ?? null
    : assignments[0] ?? null;
  const plans = activeAssignment?.plans.filter((plan) => plan.groupId === activeGroup?.id) ?? [];
  const events = activeAssignment?.events.filter((event) => event.groupId === activeGroup?.id) ?? [];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/team-wang/app" className={styles.backLink}>
          <ArrowLeft size={18} aria-hidden /> Til WANG-oversikten
        </Link>
        <div className={styles.headingRow}>
          <span className={styles.headingIcon}><CalendarRange size={26} aria-hidden /></span>
          <div>
            <span className={styles.eyebrow}>WANG Toppidrett Fredrikstad</span>
            <h1>Workbench</h1>
          </div>
          <span className={styles.databaseBadge}><Database size={16} aria-hidden /> Databasekoblet</span>
        </div>
        <p className={styles.intro}>
          Viser bare idretter og grupper som er tildelt {context.profile.displayName}. Faggrunnlag som ikke er godkjent, er tydelig merket.
        </p>
      </header>

      {assignments.length === 0 ? (
        <section className={styles.emptyState} aria-labelledby="wang-workbench-empty-title">
          <CircleAlert size={28} aria-hidden />
          <h2 id="wang-workbench-empty-title">Ingen aktiv Workbench-tildeling</h2>
          <p>Rollen er gyldig, men ingen aktiv idrett er koblet til kontoen.</p>
        </section>
      ) : (
        <>
          <section className={styles.assignmentBar} aria-label="Tildelt idrett og gruppe">
            <div>
              <span className={styles.eyebrow}>Tildelt idrett</span>
              <strong>{activeAssignment?.sportName}</strong>
              <small>{activeAssignment?.schoolYear} · {activeAssignment?.sportFamily ?? "Familie ikke satt"}</small>
            </div>
            <div className={styles.statuses}>
              <span>{activeAssignment?.workbenchEnabled ? "Workbench aktiv" : "Workbench ikke aktivert"}</span>
              <span>{activeAssignment?.mappingApproved ? "Mapping godkjent" : "Mapping ikke godkjent"}</span>
            </div>
          </section>

          <nav className={styles.groupTabs} aria-label="Velg gruppe">
            {assignments.flatMap((assignment) => assignment.groups).map((group) => (
              <Link
                key={group.id}
                href={`/team-wang/app/workbench?gruppe=${group.id}`}
                aria-current={group.id === activeGroup?.id ? "page" : undefined}
                className={group.id === activeGroup?.id ? styles.groupTabActive : styles.groupTab}
              >
                {group.name}
              </Link>
            ))}
          </nav>

          <section className={styles.planSection} aria-labelledby="wang-plan-heading">
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>{activeGroup?.name}</span>
                <h2 id="wang-plan-heading">Planstruktur</h2>
              </div>
              <p>År → periode → måned → uke → økt</p>
            </div>
            <div className={styles.planGrid}>
              {PLAN_LEVELS.map(({ level, label }) => {
                const levelPlans = plans.filter((plan) => plan.level === level);
                return (
                  <article key={level} className={styles.planCard}>
                    <div className={styles.planCardHeading}>
                      <span className={styles.planIcon}><CalendarDays size={18} aria-hidden /></span>
                      <div><span>{label}</span><strong>{levelPlans.length}</strong></div>
                    </div>
                    {levelPlans.length > 0 ? levelPlans.map((plan) => (
                      <div key={plan.id} className={styles.planItem}>
                        <strong>{plan.title}</strong>
                        <span>{formatDate(plan.startsOn)}–{formatDate(plan.endsOn)}</span>
                        <small>{plan.subjectBasisStatus}</small>
                      </div>
                    )) : <p className={styles.emptyText}>Ingen {label.toLowerCase()} registrert.</p>}
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.eventSection} aria-labelledby="wang-events-heading">
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>Kalender</span>
                <h2 id="wang-events-heading">Planlagte hendelser</h2>
              </div>
              <p>{events.length} registrert</p>
            </div>
            {events.length > 0 ? (
              <div className={styles.eventList}>
                {events.map((event) => (
                  <article key={event.id} className={styles.eventRow}>
                    <span className={styles.eventIcon}><Clock3 size={18} aria-hidden /></span>
                    <div>
                      <strong>{event.title}</strong>
                      <span>{formatDateTime(event.startsAt)}–{formatDateTime(event.endsAt)}</span>
                    </div>
                    <small>{event.place ?? "Sted ikke satt"}</small>
                  </article>
                ))}
              </div>
            ) : <p className={styles.emptyText}>Ingen hendelser registrert for gruppen.</p>}
          </section>
        </>
      )}
    </main>
  );
}
