import "@/styles/wang-trener-tokens.css";

import { WangSkjelett } from "@/components/wang/trener/wang-ui";
import styles from "./wang-login.module.css";

/** Lastetilstand for WANG-24: samme form som innloggingskortet, ingen spinner. */
export default function WangLoggInnLaster() {
  return (
    <main className={`wang-tr ${styles.side}`} aria-busy="true" aria-label="Laster">
      <div className={styles.innhold}>
        <WangSkjelett hoyde={12} bredde={220} />
        <WangSkjelett hoyde={40} bredde="min(320px, 100%)" />
        <div className={styles.rutenett}>
          <section className={`${styles.kort} ${styles.loginKort}`}>
            <div className={styles.loginHode} style={{ height: 94 }} />
            <div className={styles.loginKropp}>
              <WangSkjelett hoyde={28} bredde="40%" />
              <WangSkjelett hoyde={44} />
              <WangSkjelett hoyde={44} />
              <WangSkjelett hoyde={44} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
