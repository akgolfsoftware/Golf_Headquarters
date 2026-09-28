12px-radius modal for decisions that must be confirmed — use sparingly.

```jsx
<Dialog title="Avslutte økten?" onClose={close} footer={<><Button variant="secondary">Fortsett</Button><Button variant="signal">Avslutt</Button></>}>
  28 av 40 slag er registrert. Resten lagres som ikke gjennomført.
</Dialog>
```
