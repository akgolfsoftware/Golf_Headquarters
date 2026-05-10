import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { CreateApiKeyModal } from "./create-key-modal";
import { RevokeButton } from "./revoke-button";

export default async function ApiKeysAdmin() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const keys = await prisma.apiKey.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    include: {
      user: { select: { name: true } },
    },
    orderBy: [{ revokedAt: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Innstillinger
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            API-nøkler
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Tredjeparts</em>-tilgang
          </h1>
        </div>
        <CreateApiKeyModal />
      </header>

      {keys.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen API-nøkler. Klikk &quot;Ny API-nøkkel&quot; for å opprette.
        </div>
      ) : (
        <ul className="space-y-3">
          {keys.map((k) => {
            const erRevokert = k.revokedAt != null;
            return (
              <li
                key={k.id}
                className={`rounded-lg border bg-card p-5 ${
                  erRevokert ? "border-border opacity-60" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {k.name}
                      </h3>
                      {erRevokert && (
                        <span className="rounded-full bg-destructive/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-destructive">
                          Revokert
                        </span>
                      )}
                    </div>
                    <code className="mt-2 inline-block rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                      {k.prefix}…
                    </code>
                    {user.role === "ADMIN" && (
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                        {k.user.name}
                      </p>
                    )}
                  </div>
                  {!erRevokert && <RevokeButton keyId={k.id} />}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Array.isArray(k.scopes) &&
                    (k.scopes as string[]).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                </div>

                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Opprettet:{" "}
                  {k.createdAt.toLocaleDateString("nb-NO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  {k.lastUsedAt && (
                    <span className="ml-3">
                      Brukt:{" "}
                      {k.lastUsedAt.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
