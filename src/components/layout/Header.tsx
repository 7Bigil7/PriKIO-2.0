"use client";

import SessionTimer from "./SessionTimer";

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-border bg-bg w-full">
      <div className="flex items-center gap-4">
        {/* College Logo Placeholder */}
        <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white font-serif font-bold italic text-xl">
          P
        </div>
        <div>
          <h1 className="font-serif font-semibold italic text-xl text-navy leading-none">Presidency</h1>
          <p className="text-[10px] uppercase tracking-widest text-grey font-bold mt-1">Campus Print</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <SessionTimer />
        
        {/* Avatar/Profile */}
        <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm shadow-sm">
          JD
        </div>
      </div>
    </header>
  );
}
