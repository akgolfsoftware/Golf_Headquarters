/**
 * AgencyOS — Rediger spiller (`/admin/spillere/[id]/rediger`)
 *
 * Pixel-perfekt v2 (sesjon-1, skjerm 5).
 * 2-kol form med sticky save-bar topp + bunn. Endrings-historikk høyre.
 * Bruker Server Action `lagreSpiller`.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { lagreSpiller } from "./actions";

const NB_DT = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatHcpInput(v: number | null | undefined): string {
  if (v == null) return "";
  return v.toString().replace(".", ",");
}

function dateToYmd(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function RedigerSpiller({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const [player, history, parents] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.auditLog.findMany({
      where: { target: `user:${id}` },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        actor: { select: { name: true } },
      },
    }),
    prisma.parentRelation.findMany({
      where: { childId: id },
      include: {
        parent: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    }),
  ]);

  if (!player || player.role !== "PLAYER") notFound();

  const fornavn = player.name.split(" ")[0] ?? "";
  const etternavn = player.name.split(" ").slice(1).join(" ");

  return (
    <div className="space-y-6">
      {/* Sub-hero + sticky save-bar */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/admin/spillere/${id}`}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground hover:text-primary"
            >
              <ArrowLeft size={12} strokeWidth={2} />
              {player.name} · Rediger
            </Link>
            <h1 className="mt-1 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              Rediger{" "}
              <em className="font-display italic font-normal text-primary">
                spiller
              </em>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/spillere/${id}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Avbryt
            </Link>
            <button
              type="submit"
              form="rediger-form"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Lagre
            </button>
          </div>
        </div>
      </div>

      <form
        id="rediger-form"
        action={lagreSpiller}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]"
      >
        <input type="hidden" name="id" value={player.id} />

        {/* Venstre kol — form */}
        <div className="space-y-6">
          {/* Personalia */}
          <fieldset className="rounded-2xl border border-border bg-card p-6 sm:p-6">
            <legend className="px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Personalia
            </legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Fornavn" name="fornavn" defaultValue={fornavn} required />
              <Field label="Etternavn" name="etternavn" defaultValue={etternavn} />
              <Field
                label="Fødselsdato"
                name="fodselsdato"
                type="date"
                defaultValue={dateToYmd(player.dateOfBirth)}
              />
              <Field label="Telefon" name="telefon" defaultValue={player.phone ?? ""} />
              <Field label="E-post" name="email" type="email" defaultValue={player.email} required />
              <Field label="Hjemmeklubb" name="hjemmeklubb" defaultValue={player.homeClub ?? ""} />
              <Field label="Skole / VGS" name="skole" defaultValue={player.school ?? ""} />
              <Field
                label="HCP"
                name="hcp"
                defaultValue={formatHcpInput(player.hcp)}
                hint="Bruk komma · f.eks 4,8 eller +0,5"
              />
            </div>
          </fieldset>

          {/* Coaching */}
          <fieldset className="rounded-2xl border border-border bg-card p-6 sm:p-6">
            <legend className="px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Coaching
            </legend>
            <div className="grid grid-cols-1 gap-4">
              <Field
                label="Ambisjon"
                name="ambisjon"
                defaultValue={player.ambition ?? ""}
                hint="Hva spilleren jobber mot — vises i hero"
              />
              <FieldArea
                label="Interne notater"
                name="notater"
                defaultValue=""
                hint="Kun coach ser dette"
              />
            </div>
          </fieldset>

          {/* Forelder quick-edit */}
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Foresatte
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {parents.length}
              </span>
            </div>
            {parents.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                Ingen foresatte registrert.
              </p>
            ) : (
              <ul className="space-y-2">
                {parents.map((pr) => (
                  <li
                    key={pr.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background p-4"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {pr.parent.name}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                        {pr.relationship}
                      </div>
                    </div>
                    <Link
                      href={`/admin/spillere/${id}/profil`}
                      className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary hover:underline"
                    >
                      Rediger →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Høyre kol — endrings-historikk (sticky) */}
        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-6">
            <div className="mb-2 flex items-baseline justify-between">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Endrings-historikk
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {history.length}
              </span>
            </div>
            {history.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-background p-4 text-xs text-muted-foreground">
                Ingen endringer ennå.
              </p>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => (
                  <li
                    key={h.id}
                    className="border-l-2 border-border pl-4"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {NB_DT.format(h.createdAt)}
                    </div>
                    <div className="mt-0.5 text-sm text-foreground">
                      {h.action}
                    </div>
                    {h.actor?.name && (
                      <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                        av {h.actor.name}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </form>

      {/* Sticky bunn-bar */}
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-transparent px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={14} strokeWidth={1.75} />
            Slett spiller
          </button>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/spillere/${id}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Avbryt
            </Link>
            <button
              type="submit"
              form="rediger-form"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Lagre endringer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Helpers ----------

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="mt-1.5 block w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-accent"
      />
      {hint && (
        <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  );
}

function FieldArea({
  label,
  name,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={4}
        className="mt-1.5 block w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-accent"
      />
      {hint && (
        <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  );
}
