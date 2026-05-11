import Script from "next/script";

/**
 * Plausible analytics — GDPR-vennlig, cookie-fri.
 *
 * Lastes kun hvis NEXT_PUBLIC_PLAUSIBLE_DOMAIN er satt. Skriptet inkluderer
 * outbound-link + file-download tracking. Custom events kan trigges via
 * `window.plausible("event_name")`.
 */
export function PlausibleScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return (
    <>
      <Script
        defer
        data-domain={domain}
        src="https://plausible.io/js/script.outbound-links.file-downloads.js"
        strategy="afterInteractive"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
      </Script>
    </>
  );
}
