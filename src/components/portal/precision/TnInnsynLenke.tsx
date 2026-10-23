import Link from "next/link";

/**
 * Lenken «Se hva Team Norway ser» i PlayerHQ (beslutninger.md §TEAM NORWAY-TRENERFLATEN BYGGES I HQ, punkt 6 og 8).
 * Vises bare for spillere i en Team Norway-gruppe; for alle andre blir den ingenting.
 * Spilleren kan ikke åpne trenerflaten, så lenken går til spillerens egen innsynsside.
 */
export function TnInnsynLenke({ tnGrupper }: { tnGrupper: { id: string; navn: string }[] }) {
  if (tnGrupper.length === 0) return null;
  return (
    <div className="phn-kort">
      <span style={{ display: "grid", gap: 2 }}><b>Team Norway</b><span className="phn-kilde">Du er med i {tnGrupper.map((g) => g.navn).join(" og ")}.</span></span>
      <p className="phn-forklar">Trenerne ser navn, klubb, fødselsår og WAGR-plass. Alt annet ser de bare når du deler.</p>
      <Link className="phn-lenke" href="/portal/meg/deling/team-norway">Se hva Team Norway ser</Link>
    </div>
  );
}
