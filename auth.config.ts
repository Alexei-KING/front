<<<<<<< HEAD
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/lib/zod";

// Definimos la duración: 30 días en segundos (30 * 24h * 60m * 60s)
const ONE_MONTH = 30 * 24 * 60 * 60; 

export default {
  // Configuración de confianza
  trustHost: true,

  // Configuración de Sesión (Importante para que el token interno dure lo mismo)
  session: {
    strategy: "jwt",
    maxAge: ONE_MONTH, 
  },

  // Configuración de Cookies
  cookies: {
    sessionToken: {
      name: `authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, 
        maxAge: ONE_MONTH, // <--- ESTO LO HACE PERMANENTE
      },
    },
    callbackUrl: {
      name: `authjs.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: false,
        maxAge: ONE_MONTH, // <--- ESTO LO HACE PERMANENTE
      },
    },
    csrfToken: {
      name: `authjs.csrf-token`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: false,
        maxAge: ONE_MONTH, // <--- ESTO LO HACE PERMANENTE
      },
    },
  },
  
=======
// auth.config.ts
import { LoginSchema } from "@/lib/zod";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export default {
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
  providers: [
    Credentials({
      authorize: async (credentials) => {
        console.log("--- INTENTO DE LOGIN ---");
        
<<<<<<< HEAD
        const { data, success } = LoginSchema.safeParse(credentials);
        if (!success) return null;

        try {
=======
        // 1. Validamos los datos con Zod
        const { data, success } = LoginSchema.safeParse(credentials);
        if (!success) {
          console.log("❌ Error en Zod: Los datos no tienen el formato correcto");
          return null;
        }

        try {
          console.log("📡 Llamando a NestJS en el puerto 4000...");
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
          const res = await fetch("http://localhost:4000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cedula: data.cedula,
              password: data.password,
            }),
          });

          const user = await res.json();

          if (res.ok && user) {
<<<<<<< HEAD
            return {
              ...user,
              id: user.id?.toString() || user.cedula?.toString() || "user_id",
              accessToken: user.token || user.accessToken, 
              role: user.role,
            };
          } else {
            return null;
          }
        } catch (error) {
=======
            console.log("✅ NestJS aceptó las credenciales!");
            return user; // Aquí devolvemos el objeto que tiene el TOKEN
          } else {
            console.log("❌ NestJS rechazó el login:", user.message || "Error desconocido");
            return null;
          }
        } catch (error) {
          console.log("🔥 ERROR CRÍTICO de conexión con el Backend:", error);
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;