import React from "react";

export default function Logo({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Decorative Swoosh */}
      <div className="absolute inset-0 border-[6px] border-l-red-600 border-t-red-600 border-r-cyan-400 border-b-cyan-400 rounded-full -rotate-45 opacity-90"></div>
      <div className="absolute inset-1 border-[2px] border-cyan-400 rounded-full opacity-50"></div>
      
      {/* Text "CM" */}
      <div className="relative flex items-baseline font-black text-3xl select-none translate-y-1">
        <span className="text-cyan-400">C</span>
        <span className="text-cyan-400 -ml-1">M</span>
      </div>
    </div>
  );
}
