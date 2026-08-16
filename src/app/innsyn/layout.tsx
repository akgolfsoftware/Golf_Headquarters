/**
 * /innsyn — ekstern lesetilgang (plan T8): Team Norway-/WANG-ansvarlige med
 * egen GUEST-innlogging ser KUN samtykkede testresultater og stats.
 *
 * EGEN guard, IKKE requirePortalUser: portal-guarden sender GUEST i
 * rolle-redirect-sløyfer (/portal → /admin/kalender), så denne layouten
 * sjekker selv getCurrentUserRaw + capability (effectiveCapabilities, G6).
 * Ingen PortalShell/V2Shell — minimal ramme med logo, tittel og utlogging.
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { effectiveCapabilities } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { logout } from "@/lib/auth/logout";
import { T } from "@/lib/v2/tokens";

export const metadata: Metadata = {
  title: "Innsyn — AK Golf",
  robots: { index: false, follow: false },
};

export default async function InnsynLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserRaw();
  if (!user) redirect("/auth/login");

  const caps = await effectiveCapabilities(user);
  const harTilgang =
    caps.has(Capability.VIEW_SHARED_TEST_RESULTS) ||
    caps.has(Capability.VIEW_SHARED_STATS);
  if (!harTilgang) redirect("/auth/login");

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: T.bg,
        color: T.fg,
        fontFamily: T.ui,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 20px",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
          <span
            style={{
              fontFamily: T.disp,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            AK Golf
          </span>
          <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2 }}>Innsyn</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.fg2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 220,
            }}
          >
            {user.name ?? user.email}
          </span>
          <form action={logout}>
            <button
              type="submit"
              style={{
                fontFamily: T.ui,
                fontSize: 12.5,
                fontWeight: 600,
                color: T.fg,
                background: "transparent",
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              Logg ut
            </button>
          </form>
        </div>
      </header>
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 48px" }}>
        {children}
      </main>
    </div>
  );
}
