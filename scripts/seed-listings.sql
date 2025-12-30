-- Custom seed data for listings - run this after db reset
-- Sample listings for testing DDV functionality

-- Insert listing first without current_version_id to avoid circular dependency
INSERT INTO listings (id, slug, title, has_vault, developer_entity_name, developer_ca_name, created_at, updated_at) VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 'alden-brockton-ma', 'Alden Brockton MA Development', true, 'Alden Development Corp', 'John Smith', NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  has_vault = EXCLUDED.has_vault,
  developer_entity_name = EXCLUDED.developer_entity_name,
  developer_ca_name = EXCLUDED.developer_ca_name,
  updated_at = NOW();

-- Add sample listing version for the Alden Brockton MA listing
INSERT INTO listing_versions (id, listing_id, version_number, data, created_at, published_at, news_links) VALUES
  ('456e7890-e89b-12d3-a456-426614174001',
   '123e4567-e89b-12d3-a456-426614174000',
   1,
   '{
     "title": "Alden Brockton MA Development",
     "description": "A premier multifamily development project in Brockton, MA featuring modern amenities and sustainable design.",
     "location": {
       "address": "117 North Main Street, Brockton, MA",
       "city": "Brockton",
       "state": "MA",
       "coordinates": {"lat": 42.0834, "lng": -71.0184}
     },
     "projectDetails": {
       "propertyType": "Multifamily",
       "unitCount": 150,
       "squareFootage": 125000,
       "yearBuilt": 2024
     },
     "financials": {
       "totalInvestment": 25000000,
       "minimumInvestment": 50000,
       "targetIRR": 12.5,
       "projectedHoldPeriod": 7
     },
     "developer": {
       "entityName": "Alden Development Corp",
       "contactName": "John Smith",
       "contactEmail": "john.smith@aldendevelopment.com",
       "website": "https://aldendevelopment.com"
     },
     "images": {
       "general": ["alden-brockton-ma-001/general/img-1.jpeg"],
       "floorplan": ["alden-brockton-ma-001/floorplan/img-9.jpeg", "alden-brockton-ma-001/floorplan/img-10.jpeg", "alden-brockton-ma-001/floorplan/img-11.jpeg"],
       "sitemap": ["alden-brockton-ma-001/sitemap/img-2.jpeg"]
     },
     "status": "Development",
     "hasVault": true,
     "sections": [
       {
         "type": "hero",
         "data": {
           "listingName": "Alden Brockton MA Development",
           "location": "Brockton, MA",
           "minInvestment": 50000,
           "fundName": "Alden Development Corp Fund"
         }
       },
       {
         "type": "tickerMetrics",
         "data": {
           "metrics": [
             {
               "label": "10-Yr Equity Multiple",
               "value": "2.6x",
               "change": "+160%"
             },
             {
               "label": "Preferred Return",
               "value": "6%",
               "change": "Cumulative"
             },
             {
               "label": "Min Investment",
               "value": "$50K",
               "change": "Minimum"
             },
             {
               "label": "Location",
               "value": "Brockton, MA",
               "change": "Transit-Oriented"
             },
             {
               "label": "Hold Period",
               "value": "7 Years",
               "change": "OZ Qualified"
             },
             {
               "label": "Tax Benefit",
               "value": "100%",
               "change": "Tax-Free Growth"
             }
           ]
         }
       },
       {
         "type": "compellingReasons",
         "data": {
           "reasons": [
             {
               "title": "Prime Location",
               "description": "Located in Brockton, MA with excellent transit access and growing population.",
               "highlight": "Transit-Oriented Development",
               "icon": "location"
             },
             {
               "title": "Strong Financials",
               "description": "Projected 12.5% IRR with $25M total investment and solid hold period.",
               "highlight": "12.5% Target IRR",
               "icon": "financial"
             },
             {
               "title": "Experienced Developer",
               "description": "Alden Development Corp brings proven track record in multifamily development.",
               "highlight": "Proven Track Record",
               "icon": "developer"
             }
           ]
         }
       },
       {
         "type": "executiveSummary",
         "data": {
           "summary": {
             "quote": "The Alden Brockton MA Development represents a premier multifamily opportunity in a rapidly growing market, capturing strong regional housing demand through a fully entitled, transit-oriented development with substantial Opportunity Zone tax advantages.",
             "conclusion": "With a target IRR of 12.5%, a 7-year hold period, and minimum investment of $50K, The Alden offers investors an exceptional combination of permanently extended tax benefits, strong market fundamentals, and prime transit-oriented positioning in the Massachusetts market.",
             "paragraphs": [
               "This investment offers membership interests in Alden Development Corp Fund, providing access to a 150-unit market-rate apartment development in downtown Brockton. The property features modern amenities and sustainable design, located with excellent transit access.",
               "The total project cost is $25 million, with strong projected returns and experienced sponsorship. The target hold period is designed to maximize Opportunity Zone benefits."
             ]
           }
         }
       },
       {
         "type": "investmentCards",
         "data": {
           "cards": [
             {
               "id": "financial-returns",
               "title": "Financial Returns",
               "keyMetrics": [
                 {"label": "Target IRR", "value": "12.5%"},
                 {"label": "Hold Period", "value": "7 Years"},
                 {"label": "Minimum Investment", "value": "$50K"}
               ],
               "summary": "Strong projected returns with conservative underwriting and experienced sponsorship."
             },
             {
               "id": "property-overview",
               "title": "Property Overview",
               "keyMetrics": [
                 {"label": "Unit Count", "value": "150"},
                 {"label": "Square Footage", "value": "125,000"},
                 {"label": "Property Type", "value": "Multifamily"}
               ],
               "summary": "Modern multifamily development with high-quality construction and amenities."
             },
             {
               "id": "sponsor-profile",
               "title": "Sponsor Profile",
               "keyMetrics": [
                 {"label": "Experience", "value": "15+ Years"},
                 {"label": "Projects Completed", "value": "25+"},
                 {"label": "Location", "value": "Massachusetts"}
               ],
               "summary": "Alden Development Corp brings extensive experience in the Massachusetts real estate market."
             }
           ]
         }
       }
     ]
   }'::jsonb,
   NOW(),
   NOW(),
   ARRAY[]::jsonb[])
ON CONFLICT (listing_id, version_number) DO UPDATE SET
  data = EXCLUDED.data,
  published_at = NOW();

-- Update the listing to set the current_version_id after the listing_version exists
UPDATE listings SET current_version_id = '456e7890-e89b-12d3-a456-426614174001' WHERE slug = 'alden-brockton-ma';

-- Associate admin user with the listing for management access
INSERT INTO admin_user_listings (user_id, listing_slug) VALUES
  ((SELECT id FROM admin_users WHERE email = 'aryan@ozlistings.com' LIMIT 1), 'alden-brockton-ma')
ON CONFLICT (user_id, listing_slug) DO NOTHING;
