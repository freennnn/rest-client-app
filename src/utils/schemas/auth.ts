import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email({ message: 'auth.validation.emailInvalid' }),
  password: z
    .string()
    .min(8, { message: 'auth.validation.passwordMinLength' })
    .regex(/[a-zA-Zа-яА-Я]/, { message: 'auth.validation.passwordLetter' })
    .regex(/\d/, { message: 'auth.validation.passwordDigit' })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'auth.validation.passwordSpecial' }),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const signUpSchema = signInSchema.extend({
  name: z.string().min(2, { message: 'auth.validation.nameMinLength' }),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
