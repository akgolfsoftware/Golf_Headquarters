# Modal

Portal-modal med overlay. Tre størrelser: sm 380 / md 540 / lg 720px.

## Bruk
```jsx
<Modal
  open={open}
  title="Ny økt"
  subtitle="Legg til økt i planen"
  size="md"
  onClose={() => setOpen(false)}
  footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Avbryt</Button><Button variant="signal">Lagre</Button></>}
>
  <FormField label="Tittel"><Input placeholder="Putting-blokk" /></FormField>
</Modal>
```
