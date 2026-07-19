"use client";

// WANG-innlogging (Claude Design «WANG Innlogging»). To visninger:
// «Logg inn» (WANG-brandet inngang som sender til appens ekte auth) og
// «Administrer brukere» (tydelig merket demo – lokal state, ingen ekte data).

import { useState } from "react";
import { ArrowLeft, GraduationCap, Mail, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { IconChip } from "../_components/primitiver";

interface DemoBruker {
  id: number;
  navn: string;
  klasse: string;
  epost: string;
  foreldre: string[];
}

const SEED: DemoBruker[] = [
  { id: 1, navn: "Emma Larsen", klasse: "VG2", epost: "emma.larsen@wang.no", foreldre: ["ida.strand@gmail.com", "per.larsen@gmail.com"] },
  { id: 2, navn: "Jonas Bakke", klasse: "VG1", epost: "jonas.bakke@wang.no", foreldre: ["marius.dahl@gmail.com"] },
  { id: 3, navn: "Sofie Holm", klasse: "VG3", epost: "sofie.holm@wang.no", foreldre: ["kari.holm@gmail.com", "tom.holm@gmail.com"] },
  { id: 4, navn: "Marius Dahl", klasse: "VG2", epost: "marius.dahl@wang.no", foreldre: ["anne.dahl@gmail.com"] },
];

function initialer(navn: string): string {
  return navn.split(" ").map((d) => d[0]).slice(0, 2).join("").toUpperCase();
}

export function WangLogin() {
  const [view, setView] = useState<"login" | "admin">("login");
  return view === "login" ? <Login onAdmin={() => setView("admin")} /> : <Admin onBack={() => setView("login")} />;
}

function Login({ onAdmin }: { onAdmin: () => void }) {
  const [epost, setEpost] = useState("");
  const [pw, setPw] = useState("");
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, boxSizing: "border-box", background: "var(--bg-app)" }}>
      <div className="wang-card" style={{ width: "100%", maxWidth: 420, padding: "clamp(24px,5vw,36px)", boxSizing: "border-box" }}>
        <Image src="/team-wang/wang-logo-vertical.svg" alt="WANG" width={48} height={76} style={{ height: 76, width: "auto", display: "block", margin: "0 auto 20px" }} />
        <h1 style={{ margin: 0, textAlign: "center", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)" }}>Logg inn</h1>
        <p style={{ margin: "6px 0 0", textAlign: "center", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)" }}>WANG Toppidrett Fredrikstad · Golf</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
          <Felt label="E-post" type="email" placeholder="navn@wang.no" value={epost} onChange={setEpost} />
          <Felt label="Passord" type="password" placeholder="••••••••" value={pw} onChange={setPw} />
          <Link href="/auth/login?next=/team-wang" className="wang-pressable" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 48, borderRadius: 999, background: "var(--wang-navy)", color: "var(--white)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Logg inn
          </Link>
        </div>

        <p style={{ margin: "18px 0 0", fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.5, color: "var(--text-secondary)", textAlign: "center" }}>
          For elever: din <strong style={{ color: "var(--text-primary)" }}>@wang.no</strong>-adresse. For foreldre: e-posten du er registrert med hos skolen. Sikker innlogging via AK Golf HQ.
        </p>

        <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", textAlign: "center" }}>
          <button onClick={onAdmin} className="wang-pressable" style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-brand)", fontWeight: 600, fontSize: 13, color: "var(--wang-teal-text)" }}>
            Administrer brukere (skole / trener) →
          </button>
        </div>
      </div>
    </div>
  );
}

