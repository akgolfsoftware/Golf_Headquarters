"use client";

import { useId } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Listen kommer utelukkende fra serverens godkjente forelderrelasjoner. */
export function ForelderBarnValg({ barn, valgt, alle = false }: {
  barn: Array<{ id: string; navn: string }>;
  valgt: string | null;
  alle?: boolean;
}) {
  const id = useId(); const pathname = usePathname(); const params = useSearchParams(); const router = useRouter();
  if (barn.length === 0) return null;
  return <div className="fo-barnvalg">
    <label htmlFor={id}>Barn</label>
    <select id={id} value={valgt ?? ""} onChange={(event) => {
      const next = new URLSearchParams(params.toString());
      if (event.target.value) next.set("barn", event.target.value); else next.delete("barn");
      router.replace(`${pathname}${next.size ? `?${next}` : ""}`);
    }}>
      {alle && <option value="">Alle barn</option>}
      {!alle && !valgt && <option value="">Velg et koblet barn</option>}
      {barn.map((b) => <option key={b.id} value={b.id}>{b.navn}</option>)}
    </select>
    <Link href={valgt ? `/forelder/barn/${encodeURIComponent(valgt)}` : "/forelder/barn"}>Se barnet</Link>
  </div>;
}

export function ForelderBarnAvvist({ barn }: { barn: Array<{ id: string; navn: string }> }) {
  return <div className="fo-side"><header className="fo-hode"><h1>Barnet er ikke koblet til kontoen</h1><p className="fo-under">Velg et barn du har innsyn i, eller se koblingene dine under Barn.</p></header><ForelderBarnValg barn={barn} valgt={null} /></div>;
}
