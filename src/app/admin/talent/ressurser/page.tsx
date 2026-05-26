/**
 * /admin/talent/ressurser — K4 Ressurs-bibliotek
 *
 * Filter-chips for kategori (video/artikkel/podcast), nivå (U10..Senior),
 * fokus (teknikk/mental/...). Grid med ressurs-kort.
 * Admin kan legge til nye ressurser via server action.
 *
 * Roller: COACH, ADMIN (alle leser; kun ADMIN kan legge til).
 */

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  FileText,
  Headphones,
  Plus,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { leggTilRessurs } from "./actions";

const KATEGORIER = ["video", "artikkel", "podcast"] as const;
type Kategori = (typeof KATEGORIER)[number];
const NIVAER = ["U10", "U12", "U14", "U16", "U18", "Senior"] as const;
const FOKUS = ["teknikk", "mental", "taktikk", "fysisk", "motivasjon"] as const;

const KAT_IKON: Record<Kategori, LucideIcon> = {
  video: Video,
  artikkel: FileText,
  podcast: Headphones,
};

type Search = Promise<{ kategori?: string; niva?: string; fokus?: string }>;

export default async function TalentRessurser({
  searchParams,
}: {
  searchParams: Search;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const isAdmin = user.role === "ADMIN";

  const sp = await searchParams;
  const valgtKategori = (KATEGORIER as readonly string[]).includes(sp.kategori ?? "")
    ? (sp.kategori as Kategori)
    : null;
  const valgtNiva = (NIVAER as readonly string[]).includes(sp.niva ?? "")
    ? sp.niva!
    : null;
  const valgtFokus = (FOKUS as readonly string[]).includes(sp.fokus ?? "")
    ? sp.fokus!
    : null;

  const ressurser = await prisma.talentRessurs.findMany({
    where: {
      ...(valgtKategori ? { kategori: valgtKategori } : {}),
      ...(valgtNiva ? { niva: valgtNiva } : {}),
      ...(valgtFokus ? { fokus: valgtFokus } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  function chipHref(opts: { kategori?: string; niva?: string; fokus?: string }) {
    const params = new URLSearchParams();
    const k = opts.kategori ?? valgtKategori;
    const n = opts.niva ?? valgtNiva;
    const f = opts.fokus ?? valgtFokus;
    if (k) params.set("kategori", k);
    if (n) params.set("niva", n);
    if (f) params.set("fokus", f);
    const q = params.toString();
    return `/admin/talent/ressurser${q ? `?${q}` : ""}`;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Talent · Ressurser"
        titleItalic="Ressurs"
        titleTrail="bibliotek"
        sub={`${ressurser.length} ressurser tilgjengelig — video, artikler og podcasts for talent-utvikling.`}
        actions={
          <Link
            href="/admin/talent"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Tilbake
          </Link>
        }
      />

      {/* Filter-chips */}
      <section className="space-y-3 rounded-lg border border-border bg-card p-6">
        <FilterRow label="Kategori">
          <ChipLink
            href={chipHref({ kategori: "" })}
            active={!valgtKategori}
          >
            Alle
          </ChipLink>
          {KATEGORIER.map((k) => (
            <ChipLink
              key={k}
              href={chipHref({ kategori: k })}
              active={valgtKategori === k}
            >
              {k}
            </ChipLink>
          ))}
        </FilterRow>
        <FilterRow label="Nivå">
          <ChipLink href={chipHref({ niva: "" })} active={!valgtNiva}>
            Alle
          </ChipLink>
          {NIVAER.map((n) => (
            <ChipLink
              key={n}
              href={chipHref({ niva: n })}
              active={valgtNiva === n}
            >
              {n}
            </ChipLink>
          ))}
        </FilterRow>
        <FilterRow label="Fokus">
          <ChipLink href={chipHref({ fokus: "" })} active={!valgtFokus}>
            Alle
          </ChipLink>
          {FOKUS.map((f) => (
            <ChipLink
              key={f}
              href={chipHref({ fokus: f })}
              active={valgtFokus === f}
            >
              {f}
            </ChipLink>
          ))}
        </FilterRow>
      </section>

      {/* Admin: legg til */}
      {isAdmin && (
        <section className="rounded-lg border border-primary/40 bg-card p-6">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <Plus className="h-3 w-3" strokeWidth={1.5} />
            Legg til ressurs (admin)
          </div>
          <form
            action={leggTilRessurs}
            className="grid gap-3 sm:grid-cols-2"
          >
            <input
              type="text"
              name="tittel"
              placeholder="Tittel"
              required
              minLength={2}
              maxLength={200}
              className="rounded-md border border-input bg-background px-3 py-2 text-[13px] focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
            />
            <input
              type="url"
              name="url"
              placeholder="https://…"
              required
              className="rounded-md border border-input bg-background px-3 py-2 text-[13px] focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
            />
            <select
              name="kategori"
              required
              defaultValue="video"
              className="rounded-md border border-input bg-background px-3 py-2 text-[13px] focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
            >
              {KATEGORIER.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <select
              name="niva"
              defaultValue=""
              className="rounded-md border border-input bg-background px-3 py-2 text-[13px] focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Nivå (valgfri)</option>
              {NIVAER.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <select
              name="fokus"
              defaultValue=""
              className="rounded-md border border-input bg-background px-3 py-2 text-[13px] focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Fokus (valgfri)</option>
              {FOKUS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="beskrivelse"
              placeholder="Beskrivelse (valgfri)"
              maxLength={1000}
              className="rounded-md border border-input bg-background px-3 py-2 text-[13px] focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30 sm:col-span-2"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:col-span-2 sm:justify-self-start"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Lagre ressurs
            </button>
          </form>
        </section>
      )}

      {/* Grid */}
      {ressurser.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          titleItalic="Ingen ressurser"
          titleTrail="matcher filter"
          sub={
            valgtKategori || valgtNiva || valgtFokus
              ? "Prøv å nullstille noen av filterne."
              : "Legg til første ressurs for å komme i gang."
          }
        />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ressurser.map((r) => {
            const Ikon = KAT_IKON[r.kategori as Kategori] ?? FileText;
            return (
              <article
                key={r.id}
                className="flex flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.10em] text-primary-foreground">
                    <Ikon className="h-3 w-3" strokeWidth={1.5} />
                    {r.kategori}
                  </span>
                  {r.niva && (
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium">
                      {r.niva}
                    </span>
                  )}
                  {r.fokus && (
                    <span className="inline-flex items-center rounded-full bg-accent/30 px-2.5 py-1 text-[10px] font-medium">
                      {r.fokus}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-[18px] font-semibold leading-tight">
                  {r.tittel}
                </h3>
                {r.beskrivelse && (
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                    {r.beskrivelse}
                  </p>
                )}
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-secondary px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Åpne
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                </a>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 min-w-[64px] font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function ChipLink({
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
      className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:bg-secondary"}`}
    >
      {children}
    </Link>
  );
}
