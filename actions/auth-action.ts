// actions/auth-action.ts
"use server";

<<<<<<< HEAD
import { signIn } from "@/../././auth"; 
import { z } from "zod";
import { LoginSchema, RegisterSchema } from "@/lib/zod"; 
=======
import { signIn } from "@/../././auth";
import { z } from "zod";
import { LoginSchema, RegisterSchema } from "../src/lib/zod";
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
import { AuthError } from "next-auth";

export const loginAction = async (values: z.infer<typeof LoginSchema>) => {
  try {
<<<<<<< HEAD
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
=======
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
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
  }
};

export const RegisterAction = async (values: z.infer<typeof RegisterSchema>) => {
<<<<<<< HEAD
  // 1. Validamos con Zod en el backend antes de enviar
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Datos inválidos" };
  }

  const { data } = validatedFields;

  try {
=======
  try {
    // 1. Validamos con Zod en el frontend por rapidez
    const { data, success } = RegisterSchema.safeParse(values);
    if (!success) return { error: "Datos inválidos" };

>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
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
<<<<<<< HEAD
    // Aquí mantenemos redirect: false para consistencia
=======
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
    await signIn("credentials", {
      cedula: data.cedula,
      password: data.password,
      redirect: false,
    });

    return { success: true };
<<<<<<< HEAD

  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Registro exitoso, pero falló el inicio de sesión automático." };
    }
    
    if ((error as any).cause?.code === "ECONNREFUSED") {
        return { error: "No se pudo conectar con el servidor de registro." };
    }

    throw error;
=======
  } catch (error) {
    console.error("Register error:", error);
    return { error: "Error 500: No se pudo conectar con el backend" };
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
  }
};