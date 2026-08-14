"use client";

/**
 * AgencyOS Godkjenninger — 1:1 port av
 * designsystem/paper/fase2/agencyos/agencyos-godkjenninger.html.
 *
 * Fasitens form: filterpiller PER KILDE (Alle/Agent/Caddie-utkast/
 * Økt-forespørsler) med reelle tellinger, «N VENTER PÅ DEG» + ghost
 * «Godkjenn N lavrisiko samlet», en tidsordnet, flat kø av saks-kort (ikke
 * gruppert per spiller), «Løst nylig», og en fast 380px høyrekolonne
 * («Køen i tall») på desktop ≥1024px. Tilstand-riggbaren i fasiten er
 * demo-chrome og er ikke bygget.
 *
 * Avvik fra fasiten (data-ærlighet, se sluttrapport):
 *  - «Utsett» finnes ikke — ingen server action for å utsette en PlanAction.
 *  - «Rediger utkast» (caddie) er slått sammen med «Åpne i Caddie» — det
 *    finnes ingen egen inline-redigeringsflate for et CaddieDraft.
 *  - «Foreslå annen tid» (forespørsel) lenker til /admin/foresporsler —
 *    ingen egen «foreslå tid»-handling finnes ennå.
 *  - «Hvorfor?» viser én sammenhengende forklaringslinje (provenanceLesbarTekst),
 *    ikke fasitens tre strukturerte punkter (Agent/Data/Regel) — provenance-
 *    modellen lagrer ikke de tre feltene separat.
 *  - «Løst nylig» viser faktisk godkjenningstidspunkt, ikke fasitens
 *    fremtidige «sjekk DATO» — vi lagrer ikke en fremtidig sjekk-dato.
 */

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Caps, Icon, T } from "@/components/v2";
import { handlingstypeLabel } from "@/lib/labels/handlingstyper";
import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";
import { avvisProaktivtForslag, godkjennCaddieDraft } from "@/app/admin/agencyos/caddie/dashbord/actions";
import { avslaaForespørsel, markerSomPlanlagt } from "@/app/admin/(legacy)/foresporsler/actions";
import { batchApproveLowRisk } from "@/app/admin/(legacy)/approvals/actions";

// ── Datakontrakt (mappes fra Prisma i ruten) ────────────────────
export interface AdminGodkjenningV2Row {
  id: string;
  actionType: string;
  playerId: string;
  who: string;
  title: string;
  detail: string;
  signalKind: string | null;
  signalValue: string | null;
  diffPreview: string | null;
  when: string;
  urgent: boolean;
  lowRisk: boolean;
  /** A1: kilde-chip — "agent" (PlanAction) | "caddie" | "forespørsel". */
  kilde?: "agent" | "caddie" | "forespørsel";
  /** A1: kilder uten inline godkjenn-action lenker til sin flate. */
  eksternHref?: string | null;
  /** Punkt 5: lesbar forklaring fra PlanAction.provenance. Skjules når null
   *  (eldre saker uten strukturert kilde-sporing). */
  hvorfor?: string | null;
}
export interface AdminGodkjenningerV2Data {
  rows: AdminGodkjenningV2Row[];
  lowRiskCount: number;
  /** Kanonisk kø-telling (koTelling) — samme tall som innboks-banner/varsler. */
  totalt?: number;
  /** Nylig godkjente saker med sjekkpunkt (Løst / ETTER→FØR). */
  lostSjekkpunkter?: {
    id: string;
    who: string;
    sjekkpunkt: string;
    when: string;
  }[];
  /** Fasitens kildefaner-tellinger (agent/caddie-utkast/økt-forespørsler). */
  kilder?: { agent: number; caddie: number; forespørsel: number };
  /** Eldste sak i køen — «Køen i tall». Null når køen er tom. */
  eldste?: { dagerLabel: string; who: string } | null;
  /** Godkjent/avvist siste 7 dager på tvers av alle tre kilder. */
  godkjent7Dager?: number;
  avvist7Dager?: number;
}

type FilterKey = "alle" | "agent" | "caddie" | "forespørsel";

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/** md-breakpoint (kortenes handlingsrad: full bredde vs. inline). */
function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const oppdater = () => setMatch(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, [query]);
  return match;
}

