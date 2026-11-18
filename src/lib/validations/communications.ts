import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  body: z.string().trim().min(1, "Message is required"),
  audience: z.enum(["public", "parents", "staff", "class"]),
  class_id: z.string().uuid().optional().or(z.literal("")),
});

export const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().or(z.literal("")),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().or(z.literal("")),
  location: z.string().trim().optional().or(z.literal("")),
});
