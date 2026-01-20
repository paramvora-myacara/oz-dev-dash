'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Calculator() {
    const [gainAmount, setGainAmount] = useState(1000000);
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

    // State for the values actually shown on the graph (handles noise)
    const [displayedValues, setDisplayedValues] = useState({ standardFinal: 0, ozFinal: 0 });

    const calculations = useMemo(() => {
        const irr = 0.10;
        const taxRate = 0.238;
        const years = 10;
        const growthMultiplier = Math.pow(1 + irr, years);

        // Standard Logic
        const standardInitialTax = gainAmount * taxRate;
        const standardInvested = gainAmount - standardInitialTax;

        // Removed deterministic volatility - using random noise during interaction instead
        const standardPreTaxFinal = standardInvested * growthMultiplier;
        const standardProfit = standardPreTaxFinal - standardInvested;
        const standardProfitTax = standardProfit * taxRate;
        const standardFinal = Math.round(standardPreTaxFinal - standardProfitTax);

        // OZ Logic
        const ozInvested = gainAmount;
        const ozPreTaxFinal = ozInvested * growthMultiplier;
        const ozDeferredTax = gainAmount * taxRate;
        const ozFinal = Math.round(ozPreTaxFinal - ozDeferredTax);

        const advantage = ozFinal - standardFinal;

        return { standardFinal, ozFinal, advantage };
    }, [gainAmount]);

    // Effect to handle noise and stabilization
    useEffect(() => {
        // 1. Immediately apply random noise when value changes
        // Increased range for a more "exaggerated" look as requested
        const noiseRange = 0.15; // +/- 15%

        // Give each bar slightly independent noise logic for a "dancing" effect
        const noiseStandard = 1 + (Math.random() * noiseRange * 2 - noiseRange);
        const noiseOZ = 1 + (Math.random() * (noiseRange * 1.2) * 2 - (noiseRange * 1.2)); // OZ bar moves slightly more

        setDisplayedValues({
            standardFinal: Math.round(calculations.standardFinal * noiseStandard),
            ozFinal: Math.round(calculations.ozFinal * noiseOZ)
        });

        // 2. Set timeout to stabilize to actual values
        const timer = setTimeout(() => {
            setDisplayedValues({
                standardFinal: calculations.standardFinal,
                ozFinal: calculations.ozFinal
            });
        }, 600); // Slightly longer stabilization for more drama

        return () => clearTimeout(timer);
    }, [calculations]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    };

    const formatCompact = (val: number) => {
        return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(val);
    }

    // Calculate static Y-axis max based on slider max to ensure bars grow/shrink visually
    const SLIDER_MIN = 100000;
    const SLIDER_MAX = 10000000;

    // Dynamic Y-axis max based on accurate calculations to keep scale consistent
    // We use calculations.ozFinal (stable) for the scale so the noise "dances" around the true scale
    const yMax = calculations.ozFinal * 1.1;

    // For slider track styling
    const percentage = ((gainAmount - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

    return (
        <section className="py-8 sm:py-12 bg-white dark:bg-black relative overflow-hidden">
            <style jsx>{`
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    background: #ffffff;
                    border: 2px solid #1E88E5; /* Primary blue */
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    margin-top: -8px; /* Centers thumb since track is thinner */
                }
                input[type=range]::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    background: #ffffff;
                    border: 2px solid #1E88E5;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
                /* Ensure track is centered vertically for the custom thumb */
                input[type=range]::-webkit-slider-runnable-track {
                    height: 8px;
                    border-radius: 9999px;
                }
            `}</style>
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-[40px] font-extrabold text-navy dark:text-white mb-4">
                        Calculate Your Growth
                    </h2>
                    <p className="text-lg text-navy/60 dark:text-white/60">
                        Enter your capital gain to see a personalized 10-year projection.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch">

                    {/* Chart Side */}
                    <div className="flex-[1.2] rounded-2xl p-6 flex flex-col relative min-h-[300px] sm:min-h-[400px]">
                        <div className="absolute top-8 right-8 flex flex-row-reverse gap-4 sm:gap-6 text-xs sm:text-sm font-bold uppercase tracking-widest text-navy/70 dark:text-white/70">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" /> With OZ
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-400/50" /> Without OZ
                            </div>
                        </div>

                        {/* Chart Container with Y-Axis */}
                        <div className="flex-1 flex mt-16 mb-2 items-stretch min-h-[300px] sm:min-h-[400px]">
                            {/* Y-Axis Labels */}
                            <div className="flex flex-col justify-between text-[10px] sm:text-sm font-bold text-navy/70 dark:text-white/70 py-0 pr-2 sm:pr-4 text-right w-12 sm:w-16 z-10">
                                <span>{formatCompact(yMax)}</span>
                                <span>{formatCompact(yMax * 0.8)}</span>
                                <span>{formatCompact(yMax * 0.6)}</span>
                                <span>{formatCompact(yMax * 0.4)}</span>
                                <span>{formatCompact(yMax * 0.2)}</span>
                                <span>0</span>
                            </div>

                            {/* Main Chart Area */}
                            <div className="flex-1 flex items-end justify-around gap-2 sm:gap-4 relative border-b-2 border-navy/10 dark:border-white/10">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5 w-full">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="w-full border-t border-navy dark:border-white h-px" />
                                    ))}
                                </div>

                                {/* Without OZ Bar */}
                                <div className="flex flex-col items-center w-full max-w-[100px] sm:max-w-[120px] relative z-20 h-full justify-end">
                                    <motion.div
                                        layout
                                        className="w-full bg-slate-400 opacity-30 rounded-t-lg relative group"
                                        style={{ height: `${(displayedValues.standardFinal / yMax) * 100}%` }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 font-bold text-navy dark:text-white whitespace-nowrap text-xs sm:text-sm">
                                            {formatCompact(displayedValues.standardFinal)}
                                        </div>
                                    </motion.div>
                                </div>

                                {/* With OZ Bar */}
                                <div className="flex flex-col items-center w-full max-w-[120px] sm:max-w-[140px] relative z-20 h-full justify-end">
                                    <motion.div
                                        layout
                                        className="w-full bg-primary rounded-t-lg relative shadow-[0_-8px_30px_rgb(30,136,229,0.3)]"
                                        animate={{
                                            boxShadow: ["0 0 0 0 rgba(30, 136, 229, 0.4)", "0 0 0 15px rgba(30, 136, 229, 0)"]
                                        }}
                                        style={{
                                            height: `${(displayedValues.ozFinal / yMax) * 100}%`,
                                            scale: 1.05,
                                            originY: 1
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 25,
                                            boxShadow: {
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }
                                        }}
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 font-black text-navy dark:text-white text-lg sm:text-xl whitespace-nowrap">
                                            {formatCompact(displayedValues.ozFinal)}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* X-Axis Labels */}
                        <div className="flex pl-10 sm:pl-12">
                            <div className="flex-1 flex justify-around gap-2 sm:gap-4">
                                <div className="w-full max-w-[100px] sm:max-w-[120px] text-center">
                                    <span className="text-xs sm:text-sm font-bold text-navy/70 dark:text-white/70 uppercase tracking-widest whitespace-nowrap">Without OZ</span>
                                </div>
                                <div className="w-full max-w-[120px] sm:max-w-[140px] text-center">
                                    <span className="text-xs sm:text-sm font-bold text-primary dark:text-blue-400 uppercase tracking-widest whitespace-nowrap">With OZ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Input Side */}
                    <div className="flex-1 bg-white dark:bg-gray-900 border-2 border-navy dark:border-white/20 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                        <label className="block text-sm font-bold text-navy dark:text-white uppercase tracking-widest mb-4">Initial Capital Gain</label>

                        <div className="flex justify-between items-end mb-2">
                            <span className="text-5xl font-extrabold text-primary">
                                {formatCompact(gainAmount)}
                            </span>
                        </div>

                        <div className="relative mb-6">
                            <input
                                type="range"
                                min={SLIDER_MIN}
                                max={SLIDER_MAX}
                                step="100000"
                                value={gainAmount}
                                onChange={(e) => setGainAmount(Number(e.target.value))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary" // h-2 update
                                style={{
                                    background: `linear-gradient(to right, #1E88E5 ${percentage}%, #F3F4F6 ${percentage}%)`
                                }}
                            />
                            <div className="flex justify-between mt-2 text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-widest">
                                <span>$100K</span>
                                <span>$5M</span>
                                <span>$10M</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 sm:p-6 bg-success-bg rounded-xl border border-success-bg/20">
                                <p className="text-sm font-bold text-navy/60 dark:text-white/60 uppercase mb-1">With OZ Investment (10-Year)</p>
                                <p className="text-2xl sm:text-3xl font-extrabold text-[#27AE60]">{formatCurrency(calculations.ozFinal)}</p>
                            </div>

                            <div className="p-4 sm:p-6 bg-alert-bg rounded-xl border border-alert-bg/20">
                                <p className="text-sm font-bold text-navy/60 dark:text-white/60 uppercase mb-1">Non-OZ Investment (10-Year)</p>
                                <p className="text-2xl sm:text-3xl font-extrabold text-slate-500">{formatCurrency(calculations.standardFinal)}</p>
                            </div>

                            <div className="p-4 sm:p-6 bg-[#EBF5FF] rounded-xl border border-primary/10">
                                <p className="text-sm font-bold text-navy/60 dark:text-white/60 uppercase mb-1">OZ Advantage</p>
                                <p className="text-2xl sm:text-3xl font-extrabold text-primary">{formatCurrency(calculations.advantage)}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Calculation Details Toggle */}
                        <div className="max-w-6xl mx-auto mt-6 sm:mt-8 border-t border-navy/5 dark:border-white/5 pt-4">
                    <button
                        onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                        className="flex items-center gap-3 mx-auto text-navy/70 dark:text-white/70 hover:text-primary dark:hover:text-blue-400 transition-colors font-bold uppercase tracking-widest text-sm group"
                    >
                        {isDetailsExpanded ? 'Hide' : 'Show'} Calculation Methodology
                        <motion.span
                            animate={{ rotate: isDetailsExpanded ? 180 : 0 }}
                            className="inline-block"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                        </motion.span>
                    </button>

                    <motion.div
                        initial={false}
                        animate={{
                            height: isDetailsExpanded ? 'auto' : 0,
                            opacity: isDetailsExpanded ? 1 : 0,
                            marginTop: isDetailsExpanded ? 24 : 0
                        }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-navy dark:text-white">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black uppercase tracking-tight">How The Calculation Works</h3>
                                <div className="space-y-4">
                                    <div className="border-l-4 border-slate-400 pl-6 py-2">
                                        <p className="font-bold text-lg mb-2">Non-QOZ Investment</p>
                                        <ul className="space-y-2 text-sm text-navy/70 dark:text-white/70 list-disc ml-4">
                                            <li>Initial federal capital gain is taxed at 23.8% (20% federal capital gains tax + 3.8% Net Investment Income Tax).</li>
                                            <li>The remaining net amount grows at 10% annually for 10 years.</li>
                                            <li>The profit from that growth (appreciation) is taxed again at 23.8% federal capital gains tax.</li>
                                        </ul>
                                    </div>
                                    <div className="border-l-4 border-primary pl-6 py-2">
                                        <p className="font-bold text-lg mb-2">QOZ Investment</p>
                                        <ul className="space-y-2 text-sm text-navy/70 dark:text-white/70 list-disc ml-4">
                                            <li>The full, pre-tax capital gain is invested and grows at 10% annually for 10 years.</li>
                                            <li>The original federal capital gains tax is deferred to EoY 2026 (12/31/26).</li>
                                            <li>The profit from the investment's growth is **100% tax-free**.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-2xl font-black uppercase tracking-tight">Assumptions</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <p className="text-xs font-bold text-navy/40 dark:text-white/40 uppercase tracking-widest mb-1">Annual Growth Rate</p>
                                        <p className="text-3xl font-black">10%</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <p className="text-xs font-bold text-navy/40 dark:text-white/40 uppercase tracking-widest mb-1">Federal Tax Rate</p>
                                        <p className="text-3xl font-black">23.8%</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-navy/5 dark:bg-white/5 rounded-xl">
                                    <p className="text-[11px] font-bold text-navy/40 dark:text-white/40 uppercase tracking-widest mb-3">Disclaimer</p>
                                    <p className="text-xs leading-relaxed text-navy/60 dark:text-white/60">
                                        This graph is for illustrative purposes only and does not represent actual or guaranteed results. All assumptions are hypothetical. Opportunity Zone investments carry risk, including possible loss of principal. Consult your financial, tax, and legal advisors before investing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section >
    );
}
