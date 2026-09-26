"use client";

import React, { useState } from "react";
import { formaterTall } from "@/lib/format-tall";
import {
  User,
  Layers,
  CreditCard,
  Edit2,
  Check,
} from "lucide-react";
import Link from "next/link";

export interface KolleDef {
  id: string;
  type: string;
  merke: string;
  modell: string;
  loft: string;
  skaft: string;
  carryMeter: number;
}

export interface SpillerProfilPrecisionProps {
  navn: string;
  epost?: string;
  avatarUrl?: string | null;
  hcp?: number | null;
  hjemmeklubb?: string | null;
  kategori?: string;
  snittScore?: number;
  abonnement?: string;
}

export function SpillerProfilPrecisionView({
  navn = "Magnus Kristiansen",
  epost = "magnus@akgolf.no",
  hcp = 1.4,
  hjemmeklubb = "Gamle Fredrikstad Golfklubb",
  kategori = "Kategori D",
  snittScore = 73.4,
  abonnement = "Performance Toppidrett",
}: SpillerProfilPrecisionProps) {
  const [aktivFane, setAktivFane] = useState<"profil" | "bag" | "abonnement">("bag");

  // 14-køllers bag oppsett
  const [koller, setKoller] = useState<KolleDef[]>([
    { id: "1", type: "Driver", merke: "Titleist", modell: "TSR3", loft: "9.0°", skaft: "Ventus Black 6X", carryMeter: 262 },
    { id: "2", type: "3-Wood", merke: "Titleist", modell: "TSR3", loft: "15.0°", skaft: "Ventus Black 7X", carryMeter: 236 },
    { id: "3", type: "Hybrid", merke: "Callaway", modell: "Apex UW", loft: "19.0°", skaft: "KBS Tour Hybrid", carryMeter: 218 },
    { id: "4", type: "4-Jern", merke: "Titleist", modell: "T100", loft: "24.0°", skaft: "Project X 6.5", carryMeter: 202 },
    { id: "5", type: "5-Jern", merke: "Titleist", modell: "T100", loft: "27.0°", skaft: "Project X 6.5", carryMeter: 191 },
    { id: "6", type: "6-Jern", merke: "Titleist", modell: "T100", loft: "30.0°", skaft: "Project X 6.5", carryMeter: 179 },
    { id: "7", type: "7-Jern", merke: "Titleist", modell: "T100", loft: "34.0°", skaft: "Project X 6.5", carryMeter: 167 },
    { id: "8", type: "8-Jern", merke: "Titleist", modell: "T100", loft: "38.0°", skaft: "Project X 6.5", carryMeter: 154 },
    { id: "9", type: "9-Jern", merke: "Titleist", modell: "T100", loft: "42.0°", skaft: "Project X 6.5", carryMeter: 142 },
    { id: "10", type: "PW", merke: "Titleist", modell: "T100", loft: "46.0°", skaft: "Project X 6.5", carryMeter: 130 },
    { id: "11", type: "Gap Wedge", merke: "Vokey", modell: "SM10 F-Grind", loft: "50.0°", skaft: "Dynamic Gold S400", carryMeter: 116 },
    { id: "12", type: "Sand Wedge", merke: "Vokey", modell: "SM10 M-Grind", loft: "54.0°", skaft: "Dynamic Gold S400", carryMeter: 102 },
    { id: "13", type: "Lob Wedge", merke: "Vokey", modell: "SM10 T-Grind", loft: "58.0°", skaft: "Dynamic Gold S400", carryMeter: 86 },
    { id: "14", type: "Putter", merke: "Scotty Cameron", modell: "Phantom X 5.5", loft: "3.5°", skaft: "Stepless Steel 34\"", carryMeter: 0 },
  ]);

  const [redigererId, setRedigererId] = useState<string | null>(null);
  const [redigerCarry, setRedigerCarry] = useState<string>("");

  const lagreCarry = (id: string) => {
    const numeric = parseInt(redigerCarry, 10);
    if (numeric >= 0) {
      setKoller((prev) =>
        prev.map((k) => (k.id === id ? { ...k, carryMeter: numeric } : k))
      );
    }
    setRedigererId(null);
    setRedigerCarry("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      {/* Profil-header */}
      <div className="rounded-2xl border border-[#DDD9D1] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#141413] text-xl font-bold font-mono text-white">
              {navn.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans text-2xl font-bold tracking-tight text-[#141413]">
                  {navn}
                </h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-sans text-[11px] font-bold text-emerald-900">
                  {kategori}
                </span>
              </div>
              <p className="font-sans text-xs text-black/60 mt-0.5">
                {hjemmeklubb} · {epost}
              </p>
            </div>
          </div>

          {/* Fanevelger */}
          <div className="flex rounded-lg border border-[#DDD9D1] bg-[#FAF8F3] p-1">
            <button
              type="button"
              onClick={() => setAktivFane("bag")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-sans text-xs font-semibold transition-all ${
                aktivFane === "bag"
                  ? "bg-[#141413] text-white shadow-xs"
                  : "text-black/70 hover:text-black"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>14-køllers Bag</span>
            </button>

            <button
              type="button"
              onClick={() => setAktivFane("profil")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-sans text-xs font-semibold transition-all ${
                aktivFane === "profil"
                  ? "bg-[#141413] text-white shadow-xs"
                  : "text-black/70 hover:text-black"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Profil & Mål</span>
            </button>

            <button
              type="button"
              onClick={() => setAktivFane("abonnement")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-sans text-xs font-semibold transition-all ${
                aktivFane === "abonnement"
                  ? "bg-[#141413] text-white shadow-xs"
                  : "text-black/70 hover:text-black"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Abonnement</span>
            </button>
          </div>
        </div>

        {/* Nøkkeltall strippe */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#DDD9D1] pt-4">
          <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
            <span className="block font-sans text-[10px] uppercase tracking-wider text-black/50">Handicap</span>
            <span className="font-mono text-xl font-bold text-[#141413] mt-0.5 block">
              {formaterTall(hcp, 1)}
            </span>
          </div>

          <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
            <span className="block font-sans text-[10px] uppercase tracking-wider text-black/50">Snittscore brutto</span>
            <span className="font-mono text-xl font-bold text-[#141413] mt-0.5 block">
              {formaterTall(snittScore, 1)}
            </span>
          </div>

          <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
            <span className="block font-sans text-[10px] uppercase tracking-wider text-black/50">Køller i bagen</span>
            <span className="font-mono text-xl font-bold text-emerald-800 mt-0.5 block">
              {koller.length} / 14 (Komplett)
            </span>
          </div>

          <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
            <span className="block font-sans text-[10px] uppercase tracking-wider text-black/50">Aktivt program</span>
            <span className="font-sans text-sm font-bold text-[#141413] mt-1 block truncate">
              {abonnement}
            </span>
          </div>
        </div>
      </div>

      {/* Fane 1: 14-køllers bag oppsett */}
      {aktivFane === "bag" && (
        <div className="rounded-2xl border border-[#DDD9D1] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDD9D1] pb-3">
            <div>
              <h2 className="font-sans text-base font-bold text-[#141413]">
                14-køllers Turneringsbag & Gapping
              </h2>
              <p className="font-sans text-xs text-black/60">
                Eksakte loft, skaft og kalibrert carry-lengde fra TrackMan
              </p>
            </div>
            <Link
              href="/portal/toppidrett"
              className="font-sans text-xs font-bold text-[#9B2415] hover:underline"
            >
              Åpne 2D gapping-matrise →
            </Link>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#DDD9D1]">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-[#DDD9D1] bg-[#FAF8F3] font-sans text-[11px] font-bold uppercase tracking-wider text-black/60">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Kølle</th>
                  <th className="py-2.5 px-4">Merke & Modell</th>
                  <th className="py-2.5 px-4">Loft</th>
                  <th className="py-2.5 px-4">Skaft</th>
                  <th className="py-2.5 px-4">Carry (meter)</th>
                  <th className="py-2.5 px-4 text-right">Handling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD9D1] font-mono text-xs">
                {koller.map((k, idx) => (
                  <tr key={k.id} className="hover:bg-[#FAF8F3]/50 transition-colors">
                    <td className="py-3 px-4 text-black/40 font-bold">{idx + 1}</td>
                    <td className="py-3 px-4 font-sans font-bold text-[#141413]">{k.type}</td>
                    <td className="py-3 px-4 font-sans">{k.merke} {k.modell}</td>
                    <td className="py-3 px-4 text-black/70">{k.loft}</td>
                    <td className="py-3 px-4 font-sans text-[11px] text-black/60">{k.skaft}</td>
                    <td className="py-3 px-4">
                      {redigererId === k.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={redigerCarry}
                            onChange={(e) => setRedigerCarry(e.target.value)}
                            className="w-16 rounded border border-[#DDD9D1] px-2 py-0.5 text-xs font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => lagreCarry(k.id)}
                            className="rounded bg-[#141413] p-1 text-white"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-[#141413]">
                          {k.carryMeter > 0 ? `${k.carryMeter} m` : "—"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          setRedigererId(k.id);
                          setRedigerCarry(String(k.carryMeter));
                        }}
                        className="text-black/40 hover:text-black"
                        title="Rediger carry"
                      >
                        <Edit2 className="h-3.5 w-3.5 ml-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fane 2: Profil & Mål */}
      {aktivFane === "profil" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[#DDD9D1] bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-sans text-base font-bold text-[#141413] border-b border-[#DDD9D1] pb-2">
              Spilleridentitet
            </h3>
            <div className="space-y-3 text-xs font-sans">
              <div>
                <span className="block text-black/50">Fullt navn</span>
                <span className="font-bold text-[#141413] text-sm">{navn}</span>
              </div>
              <div>
                <span className="block text-black/50">E-post</span>
                <span className="font-mono text-[#141413]">{epost}</span>
              </div>
              <div>
                <span className="block text-black/50">Hjemmeklubb</span>
                <span className="font-semibold text-[#141413]">{hjemmeklubb}</span>
              </div>
              <div>
                <span className="block text-black/50">Kategori-klassifisering</span>
                <span className="font-bold text-[#9B2415]">{kategori} (snitt 73,4)</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDD9D1] bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-sans text-base font-bold text-[#141413] border-b border-[#DDD9D1] pb-2">
              Sesongmål & Utvikling
            </h3>
            <div className="space-y-3 text-xs font-sans">
              <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
                <span className="font-sans text-[10px] font-bold uppercase text-black/50 block">Hovedmål 2026</span>
                <span className="font-sans text-sm font-bold text-[#141413] mt-0.5 block">
                  Kvalifisering til internasjonal juniorturnering (EGA)
                </span>
              </div>
              <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
                <span className="font-sans text-[10px] font-bold uppercase text-black/50 block">Delmål 1</span>
                <span className="font-sans text-xs font-semibold text-[#141413] mt-0.5 block">
                  GIR (Greens in Regulation) over 68 % på 18-hulls runder
                </span>
              </div>
              <div className="rounded-lg bg-[#FAF8F3] p-3 border border-[#DDD9D1]">
                <span className="font-sans text-[10px] font-bold uppercase text-black/50 block">Delmål 2</span>
                <span className="font-sans text-xs font-semibold text-[#141413] mt-0.5 block">
                  Trapbar markløft på 2,0x kroppsvekt (WANG VG3 krav)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fane 3: Abonnement & Roller */}
      {aktivFane === "abonnement" && (
        <div className="rounded-2xl border border-[#DDD9D1] bg-white p-6 shadow-sm space-y-4">
          <div className="border-b border-[#DDD9D1] pb-3">
            <h3 className="font-sans text-base font-bold text-[#141413]">
              Abonnement & Sikkerhet
            </h3>
            <p className="font-sans text-xs text-black/60">
              Administrer ditt AK Golf-medlemskap og personvern
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                Aktiv pakke
              </span>
              <h4 className="font-sans text-lg font-bold text-emerald-950 mt-1">
                {abonnement}
              </h4>
              <p className="font-sans text-xs text-emerald-900/80 mt-1">
                Full tilgang til TrackMan-studio, Toppidrett-OS og personlig ukentlig oppfølging.
              </p>
              <span className="block font-mono text-[11px] text-emerald-900 font-semibold mt-3">
                Fornyes automatisk via Stripe
              </span>
            </div>

            <div className="rounded-xl border border-[#DDD9D1] bg-[#FAF8F3] p-4 flex flex-col justify-between">
              <div>
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-black/50">
                  Personvern & GDPR
                </span>
                <h4 className="font-sans text-sm font-bold text-[#141413] mt-1">
                  Dine persondata og rettigheter
                </h4>
                <p className="font-sans text-xs text-black/60 mt-1">
                  Du har full kontroll over dine treningsdata, videoklipp og historikk.
                </p>
              </div>

              <Link
                href="/personvern"
                className="mt-3 font-sans text-xs font-bold text-[#9B2415] hover:underline"
              >
                Gå til Personvern & Dataeksport →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
