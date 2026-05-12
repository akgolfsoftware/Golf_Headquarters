import Link from "next/link";
import { ArrowLeft, Key } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
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

  const aktive = keys.filter((k) => !k.revokedAt).length;

  return (
    <div className="space-y-8">
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Innstillinger
      </Link>

      <PageHeader
        eyebrow="CoachHQ · Innstillinger · API"
        titleLead="Tredjeparts"
        titleItalic="tilgang"
        sub={
          keys.length > 0
            ? `${aktive} aktiv${aktive === 1 ? "" : "e"} nøkk${aktive === 1 ? "el" : "ler"} · ${keys.length} totalt`
            : "Generer API-nøkler for eksterne verktøy."
        }
        actions={<CreateApiKeyModal />}
      />

      {keys.length === 0 ? (
        <EmptyState
          icon={Key}
          titleItalic="Ingen"
          titleTrail="API-nøkler ennå"
          sub="Generer en nøkkel for å la et eksternt verktøy lese eller skrive data fra CoachHQ."
        />
      ) : (
        <ul className="space-y-3">
          {keys.map((k) => {
            const erRevokert = k.revokedAt != null;
            return (
              <li
                key={k.id}
                className={`rounded-lg border border-border bg-card p-6 ${
                  erRevokert ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {k.name}
                      </h3>
                      {erRevokert && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-destructive">
                          Revokert
                        </span>
                      )}
                    </div>
                    <code className="mt-2 inline-block rounded-sm bg-secondary px-2 py-1 font-mono text-xs text-muted-foreground">
                      {k.prefix}…
                    </code>
                    {user.role === "ADMIN" && (
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        Eier: {k.user.name}
                      </p>
                    )}
                  </div>
                  {!erRevokert && <RevokeButton keyId={k.id} />}
                </div>

                {Array.isArray(k.scopes) && (k.scopes as string[]).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(k.scopes as string[]).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <span>
                    Opprettet:{" "}
                    {k.createdAt.toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  {k.lastUsedAt && (
                    <span>
                      Sist brukt:{" "}
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
