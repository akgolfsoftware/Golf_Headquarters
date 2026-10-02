"use client";

/**
 * /admin/bookinger/[id] i Precision (AG-06-detaljen som egen side, 29.09.2026).
 * To kolonner fra 1100 px: detaljer · handlinger. Ren visning — data inn som props.
 */
import { UserRound } from "lucide-react";
import { KnappLenke, Meta, StatusPille } from "@/components/precision/pa";
import { Kort, Nokkelverdi } from "@/components/precision/pa-a4";
import { BookingHandlinger, type BookingForHandling } from "./AG06Booking";
import type { AG06Booking } from "@/app/admin/bookinger/data";
import "@/styles/precision-a4.css";

export type AG06BookingDetaljData = {
  id: string;
  tjeneste: string;
  varighetMin: number;
  status: string;
  spiller: { id: string; navn: string } | null;
  gjest: { navn: string | null; epost: string | null; telefon: string | null } | null;
  coachNavn: string | null;
  dato: string;
  tid: string;
  sted: string;
  prisOre: number;
  betaling: AG06Booking["pay"];
  notat: string | null;
  opprettet: string;
  forslag: string | null;
  handling: BookingForHandling;
};

const STATUS: Record<string, { label: string; tone: "ok" | "warn" | "neutral" }> = {
  PENDING: { label: "Venter på deg", tone: "warn" },
  CONFIRMED: { label: "Bekreftet", tone: "ok" },
  COMPLETED: { label: "Gjennomført", tone: "neutral" },
  CANCELLED: { label: "Avlyst", tone: "neutral" },
};

const kr = (ore: number) => `${(ore / 100).toLocaleString("nb-NO", { maximumFractionDigits: 2 })} kr`;

export function AG06BookingDetalj({ data }: { data: AG06BookingDetaljData }) {
  const st = STATUS[data.status] ?? { label: data.status, tone: "neutral" as const };
  const kontakt = [data.gjest?.epost, data.gjest?.telefon].filter(Boolean).join(" · ") || null;
  const aktiv = data.status === "PENDING" || data.status === "CONFIRMED";
  return (
    <div className="a4-todel">
      <Kort>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
          <span className="kicker">Detaljer</span>
          <StatusPille tone={st.tone}>{st.label}</StatusPille>
        </div>
        <Nokkelverdi items={[
          [data.spiller ? "Spiller" : "Gjest", data.spiller?.navn ?? data.gjest?.navn ?? "Gjest", {}],
          ["Kontakt", kontakt, {}],
          ["Coach", data.coachNavn, {}],
          ["Tjeneste", `${data.tjeneste} · ${data.varighetMin} min`, {}],
          ["Dato", data.dato, {}],
          ["Tid", data.tid, { mono: true }],
          ["Sted", data.sted, {}],
          ["Pris", kr(data.prisOre), { mono: true, hint: "PRIS VED BOOKING" }],
          ["Betaling", data.betaling, {}],
          ["Foreslått ny tid", data.forslag ?? undefined, { hint: "VENTER PÅ SPILLEREN" }],
          ["Notat", data.notat, {}],
          ["Opprettet", data.opprettet, {}],
        ]} />
        <Meta>/ADMIN/BOOKINGER/{data.id.toUpperCase()}</Meta>
      </Kort>
      <Kort>
        <span className="kicker">Handlinger</span>
        {aktiv ? (
          <BookingHandlinger b={data.handling} />
        ) : (
          <Meta>{data.status === "CANCELLED" ? "BOOKINGEN ER AVLYST · INGEN HANDLINGER" : "BOOKINGEN ER GJENNOMFØRT · INGEN HANDLINGER"}</Meta>
        )}
        {data.spiller && <KnappLenke href={`/admin/spillere/${data.spiller.id}`} variant="secondary" icon={UserRound} iconName="user-round">Åpne {data.spiller.navn}</KnappLenke>}
      </Kort>
    </div>
  );
}
