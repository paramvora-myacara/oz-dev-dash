'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/OZHeader/Header';
import FooterWrapper from '@/components/OZFooter/FooterWrapper';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="fixed top-0 left-0 right-0 z-50 h-20 bg-white dark:bg-black" />}>
        <Header />
      </Suspense>
      <main className="flex-1 pt-20">{children}</main>
      <FooterWrapper />
      {/* Persistent OZListings Pill */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={`${process.env.NEXT_PUBLIC_SCHEDULE_CALL_LINK}?endpoint=dev_dash_powered_by_ozl&userType=Developer&advertise=true`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 rounded-full shadow-lg text-sm font-semibold opacity-90 hover:opacity-100 transition-opacity cursor-pointer select-none"
        >
          Powered by OZListings
        </a>
      </div>
    </div>
  );
}
