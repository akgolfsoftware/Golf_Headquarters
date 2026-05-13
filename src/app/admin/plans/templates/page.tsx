import Link from "next/link";
import { ArrowLeft, LayoutTemplate, Plus, Search, Star, Users } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
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

// Bevisst dekorativ palett — 8 gradient-varianter for stabil mal-identitet i kort-grid.
// TODO: konsolider farge — vurder å eksponere som --color-template-gradient-N tokens.
const GRADIENTS = [
  "linear-gradient(135deg, #005840 0%, #006B4F 100%)",
  "linear-gradient(135deg, #2D7A5C 0%, #4A9670 100%)",
  "linear-gradient(135deg, #B8852A 0%, #D4A04A 100%)",
  "linear-gradient(135deg, #16A34A 0%, #4FB872 100%)",
  "linear-gradient(135deg, #29261B 0%, #5E5C57 100%)",
  "linear-gradient(135deg, #006B4F 0%, #D1F843 100%)",
  "linear-gradient(135deg, #DC2626 0%, #F87171 100%)",
  "linear-gradient(135deg, #4A2D6A 0%, #7A5BAA 100%)",
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

export default async function PlanTemplates() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const templates = await prisma.planTemplate.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

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
              Kategori
            </span>
            <Chip active>
              Alle{" "}
              <span className="ml-2 opacity-60 tabular-nums">
                {templates.length}
              </span>
            </Chip>
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
              const payload = readPayload(t.payload);
              const pyr = payload.pyr ?? DEFAULT_PYR;
              const { lead, rest } = splitTitle(t.name);
              const gradient = GRADIENTS[i % GRADIENTS.length];
              const featured = i === 0;
              const category = payload.category ?? "Mal";
              const oktCount = payload.oktCount ?? t.weeks * 3;
              const faseCount = payload.faseCount ?? Math.max(1, Math.round(t.weeks / 3));
              const level = payload.level ?? "Alle";
              const rating = payload.rating ?? "—";
              const usedCount = payload.usedCount ?? 0;

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
                        {t.weeks} ukers periodisering
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
                          {t.weeks} u
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

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-border bg-background px-6 py-2">
                    <div className="flex gap-4 text-[11px] font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Users className="h-4 w-4" strokeWidth={1.5} />
                        <b className="font-mono font-semibold text-foreground">
                          {usedCount}
                        </b>
                        brukt
                      </span>
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

function Chip({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={!active}
      title={active ? undefined : "Filter kommer i v2"}
      className={`inline-flex items-center rounded-full border px-4 py-2 text-[12px] font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "cursor-not-allowed border-border bg-card text-muted-foreground opacity-60"
      }`}
    >
      {children}
    </button>
  );
}
