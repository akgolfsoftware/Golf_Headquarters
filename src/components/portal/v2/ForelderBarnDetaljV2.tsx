"use client";

/**
 * Foreldreportal · Barn-profil — v2 Presis + B-pakke (status først, én vei).
 * Read-only. Kun v2 + T.*. Enklere foreldre-språk. Faner uendret.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PaymentStatus, PyramidArea } from "@/generated/prisma/client";
import {
  T,
  fmtSg,
  Caps,
  Tittel,
  Kort,
  KpiFlis,
  Pyramide,
  TomTilstand,
  AvatarFoto,
  TilbakeLenke,
  StatusPill,
  HjelpTips,
  Icon,
  Knapp,
  type StatusTone,
} from "@/components/v2";

/* ── Datakontrakt (1:1 med page.tsx-loaderen) ──────────────────────── */

export type BarnDetaljTab = "oversikt" | "uke" | "mal" | "okonomi";

export type ForelderBarnDetaljData = {
  barn: {
    id: string;
    navn: string;
    avatarUrl: string | null;
    hcp: number | null;
    homeClub: string | null;
  };
  tab: BarnDetaljTab;
  antallRunder: number;
  /** Snitt SG over runder med sgTotal, eller null når ingen. */
  avgSg: number | null;
  /** Pyramide-fordeling i % av øktene i aktiv plan (apex→base). */
  pyramide: { akse: PyramidArea; pct: number }[];
  aktivPlan: {
    name: string;
    sessions: {
      id: string;
      title: string;
      scheduledAt: Date;
      pyramidArea: PyramidArea;
      status: string;
      rating: number | null;
    }[];
  } | null;
  goals: {
    id: string;
    title: string;
    type: string;
    targetValue: number | null;
    targetDate: Date | null;
    /** Ekte HCP-fremdrift (kun HCP_TARGET), ellers null → ingen bar. */
    fremdriftPct: number | null;
  }[];
  rounds: { id: string; playedAt: Date; score: number; sgTotal: number | null }[];
  uke: {
    antall: number;
    totalMinutter: number;
    snittRating: number | null;
    logg: { dato: Date | null; minutter: number; rating: number | null }[];
  };
  payments: {
    id: string;
    tekst: string;
    amountOre: number;
    status: PaymentStatus;
    createdAt: Date;
  }[];
};

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const NB_KORT = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "short",
});

function ore(n: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(n / 100);
}

const TABS: { key: BarnDetaljTab; label: string }[] = [
  { key: "oversikt", label: "Oversikt" },
  { key: "uke", label: "Uke" },
  { key: "mal", label: "Mål" },
  { key: "okonomi", label: "Økonomi" },
];

// Norsk etikett per Goal-type (enum-verdier er rå strenger i schema).
const GOAL_TYPE_LABELS: Record<string, string> = {
  HCP_TARGET: "HCP-mål",
  ROUNDS_PER_MONTH: "Runder per måned",
  SG_AREA: "SG-område",
  FREE_TEXT: "Fritekst",
};

function goalTypeLabel(type: string): string {
  return GOAL_TYPE_LABELS[type] ?? type;
}

// Økt-status i klarspråk (fallback: rå enum-verdi).
const SESJON_STATUS: Record<string, string> = {
  PLANNED: "Planlagt",
  ACTIVE: "Aktiv",
  COMPLETED: "Fullført",
  CANCELLED: "Avlyst",
  SKIPPED: "Hoppet over",
};

