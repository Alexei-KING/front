import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
  callbacks: {
    // En src/auth.ts
async jwt({ token, user }) {
  if (user) {
    token.accessToken = (user as any).accessToken;
    token.role = (user as any).role;
    // AGREGAR ESTO:
    token.name = (user as any).fullName || (user as any).name || (user as any).username;
  }
  return token;
},
async session({ session, token }) {
  if (session.user) {
    // @ts-ignore
    session.user.accessToken = token.accessToken;
    // AGREGAR ESTO:
    session.user.name = token.name as string;
  }
  return session;
}
  },
});