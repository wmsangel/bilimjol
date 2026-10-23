import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  locale: z.enum(["ru", "ky"]).optional(),
  country: z.string().length(2).optional(),
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email().max(254),
  // min(1): существующие пароли короче нового минимума должны логиниться.
  password: z.string().min(1).max(128),
});
export type LoginDto = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshDto = z.infer<typeof refreshSchema>;

// Гостевой старт: по одному email создаём беспарольный аккаунт (пароль задаётся
// позже по ссылке из письма). Нужен для оплаты без обязательной регистрации.
export const guestSchema = z.object({
  email: z.string().email().max(254),
  locale: z.enum(["ru", "ky"]).optional(),
});
export type GuestDto = z.infer<typeof guestSchema>;

// Установка пароля по токену из письма (set-password-ссылка).
export const setPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});
export type SetPasswordDto = z.infer<typeof setPasswordSchema>;
