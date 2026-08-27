"use client";

/**
 * AgencyOS Marketing — Train-lock (T13-restside, 27.08.2026, se
 * docs/natt/D-LYS-OG-5T-BESLUTNING.md §0.8).
 *
 * Mønster-port av `AdminMarketingV2` (Paper) — samme datakontrakt
 * (MarketingPostV2Row) og SAMME server actions (opprettMarketingPost,
 * settMarketingStatus). Ingen egen fasit tegner denne skjermen — port med
 * tl-kit-primitiver, samme lokal-helper-idiom som AdminAuditLogTrainLock/
 * AdminGodkjenningerTrainLock (egen StatusMerke/knappStil per skjerm).
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { useMemo, useState, useTransition } from "react";
import type { CSSProperties } from "react";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import {
  opprettMarketingPost,
  settMarketingStatus,
} from "@/lib/admin-marketing/actions";
import {
  KANAL_NAVN,
  MARKETING_KANALER,
  MARKETING_STATUSER,
  type MarketingKanal,
  type MarketingStatus,
} from "@/lib/admin-marketing/konstanter";
import { TlCaps, TlKnapp, TlKort, TlRad, TlTittel, TlTomTilstand, TL_PRESS } from "./tl-kit";

export interface MarketingPostV2Row {
  id: string;
  tittel: string;
  kanal: MarketingKanal;
  /** Ferdig formatert dato, f.eks. «Man 14. jul». */
  datoLabel: string;
  /** true når scheduledAt er før i dag (vises dimmet nederst). */
  passert: boolean;
  brief: string | null;
  status: MarketingStatus;
}

const STATUS_LABEL: Record<MarketingStatus, string> = {
  UTKAST: "Utkast",
  KLAR: "Klar",
  PUBLISERT: "Publisert",
};

const STATUS_FARGE: Record<MarketingStatus, string> = {
  UTKAST: TL.mute,
  KLAR: TL.warn,
  PUBLISERT: TL.ok,
};

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

function nesteStatus(s: MarketingStatus): MarketingStatus {
  const i = MARKETING_STATUSER.indexOf(s);
  return MARKETING_STATUSER[(i + 1) % MARKETING_STATUSER.length];
}

function StatusMerke({ status }: { status: MarketingStatus }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        color: status === "UTKAST" ? TL.text : STATUS_FARGE[status],
        boxShadow: `inset 0 0 0 1px ${status === "KLAR" ? TL.warnHair : TL.hair}`,
        flex: "none",
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Status-chip som sykles ved trykk — optimistisk UI + server-action (uendret logikk). */
function StatusSykleChip({ id, status }: { id: string; status: MarketingStatus }) {
  const [lokal, setLokal] = useState(status);
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState(false);

  const sykle = () => {
    const neste = nesteStatus(lokal);
    setLokal(neste);
    start(async () => {
      setFeil(false);
      try {
        const res = await settMarketingStatus(id, neste);
        if (!res.ok) throw new Error(res.error);
      } catch {
        setLokal(lokal);
        setFeil(true);
      }
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
      {feil && <span style={{ fontSize: 11, color: TL.danger }}>Feilet — prøv igjen</span>}
      <button
        type="button"
        onClick={sykle}
        disabled={pending}
        title={`Bytt til ${STATUS_LABEL[nesteStatus(lokal)].toLowerCase()}`}
        className={TL_PRESS}
        style={{ appearance: "none", background: "transparent", border: 0, padding: 0, cursor: "pointer", opacity: pending ? 0.5 : 1 }}
      >
        <StatusMerke status={lokal} />
      </button>
    </div>
  );
}

function TlFelt({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}><TlCaps size={10}>{label}</TlCaps></div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: 44,
          padding: "0 14px",
          borderRadius: TL.radius.field,
          background: TL.dock,
          boxShadow: `inset 0 0 0 1px ${TL.hair}`,
          color: TL.text,
          fontSize: 14,
          fontFamily: TL.font.sans,
          border: "none",
        }}
      />
    </div>
  );
}

function TlTekstOmraade({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}><TlCaps size={10}>{label}</TlCaps></div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: TL.radius.field,
          background: TL.dock,
          boxShadow: `inset 0 0 0 1px ${TL.hair}`,
          color: TL.text,
          fontSize: 14,
          fontFamily: TL.font.sans,
          border: "none",
          resize: "vertical",
        }}
      />
    </div>
  );
}

