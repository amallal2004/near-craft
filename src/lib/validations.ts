import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const onboardingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().optional(),
  role: z.enum(["customer", "worker"]),
  location_text: z.string().optional(),
  // Worker-specific fields
  experience_desc: z.string().optional(),
  hourly_rate_min: z.number().positive().optional(),
  hourly_rate_max: z.number().positive().optional(),
  service_radius: z.number().min(1).max(100).optional(),
  skill_ids: z.array(z.string()).optional(),
});

export const createJobSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().min(20, "Description must be at least 20 characters"),
  category_id: z.string().uuid("Select a category"),
  location_text: z.string().trim().min(1, "Location is required"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  budget_type: z.enum(["fixed", "hourly"]),
  budget_amount: z.number().positive("Budget must be positive").max(999999),
  urgency: z.enum(["low", "medium", "urgent"]),
});

export const applicationSchema = z.object({
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
  offer_price: z.number().positive("Offer must be positive").max(999999),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().trim().min(10, "Review must be at least 10 characters"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  location_text: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
