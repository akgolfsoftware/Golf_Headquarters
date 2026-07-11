/**
 * AgencyOS Workspace · Prosjekter — v2. Ekte data fra getProjectsForUser()
 * (Notion-sync via ProsjektCache), bevart 1:1 — faller tilbake til
 * SAMPLE_PROJECTS kun i dev når ingen Notion-tilkobling (arvet, uendret).
 * WorkspaceTabs/AvatarStack/VisibilityIcon/getCompanyBar gjenbrukes.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AvatarStack, VisibilityIcon, WorkspaceTabs, getCompanyBar } from "@/components/workspace/primitives";
import { SAMPLE_PEOPLE, type SampleProject } from "@/components/workspace/sample-data";
import { getProjectsForUser } from "@/lib/notion/queries";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, CTAPill, StatusPill, TomTilstand, Icon } from "@/components/v2";

export const dynamic = "force-dynamic";

const COMPANY_LABEL: Record<SampleProject["company"], string> = {
  AK: "AK Golf",
  MULLIGAN: "Mulligan",
  WANG: "Wang Topp",
  SKARP: "Skarpnord",
  PRIVAT: "Privat",
};

export default async function WorkspaceProsjekterPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const sp = await searchParams;
  const filter = sp.filter ?? "alle";

  const projects = await getProjectsForUser();

  const filtered = projects.filter((p) => {
    if (filter === "aktive") return p.status === "AKTIV";
    if (filter === "pause") return p.status === "PAUSE";
    if (filter === "arkiv") return p.status === "ARKIVERT";
    return true;
  });

  const counts = {
    alle: projects.length,
    aktive: projects.filter((p) => p.status === "AKTIV").length,
    pause: projects.filter((p) => p.status === "PAUSE").length,
    arkiv: projects.filter((p) => p.status === "ARKIVERT").length,
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Caps>AgencyOS · Workspace · Prosjekter</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel>Prosjekter</Tittel>
            </div>
            <p style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.mut, marginTop: 8 }}>
              {counts.alle} totalt · {counts.aktive} aktive · {counts.pause} på pause
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <CTAPill ghost icon="external-link">
              Notion
            </CTAPill>
            <CTAPill icon="plus">Nytt prosjekt</CTAPill>
          </div>
        </div>

        <WorkspaceTabs active="prosjekter" />

        {/* Filter-strip */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          <FilterChip label="Alle" count={counts.alle} active={filter === "alle"} href="?filter=alle" />
          <FilterChip label="Aktive" count={counts.aktive} active={filter === "aktive"} href="?filter=aktive" />
          <FilterChip label="Pause" count={counts.pause} active={filter === "pause"} href="?filter=pause" />
          <FilterChip label="Arkivert" count={counts.arkiv} active={filter === "arkiv"} href="?filter=arkiv" />
          <span style={{ width: 1, height: 18, background: T.border, margin: "0 4px" }} />
          <FilterChip label="Selskap" />
          <FilterChip label="Eier · Meg" />
          <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, borderRadius: 8, border: `1px solid ${T.border}`, background: T.panel2, padding: "5px 10px" }}>
            <Icon name="search" size={13} style={{ color: T.mut }} />
            <input
              type="search"
              placeholder="Søk prosjekt …"
              style={{ width: 160, background: "transparent", border: "none", outline: "none", fontFamily: T.ui, fontSize: 12, color: T.fg }}
            />
          </label>
        </div>

        {/* Grid */}
        {projects.length === 0 ? (
          <Kort>
            <TomTilstand icon="external-link" title="Ingen prosjekter ennå" sub="Koble til Notion for å synke prosjekter automatisk, eller opprett et prosjekt manuelt." />
            <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
              <CTAPill icon="plus">Nytt prosjekt</CTAPill>
            </div>
          </Kort>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: T.gap }}>
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
            <NewProjectCard />
          </div>
        )}
      </div>
    </V2Shell>
  );
}

