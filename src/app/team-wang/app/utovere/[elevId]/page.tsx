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
  erWangUtoveroversiktRolle,
  hentWangUtoverprofil,
} from "@/lib/wang-supabase/data";

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

  const athlete = await hentWangUtoverprofil(context.profile, elevId);

  if (!athlete) {
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
        <span className={styles.eyebrow}>Neste datakobling</span>
        <h2 id="wang-athlete-modules-title">Utøverens arbeidsflater</h2>
        <div className={styles.moduleGrid}>
          <article>
            <CalendarDays size={22} aria-hidden />
            <h3>Denne uken</h3>
            <p>Kalender, skole og trening kobles i en senere godkjent arbeidsbolk. Ingen hendelser er funnet på.</p>
            <span>Ikke koblet ennå</span>
          </article>
          <article>
            <Trophy size={22} aria-hidden />
            <h3>Konkurranser</h3>
            <p>Kommende konkurranser vises først når en godkjent datakilde er koblet til profilen.</p>
            <span>Venter på datagrunnlag</span>
          </article>
          <article>
            <BookOpen size={22} aria-hidden />
            <h3>Skole</h3>
            <p>Timeplan, prøver og innleveringer vises ikke før skolekilden og tilgangene er godkjent.</p>
            <span>Venter på datagrunnlag</span>
          </article>
        </div>
      </section>
    </main>
  );
}