function betalingsStatus(s: PaymentStatus): { tekst: string; tone: StatusTone } {
  if (s === "SUCCEEDED") return { tekst: "Betalt", tone: "up" };
  if (s === "REFUNDED" || s === "PARTIALLY_REFUNDED")
    return { tekst: "Refundert", tone: "info" };
  if (s === "FAILED") return { tekst: "Feilet", tone: "down" };
  return { tekst: "Ubetalt", tone: "warn" };
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

/* ── Fane-nav (server-rendret via ?tab=-lenker — PillTabs-idiomet) ── */

function TabLenker({ barnId, aktiv }: { barnId: string; aktiv: BarnDetaljTab }) {
  return (
    <nav aria-label="Profilseksjoner" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
      {TABS.map((t) => {
        const on = t.key === aktiv;
        return (
          <Link
            key={t.key}
            href={`/forelder/barn/${barnId}?tab=${t.key}`}
            aria-current={on ? "page" : undefined}
            className="v2-press v2-focus"
            style={{
              fontFamily: T.ui,
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 15px",
              borderRadius: 9999,
              color: on ? T.onLime : T.fg2,
              background: on ? T.lime : T.panel2,
              border: `1px solid ${on ? "transparent" : T.border}`,
              whiteSpace: "nowrap",
              textDecoration: "none",
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

/* ── Delte rad-mønstre ─────────────────────────────────────────────── */

function ListeRad({
  tittel,
  sub,
  trailing,
  last,
}: {
  tittel: React.ReactNode;
  sub?: React.ReactNode;
  trailing?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 0",
        borderBottom: last ? "none" : `1px solid ${T.border}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: T.ui,
            fontSize: 13.5,
            fontWeight: 600,
            color: T.fg,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {tittel}
        </div>
        {sub && (
          <div
            style={{
              marginTop: 3,
              fontFamily: T.mono,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.mut,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {sub}
          </div>
        )}
      </div>
      {trailing}
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderBarnDetaljV2({ data }: { data: ForelderBarnDetaljData }) {
  const mobile = useMobile();
  const router = useRouter();
  const { barn, tab } = data;
  const fornavn = barn.navn.split(" ")[0];
  const etternavn = barn.navn.split(" ").slice(1).join(" ");
  const hcpStr = barn.hcp != null ? barn.hcp.toFixed(1).replace(".", ",") : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Tilbake + hode */}
      <div>
        <TilbakeLenke href="/forelder/barn">Mine barn</TilbakeLenke>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <AvatarFoto src={barn.avatarUrl} navn={barn.navn} size={mobile ? 48 : 56} />
        <div style={{ minWidth: 0 }}>
          <Caps size={9.5}>
            Foreldreportal · Barn-profil
          </Caps>
          <div style={{ marginTop: 4 }}>
            <Tittel mobile={mobile}>
              <span style={{ color: T.lime }}>{fornavn}</span>
              {etternavn ? ` ${etternavn}` : ""}
            </Tittel>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 6,
              fontFamily: T.mono,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.mut,
            }}
          >
            HCP <span style={{ fontVariantNumeric: "tabular-nums" }}>{hcpStr}</span>
            <HjelpTips k="hcp" size={11} />
            · {barn.homeClub ?? "Ingen hjemmeklubb"}
          </span>
        </div>
      </div>

      {/* Status først — HCP · runder · form */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: T.gap }}>
        <KpiFlis label="HCP" value={hcpStr} hjelp="hcp" instant />
        <KpiFlis label="Runder" value={data.antallRunder} instant />
        <KpiFlis
          label="Form (SG)"
          value={data.avgSg != null ? fmtSg(data.avgSg) : "—"}
          hjelp="sgTotal"
          instant
        />
      </div>

      {/* Én primær vei videre (B) */}
      <div>
        <Knapp
          icon={tab === "uke" ? "message-circle" : "calendar"}
          full={mobile}
          onClick={() =>
            router.push(
              tab === "uke"
                ? "/forelder/coach"
                : `/forelder/barn/${barn.id}?tab=uke`,
            )
          }
        >
          {tab === "uke" ? "Kontakt coach" : `Se uka til ${fornavn}`}
        </Knapp>
      </div>

      {/* Treningsfordeling fra aktiv plan */}
      <Kort
        eyebrow={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Hva det trenes på
            <HjelpTips k="pyramideAkse" size={11} />
          </span>
        }
      >
        {data.aktivPlan ? (
          <>
            <Pyramide data={data.pyramide.map((p) => ({ akse: p.akse, value: p.pct }))} max={100} showValues />
            <span style={{ marginTop: 10, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
              Andel av øktene i planen, i prosent.
            </span>
          </>
        ) : (
          <TomTilstand
            icon="calendar"
            title="Ingen aktiv plan ennå"
            sub="Når coachen aktiverer en plan, ser du fordelingen her."
          />
        )}
      </Kort>

      {/* Sesongmål · fremdrift (bar KUN når ekte kalkulerbar HCP-fremdrift) */}
      {data.goals.length > 0 && (
        <Kort eyebrow="Sesongmål · fremdrift">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {data.goals.slice(0, 5).map((g) => {
              const frist = g.targetDate ? NB_DATO.format(g.targetDate) : null;
              return (
                <div key={g.id}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
                        {g.title}
                      </div>
                      <div
                        style={{
                          marginTop: 3,
                          fontFamily: T.mono,
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: T.mut,
                        }}
                      >
                        {goalTypeLabel(g.type)}
                        {g.targetValue != null ? ` · mål ${g.targetValue}` : ""}
                        {frist ? ` · frist ${frist}` : ""}
                      </div>
                    </div>
                    <Icon name="flag" size={13} style={{ color: T.mut, flex: "none", marginTop: 2 }} />
                  </div>
                  {g.fremdriftPct != null && (
                    <div
                      style={{
                        marginTop: 8,
                        height: 7,
                        borderRadius: 9999,
                        background: T.track,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${g.fremdriftPct}%`,
                          height: "100%",
                          borderRadius: 9999,
                          background: T.lime,
                          opacity: 0.9,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Kort>
      )}

      {/* Fane-navigasjon (?tab=, server-rendret) */}
      <TabLenker barnId={barn.id} aktiv={tab} />

      {/* Oversikt */}
      {tab === "oversikt" && (
        <>
          <Kort eyebrow="Aktiv plan">
            {!data.aktivPlan ? (
              <TomTilstand
                icon="calendar"
                title="Ingen aktiv plan"
                sub="Coachen har ikke satt i gang en plan ennå. Spør gjerne."
              />
            ) : (
              <>
                <div style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.fg, marginBottom: 4 }}>
                  {data.aktivPlan.name}
                </div>
                {data.aktivPlan.sessions.map((s, i) => (
                  <ListeRad
                    key={s.id}
                    tittel={s.title}
                    sub={`${NB_DATO.format(s.scheduledAt)} · ${s.pyramidArea} · ${SESJON_STATUS[s.status] ?? s.status}`}
                    trailing={
                      s.rating != null ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontFamily: T.mono,
                            fontSize: 11.5,
                            fontWeight: 700,
                            fontVariantNumeric: "tabular-nums",
                            color: T.fg2,
                            flex: "none",
                          }}
                        >
                          <Icon name="star" size={12} style={{ color: T.lime }} />
                          {s.rating}/5
                        </span>
                      ) : undefined
                    }
                    last={i === data.aktivPlan!.sessions.length - 1}
                  />
                ))}
              </>
            )}
          </Kort>

          <Kort eyebrow="Siste runder">
            {data.rounds.length === 0 ? (
              <TomTilstand
                icon="flag"
                title="Ingen runder registrert"
                sub="Runder dukker opp her når spilleren logger dem."
              />
            ) : (
              data.rounds.map((r, i) => (
                <ListeRad
                  key={r.id}
                  tittel={NB_DATO.format(r.playedAt)}
                  trailing={
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: 12,
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        color: T.fg2,
                        flex: "none",
                      }}
                    >
                      Score {r.score}
                      {r.sgTotal != null ? ` · SG ${fmtSg(r.sgTotal)}` : ""}
                    </span>
                  }
                  last={i === data.rounds.length - 1}
                />
              ))
            )}
          </Kort>
        </>
      )}

      {/* Uke */}
      {tab === "uke" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap }}>
            <KpiFlis label="Økter · siste 28 dgr" value={data.uke.antall} instant />
            <KpiFlis
              label="Treningstid"
              value={`${Math.round(data.uke.totalMinutter / 60)} t`}
              instant
            />
            <KpiFlis
              label="Snitt-rating"
              value={data.uke.snittRating != null ? `${String(data.uke.snittRating).replace(".", ",")}/5` : "—"}
              instant
            />
          </div>

          <Kort eyebrow="Logg · siste 4 uker">
            {data.uke.logg.length === 0 ? (
              <TomTilstand
                icon="clock"
                title="Ingen registrerte økter siste 4 uker"
                sub="Fullførte økter dukker opp her fortløpende."
              />
            ) : (
              data.uke.logg.slice(0, 12).map((l, i) => (
                <ListeRad
                  key={i}
                  tittel={l.dato ? NB_KORT.format(l.dato) : "—"}
                  trailing={
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: 12,
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        color: T.fg2,
                        flex: "none",
                      }}
                    >
                      {l.minutter} min
                      {l.rating != null ? ` · ${l.rating}/5` : ""}
                    </span>
                  }
                  last={i === Math.min(data.uke.logg.length, 12) - 1}
                />
              ))
            )}
          </Kort>
        </>
      )}

      {/* Mål */}
      {tab === "mal" && (
        <Kort eyebrow="Aktive mål">
          {data.goals.length === 0 ? (
            <TomTilstand
              icon="target"
              title="Ingen mål satt"
              sub="Mål settes av spilleren og coachen i Workbench."
            />
          ) : (
            data.goals.map((g, i) => (
              <ListeRad
                key={g.id}
                tittel={g.title}
                sub={`${goalTypeLabel(g.type)}${g.targetValue != null ? ` · mål ${g.targetValue}` : ""}`}
                last={i === data.goals.length - 1}
              />
            ))
          )}
        </Kort>
      )}

      {/* Økonomi */}
      {tab === "okonomi" && (
        <Kort
          eyebrow="Betalinger"
          action={<Caps size={9}>{data.payments.length} totalt</Caps>}
        >
          {data.payments.length === 0 ? (
            <TomTilstand
              icon="credit-card"
              title="Ingen fakturaer registrert"
              sub="Fakturaer og betalinger dukker opp her."
            />
          ) : (
            data.payments.map((p, i) => {
              const st = betalingsStatus(p.status);
              return (
                <ListeRad
                  key={p.id}
                  tittel={p.tekst}
                  sub={NB_KORT.format(p.createdAt)}
                  trailing={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flex: "none" }}>
                      <span
                        style={{
                          fontFamily: T.mono,
                          fontSize: 12.5,
                          fontWeight: 700,
                          fontVariantNumeric: "tabular-nums",
                          color: T.fg,
                        }}
                      >
                        {ore(p.amountOre)}
                      </span>
                      <StatusPill tone={st.tone}>{st.tekst}</StatusPill>
                    </span>
                  }
                  last={i === data.payments.length - 1}
                />
              );
            })
          )}
        </Kort>
      )}
    </div>
  );
}
