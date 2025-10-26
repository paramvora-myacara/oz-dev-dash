// Test data for oz-recap-test slug
// This data will be used to test the dynamic implementation locally

export const ozRecapTestData = {
  listingName: "OZ Recap Fund, LLC",
  listingSlug: "oz-recap-test",
  developer_website: null,
  sections: [
    {
      type: "hero",
      data: {
        listingName: "OZ Recap Fund, LLC",
        location: "Colorado & Arizona",
        minInvestment: 250000,
        fundName: "ACARA Management"
      }
    },
    {
      type: "tickerMetrics",
      data: {
        metrics: [
          { label: "Target Net IRR", value: "15%", change: "Post-Tax" },
          { label: "Targeted Equity Multiple", value: "2.5x+", change: "Significant Upside" },
          { label: "Preferred Return", value: "8%", change: "Accrued" },
          { label: "Min Investment", value: "$250K", change: "Accredited" },
          { label: "Deals in Fund", value: "3", change: "Multifamily" },
          { label: "Geography Mix", value: "CO & AZ", change: "Growth Markets" },
          { label: "Hold Period", value: "10+ Years", change: "OZ Qualified" },
          { label: "Management Fee", value: "2%", change: "Annual" }
        ]
      }
    },
    {
      type: "compellingReasons",
      data: {
        reasons: [
          {
            title: "De-Risked OZ Strategy",
            description: "Invest in newly built, Class-A multifamily properties below replacement cost. No development or construction risk.",
            highlight: "No Development Risk",
            icon: "ShieldCheck"
          },
          {
            title: "Powerful Tax Advantages",
            description: "A fully compliant Opportunity Zone fund offering tax deferral, reduction, and tax-free growth on your investment after a 10-year hold.",
            highlight: "Tax-Free Appreciation",
            icon: "Zap"
          },
          {
            title: "Strong Return Fundamentals",
            description: "Targeting a 15% Net IRR and 2.5x equity multiple with immediate cash flow and an investor-favorable structure. Sponsored by an experienced team with a $700M portfolio.",
            highlight: "15% Target IRR",
            icon: "TrendingUp"
          }
        ]
      }
    },
    {
      type: "executiveSummary",
      data: {
        summary: {
          quote: "A unique Opportunity Zone strategy focused on de-risked, newly built assets with strong cash flow and significant upside.",
          paragraphs: [
            "The OZ Recap Fund represents a compelling opportunity for accredited investors seeking to deploy capital gains into a Qualified Opportunity Fund (QOF) with proven fundamentals and immediate cash flow.",
            "Our strategy focuses on newly built, Class-A multifamily properties that are delivered below replacement cost, eliminating development and construction risk while providing investors with stabilized assets from day one.",
            "With an experienced sponsor team managing over 1,700 units and a portfolio valuation approaching $700 million, this fund offers institutional-quality management with investor-favorable terms and professional OZ compliance."
          ],
          conclusion: "This cycle-driven investment thesis combines the powerful tax advantages of Opportunity Zone investing with strong return fundamentals, targeting a 15% Net IRR and 2.5x+ equity multiple."
        }
      }
    },
    {
      type: "investmentCards",
      data: {
        cards: [
          {
            id: "fund-structure",
            title: "Fund Structure",
            keyMetrics: [
              { label: "Target Capital Raise", value: "$40M" },
              { label: "Target Net IRR", value: "15%" },
              { label: "Target Equity Multiple", value: "2.5x+" }
            ],
            summary: "A Qualified Opportunity Fund with an investor-favorable promote structure."
          },
          {
            id: "portfolio-projects",
            title: "Portfolio Projects",
            keyMetrics: [
              { label: "Total Projects", value: "3" },
              { label: "Total Units", value: "614" },
              { label: "Asset Type", value: "Multifamily" }
            ],
            summary: "A portfolio of newly built, stabilized Class-A properties in high-growth markets."
          },
          {
            id: "how-investors-participate",
            title: "How Investors Participate",
            keyMetrics: [
              { label: "Investor Type", value: "Accredited" },
              { label: "Minimum Investment", value: "$250,000" },
              { label: "Deployment Timeline", value: "180 Days" }
            ],
            summary: "Streamlined onboarding for accredited investors to deploy capital gains."
          },
          {
            id: "sponsor-profile",
            title: "Sponsor & Management",
            keyMetrics: [
              { label: "Developer/Sponsor", value: "JDP" },
              { label: "Fund Management", value: "ACARA" },
              { label: "Portfolio Value", value: "~$700M" }
            ],
            summary: "Vertically integrated team with deep expertise in development and OZ compliance."
          }
        ]
      }
    }
  ],
  details: {
    financialReturns: {
      pageTitle: "Financial Returns",
      pageSubtitle: "Investment Returns and Projections",
      backgroundImages: [],
      sections: []
    },
    fundStructure: {
      pageTitle: "Fund Structure",
      pageSubtitle: "OZ RECAP FUND, LLC - Investment Details",
      backgroundImages: [],
      sections: [
        {
          type: "projections",
          data: {
            projections: [
              { label: "Target Total Capital Raise", value: "$40M", description: "To be invested in 3 multifamily assets." },
              { label: "Investment Period / Fund Life", value: "10+ years", description: "To enable full OZ basis step-up." },
              { label: "Target Net IRR", value: "15%", description: "Projected post-tax returns for investors." },
              { label: "Targeted Equity Multiple", value: "2.5x+", description: "Significant upside potential." },
              { label: "Deal Level Promote", value: "30% Promote to GP above 8% Pref", description: "Investor-favorable structure." },
              { label: "Fund Management Fee", value: "2% / 0% carried interest", description: "Annual fee on invested capital." }
            ]
          }
        },
        {
          type: "distributionTimeline",
          data: {
            timeline: [
              { year: "180 Days", phase: "Deploy Gains", distribution: "From Realization", description: "Investors have 180 days from capital gains realization to subscribe to the QOF." },
              { year: "6-18 Months", phase: "First Distribution", distribution: "Post-Investment", description: "Distributions anticipated within 6-18 months post-investment." },
              { year: "Stabilized", phase: "Annual Cash Yield", distribution: "5-8%", description: "Projected 5-8% stabilized annual cash yield once recapitalizations are completed." },
              { year: "Year 10+", phase: "Exit", distribution: "Full OZ Benefits", description: "Primary exit via sale or refinance at Year 10+ to capture full tax-free appreciation on gains." }
            ]
          }
        }
      ]
    },
    portfolioProjects: {
      pageTitle: "Portfolio Projects",
      pageSubtitle: "Newly Built, Stabilized Class-A Multifamily Assets",
      backgroundImages: [],
      sections: [
        {
          type: "projectOverview",
          data: {
            projects: [
              {
                name: "Avian",
                location: "Colorado Springs, CO",
                units: 169,
                status: "Completed / In-Stabilization",
                rentableSqFt: "133,406",
                stabilizedNOI: "$3,543,383",
                capRate: "5.25%"
              },
              {
                name: "Solace at Cimarron Hills",
                location: "Colorado Springs, CO",
                units: 234,
                status: "Completed / In-Stabilization",
                rentableSqFt: "240,030",
                stabilizedNOI: "$3,629,459",
                capRate: "5.75%"
              },
              {
                name: "Solace at Ballpark Village",
                location: "Goodyear, AZ",
                units: 211,
                status: "Completed / In-Stabilization",
                rentableSqFt: "212,395",
                stabilizedNOI: "$3,140,367",
                capRate: "5.75%"
              }
            ]
          }
        }
      ]
    },
    howInvestorsParticipate: {
      pageTitle: "How Investors Participate",
      pageSubtitle: "Onboarding, Reporting, and Timelines",
      backgroundImages: [],
      sections: [
        {
          type: "participationSteps",
          data: {
            steps: [
              {
                title: "Eligibility & Onboarding",
                icon: "UserCheck",
                points: [
                  "Accredited investors only, pursuant to Regulation D Rule 506(c) offering standards.",
                  "Structured as a Qualified Opportunity Fund (QOF) with streamlined onboarding, subscription documents, and KYC/AML compliance built to institutional expectations.",
                  "Investor commitments processed through licensed broker-dealers and third-party fund administration, ensuring regulatory alignment and transparency."
                ]
              },
              {
                title: "Reporting, Liquidity, & Exit Framework",
                icon: "FileText",
                points: [
                  "Annual reporting: asset-level performance, fund-level financials, and Opportunity Zone compliance certification.",
                  "Distributions anticipated within 6-18 months post-investment, with projected 5-8% stabilized annual cash yield once recapitalizations are completed.",
                  "Liquidity designed around OZ requirements, with primary exit via sale or refinance at Year 10+ to capture full tax-free appreciation on gains.",
                  "Secondary liquidity solutions may be evaluated as the fund matures, though strategy remains anchored in long-term OZ compliance and return maximization."
                ]
              },
              {
                title: "Timeline to Deploy Gains",
                icon: "Clock",
                points: [
                  "Investors have 180 days from the realization of eligible federal capital gains to subscribe into the QOF to secure deferral benefits.",
                  "ACARA Management coordinates deployment into recapitalization opportunities, ensuring funds are placed into qualified projects within IRS timelines.",
                  "Early commitments are directed into the fund's secured projects ($75M in equity), with additional capital allocated to pipeline opportunities under active diligence."
                ]
              }
            ]
          }
        },
        {
          type: "fundDetails",
          data: {
            details: [
              { label: "Fund", value: "OZ RECAP FUND, LLC, a Delaware Limited Liability Company" },
              { label: "General Partner", value: "JDP GP Holdings, LLC, an Illinois Limited Liability Company" },
              { label: "Fund Offering", value: "$40,000,000 in Investor Membership Interests" },
              { label: "Minimum Investment", value: "$250,000" },
              { label: "Term", value: "The term of this investment is expected to be 10 years with up to five (5), one (1) year extensions." },
              { label: "Closing", value: "Open until full." },
              { label: "Capital Call Schedule", value: "Each investment to be funded up front pursuant to QOZ timelines and regulations." },
              { label: "Distributions", value: "Distributions to occur quarterly upon stabilization." },
              { label: "Fund Management Fee", value: "Annual Fund management fee of 2% of the total Fund paid to Fund Manager." },
              { label: "Investor Qualifications", value: "This offering is being made pursuant to Rule 506(c) of Regulation D under the Securities Act of 1933 and is open only to verified Accredited Investors." }
            ]
          }
        }
      ]
    },
    propertyOverview: {
      pageTitle: "Property Overview",
      pageSubtitle: "Property Details",
      backgroundImages: [],
      sections: []
    },
    marketAnalysis: {
      pageTitle: "Market Analysis",
      pageSubtitle: "Market Analysis",
      backgroundImages: [],
      sections: []
    },
    sponsorProfile: {
      sponsorName: "ACARA Management™ & Jackson Dearborn Partners",
      sections: [
        {
          type: "fundSponsorEntities",
          data: {
            entities: [
              {
                name: "ACARA Management™",
                role: "Compliance, Deployment, and Management",
                descriptionPoints: [
                  "ACARA Management™ delivers accredited investors exclusive access to recapitalized Opportunity Zone projects with proven fundamentals.",
                  "Our vertically integrated platform combines deep expertise in institutional brokerage, law, tax advisory, and capital markets, giving investors confidence that every layer of the recapitalization process is managed with precision and discipline."
                ],
                team: [
                  { name: "Todd Vitzthum", title: "Managing Partner", roleDetail: "Corporate Commercial Real Estate", image: "https://example.com/todd.jpg" },
                  { name: "Michael Krueger", title: "Managing Partner", roleDetail: "Partner / Corporate & Securities Law, Lucosky Brookman, LLP", image: "https://example.com/michael.jpg" },
                  { name: "Dr. Jeff Richmond", title: "Managing Partner", roleDetail: "Operations", image: "https://example.com/jeff.jpg" }
                ]
              },
              {
                name: "Jackson Dearborn Partners (JDP)",
                role: "Developer / Sponsor",
                descriptionPoints: [
                  "Jackson Dearborn Partners was founded in 2014 to develop and acquire a nationwide portfolio of multifamily and student housing properties.",
                  "The partners have been working together since 2007 and formalized the partnership to bring construction, management, acquisition, and development services all under one roof.",
                  "With a current portfolio valuation of nearly $700 million, JDP opened an office in Scottsdale, AZ in 2020 and Denver, CO in 2021 to service development growth in Colorado and Arizona, the two primary focus markets."
                ],
                team: [
                  { name: "Ryan Tobias", title: "Managing Partner", image: "https://example.com/ryan.png" },
                  { name: "Chris Saunders", title: "Managing Partner", image: "https://example.com/chris.png" },
                  { name: "Shaun Buss", title: "Managing Partner", image: "https://example.com/shaun.png" },
                  { name: "Todd Giampetroni", title: "Acquisitions", image: "https://example.com/todd.png" },
                  { name: "Garrett Kerr", title: "Finance", image: "https://example.com/garrett.png" },
                  { name: "Nick Griffin", title: "Creative", image: "https://example.com/nick.png" },
                  { name: "Mark Czys", title: "Investor Relations", image: "https://example.com/mark.png" },
                  { name: "Dane Olmstead", title: "Development", image: "https://example.com/dane.png" },
                  { name: "Shannon Collins", title: "Acquisitions", image: "https://example.com/shannon.png" },
                  { name: "Raymond Zanca", title: "Head of Capital Markets", image: "https://example.com/raymond.png" },
                  { name: "Sean Lyons", title: "Investor Relations", image: "https://example.com/sean.png" },
                  { name: "Jake Berhorst", title: "Senior Analyst", image: "https://example.com/jake.png" }
                ]
              }
            ]
          }
        }
      ]
    }
  }
};
