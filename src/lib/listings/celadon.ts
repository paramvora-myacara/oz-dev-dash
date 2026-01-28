import { Listing } from '@/types/listing';

// =================================================================================================
// CELADON PORTFOLIO - DATA
// =================================================================================================
export const celadonData: Listing = {
    listingName: "Celadon - Illinois OZ Portfolio",
    
   
    sections: [
        {
            type: 'hero',
            data: {
                listingName: "Celadon - Illinois OZ Portfolio",
                location: "Chicago & Evanston, IL",
                minInvestment: 0,
                fundName: "Celadon QOF",
            }
        },
        {
            type: 'tickerMetrics',
            data: {
                metrics: [
                    { label: "Total Project Cost", value: "$165M", change: "Portfolio Total" },
                    { label: "QOF Equity", value: "$55M", change: "Capital Required" },
                    { label: "Committed Funding", value: "66%", change: "From Non-OZ Sources" },
                    { label: "Hold Period", value: "10 Years", change: "OZ Qualified" },
                    { label: "Tax Benefit", value: "100%", change: "Tax-Free Exit" },
                    { label: "Sponsor Track Record", value: "4,000+", change: "Units Developed" }
                ]
            }
        },
        {
            type: 'compellingReasons',
            data: {
                reasons: [
                    {
                        title: "High Certainty of Execution",
                        description: "Binding site control for all assets with all zoning in place. 66% of funding already committed from non-OZ sources.",
                        icon: 'CheckCircle',
                        highlight: "66% Funded",
                    },
                    {
                        title: "Award-Winning Sponsor",
                        description: "Celadon is a financially strong sponsor with over 4,000 multi-family units developed. Multiple Driehaus Awards for historic restorations.",
                        icon: 'Award',
                        highlight: "4,000+ Units",
                    },
                    {
                        title: "Strategic Historic Restorations",
                        description: "$165M investment across four Illinois communities with strong fundamentals, transforming historic buildings into hospitality and housing.",
                        icon: 'Building',
                        highlight: "$165M Investment",
                    }
                ]
            }
        },
        {
            type: 'executiveSummary',
            data: {
                summary: {
                    quote: "What if you could revitalize historic American landmarks while generating tax-advantaged returns in high-growth corridors?",
                    paragraphs: [
                        "The Celadon Opportunity Zone Portfolio represents a $165 Million investment in four Illinois communities—Evanston, Pullman, West Pullman, and Collinsville—all boasting strong real estate fundamentals. By transforming iconic historic buildings into modern boutique hotels, music venues, and workforce housing, we are creating lasting value for both investors and communities.",
                        "This portfolio stands out due to its exceptionally high certainty of execution. With binding site control, all zoning in place, and 66% of the total development cost already committed from non-OZ sources, this is a de-risked opportunity to participate in a large-scale urban transformation under the Opportunity Zone program."
                    ],
                    conclusion: "Backed by an award-winning developer with a track record of 4,000+ units, this portfolio offers a unique intersection of historic preservation, community impact, and robust economic returns."
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
                            { label: "Total Investment", value: "$165M" },
                            { label: "QOF Equity", value: "$55M" },
                            { label: "Funding Committed", value: "66%" }
                        ],
                        summary: "Strong economic returns backed by secured non-OZ funding and project-based subsidies.",
                    },
                    {
                        id: "portfolio-projects", 
                        title: "Portfolio Breakdown",
                        keyMetrics: [
                            { label: "Total Assets", value: "4" },
                            { label: "Asset Type", value: "Mixed-Use" },
                            { label: "Project Status", value: "Zoning Secured" }
                        ],
                        summary: "Detailed look at the four historic restoration projects across Illinois",
                    },
                    {
                        id: "market-analysis",
                        title: "Market Analysis", 
                        keyMetrics: [
                            { label: "Units Developed", value: "4,000+" },
                            { label: "MSAs", value: "Chicago/St. Louis" },
                            { label: "Target Sector", value: "Hospitality/Housing" }
                        ],
                        summary: "Strong demographic and economic drivers in the Pullman and Evanston corridors",
                    },
                    {
                        id: "sponsor-profile",
                        title: "Sponsor Profile",
                        keyMetrics: [
                            { label: "Sponsor", value: "Celadon" },
                            { label: "Experience", value: "Est. 2008" },
                            { label: "Awards", value: "Driehaus Award" }
                        ],
                        summary: "Experienced leadership with investment banking and large-scale development backgrounds",
                    }
                ]
            }
        }
    ],
    details: {
      financialReturns: {
        pageTitle: 'Financial Returns',
        pageSubtitle: 'Strong economic returns driven by a 10-year investment horizon and optimized capital stack.',
        backgroundImages: [],
        sections: [
          {
            type: 'projections',
            data: {
              projections: [
                { label: 'Total Development Cost', value: '$165M', description: 'Total investment across the four-property portfolio.' },
                { label: 'QOF Equity Required', value: '$55M', description: 'Total equity allocated for the Opportunity Zone fund.' },
                { label: 'Non-OZ Funding Source', value: '66%', description: 'Capital already committed from other institutional sources.' },
                { label: 'Track Record', value: '4,000+ Units', description: 'Sponsor experience in multi-family and historic development.' },
                { label: 'Year 10 Residual', value: 'Attractive', description: 'Strong residual value at OZ exit based on projected Year 10 NOI.' },
                { label: 'Site Control', value: '100% Binding', description: 'All assets have binding site control and zoning in place.' }
              ]
            }
          },
          {
            type: 'taxBenefits',
            data: {
              benefits: [
                { icon: 'Target', title: 'Tax-Free Appreciation', description: '100% federal tax exemption on all appreciation after a 10-year hold.' },
                { icon: 'Award', title: 'Historic Tax Credits', description: 'Additional tax benefits generated by the historic nature of the restorations.' },
                { icon: 'Calendar', title: 'Capital Gains Deferral', description: 'Defer existing capital gains taxes by reinvesting into the Celadon QOF.' }
              ]
            }
          },
          {
            type: 'investmentStructure',
            data: {
              structure: [
                { label: 'Asset Type', value: 'Portfolio (Hospitality/Housing/Venue)' },
                { label: 'Target Hold Period', value: '10 Years' },
                { label: 'Distribution Frequency', value: 'Annual' },
                { label: 'Sponsor Entity', value: 'Celadon' }
              ]
            }
          }
        ]
      },
      portfolioProjects: {
        pageTitle: 'Portfolio Overview',
        pageSubtitle: 'Four strategic assets across Illinois, each with unique community impact and strong fundamentals.',
        backgroundImages: [],
        sections: [
          {
            type: 'projectOverview',
            data: {
              projects: [
                {
                  name: "Hotel Florence",
                  location: "Pullman, Chicago, IL",
                  status: "Completion 2028",
                  highlights: [
                    "$85 million historic restoration of the 1881 hotel and Pullman factory",
                    "New boutique hotel, bar, restaurant, world-class music venue, and workforce housing",
                    "Adjacent to Pullman National Monument, University of Chicago, and Illinois Quantum Park",
                    "Located in a neighborhood experiencing unprecedented investment and job growth"
                  ]
                },
                {
                  name: "Harley Clarke Mansion",
                  location: "Evanston, IL",
                  status: "Completion 2027",
                  highlights: [
                    "$30 million historic restoration of the 1927 lakefront mansion and coach house",
                    "Premier wedding and venue space with 10,000 sf of corporate conference space",
                    "Features restaurant, bar, ice cream shop, coffee shop and speakeasy",
                    "Lakefront location north of Northwestern University in IL's highest income neighborhood"
                  ]
                },
                {
                  name: "West Pullman Elementary",
                  location: "West Pullman, Chicago, IL",
                  status: "Completion 2027",
                  highlights: [
                    "$15 million acquisition and historic restoration of 1895 era elementary school",
                    "Conversion of auditorium into performance venue and urban farm at former playground",
                    "New Long Term, Project Based Section 8 Rental Subsidies",
                    "Subsidies expected to increase cash flow and residual value in year 10"
                  ]
                },
                {
                  name: "Collinsville High School",
                  location: "Collinsville, IL",
                  status: "Completion 2028",
                  highlights: [
                    "$35 million historic restoration of the 1905 era high school building",
                    "Conversion into workforce housing and new performance venue space",
                    "New YMCA community service facility integrated on-site",
                    "Strategic community-centric restoration serving as a local economic catalyst"
                  ]
                }
              ]
            }
          }
        ]
      },
      propertyOverview: {
          pageTitle: 'Property Details',
          pageSubtitle: 'Key facts and amenities across the Celadon portfolio.',
          backgroundImages: [],
          sections: [
              {
                  type: 'keyFacts',
                  data: {
                      facts: [
                          { label: 'Total Investment', value: '$165M', description: 'Total Development Cost (TDC)' },
                          { label: 'Total Assets', value: '4', description: 'Historic properties in Illinois' },
                          { label: 'Committed Funding', value: '66%', description: 'Non-OZ funding already secured' },
                          { label: 'Completion', value: '2027-28', description: 'Rolling delivery schedule' }
                      ]
                  }
              },
              {
                  type: 'amenities',
                  data: {
                      amenities: [
                          { name: 'World Class Music Venue', icon: 'Music' },
                          { name: 'Boutique Hotel & Bar', icon: 'Hotel' },
                          { name: 'YMCA Community Facility', icon: 'Users' },
                          { name: 'Wedding & Venue Space', icon: 'Heart' },
                          { name: 'Premier Restaurant', icon: 'Utensils' },
                          { name: 'Urban Farm', icon: 'Leaf' },
                          { name: 'Speakeasy & Coffee Shop', icon: 'Coffee' },
                          { name: 'Workforce Housing', icon: 'Home' }
                      ]
                  }
              }
          ]
      },
      marketAnalysis: {
        pageTitle: 'Market Analysis',
        pageSubtitle: 'Strong fundamentals in Illinois corridors with high per-capita income and job growth.',
        backgroundImages: [],
        sections: [
          {
            type: 'marketMetrics',
            data: {
              metrics: [
                { label: 'Evanston Income', value: 'Highest in IL', description: 'Home to high per capita income residents' },
                { label: 'Pullman Investment', value: 'Unprecedented', description: 'Significant job growth in Pullman corridor' },
                { label: 'Section 8 Subsidies', value: 'Project Based', description: 'Long-term subsidies increasing West Pullman cash flow' },
                { label: 'Non-OZ Funding', value: '66%', description: 'Strong validation from traditional lenders' },
                { label: 'Units Developed', value: '4,000+', description: 'Celadon track record since 2008' },
                { label: 'MSAs', value: 'Chicago/Metro', description: 'Primary and secondary market exposure' }
              ]
            }
          },
          {
            type: 'keyMarketDrivers',
            data: {
              drivers: [
                { title: 'Historic Preservation', description: 'Leveraging historic tax credits and Driehaus award-winning expertise.', icon: 'Award' },
                { title: 'Community Synergy', description: 'Partnerships with YMCA and Art Of Culture ensure high utilization.', icon: 'Users' },
                { title: 'Housing Deficit', description: 'Addressing the critical need for workforce housing in Illinois.', icon: 'Home' },
                { title: 'Economic Anchors', description: 'Proximity to major universities and new tech microelectronics parks.', icon: 'Cpu' }
              ]
            }
          },
          {
            type: 'supplyDemand',
            data: {
              analysis: [
                { title: 'Venue Demand', description: 'Need for premier wedding and corporate event space in Evanston.', icon: 'TrendingUp' },
                { title: 'Subsidized Housing', description: 'Strong demand for workforce housing with project-based subsidies.', icon: 'Home' }
              ]
            }
          },
          {
            type: 'economicDiversification',
            data: {
              sectors: [
                { title: 'Education & Tech', description: 'Proximity to UChicago, Northwestern, and the new Quantum Park.' },
                { title: 'Hospitality & Culture', description: 'Boutique hotels and music venues driving local tourism.' }
              ]
            }
          }
        ]
      },
      sponsorProfile: {
        sponsorName: "Celadon",
        sections: [
          {
            type: 'sponsorIntro',
            data: {
              sponsorName: "About Celadon",
              content: {
                paragraphs: [
                  "Established in 2008, Celadon is a financially strong and experienced sponsor with a leadership team hailing from J.P. Morgan Investment Bank.",
                  "As an award-winning developer of historic buildings, Celadon has earned multiple Driehaus Awards for its excellence in preservation and community development. With over 4,000 multi-family units developed across 7 states, they bring institutional-quality execution to every project."
                ],
                highlights: {
                  type: 'icons',
                  items: [
                    { text: "4,000+ Units Developed", icon: "Building" },
                    { text: "Multiple Driehaus Awards", icon: "Award" },
                    { text: "Ex-J.P. Morgan Leadership", icon: "Briefcase" },
                    { text: "Established 2008", icon: "Calendar" }
                  ]
                }
              }
            }
          },
          {
            type: 'trackRecord',
            data: {
              metrics: [
                { label: "Total Units", value: "4,000+", description: "Developed across 7 states" },
                { label: "Years Experience", value: "15+", description: "Established in 2008" },
                { label: "Driehaus Awards", value: "Multiple", description: "Excellence in historic restoration" },
                { label: "Market Presence", value: "7 States", description: "Proven national development capability" }
              ]
            }
          },
          {
            type: 'leadershipTeam',
            data: {
              teamMembers: [
                {
                  name: "Celadon Leadership",
                  title: "Principal Developers",
                  experience: "20+ years",
                  background: "Former J.P. Morgan Investment Bank leadership with deep expertise in structured finance and real estate development."
                },
                {
                  name: "YMCA",
                  title: "Operating Partner",
                  experience: "100+ years",
                  background: "World-class community service facilities operator providing essential local services."
                },
                {
                  name: "Art Of Culture",
                  title: "Venue Operator",
                  experience: "Established",
                  background: "Expert performance venue operator managing world-class music and cultural spaces."
                }
              ]
            }
          },
          {
            type: 'developmentPortfolio',
            data: {
              projects: [
                { name: "Hotel Florence", location: "Pullman, IL", units: "Boutique Hotel", year: "2028", status: "In Progress", returnsOrFocus: "Historic Restoration" },
                { name: "Harley Clarke", location: "Evanston, IL", units: "Venue Space", year: "2027", status: "In Progress", returnsOrFocus: "Lakefront Premier Venue" },
                { name: "West Pullman Elemenatar", location: "Chicago, IL", units: "Venue/Housing", year: "2027", status: "In Progress", returnsOrFocus: "Section 8 Subsidies" },
                { name: "Collinsville HS", location: "Collinsville, IL", units: "YMCA/Housing", year: "2028", status: "In Progress", returnsOrFocus: "Community Focus" }
              ],
              investmentPhilosophy: {
                title: "Investment Philosophy",
                description: "Celadon focuses on historic restoration and catalytic community projects that leverage multiple funding sources and tax credits to deliver superior risk-adjusted returns while preserving architectural heritage."
              }
            }
          },
          {
            type: 'competitiveAdvantages',
            data: {
              advantages: [
                { icon: "ShieldCheck", title: "Site Control", description: "Binding site control for all assets with all zoning already in place." },
                { icon: "Handshake", title: "Committed Funding", description: "66% of funding already committed from non-OZ sources, significantly de-risking the project." },
                { icon: "Award", title: "Tax Credit Expertise", description: "Deep experience in historic tax credits and other specialized real estate incentives." },
                { icon: "Users", title: "Strong Partnerships", description: "Committed operating partners including the YMCA and Art Of Culture." }
              ]
            }
          }
        ]
      }
    }
};
