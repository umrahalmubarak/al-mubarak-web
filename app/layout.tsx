"use client";
import DashboardLayout from "../components/layout/DashboardLayout";
import React from "react";
import "./globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import { useSystemStore } from "@/store/systemStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
})

 {
  const fetchSettings = useSystemStore((s) => s.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, []);
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
