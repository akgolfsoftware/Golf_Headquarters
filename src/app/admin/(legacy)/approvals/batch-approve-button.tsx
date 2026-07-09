"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { batchApproveLowRisk } from "./actions";
import { agBtnClass } from "@/components/admin/agencyos/ui";

export function BatchApproveButton({ count }: { count: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || count === 0}
      onClick={() =>
        startTransition(async () => {
          await batchApproveLowRisk();
          router.refresh();
        })
      }
      className={`${agBtnClass("primary", "sm")} disabled:opacity-60`}
    >
      <Check className="h-4 w-4" strokeWidth={2} />
      Godkjenn lav-risiko ({count})
    </button>
  );
}