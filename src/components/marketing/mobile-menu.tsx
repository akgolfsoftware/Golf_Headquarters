"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/coaching", label: "Coaching" },
  { href: "/treningsfilosofi", label: "Slik trener vi" },
  { href: "/playerhq", label: "PlayerHQ" },
  { href: "/turneringer", label: "Turneringer" },
  { href: "/anlegg", label: "Anlegg" },
  { href: "/om-oss", label: "Om oss" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="grid h-10 w-10 place-items-center rounded-md text-foreground hover:bg-secondary sm:hidden"
        aria-label={open ? "Lukk meny" : "Åpne meny"}
        aria-expanded={open}
      >
        {open ? (
          <X className="h-5 w-5" strokeWidth={1.5} />
        ) : (
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-border bg-background/95 backdrop-blur-md sm:hidden">
          <nav className="mx-auto max-w-6xl divide-y divide-border/60 px-6">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block py-4 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
