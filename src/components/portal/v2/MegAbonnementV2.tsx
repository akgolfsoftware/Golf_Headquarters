"use client";

/**
 * PlayerHQ Meg · Abonnement — v2 (retning C «Presis»). Rekomponert fra den
 * ekte /portal/meg/abonnement-siden, men med EKTE data fra getAbonnementData
 * (montert i (v2preview)/v2-meg-abonnement/page.tsx). Kun v2-komponenter fra
 * "@/components/v2"; lokale byggeklosser (Melding, LenkePille, Punkt) er
 * komponert 1:1 av T.*-tokens + v2-primitiver, jf. mønsteret i InnstillingerV2
 * (Toggle/Seksjon/AboHjelp). Ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Abonnement-kanon (låst): PlayerHQ har INGEN nivåer. Appen er gratis via
 * prøveperiode / coaching-pakke (Performance / Performance Pro = antall økter,
 * IKKE app-nivåer) / gruppe, ELLER 299 kr/mnd. ELITE finnes ikke og vises aldri.
 *
 * Ærlighet: alt her er avledet av FAKTISK Prisma-tilstand (tier + subscription
 * + faktura-historikk). Ingen tall fabrikkeres. Post-handling-banners speiler
 * searchParams fra Stripe-flyten; tier/status utledes ALDRI fra dem.
 *
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, Rad, StatusPill } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type MegAbonnementFaktura = {
  id: string;
  /** Betalingsbeskrivelse, ellers «Betaling». */
  tittel: string;
  /** «12. mai 2026 · 299 kr» — ferdigformatert nb-NO. */
  meta: string;
};

export type MegAbonnementData = {
  /** Hvilket hovedkort som vises øverst (utledet server-side). */
  hero: "oppgrader" | "status" | "gratis";
  /** Har gratis app-tilgang (styrer «Nå»-markør i planlista). */
  gratis: boolean;
  /** Coaching-pakkens navn når gratis via pakke, ellers null. */
  pakkeNavn: string | null;
  /** Ferdigformatert neste-trekk-dato (status-hero + avbestilt-banner). */
  fornyes: string | null;
  /** Siste betaling feilet (PAST_DUE) → varsel-banner. */
  betalingFeilet: boolean;
  kanOppgradere: boolean;
  kanEndreKort: boolean;
  kanAvbestille: boolean;
  fakturaer: MegAbonnementFaktura[];
  /** Post-handling-flagg fra Stripe-retur (searchParams). */
  flagg: { ok: boolean; avbrutt: boolean; avbestilt: boolean };
};

/* ── Konstanter (ekte copy fra dagens skjerm) ──────────────────────── */

const PRO_INKLUDERER = [
  "Video-feedback fra coach",
  "Prioritert booking",
  "Avansert SG-rapport",
  "AI-coach (V2)",
] as const;

const INNGAAR = [
  "Treningsplan og Workbench",
  "Live-økter og logging",
  "Strokes Gained og TrackMan",
  "Direkte coach-kontakt",
  "AI-Caddie (inngang)",
] as const;

/* ── Lokale byggeklosser (kun T.* + v2-primitiver) ─────────────────── */

/** Status-stripe etter Stripe-retur / ved feilet betaling. Full bredde, responsiv. */
function Melding({ tone, children }: { tone: "ok" | "info" | "feil"; children: ReactNode }) {
  const c = tone === "ok" ? T.up : tone === "feil" ? T.down : T.info;
  const ic = tone === "ok" ? "check-circle" : tone === "feil" ? "alert-triangle" : "info";
  return (
    <div
      role={tone === "feil" ? "alert" : "status"}
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: `color-mix(in srgb,${c} 9%,${T.panel})`,
        border: `1px solid color-mix(in srgb,${c} 30%,transparent)`,
        borderRadius: T.rRow,
        padding: "12px 14px",
      }}
    >
      <Icon name={ic} size={15} style={{ color: c, flex: "none", marginTop: 1 }} />
      <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg, lineHeight: 1.55, minWidth: 0 }}>{children}</div>
    </div>
  );
}

