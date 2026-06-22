"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export function useKioskMode() {
  const searchParams = useSearchParams();
  const { setKioskMode } = useAppStore();

  useEffect(() => {
    const isKiosk = searchParams.get("mode") === "kiosk";
    
    setKioskMode(isKiosk);

    if (isKiosk) {
      document.body.classList.add("kiosk-mode");
    } else {
      document.body.classList.remove("kiosk-mode");
    }
  }, [searchParams, setKioskMode]);
}
