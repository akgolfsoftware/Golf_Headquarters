/**
 * /admin/audit-log — CoachHQ Audit log
 *
 * Enkel hendelse-liste med filter-pills.
 */

import { CheckCircle, KeyRound, Lock, Shield } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import "@/components/hubs/hubs.css";

export const dynamic = "force-dynamic";

type AuditEvent = {
  id: string;
  time: string;
  kind: "auth" | "api" | "data" | "security";
  actor: string;
  action: string;
  status: "ok" | "warn" | "danger";
};

const MOCK_EVENTS: AuditEvent[] = [
  {
    id: "1",
    time: "24. mai 04:12",
    kind: "security",
    actor: "system",
    action: "API-key rotert (auto)",
    status: "ok",
  },
  {
    id: "2",
    time: "23. mai 18:34",
    kind: "auth",
    actor: "anders@akgolf.no",
    action: "Innlogging fra iPhone",
    status: "ok",
  },
  {
    id: "3",
    time: "23. mai 14:02",
    kind: "data",
    actor: "anders@akgolf.no",
    action: "Eksporterte spillerdata til CSV",
    status: "ok",
  },
  {
    id: "4",
    time: "22. mai 09:11",
    kind: "api",
    actor: "stripe-webhook",
    action: "invoice.paid (Markus R.P.)",
    status: "ok",
  },
  {
    id: "5",
    time: "21. mai 23:48",
    kind: "auth",
    actor: "ukjent IP 185.x.x.x",
    action: "Mislykket innlogging (e-post finnes ikke)",
    status: "warn",
  },
];

const KIND_ICON = {
  auth: Lock,
  api: KeyRound,
  data: CheckCircle,
  security: Shield,
} as const;

export default async function AuditLogPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="hub-frame">
      <div className="hub-page">
        <header className="hub-head">
          <div className="hub-head-left">
            <div className="eyebrow">COACHHQ · SIKKERHET</div>
            <h1>
              Audit <em>-log</em>
            </h1>
            <p className="hub-sub">
              Alle sikkerhetsrelaterte hendelser. Auto-rotering, innlogginger,
              data-eksporter og API-kall.
            </p>
            <div className="hub-stats">
              <span>
                <strong>{MOCK_EVENTS.length}</strong> hendelser
              </span>
              <i />
              <span className="ok-dot">
                <span />
                <strong>Audit ren</strong>
              </span>
              <i />
              <span>
                <strong>1</strong> mistenkelig forsøk siste 7d
              </span>
            </div>
          </div>
        </header>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {MOCK_EVENTS.map((ev) => {
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
                    background: "rgba(0, 88, 64, 0.08)",
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
      </div>
    </div>
  );
}
