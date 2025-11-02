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

  // Theme detection
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const logoSrc = isDark
    ? "/OZListings-Dark.png"
    : "/OZListings-Light-removebg.png";
  const iconBaseColor = isDark ? "text-white" : "text-black";
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
        ref={footerRef}
        className={`relative w-full overflow-hidden border-t ${borderColorClass} transition-colors duration-300 ${isDark ? "bg-black text-white" : "bg-white text-[#212C38]"}`}
        style={{ paddingTop: "1rem", paddingBottom: "1rem" }}
      >
        {/* Logo and Social Icons */}
        <div className="mb-4 flex flex-col items-center">
          <a href="https://ozlistings.com" className="mb-2 block">
            <Image
              src={logoSrc}
              alt="OZ Listings Logo"
              width={200}
              height={20}
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
        <div className="px-4 text-center text-xs text-[#212C38] dark:text-white/60">
          <span className="mb-2 block">
            &copy; {new Date().getFullYear()} OZ Listings™. All rights reserved.
          </span>
          <div className="mx-auto mt-2 max-w-xs text-[11px] text-[#4b5563] dark:text-white/50">
            <p>
              OZ Listings is a marketing platform and does not offer, solicit,
              or sell securities. The information provided on this website is
              for general informational purposes only and should not be
              construed as investment, tax, or legal advice. OZ Listings does
              not operate as a broker-dealer, funding portal, or investment
              adviser and does not recommend or endorse any specific securities,
              offerings, or issuers. All investments carry risk, including the
              potential loss of principal. Opportunity Zone investments are
              subject to complex IRS rules and may not be suitable for all
              investors. Eligibility for associated tax benefits depends on a
              variety of factors and should be evaluated in consultation with
              your own legal, tax, and financial advisors. OZ Listings makes no
              representations or warranties as to the accuracy, completeness, or
              timeliness of any third-party project information, financial
              projections, or associated content.
            </p>
          </div>
          <div
            className={`mx-auto mt-4 h-px ${gradientLineClass}`}
            style={{ width: "7rem" }}
          />
          {/* Legal Disclosures & Terms Links */}
          <div className="mt-4 flex flex-col items-center gap-1 text-[11px] text-black/60 dark:text-white/60">
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
      className={`relative w-full overflow-hidden border-t ${borderColorClass} transition-colors duration-300 ${isDark ? "bg-black text-white" : "bg-white"}`}
      style={{ paddingTop: "1.5rem", paddingBottom: "1.5rem" }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-0 dark:opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #1e88e5 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, #42a5f5 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Floating decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-transparent dark:bg-[#1e88e5]/20"
            animate={{
              x: [0, 100, 0],
              y: [0, -80, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + i * 15}%`,
            }}
          />
        ))}
      </div>

      {/* Logo and Social Icons - Top Left Corner with Relative Spacing */}
      <motion.div
        className="absolute top-8 left-8 z-20 flex flex-col"
        variants={containerVariants}
      >
        {/* Logo */}
        <motion.div
          className="mb-4"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <a href="https://ozlistings.com" className="block cursor-pointer">
            <Image
              src={logoSrc}
              alt="OZ Listings Logo"
              width={300}
              height={24}
              className="transition-all duration-300"
              priority
            />
          </a>
        </motion.div>

        {/* Social Media Icons - Directly Below Logo */}
        <motion.div
          className="flex flex-row gap-6"
          variants={containerVariants}
        >
          {socialLinks.map(({ icon: Icon, href, label }, index) => (
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
                size={28}
                className={`relative z-10 transition-colors duration-300 ${iconBaseColor}`}
              />
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      {/* Enhanced Copyright */}
      <motion.div
        className="relative z-10 text-center text-sm text-[#212C38] dark:text-white/60"
        style={{ marginTop: "1rem" }}
        variants={itemVariants}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          &copy; {new Date().getFullYear()} OZ Listings. All rights reserved.
        </motion.span>

        <motion.div
          className="relative z-10 mx-auto mt-2 max-w-4xl px-4 text-xs text-[#4b5563] dark:text-white/50"
          variants={itemVariants}
        >
          <p>
            OZ Listings™ is a marketing platform and does not offer, solicit, or
            sell securities. The information provided on this website is for
            general informational purposes only and should not be construed as
            investment, tax, or legal advice. OZ Listings does not operate as a
            broker-dealer, funding portal, or investment adviser and does not
            recommend or endorse any specific securities, offerings, or issuers.
            All investments carry risk, including the potential loss of
            principal. Opportunity Zone investments are subject to complex IRS
            rules and may not be suitable for all investors. Eligibility for
            associated tax benefits depends on a variety of factors and should
            be evaluated in consultation with your own legal, tax, and financial
            advisors. OZ Listings makes no representations or warranties as to
            the accuracy, completeness, or timeliness of any third-party project
            information, financial projections, or associated content.
          </p>
        </motion.div>

        {/* Subtle decorative line */}
        <motion.div
          className={`mx-auto h-px ${gradientLineClass}`}
          style={{ width: "9.375rem", marginTop: "0.5rem" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        />

        {/* Legal Disclosures & Terms Links */}
        <div className="mt-4 flex flex-row justify-center gap-6 text-xs text-black/60 dark:text-white/60">
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
      </motion.div>
    </motion.footer>
  );
}
