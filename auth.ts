import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
<<<<<<< HEAD
  // Importamos la configuración de auth.config (que ya trae las cookies)
=======
  // Forzamos la lectura aquí
  secret: process.env.AUTH_SECRET,
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
<<<<<<< HEAD
        token.id = user.id;
        token.role = user.role;
        token.cedula = user.cedula;
        token.accessToken = (user as any).accessToken;
=======
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
        token.name =
          (user as any).fullName ||
          (user as any).name ||
          (user as any).username;
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
      }
      return token;
    },
    async session({ session, token }) {
<<<<<<< HEAD
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.cedula = token.cedula as string;
        (session.user as any).accessToken = token.accessToken;
=======
      if (session.user) {
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).role = token.role;
        session.user.name = token.name as string;
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
      }
      return session;
    },
  },
<<<<<<< HEAD
});
=======
});
>>>>>>> 8cccc43d8bd31a1e93c709de33c34516c5fafa72
