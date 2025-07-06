import Link from "next/link";
import { Building, Waves, Dumbbell, Laptop, Dog, Building2, Bell, Zap, Package, MapPin, Car, Bus, Plane } from "lucide-react";

export default function PropertyOverviewPage() {
  const amenities = [
    { name: "Resort-Style Pool", icon: <Waves className="w-6 h-6" /> },
    { name: "State-of-the-Art Fitness Center", icon: <Dumbbell className="w-6 h-6" /> },
    { name: "Co-working Spaces", icon: <Laptop className="w-6 h-6" /> },
    { name: "Dog Park & Pet Spa", icon: <Dog className="w-6 h-6" /> },
    { name: "Rooftop Terrace", icon: <Building2 className="w-6 h-6" /> },
    { name: "Concierge Services", icon: <Bell className="w-6 h-6" /> },
    { name: "Electric Vehicle Charging", icon: <Zap className="w-6 h-6" /> },
    { name: "Package Lockers", icon: <Package className="w-6 h-6" /> }
  ];

  const unitMix = [
    { type: "Studio", count: 45, sqft: "550-650", rent: "$1,850-2,100" },
    { type: "1 Bedroom", count: 156, sqft: "750-950", rent: "$2,300-2,800" },
    { type: "2 Bedroom", count: 89, sqft: "1,100-1,350", rent: "$3,200-3,900" },
    { type: "3 Bedroom", count: 22, sqft: "1,400-1,600", rent: "$4,500-5,200" }
  ];

  return (
    <div className="min-h-screen bg-bg-main dark:bg-black">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <Link href="/" className="inline-flex items-center text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 mb-8">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </Link>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-5xl"><Building className="w-12 h-12 text-indigo-600 dark:text-indigo-400" /></div>
            <div>
              <h1 className="text-5xl font-semibold text-indigo-900 dark:text-indigo-300 tracking-tight">
                The Edge on Main
              </h1>
              <p className="text-xl text-indigo-700 dark:text-indigo-400 mt-2">
                Modern multifamily development in Mesa, Arizona
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Key Property Facts */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Total Units</h3>
              <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-300">439</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2">Phase I (161) & Phase II (278)</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Year Built</h3>
              <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-300">2024</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2">Brand new construction</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Total SF</h3>
              <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-300">295K</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2">Rentable area</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Parking</h3>
              <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-300">468</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2">Covered spaces</p>
            </div>
          </div>

          {/* Location & Accessibility */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Location & Transportation</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl"><MapPin className="w-6 h-6 text-red-500" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Prime Mesa Location</h4>
                    <p className="text-gray-600 dark:text-gray-400">15 minutes from downtown Phoenix</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl"><Car className="w-6 h-6 text-blue-500" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Highway Access</h4>
                    <p className="text-gray-600 dark:text-gray-400">Direct access to US-60 and Loop 202</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl"><Bus className="w-6 h-6 text-green-500" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Public Transit</h4>
                    <p className="text-gray-600 dark:text-gray-400">Valley Metro Light Rail nearby</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl"><Plane className="w-6 h-6 text-purple-500" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Phoenix Airport</h4>
                    <p className="text-gray-600 dark:text-gray-400">25 minutes to PHX Sky Harbor</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Nearby Attractions</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Downtown Phoenix</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">18 mi</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Arizona State University</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">12 mi</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Tempe Town Lake</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">8 mi</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Scottsdale Fashion Square</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">15 mi</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Mesa Arts Center</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">3 mi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Mix */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Unit Mix & Pricing</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Unit Type</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Count</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Square Feet</th>
                    <th className="text-left py-3 text-gray-900 dark:text-gray-100">Market Rent</th>
                  </tr>
                </thead>
                <tbody>
                  {unitMix.map((unit, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 font-semibold text-gray-900 dark:text-gray-100">{unit.type}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{unit.count}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{unit.sqft}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{unit.rent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Premium Amenities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl">{amenity.icon}</div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 