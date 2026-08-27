"use client";

/**
 * QA-1: Sonner-toasts i AgencyOS. 78 `toast.*`-kall rendret aldri fordi
 * `<Toaster/>` ikke var montert. Portal bruker eget ToastProvider;
 * admin-kallene går via `sonner` — derfor denne kanalen her, ikke begge.
 */

import { Toaster } from "sonner";

export function AdminToaster() {
  return (
    <Toaster
      position="bottom-center"
      theme="system"
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          fontFamily: "var(--font-poppins), system-ui, sans-serif",
        },
      }}
    />
  );
}
