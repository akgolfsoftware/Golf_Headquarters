"use client";

/**
 * AgencyOS Marketing — v2 (retning C «Presis»). M1-grunnmuren: innholds-
 * kalender (planlagte poster sortert på dato) + «Ny post»-skjema i popup +
 * status-chips som sykles ved trykk (UTKAST → KLAR → PUBLISERT → UTKAST,
 * samme sykle-chip-idiom som WorkbenchV2s AK-formel-chips).
 *
 * Ingen AI-generering, ingen auto-publisering, ingen eksterne API-er (M2/M3).
 * Komponert utelukkende av v2-biblioteket (src/components/v2) — ingen ad-hoc
 * stiler der kanon finnes, ingen rå hex (kun T.*). Popup-mønster: samme
 * fixed-overlegg som AdminEmailV2 (overlays.tsx-Modal er statisk galleri).
 */

import { useMemo, useState, useTransition } from "react";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  StatusPill,
  CTAPill,
  Knapp,
  FilterChips,
  TomTilstand,
  Inndata,
  TekstOmraade,
  Icon,
  T,
  type StatusTone,
} from "@/components/v2";
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

// ── Datakontrakt (mappes fra Prisma i ruten) ────────────────────
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

const STATUS_META: Record<MarketingStatus, { label: string; tone: StatusTone }> = {
  UTKAST: { label: "Utkast", tone: "warn" },
  KLAR: { label: "Klar", tone: "up" },
  PUBLISERT: { label: "Publisert", tone: "info" },
};

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/** Neste status i syklusen (UTKAST → KLAR → PUBLISERT → UTKAST). */
function nesteStatus(s: MarketingStatus): MarketingStatus {
  const i = MARKETING_STATUSER.indexOf(s);
  return MARKETING_STATUSER[(i + 1) % MARKETING_STATUSER.length];
}

/** Status-chip som sykles ved trykk — optimistisk UI + server-action. */
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
        setLokal(lokal); // rull tilbake
        setFeil(true);
      }
    });
  };

  const meta = STATUS_META[lokal];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
      {feil && <span style={{ fontFamily: T.ui, fontSize: 11, color: T.down }}>Feilet — prøv igjen</span>}
      <button
        type="button"
        onClick={sykle}
        disabled={pending}
        title={`Bytt til ${STATUS_META[nesteStatus(lokal)].label.toLowerCase()}`}
        className="v2-press v2-focus"
        style={{ appearance: "none", background: "transparent", border: 0, padding: 0, cursor: "pointer", opacity: pending ? 0.5 : 1 }}
      >
        <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
      </button>
    </div>
  );
}

/** «Ny post»-skjema i popup (samme fixed-overlegg-mønster som AdminEmailV2). */
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
        background: "rgba(0,0,0,0.62)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "6vh 16px 24px",
        overflowY: "auto",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560 }}>
        <Kort>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
            <div>
              <Caps size={9} color={T.lime}>Innholdskalender</Caps>
              <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: T.fg, margin: "8px 0 0" }}>
                Ny post
              </h2>
            </div>
            <button
              type="button"
              onClick={onLukk}
              aria-label="Lukk"
              className="v2-press v2-focus"
              style={{ width: 30, height: 30, borderRadius: 9, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none" }}
            >
              <Icon name="x" size={15} style={{ color: T.fg2 }} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
            <Inndata
              label="Tittel"
              value={tittel}
              placeholder="F.eks. «Vintertrening i simulatoren»"
              onChange={setTittel}
            />

            <div>
              <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg2, display: "block", marginBottom: 7 }}>Kanal</span>
              <FilterChips
                items={MARKETING_KANALER.map((k) => KANAL_NAVN[k])}
                active={[KANAL_NAVN[kanal]]}
                onToggle={(navn) => {
                  const k = MARKETING_KANALER.find((x) => KANAL_NAVN[x] === navn);
                  if (k) setKanal(k);
                }}
              />
            </div>

            <Inndata label="Dato" type="date" value={dato} onChange={setDato} />

            <TekstOmraade
              label="Brief (valgfritt)"
              value={brief}
              rows={4}
              placeholder="Hva skal posten handle om? Vinkling, budskap, bilde/video…"
              onChange={setBrief}
            />

            {feil && <span style={{ fontFamily: T.ui, fontSize: 12, color: T.down }}>{feil}</span>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, opacity: pending ? 0.6 : 1 }}>
              <Knapp ghost disabled={pending} onClick={onLukk}>
                Avbryt
              </Knapp>
              <Knapp icon="check" disabled={!kanLagre} onClick={lagre}>
                {pending ? "Lagrer…" : "Legg i kalenderen"}
              </Knapp>
            </div>
          </div>
        </Kort>
      </div>
    </div>
  );
}

