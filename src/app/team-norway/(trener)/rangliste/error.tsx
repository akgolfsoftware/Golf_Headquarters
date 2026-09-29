"use client";

import { TnFeiltilstand } from "@/components/team-norway/tn-uttak-plan-gruppe-admin/tn-feiltilstand";

/** Feiltilstand fra «Team Norway App.dc.html» (stErr). */
export default function Feil({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <TnFeiltilstand hva="ranglisten" reset={reset} digest={error.digest} />;
}
