import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const RejestracejaSchema = z
  .object({
    email: z.string().email().max(255),
    password: z
      .string()
      .min(8, 'Min. 8 znaków')
      .max(128)
      .regex(/[A-Z]/, 'Wymagana wielka litera')
      .regex(/[0-9]/, 'Wymagana cyfra'),
    passwordConfirm: z.string(),
    imie: z.string().min(2).max(100),
    nazwisko: z.string().min(2).max(100),
    telefon: z
      .string()
      .regex(/^\+?[0-9\s\-()]{9,15}$/, 'Nieprawidłowy numer telefonu')
      .optional()
      .or(z.literal('')),
    firma: z.string().max(200).optional().or(z.literal('')),
    nip: z.string().max(20).optional().or(z.literal('')),
    rodo: z.literal(true, { errorMap: () => ({ message: 'Wymagana zgoda RODO' }) }),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Hasła nie są zgodne',
    path: ['passwordConfirm'],
  });

export type RejestracejaInput = z.infer<typeof RejestracejaSchema>;
