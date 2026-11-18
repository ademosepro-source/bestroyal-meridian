import { z } from "zod";

export const sessionSchema = z.object({
  name: z.string().trim().min(1, "Session name is required (e.g. 2026/2027)"),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
});

export const termSchema = z.object({
  session_id: z.string().uuid("Select a session"),
  name: z.string().trim().min(1),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
});
