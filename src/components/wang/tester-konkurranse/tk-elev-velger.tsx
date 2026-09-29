"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import s from "./tk.module.css";

/**
 * Nedtrekksliste som bytter elev via adressen (?elev=<id>). Valget ligger i
 * URL-en, så siden rendres på serveren med riktig elev og kan deles/lenkes.
 */
export function TkElevVelger({ elever, valgt, basisHref, param = "elev", etikett = "Elev" }: {
  elever: Array<{ id: string; navn: string; klasse: string | null }>;
  valgt: string;
  basisHref: string;
  param?: string;
  etikett?: string;
}) {
  const router = useRouter();
  const [venter, start] = useTransition();
  return (
    <label className={s.velger}>
      {etikett}
      <select
        className={s.felt}
        value={valgt}
        aria-busy={venter}
        onChange={(e) => {
          const url = new URL(basisHref, window.location.origin);
          url.searchParams.set(param, e.target.value);
          start(() => router.push(`${url.pathname}${url.search}`, { scroll: false }));
        }}
      >
        {elever.map((e) => (
          <option key={e.id} value={e.id}>
            {e.klasse ? `${e.navn} · ${e.klasse}` : e.navn}
          </option>
        ))}
      </select>
    </label>
  );
}
