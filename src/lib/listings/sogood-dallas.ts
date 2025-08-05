import { Listing } from '@/types/listing';

// =================================================================================================
// SOGOOD DALLAS - DATA
// =================================================================================================
export const soGoodDallasData: Listing = {
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
                { label: '10-Year Equity Multiple', value: '2.88x', description: 'Projected returns for investors over full hold period' },
                { label: '5-Year Equity Multiple', value: '2.5x', description: 'Returns for stabilization period' },
                { label: 'Preferred Return', value: '9.0%', description: 'Annual preferred return until stabilization' },
                { label: 'IRR Target (5-Year)', value: '20-21%', description: 'Internal rate of return for mid-term hold' },
                { label: 'IRR Target (10-Year)', value: '19-20%', description: 'Internal rate of return over full cycle' },
                { label: 'Unlevered Yield', value: '7.2%', description: 'Yield on cost through conservative underwriting' }
              ]
            }
          },
          {
            type: 'distributionTimeline',
            data: {
              timeline: [
                { year: 'Year 1-2', phase: 'Development', distribution: '0%', description: 'Construction and innovation center lease-up' },
                { year: 'Year 3-4', phase: 'Stabilization', distribution: '9%', description: 'Property reaches stabilized occupancy' },
                { year: 'Year 5-7', phase: 'Value Creation', distribution: '9%+', description: 'NOI growth and rent appreciation' },
                { year: 'Year 8-10', phase: 'Exit Preparation', distribution: '9%+', description: 'Optimization for sale or refinance' }
              ]
            }
          },
          {
            type: 'taxBenefits',
            data: {
              benefits: [
                { icon: 'Calendar', title: 'Capital Gains Deferral', description: 'Defer federal capital gains tax until 2026 or fund exit' },
                { icon: 'Target', title: 'Basis Step-Up', description: 'Partial forgiveness of deferred gains after 5+ years' },
                { icon: 'DollarSign', title: 'Tax-Free Appreciation', description: '100% federal tax exemption on all appreciation after 10 years' }
              ]
            }
          },
          {
            type: 'investmentStructure',
            data: {
              structure: [
                { label: 'Minimum Investment', value: '$500,000' },
                { label: 'Preferred Return', value: '9.0% Annual' },
                { label: 'Target Hold Period', value: '10+ Years' },
                { label: 'Distribution Frequency', value: 'Annual' },
                { label: 'Fund Structure', value: 'Dallas OZ Fund I LLC' },
                { label: 'Management Fee', value: '2.0% Annual' },
                { label: 'Sponsor Promote', value: '30% after pref' }
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
                { label: 'Total Units', value: '388', description: 'Total residential units' },
                { label: 'Site Acres', value: '14', description: 'Total land area for development' },
                { label: 'Total Commercial SF', value: '84,856', description: 'Retail and innovation center space' },
                { label: 'Expected Delivery', value: '2027', description: 'Projected completion date' }
              ]
            }
          },
          {
            type: 'amenities',
            data: {
              amenities: [
                { name: 'Innovation Center', icon: 'Laptop' },
                { name: 'Retail & Dining Spaces', icon: 'Building2' },
                { name: 'Green Recreation Areas', icon: 'Waves' },
                { name: 'Community Fitness Center', icon: 'Dumbbell' },
                { name: 'Pet-Friendly Amenities', icon: 'Coffee' },
                { name: 'Concierge Services', icon: 'Users' },
                { name: 'Electric Vehicle Charging', icon: 'Car' },
                { name: 'Package Management', icon: 'Utensils' }
              ]
            }
          },
          {
            type: 'developmentPhases',
            data: {
              phases: [
                { phase: 'Phase I - The Hub at SoGood', units: 116, sqft: '123,777 SF', features: 'Innovation Center (35,264 SF) + Retail (42,794 SF)', timeline: 'July 2025 - August 2027' },
                { phase: 'Phase II - MKT Residences', units: 272, sqft: '206,118 SF', features: 'Retail Space (6,798 SF) + Farmers Commons', timeline: 'July 2025 - August 2027' }
              ]
            }
          },
          {
            type: 'locationFeatures',
            data: {
              featureSections: [
                { category: 'Transit & Connectivity', icon: 'Bus', features: ['Adjacent to future IH-30 deck park', 'Near Dallas Farmers Market', 'Close to Deep Ellum entertainment district', 'Walking distance to Fair Park'] },
                { category: 'Urban Amenities', icon: 'MapPin', features: ['$3.7B Kay Bailey Hutchison Convention Center expansion', 'The Cedars historic district', 'Dallas Farmers Market dining & shopping', 'Multiple cultural venues nearby'] },
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
                { label: 'DFW Population', value: '7M+', description: 'Metro area population leading US growth' },
                { label: 'Job Growth (5-Year)', value: '602,200', description: 'Net new jobs added, leading all US metros' },
                { label: 'Fortune 1000 HQs', value: '43', description: 'Companies headquartered in DFW' },
                { label: 'Tech Jobs Added', value: '59,000', description: 'New technology positions in past 5 years' },
                { label: 'Annual Migration', value: '120,000+', description: 'Net in-migration to Texas annually' },
                { label: 'Rent Growth', value: '+42%', description: 'Class A multifamily rent appreciation (5-year)' }
              ]
            }
          },
          {
            type: 'majorEmployers',
            data: {
              employers: [
                { name: 'American Airlines', employees: '30,000+', industry: 'Aviation', distance: '15 mi' },
                { name: 'AT&T', employees: '25,000+', industry: 'Telecommunications', distance: '12 mi' },
                { name: 'Texas Instruments', employees: '15,000+', industry: 'Technology', distance: '18 mi' },
                { name: 'Bank of America', employees: '12,000+', industry: 'Financial Services', distance: '10 mi' },
                { name: 'Dallas County', employees: '14,000+', industry: 'Government', distance: '8 mi' },
                { name: 'Baylor Scott & White', employees: '45,000+', industry: 'Healthcare', distance: '20 mi' }
              ]
            }
          },
          {
            type: 'demographics',
            data: {
              demographics: [
                { category: 'Age 25-34', value: '16.8%', description: 'Prime renting demographic' },
                { category: 'Age 35-44', value: '14.2%', description: 'Family formation years' },
                { category: 'College Educated', value: '38%', description: 'Bachelor\'s degree or higher' },
                { category: 'Median Household Income', value: '$70,663', description: 'DFW metro median' }
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