import Link from "next/link";
import {
  ArrowLeft,
  LayoutTemplate,
  Plus,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";

type PyrKey = "fys" | "tek" | "slag" | "spill" | "turn";

const PYR_COLOR: Record<PyrKey, string> = {
  fys: "var(--color-pyr-fys)",
  tek: "var(--color-pyr-tek)",
  slag: "var(--color-pyr-slag)",
  spill: "var(--color-pyr-spill)",
  turn: "var(--color-pyr-turn)",
};

const DEFAULT_PYR: { key: PyrKey; value: number }[] = [
  { key: "fys", value: 20 },
  { key: "tek", value: 30 },
  { key: "slag", value: 25 },
  { key: "spill", value: 20 },
  { key: "turn", value: 5 },
];

// 8 gradient-varianter for stabil mal-identitet i kort-grid.
// Refererer til CSS-tokens definert i src/app/globals.css (--gradient-avatar-1..8).
const GRADIENTS = [
  "var(--gradient-avatar-1)",
  "var(--gradient-avatar-2)",
  "var(--gradient-avatar-3)",
  "var(--gradient-avatar-4)",
  "var(--gradient-avatar-5)",
  "var(--gradient-avatar-6)",
  "var(--gradient-avatar-7)",
  "var(--gradient-avatar-8)",
];

type TemplatePayload = {
  category?: string;
  pyr?: { key: PyrKey; value: number }[];
  oktCount?: number;
  faseCount?: number;
  level?: string;
  rating?: string;
  usedCount?: number;
};

function readPayload(payload: unknown): TemplatePayload {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload as TemplatePayload;
  }
  return {};
}

