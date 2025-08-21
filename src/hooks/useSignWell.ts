'use client'

import { useState, useCallback } from 'react'

export function useSignWell() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // SignWell document creation function
  const createSignWellDocument = useCallback(async (
    fullName: string, 
    email: string,
    slug: string,
    onSuccess?: (slug: string) => void
  ) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Creating SignWell document with:', { fullName, email, slug });
      const response = await fetch('/api/signwell/create-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          targetSlug: slug
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create SignWell document:", errorData);
        console.error("Response status:", response.status);
        console.error("Response headers:", Object.fromEntries(response.headers.entries()));
        console.error("Request payload sent:", { fullName, email, slug });
        setError(`Failed to create document. Status: ${response.status}. Please try again.`);
        return;
      }

      const { embeddedSigningUrl } = await response.json()
      console.log('SignWell document created, URL:', embeddedSigningUrl);
      
      // Wait for SignWell script to load with a timeout
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      
      const waitForSignWell = () => {
        attempts++;
        console.log(`Attempt ${attempts}: Checking if SignWellEmbed is available...`);
        
        // Check multiple possible global variable names
        const signWellEmbed = (window as any).SignWellEmbed || (window as any).signwell?.Embed || (window as any).SignWell?.Embed;
        
        if (typeof signWellEmbed !== 'undefined') {
          console.log('SignWell embedded signing found, opening modal...');
          openSignWellModal(embeddedSigningUrl, signWellEmbed, slug, onSuccess);
          return;
        }
        
        // Log what we found for debugging
        if (attempts === 1) {
          console.log('Debugging SignWell globals:');
          console.log('window.SignWellEmbed:', typeof (window as any).SignWellEmbed);
          console.log('window.signwell:', (window as any).signwell);
          console.log('window.SignWell:', (window as any).SignWell);
          
          // Check all global variables that might contain SignWell
          const globalVars = Object.keys(window).filter(key => 
            key.toLowerCase().includes('signwell') || 
            key.toLowerCase().includes('sign') ||
            key.toLowerCase().includes('embed')
          );
          console.log('Potential SignWell globals:', globalVars);
        }
        
        if (attempts >= maxAttempts) {
          console.error('SignWellEmbed failed to load after 5 seconds');
          setError("SignWell failed to load. Please refresh the page and try again.");
          return;
        }
        
        // Wait 100ms before next attempt
        setTimeout(waitForSignWell, 100);
      };
      
      const openSignWellModal = (url: string, SignWellConstructor: any, slug: string, onSuccess?: (slug: string) => void) => {
        try {
          // Open SignWell embedded signing
          const signWellEmbed = new SignWellConstructor({
            url: url,
            events: {
              completed: async (e: any) => {
                console.log('SignWell signing completed');
                
                // Call success callback if provided
                if (onSuccess) {
                  onSuccess(slug)
                }
              },
              closed: (e: any) => {
                // Handle modal close
                console.log('SignWell modal closed')
              }
            }
          })
          
          signWellEmbed.open()
        } catch (error) {
          console.error('Error opening SignWell modal:', error);
          setError("Failed to open signing modal. Please try again.");
        }
      };
      
      // Start waiting for SignWell to load
      waitForSignWell();
      
    } catch (error) {
      console.error('Error in createSignWellDocument:', error);
      setError("An error occurred while creating the document.");
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    createSignWellDocument,
    isLoading,
    error,
    setError,
  }
} 