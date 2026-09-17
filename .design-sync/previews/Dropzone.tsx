import { Dropzone } from "akgolf-hq-komponenter";

/**
 * Kontrollert: eieren holder `file` og validerer i `onFile`. «Fil valgt» vises med et fil-lignende
 * objekt — navn, størrelse og type er alt komponenten leser, og en ekte fil finnes ikke i en statisk celle.
 */
const boks = { maxWidth: 440 };
const svingvideo = { name: "sving-driver-2026-09-14.mp4", size: 38.4 * 1024 * 1024, type: "video/mp4" } as unknown as File;
const trackmanCsv = { name: "trackman-wedge-2026-09-15.csv", size: 0.4 * 1024 * 1024, type: "text/csv" } as unknown as File;

/** Tom: svingvideo til Videoer i AgencyOS. */
export function Tom() {
  return (
    <div style={boks}>
      <Dropzone
        file={null}
        onFile={() => {}}
        accept="video/mp4,video/webm"
        idleTittel="Slipp svingvideoen her"
        idleSub="MP4 eller WebM · maks 200 MB"
      />
    </div>
  );
}

/** Fil valgt: navn, størrelse i MB og format, med «Fjern». */
export function FilValgt() {
  return (
    <div style={boks}>
      <Dropzone file={svingvideo} onFile={() => {}} accept="video/mp4,video/webm" valgtIkon="video" />
    </div>
  );
}

/** TrackMan-eksport: eget ikon og egen tekst i tomtilstanden. */
export function TrackManEksport() {
  return (
    <div style={boks}>
      <Dropzone
        file={null}
        onFile={() => {}}
        accept=".csv,text/csv"
        idleIkon="radar"
        idleTittel="Slipp TrackMan-eksporten her"
        idleSub="CSV fra TrackMan Performance Studio"
      />
    </div>
  );
}

/** TrackMan-fil valgt: liten fil, format fra filtypen. */
export function TrackManValgt() {
  return (
    <div style={boks}>
      <Dropzone file={trackmanCsv} onFile={() => {}} accept=".csv,text/csv" idleIkon="radar" valgtIkon="file-text" />
    </div>
  );
}
