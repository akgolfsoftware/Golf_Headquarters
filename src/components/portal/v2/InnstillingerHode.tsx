/**
 * Delt hode for hele Innstillinger-familien (fase2/W3, playerhq-innstillinger.html).
 * Mal: sirkulær tilbake-knapp + tittel + undertekst, brukt likt på hub-en og
 * alle 8 underrutene slik at familien er visuelt konsistent. Ingen
 * innholdsendring utover dette — kirurgisk per rute.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";

export function InnstillingerHode({
  tittel,
  undertekst,
  tilbakeHref,
  action,
}: {
  tittel: string;
  undertekst: string;
  tilbakeHref: string;
  action?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }} data-paper-pattern-topp>
      <Link
        href={tilbakeHref}
        aria-label="Tilbake"
        style={{
          flex: "none",
          width: 44,
          height: 44,
          borderRadius: 12,
          border: `1px solid ${T.border}`,
          display: "grid",
          placeItems: "center",
          color: T.fg,
          textDecoration: "none",
        }}
      >
        <Icon name="arrow-left" size={18} />
      </Link>
      <div style={{ minWidth: 0, flex: 1 }}>
        <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>{tittel}</h1>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {undertekst}
        </span>
      </div>
      {action}
    </div>
  );
}
