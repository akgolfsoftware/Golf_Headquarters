/**
 * PH-04 Live-økt: før start — Precision Athletics, natt-tema
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-live.jsx › PH04, etag 1790582694341367,
 * med Focus/Gate/Meta/Num fra parts.jsx). PH-04.jsx alene er utgått: PH-live.jsx overstyrer registreringen.
 *
 * Én kolonne, ingen fanelinje, én fullbredde primærhandling nederst (64 px).
 *
 * Bevisste avvik fra tegningen:
 *   - AK-formelen under tittelen vises ikke: økta har ikke formelen som felt i appen.
 *   - Kølle og «TEKNISK OPPGAVE P7.0» vises ikke: finnes ikke på øvelsen i appen. Raden viser
 *     mengde og minutter fra planen, ikke summen av tellere.
 *   - «Dagens mål», fokus, coach-kommentar og øvelsesnotater er tatt med: funksjonen finnes i
 *     appen og fjernes ikke, selv om tegningen ikke viser den.
 *   - Feilskjermen sier ikke «frakoblet»: en feil på serveren er ikke det samme som manglende nett.
 *   - Laster og feil ligger i brief/loading.tsx og brief/error.tsx (Next.js), ikke i denne komponenten.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Layers, ListPlus, X } from "lucide-react";
import { AkseMerke, Ikon, Meta, Tall, TomTilstand, type Akse } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

export type PH04Ovelse = { id: string; navn: string; under: string | null; min: number | null; mengde: string | null; notat: string | null };
export type PH04Props = {
  hvem: string | null;
  coach: string | null;
  tittel: string;
  /** «14:30–15:45», allerede formatert. */
  tid: string | null;
  sted: string | null;
  min: number;
  akser: Akse[];
  maal: string | null;
  fokus: string | null;
  ekstra: { label: string; text: string }[];
  ovelser: PH04Ovelse[];
  melding: string | null;
  handling: ReactNode;
};

const btn = (ikon: boolean) => `pa-btn pa-btn--primary pa-btn--xl pa-btn--full${ikon ? " pa-btn--icon-l" : ""}`;

/** Fullbredde primærhandling som lenke (samme mål som knappen i tegningen: 64 px). */
export function PH04Lenke({ href, children, ikon }: { href: string; children: ReactNode; ikon?: ReactNode }) {
  return <Link href={href} className={btn(Boolean(ikon))} style={{ height: 64 }} data-od-id="brief-start">{ikon}{children}</Link>;
}

const rad = { display: "flex", flexDirection: "column", gap: 4 } as const;
const overTekst = { overflowWrap: "anywhere", minWidth: 0 } as const;

export function PH04LiveBrief({ hvem, coach, tittel, tid, sted, min, akser, maal, fokus, ekstra, ovelser, melding, handling }: PH04Props) {
  const tom = ovelser.length === 0;
  const hvemLinje = [hvem ? hvem.toUpperCase() : null, coach ? `MED ${coach.toUpperCase()}` : null].filter(Boolean).join(" · ");
  const topp = [tid, sted?.toUpperCase()].filter(Boolean).join(" · ");
  const harKort = Boolean(maal || fokus || ekstra.length);
  const bunn = tom && !melding
    ? <PH04Lenke href="/portal" ikon={<Ikon icon={ArrowLeft} size={22} name="arrow-left" />}>Tilbake til I dag</PH04Lenke>
    : handling;
  return <div className="pa-root" data-theme="night" data-design="precision-athletics" data-od-id="ph-04-live-for-start" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--surface-page)", color: "var(--text-primary)" }}>
    <main style={{ flex: 1, width: "100%", maxWidth: 600, margin: "0 auto", boxSizing: "border-box", padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 56 }}>
        <Link href="/portal" className="pa-iconbtn" aria-label="Lukk" style={{ width: 56, height: 56, flex: "none", background: "var(--surface-card)", border: "1px solid var(--border-strong)" }}><Ikon icon={X} size={20} name="x" /></Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kicker">Før start</div>
          {topp && <Meta style={overTekst}>{topp}</Meta>}
        </div>
      </div>
      <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {hvemLinje && <Meta style={overTekst}>{hvemLinje}</Meta>}
        <h1 style={{ margin: 0, font: "var(--type-title-l)", color: "var(--text-primary)", textWrap: "pretty", overflowWrap: "anywhere" }}>{tittel}</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {akser.map((a) => <AkseMerke key={a} axis={a} />)}
          <Meta>{min > 0 ? min : "—"} MIN{tid ? ` · ${tid}` : ""}</Meta>
        </div>
      </header>
      {tom ? <TomTilstand icon={ListPlus} title="Ingen driller i økta" text="Coachen har ikke lagt inn driller ennå. Du kan bygge økta selv i Workbench."
        actions={<Link href="/portal/planlegge/workbench" className="pa-btn pa-btn--secondary pa-btn--icon-l"><Ikon icon={Layers} size={18} name="layers" />Åpne Workbench</Link>} /> : <>
        {harKort && <div className="pa-card" style={{ padding: 16, gap: 12 }}>
          {maal && <><span className="kicker">Dagens mål</span>
            <div style={{ font: "600 21px/1.3 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty", whiteSpace: "pre-wrap", ...overTekst }}>{maal}</div></>}
          {fokus && <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", paddingTop: maal ? 12 : 0, borderTop: maal ? "1px solid var(--border-hairline)" : "none" }}>
            <span className="pa-field__label" style={{ color: "var(--text-secondary)" }}>Fokus</span>
            <span style={{ font: "600 17px/1.2 var(--font-sans)", color: "var(--text-primary)", ...overTekst }}>{fokus}</span>
          </div>}
          {ekstra.map((e) => <div key={e.label} style={{ ...rad, paddingTop: maal || fokus ? 12 : 0, borderTop: maal || fokus ? "1px solid var(--border-hairline)" : "none" }}>
            <span className="pa-field__label" style={{ color: "var(--text-secondary)" }}>{e.label}</span>
            <span style={{ font: "var(--type-body-s)", color: "var(--text-primary)", whiteSpace: "pre-wrap", textWrap: "pretty", ...overTekst }}>{e.text}</span>
          </div>)}
        </div>}
        <section aria-label="Driller" className="pa-card" style={{ padding: "8px 16px" }}>
          <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {ovelser.map((o, i) => <li key={o.id} style={{ display: "grid", gridTemplateColumns: "28px minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 68, padding: "6px 0", borderTop: i ? "1px solid var(--border-hairline)" : "none", minWidth: 0 }}>
              <Meta style={{ font: "var(--type-num-s)" }}>{String(i + 1).padStart(2, "0")}</Meta>
              <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                <span style={{ font: "500 15px/1.3 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty", overflowWrap: "anywhere" }}>{o.navn}</span>
                {o.under && <Meta style={overTekst}>{o.under.toUpperCase()}</Meta>}
                {o.notat && <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", whiteSpace: "pre-wrap", ...overTekst }}>{o.notat}</span>}
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
                <Tall style={{ font: "600 15px/1 var(--font-mono)" }}>{o.mengde ?? "—"}</Tall>
                <Meta>{o.min != null && o.min > 0 ? `${o.min} MIN` : "—"}</Meta>
              </span>
            </li>)}
          </ol>
        </section>
      </>}
    </main>
    <div style={{ position: "sticky", bottom: 0, background: "var(--surface-page)", borderTop: "1px solid var(--border-hairline)", zIndex: 5 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 16px max(16px, env(safe-area-inset-bottom))", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 8 }}>
        {melding && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }} role="status">{melding}</p>}
        {bunn}
      </div>
    </div>
  </div>;
}
