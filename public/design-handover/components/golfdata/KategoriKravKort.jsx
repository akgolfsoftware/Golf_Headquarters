import React from "react";
import { Skeleton } from "../structure/Skeleton.jsx";

/**
 * AK Golf HQ — KategoriKravKort
 * Spillerens A–K-nivå (A = beste, jf. kanon-beslutning): bestått/gjenstår per
 * testprotokoll + neste krav. Sjekkliste, ikke graf — hva som må til for neste nivå.
 */
const CSS = `
.ak-kkk{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:18px;display:flex;flex-direction:column;gap:14px;}
.ak-kkk__head{display:flex;align-items:center;gap:12px;}
.ak-kkk__niva{width:44px;height:44px;flex:none;border-radius:12px;display:flex;align-items:center;justify-content:center;
  font-family:var(--font-display);font-weight:700;font-size:20px;color:var(--signal);
  background:color-mix(in srgb,var(--signal) 12%,var(--surface-2));border:1px solid color-mix(in srgb,var(--signal) 34%,var(--border));}
.ak-kkk__krav{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--border);}
.ak-kkk__ic{width:18px;height:18px;flex:none;}
.ak-kkk__navn{flex:1;font-family:var(--font-ui);font-size:var(--text-13);color:var(--text);}
.ak-kkk__verdi{font-family:var(--font-mono);font-size:var(--text-11);color:var(--text-muted);font-variant-numeric:tabular-nums;}
.ak-kkk__next{padding:11px 13px;border-radius:11px;background:var(--surface-2);border:1px solid var(--border);
  font-family:var(--font-ui);font-size:var(--text-12);line-height:1.5;color:var(--text-2);}
`;
if (typeof document !== "undefined" && !document.getElementById("ak-kkk-css")) {
  const s = document.createElement("style"); s.id = "ak-kkk-css"; s.textContent = CSS; document.head.appendChild(s);
}

export function KategoriKravKort({
  nivaa, nesteNivaa, krav = [], nesteKrav, loading = false, className = "", style,
}) {
  if (loading) return <Skeleton variant="card" width="100%" height={240} className={className} style={style} />;
  const bestatt = krav.filter((k) => k.bestatt).length;
  return (
    <div className={`ak-kkk ${className}`} style={style}>
      <div className="ak-kkk__head">
        <span className="ak-kkk__niva">{nivaa || "–"}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-16)", color: "var(--text)" }}>Kategori {nivaa}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", color: "var(--text-muted)", marginTop: 3 }}>{bestatt} av {krav.length} krav bestått{nesteNivaa ? ` · neste: ${nesteNivaa}` : ""}</div>
        </div>
      </div>
      <div>
        {krav.map((k) => (
          <div key={k.navn} className="ak-kkk__krav">
            {k.bestatt ? (
              <svg className="ak-kkk__ic" viewBox="0 0 24 24" fill="none" stroke="var(--up)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-label="bestått"><path d="M20 6 9 17l-5-5"/></svg>
            ) : (
              <svg className="ak-kkk__ic" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" aria-label="gjenstår"><circle cx="12" cy="12" r="9"/></svg>
            )}
            <span className="ak-kkk__navn" style={{ color: k.bestatt ? "var(--text)" : "var(--text-2)" }}>{k.navn}</span>
            {k.verdi != null && <span className="ak-kkk__verdi">{k.verdi}{k.mal ? ` / ${k.mal}` : ""}</span>}
          </div>
        ))}
      </div>
      {nesteKrav && <div className="ak-kkk__next"><strong style={{ color: "var(--text)", fontWeight: 600 }}>Neste krav:</strong> {nesteKrav}</div>}
    </div>
  );
}
