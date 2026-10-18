"use client";

/**
 * AG-13-U Live coachingøkt · uten samtykke til opptak — Precision Athletics
 * (Claude Design 7d7c2994, ui_kits/agencyos/screens/AG-cockpit.jsx, AG13
 * med noConsent, «Live coachingøkt · uten samtykke til opptak»).
 *
 * Nattema via AgencyOSSkall natt (skallets egen regel: «Nattema (Live
 * coachingøkt). Hurtigknappen vises ikke på nattflater»; beslutninger.md
 * §PRECISION ATHLETICS: nattema i Live-økt) — satt av page.tsx.
 *
 * Opptaket åpnes med den faktiske økt-ID-en. Spiller, tilgang og registrert
 * lydsamtykke kontrolleres på serveren; ingen godkjenning antas i denne flaten.
 */
import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, Check, Mic, Star } from "lucide-react";
import { Ikon, Knapp, KnappLenke, Meta } from "@/components/precision/pa";
import { MicButton } from "@/components/shared/mic-button";
import { sendLiveMelding, sendBriefTilSpiller, lagreCoachVurdering } from "@/lib/agencyos/live-okt-actions";
import type { LiveOktData } from "@/lib/agencyos/live-okt-data";

function Kort({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) {
  return (
    <section className="pa-coach-live__section">
      {eyebrow && <h2>{eyebrow}</h2>}
      {children}
    </section>
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
      try {
        const res = await sendLiveMelding(sessionId, trimmet);
        if (!res.ok) setFeil(res.error);
        else { setTekst(""); setSendt(true); }
      } catch { setFeil("Meldingen ble ikke sendt. Teksten er beholdt; prøv igjen."); }
    });
  }

  return (
    <Kort eyebrow="Send melding nå">
      <div style={{ display: "flex", gap: 8 }}>
        <div className="pa-control" style={{ flex: 1, position: "relative", paddingRight: 44 }}>
          <input
            aria-label="Melding til spiller"
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
      try {
        const res = await sendBriefTilSpiller(sessionId, trimmet);
        if (!res.ok) setFeil(res.error);
        else setSendt(true);
      } catch { setFeil("Fokuspunktet ble ikke sendt. Teksten er beholdt; prøv igjen."); }
    });
  }

  return (
    <Kort eyebrow="Fokuspunkt før økten">
      <textarea
        aria-label="Fokuspunkt før økta"
        className="pa-control"
        value={tekst}
        onChange={(e) => {
          setTekst(e.target.value);
          setSendt(false);
        }}
        disabled={isPending}
        placeholder="Hva skal spilleren tenke på før økten starter?"
        rows={3}
        style={{ width: "100%", resize: "vertical", height: "auto", padding: 10, font: "var(--type-body)" }}
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
      try {
        const res = await lagreCoachVurdering(sessionId, rating, notat.trim());
        if (!res.ok) setFeil(res.error);
        else setLagret(true);
      } catch { setFeil("Vurderingen ble ikke lagret. Notatet er beholdt; prøv igjen."); }
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
            aria-pressed={n === rating}
            className="pa-iconbtn"
            style={{ color: n <= rating ? "var(--warn)" : "var(--text-faint)" }}
          >
            <Ikon icon={Star} size={20} />
          </button>
        ))}
      </div>
      <textarea
        aria-label="Coachens vurdering"
        className="pa-control"
        value={notat}
        onChange={(e) => {
          setNotat(e.target.value);
          setLagret(false);
        }}
        disabled={isPending}
        placeholder="Notat om økten (valgfritt)"
        rows={3}
        style={{ width: "100%", resize: "vertical", height: "auto", padding: 10, font: "var(--type-body)" }}
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
  const date = new Date(data.startTime).toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" });
  const time = new Date(data.startTime).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });
  return <div className="pa-side pa-coach-live" style={{ maxWidth: 1080 }}>
    <Link className="pa-live__secondary-link" href="/admin/agencyos/live"><Ikon icon={ArrowLeft} size={16} /> Til Live-tavla</Link>
    <header className="pa-pagehead">
      <h1 className="pa-pagehead__title">{data.spillerNavn ?? data.tittel}</h1>
      {data.spillerNavn && <p className="pa-pagehead__sub">{data.tittel}</p>}
      <p className="pa-live__help">{date} · <span className="pa-coach-live__data">{time}</span>{data.sted ? " · " + data.sted : ""}</p>
      {data.malsetning && <p className="pa-live__instruction">{data.malsetning}</p>}
      <KnappLenke icon={Mic} href={`/admin/recording/coaching?okt=${data.id}`}>Åpne coachingopptak</KnappLenke>
    </header>
    <div className="pa-coach-live__columns">
      <div className="pa-coach-live__work">
        <Kort eyebrow="Øvelser i økta">
          {data.driller.length === 0 ? <p>Det er ingen øvelser i denne økta ennå.</p> : data.driller.map(d => <article key={d.id} className="pa-coach-live__drill">
            <h3>{d.logget && <Ikon icon={Check} size={18} />} {d.navn}</h3>
            <p>{d.pyramide} · Planlagt <span className="pa-coach-live__data">{d.varighetMin} min</span></p>
            <p>{d.reps !== undefined ? <><span className="pa-coach-live__data">{d.reps ?? "—"}</span> registrerte repetisjoner</> : "Mengde ikke registrert"}
              {d.videoer ? <> · <span className="pa-coach-live__data">{d.videoer}</span> video</> : null}</p>
            {d.kommentar && <p className="pa-coach-live__comment">Spilleren: {d.kommentar}</p>}
          </article>)}
        </Kort>
        <details className="pa-live__notes"><summary>Øktopplysninger og opptaksstatus</summary><div className="pa-live__note-body">
          <dl className="pa-coach-live__metadata">
            <div><dt>Spiller</dt><dd>{data.spillerNavn ?? "Ikke satt"}</dd></div>
            <div><dt>Coach</dt><dd>{data.coachNavn ?? "—"}</dd></div>
            <div><dt>Sted</dt><dd>{data.sted ?? "Ikke satt"}</dd></div>
            <div><dt>Type</dt><dd>{data.type}</dd></div>
            <div><dt>Status</dt><dd>{data.status}</dd></div>
          </dl>
          {data.opptak ? <p>Registrert opptak: <span className="pa-coach-live__data">{fmtVarighet(data.opptak.durationSec)}</span> · {data.opptak.status.toLowerCase()}</p>
            : <p>Det er ingen registrerte lydopptak. Samtykke kontrolleres før et nytt opptak kan starte.</p>}
        </div></details>
      </div>
      <aside className="pa-coach-live__followup" aria-label="Oppfølging av denne økta">
        {data.kilde === "v2" && <>
          <details className="pa-live__notes"><summary>Melding til spilleren</summary><LiveMeldingSeksjon sessionId={data.id} /></details>
          <details className="pa-live__notes"><summary>Fokuspunkt før økta</summary><BriefSeksjon sessionId={data.id} initialMelding={data.coachBrief} /></details>
          <details className="pa-live__notes"><summary>Coachens vurdering</summary><VurderingSeksjon sessionId={data.id} initialRating={data.coachRating} /></details>
        </>}
        <details className="pa-live__notes"><summary>Analyse fra opptaket</summary><div className="pa-live__note-body">
          <p>{data.opptak?.coachAnalyse ?? "Ingen ferdig analyse er registrert. Analyse vises når opptaket er behandlet."}</p>
        </div></details>
        <details className="pa-live__notes"><summary>Transkript</summary><div className="pa-live__note-body">
          <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{data.opptak?.transcript ?? "Ingen transkript er registrert."}</p>
        </div></details>
      </aside>
    </div>
  </div>;
}
