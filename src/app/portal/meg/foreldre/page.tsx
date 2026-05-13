// Spilleren ser og styrer hvilke foresatte som har tilgang til profilen.
// V2 Spor 3 — Foreldreportal med invitasjons-flyt.

import { Mail, Phone, UserRound, Clock } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { InviteParentButton } from "./invite-parent-modal";
import { AvbrytInvitasjonKnapp, FjernForelderKnapp } from "./action-buttons";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function relasjonLabel(r: string): string {
  const lower = r.toLowerCase();
  if (lower === "father" || lower === "far") return "Far";
  if (lower === "mother" || lower === "mor") return "Mor";
  if (lower === "guardian") return "Verge";
  return r;
}

export default async function ForeldrePage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const [parentLinks, pendingInvitations] = await Promise.all([
    prisma.parentRelation.findMany({
      where: { childId: user.id },
      include: {
        parent: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.parentInvitation.findMany({
      where: {
        playerId: user.id,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Konto · Foreldre"
        titleLead="Mine"
        titleItalic="foreldre"
        sub="Inviter foresatte til å se treningsprofilen din og betale fakturaer."
        actions={<InviteParentButton />}
      />

      {/* Koblede foreldre */}
      <section aria-labelledby="koblede-foreldre" className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2
            id="koblede-foreldre"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Koblede foreldre · {parentLinks.length}
          </h2>
        </div>

        {parentLinks.length === 0 ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            Ingen foreldre er koblet til profilen din ennå. Bruk «Inviter forelder» for å sende en invitasjon.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {parentLinks.map((rel) => (
              <li key={rel.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <UserRound className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <div className="font-display text-base font-semibold">{rel.parent.name}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {relasjonLabel(rel.relationship)} · siden {NB_DATO.format(rel.createdAt)}
                    </div>
                    <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {rel.parent.email}
                      </span>
                      {rel.parent.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {rel.parent.phone}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <FjernForelderKnapp linkId={rel.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pending invitasjoner */}
      <section aria-labelledby="pending" className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2
            id="pending"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Ventende invitasjoner · {pendingInvitations.length}
          </h2>
        </div>

        {pendingInvitations.length === 0 ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            Ingen ventende invitasjoner.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {pendingInvitations.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Mail className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    {inv.email}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {relasjonLabel(inv.relation)} · sendt {NB_DATO.format(inv.createdAt)}
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Utløper {NB_DATO.format(inv.expiresAt)}
                  </div>
                </div>
                <AvbrytInvitasjonKnapp id={inv.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
