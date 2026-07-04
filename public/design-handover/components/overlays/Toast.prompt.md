# Toast / ToastProvider

Legg ToastProvider rundt appen; kall toast() hvor som helst.

## Oppsett
```jsx
// App-rot
<ToastProvider><App /></ToastProvider>

// Hvor som helst
import { toast } from "./Toast.jsx";
toast({ title: "Økt lagret", tone: "success" });
toast({ title: "Feil", description: "Prøv igjen", tone: "error", duration: 0 });
```
