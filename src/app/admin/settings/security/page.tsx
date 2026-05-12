import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { Setup2FA } from "@/app/portal/meg/sikkerhet/setup-2fa";
import { PageHeader } from "@/components/shared/page-header";

export default async function AdminSikkerhet() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

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
        eyebrow="CoachHQ · Innstillinger · Sikkerhet"
        titleLead="Hvem kommer"
        titleItalic="inn"
        titleTrail="— og hvordan"
        sub="Anbefalt for ADMIN- og COACH-konti. To-faktor og sterkt passord beskytter spillerdata."
      />

      <Setup2FA />

      <section className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
          Endre passord
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Bruk &quot;Glemt passord&quot;-flyten på{" "}
          <Link
            href="/auth/forgot-password"
            className="text-primary hover:underline"
          >
            /auth/forgot-password
          </Link>{" "}
          for å sette nytt passord. Krever bekreftelse via e-post.
        </p>
      </section>
    </div>
  );
}
