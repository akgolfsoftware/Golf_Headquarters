# Audit: Auth — SSO-oppsett (SAML for org)

**HTML:** `screen-deck/auth/sso-setup.html`
**URL:** `/auth/sso`
**Antall klikkbare elementer:** 9

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Domene-input | State-change | Inline | OK |
| Upload-box (metadata.xml) | Modal eller filvelger | OS-filvelger (native) | (system) |
| SSO Login-URL input | State-change | Inline | OK |
| Identity Provider select (Azure AD / Okta / Google Workspace / Custom SAML 2.0) | State-change | Inline (dropdown) | OK |
| "Test tilkobling" knapp (ghost) | State-change → toast/modal | Inline (viser test-resultat) | OK |
| "Aktiver SSO" CTA (primary) | Skjerm | `/admin/settings/security` (coachhq/settings-sikkerhet.html) | OK |
| "Kontakt support" link | Skjerm eller mailto | `/help` eller mailto:support@akgolf.no | WIREFRAME_NEEDED |
| "Trenger hjelp?" footer | Skjerm | `/help` | WIREFRAME_NEEDED |
| "Personvern" footer | Skjerm | `/personvern` | WIREFRAME_NEEDED |
| "Vilkår" footer | Skjerm | `/vilkar` | WIREFRAME_NEEDED |

> SSO-providere som identifiseres: Azure AD (Microsoft Entra), Okta, Google Workspace, Custom SAML 2.0. Disse er IdP-er for org-tier, ikke samme som login.html sine personlige SSO (BankID/Google/Apple).

## States som må designes

- Status-strip: "Ikke aktivert" (default, grå) / "Test ok" (gul) / "Aktiv" (grønn) / "Feil" (rød) — `.status-strip-active` finnes allerede i CSS
- Upload-box: idle / hover / dragover / uploading / success (filnavn vises) / error (ugyldig XML, > 2MB)
- "Test tilkobling": idle / loading / success-modal / error-modal med detaljer
- "Aktiver SSO": disabled til alle felt + metadata er gyldig
- Domene-validering: ugyldig format, allerede tatt av annen org
- IdP-select: vis hjelpetekst per IdP-type (Azure AD vs Okta har ulik metadata-struktur)
- Aktivert-state: vis "Deaktiver SSO" + "Last opp ny metadata" knapper i stedet for "Aktiver"
