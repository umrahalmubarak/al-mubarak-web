"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useLoginMutation } from "@/hooks/queries/authQueries";
import type { LoginCredentials } from "@/types/auth";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import Image from "next/image";
import logo from "@/public/images/al_mubarak.jpg";
import { useSystemStore } from "@/store/systemStore";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});


export const LoginForm: React.FC = () => {
  const loginMutation = useLoginMutation();
  //   const { toast } = useToast();
  const { businessName, logoUrl } = useSystemStore();
  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    loginMutation.mutate(data, {
      onError: (error: any) => {
        // toast({
        //   variant: "destructive",
        //   title: "Login Failed",
        //   description: error.response?.data?.message || "An error occurred during login",
        // });
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Image */}
      <div className="relative w-full lg:w-1/2  flex-1 lg:h-screen ">
        {logoUrl && (
          <img
          src={logoUrl} // or "/login-bg.jpg" if you want static file
          alt="Login background"
          className="object-cover"
        />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
            Welcome Back!
          </h1>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex items-center justify-center w-full flex-1  lg:w-1/2 px-6 py-12 bg-green-600">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-md bg-white/90 shadow-xl border border-gray-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Sign in to your account
              </CardTitle>
              <CardDescription>
                Enter your email and password to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
