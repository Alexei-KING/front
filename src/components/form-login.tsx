"use client";

import { z } from "zod";
import { LoginSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
// Borramos useRouter porque usaremos window.location para forzar la entrada
// import { useRouter } from "next/navigation"; 
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginAction } from "../../actions/auth-action";
import { Loader2, Package } from "lucide-react";
import { useAuth } from "@/components/auth-context";

const FormLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // const router = useRouter(); // <--- YA NO LO NECESITAMOS
  const { isLoading } = useAuth();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      cedula: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    setError(null);
    startTransition(async () => {
      const response = await loginAction(values);

      if (response?.error) {
        setError(response.error);
      } else {
        // SOLUCIÓN FINAL:
        // En lugar de usar el router de Next.js que tiene caché,
        // forzamos al navegador a ir a la url. Esto obliga a leer la cookie sí o sí.
        window.location.href = "/dashboard";
      }
    });
  }

  return (
    <div>
      <div className="text-center ">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-full mb-4 my-6">
          <Package className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-geist font-bold text-foreground">
          Papelería Sistema
        </h1>
        <p className="  text-black font-manrope mt-2 ">
          Sistema integral de gestión
        </p>
      </div>
      <div className="max-150  w-100  border rounded-lg shadow-lg my-10 bg-blue-50 py-7 px-5 shadow-xl/30 shadow-black">
        {" "}
        <h1 className="mb-13 text-center font-bold  fext-foreground text-2xl ">
          Inicio de Sesión
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="cedula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cedula</FormLabel>
                  <FormControl>
                    <Input placeholder="cedula" type="number" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contraseña"
                      type="password"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <FormMessage>{error}</FormMessage>}
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-900"
              disabled={isLoading || isPending}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
export default FormLogin;