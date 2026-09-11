"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { trainLockVersjonForRute } from "@/lib/v2/valgt-design";
import { onsketTema } from "@/lib/v2/tema-default";

/** Holder samme kildevalg ved klientnavigasjon som root-layout gir ved direkte åpning. */
export function TrainLockDesignSynk() {
  const path = usePathname();
  useLayoutEffect(() => {
    const versjon = trainLockVersjonForRute(path);
    const root = document.documentElement;
    if (versjon) {
      root.dataset.trainLock = versjon;
      // Fullskjermsøkt har ikke V2Shell. Synk tema også på slike ruter.
      const cookie = document.cookie.split("; ").find((c) => c.startsWith("ak-v2-tema="))?.slice("ak-v2-tema=".length);
      const tema = onsketTema(path, cookie, false);
      const forrige = root.dataset.v2Tema === "dark" ? "dark" : "light";
      if (tema === "dark") root.dataset.v2Tema = "dark";
      else delete root.dataset.v2Tema;
      if (tema !== forrige) window.dispatchEvent(new Event("ak-v2-tema"));
    } else delete root.dataset.trainLock;
  }, [path]);
  return null;
}
