import React from 'react';

export function UTVLogo({ className = "", size = "default" }: { className?: string; size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "w-6 h-6",
    default: "w-9 h-9", 
    large: "w-12 h-12"
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Music note with flame-like design */}
        <path
          d="M35 25 L35 65 C35 72 30 77 23 77 C16 77 11 72 11 65 C11 58 16 53 23 53 C26 53 29 54 31 56 L31 30 L65 20 L65 50 C65 57 60 62 53 62 C46 62 41 57 41 50 C41 43 46 38 53 38 C56 38 59 39 61 41 L61 25 Z"
          fill="currentColor"
          className="text-amber-500"
        />
        {/* Flame-like flowing design around the note */}
        <path
          d="M25 15 Q30 8 35 15 Q40 5 45 15 Q50 10 55 15 Q60 8 65 15 Q70 10 75 20 Q80 15 85 25 Q88 35 85 45 Q82 55 75 60 Q70 65 65 60 Q60 65 55 60 Q50 65 45 60 Q40 65 35 60 Q30 65 25 60 Q20 55 17 45 Q14 35 17 25 Q20 15 25 15 Z"
          fill="currentColor"
          className="text-amber-500 opacity-30"
        />
        {/* Inner decorative elements */}
        <circle cx="23" cy="65" r="3" fill="#09090b" />
        <circle cx="53" cy="50" r="3" fill="#09090b" />
      </svg>
    </div>
  );
}
