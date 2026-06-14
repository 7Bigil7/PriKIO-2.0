'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  hideBack?: boolean;
}

export default function AppHeader({
  title = "CampusPrint",
  subtitle = "Smart Campus Printing",
  onBack,
  hideBack = false,
}: AppHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        margin: "0 0 20px 0",
        boxSizing: "border-box",
        padding: "20px 20px 16px",
        background: "rgba(232, 237, 245, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
        borderBottomLeftRadius: "28px",
        borderBottomRightRadius: "28px",
        position: "relative",
        zIndex: 50,
        boxShadow: "0 8px 32px rgba(31, 38, 135, 0.07), inset 0 -1px 2px rgba(255,255,255,0.8)",
        overflow: "hidden"
      }}
    >
      {/* Subtle decorative pattern / background texture */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.03,
        backgroundImage: `radial-gradient(#0D1F3C 1px, transparent 1px)`,
        backgroundSize: '12px 12px',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {!hideBack && (
        <button 
          onClick={handleBack}
          style={{
            position: "absolute",
            left: "16px",
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(229, 231, 235, 0.8)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            color: "#0D1F3C",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            transition: "all 0.2s ease",
            zIndex: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = "rgba(255,255,255,0.9)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.95)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      )}
      
      <div style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
          <span style={{ 
            fontFamily: "var(--font-satoshi), sans-serif", 
            fontSize: "1.15rem", 
            fontWeight: 700, 
            color: "#1a2340", 
            letterSpacing: "-0.02em",
            lineHeight: 1.2
          }}>
            {title}
          </span>
          {subtitle && (
            <span style={{ 
              fontFamily: "var(--font-inter), sans-serif", 
              fontSize: "0.75rem", 
              fontWeight: 500, 
              color: "#6b7280",
              letterSpacing: "0.01em",
              marginTop: "2px"
            }}>
              {subtitle}
            </span>
          )}
      </div>
    </motion.div>
  );
}
