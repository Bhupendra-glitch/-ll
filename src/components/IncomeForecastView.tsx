import React, { useState } from 'react';
import { WorkerProfile, Language, ForecastHorizon } from '../types';
import { Calendar, TrendingUp, Sparkles, BarChart2, Zap, CloudSun } from 'lucide-react';

interface IncomeForecastViewProps {
  profile: WorkerProfile;
  currentLanguage: Language;
}

export const IncomeForecastView: React.FC<IncomeForecastViewProps> = ({
  profile,
  currentLanguage,
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<30 | 60 | 90>(30);

  const forecastData: ForecastHorizon =
    selectedHorizon === 30
      ? profile.forecast30
      : selectedHorizon === 60
      ? profile.forecast60
      : profile.forecast90;

  const texts = {
    en: {
      title: 'Vertex AI Income Forecasting (30 / 60 / 90 Days)',
      subtitle: 'Probabilistic future cashflow projections using Vertex AI AutoML Forecasting',
      horizon30: '30-Day Outlook',
      horizon60: '60-Day Midterm',
      horizon90: '90-Day Longterm',
      expectedEarnings: 'Expected Total (P50)',
      downsideFloor: 'Downside Floor (P10)',
      surgeCeiling: 'Surge Potential (P90)',
      surgeDrivers: 'Identified Seasonal & Event Drivers',
      dailyTrajectory: 'Daily Cashflow Uncertainty Cone (P10 - P50 - P90 Bands)',
      weekendMultiplier: 'Weekend Volume Surcharge: +35% order value on Fri-Sun',
    },
    hi: {
      title: 'वर्टेक्स AI भविष्य की कमाई का अनुमान (30 / 60 / 90 दिन)',
      subtitle: 'वर्टेक्स AI द्वारा मौसम, त्योहार और पिछले रिकॉर्ड पर आधारित आय का अनुमान',
      horizon30: '30-दिन का नज़रिया',
      horizon60: '60-दिन का अनुमान',
      horizon90: '90-दिन का दीर्घावधि',
      expectedEarnings: 'अनुमानित कुल कमाई (P50)',
      downsideFloor: 'न्यूनतम सुरक्षित कमाई (P10)',
      surgeCeiling: 'अधिकतम कमाई क्षमता (P90)',
      surgeDrivers: 'पहचाने गए त्योहारी व मौसमी कारण',
      dailyTrajectory: 'दैनिक आमदनी का उतार-चढ़ाव (P10 - P50 - P90 सीमाएं)',
      weekendMultiplier: 'सप्ताहांत (शुक्र-रवि): 35% अतिरिक्त डिलीवरी ऑर्डर',
    },
    ta: {
      title: 'வூர்டெக்ஸ் AI வருமான முன்னறிவிப்பு (30 / 60 / 90 நாட்கள்)',
      subtitle: 'பண்டிகைகள் மற்றும் வானிலை அடிப்படையில் எதிர்கால வருமானக் கணிப்பு',
      horizon30: '30-நாள் முன்னறிவிப்பு',
      horizon60: '60-நாள் பார்வை',
      horizon90: '90-நாள் நீண்ட பார்வை',
      expectedEarnings: 'எதிர்பார்க்கப்படும் வருமானம் (P50)',
      downsideFloor: 'குறைந்தபட்ச வருமானம் (P10)',
      surgeCeiling: 'அதிகபட்ச உச்ச வருமானம் (P90)',
      surgeDrivers: 'கண்டறியப்பட்ட பருவ கால காரணிகள்',
      dailyTrajectory: 'தினசரி வருமான போக்கு (P10 - P50 - P90 பட்டைகள்)',
      weekendMultiplier: 'வார இறுதி கூடுதல் சவாரிகள்: வெள்ளி-ஞாயிறு +35% வருமானம்',
    },
  }[currentLanguage];

  // Slice points for display
  const displayTrend = forecastData.dailyTrend.slice(0, selectedHorizon === 30 ? 30 : selectedHorizon === 60 ? 30 : 30);
  const maxDayVal = Math.max(...displayTrend.map((d) => d.p90));

  return (
    <div id="income-forecast-section" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Title & Horizon Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">{texts.title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{texts.subtitle}</p>
        </div>

        {/* Horizon Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedHorizon(30)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              selectedHorizon === 30
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {texts.horizon30}
          </button>
          <button
            onClick={() => setSelectedHorizon(60)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              selectedHorizon === 60
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {texts.horizon60}
          </button>
          <button
            onClick={() => setSelectedHorizon(90)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              selectedHorizon === 90
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {texts.horizon90}
          </button>
        </div>
      </div>

      {/* Top 3 Metric Blocks: P10, P50, P90 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* P10 Downside */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] font-mono text-slate-400 uppercase">{texts.downsideFloor}</div>
          <div className="text-xl sm:text-2xl font-black text-slate-300 mt-1">
            ₹{forecastData.totalP10.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            90% confidence earnings will not drop below this even in weather slumps.
          </p>
        </div>

        {/* P50 Expected */}
        <div className="bg-slate-950/80 border border-cyan-500/40 p-4 rounded-xl shadow-md shadow-cyan-950/20">
          <div className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
            {texts.expectedEarnings}
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-1">
            ₹{forecastData.totalP50.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-cyan-400/80 mt-1">
            Most probable revenue trajectory under standard working hours.
          </p>
        </div>

        {/* P90 Ceiling */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] font-mono text-emerald-400 uppercase">{texts.surgeCeiling}</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
            ₹{forecastData.totalP90.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1">
            Attainable during holiday delivery sprints and cricket match peak hours.
          </p>
        </div>
      </div>

      {/* Daily Cashflow Forecast Chart */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="font-semibold text-slate-200">{texts.dailyTrajectory}</span>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> P90 High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> P50 Expected
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span> P10 Floor
            </span>
          </div>
        </div>

        {/* Simple Bar Visualization */}
        <div className="h-40 flex items-end gap-1 sm:gap-1.5 pt-4 pb-1 overflow-x-auto scrollbar-none">
          {displayTrend.map((d, i) => {
            const p90Height = Math.round((d.p90 / maxDayVal) * 100);
            const p50Height = Math.round((d.p50 / maxDayVal) * 100);
            const p10Height = Math.round((d.p10 / maxDayVal) * 100);

            return (
              <div
                key={i}
                className="flex-1 min-w-[12px] flex flex-col items-center group relative cursor-pointer"
              >
                {/* Bar */}
                <div
                  className="w-full rounded-t transition-all bg-gradient-to-t from-cyan-900/60 via-cyan-500/50 to-emerald-400 group-hover:brightness-125"
                  style={{ height: `${p50Height}%` }}
                ></div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-slate-900 text-slate-100 text-[10px] p-2 rounded-lg border border-slate-700 shadow-xl z-20 whitespace-nowrap pointer-events-none">
                  <div className="font-bold text-cyan-300">{d.date}</div>
                  <div>Expected: ₹{d.p50.toLocaleString('en-IN')}</div>
                  <div className="text-slate-400">Range: ₹{d.p10} - ₹{d.p90}</div>
                  {d.eventNote && (
                    <div className="text-amber-400 font-semibold mt-0.5">{d.eventNote}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
          <span>{displayTrend[0]?.date || 'Day 1'}</span>
          <span>{texts.weekendMultiplier}</span>
          <span>{displayTrend[displayTrend.length - 1]?.date || 'End'}</span>
        </div>
      </div>

      {/* Surge Drivers & Factors */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 font-mono">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          {texts.surgeDrivers}:
        </span>
        {forecastData.surgeFactors.map((factor, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300"
          >
            {factor}
          </span>
        ))}
      </div>
    </div>
  );
};
