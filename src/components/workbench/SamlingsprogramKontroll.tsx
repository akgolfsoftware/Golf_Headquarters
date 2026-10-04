"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hentSamlingsinvitasjonsstatus, publiserSamlingsprogram } from "@/lib/workbench/samlingsinvitasjon-actions";

export type SamlingKontrollrad = { id: string; tittel: string; fra: string; til: string; sted: string | null };
type Status = NonNullable<Awaited<ReturnType<typeof hentSamlingsinvitasjonsstatus>>>;

export function SamlingsprogramKontroll({ organisasjon, planHref, samlinger }: { organisasjon: "WANG" | "TEAM_NORWAY"; planHref?: string | null; samlinger: SamlingKontrollrad[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<Record<string, Status | null | undefined>>({});
  const [melding, setMelding] = useState("");
  const [valgt, setValgt] = useState<string | null>(null);
  const [venter, start] = useTransition();
  const samlingIds = samlinger.map(row => row.id).join("\u0000");

  useEffect(() => {
    let aktiv = true;
    void Promise.all(samlinger.map(async row => [row.id, await hentSamlingsinvitasjonsstatus({ id: row.id })] as const))
      .then(rows => { if (aktiv) setStatus(Object.fromEntries(rows)); });
    return () => { aktiv = false; };
  // Foreldreskjermene kan lage en ny array ved vanlig rerender; id-listen er
  // stabil og hindrer at statusoppslaget starter på nytt hver gang.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [samlingIds]);

  function send(id: string) {
    setValgt(id);
    start(async () => {
      const result = await publiserSamlingsprogram({ id });
      setMelding(result.ok
        ? `${result.nye} nye invitasjoner. ${result.venter} venter på svar, ${result.godtatt} har godtatt.`
        : result.feil);
      setValgt(null);
      const fresh = await hentSamlingsinvitasjonsstatus({ id });
      setStatus(current => ({ ...current, [id]: fresh }));
      router.refresh();
    });
  }

  if (!samlinger.length) return null;
  const tn = organisasjon === "TEAM_NORWAY";
  return <section aria-label="Samlingsprogram og invitasjoner" style={tn ? tnSection : wangSection}>
    <header style={{ display: "grid", gap: 5 }}>
      <h2 style={tn ? tnHeading : wangHeading}>Program og invitasjoner</h2>
      <p style={tn ? tnText : wangText}>Publisering sender en invitasjon i PlayerHQ til aktive spillere i gruppen. Spilleren godkjenner før øktene legges i Workbench.</p>
      {planHref ? <Link href={planHref} style={tn ? tnLink : wangLink}>Åpne trenerbordet for gruppeøkter</Link> : null}
    </header>
    <div style={{ display: "grid", gap: 10 }}>
      {samlinger.map(row => {
        const counts = status[row.id];
        return <article key={row.id} style={tn ? tnCard : wangCard}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
            <div style={{ minWidth: 0 }}><strong style={tn ? tnTitle : wangTitle}>{row.tittel}</strong>
              <p style={tn ? tnText : wangText}>{row.fra}{row.til !== row.fra ? ` – ${row.til}` : ""}{row.sted ? ` · ${row.sted}` : ""}</p></div>
            {counts ? <p style={tn ? tnCount : wangCount} aria-label="Invitasjonsstatus">
              {counts.invitert} invitert · {counts.venter} venter · {counts.godtatt} godtatt · {counts.avslatt} avslått
            </p> : null}
          </div>
          {counts === null ? <p style={tn ? tnText : wangText}>Legg inn økter i samlingsperioden i gruppeplanen før du kan sende invitasjonen.</p> :
            <button type="button" disabled={venter || counts === undefined} onClick={() => send(row.id)} style={tn ? tnButton : wangButton}>
              {venter && valgt === row.id ? "Publiserer …" : counts === undefined ? "Laster status …" : counts.invitert ? "Synkroniser invitasjoner" : "Send invitasjon"}
            </button>}
        </article>;
      })}
    </div>
    {melding ? <p role="status" style={tn ? tnText : wangText}>{melding}</p> : null}
  </section>;
}

const wangSection: React.CSSProperties = { display: "grid", gap: 14, marginBlock: 22, padding: 18, borderRadius: 12, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" };
const wangCard: React.CSSProperties = { display: "grid", gap: 10, padding: 14, borderRadius: 10, background: "var(--bg-app)", border: "1px solid var(--border-subtle)" };
const wangHeading: React.CSSProperties = { margin: 0, color: "var(--text-primary)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 18 };
const wangTitle: React.CSSProperties = { color: "var(--text-primary)", fontFamily: "var(--font-brand)", fontSize: 15, fontWeight: 700 };
const wangText: React.CSSProperties = { margin: "4px 0 0", color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.5 };
const wangLink: React.CSSProperties = { display: "inline-flex", alignItems: "center", minHeight: 44, width: "fit-content", color: "var(--text-primary)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13 };
const wangCount: React.CSSProperties = { margin: 0, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.5 };
const wangButton: React.CSSProperties = { minHeight: 44, justifySelf: "start", padding: "0 14px", border: 0, borderRadius: 8, background: "var(--wang-navy)", color: "var(--white)", fontFamily: "var(--font-brand)", fontWeight: 700, cursor: "pointer" };
const tnSection: React.CSSProperties = { display: "grid", gap: 14, marginBlock: 22, padding: 18, border: "1px solid #D8DEE6", background: "#FFFFFF" };
const tnCard: React.CSSProperties = { display: "grid", gap: 10, padding: 14, border: "1px solid #D8DEE6", background: "#F8FAFC" };
const tnHeading: React.CSSProperties = { margin: 0, color: "#11243B", fontFamily: "var(--font-tn-display, sans-serif)", fontSize: 17, fontWeight: 600 };
const tnTitle: React.CSSProperties = { color: "#11243B", fontFamily: "var(--font-tn-body, sans-serif)", fontSize: 14, fontWeight: 600 };
const tnText: React.CSSProperties = { margin: "4px 0 0", color: "#506176", fontFamily: "var(--font-tn-body, sans-serif)", fontSize: 13, lineHeight: 1.5 };
const tnLink: React.CSSProperties = { display: "inline-flex", alignItems: "center", minHeight: 44, width: "fit-content", color: "#11243B", fontFamily: "var(--font-tn-body, sans-serif)", fontWeight: 600, fontSize: 13 };
const tnCount: React.CSSProperties = { margin: 0, color: "#506176", fontFamily: "var(--font-tn-mono, monospace)", fontSize: 11, lineHeight: 1.5 };
const tnButton: React.CSSProperties = { minHeight: 44, justifySelf: "start", padding: "0 14px", border: 0, borderRadius: 0, background: "#11243B", color: "#FFFFFF", fontFamily: "var(--font-tn-body, sans-serif)", fontWeight: 600, cursor: "pointer" };
