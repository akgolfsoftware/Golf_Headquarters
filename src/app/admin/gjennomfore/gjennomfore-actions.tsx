"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Plus } from "lucide-react";
import { agBtnClass } from "@/components/admin/agencyos/ui";

export function IDagButton() {
  return (
    <button
      className={agBtnClass("ghost")}
      type="button"
      onClick={() => toast.info("Klikk på dato i kalenderen")}
    >
      <Calendar size={13} strokeWidth={1.75} aria-hidden /> I dag
    </button>
  );
}

export function NyBookingButton() {
  const router = useRouter();
  return (
    <button
      className={agBtnClass("primary")}
      type="button"
      onClick={() => router.push("/admin/bookinger/ny")}
    >
      <Plus size={13} strokeWidth={2} aria-hidden /> Ny booking
    </button>
  );
}
