import { createAdminClient } from '../src/utils/supabase/admin';

interface IncompleteData {
  details: {
    marketAnalysis: any;
    sponsorProfile: any;
    financialReturns: any;
    propertyOverview: any;
  };
}

interface CompleteListing {
  listingName: string;
  listingSlug: string;
  projectId: string;
  sections: any[];
  details: {
    financialReturns: any;
    propertyOverview: any;
    marketAnalysis: any;
    sponsorProfile: any;
  };
}

// Import the original data to reconstruct the missing fields
import { soGoodDallasData } from '../src/lib/listings/sogood-dallas';

async function fixIncompleteData() {
  const supabase = createAdminClient();
  
  console.log('Checking for incomplete data in listing_versions...');
  
  // Get all versions that might have incomplete data
  const { data: versions, error } = await supabase
    .from('listing_versions')
    .select('id, data, listing_id')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching versions:', error);
    return;
  }
  
  console.log(`Found ${versions?.length || 0} versions to check`);
  
  for (const version of versions || []) {
    const data = version.data as any;
    
    // Check if this is incomplete data (only has details)
    if (data && data.details && !data.listingName && !data.sections) {
      console.log(`Fixing incomplete data for version ${version.id}...`);
      
      // Reconstruct the complete data using the original template
      const completeData: CompleteListing = {
        listingName: soGoodDallasData.listingName,
        listingSlug: soGoodDallasData.listingSlug,
        projectId: soGoodDallasData.projectId,
        sections: soGoodDallasData.sections,
        details: data.details // Keep the updated details
      };
      
      // Update the version with complete data
      const { error: updateError } = await supabase
        .from('listing_versions')
        .update({ data: completeData })
        .eq('id', version.id);
        
      if (updateError) {
        console.error(`Error updating version ${version.id}:`, updateError);
      } else {
        console.log(`✓ Fixed version ${version.id}`);
      }
    }
  }
  
  console.log('Data fix completed!');
}

// Run the fix
fixIncompleteData().catch(console.error); 