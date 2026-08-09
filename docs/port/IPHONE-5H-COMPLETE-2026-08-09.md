# iPhone 5h autonom kjøring — FULLFØRT 2026-08-09

**Branch (sandbox):** `handoff/iphone-5h-2026-08-09`  
**Fasit:** Claude Paper zip 07.08.2026 (702 filer) speilet i `designsystem/paper/`  
**Push:** sandbox 403 — bruk Mac APPLY-script

## Levert

### Backend / booking
- [x] slot-hold + tests
- [x] policy 24t + tests  
- [x] coach-colors + kalender legend
- [x] metrics (incl. book_cancel)
- [x] facility-scope helpers + multi-facility coach scope på ny booking
- [x] wizard filter + validate coach/facility
- [x] PolicyBanner på booking confirm

### Paper / frontend
- [x] Knapp + CTAPill default → T.handling
- [x] Auth, runde, workbench, admin forms, marketing primær-CTA → handling
- [x] PuttingFocusBanner på Analysere
- [x] loadPuttingSignalsForUser (SG putt + 3-putt rate)
- [x] FASIT empty honesty (drills, foreslå, øvelsesbank, caddie)

### Masterbrain
- [x] putting-signals v1 + tests
- [x] load-putting-signals server

### Docs
- [x] CLAUDE-DESIGN-PROMPT-FULL-PROSJEKT.md
- [x] IPHONE-5H-AUTONOMOUS plan + denne complete

## Ikke i denne batch (krever Anders / Design / Mac)
- Push til GitHub / Vercel deploy
- Paper pixel sign-off
- W2–W6 Claude Design tegning
- Drill FASIT-innhold (Toshiba)
- Panel P0 (Stripe/Resend/DNS)
- Pricing-lås

## Mac
```bash
cd ~/Downloads && tar -xzf iphone-5h-full.tar.gz
bash ~/Downloads/iphone-5h-full/APPLY-ON-MAC.sh
```
