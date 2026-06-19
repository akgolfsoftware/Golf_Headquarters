"use client";

import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

export function InnstillingerButton() {
  const router = useRouter();
  return (
    <button
      className="hub-btn btn-outline"
      type="button"
      onClick={() => router.push("/admin/settings")}
    >
      <Settings size={13} strokeWidth={1.75} aria-hidden /> Innstillinger
    </button>
  );
}
