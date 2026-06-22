"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function SessionTimer() {
  const { sessionTimeRemaining, decrementSessionTime, kioskMode } = useAppStore();

  useEffect(() => {
    const timer = setInterval(() => {
      decrementSessionTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [decrementSessionTime]);

  // Don't show the timer on Kiosk Mode as per requirements
  if (kioskMode) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatus = () => {
    if (sessionTimeRemaining <= 10) return { label: "Critical Timeout", meta: "Session ending", pillClass: "timer-critical bg-red-s text-red" };
    if (sessionTimeRemaining <= 60) return { label: "Expiring Soon", meta: "Please complete action", pillClass: "timer-warning bg-amber-s text-amber" };
    return { label: "Session Active", meta: "Secure connection", pillClass: "timer-normal bg-accent-s text-accent" };
  };

  const status = getStatus();

  return (
    <div className="timer-card flex items-center justify-between px-4 py-3.5 bg-gl border border-border rounded-[14px]">
      <div>
        <div className="timer-label text-[13px] font-semibold text-gd leading-tight">{status.label}</div>
        <div className="timer-meta text-[11px] font-light text-grey">{status.meta}</div>
      </div>
      <div className={`timer-pill px-3 py-1 rounded-full text-xs font-semibold ${status.pillClass}`}>
        {formatTime(sessionTimeRemaining)}
      </div>
    </div>
  );
}
