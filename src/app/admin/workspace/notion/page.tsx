/**
 * /admin/workspace/notion — Notion-tilkobling
 *
 * Pixel-perfekt fra Claude Design-bundle _SEBg4QyodvbW2k06JWiGw
 * (workspace/s5-notion-config.jsx).
 *
 * To states (?state=empty | connected):
 * - empty: 3-stegs forklaring + connect-CTA + sikkerhet-info
 * - connected: status-card + synkede databaser + feltkartlegging + default-synlighet
 *
 * I prod: state hentes fra NotionConnection-tabellen (per ADMIN-user).
 */

import { ExternalLink, Lock, Plus, RefreshCw, Sparkles } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticButton, AthleticEyebrow } from "@/components/athletic";
import { SourceBadge, WorkspaceTabs, VisibilityPill } from "@/components/workspace/primitives";
import { ensureNotionConnection } from "@/lib/notion/bootstrap";
import { getNotionConnectionForUser } from "@/lib/notion/client";

export const dynamic = "force-dynamic";

export default async function WorkspaceNotionPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; error?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Auto-bootstrap (kun ADMIN, kun hvis NOTION_INTERNAL_TOKEN er satt).
  // Idempotent — trygt å kalle på hver request.
  await ensureNotionConnection(user.id, user.role);

  const sp = await searchParams;

  const isAdmin = user.role === "ADMIN";
  const hasInternalToken = Boolean(process.env.NOTION_INTERNAL_TOKEN);
  const connection = isAdmin ? await getNotionConnectionForUser(user.id) : null;

  // I prod: state følger faktisk DB-state. Dev-toggle (?state=) overstyrer
  // bare når NODE_ENV !== production.
  const realState: "empty" | "connected" = connection ? "connected" : "empty";
  const state =
    process.env.NODE_ENV !== "production" && sp.state
      ? sp.state === "connected"
        ? "connected"
        : "empty"
      : realState;

  return (
    <div className="space-y-6">
      <header className="-mx-4 -mt-4 border-b border-border bg-gradient-to-b from-[#FBFAF5] to-background px-4 py-7 md:-mx-8 md:-mt-8 md:px-8">
        <AthleticEyebrow>CoachHQ · Workspace · Notion</AthleticEyebrow>
        <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Notion-{" "}
          <em
            className="font-normal not-italic"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              color: "#005840",
            }}
          >
            tilkobling
          </em>
        </h1>
        <div className="font-mono mt-2.5 flex items-center gap-2 text-[11.5px] uppercase tracking-[0.04em] text-muted-foreground">
          {state === "connected"
            ? "AKTIV TILKOBLING · 4 DATABASER · 461 SIDER SYNKET"
            : "IKKE TILKOBLET · KOBLE TIL FOR Å BEGYNNE"}
          {/* State-toggle bare i dev */}
          {process.env.NODE_ENV !== "production" ? (
            <span className="ml-2 inline-flex gap-1 rounded-full border border-border bg-card p-0.5">
              <a
                href="?state=empty"
                className={`rounded-full px-2.5 py-0.5 text-[10px] ${state === "empty" ? "bg-primary text-accent" : "text-muted-foreground"}`}
              >
                empty
              </a>
              <a
                href="?state=connected"
                className={`rounded-full px-2.5 py-0.5 text-[10px] ${state === "connected" ? "bg-primary text-accent" : "text-muted-foreground"}`}
              >
                connected
              </a>
            </span>
          ) : null}
        </div>
      </header>

      <WorkspaceTabs active="notion" />

      {/* Notion-tilkobling kan kun konfigureres av ADMIN */}
      {!isAdmin && state === "empty" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Bare hovedcoach (ADMIN) kan koble til Notion. Snakk med Anders hvis du vil at
          en database skal synkes.
        </div>
      ) : null}

      {sp.error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-4 text-sm text-destructive">
          Feil ved tilkobling: <code>{sp.error}</code>
        </div>
      ) : null}

      <div className="pb-12">
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────── EMPTY STATE ──

