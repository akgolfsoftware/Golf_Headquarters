"use client";

import { useEffect, useState } from "react";

import s from "./tn-skra.module.css";

/** Dager, timer, minutter og sekunder til `til`. Etter start står alt på 0. */
function deler(til: number, naa: number) {
  const rest = Math.max(0, Math.floor((til - naa) / 1000));
  return [Math.floor(rest / 86400), Math.floor((rest % 86400) / 3600), Math.floor((rest % 3600) / 60), rest % 60];
}

const ETIKETT = ["dager", "timer", "min", "sek"] as const;
const to = (n: number) => String(n).padStart(2, "0");

/**
 * Nedtelling til neste samling (TN-01, retning «Skrå»). Serveren tegner tallene
 * fra sitt tidspunkt (`fra`), så første tegning er lik på server og klient;
 * deretter teller klienten hvert sekund.
 */
export function TnNedtelling({ til, fra, etikett }: { til: string; fra: string; etikett: string }) {
  const maal = new Date(til).getTime();
  const [naa, setNaa] = useState(() => new Date(fra).getTime());

  useEffect(() => {
    const id = window.setInterval(() => setNaa(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const verdier = deler(maal, naa);
  return (
    <div className={s.nedtelling} role="timer" aria-label={etikett}>
      {ETIKETT.map((e, i) => (
        <div key={e}>
          <b>{i === 0 ? verdier[0] : to(verdier[i])}</b>
          <span>{e}</span>
        </div>
      ))}
    </div>
  );
}
