# Booking policy engine

**Fil:** `src/lib/booking/policy.ts`  
**Tester:** `src/lib/booking/policy.test.ts`

## Regler (låst)

| Handling | Spiller / foresatt | Egen coach / ADMIN |
|---|---|---|
| Avbestille | Alltid (eget) | Alltid (eget team) |
| Credit tilbake | >24t før start | Alltid |
| Stripe-refusjon | >24t + har PI | Alltid + har PI |
| Ombooke | >24t | Alltid |

`AVBESTILLING_FRIST_TIMER = 24`

## Brukt av
- `cancelBooking` / `rescheduleBooking` (portal meg/bookinger/actions)
- Policy-banner i `NyBookingWizard` (bekreft-steg)
- `policyBannerTexts()` for UI-copy

## Ikke
- Slot-hold (kommer senere)
- Auto-no-show straff
