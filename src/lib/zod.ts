import { object, string } from "zod";

export const LoginSchema = object({
  cedula: string({ message: "La cedula es requerida" })
    .min(1, "La cedula es requerida")
    .min(7, "La cedula debe tener al menos 7 digitos"),

  password: string({ message: "La contraseña es requerida" })
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener más de 8 caracteres")
    .max(20, "La contraseña debe tener menos de 20 caracteres"),
});

export const RegisterSchema = object({
  email: string({ message: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  cedula: string({ message: "La cedula es requerida" })
    .min(1, "Cedula es requerida")
    .min(7, "Cedula debe tener al menos 7 digitos"),
  name: string({ message: "Name is required" })
    .min(1, "Name is required")
    .min(3, "Name must be more than 3 characters")
    .max(32, "Name must be less than 32 characters"),
  lastname: string({ message: "Lastname is required" })
    .min(1, "Lastname is required")
    .min(3, "Lastname must be more than 3 characters")
    .max(32, "Lastname must be less than 32 characters"),
  username: string({ message: "Username is required" })
    .min(1, "Username is required")
    .min(3, "Username must be more than 3 characters")
    .max(32, "Username must be less than 32 characters"),
  phone: string({ message: "Phone is required" })
    .min(1, "Phone is required")
    .min(10, "Phone must be more than 10 characters"),
  address: string({ message: "Address is required" })
    .min(1, "Address is required")
    .min(3, "Address must be more than 3 characters"),
  password: string({ message: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(20, "Password must be less than 20 characters"),
  // confirmPassword: string({ message: "Confirm Password is required" })
  //   .min(1, "Confirm Password is required")
  //   .min(8, "Confirm Password must be more than 8 characters"),
  // role: string().optional(),
});