function knappStil(fyll: "ink" | "ghost" | "fare", extra?: React.CSSProperties): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    padding: "0 16px",
    borderRadius: T.rTag,
    fontFamily: T.ui,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    textDecoration: "none",
  };
  if (fyll === "ink") return { ...base, background: T.cta, color: T.onCta, border: `1px solid ${T.cta}`, ...extra };
  if (fyll === "fare") return { ...base, background: "transparent", color: T.down, border: `1px solid ${T.border}`, ...extra };
  return { ...base, background: T.panel, color: T.fg, border: `1px solid ${T.border}`, ...extra };
}

/** Massehandling: godkjenn alle lav-risiko-forslag i køen (fasitens ren `.btn`, ikke ink). */
function GodkjennLavRisikoKnapp({ count, full }: { count: number; full?: boolean }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  if (count === 0) return null;
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => start(async () => { await batchApproveLowRisk(); router.refresh(); })}
      className="v2-press v2-focus"
      data-od-id="cta-godkjenn-lavrisiko"
      style={{ ...knappStil("ghost"), width: full ? "100%" : undefined, opacity: busy ? 0.55 : 1 }}
    >
      {busy ? "Godkjenner …" : `Godkjenn ${pl(count, "lavrisiko", "lavrisiko")} samlet`}
    </button>
  );
}

