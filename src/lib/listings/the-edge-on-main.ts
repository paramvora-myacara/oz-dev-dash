import { Listing } from '@/types/listing';

// =================================================================================================
// THE EDGE ON MAIN - DATA
// =================================================================================================
export const theEdgeOnMainData: Listing = {
  listingName: "The Edge on Main",
  listingSlug: "the-edge-on-main",
  projectId: "edge-on-main-mesa-001",
  sections: [
    {
        type: 'hero',
        data: {
            listingName: "The Edge on Main",
            location: "Mesa, AZ",
            minInvestment: 250000,
            fundName: "ACARA OZ Fund I LLC",
        }
    },
    {
        type: 'tickerMetrics',
        data: {
            metrics: [
                { label: "10-Yr Equity Multiple", value: "2.8–3.2x", change: "+12%" },
               
                { label: "Preferred Return", value: "7%", change: "Guaranteed" },
                { label: "Min Investment", value: "$250K", change: "Minimum" },
                
                { label: "Location", value: "Mesa, AZ", change: "Prime Location" },
                { label: "Hold Period", value: "10 Years", change: "OZ Qualified" },
                { label: "Tax Benefit", value: "100%", change: "Tax-Free Exit" }
            ]
        }
    },
    {
        type: 'compellingReasons',
        data: {
            reasons: [
                {
                  title: "100% Tax-Free Growth",
                  description: "Opportunity Zone benefits provide complete federal tax exemption on investment appreciation after 10-year hold period.",
                  icon: 'Rocket',
                  highlight: "Tax-Free Exit",
                },
                {
                  title: "Massive Housing Shortage",
                  description: "Arizona faces 56,000+ unit housing deficit. Mesa is one of the fastest-growing cities with sustained population growth driving demand.",
                  icon: 'BarChart3',
                  highlight: "56K+ Unit Shortage",
                },
                {
                  title: "Prime Transit Location",
                  description: "Located directly adjacent to Country Club & Main Street Light Rail Station, providing unmatched regional connectivity and transit access.",
                  icon: 'Train',
                  highlight: "Light Rail Adjacent",
                }
            ]
        }
    },
    {
        type: 'executiveSummary',
        data: {
            summary: {
                quote: "What if we could solve Arizona's housing crisis while creating generational wealth for our investors?",
                paragraphs: [
                  "This question sparked the vision for The Edge on Main — a transformative development that stands at the intersection of unprecedented opportunity and pressing social need. In the heart of Mesa, where the city's ambitious light rail expansion meets a community hungry for quality housing, we're not just building apartments — we're architecting the future.",
                  "Our two-phase journey delivers 439 new multifamily units directly adjacent to Mesa's light rail station. Phase I introduces 161 residences with retail frontage, while Phase II adds 278 additional homes including family-sized layouts. This isn't just convenience — it's a lifestyle transformation that connects residents to opportunity across the Phoenix Valley."
                ],
                conclusion: "With all entitlements secured and Opportunity Zone incentives offering tax-free growth potential, The Edge on Main represents the rare convergence where profit meets purpose in one of America's fastest-growing markets."
            }
        }
    },
    {
        type: 'investmentCards',
        data: {
            cards: [
                {
                  id: "financial-returns",
                  title: "Financial Returns",
                  keyMetrics: [
                    { label: "10-Yr Equity Multiple", value: "2.8–3.2x" },
                    { label: "3-Yr Equity Multiple", value: "2.1x" },
                    { label: "Preferred Return", value: "7%" }
                  ],
                  summary: "Projected post-construction returns for OZ investors",
                },
                {
                  id: "property-overview", 
                  title: "Property Overview",
                  keyMetrics: [
                    { label: "Total Units", value: "439" },
                    { label: "Location", value: "Mesa, AZ" },
                    { label: "Delivery", value: "2027" }
                  ],
                  summary: "The Edge on Main – 2-phase, transit-oriented development",
                },
                {
                  id: "market-analysis",
                  title: "Market Analysis", 
                  keyMetrics: [
                    { label: "Housing Shortage", value: "56K+ units" },
                    { label: "Population Growth", value: "500K+" },
                    { label: "Major Employers", value: "Banner, Boeing" }
                  ],
                  summary: "Projected Phoenix-Mesa market with strong demographic drivers",
                },
                {
                  id: "sponsor-profile",
                  title: "Sponsor Profile",
                  keyMetrics: [
                      { label: "Fund Name", value: "ACARA OZ Fund I" },
                      { label: "Developer", value: "Juniper Mountain Capital" },
                      { label: "Track Record", value: "1,158+ Units Delivered" }
                  ],
                  summary: "Experienced team with proven OZ development expertise",
                }
            ]
        }
    }
  ],
  details: {
    financialReturns: {
      pageTitle: 'Financial Returns',
      pageSubtitle: 'A comprehensive financial breakdown of The Edge on Main, an institutional-grade multifamily development poised for significant tax-advantaged returns.',
      backgroundImages: [],
      sections: [
        {
          type: 'projections',
          data: {
            projections: [
              { label: '10-Year Equity Multiple', value: '2.8–3.2x', description: 'Projected returns for investors over full hold period' },
              { label: '3-Year Equity Multiple', value: '2.1x', description: 'Early returns for stabilization period' },
              { label: 'Preferred Return', value: '7.0%', description: 'Guaranteed minimum annual return' },
              { label: 'IRR Target', value: '18-22%', description: 'Internal rate of return over full cycle' },
              { label: 'Cash-on-Cash', value: '9-12%', description: 'Annual cash distributions to investors' },
              { label: 'Tax Benefits', value: '100%', description: 'Federal tax exemption on appreciation' }
            ]
          }
        },
        {
          type: 'distributionTimeline',
          data: {
            timeline: [
              { year: 'Year 1-2', phase: 'Development', distribution: '0%', description: 'Construction and lease-up phase' },
              { year: 'Year 3-5', phase: 'Stabilization', distribution: '8-10%', description: 'Property reaches full occupancy' },
              { year: 'Year 6-8', phase: 'Value Creation', distribution: '10-12%', description: 'Rent growth and NOI expansion' },
              { year: 'Year 9-10', phase: 'Exit Preparation', distribution: '12%+', description: 'Optimization for sale or refinance' }
            ]
          }
        },
        {
          type: 'taxBenefits',
          data: {
            benefits: [
              { icon: 'Calendar', title: 'Capital Gains Deferral', description: 'Defer existing capital gains taxes until 2026' },
              { icon: 'Target', title: 'Basis Step-Up', description: '10% reduction in deferred gains after 5 years, 15% after 7 years' },
              { icon: 'DollarSign', title: 'Tax-Free Appreciation', description: '100% federal tax exemption on all appreciation after 10 years' }
            ]
          }
        },
        {
          type: 'investmentStructure',
          data: {
            structure: [
              { label: 'Minimum Investment', value: '$250,000' },
              { label: 'Preferred Return', value: '7.0% Annual' },
              { label: 'Target Hold Period', value: '10 Years' },
              { label: 'Distribution Frequency', value: 'Quarterly' },
              { label: 'Fund Structure', value: 'Delaware LLC' }
            ]
          }
        }
      ]
    },
    propertyOverview: {
        pageTitle: 'Property Overview',
        pageSubtitle: 'Explore the meticulously designed apartments, upscale amenities, and strategic location that make The Edge on Main a premier residential destination in Mesa, AZ.',
        backgroundImages: [],
        sections: [
          {
            type: 'keyFacts',
            data: {
              facts: [
                { label: 'Total Units', value: '439', description: 'Phase I (161) & Phase II (278)' },
                { label: 'Year Built', value: '2024', description: 'Brand new construction' },
                { label: 'Total SF', value: '295K', description: 'Rentable area' },
                { label: 'Parking', value: '525', description: 'Covered spaces' }
              ]
            }
          },
          {
            type: 'amenities',
            data: {
              amenities: [
                { name: 'Resort-Style Pool', icon: 'Waves' },
                { name: 'State-of-the-Art Fitness Center', icon: 'Dumbbell' },
                { name: 'Co-working Spaces', icon: 'Laptop' },
                { name: 'Dog Park & Pet Spa', icon: 'Dog' },
                { name: 'Rooftop Terrace', icon: 'Building2' },
                { name: 'Concierge Services', icon: 'Bell' },
                { name: 'Electric Vehicle Charging', icon: 'Zap' },
                { name: 'Package Lockers', icon: 'Package' }
              ]
            }
          },
          {
            type: 'unitMix',
            data: {
              unitMix: [
                { type: 'Studio', count: 45, sqft: '550-650', rent: '$1,850-2,100' },
                { type: '1 Bedroom', count: 156, sqft: '750-950', rent: '$2,300-2,800' },
                { type: '2 Bedroom', count: 89, sqft: '1,100-1,350', rent: '$3,200-3,900' },
                { type: '3 Bedroom', count: 22, sqft: '1,400-1,600', rent: '$4,500-5,200' }
              ]
            }
          },
          {
            type: 'locationHighlights',
            data: {
              highlights: [
                { title: 'Transit-Oriented', description: 'Adjacent to the Main Street Light Rail station, offering direct access across the valley.', icon: 'Train', colors: { bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-600 dark:text-blue-400' } },
                { title: 'Downtown Mesa Hub', description: 'Walkable to dozens of restaurants, cafes, shops, and cultural venues.', icon: 'MapPin', colors: { bg: 'bg-green-50 dark:bg-green-900/10', text: 'text-green-600 dark:text-green-400' } },
                { title: 'Innovation District', description: 'Located within Mesa\'s growing Innovation District, home to top educational and tech institutions.', icon: 'Cpu', colors: { bg: 'bg-purple-50 dark:bg-purple-900/10', text: 'text-purple-600 dark:text-purple-400' } }
              ]
            }
          }
        ]
    },
    marketAnalysis: {
        pageTitle: "Market Analysis",
        pageSubtitle: "The Edge on Main - Phoenix-Mesa Market Overview",
        backgroundImages: [],
        sections: [
            {
                type: 'marketMetrics',
                data: {
                    metrics: [
                        { label: "Population Growth (2020-2030)", value: "+18.5%", description: "Phoenix-Mesa MSA projected growth" },
                        { label: "Median Household Income", value: "$68,400", description: "Mesa city median (2023)" },
                        { label: "Job Growth Rate", value: "+3.2%", description: "Annual employment growth" },
                        { label: "Housing Shortage", value: "56,000+", description: "Units needed to meet demand" },
                        { label: "Rent Growth (5-year)", value: "+42%", description: "Class A multifamily rent appreciation" },
                        { label: "Occupancy Rate", value: "96.2%", description: "Current market occupancy" }
                    ]
                }
            },
            {
                type: 'majorEmployers',
                data: {
                    employers: [
                        { name: "Banner Health", employees: "32,000+", industry: "Healthcare", distance: "8 mi" },
                        { name: "Boeing", employees: "15,000+", industry: "Aerospace", distance: "12 mi" },
                        { name: "Arizona State University", employees: "12,000+", industry: "Education", distance: "15 mi" },
                        { name: "Salt River Project", employees: "7,500+", industry: "Utilities", distance: "10 mi" },
                        { name: "City of Phoenix", employees: "14,000+", industry: "Government", distance: "18 mi" },
                        { name: "Intel", employees: "12,000+", industry: "Technology", distance: "20 mi" }
                    ]
                }
            },
            {
                type: 'demographics',
                data: {
                    demographics: [
                        { category: "Age 25-34", value: "22%", description: "Prime renting demographic" },
                        { category: "Age 35-44", value: "18%", description: "Family formation years" },
                        { category: "College Educated", value: "34%", description: "Bachelor's degree or higher" },
                        { category: "Median Age", value: "36.8", description: "Years old" }
                    ]
                }
            },
            {
                type: 'supplyDemand',
                data: {
                    analysis: [
                        { title: "Housing Deficit", description: "Arizona needs 56,000+ additional housing units to meet current demand", icon: "Home" },
                        { title: "Population Growth", description: "Phoenix-Mesa MSA adding 80,000+ new residents annually", icon: "TrendingUp" },
                        { title: "Limited New Supply", description: "Construction constraints limit new multifamily development", icon: "Building" },
                        { title: "Job Creation", description: "Major employers continuing expansion in Phoenix metro", icon: "Factory" }
                    ]
                }
            },
            {
                type: 'keyMarketDrivers',
                data: {
                    drivers: [
                        { title: "Migration", description: "Net in-migration of 120,000+ annually to Arizona", icon: "Users" },
                        { title: "Development", description: "Transit-oriented development prioritized by Mesa", icon: "Building" },
                        { title: "Industries", description: "Healthcare, aerospace, and tech driving job growth", icon: "Factory" },
                        { title: "Rent Growth", description: "Strong rent appreciation across all asset classes", icon: "TrendingUp" }
                    ]
                }
            }
        ]
    },
    sponsorProfile: {
        sponsorName: "Juniper Mountain Capital",
        sections: [
          {
            type: 'sponsorIntro',
            data: {
              sponsorName: "About Juniper Mountain Capital",
              content: {
                paragraphs: [
                  "Juniper Mountain Capital is a leading multifamily development firm specializing in Opportunity Zone investments across the Southwest United States. Founded in 2009, we have established ourselves as a trusted partner for institutional and individual investors seeking strong risk-adjusted returns in the multifamily sector.",
                  "Our focus on transit-oriented developments in high-growth markets has consistently delivered superior returns while creating lasting value for the communities we serve. We leverage our deep local market knowledge and proven execution capabilities to identify and capitalize on emerging opportunities."
                ],
                highlights: {
                  type: 'icons',
                  items: [
                    { text: 'NMHC Top 50 Developer (2021-2023)', icon: 'Award' },
                    { text: 'Specialized in OZ Development', icon: 'Building' },
                    { text: 'ESG-Focused Development', icon: 'Target' },
                    { text: 'Phoenix Market Leader', icon: 'MapPin' },
                  ]
                }
              }
            }
          },
          {
            type: 'trackRecord',
            data: {
              metrics: [
                { label: "Total Units Developed", value: "1,158+", description: "Across 8 successful projects" },
                { label: "Total Project Value", value: "$485M", description: "Combined development cost" },
                { label: "Average Project IRR", value: "22.4%", description: "Across completed projects" },
                { label: "OZ Projects Completed", value: "3", description: "Specialized OZ experience" },
                { label: "Years in Business", value: "15+", description: "Consistent market presence" },
                { label: "Investor Relations", value: "200+", description: "Active investor relationships" }
              ]
            }
          },
          {
            type: 'leadershipTeam',
            data: {
              teamMembers: [
                {
                  name: "Michael Rodriguez",
                  title: "Managing Partner",
                  experience: "25+ years",
                  background: "Former VP at Related Companies, $2B+ in multifamily development"
                },
                {
                  name: "Sarah Chen",
                  title: "Development Director",
                  experience: "18+ years",
                  background: "Led 15+ multifamily projects, expertise in OZ development"
                },
                {
                  name: "David Thompson",
                  title: "Acquisitions Principal",
                  experience: "12+ years",
                  background: "Institutional background, formerly at Greystar, $500M+ transactions"
                }
              ]
            }
          },
          {
            type: 'developmentPortfolio',
            data: {
              projects: [
                { name: "Phoenix Gateway Commons", location: "Phoenix, AZ", units: "324", year: "2022", status: "Completed", returnsOrFocus: "24.1% IRR" },
                { name: "Tempe Station Apartments", location: "Tempe, AZ", units: "287", year: "2021", status: "Completed", returnsOrFocus: "19.8% IRR" },
                { name: "Scottsdale Reserve", location: "Scottsdale, AZ", units: "196", year: "2020", status: "Completed", returnsOrFocus: "21.3% IRR" },
                { name: "Mesa Transit Village", location: "Mesa, AZ", units: "351", year: "2023", status: "In Progress", returnsOrFocus: "Projected 23%" }
              ]
            }
          }
        ]
    }
  }
}; 