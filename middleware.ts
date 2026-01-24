import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Inicializamos NextAuth con la configuración compartida
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Debug en consola del servidor
  console.log(`Middleware: ${nextUrl.pathname} | Logueado: ${isLoggedIn}`);

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/login", "/register"].includes(nextUrl.pathname);

  if (isApiAuthRoute) return;

  if (isPublicRoute) {
    if (isLoggedIn) {
      // Si ya está logueado y va a login, directo al dashboard
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    // Si no está logueado y la ruta no es pública, al login
    return Response.redirect(new URL("/login", nextUrl));
  }
});

export const config = {
  // Este matcher protege todo excepto archivos estáticos y favicon
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};