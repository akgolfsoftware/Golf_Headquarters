/**
 * Nattflate for live-økten i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/parts.jsx › Focus). Én kolonne, ingen fanelinje, én fullbredde
 * primærhandling nederst. Dekker hele skjermen, som de gamle live-skallene gjorde.
 *
 * Tema: natt som standard (Anders 28.09: natt i live-økt og slagregistrering).
 */
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { X } from "lucide-react";
import { Ikon } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-a20.css";

export function mmss(sek: number | null | undefined): string {
  if (sek == null || !Number.isFinite(sek)) return "—";
  const s = Math.max(0, Math.round(sek));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function PHFokus({ topp, handling, children, max = 600, odId, label, attr }: {
  topp?: ReactNode; handling?: ReactNode; children: ReactNode; max?: number; odId?: string; label?: string;
  /** Ekstra data-attributter på rota (f.eks. data-phase). */
  attr?: Record<`data-${string}`, string | undefined>;
}) {
  return <div className="pa-root pa-fokus" data-theme="night" data-design="precision-athletics" data-od-id={odId} {...attr} role="region" aria-label={label ?? "Økt"} style={{ "--fokus-max": `${max}px` } as CSSProperties}>
    <main id="pa-innhold" className="pa-fokus__scroll"><div className="pa-fokus__col">
      {topp && <div className="pa-fokus__topp">{topp}</div>}
      {children}
    </div></main>
    {handling && <div className="pa-fokus__action"><div className="pa-fokus__action-in">{handling}</div></div>}
  </div>;
}

/** Lukk-knapp øverst til venstre (56 px), som lenke. */
export function PHLukk({ href, label = "Lukk" }: { href: string; label?: string }) {
  return <Link href={href} className="pa-iconbtn pa-iconbtn--secondary pa-iconbtn--stor" aria-label={label}><Ikon icon={X} name="x" /></Link>;
}
