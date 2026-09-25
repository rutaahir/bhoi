import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/jobs")({
  beforeLoad: () => {
    throw redirect({
      to: "/",
      search: { page: "jobs" },
    });
  },
  head: () => ({ meta: [{ title: "Job Portal — BHOI" }] }),
  component: () => null,
});
