/** Fasit: designsystem/train-lock/valgt-zip-4/components/ og tokens/. */
import type { ReactNode } from "react";
import { TL } from "@/lib/v2/train-lock";
import styles from "./v3-elementer.module.css";

export function TrainLockStatus({ variant = "mute", children }: {
  variant?: "ok" | "warm" | "danger" | "mute";
  children: ReactNode;
}) {
  return <span className={styles.status} data-variant={variant}>{children}</span>;
}

export function TrainLockChip({ children }: { children: ReactNode }) {
  return <span className={styles.chip}>{children}</span>;
}

/** Ukjent verdi gir ingen prosent. Ugyldige eller negative tall vises aldri. */
export function TrainLockFremdrift({ verdi, label }: { verdi: number; label: string }) {
  if (!Number.isFinite(verdi)) return null;
  const prosent = Math.round(Math.max(0, Math.min(1, verdi)) * 100);
  return <div className={styles.fremdrift}>
    <div className={styles.fremdriftTekst}><span>{label}</span><span>{prosent} %</span></div>
    <div role="progressbar" aria-label={label} aria-valuenow={prosent} aria-valuemin={0} aria-valuemax={100} className={styles.spor}>
      <div style={{ width: `${prosent}%`, height: "100%", background: TL.warm, borderRadius: TL.radius.pill }} />
    </div>
  </div>;
}
