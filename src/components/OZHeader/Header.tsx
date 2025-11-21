"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, Menu, MessageSquare, X } from "lucide-react";
import ThemeLogo from "./ThemeLogo";
import CTAButton from "./CTAButton";
import ThemeSwitcher from "./ThemeSwitcher";
import { useAuthentication } from "@/hooks/useAuthentication";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isInSlideshow, setIsInSlideshow] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { userId, signOut } = useAuthentication();
  const pathname = usePathname();

  useEffect(() => {
    const handleSlideshowEnter = () => {
      setIsInSlideshow(true);
    };

    const handleSlideshowLeave = () => {
      setIsInSlideshow(false);
    };

    const handleFooterEnter = () => {
      setIsVisible(false);
    };

    const handleFooterLeave = () => {
      setIsVisible(true);
    };

    // Listen for slideshow and footer events
    window.addEventListener("slideshow-enter", handleSlideshowEnter);
    window.addEventListener("slideshow-leave", handleSlideshowLeave);
    window.addEventListener("footer-enter", handleFooterEnter);
    window.addEventListener("footer-leave", handleFooterLeave);

    return () => {
      window.removeEventListener("slideshow-enter", handleSlideshowEnter);
      window.removeEventListener("slideshow-leave", handleSlideshowLeave);
      window.removeEventListener("footer-enter", handleFooterEnter);
      window.removeEventListener("footer-leave", handleFooterLeave);
    };
  }, []);

  // Action handlers - use external links instead of navigateWithAuth
  const handleSpeakToTeam = () => {
    window.location.href = `https://ozlistings.com/schedule-a-call?endpoint=${pathname}`;
  };

  const handleInvest = () => {
    window.location.href = "https://ozlistings.com/invest";
  };

  const handleMarketplace = () => {
    window.location.href = "https://ozlistings.com/listings";
  };

  const handleCommunity = () => {
    window.location.href = "https://ozlistings.com/community";
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (!isVisible) return null;

  return (
    <motion.header
      className={`fixed top-0 right-0 left-0 z-50 p-4 md:pl-8 transition-all duration-500 ${isInSlideshow
          ? "bg-transparent backdrop-blur-none"
          : "bg-white/80 backdrop-blur-md dark:bg-black/80"
        }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <div className="flex w-full items-center justify-between">
        {/* Logo on the left */}
        <div className="flex-shrink-0">
          <ThemeLogo />
        </div>

        {/* Right side icons for mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          {/* Chat icon */}
          <Link href="https://ozlistings.com/invest">
            <motion.button
              className="rounded-xl p-2.5 w-10 h-10 flex items-center justify-center bg-[#1e88e5] hover:bg-[#1976d2] transition-all duration-200 shadow-lg shadow-[#1e88e5]/25 hover:shadow-[#1e88e5]/40 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1e88e5]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Chat with Ozzie AI"
              aria-label="Chat with Ozzie AI"
            >
              <motion.div
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <MessageSquare size={20} className="text-white" />
              </motion.div>
            </motion.button>
          </Link>

          {/* Theme switcher */}
          <ThemeSwitcher />

          {/* Hamburger icon */}
          <button
            className="rounded-lg p-2 w-9 h-9 flex items-center justify-center border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#1e88e5] focus:outline-none"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* CTA Buttons and Theme Switcher on the extreme right (desktop) */}
        <div className="hidden flex-row items-center gap-2 sm:flex">
          <CTAButton
            variant="text"
            size="lg"
            onClick={handleInvest}
            tooltip="Invest in qualifying Opportunity Zone funds."
            className="w-44 text-center px-4 py-2"
          >
            Investors
          </CTAButton>

          <CTAButton
            variant="text"
            size="lg"
            onClick={handleMarketplace}
            tooltip="Browse our listings of OZ deals."
            className="w-48 text-center px-4 py-2"
          >
            Listings
          </CTAButton>

          <CTAButton
            variant="text"
            size="lg"
            onClick={handleCommunity}
            tooltip="Explore our community features, interactive slideshow, and join our exclusive community."
            className="w-44 text-center px-4 py-2"
          >
            Community
          </CTAButton>

          <CTAButton
            variant="text"
            size="lg"
            onClick={handleSpeakToTeam}
            tooltip="Lets you book a one-on-one call with the OZ Listings team for tailored help."
            className="w-54 text-center px-4 py-2"
          >
            Schedule a call
          </CTAButton>

          {/* Logout button - only show when user is logged in */}
          {userId && (
            <motion.button
              onClick={handleLogout}
              className="rounded-lg p-2 transition-all duration-300 hover:bg-gray-100 focus:ring-2 focus:ring-[#1e88e5] focus:ring-offset-2 focus:outline-none dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Log out"
              aria-label="Log out"
            >
              <motion.div
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <LogOut
                  size={20}
                  className="text-gray-700 transition-colors duration-300 dark:text-gray-300"
                />
              </motion.div>
            </motion.button>
          )}

          {/* Add gap between Schedule a call button and theme switcher */}
          <div className="w-1"></div>

          <ThemeSwitcher />
        </div>
      </div>
      {/* Mobile dropdown menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          drag="y"
          dragConstraints={{ top: -100, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={(e, info) => {
            if (info.offset.y < -50) {
              setMenuOpen(false);
            }
          }}
          className="mt-2 flex flex-col gap-2 rounded-lg bg-white p-4 shadow-lg sm:hidden dark:bg-black cursor-grab active:cursor-grabbing"
        >
          <CTAButton
            variant="text"
            size="lg"
            onClick={() => {
              setMenuOpen(false);
              handleInvest();
            }}
            tooltip="Invest in qualifying Opportunity Zone funds."
          >
            Investors
          </CTAButton>
          <CTAButton
            variant="text"
            size="lg"
            onClick={() => {
              setMenuOpen(false);
              handleMarketplace();
            }}
            tooltip="Browse our listings of OZ deals."
          >
            Listings
          </CTAButton>
          <CTAButton
            variant="text"
            size="lg"
            onClick={() => {
              setMenuOpen(false);
              handleCommunity();
            }}
            tooltip="Explore our community features, interactive slideshow, and join our exclusive community."
          >
            Community
          </CTAButton>
          <CTAButton
            variant="text"
            size="lg"
            onClick={() => {
              setMenuOpen(false);
              handleSpeakToTeam();
            }}
            tooltip="Lets you book a one-on-one call with the OZ Listings team for tailored help."
          >
            Schedule a call
          </CTAButton>
          {userId && (
            <button
              onClick={async () => {
                setMenuOpen(false);
                await handleLogout();
              }}
              className="flex items-center gap-2 rounded-lg p-2 transition-all duration-300 hover:bg-gray-100 focus:ring-2 focus:ring-[#1e88e5] focus:ring-offset-2 focus:outline-none dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut
                size={20}
                className="text-gray-700 transition-colors duration-300 dark:text-gray-300"
              />
              <span>Log out</span>
            </button>
          )}
        </motion.div>
      )}
    </motion.header>
  );
}
