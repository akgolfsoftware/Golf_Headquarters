import { V2Laster } from "@/components/v2/laster";

/** Bare serverkomponenter her (gotchas §Bygg og drift: loading.tsx importerer aldri en "use client"-modul). */
export default function Loading() {
  return <V2Laster variant="liste" />;
}
