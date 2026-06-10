/**
 * AgencyOS — Forespørsler (INNBOKS · FORESPØRSLER)
 *
 * Port av fasit `agencyos-app/flows.jsx` → RequestsScreen (mørkt, desktop).
 * Datakilde: SessionRequest (booking-ønsker fra spillere via /portal/onskeligokt).
 * Bevisst avvik fra fasit: alle rader er «Booking»-type — meldinger/råd bor i
 * /admin/innboks (egen flate). Godta/Avvis bruker eksisterende server-actions.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgAvatar, AgChip, AgPage, AgPageHead, AgTypeChip } from "@/components/admin/agencyos/ui";
import { ForespørselActions } from "./forespørsel-actions";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function nårTekst(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const dager = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (dager === 0)
    return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  if (dager === 1) return "i går";
  return `${dager} dg`;
}

export default async function ForespørslerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const dagStart = new Date();
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagSlutt.getDate() + 1);

  const [requests, dagensBookinger] = await Promise.all([
    prisma.sessionRequest.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        user: { select: { id: true, name: true, hcp: true, homeClub: true } },
      },
    }),
    prisma.booking.findMany({
      where: { startAt: { gte: dagStart, lt: dagSlutt }, userId: { not: null } },
      select: { userId: true },
    }),
  ]);
  // Fasit-tonen: spillere med økt i dag får lime avatar.
  const harØktIdag = new Set(dagensBookinger.map((b) => b.userId));

  const open = requests.filter((r) => r.status === "PENDING").length;

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Innboks · Forespørsler"
        title={`${open} ${open === 1 ? "forespørsel" : "forespørsler"}`}
        italic="å svare på."
        lead="Booking-ønsker, meldinger og råd fra stallen. Svar eller deleger."
      />
      <div className="max-w-[820px] rounded-xl border border-border bg-card px-[18px] py-[2px]">
        {requests.length === 0 && (
          <div className="px-1 py-10 text-center text-sm text-muted-foreground">
            Ingen forespørsler — innboksen er tom.
          </div>
        )}
        {requests.map((r, i) => {
          const erÅpen = r.status === "PENDING";
          return (
            <div
              key={r.id}
              className={`grid grid-cols-[36px_1fr_auto] items-center gap-[14px] py-[13px] ${
                i ? "border-t border-border" : ""
              } ${erÅpen ? "" : "opacity-50"}`}
            >
              <AgAvatar initials={initials(r.user.name)} size={36} tone={harØktIdag.has(r.user.id) ? "lime" : "neu"} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{r.user.name}</span>
                  <AgTypeChip type="req" size="row">Booking</AgTypeChip>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {nårTekst(r.createdAt)}
                  </span>
                </div>
                <div className="mt-[3px] truncate text-[13px] text-muted-foreground">
                  {r.reason || "Ønsker økt — ingen begrunnelse oppgitt."}
                </div>
              </div>
              {erÅpen ? (
                <ForespørselActions requestId={r.id} />
              ) : (
                <AgChip tone="ok">Behandlet</AgChip>
              )}
            </div>
          );
        })}
      </div>
    </AgPage>
  );
}
