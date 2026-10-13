"use client";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Knapp, StatusPille } from "@/components/precision/pa";
import { oppdaterCoachProfil } from "@/app/admin/(legacy)/profile/actions";
import { uploadAvatar } from "@/lib/storage/avatar";
import { skalerAvatar } from "@/lib/klient/skaler-avatar";
import styles from "./CoachContent.module.css";

export type CoachProfileData = { navn: string; epost: string; phone: string | null; homeClub: string | null; hcp: number | null; bio: string; certifications: string[]; languages: string[]; clubs: string[]; avatarUrl: string | null; rolleLabel: string; opprettetLabel: string };
export function CoachProfile({ data }: { data: CoachProfileData }) {
  const router = useRouter();
  const [felter, setFelter] = useState({ navn: data.navn, epost: data.epost, phone: data.phone ?? "", homeClub: data.homeClub ?? "", hcp: data.hcp == null ? "" : String(data.hcp).replace(".", ","), bio: data.bio, certifications: data.certifications.join(", "), languages: data.languages.join(", "), clubs: data.clubs.join(", ") });
  const [feil, setFeil] = useState<string | null>(null);
  const [feltFeil, setFeltFeil] = useState<Record<string, string>>({});
  const [lagret, setLagret] = useState(false);
  const [pending, start] = useTransition();
  const [bildePending, startBilde] = useTransition();
  const [bilde, setBilde] = useState(data.avatarUrl);
  const filRef = useRef<HTMLInputElement>(null);
  const lagre = (form: FormData) => start(async () => {
    setFeil(null); setLagret(false); setFeltFeil({});
    try {
      const res = await oppdaterCoachProfil(form);
      if (!res.ok) { setFeltFeil(res.fieldErrors ?? {}); setFeil(res.error ?? "Sjekk feltene og prøv igjen. Endringene er beholdt."); return; }
      setLagret(true); router.refresh();
    } catch { setFeil("Lagringen kunne ikke bekreftes. Endringene er beholdt her. Prøv igjen."); }
  });
  const felt = (key: keyof typeof felter, label: string, type = "text") => <label className="pa-field" key={key}>
    <span className="pa-field__label">{label}</span><span className="pa-control"><input name={key} type={type} value={felter[key]} disabled={pending} aria-invalid={!!feltFeil[key]} aria-describedby={feltFeil[key] ? `coach-${key}-feil` : undefined} onChange={e => { setFelter(v => ({ ...v, [key]: e.target.value })); setLagret(false); }} /></span>
    {feltFeil[key] && <span id={`coach-${key}-feil`} role="alert">{feltFeil[key]}</span>}
  </label>;
  return <form action={lagre} className={styles.panel} aria-busy={pending}>
    <h2>Egen profil</h2><p>Kontaktinformasjon og coachprofil. Tekst om deg vises på coachprofilen. Rollen din er {data.rolleLabel.toLowerCase()}.</p>
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
      {bilde && <Image unoptimized src={bilde} alt="Ditt profilbilde" width={80} height={80} style={{ borderRadius: "50%", objectFit: "cover" }} />}
      <div className="pa-field"><span className="pa-field__label">Profilbilde</span><input ref={filRef} type="file" hidden aria-label="Velg profilbilde" accept="image/jpeg,image/png,image/webp" disabled={pending || bildePending} onChange={e => {
        const fil = e.target.files?.[0]; if (!fil) return;
        startBilde(async () => { setFeil(null); try { const form = new FormData(); form.set("file", await skalerAvatar(fil)); const res = await uploadAvatar(form); if (!res.ok) { setFeil(res.error); return; } setBilde(res.url); router.refresh(); } catch { setFeil("Bildet kunne ikke lagres. Prøv igjen."); } finally { if (filRef.current) filRef.current.value = ""; } });
      }} /><Knapp variant="secondary" disabled={pending || bildePending} onClick={() => filRef.current?.click()}>Velg profilbilde</Knapp></div>
      {bildePending && <span role="status">Lagrer profilbildet …</span>}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 20 }}>
      {felt("navn", "Navn")}{felt("epost", "Kontakt-e-post", "email")}{felt("phone", "Telefon", "tel")}{felt("hcp", "Handicap")}{felt("homeClub", "Hjemmeklubb")}
      {felt("certifications", "Sertifiseringer, atskilt med komma")}{felt("languages", "Språk, atskilt med komma")}{felt("clubs", "Klubbtilknytninger, atskilt med komma")}
    </div>
    <label className="pa-field" style={{ marginTop: 20 }}><span className="pa-field__label">Om deg, maks 280 tegn</span><textarea name="bio" className="pa-control" style={{ width: "100%", padding: 12, minHeight: 100 }} maxLength={280} value={felter.bio} disabled={pending} onChange={e => { setFelter(v => ({ ...v, bio: e.target.value })); setLagret(false); }} /></label>
    <p style={{ marginTop: 16 }}>Konto opprettet {data.opprettetLabel}. Rollen kan ikke endres her.</p>
    {feil && <p role="alert">{feil}</p>}{lagret && <p role="status"><StatusPille tone="ok">Profilen er lagret</StatusPille></p>}
    <Knapp type="submit" loading={pending} loadingText="Lagrer profilen …" disabled={bildePending}>Lagre profil</Knapp>
  </form>;
}