export function AdminMarketingV2({ poster }: { poster: MarketingPostV2Row[] }) {
  const [nyOpen, setNyOpen] = useState(false);

  const kommende = useMemo(() => poster.filter((p) => !p.passert), [poster]);
  const tidligere = useMemo(() => poster.filter((p) => p.passert), [poster]);
  const antallKlar = useMemo(() => poster.filter((p) => p.status === "KLAR").length, [poster]);
  const antallUtkast = useMemo(() => poster.filter((p) => p.status === "UTKAST").length, [poster]);

  const rad = (p: MarketingPostV2Row, sist: boolean) => (
    <Rad
      key={p.id}
      leading={
        <span style={{ width: 32, height: 32, borderRadius: 9, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icon name="megaphone" size={15} style={{ color: T.mut }} />
        </span>
      }
      title={p.tittel}
      sub={[p.datoLabel, KANAL_NAVN[p.kanal], p.brief ?? undefined].filter(Boolean).join(" · ")}
      meta={<StatusSykleChip id={p.id} status={p.status} />}
      last={sist}
    />
  );

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>Marketing · AgencyOS</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="kalender.">Innholds-</Tittel>
        </div>
      </div>
      <div className="hidden md:inline-flex">
        <span onClick={() => setNyOpen(true)} style={{ display: "inline-flex" }}>
          <CTAPill icon="plus">Ny post</CTAPill>
        </span>
      </div>
    </div>
  );

  // ── KPI-fliser ────────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Kommende poster" value={kommende.length} />
      <KpiFlis label="Klare til publisering" value={antallKlar} varsle={antallKlar > 0} />
      <KpiFlis label="Utkast" value={antallUtkast} />
    </div>
  );

  // ── Kalender-liste ────────────────────────────────────────────
  const liste = (
    <Kort
      eyebrow="Kommende poster"
      action={kommende.length > 0 ? <Caps size={9}>{pl(kommende.length, "post", "poster")}</Caps> : undefined}
      pad="4px 20px"
    >
      {kommende.length === 0 ? (
        <div style={{ padding: "16px 0" }}>
          <TomTilstand
            icon="megaphone"
            title="Ingen planlagte poster"
            sub="Trykk «Ny post» for å legge den første posten i kalenderen."
          />
        </div>
      ) : (
        kommende.map((p, i) => rad(p, i === kommende.length - 1))
      )}
    </Kort>
  );

  const historikk =
    tidligere.length > 0 ? (
      <Kort
        eyebrow="Tidligere poster"
        action={<Caps size={9}>{pl(tidligere.length, "post", "poster")}</Caps>}
        pad="4px 20px"
        style={{ opacity: 0.75 }}
      >
        {tidligere.map((p, i) => rad(p, i === tidligere.length - 1))}
      </Kort>
    ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}

      {/* Mobil-handling (skjult på desktop der den ligger i hodet) */}
      <div className="flex md:hidden">
        <Knapp icon="plus" full onClick={() => setNyOpen(true)}>
          Ny post
        </Knapp>
      </div>

      {kpi}
      {liste}
      {historikk}

      {nyOpen && <NyPostPopup onLukk={() => setNyOpen(false)} />}
    </div>
  );
}
