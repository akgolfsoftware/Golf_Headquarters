import type { ReactNode } from "react";
import styles from "./CoachContent.module.css";

/** Avgrenser migrerte coachvisninger til appens gjeldende Precision-verdier. */
export function CoachContent({ children }: { children: ReactNode }) {
  return <div className={styles.content}>{children}</div>;
}
