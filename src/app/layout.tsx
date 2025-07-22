import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import ThemeToggle from "../components/theme-toggle";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "ACARA Opportunity Zone Fund I LLC",
  description: "Premium Multifamily Investment Opportunity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-white dark:bg-black antialiased">
        <div className="min-h-screen">
          {/* Theme Toggle - Positioned in top right */}
          <div className="fixed right-8 top-8 z-50">
            <ThemeToggle />
          </div>
          
          <main>{children}</main>
          {/* Persistent OZListings Pill */}
          <div className="fixed bottom-6 right-6 z-50">
            <a
              href={`${process.env.NEXT_PUBLIC_SCHEDULE_CALL_LINK}?endpoint=dev_dash_powered_by_ozl`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 rounded-full shadow-lg text-sm font-semibold opacity-90 hover:opacity-100 transition-opacity cursor-pointer select-none"
            >
              Powered by OZListings
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
