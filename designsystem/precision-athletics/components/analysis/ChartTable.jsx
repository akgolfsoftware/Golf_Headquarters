import React from "react";
import { Segmented } from "../forms/Segmented.jsx";
import { DataTable } from "../display/DataTable.jsx";
/** Graf og tabell er likeverdige. Tabellen er alltid ett trykk unna. */
export function ChartTable({ chart, columns, rows, caption, defaultView = "Graf", rowKey = "id", aside }) {
  const [v, setV] = React.useState(defaultView);
  return <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>{caption && <span className="kicker">{caption}</span>}<div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>{aside}<Segmented options={["Graf", "Tabell"]} value={v} onChange={setV} /></div></div>
    {v === "Graf" ? chart : <DataTable caption={caption} columns={columns} rows={rows} rowKey={rowKey} />}
  </div>;
}