function Admin({ onBack }: { onBack: () => void }) {
  const [brukere, setBrukere] = useState<DemoBruker[]>(SEED);
  const [navn, setNavn] = useState("");
  const [klasse, setKlasse] = useState("VG1");
  const [wangEpost, setWangEpost] = useState("");
  const [f1, setF1] = useState("");
  const [f2, setF2] = useState("");

  const leggTil = () => {
    if (!navn.trim() || !wangEpost.trim()) return;
    const foreldre = [f1, f2].map((x) => x.trim()).filter(Boolean);
    setBrukere((b) => [...b, { id: Date.now(), navn: navn.trim(), klasse, epost: wangEpost.trim(), foreldre }]);
    setNavn(""); setKlasse("VG1"); setWangEpost(""); setF1(""); setF2("");
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "clamp(20px,4vw,40px) clamp(16px,4vw,32px) 72px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <Image src="/team-wang/wang-crest.svg" alt="WANG" width={26} height={34} style={{ height: 34, width: "auto" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 22, color: "var(--text-primary)" }}>Administrer brukere</h1>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)" }}>Elever og foreldre · WANG Fredrikstad Golf</div>
        </div>
        <button onClick={onBack} className="wang-pressable" style={{ border: "none", background: "var(--neutral-50)", cursor: "pointer", height: 38, padding: "0 16px", borderRadius: 999, fontFamily: "var(--font-brand)", fontWeight: 600, fontSize: 13, color: "var(--text-primary)", display: "inline-flex", alignItems: "center", gap: 7 }}>
          <ArrowLeft size={15} strokeWidth={2.2} aria-hidden /> Innlogging
        </button>
      </div>

      <div className="wang-card" style={{ padding: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <IconChip icon="users" color="navy" size={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Legg til elever og foreldre</div>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.5, color: "var(--text-secondary)" }}>Registrer hver elev med sin WANG-epost og foreldrenes e-post. Dette gir tilgang til gruppechat og innlogget innhold. <strong style={{ color: "var(--text-primary)" }}>Demo</strong> – kobles til skolens brukerbase i produksjon.</p>
        </div>
      </div>

      <section className="wang-card" style={{ padding: 22 }}>
        <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16, marginBottom: 16, color: "var(--text-primary)" }}>Ny elev</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
          <Felt label="Elevens navn" placeholder="Emma Larsen" value={navn} onChange={setNavn} />
          <div>
            <label className="t-label" style={{ display: "block", color: "var(--text-secondary)", marginBottom: 6 }}>Klasse</label>
            <select value={klasse} onChange={(e) => setKlasse(e.target.value)} style={{ width: "100%", height: 48, padding: "0 14px", borderRadius: 16, border: "1px solid var(--border-subtle)", background: "var(--neutral-50)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" }}>
              <option>VG1</option><option>VG2</option><option>VG3</option>
            </select>
          </div>
          <Felt label="WANG-epost" type="email" placeholder="emma.larsen@wang.no" value={wangEpost} onChange={setWangEpost} />
          <Felt label="Forelder 1 – e-post" type="email" placeholder="forelder@epost.no" value={f1} onChange={setF1} />
          <Felt label="Forelder 2 – e-post (valgfritt)" type="email" placeholder="forelder@epost.no" value={f2} onChange={setF2} />
        </div>
        <button onClick={leggTil} className="wang-pressable" style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, height: 48, padding: "0 20px", borderRadius: 999, border: "none", cursor: "pointer", background: "var(--wang-teal)", color: "var(--white)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14 }}>
          <Plus size={17} strokeWidth={2.4} aria-hidden /> Legg til elev
        </button>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "2px 2px 12px" }}>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Registrerte elever</div>
          <span className="wang-num" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>{brukere.length} elever</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {brukere.map((u) => (
            <div key={u.id} className="wang-card" style={{ padding: 16, display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
              <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 999, background: "var(--tint-navy)", color: "var(--wang-navy)", fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 14 }}>{initialer(u.navn)}</span>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{u.navn}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 999, background: "var(--tint-blue)", color: "var(--cat-blue)", fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11 }}>{u.klasse}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, color: "var(--text-secondary)" }}>
                  <GraduationCap size={14} strokeWidth={2} aria-hidden />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-primary)" }}>{u.epost}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {u.foreldre.map((f) => (
                    <span key={f} style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 10px", borderRadius: 999, background: "var(--neutral-50)", color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 11.5 }}>
                      <Mail size={11} strokeWidth={2} aria-hidden />{f}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => setBrukere((b) => b.filter((x) => x.id !== u.id))} className="wang-pressable" aria-label={`Fjern ${u.navn}`} style={{ flexShrink: 0, border: "none", background: "var(--tint-pink)", color: "var(--cat-pink)", width: 38, height: 38, borderRadius: 999, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={16} strokeWidth={2} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Felt({ label, type = "text", placeholder, value, onChange }: { label: string; type?: string; placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="t-label" style={{ display: "block", color: "var(--text-secondary)", marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", height: 48, padding: "0 16px", borderRadius: 16, border: "1px solid var(--border-subtle)", background: "var(--neutral-50)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
}
