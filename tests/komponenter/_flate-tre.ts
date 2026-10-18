/** Felles hjelpere for komponenttestene av flatene i nytt design: funksjonskomponenter foldes ut. */
import * as React from "react";

export type Node = React.ReactElement<Record<string, unknown>>;

export function nodes(tree: React.ReactNode): Node[] {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!React.isValidElement<Record<string, unknown>>(tree)) return [];
  if (typeof tree.type === "function") return nodes((tree.type as (p: unknown) => React.ReactNode)(tree.props));
  return [tree, ...nodes(tree.props.children as React.ReactNode)];
}

export function text(tree: React.ReactNode): string {
  return nodes(tree)
    .map((n) => React.Children.toArray(n.props.children as React.ReactNode).filter((c) => typeof c === "string" || typeof c === "number").join(" "))
    .join(" ");
}

export function fyllId(tree: React.ReactNode, id: string, verdi: string) {
  const felt = nodes(tree).find((node) => node.type === "input" && node.props.id === id);
  if (!felt) throw new Error(`Fant ikke felt ${id}`);
  (felt.props.onChange as (event: { target: { value: string } }) => void)({ target: { value: verdi } });
}

export async function send(tree: React.ReactNode) {
  const form = nodes(tree).find((node) => node.type === "form");
  await (form!.props.onSubmit as (event: { preventDefault(): void }) => Promise<void>)({ preventDefault() {} });
}
