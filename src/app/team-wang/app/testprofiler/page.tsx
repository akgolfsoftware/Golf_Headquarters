import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Eye, LockKeyhole, ShieldAlert, UserCog } from "lucide-react";

import { hentWangBrukerkontekst } from "@/lib/wang-supabase/auth";
import { WANG_ROLE_DEFINITIONS } from "@/lib/wang-supabase/roles";
import {
  kanAdministrereWangTestprofiler,
  WANG_SYNTHETIC_PROFILES,
} from "@/lib/wang-supabase/synthetic-profiles";

import appStyles from "../app.module.css";
import styles from "./testprofiler.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Testprofiler — WANG Toppidrett",
  description: "Sikker administrasjon av fiktive WANG-rolleprofiler.",
  robots: { index: false, follow: false },
};

export default async function WangTestprofilerPage() {
  const context = await hentWangBrukerkontekst();

  if (context.status === "logged_out") {
    redirect("/team-wang/app/logg-inn?next=/team-wang/app/testprofiler");
  }

  if (
    context.status !== "ready" ||
    !kanAdministrereWangTestprofiler(context.profile.role)
  ) {
    return (
      <main className={appStyles.accessState}>
        <section className={appStyles.accessCard} aria-labelledby="wang-test-access-title">
          <span className={appStyles.accessIcon}><ShieldAlert size={28} aria-hidden /></span>
          <span className={appStyles.eyebrow}>Tilgang avvist</span>
          <h1 id="wang-test-access-title">Bare sentral admin kan åpne testprofiler</h1>
          <p>Ingen profiler eller rolledata er vist. Gå tilbake til din egen WANG-oversikt.</p>
          <div className={appStyles.accessActions}>
            <Link href="/team-wang/app">Til WANG-oversikten</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/team-wang/app" className={styles.backLink}>
          <ArrowLeft size={18} aria-hidden /> Til WANG-oversikten
        </Link>
        <div className={styles.headingRow}>
          <span className={styles.headingIcon}><UserCog size={26} aria-hidden /></span>
          <div>
            <span className={styles.eyebrow}>Sentral administrasjon</span>
            <h1>Sikre testprofiler</h1>
          </div>
        </div>
        <p className={styles.intro}>
          Prøv alle rollevisninger med faste, fiktive profiler. Dette oppretter ingen konto,
          sender ingen e-post og gir ingen tilgang til ekte data.
        </p>
        <div className={styles.securityNote} role="note">
          <LockKeyhole size={20} aria-hidden />
          <p>Testprofilene ligger bare i kode og kan ikke brukes til innlogging.</p>
        </div>
      </header>

      <section className={styles.grid} aria-label="Fiktive WANG-testprofiler">
        {WANG_SYNTHETIC_PROFILES.map((profile) => {
          const role = WANG_ROLE_DEFINITIONS[profile.role];
          return (
            <article key={profile.id} className={styles.card}>
              <div className={styles.cardHeading}>
                <div>
                  <span>{role.label}</span>
                  <h2>{profile.displayName}</h2>
                </div>
                <span className={styles.syntheticBadge}>Fiktiv</span>
              </div>
              <dl className={styles.scopeList}>
                <div><dt>Skole</dt><dd>{profile.schoolName ?? "WANG sentralt"}</dd></div>
                <div><dt>Idrett</dt><dd>{profile.sportName ?? "Ikke avgrenset"}</dd></div>
                <div><dt>Omfang</dt><dd>{profile.accessScope}</dd></div>
                <div><dt>Søvn og dagsform</dt><dd>{profile.wellbeingAccess}</dd></div>
                {profile.expiresOn ? <div><dt>Testperiode til</dt><dd>31. juli 2027</dd></div> : null}
              </dl>
              <Link
                href={`/team-wang/demo/roller?rolle=${profile.role}`}
                className={styles.previewLink}
              >
                <Eye size={18} aria-hidden /> Se rollevisning
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
