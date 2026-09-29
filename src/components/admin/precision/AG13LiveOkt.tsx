"use client";

/**
 * AG-13-U Live coachingøkt · uten samtykke til opptak — Precision Athletics
 * (Claude Design 7d7c2994, ui_kits/agencyos/screens/AG-cockpit.jsx, AG13
 * med noConsent, «Live coachingøkt · uten samtykke til opptak»).
 *
 * Nattema (beslutninger.md §SKJERMENE … RUNDE 8: «AG-13 Live coachingøkt er
 * nattema: AgencyOSSkall med natt, ingen hurtigknapp» — satt av page.tsx).
 *
 * Bevisst avvik fra tegningen:
 *   - Samtykke til opptak finnes ikke som eget felt i datamodellen ennå
 *     (beslutninger.md §ÉN IUP …, punkt 5: «samtykke til opptak … additivt
 *     … først når skjermene er godkjent»). Denne sida viser derfor alltid
 *     AG-13-U-tilstanden (opptaket vises som ikke startet, «Start opptak»)
 *     — aldri en fabrikert samtykke-status. Når feltet finnes, styrer det
 *     om «Start opptak»-kortet vises.
 *   - Én ting nå-kortet, driller, transkript og analyse er datalikt med
 *     før portingen (lastLiveOktData/live-okt-actions.ts, urørt).
 */
import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Star } from "lucide-react";
import { Ikon, Knapp, Meta } from "@/components/precision/pa";
import { Nokkellinje } from "@/components/precision/pa-a3";
import { MicButton } from "@/components/shared/mic-button";
import { sendLiveMelding, sendBriefTilSpiller, lagreCoachVurdering } from "@/lib/agencyos/live-okt-actions";
import type { LiveOktData } from "@/lib/agencyos/live-okt-data";

function Kort({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="pa-card" style={{ padding: 16, gap: 10 }}>
      {eyebrow && <span className="kicker">{eyebrow}</span>}
      {children}
    </div>
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
        <div className="pa-control" style={{ flex: 1, position: "relative", paddingRight: 44 }}>
          <input
            type="text"
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
          />
          <span style={{ position: "absolute", right: 6 }}>
            <MicButton variant="suffix" onResult={(t) => setTekst((prev) => (prev ? prev + " " + t : t))} disabled={isPending} />
          </span>
        </div>
        <Knapp variant="secondary" onClick={send} disabled={isPending} loading={isPending} loadingText="Sender …">
          Send
        </Knapp>
      </div>
      {feil && <Meta style={{ color: "var(--signal-ink)" }}>{feil}</Meta>}
      {sendt && !isPending && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-meta)", color: "var(--ok)" }}>
          <Ikon icon={Check} size={13} /> Sendt til spiller
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
        className="pa-control"
        value={tekst}
        onChange={(e) => {
          setTekst(e.target.value);
          setSendt(false);
        }}
        disabled={isPending}
        placeholder="Hva skal spilleren tenke på før økten starter?"
        rows={3}
        style={{ width: "100%", resize: "vertical", height: "auto", padding: 10 }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Knapp variant="secondary" onClick={send} disabled={isPending} loading={isPending} loadingText="Sender …">
          Send til spiller
        </Knapp>
        {feil && <Meta style={{ color: "var(--signal-ink)" }}>{feil}</Meta>}
        {sendt && !isPending && !feil && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-meta)", color: "var(--ok)" }}>
            <Ikon icon={Check} size={13} /> Sendt
          </span>
        )}
      </div>
    </Kort>
  );
}

function VurderingSeksjon({ sessionId, initialRating }: { sessionId: string; initialRating: number | null }) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [notat, setNotat] = useState("");
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
            className="pa-iconbtn"
            style={{ color: n <= rating ? "var(--warn)" : "var(--text-faint)" }}
          >
            <Ikon icon={Star} size={20} />
          </button>
        ))}
      </div>
      <textarea
        className="pa-control"
        value={notat}
        onChange={(e) => {
          setNotat(e.target.value);
          setLagret(false);
        }}
        disabled={isPending}
        placeholder="Notat om økten (valgfritt)"
        rows={3}
        style={{ width: "100%", resize: "vertical", height: "auto", padding: 10 }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Knapp variant="secondary" onClick={lagre} disabled={isPending} loading={isPending} loadingText="Lagrer …">
          Lagre vurdering
        </Knapp>
        {feil && <Meta style={{ color: "var(--signal-ink)" }}>{feil}</Meta>}
        {lagret && !isPending && !feil && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-meta)", color: "var(--ok)" }}>
            <Ikon icon={Check} size={13} /> Lagret
          </span>
        )}
      </div>
    </Kort>
  );
}

