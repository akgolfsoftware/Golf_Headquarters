/** Faktisk opptakskomponent med syntetiske kontoer. Ingen mikrofon eller API-kall. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { LokalDataEierProvider } from "@/lib/offline-queue/eier-context";
import { RecordingControls } from "@/components/admin/recording-controls";
import "@/styles/precision-live.css";
import Link from "next/link";
export const sti = "/admin/recording/coaching?okt=syntetisk";
export const natt = ["start", "gjenoppretting", "utenSamtykke"];
function Vis({ recovery = false, consent = true }: { recovery?: boolean; consent?: boolean }) {
  return <AdminRolleProvider erAdmin><LokalDataEierProvider eierId="syntetisk-coach">
    <AgencyOSSkall navn="Syntetisk coach" natt><section className="pa-side pa-coaching-recorder">
      <Link className="pa-btn pa-btn--ghost" href="/admin/agencyos/live/syntetisk">Til Live-økta</Link>
      <header><h1>Coachingopptak</h1><p>Avstandskontroll 50–90 m</p></header>
      <p>Start og stopp med korte trykk. Opptaket knyttes til valgt spiller; lydsamtykke kontrolleres før det starter.</p>
      <RecordingControls recordingId={null} recoveryRecordingId={recovery ? "syntetisk-opptak" : null}
        recoveryStartedAt={recovery ? "13.10.2026 kl. 09:00" : null} recoveryExpectedChunks={recovery ? 2 : 0}
        recoveryDurationSec={recovery ? 60 : null}
        spillere={[{ id: "syntetisk-spiller", navn: "Syntetisk spiller", lydSamtykkeGitt: consent }]}
        okt={{ sessionId: "syntetisk", playerId: "syntetisk-spiller", tittel: "Avstandskontroll 50–90 m" }}
        topbar={<span>Opptak for denne økta</span>}
        stage={<div style={{ padding: 24 }}><h2>Syntetisk spiller</h2><p>Transkript og analyse vises etter behandling. Tekst og tiltak gjennomgås før de godkjennes.</p></div>} />
    </section></AgencyOSSkall>
  </LokalDataEierProvider></AdminRolleProvider>;
}
export const tilstander = { start: <Vis />, gjenoppretting: <Vis recovery />, utenSamtykke: <Vis consent={false} /> };
