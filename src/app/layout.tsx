import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800;900&display=swap" rel="stylesheet" />
        {/* SignWell Script for Confidentiality Agreement Signing */}
        <script src="https://static.signwell.com/assets/embedded.js"></script>
      </head>
      <body className="bg-white dark:bg-black antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutWrapper>{children}</LayoutWrapper>
          {/* High z-index container for SignWell embedded modal */}
          <div id="signwell-modal-root" className="signwell-modal-root" />
        </ThemeProvider>
      </body>
    </html>
  );
}
