"use client";

/**
 * Del runde (/portal/statistikk/runder/[runId]/del) i nytt design (pakke 13, vedtak 16.10.2026
 * §DEL RUNDE FINNES VED LANSERING). Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «del».
 * Stil: playerhq-ny-statsresten.css.
 *
 * «Lagre bildet» lager et ekte bilde (PNG 1080 × 1920 for story, 1080 × 1080 for innlegg) i nettleseren, eller
 * henter PDF-scorekortet fra /api/portal/runder/[runId]/scorekort. På mobil åpnes delingsarket, så bildet kan
 * lagres i Bilder. Synligheten lagres på runden (Round.sharedWithCoach) med en gang den velges.
 * Ingen delingslenke og ingen offentlig rundeside.
 *
 * Avvik:
 *   - Til par regnes fra hullene. Er ikke alle hullene ført, står «—» i stedet for «på par».
 *   - SG-tallene er rundens egne (estimat); står ett tomt, vises «—».
 *   - «Anders ser runden» sier «Coachen ser runden», fordi spilleren kan ha en annen coach.
 */
import { useRef, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { TmTilbake } from "./PH17TmFelles";
import { delFilnavn, FORMAT_MAAL, initialer, motParOrd, sgTekst, type DelFormat, type DelRundeData } from "@/lib/portal-analyse/del-runde";
import { settRundeSynlighet } from "@/app/portal/statistikk/runder/[runId]/del/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";
import "@/styles/playerhq-ny-statsresten.css";

const BILDE = "/images/playerhq/spill-bane.jpg";
const LOGO = "/logos/logo-ak-golf-hq-negative.svg";
const FORMATER: { id: DelFormat; navn: string; tekst: string }[] = [
  { id: "story", navn: "Story", tekst: "Bilde 1080 × 1920" },
  { id: "post", navn: "Innlegg", tekst: "Bilde 1080 × 1080" },
  { id: "pdf", navn: "PDF", tekst: "Scorekort med alle hull" },
];

function lastBilde(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, feil) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => feil(new Error(src));
    img.src = src;
  });
}

