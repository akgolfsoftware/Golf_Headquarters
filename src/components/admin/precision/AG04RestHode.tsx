/**
 * AG-04-REST · felles sidehode for Kø og Kommunikasjon (restfanene som ikke
 * har egen tegning). Precision-sidehode + faner som ekte lenker (`?fane=`),
 * slik at bare den aktive fanen laster data. Tall vises bare når de er målt.
 */
import { SideHode, FanerLenker } from "@/components/precision/pa-a4";

export type AG04RestFane = { id: string; label: string; href: string };

export function AG04RestHode({ kicker, title, sub, faner, aktiv, antall }: {
  kicker: string; title: string; sub: string; faner: readonly AG04RestFane[]; aktiv: string;
  antall: Partial<Record<string, number>>;
}) {
  return <>
    <SideHode kicker={kicker} title={title} sub={sub} />
    <FanerLenker faner={faner.map((f) => ({
      href: f.href, aktiv: f.id === aktiv,
      navn: antall[f.id] !== undefined ? `${f.label} · ${antall[f.id]!.toLocaleString("nb-NO")}` : f.label,
    }))} />
  </>;
}
