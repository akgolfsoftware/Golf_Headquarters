"use client";

/**
 * `--ak-topbar-h` — høyden på sticky toppbar, publisert på `<html>`.
 *
 * Bakgrunn (gotchas 2026-08-14): en `position: sticky; top: 0`-toppbar over
 * DOKUMENT-rullen spiser de øverste px-ene av viewporten. Uten motstykke lander
 * ethvert anker-hopp — `scrollIntoView`, `#fragment`, tastaturfokus — bak den.
 * `globals.css` setter `html { scroll-padding-top: var(--ak-topbar-h, 0px) }`,
 * og denne modulen fyller variabelen med den faktiske, målte høyden.
 *
 * Speilvendt `--ak-cookie-h` i bunnen: forskyv rullen, aldri legg innhold oppå.
 *
 * Måles fremfor å hardkodes fordi toppbarene brekker til flere rader på 390px
 * (konsollens er 112px der, ~56px på desktop). Flere toppbarer kan være montert
 * samtidig (responsive varianter), så vi publiserer den høyeste — en skjult
 * variant måler 0 og påvirker derfor ingenting.
 */

import { useEffect, useRef, type RefObject } from "react";

const VARIABEL = "--ak-topbar-h";
const monterte = new Map<HTMLElement, number>();

function publiser() {
  const rot = document.documentElement;
  if (monterte.size === 0) {
    rot.style.removeProperty(VARIABEL);
    return;
  }
  const hoyest = Math.max(...monterte.values());
  rot.style.setProperty(VARIABEL, `${Math.ceil(hoyest)}px`);
}

function mal(el: HTMLElement): () => void {
  const oppdater = () => {
    monterte.set(el, el.getBoundingClientRect().height);
    publiser();
  };
  oppdater();
  const ro = new ResizeObserver(oppdater);
  ro.observe(el);
  return () => {
    ro.disconnect();
    monterte.delete(el);
    publiser();
  };
}

/**
 * Sett returverdien som `ref` på selve toppbar-elementet.
 *
 * ```tsx
 * const toppRef = useToppbarHoyde<HTMLElement>();
 * return <header ref={toppRef} style={{ position: "sticky", top: 0 }}>…</header>;
 * ```
 */
export function useToppbarHoyde<T extends HTMLElement = HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return mal(el);
  }, []);
  return ref;
}

/**
 * Samme måling for toppbarer som ligger i en server-komponent, der en hook ikke
 * kan brukes: legg `<ToppbarHoyde />` som første barn inne i toppbaren, så måler
 * den forelderen sin.
 */
export function ToppbarHoyde() {
  const merke = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = merke.current?.parentElement;
    if (!el) return;
    return mal(el);
  }, []);
  return <span ref={merke} hidden aria-hidden />;
}
