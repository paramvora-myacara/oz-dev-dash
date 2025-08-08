import { createClient } from '@supabase/supabase-js';

async function testMigration() {
  console.log('Testing migration status...\n');
  
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test 1: Check if listings table has data
    console.log('1. Checking listings table...');
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('*');
      
    if (listingsError) {
      console.error('❌ Error fetching listings:', listingsError);
      return;
    }
    
    console.log(`✅ Found ${listings?.length || 0} listings`);
    if (listings) {
      listings.forEach(listing => {
        console.log(`   - ${listing.title} (${listing.slug})`);
      });
    }
    
    // Test 2: Check if listing_versions table has data
    console.log('\n2. Checking listing_versions table...');
    const { data: versions, error: versionsError } = await supabase
      .from('listing_versions')
      .select('*');
      
    if (versionsError) {
      console.error('❌ Error fetching versions:', versionsError);
      return;
    }
    
    console.log(`✅ Found ${versions?.length || 0} versions`);
    
    // Test 3: Test fetching a specific listing
    console.log('\n3. Testing getPublishedListingBySlug...');
    const { data: testListing, error: testError } = await supabase
      .from('listings')
      .select('id, current_version_id')
      .eq('slug', 'the-edge-on-main')
      .single();
      
    if (testError || !testListing) {
      console.error('❌ Error fetching test listing:', testError);
      return;
    }
    
    console.log('✅ Test listing found:', testListing);
    
    if (testListing.current_version_id) {
      const { data: versionData, error: versionError } = await supabase
        .from('listing_versions')
        .select('data')
        .eq('id', testListing.current_version_id)
        .single();
        
      if (versionError) {
        console.error('❌ Error fetching version data:', versionError);
        return;
      }
      
      console.log('✅ Version data found:', {
        listingName: versionData?.data?.listingName,
        listingSlug: versionData?.data?.listingSlug,
        sectionsCount: versionData?.data?.sections?.length || 0
      });
    }
    
    console.log('\n🎉 Migration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMigration(); 