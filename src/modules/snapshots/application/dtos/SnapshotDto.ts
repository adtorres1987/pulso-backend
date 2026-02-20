import { z } from 'zod';

const moodEnum = z.enum(['calm', 'stressed', 'confident', 'neutral']);

export const CreateSnapshotSchema = z.object({
  mood: moodEnum.optional(),
  reflection: z.string().min(1).optional(),
  consciousScore: z.number().int().min(1).max(10).optional(),
});

export const UpdateSnapshotSchema = z.object({
  mood: moodEnum.optional(),
  reflection: z.string().min(1).optional(),
  consciousScore: z.number().int().min(1).max(10).optional(),
});

export type CreateSnapshotDto = z.infer<typeof CreateSnapshotSchema>;
export type UpdateSnapshotDto = z.infer<typeof UpdateSnapshotSchema>;
