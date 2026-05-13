/**
 * CoachHQ — Legg til ny spiller.
 *
 * Server-component med klient-form som kaller server action
 * leggTilSpiller (i ../actions.ts). Ved suksess redirecter til
 * /admin/elever/{id}.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { NySpillerForm } from "./form";

export default async function NySpillerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="flex flex-col gap-8 px-6 py-8 md:px-10 md:py-10">
      <PageHeader
        eyebrow="Spillere · Ny"
        titleLead="Legg til en"
        titleItalic="ny"
        titleTrail="spiller."
        sub="Spilleren får invitasjon på e-post når du senere aktiverer kontoen."
      />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <NySpillerForm />
      </div>
    </div>
  );
}
