import { EPOST_LYS, epostSkall } from "../precision-epost";

/**
 * Felles helpers for booking-relaterte e-postmaler.
 *
 * Vi bruker rene HTML-strenger (ikke @react-email) for å holde dependencies
 * lette. Stilen følger den aktive Precision-rammen, men bruker
 * inline styles fordi e-postklienter ikke støtter ekstern CSS.
 */

export function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPris(priceOre: number): string {
  return `${(priceOre / 100).toLocaleString("nb-NO")} kr`;
}

export type EmailLayoutInput = {
  preheader: string;
  heading: string;
  body: string; // pre-rendered HTML
};

export function emailLayout(input: EmailLayoutInput): string {
  return epostSkall({ pre: input.preheader, title: input.heading, body: input.body });
}

export function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;font-size:14px;color:${EPOST_LYS.muted};width:140px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;font-size:16px;color:${EPOST_LYS.text};font-weight:500;">${escapeHtml(value)}</td>
  </tr>`;
}

export function primaryButton(label: string, href: string): string {
  return `<a href="${escapeAttr(href)}" style="display:inline-block;min-height:20px;padding:16px 24px;background:${EPOST_LYS.btn};color:${EPOST_LYS.btnText};text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;line-height:1.25;">${escapeHtml(label)}</a>`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
