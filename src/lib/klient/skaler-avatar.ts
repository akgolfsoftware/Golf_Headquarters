/**
 * Klient-side nedskalering av profilbilde før opplasting.
 *
 * Hvorfor: uploadAvatar er en server action, og Next avviser request-bodies
 * over grensen FØR action-koden kjører (generisk «unexpected response»-feil
 * hos brukeren — sett i prod 19. juli med iPhone-bilder på 2–8 MB). Avatarer
 * vises maks ~96 px, så vi skalerer til 640 px lengste kant og re-enkoder til
 * JPEG — typisk 50–300 KB. Re-enkodingen normaliserer samtidig formatet fra
 * kamerabiblioteket. Feiler noe her (eksotisk format, gammel nettleser),
 * returneres originalfila — serveren validerer uansett størrelse og type.
 */

const MAKS_KANT = 640;
const JPEG_KVALITET = 0.85;

export async function skalerAvatar(fil: File): Promise<File> {
  try {
    const url = URL.createObjectURL(fil);
    try {
      const img = await lastBilde(url);
      const skala = Math.min(1, MAKS_KANT / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * skala));
      const h = Math.max(1, Math.round(img.naturalHeight * skala));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return fil;
      ctx.drawImage(img, 0, 0, w, h);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", JPEG_KVALITET),
      );
      if (!blob) return fil;

      const navn = fil.name.replace(/\.[^.]+$/, "") || "avatar";
      return new File([blob], `${navn}.jpg`, { type: "image/jpeg" });
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return fil;
  }
}

function lastBilde(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Kunne ikke lese bildet."));
    img.src = url;
  });
}
