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

// Helper function to check if admin cookie exists
function hasAdminCookie(): boolean {
  if (typeof document === 'undefined') return false;
  
  const hasCookie = document.cookie
    .split(';')
    .some(cookie => cookie.trim().startsWith('oz_admin_ui='));
  
  return hasCookie;
}

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
      // First check if admin cookie exists client-side
      if (!hasAdminCookie()) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      // Only make API call if admin cookie is present
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
    if (!adminData || isAdmin !== true) {
      return false;
    }
    
    const canEdit = adminData.listings.some(listing => listing.listing_slug === slug);
    return canEdit;
  };

  return {
    isAdmin,
    adminData,
    isLoading,
    canEditSlug,
  };
} 