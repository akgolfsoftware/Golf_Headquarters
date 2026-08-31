"use client";

/**
 * AgencyOS — Plan-hub (AG-06, Train-lock).
 *
 * Fasit: `designsystem/train-lock/AG-06 Plan-hub.dc.html` (AG-06a iPhone,
 * AG-06b iPad, AG-06c Mac). Hub-prinsipp fra fasiten: «se og velg» — én hvit
 * primær CTA («Åpne uke i Workbench»), ingen redigering her. Mobil (AG-06a)
 * og desktop (AG-06b/c slått sammen til én md:/lg:-variant, se CLAUDE.md
 * §Design «port oppførsel/hierarki, ikke HTML 1:1») viser seks rader med
 * ekte tall (Ukemaler/Treningsprogram/Månedsplaner/Standardøkter/
 * Øvelsesbank/Teknisk plan) — datakontrakt bygget i
 * `src/app/admin/plan/page.tsx` (MASTERPLAN 15.9, flyttet fra
 * admin/planlegge/page.tsx — «Teknisk plan» lagt til som sjette rad).
 *
 * Månedsplaner har ingen modell i skjemaet ennå (måned/år er bevisst
 * utenfor bølge 1) — raden vises alltid med 0 og er aria-disabled, aldri
 * klikkbar, aldri fabrikert tall (CLAUDE.md «aldri slurv»).
 *
 * Tokens: KUN TL (src/lib/v2/train-lock.ts).
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { TlKnapp } from "@/components/admin/v2/oppsett/tl-kit";

export type PlanHubRadId =
  | "ukemaler"
  | "program"
  | "maanedsplaner"
  | "standardokter"
  | "ovelsesbank"
  | "tekniskplan";

export interface PlanHubRad {
  id: PlanHubRadId;
  tittel: string;
  undertekst: string;
  antall: number;
  href: string | null;
}

export interface PlanHubMalRad {
  id: string;
  navn: string;
  meta: string;
  href: string;
}

export interface PlanHubData {
  coachFornavn: string;
  ukenummer: number;
  spillerAntall: number;
  oktAntall: number;
  udekketAntall: number;
  rader: PlanHubRad[];
  primaerHref: string;
  ukemalRader: PlanHubMalRad[];
  programRader: PlanHubMalRad[];
}

function CapsLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: TL.font.sans,
        fontSize: 11,
        fontWeight: TL.vekt.caps,
        letterSpacing: TL.track.capsSm,
        textTransform: "uppercase",
        color: TL.mute,
      }}
    >
      {children}
    </span>
  );
}

function MetaLinje({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 6,
        fontFamily: TL.font.sans,
        fontSize: 13,
        color: TL.mute,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {children}
    </div>
  );
}

function PrimaerCta({ href, bredde = "full" }: { href: string; bredde?: "full" | "auto" }) {
  return (
    <Link
      href={href}
      className="v2-press v2-focus"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 48,
        width: bredde === "full" ? "100%" : undefined,
        padding: bredde === "auto" ? "0 22px" : undefined,
        borderRadius: TL.radius.pill,
        background: TL.fill,
        color: TL.onFill,
        fontFamily: TL.font.sans,
        fontSize: 16,
        fontWeight: TL.vekt.cta,
      }}
    >
      Åpne uke i Workbench
    </Link>
  );
}

function HubRadRow({ rad, sisteRad }: { rad: PlanHubRad; sisteRad: boolean }) {
  const innhold = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "15px 20px",
        borderBottom: sisteRad ? "none" : `1px solid ${TL.hair}`,
        opacity: rad.href ? 1 : 0.5,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
          {rad.tittel}
        </div>
        <div style={{ marginTop: 2, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
          {rad.undertekst}
        </div>
      </div>
      <span
        style={{
          fontFamily: TL.font.sans,
          fontSize: 13,
          color: TL.mute,
          fontVariantNumeric: "tabular-nums",
          flex: "none",
        }}
      >
        {rad.antall}
      </span>
      {rad.href ? (
        <Icon name="chevron-right" size={16} style={{ color: TL.mute, flex: "none" }} />
      ) : null}
    </div>
  );

  if (!rad.href) {
    return (
      <div role="button" aria-disabled="true">
        {innhold}
      </div>
    );
  }
  return (
    <Link href={rad.href} className="v2-press v2-focus" style={{ display: "block" }}>
      {innhold}
    </Link>
  );
}

function MalListe({ tittel, rader, tomtekst }: { tittel: string; rader: PlanHubMalRad[]; tomtekst: string }) {
  return (
    <div>
      <CapsLabel>{tittel}</CapsLabel>
      {rader.length === 0 ? (
        <div
          style={{
            marginTop: 12,
            borderRadius: TL.radius.card,
            background: TL.elev,
            padding: "18px 20px",
            fontFamily: TL.font.sans,
            fontSize: 13,
            color: TL.mute,
          }}
        >
          {tomtekst}
        </div>
      ) : (
        <div style={{ marginTop: 12, borderRadius: TL.radius.card, background: TL.elev, padding: "4px 20px" }}>
          {rader.map((r, i) => (
            <Link
              key={r.id}
              href={r.href}
              className="v2-press v2-focus"
              style={{
                display: "flex",
                alignItems: "center",
                padding: "15px 0",
                borderBottom: i === rader.length - 1 ? "none" : `1px solid ${TL.hair}`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
                  {r.navn}
                </div>
                <div style={{ marginTop: 2, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>{r.meta}</div>
              </div>
              <Icon name="chevron-right" size={14} style={{ color: TL.mute, flex: "none" }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function PlanHubV2({ data }: { data: PlanHubData }) {
  const ukeMeta = `Uke ${data.ukenummer} · ${data.spillerAntall} spillere · ${data.oktAntall} økter${
    data.udekketAntall > 0 ? ` · ${data.udekketAntall} udekket` : ""
  }`;

  return (
    <>
      {/* Mobil — AG-06a: hub-liste + primær CTA nederst i innholdsflyten. */}
      <div className="lg:hidden" style={{ padding: "4px 0 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <CapsLabel>Academy · sesong {new Date().getFullYear()}</CapsLabel>
            <h1
              style={{
                margin: "6px 0 0",
                fontFamily: TL.font.sans,
                fontSize: 34,
                fontWeight: TL.vekt.tittel,
                letterSpacing: "-0.02em",
                color: TL.text,
              }}
            >
              Plan
            </h1>
          </div>
          <TlKnapp href="/admin/plan-templates/ny" icon="plus" variant="sekundaer">
            Ny mal
          </TlKnapp>
        </div>
        <MetaLinje>{ukeMeta}</MetaLinje>
        <div style={{ marginTop: 18, borderRadius: TL.radius.card, background: TL.elev, padding: "4px 20px" }}>
          {data.rader.map((rad, i) => (
            <HubRadRow key={rad.id} rad={rad} sisteRad={i === data.rader.length - 1} />
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <PrimaerCta href={data.primaerHref} />
        </div>
        <div style={{ marginTop: 12, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
          Planen redigeres i Workbench. Gjennomføring og rom bor i Kalender.
        </div>
      </div>

      {/* Desktop — AG-06b/c slått sammen: header + KPI-rad + to malkolonner. */}
      <div className="hidden lg:block" style={{ padding: "8px 0 32px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
          <div>
            <CapsLabel>Academy · sesong {new Date().getFullYear()}</CapsLabel>
            <h1
              style={{
                margin: "4px 0 0",
                fontFamily: TL.font.sans,
                fontSize: 34,
                fontWeight: TL.vekt.tittel,
                letterSpacing: "-0.02em",
                color: TL.text,
              }}
            >
              Plan
            </h1>
          </div>
          <span
            style={{
              fontFamily: TL.font.sans,
              fontSize: 13,
              color: TL.mute,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {ukeMeta}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <TlKnapp href="/admin/plan-templates/ny" icon="plus" variant="sekundaer">
              Ny mal
            </TlKnapp>
            <PrimaerCta href={data.primaerHref} bredde="auto" />
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: `repeat(${data.rader.length}, 1fr)`,
            gap: 14,
          }}
        >
          {data.rader.map((rad) => {
            const kort = (
              <div style={{ borderRadius: TL.radius.card, background: TL.elev, padding: 20, opacity: rad.href ? 1 : 0.5 }}>
                <div
                  style={{
                    fontFamily: TL.font.sans,
                    fontSize: 34,
                    fontWeight: TL.vekt.tall,
                    color: TL.text,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {rad.antall}
                </div>
                <div style={{ marginTop: 8 }}>
                  <CapsLabel>{rad.tittel}</CapsLabel>
                </div>
              </div>
            );
            return rad.href ? (
              <Link key={rad.id} href={rad.href} className="v2-press v2-focus" style={{ display: "block" }}>
                {kort}
              </Link>
            ) : (
              <div key={rad.id} role="button" aria-disabled="true">
                {kort}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <MalListe tittel="Ukemaler" rader={data.ukemalRader} tomtekst="Ingen ukemaler ennå." />
          <div>
            <MalListe tittel="Treningsprogram" rader={data.programRader} tomtekst="Ingen treningsprogram ennå." />
            <div style={{ marginTop: 16, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
              Hub-nivå. Ingen redigering her — Workbench eier innholdet, Kalender eier tid og rom.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
