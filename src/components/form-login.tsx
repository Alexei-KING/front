"use client";

import { z } from "zod";
import { LoginSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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
import { useSession } from "next-auth/react";
import { Loader2, Package, User, Lock } from "lucide-react";
import { useAuth } from "@/components/auth-context";

const FormLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { isLoading } = useAuth();
  const { update } = useSession();

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
        await update();
        router.push("/dashboard");
        router.refresh();
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
        <p className="text-muted-foreground font-manrope mt-2">
          Sistema integral de gestión
        </p>
      </div>
      <div className="max-150 border-x-gray-100 w-100 p-8 border rounded-lg shadow-lg my-10">
        {" "}
        {/* <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
          <Package className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-geist font-bold text-foreground">
          Papelería Sistema
        </h1>
        <p className="text-muted-foreground font-manrope mt-2">
          Sistema integral de gestión
        </p>
      </div> */}
        {/* // <div className="max-150 w-100 p-8 border rounded-lg shadow-lg my-50"> */}
        <h1 className="mb-13 text-center text-2xl font-semibold ">
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
            {/* {error && <p className="text-sm text-red-600 text-center">{error}</p>} */}
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
