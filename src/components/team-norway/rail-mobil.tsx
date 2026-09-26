"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TN } from "@/lib/v2/team-norway";
import { Icon } from "@/components/v2/icon";
import { TnAvatarInitialer, TnLogo, TnMenygruppe, type TnBunnValg, type TnMenyGruppe } from "./core";

/**
 * Mobilmenyen under Tailwinds `lg`-brekkpunkt (1024 px), der `TnRail` skjules.
 * Fasit: «Team Norway App delivery» (bc3e41fc), runde 26.09: fast bunnlinje
 * med fire valg per rolle og «Mer», som åpner et ark med alle gruppene utfoldet.
 * Avvik:
 *   - Topplinjen viser logo og initialer, ingen egen menyknapp — «Mer» i
 *     bunnlinjen er eneste vei til resten. Bunnlinjen legger til
 *     `--ak-cookie-h` og safe-area (gotchas §UI).
 */
export function TnRailMobil({ grupper, bunn, brukerNavn, orgNavn }: { grupper: TnMenyGruppe[]; bunn: TnBunnValg[]; brukerNavn: string; orgNavn: string }) {
  const [mer, setMer] = useState(false);
  const arkId = useId();
  const merRef = useRef<HTMLButtonElement>(null);
  const fastAktiv = bunn.some((b) => b.aktiv);

  useEffect(() => {
    if (!mer) return;
    const lukk = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMer(false);
        merRef.current?.focus();
      }
    };
    window.addEventListener("keydown", lukk);
    return () => window.removeEventListener("keydown", lukk);
  }, [mer]);

  const valgStil = (aktiv: boolean) => ({
    flex: "1 1 0",
    minWidth: 0,
    minHeight: 56,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    textDecoration: "none",
    background: aktiv ? TN.rail.active : "transparent",
    borderTop: `3px solid ${aktiv ? TN.rail.marker : "transparent"}`,
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "none",
    color: aktiv ? TN.rail.on : TN.rail.text,
    fontFamily: TN.font.body,
    fontSize: 11.5,
    fontWeight: aktiv ? TN.weight.bold : TN.weight.regular,
    cursor: "pointer",
    padding: 0,
  });

  return (
    <div className="lg:hidden" style={{ width: "100%" }}>
      <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", background: TN.rail.bg }}>
        <span style={{ display: "inline-flex", alignItems: "center", minWidth: 0 }}>
          <TnLogo hoyde={24} prioritet paaMork />
          <span className="sr-only">{orgNavn}</span>
        </span>
        <TnAvatarInitialer navn={brukerNavn} size={32} paaMork />
      </div>

      {mer ? (
        <nav
          id={arkId}
          aria-label="Alle sider"
          style={{ position: "fixed", left: 0, right: 0, top: 0, bottom: "calc(59px + env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px))", zIndex: 40, background: TN.rail.bg, overflowY: "auto", padding: "12px 12px 20px", display: "flex", flexDirection: "column", gap: 10 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 0 0 10px" }}>
            <span style={{ fontFamily: TN.font.display, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: TN.rail.on }}>Meny</span>
            <button type="button" onClick={() => { setMer(false); merRef.current?.focus(); }} aria-label="Lukk meny" style={{ minWidth: 44, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
              <Icon name="x" size={20} style={{ color: TN.rail.on }} />
            </button>
          </div>
          {grupper.map((g) => <TnMenygruppe key={g.id} gruppe={g} alltidApen onVelg={() => setMer(false)} />)}
        </nav>
      ) : null}

      <nav
        aria-label="Hovedvalg"
        style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 41, display: "flex", background: TN.rail.bg, paddingBottom: "calc(env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px))" }}
      >
        {bunn.map((b) => (
          <a key={b.href} href={b.href} aria-current={b.aktiv && !mer ? "page" : undefined} style={valgStil(b.aktiv && !mer)}>
            <Icon name={b.ikon} size={20} />
            <span style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.label}</span>
          </a>
        ))}
        <button ref={merRef} type="button" onClick={() => setMer((v) => !v)} aria-expanded={mer} aria-controls={arkId} style={valgStil(mer || !fastAktiv)}>
          <Icon name="more-horizontal" size={20} />
          <span>Mer</span>
        </button>
      </nav>
    </div>
  );
}
