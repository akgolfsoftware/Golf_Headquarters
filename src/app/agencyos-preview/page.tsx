/**
 * Preview-indeks for AgencyOS-skjermer (offentlig, ingen auth).
 * Lenke-liste til design-kalibrerings-previews bygget FRA v10-fasiten.
 */

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";

const SCREENS: { href: string; label: string; desc: string; Icon: typeof LayoutDashboard }[] = [
  {
    href: "/agencyos-preview/cockpit",
    label: "Cockpit",
    desc: "Operations cockpit — 3-kolonne daglig brief + KPI-strip",
    Icon: LayoutDashboard,
  },
];

export default function AgencyOsPreviewIndex() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-background px-6 py-12">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        AgencyOS · preview
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
        Skjermer
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Design-kalibrerings-previews (ingen auth, demo-data).
      </p>

      <ul className="mt-8 space-y-3">
        {SCREENS.map(({ href, label, desc, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/40 hover:bg-secondary"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{label}</span>
                <span className="block text-[13px] text-muted-foreground">{desc}</span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
