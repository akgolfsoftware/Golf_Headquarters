"use client";

/**
 * AgencyOS v2 — Ny drill (`/admin/drills/ny`, AgencyOS Bølge 1.2, 2026-07-14).
 * Port fra `(legacy)/drills/ny/page.tsx` + `drill-create-form.tsx` — samme
 * `createDrill`-kontrakt, felt-settet er nå identisk med rediger-skjemaet
 * (se `DrillSkjemaFelter.tsx`-header for begrunnelse).
 */

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Caps, Tittel, Icon, T } from "@/components/v2";
import { DrillSkjemaFelter, TOM_DRILL } from "./DrillSkjemaFelter";
import { createDrill } from "@/app/admin/(legacy)/drills/actions";

export function AdminDrillNyV2({ andreDrills }: { andreDrills: { id: string; name: string }[] }) {
  const router = useRouter();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Link href="/admin/drills" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <Icon name="arrow-left" size={12} /> Tilbake til biblioteket
      </Link>
      <div>
        <Caps size={9}>AgencyOS · Ny drill</Caps>
        <Tittel em="drill">Ny</Tittel>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4, maxWidth: 480 }}>
          Legg til en øvelse i biblioteket. Du kan finjustere alle felt etterpå fra drill-detaljen.
        </p>
      </div>
      <DrillSkjemaFelter
        initial={TOM_DRILL}
        andreDrills={andreDrills}
        onLagre={(input) => createDrill(input)}
        onSuksess={(drillId) => router.push(`/admin/drills/${drillId}`)}
        onAvbryt={() => router.push("/admin/drills")}
        lagreLabel="Opprett drill"
      />
    </div>
  );
}
