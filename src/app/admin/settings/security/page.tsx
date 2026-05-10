import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { Setup2FA } from "@/app/portal/meg/sikkerhet/setup-2fa";

export default async function AdminSikkerhet() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Innstillinger
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Sikkerhet
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">2FA</em> & passord
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Anbefalt for ADMIN- og COACH-konti.
        </p>
      </header>

      <Setup2FA />

      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-display text-base font-semibold tracking-tight">
          Endre passord
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Bruk &quot;Glemt passord&quot;-flyten på{" "}
          <Link href="/auth/forgot-password" className="text-primary hover:underline">
            /auth/forgot-password
          </Link>{" "}
          for å sette nytt passord. Krever bekreftelse via e-post.
        </p>
      </section>
    </div>
  );
}
