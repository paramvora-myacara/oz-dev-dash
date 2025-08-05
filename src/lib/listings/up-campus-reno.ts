import { Listing } from "@/types/listing";

const listingData = {
    "listingName": "University of Nevada, Reno Student Housing",
    "listingSlug": "up-campus-reno",
    "projectId": "unv-reno-student-housing-401-highland",
    "sections": [
      {
        "type": "hero",
        "data": {
          "listingName": "University of Nevada, Reno Student Housing",
          "location": "Reno, NV",
          "minInvestment": 250000,
          
        }
      },
      {
        "type": "tickerMetrics",
        "data": {
          "metrics": [
            {"label": "10-Yr Equity Multiple", "value": "3.2x", "change": "+220%"},
            {"label": "Preferred Return", "value": "8%", "change": "Targeted"},
            {"label": "Min Investment", "value": "$250K", "change": "Minimum"},
            {"label": "Location", "value": "Reno, NV", "change": "0.4 mi to Quad"},
            {"label": "Hold Period", "value": "10 Years", "change": "OZ Qualified"},
            {"label": "Tax Benefit", "value": "100%", "change": "Tax-Free Exit"}
          ]
        }
      },
      {
        "type": "compellingReasons",
        "data": {
          "reasons": [
            {
              "title": "Opportunity Zone Tax Benefits",
              "description": "Located in a qualified Opportunity Zone providing capital gains deferral, 10-15% basis step-up, and 100% tax-free appreciation after 10-year hold period.",
              "icon": "TrendingUp"
            },
            {
              "title": "Premier Campus Location",
              "description": "Strategically positioned just one block from UNR's newly built Pennington Engineering Building and 0.4 miles from the campus Quad, closest to engineering facilities.",
              "icon": "MapPin"
            },
            {
              "title": "Strong Market Fundamentals",
              "description": "UNR enrollment of 23,029 with only 5,256 total student beds available, creating significant housing shortage. University targets 25,000 enrollment by 2030.",
              "icon": "BarChart3"
            }
          ]
        }
      },
      {
        "type": "executiveSummary",
        "data": {
          "summary": {
            "quote": "A $91 million student housing development positioned to capitalize on severe housing shortage at University of Nevada, Reno, one of the fastest-growing universities in the Mountain West.",
            "paragraphs": [
              "UP Campus is developing a 465-bed, 220-unit student housing project at 401 Highland Ave, strategically located just one block from UNR's newly constructed Pennington Engineering Building. The project is situated in a qualified Opportunity Zone, offering investors significant tax advantages including potential 100% tax-free appreciation after a 10-year hold period.",
              "With UNR's current enrollment of 23,029 students and only 5,256 total student beds available (23% bed-to-enrollment ratio), the project addresses a critical housing shortage. The university's ambitious growth plan targets 25,000 enrollment by 2030, supported by Nevada's position as the sixth fastest-growing state nationwide with 1.7% population growth."
            ],
            "conclusion": "This development represents a compelling opportunity to invest in a high-demand market with strong fundamentals, regulatory advantages through grandfathered zoning, and powerful Opportunity Zone tax incentives."
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
                {"label": "10-Yr Equity Multiple", "value": "3.2x"},
                {"label": "IRR Target", "value": "15.6%"},
                {"label": "Preferred Return", "value": "8.0%"}
              ],
              "summary": "Strong projected returns with Opportunity Zone tax benefits enhancing after-tax yields"
            },
            {
              "id": "property-overview",
              "title": "Property Overview",
              "keyMetrics": [
                {"label": "Total Beds", "value": "465"},
                {"label": "Total Units", "value": "220"},
                {"label": "Delivery Date", "value": "Oct 2027"}
              ],
              "summary": "Modern student housing with diverse unit mix and premium amenities"
            },
            {
              "id": "market-analysis",
              "title": "Market Analysis",
              "keyMetrics": [
                {"label": "UNR Enrollment", "value": "23,029"},
                {"label": "Bed-to-Enrollment", "value": "23%"},
                {"label": "Nevada Growth Rate", "value": "1.7%"}
              ],
              "summary": "Significant housing shortage with strong enrollment growth trajectory"
            },
            {
              "id": "sponsor-profile",
              "title": "Sponsor Profile",
              "keyMetrics": [
                {"label": "Developer", "value": "UP Campus"},
                {"label": "General Contractor", "value": "Rockwood Construction"},
                {"label": "Project Value", "value": "$91M"}
              ],
              "summary": "Experienced development team with local market expertise"
            }
          ]
        }
      }
    ],
    "details": {
      "financialReturns": {
        "pageTitle": "Financial Returns",
        "pageSubtitle": "Comprehensive analysis of projected investment returns and tax benefits",
        "backgroundImages": [],
        "sections": [
          {
            "type": "projections",
            "data": {
              "projections": [
                {"label": "10-Yr Equity Multiple", "value": "3.2x", "description": "Projected gross return on initial investment over full 10-year hold period"},
                {"label": "Target IRR", "value": "15.6%", "description": "Deal level levered internal rate of return"},
                {"label": "Preferred Return", "value": "8.0%", "description": "Targeted preferred return compounded annually to investors"},
                {"label": "Exit Cap Rate", "value": "5.25%", "description": "Projected capitalization rate at disposition"},
                {"label": "Stabilized YoC (Yr 2)", "value": "7.02%", "description": "Year 2 stabilized yield on cost with full real estate taxes"},
                {"label": "Total Project Cost", "value": "$91M", "description": "Total development cost including land, hard costs, and soft costs"}
              ]
            }
          },
          {
            "type": "distributionTimeline",
            "data": {
              "timeline": [
                {"year": "2025-2027", "phase": "Development & Construction", "distribution": "0%", "description": "Construction period with no distributions to investors"},
                {"year": "2027-2028", "phase": "Lease-Up & Stabilization", "distribution": "6-7%", "description": "Property reaches stabilized occupancy and begins cash flow"},
                {"year": "2028-2035", "phase": "Stabilized Operations", "distribution": "8-10%", "description": "Steady cash flow with annual rent growth and NOI expansion"},
                {"year": "2035", "phase": "Disposition", "distribution": "100% of proceeds", "description": "Capital and profits distributed upon sale with OZ tax benefits"}
              ]
            }
          },
          {
            "type": "taxBenefits",
            "data": {
              "benefits": [
                {"icon": "Calendar", "title": "Capital Gains Deferral", "description": "Defer capital gains taxes on reinvested gains until December 31, 2026, providing immediate tax relief and improved cash flow"},
                {"icon": "Target", "title": "Basis Step-Up", "description": "10% reduction in deferred capital gains tax liability after 5-year hold, with additional 5% reduction after 7-year hold"},
                {"icon": "DollarSign", "title": "Tax-Free Appreciation", "description": "After 10-year hold period, all appreciation on the Opportunity Zone investment is 100% exempt from federal capital gains tax"}
              ]
            }
          },
          {
            "type": "investmentStructure",
            "data": {
              "structure": [
                {"label": "Minimum Investment", "value": "$250,000"},
                {"label": "Asset Type", "value": "Student Housing"},
                {"label": "Target Hold Period", "value": "10 Years"},
                {"label": "Construction Loan", "value": "60% LTC"},
                {"label": "Common Equity (LP)", "value": "36%"},
                {"label": "Common Equity (GP)", "value": "4%"}
              ]
            }
          }
        ]
      },
      "propertyOverview": {
        "pageTitle": "Property Overview",
        "pageSubtitle": "Comprehensive details about the development and its amenities",
        "backgroundImages": [],
        "sections": [
          {
            "type": "keyFacts",
            "data": {
              "facts": [
                {"label": "Total Beds", "value": "465", "description": "Student beds across 220 residential units"},
                {"label": "Building Size", "value": "310,334 SF", "description": "Total building square footage including all amenities"},
                {"label": "Parking Spaces", "value": "294", "description": "63% parking ratio - highest among competitive properties"},
                {"label": "Distance to Quad", "value": "0.4 miles", "description": "Walking distance to main campus quad and academic buildings"}
              ]
            }
          },
          {
            "type": "amenities",
            "data": {
              "amenities": [
                {"name": "Fitness Center", "icon": "Dumbbell"},
                {"name": "Study Lounges", "icon": "BookOpen"},
                {"name": "Rooftop Terrace", "icon": "Building2"},
                {"name": "Pool & Spa", "icon": "Sun"},
                {"name": "Outdoor Fitness", "icon": "Activity"},
                {"name": "Theater Room", "icon": "Monitor"},
                {"name": "Club Room", "icon": "Users"},
                {"name": "Exterior Courtyards", "icon": "Trees"}
              ]
            }
          },
          {
            "type": "unitMix",
            "data": {
              "unitMix": [
                {"type": "Studio", "count": 73, "sqft": "396", "rent": "$2,044"},
                {"type": "1 BR x 1 BA", "count": 39, "sqft": "510", "rent": "$2,142"},
                {"type": "2 BR x 2 BA", "count": 30, "sqft": "713", "rent": "$1,396"},
                {"type": "3 BR x 3 BA", "count": 33, "sqft": "1,058", "rent": "$1,194"},
                {"type": "4 BR x 4 BA", "count": 26, "sqft": "1,315", "rent": "$987"},
                {"type": "5 BR x 5 BA", "count": 17, "sqft": "1,523", "rent": "$925"}
              ],
              "specialFeatures": {
                "title": "Premium Features",
                "description": "All units feature modern finishes, in-unit amenities, and some include private terraces with enhanced outdoor living spaces."
              }
            }
          },
          {
            "type": "locationHighlights",
            "data": {
              "highlights": [
                {"title": "Engineering Hub", "description": "One block from newly built Pennington Engineering Building and Davidson Mathematics & Science Center", "icon": "Cpu", "colors": {"bg": "bg-blue-50 dark:bg-blue-900/10", "text": "text-blue-600 dark:text-blue-400"}},
                {"title": "Campus Access", "description": "Four blocks from the Quad, College of Business, and University Library with easy pedestrian access", "icon": "MapPin", "colors": {"bg": "bg-green-50 dark:bg-green-900/10", "text": "text-green-600 dark:text-green-400"}},
                {"title": "Grandfathered Zoning", "description": "Secured higher-density entitlements before neighborhood downzoning, creating competitive advantages", "icon": "Shield", "colors": {"bg": "bg-purple-50 dark:bg-purple-900/10", "text": "text-purple-600 dark:text-purple-400"}}
              ]
            }
          },
          {
            "type": "developmentTimeline",
            "data": {
              "timeline": [
                {"status": "completed", "title": "Entitlements Secured", "description": "All permits obtained with grandfathered zoning rights"},
                {"status": "in_progress", "title": "Construction Start", "description": "October 2025"},
                {"status": "in_progress", "title": "Delivery", "description": "October 2027"},
                {"status": "in_progress", "title": "Stabilization", "description": "Fall 2027 Academic Year"}
              ]
            }
          }
        ]
      },
      "marketAnalysis": {
        "pageTitle": "Market Analysis",
        "pageSubtitle": "In-depth analysis of the Reno student housing market and growth drivers",
        "backgroundImages": [],
        "sections": [
          {
            "type": "marketMetrics",
            "data": {
              "metrics": [
                {"label": "UNR Enrollment", "value": "23,029", "description": "Current total enrollment with 400+ annual growth since 2012"},
                {"label": "On-Campus Beds", "value": "3,452", "description": "University-owned beds representing 15% of total enrollment"},
                {"label": "Purpose-Built Beds", "value": "1,804", "description": "Private student housing beds within 0.5 miles of Quad"},
                {"label": "Market Occupancy", "value": "91.9%", "description": "Five-year average occupancy rate for competitive properties"},
                {"label": "Nevada Population Growth", "value": "1.7%", "description": "2024 growth rate, ranking Nevada 6th fastest-growing state"},
                {"label": "Reno Metro Growth", "value": "1.3%", "description": "2024-2025 population growth in Greater Reno area"}
              ]
            }
          },
          {
            "type": "majorEmployers",
            "data": {
              "employers": [
                {"name": "University of Nevada, Reno", "employees": "5,000+", "industry": "Education", "distance": "0.4 miles"},
                {"name": "Renown Health", "employees": "4,000+", "industry": "Healthcare", "distance": "2 miles"},
                {"name": "Tesla Gigafactory", "employees": "3,000+", "industry": "Manufacturing", "distance": "25 miles"},
                {"name": "IGT", "employees": "2,000+", "industry": "Gaming Technology", "distance": "8 miles"},
                {"name": "Microsoft", "employees": "1,500+", "industry": "Technology", "distance": "10 miles"},
                {"name": "Switch", "employees": "1,200+", "industry": "Data Centers", "distance": "12 miles"}
              ]
            }
          },
          {
            "type": "keyMarketDrivers",
            "data": {
              "drivers": [
                {"title": "Enrollment Growth Target", "description": "UNR President's '25 by 30' initiative targets 25,000 enrollment by 2030", "icon": "TrendingUp"},
                {"title": "Tech Industry Expansion", "description": "Major tech companies like Tesla, Microsoft, and Google expanding operations in Reno", "icon": "Cpu"},
                {"title": "Nevada Population Boom", "description": "State population grew 1.7% in 2024, ranking 6th fastest nationally", "icon": "Users"},
                {"title": "Housing Shortage", "description": "Only 23% bed-to-enrollment ratio creates significant unmet demand", "icon": "Home"}
              ]
            }
          },
          {
            "type": "demographics",
            "data": {
              "demographics": [
                {"category": "Median Age", "value": "38.9", "description": "Nevada state median age, younger than national average"},
                {"category": "College Educated", "value": "32%", "description": "Percentage of adults with bachelor's degree or higher"},
                {"category": "Median Income", "value": "$75,561", "description": "Nevada median household income (2023)"},
                {"category": "Population Growth", "value": "1.7%", "description": "Annual population growth rate (2023-2024)"}
              ]
            }
          },
          {
            "type": "supplyDemand",
            "data": {
              "analysis": [
                {"icon": "TrendingUp", "title": "Growing Demand", "description": "UNR enrollment growing 400+ students annually since 2012 with 25,000 target by 2030"},
                {"icon": "Home", "title": "Limited Supply", "description": "Only 5,256 total student beds for 23,029 students (23% coverage ratio)"},
                {"icon": "Building", "title": "Development Constraints", "description": "Area downzoned from MU-UNRC to MU 30, limiting future high-density development"},
                {"icon": "MapPin", "title": "Prime Location", "description": "UP Campus closest to engineering facilities with grandfathered higher-density rights"}
              ]
            }
          }
        ]
      },
      "sponsorProfile": {
        "sponsorName": "UP Campus",
        "sections": [
          {
            "type": "sponsorIntro",
            "data": {
              "sponsorName": "About UP Campus",
              "content": {
                "paragraphs": [
                  "UP Campus is a specialized student housing developer focused on creating modern, amenity-rich communities near major universities. The company combines deep market knowledge with innovative design to develop properties that enhance the student living experience while delivering strong investment returns.",
                  "With a focus on strategic locations and market-leading amenities, UP Campus has established itself as a trusted partner for institutional investors seeking exposure to the high-growth student housing sector. The company's commitment to quality construction and operational excellence has resulted in strong performance across its portfolio."
                ],
                "highlights": {
                  "type": "list",
                  "items": [
                    {"text": "Student Housing Development Specialist"},
                    {"text": "Experienced in University Markets"},
                    {"text": "Focus on Amenity-Rich Communities"},
                    {"text": "Strong Institutional Relationships"}
                  ]
                }
              }
            }
          },
          {
            "type": "trackRecord",
            "data": {
              "metrics": [
                {"label": "Current Project Value", "value": "$91M", "description": "Total development cost for UNR project"},
                {"label": "Total Beds", "value": "465", "description": "Beds in current development pipeline"},
                {"label": "Construction Partner", "value": "Rockwood", "description": "Experienced general contractor"},
                {"label": "Target IRR", "value": "15.6%", "description": "Projected deal-level returns"}
              ]
            }
          },
          {
            "type": "leadershipTeam",
            "data": {
              "teamMembers": [
                {
                  "name": "UP Campus Development Team",
                  "title": "Principal & Development Manager",
                  "experience": "15+ years",
                  "background": "Extensive experience in student housing development with deep knowledge of university markets and student preferences. Led multiple successful projects from acquisition through stabilization."
                },
                {
                  "name": "Rockwood Construction",
                  "title": "General Contractor",
                  "experience": "20+ years",
                  "background": "Experienced construction partner specializing in multi-family and student housing developments. Strong track record of delivering projects on time and on budget."
                },
                {
                  "name": "Local Market Advisors",
                  "title": "Market & Leasing Specialists",
                  "experience": "10+ years",
                  "background": "Local Reno market expertise with deep understanding of UNR student preferences, leasing patterns, and competitive dynamics in the university submarket."
                }
              ]
            }
          },
          {
            "type": "developmentPortfolio",
            "data": {
              "projects": [
                {"name": "UNR Student Housing", "location": "Reno, NV", "units": "220", "year": "2027", "status": "In Progress", "returnsOrFocus": "15.6% Target IRR"}
              ]
            }
          },
          {
            "type": "competitiveAdvantages",
            "data": {
              "advantages": [
                {"icon": "Shield", "title": "Grandfathered Zoning", "description": "Secured higher-density entitlements before neighborhood downzoning, creating barrier to future competition"},
                {"icon": "MapPin", "title": "Premier Location", "description": "Closest purpose-built student housing to engineering facilities, adjacent to newest campus buildings"}
              ]
            }
          }
        ]
      }
    }
  }
  
  function transformListingData(data: any): Listing {
    return {
      listingName: data.listingName,
      listingSlug: data.listingSlug,
      projectId: data.projectId,
      sections: data.sections,
      details: {
        financialReturns: data.details.financialReturns,
        propertyOverview: data.details.propertyOverview,
        marketAnalysis: data.details.marketAnalysis,
        sponsorProfile: data.details.sponsorProfile,
      },
    };
  }
  
  const listing: Listing = transformListingData(listingData);
  
  export default listing;
  