"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SystemSettingsPage() {
  const { logout } = useAuth();

  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false); // modal state

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/system/settings");
        setBusinessName(data.data.businessName);
        setLogoUrl(data.data.logoUrl);
        setLogoPreview(data.data.logoUrl);
      } catch (err) {
        toast.error("Failed to fetch settings");
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      let uploadedUrl = logoUrl;

      if (selectedFile) {
        const fileName = `logo-${Date.now()}.${selectedFile.name
          .split(".")
          .pop()}`;

        const { data, error } = await supabase.storage
          .from("logos")
          .upload(fileName, selectedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) throw error;

        const { data: publicData } = supabase.storage
          .from("logos")
          .getPublicUrl(data.path);

        uploadedUrl = publicData.publicUrl;
      }

      await api.put("/system/settings", {
        businessName,
        logoUrl: uploadedUrl,
      });

      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error("Failed to update settings");
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);

      await api.post("/system/reset", {
        key: resetKey,
      });

      toast.success("Database reset successful");
      setOpenConfirm(false);
    } catch (err) {
      toast.error("Reset failed");
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="min-h-screen bg-gray-50 px-4 sm:px-8 py-10">
    <div className="max-w-5xl mx-auto space-y-12">

      {/* Page Title */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          System Settings
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Manage branding and system-level configurations.
        </p>
      </div>

      {/* Branding Section */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 sm:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold">Branding</h2>
        </div>

        {/* Business Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Business Name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700">
            Logo
          </label>

          {logoPreview && (
            <div className="bg-gray-100 rounded-xl p-4 flex justify-center">
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="h-20 object-contain"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
                setLogoPreview(URL.createObjectURL(e.target.files[0]));
              }
            }}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium
              hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-red-600">
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Resetting will permanently remove system data.
          </p>
        </div>

        <input
          type="text"
          placeholder="Enter Reset Key"
          value={resetKey}
          onChange={(e) => setResetKey(e.target.value)}
          className="w-full border border-red-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
        />

        <div className="flex justify-end">
          <button
            onClick={() => setOpenConfirm(true)}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium
              hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Database"}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent className="rounded-2xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-600">
              Confirm Database Reset
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground mt-3">
            This action cannot be undone. All records except Super Admin and Admin users will be permanently deleted.
          </p>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-6">
            <button
              onClick={() => setOpenConfirm(false)}
              className="px-4 py-2 border rounded-xl"
            >
              Cancel
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
            >
              Confirm Reset
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout */}
      <div className="flex justify-start">
        <button
          onClick={logout}
          className="bg-gray-800 text-white px-5 py-2.5 rounded-xl hover:bg-black transition"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
);
}