function donutGradient(pyr: { key: PyrKey; value: number }[]): string {
  const total = pyr.reduce((sum, p) => sum + p.value, 0) || 1;
  let acc = 0;
  const stops = pyr.map((p) => {
    const start = (acc / total) * 360;
    acc += p.value;
    const end = (acc / total) * 360;
    return `${PYR_COLOR[p.key]} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function splitTitle(name: string): { lead: string; rest: string } {
  const parts = name.split(/\s+/);
  if (parts.length === 1) return { lead: name, rest: "" };
  return { lead: parts[0], rest: parts.slice(1).join(" ") };
}

type SortKey = "nyest" | "effekt" | "brukt";

export default async function PlanTemplates({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const sp = await searchParams;
  const sort: SortKey =
    sp.sort === "effekt" || sp.sort === "brukt" ? sp.sort : "nyest";

  // Sortér: effekt = effectivenessAvg DESC NULLS LAST, brukt = usageCount DESC,
  // nyest = createdAt DESC. Prisma støtter `nulls: "last"` på orderBy.
  const orderBy =
    sort === "effekt"
      ? [
          { effectivenessAvg: { sort: "desc", nulls: "last" } as const },
          { createdAt: "desc" as const },
        ]
      : sort === "brukt"
        ? [
            { usageCount: "desc" as const },
            { createdAt: "desc" as const },
          ]
        : [{ createdAt: "desc" as const }];

  const templates = await prisma.planTemplate.findMany({
    where: { approved: true },
    orderBy,
  });

  function formatDelta(v: number | null): string {
    if (v === null) return "—";
    const sign = v >= 0 ? "+" : "";
    return `${sign}${v.toFixed(2).replace(".", ",")}`;
  }

  return (
    <div className="space-y-8">
      <Link
        href="/admin/plans"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Treningsplaner
      </Link>

      <PageHeader
        eyebrow="CoachHQ · Treningsplaner · Maler"
        titleLead=""
        titleItalic="Maler"
        titleTrail="for treningsplaner"
        sub="Bruk maler som utgangspunkt for nye planer. Hver mal definerer faseinndeling, pyramide-allokasjon og økt-skjelett som tilpasses spilleren automatisk."
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          titleItalic="Ingen"
          titleTrail="maler ennå"
          sub="Maler opprettes ved å markere en eksisterende plan som mal. Da kan du kopiere strukturen til nye spillere."
        />
      ) : (
        <>
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative max-w-[360px] flex-1">
              <Search
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <input
                type="search"
                placeholder="Søk i maler …"
                className="w-full rounded-md border border-border bg-card px-4 py-2 pl-10 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <span className="px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Sorter
            </span>
            <SortChip href="?sort=nyest" active={sort === "nyest"}>
              Nyest
            </SortChip>
            <SortChip href="?sort=effekt" active={sort === "effekt"}>
              Best effekt
            </SortChip>
            <SortChip href="?sort=brukt" active={sort === "brukt"}>
              Mest brukt
            </SortChip>
            <span className="ml-auto" />
            <Link
              href="/admin/plans/templates/ny"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Ny mal fra bunn
            </Link>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t, i) => {
              const payload = readPayload(t.disciplinFordeling);
              const pyr = payload.pyr ?? DEFAULT_PYR;
              const { lead, rest } = splitTitle(t.name);
              const gradient = GRADIENTS[i % GRADIENTS.length];
              const featured = i === 0;
              const category = payload.category ?? "Mal";
              const oktCount = payload.oktCount ?? t.varighetUker * 3;
              const faseCount = payload.faseCount ?? Math.max(1, Math.round(t.varighetUker / 3));
              const level = payload.level ?? "Alle";
              const rating = payload.rating ?? "—";
              // Bruk ekte tall fra DB (PlanEffectiveness oppdaterer disse).
              // Faller tilbake til payload-verdier hvis DB ikke har noe ennå.
              const usedCount = t.usageCount || payload.usedCount || 0;
              const effekt = t.effectivenessAvg;
              const effektFarge =
                effekt === null
                  ? "text-muted-foreground"
                  : effekt > 0.05
                    ? "text-primary"
                    : effekt < -0.05
                      ? "text-destructive"
                      : "text-muted-foreground";
              const EffektIkon =
                effekt === null
                  ? null
                  : effekt >= 0
                    ? TrendingUp
                    : TrendingDown;

              return (
                <article
                  key={t.id}
                  className={`flex flex-col overflow-hidden rounded-lg bg-card transition-transform hover:-translate-y-0.5 hover:shadow-md ${
                    featured ? "border-2 border-accent" : "border border-border"
                  }`}
                >
                  {/* Thumb */}
                  <div
                    className="relative flex aspect-[16/9] flex-col justify-between overflow-hidden p-6"
                    style={{ background: gradient }}
                  >
                    <div className="z-10 flex items-start justify-between">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] ${
                          featured
                            ? "bg-accent text-accent-foreground"
                            : "bg-card/85 text-foreground backdrop-blur"
                        }`}
                      >
                        {featured && (
                          <Star className="h-3 w-3" strokeWidth={1.5} />
                        )}
                        {category}
                      </span>
                      <span className="inline-flex items-center gap-2 font-mono text-[10px] font-medium text-card/85">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-card/25 font-mono text-[9px] font-bold text-card">
                          AK
                        </span>
                        AK Performance
                      </span>
                    </div>

                    <div
                      className="absolute bottom-6 right-6 z-10 h-16 w-16 rounded-full shadow-md"
                      style={{ background: donutGradient(pyr) }}
                    >
                      <div className="absolute inset-[14px] rounded-full bg-card/90" />
                    </div>

                    <div className="z-10">
                      <div className="font-display text-[22px] font-bold leading-tight tracking-tight text-card">
                        <em className="font-medium italic">{lead}</em>
                        {rest && (
                          <>
                            <br />
                            {rest}
                          </>
                        )}
                      </div>
                      <div className="mt-2 text-[12px] font-medium leading-snug text-card/80">
                        {t.varighetUker} ukers periodisering
                      </div>
                    </div>
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.15) 100%)",
                      }}
                    />
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div className="flex flex-wrap gap-4 text-[12px] text-muted-foreground">
                      <span>
                        <b className="mr-2 font-mono font-semibold tabular-nums text-foreground">
                          {t.varighetUker} u
                        </b>
                        periode
                      </span>
                      <span>
                        <b className="mr-2 font-mono font-semibold tabular-nums text-foreground">
                          {oktCount}
                        </b>
                        økter
                      </span>
                      <span>
                        <b className="mr-2 font-mono font-semibold tabular-nums text-foreground">
                          {faseCount}
                        </b>
                        faser
                      </span>
                      <span>
                        <b className="mr-2 font-mono font-semibold text-foreground">
                          {level}
                        </b>
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-[13px] leading-[1.5] text-muted-foreground">
                        {t.description}
                      </p>
                    )}

                    <div>
                      <div className="flex h-2 gap-0.5 overflow-hidden rounded-sm bg-secondary">
                        {pyr.map((p) => (
                          <div
                            key={p.key}
                            style={{
                              width: `${p.value}%`,
                              background: PYR_COLOR[p.key],
                            }}
                          />
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 font-mono text-[11px] text-muted-foreground">
                        {pyr.map((p) => (
                          <span key={p.key}>
                            {p.key.toUpperCase()}{" "}
                            <b className="font-semibold text-foreground">
                              {p.value}%
                            </b>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Effektivitet-strip */}
                  <div className="flex items-center justify-between border-t border-border bg-background/60 px-6 py-2 text-[11px]">
                    <Link
                      href={`/admin/plans/templates/${t.id}/effectiveness`}
                      className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Users
                        className="h-3.5 w-3.5"
                        strokeWidth={1.5}
                      />
                      <span className="font-mono tabular-nums">
                        Brukt{" "}
                        <b className="font-semibold text-foreground">
                          {usedCount}
                        </b>{" "}
                        ganger
                      </span>
                    </Link>
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono tabular-nums ${effektFarge}`}
                      title={
                        effekt === null
                          ? "Ingen effekt-data ennå"
                          : "Snitt SG-Total delta etter fullført plan"
                      }
                    >
                      {EffektIkon && (
                        <EffektIkon className="h-3.5 w-3.5" strokeWidth={1.5} />
                      )}
                      Snitt-effekt{" "}
                      <b className="font-semibold">{formatDelta(effekt)}</b>
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-border bg-background px-6 py-2">
                    <div className="flex gap-4 text-[11px] font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Star className="h-4 w-4" strokeWidth={1.5} />
                        <b className="font-mono font-semibold text-foreground">
                          {rating}
                        </b>
                      </span>
                    </div>
                    <Link
                      href={`/admin/plans/new?templateId=${t.id}`}
                      className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Bruk mal
                    </Link>
                  </div>
                </article>
              );
            })}

            {/* New-card */}
            <article className="flex min-h-[380px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-card">
              <div className="px-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Plus className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 font-display text-[18px] font-semibold leading-tight">
                  Bygg egen mal
                </h3>
                <p className="text-[13px] leading-[1.5] text-muted-foreground">
                  Start fra bunn eller dupliser en eksisterende plan som mal for
                  fremtiden.
                </p>
              </div>
            </article>
          </div>
        </>
      )}
    </div>
  );
}

function SortChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full border px-4 py-2 text-[12px] font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
