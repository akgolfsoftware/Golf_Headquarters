/**
 * AgencyOS Workspace · Notion-tilkobling — v2. To states (empty/connected),
 * begge bevart 1:1 fra legacy: ensureNotionConnection + getNotionConnectionForUser
 * er ekte; sync-historikk-tabellen og "AI-foreslag"-hintet er fortsatt
 * plassholder-innhold arvet fra design-bundlet (feltkartlegging/v1.2-rader),
 * flagget her — ikke min endring, bare chrome-konvertering.
 *
 * WorkspaceTabs/SourceBadge/VisibilityPill er tailwind-only og gjenbrukes.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { SourceBadge, WorkspaceTabs, VisibilityPill } from "@/components/workspace/primitives";
import { ensureNotionConnection } from "@/lib/notion/bootstrap";
import { getNotionConnectionForUser } from "@/lib/notion/client";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, Rad, CTAPill, StatusPill, MikroMeta, Icon, TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

export default async function WorkspaceNotionPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; error?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  await ensureNotionConnection(user.id, user.role);

  const sp = await searchParams;
  const isAdmin = user.role === "ADMIN";
  const hasInternalToken = Boolean(process.env.NOTION_INTERNAL_TOKEN);
  const connection = isAdmin ? await getNotionConnectionForUser(user.id) : null;

  const realState: "empty" | "connected" = connection ? "connected" : "empty";
  const state =
    process.env.NODE_ENV !== "production" && sp.state ? (sp.state === "connected" ? "connected" : "empty") : realState;

  const dbCount = connection?.databases.length ?? 0;
  const pageCount = connection?.databases.reduce((sum, d) => sum + d.pagesCount, 0) ?? 0;

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/admin/workspace">Workspace</TilbakeLenke>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Caps>AgencyOS · Workspace · Notion</Caps>
            {state === "connected" ? <StatusPill tone="up">Tilkoblet</StatusPill> : <StatusPill tone="info">Ikke tilkoblet</StatusPill>}
          </div>
          <div style={{ marginTop: 10 }}>
            <Tittel em="tilkobling">Notion-</Tittel>
          </div>
          <p style={{ fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", color: T.mut, marginTop: 8 }}>
            {state === "connected"
              ? `Aktiv tilkobling · ${dbCount} ${dbCount === 1 ? "database" : "databaser"} · ${pageCount} sider synket`
              : "Ikke tilkoblet · koble til for å begynne"}
          </p>
        </div>

        <div className="workspace-tabs-scope">
          <WorkspaceTabs active="notion" />
        </div>

        {!isAdmin && state === "empty" && (
          <Kort pad="14px 18px">
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.warn, margin: 0 }}>
              Bare hovedcoach (ADMIN) kan koble til Notion. Snakk med Anders hvis du vil at en database skal synkes.
            </p>
          </Kort>
        )}

        {sp.error && (
          <Kort pad="14px 18px">
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.down, margin: 0 }}>
              Feil ved tilkobling: <code>{sp.error}</code>
            </p>
          </Kort>
        )}

        {state === "empty" ? (
          <EmptyState isAdmin={isAdmin} hasInternalToken={hasInternalToken} />
        ) : (
          <ConnectedState
            workspaceName={connection?.workspaceName ?? "Notion workspace"}
            connectedSince={connection?.createdAt ?? null}
            lastSyncAt={connection?.lastSyncAt ?? null}
            databases={connection?.databases ?? []}
          />
        )}
      </div>
    </V2Shell>
  );
}

function NotionLogo({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size}>
      <rect width="60" height="60" rx="12" fill="#000" />
      <text x="30" y="44" textAnchor="middle" fontSize="36" fontWeight="800" fontFamily="serif" fill="#fff">
        N
      </text>
    </svg>
  );
}

function EmptyState({ isAdmin, hasInternalToken }: { isAdmin: boolean; hasInternalToken: boolean }) {
  if (!isAdmin) {
    return (
      <Kort pad="24px">
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <NotionLogo />
          <div>
            <Caps>Notion · kun admin</Caps>
            <div style={{ fontFamily: T.disp, fontSize: 19, fontWeight: 700, color: T.fg, marginTop: 8 }}>
              Kun ADMIN kan koble til Notion
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.6, marginTop: 6 }}>
              Snakk med Anders hvis du vil at en database skal synkes til AgencyOS.
            </p>
          </div>
        </div>
      </Kort>
    );
  }

  if (!hasInternalToken) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Kort pad="24px">
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <NotionLogo />
            <div>
              <Caps>Notion · ikke konfigurert</Caps>
              <div style={{ fontFamily: T.disp, fontSize: 19, fontWeight: 700, color: T.fg, marginTop: 8 }}>
                Sett <em style={{ color: T.lime, fontStyle: "italic" }}>NOTION_INTERNAL_TOKEN</em> i Vercel for å koble til
              </div>
              <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.6, marginTop: 6 }}>
                AgencyOS bruker en Notion Internal Integration. Tokenet ligger som env-var i Vercel — ingen OAuth-flyt nødvendig.
              </p>
            </div>
          </div>
        </Kort>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Caps>Slik setter du opp</Caps>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: T.gap }}>
            {[
              { n: "1", title: "Opprett Internal Integration", desc: "Gå til notion.so/my-integrations og lag en ny Internal Integration. Gi den Read/Update/Insert content." },
              { n: "2", title: "Sett env-var i Vercel", desc: "Lim inn tokenet som NOTION_INTERNAL_TOKEN i Vercel → Project → Settings → Environment Variables. Redeploy." },
              { n: "3", title: "Del Tasks-DB med integrasjonen", desc: "I Notion: åpne Tasks-DB → ··· → Connections → legg til integrasjonen. Last side på nytt." },
            ].map((s) => (
              <Kort key={s.n}>
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 9999,
                    background: T.lime,
                    color: T.onLime,
                    fontFamily: T.disp,
                    fontWeight: 700,
                  }}
                >
                  {s.n}
                </span>
                <div style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 700, color: T.fg, marginTop: 10 }}>{s.title}</div>
                <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.6, marginTop: 6 }}>{s.desc}</p>
              </Kort>
            ))}
          </div>
        </div>

        <Kort tint pad="20px">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.fg }}>Ferdig med oppsett?</div>
              <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, marginTop: 6, maxWidth: "50ch" }}>
                Last siden på nytt etter du har satt env-var og delt Tasks-DB med integrasjonen. Vi auto-kobler til på neste request.
              </p>
            </div>
            <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <CTAPill icon="external-link">Åpne Notion-integrasjoner</CTAPill>
            </a>
          </div>
        </Kort>

        <Kort pad="14px 18px">
          <MikroMeta icon="lock">
            Tokenet krypteres i databasen. Internal Integration-tokens har scope kun til siden/databasen du eksplisitt deler med
            integrasjonen i Notion.
          </MikroMeta>
        </Kort>
      </div>
    );
  }

  return (
    <Kort pad="24px">
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <NotionLogo />
        <div>
          <Caps>Notion · konfigurerer…</Caps>
          <div style={{ fontFamily: T.disp, fontSize: 19, fontWeight: 700, color: T.fg, marginTop: 8 }}>Kobler til Notion automatisk</div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.6, marginTop: 6 }}>
            Vi oppretter tilkoblingen nå. Last siden på nytt om noen sekunder.
          </p>
        </div>
      </div>
    </Kort>
  );
}

type DbLink = { id: string; navn: string; type: string; syncMode: string; pagesCount: number; lastSyncAt: Date | null };

function minutesAgo(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "nå";
  if (mins < 60) return `${mins} min siden`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}t siden`;
  const days = Math.round(hrs / 24);
  return `${days}d siden`;
}

function ConnectedState({
  workspaceName,
  connectedSince,
  lastSyncAt,
  databases,
}: {
  workspaceName: string;
  connectedSince: Date | null;
  lastSyncAt: Date | null;
  databases: DbLink[];
}) {
  const totalPages = databases.reduce((sum, d) => sum + d.pagesCount, 0);
  const sinceText = connectedSince
    ? `Siden ${connectedSince.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}`
    : "—";
  const lastSyncText = lastSyncAt ? `Sist synket ${minutesAgo(lastSyncAt)} · ${totalPages} sider` : `Ikke synket ennå · ${totalPages} sider`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Status-kort */}
      <Kort pad="20px">
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <NotionLogo />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <StatusPill tone="up">Tilkoblet</StatusPill>
              <StatusPill tone="lime">Auto-koblet · NOTION_INTERNAL_TOKEN</StatusPill>
              <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>{sinceText}</span>
            </div>
            <div style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.fg }}>{workspaceName}</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, marginTop: 4 }}>{lastSyncText}</div>
          </div>
          <form action="/api/notion/sync" method="post">
            <CTAPill ghost icon="refresh-cw">
              Synk nå
            </CTAPill>
          </form>
        </div>
      </Kort>

      {/* Synkede databaser */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Caps>Synkede databaser ({databases.length})</Caps>
          <CTAPill ghost icon="plus">
            Legg til database (v1.2)
          </CTAPill>
        </div>
        {databases.length === 0 ? (
          <Kort>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, textAlign: "center", margin: 0 }}>
              Ingen databaser koblet til ennå. Property-mapping og database-tilkobling kommer i v1.2 — i v1.1 må linkene legges inn
              manuelt via Prisma Studio.
            </p>
          </Kort>
        ) : (
          <Kort pad="6px 18px">
            {databases.map((db, i, arr) => (
              <Rad
                key={db.id}
                last={i === arr.length - 1}
                leading={
                  <span style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 8, background: T.fg, color: T.bg, fontFamily: T.disp, fontSize: 11, fontWeight: 700 }}>
                    N
                  </span>
                }
                title={db.navn}
                sub={`${db.pagesCount} sider · ${db.type}`}
                meta={<StatusPill tone={db.syncMode === "AUTO" ? "up" : "warn"}>{db.syncMode}</StatusPill>}
                trailing={<span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>{db.lastSyncAt ? minutesAgo(db.lastSyncAt) : "aldri"}</span>}
              />
            ))}
          </Kort>
        )}
      </div>

      {/* Feltkartlegging */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Caps>Feltkartlegging · Tasks · 2026</Caps>
        <Kort pad="6px 18px">
          {(
            [
              ["Status", "Status", "select", "mapped"],
              ["Prioritet", "Priority", "select", "mapped"],
              ["Synlighet", "Visibility", "multi-select", "mapped"],
              ["Tildelt", "Assignee", "person", "mapped"],
              ["Prosjekt", "Project (relation)", "relation", "mapped"],
              ["Forfaller", "Due", "date", "mapped"],
              ["Estimat", "—", "—", "unmapped"],
            ] as const
          ).map(([ours, notion, type, status], i, arr) => (
            <Rad
              key={ours}
              last={i === arr.length - 1}
              title={ours}
              sub={
                status === "mapped" ? undefined : undefined
              }
              meta={
                status === "mapped" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <SourceBadge kind="N" />
                    <span style={{ fontFamily: T.mono, fontSize: 11.5, fontWeight: 600, color: T.fg }}>{notion}</span>
                  </span>
                ) : (
                  <CTAPill ghost icon="plus">
                    Velg property
                  </CTAPill>
                )
              }
              trailing={<span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", color: status === "mapped" ? T.mut : T.warn }}>{type}</span>}
            />
          ))}
        </Kort>
      </div>

      {/* Default synlighet */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Caps>Default synlighet for nye oppgaver fra Notion</Caps>
        <Kort>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.6, margin: "0 0 14px" }}>
            Hvis en oppgave kommer inn fra Notion uten Synlighet-feltet satt, settes den til denne verdien.{" "}
            <strong style={{ color: T.fg }}>Tildelt-feltet overstyrer alltid Synlighet</strong> — hvis Øyvind er tildelt, ser han
            oppgaven selv om den er PRIVAT.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(["PRIVAT", "AK", "ALLE"] as const).map((k, i) => (
              <button key={k} type="button" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", opacity: i === 0 ? 1 : 0.45 }}>
                <VisibilityPill kind={k} />
              </button>
            ))}
          </div>
        </Kort>
      </div>

      {/* Sync-historikk */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Caps>Sync-historikk · siste 24 timer</Caps>
        <Kort pad="6px 18px">
          {[
            { time: "10:42", changes: "Synket 312 sider · 4 endringer", status: "OK", duration: "2,1s" },
            { time: "10:37", changes: "Pull-sync · Tasks · 2026", status: "OK", duration: "1,8s" },
            { time: "10:32", changes: "Push-sync · 1 status-endring", status: "OK", duration: "0,4s" },
            { time: "10:28", changes: "Sync feilet · timeout", status: "FEIL", duration: "30s" },
          ].map((row, i, arr) => (
            <Rad
              key={i}
              last={i === arr.length - 1}
              leading={<span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, minWidth: 40 }}>{row.time}</span>}
              title={row.changes}
              meta={<StatusPill tone={row.status === "OK" ? "up" : "down"}>{row.status}</StatusPill>}
              trailing={<span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>{row.duration}</span>}
            />
          ))}
        </Kort>
      </div>

      {/* AI-foreslag info */}
      <Kort tint pad="14px 18px">
        <div style={{ display: "flex", gap: 10 }}>
          <Icon name="sparkles" size={16} style={{ color: T.lime, flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: T.fg }}>Hint:</strong> Vi har detektert at databasen <strong style={{ color: T.fg }}>Mulligan · drift</strong>{" "}
            har ny property <em style={{ color: T.lime, fontStyle: "italic" }}>«Forventet timer»</em>. Vil du mappe denne til{" "}
            <strong style={{ color: T.fg }}>Estimat</strong>-feltet? <span style={{ color: T.lime, fontWeight: 700 }}>Ja, map nå →</span>
          </p>
        </div>
      </Kort>
    </div>
  );
}
