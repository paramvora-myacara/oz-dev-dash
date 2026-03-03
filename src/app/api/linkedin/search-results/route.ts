import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Deprecated: call_log_id column dropped in favor of CRM person_id
    console.log('[Legacy API] GET /api/linkedin/search-results called - returning empty');
    return NextResponse.json({ data: [] });
}

