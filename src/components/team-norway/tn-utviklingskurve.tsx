import { TN } from "@/lib/v2/team-norway";

/**
 * Utviklingskurve for én test (canvaset «Team Norway nøkkelskjermer», tavle B2).
 * Én serie i navy, 2 px strek, prikker på 8 px. Fylt prikk = kontrollert av trener, åpen = egenført.
 * Er lavere bedre, snus y-aksen, så kurven alltid peker opp når spilleren blir bedre.
 * Hver prikk har <title> med dato, verdi og kilde (vises ved hover). Tabellen under kurven er tekstvisningen.
 */
export type TnKurvepunkt = { id: string; dato: string; verdi: number; tekst: string; kontrollert: boolean };

const B = 640;
const H = 220;
const V = 48;
const HO = 16;
const T = 18;
const U = 30;

const tall = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",");

export function TnUtviklingskurve({ punkter, lavereErBedre, etikett, aksetall = tall }: { punkter: TnKurvepunkt[]; lavereErBedre: boolean | null; etikett: string; aksetall?: (verdi: number) => string }) {
  if (punkter.length < 2) return null;
  const verdier = punkter.map((p) => p.verdi);
  const min = Math.min(...verdier);
  const maks = Math.max(...verdier);
  const luft = (maks - min) * 0.15 || Math.abs(maks) * 0.1 || 1;
  const lav = min - luft;
  const hoy = maks + luft;
  const pw = B - V - HO;
  const ph = H - T - U;
  // Lavere er bedre: lav verdi øverst. Ellers: høy verdi øverst.
  const y = (v: number) => (lavereErBedre ? T + ((v - lav) / (hoy - lav)) * ph : T + ((hoy - v) / (hoy - lav)) * ph);
  const x = (i: number) => V + (i * pw) / (punkter.length - 1);
  const linjer = [lav + (hoy - lav) * 0.15, (lav + hoy) / 2, hoy - (hoy - lav) * 0.15];
  const siste = punkter[punkter.length - 1]!;
  const visX = punkter.length <= 8 ? punkter.map((_, i) => i) : [0, Math.floor((punkter.length - 1) / 2), punkter.length - 1];

  return (
    <svg viewBox={`0 0 ${B} ${H}`} role="img" aria-label={etikett} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
      {linjer.map((v) => (
        <g key={v}>
          <line x1={V} x2={B - HO} y1={y(v)} y2={y(v)} stroke={TN.ink100} strokeWidth={1} />
          <text x={V - 8} y={y(v) + 4} textAnchor="end" fontFamily={TN.font.mono} fontSize={11} fill={TN.ink500}>{aksetall(v)}</text>
        </g>
      ))}
      <polyline points={punkter.map((p, i) => `${x(i)},${y(p.verdi)}`).join(" ")} fill="none" stroke={TN.navy900} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {punkter.map((p, i) => (
        <circle key={p.id} cx={x(i)} cy={y(p.verdi)} r={i === punkter.length - 1 ? 5 : 4} fill={p.kontrollert ? TN.navy900 : TN.white} stroke={TN.navy900} strokeWidth={2}>
          <title>{`${p.dato}: ${p.tekst} · ${p.kontrollert ? "Kontrollert" : "Egenført"}`}</title>
        </circle>
      ))}
      <text x={x(punkter.length - 1) - 10} y={y(siste.verdi) - 12} textAnchor="end" fontFamily={TN.font.mono} fontSize={12} fontWeight={600} fill={TN.navy900}>{siste.tekst}</text>
      {visX.map((i) => (
        <text key={punkter[i]!.id} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === punkter.length - 1 ? "end" : "middle"} fontFamily={TN.font.mono} fontSize={11} fill={TN.ink500}>{punkter[i]!.dato}</text>
      ))}
    </svg>
  );
}