/** Lenke stylet som CTA-pille (lime/ghost). Navigasjon via Next Link. */
function LenkePille({
  href,
  children,
  icon,
  ghost,
  full,
}: {
  href: string;
  children: ReactNode;
  icon?: string;
  ghost?: boolean;
  full?: boolean;
}) {
  return (
    <Link
      href={href}
      className="v2-press v2-focus"
      style={{
        display: full ? "flex" : "inline-flex",
        width: full ? "100%" : "auto",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: T.ui,
        fontSize: 12.5,
        fontWeight: 600,
        color: ghost ? T.fg : T.onLime,
        background: ghost ? T.panel3 : T.lime,
        border: ghost ? `1px solid ${T.borderS}` : "1px solid transparent",
        borderRadius: 9999,
        padding: "11px 18px",
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </Link>
  );
}

/** Feature-punkt med lime hake (mockup-idiom). */
function Punkt({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: "flex", gap: 9, alignItems: "flex-start", fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
      <Icon name="check" size={14} style={{ color: T.lime, flex: "none", marginTop: 2 }} />
      {children}
    </span>
  );
}

/** Stor mono-pris «299» + «kr/mnd». */
function Pris({ tall, mobile }: { tall: string; mobile: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
      <span style={{ fontFamily: T.mono, fontSize: mobile ? 40 : 46, fontWeight: 700, color: T.fg, lineHeight: 0.9, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
        {tall}
      </span>
      <span style={{ fontFamily: T.mono, fontSize: 14, color: T.mut }}>kr/mnd</span>
    </div>
  );
}

/* ── Hero-kort (tre tilstander) ────────────────────────────────────── */

/** Gratis-bruker som kan oppgradere → PRO-pris + feature-liste + CTA. */
function HeroOppgrader({ mobile }: { mobile: boolean }) {
  return (
    <Kort tint pad="24px 24px 26px" style={{ borderColor: `color-mix(in srgb,${T.lime} 32%,transparent)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <Caps color={T.lime}>PlayerHQ Pro</Caps>
        <StatusPill>Full tilgang</StatusPill>
      </div>
      <Pris tall="299" mobile={mobile} />
      <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "12px 0 0" }}>
        For deg som trener på egen hånd, uten coaching-pakke eller gruppe. Inkluderer:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {PRO_INKLUDERER.map((f) => (
          <Punkt key={f}>{f}</Punkt>
        ))}
      </div>
      <div style={{ marginTop: 22 }}>
        <LenkePille href="/portal/meg/abonnement/oppgrader/flyt" icon="sparkles" full>
          Start Pro · 299 kr/mnd
        </LenkePille>
      </div>
    </Kort>
  );
}

/** Aktiv betalende PRO (uten pakke) → pris + fornyes-dato. */
function HeroStatus({ fornyes, mobile }: { fornyes: string | null; mobile: boolean }) {
  return (
    <Kort tint pad="24px 24px 26px" style={{ borderColor: `color-mix(in srgb,${T.lime} 32%,transparent)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <Caps color={T.lime}>PlayerHQ Pro</Caps>
        <StatusPill tone="up">Aktiv</StatusPill>
      </div>
      <Pris tall="299" mobile={mobile} />
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "12px 0 0" }}>
        {fornyes ? `Fornyes ${fornyes}` : "Løper måned for måned, uten binding."}
      </p>
    </Kort>
  );
}

/** Gratis via coaching-pakke → «Inkludert»-kort med pakkenavn. */
function HeroGratis({ pakkeNavn }: { pakkeNavn: string | null }) {
  return (
    <Kort tint pad="24px 24px 26px">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <Caps color={T.lime}>Ditt abonnement</Caps>
        <StatusPill>Gratis</StatusPill>
      </div>
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em", color: T.fg, lineHeight: 1, marginTop: 14 }}>
        Inkludert
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "12px 0 0" }}>
        Full app-tilgang uten månedspris via{" "}
        <span style={{ color: T.lime, fontWeight: 600 }}>{pakkeNavn ?? "coaching-pakken din"}</span>, så lenge pakken er aktiv.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        <LenkePille href="/portal/booking" icon="calendar">Administrer pakke</LenkePille>
        <LenkePille href="/portal/meg/dokumenter" icon="file-text" ghost>Kvitteringer</LenkePille>
      </div>
    </Kort>
  );
}

/* ── Hjelpere ──────────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegAbonnementV2({ data }: { data: MegAbonnementData }) {
  const mobile = useMobile();
  const { hero, gratis, pakkeNavn, fornyes, betalingFeilet, kanOppgradere, kanEndreKort, kanAvbestille, fakturaer, flagg } = data;

  // Handlinger — bygges dynamisk, siste rad markeres for kant-fri bunn.
  const handlinger: { href: string; ic: string; l: string; sub: string }[] = [];
  if (kanOppgradere) handlinger.push({ href: "/portal/meg/abonnement/oppgrader/flyt", ic: "sparkles", l: "Oppgrader til Pro", sub: "299 kr/mnd · Stripe Checkout" });
  if (kanEndreKort) handlinger.push({ href: "/portal/meg/abonnement/kort/ny", ic: "credit-card", l: "Endre betalingskort", sub: "Kortdata lagres aldri hos oss" });
  if (kanAvbestille) handlinger.push({ href: "/portal/meg/abonnement/avbestill", ic: "x-circle", l: "Avbestill abonnement", sub: "Tilgang ut perioden, ingen nye trekk" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>Meg · Abonnement</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile}>Abonnement</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "12px 0 0", maxWidth: 540 }}>
          PlayerHQ har ingen nivåer. Appen er gratis så lenge du har en aktiv coaching-pakke, prøveperiode eller gruppe, ellers 299 kr/mnd.
        </p>
      </div>

      {/* Post-handling-banners (searchParams) + PAST_DUE-varsel */}
      {flagg.ok && (
        <Melding tone="ok">Betalingen er fullført. Det kan ta et lite øyeblikk før statusen under oppdateres.</Melding>
      )}
      {flagg.avbrutt && (
        <Melding tone="info">
          Betalingen ble avbrutt. Ingenting er trukket fra kortet ditt.
          {kanOppgradere && (
            <>
              {" "}
              <Link href="/portal/meg/abonnement/oppgrader/flyt" style={{ color: T.lime, fontWeight: 600 }}>
                Prøv igjen
              </Link>
            </>
          )}
        </Melding>
      )}
      {flagg.avbestilt && (
        <Melding tone="info">
          Abonnementet er avbestilt. Du beholder tilgangen ut inneværende periode{fornyes ? `, til ${fornyes}` : ""}.
        </Melding>
      )}
      {betalingFeilet && (
        <Melding tone="feil">
          <div>Siste betaling feilet. Oppdater betalingskortet for å beholde tilgangen.</div>
          <div style={{ marginTop: 12 }}>
            <LenkePille href="/portal/meg/abonnement/kort/ny" icon="credit-card" ghost>Endre kort</LenkePille>
          </div>
        </Melding>
      )}

      {/* Hero — velger riktig tilstand */}
      {hero === "oppgrader" ? (
        <HeroOppgrader mobile={mobile} />
      ) : hero === "status" ? (
        <HeroStatus fornyes={fornyes} mobile={mobile} />
      ) : (
        <HeroGratis pakkeNavn={pakkeNavn} />
      )}

      {/* Planer — de to app-tilgangs-nivåene (gratis / 299) */}
      <Kort eyebrow="Planer">
        <Rad
          title="Gratis"
          sub="Med coaching-pakke, prøveperiode eller gruppe"
          meta={gratis ? <StatusPill>Nå</StatusPill> : undefined}
          trailing={<span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>0 kr</span>}
        />
        <Rad
          last
          title="Kun PlayerHQ"
          sub="Uten coaching-pakke"
          meta={!gratis ? <StatusPill>Nå</StatusPill> : undefined}
          trailing={<span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>299 kr</span>}
        />
      </Kort>

      {/* Hva som inngår (likt for alle) */}
      <Kort eyebrow="Hva som inngår">
        {INNGAAR.map((f, i) => (
          <Rad
            key={f}
            last={i === INNGAAR.length - 1}
            leading={<Icon name="check" size={16} style={{ color: T.lime }} />}
            title={f}
            trailing={null}
          />
        ))}
      </Kort>

      {/* Handlinger */}
      {handlinger.length > 0 && (
        <Kort eyebrow="Handlinger">
          {handlinger.map((h, i) => (
            <Link key={h.href} href={h.href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <Rad
                last={i === handlinger.length - 1}
                leading={<Icon name={h.ic} size={16} style={{ color: T.mut }} />}
                title={h.l}
                sub={h.sub}
              />
            </Link>
          ))}
        </Kort>
      )}

      {/* Fakturaer */}
      {fakturaer.length > 0 && (
        <Kort eyebrow="Fakturaer" action={<Caps size={9}>{fakturaer.length} stk</Caps>}>
          {fakturaer.map((f) => (
            <Link key={f.id} href={`/portal/meg/abonnement/faktura/${f.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <Rad
                leading={<Icon name="file-text" size={16} style={{ color: T.mut }} />}
                title={f.tittel}
                sub={f.meta}
                meta={<StatusPill tone="up">Betalt</StatusPill>}
              />
            </Link>
          ))}
          <Link href="/portal/meg/dokumenter" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <Rad last leading={<Icon name="file-text" size={16} style={{ color: T.mut }} />} title="Alle dokumenter" />
          </Link>
        </Kort>
      )}

      {/* Bunn — administrer coaching-pakke (booking) */}
      <div>
        <LenkePille href="/portal/booking" icon="external-link" ghost>Administrer pakke</LenkePille>
      </div>
    </div>
  );
}
