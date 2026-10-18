import { RunderLaster } from "@/components/portal/precision/PHRunderLaster";

/* Ren serverkomponent: loading.tsx importerer aldri en "use client"-modul (gotchas §Bygg og drift). Alltid lyst. */
export default function Loading() {
  return (
    <div className="pa-root" data-design="precision-athletics" data-theme="light">
      <RunderLaster tekst="Henter banene" />
    </div>
  );
}
