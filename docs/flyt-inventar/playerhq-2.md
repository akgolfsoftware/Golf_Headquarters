# Flyt-inventar — PlayerHQ del 2

Kartlegging av alle interaktive elementer (knapper, lenker, klikkbare kort, form-actions, onClick) på 38 PlayerHQ-skjermer i del 2. En knapp er DØD hvis: `href="#"`, ingen handler, tom/`// TODO` onClick, fører til KUTT-lista (`/portal/mal/*`, `/portal/analyse`, `/portal/stats`, `/portal/tren/ovelser*`), eller destinasjonsruten mangler.

> KUTT-merknad: `/portal/mal`, `/portal/mal/leaderboard`, `/portal/tren/ovelser/*` finnes fysisk som filer, men står på KUTT-lista i oppgaven og flagges derfor som DØD. `/portal/tren` finnes som mappe uten `page.tsx` (ingen rute).

## /portal/coach
| Element | Fører til | Status |
|---|---|---|
| "Meldinger" (Link) | /portal/coach/melding | OK |
| "Book sesjon" (Link) | /portal/booking | OK |
| CoachProfileCard e-post (mailto) | mailto:{coach.email} | OK |
| CoachProfileCard telefon (tel) | tel:{coach.phone} | OK |
| MessageThread send (onSend server action) | sendMessage() | OK |
| PlanChangeRequests "Ny forespørsel" toggle + type-velger + submit | createPlanChangeRequest() | OK |
| UpcomingSessions "Book" (Link, kort-action) | /portal/booking | OK |
| CoachNotes "Se alle" (Link, kort-action) | /portal/coach/notes | OK |

## /portal/coach/melding
| Element | Fører til | Status |
|---|---|---|
| "Tilbake" (Link) | /portal/coach | OK |
| "Oppgrader til Pro" (GRATIS-gate, Link) | /portal/meg/abonnement | OK |
| Historikk-rad (Link) | (rad er `<li>`, ikke lenke — kun hover) | OK (display) |
| "Se alle notater" (Link) | /portal/coach/notes | OK |
| MeldingForm (se under) | — | — |

### MeldingForm (form.tsx)
| Element | Fører til | Status |
|---|---|---|
| Rich-text toolbar-knapper (ToolbarKnapp B/I osv.) | ingen onClick | DØD: ingen handler |
| "Avbryt" | nullstiller felt (onClick) | OK |
| "Send" (submit) | server send (onSubmit) | OK |

## /portal/coach/melding/[id]
| Element | Fører til | Status |
|---|---|---|
| "Tilbake" (Link x2) | /portal/coach/melding | OK |
| Paperclip "Se alle vedlegg" (Link) | /portal/coach/melding/{id}/vedlegg | OK (rute finnes) |
| "Søk" (button, title=Søk) | ingen onClick | DØD: ingen handler |
| "Mer" (button, MoreVertical) | ingen onClick | DØD: ingen handler |
| TradUi quick-replies (setDraft) | fyller utkast | OK |
| TradUi vedlegg-knapp (Paperclip) | ingen onClick | DØD: ingen handler |
| TradUi "Send" (onClick send) | sender svar | OK |

## /portal/coach/melding/ny
| Element | Fører til | Status |
|---|---|---|
| (ny-melding-client, se under) | — | — |

### NyMeldingClient (ny-melding-client.tsx)
| Element | Fører til | Status |
|---|---|---|
| Mottaker-velger (setRecipientId) | velger coach | OK |
| Emne-forslag (setSubject) | fyller emne | OK |
| "Galleri" (button) | ingen onClick | DØD: ingen handler |
| "Velg filer" (button) | ingen onClick | DØD: ingen handler |
| Fjern vedlegg (setAttachments filter) | fjerner vedlegg | OK |
| "Avbryt" (button) | ingen onClick | DØD: ingen handler |
| "Forhåndsvis" (button) | ingen onClick | DØD: ingen handler |
| "Send melding" (onClick send) | sender melding | OK |

## /portal/coach/notes
| Element | Fører til | Status |
|---|---|---|
| "Tilbake" (Link) | /portal/coach | OK |
| "Send melding" (Link) | /portal/coach/melding | OK |
| "Be om vurdering" (Link) | /portal/coach/melding?type=vurdering | OK |
| Siste notat (Link) | /portal/coach/notes/{sesjonId} | OK |

## /portal/coach/notes/[noteId]
| Element | Fører til | Status |
|---|---|---|
| "Tilbake" (Link x2) | /portal/coach/notes | OK |
| "Send melding" (Link x2) | /portal/coach/melding | OK |

