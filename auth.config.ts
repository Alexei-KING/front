// auth.config.ts
import { LoginSchema } from "@/lib/zod";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
    Credentials({
      authorize: async (credentials) => {
        console.log("--- INTENTO DE LOGIN ---");
        
        // 1. Validamos los datos con Zod
        const { data, success } = LoginSchema.safeParse(credentials);
        if (!success) {
          console.log("❌ Error en Zod: Los datos no tienen el formato correcto");
          return null;
        }

        try {
          console.log("📡 Llamando a NestJS en el puerto 4000...");
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
            console.log("✅ NestJS aceptó las credenciales!");
            return user; // Aquí devolvemos el objeto que tiene el TOKEN
          } else {
            console.log("❌ NestJS rechazó el login:", user.message || "Error desconocido");
            return null;
          }
        } catch (error) {
          console.log("🔥 ERROR CRÍTICO de conexión con el Backend:", error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;