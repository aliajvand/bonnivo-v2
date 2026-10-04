"use client";

import Image from "next/image";

export function IslandProgressiveContainer() {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none pointer-events-none">
      {/* Soft ambient back light */}
      <div className="absolute w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl -z-10 animate-pulse pointer-events-none" />

      {/* Official Floating Island Asset */}
      <div className="relative w-full max-w-[420px] lg:max-w-[480px] aspect-square flex items-center justify-center animate-float-island">
        <Image
          src="/icons/bonnivo-floating-island.svg"
          alt="جزیره اختصاصی بونیو"
          width={600}
          height={488}
          priority
          className="object-contain w-auto h-auto max-w-full max-h-[380px] lg:max-h-[460px] drop-shadow-[0_25px_45px_rgba(0,0,0,0.55)] transition-transform duration-500"
        />
      </div>
    </div>
  );
}
