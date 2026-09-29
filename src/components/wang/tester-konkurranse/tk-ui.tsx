import Link from "next/link";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";

import type { KoStatus } from "@/lib/wang/tester-konkurranse/tester";

import s from "./tk.module.css";

/** Segmentvalg som lenker (tegningens wg-seg). Valget ligger i adressen. */
export function TkSeg({ valg, etikett }: { valg: Array<{ href: string; etikett: ReactNode; aktiv: boolean }>; etikett: string }) {
  return (
    <nav className={s.seg} aria-label={etikett}>
      {valg.map((v) => (
        <Link key={v.href} href={v.href} scroll={false} className={s.segValg} aria-current={v.aktiv ? "page" : undefined}>
          {v.etikett}
        </Link>
      ))}
    </nav>
  );
}

/** «Kun innlogget · trener ved WANG» — hvem som ser siden. */
export function TkLaas({ children }: { children: ReactNode }) {
  return (
    <span className={s.laas}>
      <Lock size={14} strokeWidth={1.5} aria-hidden="true" />
      {children}
    </span>
  );
}

const PRIKK: Record<KoStatus | "Låst" | "Uavklart", string> = {
  Planlagt: s.pPlanlagt,
  Mangler: s.pMangler,
  Ført: s.pFort,
  Kontrollert: s.pKontrollert,
  Låst: s.pLaast,
  Uavklart: s.pObs,
};

/** Status med prikk (wg-st). */
export function TkStatus({ status, children }: { status: KoStatus | "Låst" | "Uavklart"; children?: ReactNode }) {
  return (
    <span className={s.st}>
      <span className={`${s.prikk} ${PRIKK[status]}`} aria-hidden="true" />
      {children ?? status}
    </span>
  );
}
