"use client";
import Link from "next/link";
export default function DataGolfError({ reset }: { reset: () => void }) {
  return <div role="alert" style={{ padding: 24 }}><h2>DataGolf kunne ikke lastes</h2>
    <p>Prøv igjen. Tidligere lagrede resultater er fortsatt beholdt.</p>
    <button type="button" onClick={reset} style={{ minHeight: 48, textDecoration: "underline" }}>Prøv igjen</button>
    <p><Link href="/portal/analysere">Tilbake til Analyse</Link></p>
  </div>;
}
