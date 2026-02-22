import { create } from "zustand";
import api from "@/lib/api";

interface SystemState {
  businessName: string;
  logoUrl: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: { businessName: string; logoUrl: string | null }) => Promise<void>;
}

export const useSystemStore = create<SystemState>((set) => ({
  businessName: "Loading...",
  logoUrl: null,

  fetchSettings: async () => {
    const { data } = await api.get("/system/settings");
    set({
      businessName: data.data.businessName,
      logoUrl: data.data.logoUrl,
    });
  },

  updateSettings: async (payload) => {
    const { data } = await api.put("/system/settings", payload);
    set({
      businessName: data.data.businessName,
      logoUrl: data.data.logoUrl,
    });
  },
}));