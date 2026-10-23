import Link from "next/link";

import { TN } from "@/lib/v2/team-norway";

export type TnReferanseFane = "wagr" | "sammenlign" | "sok" | "norsk-golf" | "hcp" | "tester";

/**
 * Fanene i Referanse (wireframes docs/design-system/utkast-tn/trenerflate, «Referanse»).
 * Planlegger er ikke med: den blir på teamnorwayref (beslutninger.md §REFERANSESPILLERE NORDEN, punkt 5).
 * Tester er tidligere Referansenivåer (/team-norway/referansenivaer sender hit).
 */
export function TnReferanseFaner({ aktiv }: { aktiv: TnReferanseFane }) {
  const faner: { id: TnReferanseFane; label: string; href: string }[] = [
    { id: "wagr", label: "WAGR", href: "/team-norway/referanse" },
    { id: "sammenlign", label: "Sammenlign", href: "/team-norway/referanse/sammenlign" },
    { id: "sok", label: "Søk", href: "/team-norway/referanse/sok" },
    { id: "norsk-golf", label: "Norsk golf", href: "/team-norway/referanse/norsk-golf" },
    { id: "hcp", label: "HCP Norge", href: "/team-norway/referanse/hcp" },
    { id: "tester", label: "Tester", href: "/team-norway/referanse/tester" },
  ];
  return (
    <nav aria-label="Referanse-faner" style={{ display: "flex", flexWrap: "wrap", borderBottom: `1px solid ${TN.ink200}` }}>
      {faner.map((f) => (
        <Link
          key={f.id}
          href={f.href}
          aria-current={aktiv === f.id ? "page" : undefined}
          style={{
            minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 12px", marginBottom: -1,
            fontSize: 14, fontWeight: 700,
            color: aktiv === f.id ? TN.navy900 : TN.ink700,
            borderBottom: `3px solid ${aktiv === f.id ? TN.red600 : "transparent"}`,
            textDecoration: "none",
          }}
        >
          {f.label}
        </Link>
      ))}
    </nav>
  );
}
