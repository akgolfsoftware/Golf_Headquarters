"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { disconnectGoogleCalendar } from "./actions";

export function DisconnectButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Koble fra Google Calendar? Bookinger pushes ikke lenger.")) {
      return;
    }
    startTransition(async () => {
      await disconnectGoogleCalendar();
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50"
    >
      {pending ? "Kobler fra …" : "Koble fra"}
    </button>
  );
}
