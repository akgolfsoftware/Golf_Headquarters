"use client";

import Link from "next/link";
import { Check } from "lucide-react";

export type BookingBekreftetV2Data = {
  linje: string;
  coachNavn: string | null;
  sted: string;
  varighetMin: number;
  kalenderUrl: string;
  mineBookingerHref?: string;
  merkelapp?: string;
};

export function BookingBekreftetV2({ data }: { data: BookingBekreftetV2Data }) {
  const merkelapp = data.merkelapp ?? "PlayerHQ";
  return (
    <div className="pa-root ph23k" data-design="precision-athletics">
      <header>
        <span><Check size={28} aria-hidden /></span>
        <p>{merkelapp} · Booking</p>
        <h1>Booking bekreftet</h1>
        <p>{data.linje}</p>
      </header>
      <section className="pa-card ph23k-kort">
        <strong>{data.coachNavn ?? "AK Golf Academy"}</strong>
        <small>{data.sted} · {data.varighetMin} min</small>
      </section>
      <a href={data.kalenderUrl} target="_blank" rel="noopener noreferrer" className="pa-btn pa-btn--primary pa-btn--full">Legg i kalender</a>
      <Link href={data.mineBookingerHref ?? "/portal/meg/bookinger"} className="pa-btn pa-btn--secondary pa-btn--full">Se alle bookinger</Link>
    </div>
  );
}
