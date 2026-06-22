"use client";

import { useAppStore } from "@/store/useAppStore";
import { useKioskMode } from "@/hooks/useKioskMode";
import Header from "./Header";
import Stepper from "./Stepper";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  useKioskMode();
  const { kioskMode } = useAppStore();
  const pathname = usePathname();

  if (pathname === "/") {
    return <>{children}</>;
  }

  if (kioskMode) {
    return (
      <div className="kiosk-mode w-full min-h-screen bg-body-bg flex flex-col items-center">
        <Header />
        <main className="flex-1 w-full max-w-[800px] px-6 py-12 flex flex-col items-center">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="page-root min-h-screen w-full bg-body-bg">
      {/* Mobile Header (Only visible on small screens) */}
      <div className="md:hidden w-full">
        <Header />
      </div>

      {/* Left Sidebar (Hidden on Mobile) */}
      <aside className="desktop-left-panel hidden md:flex flex-col relative bg-navy text-white p-12 min-h-screen overflow-hidden">
        <div className="relative z-10 flex flex-col h-full">
          <div className="mb-12">
            <h1 className="font-serif font-semibold italic text-3xl text-white mb-2">Presidency</h1>
            <p className="text-xs uppercase tracking-widest text-white/70 font-bold">Campus Print</p>
          </div>
          
          <div className="flex-1 mt-8">
            <Stepper />
          </div>

          <div className="mt-auto pt-8">
            <div className="text-sm font-light text-white/50">
              Need help? Visit the library IT desk.
            </div>
          </div>
        </div>
      </aside>

      {/* Right Content Area */}
      <main className="desktop-right-panel flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-md w-full h-full md:h-auto min-h-[640px] max-h-[85vh] bg-bg md:rounded-[36px] md:shadow-[0_24px_64px_rgba(0,0,0,0.1)] flex flex-col relative overflow-hidden">
          {/* On Mobile, show Stepper at the top of the card or as a sticky bar, but we'll include it in the layout if needed. For now just wrap children */}
          <div className="flex-1 overflow-y-auto flex flex-col">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
}
