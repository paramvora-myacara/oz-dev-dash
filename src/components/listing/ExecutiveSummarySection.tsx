'use client';

import { ExecutiveSummarySectionData } from '@/types/listing';
import { Editable } from '@/components/Editable';

const ExecutiveSummarySection: React.FC<{ data: ExecutiveSummarySectionData; sectionIndex: number }> = ({ data, sectionIndex }) => (
    <section className="py-16 px-8 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-semibold mb-8 text-black dark:text-white text-center tracking-tight">
                Executive Summary
            </h2>
            <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-black/10 dark:border-white/10">
                <div className="prose prose-xl max-w-none text-black dark:text-white">
                    <p className="text-2xl leading-relaxed mb-6 italic font-light">
                        &quot;<Editable dataPath={`sections[${sectionIndex}].data.summary.quote`} value={data.summary.quote} inputType="multiline" className="text-2xl leading-relaxed italic font-light" as="span" spacing="none" />&quot;
                    </p>
                    {data.summary.paragraphs.map((p, i) => (
                        <Editable key={i} dataPath={`sections[${sectionIndex}].data.summary.paragraphs[${i}]`} value={p} inputType="multiline" className="font-light text-lg" as="p" spacing="large" />
                    ))}
                    <p className="font-semibold text-xl text-black dark:text-white">
                        <Editable dataPath={`sections[${sectionIndex}].data.summary.conclusion`} value={data.summary.conclusion} inputType="multiline" className="font-semibold text-xl text-black dark:text-white" as="span" spacing="none" />
                    </p>
                </div>
            </div>
        </div>
    </section>
);

export default ExecutiveSummarySection; 