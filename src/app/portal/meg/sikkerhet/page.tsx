import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { Setup2FA } from "./setup-2fa";

export default async function SikkerhetPage() {
  await requirePortalUser();

  return (
    <div className="space-y-6">
      <Link
        href="/portal/meg"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Min profil
      </Link>

      <PageHeader
        eyebrow="PlayerHQ · Meg · Sikkerhet"
        titleLead="Hvem er"
        titleItalic="logget inn"
        titleTrail="akkurat nå?"
        sub="Tofaktor-autentisering legger til ekstra beskyttelse — anbefales for alle som har koblet betalingskort."
      />

      <Setup2FA />
    </div>
  );
}
