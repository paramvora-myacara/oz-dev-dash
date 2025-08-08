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
  
  console.log('Admin cookie check:', hasCookie);
  console.log('All cookies:', document.cookie);
  
  return hasCookie;
}

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
      console.log('Checking admin auth...');
      
      // First check if admin cookie exists client-side
      if (!hasAdminCookie()) {
        console.log('No admin cookie found, setting isAdmin to false');
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      console.log('Admin cookie found, making API call...');
      
      // Only make API call if admin cookie is present
      try {
        const response = await fetch('/api/admin/me');
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Admin data received:', data);
          setAdminData(data);
          setIsAdmin(true);
        } else {
          console.log('API call failed, setting isAdmin to false');
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
      console.log(`canEditSlug(${slug}): false (no admin data or not admin)`);
      return false;
    }
    
    const canEdit = adminData.listings.some(listing => listing.listing_slug === slug);
    console.log(`canEditSlug(${slug}):`, canEdit, { isAdmin, adminData: !!adminData });
    return canEdit;
  };

  return {
    isAdmin,
    adminData,
    isLoading,
    canEditSlug,
  };
} 