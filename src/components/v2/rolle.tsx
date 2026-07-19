"use client";

/* AK Golf HQ v2 — rolle-context for AgencyOS-shellen.
   Admin-layouten (server) forteller shellen (client) om innlogget bruker er
   ADMIN, så nav-punkter merket `adminOnly` kan skjules for COACH. Dette er kun
   UI-skjuling — sidene bak er alltid server-gated med requirePortalUser. */

import { createContext, useContext, type ReactNode } from "react";

const AdminRolleContext = createContext<boolean>(true);

export function AdminRolleProvider({
  erAdmin,
  children,
}: {
  erAdmin: boolean;
  children: ReactNode;
}) {
  return (
    <AdminRolleContext.Provider value={erAdmin}>
      {children}
    </AdminRolleContext.Provider>
  );
}

/** true når innlogget bruker er ADMIN (default true utenfor admin-layouten —
 *  PlayerHQ/forelder-nav har ingen adminOnly-punkter, så default er ufarlig). */
export function useErAdmin(): boolean {
  return useContext(AdminRolleContext);
}
