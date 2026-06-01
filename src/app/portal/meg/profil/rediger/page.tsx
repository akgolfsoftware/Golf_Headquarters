/**
 * PlayerHQ · Meg · Rediger profil (/portal/meg/profil/rediger). Mobil-først (430px).
 *
 * Skjema mot ekte User-felter. HCP synkes fra GolfBox (read-only). Felter som
 * lagres via server-action: navn, telefon, klubb, ambisjon. Server component
 * henter ekte data — INGEN falske fallback-verdier. Behold auth-guard + action.
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ProfilRedigerForm } from "./profil-rediger-form";

export const dynamic = "force-dynamic";

export default async function ProfilRedigerPage() {
  const user = await requirePortalUser();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      hcp: true,
      homeClub: true,
      ambition: true,
      avatarUrl: true,
      tier: true,
    },
  });

  const initial = {
    name: dbUser?.name ?? user.name ?? "",
    email: dbUser?.email ?? user.email ?? "",
    phone: dbUser?.phone ?? "",
    hcp: dbUser?.hcp ?? null,
    homeClub: dbUser?.homeClub ?? "",
    ambition: dbUser?.ambition ?? "",
    avatarUrl: dbUser?.avatarUrl ?? null,
    tier: dbUser?.tier ?? "GRATIS",
  };

  return (
    <div className="mx-auto w-full max-w-[480px] pb-8">
      {/* topbar — tilbake + tittel */}
      <div className="flex items-center gap-3 border-b border-border px-2 py-3">
        <Link
          href="/portal/meg"
          className="inline-flex items-center gap-1.5 px-1 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
          Profil
        </Link>
        <h1 className="font-display text-[17px] font-bold tracking-[-0.015em] text-foreground">
          Rediger profil
        </h1>
      </div>

      <div className="px-2 pb-4 pt-3">
        <p className="mb-3 px-1 text-[13px] leading-relaxed text-muted-foreground">
          HCP synkes automatisk fra GolfBox. Andre felter lagres når du trykker
          «Lagre».
        </p>
        <ProfilRedigerForm initial={initial} />
      </div>
    </div>
  );
}
