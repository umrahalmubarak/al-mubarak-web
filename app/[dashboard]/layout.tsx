"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ✅ Redirect to login if not authenticated
    if (!user) {
      router.replace("/login");
      return;
    }

    // ✅ Redirect SUPERADMIN to system-setting only once
    if (
      user.role === "SUPERADMIN" &&
      pathname !== "/dashboard/system-setting"
    ) {
      router.replace("/dashboard/system-setting");
    }
  }, [user, pathname, router]);

  // 🔥 Prevent crash during hydration
  if (!user) {
    return null; // or loading spinner
  }

  return (
    <div>
      <Toaster />
      <DashboardLayout>
        {children}      
      </DashboardLayout>
    </div>
  );
}