## /portal/coach/sporsmal/[id]
| Element | Fører til | Status |
|---|---|---|
| "Tilbake" (Link) | /portal/coach | OK |
| "Hjalp" (reaksjon, button) | ingen onClick (statisk aria-pressed) | DØD: ingen handler |
| "Trenger mer" (reaksjon, button) | ingen onClick | DØD: ingen handler |
| "Still oppfølging" (Link) | /portal/coach/melding/ny | OK |
| Relaterte spørsmål-kort (button x3) | ingen onClick | DØD: ingen handler |

## /portal/coach/plans
| Element | Fører til | Status |
|---|---|---|
| "Til mine økter" (empty-state Link) | /portal/tren | DØD: rute mangler (`/portal/tren` har ingen page.tsx) |
| Plan-kort (Link) | /portal/coach/plans/{plan.id} | OK |

## /portal/coach/plans/[planId]
| Element | Fører til | Status |
|---|---|---|
| Økt-tittel (Link) | /portal/tren/{s.id} | DØD: rute mangler (`/portal/tren/[id]` finnes ikke) |
| PlayerPlanActions "Godta plan" (onClick godta) | server action | OK |
| PlayerPlanActions "Foreslå endring" (onClick åpne modal) | åpner modal | OK |
| Modal "Trekk tilbake" (onClick) | server action | OK |
| Modal lukk/avbryt (onClick onLukk) | lukker modal | OK |
| Modal "Send" (onClick send) | server action | OK |

## /portal/coach/ovelser
| Element | Fører til | Status |
|---|---|---|
| "Ny øvelse" (Link x2) | /portal/coach/ovelser/ny | OK |
| Område-filter-chips (Link, bygglenke) | /portal/coach/ovelser?area=... | OK |
| Øvelse-kort (Link) | /portal/tren/ovelser/{e.id} | DØD: KUTT-rute (`/portal/tren/ovelser*`) |

## /portal/coach/ovelser/ny
| Element | Fører til | Status |
|---|---|---|
| "Tilbake" (Link) | /portal/coach/ovelser | OK |
| (skjema for ny øvelse) | server action | OK |

## /portal/coach/videoer
| Element | Fører til | Status |
|---|---|---|
| PlayerVideoCard "Spill av" (onClick spillAv) | åpner/spiller video (lokal state) | OK |

## /portal/coach/ai
| Element | Fører til | Status |
|---|---|---|
| "Oppgrader til Pro" (gate, Link) | /portal/meg/abonnement | OK |
| "Eksporter chat" (button) | laster ned Markdown | OK |
| "Ny chat" (button) | /portal/coach/ai?ny=1 | OK |
| Forslags-knapper (button x3) | fyller input | OK |
| "Send" (button) | POST /api/coach/ai-chat | OK |

## /portal/ai/foresla-drill
| Element | Fører til | Status |
|---|---|---|
| "Åpne drill" (Link) | /portal/drills/{drill.id} | OK |

## /portal/ai/foresla-turnering
| Element | Fører til | Status |
|---|---|---|
| Turnerings-kort (Link) | /portal/tren/turneringer/{tournament.id} | OK |

## /portal/ai/mal-bygger
| Element | Fører til | Status |
|---|---|---|
| "Foreslå SMART-mål" (steg 1→2) | wizard-steg | OK |
| "Tilbake" / "Se gjennom" (steg-nav) | wizard-steg | OK |
| Mål-checkbox (toggle) | velger mål | OK |
| "Lagre målene" (lagreMalForslag) | server action; revalidate /portal/mal | OK (action) |

## /portal/talent
| Element | Fører til | Status |
|---|---|---|
| "Eksporter" (button) | ingen onClick | DØD: ingen handler |
| "Sett mål" (Link) | /portal/mal | DØD: KUTT-rute (`/portal/mal`) |
| "Mitt nivå" (kort-Link) | /portal/talent/mitt-niva | OK |
| "Min plan" (kort-Link) | /portal/talent/min-plan | OK |
| "Roadmap" (kort-Link) | /portal/talent/roadmap | OK |
| "Sammenligning" (kort-Link) | /portal/talent/sammenligning | OK |
| "Leaderboard" (kort-Link) | /portal/mal/leaderboard | DØD: KUTT-rute (`/portal/mal/*`) |
| "AI-vurdering" (featured kort) | ingen href/onClick | DØD: ingen destinasjon |
| "Utvikling siste 90d" (kort-Link) | /portal/statistikk | OK |

