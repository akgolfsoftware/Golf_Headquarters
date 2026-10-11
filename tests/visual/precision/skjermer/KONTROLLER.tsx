/** Syntetisk komponentprøve. Ingen server actions, nettverk eller lagring. */
import { useState } from "react";
import { Check } from "lucide-react";
import { Knapp } from "@/components/precision/pa";
import { SegmentertValg } from "@/components/precision/pa-a2";

function Kontroller({ night = false }: { night?: boolean }) {
  const [lagrer, setLagrer] = useState(false);
  const [antall, setAntall] = useState(0);
  const [periode, setPeriode] = useState("uke");
  return <main className="pa-root" data-theme={night ? "night" : "light"} style={{ padding: 24, minHeight: "100vh", boxSizing: "border-box", background: "var(--surface-card)", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
    <h1>Precision · kontroller</h1>
    <p>Syntetisk prøve av appens faktiske komponenter.</p>
    <section style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 20 }}>
      <h2>Lagring</h2>
      <Knapp icon={Check} loading={lagrer} disabled={false} data-testid="lagre" onClick={() => { setAntall((n) => n + 1); setLagrer(true); }}>Lagre treningsøkten</Knapp>
      <output aria-label="Lagringsforsøk">{antall}</output>
      <Knapp variant="secondary" onClick={() => setLagrer(false)}>Fullfør prøvelagring</Knapp>
      <h2>Periode</h2>
      <SegmentertValg label="Periode" value={periode} onChange={setPeriode} options={[
        { id: "dag", label: "Dag" }, { id: "uke", label: "Uke" },
        { id: "maaned", label: "Måned" }, { id: "sesong", label: "Hele inneværende sesong" },
      ]} />
      <output aria-label="Valgt periode">{periode}</output>
      <Knapp variant="secondary">Neste handling</Knapp>
    </section>
  </main>;
}
export const tilstander = { normal: <Kontroller />, natt: <Kontroller night /> };
export const natt = ["natt"];
