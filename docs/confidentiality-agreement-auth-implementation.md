# Confidentiality Agreement Authentication Implementation Plan

## Overview

This document outlines the implementation of a new authentication flow that protects access to confidential investment materials (DD vault) by requiring users to sign a confidentiality agreement through SignWell before granting access to private Supabase buckets.

## Current State Analysis

### Existing Authentication Flow
- **Public users**: Can access listing pages without authentication
- **Event tracking**: Users redirected from sister sites have UIDs stored in session storage for analytics
- **Vault access**: Currently unprotected - users can access DD vault without authentication
- **Supabase auth**: Used for event tracking but not for protecting content

### Current Vault Access Implementation
- **New listing pages**: Direct navigation to `/[slug]/access-dd-vault` (no auth required)
- **Legacy pages**: Show auth modal for "Request Vault Access" but don't actually protect vault
- **Files**: Stored in private Supabase bucket but accessible without proper authentication

## New Authentication Flow Requirements

### Core Requirements
1. **Protect DD vault access** with Supabase authentication
2. **Require confidentiality agreement** signature before vault access
3. **Maintain event tracking** for users from sister sites
4. **Seamless user experience** with auto-fill for known users
5. **Single modal interface** that handles both CA signing and authentication

### User Scenarios

#### Scenario 1: User with UID + Supabase Session
- **Source**: Redirected from sister site with `?uid=abc123`
- **Current state**: Has tracking UID and active Supabase session
- **Flow**: Auto-fill CA form, skip to signing, proceed to vault

#### Scenario 2: User with UID but NO Supabase Session
- **Source**: Redirected from sister site with `?uid=abc123`
- **Current state**: Has tracking UID but no active Supabase session
- **Flow**: Auto-fill CA form, after signing use stored email + hardcoded password to authenticate into Supabase

#### Scenario 3: Completely New User
- **Source**: Direct visit to site
- **Current state**: No UID, no Supabase session
- **Flow**: Empty CA form, after signing create new Supabase user, proceed to vault

## Technical Implementation

### 1. Update useAuth Hook (`src/hooks/useAuth.ts`)

#### New State Variables
```typescript
export type AuthModalStep = 'identify' | 'sign'

const [modalStep, setModalStep] = useState<AuthModalStep>('identify')
const [userFullName, setUserFullName] = useState<string | null>(null)
const [userEmail, setUserEmail] = useState<string | null>(null)
const [targetSlug, setTargetSlug] = useState<string | null>(null)
```

#### Enhanced User Data Fetching
```typescript
useEffect(() => {
  const fetchUserAndAuth = async () => {
    if (userId) {
      // Check for active Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      
      // Fetch user details from public.users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', userId)
        .single()
      
      if (userData) {
        setUserFullName(userData.full_name)
        setUserEmail(userData.email)
        
        // Auto-login if no session but we have user data
        if (!session && userData.email) {
          const password = `${userData.email}_password`
          await supabase.auth.signInWithPassword({
            email: userData.email,
            password: password
          })
        }
      }
    }
  }
  
  fetchUserAndAuth()
}, [userId, supabase])
```

#### Modified handleRequestVaultAccess
```typescript
const handleRequestVaultAccess = useCallback((slug: string) => {
  setTargetSlug(slug)
  
  if (userId && userFullName && userEmail) {
    // Known user - go directly to CA signing
    setModalStep('sign')
    trackEvent(userId, 'request_vault_access', { propertyId: slug })
  } else {
    // New user - start with identification
    setModalStep('identify')
  }
  
  setIsAuthModalOpen(true)
}, [userId, userFullName, userEmail, trackEvent])
```

#### New CA Submission Handler
```typescript
const handleCASubmission = useCallback(async (
  fullName: string, 
  email: string, 
  company?: string, 
  title?: string
) => {
  setIsLoading(true)
  setAuthError(null)
  
  try {
    // If user exists but no session, authenticate them
    if (userId && !supabase.auth.getSession()) {
      const password = `${email}_password`
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
    }
    
    // If no user exists, create new one
    if (!userId) {
      const password = `${email}_password`
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
      
      // Update user profile
      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          updated_at: new Date().toISOString()
        })
      }
    }
    
    // Create SignWell document
    await createSignWellDocument(fullName, email, company, title)
    
  } catch (error: any) {
    setAuthError(error.message)
  } finally {
    setIsLoading(false)
  }
}, [userId, supabase])
```

### 2. Transform AuthModal Component (`src/components/AuthModal.tsx`)

#### New Props Interface
```typescript
interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (fullName: string, email: string, company?: string, title?: string) => void
  isLoading: boolean
  authError: string | null
  step: 'identify' | 'sign'
  userFullName?: string | null
  userEmail?: string | null
}
```

#### CA Form Fields
```typescript
const [fullName, setFullName] = useState(userFullName || '')
const [email, setEmail] = useState(userEmail || '')
const [company, setCompany] = useState('')
const [title, setTitle] = useState('')

// Auto-fill when props change
useEffect(() => {
  if (userFullName) setFullName(userFullName)
  if (userEmail) setEmail(userEmail)
}, [userFullName, userEmail])
```

