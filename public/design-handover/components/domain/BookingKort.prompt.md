# BookingKort

Booking-kort med dato, tid, lokasjon og coach. Book/avbestill-handlinger.

## Bruk
```jsx
<BookingKort
  type="Kartlegging" date="3. juni" time="09:00" duration="60 min"
  location="GFGK" coach="Anders Kristiansen"
  state="available" onBook={() => bookTime(slot)}
/>
```
