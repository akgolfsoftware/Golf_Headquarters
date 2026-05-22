/**
 * Felles helpers for booking-relaterte e-postmaler.
 *
 * Vi bruker rene HTML-strenger (ikke @react-email) for å holde dependencies
 * lette. Stilen følger designsystemet (Inter, AK Golf-farger) men bruker
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
  return `<!doctype html>
<html lang="nb">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.heading)}</title>
</head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0A1F17;">
  <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">${escapeHtml(input.preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E5E3DD;">
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:0.1em;color:#5E5C57;text-transform:uppercase;">AK Golf</div>
              <h1 style="margin:8px 0 24px 0;font-size:24px;font-weight:600;line-height:1.3;color:#0A1F17;">${escapeHtml(input.heading)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px 32px;line-height:1.6;font-size:15px;color:#0A1F17;">
              ${input.body}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:#F1EEE5;border-top:1px solid #E5E3DD;font-size:12px;color:#5E5C57;line-height:1.5;">
              AK Golf Academy · Bossumveien 6, 1605 Fredrikstad<br />
              <a href="mailto:post@akgolf.no" style="color:#005840;text-decoration:none;">post@akgolf.no</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;font-size:13px;color:#5E5C57;width:140px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;font-size:15px;color:#0A1F17;font-weight:500;">${escapeHtml(value)}</td>
  </tr>`;
}

export function primaryButton(label: string, href: string): string {
  return `<a href="${escapeAttr(href)}" style="display:inline-block;padding:12px 24px;background:#005840;color:#D1F843;text-decoration:none;border-radius:9999px;font-weight:600;font-size:14px;">${escapeHtml(label)}</a>`;
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
