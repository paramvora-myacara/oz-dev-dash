import { Listing } from '@/types/listing';

// =================================================================================================
// THE EDGE ON MAIN - DATA
// =================================================================================================
const theEdgeOnMainData: Listing = {
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
                { label: "3-Yr Equity Multiple", value: "2.1x", change: "+8%" },
                { label: "Preferred Return", value: "7%", change: "Guaranteed" },
                { label: "Min Investment", value: "$250K", change: "Minimum" },
                { label: "Total Units", value: "439", change: "Phase I & II" },
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
                quote: "A landmark development poised to redefine urban living in downtown Mesa, The Edge on Main capitalizes on a critical housing shortage and a prime transit-oriented location.",
                paragraphs: [
                  "This two-phase, 439-unit multifamily project is situated in a qualified Opportunity Zone, offering investors significant tax advantages, including the potential for a 100% tax-free exit on appreciation.",
                  "With Arizona's population booming and a housing deficit exceeding 56,000 units, The Edge on Main is perfectly positioned to meet the overwhelming demand for modern, accessible rental housing in one of the nation's fastest-growing cities."
                ],
                conclusion: "This development represents a rare opportunity to invest in a high-growth market with strong fundamentals and powerful tax incentives, promising substantial returns and lasting community value."
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
                  summary: "Phoenix-Mesa market with strong demographic drivers",
                },
                {
                  id: "sponsor-profile",
                  title: "Sponsor Profile",
                  keyMetrics: [
                      { label: "Fund Name", value: "ACARA OZ Fund I LLC" },
                      { label: "Developer", value: "Juniper Mountain" },
                      { label: "Track Record", value: "15+ Years Experience" }
                  ],
                  summary: "Experienced team with proven multifamily development expertise",
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
              { label: '10-Yr Equity Multiple', value: '2.8–3.2x', description: 'Projected gross return on initial investment over the full 10-year hold period.' },
              { label: 'Target IRR', value: '18-22%', description: 'Projected Internal Rate of Return, net of fees.' },
              { label: 'Avg. Cash-on-Cash', value: '9-12%', description: 'Projected average annual pre-tax return on initial equity.' },
              { label: 'Development Yield-on-Cost', value: '6.5%', description: 'Projected stabilized Net Operating Income divided by total project cost.' },
              { label: 'Exit Cap Rate', value: '4.0%', description: 'Projected capitalization rate at time of sale.' },
              { label: 'Development Spread', value: '2.5%', description: 'Yield on Cost minus Exit Cap Rate' }
            ]
          }
        },
        {
          type: 'distributionTimeline',
          data: {
            timeline: [
              { year: 'Years 1-2', phase: 'Development & Lease-Up', distribution: '0%', description: 'Construction is completed and the property is leased to stabilization.' },
              { year: 'Years 3-5', phase: 'Stabilization & Value Add', distribution: '8-10%', description: 'Property operations are stabilized and minor value-add initiatives are implemented.' },
              { year: 'Years 6-9', phase: 'Growth & Refinance', distribution: '10-12%+', description: 'Organic rent growth and a potential cash-out refinance event.' },
              { year: 'Year 10+', phase: 'Disposition', distribution: '100% of net proceeds', description: 'Upon a successful sale, all remaining capital and profits are distributed to investors.' }
            ]
          }
        },
        {
          type: 'taxBenefits',
          data: {
            benefits: [
              { title: 'Capital Gains Deferral', description: 'Investors can defer capital gains taxes on the sale of any asset by reinvesting the gain into a Qualified Opportunity Fund within 180 days.' },
              { title: 'Basis Step-Up', description: 'The original deferred capital gains tax liability is reduced by 10% after a 5-year hold.' },
              { title: 'Tax-Free Growth', description: 'After a 10-year hold, the appreciation on the Opportunity Zone investment is 100% free from capital gains tax.' }
            ]
          }
        },
        {
          type: 'investmentStructure',
          data: {
            structure: [
              { label: 'Minimum Investment', value: '$250,000' },
              { label: 'Asset Type', value: 'Multifamily Real Estate' },
              { label: 'Fund Structure', value: 'Qualified Opportunity Fund' },
              { label: 'Target Hold Period', value: '10+ Years' },
              { label: 'GP Co-Investment', value: '10%' }
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
                { label: 'Total Units', value: '350', description: 'Mix of studio, 1, 2, and 3-bedroom units.' },
                { label: 'Year Built', value: '2024', description: 'Brand new, institutional-quality construction.' },
                { label: 'Stories', value: '5', description: 'Mid-rise building with structured parking.' },
                { label: 'Parking', value: '410 Spaces (1.17/unit)', description: 'Ample structured parking for residents.' }
              ]
            }
          },
          {
            type: 'amenities',
            data: {
              amenities: [
                { name: 'Resort-Style Pool & Spa', icon: 'Sun' },
                { name: '24/7 Fitness Center', icon: 'Dumbbell' },
                { name: 'Co-Working Lounge', icon: 'Laptop' },
                { name: 'Dog Park & Pet Spa', icon: 'Dog' },
                { name: 'Rooftop Terrace', icon: 'Building2' },
                { name: 'Resident Clubhouse', icon: 'Users' },
                { name: 'Secure Package Room', icon: 'Package' },
                { name: 'EV Charging Stations', icon: 'Zap' }
              ]
            }
          },
          {
            type: 'unitMix',
            data: {
              unitMix: [
                { type: 'Studio', count: 60, sqft: '550', rent: '$1,750' },
                { type: '1-Bedroom', count: 180, sqft: '750', rent: '$2,200' },
                { type: '2-Bedroom', count: 95, sqft: '1,100', rent: '$2,800' },
                { type: '3-Bedroom', count: 15, sqft: '1,300', rent: '$3,200' }
              ]
            }
          },
          {
            type: 'locationHighlights',
            data: {
              highlights: [
                { title: 'Transit-Oriented', description: 'Adjacent to the Main Street Light Rail station, offering direct access across the valley.', icon: 'Train' },
                { title: 'Downtown Mesa Hub', description: 'Walkable to dozens of restaurants, cafes, shops, and cultural venues.', icon: 'MapPin' },
                { title: 'Innovation District', description: 'Located within Mesa\'s growing Innovation District, home to top educational and tech institutions.', icon: 'Cpu' }
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
                    { icon: 'Award', text: 'NMHC Top 50 Developer (2021-2023)' },
                    { icon: 'Building', text: 'Specialized in OZ Development' },
                    { icon: 'Target', text: 'ESG-Focused Development' },
                    { icon: 'MapPin', text: 'Phoenix Market Leader' }
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

// =================================================================================================
// MARSHALL ST. LOUIS - DATA
// =================================================================================================
const marshallStLouisData: Listing = {
    listingName: "The Marshall St. Louis",
    listingSlug: "marshall-st-louis",
    projectId: "marshall-st-louis-001",
    sections: [
        {
            type: 'hero',
            data: {
                listingName: "The Marshall St. Louis",
                location: "St. Louis, MO",
                minInvestment: 250000,
                fundName: "Aptitude St. Louis LLC",
            }
        },
        {
            type: 'tickerMetrics',
            data: {
                metrics: [
                    { label: "10-Yr Equity Multiple", value: "4.29x", change: "+329%" },
                    { label: "IRR Target", value: "17.7%", change: "Strong" },
                    { label: "Preferred Return", value: "8%", change: "Guaranteed" },
                    { label: "Min Investment", value: "$250K", change: "Minimum" },
                    { label: "Total Units", value: "177", change: "508 Beds" },
                    { label: "Location", value: "St. Louis, MO", change: "Prime Location" },
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
                      title: "Strategic University Location",
                      description: "Located just 600 feet from St. Louis University with 15,200 students experiencing record enrollment growth. Adjacent to the $300M City Foundry mixed-use development.",
                      icon: 'Rocket',
                      highlight: "600ft from SLU Campus",
                    },
                    {
                      title: "Strong Housing Demand",
                      description: "SLU has achieved record enrollment for 2023 and 2024, up nearly 25% since 2020, creating critical student housing undersupply in the market.",
                      icon: 'BarChart3',
                      highlight: "Critical Housing Shortage",
                    },
                    {
                      title: "Innovation District Proximity",
                      description: "0.5 miles from Cortex Innovation District (200-acre tech hub with 5,700+ jobs) and 0.6 miles from BJC/Washington University Medical Campus ($1B expansion).",
                      icon: 'Users',
                      highlight: "Tech & Medical Hub Access",
                    }
                ]
            }
        },
        {
            type: 'executiveSummary',
            data: {
                summary: {
                    quote: "What if we could capitalize on America's student housing crisis while generating exceptional returns for our investors?",
                    paragraphs: [
                        "This question sparked the vision for The Marshall St. Louis — a transformative student housing development that stands at the intersection of unprecedented opportunity and critical market need. Located just 600 feet from St. Louis University's main campus, we're not just building student housing — we're architecting the future of university life.",
                        "Our 177-unit development delivers 508 premium bedrooms directly adjacent to one of the nation's most prestigious universities. With SLU enrollment hitting record highs and a critical housing shortage, The Marshall represents the rare convergence where student demand meets institutional-quality development in a qualified Opportunity Zone."
                    ],
                    conclusion: "With construction 99% complete, >60% pre-leased, and Opportunity Zone incentives offering tax-free growth potential, The Marshall St. Louis represents the ideal intersection where exceptional returns meet transformative tax benefits."
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
                        { label: "10-Yr Equity Multiple", value: "4.29x" },
                        { label: "IRR Target", value: "17.7%" },
                        { label: "Preferred Return", value: "8%" }
                      ],
                      summary: "Projected pre-tax returns for OZ investors over 10-year hold",
                    },
                    {
                      id: "property-overview", 
                      title: "Property Overview",
                      keyMetrics: [
                        { label: "Total Units", value: "177" },
                        { label: "Bedrooms", value: "508" },
                        { label: "Occupancy", value: "May 2025" }
                      ],
                      summary: "The Marshall St. Louis – Student housing adjacent to SLU campus",
                    },
                    {
                      id: "market-analysis",
                      title: "Market Analysis", 
                      keyMetrics: [
                        { label: "SLU Enrollment", value: "15,200+" },
                        { label: "Growth Rate", value: "25%" },
                        { label: "Pre-Lease Rate", value: ">60%" }
                      ],
                      summary: "Strong market fundamentals driven by university growth",
                    },
                    {
                      id: "sponsor-profile",
                      title: "Sponsor Profile",
                      keyMetrics: [
                        { label: "Fund Name", value: "Aptitude St. Louis LLC" },
                        { label: "Developer", value: "Aptitude Development" },
                        { label: "Track Record", value: "20+ Years Experience" }
                      ],
                      summary: "Experienced team with proven student housing development expertise",
                    }
                ]
            }
        }
    ],
    details: {
      financialReturns: {
        pageTitle: 'Financial Returns',
        pageSubtitle: 'In-depth financial analysis of The Marshall project, detailing its strong potential for long-term, tax-advantaged returns in a stable student housing market.',
        backgroundImages: [],
        sections: [
          {
            type: 'projections',
            data: {
              projections: [
                { label: '10-Yr Equity Multiple', value: '4.29x', description: 'Projected gross return on initial investment over the full 10-year hold period.' },
                { label: 'Target IRR', value: '17.7%', description: 'Projected Internal Rate of Return, net of fees.' },
                { label: 'Preferred Return', value: '8.0%', description: 'Compounded annually to investors before sponsor participation.' },
                { label: 'Total Capital Requirement', value: '$30.1M', description: 'New equity investment for recapitalization and stabilization.' },
                { label: 'Year 1 Stabilized NOI', value: '$2.5M', description: 'Projected Net Operating Income for the first full year of operations.' },
                { label: '10-Yr Avg. Cash-on-Cash', value: '11.8%', description: 'Projected average annual pre-tax return on initial equity.' }
              ]
            }
          },
          {
            type: 'distributionTimeline',
            data: {
              timeline: [
                { year: 'Q2 2025', phase: 'Stabilization Begins', distribution: '0%', description: 'Property reaches 95%+ occupancy and stabilizes operations.' },
                { year: 'Q1 2026', phase: 'First Distribution', distribution: '8% Pref.', description: 'First preferred return distribution to investors.' },
                { year: '2026-2034', phase: 'Annual Cash Flow', distribution: '8-12%', description: 'Ongoing distributions from operating cash flow.' },
                { year: '2035', phase: 'Disposition', distribution: '100% of Net Proceeds', description: 'Upon a successful sale, all remaining capital and profits are distributed to investors.' }
              ]
            }
          },
          {
            type: 'taxBenefits',
            data: {
              benefits: [
                { title: 'Capital Gains Deferral', description: 'Defer capital gains taxes on the sale of any asset until December 31, 2026.' },
                { title: 'Basis Step-Up Discount', description: 'A 10% step-up in basis for investments held for 5 years, reducing the original deferred gain.' },
                { title: 'Tax-Free Growth', description: 'After a 10-year hold, the appreciation on the Opportunity Zone investment is 100% free from capital gains tax.' }
              ]
            }
          },
          {
            type: 'investmentStructure',
            data: {
              structure: [
                { label: 'Minimum Investment', value: '$250,000' },
                { label: 'Asset Type', value: 'Student Housing' },
                { label: 'Target Hold Period', value: '10 Years' },
                { label: 'Distribution Frequency', value: 'Annual' },
                { label: 'Sponsor Co-Invest', value: '5%' }
              ]
            }
          }
        ]
      },
      propertyOverview: {
        pageTitle: 'Property Overview',
        pageSubtitle: 'An inside look at the premier student housing community serving Saint Louis University, featuring top-tier amenities and a prime, walkable location.',
        backgroundImages: [],
        sections: [
          {
            type: 'keyFacts',
            data: {
              facts: [
                { label: 'Total Units / Beds', value: '177 / 508', description: 'Purpose-built student housing.' },
                { label: 'Year Built', value: '2025', description: 'Brand new, Class-A construction.' },
                { label: 'Stories', value: '5', description: 'Over a 2-level parking podium.' },
                { label: 'Walk Score', value: '88 (Very Walkable)', description: 'Daily errands do not require a car.' }
              ]
            }
          },
          {
            type: 'amenities',
            data: {
              amenities: [
                { name: 'Resort-Style Pool', icon: 'Sun' },
                { name: 'State-of-the-Art Gym', icon: 'Dumbbell' },
                { name: 'Study Lounges', icon: 'Laptop' },
                { name: 'Clubhouse & Game Room', icon: 'Users' },
                { name: 'Rooftop Deck', icon: 'Building2' },
                { name: 'Amazon Hub Lockers', icon: 'Package' },
                { name: 'Secure Bike Storage', icon: 'Bike' },
                { name: 'On-Site Management', icon: 'UserCheck' }
              ]
            }
          },
          {
            type: 'unitMix',
            data: {
              unitMix: [
                { type: 'Studio', count: 20, sqft: '450', rent: '$1,200' },
                { type: '1-Bedroom', count: 15, sqft: '680', rent: '$1,500' },
                { type: '2-Bed / 2-Bath', count: 40, sqft: '950', rent: '$2,200' },
                { type: '3-Bed / 3-Bath', count: 30, sqft: '1,200', rent: '$3,000' },
                { type: '4-Bed / 4-Bath', count: 80, sqft: '1,400', rent: '$3,800' }
              ],
              specialFeatures: {
                title: 'Unit Features',
                description: 'All units are fully furnished and include granite countertops, stainless steel appliances, in-unit washer/dryer, and high-speed internet.'
              }
            }
          },
          {
            type: 'locationHighlights',
            data: {
              highlights: [
                { title: 'Adjacent to SLU', description: 'Located directly across the street from the Saint Louis University campus.', icon: 'School' },
                { title: 'Cortex Innovation District', description: 'A short walk to the premier tech and innovation hub in St. Louis.', icon: 'Cpu' },
                { title: 'Grand Center Arts District', description: 'In the heart of St. Louis\'s premier arts and culture district.', icon: 'Palette' }
              ]
            }
          },
           {
            type: 'developmentTimeline',
            data: {
              timeline: [
                { status: 'completed', title: 'Groundbreaking', description: 'Q1 2023' },
                { status: 'in_progress', title: 'Construction', description: '99% Complete' },
                { status: 'in_progress', title: 'Expected Delivery', description: 'April 2025' },
                { status: 'in_progress', title: 'Occupancy Start', description: 'May 2025 (>60% Pre-leased)' }
              ]
            }
          }
        ]
      },
      marketAnalysis: {
        pageTitle: 'Market Analysis',
        pageSubtitle: 'Exploring the stable and growing student housing market at Saint Louis University, a key driver for The Marshall\'s long-term success.',
        backgroundImages: [],
        sections: [
          {
            type: 'marketMetrics',
            data: {
              metrics: [
                { label: 'SLU Enrollment Growth', value: '25% (since 2020)', description: 'Record freshman classes in \'23 and \'24.' },
                { label: 'Student Housing Deficit', value: '2,000+ Beds', description: 'Significant lack of on-campus and modern off-campus housing.' },
                { label: 'Competitor Occupancy', value: '98-100%', description: 'Comparable properties are fully occupied.' },
                { label: 'International Student Body', value: '8%', description: 'Increasing demand from a diverse, global student population.' }
              ]
            }
          },
          {
            type: 'majorEmployers',
            data: {
              employers: [
                { name: 'Saint Louis University', employees: '7,000+', industry: 'Education', distance: '0.1 miles' },
                { name: 'BJC HealthCare', employees: '30,000+', industry: 'Healthcare', distance: '0.5 miles' },
                { name: 'Cortex Innovation District', employees: '6,000+', industry: 'Tech/Biotech', distance: '0.5 miles' },
                { name: 'SSM Health', employees: '40,000+', industry: 'Healthcare', distance: '1 mile' }
              ]
            }
          },
          {
            type: 'competitiveAnalysis',
            data: {
              competitors: [
                { name: 'Verve St. Louis', built: '2021', beds: '162', rent: '$1,115', occupancy: '100%', rentGrowth: '18.4%' },
                { name: 'The Standard St. Louis', built: '2015', beds: '465', rent: '$1,222', occupancy: '96%', rentGrowth: '37.1%' },
                { name: 'City Lofts at Laclede', built: '2006', beds: '408', rent: '$989', occupancy: '100%', rentGrowth: '30.3%' }
              ],
              summary: 'Limited supply with only 162 new beds since 2017, while SLU enrollment has grown 25%. Strong rent growth and occupancy rates demonstrate robust demand.'
            }
          },
          {
            type: 'keyMarketDrivers',
            data: {
              drivers: [
                { title: 'Top-Ranked University', description: 'SLU is a nationally recognized research university, attracting students from across the globe.', icon: 'Award' },
                { title: 'Cortex Tech Hub', description: 'Proximity to the Cortex Innovation District provides a strong, built-in demand driver.', icon: 'Cpu' },
                { title: 'Medical Campus Expansion', description: 'Major expansions at BJC and WashU medical campuses fuel local economic growth.', icon: 'Briefcase' },
                { title: 'Urban Campus Environment', description: 'Growing preference for walkable, urban campus lifestyles drives housing demand.', icon: 'Building' }
              ]
            }
          }
        ]
      },
      sponsorProfile: {
            sponsorName: "ACARA & Aptitude Development",
            sections: [
              {
                type: 'sponsorIntro',
                data: {
                  sponsorName: "About ACARA",
                  content: {
                    paragraphs: [
                      "ACARA provides accredited investors with the best direct investment opportunities available in the multifamily industry. We partner with top-tier development sponsors across the country to build apartment buildings and hold them long term.",
                      "Our vertically integrated platform allows us to participate in everything from site selection to management, capturing layers of profit and ultimately providing strong, long-term cash flow.",
                      "Through our distinctive national service platform, we provide exclusive access to top investment opportunities, ensuring that our clients receive the best multifamily projects available."
                    ],
                    highlights: {
                      type: 'list',
                      items: [
                        { text: "Secondary markets with compelling fundamentals" },
                        { text: "Long-term holdings away from boom/bust cycles" },
                        { text: "Building off-cycle, delivering on-cycle" },
                        { text: "Opportunity Zone focus for tax advantages" },
                        { text: "Institutional-quality sponsors and properties" }
                      ]
                    }
                  }
                }
              },
              {
                type: 'trackRecord',
                data: {
                  metrics: [
                    { label: "Years of Experience", value: "20+", description: "Combined experience in student housing development" },
                    { label: "Total Investment", value: "$30.1M", description: "Capital requirement for The Marshall project" },
                    { label: "Construction Progress", value: "99%", description: "Project completion as of December 2024" },
                    { label: "Pre-Lease Rate", value: ">60%", description: "Strong leasing momentum before completion" }
                  ]
                }
              },
              {
                type: 'leadershipTeam',
                data: {
                  teamMembers: [
                    {
                      name: "Todd Vitzthum",
                      title: "President, ACARA",
                      experience: "20+ years",
                      background: "Corporate commercial real estate expert with extensive experience in institutional investments and fund management."
                    },
                    {
                      name: "Jeff Richmond",
                      title: "Partner, ACARA",
                      experience: "15+ years",
                      background: "Business development specialist with deep expertise in opportunity zone investments and investor relations."
                    },
                    {
                      name: "Aptitude Development Team",
                      title: "Development Sponsor",
                      experience: "10+ years",
                      background: "Specialized student housing developers with proven track record in university-adjacent properties and complex urban developments."
                    }
                  ]
                }
              },
              {
                type: 'keyDevelopmentPartners',
                data: {
                  partners: [
                    {
                      name: "Aptitude Development",
                      role: "Development Sponsor and Project Manager",
                      description: "Specialized student housing developer with extensive experience in university-adjacent properties. Leading The Marshall project from conception through completion with proven execution capabilities."
                    },
                    {
                      name: "Holland Construction",
                      role: "General Contractor",
                      description: "Experienced construction partner delivering The Marshall on schedule and on budget. Strong track record in complex urban student housing projects with quality finishes."
                    }
                  ]
                }
              },
              {
                type: 'developmentPortfolio',
                data: {
                  projects: [
                    { name: "The Marshall St. Louis", location: "St. Louis, MO", units: "177 units / 508 beds", year: "2025", status: "In Progress", returnsOrFocus: "17.7% IRR Target" },
                    { name: "University Housing Portfolio", location: "Various Markets", units: "Multiple Projects", year: "2018-2023", status: "Completed", returnsOrFocus: "Strong Performance" },
                    { name: "Mixed-Use Developments", location: "Secondary Markets", units: "Opportunity Zones", year: "2020-2024", status: "Operating", returnsOrFocus: "Tax-Advantaged" }
                  ],
                  investmentPhilosophy: {
                    title: "Investment Philosophy",
                    description: "Our strategy focuses on identifying partners and projects in secondary markets with compelling fundamentals, allowing us to create valuable long-term holdings away from traditional boom and bust markets. This approach enables better navigation of market cycles by building off-cycle and delivering on-cycle."
                  }
                }
              }
            ]
        }
    }
};

