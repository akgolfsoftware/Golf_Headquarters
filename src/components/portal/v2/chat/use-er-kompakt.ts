"use client";

import { useEffect, useState } from "react";

/**
 * Delt breakpoint-hook for Hjem-skjermens skall — samme grense som fasitens
 * enhetsbånd (playerhq-chat-desktop.html: ≤1120px = artefaktet blir ark,
 * ≥1121px = fast kolonne). Brukt av både PortalChatHjem (layout) og
 * ArtefaktPanel (hvilken visningsform).
 */
export function useErKompakt(): boolean {
  const [kompakt, setKompakt] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1120px)");
    const oppdater = () => setKompakt(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return kompakt;
}
