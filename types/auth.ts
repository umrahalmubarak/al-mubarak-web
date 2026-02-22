// src/types/auth.ts
export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'SUPERADMIN';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: { token: string; user: User }) => void;
  logout: () => void;
  setUser: (user: User) => void;
}