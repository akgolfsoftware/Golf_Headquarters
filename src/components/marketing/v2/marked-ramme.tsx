"use client";

/**
 * AK Golf HQ v2 — delt marketing-ramme (retning C «Presis», mørk-først).
 * Brukt av katalogsidene (coacher/anlegg/turneringer/blogg, liste + detalj) —
 * IKKE av de fire M1–M4-sidene (Forside/Coaching/PlayerHQ/Priser), som
 * bevisst beholder sin egen lokale kopi (mockup-fasit-diff). Denne fila
 * speiler MarkedForsideV2 sin MRamme (ekte Link-navigasjon, `className="dark"`)
 * 1:1 — eneste kanoniske chrome for nye markedssider fremover, unngår at
 * MNav/MFot dupliseres en 5.–8. gang.
 */
import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, LogoAK, Caps } from "@/components/v2";

/* ── Marketing-skala (litt større type, mer luft — samme palett) ── */
export const M = {
  heroD: 62,
  heroM: 38,
  seksD: 30,
  seksM: 24,
  lede: 16.5,
  padDY: 96,
  padDX: 64,
  padMY: 56,
  padMX: 22,
  maxw: 1040,
};

/** Fluid breakpoint (default desktop → unngår hydrerings-hopp). */
export function useMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mobile;
}

/* ── Ramme: toppnav + innhold + footer ─────────────────── */
const MNAV: { id: string; l: string; href: string }[] = [
  { id: "hjem", l: "Hjem", href: "/" },
  { id: "coaching", l: "Coaching", href: "/coaching" },
  { id: "playerhq", l: "PlayerHQ", href: "/playerhq" },
  { id: "priser", l: "Priser", href: "/priser" },
];

export function MNav({ mobile, aktiv }: { mobile: boolean; aktiv: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: mobile ? "16px 22px" : "20px 64px",
        borderBottom: `1px solid ${T.border}`,
        position: "relative",
      }}
    >
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <LogoAK size={24} />
      </Link>
      {!mobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {MNAV.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              style={{
                fontFamily: T.ui,
                fontSize: 14,
                fontWeight: 600,
                color: aktiv === n.id ? T.fg : T.fg2,
                textDecoration: "none",
                borderBottom: aktiv === n.id ? `2px solid ${T.lime}` : "2px solid transparent",
                paddingBottom: 2,
              }}
            >
              {n.l}
            </Link>
          ))}
        </div>
      )}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        {!mobile && (
          <Link
            href="/auth/login"
            style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg2, textDecoration: "none" }}
          >
            Logg inn
          </Link>
        )}
        {mobile ? (
          <Icon name="menu" size={20} style={{ color: T.fg }} />
        ) : (
          <MCta small href="/auth/signup">
            Kom i gang gratis
          </MCta>
        )}
      </span>
    </div>
  );
}

export function MFot({ mobile }: { mobile: boolean }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${T.border}`,
        padding: mobile ? "32px 22px" : "40px 64px",
        display: "flex",
        flexDirection: mobile ? "column" : "row",
        alignItems: mobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 18,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
        <LogoAK size={18} color={T.mut} />
        <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>AK Golf Group AS · Fredrikstad</span>
      </span>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[
          { l: "Coaching", href: "/coaching" },
          { l: "PlayerHQ", href: "/playerhq" },
          { l: "Priser", href: "/priser" },
          { l: "Book tid", href: "/booking" },
          { l: "Personvern", href: "/personvern" },
        ].map((it) => (
          <Link key={it.l} href={it.href} style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, cursor: "pointer", textDecoration: "none" }}>
            {it.l}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function MRamme({ mobile, aktiv, children }: { mobile: boolean; aktiv: string; children: ReactNode }) {
  return (
    <div
      className="dark"
      style={{
        minHeight: "100vh",
        colorScheme: "dark",
        color: T.fg,
        fontFamily: T.ui,
        background: `radial-gradient(1100px 520px at 30% -10%, rgba(0,88,64,0.20), transparent 62%), ${T.bg}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MNav mobile={mobile} aktiv={aktiv} />
      <div style={{ flex: 1 }}>{children}</div>
      <MFot mobile={mobile} />
    </div>
  );
}

/* ── Tekst- og CTA-primitiver (marketing-skala) ────────── */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Caps size={11} color={T.lime} style={{ marginBottom: 18 }}>
      {children}
    </Caps>
  );
}

export function HeroT({ mobile, children, em }: { mobile: boolean; children: ReactNode; em?: string }) {
  return (
    <h1
      style={{
        fontFamily: T.disp,
        fontWeight: 700,
        fontSize: mobile ? M.heroM : M.heroD,
        letterSpacing: "-0.035em",
        color: T.fg,
        margin: 0,
        lineHeight: 1.02,
      }}
    >
      {children}
      {em && (
        <>
          {" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>{em}</em>
        </>
      )}
    </h1>
  );
}

export function SeksT({ mobile, children, em }: { mobile: boolean; children: ReactNode; em?: string }) {
  return (
    <h2
      style={{
        fontFamily: T.disp,
        fontWeight: 700,
        fontSize: mobile ? M.seksM : M.seksD,
        letterSpacing: "-0.03em",
        color: T.fg,
        margin: 0,
        lineHeight: 1.08,
      }}
    >
      {children}
      {em && (
        <>
          {" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>{em}</em>
        </>
      )}
    </h2>
  );
}

export function Lede({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p style={{ fontFamily: T.ui, fontSize: M.lede, color: T.fg2, lineHeight: 1.65, margin: 0, maxWidth: 560, ...style }}>
      {children}
    </p>
  );
}

export function MCta({
  children,
  ghost,
  small,
  icon,
  href,
}: {
  children: ReactNode;
  ghost?: boolean;
  small?: boolean;
  icon?: string;
  href?: string;
}) {
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: T.ui,
    fontWeight: 600,
    fontSize: small ? 13 : 15,
    color: ghost ? T.fg : T.onLime,
    background: ghost ? T.panel3 : T.lime,
    border: ghost ? `1px solid ${T.borderS}` : "none",
    borderRadius: 9999,
    padding: small ? "9px 18px" : "14px 28px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    textDecoration: "none",
  };
  const inner = (
    <>
      {children}
      {icon && <Icon name={icon} size={small ? 13 : 15} />}
    </>
  );
  if (href) {
    return (
      <Link href={href} style={style}>
        {inner}
      </Link>
    );
  }
  return <span style={style}>{inner}</span>;
}

export function Seksjon({ mobile, children, style }: { mobile: boolean; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ paddingTop: mobile ? M.padMY : M.padDY, paddingBottom: mobile ? M.padMY : M.padDY, paddingLeft: mobile ? M.padMX : M.padDX, paddingRight: mobile ? M.padMX : M.padDX, ...style }}>
      <div style={{ maxWidth: M.maxw, margin: "0 auto" }}>{children}</div>
    </div>
  );
}
