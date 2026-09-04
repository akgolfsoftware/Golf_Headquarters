"use client";

/**
 * Coachens per-økt live-visning — Train-lock (T9, 27.08.2026).
 *
 * Fasit: `AG-09b Live-tavle full.dc.html` — samme kortspråk (avatar, warm =
 * fullført, ingen fargekoding på status) skalert opp til én-økt-detalj.
 * Ingen egen AG-09b-ramme viser en full enkelt-økt-side (AG-09b er en
 * BOARD over flere økter) — denne siden porter derfor tokens/komponent-
 * språk, ikke en 1:1-ramme (Klasse A-mønster: «detaljside etter hub»).
 *
 * ABSORBERER de pensjonerte `(legacy)/live/[sessionId]/{active,brief,
 * summary}` (docs/natt/D-LYS-OG-5T-BESLUTNING.md §0/§2.4 rad 11/12/32):
 * coach-melding, brief-før-økt og post-økt-vurdering er nå seksjoner her i
 * stedet for tre separate ruter. Server actions: `live-okt-actions.ts`.
 *
 * Miljø-feltet (`MMiljo`-enum, M0–M5) er STALE AK-formel v1-vokabular
 * (CLAUDE.md invariant 1 — v2 har ikke Miljø M0–M5). Vises derfor IKKE i
 * denne porten — ikke en datamigrasjon, kun et visningsvalg. Se T9-DONE.md.
 */

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { MicButton } from "@/components/shared/mic-button";
import { sendLiveMelding, sendBriefTilSpiller, lagreCoachVurdering } from "@/lib/agencyos/live-okt-actions";
import type { LiveOktData } from "@/lib/agencyos/live-okt-data";

function CapsLabel({ children, color = TL.mute }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ fontFamily: TL.font.mono, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: TL.track.capsSm, color }}>
      {children}
    </span>
  );
}

function Kort({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) {
  return (
    <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
      {eyebrow && <CapsLabel>{eyebrow}</CapsLabel>}
      {children}
    </div>
  );
}

function Linje({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: `1px solid ${TL.hair}` }}>
      <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>{k}</span>
      <span style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>{v}</span>
    </div>
  );
}

function GhostButton({ children, onClick, disabled, busy }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; busy?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        alignSelf: "flex-start",
        border: `1px solid ${TL.hair}`,
        background: "transparent",
        color: TL.text,
        borderRadius: TL.radius.pill,
        padding: "8px 16px",
        fontFamily: TL.font.sans,
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {busy && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

function fmtVarighet(sec: number | null): string {
  if (sec == null) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function LiveMeldingSeksjon({ sessionId }: { sessionId: string }) {
  const [tekst, setTekst] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);
  const [isPending, startTransition] = useTransition();

  function send() {
    const trimmet = tekst.trim();
    if (trimmet.length === 0) {
      setFeil("Skriv en melding først");
      return;
    }
    setFeil(null);
    setSendt(false);
    startTransition(async () => {
      const res = await sendLiveMelding(sessionId, trimmet);
      if (!res.ok) setFeil(res.error);
      else {
        setTekst("");
        setSendt(true);
      }
    });
  }

  return (
    <Kort eyebrow="Send melding nå">
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
          <input
            type="text"
            className="v2-focus"
            value={tekst}
            onChange={(e) => {
              setTekst(e.target.value);
              setSendt(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isPending) {
                e.preventDefault();
                send();
              }
            }}
            disabled={isPending}
            placeholder="Skriv en rask melding …"
            style={{
              flex: 1,
              minWidth: 0,
              height: TL.tap.min,
              padding: "0 44px 0 12px",
              borderRadius: TL.radius.field,
              border: `1px solid ${TL.hair}`,
              background: TL.dim,
              color: TL.text,
              fontFamily: TL.font.sans,
              fontSize: 13.5,
              outline: "none",
            }}
          />
          <span style={{ position: "absolute", right: 6 }}>
            <MicButton variant="suffix" onResult={(t) => setTekst((prev) => (prev ? prev + " " + t : t))} disabled={isPending} />
          </span>
        </div>
        <GhostButton onClick={send} disabled={isPending} busy={isPending}>
          Send
        </GhostButton>
      </div>
      {feil && <CapsLabel color={TL.danger}>{feil}</CapsLabel>}
      {sendt && !isPending && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: TL.font.mono, fontSize: 11, color: TL.warm }}>
          <Check size={13} />
          Sendt til spiller
        </span>
      )}
    </Kort>
  );
}

