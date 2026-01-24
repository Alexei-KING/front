"use client";

import { z } from "zod";
import { RegisterSchema } from "@/lib/zod";
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
import { RegisterAction } from "../../actions/auth-action";

const FormRegister = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      cedula: "",
      password: "",
      email: "",
      name: "",
      lastname: "",
      username: "",
      phone: "",
      address: "",
    },
  });
  async function onSubmit(values: z.infer<typeof RegisterSchema>) {
    setError(null);
    startTransition(async () => {
      const response = await RegisterAction(values);
      if (response?.error) {
        setError(response.error);
      } else {
        router.push("/dashboard");
      }
    });
  }

  return (
    <div className="max-150 w-100 p-8 border rounded-lg shadow-lg my-50">
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Contraseña" type="text" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Contraseña" type="text" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>username</FormLabel>
                <FormControl>
                  <Input placeholder="Contraseña" type="text" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>email</FormLabel>
                <FormControl>
                  <Input placeholder="Contraseña" type="text" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>telefono</FormLabel>
                <FormControl>
                  <Input placeholder="Contraseña" type="text" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>direccion</FormLabel>
                <FormControl>
                  <Input placeholder="Contraseña" type="text" {...field} />
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
                  <Input placeholder="Contraseña" type="password" {...field} />
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
            disabled={isPending}
          >
            {" "}
            Iniciar Sesión
          </Button>
        </form>
      </Form>
    </div>
  );
};
export default FormRegister;
