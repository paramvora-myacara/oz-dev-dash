const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAdminSetup() {
  console.log('Testing admin setup...\n')

  try {
    // Test 1: Check admin users
    console.log('1. Checking admin users...')
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email')
    
    if (adminError) {
      console.error('❌ Error fetching admin users:', adminError)
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):`)
      adminUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`)
      })
    }

    // Test 2: Check admin user listings
    console.log('\n2. Checking admin user listings...')
    const { data: userListings, error: listingsError } = await supabase
      .from('admin_user_listings')
      .select('user_id, listing_slug')
    
    if (listingsError) {
      console.error('❌ Error fetching admin user listings:', listingsError)
    } else {
      console.log(`✅ Found ${userListings.length} admin user listing(s):`)
      userListings.forEach(listing => {
        console.log(`   - User ${listing.user_id} can edit ${listing.listing_slug}`)
      })
    }

    // Test 3: Check domains
    console.log('\n3. Checking domains...')
    const { data: domains, error: domainsError } = await supabase
      .from('domains')
      .select('hostname, listing_slug')
    
    if (domainsError) {
      console.error('❌ Error fetching domains:', domainsError)
    } else {
      console.log(`✅ Found ${domains.length} domain(s):`)
      domains.forEach(domain => {
        console.log(`   - ${domain.hostname} -> ${domain.listing_slug}`)
      })
    }

    console.log('\n✅ Admin setup verification complete!')
    console.log('\nNext steps:')
    console.log('1. Start your dev server: npm run dev')
    console.log('2. Visit http://localhost:3000/admin/login')
    console.log('3. Login with your admin credentials')
    console.log('4. You should see your assigned listings in the dashboard')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAdminSetup() 