import { Listing } from '@/types/listing';

export const livaData: Listing = {
  listingName: "Liva - Live Active at Travelers Rest",
  sections: [
    {
      type: "hero",
      data: {
        listingName: "Liva - Live Active at Travelers Rest",
        location: "Travelers Rest, SC",
        fundName: "Clear Mountain Properties"
      }
    },
    {
      type: "tickerMetrics",
      data: {
        metrics: [
          { label: "10-Yr Equity Multiple", value: "3.59x", change: "+259%" },
          { label: "LP Levered IRR", value: "20.8%", change: "Priority" },
          { label: "Location", value: "Travelers Rest, SC", change: "High Growth" },
          { label: "LTC", value: "72.4%", change: "Senior Debt" },
          { label: "Tax Benefit", value: "100%", change: "Tax-Free Exit" }
        ]
      }
    },
    {
      type: "compellingReasons",
      data: {
        reasons: [
          {
            title: "Shovel-Ready Development",
            description: "100% entitled and approved with land disturbance permits secured, positioning the project for a Q1 2026 construction start.",
            highlight: "Permitted for Q1 2026",
            icon: "HardHat"
          },
          {
            title: "Strategic Trail Connectivity",
            description: "Direct access to the 22-mile Swamp Rabbit Trail and Main Street via a planned multi-use path through the community.",
            highlight: "Direct Swamp Rabbit Access",
            icon: "Bike"
          },
          {
            title: "Supply-Constrained Market",
            description: "Zero projected multifamily deliveries in the North Greenville submarket creates a massive first-mover advantage for Liva.",
            highlight: "Zero New Submarket Supply",
            icon: "TrendingUp"
          }
        ]
      }
    },
    {
      type: "executiveSummary",
      data: {
        summary: {
          quote: "Where modern living meets long-term growth in one of the Upstate's most dynamic lifestyle corridors.",
          paragraphs: [
            "Clear Mountain Properties is seeking approximately $4 million in equity to capitalize the development of Liva - a 152-unit Class A multifamily and townhome community located in the rapidly growing city of Travelers Rest, South Carolina.",
            "The 10.5-acre site, fully assembled between 2020 and 2022, sits within an active Opportunity Zone, providing potential long-term tax advantages for qualifying investors. The land is 100% owned and fully entitled, with all municipal approvals secured and Greenville County land disturbance permits being pulled in December 2025 - positioning the project for a Q1 2026 construction start.",
            "Liva is designed to capture the unique lifestyle appeal of Travelers Rest, integrating resort-style amenities and direct trail connectivity into a cohesive master plan. The community will feature 120 multifamily units on the western portion of the site and 32 individually platted townhomes on the eastern portion - providing dual exit optionality through bulk sale, individual disposition, or long-term hold.",
            "A multi-use path will run through the development, connecting directly to Main Street and the Swamp Rabbit Trail, one of the Upstate's most popular lifestyle corridors. The City of Travelers Rest has expressed interest in cost-sharing construction and maintenance, further enhancing the project's appeal and alignment with local growth initiatives.",
            "Every element of the project has been curated to reflect the fabric of Travelers Rest - small-town authenticity, active living, and enduring demand. Spacious open floor plans, elevated finishes, and community features such as a pool, fire pit, dog park, and bike barn create a differentiated, lifestyle-forward product in one of the Upstate's most supply-constrained markets."
          ],
          conclusion: "With a target construction start in early 2026 and an 18-month delivery timeline, Liva is perfectly positioned to capture the intense demand for high-quality rental housing in the Greenville metro area."
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
              { label: "10-Yr Equity Multiple", value: "3.59x" },
              { label: "LP Levered IRR", value: "20.8%" },
              { label: "Hold Period", value: "10 Years" }
            ],
            summary: "Targeted 20.8% IRR and 3.59x MOIC over a 10-year hold period with a projected Year 3 refinance."
          },
          {
            id: "property-overview",
            title: "Property Overview",
            keyMetrics: [
              { label: "Total Units", value: "152" },
              { label: "Site Area", value: "10.5 Acres" },
              { label: "LP Equity", value: "$7.8M" }
            ],
            summary: "Class A mixed multifamily and townhome community with direct trail access."
          },
          {
            id: "market-analysis",
            title: "Market Analysis",
            keyMetrics: [
              { label: "Annual Pop Growth", value: "3.43%" },
              { label: "Submarket Delivery", value: "Zero" },
              { label: "Median Home Price", value: "$476K" }
            ],
            summary: "High-growth North Greenville submarket with severe supply constraints."
          },
          {
            id: "sponsor-profile",
            title: "Sponsor Profile",
            keyMetrics: [
              { label: "Developer", value: "Clear Mountain" },
              { label: "Avg Historical IRR", value: "33.6%" },
              { label: "Track Record", value: "7 Years" }
            ],
            summary: "Vertically integrated platform with a proven track record in the Upstate SC region."
          }
        ]
      }
    }
  ],
  is_verified_oz_project: true,
  details: {
    financialReturns: {
      pageTitle: "Financial Returns",
      pageSubtitle: "Projected 20.8% LP Levered IRR and 3.59x Equity Multiple.",
      sections: [
        {
          type: "projections",
          data: {
            projections: [
              { label: "10-Yr Equity Multiple", value: "3.59x", description: "Projected gross return on initial equity over 10-year hold." },
              { label: "Target IRR", value: "20.8%", description: "LP Levered Internal Rate of Return, net of fees." },
              { label: "Year 3 Refinance", value: "73%", description: "Projected Year 3 Cash-on-Cash return from $37.19M refinance." },
              { label: "Total Project Cost", value: "$40.1M", description: "All-in development budget including reserves." },
              { label: "Untrended YOC", value: "6.80%", description: "Yield on Cost based on stabilized net operating income." },
              { label: "Construction LTC", value: "72.4%", description: "Loan to total cost based on senior construction debt." },
              { label: "Stabilized NOI", value: "$3.38M", description: "Projected Year 3 net operating income." },
              { label: "Rent Growth", value: "3.3%", description: "Assumed annual market rent escalation." },
              { label: "Sponsor Co-Invest", value: "$2.5M", description: "Direct capital commitment from the Sponsor." }
            ]
          }
        },
        {
          type: "capitalStack",
          data: {
            totalProject: "$40,142,691",
            uses: [
              { use: "Hard Costs", amount: "$30,598,150", percentage: "76.2%", description: "Construction, sitework, and municipal fees." },
              { use: "Soft Costs", amount: "$3,109,476", percentage: "7.7%", description: "Design, engineering, and development fees." },
              { use: "Financing & Reserves", amount: "$3,231,665", percentage: "8.1%", description: "Interest reserves and origination fees." },
              { use: "Land & Closing", amount: "$2,730,000", percentage: "6.8%", description: "Site acquisition and associated closing costs." },
              { use: "Working Capital", amount: "$473,400", percentage: "1.2%", description: "Project contingency and operating liquidity." }
            ],
            sources: [
              { source: "Construction Loan", amount: "$29,082,990", perUnit: "$191,335", percentage: "72.4%", description: "Senior debt per cash flow projections." },
              { source: "LP Equity", amount: "$7,800,000", perUnit: "$51,316", percentage: "19.4%", description: "External investor capital (Target raise)." },
              { source: "Sponsor Equity", amount: "$2,500,000", perUnit: "$16,447", percentage: "6.2%", description: "Clear Mountain Properties co-investment." },
              { source: "Pref Equity", amount: "$1,000,000", perUnit: "$6,579", percentage: "2.5%", description: "Priority capital funding." }
            ]
          }
        },
        {
          type: "distributionTimeline",
          data: {
            timeline: [
              { year: "Year 1-2", phase: "Construction", distribution: "0%", description: "18-month construction and initial lease-up." },
              { year: "Year 3", phase: "Stabilization", distribution: "73%", description: "Projected $37.19M refinance and transition to stabilized cash flow." },
              { year: "Years 4-10", phase: "Operating", distribution: "TBD", description: "Ongoing distributions from operational NOI." },
              { year: "Year 10+", phase: "Disposition", distribution: "100%", description: "Tax-free exit of all capital and appreciation." }
            ]
          }
        },
        {
          type: "taxBenefits",
          data: {
            benefits: [
              { icon: "DollarSign", title: "100% Tax-Free Exit", description: "No federal capital gains tax on appreciation after a 10-year hold period." },
              { icon: "Calendar", title: "Gains Deferral", description: "Defer taxes on existing capital gains by reinvesting into the Liva QOF." },
              { icon: "BarChart", title: "Step-up in Basis", description: "Reduction in original tax liability after 5 and 7 year milestones." }
            ]
          }
        },
        {
          type: "investmentStructure",
          data: {
            structure: [
              { label: "Asset Type", value: "Multifamily & Townhomes" },
              { label: "Target Hold", value: "10 Years" },
              { label: "Incentive", value: "Opportunity Zone" },
              { label: "Distribution", value: "Quarterly (Post-Stabilization)" }
            ]
          }
        }
      ]
    },
    propertyOverview: {
      pageTitle: "Property Overview",
      pageSubtitle: "A 152-unit Master-Planned Community with Direct Trail Connectivity.",
      sections: [
        {
          type: "keyFacts",
          data: {
            facts: [
              { label: "Unit Count", value: "152", description: "120 Apartments + 32 Townhomes." },
              { label: "Acreage", value: "10.5 Acres", description: "Fully assembled and entitled land." },
              { label: "Status", value: "Permitted", description: "Land disturbance permits secured May 2025." },
              { label: "Project Value", value: "$40.1M", description: "Total capitalization at completion." }
            ]
          }
        },
        {
          type: "amenities",
          data: {
            amenities: [
              { name: "Resort-Style Pool", icon: "Sun" },
              { name: "Swamp Rabbit Trail Path", icon: "Bike" },
              { name: "Dog Park", icon: "Dog" },
              { name: "Bike Barn", icon: "Warehouse" },
              { name: "Community Fire Pit", icon: "Flame" },
              { name: "Fitness Center", icon: "Dumbbell" },
              { name: "Clubhouse", icon: "Building" },
              { name: "Pocket Parks", icon: "Trees" }
            ]
          }
        },
        {
          type: "unitMix",
          data: {
            unitMix: [
              { type: "1b1b Apartment", count: 48, sqft: "773", rent: "$1,648" },
              { type: "2b2b Apartment", count: 66, sqft: "1,126", rent: "$1,972" },
              { type: "3b2b Apartment", count: 6, sqft: "1,385", rent: "$2,374" },
              { type: "Townhome", count: 32, sqft: "1,573", rent: "$3,090" }
            ],
            specialFeatures: {
              title: "Dual Exit Optionality",
              description: "Individually platted townhomes allow for flexible disposition strategies, including bulk sale or individual home sales."
            }
          }
        },
        {
          type: "locationHighlights",
          data: {
            highlights: [
              { title: "Direct Trail Access", description: "Directly connected to the 22-mile Swamp Rabbit Trail via a dedicated multi-use path.", icon: "Map", colors: { bg: "bg-green-50", text: "text-green-700" } },
              { title: "Gateway Hub", description: "15 minutes from downtown Greenville and 30 minutes from Asheville.", icon: "Zap", colors: { bg: "bg-blue-50", text: "text-blue-700" } },
              { title: "Civic Momentum", description: "Adjacent to $9M in planned city infrastructure improvements on N. Poinsett Highway.", icon: "Building", colors: { bg: "bg-purple-50", text: "text-purple-700" } }
            ]
          }
        },
        {
          type: "locationFeatures",
          data: {
            featureSections: [
              {
                category: "Mixed-Use Neighbors",
                icon: "Building",
                features: [
                  "Pinestone: 45-acre master-planned community",
                  "120,000 SF of high-end retail & mixed-use space",
                  "Programmable community, medical, and office space",
                  "Adaptive reuse of reconditioned warehouses"
                ]
              },
              {
                category: "Infrastructure",
                icon: "Construction",
                features: [
                  "Streetscape improvements along N. Poinsett Highway",
                  "New pedestrian bump-outs and safety buffers",
                  "Public art and green space activation",
                  "Extending Main Street connectivity to site"
                ]
              },
              {
                category: "Community Anchors",
                icon: "School",
                features: [
                  "Furman University: 800-acre cultural anchor",
                  "Prisma Health North Greenville Hospital",
                  "Award-winning public and private schools",
                  "Direct connectivity to downtown lifestyle hubs"
                ]
              }
            ]
          }
        },
        {
          type: "developmentTimeline",
          data: {
            timeline: [
              { status: "completed", title: "Site Assembly", description: "10.5 acres fully assembled between 2020-2022." },
              { status: "completed", title: "Entitlement", description: "100% entitled and approved by City of Travelers Rest." },
              { status: "in_progress", title: "Groundbreaking", description: "Targeted for Q1 2026." },
              { status: "in_progress", title: "First Delivery", description: "Estimated early 2027 (12 months after start)." }
            ]
          }
        }
      ]
    },
    marketAnalysis: {
      pageTitle: "Market Analysis",
      pageSubtitle: "Investing in the Upstate's Premier High-Growth Submarket.",
      sections: [
        {
          type: "marketMetrics",
          data: {
            metrics: [
              { label: "TR Pop Growth", value: "3.43%", description: "Annual growth since 2020." },
              { label: "Greenville Proximity", value: "15 Min", description: "Drive time to downtown Greenville." },
              { label: "Regional Projects", value: "707", description: "Announced regional projects (2015-2024)." },
              { label: "TR Net Worth", value: "$1.4M", description: "Average net worth of Travelers Rest residents." },
              { label: "Median Home Price", value: "$476K", description: "Up 54.7% YoY, creating a high barrier to entry for buyers." },
              { label: "Jobs Created", value: "53,711", description: "New jobs from regional investment projects." },
              { label: "Corporate Tax", value: "5%", description: "South Carolina's pro-business rate." },
              { label: "Submarket Delivery", value: "Zero", description: "No projected apartments in North Greenville." },
              { label: "Upstate Investment", value: "$12.4B", description: "Announced capital investment across 10 counties (Last 5 years)." }
            ]
          }
        },
        {
          type: "majorEmployers",
          data: {
            employers: [
              { name: "Prisma Health", employees: "10,000+", industry: "Healthcare", distance: "5-20 mins" },
              { name: "Furman University", employees: "501 - 1,000", industry: "Education", distance: "7 mins" },
              { name: "Michelin North America", employees: "5,001 - 10,000", industry: "Manufacturing", distance: "30 mins" },
              { name: "GE Power", employees: "1,001 - 2,500", industry: "Energy", distance: "30 mins" },
              { name: "BMW Greer", employees: "10,000+", industry: "Automotive", distance: "40 mins" }
            ]
          }
        },
        {
          type: "keyMarketDrivers",
          data: {
            drivers: [
              { title: "Lifestyle Migration", description: "Recognized as one of Southern Living's 'Best Small Southern Towns' and #1 fastest growing state (2023).", icon: "Users" },
              { title: "Gateway Location", description: "Just 15 minutes from downtown Greenville and 30 minutes from Asheville, TR offers small-town charm with direct regional access and a growing economic base.", icon: "Map" },
              { title: "Swamp Rabbit Trail", description: "The 22-mile Swamp Rabbit Trail connects TR to downtown Greenville, fueling steady foot traffic and making the town a hub for food, outdoor recreation, and local entrepreneurship.", icon: "Bike" },
              { title: "Strategic Infrastructure", description: "Direct I-85/I-26 connectivity with one-day truck access to 31% of the U.S. population. GSP International named 'Best Airport in North America' (2024).", icon: "Truck" }
            ]
          }
        },
        {
          type: "supplyDemand",
          data: {
            analysis: [
              { icon: "Award", title: "SC Accolades", description: "#1 State for Manufacturing and Permitting; #1 Fastest Growing State (2023); #1 Lowest Unionization Rate (1.2%); #2 for Doing Business." },
              { icon: "TrendingUp", title: "Institutional Validation", description: "Standard at Pinestone (1/2 mile away) received 23 offers from top-tier discretionary capital groups in 2024." },
              { icon: "Construction", title: "Civic Momentum", description: "$9M Poinsett Highway streetscape improvements 'extend Main Street' directly to the Liva site gateway." },
              { icon: "Lock", title: "Severe Supply Gap", description: "Zero projected multifamily deliveries in North Greenville submarket combined with restrictive city zoning." }
            ]
          }
        },
        {
          type: "economicDiversification",
          data: {
            sectors: [
              { title: "Tech Hub & Innovation", description: "SC NEXUS designated as one of 31 federal Tech Hubs, driving 14,000+ projected jobs. Supported by $5.22M in startup grants (FY24)." },
              { title: "Enterprise Investment", description: "Google ($3.3B in data centers), Meta ($800M data center), Tesla (regional distribution), and BMW ($1.7B EV/battery plant) have announced massive regional commitments." },
              { title: "Research Ecosystem", description: "Clemson's CU-ICAR is a 250-acre research hub fuels the nation's only graduate Dept. of Automotive Engineering." }
            ]
          }
        },
        {
          type: "competitiveAnalysis",
          data: {
            competitors: [
              { name: "The Standard at Pinestone", built: "2023", beds: "250", rent: "$1,729", occupancy: "N/A", rentGrowth: "N/A" },
              { name: "Rows at Pinestone", built: "2023", beds: "32", rent: "$2,903", occupancy: "N/A", rentGrowth: "N/A" }
            ],
            summary: "Liva enters the market with a similar high-end profile but with the added benefit of OZ tax efficiency and direct trail integration."
          }
        }
      ]
    },
    sponsorProfile: {
      sponsorName: "Clear Mountain Properties",
      sections: [
        {
          type: "sponsorIntro",
          data: {
            sponsorName: "About Clear Mountain Properties",
            content: {
              paragraphs: [
                "Clear Mountain Properties ('CMP') is a privately held real estate investment and development firm focused on opportunistic assets across the Upstate South Carolina region. CMP's vertically integrated platform oversees the full lifecycle of each investment - from acquisition and entitlement through construction, stabilization, and asset management.",
                "The team brings institutional discipline, local market knowledge, and a track record of delivering projects that enhance community value and generate risk-adjusted returns."
              ],
              highlights: {
                type: "icons",
                items: [
                  { text: "33.6% Historical IRR", icon: "TrendingUp" },
                  { text: "$25M Equity Deployed", icon: "DollarSign" },
                  { text: "7-Year Track Record", icon: "Award" },
                  { text: "In-House Management", icon: "Home" }
                ]
              }
            }
          }
        },
        {
          type: "trackRecord",
          data: {
            metrics: [
              { label: "Historical IRR", value: "33.6%", description: "Average across all projects." },
              { label: "Equity Multiple", value: "1.85x", description: "Average historical multiplier." },
              { label: "Current Pipeline", value: "$70M", description: "Active projects in development." },
              { label: "Successful Exits", value: "7", description: "Part of a proven 7-year track record." }
            ]
          }
        },
        {
          type: "leadershipTeam",
          data: {
            teamMembers: [
              { name: "Christopher Rizzo", title: "Partner", experience: "", background: "" },
              { name: "Zachary Schulruff", title: "Partner", experience: "", background: "" },
              { name: "Mackenzie Pace", title: "Director of Asset Management", experience: "", background: "" },
              { name: "James Houston", title: "Development Manager", experience: "", background: "" },
              { name: "Mallory Long", title: "Property Manager", experience: "", background: "" }
            ]
          }
        }
      ]
    }
  }
};
