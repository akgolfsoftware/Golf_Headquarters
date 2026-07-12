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
 * Mobil (375px): kort stables; handlingsknapper blir fullbredde i 2×2-rutenett
 * i stedet for inline. Chips brytes. Ingen fabrikerte tall — tom kø → TomTilstand.
 *
 * Chip-valg: original brukte «Haster»/«Lav risiko». SevChip har fastlåste
 * etiketter (Sterkt avvik/Venter/…) som ville brutt den låste copy-en, så
 * StatusPill (warn/info) bærer flaggene med original tekst.
 */

import { Fragment, useEffect, useMemo, useState, useTransition } from "react";
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
import { avvisProaktivtForslag } from "@/app/admin/agencyos/caddie/dashbord/actions";
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
}

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

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
  const kanGodkjenneInline = erAgent || row.kilde === "forespørsel";
  const godkjenn = () => start(async () => {
    if (erAgent) await acceptPlanAction(row.id);
    else if (row.kilde === "forespørsel") await markerSomPlanlagt(row.id);
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
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14, opacity: pending ? 0.5 : 1 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {kanGodkjenneInline && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <Knapp icon="check" full disabled={pending} onClick={godkjenn}>Godkjenn</Knapp>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Knapp icon="x" ghost full disabled={pending} onClick={avvis}>Avvis</Knapp>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={detaljer} style={{ flex: 1, minWidth: 0, textDecoration: "none" }}>
            <Knapp icon="file-text" ghost full>Detaljer</Knapp>
          </Link>
          <Link href={profil} style={{ flex: 1, minWidth: 0, textDecoration: "none" }}>
            <Knapp icon="user" ghost full>Se profil</Knapp>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14, opacity: pending ? 0.5 : 1 }}>
      {kanGodkjenneInline && <Knapp icon="check" disabled={pending} onClick={godkjenn}>Godkjenn</Knapp>}
      <Knapp icon="x" ghost disabled={pending} onClick={avvis}>Avvis</Knapp>
      <Link href={detaljer} style={{ textDecoration: "none" }}>
        <Knapp icon="file-text" ghost>Detaljer</Knapp>
      </Link>
      <Link href={profil} style={{ textDecoration: "none" }}>
        <Knapp icon="user" ghost>Se profil</Knapp>
      </Link>
    </div>
  );
}

/** Én sak-kort: avatar + tittel/flagg + meta + forklaring + signal + diff + handlinger. */
function SakKort({ row, mobile }: { row: AdminGodkjenningV2Row; mobile: boolean }) {
  return (
    <Kort
      pad="16px 18px"
      style={row.urgent ? { borderLeft: `3px solid ${T.warn}` } : undefined}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <AvatarInit navn={row.who} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: T.fg }}>
              {row.title}
            </span>
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
              <span style={{ fontFamily: T.mono, fontSize: 11, lineHeight: 1.5, color: T.fg2 }}>
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

  const antallHaster = useMemo(() => data.rows.filter((r) => r.urgent).length, [data.rows]);
  const antallLav = useMemo(() => data.rows.filter((r) => r.lowRisk).length, [data.rows]);

  const tilgjengeligeFiltre = useMemo(() => {
    const f: string[] = [];
    if (antallHaster > 0) f.push("Haster");
    if (antallLav > 0) f.push("Lav risiko");
    return f;
  }, [antallHaster, antallLav]);

  const filtrert = data.rows.filter((r) => {
    if (filtre.length === 0) return true;
    if (filtre.indexOf("Haster") !== -1 && r.urgent) return true;
    if (filtre.indexOf("Lav risiko") !== -1 && r.lowRisk) return true;
    return false;
  });

  const toggle = (x: string) =>
    setFiltre((prev) => (prev.indexOf(x) !== -1 ? prev.filter((y) => y !== x) : prev.concat(x)));

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>Innboks · Godkjenninger</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="på deg." mobile={mobile}>{`${data.rows.length} venter`}</Tittel>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtrert.map((r) => (
            <Fragment key={r.id}>
              <SakKort row={r} mobile={mobile} />
            </Fragment>
          ))}
        </div>
      )}

      <InnsiktChip cta={data.lowRiskCount > 0 ? "Godkjenn lav-risiko" : undefined}>
        {data.rows.length === 0
          ? "Køen er tom. Nye agent-forslag dukker opp her når de kommer."
          : `${pl(data.rows.length, "sak venter", "saker venter")} på behandling` +
            (data.lowRiskCount > 0 ? ` — ${data.lowRiskCount} av dem er lav-risiko og kan godkjennes samlet.` : ".")}
      </InnsiktChip>
    </div>
  );
}
