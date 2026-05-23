/**
 * /portal/meg/innstillinger/personvern
 *
 * GDPR-rettigheter: data-eksport (art. 15) + sletting av konto (art. 17).
 * Begge handlinger er ekte og automatiserte (P20 fra master-plan).
 */

import { Shield, Download, Trash2, Lock, Mail } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { PersonvernActions } from "./personvern-actions";

export const dynamic = "force-dynamic";

export default async function PersonvernPage() {
  await requirePortalUser();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="INNSTILLINGER · PERSONVERN"
        titleLead="Dine data,"
        titleItalic="din kontroll"
        sub="GDPR-rettigheter, datadeling og kontosletting."
      />

      <section className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-accent">
              <Download className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Last ned dine data
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                GDPR artikkel 15 — rett til innsyn. Vi sender deg en JSON-fil
                med alle dine data: profil, runder, økter, mål, betalinger,
                varsler, helse-loggføringer, utstyr og meldinger.
              </p>
              <PersonvernActions kind="export" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-destructive text-destructive-foreground">
              <Trash2 className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Slett kontoen din
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                GDPR artikkel 17 — rett til sletting. Kontoen din deaktiveres
                umiddelbart. Alle dine data slettes permanent etter{" "}
                <strong>30 dager</strong>. I 30-dagers-vinduet kan du angre ved
                å kontakte support.
              </p>
              <PersonvernActions kind="delete" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h3 className="font-display text-sm font-semibold">
            Hvordan vi behandler dine data
          </h3>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Lock className="h-4 w-4 shrink-0 text-primary mt-0.5" strokeWidth={1.75} />
            <span>
              <strong className="text-foreground">Lagring:</strong> Alle data
              lagres kryptert i Supabase (EU-region).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Lock className="h-4 w-4 shrink-0 text-primary mt-0.5" strokeWidth={1.75} />
            <span>
              <strong className="text-foreground">Betaling:</strong> Kortdata
              håndteres kun av Stripe (PCI DSS-sertifisert). Vi lagrer aldri
              kortinformasjon.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Mail className="h-4 w-4 shrink-0 text-primary mt-0.5" strokeWidth={1.75} />
            <span>
              <strong className="text-foreground">Marketing:</strong> Vi sender
              kun transaksjonell e-post (booking, plan-oppdateringer, varsler).
              Ingen markedsføring uten samtykke.
            </span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Mer info i{" "}
          <a
            href="/personvern"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            personvernerklæringen
          </a>
          . Spørsmål? Kontakt{" "}
          <a
            href="mailto:post@akgolf.no"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            post@akgolf.no
          </a>
          .
        </p>
      </section>
    </div>
  );
}
