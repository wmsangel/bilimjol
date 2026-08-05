import { z } from "zod";

export const checkoutSchema = z.object({
  plan: z.string().optional(),
  provider: z.enum(["dev", "freedompay", "paybox"]).optional(),
});
export type CheckoutDto = z.infer<typeof checkoutSchema>;
