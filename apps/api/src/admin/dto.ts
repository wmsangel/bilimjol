import { z } from "zod";

export const grantPremiumSchema = z.object({
  days: z.number().int().min(1).max(365).optional(),
});
export type GrantPremiumDto = z.infer<typeof grantPremiumSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(6).optional(),
});
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
