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
        </div>
      </body>
    </html>
  );
}
