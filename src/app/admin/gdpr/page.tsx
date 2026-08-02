/**
 * AgencyOS · GDPR-kø (/admin/gdpr) — ADMIN-only.
 *
 * Viser uløste `DataExportRequest`-krav (særlig DELETE fra foresatte, som
 * tidligere ikke hadde noen behandlingsflate). Art. 12 nr. 3: én måneds frist.
 */

import type { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { utforSletteforesporsel, avvisForesporsel } from "./actions";

export const metadata: Metadata = {
  title: "GDPR-kø · AgencyOS",
};

function dagerSiden(d: Date): number {
  return Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
}

export default async function GdprKoPage() {
  // ADMIN-only (sletting av personopplysninger er ikke coach-nivå).
  await requirePortalUser({ allow: ["ADMIN"] });

  const pending = await prisma.dataExportRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  // Slå opp navn på både den som ber og subjektet.
  const brukerIder = [
    ...new Set(
      pending.flatMap((r) => [r.userId, r.subjectUserId].filter(Boolean) as string[]),
    ),
  ];
  const brukere = await prisma.user.findMany({
    where: { id: { in: brukerIder } },
    select: { id: true, name: true, email: true },
  });
  const navnFor = (id: string | null) => {
    if (!id) return "—";
    const u = brukere.find((b) => b.id === id);
    return u ? `${u.name ?? "?"} (${u.email ?? id})` : id;
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">GDPR-kø</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Uløste innsyns- og slettekrav. Slettekrav må behandles innen én måned
        (personvernforordningen art. 12 nr. 3).
      </p>

      {pending.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Ingen uløste forespørsler. 🎉
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {pending.map((r) => {
            const alder = dagerSiden(r.createdAt);
            const forsinket = alder >= 25;
            return (
              <li
                key={r.id}
                className="rounded-lg border border-border p-4 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                    {r.type}
                  </span>
                  <span className={forsinket ? "font-semibold text-red-600" : ""}>
                    {alder} dager gammel
                  </span>
                </div>
                <dl className="mt-2 grid grid-cols-[auto,1fr] gap-x-3 gap-y-1">
                  <dt className="text-muted-foreground">Bedt av:</dt>
                  <dd>{navnFor(r.userId)}</dd>
                  <dt className="text-muted-foreground">Gjelder:</dt>
                  <dd>{navnFor(r.subjectUserId ?? r.userId)}</dd>
                </dl>

                <div className="mt-3 flex gap-3">
                  {r.type === "DELETE" && (
                    <form action={utforSletteforesporsel}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Utfør sletting (anonymiser)
                      </button>
                    </form>
                  )}
                  <form action={avvisForesporsel}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="rounded border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      Avvis
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
