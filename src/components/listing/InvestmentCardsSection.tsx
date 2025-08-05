'use client';

import Link from "next/link";
import { TrendingUp, Building, Target, Users, Expand } from "lucide-react";
import { InvestmentCardsSectionData } from '@/types/listing';

const InvestmentCardsSection: React.FC<{ data: InvestmentCardsSectionData, listingSlug: string }> = ({ data, listingSlug }) => (
    <section id="investment-cards" className="py-8 md:py-16 px-4 md:px-8 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black dark:text-white mb-4">
                    Due Diligence Vault
                </h2>
                <p className="text-lg md:text-xl text-black/70 dark:text-white/70 font-light max-w-3xl mx-auto">
                    Click any card to learn more and access documentation
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {data.cards.map((card, idx) => {
                    const cardStyles = {
                        'financial-returns': {
                            gradient: "from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20",
                            textColor: "text-emerald-900 dark:text-emerald-300",
                            accentColor: "text-emerald-700 dark:text-emerald-400",
                            icon: TrendingUp
                        },
                        'property-overview': {
                            gradient: "from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
                            textColor: "text-indigo-900 dark:text-indigo-300",
                            accentColor: "text-indigo-700 dark:text-indigo-400",
                            icon: Building
                        },
                        'market-analysis': {
                            gradient: "from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20",
                            textColor: "text-purple-900 dark:text-purple-300",
                            accentColor: "text-purple-700 dark:text-purple-400",
                            icon: Target
                        },
                        'sponsor-profile': {
                            gradient: "from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20",
                            textColor: "text-orange-900 dark:text-orange-300",
                            accentColor: "text-orange-700 dark:text-orange-400",
                            icon: Users
                        }
                    };
                    const style = cardStyles[card.id];
                    const IconComponent = style.icon;

                    return (
                        <Link
                            key={idx}
                            href={`/${listingSlug}/details/${card.id}`}
                            className={`glass-card rounded-3xl p-8 bg-gradient-to-br ${style.gradient} border border-gray-200 dark:border-white/20 shadow-md dark:shadow-xl shadow-gray-200/50 dark:shadow-white/5 hover:shadow-lg dark:hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-fadeIn group relative overflow-hidden`}
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 dark:from-white/[0.04] dark:to-white/[0.02] pointer-events-none" />
                            <div className="relative flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`${style.textColor}`}><IconComponent className="w-10 h-10" /></div>
                                    <h3 className={`text-2xl font-semibold ${style.textColor}`}>{card.title}</h3>
                                </div>
                                <Expand className={`w-6 h-6 ${style.textColor} opacity-60 group-hover:opacity-100 transition-opacity`} />
                            </div>
                            <div className="space-y-8 mb-6 flex-1">
                                {card.keyMetrics.map((metric, metricIdx) => (
                                    <div key={metricIdx} className="flex items-center justify-between">
                                        <span className={`text-lg font-medium ${style.accentColor}`}>{metric.label}</span>
                                        <span className="text-xl font-semibold text-black dark:text-white">{metric.value}</span>
                                    </div>
                                ))}
                            </div>
                            <p className={`text-base leading-relaxed font-light ${style.accentColor}`}>{card.summary}</p>
                        </Link>
                    )
                })}
            </div>
        </div>
    </section>
);

export default InvestmentCardsSection; 