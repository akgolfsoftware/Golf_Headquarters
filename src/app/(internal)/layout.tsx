import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/**
 * Layout for interne sider — design-system, demoer, pilot-sider.
 *
 * Kun ADMIN-rolle slipper inn. Beta-spillere, foreldre og coacher
 * sendes til riktig hjem av requirePortalUser.
 */
export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Kun ADMIN-rolle kan se interne sider/demoer
  await requirePortalUser({ allow: ["ADMIN"] });

  return (
    <div className="min-h-screen" style={{ background: "var(--v2-bg)" }}>
      <div
        style={{
          borderBottom: "1px solid var(--v2-border)",
          background: "var(--v2-panel2)",
          padding: "8px 16px",
          textAlign: "center",
          fontFamily: "var(--v2-font-mono, ui-monospace, monospace)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--v2-mut)",
        }}
      >
        INTERN — KUN UTVIKLING · {process.env.NODE_ENV}
      </div>
      {children}
    </div>
  );
}