function NotionLogo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size}>
      <rect width="60" height="60" rx="12" fill="#000" />
      <text
        x="30"
        y="44"
        textAnchor="middle"
        fontSize="36"
        fontWeight="800"
        fontFamily="serif"
        fill="#fff"
      >
        N
      </text>
    </svg>
  );
}

function EmptyState({
  isAdmin,
  hasInternalToken,
}: {
  isAdmin: boolean;
  hasInternalToken: boolean;
}) {
  // For ikke-ADMIN: vis kort hint.
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="grid items-center gap-7 rounded-2xl border border-border bg-card p-9 md:grid-cols-[160px_1fr]">
          <div className="flex justify-center">
            <NotionLogo />
          </div>
          <div>
            <div className="font-mono mb-2 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              NOTION · KUN ADMIN
            </div>
            <h2 className="font-display text-2xl font-bold leading-tight tracking-tight">
              Kun ADMIN kan koble til Notion
            </h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
              Snakk med Anders hvis du vil at en database skal synkes til CoachHQ.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN uten env-var: forklar hva som må gjøres i Vercel.
  if (!hasInternalToken) {
    return (
      <div className="mx-auto max-w-3xl space-y-7">
        <div className="grid items-center gap-7 rounded-2xl border border-border bg-card p-9 md:grid-cols-[160px_1fr]">
          <div className="flex justify-center">
            <NotionLogo />
          </div>
          <div>
            <div className="font-mono mb-2 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              NOTION · IKKE KONFIGURERT
            </div>
            <h2 className="font-display text-2xl font-bold leading-tight tracking-tight">
              Sett{" "}
              <em
                className="font-normal not-italic"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  color: "#005840",
                }}
              >
                NOTION_INTERNAL_TOKEN
              </em>{" "}
              i Vercel for å koble til
            </h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
              CoachHQ bruker en Notion Internal Integration. Tokenet ligger som
              env-var i Vercel — ingen OAuth-flyt nødvendig.
            </p>
          </div>
        </div>

        <section>
          <div className="font-mono mb-3 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            SLIK SETTER DU OPP
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                n: "1",
                title: "Opprett Internal Integration",
                desc: "Gå til notion.so/my-integrations og lag en ny Internal Integration. Gi den Read/Update/Insert content.",
              },
              {
                n: "2",
                title: "Sett env-var i Vercel",
                desc: "Lim inn tokenet som NOTION_INTERNAL_TOKEN i Vercel → Project → Settings → Environment Variables. Redeploy.",
              },
              {
                n: "3",
                title: "Del Tasks-DB med integrasjonen",
                desc: "I Notion: åpne Tasks-DB → ··· → Connections → legg til integrasjonen. Last side på nytt.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-5"
              >
                <span className="font-display inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-base font-bold text-accent">
                  {s.n}
                </span>
                <h3 className="font-display text-[15px] font-semibold">{s.title}</h3>
                <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid items-center gap-5 rounded-2xl bg-foreground p-6 text-white md:grid-cols-[1fr_auto]">
          <div>
            <div className="font-display text-lg font-semibold">Ferdig med oppsett?</div>
            <div className="mt-1.5 text-[13px] leading-relaxed text-white/65">
              Last siden på nytt etter du har satt env-var og delt Tasks-DB med
              integrasjonen. Vi auto-kobler til på neste request.
            </div>
          </div>
          <a
            href="https://www.notion.so/my-integrations"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-display text-sm font-semibold text-primary hover:opacity-90"
          >
            <ExternalLink className="h-4 w-4" /> Åpne Notion-integrasjoner
          </a>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3.5">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="text-[12.5px] leading-relaxed">
            <strong>Tokenet krypteres i databasen.</strong> Internal Integration-tokens
            har scope kun til siden/databasen du eksplisitt deler med integrasjonen
            i Notion.
          </p>
        </div>
      </div>
    );
  }

  // ADMIN med env-var men ingen connection — race condition (bootstrap kjører).
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="grid items-center gap-7 rounded-2xl border border-border bg-card p-9 md:grid-cols-[160px_1fr]">
        <div className="flex justify-center">
          <NotionLogo />
        </div>
        <div>
          <div className="font-mono mb-2 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            NOTION · KONFIGURERER...
          </div>
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight">
            Kobler til Notion automatisk
          </h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
            Vi oppretter tilkoblingen nå. Last siden på nytt om noen sekunder.
          </p>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────── CONNECTED STATE ──

