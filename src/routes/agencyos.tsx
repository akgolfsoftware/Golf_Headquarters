import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/agencyos")({
  beforeLoad: () => {
    throw redirect({
      to: "/admin",
      search: { skjerm: "hjem", rolle: "COACH", tilstand: "normal" },
    });
  },
});
