/* Lastetilstand for /portal/gameplan/[baneId] i nytt design. Ren serverkomponent: loading.tsx importerer aldri en
   "use client"-modul (gotchas §Bygg og drift). */
import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { PHIupLaster } from "@/components/portal/precision/PHIupTilstand";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="/portal/gameplan">
      <PHIupLaster tekst="Henter banen …" />
    </PlayerHQSkallLaster>
  );
}
