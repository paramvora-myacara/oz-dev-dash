import { Listing } from '@/types/listing';

export const skyEverettData: Listing = {
  listingName: "SKY Everett",
  sections: [
    {
      type: "hero",
      data: {
        listingName: "SKY Everett",
        location: "114 Spring Street, Everett, MA",
        fundName: "V10 Development"
      }
    },
    {
      type: "tickerMetrics",
      data: {
        metrics: [
          { label: "Target IRR", value: "22.6%", change: "Leveraged" },
          { label: "Equity Multiple", value: "2.13x", change: "4-Year Hold" },
          { label: "Total GSF", value: "191,045", change: "7 Stories" },
          { label: "LTC", value: "65%", change: "Debt" },
          { label: "Hold Period", value: "4 Years", change: "Target" },
          { label: "Tax Benefit", value: "100%", change: "OZ Benefit" }
        ]
      }
    },
    {
      type: "compellingReasons",
      data: {
        reasons: [
          {
            title: "Strategic Podium Development",
            description: "An optimized 5-over-2 podium project featuring 124 upscale units, designed for construction efficiency and high yield in a priority transit-oriented zone.",
            highlight: "7-Story Podium",
            icon: "Building2"
          },
          {
            title: "Unrivaled Connectivity",
            description: "Strategically located just one mile from the MBTA Silver Line, with immediate access to Boston's Seaport District and a future on-site Silver Line stop.",
            highlight: "TOD Priority",
            icon: "Train"
          },
          {
            title: "Dynamic Urban Transformation",
            description: "Located in Everett's booming Commercial Triangle, capturing a 13.2% population growth rate—nearly double the national average.",
            highlight: "13.2% Pop Growth",
            icon: "TrendingUp"
          }
        ]
      }
    },
    {
      type: "executiveSummary",
      data: {
        summary: {
          quote: "SKY Everett represents a strategic opportunity to develop an optimized residential project in Greater Boston's fastest-growing community.",
          paragraphs: [
            "V10 Development is facilitating the development of SKY Everett, a transformative 7-story residential project at 114 Spring Street in Everett. The project comprises 124 upscale apartment units, structured parking, and premium amenity space, capitalizing on the booming demand for luxury housing in the Commercial Triangle Economic Development District.",
            "Located within a Qualified Opportunity Zone, SKY Everett offers investors a high-growth investment with powerful tax incentives. With a unit mix designed for maximum yield and proximity to major economic drivers like Encore Boston Harbor, the project delivers exceptional risk-adjusted returns through an optimized 5-over-2 wood-frame over concrete podium structure."
          ],
          conclusion: "This project is positioned to capture significant value in Boston's highest-growth submarket while delivering powerful OZ tax benefits on appreciation."
        }
      }
    },
    {
      type: "investmentCards",
      data: {
        cards: [
          {
            id: "financial-returns",
            title: "Financial Returns",
            keyMetrics: [
              { label: "Target IRR", value: "22.6%" },
              { label: "Equity Multiple", value: "2.13x" },
              { label: "Total Cost", value: "$61.4M" }
            ],
            summary: "Compelling project returns driven by 65% LTC leverage and strong submarket growth."
          },
          {
            id: "property-overview",
            title: "Property Overview",
            keyMetrics: [
              { label: "Total Units", value: "124" },
              { label: "Stories", value: "7" },
              { label: "Total GSF", value: "191,045" }
            ],
            summary: "Efficient 5-over-2 podium design with luxury residential and ground-floor retail."
          },
          {
            id: "market-analysis",
            title: "Market Analysis",
            keyMetrics: [
              { label: "Pop. Growth", value: "13.2%" },
              { label: "Submarket", value: "Everett" },
              { label: "Distance to BOS", value: "4 Miles" }
            ],
            summary: "Everett is Boston's fastest-growing community with double the national growth rate."
          },
          {
            id: "sponsor-profile",
            title: "Sponsor Profile",
            keyMetrics: [
              { label: "Developer", value: "V10 Development" },
              { label: "Track Record", value: "1200+ Units" },
              { label: "Experience", "value": "11+ Years" }
            ],
            summary: "Expert team with deep local roots and a specialized track record in urban infill."
          }
        ]
      }
    }
  ],
  details: {
    financialReturns: {
      pageTitle: "Financial Returns",
      pageSubtitle: "Optimized OZ Investment Structure",
      backgroundImages: [],
      sections: [
        {
          type: "projections",
          data: {
            projections: [
              { label: "Total GSF", value: "191,045", description: "Gross square footage including parking and retail." },
              { label: "Target IRR", value: "22.6%", description: "Projected leveraged investor return." },
              { label: "Equity Multiple", value: "2.13x", description: "Projected leveraged multiple over 4-year hold." },
              { label: "Stabilized NOI", value: "$3.98M", description: "Untrended net operating income at stabilization." },
              { label: "Yield on Cost", value: "6.49%", description: "Untrended return on total project cost." },
              { label: "Exit Cap Rate", value: "5.00%", description: "Assumed exit capitalization rate at disposition." }
            ]
          }
        },
        {
          type: "capitalStack",
          data: {
            uses: [
              { use: "Land Costs", amount: "$8,500,000", percentage: "13.8%", description: "Acquisition and site-related land costs." },
              { use: "Hard Costs", amount: "$42,000,000", percentage: "68.4%", description: "Building construction and site improvements." },
              { use: "Soft Costs", amount: "$7,125,000", percentage: "11.6%", description: "Design, legal, and other professional fees." },
              { use: "Reserves", amount: "$3,750,000", percentage: "6.1%", description: "Interest and operating reserves during lease-up." }
            ],
            sources: [
              { source: "Construction Loan", amount: "$39,893,750", percentage: "65.0%", perUnit: "$319,150", description: "Senior construction financing." },
              { source: "LP Equity", amount: "$18,259,063", percentage: "29.8%", perUnit: "$146,073", description: "Investor equity contribution." },
              { source: "GP Equity", amount: "$3,222,188", percentage: "5.2%", perUnit: "$25,778", description: "Sponsor equity contribution." }
            ],
            totalProject: "$61,375,000"
          }
        },
        {
          type: "distributionTimeline",
          data: {
            timeline: [
              { year: "2022", phase: "Construction Start", distribution: "0%", description: "Commencement of site work and vertical construction." },
              { year: "2024", phase: "Construction Completion", distribution: "0%", description: "Building delivery and start of residential lease-up." },
              { year: "2025-2026", phase: "Stabilization", distribution: "6-8%", description: "Operations at stabilized occupancy (97%)." },
              { year: "Year 4-10", phase: "Disposition", distribution: "100%", description: "Strategic exit to maximize investor returns and OZ benefits." }
            ]
          }
        },
        {
          type: "taxBenefits",
          data: {
            benefits: [
              { icon: "Calendar", title: "Capital Gains Deferral", description: "Defer federal taxes on existing capital gains by reinvesting into SKY Everett." },
              { icon: "DollarSign", title: "Tax-Free Appreciation", description: "Pay zero capital gains tax on the appreciation of your SKY Everett investment after 10 years." },
              { icon: "TrendingUp", title: "Inner Core Growth", description: "Capture value in Boston's highest-growth submarket while optimizing tax liability." }
            ]
          }
        },
        {
          type: "investmentStructure",
          data: {
            structure: [
              { label: "Asset Type", value: "Luxury Multifamily" },
              { label: "Hold Period", value: "4-10 Years" },
              { label: "Sponsor", value: "V10 Development" }
            ]
          }
        },
        {
          type: "distributionWaterfall",
          data: {
            saleWaterfall: [
              { priority: "Return of Capital", allocation: "85/15", description: "Return of all capital plus a 10% preferred return to investors." },
              { priority: "Tier 1", allocation: "72/28", description: "Next tier of returns until a 15% IRR is achieved." },
              { priority: "Tier 2", allocation: "68/32", description: "Next tier of returns until a 25% IRR is achieved." },
              { priority: "Tier 3", allocation: "64/36", description: "Next tier of returns until a 28% IRR is achieved." }
            ],
            cashFlowDistribution: [
              { priority: "Pari Passu", allocation: "85/15", description: "Operating cash flow distributed according to equity shares." }
            ]
          }
        }
      ]
    },
    propertyOverview: {
      pageTitle: "Property Overview",
      pageSubtitle: "Modern Luxury in Everett's Commercial Triangle",
      backgroundImages: [],
      sections: [
        {
          type: "keyFacts",
          data: {
            facts: [
              { label: "Total Units", value: "124", description: "An optimized mix of modern 1BR, 2BR, and 3BR units." },
              { label: "Stories", value: "7", description: "Efficient 5-over-2 podium construction." },
              { label: "Total GSF", value: "191,045", description: "Gross area including residential, retail, and parking." },
              { label: "Amenity SF", value: "7,398", description: "Premium common space and high-end resident amenities." }
            ]
          }
        },
        {
          type: "unitMix",
          data: {
            unitMix: [
              { type: "1 Bedroom (Market)", count: 67, sqft: "668", rent: "$3,100" },
              { type: "2 Bedroom (Market)", count: 46, sqft: "940", rent: "$3,850" },
              { type: "3 Bedroom (Market)", count: 5, sqft: "1,964", rent: "$5,000" },
              { type: "1 Bedroom (Affordable)", count: 3, sqft: "700", rent: "$2,351" },
              { type: "2 Bedroom (Affordable)", count: 3, sqft: "1,050", rent: "$2,602" }
            ],
            specialFeatures: {
              title: "95% Market Rate",
              description: "Dominant market-rate mix designed for maximum yield and high demand."
            }
          }
        },
        {
          type: "amenities",
          data: {
            amenities: [
              { name: "Rooftop Bar & Restaurant", icon: "Utensils" },
              { name: "Sky Pool Deck", icon: "Sun" },
              { name: "State-of-the-art Fitness", icon: "Dumbbell" },
              { name: "Yoga Studio", icon: "Activity" },
              { name: "Outdoor Patios (7th Floor)", icon: "Map" },
              { name: "Dog Spa", icon: "Dog" },
              { name: "Work Pods & Conference", icon: "Laptop" },
              { name: "Bocce Court", icon: "Target" }
            ]
          }
        },
        {
          type: "locationHighlights",
          data: {
            highlights: [
              { title: "Encore Boston Harbor", description: "Only 1.5 miles from the $2.6B Five-Star casino resort and job center.", icon: "Palmtree" },
              { title: "MBTA Silver Line", description: "Immediate proximity to the SL3 station and future on-site stop.", icon: "Train" },
              { title: "Inner Urban Core", description: "4 minutes from Route 1 with direct links to I-93, I-90, and Logan Airport.", icon: "Navigation" }
            ]
          }
        },
        {
          type: "locationFeatures",
          data: {
            featureSections: [
              {
                category: "Commute Times (Transit)",
                icon: "Train",
                features: [
                  "North Station: 12-16 minutes",
                  "Seaport District: 20 minutes",
                  "South Station: 25 minutes",
                  "Logan Airport: 10 minutes",
                  "Kendall Square: 15-20 minutes"
                ]
              },
              {
                category: "Drive Times",
                icon: "Car",
                features: [
                  "Somerville: 15 minutes",
                  "Cambridge: 20 minutes",
                  "Kendall Sq: 14 minutes",
                  "Financial District: 15 minutes",
                  "Logan Airport: 8 minutes",
                  "Revere Beach: 10 minutes"
                ]
              },
              {
                category: "Local Attractions",
                icon: "MapPin",
                features: [
                  "Encore Boston Harbor (1.5 miles)",
                  "Assembly Row (2.2 miles)",
                  "Cambridge Crossing (2.8 miles)",
                  "Faneuil Hall (4.2 miles)"
                ]
              }
            ]
          }
        }
      ]
    },
    marketAnalysis: {
      pageTitle: "Market Analysis",
      pageSubtitle: "Greater Boston's Fastest Growing Submarket",
      backgroundImages: [],
      sections: [
        {
          type: "marketMetrics",
          data: {
            metrics: [
              { label: "Pop. Growth (Everett)", value: "13.2%", description: "Highest growth rate among Boston Inner Core communities." },
              { label: "Projected Growth (2030)", value: "11.7%", description: "Sustained momentum projected by MAPC." },
              { label: "Transit Access", value: "20 Min", description: "Direct access to Seaport and South Station." },
              { label: "Nearby Dev Pipeline", value: "2,318 Units", description: "Significant institutional capital entering the submarket." },
              { label: "Avg Rent (1BR)", value: "$3,100", description: "Strong rent yields compared to urban core." },
              { label: "Employment Base", value: "783k+", description: "Jobs within a 5-mile radius of the property." }
            ]
          }
        },
        {
          type: "supplyDemand",
          data: {
            analysis: [
              {
                icon: "Home",
                title: "Significant Supply Imbalance",
                description: "Since 2010, the Metro Mayors Coalition communities have added 110,000 residents and 148,000 new jobs, while permitting only 32,500 new housing units."
              },
              {
                icon: "TrendingUp",
                title: "Pent-up Demand",
                description: "Intense competition for limited available housing drives up prices and makes it difficult for residents to find affordable luxury options, positioning SKY as a primary solution."
              },
              {
                icon: "ArrowRightLeft",
                title: "Inner Core Shift",
                description: "Renters are migrating to Everett to capture a relative discount to Downtown living (20-30%) without sacrificing transit accessibility or amenity quality."
              }
            ]
          }
        },
        {
          type: "economicDiversification",
          data: {
            sectors: [
              {
                title: "Athens of America (Education)",
                description: "Home to 50+ colleges and 250,000+ students, with 51% of the adult population holding a BA degree or higher."
              },
              {
                title: "Global Biotech Epicenter",
                description: "Massachusetts ranks #2 in the nation for VC funding ($19.7B) and employs over 103,000 biotech professionals."
              },
              {
                title: "Medical Innovation Leader",
                description: "Boston is a 25-year consecutive leader in NIH funding ($3.3B in 2020), hosting the #1 children's hospital and top global cancer centers."
              },
              {
                title: "Sustainability Leader",
                description: "Ranked #1 in energy efficiency by ACEEE, attracting environmentally conscious institutional capital and residents."
              }
            ]
          }
        },
        {
          type: "demographics",
          data: {
            layout: "matrix",
            matrix: {
              headers: ["3 Mi Radius", "5 Mi Radius", "10 Mi Radius"],
              rows: [
                { label: "2021 Est. Population", values: ["370,046", "829,642", "1,863,229"] },
                { label: "Projected Ann. Growth", values: ["0.4%", "0.5%", "0.4%"] },
                { label: "Avg. HH Income", values: ["$108,427", "$126,240", "$127,424"] },
                { label: "Total Businesses", values: ["17,563", "47,858", "92,616"] },
                { label: "Total Employees", values: ["215,154", "690,431", "1,154,035"] }
              ]
            }
          }
        },
        {
          type: "majorEmployers",
          data: {
            employers: [
              { name: "Encore Boston Harbor", employees: "5,000", industry: "Hospitality/Gaming", distance: "1.5 miles" },
              { name: "FBI Regional HQ", employees: "1,000+", industry: "Government", distance: "1.0 mile" },
              { name: "Partners Healthcare", employees: "Varies", industry: "Healthcare", distance: "2.5 miles" },
              { name: "Amazon Robotics", employees: "Varies", industry: "Technology", distance: "3.0 miles" }
            ]
          }
        },
        {
          type: "competitiveAnalysis",
          data: {
            categories: [
              {
                title: "Development Pipeline by Year",
                projects: [
                  { name: "2022 Deliveries", units: "77" },
                  { name: "2023 Deliveries", units: "1,175" },
                  { name: "2024 Deliveries", units: "1,066" }
                ],
                total: "2,318 Units"
              },
              {
                title: "Somerville Lab Pipeline",
                projects: [
                  { name: "Life Science SF", units: "6.6M SF" }
                ]
              }
            ],
            summary: "Everett and neighboring Somerville are seeing massive institutional investment, with over 2,300 residential units and 6M+ SF of lab space in the immediate pipeline."
          }
        },
        {
          type: "competitiveAnalysis",
          data: {
            competitors: [
              { name: "SKY Everett", built: "2024 (Proj)", beds: "124 Units", rent: "$3,100 (1BR)", occupancy: "Initial", rentGrowth: "N/A" },
              { name: "The Pioneer", built: "2020", beds: "289 Units", rent: "$2,503 (1BR)", occupancy: "90%", rentGrowth: "Strong" },
              { name: "100 Sudbury", built: "2018", beds: "368 Units", rent: "$4,402 (1BR)", occupancy: "96%", rentGrowth: "Stable" },
              { name: "50 Causeway", built: "2019", beds: "440 Units", rent: "$3,715 (1BR)", occupancy: "79%", rentGrowth: "Leasing" },
              { name: "485 Foley (Assembly Row)", built: "2021", beds: "500 Units", rent: "$3,165 (1BR)", occupancy: "Lease-up", rentGrowth: "High" }
            ],
            summary: "SKY Everett provides luxury tower living at a relative discount to Downtown Boston peers ($3,100 vs $4,400+), while offering superior views and newer finishes."
          }
        },
        {
          type: "keyMarketDrivers",
          data: {
            drivers: [
              { title: "Transit Expansion", description: "Silver Line extension and new Commuter Rail station.", icon: "Train" },
              { title: "Institutional Demand", description: "Greystar and Northwestern Mutual investing heavily in Everett.", icon: "Building2" },
              { title: "Rent Discount", description: "Everett provides an urban lifestyle at a discount to Seaport/Back Bay.", icon: "TrendingDown" },
              { title: "Amenity Hub", description: "Proximity to Assembly Row and Encore Boston Harbor destination.", icon: "ShoppingBag" }
            ]
          }
        }
      ]
    },
    sponsorProfile: {
      sponsorName: "V10 Development",
      sections: [
        {
          type: "sponsorIntro",
          data: {
            sponsorName: "About V10 Development",
            content: {
              paragraphs: [
                "V10 Development brings exciting, placemaking projects to underappreciated communities. By working closely with local officials and residents, V10 understands what drives success and organizes the resources necessary to realize these dreams.",
                "Formed by John Tocco and Ricky Beliveau, V10 specializes in bringing leading-edge development to untapped markets with significant potential, creating landmark features like SKY Everett."
              ],
              highlights: {
                type: "icons",
                items: [
                  { text: "Specialized in Complex Entitlements", icon: "FileCheck" },
                  { text: "Deep Local Political Ties", icon: "Users" },
                  { text: "1200+ Units Track Record", icon: "Building" },
                  { text: "Silver Line Land Donation to City", icon: "MapPin" },
                  { text: "BBJ 40 Under 40 Recognized", icon: "Award" }
                ]
              }
            }
          }
        },
        {
          type: "trackRecord",
          data: {
            metrics: [
              { label: "Units Permitted/Operated", value: "1,200+", description: "Across multiple successful urban projects." },
              { label: "Years of Experience", value: "11+", description: "Expertise in financial management and investment." },
              { label: "Key Projects", value: "3", description: "Signature landmark developments currently in pipeline." },
              { label: "Local Tie-in", "value": "Deep", description: "Former Wynn Resorts executives with local roots." }
            ]
          }
        },
        {
          type: "developmentPortfolio",
          data: {
            projects: [
              {
                name: "The Cove",
                location: "Worcester, MA",
                units: "318",
                year: "2023",
                status: "In Progress",
                returnsOrFocus: "39,000 SF Retail"
              },
              {
                name: "The 600",
                location: "Everett, MA",
                units: "85",
                year: "2021",
                status: "In Progress",
                returnsOrFocus: "Rooftop Restaurant"
              },
              {
                name: "The Pioneer",
                location: "Everett, MA",
                units: "289",
                year: "2019",
                status: "Completed",
                returnsOrFocus: "Institutional Sale"
              }
            ],
            investmentPhilosophy: {
              title: "Placemaking Strategy",
              description: "V10 focuses on transformative projects in 'Inner Core' communities that are poised for significant value appreciation through transit and infrastructure improvements."
            }
          }
        },
        {
          type: "leadershipTeam",
          data: {
            teamMembers: [
              {
                name: "John Tocco",
                title: "Partner, V10 Development",
                experience: "15+ years",
                background: "Former Wynn Resorts executive specialized in solving complex, highly regulated multijurisdictional challenges."
              },
              {
                name: "Ricky Beliveau",
                title: "Partner, V10 Development",
                experience: "11+ years",
                background: "Expert in permitting and operations with a strong financial foundation from Wellington Management (CFA Levels 1 & 2). He has built, permitted, or sold over 1,200 units."
              },
              {
                name: "The Architectural Team",
                title: "TAT (Architect)",
                experience: "50 years",
                background: "Award-winning firm with over 200 awards for design excellence and 155,000+ units completed."
              }
            ]
          }
        }
      ]
    }
  }
};
