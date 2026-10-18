import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { hentWangBrukerkontekst, hentWangStartmaalinger } from "@/lib/wang-supabase/auth";

import { WangLoggUtKnapp } from "./WangLoggUtKnapp";
import { WangRoleStart } from "./WangRoleStart";
import styles from "./app.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Oversikt — WANG Toppidrett",
  description: "Rollebasert startside for WANG Toppidrett.",
  robots: { index: false, follow: false },
};

export default async function WangAppPage() {
  const context = await hentWangBrukerkontekst();

  if (context.status === "logged_out") {
    redirect("/team-wang/app/logg-inn?next=/team-wang/app");
  }

  if (context.status === "missing_profile") {
    return (
      <main className={styles.accessState}>
        <section className={styles.accessCard} aria-labelledby="wang-access-title">
          <span className={styles.accessIcon}><ShieldAlert size={28} aria-hidden /></span>
          <span className={styles.eyebrow}>Tilgang mangler</span>
          <h1 id="wang-access-title">Kontoen er ikke koblet til en WANG-rolle</h1>
          <p>Innloggingen virker, men kontoen mangler aktiv rolle og tilgangsomfang. Kontakt WANG-administrasjonen.</p>
          <div className={styles.accessActions}>
            <WangLoggUtKnapp />
            <Link href="/team-wang/demo">Se Golf-demo</Link>
          </div>
        </section>
      </main>
    );
  }

  const metrics = await hentWangStartmaalinger(context.profile);
  return <WangRoleStart profile={context.profile} metrics={metrics} />;
}
