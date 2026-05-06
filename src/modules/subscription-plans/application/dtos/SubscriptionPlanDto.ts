import { z } from 'zod';

export const CreateSubscriptionPlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceAmount: z.number().positive(),
  currency: z.string().length(3).optional(),
  intervalDays: z.number().int().positive().optional(),
  stripePriceId: z.string().optional(),
});

export const UpdateSubscriptionPlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priceAmount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  intervalDays: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  stripePriceId: z.string().optional(),
});

export type CreateSubscriptionPlanDto = z.infer<typeof CreateSubscriptionPlanSchema>;
export type UpdateSubscriptionPlanDto = z.infer<typeof UpdateSubscriptionPlanSchema>;
