# Booking slot-hold (B.3)

**Status:** implementert 2026-08-09  
**Kode:** `src/lib/booking/slot-hold.ts`

## Hva
Soft eksklusiv hold (default **3 min**, klampet 2–5 min) mens Stripe Checkout er åpen.

## Flyt
1. `acquireHold(service, coach, start, holderId)` før PENDING-booking
2. `isSlotStillAvailable(..., holderId)` respekterer andres hold
3. `releaseHold` ved confirm/cancel (TTL rydder ellers)
4. Metrics: `book_hold_blocked`, `book_checkout_start`, …

## Storage
- Upstash Redis `SET NX PX` når env finnes
- In-memory Map i dev / Redis-fail (best-effort)
- Hard race: fortsatt `sjekkKollisjon` + PENDING-booking

## UI-melding (nb)
> «Noen andre holder på denne tiden akkurat nå. Vent litt eller velg en annen tid.»
