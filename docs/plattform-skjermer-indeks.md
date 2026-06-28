# AK Golf-plattformen — alle skjermer på ett blikk

> **Dato:** 2026-06-29 · Indeks over de to komplette skjerm-docene (desktop + mobil).
> Full 6-hake-status: `MASTER-SKJERMPLAN.md`.

## Totaltall (~422 ruter)

| Flate | Sider | Profil | Mobil | Desktop | iPad |
|---|--:|---|:--:|:--:|:--:|
| **PlayerHQ** (spiller, `/portal`) | 153 | Mobil-først | Kjerne ✓ | Kjerne ✓ | Kjerne ✓ |
| **AgencyOS** (coach, `/admin`) | 146 | Desktop-først | ✗ stort sett | ✓ | – |
| **akgolf.no / Marketing + stats** | 72 | Offentlig responsiv | R | R | – |
| **Forelder** (`/forelder`) | 11 | Bygget begge | ✓ | ✓ | – |
| **Auth** (`/auth`) | 11 | Komplett | ✓ | ✓ | ✓ |
| **System / interne** | ~29 | Utviklerverktøy | – | – | – |

✓ = designet · R = responsiv (fungerer, ikke v10-pusset) · – = mangler/ikke verifisert

## De to komplette docene
1. **`playerhq-agencyos-skjermer-desktop-mobil`** — PlayerHQ (153) + AgencyOS (146), hver skjerm m/ Mobil/Desktop/iPad.
2. **`marketing-booking-forelder-auth-skjermer-desktop-mobil`** — akgolf.no/stats (72) + Forelder (11) + Auth (11) + Booking + System.

## De tre største gapene (prioritert)

1. **AgencyOS mobil mangler nesten overalt.** Coachens kontrolltårn er bygget desktop-først; egen
   mobil-utgave er ikke laget (unntak: Workbench-i-spiller). → **Egen mobil-designrunde for AgencyOS.**
2. **PlayerHQ-undersider udesignet.** Kjernen er solid, men mål-, teknisk-plan-, SG-Hub-under-,
   hele coach-seksjonen, talent- og booking-undersider mangler design. → **Fullfør PlayerHQ-undersidene.**
3. **akgolf.no/stats er funksjonell, men ikke verdensklasse.** 45 stats-sider er responsive med ekte
   data, men kun forsiden er v10-designet. → **Løft stats-funnelen** (master-prompt klar:
   `akgolf-stats-claude-design-prompt.md`).

> Bonus-gap: **iPad** er bare verifisert på PlayerHQ-kjernen + Auth — gjenstår på resten.
> Opprydding: dublett-adresser i AgencyOS (`/admin/calendar` vs `/admin/kalender` m.fl.).
