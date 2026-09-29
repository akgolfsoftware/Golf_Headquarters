"use client";

import { useRouter } from "next/navigation";

import s from "./it.module.css";

/**
 * Nedtrekksliste som åpner én elev (tegningens «Åpne én elev»). Valget legges
 * i adressen, så siden hentes på nytt på serveren. Uten JavaScript virker
 * lenkene i elevlista fortsatt.
 */
export function ElevVelger({
  elever,
  valgt,
  hrefFor,
  tomEtikett = "Åpne én elev",
  etikett = "Åpne elev",
}: {
  elever: Array<{ id: string; navn: string }>;
  valgt: string;
  /** Adresse per elev-id. Tom id = hele gruppa. */
  hrefFor: Record<string, string>;
  tomEtikett?: string;
  etikett?: string;
}) {
  const router = useRouter();
  return (
    <select
      className={s.velg}
      aria-label={etikett}
      value={valgt}
      onChange={(e) => {
        const href = hrefFor[e.target.value];
        if (href) router.push(href, { scroll: false });
      }}
    >
      <option value="">{tomEtikett}</option>
      {elever.map((e) => (
        <option key={e.id} value={e.id}>
          {e.navn}
        </option>
      ))}
    </select>
  );
}
