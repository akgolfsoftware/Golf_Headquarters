"use client";

/**
 * AgencyOS Innboks — Train-lock (T3, 26.08.2026).
 *
 * Fasit: designsystem/train-lock/AG-03 Innboks.dc.html. Erstatter InnboksSaker
 * (Paper T.*, ArtefaktPanel-basert) på denne ruten. Samme datakilde
 * (loadInnboksSaker/InnboksData) og SAME server action (avgjorInnboksSak) —
 * designport, ikke funksjonsendring.
 *
 * Fasitens to seksjoner er generalisert fra InnboksSakType (forslag ·
 * forespørsel · drift · varsel), ikke hardkodet til "kun ukeplaner":
 *   Godkjenninger — forslag + forespørsel (krever en avgjørelse fra deg)
 *   Meldinger      — drift + varsel (systemvarsler/informasjon)
 * Fasitens «Merge» er kun ordet for forslag-kortenes primærhandling — de
 * andre typene beholder sine egne verb (fra data.primaer.label).
 *
 * Varsler-fletting (T3-oppgaven): /admin/varsler er en FILTER av denne
 * skjermen (?filter=varsler viser kun Meldinger-seksjonen), ikke en egen
 * side lenger — se src/app/admin/varsler/page.tsx (redirect).
 *
 * A2 (16.08.2026): master–detalj på desktop — klikk en sak inn i
 * inspektørpanelet. Mobil viser hele saken i kortet (uendret prinsipp fra
 * AdminGodkjenningerTrainLock).
 *
 * Tokens: KUN TL — se CLAUDE.md invariant 2.
 */

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MasterDetalj, useInspektorSynlig } from "@/components/v2/inspektorpanel";
import { TL } from "@/lib/v2/train-lock";
import { avgjorInnboksSak } from "@/app/admin/innboks/actions";
import type { InnboksData, InnboksSak, InnboksSakType } from "@/lib/admin/innboks-saker";
import { TlCaps, TlInspektorBlokk, TlInspektorKpi, TlInspektorpanel } from "../godkjenninger/tl-inspektor";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

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

const GODKJENNING_TYPER: InnboksSakType[] = ["forslag", "forespørsel"];
const MELDING_TYPER: InnboksSakType[] = ["drift", "varsel"];

function knappStil(fyll: "primaer" | "sekundaer" | "fare", full?: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    padding: "0 20px",
    borderRadius: TL.radius.pill,
    fontSize: 15,
    fontWeight: fyll === "primaer" ? TL.vekt.cta : TL.vekt.kropp,
    cursor: "pointer",
    whiteSpace: "nowrap",
    textDecoration: "none",
    border: "none",
    background: fyll === "primaer" ? TL.fill : fyll === "fare" ? "transparent" : TL.dim,
    color: fyll === "primaer" ? TL.onFill : fyll === "fare" ? TL.danger : TL.text,
    boxShadow: fyll === "fare" ? `inset 0 0 0 1px ${TL.hair}` : undefined,
    flex: full ? "1 1 45%" : undefined,
  };
}

/** Handlingsraden per sak — bruker sakens EGNE labels (primaer/sekundaer), ikke fast «Godkjenn/Avvis». */
function SakHandlinger({ sak, fremhevet }: { sak: InnboksSak; fremhevet: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  /** null = ingen grunn-felt åpent. "godkjenn"/"avvis" = HVILKEN knapp åpnet det —
      Enter/Bekreft skal kjøre nøyaktig den valgte handlingen, aldri gjettes fra dataen. */
  const [grunnFor, setGrunnFor] = useState<"godkjenn" | "avvis" | null>(null);
  const [avvisGrunn, setAvvisGrunn] = useState("");
  const avvisModus = grunnFor !== null;

  const kjor = (valg: "godkjenn" | "avvis", grunn?: string) =>
    start(async () => {
      await avgjorInnboksSak(sak.id, valg, grunn);
      router.refresh();
    });

  if (!sak.primaer && !sak.sekundaer && !sak.href) return null;

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 14, opacity: pending ? 0.5 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {sak.primaer && (
          <button
            type="button"
            className={PRESS}
            disabled={pending}
            onClick={() => (sak.primaer!.krevGrunn ? setGrunnFor("godkjenn") : kjor("godkjenn"))}
            style={knappStil(fremhevet ? "primaer" : "sekundaer")}
          >
            {sak.primaer.label}
          </button>
        )}
        {sak.sekundaer && !avvisModus && (
          <button type="button" className={PRESS} disabled={pending} onClick={() => (sak.sekundaer!.krevGrunn ? setGrunnFor("avvis") : kjor("avvis"))} style={knappStil("fare")}>
            {sak.sekundaer.label}
          </button>
        )}
        {sak.href && (
          <Link href={sak.href} className={PRESS} style={{ height: 40, padding: "0 16px", display: "flex", alignItems: "center", fontSize: 15, fontWeight: 600, color: TL.mute }}>
            {sak.hrefTekst ?? "Åpne"}
          </Link>
        )}
      </div>
      {avvisModus && (
        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
          <input
            type="text"
            value={avvisGrunn}
            onChange={(e) => setAvvisGrunn(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && grunnFor) kjor(grunnFor, avvisGrunn.trim() || undefined); }}
            placeholder="Grunn (valgfritt)"
            maxLength={500}
            autoFocus
            style={{ flex: 1, minWidth: 0, borderRadius: TL.radius.field, background: TL.dock, boxShadow: `inset 0 0 0 1px ${TL.hair}`, padding: "10px 14px", fontSize: 13, color: TL.text, border: "none" }}
          />
          <button type="button" className={PRESS} disabled={pending} onClick={() => grunnFor && kjor(grunnFor, avvisGrunn.trim() || undefined)} style={knappStil("fare")}>
            Bekreft
          </button>
          <button type="button" className={PRESS} onClick={() => { setGrunnFor(null); setAvvisGrunn(""); }} style={knappStil("sekundaer")}>
            Angre
          </button>
        </div>
      )}
    </div>
  );
}

