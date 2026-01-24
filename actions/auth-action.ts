// actions/auth-action.ts
"use server";

import { signIn } from "@/../././auth"; 
import { z } from "zod";
import { LoginSchema, RegisterSchema } from "@/lib/zod"; 
import { AuthError } from "next-auth";

export const loginAction = async (values: z.infer<typeof LoginSchema>) => {
  try {
    // CAMBIO CRÍTICO: Usamos redirect: false para evitar el error de redirección del servidor
    // y permitir que el cliente maneje la navegación después de guardar la cookie.
    await signIn("credentials", {
      cedula: values.cedula,
      password: values.password,
      redirect: false, 
    });
    
    // Devolvemos éxito explícito
    return { success: true };

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales inválidas" };
        default:
          return { error: "Error de autenticación. Inténtalo de nuevo." };
      }
    }
    // Si no es un error de Auth, retornamos un error genérico
    return { error: "Error de conexión" };
  }
};

export const RegisterAction = async (values: z.infer<typeof RegisterSchema>) => {
  // 1. Validamos con Zod en el backend antes de enviar
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Datos inválidos" };
  }

  const { data } = validatedFields;

  try {
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
    // Aquí mantenemos redirect: false para consistencia
    await signIn("credentials", {
      cedula: data.cedula,
      password: data.password,
      redirect: false,
    });

    return { success: true };

  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Registro exitoso, pero falló el inicio de sesión automático." };
    }
    
    if ((error as any).cause?.code === "ECONNREFUSED") {
        return { error: "No se pudo conectar con el servidor de registro." };
    }

    throw error;
  }
};