"use client";

import { useMemo, useState } from "react";
import type { GfgkData, PlayerSummary } from "../data";

type SortKey =
  | "rang"
  | "name"
  | "birthYear"
  | "tournaments"
  | "rounds"
  | "avg18"
  | "avgToPar"
  | "vsField"
  | "best"
  | "worst";

const columns: { key: SortKey; label: string; left?: boolean }[] = [
  { key: "rang", label: "#" },
  { key: "name", label: "Spiller", left: true },
  { key: "birthYear", label: "Født" },
  { key: "tournaments", label: "Turn." },
  { key: "rounds", label: "Runder" },
  { key: "avg18", label: "Snitt 18" },
  { key: "avgToPar", label: "Til par" },
  { key: "vsField", label: "vs felt" },
  { key: "best", label: "Beste" },
  { key: "worst", label: "Verste" },
];

function nf(v: number, decimals = 1) {
  return v.toLocaleString("nb-NO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function signed(v: number, decimals = 1) {
  const s = nf(Math.abs(v), decimals);
  if (v > 0) return `+${s}`;
  if (v < 0) return `−${s}`;
  return s;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ResultsTable({ data }: { data: GfgkData }) {
  const [sortKey, setSortKey] = useState<SortKey>("rang");
  const [asc, setAsc] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(() => {
    const list = Object.values(data.summary);
    const sorted = [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name, "nb-NO");
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return av - bv;
    });
    return asc ? sorted : sorted.reverse();
  }, [data.summary, sortKey, asc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAsc((p) => !p);
    } else {
      setSortKey(key);
      // tall: lavest = best, så start stigende; navn også stigende
      setAsc(true);
    }
  }

  function cell(p: PlayerSummary, key: SortKey) {
    switch (key) {
      case "avgToPar":
        return <span className="num">{signed(p.avgToPar)}</span>;
      case "vsField":
        return (
          <span className={`num ${p.vsField < 0 ? "vs-neg" : "vs-pos"}`}>
            {signed(p.vsField)}
          </span>
        );
      case "avg18":
        return <span className="num">{nf(p.avg18)}</span>;
      case "best":
      case "worst":
      case "tournaments":
      case "rounds":
      case "birthYear":
        return <span className="num">{p[key]}</span>;
      default:
        return null;
    }
  }

  return (
    <>
      <div className="rtable-wrap">
        <table className="rtable">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`${c.left ? "left" : ""} ${sortKey === c.key ? "sorted" : ""}`.trim()}
                  onClick={() => toggleSort(c.key)}
                >
                  {c.label}
                  <span className="arrow">
                    {sortKey === c.key ? (asc ? "↑" : "↓") : "↕"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const isOpen = open === p.name;
              const rounds = data.players[p.name] ?? [];
              const sortedRounds = [...rounds].sort((a, b) =>
                b.date.localeCompare(a.date),
              );
              return (
                <RowGroup
                  key={p.name}
                  player={p}
                  isOpen={isOpen}
                  onToggle={() => setOpen(isOpen ? null : p.name)}
                  cell={cell}
                  rounds={sortedRounds}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="small muted" style={{ marginTop: 14 }}>
        Klikk en spiller for å se alle turneringer. Snitt score er banejustert
        brutto over 18 hull · sesong 2025–2026.
      </p>
    </>
  );
}

function RowGroup({
  player: p,
  isOpen,
  onToggle,
  cell,
  rounds,
}: {
  player: PlayerSummary;
  isOpen: boolean;
  onToggle: () => void;
  cell: (p: PlayerSummary, key: SortKey) => React.ReactNode;
  rounds: GfgkData["players"][string];
}) {
  return (
    <>
      <tr className={`prow ${isOpen ? "open" : ""}`.trim()} onClick={onToggle}>
        <td className="rank">{p.rang}</td>
        <td className="left">
          <span className="pname">
            <svg
              className="chev"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
            {p.name}
          </span>
          <div className="pclub">{p.club}</div>
        </td>
        <td>{cell(p, "birthYear")}</td>
        <td>{cell(p, "tournaments")}</td>
        <td>{cell(p, "rounds")}</td>
        <td>{cell(p, "avg18")}</td>
        <td>{cell(p, "avgToPar")}</td>
        <td>{cell(p, "vsField")}</td>
        <td>{cell(p, "best")}</td>
        <td>{cell(p, "worst")}</td>
      </tr>
      {isOpen && (
        <tr className="detail-row">
          <td colSpan={10}>
            <div className="detail-inner">
              <table className="dtable">
                <thead>
                  <tr>
                    <th className="left">Dato</th>
                    <th className="left">Turnering</th>
                    <th className="left">Bane</th>
                    <th>Klasse</th>
                    <th>Runder</th>
                    <th>Brutto</th>
                    <th>Til par</th>
                    <th>Felt</th>
                    <th>vs felt</th>
                    <th className="left">Vansk.</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((t, i) => (
                    <tr key={i}>
                      <td className="left num">{fmtDate(t.date)}</td>
                      <td className="left">{t.name}</td>
                      <td className="left">{t.course}</td>
                      <td>{t.klasse}</td>
                      <td className="num">{t.rounds.join(" · ")}</td>
                      <td className="num">{t.brutto}</td>
                      <td className="num">{signed(t.toPar, 0)}</td>
                      <td className="num">
                        {t.fieldAvg !== null ? nf(t.fieldAvg) : "–"}
                      </td>
                      <td
                        className={`num ${
                          t.vsField === null
                            ? ""
                            : t.vsField < 0
                              ? "vs-neg"
                              : "vs-pos"
                        }`.trim()}
                      >
                        {t.vsField !== null ? signed(t.vsField) : "–"}
                      </td>
                      <td className="left">
                        <span className="difflevel">{t.diffLevel}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