/** Handlingsraden per sak — settet avhenger av kilden (agent/caddie/forespørsel). */
function SakHandlinger({ row, mobile }: { row: AdminGodkjenningV2Row; mobile: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [avvisModus, setAvvisModus] = useState(false);
  const [avvisGrunn, setAvvisGrunn] = useState("");
  const kilde = row.kilde ?? "agent";

  const kjor = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  const avvisFelt = avvisModus ? (
    <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", width: "100%" }}>
      <input
        type="text"
        value={avvisGrunn}
        onChange={(e) => setAvvisGrunn(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") kjor(() => rejectPlanAction(row.id, avvisGrunn.trim() || undefined)); }}
        placeholder="Hvorfor avvises forslaget? (valgfritt)"
        maxLength={500}
        autoFocus
        style={{
          flex: 1,
          minWidth: 0,
          borderRadius: T.rInput,
          border: `1px solid ${T.border}`,
          background: T.panel2,
          padding: "10px 14px",
          fontFamily: T.ui,
          fontSize: 13,
          color: T.fg,
        }}
      />
      <button
        type="button"
        className="v2-press v2-focus"
        disabled={pending}
        onClick={() => kjor(() => rejectPlanAction(row.id, avvisGrunn.trim() || undefined))}
        style={knappStil("fare")}
      >
        Avvis
      </button>
      <button
        type="button"
        className="v2-press v2-focus"
        disabled={pending}
        onClick={() => { setAvvisModus(false); setAvvisGrunn(""); }}
        style={knappStil("ghost")}
      >
        Angre
      </button>
    </div>
  ) : null;

  const knapper: { key: string; label: string; fyll: "ink" | "ghost" | "fare"; onClick?: () => void; href?: string }[] =
    kilde === "agent"
      ? [
          { key: "godkjenn", label: "Godkjenn", fyll: "ink", onClick: () => kjor(() => acceptPlanAction(row.id)) },
          { key: "endre", label: "Endre først", fyll: "ghost", href: `/admin/godkjenninger/${row.id}` },
          ...(avvisModus
            ? []
            : [{ key: "avvis", label: "Avvis", fyll: "fare" as const, onClick: () => setAvvisModus(true) }]),
        ]
      : kilde === "caddie"
        ? [
            { key: "send", label: "Send", fyll: "ink", onClick: () => kjor(() => godkjennCaddieDraft(row.id)) },
            { key: "apne", label: "Åpne i Caddie", fyll: "ghost", href: row.eksternHref ?? "/admin/agencyos/caddie/dashbord" },
            { key: "forkast", label: "Forkast", fyll: "fare", onClick: () => kjor(() => avvisProaktivtForslag(row.id)) },
          ]
        : [
            { key: "kalender", label: "Legg i kalenderen", fyll: "ink", onClick: () => kjor(() => markerSomPlanlagt(row.id)) },
            { key: "tid", label: "Foreslå annen tid", fyll: "ghost", href: row.eksternHref ?? "/admin/foresporsler" },
            { key: "kanikke", label: "Kan ikke", fyll: "fare", onClick: () => kjor(() => avslaaForespørsel(row.id)) },
          ];

  return (
    <div style={{ marginTop: 12, opacity: pending ? 0.5 : 1 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {knapper.map((k) =>
          k.href ? (
            <Link key={k.key} href={k.href} className="v2-press v2-focus" style={{ ...knappStil(k.fyll), flex: mobile ? "1 1 45%" : undefined }}>
              {k.label}
            </Link>
          ) : (
            <button
              key={k.key}
              type="button"
              className="v2-press v2-focus"
              disabled={pending}
              onClick={k.onClick}
              style={{ ...knappStil(k.fyll), flex: mobile ? "1 1 45%" : undefined }}
            >
              {k.label}
            </button>
          ),
        )}
      </div>
      {avvisFelt}
    </div>
  );
}

/** Fasitens .kort — meta (navn/tag/kilde/tid) → tittel → forklaring → «Dette
 *  endres» → «Hvorfor?» → handlinger. `forste` speiler .kort.forste. */
function SakKort({ row, forste, mobile }: { row: AdminGodkjenningV2Row; forste: boolean; mobile: boolean }) {
  const kilde = row.kilde ?? "agent";
  const kildeLabel = kilde === "caddie" ? "caddie-utkast · melding" : kilde === "forespørsel" ? "forespørsel · fra spiller" : "agent · handlingssenter";
  return (
    <article
      data-od-id={`panel-godkjenning-${row.id}`}
      style={{
        background: T.panel,
        border: `1px solid ${forste ? T.fg : T.border}`,
        borderRadius: T.rCard,
        padding: mobile ? "14px 15px" : "16px 18px",
        boxShadow: forste ? `inset 3px 0 0 ${T.fg}` : undefined,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{row.who}</span>
        {row.urgent && (
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: T.warn, border: `1px solid ${T.warn}`, borderRadius: T.rTag, padding: "2px 7px" }}>
            Haster
          </span>
        )}
        {row.lowRisk && (
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: T.mut, border: `1px solid ${T.border}`, borderRadius: T.rTag, padding: "2px 7px" }}>
            Lavrisiko
          </span>
        )}
        <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.04em", textTransform: "uppercase", color: T.mut }}>{kildeLabel}</span>
        <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 11, color: T.mut }}>{row.when}</span>
      </div>

      <h3 style={{ margin: "8px 0 0", fontFamily: T.disp, fontSize: 14.5, fontWeight: 600, color: T.fg }}>{row.title}</h3>
      {row.detail && (
        <p style={{ margin: "6px 0 0", fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.fg2 }}>{row.detail}</p>
      )}
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 6 }}>{handlingstypeLabel(row.actionType)}</div>

      {row.diffPreview && (
        <div style={{ margin: "10px 0 0", padding: "10px 14px", background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: T.rTag }}>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 9, letterSpacing: "0.07em", textTransform: "uppercase", color: T.mut, marginBottom: 4 }}>
            Dette endres
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 12, color: T.fg, overflowWrap: "anywhere" }}>{row.diffPreview}</span>
        </div>
      )}

      {row.hvorfor && (
        <details style={{ marginTop: 10 }}>
          <summary style={{ cursor: "pointer", fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.mut }}>Hvorfor?</summary>
          <p style={{ margin: "6px 0 0", fontFamily: T.ui, fontSize: 12, lineHeight: 1.55, color: T.mut }}>{row.hvorfor}</p>
        </details>
      )}

      <SakHandlinger row={row} mobile={mobile} />
    </article>
  );
}

