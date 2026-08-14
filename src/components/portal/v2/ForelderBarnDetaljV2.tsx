"use client";

/**
 * Foreldreportal · Barn-profil — Paper-port (W5).
 * Fasit: designsystem/paper/fase2/forelder/forelder-barn.html, data-vis="barn".
 *
 * Struktur per fasit: hode (avatar + navn + alder/HCP) → fanerad (Uka/Plan/
 * Økonomi/Varsler/Samtykke — Uka er denne siden, resten lenker til
 * søsterrutene) → personvernlinje → kpirad → «Denne uka»-grid → ukerapport
 * fra coach → neste økt-rad → neste turnering-rad → CTA «Send melding til
 * coach». De gamle fanene (oversikt/uke/mål/økonomi) beholdes UNDER
 * fasit-innholdet — de dekker mer historikk enn malen viser, og URL-en
 * (?tab=) skal ikke fjernes.
 *
 * Ærlige avvik fra fasiten (dokumentert, ikke fabrikkert):
 * - Ingen "klasse"-felt (fasitens «Elite 1») finnes i datamodellen — droppet.
 * - Ingen fast tilknyttet coach-relasjon per spiller — «coach X»-teksten i
 *   fasitens undertittel er droppet, se ForelderCoachV2 for samme avgrensning.
 * - «Ukerapport fra coach» viser siste Notification (type="melding") — samme
 *   kilde som hentForelderUkerapport/ForelderCoachV2 — ikke en egen
 *   ukerapport-modell. «Neste rapport»-datoen i fasiten er ikke modellert.
 * - Samtykke leses fra User.guardianConsentGivenAt (ekte GuardianConsent-felt,
 *   satt av guardian-consent-token-flyten) — ikke fabrikkert.
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
  Rad,
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
    /** Fra dateOfBirth — kun vist når fødselsdato er kjent. */
    alder: number | null;
  };
  /** Ekte GuardianConsent-felt (User.guardianConsentGivenAt != null). */
  samtykkeGitt: boolean;
  /** Denne uka, Ma–Sø — time=null betyr ingen økt planlagt den dagen. */
  ukeGrid: { dato: Date; time: Date | null }[];
  nesteOkt: {
    title: string;
    scheduledAt: Date;
    durationMin: number;
    location: string | null;
  } | null;
  /** Siste coach-melding (Notification type="melding") — samme kilde som ForelderCoachV2. */
  coachMelding: { forfatter: string; tekst: string; sendtAt: Date } | null;
  nesteTurnering: { navn: string; dato: Date; status: string } | null;
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

// To-bokstavs ukedagsforkortelse (Ma/Ti/On/To/Fr/Lø/Sø), Oslo-korrekt.
const NB_UKEDAG_KORT = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  weekday: "short",
});
const NB_KL = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  hour: "2-digit",
  minute: "2-digit",
});

function ukedagKort(d: Date): string {
  const s = NB_UKEDAG_KORT.format(d).replace(".", "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TURNERING_STATUS: Record<string, string> = {
  PLANNED: "På planen",
  CLAIMED_REGISTERED: "Meldt på",
  CONFIRMED: "Påmeldt",
  WITHDRAWN: "Trukket",
  COMPLETED: "Gjennomført",
  DNF: "Fullførte ikke",
};

/* ── Faner til Paper-fasitens sider (Uka er denne siden) ─────────────── */

const FASIT_FANER: { label: string; href: (barnId: string) => string; aktiv?: true }[] = [
  { label: "Uka", href: (id) => `/forelder/barn/${id}`, aktiv: true },
  { label: "Plan", href: () => "/forelder/ukerapport" },
  { label: "Økonomi", href: () => "/forelder/okonomi" },
  { label: "Varsler", href: () => "/forelder/varsler" },
  { label: "Samtykke", href: () => "/forelder/samtykke" },
];

function FaneRad({ barnId }: { barnId: string }) {
  return (
    <nav
      aria-label="Visning"
      style={{ display: "flex", gap: 20, overflowX: "auto", borderBottom: `1px solid ${T.border}` }}
    >
      {FASIT_FANER.map((f) => (
        <Link
          key={f.label}
          href={f.href(barnId)}
          aria-pressed={f.aktiv ? "true" : "false"}
          style={{
            display: "block",
            padding: "0 2px 10px",
            fontFamily: T.ui,
            fontSize: 14,
            fontWeight: f.aktiv ? 600 : 500,
            color: f.aktiv ? T.fg : T.mut,
            borderBottom: f.aktiv ? `2px solid ${T.fg}` : "2px solid transparent",
            whiteSpace: "nowrap",
            textDecoration: "none",
          }}
        >
          {f.label}
        </Link>
      ))}
    </nav>
  );
}

/* ── Personvernlinje (fasit — hva forelder ser, aldri redigert) ──────── */

function Personvernlinje({ fornavn }: { fornavn: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "12px 14px",
        background: T.panel2,
        borderRadius: T.rCard,
        fontFamily: T.ui,
        fontSize: 12.5,
        color: T.mut,
        lineHeight: 1.5,
      }}
    >
      <Icon name="shield-check" size={14} style={{ color: T.mut, flex: "none", marginTop: 1 }} />
      <span>
        Du ser oppmøte, plan og økonomi. {fornavn}s egne notater, meldinger til coachen og velværelogg er
        hans/hennes — de vises ikke her.
      </span>
    </div>
  );
}

