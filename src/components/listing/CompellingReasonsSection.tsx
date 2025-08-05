'use client';

import { CompellingReasonsSectionData } from '@/types/listing';
import { iconMap } from '@/components/listing/details/shared/iconMap';

const CompellingReasonsSection: React.FC<{ data: CompellingReasonsSectionData }> = ({ data }) => (
    <section className="py-12 md:py-20 px-4 md:px-8 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 md:mb-16 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black dark:text-white mb-6 tracking-tight">
            <span className="text-blue-500">OZ</span>zie AI <em>Says</em>
          </h2>
          <p className="text-xl md:text-2xl text-black/70 dark:text-white/70 font-light max-w-3xl mx-auto">
            Upon reviewing this deal, here are the top 3 reasons to invest in this project
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {data.reasons.map((reason, idx) => {
              const IconComponent = iconMap[reason.icon];
              const cardStyles = [
                {
                    gradient: "from-emerald-50/20 via-emerald-100/20 to-green-200/20 dark:from-emerald-900/10 dark:via-emerald-800/10 dark:to-green-900/10",
                    textColor: "text-emerald-900 dark:text-emerald-200",
                    accentColor: "text-emerald-800 dark:text-emerald-300",
                    iconColor: "text-emerald-600 dark:text-emerald-400"
                },
                {
                    gradient: "from-blue-50/20 via-blue-100/20 to-indigo-200/20 dark:from-blue-900/10 dark:via-blue-800/10 dark:to-indigo-900/10",
                    textColor: "text-blue-900 dark:text-blue-200",
                    accentColor: "text-blue-800 dark:text-blue-300",
                    iconColor: "text-blue-600 dark:text-blue-400"
                },
                {
                    gradient: "from-purple-50/20 via-purple-100/20 to-pink-200/20 dark:from-purple-900/10 dark:via-purple-800/10 dark:to-pink-900/10",
                    textColor: "text-purple-900 dark:text-purple-200",
                    accentColor: "text-purple-800 dark:text-purple-300",
                    iconColor: "text-purple-600 dark:text-purple-400"
                }
              ];
              const style = cardStyles[idx % cardStyles.length];

              return (
                <div
                    key={idx}
                    className={`relative flex flex-col items-center justify-center text-center rounded-3xl p-10 min-h-[340px] transition-all duration-500 animate-fadeIn
                    bg-white/10 dark:bg-white/5 backdrop-blur-xl
                    border border-white/30 dark:border-white/10
                    shadow-2xl hover:shadow-[0_8px_40px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_8px_40px_rgba(255,255,255,0.08)]
                    hover:scale-[1.03]`}
                    style={{ animationDelay: `${idx * 150}ms` }}
                >
                    <div className={`mb-8 flex items-center justify-center w-16 h-16 rounded-full
                    ${style.iconColor} bg-white/30 dark:bg-white/10 shadow-lg text-4xl`}>
                        {IconComponent && <IconComponent className="w-12 h-12" />}
                    </div>
                    <h3 className={`text-2xl md:text-3xl font-extrabold mb-3 tracking-tight ${style.textColor}`}>{reason.title}</h3>
                    <p className={`text-base md:text-lg font-light ${style.accentColor} opacity-90`}>{reason.description}</p>
                </div>
              );
          })}
        </div>
      </div>
    </section>
);

export default CompellingReasonsSection; 