function BriefSeksjon({ sessionId, initialMelding }: { sessionId: string; initialMelding: string }) {
  const [tekst, setTekst] = useState(initialMelding);
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);
  const [isPending, startTransition] = useTransition();

  function send() {
    const trimmet = tekst.trim();
    if (trimmet.length === 0) {
      setFeil("Skriv et fokuspunkt først");
      return;
    }
    setFeil(null);
    setSendt(false);
    startTransition(async () => {
      const res = await sendBriefTilSpiller(sessionId, trimmet);
      if (!res.ok) setFeil(res.error);
      else setSendt(true);
    });
  }

  return (
    <Kort eyebrow="Fokuspunkt før økten">
      <textarea
        className="v2-focus"
        value={tekst}
        onChange={(e) => {
          setTekst(e.target.value);
          setSendt(false);
        }}
        disabled={isPending}
        placeholder="Hva skal spilleren tenke på før økten starter?"
        rows={3}
        style={{
          width: "100%",
          resize: "vertical",
          padding: 12,
          borderRadius: TL.radius.field,
          border: `1px solid ${TL.hair}`,
          background: TL.dim,
          color: TL.text,
          fontFamily: TL.font.sans,
          fontSize: 13.5,
          outline: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <GhostButton onClick={send} disabled={isPending} busy={isPending}>
          Send til spiller
        </GhostButton>
        {feil && <CapsLabel color={TL.danger}>{feil}</CapsLabel>}
        {sendt && !isPending && !feil && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: TL.font.mono, fontSize: 11, color: TL.warm }}>
            <Check size={13} />
            Sendt
          </span>
        )}
      </div>
    </Kort>
  );
}

function VurderingSeksjon({ sessionId, initialRating, initialNotat }: { sessionId: string; initialRating: number | null; initialNotat: string }) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [notat, setNotat] = useState(initialNotat);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const [isPending, startTransition] = useTransition();

  function lagre() {
    if (rating < 1) {
      setFeil("Velg 1–5 stjerner først");
      return;
    }
    setFeil(null);
    setLagret(false);
    startTransition(async () => {
      const res = await lagreCoachVurdering(sessionId, rating, notat.trim());
      if (!res.ok) setFeil(res.error);
      else setLagret(true);
    });
  }

  return (
    <Kort eyebrow="Vurder økten">
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              setRating(n);
              setLagret(false);
            }}
            aria-label={`${n} av 5`}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: n <= rating ? TL.warm : TL.hair }}
          >
            <Icon name="star" size={20} />
          </button>
        ))}
      </div>
      <textarea
        className="v2-focus"
        value={notat}
        onChange={(e) => {
          setNotat(e.target.value);
          setLagret(false);
        }}
        disabled={isPending}
        placeholder="Notat om økten (valgfritt)"
        rows={3}
        style={{
          width: "100%",
          resize: "vertical",
          padding: 12,
          borderRadius: TL.radius.field,
          border: `1px solid ${TL.hair}`,
          background: TL.dim,
          color: TL.text,
          fontFamily: TL.font.sans,
          fontSize: 13.5,
          outline: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <GhostButton onClick={lagre} disabled={isPending} busy={isPending}>
          Lagre vurdering
        </GhostButton>
        {feil && <CapsLabel color={TL.danger}>{feil}</CapsLabel>}
        {lagret && !isPending && !feil && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: TL.font.mono, fontSize: 11, color: TL.warm }}>
            <Check size={13} />
            Lagret
          </span>
        )}
      </div>
    </Kort>
  );
}

