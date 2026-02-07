import React from "react";

export const LuxuryShell = ({ children, dir = "rtl", tone = "dark" }) => {
  const bgClass = tone === "dark" 
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
    : "bg-gradient-to-br from-slate-50 via-white to-slate-100";
  
  const textClass = tone === "dark" ? "text-white" : "text-slate-950";

  return (
    <div 
      className={`min-h-screen ${bgClass} ${textClass} font-sans`}
      dir={dir}
    >
      {children}
    </div>
  );
};