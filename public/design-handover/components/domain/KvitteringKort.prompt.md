# KvitteringKort

Betalingskvittering: linjer + sum + betalt-stempel + kvitteringsnr/dato. Dekker de fire betalingstilstandene (betalt/venter/feilet/refundert) med ikon + ord.

## Bruk
```jsx
<KvitteringKort tittel="Pro-abonnement juni" status="betalt"
  linjer={[{ tekst: "PRO 1 mnd", belop: "299" }]} valuta="kr"
  dato="12. jun 2026" kvitteringsnr="AK-2026-0412" />
```

## Domenefasit
Betalingstilstand via ikon + ord (farge aldri eneste bærer). Beløp i mono, tusenseparator mellomrom, «kr». Priser: 299 kr/mnd · 2690 kr/år (aldri ELITE). Komplementær til `FakturaRad` (fakturalinje i liste) og `BookingKort`.
