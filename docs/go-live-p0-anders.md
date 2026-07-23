# P0 før ekte brukere (deg) — 2026-07-23

Disse kan ikke kodes ferdig for deg. Uten dem er appen «klar» men folk kommer ikke inn.

## 1. DKIM (e-post i innboks)
1. Resend → Domains → `send.akgolf.no` (eller `akgolf.no`)
2. Legg inn DKIM-CNAME hos Domeneshop
3. Trykk Verify i Resend
4. Test: signup eller «glemt passord» → e-post i innboks, ikke spam

## 2. Aktiver spillere
1. Når DKIM er OK: send velkomst / aktiveringslenke til spillere
2. Mål: minst **3** har logget inn (sjekk i admin eller be AI sjekke DB)

## 3. Stripe
- Live-nøkler **kun** i Vercel Production
- Test-nøkler lokalt

## 4. Domene (når du er klar)
- `akgolf.no` → Vercel (nå kan Acuity fortsatt eie apex)

## 5. 30-sekunders meny-test (N4)
Les høyt:
> «Hjem er hva som haster. Stall er spillerne — trykk navn, da er jeg i uka deres. Kalender er all tid. Kø er ting jeg må si ja/nei til. Innsikt er tall. Resten er under Mer.»

## Etter dette
Si **deploy** / **launch** hvis du vil ha ny prod-deploy av kode-PR, eller be om status.
