"use client";

import { AG24Feil } from "@/components/admin/precision/AG24Tilstander";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AG24Feil title="Loggen kunne ikke hentes" error={error} reset={reset} />;
}
