import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { Setup2FA } from "./setup-2fa";

export default async function SikkerhetPage() {
  await requirePortalUser();

  return (
    <div className="space-y-6">
      <Link
        href="/portal/meg"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Min profil
      </Link>

      <header>
        <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Sikkerhet</em>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tofaktor-autentisering legger til ekstra beskyttelse.
        </p>
      </header>

      <Setup2FA />
    </div>
  );
}
