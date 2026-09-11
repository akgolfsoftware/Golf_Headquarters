"use client";

import { createContext, useContext, type ReactNode } from "react";

const LokalDataEierContext = createContext<string | null>(null);

export function LokalDataEierProvider({
  eierId,
  children,
}: {
  eierId: string;
  children: ReactNode;
}) {
  return (
    <LokalDataEierContext.Provider value={eierId}>
      {children}
    </LokalDataEierContext.Provider>
  );
}

/** Null betyr at komponenten står utenfor en autentisert app-layout. */
export function useLokalDataEier(): string | null {
  return useContext(LokalDataEierContext);
}
