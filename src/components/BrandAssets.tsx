import React from 'react';

/**
 * Custom Verified Badge based on the uploaded rosette badge (IMG_0846.PNG)
 * 16-lobed scalloped flower in vibrant neon lime (#CCFF00) with a bold black checkmark.
 */
export const VerifiedBadge: React.FC<{
  size?: number;
  className?: string;
  title?: string;
}> = ({ size = 20, className = '', title = 'Верифицированный профиль' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 select-none ${className}`}
      title={title}
      aria-label={title}
    >
      {/* 16-lobe scalloped rosette path in OKX neon lime */}
      <path
        d="M 20.49 6.35 A 4.4 4.4 0 0 1 27.51 6.35 A 4.4 4.4 0 0 1 34.00 9.03 A 4.4 4.4 0 0 1 38.97 14.00 A 4.4 4.4 0 0 1 41.65 20.49 A 4.4 4.4 0 0 1 41.65 27.51 A 4.4 4.4 0 0 1 38.97 34.00 A 4.4 4.4 0 0 1 34.00 38.97 A 4.4 4.4 0 0 1 27.51 41.65 A 4.4 4.4 0 0 1 20.49 41.65 A 4.4 4.4 0 0 1 14.00 38.97 A 4.4 4.4 0 0 1 9.03 34.00 A 4.4 4.4 0 0 1 6.35 27.51 A 4.4 4.4 0 0 1 6.35 20.49 A 4.4 4.4 0 0 1 9.03 14.00 A 4.4 4.4 0 0 1 14.00 9.03 A 4.4 4.4 0 0 1 20.49 6.35 Z"
        fill="#CCFF00"
      />
      {/* Thick rounded bold black checkmark */}
      <path
        d="M 16.5 24.8 L 21.8 30.2 L 32.2 18.8"
        stroke="#000000"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * Exact circular lime badge with bold black checkmark as shown in Alex, 23 and Riley, 26
 */
export const CircleVerifiedCheck: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 20, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-[#CCFF00] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(204,255,0,0.35)] ${className}`}
      title="Верифицированный профиль"
    >
      <svg
        width={Math.round(size * 0.65)}
        height={Math.round(size * 0.65)}
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M3.5 8.2L6.5 11.2L12.5 4.8"
          stroke="#000000"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/**
 * 3D Isometric Ribbon "S" Logo based on the user's uploaded logo (IMG_0839.PNG).
 * Crafted with crisp precision gradients in OKX neon-lime (#CCFF00) and shadowed fold.
 */
export const LogoS: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 36, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 select-none drop-shadow-[0_2px_14px_rgba(204,255,0,0.45)] ${className}`}
    >
      <defs>
        {/* Main bright neon lime gradient */}
        <linearGradient id="sMainLime" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E5FF4D" />
          <stop offset="100%" stopColor="#CCFF00" />
        </linearGradient>

        {/* Lower ribbon gradient */}
        <linearGradient id="sLowerLime" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CCFF00" />
          <stop offset="100%" stopColor="#B3E600" />
        </linearGradient>

        {/* Dark fold shadow */}
        <linearGradient id="sFoldShadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5E7800" />
          <stop offset="100%" stopColor="#445700" />
        </linearGradient>
      </defs>

      {/* Top ribbon arm */}
      <path
        d="M 23 48 L 52 36 L 78 12 L 78 32 L 50 38 L 23 48 Z"
        fill="url(#sMainLime)"
      />

      {/* Upper main slanted block */}
      <path
        d="M 52 36 L 78 12 L 55 9 L 23 30 L 23 48 L 52 36 Z"
        fill="url(#sMainLime)"
      />

      {/* Ribbon Fold Underbelly Shadow */}
      <path
        d="M 23 48 L 50 36 L 50 48 L 23 48 Z"
        fill="url(#sFoldShadow)"
      />

      {/* Bottom ribbon hook */}
      <path
        d="M 50 44 L 80 52 L 80 68 L 51 63 L 51 72 L 25 76 L 25 65 L 50 64 L 50 44 Z"
        fill="url(#sLowerLime)"
      />

      {/* Bottom right wing */}
      <path
        d="M 50 44 L 80 52 L 80 72 L 51 90 L 25 93 L 25 76 L 51 63 L 80 68 Z"
        fill="url(#sMainLime)"
      />
    </svg>
  );
};

/**
 * Full "SculptUp" brand logo based on IMG_0840.PNG
 * "Sculpt" in pure white, "Up" in electric neon lime.
 */
export const LogoFull: React.FC<{
  height?: number;
  className?: string;
}> = ({ height = 24, className = '' }) => {
  return (
    <div
      style={{ height }}
      className={`inline-flex items-center select-none font-black tracking-tighter ${className}`}
    >
      <span className="text-white text-lg sm:text-xl font-black">Sculpt</span>
      <span className="text-[#CCFF00] text-lg sm:text-xl font-black">Up</span>
    </div>
  );
};
