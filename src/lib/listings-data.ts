import { Listing } from '@/types/listing';

// =================================================================================================
// THE EDGE ON MAIN - DATA
// =================================================================================================
const theEdgeOnMainData: Listing = {
  listingName: "The Edge on Main",
  listingSlug: "the-edge-on-main",
  projectId: "edge-on-main-mesa-001",
  location: "Mesa, AZ",
  minInvestment: 250000,
  fundName: "ACARA OZ Fund I LLC",
  heroImages: [], 
  tickerMetrics: [
    { label: "10-Yr Equity Multiple", value: "2.8–3.2x", change: "+12%" },
    { label: "3-Yr Equity Multiple", value: "2.1x", change: "+8%" },
    { label: "Preferred Return", value: "7%", change: "Guaranteed" },
    { label: "Min Investment", value: "$250K", change: "Minimum" },
    { label: "Total Units", value: "439", change: "Phase I & II" },
    { label: "Location", value: "Mesa, AZ", change: "Prime Location" },
    { label: "Hold Period", value: "10 Years", change: "OZ Qualified" },
    { label: "Tax Benefit", value: "100%", change: "Tax-Free Exit" }
  ],
  compellingReasons: [
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
  ],
  executiveSummary: {
    quote: "A landmark development poised to redefine urban living in downtown Mesa, The Edge on Main capitalizes on a critical housing shortage and a prime transit-oriented location.",
    paragraphs: [
      "This two-phase, 439-unit multifamily project is situated in a qualified Opportunity Zone, offering investors significant tax advantages, including the potential for a 100% tax-free exit on appreciation.",
      "With Arizona's population booming and a housing deficit exceeding 56,000 units, The Edge on Main is perfectly positioned to meet the overwhelming demand for modern, accessible rental housing in one of the nation's fastest-growing cities."
    ],
    conclusion: "This development represents a rare opportunity to invest in a high-growth market with strong fundamentals and powerful tax incentives, promising substantial returns and lasting community value."
  },
  investmentCards: [
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
  ],
  details: {
    financialReturns: {
        pageTitle: "Financial Returns",
        pageSubtitle: "The Edge on Main - Projected Investment Performance",
        backgroundImages: [],
        projections: [
            { label: "10-Year Equity Multiple", value: "2.8–3.2x", description: "Projected returns for investors over full hold period" },
            { label: "3-Year Equity Multiple", value: "2.1x", description: "Early returns for stabilization period" },
            { label: "Preferred Return", value: "7.0%", description: "Guaranteed minimum annual return" },
            { label: "IRR Target", value: "18-22%", description: "Internal rate of return over full cycle" },
            { label: "Cash-on-Cash", value: "9-12%", description: "Annual cash distributions to investors" },
            { label: "Tax Benefits", value: "100%", description: "Federal tax exemption on appreciation" }
        ],
        distributionTimeline: [
            { year: "Year 1-2", phase: "Development", distribution: "0%", description: "Construction and lease-up phase" },
            { year: "Year 3-5", phase: "Stabilization", distribution: "8-10%", description: "Property reaches full occupancy" },
            { year: "Year 6-8", phase: "Value Creation", distribution: "10-12%", description: "Rent growth and NOI expansion" },
            { year: "Year 9-10", phase: "Exit Preparation", distribution: "12%+", description: "Optimization for sale or refinance" }
        ],
        taxBenefits: [
            { title: "Capital Gains Deferral", description: "Defer existing capital gains taxes until 2026" },
            { title: "Basis Step-Up", description: "10% reduction in deferred gains after 5 years, 15% after 7 years" },
            { title: "Tax-Free Appreciation", description: "100% federal tax exemption on all appreciation after 10 years" }
        ],
        investmentStructure: [
            { label: "Minimum Investment", value: "$250,000" },
            { label: "Preferred Return", value: "7.0% Annual" },
            { label: "Target Hold Period", value: "10 Years" },
            { label: "Distribution Frequency", value: "Quarterly" },
            { label: "Fund Structure", value: "Delaware LLC" }
        ]
    },
    propertyOverview: {
        pageTitle: "Property Overview",
        pageSubtitle: "The Edge on Main - Modern multifamily development in Mesa, Arizona",
        backgroundImages: [],
        keyPropertyFacts: [
            { label: "Total Units", value: "439", description: "Phase I (161) & Phase II (278)" },
            { label: "Year Built", value: "2024", description: "Brand new construction" },
            { label: "Total SF", value: "295K", description: "Rentable area" },
            { label: "Parking", value: "525", description: "Covered spaces" }
        ],
        amenities: [
            { name: "Resort-Style Pool", icon: "Waves" },
            { name: "State-of-the-Art Fitness Center", icon: "Dumbbell" },
            { name: "Co-working Spaces", icon: "Laptop" },
            { name: "Dog Park & Pet Spa", icon: "Dog" },
            { name: "Rooftop Terrace", icon: "Building2" },
            { name: "Concierge Services", icon: "Bell" },
            { name: "Electric Vehicle Charging", icon: "Zap" },
            { name: "Package Lockers", icon: "Package" }
        ],
        unitMix: [
            { type: "Studio", count: 45, sqft: "550-650", rent: "$1,850-2,100" },
            { type: "1 Bedroom", count: 156, sqft: "750-950", rent: "$2,300-2,800" },
            { type: "2 Bedroom", count: 89, sqft: "1,100-1,350", rent: "$3,200-3,900" },
            { type: "3 Bedroom", count: 22, sqft: "1,400-1,600", rent: "$4,500-5,200" }
        ],
        locationHighlights: [
            { title: "Prime Location", description: "Adjacent to Country Club & Main Light Rail Station", icon: "MapPin" },
            { title: "Highway Access", description: "Direct access to Loop 202 and US-60", icon: "Car" },
            { title: "Airport Proximity", description: "15 minutes to Phoenix Sky Harbor", icon: "Plane" }
        ]
    },
    marketAnalysis: {
        pageTitle: "Market Analysis",
        pageSubtitle: "The Edge on Main - Phoenix-Mesa Market Overview",
        backgroundImages: [],
        marketMetrics: [
            { label: "Population Growth (2020-2030)", value: "+18.5%", description: "Phoenix-Mesa MSA projected growth" },
            { label: "Median Household Income", value: "$68,400", description: "Mesa city median (2023)" },
            { label: "Job Growth Rate", value: "+3.2%", description: "Annual employment growth" },
            { label: "Housing Shortage", value: "56,000+", description: "Units needed to meet demand" },
            { label: "Rent Growth (5-year)", value: "+42%", description: "Class A multifamily rent appreciation" },
            { label: "Occupancy Rate", value: "96.2%", description: "Current market occupancy" }
        ],
        majorEmployers: [
            { name: "Banner Health", employees: "32,000+", industry: "Healthcare", distance: "8 mi" },
            { name: "Boeing", employees: "15,000+", industry: "Aerospace", distance: "12 mi" },
            { name: "Arizona State University", employees: "12,000+", industry: "Education", distance: "15 mi" },
            { name: "Salt River Project", employees: "7,500+", industry: "Utilities", distance: "10 mi" },
            { name: "City of Phoenix", employees: "14,000+", industry: "Government", distance: "18 mi" },
            { name: "Intel", employees: "12,000+", industry: "Technology", distance: "20 mi" }
        ],
        demographics: [
            { category: "Age 25-34", value: "22%", description: "Prime renting demographic" },
            { category: "Age 35-44", value: "18%", description: "Family formation years" },
            { category: "College Educated", value: "34%", description: "Bachelor's degree or higher" },
            { category: "Median Age", value: "36.8", description: "Years old" }
        ],
        supplyDemandAnalysis: [
            { title: "Housing Deficit", description: "Arizona needs 56,000+ additional housing units to meet current demand", icon: "Home" },
            { title: "Population Growth", description: "Phoenix-Mesa MSA adding 80,000+ new residents annually", icon: "TrendingUp" },
            { title: "Limited New Supply", description: "Construction constraints limit new multifamily development", icon: "Building" },
            { title: "Job Creation", description: "Major employers continuing expansion in Phoenix metro", icon: "Factory" }
        ],
        keyMarketDrivers: [
            { title: "Migration", description: "Net in-migration of 120,000+ annually to Arizona", icon: "Users" },
            { title: "Development", description: "Transit-oriented development prioritized by Mesa", icon: "Building" },
            { title: "Industries", description: "Healthcare, aerospace, and tech driving job growth", icon: "Factory" },
            { title: "Rent Growth", description: "Strong rent appreciation across all asset classes", icon: "TrendingUp" }
        ]
    },
    sponsorProfile: {
        pageTitle: "Sponsor Profile",
        pageSubtitle: "The Edge on Main - ACARA OZ Fund I LLC & Juniper Mountain Capital",
        backgroundImages: [],
        sponsorOverview: {
            title: "About Juniper Mountain Capital",
            description: "Juniper Mountain Capital is a leading multifamily development firm specializing in Opportunity Zone investments across the Southwest United States. Founded in 2009, we have established ourselves as a trusted partner for institutional and individual investors seeking strong risk-adjusted returns in the multifamily sector. Our focus on transit-oriented developments in high-growth markets has consistently delivered superior returns while creating lasting value for the communities we serve. We leverage our deep local market knowledge and proven execution capabilities to identify and capitalize on emerging opportunities.",
            points: [
                "NMHC Top 50 Developer (2021-2023)",
                "Specialized in OZ Development",
                "ESG-Focused Development",
                "Phoenix Market Leader"
            ]
        },
        trackRecord: [
            { metric: "Total Units Developed", value: "1,158+", description: "Across 8 successful projects" },
            { metric: "Total Project Value", value: "$485M", description: "Combined development cost" },
            { metric: "Average Project IRR", value: "22.4%", description: "Across completed projects" },
            { metric: "OZ Projects Completed", value: "3", description: "Specialized OZ experience" },
            { metric: "Years in Business", value: "15+", description: "Consistent market presence" },
            { metric: "Investor Relations", value: "200+", description: "Active investor relationships" }
        ],
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
        ],
        previousProjects: [
            {
              name: "Phoenix Gateway Commons",
              location: "Phoenix, AZ",
              units: "324",
              year: "2022",
              status: "Completed",
              returns: "24.1% IRR"
            },
            {
              name: "Tempe Station Apartments",
              location: "Tempe, AZ",
              units: "287",
              year: "2021",
              status: "Completed",
              returns: "19.8% IRR"
            },
            {
              name: "Scottsdale Reserve",
              location: "Scottsdale, AZ",
              units: "196",
              year: "2020",
              status: "Completed",
              returns: "21.3% IRR"
            },
            {
              name: "Mesa Transit Village",
              location: "Mesa, AZ",
              units: "351",
              year: "2023",
              status: "In Progress",
              returns: "Projected 23%"
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
    location: "St. Louis, MO",
    minInvestment: 250000,
    fundName: "Aptitude St. Louis LLC",
    heroImages: [],
    tickerMetrics: [
        { label: "10-Yr Equity Multiple", value: "4.29x", change: "+329%" },
        { label: "IRR Target", value: "17.7%", change: "Strong" },
        { label: "Preferred Return", value: "8%", change: "Guaranteed" },
        { label: "Min Investment", value: "$250K", change: "Minimum" },
        { label: "Total Units", value: "177", change: "508 Beds" },
        { label: "Location", value: "St. Louis, MO", change: "Prime Location" },
        { label: "Hold Period", value: "10 Years", change: "OZ Qualified" },
        { label: "Tax Benefit", value: "100%", change: "Tax-Free Exit" }
    ],
    compellingReasons: [
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
    ],
    executiveSummary: {
        quote: "What if we could capitalize on America's student housing crisis while generating exceptional returns for our investors?",
        paragraphs: [
            "This question sparked the vision for The Marshall St. Louis — a transformative student housing development that stands at the intersection of unprecedented opportunity and critical market need. Located just 600 feet from St. Louis University's main campus, we're not just building student housing — we're architecting the future of university life.",
            "Our 177-unit development delivers 508 premium bedrooms directly adjacent to one of the nation's most prestigious universities. With SLU enrollment hitting record highs and a critical housing shortage, The Marshall represents the rare convergence where student demand meets institutional-quality development in a qualified Opportunity Zone."
        ],
        conclusion: "With construction 99% complete, >60% pre-leased, and Opportunity Zone incentives offering tax-free growth potential, The Marshall St. Louis represents the ideal intersection where exceptional returns meet transformative tax benefits."
    },
    investmentCards: [
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
    ],
    details: {
        financialReturns: {
            pageTitle: "Financial Returns",
            pageSubtitle: "The Marshall St. Louis - Projected Investment Performance",
            backgroundImages: [],
            projections: [
                { label: "10-Year Equity Multiple", value: "4.29x", description: "Projected returns for investors over full hold period" },
                { label: "Target IRR", value: "17.7%", description: "Internal rate of return over 10-year investment cycle" },
                { label: "Preferred Return", value: "8.0%", description: "8% compounded preferred return to investors" },
                { label: "Total Capital Required", value: "$30.1M", description: "New equity investment for recapitalization" },
                { label: "Year 1 Cash Flow", value: "$1.26M", description: "Projected first year distribution" },
                { label: "Tax Benefits", value: "100%", description: "Federal tax exemption on appreciation after 10 years" }
            ],
            distributionTimeline: [
                { year: "Q2 2025", phase: "Occupancy Begins", distribution: "Initial", description: "Student move-in and stabilization" },
                { year: "Q1 2026", phase: "First Distribution", distribution: "Annual CF", description: "Projected first cash flow distribution" },
                { year: "2026-2030", phase: "Annual CF Distributions", distribution: "6-12%", description: "Cash flow distributions through operation period" },
                { year: "2035", phase: "Projected Sale", distribution: "Full OZ Benefits", description: "Exit with 100% tax-free appreciation" }
            ],
            taxBenefits: [
                { title: "Tax Deferral", description: "Defer capital gains taxes until 2026 or property sale" },
                { title: "Tax-Free Appreciation", description: "100% federal tax exemption on all appreciation after 10 years" },
                { title: "Depreciation Benefits", description: "Accelerated depreciation and cost segregation benefits" }
            ],
            investmentStructure: [
                { label: "Minimum Investment", value: "$250,000" },
                { label: "Preferred Return", value: "8.0% Annual" },
                { label: "Target Hold Period", value: "10 Years" },
                { label: "Distribution Frequency", value: "Annual" },
                { label: "Fund Structure", value: "Aptitude St. Louis LLC" },
                { label: "Management Fee", value: "2.0% Annual" }
            ]
        },
        propertyOverview: {
            pageTitle: "Property Overview",
            pageSubtitle: "Premium student housing development adjacent to St. Louis University",
            backgroundImages: [],
            keyPropertyFacts: [
                { label: "Total Units", value: "177", description: "Student housing units" },
                { label: "Total Bedrooms", value: "508", description: "Individual bedrooms" },
                { label: "Total SF", value: "368K", description: "Gross square feet" },
                { label: "Stories", value: "5", description: "Over 2-level parking podium" }
            ],
            amenities: [
                { name: "Professional Fitness Center", icon: "Dumbbell" },
                { name: "Expansive Hot-Tub Complex", icon: "Waves" },
                { name: "Collaborative Study Spaces", icon: "Laptop" },
                { name: "Individual Study Pods", icon: "Users" },
                { name: "Entertainment Room", icon: "Building2" },
                { name: "Café with Seating", icon: "Coffee" },
                { name: "Grilling Stations", icon: "Utensils" },
                { name: "Sauna & Wellness", icon: "Waves" }
            ],
            unitMix: [
                { type: "Studio", count: 18, sqft: "420-520", rent: "$1,376/bed" },
                { type: "1 Bedroom", count: 15, sqft: "680-780", rent: "$1,545/bed" },
                { type: "2 Bedroom", count: 40, sqft: "950-1,150", rent: "$1,177/bed" },
                { type: "3 Bedroom", count: 30, sqft: "1,200-1,400", rent: "$1,121/bed" },
                { type: "4 Bedroom", count: 60, sqft: "1,450-1,650", rent: "$960/bed" },
                { type: "Townhouse", count: 14, sqft: "1,800-2,200", rent: "$1,129/bed" }
            ],
            locationHighlights: [
                { title: "St. Louis University Campus", description: "600 feet from main campus (15,200 students)", icon: "MapPin" },
                { title: "Cortex Innovation District", description: "0.5 miles from 200-acre tech hub", icon: "Building2" },
                { title: "Medical Campus Access", description: "0.6 miles from BJC/WashU Medical Campus", icon: "Bus" },
                { title: "City Foundry", description: "Adjacent to $300M mixed-use development", icon: "Utensils" }
            ]
        },
        marketAnalysis: {
            pageTitle: "Market Analysis",
            pageSubtitle: "The Marshall St. Louis - St. Louis University Market Overview",
            backgroundImages: [],
            marketMetrics: [
                { label: "SLU Enrollment Growth", value: "25%", description: "Increase since 2020, with record highs in 2023-24" },
                { label: "Current Students", value: "15,200+", description: "Total enrollment with continued growth targets" },
                { label: "Pre-Lease Rate", value: ">60%", description: "Strong pre-leasing before construction completion" },
                { label: "Housing Shortage", value: "Critical", description: "No new dorms since 2017, only 162 PBSH beds added" },
                { label: "Rent Growth", value: "18-37%", description: "Annual rent increases for comparable properties" },
                { label: "Occupancy Rates", value: "96-100%", description: "High occupancy at competitive properties" }
            ],
            majorEmployers: [
                { name: "St. Louis University", employees: "15,200", industry: "Education", distance: "0.1 mi" },
                { name: "BJC Healthcare", employees: "8,500+", industry: "Healthcare", distance: "0.6 mi" },
                { name: "Washington University", employees: "6,200+", industry: "Education/Medical", distance: "0.6 mi" },
                { name: "Cortex Companies", employees: "5,700+", industry: "Tech/Biotech", distance: "0.5 mi" },
                { name: "City Foundry Tenants", employees: "800+", industry: "Mixed", distance: "0.1 mi" }
            ],
            demographics: [], // This page had competitor data instead of demographics
            supplyDemandAnalysis: [],
            keyMarketDrivers: [
                { title: "Record University Growth", description: "St. Louis University achieved back-to-back record enrollment in 2023 and 2024, driven by strategic growth initiatives focusing on international and graduate programs.", icon: 'Users' },
                { title: "Cortex Innovation District", description: "$2.3B in development creating 13,000+ jobs in a 200-acre tech and biotech hub, generating demand for quality housing.", icon: 'Building' },
                { title: "BJC/WashU Medical Expansion", description: "$1B redevelopment of the medical campus enhancing the area's economic growth and employment opportunities.", icon: 'TrendingUp' },
                { title: "City Foundry Development", description: "$300M mixed-use development with retail, dining, entertainment, and office space creating 800+ permanent jobs.", icon: 'Building' }
            ]
        },
        sponsorProfile: {
            pageTitle: "Sponsor Profile",
            pageSubtitle: "ACARA & Aptitude Development - Experienced Development Team",
            backgroundImages: [],
            sponsorOverview: {
                title: "About ACARA",
                description: "ACARA provides accredited investors with the best direct investment opportunities available in the multifamily industry. We partner with top-tier development sponsors across the country to build apartment buildings and hold them long term. Our vertically integrated platform allows us to participate in everything from site selection to management, capturing layers of profit and ultimately providing strong, long-term cash flow. Through our distinctive national service platform, we provide exclusive access to top investment opportunities, ensuring that our clients receive the best multifamily projects available.",
                points: [
                    "Secondary markets with compelling fundamentals",
                    "Long-term holdings away from boom/bust cycles",
                    "Building off-cycle, delivering on-cycle",
                    "Opportunity Zone focus for tax advantages",
                    "Institutional-quality sponsors and properties"
                ]
            },
            trackRecord: [
                { metric: "Years of Experience", value: "20+", description: "Combined experience in student housing development" },
                { metric: "Total Investment", value: "$30.1M", description: "Capital requirement for The Marshall project" },
                { metric: "Construction Progress", value: "99%", description: "Project completion as of December 2024" },
                { metric: "Pre-Lease Rate", value: ">60%", description: "Strong leasing momentum before completion" }
            ],
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
            ],
            previousProjects: [
                {
                  name: "The Marshall St. Louis",
                  location: "St. Louis, MO",
                  units: "177 units / 508 beds",
                  year: "2025",
                  status: "In Progress",
                  returns: "17.7% IRR Target"
                },
                {
                  name: "University Housing Portfolio",
                  location: "Various Markets",
                  units: "Multiple Projects",
                  year: "2018-2023",
                  status: "Completed",
                  returns: "Strong Performance"
                },
                {
                  name: "Mixed-Use Developments",
                  location: "Secondary Markets",
                  units: "Opportunity Zones",
                  year: "2020-2024",
                  status: "Operating",
                  returns: "Tax-Advantaged"
                }
            ],
            developmentPartners: [
                { name: "Aptitude Development", role: "Development Sponsor and Project Manager", description: "Specialized student housing developer with extensive experience in university-adjacent properties. Leading The Marshall project from conception through completion with proven execution capabilities." },
                { name: "Holland Construction", role: "General Contractor", description: "Experienced construction partner delivering The Marshall on schedule and on budget. Strong track record in complex urban student housing projects with quality finishes." }
            ],
            investmentPhilosophy: "Our strategy focuses on identifying partners and projects in secondary markets with compelling fundamentals, allowing us to create valuable long-term holdings away from traditional boom and bust markets. This approach enables better navigation of market cycles by building off-cycle and delivering on-cycle."
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
    location: "Dallas, TX",
    minInvestment: 500000,
    fundName: "Dallas OZ Fund I LLC",
    heroImages: [],
    tickerMetrics: [
        { label: "10-Yr Equity Multiple", value: "2.88x", change: "+20%" },
        { label: "5-Yr Equity Multiple", value: "2.5x", change: "+15%" },
        { label: "Preferred Return", value: "9%", change: "Guaranteed" },
        { label: "Min Investment", value: "$500K", change: "Minimum" },
        { label: "Total Units", value: "388", change: "Phase I & II" },
        { label: "Location", value: "Dallas, TX", change: "Prime Location" },
        { label: "Hold Period", value: "10+ Years", change: "OZ Qualified" },
        { label: "Tax Benefit", value: "100%", change: "Tax-Free Exit" }
    ],
    compellingReasons: [
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
    ],
    executiveSummary: {
        quote: "What if we could transform Dallas' southern sector while creating an innovation ecosystem that attracts global talent?",
        paragraphs: [
            "This vision drives SoGood Dallas — an ambitious master-planned urban community that stands as a catalyst for economic revitalization in one of Dallas' most promising areas. Strategically located near iconic neighborhoods including the Farmers Market, Deep Ellum, the Cedars, and Fair Park, SoGood represents more than development — it's urban transformation.",
            "Our innovative two-phase approach delivers 388 residential units anchored by a 35,264 SF innovation center fully pre-leased to GSV Ventures. Phase I introduces The Hub at SoGood with 116 units plus the innovation center, while Phase II adds MKT Residences with 272 units and retail featuring Farmers Commons. This isn't just mixed-use development — it's the creation of Dallas' next great district."
        ],
        conclusion: "With Hoque Global's 14-acre land ownership eliminating acquisition risk, Opportunity Zone tax benefits, and proximity to the $3.7B Convention Center expansion, SoGood Dallas represents the convergence of visionary planning and exceptional investment opportunity in America's fastest-growing metropolitan area."
    },
    investmentCards: [
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
    ],
    details: {
        financialReturns: {
            pageTitle: "Financial Returns",
            pageSubtitle: "SoGood Dallas - Projected Investment Performance",
            backgroundImages: [],
            projections: [
                { label: "10-Year Equity Multiple", value: "2.88x", description: "Projected returns for investors over full hold period" },
                { label: "5-Year Equity Multiple", value: "2.5x", description: "Returns for stabilization period" },
                { label: "Preferred Return", value: "9.0%", description: "Annual preferred return until stabilization" },
                { label: "IRR Target (5-Year)", value: "20-21%", description: "Internal rate of return for mid-term hold" },
                { label: "IRR Target (10-Year)", value: "19-20%", description: "Internal rate of return over full cycle" },
                { label: "Unlevered Yield", value: "7.2%", description: "Yield on cost through conservative underwriting" }
            ],
            distributionTimeline: [
                { year: "Year 1-2", phase: "Development", distribution: "0%", description: "Construction and innovation center lease-up" },
                { year: "Year 3-4", phase: "Stabilization", distribution: "9%", description: "Property reaches stabilized occupancy" },
                { year: "Year 5-7", phase: "Value Creation", distribution: "9%+", description: "NOI growth and rent appreciation" },
                { year: "Year 8-10", phase: "Exit Preparation", distribution: "9%+", description: "Optimization for sale or refinance" }
            ],
            taxBenefits: [
                { title: "Capital Gains Deferral", description: "Defer federal capital gains tax until 2026 or fund exit" },
                { title: "Basis Step-Up", description: "Partial forgiveness of deferred gains after 5+ years" },
                { title: "Tax-Free Appreciation", description: "100% federal tax exemption on all appreciation after 10 years" }
            ],
            investmentStructure: [
                { label: "Minimum Investment", value: "$500,000" },
                { label: "Preferred Return", value: "9.0% Annual" },
                { label: "Target Hold Period", value: "10+ Years" },
                { label: "Distribution Frequency", value: "Annual" },
                { label: "Fund Structure", value: "Dallas OZ Fund I LLC" },
                { label: "Management Fee", value: "2.0% Annual" },
                { label: "Sponsor Promote", value: "30% after pref" }
            ]
        },
        propertyOverview: {
            pageTitle: "Property Overview",
            pageSubtitle: "Master-planned innovation district in Dallas' southern sector",
            backgroundImages: [],
            keyPropertyFacts: [
                { label: "Total Units", value: "388", description: "Total Residential Units" },
                { label: "Site Acres", value: "14", description: "Total Land Area" },
                { label: "Commercial SF", value: "84,856", description: "Innovation & Retail" },
                { label: "Expected Delivery", value: "2027", description: "For Phase I & II" }
            ],
            amenities: [
                { name: "Innovation Center", icon: "Laptop" },
                { name: "Retail & Dining Spaces", icon: "Building2" },
                { name: "Green Recreation Areas", icon: "Waves" },
                { name: "Community Fitness Center", icon: "Dumbbell" },
                { name: "Pet-Friendly Amenities", icon: "Coffee" },
                { name: "Concierge Services", icon: "Users" },
                { name: "Electric Vehicle Charging", icon: "Car" },
                { name: "Package Management", icon: "Utensils" }
            ],
            unitMix: [ // SOGood property overview page had project phases instead of Unit Mix
                { type: "Phase I - The Hub", count: 116, sqft: "123,777 SF", rent: "Innovation Center (35,264 SF) + Retail (42,794 SF)" },
                { type: "Phase II - MKT Residences", count: 272, sqft: "206,118 SF", rent: "Retail Space (6,798 SF) + Farmers Commons" }
            ],
            locationHighlights: [
                { title: "Transit & Connectivity", description: "Adjacent to future IH-30 deck park, near Dallas Farmers Market, close to Deep Ellum entertainment district, and walking distance to Fair Park.", icon: "Bus" },
                { title: "Urban Amenities", description: "$3.7B Kay Bailey Hutchison Convention Center expansion, The Cedars historic district, Dallas Farmers Market dining & shopping, and multiple cultural venues nearby.", icon: "MapPin" },
                { title: "Economic Drivers", description: "Innovation center pre-leased to GSV Ventures, property tax abatement through PFC, adaptive reuse of former industrial property, and a master-planned community catalyst.", icon: "Building" }
            ]
        },
        marketAnalysis: {
            pageTitle: "Market Analysis",
            pageSubtitle: "SoGood Dallas - Dallas-Fort Worth Market Overview",
            backgroundImages: [],
            marketMetrics: [
                { label: "DFW Population", value: "7M+", description: "Metro area population leading US growth" },
                { label: "Job Growth (5-Year)", value: "602,200", description: "Net new jobs added, leading all US metros" },
                { label: "Fortune 1000 HQs", value: "43", description: "Companies headquartered in DFW" },
                { label: "Tech Jobs Added", value: "59,000", description: "New technology positions in past 5 years" },
                { label: "Annual Migration", value: "120,000+", description: "Net in-migration to Texas annually" },
                { label: "Rent Growth", value: "+42%", description: "Class A multifamily rent appreciation (5-year)" }
            ],
            majorEmployers: [
                { name: "American Airlines", employees: "30,000+", industry: "Aviation", distance: "15 mi" },
                { name: "AT&T", employees: "25,000+", industry: "Telecommunications", distance: "12 mi" },
                { name: "Texas Instruments", employees: "15,000+", industry: "Technology", distance: "18 mi" },
                { name: "Bank of America", employees: "12,000+", industry: "Financial Services", distance: "10 mi" },
                { name: "Dallas County", employees: "14,000+", industry: "Government", distance: "8 mi" },
                { name: "Baylor Scott & White", employees: "45,000+", industry: "Healthcare", distance: "20 mi" }
            ],
            demographics: [
                { category: "Age 25-34", value: "16.8%", description: "Prime renting demographic" },
                { category: "Age 35-44", value: "14.2%", description: "Family formation years" },
                { category: "College Educated", value: "38%", description: "Bachelor's degree or higher" },
                { category: "Median Household Income", value: "$70,663", description: "DFW metro median" }
            ],
            supplyDemandAnalysis: [
                { title: "Technology Sector", description: "One-third of Texas tech jobs located in DFW, with 59,000 new positions added in past 5 years", icon: "Laptop" },
                { title: "Corporate Headquarters", description: "Home to 43 Fortune 1000 companies, including 22 Fortune 500 companies", icon: "Building" },
                { title: "Population Growth", description: "DFW leads all US metro areas in population growth, adding 120,000+ annually", icon: "Users" }
            ],
            keyMarketDrivers: [
                { title: "Urban Revitalization", description: "Transforming Dallas' southern sector with catalytic development", icon: "Users" },
                { title: "Mixed-Use Development", description: "Combining residential, commercial, and innovation spaces", icon: "Building" },
                { title: "Job Creation", description: "Innovation center anchored by GSV Ventures creating tech ecosystem", icon: "Building" },
                { title: "Value Creation", description: "Master-planned approach maximizing long-term value appreciation", icon: "TrendingUp" }
            ]
        },
        sponsorProfile: {
            pageTitle: "Sponsor Profile",
            pageSubtitle: "Hoque Global - Experienced Development Team",
            backgroundImages: [],
            sponsorOverview: {
                title: "Partnership Overview",
                description: "Hoque Global (Developer) is a diversified investment company with a primary focus on catalytic enterprises in real estate. ACARA Management (Fund Manager) provides accredited investors with direct investment opportunities in the multifamily industry.",
                points: [
                    "Land Ownership: Hoque Global already owns all 14 acres, eliminating acquisition risk.",
                    "Tax Abatements: Property tax abatement through Public Facility Corporation already established.",
                    "Pre-Leased Anchor: Innovation center fully pre-leased to GSV Ventures.",
                    "Local Expertise: Deep Dallas market knowledge and established relationships."
                ]
            },
            trackRecord: [
                { metric: "Land Owned", value: "14 Acres", description: "Owned land in downtown Dallas" },
                { metric: "Nearby Expansion", value: "$3.7B", description: "Kay Bailey Hutchison Convention Center expansion" },
                { metric: "Anchor Tenant", value: "35,264 SF", description: "Innovation center pre-leased to GSV Ventures" },
                { metric: "Future Phases", value: "Master Plan", description: "Six additional phases planned for future OZ investment" }
            ],
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
            ],
            previousProjects: [
                { name: "SoGood Phase I", location: "Dallas, TX", units: "116", year: "2025", status: "Planning", returns: "Innovation Center" },
                { name: "SoGood Phase II", location: "Dallas, TX", units: "272", year: "2025", status: "Planning", returns: "Retail Anchor" },
                { name: "RideCentric", location: "DFW Metro", units: "N/A", year: "1998", status: "Completed", returns: "Transportation" },
                { name: "iDesign Meetings", location: "DFW Metro", units: "N/A", year: "2010", status: "Completed", returns: "Hospitality" }
            ]
        }
    }
};

export const listings: Listing[] = [theEdgeOnMainData, marshallStLouisData, soGoodDallasData];

export const getListingBySlug = (slug: string): Listing | undefined => {
    return listings.find(listing => listing.listingSlug === slug);
} 