/** Prøvehjelp: setter nattema på skallets .pa-root (skallene eier temaet selv). */
import { useEffect, type ReactNode } from "react";

export function Natt({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.querySelectorAll(".pa-root").forEach((el) => el.setAttribute("data-theme", "night"));
  });
  return <>{children}</>;
}
