/* Stilarkene for Live-økta lastes her, ikke i loading.tsx: et stilark importert
   i loading.tsx gir en egen skriptfil for lastegrensen, og Next skriver den
   uten CSP-nonce, så nettleseren blokkerer den (gotchas §Bygg og drift). */
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
