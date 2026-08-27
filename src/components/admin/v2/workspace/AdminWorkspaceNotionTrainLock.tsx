"use client";

/**
 * AgencyOS Workspace · Notion-tilkobling — Train-lock (T13-restside,
 * 27.08.2026, se docs/natt/D-LYS-OG-5T-BESLUTNING.md §0.8).
 *
 * Mønster-port av inline-JSX-en i page.tsx (Paper). To states
 * (empty/connected), begge bevart 1:1 fra legacy: ensureNotionConnection +
 * getNotionConnectionForUser er ekte; sync-historikk-tabellen og
 * "AI-foreslag"-hintet er fortsatt plassholder-innhold arvet fra
 * design-bundlet (feltkartlegging/v1.2-rader) — samme forbehold som i
 * Paper-versjonen, ikke fjernet her, bare re-skinnet.
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";
import { TlCaps, TlKnapp, TlKort, TlRad, TlTittel, TL_PRESS } from "../oppsett/tl-kit";
import { TlWorkspaceTabs } from "./tl-workspace-kit";

function StatusMerke({ tone, children }: { tone: "up" | "info" | "down" | "lime" | "warn"; children: React.ReactNode }) {
  const farge = tone === "up" || tone === "lime" ? TL.ok : tone === "down" ? TL.danger : tone === "warn" ? TL.warn : TL.mute;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        color: farge,
        boxShadow: `inset 0 0 0 1px ${tone === "down" ? TL.danger : tone === "warn" ? TL.warnHair : TL.hair}`,
      }}
    >
      {children}
    </span>
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

function TomOppsett() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <TlKort pad="24px">
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <NotionLogo />
          <div>
            <TlCaps>Notion · ikke konfigurert</TlCaps>
            <div style={{ fontSize: 19, fontWeight: 700, color: TL.text, marginTop: 8 }}>
              Sett <em style={{ color: TL.warm, fontStyle: "italic" }}>NOTION_INTERNAL_TOKEN</em> i Vercel for å koble til
            </div>
            <p style={{ fontSize: 13, color: TL.mute, lineHeight: 1.6, marginTop: 6 }}>
              AgencyOS bruker en Notion Internal Integration. Tokenet ligger som env-var i Vercel — ingen OAuth-flyt nødvendig.
            </p>
          </div>
        </div>
      </TlKort>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TlCaps>Slik setter du opp</TlCaps>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {[
            { n: "1", title: "Opprett Internal Integration", desc: "Gå til notion.so/my-integrations og lag en ny Internal Integration. Gi den Read/Update/Insert content." },
            { n: "2", title: "Sett env-var i Vercel", desc: "Lim inn tokenet som NOTION_INTERNAL_TOKEN i Vercel → Project → Settings → Environment Variables. Redeploy." },
            { n: "3", title: "Del Tasks-DB med integrasjonen", desc: "I Notion: åpne Tasks-DB → ··· → Connections → legg til integrasjonen. Last side på nytt." },
          ].map((s) => (
            <TlKort key={s.n} pad="18px 20px">
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 30,
                  height: 30,
                  borderRadius: 9999,
                  background: TL.fill,
                  color: TL.onFill,
                  fontWeight: 700,
                }}
              >
                {s.n}
              </span>
              <div style={{ fontSize: 14, fontWeight: 700, color: TL.text, marginTop: 10 }}>{s.title}</div>
              <p style={{ fontSize: 11.5, color: TL.mute, lineHeight: 1.6, marginTop: 6 }}>{s.desc}</p>
            </TlKort>
          ))}
        </div>
      </div>

      <TlKort pad="20px">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: TL.text }}>Ferdig med oppsett?</div>
            <p style={{ fontSize: 12, color: TL.mute, lineHeight: 1.6, marginTop: 6, maxWidth: "50ch" }}>
              Last siden på nytt etter du har satt env-var og delt Tasks-DB med integrasjonen. Vi auto-kobler til på neste request.
            </p>
          </div>
          <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <TlKnapp variant="primaer" icon="external-link">Åpne Notion-integrasjoner</TlKnapp>
          </a>
        </div>
      </TlKort>

      <TlKort pad="14px 18px">
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Icon name="lock" size={14} style={{ color: TL.mute, flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: TL.mute, lineHeight: 1.55, margin: 0 }}>
            Tokenet krypteres i databasen. Internal Integration-tokens har scope kun til siden/databasen du eksplisitt deler med
            integrasjonen i Notion.
          </p>
        </div>
      </TlKort>
    </div>
  );
}

function IkkeAdmin() {
  return (
    <TlKort pad="24px">
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <NotionLogo />
        <div>
          <TlCaps>Notion · kun admin</TlCaps>
          <div style={{ fontSize: 19, fontWeight: 700, color: TL.text, marginTop: 8 }}>Kun ADMIN kan koble til Notion</div>
          <p style={{ fontSize: 13, color: TL.mute, lineHeight: 1.6, marginTop: 6 }}>
            Snakk med Anders hvis du vil at en database skal synkes til AgencyOS.
          </p>
        </div>
      </div>
    </TlKort>
  );
}

function Konfigurerer() {
  return (
    <TlKort pad="24px">
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <NotionLogo />
        <div>
          <TlCaps>Notion · konfigurerer…</TlCaps>
          <div style={{ fontSize: 19, fontWeight: 700, color: TL.text, marginTop: 8 }}>Kobler til Notion automatisk</div>
          <p style={{ fontSize: 13, color: TL.mute, lineHeight: 1.6, marginTop: 6 }}>
            Vi oppretter tilkoblingen nå. Last siden på nytt om noen sekunder.
          </p>
        </div>
      </div>
    </TlKort>
  );
}

function TilkobletTilstand({
  workspaceName,
  connectedSince,
  lastSyncAt,
  databaser,
}: {
  workspaceName: string;
  connectedSince: Date | null;
  lastSyncAt: Date | null;
  databaser: DbLink[];
}) {
  const totalSider = databaser.reduce((sum, d) => sum + d.pagesCount, 0);
  const sidenTekst = connectedSince
    ? `Siden ${connectedSince.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}`
    : "—";
  const sistSynketTekst = lastSyncAt ? `Sist synket ${minutesAgo(lastSyncAt)} · ${totalSider} sider` : `Ikke synket ennå · ${totalSider} sider`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <TlKort pad="20px">
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <NotionLogo />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <StatusMerke tone="up">Tilkoblet</StatusMerke>
              <StatusMerke tone="lime">Auto-koblet · NOTION_INTERNAL_TOKEN</StatusMerke>
              <span style={{ fontSize: 10.5, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{sidenTekst}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: TL.text }}>{workspaceName}</div>
            <div style={{ fontSize: 11, color: TL.mute, marginTop: 4 }}>{sistSynketTekst}</div>
          </div>
          <form action="/api/notion/sync" method="post">
            <TlKnapp variant="sekundaer" icon="refresh-cw" type="submit">Synk nå</TlKnapp>
          </form>
        </div>
      </TlKort>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <TlCaps>Synkede databaser ({databaser.length})</TlCaps>
          <TlKnapp variant="tertiaer" icon="plus">Legg til database (v1.2)</TlKnapp>
        </div>
        {databaser.length === 0 ? (
          <TlKort>
            <p style={{ fontSize: 12.5, color: TL.mute, textAlign: "center", margin: 0 }}>
              Ingen databaser koblet til ennå. Property-mapping og database-tilkobling kommer i v1.2 — i v1.1 må linkene legges inn
              manuelt via Prisma Studio.
            </p>
          </TlKort>
        ) : (
          <TlKort pad="4px 20px">
            {databaser.map((db, i) => (
              <TlRad
                key={db.id}
                last={i === databaser.length - 1}
                chevron={false}
                title={db.navn}
                sub={`${db.pagesCount} sider · ${db.type}`}
                meta={<StatusMerke tone={db.syncMode === "AUTO" ? "up" : "warn"}>{db.syncMode}</StatusMerke>}
                trailing={<span style={{ fontSize: 10.5, color: TL.mute, marginLeft: 10 }}>{db.lastSyncAt ? minutesAgo(db.lastSyncAt) : "aldri"}</span>}
              />
            ))}
          </TlKort>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TlCaps>Feltkartlegging · Tasks · 2026</TlCaps>
        <TlKort pad="4px 20px">
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
            <TlRad
              key={ours}
              last={i === arr.length - 1}
              chevron={false}
              title={ours}
              meta={
                status === "mapped" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, color: TL.text }}>{notion}</span>
                ) : (
                  <TlKnapp variant="tertiaer" icon="plus">Velg property</TlKnapp>
                )
              }
              trailing={<span style={{ fontSize: 10, textTransform: "uppercase", color: status === "mapped" ? TL.mute : TL.warn, marginLeft: 10 }}>{type}</span>}
            />
          ))}
        </TlKort>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TlCaps>Default synlighet for nye oppgaver fra Notion</TlCaps>
        <TlKort>
          <p style={{ fontSize: 12.5, color: TL.mute, lineHeight: 1.6, margin: "0 0 14px" }}>
            Hvis en oppgave kommer inn fra Notion uten Synlighet-feltet satt, settes den til denne verdien.{" "}
            <strong style={{ color: TL.text }}>Tildelt-feltet overstyrer alltid Synlighet</strong> — hvis Øyvind er tildelt, ser han
            oppgaven selv om den er PRIVAT.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(["PRIVAT", "AK", "ALLE"] as const).map((k, i) => (
              <button
                key={k}
                type="button"
                className={TL_PRESS}
                style={{
                  height: 30,
                  padding: "0 12px",
                  borderRadius: 999,
                  fontSize: 11.5,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: i === 0 ? TL.dim : "transparent",
                  color: i === 0 ? TL.text : TL.mute,
                  boxShadow: i === 0 ? "none" : `inset 0 0 0 1px ${TL.hair}`,
                  opacity: i === 0 ? 1 : 0.55,
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </TlKort>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TlCaps>Sync-historikk · siste 24 timer</TlCaps>
        <TlKort pad="4px 20px">
          {[
            { time: "10:42", changes: "Synket 312 sider · 4 endringer", status: "OK" as const, duration: "2,1s" },
            { time: "10:37", changes: "Pull-sync · Tasks · 2026", status: "OK" as const, duration: "1,8s" },
            { time: "10:32", changes: "Push-sync · 1 status-endring", status: "OK" as const, duration: "0,4s" },
            { time: "10:28", changes: "Sync feilet · timeout", status: "FEIL" as const, duration: "30s" },
          ].map((row, i, arr) => (
            <TlRad
              key={i}
              last={i === arr.length - 1}
              chevron={false}
              title={<span style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 11, color: TL.mute, minWidth: 40, fontVariantNumeric: "tabular-nums" }}>{row.time}</span>{row.changes}</span>}
              meta={<StatusMerke tone={row.status === "OK" ? "up" : "down"}>{row.status}</StatusMerke>}
              trailing={<span style={{ fontSize: 10.5, color: TL.mute, marginLeft: 10 }}>{row.duration}</span>}
            />
          ))}
        </TlKort>
      </div>

      <TlKort pad="14px 18px">
        <div style={{ display: "flex", gap: 10 }}>
          <Icon name="sparkles" size={16} style={{ color: TL.warm, flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12.5, color: TL.text, lineHeight: 1.6, margin: 0 }}>
            <strong>Hint:</strong> Vi har detektert at databasen <strong>Mulligan · drift</strong> har ny property{" "}
            <em style={{ color: TL.warm, fontStyle: "italic" }}>«Forventet timer»</em>. Vil du mappe denne til{" "}
            <strong>Estimat</strong>-feltet? <span style={{ color: TL.warm, fontWeight: 700 }}>Ja, map nå →</span>
          </p>
        </div>
      </TlKort>
    </div>
  );
}

export interface AdminWorkspaceNotionData {
  tilstand: "empty" | "connected";
  isAdmin: boolean;
  harInternalToken: boolean;
  feilmelding: string | null;
  workspaceName: string;
  tilkobletSiden: Date | null;
  sistSynket: Date | null;
  databaser: DbLink[];
}

export function AdminWorkspaceNotionTrainLock({ data }: { data: AdminWorkspaceNotionData }) {
  const dbCount = data.databaser.length;
  const pageCount = data.databaser.reduce((sum, d) => sum + d.pagesCount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {data.tilstand === "connected" ? <StatusMerke tone="up">Tilkoblet</StatusMerke> : <StatusMerke tone="info">Ikke tilkoblet</StatusMerke>}
      </div>
      <TlTittel
        sub={
          data.tilstand === "connected"
            ? `Aktiv tilkobling · ${dbCount} ${dbCount === 1 ? "database" : "databaser"} · ${pageCount} sider synket`
            : "Ikke tilkoblet · koble til for å begynne"
        }
      >
        Notion-tilkobling
      </TlTittel>

      <TlWorkspaceTabs active="notion" />

      {!data.isAdmin && data.tilstand === "empty" && (
        <TlKort pad="14px 18px">
          <p style={{ fontSize: 13, color: TL.warn, margin: 0 }}>
            Bare hovedcoach (ADMIN) kan koble til Notion. Snakk med Anders hvis du vil at en database skal synkes.
          </p>
        </TlKort>
      )}

      {data.feilmelding && (
        <TlKort pad="14px 18px">
          <p style={{ fontSize: 13, color: TL.danger, margin: 0 }}>
            Feil ved tilkobling: <code>{data.feilmelding}</code>
          </p>
        </TlKort>
      )}

      {data.tilstand === "empty" ? (
        !data.isAdmin ? (
          <IkkeAdmin />
        ) : !data.harInternalToken ? (
          <TomOppsett />
        ) : (
          <Konfigurerer />
        )
      ) : (
        <TilkobletTilstand
          workspaceName={data.workspaceName}
          connectedSince={data.tilkobletSiden}
          lastSyncAt={data.sistSynket}
          databaser={data.databaser}
        />
      )}
    </div>
  );
}
