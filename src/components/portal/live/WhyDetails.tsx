/**
 * «Hvorfor dette tallet» — Paper-fasit .why (playerhq-live-*.html).
 * Brukes på regnede tall: kilde / beregning / forbehold i klarspråk.
 * Erstatter HjelpTips-mønsteret på live-flatene (PP-3).
 */
export function WhyDetails({
  punkter,
  odId,
  tittel = "Hvorfor dette tallet",
}: {
  punkter: string[];
  odId?: string;
  tittel?: string;
}) {
  if (punkter.length === 0) return null;
  return (
    <details
      data-od-id={odId}
      data-paper-why
      className="group mt-3 min-w-0 overflow-hidden"
      style={{ border: "1px solid var(--tl-hair)", borderRadius: "var(--tl-r-card)" }}
    >
      <summary
        className="flex cursor-pointer list-none items-center px-4 font-sans text-[12.5px] font-medium [&::-webkit-details-marker]:hidden group-open:border-b"
        style={{
          minHeight: 44,
          color: "var(--tl-mute)",
          borderColor: "var(--tl-hair)",
        }}
      >
        {tittel}
      </summary>
      <ul
        className="m-0 pb-4 pl-6 pr-4 pt-3 font-serif text-[13px]"
        style={{ color: "var(--tl-mute)", fontFamily: "var(--tl-font-sans)" }}
      >
        {punkter.map((p) => (
          <li key={p} className="mb-2 last:mb-0">
            {p}
          </li>
        ))}
      </ul>
    </details>
  );
}
