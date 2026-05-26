import { Request, Response, NextFunction } from 'express';
import { AddMemberSchema, CreateGroupExpenseSchema, CreateGroupSchema, UpdateGroupExpenseSchema, UpdateGroupSchema } from '../../application/dtos/GroupDto';

const makeValidator = (schema: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { flatten: () => { fieldErrors: unknown } } } }) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) { res.status(422).json({ success: false, fieldErrors: result.error!.flatten().fieldErrors }); return; }
    req.body = result.data; next();
  };

export const validateCreateGroup = makeValidator(CreateGroupSchema);
export const validateUpdateGroup = makeValidator(UpdateGroupSchema);
export const validateAddMember = makeValidator(AddMemberSchema);
export const validateCreateGroupExpense = makeValidator(CreateGroupExpenseSchema);
export const validateUpdateGroupExpense = makeValidator(UpdateGroupExpenseSchema);
