/**
 * Grunnkomponenter for Spiller 360 (AG-08) i Precision Athletics, portert fra
 * tegningen ui_kits/agencyos/screens/AG-360.jsx (Sec, Row, Lbl, Muted, V) og
 * AG-08-IUP.jsx (nummererte seksjoner, timestolper). Nye, ikke i pa.tsx
 * (unngår filkonflikt med parallelle bolker). Stilene ligger i precision-a8.css.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { Meta } from "./pa";
import "@/styles/precision-a8.css";

const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

/** Kort med kicker og meta (tegningens Sec). */
export function Seksjon({ k, meta, gap = 8, nr, children }: { k: string; meta?: ReactNode; gap?: number; nr?: number; children: ReactNode }) {
  return (
    <section aria-label={k} className="pa-card a8-sek" style={{ gap }}>
      <div className="a8-sek__hode">
        {nr != null && <span className="a8-iup-nr">{String(nr).padStart(2, "0")}</span>}
        <span className="kicker">{k}</span>
        {meta != null && meta !== "" && <Meta>{meta}</Meta>}
      </div>
      {children}
    </section>
  );
}

export function Liste({ children }: { children: ReactNode }) {
  return <div role="list" className="a8-liste">{children}</div>;
}

/** Rad i en liste (tegningens Row). */
export function Rad({ children, variant, min }: { children: ReactNode; variant?: "3" | "dag" | "merke"; min?: number }) {
  return <div role="listitem" className={cx("a8-rad", variant && `a8-rad--${variant}`)} style={min ? { minHeight: min } : undefined}>{children}</div>;
}

/** Tittel med metalinje under (tegningens Lbl). */
export function Etikett({ a, sub }: { a: ReactNode; sub?: ReactNode }) {
  return <span className="a8-lbl"><span className="a8-lbl__a">{a}</span>{sub != null && sub !== "" && <Meta>{sub}</Meta>}</span>;
}

/** Tall til høyre i en rad (tegningens V). */
export function Verdi({ children }: { children: ReactNode }) {
  return <span className="a8-v">{children}</span>;
}

export function Dempet({ children }: { children: ReactNode }) {
  return <p className="a8-dempet">{children}</p>;
}

/** Nøkkeltall-flis: navn, tall, enhet, kilde. */
export function TallFlis({ k, v, enhet, kilde }: { k: string; v: ReactNode; enhet?: string | null; kilde?: string | null }) {
  return (
    <div className="a8-tall">
      <span className="a8-tall__k">{k}</span>
      <span style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span className="a8-tall__v">{v}</span>{enhet && <span className="a8-tall__e">{enhet}</span>}</span>
      <Meta style={{ fontSize: 10 }}>{kilde ?? "—"}</Meta>
    </div>
  );
}

/** Faner som lenker (tegningens tablist med knapper). */
export function FaneLenker({ faner, label }: { faner: ReadonlyArray<{ href: string; navn: string; aktiv: boolean }>; label: string }) {
  return (
    <nav aria-label={label} className="a8-faner">
      {faner.map((f) => (
        <Link key={f.href} href={f.href} className="a8-fane" aria-current={f.aktiv ? "page" : undefined} scroll={false}>{f.navn}</Link>
      ))}
    </nav>
  );
}

/** Valgpille (ChoicePill) med 44 px treffmål. */
export function Valg({ valgt, onClick, children }: { valgt: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" className="pa-choice a8-valg" aria-pressed={valgt} onClick={onClick}>{children}</button>;
}

/** Timer eller minutter per akse som stolpe, med valgfri planmarkør. */
export function Stolpe({ merke, andel, plan, verdi }: { merke: ReactNode; andel: number; plan?: number | null; verdi: ReactNode }) {
  const p = (x: number) => `${Math.max(0, Math.min(100, x * 100))}%`;
  return (
    <div role="listitem" className="a8-stolpe">
      <span>{merke}</span>
      <span aria-hidden className="a8-stolpe__spor">
        <span className="a8-stolpe__fyll" style={{ width: p(andel) }} />
        {plan != null && <span className="a8-stolpe__plan" style={{ left: p(plan) }} />}
      </span>
      <span className="a8-v">{verdi}</span>
    </div>
  );
}

/** Talentradar 1–10 (tegningens TalentTab). Referanselinje bare når den finnes. */
export function Talentradar({ akser, referanse }: { akser: ReadonlyArray<{ akse: string; verdi: number }>; referanse?: readonly number[] | null }) {
  const n = akser.length, c = 130, r = 96;
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [c + Math.cos(a) * r * v / 10, c + Math.sin(a) * r * v / 10];
  };
  const poly = (vals: readonly number[]) => vals.map((v, i) => pt(i, v).map((x) => Math.round(x * 10) / 10).join(",")).join(" ");
  const lbl = akser.map((x) => `${x.akse} ${String(x.verdi).replace(".", ",")}`).join(", ");
  return (
    <svg role="img" aria-label={`Talentradar: ${lbl}`} viewBox="-60 -10 380 280" className="a8-radar">
      {[2, 4, 6, 8, 10].map((l) => <polygon key={l} points={poly(akser.map(() => l))} fill="none" stroke="var(--border-hairline)" />)}
      {referanse && <polygon points={poly(referanse)} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 4" />}
      <polygon points={poly(akser.map((x) => x.verdi))} fill="var(--text-primary)" fillOpacity=".08" stroke="var(--text-primary)" strokeWidth="2" />
      {akser.map((x, i) => {
        const [tx, ty] = pt(i, 12);
        return <text key={x.akse} x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--text-secondary)">{x.akse} {String(x.verdi).replace(".", ",")}</text>;
      })}
    </svg>
  );
}
