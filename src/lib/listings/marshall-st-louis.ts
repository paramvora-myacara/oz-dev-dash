import { Listing } from '@/types/listing';

// =================================================================================================
// MARSHALL ST. LOUIS - DATA
// =================================================================================================
export const marshallStLouisData: Listing = {
    listingName: "The Marshall St. Louis",
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
                { label: '10-Year Equity Multiple', value: '4.29x', description: 'Projected returns for investors over full hold period' },
                { label: 'Target IRR', value: '17.7%', description: 'Internal rate of return over 10-year investment cycle' },
                { label: 'Preferred Return', value: '8.0%', description: '8% compounded preferred return to investors' },
                { label: 'Total Capital Required', value: '$30.1M', description: 'New equity investment for recapitalization' },
                { label: 'Year 1 Cash Flow', value: '$1.26M', description: 'Projected first year distribution' },
                { label: 'Tax Benefits', value: '100%', description: 'Federal tax exemption on appreciation after 10 years' }
              ]
            }
          },
          {
            type: 'distributionTimeline',
            data: {
              timeline: [
                { year: 'Q2 2025', phase: 'Occupancy Begins', distribution: 'Initial', description: 'Student move-in and stabilization' },
                { year: 'Q1 2026', phase: 'First Distribution', distribution: 'Annual CF', description: 'Projected first cash flow distribution' },
                { year: '2026-2030', phase: 'Annual CF Distributions', distribution: '6-12%', description: 'Cash flow distributions through operation period' },
                { year: '2035', phase: 'Projected Sale', distribution: 'Full OZ Benefits', description: 'Exit with 100% tax-free appreciation' }
              ]
            }
          },
          {
            type: 'taxBenefits',
            data: {
              benefits: [
                { icon: 'Calendar', title: 'Tax Deferral', description: 'Defer capital gains taxes until 2026 or property sale' },
                { icon: 'Target', title: 'Tax-Free Appreciation', description: '100% federal tax exemption on all appreciation after 10 years' },
                { icon: 'DollarSign', title: 'Depreciation Benefits', description: 'Accelerated depreciation and cost segregation benefits' }
              ]
            }
          },
          {
            type: 'investmentStructure',
            data: {
              structure: [
                { label: 'Minimum Investment', value: '$250,000' },
                { label: 'Preferred Return', value: '8.0% Annual' },
                { label: 'Target Hold Period', value: '10 Years' },
                { label: 'Distribution Frequency', value: 'Annual' },
                { label: 'Fund Structure', value: 'Aptitude St. Louis LLC' },
                { label: 'Management Fee', value: '2.0% Annual' }
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
                { label: 'Total Units', value: '177', description: 'Student housing units' },
                { label: 'Total Bedrooms', value: '508', description: 'Individual bedrooms' },
                { label: 'Total SF', value: '368K', description: 'Gross square feet' },
                { label: 'Stories', value: '5', description: 'Over 2-level parking podium' }
              ]
            }
          },
          {
            type: 'amenities',
            data: {
              amenities: [
                { name: 'Professional Fitness Center', icon: 'Dumbbell' },
                { name: 'Expansive Hot-Tub Complex', icon: 'Waves' },
                { name: 'Collaborative Study Spaces', icon: 'Laptop' },
                { name: 'Individual Study Pods', icon: 'Users' },
                { name: 'Entertainment Room', icon: 'Building2' },
                { name: 'Café with Seating', icon: 'Coffee' },
                { name: 'Grilling Stations', icon: 'Utensils' },
                { name: 'Sauna & Wellness', icon: 'Waves' }
              ]
            }
          },
          {
            type: 'unitMix',
            data: {
              unitMix: [
                { type: 'Studio', count: 18, sqft: '420-520', rent: '$1,376/bed' },
                { type: '1 Bedroom', count: 15, sqft: '680-780', rent: '$1,545/bed' },
                { type: '2 Bedroom', count: 40, sqft: '950-1,150', rent: '$1,177/bed' },
                { type: '3 Bedroom', count: 30, sqft: '1,200-1,400', rent: '$1,121/bed' },
                { type: '4 Bedroom', count: 60, sqft: '1,450-1,650', rent: '$960/bed' },
                { type: 'Townhouse', count: 14, sqft: '1,800-2,200', rent: '$1,129/bed' }
              ],
              specialFeatures: {
                title: 'Special Features',
                description: '"Townhouse in the Sky" units on top floors featuring two-story layouts. All units include granite countertops, manufactured wood floors, stainless steel appliances, in-unit washer/dryer, and come fully furnished.'
              }
            }
          },
          {
            type: 'locationHighlights',
            data: {
              highlights: [
                { title: 'Adjacent to SLU', description: 'Located directly across the street from the Saint Louis University campus.', icon: 'School', colors: { bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-600 dark:text-blue-400' } },
                { title: 'Cortex Innovation District', description: 'A short walk to the premier tech and innovation hub in St. Louis.', icon: 'Cpu', colors: { bg: 'bg-green-50 dark:bg-green-900/10', text: 'text-green-600 dark:text-green-400' } },
                { title: 'Grand Center Arts District', description: 'In the heart of St. Louis\'s premier arts and culture district.', icon: 'Palette', colors: { bg: 'bg-purple-50 dark:bg-purple-900/10', text: 'text-purple-600 dark:text-purple-400' } }
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
                { label: 'SLU Enrollment Growth', value: '25%', description: 'Increase since 2020, with record highs in 2023-24' },
                { label: 'Current Students', value: '15,200+', description: 'Total enrollment with continued growth targets' },
                { label: 'Pre-Lease Rate', value: '>60%', description: 'Strong pre-leasing before construction completion' },
                { label: 'Housing Shortage', value: 'Critical', description: 'No new dorms since 2017, only 162 PBSH beds added' },
                { label: 'Rent Growth', value: '18-37%', description: 'Annual rent increases for comparable properties' },
                { label: 'Occupancy Rates', value: '96-100%', description: 'High occupancy at competitive properties' }
              ]
            }
          },
          {
            type: 'majorEmployers',
            data: {
              employers: [
                { name: 'St. Louis University', employees: '15,200', industry: 'Education', distance: '0.1 mi' },
                { name: 'BJC Healthcare', employees: '8,500+', industry: 'Healthcare', distance: '0.6 mi' },
                { name: 'Washington University', employees: '6,200+', industry: 'Education/Medical', distance: '0.6 mi' },
                { name: 'Cortex Companies', employees: '5,700+', industry: 'Tech/Biotech', distance: '0.5 mi' },
                { name: 'City Foundry Tenants', employees: '800+', industry: 'Mixed', distance: '0.1 mi' }
              ]
            }
          },
          {
            type: 'competitiveAnalysis',
            data: {
              competitors: [
                { name: 'Verve St Louis', built: '2021', beds: '162', rent: '$1,115', occupancy: '100%', rentGrowth: '18.4%' },
                { name: 'The Standard St Louis', built: '2015', beds: '465', rent: '$1,222', occupancy: '96%', rentGrowth: '37.1%' },
                { name: 'City Lofts at Laclede', built: '2006', beds: '408', rent: '$989', occupancy: '100%', rentGrowth: '30.3%' }
              ],
              summary: 'Limited supply with only 162 PBSH beds delivered since 2017, while SLU enrollment has grown 25%. Strong rent growth and occupancy rates demonstrate robust demand.'
            }
          },
          {
            type: 'keyMarketDrivers',
            data: {
              drivers: [
                { title: 'Record University Growth', description: 'St. Louis University achieved back-to-back record enrollment in 2023 and 2024, driven by strategic growth initiatives focusing on international and graduate programs.', icon: 'Award' },
                { title: 'Cortex Innovation District', description: '$2.3B in development creating 13,000+ jobs in a 200-acre tech and biotech hub, generating demand for quality housing.', icon: 'Cpu' },
                { title: 'BJC/WashU Medical Expansion', description: '$1B redevelopment of the medical campus enhancing the area\'s economic growth and employment opportunities.', icon: 'Briefcase' },
                { title: 'City Foundry Development', description: '$300M mixed-use development with retail, dining, entertainment, and office space creating 800+ permanent jobs.', icon: 'Building' }
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