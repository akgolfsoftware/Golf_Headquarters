"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { markNotificationsRead } from "@/app/portal/(legacy)/varsler/actions";

export type VarselKategori = "coach" | "timer" | "foring" | "tester" | "betaling" | "annet";

export type VarslerV2Item = {
  id: string;
  icon: string;
  kategori: VarselKategori;
  tittel: string;
  body: string | null;
  tid: string;
  ulest: boolean;
  link: string | null;
  gruppe: "I dag" | "Denne uka" | "Tidligere";
};

export type VarslerV2Data = {
  items: VarslerV2Item[];
  uleste: number;
  navn: string;
};

export function VarslerV2({ data }: { data: VarslerV2Data }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { items } = data;

  function apne(item: VarslerV2Item) {
    startTransition(async () => {
      if (item.ulest) await markNotificationsRead([item.id]);
      if (item.link) router.push(item.link);
      else router.refresh();
    });
  }

  return (
    <div className="ph25v" data-od-id="varsler-root">
      <h1>Varsler</h1>
      {items.length === 0 ? (
        <p className="ph25v-tom">Ingen uleste.</p>
      ) : (
        <div>
          {items.map((v) => (
            <button key={v.id} type="button" disabled={pending} onClick={() => apne(v)} data-od-id={`varsler-rad-${v.id}`} data-ulest={v.ulest ? "true" : undefined}>
              <span aria-label={v.ulest ? "Ulest" : undefined} />
              <span>
                <strong>{v.tittel}</strong>
                {v.body && <small>{v.body}</small>}
              </span>
              <time>{v.tid}</time>
            </button>
          ))}
        </div>
      )}
      <Link href="/portal" data-od-id="varsler-lukk">Lukk</Link>
    </div>
  );
}
