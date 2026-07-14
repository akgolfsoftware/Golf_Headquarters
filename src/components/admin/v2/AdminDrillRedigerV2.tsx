"use client";

/**
 * AgencyOS v2 — Rediger drill (`/admin/drills/[id]/rediger`, AgencyOS Bølge 1.2, 2026-07-14).
 * Port fra `(legacy)/drills/[id]/rediger/page.tsx` + `drill-edit-form.tsx` —
 * samme `updateDrill`-kontrakt.
 */

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Caps, Tittel, Icon, T } from "@/components/v2";
import { DrillSkjemaFelter, type DrillSkjemaInitial } from "./DrillSkjemaFelter";
import { updateDrill } from "@/app/admin/(legacy)/drills/actions";

export function AdminDrillRedigerV2({ id, name, initial, andreDrills }: {
  id: string;
  name: string;
  initial: DrillSkjemaInitial;
  andreDrills: { id: string; name: string }[];
}) {
  const router = useRouter();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Link href={`/admin/drills/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <Icon name="arrow-left" size={12} /> Tilbake til drill
      </Link>
      <div>
        <Caps size={9}>AgencyOS · Rediger drill</Caps>
        <Tittel em={name}>Rediger</Tittel>
      </div>
      <DrillSkjemaFelter
        initial={initial}
        andreDrills={andreDrills}
        onLagre={(input) => updateDrill(id, input)}
        onSuksess={(drillId) => router.push(`/admin/drills/${drillId}`)}
        onAvbryt={() => router.push(`/admin/drills/${id}`)}
        lagreLabel="Lagre endringer"
      />
    </div>
  );
}
