import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role?: string;
      cedula?: string;
      name?: string;
      lastname?: string;
      email?: string;
      username?: string;
      phone?: string;
      address?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
    cedula?: string;
    name?: string;
    email?: string;
    username?: string;
    lastname?: string;
    phone?: string;
    address?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    cedula?: string;
    name?: string;
    email?: string;
    username?: string;
    lastname?: string;
    phone?: string;
    address?: string;
  }
}
