// hooks/use-payment-reminders.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TourMember, PaymentReminderFilters, BulkSmsPayload } from "@/types/payment-reminder";
import api from "@/lib/api";


const QUERY_KEYS = {
  paymentReminders: "payment-reminders",
  tourPackages: "tour-packages",
} as const;

// Hook to fetch tour members with pending payment
export const usePaymentReminders = (filters: PaymentReminderFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.paymentReminders, filters],
    queryFn: async (): Promise<TourMember[]> => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append("search", filters.search);
      if (filters.tourPackageId) params.append("tourPackageId", filters.tourPackageId);
      if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
      if (filters.paymentType) params.append("paymentType", filters.paymentType);
      if (filters.dateRange.from) params.append("dateFrom", filters.dateRange.from.toISOString());
      if (filters.dateRange.to) params.append("dateTo", filters.dateRange.to.toISOString());

      const response = await api.get(`/payment-reminders/tour-members/payment-reminders?${params.toString()}`);
      return response.data.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch all tour packages for filter dropdown
export const useTourPackages = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.tourPackages],
    queryFn: async () => {
      const response = await api.get("/payment-reminders/tour-packages");
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to send bulk SMS
export const useBulkSms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkSmsPayload) => {
      const response = await api.post("/payment-reminders/sms/bulk", payload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch payment reminders
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.paymentReminders] });
    },
  });
};

// Hook to send individual SMS
export const useIndividualSms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, message }: { memberId: string; message: string }) => {
      const response = await api.post("/payment-reminders/sms/individual", { memberId, message });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.paymentReminders] });
    },
  });
};

// Hook to update reminder count
export const useUpdateReminderCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await api.patch(`/payment-reminders/tour-members/${memberId}/reminder`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.paymentReminders] });
    },
  });
};