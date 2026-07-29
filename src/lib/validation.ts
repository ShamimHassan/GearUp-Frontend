import { z } from "zod";
import { UserRole, PaymentMethod } from "@/types";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Full name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .regex(/^[A-Za-zÀ-ÿ\s.'-]+$/, "Name can only contain letters, spaces, periods, apostrophes, and hyphens"),
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be at most 255 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z
    .string({ required_error: "Please confirm your password" })
    .min(1, "Please confirm your password"),
  role: z.enum([UserRole.CUSTOMER, UserRole.PROVIDER], {
    required_error: "Please select an account type",
  }),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^(\+880|0)1[3-9]\d{8}$/.test(v.replace(/[\s\-]/g, "")),
      "Enter a valid Bangladeshi number, e.g. +8801774500810 or 01774500810"
    ),
  address: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || v.length <= 500,
      "Address must be at most 500 characters"
    ),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterSchemaInput = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  email: z.string().email("Please enter a valid email").optional(),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^(\+880|0)1[3-9]\d{8}$/.test(v.replace(/[\s\-]/g, "")),
      "Enter a valid Bangladeshi number, e.g. +8801774500810 or 01774500810"
    ),
  address: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || v.length <= 500,
      "Address must be at most 500 characters"
    ),
});

export type ProfileSchemaInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string({ required_error: "Current password is required" })
      .min(1, "Current password is required"),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z
      .string({ required_error: "Please confirm your new password" })
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from the old one",
    path: ["newPassword"],
  });

export type ChangePasswordSchemaInput = z.infer<typeof changePasswordSchema>;

export const gearItemSchema = z.object({
  name: z
    .string({ required_error: "Gear name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be at most 200 characters"),
  description: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || v.length <= 5000,
      "Description must be at most 5000 characters"
    ),
  brand: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || v.length <= 100,
      "Brand must be at most 100 characters"
    ),
  categoryId: z
    .string({ required_error: "Category is required" })
    .min(1, "Please select a category"),
  price: z.coerce
    .number({ required_error: "Rental price is required" })
    .min(0, "Price cannot be negative")
    .max(100000, "Price is too high"),
  stock: z.coerce
    .number({ required_error: "Stock quantity is required" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(10000, "Stock is too high"),
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .min(1, "At least one image URL is required")
    .max(5, "Maximum 5 images allowed"),
  isAvailable: z.boolean().optional().default(true),
});

export type GearItemSchemaInput = z.infer<typeof gearItemSchema>;

export const rentalOrderSchema = z.object({
  startDate: z
    .string({ required_error: "Start date is required" })
    .min(1, "Start date is required"),
  endDate: z
    .string({ required_error: "End date is required" })
    .min(1, "End date is required"),
  gearId: z
    .string({ required_error: "Gear is required" })
    .min(1, "Gear is required"),
});

export type RentalOrderSchemaInput = z.infer<typeof rentalOrderSchema>;

export const reviewSchema = z.object({
  rating: z.coerce
    .number({ required_error: "Rating is required" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating must be at most 5 stars"),
  comment: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || v.length <= 1000,
      "Comment must be at most 1000 characters"
    ),
  gearId: z
    .string({ required_error: "Gear ID is required" })
    .min(1, "Gear ID is required"),
});

export type ReviewSchemaInput = z.infer<typeof reviewSchema>;

export const createPaymentSchema = z.object({
  rentalOrderId: z
    .string({ required_error: "Order is required" })
    .min(1, "Order is required"),
  method: z.enum([PaymentMethod.SSLCOMMERZ, PaymentMethod.STRIPE], {
    required_error: "Please select a payment method",
  }),
});

export type CreatePaymentSchemaInput = z.infer<typeof createPaymentSchema>;

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({ required_error: "Status is required" }),
});

export type UpdateUserStatusSchemaInput = z.infer<typeof updateUserStatusSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PLACED",
    "CONFIRMED",
    "PAID",
    "PICKED_UP",
    "RETURNED",
    "CANCELLED",
  ]),
});

export type UpdateOrderStatusSchemaInput = z.infer<typeof updateOrderStatusSchema>;

export function passwordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
} {
  if (!password) {
    return { score: 0, label: "Enter a password", color: "bg-slate-200" };
  }
  let raw = 0;
  if (password.length >= 6) raw++;
  if (password.length >= 10) raw++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) raw++;
  if (/[0-9]/.test(password)) raw++;
  if (/[^A-Za-z0-9]/.test(password)) raw++;

  const score = Math.min(Math.max(raw, 0), 4);

  if (score === 0) return { score: 0, label: "Very weak", color: "bg-red-500" };
  if (score === 1) return { score: 1, label: "Weak", color: "bg-orange-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-emerald-500" };
  return { score: 4, label: "Strong", color: "bg-emerald-600" };
}
