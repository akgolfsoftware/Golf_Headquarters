/**
 * Preview-indeks for PlayerHQ-skjermer (offentlig, ingen auth).
 * Lenke-liste til preview-skjermene som er portet fra v10-fasiten.
 * FJERNES når skjermene kobles inn på de ekte /portal-rutene.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SCREENS = [
  {
    href: "/playerhq-preview/hjem",
    title: "Hjem",
    desc: "Spillerens daglige landing — tom-tilstand (ny GRATIS-spiller).",
  },
] as const;

export default function PlayerHqPreviewIndex() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-10">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        PlayerHQ · Preview
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.02em] text-foreground">
        Skjerm-preview
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Skjermer portet fra v10-design. Klikk for å åpne.
      </p>

      <ul className="mt-6 space-y-2">
        {SCREENS.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <span className="min-w-0">
                <span className="block font-display text-base font-semibold tracking-tight text-foreground">
                  {s.title}
                </span>
                <span className="mt-0.5 block text-[13px] text-muted-foreground">
                  {s.desc}
                </span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted-foreground/60"
                strokeWidth={2}
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