/** Fasitens aside — «Køen i tall»: KPI-rad, forklaring, kilder, bunn-CTA. */
function KøenITall({ data }: { data: AdminGodkjenningerV2Data }) {
  const totalt = data.totalt ?? data.rows.length;
  const kilder = data.kilder ?? { agent: 0, caddie: 0, forespørsel: 0 };
  return (
    <aside
      aria-label="Køens tall"
      style={{
        position: "sticky",
        top: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: T.panel,
        border: `1px solid ${T.border}`,
        borderRadius: T.rCard,
        padding: 16,
        minWidth: 0,
      }}
    >
      <Caps>Køen i tall</Caps>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Kpi label="Venter" verdi={String(totalt)} sub={`${kilder.agent} agent · ${kilder.caddie} caddie · ${kilder.forespørsel} fsp`} />
        <Kpi label="Lavrisiko" verdi={String(data.lowRiskCount)} sub="kan godkjennes samlet" />
        <Kpi label="Eldste" verdi={data.eldste?.dagerLabel ?? "—"} sub={data.eldste?.who ?? "Ingen i kø"} />
        <Kpi label="Godkjent 7 dg" verdi={String(data.godkjent7Dager ?? 0)} sub={`${data.avvist7Dager ?? 0} avvist`} />
      </div>

      <div style={{ background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: T.rTag, padding: 12 }}>
        <Caps size={9}>Slik leses køen</Caps>
        <p style={{ margin: "8px 0 0", fontFamily: T.ui, fontSize: 12, lineHeight: 1.55, color: T.mut }}>
          Hvert forslag viser hva som faktisk endres før du sier ja. Har et forslag ingen «Dette endres»-linje, er
          det ingen planendring — da er det en melding eller en forespørsel.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Caps size={9}>Kilder</Caps>
        <KildeLinje label="Agent (PlanAction)" verdi={String(kilder.agent)} />
        <KildeLinje label="Caddie-utkast" verdi={String(kilder.caddie)} />
        <KildeLinje label="Økt-forespørsel" verdi={String(kilder.forespørsel)} />
        <KildeLinje label="E-postutkast" verdi="innboks" href="/admin/innboks" />
      </div>

      {data.lowRiskCount > 0 && <GodkjennLavRisikoKnapp count={data.lowRiskCount} full />}
    </aside>
  );
}

function Kpi({ label, verdi, sub }: { label: string; verdi: string; sub: string }) {
  return (
    <div style={{ background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: T.rTag, padding: 12, minWidth: 0 }}>
      <Caps size={9}>{label}</Caps>
      <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 600, color: T.fg, marginTop: 6 }}>{verdi}</div>
      <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 2, overflowWrap: "anywhere" }}>{sub}</div>
    </div>
  );
}

function KildeLinje({ label, verdi, href }: { label: string; verdi: string; href?: string }) {
  const content = (
    <>
      <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg }}>{label}</span>
      <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mut }}>{verdi}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} style={{ display: "flex", justifyContent: "space-between", gap: 8, textDecoration: "none" }}>
        {content}
      </Link>
    );
  }
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>{content}</div>;
}

