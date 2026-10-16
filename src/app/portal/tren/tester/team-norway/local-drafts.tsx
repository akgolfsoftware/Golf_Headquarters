"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import { listTnDrafts } from "@/lib/offline-queue/tn-draft-store";
import { tnProtocol, type TnVersion } from "@/lib/portal-tester/tn-catalog";
import type { TnDraft } from "@/lib/portal-tester/tn-draft";
export function TnLocalDrafts() {
  const ownerId = useLokalDataEier();
  const [drafts, setDrafts] = useState<TnDraft[]>([]);
  useEffect(() => { let active = true; if (ownerId) void listTnDrafts(ownerId).then(rows => { if (active) setDrafts(rows.filter(d => d.status === "IN_PROGRESS" && (d.pending || d.localRevision !== d.syncedRevision))); }).catch(() => {}); return () => { active = false; }; }, [ownerId]);
  if (!ownerId || !drafts.length) return null;
  return <section className="phn-seksjon"><div className="phn-sek-topp"><h2>Venter på lagring fra denne enheten</h2></div><p className="phn-forklar">Åpne utkastet for å sende registreringene til kontoen. Behold innloggingen til de er lagret.</p><ul className="tn-liste">{drafts.map(d => <li key={d.sessionId}><Link className="phn-rad-lenke" href={`?test=${encodeURIComponent(d.protocolId)}${tnProtocol(d.protocolId, undefined, d.version)?.variableCount ? `&count=${d.count}` : ""}&version=${d.version}&local=${d.sessionId}`}><span><b>{tnProtocol(d.protocolId, undefined, d.version as TnVersion)?.name ?? "Testutkast"}</b>Gjenoppta</span></Link></li>)}</ul></section>;
}