export function AG13LiveOkt({ data }: { data: LiveOktData }) {
  return (
    <div className="pa-side" style={{ maxWidth: 1080 }}>
      <div>
        <h1 className="pa-pagehead__title" style={{ margin: 0 }}>{data.tittel}</h1>
        <Meta>
          {new Date(data.startTime).toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short" })} ·{" "}
          {new Date(data.startTime).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}
        </Meta>
      </div>

      {!data.opptak && (
        <div className="pa-alert pa-alert--signal" style={{ flexDirection: "column", gap: 10 }}>
          <span className="pa-alert__title">Start opptaket før du sier noe</span>
          <p style={{ margin: 0 }}>
            Alt du sier fra du trykker og til du stopper blir til transkript, analyse og hjemmelekse. Starter du sent, mister spilleren begynnelsen av det du forklarte.
          </p>
          <Link href={`/admin/recording?okt=${data.id}`} className="pa-btn pa-btn--signal" style={{ alignSelf: "flex-start" }}>
            Start opptak
          </Link>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Kort eyebrow="Økta">
            <Nokkellinje k="Spiller" v={data.spillerNavn ?? "ikke satt"} />
            <Nokkellinje k="Coach" v={data.coachNavn ?? "—"} />
            <Nokkellinje k="Sted" v={data.sted ?? "ikke satt"} />
            <Nokkellinje k="Type" v={data.type} />
            <Nokkellinje k="Status" v={data.status} />
            {data.malsetning && <p style={{ margin: "4px 0 0", font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{data.malsetning}</p>}
          </Kort>

          <LiveMeldingSeksjon sessionId={data.id} />
          <BriefSeksjon sessionId={data.id} initialMelding={data.coachBrief} />

          <Kort eyebrow="Løpet">
            {data.driller.length === 0 ? (
              <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen driller på denne økta ennå.</p>
            ) : (
              data.driller.map((d) => (
                <div key={d.id} className="pa-row" style={{ minHeight: 40, padding: "8px 0" }}>
                  <span style={{ flex: 1, display: "inline-flex", alignItems: "center", gap: 8, font: "var(--type-body-s)", color: "var(--text-primary)" }}>
                    {d.logget && <Ikon icon={Check} size={14} />}
                    {d.navn}
                  </span>
                  <Meta>{d.pyramide} · {d.varighetMin} min</Meta>
                </div>
              ))
            )}
          </Kort>

          <VurderingSeksjon sessionId={data.id} initialRating={data.coachRating} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Kort eyebrow="Opptak">
            <div style={{ font: "600 15px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>Lyd fra økta</div>
            {data.opptak ? (
              <>
                <p style={{ margin: 0, font: "700 24px/1 var(--font-mono)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{fmtVarighet(data.opptak.durationSec)}</p>
                <Meta>status: {data.opptak.status.toLowerCase()}</Meta>
              </>
            ) : (
              <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen opptak på denne økta ennå. Opptaket startes fra kortet øverst.</p>
            )}
          </Kort>

          <Kort eyebrow="Siste analyse">
            {data.opptak?.coachAnalyse ? (
              <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-primary)" }}>{data.opptak.coachAnalyse}</p>
            ) : (
              <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
                {data.opptak ? "Analysen lages av opptaket. Kjøres når opptaket er ferdig transkribert." : "Analysen lages av opptaket. Start opptaket øverst, så kommer analysen hit når den er ferdig."}
              </p>
            )}
          </Kort>

          <Kort eyebrow="Transkript">
            {data.opptak?.transcript ? (
              <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-primary)", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{data.opptak.transcript}</p>
            ) : (
              <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen transkript ennå. Kommer når opptaket er ferdig behandlet.</p>
            )}
          </Kort>
        </div>
      </div>
    </div>
  );
}
