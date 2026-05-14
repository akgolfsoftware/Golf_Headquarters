// Fakturaer for forelder. Viser alle betalinger knyttet til barnet,
// med markering "Betalt av X" / "Ubetalt".

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import type { PaymentStatus } from "@/generated/prisma/client";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function ore(n: number): string {
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(n / 100);
}

function statusLabel(s: PaymentStatus): { tekst: string; klasse: string } {
  if (s === "SUCCEEDED")
    return { tekst: "Betalt", klasse: "bg-primary/10 text-primary" };
  if (s === "REFUNDED" || s === "PARTIALLY_REFUNDED")
    return { tekst: "Refundert", klasse: "bg-muted text-muted-foreground" };
  if (s === "FAILED")
    return { tekst: "Feilet", klasse: "bg-destructive/10 text-destructive" };
  return { tekst: "Ubetalt", klasse: "bg-accent/30 text-accent-foreground" };
}

export default async function Fakturaer() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);
  const childIds = barn.map((b) => b.child.id);

  const payments = childIds.length
    ? await prisma.payment.findMany({
        where: { userId: { in: childIds } },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
          booking: { select: { id: true, serviceType: { select: { name: true } } } },
        },
        take: 50,
      })
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Foreldreportal · Økonomi"
        titleLead="Fakturaer"
        titleItalic="og betalinger"
        sub="Alle betalinger knyttet til barna dine."
      />

      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {payments.length} betaling{payments.length === 1 ? "" : "er"}
        </div>
        {payments.length === 0 ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            Ingen fakturaer registrert.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {payments.map((p) => {
              const st = statusLabel(p.status);
              const navn = p.user?.name ?? "Ukjent";
              const beskrivelse =
                p.description ?? p.booking?.serviceType?.name ?? p.type;
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                  <div className="space-y-1">
                    <div className="font-display text-base font-semibold">{beskrivelse}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {NB_DATO.format(p.createdAt)} ·{" "}
                      {p.status === "SUCCEEDED"
                        ? `Betalt av ${navn}`
                        : "Ubetalt"}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {ore(p.amountOre)}
                    </span>
                    <span
                      className={`rounded-full px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] ${st.klasse}`}
                    >
                      {st.tekst}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
