/**
 * AgencyOS v2 — Tildelt meg (`/admin/workspace/tildelt-meg`, AgencyOS
 * Bølge 3.5, 2026-07-14). Port fra `(legacy)/workspace/tildelt-meg/page.tsx`
 * — samme aggregering (godkjenninger/forespørsler/plan-utkast/Notion-
 * oppgaver), ren visning.
 */

import Link from "next/link";
import { Caps, Tittel, Kort, Rad, Icon, T } from "@/components/v2";

export interface AdminTildeltMegV2Item {
  ikon: string;
  title: string;
  meta: string;
  href: string;
}

const TALLORD = ["Ingen", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti"];

export function AdminTildeltMegV2({ items }: { items: AdminTildeltMegV2Item[] }) {
  const antall = TALLORD[items.length] ?? String(items.length);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720 }}>
      <div>
        <Caps size={9}>Min uke · Tildelt meg</Caps>
        <Tittel em="til deg.">{antall} ting</Tittel>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4 }}>Alt som venter på en handling fra deg, samlet ett sted.</p>
      </div>

      <Kort pad="6px 14px">
        {items.length === 0 ? (
          <div style={{ padding: "34px 10px", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            Ingenting venter på deg. Godt jobbet.
          </div>
        ) : (
          items.map((it, i) => (
            <Link key={`${it.href}-${i}`} href={it.href} style={{ textDecoration: "none" }}>
              <Rad
                last={i === items.length - 1}
                leading={<Icon name={it.ikon} size={17} style={{ color: T.fg }} />}
                title={it.title}
                sub={it.meta}
                trailing={<Icon name="chevron-right" size={15} style={{ color: T.mut }} />}
              />
            </Link>
          ))
        )}
      </Kort>
    </div>
  );
}
