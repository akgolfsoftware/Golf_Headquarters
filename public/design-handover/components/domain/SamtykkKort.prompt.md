# SamtykkKort

Foreldresamtykke-kort med godkjenn/avvis. BankID-flyt bruker dette.

## Bruk
```jsx
<SamtykkKort
  playerName="Øyvind Rohjan"
  type="Deltakelse i turneringsreise"
  description="Samtykke til at Øyvind deltar i NM 14.–16. august."
  status="pending"
  onApprove={() => approve(id)}
  onReject={() => reject(id)}
/>
```