function KanalChips({ value, onChange }: { value: MarketingKanal; onChange: (k: MarketingKanal) => void }) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}><TlCaps size={10}>Kanal</TlCaps></div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {MARKETING_KANALER.map((k) => {
          const on = k === value;
          const style: CSSProperties = {
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 34,
            padding: "0 14px",
            borderRadius: 999,
            background: on ? TL.dim : "transparent",
            color: on ? TL.text : TL.mute,
            boxShadow: `inset 0 0 0 1px ${on ? "transparent" : TL.hair}`,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
          };
          return (
            <button key={k} type="button" className={TL_PRESS} onClick={() => onChange(k)} style={style}>
              {on && <Icon name="check" size={12} />}
              {KANAL_NAVN[k]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NyPostPopup({ onLukk }: { onLukk: () => void }) {
  const iDag = useMemo(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }, []);

  const [tittel, setTittel] = useState("");
  const [kanal, setKanal] = useState<MarketingKanal>("IG");
  const [dato, setDato] = useState(iDag);
  const [brief, setBrief] = useState("");
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const kanLagre = tittel.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(dato) && !pending;

  const lagre = () =>
    start(async () => {
      setFeil(null);
      try {
        const res = await opprettMarketingPost({
          title: tittel,
          channel: kanal,
          scheduledAt: dato,
          brief: brief.trim() || undefined,
        });
        if (!res.ok) {
          setFeil(res.error ?? "Noe gikk galt — prøv igjen.");
          return;
        }
        onLukk();
      } catch {
        setFeil("Noe gikk galt — prøv igjen.");
      }
    });

  return (
    <div
      onClick={onLukk}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: TL.scrim,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "6vh 16px 24px",
        overflowY: "auto",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560 }}>
        <TlKort pad="22px 22px">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
            <TlTittel sub="Innholdskalender">Ny post</TlTittel>
            <button
              type="button"
              onClick={onLukk}
              aria-label="Lukk"
              className={TL_PRESS}
              style={{ width: 30, height: 30, borderRadius: 9, background: TL.dock, border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none" }}
            >
              <Icon name="x" size={15} style={{ color: TL.mute }} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
            <TlFelt label="Tittel" value={tittel} onChange={setTittel} placeholder="F.eks. «Vintertrening i simulatoren»" />
            <KanalChips value={kanal} onChange={setKanal} />
            <TlFelt label="Dato" type="date" value={dato} onChange={setDato} />
            <TlTekstOmraade label="Brief (valgfritt)" value={brief} rows={4} placeholder="Hva skal posten handle om? Vinkling, budskap, bilde/video…" onChange={setBrief} />

            {feil && <span style={{ fontSize: 12, color: TL.danger }}>{feil}</span>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, opacity: pending ? 0.6 : 1 }}>
              <TlKnapp variant="tertiaer" disabled={pending} onClick={onLukk}>Avbryt</TlKnapp>
              <TlKnapp variant="primaer" icon="check" disabled={!kanLagre} onClick={lagre}>
                {pending ? "Lagrer …" : "Legg i kalenderen"}
              </TlKnapp>
            </div>
          </div>
        </TlKort>
      </div>
    </div>
  );
}

export function AdminMarketingTrainLock({ poster }: { poster: MarketingPostV2Row[] }) {
  const [nyOpen, setNyOpen] = useState(false);

  const kommende = useMemo(() => poster.filter((p) => !p.passert), [poster]);
  const tidligere = useMemo(() => poster.filter((p) => p.passert), [poster]);
  const antallKlar = useMemo(() => poster.filter((p) => p.status === "KLAR").length, [poster]);
  const antallUtkast = useMemo(() => poster.filter((p) => p.status === "UTKAST").length, [poster]);

  const rad = (p: MarketingPostV2Row, sist: boolean) => (
    <TlRad
      key={p.id}
      title={p.tittel}
      sub={[p.datoLabel, KANAL_NAVN[p.kanal], p.brief ?? undefined].filter(Boolean).join(" · ")}
      meta={<StatusSykleChip id={p.id} status={p.status} />}
      chevron={false}
      last={sist}
    />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <TlTittel sub="AgencyOS">Marketing</TlTittel>
        <TlKnapp variant="primaer" icon="plus" onClick={() => setNyOpen(true)}>Ny post</TlKnapp>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "16px 18px" }}>
          <TlCaps size={10}>Kommende poster</TlCaps>
          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text, fontVariantNumeric: "tabular-nums" }}>{kommende.length}</div>
        </div>
        <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "16px 18px" }}>
          <TlCaps size={10}>Klare til publisering</TlCaps>
          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: antallKlar > 0 ? TL.warn : TL.text, fontVariantNumeric: "tabular-nums" }}>{antallKlar}</div>
        </div>
        <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "16px 18px" }}>
          <TlCaps size={10}>Utkast</TlCaps>
          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text, fontVariantNumeric: "tabular-nums" }}>{antallUtkast}</div>
        </div>
      </div>

      <TlKort
        eyebrow="Kommende poster"
        action={kommende.length > 0 ? <TlCaps size={9}>{pl(kommende.length, "post", "poster")}</TlCaps> : undefined}
        pad="4px 20px"
      >
        {kommende.length === 0 ? (
          <div style={{ padding: "16px 0" }}>
            <TlTomTilstand icon="megaphone" title="Ingen planlagte poster" sub="Trykk «Ny post» for å legge den første posten i kalenderen." />
          </div>
        ) : (
          kommende.map((p, i) => rad(p, i === kommende.length - 1))
        )}
      </TlKort>

      {tidligere.length > 0 && (
        <TlKort
          eyebrow="Tidligere poster"
          action={<TlCaps size={9}>{pl(tidligere.length, "post", "poster")}</TlCaps>}
          pad="4px 20px"
          style={{ opacity: 0.75 }}
        >
          {tidligere.map((p, i) => rad(p, i === tidligere.length - 1))}
        </TlKort>
      )}

      {nyOpen && <NyPostPopup onLukk={() => setNyOpen(false)} />}
    </div>
  );
}
