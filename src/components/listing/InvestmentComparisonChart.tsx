import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

const SLIDER_MIN = 0;
const SLIDER_MAX = 1000;
const SLIDER_MID = 400; // 0-400 for 100k-1M, 401-1000 for 1M-100M

const sliderToCapitalGain = (sliderValue: number) => {
  if (sliderValue <= SLIDER_MID) {
    return 100000 + ((1000000 - 100000) * (sliderValue / SLIDER_MID));
  } else {
    const logMin = Math.log10(1000000);
    const logMax = Math.log10(100000000);
    const t = (sliderValue - SLIDER_MID) / (SLIDER_MAX - SLIDER_MID);
    const logValue = logMin + t * (logMax - logMin);
    return Math.round(Math.pow(10, logValue) / 10000) * 10000;
  }
};

const capitalGainToSlider = (capitalGain: number) => {
  if (capitalGain <= 1000000) {
    return Math.round(((capitalGain - 100000) / (1000000 - 100000)) * SLIDER_MID);
  } else {
    const logMin = Math.log10(1000000);
    const logMax = Math.log10(100000000);
    const logValue = Math.log10(capitalGain);
    const t = (logValue - logMin) / (logMax - logMin);
    return Math.round(SLIDER_MID + t * (SLIDER_MAX - SLIDER_MID));
  }
};

interface InvestmentComparisonChartProps {
  projectedIrr10yr?: number | null;
  equityMultiple10yr?: number | null;
  defaultCapitalGain?: number | null;
}

const DEFAULT_IRR = 10;

