// Varsler — push-toggles per barn. Notification-modellen finnes som domene,
// men foreldre-spesifikk preferanselagring kommer i Spor 1. Side viser
// inntil videre lese-modus + siste varsler fra Notification-feeden for barna.

import { Bell, Mail, MessageSquare, Calendar, CheckCircle2 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { ForelderHero } from "@/components/forelder/forelder-hero";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

type ToggleSpec = {
  key: string;
  label: string;
  sub: string;
};

const KANALER: ToggleSpec[] = [
  { key: "okt_planlagt", label: "Ny økt planlagt", sub: "Når coach legger inn økt" },
  { key: "okt_fullfort", label: "Økt fullført", sub: "Når barnet logger fullført økt" },
  { key: "faktura", label: "Ny faktura", sub: "Når betaling forfaller eller mislykkes" },
  { key: "melding", label: "Coach-melding", sub: "Når coach sender direktemelding" },
];

export default async function Varsler() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);
  const childIds = barn.map((b) => b.child.id);

  const sisteVarsler = childIds.length
    ? await prisma.notification.findMany({
        where: { userId: { in: childIds } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { id: true, name: true } } },
      })
    : [];

  return (
    <div className="space-y-8">
      <ForelderHero
        eyebrow="Foreldreportal · Varsler"
        titleLead="Velg hva du vil"
        titleItalic="varsles om"
        sub="Du kan styre varslene per barn — push-funksjonalitet kommer i Spor 1."
      />

      {/* Hva kommer */}
      <section className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-start gap-4">
          <Bell
            className="h-5 w-5 flex-shrink-0 text-primary"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <div className="text-sm">
            <p className="font-semibold">Push-varsler aktiveres i Spor 1</p>
            <p className="mt-1 text-muted-foreground">
              Inntil mobil-app er ferdig kan du følge varsler på e-post (sendes
              til {user.email}).
            </p>
          </div>
        </div>
      </section>

      {/* Per barn — toggles */}
      {barn.length === 0 ? (
        <section className="rounded-xl border border-border bg-card px-6 py-8 text-sm text-muted-foreground">
          Ingen barn koblet ennå.
        </section>
      ) : (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Per barn{" "}
            <em className="font-normal italic text-muted-foreground">
              · {barn.length}
            </em>
          </h2>
          {barn.map((b) => (
            <div
              key={b.child.id}
              className="rounded-xl border border-border bg-card"
            >
              <header className="flex items-baseline justify-between border-b border-border px-6 py-4">
                <h3 className="font-display text-base font-semibold tracking-tight">
                  {b.child.name}
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {b.relationship}
                </span>
              </header>
              <ul className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
                {KANALER.map((k) => (
                  <li key={k.key}>
                    <label className="flex items-start justify-between gap-4 rounded-md border border-border bg-background px-4 py-4 text-sm">
                      <div className="min-w-0">
                        <div className="font-medium">{k.label}</div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                          {k.sub}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        disabled
                        defaultChecked
                        aria-label={`${k.label} for ${b.child.name}`}
                        className="mt-1 h-4 w-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      />
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Siste varsler */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
          <h2 className="inline-flex items-center gap-2 font-display text-base font-semibold tracking-tight">
            <Bell
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            Siste varsler
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {sisteVarsler.length} de siste dagene
          </span>
        </div>
        {sisteVarsler.length === 0 ? (
          <div className="px-6 py-8 text-sm text-muted-foreground">
            Ingen varsler å vise.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {sisteVarsler.map((v) => {
              const Ikon = v.type === "MESSAGE"
                ? MessageSquare
                : v.type === "BOOKING"
                  ? Calendar
                  : v.type === "PAYMENT"
                    ? Mail
                    : CheckCircle2;
              return (
                <li
                  key={v.id}
                  className="flex items-start gap-4 px-6 py-4 text-sm"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground"
                  >
                    <Ikon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{v.title}</div>
                    {v.body && (
                      <div className="mt-1 text-muted-foreground">
                        {v.body}
                      </div>
                    )}
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {v.user?.name?.split(" ")[0] ?? "—"} ·{" "}
                      {NB_DATO.format(v.createdAt)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
