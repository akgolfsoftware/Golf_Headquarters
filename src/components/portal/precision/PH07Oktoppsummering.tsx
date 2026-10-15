"use client";

/**
 * PH-07 Etter økten i nytt design (pakke 2 Treningsøkten). Alltid lyst tema (Anders 14.10).
 * Fasit: docs/design-system/utkast-playerhq/treningsokt.html, skjerm «ferdig». Stil: src/styles/playerhq-ny-okt.css.
 *
 * Gjennomført tid som ett stort tall mot plan, slag, øvelser og dagsform, tid per akse,
 * øvelsene med mengde, tid og treff, og notat som lagres på økta.
 *
 * Avvik:
 *   - Belastning og Fokus 1–10 (golføkt) og «Hvor tungt» (fysisk økt) er ikke med: oppsummeringen
 *     har ikke disse feltene å lagre til. Lagring av notat er beholdt.
 *   - Notat lagres bare for TrainingSessionV2 (lagreDineOrd). For Workbench- og planøkter vises ikke notatfeltet,
 *     fordi det aldri ble lagret der; økta er lagret når den fullføres.
 *   - Bryteren «Del med coach» er fjernet: valget ble aldri lagret, og meldingen «Delt med coach» var ikke sann.
 *   - «Hvilke nivåer som er oppdatert» etter lagring vises ikke; lagringen returnerer ikke det.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-07.
 */

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { AkseMerke, type Akse } from "@/components/precision/pa";
import {
  type OktoppsummeringData,
  formatTimerOgMinutter,
} from "@/lib/portal-live/ph04-07-data";
import "@/styles/precision-athletics.css";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-okt.css";

interface PH07OktoppsummeringProps {
  data: OktoppsummeringData;
  onSave?: (note: string, shareWithCoach: boolean) => Promise<void> | void;
  onCloseHref?: string;
}

export function PH07Oktoppsummering({
  data,
  onSave,
  onCloseHref = "/portal",
}: PH07OktoppsummeringProps) {
  const empty = data.totalShots === 0 && data.completedDrillsCount === 0;

  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeil, setSaveFeil] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      setSaveFeil(false);
      if (onSave) {
        await onSave(note, true);
      }
      const timeStr = new Intl.DateTimeFormat("nb-NO", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Oslo",
      }).format(new Date());

      setSavedMessage(`Lagret kl. ${timeStr.replace(".", ":")}`);
    } catch {
      setSaveFeil(true);
    } finally {
      setIsSaving(false);
    }
  };

  const plan = data.axes.reduce((a, x) => a + x.plannedMin, 0);
  return <div className="pa-root phn phn-okt" data-theme="light" data-od-id="playerhq-live-summary" style={{ minHeight: "100dvh" }}>
    <div className="smal">
      <Link href={onCloseHref} className="phn-knapp sek" style={{ justifySelf: "start" }} aria-label="Lukk oppsummering"><X size={18} />Lukk</Link>
      <div className="hode-okt">
        <span className="phn-dato">Etter økten · {data.dateStr} · {data.timeRangeStr}</span>
        <h1>{empty ? "Ingen slag registrert" : data.title}</h1>
      </div>

      <section className="phn-kort" aria-label="Gjennomført tid">
        <div className="okt-rad"><span className="phn-dato">Gjennomført</span>{!empty && <span className="phn-pille ok"><Check size={14} />Gjennomført</span>}</div>
        <div className="phn-hoved"><strong>{empty ? "—" : formatTimerOgMinutter(data.actualMinutes)}</strong></div>
        <span className="sub">Plan {formatTimerOgMinutter(data.plannedMinutes)}</span>
        <dl className="meta-liste">
          <div><dt>Slag og putter</dt><dd>{empty ? "—" : data.totalShots}</dd></div>
          <div><dt>Øvelser</dt><dd>{empty ? "—" : `${data.completedDrillsCount} av ${data.totalDrillsCount}`}</dd></div>
          <div><dt>Dagsform</dt><dd>{empty || !data.dagsform ? "—" : data.dagsform}</dd></div>
        </dl>
      </section>

      {data.axes.length > 0 && <section className="phn-kort" aria-label="Tid per akse">
        <span className="phn-dato">Tid per akse</span>
        {data.axes.map((ax) => <div key={ax.axis} className="akse-rad">
          <AkseMerke axis={ax.axis as Akse} />
          <div className="phn-stolpe-lys" aria-hidden><span className={`akse-${ax.axis}`} style={{ width: `${ax.plannedMin > 0 ? Math.min(100, ax.actualMin / ax.plannedMin * 100) : 0}%` }} /></div>
          <span className="sub" style={{ whiteSpace: "nowrap" }}>{formatTimerOgMinutter(ax.actualMin)} av {formatTimerOgMinutter(ax.plannedMin)}</span>
        </div>)}
        {plan === 0 && <p className="sub">Ingen planlagt tid å sammenligne med.</p>}
      </section>}

      {!empty && data.drillRows.length > 0 && <section className="phn-kort" aria-label="Øvelser">
        <span className="phn-dato">Øvelser</span>
        <div>{data.drillRows.map((r) => <div key={r.id} className="resultat">
          <b>{r.name}</b><span className="tall">{r.timeText}</span>
          <span className="sub">{[r.quantityText, r.hitsText].filter((x) => x && x !== "—").join(" · ") || "—"}</span>
        </div>)}</div>
      </section>}

      {onSave ? <section className="phn-kort" aria-label="Notat">
        <label className="phn-felt" htmlFor="ph07-notat">Notat til coach
          <textarea id="ph07-notat" rows={4} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Hva gikk bra, hva var vanskelig?" />
        </label>
        <span className="sub">Notatet lagres på økta. Coachen din ser det.</span>
      </section> : <p className="sub">Økten er lagret da du fullførte den.</p>}

      <div className="startbar">
        {saveFeil && <p role="alert" className="phn-forklar">Ikke lagret. Sjekk nettet og prøv igjen.</p>}
        {!onSave ? <Link href="/portal" className="phn-knapp pri stor">Til I dag<ArrowRight size={20} /></Link> : savedMessage ? <>
          <p role="status" className="phn-forklar"><Check size={16} /> {savedMessage}</p>
          <Link href="/portal" className="phn-knapp pri stor">Til I dag<ArrowRight size={20} /></Link>
        </> : <button type="button" className="phn-knapp pri stor" onClick={handleSave} disabled={isSaving}>{isSaving ? "Lagrer …" : "Lagre økten"}</button>}
      </div>
    </div>
  </div>;
}
