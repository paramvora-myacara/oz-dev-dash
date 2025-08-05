'use client';

import Marquee from "react-fast-marquee";
import { TickerMetricsSectionData } from '@/types/listing';

const TickerMetricsSection: React.FC<{ data: TickerMetricsSectionData }> = ({ data }) => (
    <section className="py-4 md:py-6 bg-white dark:bg-black">
        <Marquee speed={50} gradient={false} pauseOnHover={true} className="text-sm sm:text-base md:text-lg font-mono tracking-wider uppercase text-black dark:text-white">
            {data.metrics.map((metric, idx) => (
                <div key={idx} className="flex items-center space-x-2 sm:space-x-3 whitespace-nowrap mx-4 sm:mx-6">
                    <span className="font-bold text-red-500">{metric.label}:</span>
                    <span className="font-bold text-green-500">{metric.value}</span>
                    <span className="text-xs bg-black/10 dark:bg-white/10 px-2 sm:px-3 py-1 rounded-full font-sans text-black/60 dark:text-white/60 normal-case">
                        {metric.change}
                    </span>
                    <span className="text-black/40 dark:text-white/40 text-xl">•</span>
                </div>
            ))}
        </Marquee>
    </section>
);

export default TickerMetricsSection; 