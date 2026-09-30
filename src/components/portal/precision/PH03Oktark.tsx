/**
 * PH-03 Øktark — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-03.jsx, etag 1790521027386184).
 *
 * Ren visning uten egen tilstand: begge rutene som viser et øktark
 * (/portal/gjennomfore/[id] og /portal/tren/wb/[sessionId]) bygger de samme
 * props og legger sine egne handlinger i `handlinger`.
 *
 * Bevisste avvik fra tegningen:
 *   - Ingen avkrysning per øvelse: loggingen skjer i live-økta, og appen har
 *     ingen lagring for et hakesett utenfor den.
 *   - «Endre rekkefølge» er ikke med: forslag om ny rekkefølge til coach har ingen lagring ennå.
 *   - Hopp over-arket har ikke årsaksvalg: årsaken lagres ingen steder ennå.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CircleAlert, ListPlus } from "lucide-react";
import { AkseMerke, FeilTilstand, Ikon, KnappLenke, Meta, StatusPille, TomTilstand, type Akse } from "@/components/precision/pa";
import { SideHode, Nokkelverdi } from "@/components/precision/pa-a4";
import "@/styles/precision-ph03.css";

export type PH03Status = "Planlagt" | "Pågår" | "Gjennomført" | "Hoppet over" | "Avlyst";
export type PH03Ovelse = {
  id: string; akse: Akse; navn: string; kode: string | null; mengde: string | null; min: number | null; gjort: boolean | null;
};
export type PH03Props = {
  tilstand: "data" | "tom" | "feil";
  kicker: string;
  tittel: string;
  status: PH03Status;
  statusMeta?: string | null;
  ovelser: PH03Ovelse[];
  nokler: ReadonlyArray<readonly [string, string | null]>;
  notatTittel: string;
  notat: { tekst: string; kilde: string } | null;
  tilbake: { href: string; label: string };
  handlinger?: ReactNode;
  /** Kort under nøkkeltallene (tren sammen, eierinfo). */
  ekstra?: ReactNode;
  feilKode: string;
  tomHandling?: ReactNode;
  children?: ReactNode;
};

const TONE: Record<PH03Status, "neutral" | "info" | "ok" | "warn"> = {
  Planlagt: "neutral", "Pågår": "info", "Gjennomført": "ok", "Hoppet over": "warn", Avlyst: "warn",
};

function Ovelse({ o, nr }: { o: PH03Ovelse; nr: number }) {
  const gjort = o.gjort === true;
  return <li className="ph03-ovelse" style={{ listStyle: "none" }}>
    <Meta style={{ font: "var(--type-num-s)", paddingTop: 2 }}>{String(nr).padStart(2, "0")}</Meta>
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <AkseMerke axis={o.akse} />
        <span style={{ font: "500 15px/1.3 var(--font-sans)", color: gjort ? "var(--text-muted)" : "var(--text-primary)", textDecoration: gjort ? "line-through" : "none", flex: "1 1 180px", minWidth: 0, overflowWrap: "anywhere" }}>{o.navn}</span>
      </div>
      {o.kode && <div style={{ font: "500 12px/1.35 var(--font-mono)", color: "var(--text-secondary)", overflowWrap: "anywhere" }}>{o.kode}</div>}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Meta>{o.mengde ? o.mengde.toUpperCase() : "—"}</Meta>
        <Meta>{o.min != null ? `${o.min} MIN` : "—"}</Meta>
        {o.gjort != null && <Meta>{gjort ? "GJENNOMFØRT" : "IKKE LOGGET"}</Meta>}
      </div>
    </div>
  </li>;
}

export function PH03Oktark(p: PH03Props) {
  const totalMin = p.ovelser.reduce((s, o) => s + (o.min ?? 0), 0);
  const meta = p.statusMeta ? <span>{p.statusMeta}</span> : null;
  return <div className="pa-side">
    <Link href={p.tilbake.href} className="ph03-tilbake"><Ikon icon={ArrowLeft} size={16} name="arrow-left" />{p.tilbake.label}</Link>
    <SideHode kicker={p.kicker} title={p.tittel}
      sub={<span style={{ display: "inline-flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><StatusPille tone={TONE[p.status]}>{p.status}</StatusPille>{meta}</span>}
      actions={p.tilstand === "feil" ? null : p.handlinger} />
    {p.tilstand === "feil"
      ? <FeilTilstand icon={CircleAlert} title="Kunne ikke åpne økta" text="Økta finnes, men øvelsene kunne ikke lastes. Prøv igjen, eller åpne den fra I dag."
          code={p.feilKode} retry={<KnappLenke href="/portal" variant="secondary">Tilbake til I dag</KnappLenke>} />
      : <div className="ph03-cols">
          <section aria-label="Øvelser" className="pa-card" style={{ padding: "16px 16px 4px", minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", paddingBottom: 4 }}>
              <span className="kicker">Øvelser · AK-formelen</span>
              <Meta>{p.ovelser.length ? `${p.ovelser.length} ØVELSER${totalMin > 0 ? ` · ${totalMin} MIN` : ""}` : "—"}</Meta>
            </div>
            {p.ovelser.length
              ? <ol style={{ margin: 0, padding: 0 }}>{p.ovelser.map((o, i) => <Ovelse key={o.id} o={o} nr={i + 1} />)}</ol>
              : <div style={{ padding: "12px 0 16px" }}><TomTilstand icon={ListPlus} title="Økta har ingen øvelser ennå" text="Coachen legger inn øvelsene før start. Innholdet kan også avtales på stedet." actions={p.tomHandling} /></div>}
          </section>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
            <div className="pa-card" style={{ padding: "8px 16px" }}>
              <Nokkelverdi items={p.nokler.map(([k, v]) => [k, v, { mono: false }] as const)} />
            </div>
            <section aria-label={p.notatTittel} className="pa-card" style={{ padding: 16, gap: 8 }}>
              <span className="kicker">{p.notatTittel}</span>
              <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-body)", textWrap: "pretty", overflowWrap: "anywhere" }}>{p.notat ? p.notat.tekst : "—"}</p>
              {p.notat && <Meta>{p.notat.kilde}</Meta>}
            </section>
            {p.ekstra}
          </div>
        </div>}
    {p.children}
  </div>;
}
