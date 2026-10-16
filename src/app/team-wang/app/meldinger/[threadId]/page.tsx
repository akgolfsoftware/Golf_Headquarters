import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CircleAlert,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { z } from "zod";

import { hentWangBrukerkontekst } from "@/lib/wang-supabase/auth";
import {
  erWangMeldingsrolle,
  hentWangMeldingssamtale,
} from "@/lib/wang-supabase/messages";
import { hentWangRolledefinisjon } from "@/lib/wang-supabase/roles";

import appStyles from "../../app.module.css";
import styles from "../meldinger.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Samtale — WANG Toppidrett",
  description: "Skrivebeskyttet, rolleavgrenset samtale i WANG Toppidrett.",
  robots: { index: false, follow: false },
};

const threadIdSchema = z.uuid();

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

export default async function WangMeldingssamtalePage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  if (!threadIdSchema.safeParse(threadId).success) notFound();

  const context = await hentWangBrukerkontekst();
  if (context.status === "logged_out") {
    redirect(`/team-wang/app/logg-inn?next=/team-wang/app/meldinger/${threadId}`);
  }

  if (context.status !== "ready" || !erWangMeldingsrolle(context.profile.role)) {
    return (
      <main className={appStyles.accessState}>
        <section className={appStyles.accessCard} aria-labelledby="wang-message-access-title">
          <span className={appStyles.accessIcon}><LockKeyhole size={28} aria-hidden /></span>
          <span className={appStyles.eyebrow}>Tilgang avvist</span>
          <h1 id="wang-message-access-title">Samtalen er ikke tilgjengelig for denne rollen</h1>
          <p>Sentral oversikt og generell lesetilgang åpner ikke elevsamtaler automatisk.</p>
          <div className={appStyles.accessActions}>
            <Link href="/team-wang/app">Til WANG-oversikten</Link>
          </div>
        </section>
      </main>
    );
  }

  const conversation = await hentWangMeldingssamtale(context.profile, threadId);
  if (!conversation) notFound();
  const role = hentWangRolledefinisjon(context.profile.role);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/team-wang/app/meldinger" className={styles.backLink}>
          <ArrowLeft size={18} aria-hidden /> Til meldinger
        </Link>
        <div className={styles.headingRow}>
          <span className={styles.headingIcon}><MessageSquareText size={26} aria-hidden /></span>
          <div>
            <span className={styles.eyebrow}>{conversation.studentName}</span>
            <h1>{conversation.subject}</h1>
          </div>
          <span className={styles.databaseBadge}><LockKeyhole size={16} aria-hidden /> Skrivebeskyttet</span>
        </div>
        <p className={styles.intro}>
          {role.label} ser samtalen fordi kontoen er aktiv deltaker og fortsatt har gyldig tilgang til eleven.
        </p>
      </header>

      <aside className={styles.policyNotice} aria-label="Tilgang og sending">
        <ShieldCheck size={22} aria-hidden />
        <div>
          <strong>Ingen sending eller e-post er aktivert</strong>
          <span>Du kan lese lagrede meldinger, men ikke opprette, svare, endre eller slette innhold.</span>
        </div>
      </aside>

      <section className={styles.conversation} aria-labelledby="wang-conversation-title">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>{conversation.closedAt ? "Avsluttet samtale" : "Aktiv samtale"}</span>
            <h2 id="wang-conversation-title">Meldinger</h2>
          </div>
          <strong>{conversation.messages.length}</strong>
        </div>

        {conversation.messages.length === 0 ? (
          <div className={styles.emptyState}>
            <CircleAlert size={28} aria-hidden />
            <h3>Ingen meldinger er lagret</h3>
            <p>Samtalen finnes, men har foreløpig ikke noe innhold.</p>
          </div>
        ) : (
          <ol className={styles.messageList}>
            {conversation.messages.map((message) => (
              <li key={message.id}>
                <article className={message.isCurrentUser ? styles.ownMessage : styles.message}>
                  <header>
                    <strong>{message.senderLabel}{message.isCurrentUser ? " · Deg" : ""}</strong>
                    <time dateTime={message.createdAt}>{formatDateTime(message.createdAt)}</time>
                  </header>
                  <p>{message.body}</p>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className={styles.scopeNote}>
        Denne siden henter bare deltakerens lagrede samtale. E-post, telefonnummer, søvn og dagsform er ikke del av visningen.
      </p>
    </main>
  );
}
