import React from 'react';

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <path 
        d="M50 5C30 5 10 25 10 50C10 75 30 95 50 95C70 95 90 75 90 50C90 25 70 5 50 5ZM50 85L25 60L35 50L50 65L75 40L85 50L50 85Z" 
        fill="currentColor" 
        className="text-emerald-400 opacity-20"
      />
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" className="text-emerald-600" />
      <path 
        d="M35 50C35 35 45 30 50 30V70C45 70 35 65 35 50Z" 
        fill="currentColor" 
        className="text-emerald-500" 
      />
      <path 
        d="M50 30C55 30 65 35 65 50C65 65 55 70 50 70V30Z" 
        fill="currentColor" 
        className="text-emerald-600" 
      />
      <circle cx="50" cy="50" r="4" fill="white" />
    </svg>
  );
}
