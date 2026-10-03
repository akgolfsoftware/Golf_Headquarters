"use client";

import Link from "next/link";
import { StatusPille } from "@/components/precision/pa";
import { BookingAvbestillKnapp } from "./BookingAvbestillKnapp";

export type BookingDetaljV2Data = {
  bookingId: string;
  tjeneste: string;
  statusLabel: string;
  statusTone: "neutral" | "ok" | "warn" | "signal";
  dato: string;
  tid: string;
  varighetMin: number;
  sted: string;
  stedId: string;
  coachNavn: string | null;
  coachId: string | null;
  notat: string | null;
  kanAvbestille: boolean;
  kanFaaRefusjon: boolean;
};

export function BookingDetaljV2({ data }: { data: BookingDetaljV2Data }) {
  return (
    <div className="ph23d">
      <header>
        <StatusPille tone={data.statusTone}>{data.statusLabel}</StatusPille>
        <h1>{data.tjeneste}</h1>
        <p>{data.dato}</p>
        <p>{data.tid} · {data.varighetMin} min · {data.sted}{data.coachNavn ? ` · ${data.coachNavn}` : ""}</p>
      </header>
      <section className="pa-card ph23d-kort">
        <p>Detaljer</p>
        <dl>
          <div><dt>Tjeneste</dt><dd>{data.tjeneste}</dd></div>
          <div><dt>Dato</dt><dd>{data.dato}</dd></div>
          <div><dt>Tid</dt><dd>{data.tid} ({data.varighetMin} min)</dd></div>
          <div><dt>Sted</dt><dd><Link href={`/portal/booking/anlegg/${data.stedId}`}>{data.sted}</Link></dd></div>
          {data.coachNavn && data.coachId && <div><dt>Coach</dt><dd><Link href={`/portal/booking/coach/${data.coachId}`}>{data.coachNavn}</Link></dd></div>}
          {data.coachNavn && !data.coachId && <div><dt>Coach</dt><dd>{data.coachNavn}</dd></div>}
          <div><dt>Status</dt><dd><StatusPille tone={data.statusTone}>{data.statusLabel}</StatusPille></dd></div>
        </dl>
      </section>
      {data.notat && (
        <section className="pa-card ph23d-kort">
          <p>Notat</p>
          <blockquote>{data.notat}</blockquote>
        </section>
      )}
      {data.kanAvbestille && <BookingAvbestillKnapp bookingId={data.bookingId} canRefund={data.kanFaaRefusjon} />}
    </div>
  );
}
