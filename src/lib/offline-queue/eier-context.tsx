"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { activateTnDraftOwner } from "./tn-draft-store";

const LokalDataEierContext = createContext<string | null>(null);

export function LokalDataEierProvider({
  eierId,
  children,
}: {
  eierId: string;
  children: ReactNode;
}) {
  const [readyOwner, setReadyOwner] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void activateTnDraftOwner(eierId).catch(() => { /* Scorecard reports unavailable storage. */ }).then(() => { if (active) setReadyOwner(eierId); });
    return () => { active = false; };
  }, [eierId]);
  return (
    <LokalDataEierContext.Provider value={readyOwner === eierId ? eierId : null}>
      {children}
    </LokalDataEierContext.Provider>
  );
}

/** Null betyr at komponenten står utenfor en autentisert app-layout. */
export function useLokalDataEier(): string | null {
  return useContext(LokalDataEierContext);
}
