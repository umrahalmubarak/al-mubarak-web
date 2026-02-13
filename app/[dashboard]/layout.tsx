"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  useEffect(() => {
    if (user === null) {
      window.location.href = "/login";
    }
  }, [user]);

  // 🔥 Prevent crash during hydration
  if (!user) {
    return null; // or loading spinner
  }

  return (
    <div>
      <Toaster />
      <DashboardLayout userRole={user.role as any}>
        {children}
      </DashboardLayout>
    </div>
  );
}