function KontraktBlokk({ sak }: { sak: InnboksSak }) {
  if (!sak.kontrakt) return null;
  const rader: [string, string | null][] = [
    ["Hvorfor", sak.kontrakt.hvorfor],
    ["Hva", sak.kontrakt.hva],
    ["Forventet effekt", sak.kontrakt.effekt],
    ["Hvorfor nå", sak.kontrakt.hvorforNa],
  ];
  return (
    <div style={{ marginTop: 12, padding: "12px 16px", background: TL.dock, borderRadius: 14, display: "flex", flexDirection: "column", gap: 8 }}>
      {rader.map(([label, verdi]) =>
        verdi ? (
          <div key={label}>
            <TlCaps size={9}>{label}</TlCaps>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: TL.text, lineHeight: 1.5 }}>{verdi}</p>
          </div>
        ) : null,
      )}
    </div>
  );
}

function SakKort({
  sak,
  fremhevet,
  mobile,
  kanVelges,
  onVelg,
}: {
  sak: InnboksSak;
  fremhevet: boolean;
  mobile: boolean;
  kanVelges: boolean;
  onVelg: (id: string) => void;
}) {
  return (
    <article
      onClick={kanVelges ? () => onVelg(sak.id) : undefined}
      style={{
        background: TL.elev,
        borderRadius: TL.radius.card,
        padding: "18px 20px",
        opacity: sak.lost ? 0.55 : fremhevet ? 1 : 0.55,
        cursor: kanVelges ? "pointer" : undefined,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{sak.hvem} · {sak.tittel}</div>
      <div style={{ marginTop: 4, fontSize: 13, color: TL.mute, lineHeight: 1.45 }}>
        {sak.lost && sak.lostTekst ? sak.lostTekst : sak.sub}
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: sak.snart ? TL.warn : TL.mute, fontVariantNumeric: "tabular-nums" }}>{sak.frist}</div>

      {mobile && <KontraktBlokk sak={sak} />}
      {mobile && sak.foreslattSvar && sak.foreslattSvar.trim() && (
        <div style={{ marginTop: 12, padding: "12px 16px", background: TL.dock, borderRadius: 14 }}>
          <TlCaps size={9}>Foreslått svar</TlCaps>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: TL.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{sak.foreslattSvar}</p>
        </div>
      )}

      {!sak.lost && <SakHandlinger sak={sak} fremhevet={fremhevet} />}
    </article>
  );
}

function SakInspektor({ sak }: { sak: InnboksSak }) {
  return (
    <TlInspektorpanel tittel={sak.hvem} ariaLabel={`Valgt sak: ${sak.hvem}`} tag={sak.snart ? <TlCaps size={10}>{sak.frist}</TlCaps> : undefined}>
      <div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TL.text }}>{sak.tittel}</h3>
        <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5, color: TL.mute }}>{sak.sub}</p>
      </div>
      <KontraktBlokk sak={sak} />
      {sak.foreslattSvar && sak.foreslattSvar.trim() && (
        <TlInspektorBlokk label="Foreslått svar">
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: TL.text, whiteSpace: "pre-wrap" }}>{sak.foreslattSvar}</p>
        </TlInspektorBlokk>
      )}
      {sak.grunnlag.length > 0 && (
        <TlInspektorBlokk label="Grunnlag">
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: TL.mute, lineHeight: 1.6 }}>
            {sak.grunnlag.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </TlInspektorBlokk>
      )}
      {!sak.lost && <SakHandlinger sak={sak} fremhevet />}
    </TlInspektorpanel>
  );
}

