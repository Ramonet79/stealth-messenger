
import * as z from "zod";

// Esquema de validación para el registro
export const signupSchema = z.object({
  username: z.string()
    .min(8, "El nombre de usuario debe tener al menos 8 caracteres")
    .max(18, "El nombre de usuario no puede tener más de 18 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo se permiten letras, números y guiones bajos"),
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe incluir al menos una letra minúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número"),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
