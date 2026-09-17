import { LogoAK } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 24, alignItems: "flex-end" };

/** Ekte AK Golf-logo: baneform i tekstfargen, prikk i warm. surface="auto" følger temaet. */
export function Standard() {
  return <LogoAK />;
}

export function Storrelser() {
  return (
    <div style={rad}>
      <LogoAK size={20} />
      <LogoAK size={26} />
      <LogoAK size={40} />
      <LogoAK size={64} />
    </div>
  );
}

/** På mørk flate (rail og skinne i mørk modus): color hvit, prikken beholder warm. */
export function PaMorkFlate() {
  return (
    <div style={{ display: "inline-flex", gap: 24, alignItems: "flex-end", background: "#000", padding: 20, borderRadius: 16 }}>
      <LogoAK size={26} color="#FFFFFF" />
      <LogoAK size={48} color="#FFFFFF" />
    </div>
  );
}
