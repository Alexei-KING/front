// actions/auth-action.ts
"use server";

import { signIn } from "@/../././auth";
import { z } from "zod";
import { LoginSchema, RegisterSchema } from "../src/lib/zod";
import { AuthError } from "next-auth";

export const loginAction = async (values: z.infer<typeof LoginSchema>) => {
  try {
    const result = await signIn("credentials", {
      cedula: values.cedula,
      password: values.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      // El error viene de lo que configuramos en el authorize de auth.ts
      return { error: "Credenciales incorrectas" };
    }
    return { error: "Error de conexión con el servidor" };
  }
};

export const RegisterAction = async (values: z.infer<typeof RegisterSchema>) => {
  try {
    // 1. Validamos con Zod en el frontend por rapidez
    const { data, success } = RegisterSchema.safeParse(values);
    if (!success) return { error: "Datos inválidos" };

    // 2. LLAMADA A TU BACKEND NESTJS
    const response = await fetch("http://localhost:4000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.message || "Error al registrar usuario" };
    }

    // 3. Si el registro fue exitoso, iniciamos sesión automáticamente
    await signIn("credentials", {
      cedula: data.cedula,
      password: data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Register error:", error);
    return { error: "Error 500: No se pudo conectar con el backend" };
  }
};