#### Form Layout
```typescript
<form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Name *
    </label>
    <input
      type="text"
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      required
      disabled={!!userFullName} // Disable if auto-filled
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Email *
    </label>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      required
      disabled={!!userEmail} // Disable if auto-filled
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Company (optional)
    </label>
    <input
      type="text"
      value={company}
      onChange={(e) => setCompany(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Title (optional)
    </label>
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
    />
  </div>
  
  <button
    type="submit"
    disabled={isLoading}
    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
  >
    {isLoading ? 'Processing...' : 'Sign Confidentiality Agreement'}
  </button>
</form>
```

### 3. SignWell Integration

#### Environment Variables
```bash
NEXT_PUBLIC_SIGNWELL_API_KEY=your_api_key_here
NEXT_PUBLIC_SIGNWELL_TEMPLATE_ID=your_template_id_here
```

#### Create Document Function
```typescript
const createSignWellDocument = async (
  fullName: string, 
  email: string, 
  company?: string, 
  title?: string
) => {
  const response = await fetch('/api/signwell/create-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName,
      email,
      company,
      title,
      targetSlug
    })
  })
  
  const { embeddedSigningUrl } = await response.json()
  
  // Open SignWell embedded signing
  const signWellEmbed = new SignWellEmbed({
    url: embeddedSigningUrl,
    events: {
      completed: (e) => {
        // Redirect to vault after successful signing
        window.location.href = `/${targetSlug}/access-dd-vault`
      },
      closed: (e) => {
        // Handle modal close
      }
    }
  })
  
  signWellEmbed.open()
}
```

#### API Route (`src/app/api/signwell/create-document/route.ts`)
```typescript
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { fullName, email, company, title, targetSlug } = await request.json()
  
  const signWellData = {
    test_mode: process.env.NODE_ENV === 'development',
    template_id: process.env.NEXT_PUBLIC_SIGNWELL_TEMPLATE_ID,
    embedded_signing: true,
    recipients: [
      {
        id: "1",
        placeholder_name: "Recipient",
        name: fullName,
        email: email
      }
    ],
    metadata: {
      company,
      title,
      targetSlug,
      timestamp: new Date().toISOString()
    }
  }
  
  const response = await fetch('https://www.signwell.com/api/v1/document_templates/documents/', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.NEXT_PUBLIC_SIGNWELL_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(signWellData)
  })
  
  const documentData = await response.json()
  
  return NextResponse.json({
    embeddedSigningUrl: documentData.recipients[0].embedded_signing_url
  })
}
```

### 4. Update Listing Pages

#### Modify Listing Page Client (`src/app/[slug]/listing-page-client.tsx`)
```typescript
// Replace direct navigation with new auth flow
const handleVaultAccess = () => {
  handleRequestVaultAccess(listing.listingSlug)
}

// Update button onClick
<button
  onClick={handleVaultAccess}
  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
>
  Request Vault Access
</button>
```

### 5. Protect DD Vault Page

#### Update Vault Page (`src/app/[slug]/access-dd-vault/page.tsx`)
```typescript
import { createClient } from '@/utils/supabase/client'
import { redirect } from 'next/navigation'

export default async function DDVVaultPage({ params }: DDVVaultPageProps) {
  const { slug } = await params
  
  // Check for valid Supabase session
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/') // Redirect to home if no session
  }
  
  // Continue with existing logic...
  const listing = await getPublishedListingBySlug(slug)
  const files = await getDDVFiles(slug)
  
  return (
    <DDVVaultClient 
      listing={listing} 
      files={files} 
      slug={slug} 
    />
  )
}
```

#### Protect File Download API (`src/app/api/ddv/[slug]/download/route.ts`)
```typescript
import { createClient } from '@/utils/supabase/client'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Verify Supabase session
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Continue with existing download logic...
}
```

## Implementation Steps

### Phase 1: Core Authentication Logic
1. Update `useAuth` hook with new state and logic
2. Transform `AuthModal` to CA form
3. Test basic form functionality

### Phase 2: SignWell Integration
1. Set up SignWell API credentials
2. Create document creation API route
3. Integrate embedded signing in modal
4. Test document creation and signing flow

### Phase 3: Vault Protection
1. Protect DD vault page with session check
2. Protect file download API with session check
3. Test access control

### Phase 4: Testing & Refinement
1. Test all user scenarios
2. Verify event tracking continues to work
3. Test edge cases and error handling

## Security Considerations

### Authentication
- **Supabase sessions** required for all vault access
- **Session validation** on both client and server side
- **Automatic session refresh** handled by Supabase client

### Data Protection
- **Private bucket access** only with valid session
- **User permissions** validated before file access
- **Audit trail** maintained through SignWell metadata

### User Experience
- **Seamless auto-login** for known users
- **Single form interface** reduces friction
- **Clear error messages** for authentication failures

## Future Enhancements

### Advanced Features
- **Document storage** of signed agreements in Supabase
- **Admin dashboard** for viewing signed agreements
- **Email notifications** when agreements are signed
- **Agreement expiration** and renewal workflows

### Analytics
- **Signing completion rates** tracking
- **Time to sign** metrics
- **Drop-off analysis** at each step
- **User journey optimization**

## Conclusion

This implementation provides a secure, user-friendly way to protect confidential investment materials while maintaining the existing event tracking system. The integration of SignWell for e-signatures ensures legal compliance while the Supabase authentication protects the actual content access.

The key innovation is using the same form fields for both the confidentiality agreement and user authentication, creating a streamlined experience that serves both purposes without duplication. 