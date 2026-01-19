import { z } from "zod"

// Schema para login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Por favor ingresa un email válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type LoginInput = z.infer<typeof loginSchema>

// Schema para registro
export const registerSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  apellido: z
    .string()
    .min(1, "El apellido es requerido")
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres"),
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Por favor ingresa un email válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres"),
})

export type RegisterInput = z.infer<typeof registerSchema>

// Schema para crear/editar artículo
export const articleSchema = z.object({
  titulo: z
    .string()
    .min(1, "El título es requerido")
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(200, "El título no puede exceder 200 caracteres"),
  contenido: z
    .string()
    .min(1, "El contenido es requerido")
    .min(20, "El contenido debe tener al menos 20 caracteres"),
  resumen: z
    .string()
    .min(1, "El resumen es requerido")
    .min(10, "El resumen debe tener al menos 10 caracteres")
    .max(300, "El resumen no puede exceder 300 caracteres"),
  categoria: z
    .enum([
      "politica",
      "economia",
      "deportes",
      "cultura",
      "mundo",
      "cordoba",
      "monteria",
      "opinion",
      "tecnologia",
      "salud",
      "entretenimiento",
      "tendencias",
    ])
    .default("politica"),
  imagenUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\/.+\..+/.test(val),
      "Por favor ingresa una URL válida"
    ),
})

export type ArticleInput = z.infer<typeof articleSchema>

// Schema para contacto
export const contactSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Por favor ingresa un email válido"),
  asunto: z
    .string()
    .min(1, "El asunto es requerido")
    .min(5, "El asunto debe tener al menos 5 caracteres")
    .max(100, "El asunto no puede exceder 100 caracteres"),
  mensaje: z
    .string()
    .min(1, "El mensaje es requerido")
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(1000, "El mensaje no puede exceder 1000 caracteres"),
})

export type ContactInput = z.infer<typeof contactSchema>