// =================================================================================================
// SOGOOD DALLAS - DATA
// =================================================================================================
const soGoodDallasData: Listing = {
    listingName: "SoGood Dallas",
    listingSlug: "sogood-dallas",
    projectId: "sogood-dallas-001",
    sections: [
        {
            type: 'hero',
            data: {
                listingName: "SoGood Dallas",
                location: "Dallas, TX",
                minInvestment: 500000,
                fundName: "Dallas OZ Fund I LLC"
            }
        },
        {
            type: 'tickerMetrics',
            data: {
                metrics: [
                    { label: "10-Yr Equity Multiple", value: "2.88x", change: "+20%" },
                    { label: "5-Yr Equity Multiple", value: "2.5x", change: "+15%" },
                    { label: "Preferred Return", value: "9%", change: "Guaranteed" },
                    { label: "Min Investment", value: "$500K", change: "Minimum" },
                    { label: "Total Units", value: "388", change: "Phase I & II" },
                    { label: "Location", value: "Dallas, TX", change: "Prime Location" },
                    { label: "Hold Period", value: "10+ Years", change: "OZ Qualified" },
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
                      description: "Opportunity Zone benefits provide complete federal tax exemption on investment appreciation after 10-year hold period, plus property tax abatement through PFC.",
                      icon: 'Rocket',
                      highlight: "Tax-Free Exit",
                    },
                    {
                      title: "Innovation District Creation",
                      description: "SoGood represents a major innovation district featuring a pre-leased innovation center to GSV Ventures, transforming Dallas' southern sector into a tech hub.",
                      icon: 'BarChart3',
                      highlight: "GSV Ventures Pre-Leased",
                    },
                    {
                      title: "Strategic Dallas Location",
                      description: "Located near iconic neighborhoods including the Farmers Market, Deep Ellum, and Fair Park, with proximity to the $3.7B Convention Center expansion.",
                      icon: 'Train',
                      highlight: "Convention Center Adjacent",
                    }
                ]
            }
        },
        {
            type: 'executiveSummary',
            data: {
                summary: {
                    quote: "What if we could transform Dallas' southern sector while creating an innovation ecosystem that attracts global talent?",
                    paragraphs: [
                        "This vision drives SoGood Dallas — an ambitious master-planned urban community that stands as a catalyst for economic revitalization in one of Dallas' most promising areas. Strategically located near iconic neighborhoods including the Farmers Market, Deep Ellum, the Cedars, and Fair Park, SoGood represents more than development — it's urban transformation.",
                        "Our innovative two-phase approach delivers 388 residential units anchored by a 35,264 SF innovation center fully pre-leased to GSV Ventures. Phase I introduces The Hub at SoGood with 116 units plus the innovation center, while Phase II adds MKT Residences with 272 units and retail featuring Farmers Commons. This isn't just mixed-use development — it's the creation of Dallas' next great district."
                    ],
                    conclusion: "With Hoque Global's 14-acre land ownership eliminating acquisition risk, Opportunity Zone tax benefits, and proximity to the $3.7B Convention Center expansion, SoGood Dallas represents the convergence of visionary planning and exceptional investment opportunity in America's fastest-growing metropolitan area."
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
                        { label: "10-Yr Equity Multiple", value: "2.88x" },
                        { label: "5-Yr Equity Multiple", value: "2.5x" },
                        { label: "Preferred Return", value: "9%" }
                      ],
                      summary: "Conservative projections with 7.2% unlevered yield on cost",
                    },
                    {
                      id: "property-overview", 
                      title: "Property Overview",
                      keyMetrics: [
                        { label: "Total Units", value: "388" },
                        { label: "Innovation Center", value: "35,264 SF" },
                        { label: "Retail Space", value: "49,592 SF" }
                      ],
                      summary: "SoGood Dallas – Master-planned innovation district in two phases",
                    },
                    {
                      id: "market-analysis",
                      title: "Market Analysis", 
                      keyMetrics: [
                        { label: "DFW Job Growth", value: "602K+ Jobs" },
                        { label: "Population", value: "7M+" },
                        { label: "Fortune 1000 HQs", value: "43" }
                      ],
                      summary: "Dallas-Fort Worth leading nation in job and population growth",
                    },
                    {
                      id: "sponsor-profile",
                      title: "Sponsor Profile",
                      keyMetrics: [
                        { label: "Fund Name", value: "Dallas OZ Fund I" },
                        { label: "Developer", value: "Hoque Global" },
                        { label: "Land Ownership", value: "14 Acres Owned" }
                      ],
                      summary: "Experienced team with proven track record and existing land ownership",
                    }
                ]
            }
        }
    ],
    details: {
      financialReturns: {
        pageTitle: 'Financial Returns',
        pageSubtitle: 'In-depth financial analysis of the SoGood Dallas project, outlining its potential for significant, tax-advantaged returns in a booming urban-suburban hub.',
        backgroundImages: [],
        sections: [
          {
            type: 'projections',
            data: {
              projections: [
                { label: '10-Yr Equity Multiple', value: '2.88x', description: 'Projected gross return on initial investment over the full 10-year hold period.' },
                { label: 'Target IRR (10-Year)', value: '19-20%', description: 'Projected Internal Rate of Return, net of fees.' },
                { label: 'Preferred Return', value: '7.0%', description: 'Payable to investors before sponsor catch-up or promote.' },
                { label: 'Pre-Leased Anchor', value: '35,264 SF', description: 'Innovation center pre-leased to GSV Ventures, de-risking the project.' },
                { label: 'Phase I Development Cost', value: '$85M', description: 'Total cost for the initial phase of the project.' },
                { label: 'Projected Development Margin', value: '30%', description: 'Profit margin on development costs' }
              ]
            }
          },
          {
            type: 'distributionTimeline',
            data: {
              timeline: [
                { year: 'Years 1-2', phase: 'Development & Pre-Leasing', distribution: '0%', description: 'Construction of Phase I and pre-leasing of residential and retail spaces.' },
                { year: 'Year 3', phase: 'Stabilization', distribution: '7-9%', description: 'Property reaches stabilized occupancy and begins regular cash flow.' },
                { year: 'Years 4-9', phase: 'Growth & Phased Expansion', distribution: '8-10%+', description: 'Organic rent growth and development of subsequent phases.' },
                { year: 'Year 10+', phase: 'Disposition', distribution: '100% of net proceeds', description: 'At disposition, remaining capital and profits are distributed to investors.' }
              ]
            }
          },
          {
            type: 'taxBenefits',
            data: {
              benefits: [
                { title: 'Capital Gains Tax Deferral', description: 'Reinvest gains from a prior investment into a QOF to defer paying taxes until 2026.' },
                { title: 'Capital Gains Tax Reduction', description: 'After 5 years, the basis on the original investment increases by 10%, reducing the deferred gain.' },
                { title: 'Tax-Free Growth', description: 'All capital gains earned from the QOF investment are permanently tax-free after a 10-year hold.' }
              ]
            }
          },
          {
            type: 'investmentStructure',
            data: {
              structure: [
                { label: 'Minimum Investment', value: '$500,000' },
                { label: 'Asset Type', value: 'Mixed-Use Residential' },
                { label: 'Fund Name', value: 'Dallas OZ Fund I, LLC' },
                { label: 'Target Hold Period', value: '10+ Years' },
                { label: 'Preferred Return', value: '7.0%' }
              ]
            }
          }
        ]
      },
      propertyOverview: {
        pageTitle: 'Property Overview',
        pageSubtitle: "Discover the state-of-the-art amenities and strategic location that make SoGood a landmark development in Dallas's fastest-growing submarket.",
        backgroundImages: [],
        sections: [
          {
            type: 'keyFacts',
            data: {
              facts: [
                { label: 'Total Units (Phase I & II)', value: '388', description: 'Total residential units in the initial phases.' },
                { label: 'Total Commercial SF', value: '84,856 SF', description: 'Retail and innovation center space.' },
                { label: 'Site Area', value: '14 Acres', description: 'Total land area for the master-planned development.' },
                { label: 'Phase I-VI Total', value: '1,720 Units', description: 'Total residential units planned across all phases.' }
              ]
            }
          },
          {
            type: 'amenities',
            data: {
              amenities: [
                { name: 'Rooftop Pool & Lounge', icon: 'Sun' },
                { name: 'Co-Working & Maker Space', icon: 'Laptop' },
                { name: 'Food Hall & Restaurants', icon: 'Utensils' },
                { name: 'Community Gardens', icon: 'Leaf' },
                { name: 'Amphitheater & Event Space', icon: 'Building2' },
                { name: 'Fitness Center & Yoga Studio', icon: 'Dumbbell' },
                { name: 'Public Art Installations', icon: 'Palette' },
                { name: 'Dog Park & Pet Spa', icon: 'Dog' }
              ]
            }
          },
          {
            type: 'developmentPhases',
            data: {
              phases: [
                { phase: 'Phase I - The Hub', units: 116, sqft: '123,777', features: 'Innovation Center (35,264 SF) + Retail', timeline: 'Est. 2027' },
                { phase: 'Phase II - MKT Residences', units: 272, sqft: '206,118', features: 'Retail Anchor + Farmers Commons', timeline: 'Est. 2027' }
              ]
            }
          },
          {
            type: 'locationFeatures',
            data: {
              featureSections: [
                { category: 'Transit & Connectivity', icon: 'Bus', features: ['Adjacent to future IH-30 deck park', 'Near Dallas Farmers Market', 'Close to Deep Ellum entertainment district', 'Walking distance to Fair Park'] },
                { category: 'Urban Amenities', icon: 'MapPin', features:['$3.7B Convention Center expansion nearby', 'The Cedars historic district', 'Farmers Market dining & shopping', 'Multiple cultural venues'] },
                { category: 'Economic Drivers', icon: 'Building', features: ['Innovation center pre-leased to GSV Ventures', 'Property tax abatement through PFC', 'Adaptive reuse of former industrial property', 'Master-planned community catalyst'] }
              ]
            }
          }
        ]
      },
      marketAnalysis: {
        pageTitle: 'Market Analysis',
        pageSubtitle: 'An overview of the robust economic and demographic trends driving demand in the South Dallas market, positioning SoGood for success.',
        backgroundImages: [],
        sections: [
          {
            type: 'marketMetrics',
            data: {
              metrics: [
                { label: 'DFW Population Growth', value: '#1 in USA', description: 'Dallas-Fort Worth leads the nation in population growth.' },
                { label: 'Job Growth (5-Year)', value: '602,200', description: 'Led all U.S. metros in net new jobs over the past 5 years.' },
                { label: 'Corporate HQ Hub', value: '22 Fortune 500', description: 'Home to a diverse range of major corporate headquarters.' },
                { label: 'Millennial Population Growth', value: '25% (5-year)', description: 'One of the fastest-growing millennial hubs in the country.' }
              ]
            }
          },
          {
            type: 'majorEmployers',
            data: {
              employers: [
                { name: 'AT&T', employees: '5,000+', industry: 'Telecommunications', distance: '2.5 miles' },
                { name: 'Toyota North America', employees: '7,000+', industry: 'Automotive', distance: '25 miles' },
                { name: 'Lockheed Martin', employees: '15,000+', industry: 'Aerospace & Defense', distance: '20 miles' },
                { name: 'Dallas County', employees: '7,000+', industry: 'Government', distance: '2 miles' }
              ]
            }
          },
          {
            type: 'demographics',
            data: {
              demographics: [
                { category: 'Median Age', value: '32.1', description: 'Young and growing population.' },
                { category: 'College Educated', value: '41%', description: 'Highly educated workforce.' },
                { category: 'Household Growth (5-Yr)', value: '8.5%', description: 'Rapid formation of new households.' },
                { category: 'Job Growth (1-Year)', value: '3.9%', description: 'Significantly above national average.' }
              ]
            }
          },
          {
            type: 'economicDiversification',
            data: {
              sectors: [
                { title: 'Technology Sector', description: 'One-third of all Texas tech jobs are located in DFW, with 59,000 new positions added in the past 5 years.' },
                { title: 'Corporate Headquarters', description: 'Home to 43 Fortune 1000 and 22 Fortune 500 companies, providing a stable, high-income employment base.' },
                { title: 'Population Growth', description: 'DFW leads all U.S. metro areas in population growth, adding over 120,000 new residents annually.' }
              ]
            }
          },
          {
            type: 'keyMarketDrivers',
            data: {
              drivers: [
                { title: 'Corporate Relocations', description: 'Dallas leads the nation in corporate relocations, attracting a skilled workforce.', icon: 'Briefcase' },
                { title: 'Pro-Business Environment', description: 'Texas\'s low tax burden and business-friendly policies attract companies and talent.', icon: 'CheckCircle' },
                { title: 'Infrastructure Investment', description: 'Massive public and private investment in transportation and urban infrastructure.', icon: 'Bus' },
                { title: 'Quality of Life', description: 'Affordable cost of living and abundant amenities attract new residents.', icon: 'Heart' }
              ]
            }
          }
        ]
      },
      sponsorProfile: {
            sponsorName: "Hoque Global & ACARA",
            sections: [
              {
                type: 'partnershipOverview',
                data: {
                  partners: [
                    {
                      name: "Hoque Global (Developer)",
                      description: [
                        "Diversified investment company with primary focus on catalytic enterprises in real estate. Parent company of HG Real Estate Solutions, DRG Concepts, iDesign Meetings and RideCentric.",
                        "Recognized leader in revitalization, redevelopment, and re-energization of properties with a focus on community impact and sustainable urban development."
                      ]
                    },
                    {
                      name: "ACARA Management (Fund Manager)",
                      description: [
                        "Provides accredited investors with direct investment opportunities in the multifamily industry through partnerships with top-tier development sponsors.",
                        "Vertically integrated platform capturing layers of profit from site selection to management, providing strong long-term cash flow for investors."
                      ]
                    }
                  ]
                }
              },
              {
                type: 'trackRecord',
                data: {
                  metrics: [
                    { label: "Land Owned", value: "14 Acres", description: "Owned land in downtown Dallas" },
                    { label: "Nearby Expansion", value: "$3.7B", description: "Kay Bailey Hutchison Convention Center expansion nearby" },
                    { label: "Anchor Tenant", value: "35,264 SF", description: "Innovation center pre-leased to GSV Ventures" },
                    { label: "Future Phases", value: "Master Plan", description: "Six additional phases planned for future OZ investment" }
                  ]
                }
              },
              {
                type: 'leadershipTeam',
                data: {
                  teamMembers: [
                    {
                      name: "Mike Hoque",
                      title: "Founder & Chairman, Hoque Global",
                      experience: "20+ years",
                      background: "Board member of Downtown Dallas Inc., Top 40 Under 40 business innovator, 2020 Dallas 500 Business Leader"
                    },
                    {
                      name: "Arthur Santa-Maria",
                      title: "Vice President, Hoque Global",
                      experience: "15+ years",
                      background: "Former Trammell Crow Company, CBRE, and JLL. MBA from UT Dallas, downtown Dallas resident since 2006"
                    },
                    {
                      name: "Steven Shelley",
                      title: "Partner, HG Residential Concept",
                      experience: "15+ years",
                      background: "5,000+ multifamily units developed, $2B+ transaction history, former Pillar Income Asset Management"
                    }
                  ]
                }
              },
              {
                type: 'developmentPortfolio',
                data: {
                  projects: [
                    { name: "SoGood Phase I", location: "Dallas, TX", units: "116", year: "2025", status: "Planning", returnsOrFocus: "Innovation Center" },
                    { name: "SoGood Phase II", location: "Dallas, TX", units: "272", year: "2025", status: "Planning", returnsOrFocus: "Retail Anchor" },
                    { name: "RideCentric", location: "DFW Metro", units: "N/A", year: "1998", status: "Completed", returnsOrFocus: "Transportation" },
                    { name: "iDesign Meetings", location: "DFW Metro", units: "N/A", year: "2010", status: "Completed", returnsOrFocus: "Hospitality" }
                  ]
                }
              },
              {
                type: 'competitiveAdvantages',
                data: {
                  advantages: [
                    { icon: "Building", title: "Land Ownership", description: "Hoque Global already owns all 14 acres, eliminating acquisition risk and streamlining development" },
                    { icon: "Award", title: "Tax Abatements", description: "Property tax abatement through Public Facility Corporation already established" },
                    { icon: "TrendingUp", title: "Pre-Leased Anchor", description: "Innovation center fully pre-leased to GSV Ventures, providing stable cash flow" },
                    { icon: "Users", title: "Local Expertise", description: "Deep Dallas market knowledge and established relationships with city officials" }
                  ]
                }
              }
            ]
        }
    }
};

export const listings: Listing[] = [theEdgeOnMainData, marshallStLouisData, soGoodDallasData];

export const getListingBySlug = (slug: string): Listing | undefined => {
    return listings.find(listing => listing.listingSlug === slug);
} 