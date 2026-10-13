"use client";

import { CircleAlert } from "lucide-react";

import styles from "./app.module.css";

export default function WangAppError({ reset }: { reset: () => void }) {
  return (
    <main className={styles.accessState}>
      <section className={styles.accessCard} aria-labelledby="wang-error-title">
        <span className={styles.accessIcon}><CircleAlert size={28} aria-hidden /></span>
        <span className={styles.eyebrow}>Kunne ikke hente oversikten</span>
        <h1 id="wang-error-title">WANG-dataene er midlertidig utilgjengelige</h1>
        <p>Ingen opplysninger er endret. Prøv på nytt når forbindelsen er tilbake.</p>
        <button type="button" onClick={reset}>Prøv på nytt</button>
      </section>
    </main>
  );
}
