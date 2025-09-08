'use client';

import Marquee from "react-fast-marquee";
import { TickerMetricsSectionData } from '@/types/listing';
import { Editable } from '@/components/Editable';

const TickerMetricsSection: React.FC<{ data: TickerMetricsSectionData; sectionIndex: number }> = ({ data, sectionIndex }) => (
    <section className="py-4 md:py-6 bg-white dark:bg-black">
        <Marquee speed={50} gradient={false} pauseOnHover={true} className="text-sm sm:text-base md:text-lg font-mono tracking-wider uppercase text-black dark:text-white">
            {data.metrics.map((metric, idx) => (
                <div key={idx} className="flex items-center space-x-2 sm:space-x-3 whitespace-nowrap mx-4 sm:mx-6">
                    <Editable 
                        dataPath={`sections[${sectionIndex}].data.metrics[${idx}].label`}
                        value={metric.label}
                        className="font-bold text-black dark:text-white"
                    />
                    <span className="font-bold text-black dark:text-white">:</span>
                    <Editable 
                        dataPath={`sections[${sectionIndex}].data.metrics[${idx}].value`}
                        value={metric.value}
                        className="font-bold text-green-500"
                    />
                    <Editable 
                        dataPath={`sections[${sectionIndex}].data.metrics[${idx}].change`}
                        value={metric.change}
                        className="text-xs bg-black/10 dark:bg-white/10 px-2 sm:px-3 py-1 rounded-full font-sans text-black/60 dark:text-white/60 normal-case"
                    />
                    <span className="text-black/40 dark:text-white/40 text-xl">•</span>
                </div>
            ))}
        </Marquee>
    </section>
);

export default TickerMetricsSection; 