import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { TwoFaClient } from "./twofa-client";

export default async function TwoFaPage() {
  await requirePortalUser();

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:space-y-8 md:pb-0">
      <Link
        href="/portal/meg/innstillinger/sikkerhet"
        className="inline-flex h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Sikkerhet
      </Link>

      <PageHeader
        eyebrow="PlayerHQ · Sikkerhet · 2FA"
        titleLead="Aktiver"
        titleItalic="tofaktor"
        titleTrail="på kontoen"
        sub="Tre raske steg. Etter aktivering må du oppgi en 6-sifret kode hver gang du logger inn."
      />

      <TwoFaClient />
    </div>
  );
}
