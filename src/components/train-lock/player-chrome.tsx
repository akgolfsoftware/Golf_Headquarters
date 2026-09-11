"use client";

/** Valgt kilde: ZIP (4), components/Island.jsx og PH-01 I dag v3.dc.html.
 * Fasit: designsystem/train-lock/valgt-zip-4/components/island.jsx
 * Avvik:
 *   - Native dialog gir fokusfelle og sperrer bakgrunnen. Samtalen bruker
 *     eksisterende PlayerHQ-chat; ingen opptak eller sending ved åpning.
 *   - Komponentprøve ligger i tests/visual/portering/player-nav.py.
 *     Innlogget kontroll av hele skallet og reisen gjenstår.
 */
import Link from "next/link";
import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./player-chrome.module.css";

const Caddie = lazy(() => import("@/components/portal/v2/idag/IDagCaddie").then((module) => ({ default: module.IDagCaddie })));
const CaddieContext = createContext<(() => void) | null>(null);

const paths: Record<string, string> = {
  hjem: "M12 4v8l5 3M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0",
  plan: "M4 6h16v14H4zM8 3v4M16 3v4M8 13h4",
  analyse: "M4 19V9M10 19V5M16 19v-7M22 19H2",
  meg: "M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1",
  mic: "M12 19v3M9 2h6v12H9zM5 10a7 7 0 0 0 14 0",
};

export function TrainLockNavIkon({ navn, size = 24 }: { navn: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={paths[navn]} /></svg>;
}

export function TrainLockCaddieKnapp({ bareDesktop = false }: { bareDesktop?: boolean }) {
  const apne = useContext(CaddieContext);
  if (!apne) return null;
  return <button type="button" className={`${styles.mikrofon} ${bareDesktop ? styles.bareDesktop : ""}`} aria-label="Spør Caddie" aria-haspopup="dialog" onClick={apne}><TrainLockNavIkon navn="mic" size={22} /></button>;
}

export function TrainLockPlayerIsland({ aktiv, nav }: {
  aktiv?: string;
  nav: Array<{ id: string; href: string; label: string }>;
}) {
  const index = nav.findIndex((item) => item.id === aktiv);
  return <nav aria-label="Hovedmeny" className={styles.island} data-tl-player-island>
    {index >= 0 && <span className={styles.markor} aria-hidden style={{ "--aktiv-plass": index } as CSSProperties} />}
    {nav.map((item) => <Link key={item.id} href={item.href} aria-label={item.label} title={item.label} aria-current={item.id === aktiv ? "page" : undefined} className={styles.fane}><TrainLockNavIkon navn={item.id} /></Link>)}
    <TrainLockCaddieKnapp />
  </nav>;
}

function CaddieArk({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const forrigeFokus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open) {
      forrigeFokus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      el.showModal();
      const overflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        el.close();
        document.body.style.overflow = overflow;
        forrigeFokus.current?.focus();
      };
    }
  }, [open]);
  return <dialog ref={dialog} className={styles.ark} aria-label="Spør Caddie" onCancel={(event) => { event.preventDefault(); onClose(); }} onKeyDown={(event) => {
    if (event.key !== "Tab" || event.defaultPrevented) return;
    // Et nestet stemmeark eier sin egen fokusfelle.
    if (event.target instanceof HTMLElement && event.target.closest('[role="dialog"], dialog') !== event.currentTarget) return;
    const felt = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]')).filter((el) => el.getClientRects().length > 0);
    if (!felt.length) { event.preventDefault(); return; }
    if (event.shiftKey && document.activeElement === felt[0]) {
      event.preventDefault(); felt.at(-1)?.focus();
    } else if (!event.shiftKey && document.activeElement === felt.at(-1)) {
      event.preventDefault(); felt[0].focus();
    }
  }} onClick={(event) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }}>
    <div className={styles.arkInnhold}>
      <div className={styles.arkHode}><h2>Spør Caddie</h2><button type="button" onClick={onClose} aria-label="Lukk Caddie">×</button></div>
      {children}
    </div>
  </dialog>;
}

export function TrainLockPlayerCaddie({ aktiv, composer, children }: { aktiv: boolean; composer?: ReactNode; children: ReactNode }) {
  const [open, settOpen] = useState(false);
  const [harApnet, settHarApnet] = useState(false);
  const apne = useCallback(() => { settHarApnet(true); settOpen(true); }, []);
  const lukk = useCallback(() => settOpen(false), []);
  if (!aktiv) return children;
  return <CaddieContext.Provider value={apne}>
    {children}
    {harApnet && <CaddieArk open={open} onClose={lukk}>
      <Suspense fallback={<p role="status">Åpner Caddie …</p>}>
        {composer ?? <Caddie plassering="mobil" placeholder="Spør Caddie" fangstFormel={null} oktLabel={null} />}
      </Suspense>
    </CaddieArk>}
  </CaddieContext.Provider>;
}
