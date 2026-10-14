import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CircleAlert,
  Database,
  LockKeyhole,
  MailX,
  MessageSquareText,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import { hentWangBrukerkontekst } from "@/lib/wang-supabase/auth";
import {
  erWangMeldingsrolle,
  hentWangMeldingsinnboks,
} from "@/lib/wang-supabase/messages";
import { hentWangRolledefinisjon } from "@/lib/wang-supabase/roles";

import appStyles from "../app.module.css";
import styles from "./meldinger.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meldinger — WANG Toppidrett",
  description: "Rolleavgrenset meldingsoversikt for WANG Toppidrett.",
  robots: { index: false, follow: false },
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  }).format(new Date(value));
}

export default async function WangMeldingerPage() {
  const context = await hentWangBrukerkontekst();

  if (context.status === "logged_out") {
    redirect("/team-wang/app/logg-inn?next=/team-wang/app/meldinger");
  }

  if (context.status !== "ready" || !erWangMeldingsrolle(context.profile.role)) {
    return (
      <main className={appStyles.accessState}>
        <section className={appStyles.accessCard} aria-labelledby="wang-messages-access-title">
          <span className={appStyles.accessIcon}><LockKeyhole size={28} aria-hidden /></span>
          <span className={appStyles.eyebrow}>Tilgang avvist</span>
          <h1 id="wang-messages-access-title">Navngitte samtaler er ikke tilgjengelige for denne rollen</h1>
          <p>Sentral oversikt og generell lesetilgang åpner ikke elevsamtaler automatisk.</p>
          <div className={appStyles.accessActions}>
            <Link href="/team-wang/app">Til WANG-oversikten</Link>
          </div>
        </section>
      </main>
    );
  }

  const inbox = await hentWangMeldingsinnboks(context.profile);
  const role = hentWangRolledefinisjon(context.profile.role);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/team-wang/app" className={styles.backLink}>
          <ArrowLeft size={18} aria-hidden /> Til WANG-oversikten
        </Link>
        <div className={styles.headingRow}>
          <span className={styles.headingIcon}><MessageSquareText size={26} aria-hidden /></span>
          <div>
            <span className={styles.eyebrow}>{context.profile.schoolName ?? "WANG Toppidrett"}</span>
            <h1>Meldinger</h1>
          </div>
          <span className={styles.databaseBadge}><Database size={16} aria-hidden /> Databasekoblet</span>
        </div>
        <p className={styles.intro}>
          {role.label} ser bare samtaler der kontoen er aktiv deltaker og fortsatt har gyldig tilgang til eleven.
        </p>
      </header>

      <section className={styles.statusGrid} aria-label="Status for meldingsmodulen">
        <article>
          <ShieldCheck size={20} aria-hidden />
          <div>
            <strong>Skrivebeskyttet grunnstruktur</strong>
            <span>Ingen kan opprette, svare eller endre samtaler ennå.</span>
          </div>
        </article>
        <article>
          <MailX size={20} aria-hidden />
          <div>
            <strong>E-post ikke aktivert</strong>
            <span>Ingen varsler eller meldinger sendes ut fra denne siden.</span>
          </div>
        </article>
      </section>

      <aside className={styles.policyNotice} aria-label="Regler for meldinger">
        <UserRoundCheck size={22} aria-hidden />
        <div>
          <strong>Fast tilgangsregel</strong>
          <span>
            Skoleledelse og tildelt sportsteam kan senere starte en samtale. Elev og invitert foresatt eller klubbtrener kan bare svare i en eksisterende samtale. Elever kan aldri starte samtaler med andre elever.
          </span>
        </div>
      </aside>

      <section className={styles.inbox} aria-labelledby="wang-inbox-title">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>Din rolleavgrensede innboks</span>
            <h2 id="wang-inbox-title">Samtaler</h2>
          </div>
          <strong>{inbox.threads.length}</strong>
        </div>

        {inbox.threads.length === 0 ? (
          <div className={styles.emptyState}>
            <CircleAlert size={28} aria-hidden />
            <h3>Ingen samtaler i innboksen</h3>
            <p>Databasen er koblet, men det er ikke opprettet meldinger. Sending åpnes først etter egen personvern- og funksjonskontroll.</p>
          </div>
        ) : (
          <ul className={styles.threadList}>
            {inbox.threads.map((thread) => (
              <li key={thread.id}>
                <div>
                  <strong>{thread.subject}</strong>
                  <span>{thread.studentName}</span>
                </div>
                <div>
                  <span>{thread.closedAt ? "Avsluttet" : "Aktiv"}</span>
                  <time dateTime={thread.updatedAt}>Oppdatert {formatDateTime(thread.updatedAt)}</time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className={styles.scopeNote}>
        Oversikten viser ikke meldingsinnhold, e-post, telefonnummer, søvn, dagsform eller andre helseopplysninger.
      </p>
    </main>
  );
}
