"use client";

/**
 * PlayerHQ Meg — v2 (retning C «Presis»). Komponert 1:1 fra
 * ui_kits/v2/phq-skjermer.jsx → funksjonen Meg, men med EKTE data fra
 * hentProfil + getGoals + Round-aggregat (montert i (v2preview)/v2-meg/page.tsx).
 * Kun v2-komponenter fra "@/components/v2"; ingen ad-hoc UI. Ingen rå hex (kun T.*).
 *
 * Ærlighet: felt som mockupen viser men repoet ikke bærer (WAGR/kategori,
 * P-milepæler, birdies/treningstimer) fabrikkeres ALDRI — de får ærlig
 * tom-tilstand og meldes som gap. Mål bor i Oversikt, redigeres i Workbench (låst).
 *
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Tier } from "@/generated/prisma/client";
import type { GoalItem } from "@/app/portal/actions";
import { logout } from "@/lib/auth/logout";
import {
  T,
  fmtSg,
  Caps,
  Tittel,
  Kort,
  StatusPill,
  Rad,
  ProgresjonsBar,
  AvatarFoto,
  TomTilstand,
  Icon,
  type StatusTone,
} from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type MegData = {
  navn: string;
  avatarUrl: string | null;
  hcp: number | null;
  homeClub: string | null;
  tier: Tier;
  goals: GoalItem[];
  /** Sesongen i tall — brutto score, avledet av alle Round-rader. */
  sesong: {
    runder: number;
    besteRunde: number | null;
    snittScore: number | null;
    sgSnitt: number | null;
  };
};

/* ── Rene hjelpere (norsk bokmål) ──────────────────────────────────── */

function hcpTekst(hcp: number | null): string {
  if (hcp == null) return "–";
  return hcp.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

function snittTekst(v: number | null): string {
  if (v == null) return "–";
  return v.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

function kategoriLabel(k: GoalItem["category"]): string {
  return k === "OUTCOME" ? "Resultatmål" : "Prosessmål";
}

function tierSub(tier: Tier): string {
  // ELITE er dødt enum — behandles som gratis. Kun to nivåer: gratis / 299 kr/mnd.
  return tier === "PRO" ? "PlayerHQ Pro · 299 kr/mnd" : "PlayerHQ Gratis";
}

/** Nedtellings-/status-pill for det primære (nærmeste) målet. */
function maalPill(g: GoalItem): { l: string; tone: StatusTone } | null {
  if (g.status === "ACHIEVED") return { l: "Oppnådd", tone: "up" };
  if (g.daysLeft == null) return null;
  if (g.daysLeft < 0) return { l: "Forfalt", tone: "warn" };
  return { l: `${g.daysLeft} dager igjen`, tone: "lime" };
}

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

/* ── Konto-rader (ekte adresser) ───────────────────────────────────── */

type KontoRad = { ic: string; l: string; sub?: string; href: string };

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegV2({ data }: { data: MegData }) {
  const mobile = useMobile();
  const { navn, avatarUrl, hcp, homeClub, tier, goals, sesong } = data;

  // Meta-linje — ærlig avledet av hcp + klubb (WAGR/kategori finnes ikke i data).
  const metaDeler: string[] = [];
  if (hcp != null) metaDeler.push(`HCP ${hcpTekst(hcp)}`);
  if (homeClub) metaDeler.push(homeClub);

  const primaer = goals[0] ?? null;
  const pill = primaer ? maalPill(primaer) : null;

  // Sesongen i tall — kun genuint sporbare Round-felter (brutto score).
  const tall: { l: string; v: string }[] = [
    { l: "Runder", v: String(sesong.runder) },
    { l: "Beste runde", v: sesong.besteRunde != null ? String(sesong.besteRunde) : "–" },
    { l: "Snittscore", v: snittTekst(sesong.snittScore) },
    { l: "SG total", v: sesong.sgSnitt != null ? fmtSg(sesong.sgSnitt) : "–" },
  ];

  const konto: KontoRad[] = [
    { ic: "user", l: "Profil og innstillinger", sub: "Navn, HCP, klubb", href: "/portal/meg/profil" },
    { ic: "calendar-plus", l: "Book coachtime", sub: "Velg tjeneste, coach og tid", href: "/portal/booking" },
    { ic: "credit-card", l: "Abonnement", sub: tierSub(tier), href: "/portal/meg/abonnement" },
    { ic: "bell", l: "Varsler", sub: "Push og e-post", href: "/portal/meg/innstillinger" },
    { ic: "shield", l: "Personvern og samtykke", href: "/portal/meg/innstillinger" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode — avatar + navn + meta */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <AvatarFoto src={avatarUrl} navn={navn} size={64} ring />
        <div>
          <Tittel mobile={mobile}>{navn}</Tittel>
          {metaDeler.length > 0 && <Caps style={{ marginTop: 8 }}>{metaDeler.join(" · ")}</Caps>}
        </div>
      </div>

      {/* Sesongmål + utviklingsplan */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]" style={{ gap: T.gap, alignItems: "start" }}>
        <Kort tint eyebrow="Sesongmål" action={pill ? <StatusPill tone={pill.tone}>{pill.l}</StatusPill> : undefined}>
          {primaer ? (
            <>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg, lineHeight: 1.25 }}>
                {primaer.title}
              </div>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 13 }}>
                {goals.map((g) => (
                  <ProgresjonsBar key={g.id} variant="bar" value={g.progress} max={100} label={kategoriLabel(g.category)} />
                ))}
              </div>
            </>
          ) : (
            <TomTilstand icon="target" title="Ingen mål satt" sub="Mål settes i Oversikt og redigeres i Workbench." />
          )}
        </Kort>

        <Kort eyebrow="Utviklingsplan · P-milepæler">
          <TomTilstand icon="flag" title="Ingen milepæler ennå" sub="Utviklingsplanen bygges i Workbench." />
        </Kort>
      </div>

      {/* Sesongen i tall */}
      <Kort eyebrow="Sesongen i tall">
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "16px 20px" }}>
          {tall.map((t) => (
            <div key={t.l}>
              <Caps size={9}>{t.l}</Caps>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 26,
                  fontWeight: 700,
                  color: T.fg,
                  display: "block",
                  marginTop: 8,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {t.v}
              </span>
            </div>
          ))}
        </div>
      </Kort>

      {/* Konto */}
      <Kort eyebrow="Konto">
        {konto.map((k, i) => (
          <Link key={`${k.l}-${i}`} href={k.href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <Rad
              leading={<Icon name={k.ic} size={16} style={{ color: T.mut }} />}
              title={k.l}
              sub={k.sub}
            />
          </Link>
        ))}
        <form action={logout}>
          <button
            type="submit"
            style={{
              all: "unset",
              boxSizing: "border-box",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "11px 0",
            }}
          >
            <Icon name="log-out" size={16} style={{ color: T.down }} />
            <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.down }}>
              Logg ut
            </span>
          </button>
        </form>
      </Kort>
    </div>
  );
}