function UtenSamtykke({ fornavn }: { fornavn: string }) {
  return (
    <>
      <Kort>
        <TomTilstand
          icon="lock"
          title="Vi mangler samtykket ditt"
          sub={`${fornavn} har laget konto, men den åpnes ikke før foreldresamtykket er bekreftet. Sjekk e-posten din for lenken, eller les hva vi lagrer.`}
        />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
          <Link href="/forelder/samtykke" style={{ textDecoration: "none" }}>
            <Knapp icon="shield-check">Gå til samtykke</Knapp>
          </Link>
          <Link href="/personvern" style={{ textDecoration: "none" }}>
            <Knapp ghost icon="file-text">Les hva vi lagrer</Knapp>
          </Link>
        </div>
      </Kort>
      <Kort eyebrow="Dette ser du når samtykket er på plass">
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: 0, lineHeight: 1.6 }}>
          Oppmøte og treningstider, ukerapport fra coachen, plan for perioden, turneringer{" "}
          {fornavn} er påmeldt, og alt som gjelder betaling.
        </p>
      </Kort>
    </>
  );
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
              color: on ? T.onHandling : T.fg2,
              background: on ? T.handling : T.panel2,
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
    <div
      data-paper-slug="forelder-barn"
      data-paper-wave-e="forelder-sub"
      data-paper-portal-forelder-barn-detalj
      style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}
    >
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
            {barn.alder != null ? `${barn.alder} år · ` : ""}HCP{" "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{hcpStr}</span>
            <HjelpTips k="hcp" size={11} />
            · {barn.homeClub ?? "Ingen hjemmeklubb"}
          </span>
        </div>
      </div>

      <FaneRad barnId={barn.id} />

      {!data.samtykkeGitt ? (
        <UtenSamtykke fornavn={fornavn} />
      ) : (
        <>
          <Personvernlinje fornavn={fornavn} />

          {/* Oppmøte-proxy — samme kilde som «Uke»-fanen under, løftet opp per fasit */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: T.gap }}>
            <KpiFlis label="Økter · 4 uker" value={data.uke.antall} instant />
            <KpiFlis label="Timer trent" value={String(Math.round((data.uke.totalMinutter / 60) * 10) / 10).replace(".", ",")} sub="siste 7 dager" instant />
            <KpiFlis label="Runder" value={data.antallRunder} sub="siste 30 dager" instant />
          </div>

          {/* Denne uka — Ma–Sø */}
          <Kort eyebrow="Denne uka">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {data.ukeGrid.map((d) => (
                <div
                  key={d.dato.toISOString()}
                  style={{
                    padding: "8px 0",
                    borderRadius: T.rTag,
                    background: d.time ? T.panel2 : "transparent",
                    border: d.time ? "none" : `1px dashed ${T.border}`,
                    fontFamily: T.mono,
                    fontSize: 10,
                    color: d.time ? T.fg : T.mut,
                    textAlign: "center",
                  }}
                >
                  {ukedagKort(d.dato)}
                  <br />
                  {d.time ? NB_KL.format(d.time) : ""}
                </div>
              ))}
            </div>
            <p style={{ marginTop: 12, fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginBottom: 0 }}>
              {data.ukeGrid.filter((d) => d.time != null).length} økter planlagt denne uka.
            </p>
          </Kort>

          {/* Ukerapport fra coach (siste melding) */}
          <Kort eyebrow="Ukerapport fra coach">
            {data.coachMelding ? (
              <>
                <p style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.fg, lineHeight: 1.6, margin: 0 }}>
                  {data.coachMelding.tekst || data.coachMelding.forfatter}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
                  <span>Sendt</span>
                  <span>{NB_KORT.format(data.coachMelding.sendtAt)}</span>
                </div>
              </>
            ) : (
              <TomTilstand icon="message-circle" title="Ingen ukerapport ennå" sub="Coachen har ikke sendt en melding ennå." />
            )}
          </Kort>

          {data.nesteOkt && (
            <Rad
              onClick={() => router.push(`/forelder/barn/${barn.id}?tab=uke`)}
              title={`Neste økt · ${data.nesteOkt.title}`}
              sub={`${NB_KORT.format(data.nesteOkt.scheduledAt)} · ${NB_KL.format(data.nesteOkt.scheduledAt)}${data.nesteOkt.location ? ` · ${data.nesteOkt.location}` : ""}`}
              trailing={<Icon name="chevron-right" size={16} style={{ color: T.mut }} />}
            />
          )}

          {data.nesteTurnering && (
            <Rad
              onClick={() => router.push("/forelder/ukerapport")}
              title={data.nesteTurnering.navn}
              sub={`${NB_KORT.format(data.nesteTurnering.dato)} · ${TURNERING_STATUS[data.nesteTurnering.status] ?? data.nesteTurnering.status}`}
              trailing={<Icon name="chevron-right" size={16} style={{ color: T.mut }} />}
            />
          )}

          <Link href="/forelder/coach" style={{ textDecoration: "none" }}>
            <Knapp icon="message-circle" full>
              Send melding til coach
            </Knapp>
          </Link>
        </>
      )}

      {/* ── Under fasit-innholdet: eksisterende dybdedata (uendret). Samme
          samtykke-gate som over — ingen treningsdata vises uten bekreftet
          foreldresamtykke. ── */}
      {data.samtykkeGitt && (
      <>
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
                          background: T.handling,
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
      </>
      )}
    </div>
  );
}
