import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";

/** PH-15 laster: nattflate med «Henter testprotokollen …». Ingen klientmoduler (CSP-nonce). */
export default function Laster() {
  return (
    <div className="pa-root" data-theme="night" data-design="precision-athletics" data-screen="PH-15"
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <div style={{ width: "100%", maxWidth: 600, margin: "0 auto", padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        <div className="pa-state pa-state--loading" role="status">
          <span className="pa-state__text">Henter testprotokollen …</span>
        </div>
      </div>
    </div>
  );
}
