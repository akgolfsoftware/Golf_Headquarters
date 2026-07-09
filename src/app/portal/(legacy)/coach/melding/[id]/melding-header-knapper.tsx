"use client";

import { useToast } from "@/components/shared/toast-provider";
import { MoreVertical, Search } from "lucide-react";

export function MeldingHeaderKnapper() {
  const toast = useToast();
  return (
    <>
      <button
        type="button"
        onClick={() => toast.info("Søk i melding kommer snart")}
        className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
        title="Søk"
      >
        <Search className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={() => toast.info("Meny kommer snart")}
        className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
        title="Mer"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </>
  );
}