## /portal/talent/min-plan
| Element | Fører til | Status |
|---|---|---|
| "Tilbake til talent" (Link) | /portal/talent | OK |

## /portal/talent/mitt-niva
| Element | Fører til | Status |
|---|---|---|
| (ingen interaktive elementer — radar/bar display) | — | OK |

## /portal/talent/roadmap
| Element | Fører til | Status |
|---|---|---|
| "Tilbake til talent" (Link) | /portal/talent | OK |
| "Endre plan" (Link) | /portal/planlegge | OK |
| "Se sammenligning" (Link) | /portal/talent/sammenligning | OK |

## /portal/talent/sammenligning
| Element | Fører til | Status |
|---|---|---|
| "Tilbake til talent" (Link) | /portal/talent | OK |
| AnonymiserToggle (toggleAnonymiser) | server action | OK |
| "Sammenlign" (GET-form submit) | ?q=...&spiller=... | OK |
| "Tilbakestill" (Link) | /portal/talent/sammenligning | OK |
| Periode-knapper 30d/90d/1år (Link) | ?periode=... | OK |

## /portal/meg
| Element | Fører til | Status |
|---|---|---|
| "Logg ut" (LogoutButton) | server action logout | OK |
| (meny-rader til undersider via layout/SetLinkRow) | /portal/meg/* | OK |

## /portal/meg/abonnement
| Element | Fører til | Status |
|---|---|---|
| "Prøv igjen" (status-banner) | /portal/meg/abonnement/oppgrader/flyt | OK |
| "Oppgrader til Pro" | /portal/meg/abonnement/oppgrader/flyt | OK |
| "Endre kort" | /portal/meg/abonnement/kort/ny | OK |
| "Avbestill abonnement" | /portal/meg/abonnement/avbestill | OK |
| Faktura-rader | /portal/meg/abonnement/faktura/{id} | OK |
| "Alle dokumenter" | /portal/meg/dokumenter | OK |
| "Administrer pakke" | /portal/booking | OK |

## /portal/meg/abonnement/oppgrader
| Element | Fører til | Status |
|---|---|---|
| (oppgrader-flyt-wizard, /flyt) | Stripe Checkout → /portal/meg/abonnement?ok=1 | OK |

## /portal/meg/bookinger
| Element | Fører til | Status |
|---|---|---|
| "Ny booking" / "Book ny time" | /portal/booking/ny (eller /booking) | OK |
| "Kommende" / "Historikk" (tab) | lokal state | OK |
| "Bytt tid" (Link, ≥24t før) | /portal/meg/bookinger/reschedule/{bookingId} | OK |
| "Avbestill" (cancelBooking) | server action | OK |

## /portal/meg/dokumenter
| Element | Fører til | Status |
|---|---|---|
| Dokument-rader (href, target=_blank) | ekstern d.url | OK |

## /portal/meg/helse
| Element | Fører til | Status |
|---|---|---|
| "Logg søvn / status" (toggle) | åpner HelseForm | OK |
| HelseForm submit (lagreHelseEntry) | server action | OK |
| "Lukk" | lukker form | OK |

## /portal/meg/innstillinger
| Element | Fører til | Status |
|---|---|---|
| Varsel-toggles (push/e-post/coach/innsikt) | oppdaterPreferences | OK |
| "Koble til" (Garmin/Apple) | /portal/meg/innstillinger/integrasjoner | OK |
| "Endre" (passord) | /auth/forgot-password | OK |
| "Åpne" (personvern/last ned data) | /portal/meg/innstillinger/personvern | OK |

## /portal/meg/profil
| Element | Fører til | Status |
|---|---|---|
| ProfilRedigerForm submit (oppdaterProfil) | server action | OK |
| (rediger) "Bytt bilde" (uploadAvatar) | server action | OK |
| (rediger) "Lagre"/"Avbryt" | router.push /portal/meg | OK |

## /portal/meg/sikkerhet
| Element | Fører til | Status |
|---|---|---|
| "Tilbake" | /portal/meg | OK |
| "Konfigurer 2FA" (Link) | /portal/meg/sikkerhet/2fa | OK |
| (2fa) setupTwoFa submit | server action | OK |

## /portal/meg/utstyrsbag
| Element | Fører til | Status |
|---|---|---|
| UtstyrsbagView submit (lagreUtstyrsbag) | server action | OK |

## /portal/meg/help
| Element | Fører til | Status |
|---|---|---|
| "Åpne" (Chat med support) | /portal/meg/help/kontakt | OK |
| "support@akgolf.no" (mailto) | mailto | OK |
| "Veiledninger" (Link) | /portal/meg/help/kategori/komme-i-gang | OK (dynamisk [slug]) |
| "Send forslag eller meld feil" | /portal/meg/feedback | OK |
| FAQ-accordion | lokal toggle | OK |

## /portal/utfordringer
| Element | Fører til | Status |
|---|---|---|
| "Ny utfordring" (header + empty, Link) | /portal/utfordringer/ny | OK |
| Utfordring-kort (Link) | /portal/utfordringer/{id} | OK |

## /portal/utfordringer/ny
| Element | Fører til | Status |
|---|---|---|
| "Tilbake til utfordringer" (Link) | /portal/utfordringer | OK |
| "Videre"/"Tilbake" (wizard-steg 1–6) | wizard-state | OK |
| "Opprett utfordring" (opprettCustomChallenge) | server action → /portal/utfordringer/{id} | OK |

## /portal/varsler
| Element | Fører til | Status |
|---|---|---|
| "Marker alle lest" (markNotificationsRead) | server action | OK |
| Varsel-rad m/ link | notification.link (dynamisk) | OK |
| Varsel-rad uten link | ingen handling (display) | OK |

## /portal/reach
| Element | Fører til | Status |
|---|---|---|
| "Personvern" (Link) | /portal/meg/innstillinger | OK |
| "Godta" / "Avslå" (invitasjon) | lokal state (ingen server-persist) | OK (lokal) |
| Privat/Coach/Offentlig (privacy-toggle) | lokal state | OK (lokal) |

## /portal/(fullscreen)/live/[sessionId]/brief
| Element | Fører til | Status |
|---|---|---|
| "Tilbake" (←) / "Lukk" (X) | /portal/planlegge | OK |
| "Start økt" (footer) | /portal/live/{sessionId}/active | OK |

## /portal/(fullscreen)/live/[sessionId]/active
| Element | Fører til | Status |
|---|---|---|
| "Lukk" (X) | /portal/planlegge | OK |
| "Pause/Fortsett" (toggle) | lokal state | OK |
| "+5/+10/+25" (rep-knapper) | lokal state | OK |
| "1 rep angre" (undo) | lokal state | OK |
| "Video" (logg-knapp) | tom onClick | DØD: tom onClick |
| "Foto" (logg-knapp) | tom onClick | DØD: tom onClick |
| "Notat" (logg-knapp) | tom onClick | DØD: tom onClick |
| "Avslutt økt" (completeDrill+completeSession) | server action → /portal/live/{sessionId}/summary | OK |

## /portal/(fullscreen)/live/[sessionId]/summary
| Element | Fører til | Status |
|---|---|---|
| "Lukk" (X) | /portal/planlegge | OK |
| "Gå til treningsplanen" (footer) | /portal/planlegge | OK |

## Oppsummering del 2: 38 skjermer, 19 døde knapper.

Døde knapper (gruppert):

**Manglende/KUTT-destinasjon (mest alvorlig — feilfører brukeren):**
1. `/portal/coach/ovelser` — øvelse-kort → `/portal/tren/ovelser/{id}` (KUTT-rute). Hele drill-biblioteket til coachen er ufullstendig.
2. `/portal/coach/plans/[planId]` — økt-tittel → `/portal/tren/{id}` (rute finnes ikke).
3. `/portal/coach/plans` — "Til mine økter" (empty-state) → `/portal/tren` (mappe uten page.tsx).
4. `/portal/talent` — "Sett mål" → `/portal/mal` (KUTT) og "Leaderboard" → `/portal/mal/leaderboard` (KUTT).

**Ingen handler / tom onClick:**
5. `/portal/talent` — "Eksporter" (ingen handler) + "AI-vurdering"-kort (ingen href).
6. `/portal/(fullscreen)/live/[sessionId]/active` — "Video", "Foto", "Notat" logg-knapper (tom onClick) — sentralt i live-flyten.
7. `/portal/coach/sporsmal/[id]` — "Hjalp", "Trenger mer", 3× relaterte-spørsmål-kort (ingen handler).
8. `/portal/coach/melding/ny` — "Galleri", "Velg filer", "Avbryt", "Forhåndsvis" (ingen handler).
9. `/portal/coach/melding/[id]` — "Søk", "Mer" + TradUi vedlegg-knapp (ingen handler).
10. `/portal/coach/melding` (form.tsx) — rich-text toolbar-knapper (ingen handler).
