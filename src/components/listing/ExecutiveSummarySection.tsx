'use client';

import { ExecutiveSummarySectionData } from '@/types/listing';

const ExecutiveSummarySection: React.FC<{ data: ExecutiveSummarySectionData }> = ({ data }) => (
    <section className="py-16 px-8 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-semibold mb-8 text-black dark:text-white text-center tracking-tight">
                Executive Summary
            </h2>
            <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-black/10 dark:border-white/10">
                <div className="prose prose-xl max-w-none text-black dark:text-white">
                    <p className="text-2xl leading-relaxed mb-6 italic font-light">
                        &quot;{data.summary.quote}&quot;
                    </p>
                    {data.summary.paragraphs.map((p, i) => (
                        <p key={i} className="mb-6 font-light text-lg" dangerouslySetInnerHTML={{ __html: p }}></p>
                    ))}
                    <p className="font-semibold text-xl text-black dark:text-white">
                        {data.summary.conclusion}
                    </p>
                </div>
            </div>
        </div>
    </section>
);

export default ExecutiveSummarySection; 