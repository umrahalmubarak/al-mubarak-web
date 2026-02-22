"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth"; // ✅ added

export default function SystemSettingsPage() {
  const { logout } = useAuth(); // ✅ added

  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/system/settings");
        setBusinessName(data.data.businessName);
        setLogoUrl(data.data.logoUrl);
        setLogoPreview(data.data.logoUrl);
      } catch (err) {
        console.error("Failed to fetch settings", err);
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

      alert("Updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset the database?"))
      return;

    try {
      setLoading(true);

      await api.post("/system/reset", {
        key: resetKey,
      });

      alert("Database reset successful");
    } catch (err) {
      console.error(err);
      alert("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-10">
      {/* 🔥 Logout Button */}
      
      <h1 className="text-4xl font-bold text-center">
        System Settings (Super Admin)
      </h1>

      {/* Branding Section */}
      <div className="bg-white rounded-xl p-6 lg:w-[80%] shadow-lg space-y-6">
        <h2 className="text-lg font-medium">Branding</h2>

        <div>
          <label className="block text-sm mb-2">Business Name</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Logo</label>

          {logoPreview && (
            <img
              src={logoPreview}
              alt="Logo Preview"
              className="h-20 mb-4 object-contain"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
                setLogoPreview(URL.createObjectURL(e.target.files[0]));
              }
            }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Reset Section */}
      <div className="bg-red-50 border border-red-200 lg:w-[80%] shadow-lg rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-medium text-red-600">
          Danger Zone
        </h2>

        <input
          type="text"
          placeholder="Enter Reset Key"
          value={resetKey}
          onChange={(e) => setResetKey(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          {loading ? "Resetting..." : "Reset Database"}
        </button>
      </div>

      {/* logoutbutton */}
      <div className="flex justify-start">
        <button
          onClick={logout}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black"
        >
          Logout
        </button>
      </div>

    </div>
  );
}