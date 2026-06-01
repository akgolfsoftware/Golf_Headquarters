/**
 * PlayerHQ · Meg · Helse · Legg til symptom (/portal/meg/helse/symptom/ny).
 * Mobil-først (430px).
 *
 * 3-stegs wizard: kroppskart → intensitet/varighet → triggere/notat.
 * Server component, behold auth-guard. Selve wizarden er client (logSymptom).
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { SymptomWizard } from "./wizard";

export default async function NyttSymptomPage() {
  await requirePortalUser();
  return (
    <div className="mx-auto w-full max-w-[480px] pb-28">
      {/* topbar — tilbake + tittel */}
      <div className="flex items-center gap-3 border-b border-border px-2 py-3">
        <Link
          href="/portal/meg/helse"
          className="inline-flex items-center gap-1.5 px-1 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
          Helse
        </Link>
        <h1 className="font-display text-[17px] font-bold tracking-[-0.015em] text-foreground">
          Legg til symptom
        </h1>
      </div>

      <div className="px-2 pt-3">
        <SymptomWizard />
      </div>
    </div>
  );
}
