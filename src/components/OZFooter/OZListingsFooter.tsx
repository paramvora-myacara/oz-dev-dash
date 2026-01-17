"use client";
import { FaLinkedin, FaYoutube, FaFacebook } from "react-icons/fa6";
import Image from "next/image";
import { motion, useInView, Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";

const socialLinks = [
  {
    icon: FaLinkedin,
    href: "https://www.linkedin.com/company/ozlistings",
    label: "LinkedIn",
  },
  {
    icon: FaYoutube,
    href: "https://www.youtube.com/@ozlistings",
    label: "YouTube",
  },
  {
    icon: FaFacebook,
    href: "https://www.facebook.com/opportunityzonelistings",
    label: "Facebook",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

export default function OZListingsFooter({ 
  openLegalModal 
}: { 
  openLegalModal: (type: 'disclosures' | 'terms' | 'privacy') => void;
}) {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // Theme detection - Force Navy/Dark style for footer site-wide
  const isDark = true;
  const logoSrc = "/OZListings-Dark.png";
  const iconBaseColor = "text-white";
  const borderColorClass = isDark ? "border-white/20" : "border-black/20";
  const gradientLineClass = isDark
    ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
    : "bg-gradient-to-r from-transparent via-black/20 to-transparent";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile === null) return null;

  // MOBILE FOOTER
  if (isMobile) {
    return (
      <footer
        className={`relative w-full overflow-hidden border-t ${borderColorClass} transition-colors duration-300 ${isDark ? "bg-black text-white" : "bg-white text-[#212C38]"}`}
        style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
      >
        {/* Logo and Social Icons */}
        <div className="mb-6 flex flex-col items-center">
          <a href="/" className="mb-4 block">
            <Image
              src={logoSrc}
              alt="OZ Listings Logo"
              width={140}
              height={30}
              className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] transform"
              priority
            />
          </a>
          <div className="mb-1 flex flex-row gap-6">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative transition-all duration-300 hover:scale-110 active:scale-[0.98] transform"
                aria-label={label}
              >
                <Icon
                  size={24}
                  className={`${iconBaseColor} transition-colors duration-300`}
                />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="px-6 text-center text-xs text-white/80">
          <span className="font-brand-normal mb-3 block">
            &copy; {new Date().getFullYear()} OZ Listings™. All rights reserved.
          </span>
          <div className="mx-auto mt-2 max-w-sm text-[11px] text-white/60 leading-relaxed">
            <p>
              OZ Listings is a marketing platform and does not offer, solicit,
              or sell securities. The information provided on this website is
              for general informational purposes only and should not be
              construed as investment, tax, or legal advice. All investments carry risk.
            </p>
          </div>
          <div
            className={`mx-auto mt-6 h-px ${gradientLineClass}`}
            style={{ width: "4rem" }}
          />
          {/* Legal Disclosures & Terms Links */}
          <div className="mt-6 flex flex-col items-center gap-3 text-[11px] text-white/60">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openLegalModal("disclosures");
              }}
              className="hover:underline"
            >
              Legal Disclosures
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openLegalModal("privacy");
              }}
              className="hover:underline"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openLegalModal("terms");
              }}
              className="hover:underline"
            >
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </footer>
    );
  }

  // DESKTOP FOOTER
  return (
    <motion.footer
      ref={footerRef}
      className={`relative w-full overflow-hidden border-t ${borderColorClass} transition-colors duration-300 bg-[#0B1221] text-white`}
      style={{ paddingTop: "3rem", paddingBottom: "3rem" }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-0 dark:opacity-5 pointer-events-none">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #1e88e5 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, #42a5f5 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Left Side: Logo and Disclaimer */}
        <div className="flex-1 max-w-2xl">
          <motion.div variants={itemVariants} className="mb-6">
            <a href="/" className="block cursor-pointer inline-block">
              <Image
                src={logoSrc}
                alt="OZ Listings Logo"
                width={140}
                height={32}
                className="h-8 w-auto transition-all duration-300"
                priority
              />
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="text-xs text-white/60 space-y-4 leading-relaxed text-left">
            <p>
              OZ Listings™ is a marketing platform and does not offer, solicit, or
              sell securities. The information provided on this website is for
              general informational purposes only and should not be construed as
              investment, tax, or legal advice. OZ Listings does not operate as a
              broker-dealer, funding portal, or investment adviser and does not
              recommend or endorse any specific securities, offerings, or issuers.
              All investments carry risk, including the potential loss of
              principal.
            </p>
            <p>
              Opportunity Zone investments are subject to complex IRS
              rules and may not be suitable for all investors. Eligibility for
              associated tax benefits depends on a variety of factors and should
              be evaluated in consultation with your own legal, tax, and financial
              advisors.
            </p>
            <div className="pt-4 flex gap-6 text-white/50">
               <span className="font-brand-normal">
                &copy; {new Date().getFullYear()} OZ Listings. All rights reserved.
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Links and Socials */}
        <div className="flex flex-col items-end gap-6">
           <motion.div
            className="flex flex-row gap-6"
            variants={containerVariants}
          >
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                aria-label={label}
                variants={itemVariants}
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon
                  size={20}
                  className={`relative z-10 transition-colors duration-300 ${iconBaseColor} hover:text-blue-500`}
                />
              </motion.a>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col items-end gap-2 text-xs text-white/60">
             <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openLegalModal("disclosures");
              }}
              className="hover:text-blue-400 transition-colors"
            >
              Legal Disclosures
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openLegalModal("privacy");
              }}
              className="hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openLegalModal("terms");
              }}
              className="hover:text-blue-400 transition-colors"
            >
              Terms &amp; Conditions
            </a>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
}