function InnboksITall({ data }: { data: InnboksData }) {
  return (
    <TlInspektorpanel tittel="Innboks i tall" ariaLabel="Innboksens tall">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <TlInspektorKpi label="Åpne saker" verdi={String(data.apne)} sub={data.dagLabel} />
        <TlInspektorKpi label="Totalt" verdi={String(data.saker.length)} sub="inkludert løst" />
      </div>
      <div style={{ background: TL.dock, borderRadius: 14, padding: 14 }}>
        <TlCaps size={9}>Slik leses innboksen</TlCaps>
        <p style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.55, color: TL.mute }}>
          Godkjenninger krever en avgjørelse fra deg. Meldinger er til orientering — kvitter ut når du har lest.
        </p>
      </div>
    </TlInspektorpanel>
  );
}

export function InnboksSakerTrainLock({ data }: { data: InnboksData }) {
  const mobile = useMediaQuery("(max-width: 767px)");
  const visPanel = useInspektorSynlig();
  const searchParams = useSearchParams();
  const kunMeldinger = searchParams.get("filter") === "varsler";
  const [valgtId, setValgtId] = useState<string | null>(null);

  const godkjenninger = useMemo(
    () => data.saker.filter((s) => GODKJENNING_TYPER.includes(s.type)),
    [data.saker],
  );
  const meldinger = useMemo(
    () => data.saker.filter((s) => MELDING_TYPER.includes(s.type)),
    [data.saker],
  );

  const valgtSak = valgtId ? (data.saker.find((s) => s.id === valgtId) ?? null) : null;

  return (
    <MasterDetalj panel={valgtSak ? <SakInspektor sak={valgtSak} /> : <InnboksITall data={data} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <TlCaps>Academy</TlCaps>
            <h1 style={{ margin: "6px 0 0", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: TL.text }}>Innboks</h1>
          </div>
          <div role="group" aria-label="Filter" style={{ display: "flex", gap: 8 }}>
            <Link
              href="/admin/innboks"
              className={PRESS}
              style={{
                height: 36,
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                borderRadius: TL.radius.pill,
                background: kunMeldinger ? TL.dim : TL.fill,
                color: kunMeldinger ? TL.text : TL.onFill,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Alle
            </Link>
            <Link
              href="/admin/innboks?filter=varsler"
              className={PRESS}
              style={{
                height: 36,
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                borderRadius: TL.radius.pill,
                background: kunMeldinger ? TL.fill : TL.dim,
                color: kunMeldinger ? TL.onFill : TL.text,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Meldinger
            </Link>
          </div>
        </div>

        {!kunMeldinger && (
          <div>
            <TlCaps size={11}>Godkjenninger · {godkjenninger.filter((s) => !s.lost).length}</TlCaps>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
              {godkjenninger.length === 0 ? (
                <div style={{ padding: "28px 20px", background: TL.elev, borderRadius: TL.radius.card, textAlign: "center", fontSize: 13, color: TL.mute }}>
                  Ingen godkjenninger venter. Nye forslag dukker opp når agentene finner noe å foreslå.
                </div>
              ) : (
                godkjenninger.map((s, i) => (
                  <SakKort
                    key={s.id}
                    sak={s}
                    fremhevet={valgtSak ? s.id === valgtSak.id : i === 0}
                    mobile={mobile}
                    kanVelges={visPanel}
                    onVelg={(id) => setValgtId((cur) => (cur === id ? null : id))}
                  />
                ))
              )}
            </div>
          </div>
        )}

        <div>
          <TlCaps size={11}>Meldinger</TlCaps>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            {meldinger.length === 0 ? (
              <div style={{ padding: "28px 20px", background: TL.elev, borderRadius: TL.radius.card, textAlign: "center", fontSize: 13, color: TL.mute }}>
                Ingen uleste meldinger
              </div>
            ) : (
              meldinger.map((s, i) => (
                <SakKort
                  key={s.id}
                  sak={s}
                  fremhevet={valgtSak ? s.id === valgtSak.id : kunMeldinger && i === 0}
                  mobile={mobile}
                  kanVelges={visPanel}
                  onVelg={(id) => setValgtId((cur) => (cur === id ? null : id))}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </MasterDetalj>
  );
}