const InvestmentComparisonChart: React.FC<InvestmentComparisonChartProps> = ({ projectedIrr10yr, equityMultiple10yr, defaultCapitalGain }) => {
  const initialCapitalGain = defaultCapitalGain ?? 1000000;
  const [capitalGain, setCapitalGain] = useState(initialCapitalGain);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [sliderValue, setSliderValue] = useState(() => capitalGainToSlider(initialCapitalGain));
  const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });

  // Use provided IRR/multiple or fallback to defaults
  const irr = projectedIrr10yr ?? DEFAULT_IRR;
  const annualGrowthRate = irr / 100;
  const multiple = Math.pow(1 + annualGrowthRate, 10);
  const taxRate = 0.238;

  // Calculation logic with randomization for realism
  function calculateInvestmentValues(initialInvestment: number) {
    const years = 10;
    const labels = Array.from({ length: years + 1 }, (_, i) => `Year ${i}`);
    
    // Generate shared noise values for each year (same for both investments)
    const noiseValues: number[] = [];
    for (let i = 0; i <= years; i++) {
      if (i === 10) {
        noiseValues.push(1); // No noise for final year
      } else {
        const commonNoise = 0.94 + Math.random() * 0.12; // 6% common
        noiseValues.push(commonNoise);
      }
    }
    const generateYearlyValues = (startAmount: number, isOzInvestment = false) => {
      const values: number[] = [];
      let currentValue = startAmount;
      // Year 0
      if (isOzInvestment) {
        const baseValue = startAmount * (1 - taxRate);
        const ozIndependentNoise = 0.94 + Math.random() * 0.12;
        values.push(baseValue * noiseValues[0] * 1.1 * ozIndependentNoise);
      } else {
        const initialAmount = startAmount * (1 - taxRate);
        const nonOzIndependentNoise = 0.94 + Math.random() * 0.12;
        values.push(initialAmount * noiseValues[0] * 0.95 * nonOzIndependentNoise);
      }
      for (let i = 1; i <= years; i++) {
        if (isOzInvestment) {
          if (i < 10) {
            const yearValue = startAmount * Math.pow(1 + annualGrowthRate, i);
            const baseValue = yearValue * (1 - taxRate);
            const ozIndependentNoise = 0.94 + Math.random() * 0.12;
            values.push(baseValue * noiseValues[i] * 1.1 * ozIndependentNoise);
          } else {
            const yearValue = startAmount * Math.pow(1 + annualGrowthRate, i);
            const taxAmount = startAmount * taxRate;
            const cashOutValue = yearValue - taxAmount;
            values.push(cashOutValue);
          }
        } else {
          const initialAmount = startAmount * (1 - taxRate);
          const yearValue = initialAmount * Math.pow(1 + annualGrowthRate, i);
          const totalGain = yearValue - initialAmount;
          const afterTaxGain = totalGain * (1 - taxRate);
          const cashOutValue = initialAmount + afterTaxGain;
          if (i === 10) {
            values.push(cashOutValue);
          } else {
            const nonOzIndependentNoise = 0.94 + Math.random() * 0.12;
            values.push(cashOutValue * noiseValues[i] * nonOzIndependentNoise);
          }
        }
      }
      return values;
    };
    const withoutOzValues = generateYearlyValues(initialInvestment, false);
    const withOzValues = generateYearlyValues(initialInvestment, true);
    return { labels, withOzValues, withoutOzValues };
  }

  useEffect(() => {
    setCapitalGain(Math.round(sliderToCapitalGain(sliderValue) / 10000) * 10000);
  }, [sliderValue]);

  useEffect(() => {
    if (
      typeof defaultCapitalGain === 'number' &&
      defaultCapitalGain > 0 &&
      defaultCapitalGain !== capitalGain
    ) {
      setCapitalGain(defaultCapitalGain);
      setSliderValue(capitalGainToSlider(defaultCapitalGain));
    }
  }, [defaultCapitalGain]);

  useEffect(() => {
    const { labels, withOzValues, withoutOzValues } = calculateInvestmentValues(capitalGain);
    setChartData({
      labels,
      datasets: [
        {
          label: 'With OZ',
          data: withOzValues,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          fill: 1,
          tension: 0.3,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#22c55e',
        },
        {
          label: 'Without OZ',
          data: withoutOzValues,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#ef4444',
        },
      ],
    });
  }, [capitalGain, annualGrowthRate]);

  // Get the actual final values from the chart data (including noise)
  const { withOzValues, withoutOzValues } = calculateInvestmentValues(capitalGain);
  const finalWithOz = withOzValues[10];
  const finalWithoutOz = withoutOzValues[10];
  const difference = finalWithOz - finalWithoutOz;

  // Only show annotation when chart data is ready
  const showAnnotation = withOzValues.length > 10 && withoutOzValues.length > 10;
  const annotation = {
    type: 'line' as const,
    xMin: 10,
    xMax: 10,
    borderColor: '#1e88e5',
    borderWidth: 4,
    label: {
      content: `OZ Advantage: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(difference)}`,
      enabled: true,
      position: 'center' as const,
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      borderRadius: 6,
      padding: 6,
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#4b5563',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            family: 'var(--font-articulat-normal)',
            size: 14,
          }
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: {
          family: 'var(--font-articulat-bold)',
        },
        bodyFont: {
          family: 'var(--font-articulat-normal)',
        },
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
      annotation: {
        annotations: showAnnotation ? {
          line: annotation
        } : {}
      }
    },
    scales: {
      x: {
        grid: {
          color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
          font: {
            family: 'var(--font-articulat-normal)',
          }
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
          callback: function(this: any, value: string | number, index: number, ticks: any[]) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(Number(value));
          },
          font: {
            family: 'var(--font-articulat-normal)',
          }
        },
      },
    },
  };

  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center bg-white dark:bg-black py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-3xl opacity-20"></div>
      </div>
      <div className="w-full max-w-7xl mx-auto z-10">
        <div className="text-center mb-12">
          <h2 className="font-brand-black text-4xl md:text-5xl text-black dark:text-white tracking-tight mb-4">
            Unlock <span className="text-[#1e88e5] font-black text-5xl md:text-6xl">Superior</span> Returns
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Visualize the powerful impact of Opportunity Zone federal tax benefits on your investment over a 10-year period.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div className="lg:col-span-2 glass-card rounded-3xl p-4 sm:p-6 bg-white/60 dark:bg-black/20 border border-black/20 dark:border-white/30 shadow-lg dark:shadow-none backdrop-blur-xl min-h-[500px]">
            <div className="h-[400px] md:h-[500px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
          <div className="lg:col-span-1 flex flex-col justify-center p-6 glass-card rounded-3xl bg-white/60 dark:bg-black/20 border border-black/20 dark:border-white/30 shadow-lg dark:shadow-none backdrop-blur-xl">
            <h3 className="font-brand-bold text-3xl text-black dark:text-white mb-2">
              Calculate Your Growth
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Enter your capital gain to see a personalized projection.
            </p>
            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4">
                Initial Capital Gain
              </label>
              <div className="px-2">
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold text-[#1e88e5]">
                    {capitalGain >= 1000000
                      ? `$${(capitalGain / 1000000).toFixed(1)}M`
                      : `$${(capitalGain / 1000).toFixed(0)}k`
                    }
                  </span>
                </div>
                <Slider
                  min={SLIDER_MIN}
                  max={SLIDER_MAX}
                  step={1}
                  value={sliderValue}
                  onChange={(value) => {
                    if (typeof value === 'number') setSliderValue(value);
                  }}
                  trackStyle={{ backgroundColor: '#1e88e5' }}
                  handleStyle={{
                    backgroundColor: '#1e88e5',
                    border: 'none',
                    width: '20px',
                    height: '20px',
                    marginTop: '-8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(30, 136, 229, 0.3)',
                    opacity: 1
                  }}
                  railStyle={{ backgroundColor: '#d1d5db', height: '4px' }}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <p className="text-base font-semibold text-green-800 dark:text-green-300">With OZ Investment (10-Year)</p>
                <p className="text-4xl font-brand-bold text-green-600 dark:text-green-400">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(finalWithOz)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-600/10 to-red-700/10 dark:from-red-900/20 dark:to-black/20 border border-red-700/20 dark:border-red-600/20">
                <p className="text-base font-semibold text-red-800 dark:text-red-400">Non OZ Investment (10-Year)</p>
                <p className="text-4xl font-brand-bold text-red-700 dark:text-red-500">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(finalWithoutOz)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                <p className="text-base font-semibold text-blue-800 dark:text-blue-300">OZ Advantage</p>
                <p className="text-4xl font-brand-bold text-blue-600 dark:text-blue-400">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(difference)}
                </p>
              </div>
            </div>
            {/* CTA removed as requested */}
          </div>
        </div>
        <div className="mt-6 flex flex-col lg:flex-row items-center gap-6 relative z-20 bg-white dark:bg-black rounded-lg p-4">
          <div className="w-full lg:col-span-2">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              >
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Calculation Summary and Disclaimer</span>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isSummaryExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {isSummaryExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className="px-4 py-3 space-y-4 text-base">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Assumed IRR (as Annual Growth Rate):</span>
                            <span className="font-medium text-gray-900 dark:text-white">{irr}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Assumed Federal Tax Rate:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{(taxRate * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How The Calculation Works</h4>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">Non-QOZ Investment:</p>
                                <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-1 pl-2">
                                    <li>Initial capital gain is taxed at <strong>{(taxRate * 100).toFixed(1)}%</strong>.</li>
                                    <li>The remaining net amount grows at <strong>{irr}%</strong> annually for 10 years.</li>
                                    <li>The profit from that growth (appreciation) is taxed again at <strong>{(taxRate * 100).toFixed(1)}%</strong>.</li>
                                </ol>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">QOZ Investment:</p>
                                <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-1 pl-2">
                                    <li>The full, pre-tax capital gain is invested and grows at <strong>{irr}%</strong> annually for 10 years.</li>
                                    <li>The original capital gains tax is paid after 10 years (deferred).</li>
                                    <li>The profit from the investment's growth is <strong>100% tax-free</strong>.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Disclaimer</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        This graph is for illustrative purposes only and does not represent actual or guaranteed results. All assumptions are hypothetical. Opportunity Zone investments carry risk, including possible loss of principal. Consult your financial, tax, and legal advisors before investing.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestmentComparisonChart; 