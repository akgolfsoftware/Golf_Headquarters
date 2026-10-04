"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useToast } from "@/components/shared/toast-provider";
import { Knapp } from "@/components/precision/pa";

export function NyPlanKnapp({
  variant,
}: {
  variant: "header" | "empty-state";
  primary?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();

  function handleKlikk() {
    toast.info("Opprett ny FYS-plan direkte i Workbench");
    router.push("/portal/planlegge");
  }

  return (
    <Knapp variant="secondary" icon={Plus} onClick={handleKlikk}>
      {variant === "header" ? "Ny plan" : "Lag din første plan"}
    </Knapp>
  );
}
