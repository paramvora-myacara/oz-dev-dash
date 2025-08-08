'use client';

import { useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  email: string;
}

interface AdminData {
  user: AdminUser;
  listings: Array<{
    listing_slug: string;
    hostname?: string;
  }>;
}

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch('/api/admin/me');
        if (response.ok) {
          const data = await response.json();
          setAdminData(data);
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  const canEditSlug = (slug: string): boolean => {
    if (!adminData || !isAdmin) return false;
    return adminData.listings.some(listing => listing.listing_slug === slug);
  };

  return {
    isAdmin,
    adminData,
    isLoading,
    canEditSlug,
  };
} 