'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthentication } from '@/hooks/useAuthentication';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

export default function Navbar() {
    const { userId, signOut } = useAuthentication();
    const { resolvedTheme, mounted } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Navigation handlers - using direct router.push since we don't have useAuthNavigation
    const handleListings = () => {
        router.push('/listings');
    };

    const handleScheduleCall = () => {
        router.push(`/schedule-a-call?endpoint=${pathname}`);
    };

    const handleInvest = () => {
        router.push('/invest');
    };

    const handleCommunity = () => {
        router.push('/community');
    };

    const handleDevelopers = () => {
        router.push('/developers');
    };

    const handleLogout = async () => {
        await signOut();
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent hydration mismatch
    const currentTheme = mounted ? resolvedTheme : 'light';

    const NavContent = () => (
        <>
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
                <div className="relative h-10 w-40">
                    <Image
                        src={
                            currentTheme === "dark"
                                ? "/OZListings-Dark.png"
                                : "/OZListings-Light-removebg.png"
                        }
                        alt="OZ Listings"
                        fill
                        className="object-contain object-left"
                        priority
                        unoptimized
                    />
                </div>
            </Link>

            {/* Desktop Links & Actions */}
            <div className="hidden lg:flex items-center gap-8">
                <Link
                    href="/invest"
                    onClick={handleInvest}
                    className={`text-navy font-semibold hover:text-primary transition-all duration-200 py-1 border-b-2 ${pathname === '/invest' ? 'text-primary border-primary' : 'border-transparent'
                        }`}
                >
                    Investors
                </Link>
                <button
                    onClick={handleListings}
                    className={`text-navy font-semibold hover:text-primary transition-all duration-200 py-1 border-b-2 ${pathname === '/listings' ? 'text-primary border-primary' : 'border-transparent'
                        }`}
                >
                    Listings
                </button>
                <Link
                    href="/community"
                    onClick={handleCommunity}
                    className={`text-navy font-semibold hover:text-primary transition-all duration-200 py-1 border-b-2 ${pathname === '/community' ? 'text-primary border-primary' : 'border-transparent'
                        }`}
                >
                    Community
                </Link>
                <Link
                    href="/developers"
                    onClick={handleDevelopers}
                    className={`text-navy font-semibold hover:text-primary transition-all duration-200 py-1 border-b-2 ${pathname === '/developers' ? 'text-primary border-primary' : 'border-transparent'
                        }`}
                >
                    Developers
                </Link>
                <button
                    onClick={handleScheduleCall}
                    className={`text-navy font-semibold hover:text-primary transition-all duration-200 py-1 border-b-2 ${pathname === '/schedule-a-call' ? 'text-primary border-primary' : 'border-transparent'
                        }`}
                >
                    Schedule a Call
                </button>
                {userId && (
                    <motion.button
                        onClick={handleLogout}
                        className="rounded-lg p-2 transition-all duration-300 hover:bg-gray-100 focus:ring-2 focus:ring-[#1e88e5] focus:ring-offset-2 focus:outline-none dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Log out"
                        aria-label="Log out"
                    >
                        <LogOut
                            size={20}
                            className="text-gray-700 transition-colors duration-300 dark:text-gray-300"
                        />
                    </motion.button>
                )}
            </div>

            {/* Mobile Hamburger */}
            <div className="flex lg:hidden items-center gap-4">
                {/* Hamburger icon */}
                <button
                    className="rounded-lg p-2 w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#1e88e5] focus:outline-none bg-white/50 backdrop-blur-sm"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label="Open menu"
                >
                    {menuOpen ? (
                        <svg className="w-6 h-6 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-navy dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* 1. Initial Top Navbar */}
            <motion.nav
                initial={{ opacity: 1 }}
                animate={{
                    opacity: scrolled ? 0 : 1,
                    pointerEvents: scrolled ? 'none' : 'auto'
                }}
                transition={{ duration: 0.3 }}
                className="fixed top-0 w-full h-[60px] lg:h-[75px] left-0 z-40 bg-white dark:bg-black"
            >
                <div className="w-full h-full max-w-[1440px] mx-auto flex items-center justify-between px-4 sm:px-8">
                    <NavContent />
                </div>
            </motion.nav>

            {/* 2. Floating Scrolled Navbar */}
            <motion.nav
                initial={{ opacity: 0 }}
                animate={{
                    opacity: scrolled ? 1 : 0,
                    pointerEvents: scrolled ? 'auto' : 'none'
                }}
                transition={{ duration: 0.3 }}
                className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-[1440px] h-[70px] rounded-full shadow-2xl bg-white/95 dark:bg-black/95 backdrop-blur-sm z-50 flex items-center justify-between px-4 sm:px-8 mx-auto"
            >
                <NavContent />
            </motion.nav>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-[100px] left-4 right-4 z-50 rounded-2xl bg-white dark:bg-black p-4 shadow-2xl border border-gray-100 dark:border-white/10 lg:hidden"
                >
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/invest"
                            onClick={() => {
                                setMenuOpen(false);
                                handleInvest();
                            }}
                            className="px-4 py-3 rounded-xl text-lg font-medium text-navy dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Investors
                        </Link>
                        <button
                            onClick={() => {
                                setMenuOpen(false);
                                handleListings();
                            }}
                            className="px-4 py-3 rounded-xl text-lg font-medium text-navy dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                        >
                            Listings
                        </button>
                        <Link
                            href="/community"
                            onClick={() => {
                                setMenuOpen(false);
                                handleCommunity();
                            }}
                            className="px-4 py-3 rounded-xl text-lg font-medium text-navy dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Community
                        </Link>
                        <Link
                            href="/developers"
                            onClick={() => {
                                setMenuOpen(false);
                                handleDevelopers();
                            }}
                            className="px-4 py-3 rounded-xl text-lg font-medium text-navy dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            Developers
                        </Link>
                        <button
                            onClick={() => {
                                setMenuOpen(false);
                                handleScheduleCall();
                            }}
                            className="px-4 py-3 rounded-xl text-lg font-medium text-navy dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                        >
                            Schedule a Call
                        </button>
                        {userId && (
                            <button
                                onClick={async () => {
                                    setMenuOpen(false);
                                    await handleLogout();
                                }}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl text-lg font-medium text-navy dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
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
                    </div>
                </motion.div>
            )}
        </>
    );
}
