"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeLogo() {
  const { resolvedTheme } = useTheme();

  return (
    <Link href="https://ozlistings.com" className="cursor-pointer">
      <Image
        src={
          resolvedTheme === "dark"
            ? "/OZListings-Dark.png"
            : "/OZListings-Light-removebg.png"
        }
        alt="OZ Listings"
        width={120}
        height={40}
        className="h-6 w-auto object-contain transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] transform"
        priority
        quality={100}
        unoptimized
        style={{
          height: "clamp(12px, 1.5vw, 24px)",
          imageRendering: "crisp-edges",
        }}
      />
    </Link>
  );
}
