import { SideHode } from "@/components/precision/pa-a4";
import { KnappLenke, StatusPille } from "@/components/precision/pa";
import styles from "@/components/admin/precision/agency-completion/CoachContent.module.css";
export type BookingDetaljStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export interface AdminBookingDetaljV2Data { tjeneste: string; status: BookingDetaljStatus; spiller: { id: string; navn: string } | null; gjest: { navn: string | null; epost: string | null; telefon: string | null } | null; coachNavn: string | null; dato: string; tid: string; sted: string; pris: string; notat: string | null; opprettet: string }
const STATUS = { PENDING: "Forespørsel", CONFIRMED: "Bekreftet", CANCELLED: "Avlyst", COMPLETED: "Fullført" };
export function AdminBookingDetaljV2({ data }: { data: AdminBookingDetaljV2Data }) {
  const rader = [["Spiller", data.spiller?.navn ?? data.gjest?.navn ?? "Gjest"], ["Kontakt", [data.gjest?.epost, data.gjest?.telefon].filter(Boolean).join(" · ") || null], ["Coach", data.coachNavn ?? "Ikke registrert"], ["Tid", `${data.dato} · ${data.tid}`], ["Sted", data.sted], ["Pris", data.pris], ["Notat", data.notat], ["Opprettet", data.opprettet]];
  return <><SideHode title={data.tjeneste} sub={`${data.dato} · ${data.tid} · ${data.sted}`} actions={<StatusPille tone={data.status === "PENDING" ? "warn" : "neutral"}>{STATUS[data.status]}</StatusPille>} />
    <div className={styles.panel}><h2>Bookingopplysninger</h2><dl className={styles.rows}>{rader.filter(r => r[1]).map(([label,value]) => <div key={label} className={styles.row}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {data.spiller && <KnappLenke href={`/admin/spillere/${data.spiller.id}`}>Åpne {data.spiller.navn}</KnappLenke>}
      <KnappLenke variant={data.spiller ? "ghost" : "primary"} href="/admin/bookinger">Til bookinger</KnappLenke>
    </div>
  </>;
}
