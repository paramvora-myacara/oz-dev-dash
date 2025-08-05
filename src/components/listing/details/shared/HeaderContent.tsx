import Link from 'next/link';
import { Users } from 'lucide-react';
import React from 'react';

interface ColorConfig {
    title: string;
    subtitle: string;
    icon: string;
    backLink: string;
    backLinkHover: string;
  }
  
  const HeaderContent = ({ data, slug, camelCasePage, colorConfig }: { data: any, slug: string, camelCasePage: string, colorConfig: ColorConfig }) => {
    let title = '';
    let subtitle = '';

    if (camelCasePage === 'sponsorProfile') {
      title = "Sponsor Profile";
      subtitle = data.sponsorName;
    } else {
      title = data.pageTitle;
      subtitle = data.pageSubtitle;
    }
    
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-8">
          <Link
            href={`/${slug}#investment-cards`} // Corrected href
            className={`inline-flex items-center ${colorConfig.backLink} hover:${colorConfig.backLinkHover} mb-8 transition-colors`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Overview
          </Link>
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-5xl"><Users className={`w-12 h-12 ${colorConfig.icon}`} /></div>
            <div>
              <h1 className={`text-5xl font-semibold ${colorConfig.title} tracking-tight`}>{title}</h1>
              <p className={`text-xl ${colorConfig.subtitle} mt-2`}>{subtitle}</p>
            </div>
          </div>
        </div>
      </section>
    );
  };

  export default HeaderContent; 