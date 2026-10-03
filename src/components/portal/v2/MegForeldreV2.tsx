"use client";

import Link from "next/link";
import { Users, UserPlus, Eye, Mail } from "lucide-react";

export type ForesattRad = {
  id: string;
  navn: string;
  relasjon: string;
  kontekst: string;
  href: string;
};

export type MegForeldreData = {
  foresatte: ForesattRad[];
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name.slice(0, 2) || "FO").toUpperCase();
}

function antallTekst(n: number): string {
  if (n === 0) return "Ingen foresatte er koblet til kontoen din ennå.";
  return `${n} ${n === 1 ? "foresatt er" : "foresatte er"} koblet til kontoen din med innsyn.`;
}

export function MegForeldreV2({ data }: { data: MegForeldreData }) {
  const { foresatte } = data;
  const erTom = foresatte.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      <div>
        <span className="ph24f-kicker">Koblede foresatte</span>
        <p style={{ margin: "4px 0 0", font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
          {antallTekst(foresatte.length)}
        </p>
      </div>

      {erTom ? (
        <div className="pa-state pa-state--empty">
          <div className="pa-state__icon">
            <Users size={22} />
          </div>
          <div className="pa-state__text">
            <div className="pa-state__title">Ingen foresatte koblet til</div>
            <div className="pa-state__body">
              Foresatte kan kobles til for å følge oppmøte og treningsinnsats.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {foresatte.map((f) => (
            <div key={f.id} className="ph24v-rad">
              <div className="ph24v-avatar">{getInitials(f.navn)}</div>
              <div className="ph24v-info">
                <div className="ph24v-navn">{f.navn}</div>
                <div className="ph24v-sub">{f.kontekst}</div>
              </div>
              <span className="pa-status pa-status--ok" style={{ flex: "none" }}>
                {f.relasjon}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
        <Link href="/inviter/forelder" className="pa-btn pa-btn--primary pa-btn--sm">
          <UserPlus size={14} style={{ marginRight: 6 }} />
          Inviter forelder
        </Link>
        <Link href="/portal/meg/deling" className="pa-btn pa-btn--ghost pa-btn--sm">
          <Eye size={14} style={{ marginRight: 6 }} />
          Se tilgang og samtykke
        </Link>
      </div>

      <div className="ph24v-personvern">
        <Mail size={16} style={{ color: "var(--text-secondary)", marginTop: 2, flex: "none" }} aria-hidden />
        <span>
          Foresatte har kun innsyn i oppmøte og bekreftede økter. Private coach-notater, helseopplysninger og interne testprotokoller deles aldri.
        </span>
      </div>
    </div>
  );
}
