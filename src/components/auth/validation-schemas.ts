import * as z from 'zod';

export const signupSchema = z.object({
  username: z
    .string()
    .min(4, 'El nombre de usuario debe tener al menos 4 caracteres')
    .max(18, 'El nombre de usuario no puede tener más de 18 caracteres')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'El nombre de usuario solo puede contener letras, números y guiones bajos'
    ),
  email: z
    .string()
    .email('Correo electrónico inválido')
    .min(5, 'Debes introducir un correo válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
    .regex(/[a-z]/, 'Debe incluir al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número'),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
