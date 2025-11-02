"use client";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function CTAButton({
  children,
  variant = "outline", // "outline", "filled", "text"
  size = "md", // "sm", "md", "lg"
  className = "",
  onClick,
  tooltip = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: "outline" | "filled" | "text" | "blueOutline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  tooltip?: string;
  [key: string]: any;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Cleanup tooltip on component unmount or navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      setShowTooltip(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowTooltip(false);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      setShowTooltip(false);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Immediately hide tooltip when button is clicked
    setShowTooltip(false);

    // Call the original onClick handler if provided
    if (onClick) {
      onClick();
    }
  };

  const baseClasses =
    "group relative overflow-hidden rounded-xl font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 whitespace-nowrap";

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-lg",
  };

  const variantClasses = {
    outline: "bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 hover:shadow-lg shadow-sm",
    filled:
      "bg-[#1e88e5] hover:bg-[#1976d2] text-white shadow-lg shadow-[#1e88e5]/25 hover:shadow-[#1e88e5]/40",
    text: "text-[#1e88e5] dark:text-[#1e88e5] border-2 border-transparent hover:border-[#1e88e5]/50 hover:bg-[#1e88e5]/10 dark:hover:bg-[#1e88e5]/10",
    blueOutline:
      "bg-transparent border-2 border-[#1e88e5] text-[#1e88e5] dark:text-[#1e88e5] hover:bg-[#1e88e5]/10 dark:hover:bg-[#1e88e5]/10 hover:shadow-lg shadow-sm",
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    if (variant === "outline") {
      target.style.background = "#1e88e5";
      target.style.color = "white";
      target.style.boxShadow = "0 8px 25px rgba(30, 136, 229, 0.3)";
    } else if (variant === "filled") {
      target.style.transform = "scale(1.05) translateY(-2px)";
      target.style.boxShadow = "0 8px 30px rgba(30, 136, 229, 0.4)";
    } else if (variant === "text") {
      target.style.backgroundColor = "rgba(30, 136, 229, 0.1)";
    }
    if (tooltip) setShowTooltip(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    if (variant === "outline") {
      target.style.background = "white";
      target.style.color = "#1e88e5";
      target.style.boxShadow = "none";
    } else if (variant === "filled") {
      target.style.transform = "scale(1) translateY(0px)";
      target.style.boxShadow = "0 4px 15px rgba(30, 136, 229, 0.2)";
    } else if (variant === "text") {
      target.style.backgroundColor = "transparent";
    }
    if (tooltip) setShowTooltip(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!tooltip || !showTooltip) return;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Calculate tooltip position - positioned lower relative to mouse
    let x = mouseX + 10; // 10px offset from cursor
    let y = mouseY + 25; // 25px below cursor for lower positioning

    // Get tooltip dimensions if available
    if (tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const tooltipWidth = tooltipRect.width;
      const tooltipHeight = tooltipRect.height;

      // Center tooltip horizontally with respect to cursor
      x = mouseX - tooltipWidth / 2;

      // Prevent tooltip from going off-screen horizontally
      if (x + tooltipWidth > window.innerWidth) {
        x = mouseX - tooltipWidth - 10;
      }

      // Prevent tooltip from going off-screen vertically
      if (y + tooltipHeight > window.innerHeight) {
        y = mouseY - tooltipHeight - 10;
      }

      // Ensure tooltip doesn't go off the left edge
      if (x < 0) {
        x = 10;
      }

      // Ensure tooltip doesn't go off the top edge
      if (y < 0) {
        y = 10;
      }
    }

    setTooltipPosition({ x, y });
  };

  const buttonStyle =
    variant === "filled"
      ? {
          boxShadow: "0 4px 15px rgba(30, 136, 229, 0.2)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }
      : variant === "outline"
        ? {
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }
        : {};

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        {...props}
      >
        {/* Shimmer effect for filled buttons */}
        {variant === "filled" && (
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-600 group-hover:translate-x-full" />
        )}

        {/* Shimmer effect for outline buttons */}
        {variant === "outline" && (
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-600 group-hover:translate-x-full" />
        )}

        <span className="relative z-10">{children}</span>
      </button>

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div
          ref={tooltipRef}
          className="fixed max-w-xs rounded-lg border border-gray-700 px-4 py-3 text-sm text-white shadow-xl"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: "none",
            backgroundColor: "rgba(17, 24, 39, 0.8)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 9999,
          }}
        >
          <div className="leading-relaxed whitespace-normal">{tooltip}</div>
        </div>
      )}
    </div>
  );
}
