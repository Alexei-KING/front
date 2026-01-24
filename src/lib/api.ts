// src/lib/api.ts
import { auth } from "@/../././auth";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const session = await auth();
  const token = session?.user?.accessToken; // El token que configuramos en auth.ts

  return fetch(`http://localhost:4000/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, // <-- Esto le abre la puerta en NestJS
      ...options.headers,
    },
  });
}