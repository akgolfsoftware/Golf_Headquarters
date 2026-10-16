import Link from "next/link";
import { MessageSquareOff } from "lucide-react";

import appStyles from "../../app.module.css";

export default function WangMeldingssamtaleNotFound() {
  return (
    <main className={appStyles.accessState}>
      <section className={appStyles.accessCard} aria-labelledby="wang-message-not-found-title">
        <span className={appStyles.accessIcon}><MessageSquareOff size={28} aria-hidden /></span>
        <span className={appStyles.eyebrow}>Ikke tilgjengelig</span>
        <h1 id="wang-message-not-found-title">Samtalen kan ikke åpnes</h1>
        <p>Samtalen finnes ikke, eller kontoen din har ikke lenger tilgang.</p>
        <div className={appStyles.accessActions}>
          <Link href="/team-wang/app/meldinger">Til meldinger</Link>
        </div>
      </section>
    </main>
  );
}
