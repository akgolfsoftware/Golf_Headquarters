import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import * as React from "react";

const slots: unknown[] = [];
const pending: Promise<unknown>[] = [];
let cursor = 0;
let calls = 0;
let checkout: () => Promise<{ ok: true; url: string } | { ok: false; error: string }>;
mock.module("react", { namedExports: { ...React,
  useState<T>(initial: T): [T, (value: T) => void] { const n = cursor++; if (!(n in slots)) slots[n] = initial; return [slots[n] as T, value => { slots[n] = value; }]; },
  useRef<T>(initial: T): { current: T } { const n = cursor++; if (!(n in slots)) slots[n] = { current: initial }; return slots[n] as { current: T }; },
  useTransition: () => [false, (action: () => Promise<unknown>) => { pending.push(action()); }],
} });
mock.module("@/components/v2", { namedExports: { Icon: "i", Kort: "section", Caps: "span", Knapp: "button", TilbakeLenke: "a" } });
mock.module("@/components/v2/skjema", { namedExports: { Inndata: "input", TekstOmraade: "textarea" } });
mock.module("@/components/marketing/v2/booking-tl-ramme", { namedExports: { BookingRamme: "main", Eyebrow: "p", HeroT: "h1", Lede: "p", Seksjon: "section", useMobile: () => false } });
mock.module("@/app/(marketing)/booking/[slug]/bekreft/actions", { namedExports: { createBookingCheckout: async () => { calls++; return checkout(); } } });
Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { href: "https://syntetisk.example/booking" } } });
type Node = React.ReactElement<Record<string, unknown>>;
function nodes(tree: React.ReactNode): Node[] {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!React.isValidElement<Record<string, unknown>>(tree)) return [];
  return [tree, ...nodes(tree.props.children as React.ReactNode)];
}
function text(tree: React.ReactNode): string {
  if (Array.isArray(tree)) return tree.map(text).join(" ");
  if (React.isValidElement<Record<string, unknown>>(tree)) return text(tree.props.children as React.ReactNode);
  return typeof tree === "string" ? tree : "";
}
let render: () => React.ReactNode;
before(async () => {
  const { MarkedBookingBekreftV2 } = await import("@/components/marketing/v2/MarkedBookingBekreftV2");
  const outer = MarkedBookingBekreftV2({ slug: "syntetisk", start: "2026-11-12T16:30:00", coachId: "coach", tjenesteNavn: "Tjeneste", datoTekst: "12. november", klokkeslettTekst: "16:30", durationMin: 30, coachNavn: null, prisTekst: "950,50 kr", priceOre: 95050, innloggetEpost: "syntetisk@example.invalid", innloggetNavn: "Syntetisk Navn" });
  const formComponent = nodes(outer).find(node => typeof node.type === "function" && node.type.name === "BekreftSkjema")!;
  render = () => {
    cursor = 0;
    const result = (formComponent.type as React.FunctionComponent<Record<string, unknown>>)(formComponent.props);
    if (result instanceof Promise) throw new Error("Dette klientskjemaet skal rendre synkront.");
    return result;
  };
});
beforeEach(() => { slots.length = 0; pending.length = 0; cursor = 0; calls = 0; window.location.href = "https://syntetisk.example/booking"; checkout = async () => ({ ok: true, url: "https://checkout.stripe.com/syntetisk" }); });
function prepare() {
  const input = nodes(render()).find(node => node.props.label === "Telefon")!;
  (input.props.onChange as (value: string) => void)("12345678");
  return nodes(render()).find(node => node.type === "form")!.props.onSubmit as (event: { preventDefault(): void }) => void;
}
test("dobbelttrykk mens betalingen åpnes gir bare ett checkout-kall", async () => {
  let release!: () => void;
  checkout = () => new Promise(resolve => { release = () => resolve({ ok: true, url: "https://checkout.stripe.com/syntetisk" }); });
  const send = prepare(); send({ preventDefault() {} }); send({ preventDefault() {} });
  assert.equal(calls, 1); release(); await Promise.all(pending);
  assert.equal(window.location.href, "https://checkout.stripe.com/syntetisk");
});
test("nettfeil beholder kontaktfelter og kvitterer ikke som betalt", async () => {
  checkout = async () => { throw new Error("syntetisk nettfeil"); };
  prepare()({ preventDefault() {} }); await Promise.all(pending);
  const tree = render(); assert.match(text(tree), /Vi fikk ikke bekreftet bestillingen/);
  assert.match(text(tree), /950,50/);
  assert.equal(nodes(tree).find(node => node.props.label === "Telefon")?.props.value, "12345678");
  assert.equal(window.location.href, "https://syntetisk.example/booking");
});
