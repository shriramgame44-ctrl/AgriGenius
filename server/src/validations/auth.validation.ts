import { z } from "zod";

export const RegisterUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  farmName: z.string().optional().default(""),
  locationRegion: z.string().optional().default(""),
  preferredUnits: z.enum(["METRIC", "IMPERIAL"]).default("METRIC"),
});

export const LoginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  farmName: z.string().optional(),
  locationRegion: z.string().optional(),
  preferredUnits: z.enum(["METRIC", "IMPERIAL"]).optional(),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
