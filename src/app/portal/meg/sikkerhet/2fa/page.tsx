import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { TwoFaClient } from "./twofa-client";

export default async function TwoFaPage() {
  await requirePortalUser();

  return (
    <div className="space-y-8">
      <Link
        href="/portal/meg/sikkerhet"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
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
