// src/lib/api.ts
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

export const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
console.log("ENV URL:", process.env.NEXT_PUBLIC_API_URL);


const api = axios.create({
  baseURL: baseURL+'/api/v1',
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
      const token = useAuthStore.getState().token; // ✅ direct access to store state
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // if (typeof window !== "undefined") {
      //   localStorage.removeItem("token");
      //   window.location.href = "/login";
      // }
      console.log("Token expired or invalid",error);
    }
    return Promise.reject(error);
  }
);

export default api;