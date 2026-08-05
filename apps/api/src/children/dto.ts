import { z } from "zod";

export const createChildSchema = z.object({
  name: z.string().min(1).max(40),
  avatarHelperId: z.string().min(1).max(40).default("fox"),
  grade: z.number().int().min(0).max(11).default(1),
});
export type CreateChildDto = z.infer<typeof createChildSchema>;
