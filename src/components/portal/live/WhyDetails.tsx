/**
 * «Hvorfor dette tallet» på PH-07. Kilde, beregning og forbehold i klarspråk.
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
    <details data-od-id={odId} className="ph07-hvorfor">
      <summary>{tittel}</summary>
      <ul>
        {punkter.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </details>
  );
}
