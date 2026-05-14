// Varsler — push-toggles per barn. Notification-modell finnes ikke ennå,
// så dette er en placeholder klar for Spor 1.

import { Bell } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { PageHeader } from "@/components/shared/page-header";

export default async function Varsler() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Foreldreportal · Varsler"
        titleLead="Velg hva du vil"
        titleItalic="varsles om"
        sub="Du kan styre varslene per barn — push-funksjonalitet kommer i Spor 1."
      />

      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground inline-flex items-center gap-2">
          <Bell className="h-3 w-3" strokeWidth={1.5} />
          Push-varsler per barn
        </div>
        {barn.length === 0 ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            Ingen barn koblet ennå.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {barn.map((b) => (
              <li key={b.child.id} className="px-6 py-4">
                <div className="font-display text-base font-semibold">{b.child.name}</div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ToggleRad label="Ny økt planlagt" disabled />
                  <ToggleRad label="Økt fullført" disabled />
                  <ToggleRad label="Ny faktura" disabled />
                  <ToggleRad label="Coach-melding" disabled />
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-border px-6 py-4 text-xs text-muted-foreground">
          Push-toggles aktiveres når Spor 1 (mobil-push) er ferdig.
        </div>
      </section>
    </div>
  );
}

function ToggleRad({ label, disabled }: { label: string; disabled?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-md bg-muted px-4 py-2 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        disabled={disabled}
        className="h-4 w-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      />
    </label>
  );
}
