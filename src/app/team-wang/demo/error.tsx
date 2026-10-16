"use client";

import { CircleAlert, RotateCcw } from "lucide-react";

import styles from "./demo.module.css";

export default function WangGolfDemoError({ reset }: { reset: () => void }) {
  return (
    <main className={styles.statePage}>
      <div className={styles.stateCard}>
        <CircleAlert aria-hidden="true" size={28} />
        <h1>Golf-demoen er ikke tilgjengelig</h1>
        <p>Databasen svarte ikke, eller WANG-miljøet mangler oppsett.</p>
        <button type="button" className={styles.primaryButton} onClick={reset}>
          <RotateCcw aria-hidden="true" size={18} />
          Prøv igjen
        </button>
      </div>
    </main>
  );
}
