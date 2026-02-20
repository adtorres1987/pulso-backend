import { z } from 'zod';

const frequencyEnum = z.enum(['daily', 'weekly']);

export const CreateHabitSchema = z.object({
  name: z.string().min(1),
  frequency: frequencyEnum,
});

export const UpdateHabitSchema = z.object({
  name: z.string().min(1).optional(),
  frequency: frequencyEnum.optional(),
  active: z.boolean().optional(),
});

export const LogHabitSchema = z.object({
  completed: z.boolean(),
  date: z.string().date().optional().transform((v) => (v ? new Date(v) : (() => {
    const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d;
  })())),
});

export type CreateHabitDto = z.infer<typeof CreateHabitSchema>;
export type UpdateHabitDto = z.infer<typeof UpdateHabitSchema>;
export type LogHabitDto = z.infer<typeof LogHabitSchema>;
