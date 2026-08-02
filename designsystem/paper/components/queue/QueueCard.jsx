import React from "react";
import { ensureCss, Region } from "../data/viz.jsx";
import { Button } from "../actions/Button.jsx";
import { StatusBadge } from "../primitives/StatusBadge.jsx";
import { ProvenanceDisclosure } from "./ProvenanceDisclosure.jsx";
ensureCss("akhq-css-queue", `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
/* Wrapperen eier containeren \u2014 kortet legger om sitt eget hode og sine egne
   handlinger. K\u00f8en st\u00e5r i hovedkolonnen (860px) og i panelet (300px). */
.akhq-qc-c{container-type:inline-size;min-width:0}
.akhq-qc{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow);padding:var(--s4);font-family:var(--ui);color:var(--fg);min-width:0}
.akhq-qc-top{display:grid;grid-template-columns:var(--cols,minmax(0,1fr) auto);gap:var(--gap,var(--s4));align-items:start}
.akhq-qc-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:7px}
.akhq-qc-title{font-family:var(--disp);font-size:var(--tfs,15px);font-weight:600;letter-spacing:-.01em;line-height:1.3;margin:0}
.akhq-qc-sub{margin:5px 0 0;font-size:12.5px;color:var(--muted);line-height:1.45}
.akhq-qc-actions{display:flex;gap:var(--s2);flex-wrap:wrap;justify-content:var(--just,flex-end);flex:none}
.akhq-qc-age{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.06em;color:var(--muted);white-space:nowrap}
.akhq-qc-snooze{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:var(--s3);padding-top:var(--s3);border-top:1px solid var(--border);font-size:12px;color:var(--muted)}
}
@layer akhq-container{
@container (max-width:460px){.akhq-qc{--cols:minmax(0,1fr);--gap:var(--s3);--just:flex-start;--tfs:14px}}
}
@layer akhq-modifier{
/* Utsatt sak: raden forsvinner ALDRI stille (beslutning [natt 1]). Den blir
   d\u00e6mpet og f\u00e5r en synlig \u00abutsatt til\u00bb-tilstand med vei tilbake. */
.akhq-qc--utsatt{background:var(--soft);box-shadow:none}
.akhq-qc--utsatt .akhq-qc-title{color:var(--muted);font-weight:500}
/* F\u00f8rste sak i k\u00f8en: blekkramme, ikke oransje. Oransjemonopolet eies av
   \u00e9n handling per skjerm, og p\u00e5 K\u00f8 er det godkjenn-knappen p\u00e5 toppsaken \u2014
   ikke rammen rundt den. */
.akhq-qc--forst{border-color:color-mix(in srgb,var(--fg) 40%,var(--border))}
}
`);
export function QueueCard({
  sender, kind = "coaching", age, title, children,
  status, statusTone = "mut",
  primaryLabel, onPrimary, secondaryLabel, onSecondary,
  snoozeLabel = "Utsett", onSnooze,
  snoozedUntil, onUnsnooze, unsnoozeLabel = "Hent tilbake",
  first = false, provenance, provenanceOpen = false,
  state = "content", emptyText = "Ingenting i k\u00f8en. Alt som kunne vente, venter ikke lenger.",
  dataOdId = "queue-card", ...rest
}) {
  const utsatt = !!snoozedUntil;
  return (
    <Region state={state} empty={emptyText} height={104}>
      <div className="akhq-qc-c">
        <article className={"akhq-qc" + (utsatt ? " akhq-qc--utsatt" : "") + (first && !utsatt ? " akhq-qc--forst" : "")} data-od-id={dataOdId} {...rest}>
          <div className="akhq-qc-top">
            <div style={{ minWidth: 0 }}>
              <div className="akhq-qc-meta">
                {sender && <StatusBadge kind="tag" dataOdId="badge-sender">{sender}</StatusBadge>}
                {age && <span className="akhq-qc-age">{age}</span>}
                <StatusBadge kind="tag" dataOdId="badge-kind">{kind}</StatusBadge>
                {status && <StatusBadge tone={statusTone} dot dataOdId="badge-status">{status}</StatusBadge>}
              </div>
              {title && <h3 className="akhq-qc-title">{title}</h3>}
              {children && <p className="akhq-qc-sub">{children}</p>}
            </div>
            {!utsatt && (primaryLabel || secondaryLabel || onSnooze) && (
              <div className="akhq-qc-actions">
                {primaryLabel && <Button size="sm" variant="primary" onClick={onPrimary} dataOdId="cta-queue-primary">{primaryLabel}</Button>}
                {secondaryLabel && <Button size="sm" variant="ghost" onClick={onSecondary} dataOdId="cta-queue-secondary">{secondaryLabel}</Button>}
                {onSnooze && <Button size="sm" variant="ghost" onClick={onSnooze} dataOdId="cta-queue-snooze">{snoozeLabel}</Button>}
              </div>
            )}
          </div>
          {utsatt && (
            <div className="akhq-qc-snooze">
              <StatusBadge tone="info" dataOdId="badge-utsatt">utsatt til {snoozedUntil}</StatusBadge>
              <Button size="sm" variant="ghost" onClick={onUnsnooze} dataOdId="cta-queue-unsnooze">{unsnoozeLabel}</Button>
            </div>
          )}
          {provenance && <ProvenanceDisclosure {...provenance} open={provenanceOpen} />}
        </article>
      </div>
    </Region>
  );
}
