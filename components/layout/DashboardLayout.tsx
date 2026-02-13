"use client";
// components/layout/DashboardLayout.tsx

import React, { useState, useEffect } from "react";
import {
  Users,
  Settings,
  BarChart3,
  FileText,
  Home,
  Menu,
  X,
  Bell,
  Search,
  UserCheck,
  Calendar,
  DollarSign,
  Shield,
  Briefcase,
  User,
  LogOut,
  Compass,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import imgLogo from "@/public/images/al_mubarak.jpg";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: "ADMIN" | "STAFF" | "client";
}

interface TabConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface RoleConfig {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  tabs: TabConfig[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userRole = "ADMIN",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  // Role configurations
  const roleConfigs: Record<string, RoleConfig> = {
    ADMIN: {
      name: "Admin Panel",
      icon: Shield,
      color: "bg-green-500",
      tabs: [
        {
          id: "overview",
          name: "Overview",
          icon: Home,
          href: "/dashboard/overview",
        },
        {
          id: "Memebrs",
          name: "Members",
          icon: Users,
          href: "/dashboard/members",
        },
        {
          id: "tours-package",
          name: "Tour Packages",
          icon: Compass,
          href: "/dashboard/tour-packages",
        },
        {
          id: "tours-member",
          name: "Tour Members",
          icon: Compass,
          href: "/dashboard/tour-member",
        },
        {
          id: "enquiry-form",
          name: "Enquiry Form",
          icon: Compass,
          href: "/dashboard/enquiry-form",
        },
        {
          id: "payment-remainders",
          name: "Payment Remainders",
          icon: Compass,
          href: "/dashboard/payment-reminders",
        },
        {
          id: "user-management",
          name: "User Management",
          icon: Compass,
          href: "/dashboard/user",
        },
        // {
        //   id: "users",
        //   name: "User Management",
        //   icon: Users,
        //   href: "/admin/users",
        // },
        // {
        //   id: "analytics",
        //   name: "Analytics",
        //   icon: BarChart3,
        //   href: "/admin/analytics",
        // },
        // {
        //   id: "settings",
        //   name: "System Settings",
        //   icon: Settings,
        //   href: "/admin/settings",
        // },
        // {
        //   id: "reports",
        //   name: "Reports",
        //   icon: FileText,
        //   href: "/admin/reports",
        // },
      ],
    },
    STAFF: {
      name: "Staff Portal",
      icon: Briefcase,
      color: "bg-blue-500",
      tabs: [
        {
          id: "overview",
          name: "Overview",
          icon: Home,
          href: "/dashboard/overview",
        },
        {
          id: "Memebrs",
          name: "Members",
          icon: Users,
          href: "/dashboard/members",
        },
        {
          id: "tours-package",
          name: "Tour Packages",
          icon: Compass,
          href: "/dashboard/tour-packages",
        },
        {
          id: "tours-member",
          name: "Tour Members",
          icon: Compass,
          href: "/dashboard/tour-member",
        },
        {
          id: "enquiry-form",
          name: "Enquiry Form",
          icon: Compass,
          href: "/dashboard/enquiry-form",
        },
        {
          id: "payment-remainders",
          name: "Payment Remainders",
          icon: Compass,
          href: "/dashboard/payment-reminders",
        },
      ],
    },
    client: {
      name: "Client Portal",
      icon: User,
      color: "bg-green-500",
      tabs: [
        { id: "overview", name: "Dashboard", icon: Home, href: "/client" },
        {
          id: "services",
          name: "Services",
          icon: Briefcase,
          href: "/client/services",
        },
        {
          id: "billing",
          name: "Billing",
          icon: DollarSign,
          href: "/client/billing",
        },
        { id: "support", name: "Support", icon: Bell, href: "/client/support" },
        { id: "profile", name: "Profile", icon: User, href: "/client/profile" },
      ],
    },
    MANAGER: {
  name: "Manager Panel",
  icon: Shield,
  color: "bg-purple-500",
  tabs: [
    {
      id: "overview",
      name: "Overview",
      icon: Home,
      href: "/dashboard/overview",
    },
    {
      id: "members",
      name: "Members",
      icon: Users,
      href: "/dashboard/members",
    },
    {
      id: "tour-packages",
      name: "Tour Packages",
      icon: Compass,
      href: "/dashboard/tour-packages",
    },
  ],
},

  };

const currentConfig =
  roleConfigs[userRole] ?? roleConfigs["ADMIN"];

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [sidebarOpen]);

  const handleNavigation = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  const isActiveRoute = (href: string) => {
    if (href === `/${userRole}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        flex flex-col
      `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* <div
                className={`w-10 h-10 ${currentConfig.color} rounded-xl flex items-center justify-center shadow-lg`}
                background={imgLogo.src}
              > */}
              {/* <currentConfig.icon className="w-6 h-6 text-white" /> */}
              <img
                src={imgLogo.src}
                alt={currentConfig.name}
                className={`w-10 h-10   bg-cover shadow-lg`}
              />
              {/* </div> */}
              <div>
                <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
                <p className="text-sm text-gray-500 capitalize">{userRole}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {currentConfig.tabs.map((tab) => {
              const isActive = isActiveRoute(tab.href);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavigation(tab.href)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${
                      isActive
                        ? `${currentConfig.color} text-white shadow-lg transform scale-105`
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <tab.icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}
                  />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Menu Button */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-6 h-6" />
                </button>

                {/* Breadcrumb */}
                <div className="hidden sm:block">
                  <nav className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="capitalize">{userRole}</span>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">
                      {currentConfig.tabs.find((tab) => isActiveRoute(tab.href))
                        ?.name || "Dashboard"}
                    </span>
                  </nav>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                {/* Search - Desktop only */}
                {/* <div className="hidden md:block">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-9 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    />
                  </div>
                </div> */}

                {/* Notifications */}
                {/* <button className="relative text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button> */}

                {/* Profile Menu */}
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {userRole} USER
                    </p>
                    {/* <p className="text-xs text-gray-500">{userRole.}</p> */}
                  </div>
                  <div
                    className={`w-9 h-9 ${currentConfig.color} rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <currentConfig.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
