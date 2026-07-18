"use client";

/**
 * AgencyOS Godkjenninger — v2 (retning C «Presis», mørk først). Coach/ADMIN
 * behandler agent-forslag (plan-endringer / samtykke-signaler): godkjenn eller
 * avvis. Ingen mockup fantes — komponert utelukkende av v2-biblioteket
 * (src/components/v2), ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart 1:1 fra den ekte skjermen (src/app/admin/godkjenninger):
 *   - Kø av PENDING PlanAction-forslag (nyeste først), én kort-rad per sak.
 *   - Per sak: spiller, tittel, forklaring, actionType, «når», signal-snapshot,
 *     forhåndsvist diff (buildDiffPreview i ruten), Haster-/Lav risiko-flagg.
 *   - Handlinger per sak: Godkjenn (acceptPlanAction) · Avvis (rejectPlanAction)
 *     · Detaljer (/admin/godkjenninger/[id]) · Se profil (/admin/spillere/[id]).
 *   - Massehandling: Godkjenn lav-risiko (batchApproveLowRisk) når slike finnes.
 *   - Filter på Haster / Lav risiko (klient, over ekte flagg).
 *
 * Mobil (375px): kort stables; primærhandlinger fullbredde, lenker under.
 * Chips brytes. Ingen fabrikerte tall — tom kø → TomTilstand.
 *
 * Audit 2026-07-12 (funn 2): saker grupperes per spiller (seksjonshode),
 * identiske saker (samme who+tittel+actionType) dedupliseres til én rad med
 * «×N»-badge (Godkjenn/Avvis gjelder kun FØRSTE sak — aldri bulk uten
 * eksplisitt handling), og køen pagineres klientside (10 seksjoner om gangen)
 * så siden aldri blir 12–17 000 px lang. Knapphierarki per sak: Godkjenn
 * primær (lime) · Avvis ghost · Detaljer/Se profil som tekstlenker.
 *
 * Chip-valg: original brukte «Haster»/«Lav risiko». SevChip har fastlåste
 * etiketter (Sterkt avvik/Venter/…) som ville brutt den låste copy-en, så
 * StatusPill (warn/info) bærer flaggene med original tekst.
 */

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { handlingstypeLabel } from "@/lib/labels/handlingstyper";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Caps,
  Tittel,
  Kort,
  StatusPill,
  Knapp,
  FilterChips,
  AvatarInit,
  TomTilstand,
  InnsiktChip,
  Icon,
  T,
} from "@/components/v2";
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
}
export interface AdminGodkjenningerV2Data {
  rows: AdminGodkjenningV2Row[];
  lowRiskCount: number;
  /** Kanonisk kø-telling (koTelling) — samme tall som innboks-banner/varsler. */
  totalt?: number;
}

/** Dedupliseret sak: første rad + alle id-ene bak («×N»). Handlinger bruker
 *  KUN ids[0] (første sak) — resten blir i køen til de behandles eksplisitt. */
type SakMedAntall = AdminGodkjenningV2Row & { antall: number; ids: string[] };

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/* Hover-understrek for tekstlenker (inline styles kan ikke uttrykke :hover). */
function ensureLokalStil(): void {
  if (typeof document === "undefined" || document.getElementById("v2-godkj-style")) return;
  const el = document.createElement("style");
  el.id = "v2-godkj-style";
  el.textContent = ".v2-tekstlenke{text-decoration:none;}.v2-tekstlenke:hover{text-decoration:underline;}";
  document.head.appendChild(el);
}
if (typeof document !== "undefined") ensureLokalStil();

/** Sekundærnavigasjon per sak — stille tekstlenke (12px, dempet), aldri knapp. */
function TekstLenke({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="v2-tekstlenke v2-focus"
      style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 500, color: T.mut, display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 2px" }}
    >
      {children}
    </Link>
  );
}

/** md-breakpoint-speil (matcher V2Shell/AdminBookingerV2). */
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

/** Massehandling: godkjenn alle lav-risiko-forslag i køen. */
function GodkjennLavRisiko({ count }: { count: number }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  if (count === 0) return null;
  return (
    <div style={{ opacity: busy ? 0.5 : 1 }}>
      <Knapp
        icon="check-circle"
        ghost
        disabled={busy}
        onClick={() => start(async () => { await batchApproveLowRisk(); router.refresh(); })}
      >
        Godkjenn lav-risiko ({count})
      </Knapp>
    </div>
  );
}

