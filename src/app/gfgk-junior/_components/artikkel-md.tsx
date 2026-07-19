import { Fragment, type ReactNode } from "react";

// Minimal markdown-renderer for kunnskapsbase-artiklene (##/###, avsnitt,
// lister, sitat, tabell, **fet**, _kursiv_). Bevisst uten ekstern dependency —
// innholdet er vår egen, kuraterte tekstbank.

function inline(tekst: string): ReactNode[] {
  const deler: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|_[^_]+_)/g;
  let sist = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(tekst)) !== null) {
    if (m.index > sist) deler.push(tekst.slice(sist, m.index));
    const bit = m[0];
    if (bit.startsWith("**")) {
      deler.push(
        <strong key={n++} className="font-bold" style={{ color: "var(--ink)" }}>
          {bit.slice(2, -2)}
        </strong>,
      );
    } else {
      deler.push(<em key={n++}>{bit.slice(1, -1)}</em>);
    }
    sist = m.index + bit.length;
  }
  if (sist < tekst.length) deler.push(tekst.slice(sist));
  return deler;
}

export function ArtikkelMd({ body }: { body: string }) {
  const blokker = body.split(/\n\n+/);
  return (
    <div className="flex flex-col gap-4">
      {blokker.map((blokk, bi) => {
        const b = blokk.trim();
        if (!b) return null;
        if (b.startsWith("### ")) {
          return (
            <h3 key={bi} className="mb-0 mt-2 text-[19px] font-bold" style={{ color: "var(--ink)" }}>
              {inline(b.slice(4))}
            </h3>
          );
        }
        if (b.startsWith("## ")) {
          return (
            <h2 key={bi} className="mb-0 mt-5 text-[25px] font-bold leading-tight" style={{ color: "var(--ink)" }}>
              {inline(b.slice(3))}
            </h2>
          );
        }
        if (b.startsWith("> ")) {
          return (
            <blockquote
              key={bi}
              className="my-1 rounded-[var(--r-md)] px-5 py-4 text-[16px] font-medium italic leading-relaxed"
              style={{ background: "var(--gold-100)", borderLeft: "4px solid var(--gfgk-gold)", color: "var(--ink)" }}
            >
              {inline(b.replace(/^> /gm, ""))}
            </blockquote>
          );
        }
        if (b.startsWith("|")) {
          const rader = b.split("\n").filter((r) => r.trim().startsWith("|"));
          const celler = (r: string) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
          const hode = celler(rader[0]);
          const kropp = rader.slice(2).map(celler);
          return (
            <div key={bi} className="overflow-x-auto rounded-[var(--r-md)] bg-white" style={{ boxShadow: "var(--shadow-sm)" }}>
              <table className="w-full border-collapse text-left text-[14px]">
                <thead>
                  <tr style={{ background: "var(--ink)", color: "var(--gfgk-white)" }}>
                    {hode.map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.06em]">
                        {inline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kropp.map((rad, ri) => (
                    <tr key={ri} className="border-b align-top" style={{ borderColor: "var(--n-100)" }}>
                      {rad.map((c, ci) => (
                        <td key={ci} className="px-4 py-2.5" style={{ color: ci === 0 ? "var(--ink)" : "var(--fg-2)" }}>
                          {inline(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (/^[-*] /m.test(b) && b.split("\n").every((l) => /^[-*] /.test(l.trim()))) {
          return (
            <ul key={bi} className="my-0 flex list-none flex-col gap-2 pl-0">
              {b.split("\n").map((l, li) => (
                <li key={li} className="grid grid-cols-[14px_1fr] items-start gap-2.5 text-[15.5px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                  <span className="mt-[9px] h-1.5 w-1.5 rounded-full" style={{ background: "var(--gfgk-teal)" }} />
                  <span>{inline(l.trim().slice(2))}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (/^\d+\. /.test(b)) {
          return (
            <ol key={bi} className="my-0 flex list-none flex-col gap-2 pl-0">
              {b.split("\n").map((l, li) => {
                const m = l.trim().match(/^(\d+)\. (.*)$/);
                if (!m) return <Fragment key={li} />;
                return (
                  <li key={li} className="grid grid-cols-[26px_1fr] items-start gap-2 text-[15.5px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                    <span className="pt-px text-[13px] font-bold tabular-nums" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--teal-600)" }}>
                      {m[1]}.
                    </span>
                    <span>{inline(m[2])}</span>
                  </li>
                );
              })}
            </ol>
          );
        }
        return (
          <p key={bi} className="my-0 text-[15.5px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
            {inline(b.replace(/\n/g, " "))}
          </p>
        );
      })}
    </div>
  );
}
