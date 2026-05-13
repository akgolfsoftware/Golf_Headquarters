/**
 * /admin/talent — CoachHQ Talent · Mine spillere
 *
 * Designet hentet fra src/app/talent-mine-spillere-demo/page.tsx.
 * Henter alle PLAYER-brukere fra Prisma, fordeler i A1–A5 basert på HCP,
 * og viser dem som rader med form/percentil/snitt + attention-pill.
 *
 * Drawer på høyre side viser detaljer for første spiller med attention
 * (eller første spiller hvis ingen har attention). 360-profil-data
 * (radar, agent-forslag, mini-stats) er foreløpig placeholder — kobles
 * mot StatsCache + AgentSuggestion i en senere sprint.
 *
 * Roller: COACH, ADMIN.
 */

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  ChevronRight,
  Plus,
  Search,
  Sparkles,
  StickyNote,
  TrendingUp,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

// AK Golf A-K-kategorier basert på HCP
function bestemKategori(
  hcp: number | null,
): "A1" | "A2" | "A3" | "A4" | "A5" | "—" {
  if (hcp == null) return "—";
  if (hcp <= 4) return "A1"; // Elite
  if (hcp <= 12) return "A2"; // Topp
  if (hcp <= 20) return "A3"; // Konkurranse
  if (hcp <= 30) return "A4"; // Trening
  return "A5"; // Mosjon
}

const KATEGORI_LABEL: Record<"A1" | "A2" | "A3" | "A4" | "A5", string> = {
  A1: "Elite",
  A2: "Topp",
  A3: "Konkurranse",
  A4: "Trening",
  A5: "Mosjon",
};

const KATEGORI_HCP: Record<"A1" | "A2" | "A3" | "A4" | "A5", string> = {
  A1: "HCP ≤ 4",
  A2: "HCP 5–12",
  A3: "HCP 13–20",
  A4: "HCP 21–30",
  A5: "HCP 30+",
};

type AttentionTone = "danger" | "warning" | "success" | "muted";

const SORT_OPTIONS: Array<{ label: string; active?: boolean }> = [
  { label: "Trenger oppmerksomhet", active: true },
  { label: "Form" },
  { label: "Improvement" },
  { label: "ABC" },
];

// TODO: bytt placeholder med ekte frister fra Booking/Event når dataene finnes
const FRIST_PLACEHOLDER: Array<{
  date: string;
  weekday: string;
  label: string;
  sub: string;
  urgent?: boolean;
}> = [
  {
    date: "14",
    weekday: "tirs",
    label: "Fysisk-test",
    sub: "GFGK · gruppe A",
    urgent: true,
  },
  { date: "16", weekday: "tors", label: "Range-økt", sub: "Elite · 09:00" },
  {
    date: "21",
    weekday: "tirs",
    label: "TrackMan-test",
    sub: "A2-kandidater",
  },
  {
    date: "24",
    weekday: "fred",
    label: "Fysisk-test",
    sub: "Mulligan · gruppe B",
  },
  { date: "28", weekday: "tirs", label: "Nordic Tour Q1", sub: "Runde 1" },
  {
    date: "04",
    weekday: "tirs",
    label: "Test-evaluering",
    sub: "Q2 oppsummering",
  },
  { date: "11", weekday: "tirs", label: "Foreldremøte", sub: "WANG · 18:00" },
];

