import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

const ITEMS = [
  {
    href: "/admin/profile",
    label: "Profil",
    desc: "Navn, kontaktinfo, biografi",
  },
  {
    href: "/admin/settings/security",
    label: "Sikkerhet",
    desc: "Tofaktor-autentisering, passord",
  },
  {
    href: "/admin/settings/api",
    label: "API-nøkler",
    desc: "For tredjeparts-integrasjoner",
  },
  {
    href: "/admin/audit",
    label: "Revisjonslogg",
    desc: "Audit-logg for kritiske handlinger",
  },
];

export default async function SettingsHub() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Innstillinger
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Konto</em>-innstillinger
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary">
              {it.label}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