/** Godkjenn/avvis + lenker for én sak. Mobil: fullbredde 2×2, desktop: inline. */
function SakHandlinger({ row, mobile }: { row: AdminGodkjenningV2Row; mobile: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const erAgent = (row.kilde ?? "agent") === "agent";
  // A2: caddie-utkast godkjennes (og UTFØRES med re-validering) rett fra køen.
  const kanGodkjenneInline = erAgent || row.kilde === "forespørsel" || row.kilde === "caddie";
  const godkjenn = () => start(async () => {
    if (erAgent) await acceptPlanAction(row.id);
    else if (row.kilde === "forespørsel") await markerSomPlanlagt(row.id);
    else if (row.kilde === "caddie") await godkjennCaddieDraft(row.id);
    router.refresh();
  });
  const avvis = () => start(async () => {
    if (erAgent) await rejectPlanAction(row.id);
    else if (row.kilde === "caddie") await avvisProaktivtForslag(row.id);
    else if (row.kilde === "forespørsel") await avslaaForespørsel(row.id);
    router.refresh();
  });

  const detaljer = erAgent ? `/admin/godkjenninger/${row.id}` : (row.eksternHref ?? "/admin/godkjenninger");
  const profil = `/admin/spillere/${row.playerId}`;

  if (mobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 14, opacity: pending ? 0.5 : 1 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {kanGodkjenneInline && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <Knapp icon="check" full style={{ minHeight: 44 }} disabled={pending} onClick={godkjenn}>Godkjenn</Knapp>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Knapp icon="x" ghost full style={{ minHeight: 44 }} disabled={pending} onClick={avvis}>Avvis</Knapp>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          <TekstLenke href={detaljer}>Detaljer</TekstLenke>
          <TekstLenke href={profil}>Se profil</TekstLenke>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0 12px", marginTop: 8, opacity: pending ? 0.5 : 1 }}>
      {kanGodkjenneInline && <Knapp icon="check" style={{ minHeight: 44 }} disabled={pending} onClick={godkjenn}>Godkjenn</Knapp>}
      <Knapp icon="x" ghost style={{ minHeight: 44 }} disabled={pending} onClick={avvis}>Avvis</Knapp>
      <TekstLenke href={detaljer}>Detaljer</TekstLenke>
      <TekstLenke href={profil}>Se profil</TekstLenke>
    </div>
  );
}

/** Én sak-kort: tittel/flagg + meta + forklaring + signal + diff + handlinger.
 *  Spilleren navngis av seksjonshodet — kortet dropper derfor egen avatar.
 *  antall > 1 → «×N»-badge; Godkjenn/Avvis gjelder kun første sak. */
function SakKort({ row, mobile }: { row: SakMedAntall; mobile: boolean }) {
  return (
    <Kort
      pad={mobile ? "14px 15px" : "16px 18px"}
      style={row.urgent ? { borderLeft: `3px solid ${T.warn}` } : undefined}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: T.fg }}>
              {row.title}
            </span>
            {row.antall > 1 && (
              <span
                title={`${row.antall} like saker — Godkjenn/Avvis gjelder den første, resten blir i køen`}
                style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "2px 6px" }}
              >
                ×{row.antall}
              </span>
            )}
            {row.urgent && <StatusPill tone="warn">Haster</StatusPill>}
            {row.lowRisk && <StatusPill tone="info">Lav risiko</StatusPill>}
          </div>

          <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", color: T.mut, marginTop: 4 }}>
            {row.who} · {row.when} · {handlingstypeLabel(row.actionType)}
          </div>

          {row.detail && (
            <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.fg2, margin: "8px 0 0" }}>
              {row.detail}
            </p>
          )}

          {row.signalKind && (
            <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, marginTop: 8 }}>
              Signal: {row.signalKind}
              {row.signalValue != null ? ` = ${row.signalValue}` : ""}
            </div>
          )}

          {row.diffPreview && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 10, padding: "8px 11px", borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}` }}>
              <Icon name="layers" size={13} style={{ color: T.lime, flex: "none", marginTop: 1 }} />
              <span style={{ fontFamily: T.mono, fontSize: 11, lineHeight: 1.5, color: T.fg2, minWidth: 0, overflowWrap: "anywhere" }}>
                {row.diffPreview}
              </span>
            </div>
          )}

          <SakHandlinger row={row} mobile={mobile} />
        </div>
      </div>
    </Kort>
  );
}

export function AdminGodkjenningerV2({ data }: { data: AdminGodkjenningerV2Data }) {
  const mobile = useMobile();
  const [filtre, setFiltre] = useState<string[]>([]);
  /** Klientside-paginering: antall spillerseksjoner som vises. */
  const [visSeksjoner, setVisSeksjoner] = useState(10);

  // Kanonisk kø-tall (koTelling) — samme som innboks-banneret og varsler-siden.
  const totalt = data.totalt ?? data.rows.length;

  const antallHaster = useMemo(() => data.rows.filter((r) => r.urgent).length, [data.rows]);
  const antallLav = useMemo(() => data.rows.filter((r) => r.lowRisk).length, [data.rows]);

  const tilgjengeligeFiltre = useMemo(() => {
    const f: string[] = [];
    if (antallHaster > 0) f.push("Haster");
    if (antallLav > 0) f.push("Lav risiko");
    return f;
  }, [antallHaster, antallLav]);

  const filtrert = useMemo(
    () =>
      data.rows.filter((r) => {
        if (filtre.length === 0) return true;
        if (filtre.indexOf("Haster") !== -1 && r.urgent) return true;
        if (filtre.indexOf("Lav risiko") !== -1 && r.lowRisk) return true;
        return false;
      }),
    [data.rows, filtre],
  );

  // Dedupliser identiske saker (who + tittel + actionType) → «×N», og grupper
  // per spiller med seksjonshode. Rekkefølge = første forekomst (nyeste først).
  const seksjoner = useMemo(() => {
    const dedup = new Map<string, SakMedAntall>();
    const orden: SakMedAntall[] = [];
    for (const r of filtrert) {
      const key = `${r.who}|${r.title}|${r.actionType}`;
      const eks = dedup.get(key);
      if (eks) {
        eks.antall += 1;
        eks.ids.push(r.id);
      } else {
        const ny: SakMedAntall = { ...r, antall: 1, ids: [r.id] };
        dedup.set(key, ny);
        orden.push(ny);
      }
    }
    const grupper = new Map<string, SakMedAntall[]>();
    for (const r of orden) {
      const g = grupper.get(r.who);
      if (g) g.push(r);
      else grupper.set(r.who, [r]);
    }
    return Array.from(grupper.entries()).map(([who, saker]) => ({ who, saker }));
  }, [filtrert]);

  const synlige = seksjoner.slice(0, visSeksjoner);
  const skjulteSaker = seksjoner.slice(visSeksjoner).reduce((n, s) => n + s.saker.length, 0);

  const toggle = (x: string) => {
    setFiltre((prev) => (prev.indexOf(x) !== -1 ? prev.filter((y) => y !== x) : prev.concat(x)));
    setVisSeksjoner(10);
  };

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>Innboks · Godkjenninger</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="på deg." mobile={mobile}>{`${totalt} venter`}</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.mut, margin: "10px 0 0", maxWidth: 560 }}>
          Plan-endringer fra agenter. Godkjenn eller avvis — endringer skrives til planen ved godkjenning.
        </p>
      </div>
      <div className="hidden md:block">
        <GodkjennLavRisiko count={data.lowRiskCount} />
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}

      {/* Mobil-massehandling (skjult på desktop der den ligger i hodet) */}
      {data.lowRiskCount > 0 && (
        <div className="md:hidden">
          <GodkjennLavRisiko count={data.lowRiskCount} />
        </div>
      )}

      {tilgjengeligeFiltre.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Caps size={9} style={{ width: 48, flex: "none" }}>Vis</Caps>
          <FilterChips items={tilgjengeligeFiltre} active={filtre} onToggle={toggle} />
        </div>
      )}

      {filtrert.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="check-circle"
            title="Ingenting venter på deg"
            sub={
              data.rows.length === 0
                ? "Alt er behandlet — køen er tom."
                : "Ingen saker passer filteret akkurat nå."
            }
          />
        </Kort>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {synlige.map((seksjon) => (
            <div key={seksjon.who} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Seksjonshode: spillernavn + antall saker */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <AvatarInit navn={seksjon.who} size={26} />
                <span style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 700, color: T.fg }}>{seksjon.who}</span>
                <Caps size={9}>{pl(seksjon.saker.reduce((n, s) => n + s.antall, 0), "sak", "saker")}</Caps>
              </div>
              {seksjon.saker.map((r) => (
                <SakKort key={r.id} row={r} mobile={mobile} />
              ))}
            </div>
          ))}
          {skjulteSaker > 0 && (
            <Knapp
              icon="chevron-down"
              ghost
              full
              style={{ minHeight: 44 }}
              onClick={() => setVisSeksjoner((v) => v + 10)}
            >
              Vis flere ({skjulteSaker})
            </Knapp>
          )}
        </div>
      )}

      <InnsiktChip>
        {totalt === 0
          ? "Køen er tom. Nye agent-forslag dukker opp her når de kommer."
          : `${pl(totalt, "sak venter", "saker venter")} på behandling` +
            (data.lowRiskCount > 0 ? ` — ${data.lowRiskCount} av dem er lav-risiko og kan godkjennes samlet.` : ".")}
      </InnsiktChip>
    </div>
  );
}
