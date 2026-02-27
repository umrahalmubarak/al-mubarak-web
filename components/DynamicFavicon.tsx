"use client";

import { useEffect } from "react";
import { useSystemStore } from "@/store/systemStore";

export default function DynamicFavicon() {
  const logoUrl = useSystemStore((s) => s.logoUrl);

  useEffect(() => {
    if (!logoUrl) return;

    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.href = logoUrl;
  }, [logoUrl]);

  return null;
}