import Link from "next/link";
import { ChevronRight, FileText, Key, Shield, User } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";

type Item = {
  href: string;
  label: string;
  desc: string;
  aux: string;
  icon: typeof User;
};

const ITEMS: Item[] = [
  {
    href: "/admin/profile",
    label: "Profil",
    desc: "Navn, kontaktinfo, bio og hvordan spillerne ser deg.",
    aux: "Konto",
    icon: User,
  },
  {
    href: "/admin/settings/security",
    label: "Sikkerhet",
    desc: "To-faktor, passord, aktive økter og innloggings-historikk.",
    aux: "Konto",
    icon: Shield,
  },
  {
    href: "/admin/settings/api",
    label: "API-nøkler",
    desc: "Tredjeparts-tilgang. Integrer Trackman, Zapier eller egne verktøy.",
    aux: "Integrasjoner",
    icon: Key,
  },
  {
    href: "/admin/audit-log",
    label: "Revisjonslogg",
    desc: "Audit-trail for kritiske handlinger på kontoen.",
    aux: "Konto",
    icon: FileText,
  },
];

export default async function AdminSettingsPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Innstillinger"
        titleLead="Kontoen din."
        titleItalic="Slik den fungerer."
        sub="Profil, sikkerhet, API-nøkler og revisjonslogg samlet på ett sted. Endringer trer i kraft umiddelbart."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className="group flex items-start gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
            >
              <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-base font-semibold tracking-tight text-foreground group-hover:text-primary">
                    {it.label}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {it.aux}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {it.desc}
                </p>
              </div>
              <ChevronRight
                size={18}
                strokeWidth={1.5}
                className="mt-1 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
