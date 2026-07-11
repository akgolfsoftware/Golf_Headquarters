/**
 * /admin/audit-log — AgencyOS Audit log
 *
 * Ekte hendelse-liste fra AuditLog (siste 50). Kategori/ikon utledes av action-prefiks
 * (f.eks. "booking.created"). Ingen fabrikerte hendelser — tomstate når loggen er tom.
 */

import { CheckCircle, KeyRound, Lock, Shield } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import "@/components/hubs/hubs.css";

export const dynamic = "force-dynamic";

type Kind = "auth" | "api" | "data" | "security";
type Status = "ok" | "warn" | "danger";

const KIND_ICON = {
  auth: Lock,
  api: KeyRound,
  data: CheckCircle,
  security: Shield,
} as const;

function kindFromAction(action: string): Kind {
  const prefix = action.split(".")[0]?.toLowerCase() ?? "";
  if (["auth", "login", "user", "session"].includes(prefix)) return "auth";
  if (["api", "google-calendar", "stripe", "webhook", "notion"].includes(prefix))
    return "api";
  if (["security", "key"].includes(prefix)) return "security";
  return "data";
}

function statusFromAction(action: string): Status {
  const a = action.toLowerCase();
  if (/fail|error|denied|unauthorized|mislyk/.test(a)) return "danger";
  if (/cancel|delet|avlys|slett/.test(a)) return "warn";
  return "ok";
}

const NB = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AuditLogPage() {
  await requirePortalUser({ allow: ["ADMIN"] });

  const rows = await prisma.auditLog
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { actor: { select: { name: true, email: true } } },
    })
    .catch(() => []);

  const events = rows.map((r) => ({
    id: r.id,
    time: NB.format(r.createdAt),
    kind: kindFromAction(r.action),
    actor: r.actor?.name ?? r.actor?.email ?? r.actorId ?? "system",
    action: r.action,
    status: statusFromAction(r.action),
  }));

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const mistenkelige = rows.filter(
    (r) =>
      statusFromAction(r.action) !== "ok" && r.createdAt >= sevenDaysAgo,
  ).length;

  return (
    <div className="hub-frame">
      <div className="hub-page">
        <header className="hub-head">
          <div className="hub-head-left">
            <div className="eyebrow">AGENCYOS · SIKKERHET</div>
            <h1>
              Audit <em>-log</em>
            </h1>
            <p className="hub-sub">
              Alle sikkerhetsrelaterte hendelser. Innlogginger, bookinger,
              data-endringer og API-kall.
            </p>
            <div className="hub-stats">
              <span>
                <strong>{events.length}</strong> hendelser
              </span>
              <i />
              <span className="ok-dot">
                <span />
                <strong>{mistenkelige === 0 ? "Audit ren" : "Se gjennom"}</strong>
              </span>
              <i />
              <span>
                <strong>{mistenkelige}</strong> mistenkelig
                {mistenkelige === 1 ? "" : "e"} siste 7d
              </span>
            </div>
          </div>
        </header>

        {events.length === 0 ? (
          <div
            style={{
              padding: "48px 16px",
              textAlign: "center",
              color: "hsl(var(--muted-foreground))",
              border: "1px dashed hsl(var(--border))",
              borderRadius: 12,
              fontSize: 14,
            }}
          >
            Ingen hendelser logget ennå. Aktivitet vises her etter hvert som det
            skjer.
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {events.map((ev) => {
              const Icon = KIND_ICON[ev.kind];
              const statusColor =
                ev.status === "warn"
                  ? "var(--hub-warning)"
                  : ev.status === "danger"
                    ? "var(--hub-danger)"
                    : "var(--hub-success)";
              return (
                <li
                  key={ev.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr auto",
                    gap: 14,
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "color-mix(in srgb, var(--forest) 8%, transparent)",
                      color: "hsl(var(--primary))",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={16} strokeWidth={1.75} aria-hidden />
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                      {ev.action}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: 10.5,
                        color: "hsl(var(--muted-foreground))",
                        marginTop: 2,
                      }}
                    >
                      {ev.actor} · {ev.time}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: statusColor,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                    }}
                  >
                    {ev.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