function FilterChip({ label, count, active = false, href }: { label: string; count?: number; active?: boolean; href?: string }) {
  const content = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 9999,
        border: `1px solid ${active ? "transparent" : T.border}`,
        background: active ? T.lime : T.panel2,
        color: active ? T.onLime : T.mut,
        padding: "5px 12px",
        fontFamily: T.mono,
        fontSize: 10.5,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {label}
      {typeof count === "number" && (
        <span style={{ borderRadius: 9999, padding: "1px 6px", background: active ? "color-mix(in srgb, black 15%, transparent)" : T.panel3 }}>
          {count}
        </span>
      )}
    </span>
  );
  return href ? (
    <Link href={href} style={{ textDecoration: "none" }}>
      {content}
    </Link>
  ) : (
    <button type="button" style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
      {content}
    </button>
  );
}

function ProjectCard({ project: p }: { project: SampleProject }) {
  const barClass = getCompanyBar(p.company);

  return (
    <Kort pad="0" hover style={{ overflow: "hidden" }}>
      <div className={`h-[5px] ${barClass}`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut }}>
            {COMPANY_LABEL[p.company]}
            <span style={{ color: T.border }}>·</span>
            <StatusPill tone={p.status === "AKTIV" ? "up" : p.status === "PAUSE" ? "warn" : "info"}>{p.status}</StatusPill>
          </span>
          <VisibilityIcon kind={p.vis} />
        </div>

        <div>
          <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.fg, lineHeight: 1.3 }}>{p.title}</div>
          <p
            style={{
              fontFamily: T.ui,
              fontSize: 12,
              color: T.mut,
              lineHeight: 1.5,
              marginTop: 6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {p.desc}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4" style={{ gap: 8, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", color: T.mut }}>
          <div>
            <strong style={{ display: "block", fontSize: 14, fontWeight: 700, color: T.fg }}>{p.open}</strong>
            open
          </div>
          <div>
            <strong style={{ display: "block", fontSize: 14, fontWeight: 700, color: T.fg }}>{p.doing}</strong>
            doing
          </div>
          <div>
            <strong style={{ display: "block", fontSize: 14, fontWeight: 700, color: T.up }}>{p.done}</strong>
            done
          </div>
          <div>
            <strong style={{ display: "block", fontSize: 14, fontWeight: 700, color: T.mut }}>{p.total}</strong>
            total
          </div>
        </div>

        {/* Fremdrift */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontFamily: T.mono, fontSize: 9.5, textTransform: "uppercase", color: T.mut }}>Fremdrift</span>
            <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg }}>{p.pct}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 9999, width: `${p.pct}%`, background: T.lime }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
          {p.assigned.length > 0 ? (
            <AvatarStack items={p.assigned.map((k) => ({ name: SAMPLE_PEOPLE[k]?.name ?? k, initials: SAMPLE_PEOPLE[k]?.initials ?? k }))} size={22} />
          ) : (
            <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", color: T.mut, opacity: 0.6 }}>Ikke tildelt</span>
          )}
          <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", color: T.mut }}>{p.due}</span>
          <Icon name="arrow-right" size={12} style={{ color: T.mut }} />
        </div>
      </div>
    </Kort>
  );
}

function NewProjectCard() {
  return (
    <button
      type="button"
      style={{
        display: "flex",
        minHeight: 240,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        borderRadius: T.rCard,
        border: `1.5px dashed ${T.border}`,
        background: T.panel2,
        padding: 24,
        color: T.mut,
        cursor: "pointer",
      }}
    >
      <span style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel }}>
        <Icon name="plus" size={16} style={{ color: T.mut }} />
      </span>
      <div style={{ fontFamily: T.disp, fontSize: 13.5, fontWeight: 700, color: T.fg }}>Nytt prosjekt</div>
      <div style={{ fontFamily: T.mono, fontSize: 10, textAlign: "center", textTransform: "uppercase", color: T.mut, lineHeight: 1.6 }}>
        Sync med Notion eller
        <br />
        opprett manuelt
      </div>
    </button>
  );
}
