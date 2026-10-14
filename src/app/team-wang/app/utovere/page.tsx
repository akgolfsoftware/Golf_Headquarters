import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CircleAlert,
  Database,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import { hentWangBrukerkontekst } from "@/lib/wang-supabase/auth";
import {
  erWangUtoveroversiktRolle,
  hentWangUtoveroversikt,
} from "@/lib/wang-supabase/data";
import { hentWangRolledefinisjon } from "@/lib/wang-supabase/roles";

import appStyles from "../app.module.css";
import styles from "./utovere.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Utøvere — WANG Toppidrett",
  description: "Rolleavgrenset utøveroversikt for WANG Toppidrett.",
  robots: { index: false, follow: false },
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function WangUtoverePage() {
  const context = await hentWangBrukerkontekst();

  if (context.status === "logged_out") {
    redirect("/team-wang/app/logg-inn?next=/team-wang/app/utovere");
  }

  if (context.status !== "ready" || !erWangUtoveroversiktRolle(context.profile.role)) {
    return (
      <main className={appStyles.accessState}>
        <section className={appStyles.accessCard} aria-labelledby="wang-athletes-access-title">
          <span className={appStyles.accessIcon}><LockKeyhole size={28} aria-hidden /></span>
          <span className={appStyles.eyebrow}>Tilgang avvist</span>
          <h1 id="wang-athletes-access-title">Utøverlisten er ikke tilgjengelig for denne rollen</h1>
          <p>Ingen elev-, gruppe-, helse- eller kontaktdata er vist.</p>
          <div className={appStyles.accessActions}>
            <Link href="/team-wang/app">Til WANG-oversikten</Link>
          </div>
        </section>
      </main>
    );
  }

  const overview = await hentWangUtoveroversikt(context.profile);
  const role = hentWangRolledefinisjon(context.profile.role);
  const groups = overview.sports.flatMap((sport) => sport.groups);
  const athleteCount = groups.reduce((sum, group) => sum + group.athletes.length, 0);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/team-wang/app" className={styles.backLink}>
          <ArrowLeft size={18} aria-hidden /> Til WANG-oversikten
        </Link>
        <div className={styles.headingRow}>
          <span className={styles.headingIcon}><UsersRound size={26} aria-hidden /></span>
          <div>
            <span className={styles.eyebrow}>{context.profile.schoolName ?? "WANG Toppidrett"}</span>
            <h1>Utøvere</h1>
          </div>
          <span className={styles.databaseBadge}><Database size={16} aria-hidden /> Databasekoblet</span>
        </div>
        <p className={styles.intro}>
          {role.label} ser bare elever ved egen skole eller i tildelt idrett. Listen viser ikke søvn, dagsform eller kontaktopplysninger.
        </p>
      </header>

      <section className={styles.summaryGrid} aria-label="Omfang for utøveroversikten">
        <article>
          <span><GraduationCap size={18} aria-hidden /> Aktive idretter</span>
          <strong>{overview.sports.length}</strong>
          <small>Innenfor din rolle</small>
        </article>
        <article>
          <span><UsersRound size={18} aria-hidden /> Grupper</span>
          <strong>{groups.length}</strong>
          <small>Aktivt skoleår</small>
        </article>
        <article>
          <span><UserRound size={18} aria-hidden /> Utøvere</span>
          <strong>{athleteCount}</strong>
          <small>Navn og trinn</small>
        </article>
      </section>

      <aside className={styles.privacyNotice} aria-label="Personvern">
        <ShieldCheck size={20} aria-hidden />
        <div>
          <strong>Minste nødvendige innsyn</strong>
          <span>Helse, morgeninnsjekk, foresatte og klubbkontakter åpnes ikke fra denne listen.</span>
        </div>
      </aside>

      {overview.sports.length === 0 ? (
        <section className={styles.emptyState} aria-labelledby="wang-athletes-empty-title">
          <CircleAlert size={28} aria-hidden />
          <h2 id="wang-athletes-empty-title">Ingen aktive utøvere i omfanget</h2>
          <p>Rollen er gyldig, men ingen aktiv idrett og gruppe er koblet til kontoen.</p>
        </section>
      ) : (
        <div className={styles.sportList}>
          {overview.sports.map((sport) => {
            const sportAthletes = sport.groups.reduce(
              (sum, group) => sum + group.athletes.length,
              0,
            );

            return (
              <section key={sport.schoolSportId} className={styles.sportCard} aria-labelledby={`sport-${sport.schoolSportId}`}>
                <div className={styles.sportHeading}>
                  <div>
                    <span className={styles.eyebrow}>{sport.schoolYear}</span>
                    <h2 id={`sport-${sport.schoolSportId}`}>{sport.sportName}</h2>
                  </div>
                  <span>{sportAthletes} {sportAthletes === 1 ? "utøver" : "utøvere"}</span>
                </div>

                {sport.groups.length === 0 ? (
                  <p className={styles.emptyText}>Ingen aktiv gruppe er registrert.</p>
                ) : (
                  <div className={styles.groupGrid}>
                    {sport.groups.map((group) => (
                      <article key={group.id} className={styles.groupCard}>
                        <div className={styles.groupHeading}>
                          <div>
                            <span>{group.grade ?? "Trinn ikke satt"}</span>
                            <h3>{group.name}</h3>
                          </div>
                          <strong>{group.athletes.length}</strong>
                        </div>
                        {group.athletes.length === 0 ? (
                          <p className={styles.emptyText}>Ingen utøvere registrert.</p>
                        ) : (
                          <ul className={styles.athleteList}>
                            {group.athletes.map((athlete) => (
                              <li key={athlete.id}>
                                <Link
                                  href={`/team-wang/app/utovere/${athlete.id}`}
                                  className={styles.athleteLink}
                                  aria-label={`Åpne profil for ${athlete.name}`}
                                >
                                  <span className={styles.avatar} aria-hidden>{initials(athlete.name)}</span>
                                  <div>
                                    <strong>{athlete.name}</strong>
                                    <span>{athlete.grade}</span>
                                  </div>
                                  {athlete.isDemo ? <small>Fiktive data</small> : null}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
