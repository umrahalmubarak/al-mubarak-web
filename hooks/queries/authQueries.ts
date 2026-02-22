// src/hooks/queries/authQueries.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { LoginCredentials, LoginResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        // Store in Zustand store
        login({
          token: data.data.token,
          user: data.data.user,
        });
        
        // Invalidate any cached queries
        queryClient.invalidateQueries({ queryKey: ['user'] });
        
        // Redirect to dashboard
        router.push('/dashboard/overview');
      }
    },
    onError: (error: any) => {
      console.error('Login failed:', error.response?.data?.message || error.message);
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // Optional: Call logout endpoint if your API has one
      // await api.post('/auth/logout');
      return true;
    },
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all cached data
      router.push('/login');
    },
  });
};