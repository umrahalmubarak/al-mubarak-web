"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  UserCheck,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/public/images/al_mubarak.jpg";
import { useSystemStore } from "@/store/systemStore";

// Types for dashboard statistics
interface DashboardStats {
  // Package Statistics
  totalPackages: number;
  activePackages: number;
  totalSeats: number;
  availableSeats: number;
  occupiedSeats: number;

  // Financial Statistics
  totalRevenue: number;
  pendingPayments: number;
  monthlyRevenue: number;
  avgPackagePrice: number;

  // Member Statistics
  totalMembers: number;
  totalBookings: number;
  monthlyBookings: number;

  // Payment Statistics
  paidBookings: number;
  partialBookings: number;
  pendingBookings: number;
  failedBookings: number;

  // Recent activity
  recentGrowth: {
    packages: number;
    bookings: number;
    revenue: number;
    members: number;
  };
}

// API function to fetch dashboard statistics
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/dashboard/overview");
  return data.data;
};

// Reusable component for animated hover values
interface HoverValueProps {
  value: number | string;
  prefix?: string;
  suffix?: string;
  isLoading?: boolean;
}

const HoverValue: React.FC<HoverValueProps> = ({
  value,
  prefix = "",
  suffix = "",
  isLoading = false,
}) => {
  if (isLoading) {
    return <Skeleton className="h-8 w-24" />;
  }


  return (
    <div className="text-2xl font-bold hover:scale-105 transition-transform duration-200">
      {prefix}
      {typeof value === "number" ? value.toLocaleString() : value}
      {suffix}
    </div>
  );
};

// Growth indicator component
interface GrowthIndicatorProps {
  value: number;
  label: string;
  isPercentage?: boolean;
}

const GrowthIndicator: React.FC<GrowthIndicatorProps> = ({
  value,
  label,
  isPercentage = true,
}) => {
  const isPositive = value >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className={`flex items-center text-xs ${
        isPositive ? "text-green-600" : "text-red-600"
      }`}
    >
      <Icon className="h-3 w-3 mr-1" />
      <span>
        {isPositive ? "+" : ""}
        {isPercentage ? `${value}%` : value} {label}
      </span>
    </div>
  );
};

// Payment status badge
interface PaymentStatusBadgeProps {
  status: "PAID" | "PARTIAL" | "PENDING" | "FAILED";
  count: number;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  count,
}) => {
  const statusConfig = {
    PAID: {
      variant: "default" as const,
      icon: CheckCircle,
      color: "text-green-600",
    },
    PARTIAL: {
      variant: "secondary" as const,
      icon: Timer,
      color: "text-yellow-600",
    },
    PENDING: {
      variant: "outline" as const,
      icon: Clock,
      color: "text-orange-600",
    },
    FAILED: {
      variant: "destructive" as const,
      icon: XCircle,
      color: "text-red-600",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className={`h-3 w-3 ${config.color}`} />
      {count}
    </Badge>
  );
};

// Main Dashboard Overview Component
const DashboardOverview: React.FC = () => {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchDashboardStats,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });

  const { user } = useAuth();
  const { businessName, logoUrl } = useSystemStore();

  if (user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>
         {logoUrl && (
                <img
                  src={logoUrl}
                  alt={businessName}
                  className="h-[40%] w-[] object-contain"
                />
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard statistics.
          <button
            onClick={() => refetch()}
            className="ml-2 underline hover:no-underline"
          >
            Try again
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Packages */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Packages
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <HoverValue
              value={stats?.totalPackages ?? 0}
              isLoading={isLoading}
            />
            <div className="flex items-center justify-between mt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {stats?.activePackages ?? 0} Active
              </Badge>
              {stats && (
                <GrowthIndicator
                  value={stats.recentGrowth.packages}
                  label="this month"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <HoverValue
              value={stats?.totalRevenue ?? 0}
              prefix="₹"
              isLoading={isLoading}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                ₹{stats?.monthlyRevenue?.toLocaleString() ?? 0} this month
              </p>
              {stats && (
                <GrowthIndicator
                  value={stats.recentGrowth.revenue}
                  label="growth"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <HoverValue
              value={stats?.totalBookings ?? 0}
              isLoading={isLoading}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {stats?.monthlyBookings ?? 0} this month
              </p>
              {stats && (
                <GrowthIndicator
                  value={stats.recentGrowth.bookings}
                  label="increase"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Members */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <HoverValue
              value={stats?.totalMembers ?? 0}
              isLoading={isLoading}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Registered members
              </p>
              {stats && (
                <GrowthIndicator
                  value={stats.recentGrowth.members}
                  label="new"
                  isPercentage={false}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Seat Utilization */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Seat Utilization
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Seats</span>
                <HoverValue
                  value={stats?.totalSeats ?? 0}
                  isLoading={isLoading}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">Occupied</span>
                <span className="font-semibold">
                  {stats?.occupiedSeats ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">Available</span>
                <span className="font-semibold">
                  {stats?.availableSeats ?? 0}
                </span>
              </div>
              {stats && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (stats.occupiedSeats / stats.totalSeats) * 100
                      }%`,
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Overview */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Payment Status
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {stats && (
                  <>
                    <PaymentStatusBadge
                      status="PAID"
                      count={stats.paidBookings}
                    />
                    <PaymentStatusBadge
                      status="PARTIAL"
                      count={stats.partialBookings}
                    />
                    <PaymentStatusBadge
                      status="PENDING"
                      count={stats.pendingBookings}
                    />
                    <PaymentStatusBadge
                      status="FAILED"
                      count={stats.failedBookings}
                    />
                  </>
                )}
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Pending Amount:{" "}
                  <span className="font-semibold text-orange-600">
                    ₹{stats?.pendingPayments?.toLocaleString() ?? 0}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Package Price */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Package Price
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <HoverValue
              value={stats?.avgPackagePrice ?? 0}
              prefix="₹"
              isLoading={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Per person average pricing
            </p>
            {/* <div className="mt-3 pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Revenue/Booking:</span>
                <span className="font-medium">
                  ₹
                  {stats && stats.totalBookings > 0
                    ? Math.round(
                        stats.totalRevenue / stats.totalBookings
                      ).toLocaleString()
                    : 0}
                </span>
              </div>
            </div> */}
          </CardContent>
        </Card>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
