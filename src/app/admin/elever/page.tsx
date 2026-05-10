import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

type Search = { tier?: string; q?: string };

export default async function ElverListe({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;

  const where: {
    role: "PLAYER";
    tier?: "GRATIS" | "PRO" | "ELITE";
    OR?: { name?: { contains: string; mode: "insensitive" }; email?: { contains: string; mode: "insensitive" } }[];
  } = { role: "PLAYER" };

  if (params.tier === "GRATIS" || params.tier === "PRO") where.tier = params.tier;
  if (params.q) {
    const q = params.q;
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const players = await prisma.user.findMany({
    where,
    include: {
      _count: {
        select: {
          rounds: true,
          testResults: true,
          trainingPlans: { where: { isActive: true } },
        },
      },
    },
    orderBy: { name: "asc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Spillere
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Elever</em>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {players.length} spillere registrert.
          </p>
        </div>
      </header>

      <form className="flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[200px]">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Søk
          </span>
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Navn eller e-post"
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </label>
        <label>
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Tier
          </span>
          <select
            name="tier"
            defaultValue={params.tier ?? ""}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm"
          >
            <option value="">Alle</option>
            <option value="GRATIS">Gratis</option>
            <option value="PRO">Pro</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Filtrer
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left">
            <tr>
              <Th>Navn</Th>
              <Th>HCP</Th>
              <Th>Tier</Th>
              <Th className="text-right">Runder</Th>
              <Th className="text-right">Tester</Th>
              <Th className="text-right">Plan</Th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border/60 last:border-0 hover:bg-muted/30"
              >
                <Td>
                  <Link
                    href={`/admin/elever/${p.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {p.email}
                  </div>
                </Td>
                <Td className="tabular-nums">
                  {p.hcp != null ? p.hcp.toFixed(1).replace(".", ",") : "—"}
                </Td>
                <Td>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                      p.tier === "PRO"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.tier}
                  </span>
                </Td>
                <Td className="text-right tabular-nums">{p._count.rounds}</Td>
                <Td className="text-right tabular-nums">{p._count.testResults}</Td>
                <Td className="text-right tabular-nums">{p._count.trainingPlans}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 text-foreground ${className}`}>{children}</td>;
}
