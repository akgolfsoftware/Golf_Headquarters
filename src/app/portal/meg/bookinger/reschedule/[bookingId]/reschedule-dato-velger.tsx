"use client";

import Link from "next/link";
import { T } from "@/lib/v2/tokens";

const UKEDAG = ["Sø", "Ma", "Ti", "On", "To", "Fr", "Lø"];

type Props = {
  valgtDato: Date;
  bookingId: string;
  dager: number;
};

export function RescheduleDatoVelger({ valgtDato, bookingId, dager }: Props) {
  const idag = new Date();
  idag.setHours(0, 0, 0, 0);

  const datoer: Date[] = [];
  for (let i = 0; i < dager; i++) {
    const d = new Date(idag);
    d.setDate(idag.getDate() + i);
    datoer.push(d);
  }

  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
      {datoer.map((d) => {
        const aktiv =
          d.getFullYear() === valgtDato.getFullYear() &&
          d.getMonth() === valgtDato.getMonth() &&
          d.getDate() === valgtDato.getDate();
        const iso = d.toISOString().split("T")[0];
        return (
          <Link
            key={iso}
            href={`/portal/meg/bookinger/reschedule/${bookingId}?dato=${iso}`}
            scroll={false}
            className="v2-press v2-focus"
            style={{
              display: "flex",
              minWidth: 64,
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 12,
              border: `1px solid ${aktiv ? "transparent" : T.border}`,
              background: aktiv ? T.lime : T.panel,
              color: aktiv ? T.onLime : T.fg,
              padding: "10px 12px",
              textDecoration: "none",
              boxShadow: aktiv ? "none" : undefined,
            }}
          >
            <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: aktiv ? 0.8 : 1, color: aktiv ? T.onLime : T.mut }}>
              {UKEDAG[d.getDay()]}
            </span>
            <span style={{ fontFamily: T.disp, fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
              {d.getDate()}
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: aktiv ? T.onLime : T.mut, opacity: aktiv ? 0.8 : 1 }}>
              {d.toLocaleDateString("nb-NO", { month: "short" })}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
