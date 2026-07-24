"use client";

/**
 * Scroll-animasjon for markedsflatene (2026-07-24).
 *
 * Tre små primitiver, ingen bibliotek: alt av bevegelse ligger i den statiske
 * motion-katalogen (`src/styles/v2/motion.css`, klassene `m-avslor`,
 * `m-parallaks`, `m-klebrig`) — her styrer vi kun NÅR den slår inn.
 *
 * `Avslor`      toner innhold inn første gang det treffer viewporten.
 * `Parallaks`   flytter et bakgrunnsbilde saktere enn siden ruller.
 * `Scene`       sticky produkt-scene: rammen står stille mens teksten ruller,
 *               og melder fra hvilket steg som er aktivt.
 *
 * Redusert bevegelse honoreres i CSS-en: da vises alt uten animasjon, og
 * scroll-lytterne kobles aldri på. Alt er progressivt — uten JS står innholdet
 * fortsatt der (observeren setter bare `data-inne`).
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** True når brukeren har bedt om mindre bevegelse (OS-nivå). */
function foretrekkerRo(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ── Avslor — fade + løft ved første møte med viewporten ── */
export function Avslor({
  children,
  forsink = 0,
  style,
}: {
  children: ReactNode;
  /** Millisekunder forsinkelse — brukes for å la kort komme etter hverandre. */
  forsink?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (foretrekkerRo()) {
      el.setAttribute("data-inne", "ja");
      return;
    }
    const io = new IntersectionObserver(
      (poster) => {
        for (const post of poster) {
          if (post.isIntersecting) {
            post.target.setAttribute("data-inne", "ja");
            io.unobserve(post.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="m-avslor"
      style={{ ["--m-forsink" as string]: `${forsink}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/* ── Parallaks — bakgrunnsbilde som ligger litt etter scrollen ── */
export function Parallaks({
  children,
  /** Hvor mye saktere enn siden bildet flytter seg (0 = låst, 1 = følger). */
  styrke = 0.18,
  style,
}: {
  children: ReactNode;
  styrke?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || foretrekkerRo()) return;
    let rafId = 0;
    const tegn = () => {
      rafId = 0;
      const boks = el.getBoundingClientRect();
      // Hvor langt scenen er fra midten av skjermen, normalisert.
      const midt = boks.top + boks.height / 2 - window.innerHeight / 2;
      el.style.setProperty("--m-skift", `${(-midt * styrke).toFixed(1)}px`);
    };
    const paaScroll = () => {
      if (rafId === 0) rafId = window.requestAnimationFrame(tegn);
    };
    tegn();
    window.addEventListener("scroll", paaScroll, { passive: true });
    window.addEventListener("resize", paaScroll);
    return () => {
      window.removeEventListener("scroll", paaScroll);
      window.removeEventListener("resize", paaScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [styrke]);

  return (
    <div ref={ref} className="m-parallaks" style={style}>
      {children}
    </div>
  );
}

/**
 * Sticky scene: `steg` er antall tekstblokker som ruller forbi. Returnerer
 * hvilket steg som er aktivt, slik at rammen ved siden av kan bytte skjerm.
 * Uten JS (eller ved redusert bevegelse) står steg 0 — innholdet er fortsatt
 * fullt lesbart, det bytter bare ikke.
 */
export function useAktivtSteg(antall: number): {
  ref: React.RefObject<HTMLDivElement | null>;
  aktivt: number;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [aktivt, setAktivt] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || antall < 2) return;
    let rafId = 0;
    const tegn = () => {
      rafId = 0;
      const boks = el.getBoundingClientRect();
      const total = boks.height - window.innerHeight;
      if (total <= 0) return;
      const gaatt = Math.min(1, Math.max(0, -boks.top / total));
      setAktivt(Math.min(antall - 1, Math.floor(gaatt * antall)));
    };
    const paaScroll = () => {
      if (rafId === 0) rafId = window.requestAnimationFrame(tegn);
    };
    tegn();
    window.addEventListener("scroll", paaScroll, { passive: true });
    window.addEventListener("resize", paaScroll);
    return () => {
      window.removeEventListener("scroll", paaScroll);
      window.removeEventListener("resize", paaScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [antall]);

  return { ref, aktivt };
}