type DbLink = {
  id: string;
  navn: string;
  type: string;
  syncMode: string;
  pagesCount: number;
  lastSyncAt: Date | null;
};

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
    ? `SIDEN ${connectedSince.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" }).toUpperCase()}`
    : "—";
  const lastSyncText = lastSyncAt
    ? `Sist synket ${minutesAgo(lastSyncAt)} · ${totalPages} sider`
    : `Ikke synket ennå · ${totalPages} sider`;

  return (
    <div className="space-y-6">
      {/* Status-card */}
      <div className="grid items-center gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-[48px_1fr_auto]">
        <NotionLogo size={48} />
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-mono inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-800">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" />
              TILKOBLET
            </span>
            <span className="font-mono inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
              AUTO-KOBLET · NOTION_INTERNAL_TOKEN
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
              {sinceText}
            </span>
          </div>
          <div className="font-display text-[17px] font-semibold">
            {workspaceName}
          </div>
          <div className="font-mono mt-1 text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
            {lastSyncText}
          </div>
        </div>
        <div className="flex gap-2">
          <form action="/api/notion/sync" method="post">
            <AthleticButton variant="ghost-light" size="sm" type="submit">
              <RefreshCw className="h-3.5 w-3.5" /> Synk nå
            </AthleticButton>
          </form>
        </div>
      </div>

      {/* Synkede databaser */}
      <section>
        <header className="mb-3 flex items-baseline justify-between">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            SYNKEDE DATABASER · {databases.length}
          </div>
          <AthleticButton variant="ghost-light" size="sm" disabled>
            <Plus className="h-3.5 w-3.5" /> Legg til database (v1.2)
          </AthleticButton>
        </header>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {databases.length === 0 ? (
            <div className="p-6 text-center text-[12.5px] text-muted-foreground">
              Ingen databaser koblet til ennå. Property-mapping og database-tilkobling
              kommer i v1.2 — i v1.1 må linkene legges inn manuelt via Prisma Studio.
            </div>
          ) : (
            databases.map((db, i, arr) => (
              <div
                key={db.id}
                className={`grid grid-cols-[32px_1fr_100px_100px_100px] items-center gap-3.5 px-5 py-3.5 ${
                  i < arr.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="font-display flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-card">
                  N
                </div>
                <div>
                  <div className="font-display text-sm font-semibold">{db.navn}</div>
                  <div className="font-mono mt-0.5 text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
                    {db.pagesCount} sider · {db.type}
                  </div>
                </div>
                <span
                  className={`font-mono rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${
                    db.syncMode === "AUTO"
                      ? "bg-primary/10 text-primary"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {db.syncMode}
                </span>
                <div className="font-mono text-right text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
                  {db.lastSyncAt ? minutesAgo(db.lastSyncAt) : "aldri"}
                </div>
                <button
                  type="button"
                  className="font-mono justify-self-end rounded-full border border-border bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-[0.06em] opacity-40"
                  disabled
                >
                  v1.2
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Feltkartlegging */}
      <section>
        <div className="font-mono mb-3 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          FELTKARTLEGGING · Tasks · 2026{" "}
          <span className="text-muted-foreground/60 normal-case">
            (klikk for å bytte database)
          </span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="font-mono grid grid-cols-[180px_1fr_110px] gap-3.5 border-b border-border pb-2 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            <div>CoachHQ-felt</div>
            <div>Notion-property</div>
            <div>Type</div>
          </div>
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
          ).map(([ours, notion, type, status]) => (
            <div
              key={ours}
              className="grid grid-cols-[180px_1fr_110px] items-center gap-3.5 border-b border-border py-3 last:border-b-0"
            >
              <div className="font-display text-[13.5px] font-semibold">{ours}</div>
              <div>
                {status === "mapped" ? (
                  <div className="flex items-center gap-2">
                    <SourceBadge kind="N" />
                    <span className="font-mono text-xs font-semibold">{notion}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="font-mono rounded-full border border-border bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-[0.06em]"
                  >
                    + Velg property
                  </button>
                )}
              </div>
              <span
                className={`font-mono text-[10px] font-bold uppercase tracking-[0.08em] ${
                  status === "mapped" ? "text-muted-foreground" : "text-amber-700"
                }`}
              >
                {type}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Default synlighet */}
      <section>
        <div className="font-mono mb-3 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          DEFAULT SYNLIGHET FOR NYE OPPGAVER FRA NOTION
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
            Hvis en oppgave kommer inn fra Notion uten Synlighet-feltet satt, settes den
            til denne verdien. <strong>Tildelt-feltet overstyrer alltid Synlighet</strong>{" "}
            — hvis Markus er tildelt, ser han oppgaven selv om den er PRIVAT.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(["PRIVAT", "AK", "ALLE"] as const).map((k, i) => (
              <button
                key={k}
                type="button"
                className={`transition ${i === 0 ? "opacity-100" : "opacity-45 hover:opacity-75"}`}
              >
                <VisibilityPill kind={k} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sync-historikk */}
      <section>
        <div className="font-mono mb-3 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          SYNC-HISTORIKK · SISTE 24 TIMER
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="font-mono grid grid-cols-[140px_1fr_100px_100px] gap-3 border-b border-border bg-muted/30 px-4 py-2 text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            <div>TIDSPUNKT</div>
            <div>ENDRINGER</div>
            <div>STATUS</div>
            <div>VARIGHET</div>
          </div>
          {[
            { time: "10:42", changes: "Synket 312 sider · 4 endringer", status: "OK", duration: "2,1s" },
            { time: "10:37", changes: "Pull-sync · Tasks · 2026", status: "OK", duration: "1,8s" },
            { time: "10:32", changes: "Push-sync · 1 status-endring", status: "OK", duration: "0,4s" },
            { time: "10:28", changes: "Sync feilet · timeout", status: "FEIL", duration: "30s" },
          ].map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[140px_1fr_100px_100px] items-center gap-3 px-4 py-2.5"
            >
              <div className="font-mono text-[11px] tabular-nums">{row.time}</div>
              <div className="text-[12.5px]">{row.changes}</div>
              <span
                className={`font-mono rounded-full px-2 py-0.5 text-center text-[9.5px] font-bold uppercase tracking-[0.08em] ${
                  row.status === "OK"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {row.status}
              </span>
              <div className="font-mono text-right text-[11px] tabular-nums text-muted-foreground">
                {row.duration}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI-foreslag info */}
      <div className="flex items-start gap-2.5 rounded-xl border border-accent/40 bg-accent/[0.08] px-4 py-3.5">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-[12.5px] leading-relaxed">
          <strong>Hint:</strong> Vi har detektert at databasen{" "}
          <strong>Mulligan · drift</strong> har ny property <em>«Forventet timer»</em>.
          Vil du mappe denne til <strong>Estimat</strong>-feltet?{" "}
          <a href="#" className="font-bold text-primary">
            Ja, map nå →
          </a>
        </p>
      </div>
    </div>
  );
}


// ---------- helpers ----------

function minutesAgo(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "nå";
  if (mins < 60) return `${mins} min siden`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}t siden`;
  const days = Math.round(hrs / 24);
  return `${days}d siden`;
}