function initialer(name: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export default async function Talent() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const players = await prisma.user.findMany({
    where: { role: "PLAYER" },
    select: {
      id: true,
      name: true,
      hcp: true,
      tier: true,
      playingYears: true,
      ambition: true,
    },
    orderBy: { hcp: "asc" },
  });

  // Bygg utvidede spiller-rader. Form/percentil/snitt er placeholder
  // til StatsCache-pipelinen er på plass — vi bruker HCP-bånd som proxy.
  type Rad = {
    id: string;
    name: string;
    initials: string;
    hcp: number | null;
    kat: "A1" | "A2" | "A3" | "A4" | "A5" | "—";
    klubb: string;
    age: number | null;
    attention: { text: string; tone: AttentionTone } | null;
  };

  const rader: Rad[] = players.map((p) => {
    const kat = bestemKategori(p.hcp);
    // Lett heuristikk for attention basert på ambition + hcp
    let attention: { text: string; tone: AttentionTone } | null = null;
    if (p.hcp == null) {
      attention = { text: "Mangler HCP-registrering", tone: "warning" };
    } else if (kat === "A1" && p.ambition) {
      attention = { text: "Elite · review nødvendig", tone: "warning" };
    }
    return {
      id: p.id,
      name: p.name ?? "Uten navn",
      initials: initialer(p.name),
      hcp: p.hcp,
      kat,
      klubb: "—", // TODO: koble mot Player.club / Membership
      age: null, // TODO: koble mot fødselsdato
      attention,
    };
  });

  const attentionRader = rader.filter((r) => r.attention);
  const oppmerksomhet = attentionRader.length;
  const totalt = rader.filter((r) => r.kat !== "—").length;

  const valgt = attentionRader[0] ?? rader[0] ?? null;

  // Gruppefordeling for sammendrag
  const kategoriTeller: Record<"A1" | "A2" | "A3" | "A4" | "A5", number> = {
    A1: 0,
    A2: 0,
    A3: 0,
    A4: 0,
    A5: 0,
  };
  for (const r of rader) {
    if (r.kat !== "—") kategoriTeller[r.kat] += 1;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Daglig workspace · Talent · Mine spillere"
        titleItalic="Mine"
        titleTrail="spillere"
        sub={`${totalt} spillere fordelt på A1–A5 basert på HCP (AK Golf-standard).`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
              <Search className="h-4 w-4" strokeWidth={1.5} />
              <span>Søk spiller</span>
            </div>
            <Link
              href="/admin/elever/ny"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Ny spiller
            </Link>
          </div>
        }
      />

      {/* ActionStrip */}
      {oppmerksomhet > 0 && (
        <div className="flex items-center gap-4 rounded-lg border border-primary/40 bg-primary px-6 py-4 text-[13px] text-primary-foreground">
          <AlertTriangle
            className="h-5 w-5 shrink-0 text-accent"
            strokeWidth={1.5}
          />
          <p className="leading-snug">
            <b className="font-semibold">
              {oppmerksomhet} {oppmerksomhet === 1 ? "spiller trenger" : "spillere trenger"}{" "}
              oppmerksomhet i dag
            </b>{" "}
            <span className="opacity-80">
              · gjennomgå listen under og åpne første kandidat
            </span>
          </p>
          {valgt && (
            <Link
              href={`/admin/elever/${valgt.id}`}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[12px] font-semibold text-accent-foreground"
            >
              Åpne første
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          )}
        </div>
      )}

      {/* Kategori-stripe */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {(["A1", "A2", "A3", "A4", "A5"] as const).map((kat) => {
          const isElite = kat === "A1";
          return (
            <div
              key={kat}
              className={`rounded-lg border p-6 ${
                isElite ? "border-primary/40 bg-card shadow-sm" : "border-border bg-card"
              }`}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {kat} · {KATEGORI_LABEL[kat]}
              </div>
              <div
                className={`mt-2 font-mono text-[28px] font-semibold leading-none tabular-nums ${
                  isElite ? "text-primary" : ""
                }`}
              >
                {kategoriTeller[kat]}
              </div>
              <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                {KATEGORI_HCP[kat]}
              </div>
            </div>
          );
        })}
      </section>

      {/* Frist-stripe */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <Calendar className="mr-1 inline h-3 w-3" strokeWidth={1.5} />
            Kommende frister · 8 uker
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            mai – juni 2026
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {FRIST_PLACEHOLDER.map((f) => (
            <div
              key={f.date + f.label}
              className={`rounded-lg border bg-card p-3 transition-colors hover:border-primary/40 ${
                f.urgent ? "border-accent" : "border-border"
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[24px] font-semibold tabular-nums leading-none">
                  {f.date}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {f.weekday}
                </span>
              </div>
              <div className="mt-2 text-[12px] font-semibold leading-tight">
                {f.label}
              </div>
              <div className="mt-1 text-[11px] leading-tight text-muted-foreground">
                {f.sub}
              </div>
              {f.urgent && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-medium text-foreground">
                  haster
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {totalt === 0 ? (
        <EmptyState
          icon={TrendingUp}
          titleItalic="Ingen spillere"
          titleTrail="med HCP ennå"
          sub="Spillere må ha HCP registrert for å plasseres i kategori. Importer fra GolfBox eller registrer manuelt."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* Liste-kolonne */}
          <section>
            {/* Sortering */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Sortering
              </span>
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.label}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    o.active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
              {attentionRader.length > 0 && (
                <>
                  <div className="border-b border-border bg-secondary px-4 py-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Trenger oppmerksomhet ({attentionRader.length})
                    </span>
                  </div>
                  <ul>
                    {attentionRader.map((p) => (
                      <PlayerRow
                        key={p.id}
                        player={p}
                        selected={valgt?.id === p.id}
                      />
                    ))}
                  </ul>
                </>
              )}

              <div className="border-y border-border bg-secondary px-4 py-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Andre spillere ({rader.length - attentionRader.length})
                </span>
              </div>
              <ul>
                {rader
                  .filter((r) => !r.attention)
                  .map((p) => (
                    <PlayerRow
                      key={p.id}
                      player={p}
                      selected={valgt?.id === p.id}
                    />
                  ))}
              </ul>
            </div>
          </section>

          {/* Drawer */}
          {valgt && (
            <aside className="self-start rounded-lg border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-primary text-primary-foreground">
                  <span className="font-display text-[32px] font-semibold leading-none">
                    {valgt.initials}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Talent · {valgt.kat === "—" ? "uten kategori" : `${valgt.kat}-kandidat`}
                  </span>
                  <div className="mt-1 font-display text-[22px] font-semibold leading-tight">
                    {valgt.name}
                  </div>
                  <div className="mt-1 text-[12px] text-muted-foreground">
                    HCP {valgt.hcp?.toFixed(1).replace(".", ",") ?? "—"}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {valgt.attention && (
                      <Pill tone={valgt.attention.tone}>
                        {valgt.attention.text}
                      </Pill>
                    )}
                    {valgt.kat !== "—" && (
                      <Pill tone="info">{KATEGORI_LABEL[valgt.kat]}</Pill>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent-forslag · primary card */}
              <div className="mt-5 rounded-lg bg-primary p-4 text-primary-foreground">
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
                  <Sparkles className="h-3 w-3" strokeWidth={1.5} />
                  Agent-forslag · 90 d
                </div>
                <p className="mt-2 font-display text-[18px] italic leading-snug">
                  Approach 100–125y
                </p>
                <p className="mt-1.5 text-[12px] leading-snug opacity-80">
                  {/* TODO: kobles mot StatsCache + AgentSuggestion */}
                  Placeholder — kobles mot StatsCache for ekte SG-data per
                  distanse.
                </p>
                <Link
                  href={`/admin/plans/new?spillerId=${valgt.id}`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                >
                  Planlegg test
                  <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                </Link>
              </div>

              {/* Mini-stats — TODO: koble mot StatsCache */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniStat label="Avg runde" value="—" delta="—" tone="muted" />
                <MiniStat label="Percentil" value="—" delta="—" tone="muted" />
                <MiniStat label="SG total" value="—" delta="—" tone="muted" />
                <MiniStat label="Adherence" value="—" delta="—" tone="muted" />
              </div>

              {/* Hurtignotat */}
              <div className="mt-5">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <StickyNote className="h-3 w-3" strokeWidth={1.5} />
                  Hurtig-notat
                </div>
                <div className="mt-2 rounded-md border border-input bg-background p-3 text-[12px] text-muted-foreground">
                  Klikk for å notere observasjon fra dagens økt …
                </div>
              </div>

              <Link
                href={`/admin/elever/${valgt.id}`}
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Åpne 360-profil
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerRow({
  player,
  selected = false,
}: {
  player: {
    id: string;
    name: string;
    initials: string;
    hcp: number | null;
    kat: "A1" | "A2" | "A3" | "A4" | "A5" | "—";
    klubb: string;
    age: number | null;
    attention: { text: string; tone: AttentionTone } | null;
  };
  selected?: boolean;
}) {
  return (
    <li
      className={`grid grid-cols-[48px_minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-border px-4 py-3 last:border-b-0 ${
        selected ? "bg-primary/5" : "hover:bg-secondary/40"
      }`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-foreground">
        <span className="font-display text-[16px] font-semibold leading-none">
          {player.initials}
        </span>
      </div>
      <Link
        href={`/admin/elever/${player.id}`}
        className="min-w-0 hover:text-primary"
      >
        <div className="text-[13px] font-semibold leading-tight">
          {player.name}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          {player.kat !== "—" ? `${player.kat} · ` : ""}HCP{" "}
          {player.hcp?.toFixed(1).replace(".", ",") ?? "—"}
        </div>
      </Link>
      {player.attention ? (
        <Pill tone={player.attention.tone}>{player.attention.text}</Pill>
      ) : (
        <span />
      )}
      <ChevronRight
        className="h-4 w-4 text-muted-foreground"
        strokeWidth={1.5}
      />
    </li>
  );
}

function Pill({
  tone = "muted",
  children,
}: {
  tone?: AttentionTone | "info";
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    danger: "bg-destructive/15 text-destructive",
    warning: "bg-accent/30 text-foreground",
    success: "bg-primary/10 text-primary",
    muted: "bg-secondary text-muted-foreground",
    info: "bg-primary/10 text-primary",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function MiniStat({
  label,
  value,
  delta,
  tone = "success",
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "success" | "muted";
}) {
  const deltaCls =
    tone === "success" ? "text-primary" : "text-muted-foreground";
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 font-mono text-[18px] font-semibold tabular-nums leading-none">
        {value}
      </div>
      <div className={`mt-1.5 font-mono text-[10px] font-medium ${deltaCls}`}>
        {delta}
      </div>
    </div>
  );
}