/** Tegner delekortet på et lerret i full oppløsning. Samme innhold som forhåndsvisningen. */
async function tegnKort(d: DelRundeData, spiller: string, format: "story" | "post", font: { sans: string; mono: string }): Promise<Blob> {
  const { b, h } = FORMAT_MAAL[format];
  const c = document.createElement("canvas");
  c.width = b; c.height = h;
  const x = c.getContext("2d");
  if (!x) throw new Error("Lerret mangler");
  const [bilde, logo] = await Promise.all([lastBilde(BILDE), lastBilde(LOGO).catch(() => null)]);
  x.fillStyle = "#141413";
  x.fillRect(0, 0, b, h);
  const bildeH = format === "story" ? Math.round(h * 0.5) : Math.round(h * 0.36);
  const skala = Math.max(b / bilde.width, bildeH / bilde.height);
  x.save();
  x.globalAlpha = 0.85;
  x.beginPath(); x.rect(0, 0, b, bildeH); x.clip();
  x.drawImage(bilde, (b - bilde.width * skala) / 2, (bildeH - bilde.height * skala) / 2, bilde.width * skala, bilde.height * skala);
  x.restore();

  const p = 72;
  let y = bildeH + (format === "story" ? 96 : 64);
  // Avatar og navn
  x.fillStyle = "#ffffff";
  x.beginPath(); x.arc(p + 52, y, 52, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#141413"; x.textAlign = "center"; x.textBaseline = "middle";
  x.font = `600 38px ${font.sans}`;
  x.fillText(initialer(spiller), p + 52, y + 2);
  x.textAlign = "left"; x.textBaseline = "alphabetic"; x.fillStyle = "#ffffff";
  x.font = `600 44px ${font.sans}`;
  x.fillText(spiller, p + 134, y - 6, b - p * 2 - 134);
  x.globalAlpha = 0.8; x.font = `400 34px ${font.sans}`;
  x.fillText(`${d.bane} · ${d.dato}`, p + 134, y + 40, b - p * 2 - 134);
  x.globalAlpha = 1;
  // Score
  y += format === "story" ? 300 : 230;
  x.font = `600 ${format === "story" ? 260 : 200}px ${font.mono}`;
  x.fillText(String(d.brutto), p - 8, y);
  const scoreB = x.measureText(String(d.brutto)).width;
  x.globalAlpha = 0.8; x.font = `500 52px ${font.mono}`;
  x.fillText(`brutto · ${motParOrd(d.motPar)}`, p + scoreB + 20, y, b - p * 2 - scoreB - 20);
  x.globalAlpha = 1;
  // SG-boksene
  y += format === "story" ? 90 : 64;
  const gap = 20; const bw = (b - p * 2 - gap * 3) / 4; const bh = 150;
  d.sg.forEach((s, i) => {
    const bx = p + i * (bw + gap);
    x.fillStyle = "rgba(255,255,255,0.1)";
    x.beginPath(); x.roundRect(bx, y, bw, bh, 22); x.fill();
    x.fillStyle = "#ffffff"; x.font = `400 30px ${font.sans}`;
    x.fillText(s.navn, bx + 24, y + 52, bw - 40);
    x.font = `600 50px ${font.mono}`;
    x.fillText(sgTekst(s.v), bx + 24, y + 118, bw - 40);
  });
  // Logo
  if (logo) {
    const lh = 40; const lw = (logo.width / logo.height) * lh || 180;
    x.globalAlpha = 0.8;
    x.drawImage(logo, p, h - p - lh, lw, lh);
    x.globalAlpha = 1;
  }
  return new Promise((ok, feil) => c.toBlob((blob) => (blob ? ok(blob) : feil(new Error("Bildet kunne ikke lages"))), "image/png"));
}

async function lagreFil(blob: Blob, filnavn: string): Promise<"delt" | "lastet"> {
  const fil = new File([blob], filnavn, { type: blob.type });
  if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [fil] })) {
    try {
      await navigator.share({ files: [fil] });
      return "delt";
    } catch (e) {
      if ((e as Error).name === "AbortError") throw e;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filnavn;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "lastet";
}

export function PH18DelRunde({ d, spiller }: { d: DelRundeData; spiller: string }) {
  const [format, setFormat] = useState<DelFormat>("story");
  const [delt, setDelt] = useState(d.sharedWithCoach);
  const [lagrer, setLagrer] = useState(false);
  const [melding, setMelding] = useState<{ ok: boolean; tekst: string } | null>(null);
  const [, start] = useTransition();
  const kort = useRef<HTMLDivElement>(null);

  function velgSynlighet(v: boolean) {
    if (v === delt) return;
    const forrige = delt;
    setDelt(v);
    setMelding(null);
    start(async () => {
      const svar = await settRundeSynlighet({ roundId: d.id, sharedWithCoach: v });
      if (!svar.ok) { setDelt(forrige); setMelding({ ok: false, tekst: `Synligheten ble ikke lagret. ${svar.feil}` }); }
    });
  }

  async function lagre() {
    setLagrer(true);
    setMelding(null);
    try {
      let blob: Blob;
      if (format === "pdf") {
        const res = await fetch(`/api/portal/runder/${encodeURIComponent(d.id)}/scorekort`);
        if (!res.ok) throw new Error();
        blob = await res.blob();
      } else {
        const stil = kort.current ? getComputedStyle(kort.current) : null;
        const sans = stil?.fontFamily || "system-ui, sans-serif";
        const mono = (kort.current?.querySelector(".phn-dk-score") && getComputedStyle(kort.current.querySelector(".phn-dk-score")!).fontFamily) || "ui-monospace, monospace";
        if ("fonts" in document) await document.fonts.ready;
        blob = await tegnKort(d, spiller, format, { sans, mono });
      }
      const hvordan = await lagreFil(blob, delFilnavn(d, format));
      setMelding({ ok: true, tekst: format === "pdf" ? "Scorekortet er lagret som PDF." : hvordan === "delt" ? "Bildet er klart. Del det der du vil." : "Bildet er lagret. Del det der du vil." });
    } catch (e) {
      if ((e as Error).name !== "AbortError") setMelding({ ok: false, tekst: format === "pdf" ? "Scorekortet kunne ikke lages. Prøv igjen." : "Bildet kunne ikke lages. Prøv igjen." });
    } finally {
      setLagrer(false);
    }
  }

  return (
    <div className="phn">
      <TmTilbake href={`/portal/mal/runder/${d.id}`} tekst="Runden" />
      <div className="phn-topp">
        <div><div className="phn-dato">Runde · {d.bane} · {d.dato}</div><h1 className="phn-tittel">Del runden</h1></div>
      </div>
      <div className="phn-to-kol">
        <div className="phn-kol">
          <div className={`phn-dk ${format}`} ref={kort} aria-label="Forhåndsvisning av bildet">
            {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public, samme som i bildet som lagres */}
            <img src={BILDE} alt="" width={1600} height={1067} />
            <div className="phn-dk-inn">
              <div className="phn-dk-topp"><span className="phn-dk-av">{initialer(spiller)}</span><span><b>{spiller}</b><small>{d.bane} · {d.dato}</small></span></div>
              <div className="phn-dk-score">{d.brutto}<small>brutto · {motParOrd(d.motPar)}</small></div>
              <div className="phn-dk-sg">{d.sg.map((s) => <span key={s.navn}>{s.navn}<b>{sgTekst(s.v)}</b></span>)}</div>
              {/* eslint-disable-next-line @next/next/no-img-element -- merket i SVG fra public */}
              <img className="phn-dk-logo" src={LOGO} alt="AK Golf HQ" width={74} height={16} />
            </div>
          </div>
          <p className="phn-kilde phn-sr-midt">Brutto. Strokes Gained er estimat. Bare tall du selv har ført.</p>
        </div>
        <div className="phn-kol">
          <section className="phn-seksjon">
            <div className="phn-sek-topp"><h2>Format</h2></div>
            <div className="phn-sr-velg" role="radiogroup" aria-label="Format">
              {FORMATER.map((f) => (
                <button key={f.id} type="button" role="radio" aria-checked={format === f.id} onClick={() => setFormat(f.id)}>
                  <b>{f.navn}</b><span>{f.tekst}</span><i aria-hidden />
                </button>
              ))}
            </div>
          </section>
          <section className="phn-seksjon">
            <div className="phn-sek-topp"><h2>Hvem ser runden i appen</h2></div>
            <div className="phn-sr-velg" role="radiogroup" aria-label="Hvem ser runden i appen">
              <button type="button" role="radio" aria-checked={!delt} onClick={() => velgSynlighet(false)}><b>Bare deg</b><span>Privat</span><i aria-hidden /></button>
              <button type="button" role="radio" aria-checked={delt} onClick={() => velgSynlighet(true)}><b>Coach kan se</b><span>Coachen ser runden i Spiller 360</span><i aria-hidden /></button>
            </div>
          </section>
          {melding && (
            <p className={melding.ok ? "phn-lagret" : "phn-sd-varsel"} role={melding.ok ? "status" : "alert"}>
              {melding.ok && <Check className="phn-ikon" aria-hidden />} {melding.tekst}
            </p>
          )}
          <div className="phn-sr-festet">
            <button type="button" className="phn-knapp pri phn-sr-stor" disabled={lagrer} onClick={() => void lagre()}>
              {lagrer ? (format === "pdf" ? "Lager PDF …" : "Lager bildet …") : format === "pdf" ? "Lagre PDF" : "Lagre bildet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
