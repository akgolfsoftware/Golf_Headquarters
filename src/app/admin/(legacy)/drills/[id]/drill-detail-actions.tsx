"use client";

// Action-rad for drill-detalj. Rediger / Dupliser / Slett.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { deleteDrill, duplicateDrill } from "../actions";

type Props = {
  drillId: string;
  drillName: string;
  hasSessions: boolean;
};

export function DrillDetailActions({ drillId, drillName, hasSessions }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function dupliser() {
    setError(null);
    startTransition(async () => {
      const res = await duplicateDrill(drillId);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      if (res.success && res.data) {
        router.push(`/admin/drills/${res.data.drillId}/rediger`);
      }
    });
  }

  function slett() {
    if (hasSessions) {
      if (
        !confirm(
          `«${drillName}» er i bruk i pågående økter. Sletting blokkert — vurder å arkivere i stedet.`,
        )
      ) {
        return;
      }
    } else if (!confirm(`Slett drillen «${drillName}»?`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deleteDrill(drillId);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      router.push("/admin/drills");
    });
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <Link
        href={`/admin/drills/${drillId}/rediger`}
        className="h-11 rounded-md bg-primary px-4 text-center text-sm font-semibold leading-[44px] text-primary-foreground hover:opacity-90 sm:h-9 sm:leading-9"
      >
        Rediger
      </Link>
      <button
        type="button"
        onClick={dupliser}
        disabled={pending}
        className="h-11 rounded-md border border-input bg-card px-4 text-sm font-medium hover:border-border disabled:opacity-60 sm:h-9"
      >
        Dupliser
      </button>
      <button
        type="button"
        onClick={slett}
        disabled={pending}
        className="h-11 rounded-md border border-destructive/30 bg-destructive/5 px-4 text-sm font-medium text-destructive hover:border-destructive/50 disabled:opacity-60 sm:h-9"
      >
        Slett
      </button>
      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive"
        >
          {error}
        </div>
      )}
    </div>
  );
}
