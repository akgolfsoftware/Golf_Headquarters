import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "./service-form";

export default async function ServicesAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const services = await prisma.serviceType.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Tjenester
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Service</em>-typer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {services.length} tjenester — {services.filter((s) => s.active).length} aktive.
          </p>
        </div>
        <ServiceForm triggerLabel="+ Ny tjeneste" />
      </header>

      {services.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen tjenester definert. Klikk «+ Ny tjeneste» for å starte.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <Th>Navn</Th>
                <Th>Beskrivelse</Th>
                <Th className="text-right">Varighet</Th>
                <Th className="text-right">Pris</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                >
                  <Td>
                    <span className="font-medium text-foreground">{s.name}</span>
                  </Td>
                  <Td>
                    <span className="text-muted-foreground">
                      {s.description ?? "—"}
                    </span>
                  </Td>
                  <Td className="text-right tabular-nums">{s.durationMin} min</Td>
                  <Td className="text-right tabular-nums">
                    {(s.priceOre / 100).toFixed(0)} kr
                  </Td>
                  <Td>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                        s.active
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <ServiceForm
                      initial={{
                        id: s.id,
                        name: s.name,
                        description: s.description,
                        priceOre: s.priceOre,
                        durationMin: s.durationMin,
                        active: s.active,
                      }}
                      triggerLabel="Endre"
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children = null, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
