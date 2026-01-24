import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  // Importamos la configuración de auth.config (que ya trae las cookies)
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.cedula = user.cedula;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.cedula = token.cedula as string;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
});