export function LiveOktCoachTrainLock({ data }: { data: LiveOktData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 1080 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: TL.storrelse.kortTittel, fontWeight: 700, color: TL.text }}>{data.tittel}</h1>
        <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, marginTop: 4 }}>
          {new Date(data.startTime).toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short" })} ·{" "}
          {new Date(data.startTime).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {!data.opptak && (
        <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
          <CapsLabel color={TL.warm}>Én ting nå</CapsLabel>
          <div style={{ fontFamily: TL.font.sans, fontSize: 17, fontWeight: 700, color: TL.text }}>Start opptaket før du sier noe</div>
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
            Alt du sier fra du trykker og til du stopper blir til transkript, analyse og hjemmelekse. Starter du sent, mister spilleren begynnelsen av det du forklarte.
          </p>
          <Link
            href={`/admin/recording?okt=${data.id}`}
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              minHeight: TL.tap.cta,
              padding: "10px 18px",
              borderRadius: TL.radius.pill,
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Start opptak
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]" style={{ gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Kort eyebrow="Økta">
            <Linje k="Spiller" v={data.spillerNavn ?? "ikke satt"} />
            <Linje k="Coach" v={data.coachNavn ?? "—"} />
            <Linje k="Sted" v={data.sted ?? "ikke satt"} />
            <Linje k="Type" v={data.type} />
            <Linje k="Status" v={data.status} />
            {data.malsetning && <p style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>{data.malsetning}</p>}
          </Kort>

          <LiveMeldingSeksjon sessionId={data.id} />
          <BriefSeksjon sessionId={data.id} initialMelding={data.coachBrief} />

          <Kort eyebrow="Løpet">
            {data.driller.length === 0 ? (
              <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>Ingen driller på denne økta ennå.</p>
            ) : (
              data.driller.map((d, i) => (
                <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: i === data.driller.length - 1 ? "none" : `1px solid ${TL.hair}` }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: TL.font.sans, fontSize: 13, color: TL.text }}>
                    {d.logget && <Check size={14} color={TL.warm} />}
                    {d.navn}
                  </span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>
                    {d.pyramide} · {d.varighetMin} min
                  </span>
                </div>
              ))
            )}
          </Kort>

          <VurderingSeksjon sessionId={data.id} initialRating={data.coachRating} initialNotat="" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Kort eyebrow="Opptak">
            <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 700, color: TL.text }}>Lyd fra økta</div>
            {data.opptak ? (
              <>
                <p style={{ margin: 0, fontFamily: TL.font.mono, fontSize: 24, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>{fmtVarighet(data.opptak.durationSec)}</p>
                <CapsLabel>status: {data.opptak.status.toLowerCase()}</CapsLabel>
              </>
            ) : (
              <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>Ingen opptak på denne økta ennå. Opptaket startes fra Én ting nå øverst.</p>
            )}
          </Kort>

          <Kort eyebrow="Siste analyse">
            {data.opptak?.coachAnalyse ? (
              <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.text, lineHeight: 1.5 }}>{data.opptak.coachAnalyse}</p>
            ) : (
              <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>
                {data.opptak ? "Analysen lages av opptaket. Kjøres når opptaket er ferdig transkribert." : "Analysen lages av opptaket. Start opptaket øverst, så kommer analysen hit når den er ferdig."}
              </p>
            )}
          </Kort>

          <Kort eyebrow="Transkript">
            {data.opptak?.transcript ? (
              <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{data.opptak.transcript}</p>
            ) : (
              <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>Ingen transkript ennå. Kommer når opptaket er ferdig behandlet.</p>
            )}
          </Kort>
        </div>
      </div>
    </div>
  );
}
