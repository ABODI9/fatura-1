import React from "react";

export const GlassCard = ({ children, className = "" }) => {
  return (
    <div 
      className={`bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6 ${className}`}
    >
      {children}
    </div>
  );
};