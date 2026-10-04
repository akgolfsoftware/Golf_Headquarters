"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div><p role="alert">Delingen kunne ikke hentes.</p><button type="button" onClick={reset}>Prøv igjen</button></div>; }