export function AdminGodkjenningerV2({ data }: { data: AdminGodkjenningerV2Data }) {
  const mobile = useMediaQuery("(max-width: 767px)");
  const visAside = useMediaQuery("(min-width: 1024px)");
  const [filter, setFilter] = useState<FilterKey>("alle");

  const kilder = data.kilder ?? { agent: 0, caddie: 0, forespørsel: 0 };
  const totalt = data.totalt ?? data.rows.length;
  const antallKilder = [kilder.agent, kilder.caddie, kilder.forespørsel].filter((n) => n > 0).length || 3;

  const filtrert = useMemo(
    () => (filter === "alle" ? data.rows : data.rows.filter((r) => (r.kilde ?? "agent") === filter)),
    [data.rows, filter],
  );

  const filtre: { k: FilterKey; n: string; antall: number }[] = [
    { k: "alle", n: "Alle", antall: data.rows.length },
    { k: "agent", n: "Agent", antall: kilder.agent },
    { k: "caddie", n: "Caddie-utkast", antall: kilder.caddie },
    { k: "forespørsel", n: "Økt-forespørsler", antall: kilder.forespørsel },
  ];

  return (
    <div
      data-paper-slug="agencyos-godkjenninger"
      data-od-id="agencyos-godkjenninger"
      style={{
        display: "grid",
        gridTemplateColumns: visAside ? "minmax(0,1fr) 380px" : "1fr",
        alignItems: "start",
        gap: visAside ? 20 : 0,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        {/* ── Hode ── */}
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Godkjenninger</h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
            agencyos · én kø · {antallKilder} kilder
          </span>
        </div>

        {/* ── Kildefaner ── */}
        <div role="group" aria-label="Kilder" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filtre.map((f) => {
            const aktiv = f.k === filter;
            return (
              <button
                key={f.k}
                type="button"
                aria-pressed={aktiv}
                onClick={() => setFilter(f.k)}
                className="v2-press v2-focus"
                data-od-id={`filter-${f.k}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 44,
                  padding: "0 16px",
                  borderRadius: T.rPill,
                  border: `1px solid ${aktiv ? T.fg : T.border}`,
                  background: aktiv ? T.fg : T.panel,
                  color: aktiv ? T.bg : T.fg,
                  fontFamily: T.ui,
                  fontSize: 12.5,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{f.n}</span>
                <span style={{ fontFamily: T.mono, fontSize: 11, opacity: 0.75 }}>{f.antall}</span>
              </button>
            );
          })}
        </div>

        {/* ── Kø-hode: N venter på deg + ghost «godkjenn lavrisiko samlet» ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 600, color: T.fg }}>{totalt}</span>
          <Caps size={9}>venter på deg</Caps>
          {data.lowRiskCount > 0 && (
            <div style={{ marginLeft: mobile ? undefined : "auto", width: mobile ? "100%" : undefined }}>
              <GodkjennLavRisikoKnapp count={data.lowRiskCount} full={mobile} />
            </div>
          )}
        </div>

        {/* ── Kø ── */}
        {filtrert.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", padding: "34px 24px", background: T.panel2, border: `1px dashed ${T.border}`, borderRadius: T.rCard }}>
            <Icon name="check-circle" size={20} style={{ color: T.mut }} />
            <h3 style={{ margin: "6px 0 0", fontFamily: T.disp, fontSize: 14.5, fontWeight: 600, color: T.fg }}>
              {data.rows.length === 0 ? "Køen er tom" : "Ingen saker i dette filteret"}
            </h3>
            <p style={{ margin: 0, maxWidth: "44ch", fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55 }}>
              {data.rows.length === 0
                ? "Ingenting venter på godkjenning akkurat nå. Agentene sender nye forslag når det kommer inn nye runder, tester eller signaler fra spillerne dine."
                : "Bytt filter for å se resten av køen."}
            </p>
            {data.rows.length === 0 && (
              <Link href="/admin/spillere" className="v2-press v2-focus" style={{ ...knappStil("ghost"), marginTop: 6 }}>
                Gå til stallen
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtrert.map((r, i) => (
              <SakKort key={r.id} row={r} forste={i === 0} mobile={mobile} />
            ))}
          </div>
        )}

        {/* ── Løst nylig ── */}
        {(data.lostSjekkpunkter?.length ?? 0) > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <h2 style={{ margin: 0, fontFamily: T.disp, fontSize: 14.5, fontWeight: 600, color: T.fg }}>Løst nylig</h2>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>
                {pl(data.lostSjekkpunkter!.length, "sjekkpunkt", "sjekkpunkter")}
              </span>
            </div>
            <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12, color: T.mut }}>
              Godkjente forslag med sjekkpunkt — de kommer tilbake hit når fristen er nådd.
            </p>
            <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: "4px 16px" }}>
              {data.lostSjekkpunkter!.map((l, i) => (
                <div
                  key={l.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 0",
                    borderTop: i === 0 ? undefined : `1px solid ${T.borderS}`,
                    fontFamily: T.ui,
                    fontSize: 12.5,
                    color: T.fg,
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    {l.who} · {l.sjekkpunkt}
                  </span>
                  <span style={{ flex: "none", fontFamily: T.mono, fontSize: 11, color: T.mut }}>{l.when}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {visAside && <KøenITall data={data} />}
    </div>
  );
}
