import React from 'react';
import { WorkerProfile, Language, ShapFeature } from '../types';
import {
  TrendingUp,
  ShieldCheck,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react';

interface CashflowScoreCardProps {
  profile: WorkerProfile;
  currentLanguage: Language;
}

export const CashflowScoreCard: React.FC<CashflowScoreCardProps> = ({
  profile,
  currentLanguage,
}) => {
  const { cashflowScore, shapFeatures, riskTier, confidenceScore } = profile;

  // Calculate gauge angle (300 - 900 mapped to -90 to +90 deg or stroke dashoffset)
  const normalizedScore = Math.max(0, Math.min(1, (cashflowScore - 300) / 600));
  const strokeDash = normalizedScore * 283; // Circumference of radius 45 is 2 * PI * 45 = 282.7

  const texts = {
    en: {
      title: 'Explainable Cashflow Score',
      subtitle: 'Trained on 4.2M anonymized UPI gig transactions via Vertex AI XGBoost',
      cibilComparison: 'Traditional CIBIL Score: Inactive / No Formal History',
      primeBadge: 'Prime Gig Tier (Formal Lending Approved)',
      confidence: `Confidence: ${confidenceScore}%`,
      shapTitle: 'SHAP Explainability Waterfall ("Why This Score")',
      shapSubtitle: 'Vertex Explainable AI transparent feature attribution (No black box)',
      positiveImpact: 'Positive Score Drivers (+pts)',
      negativeImpact: 'Areas for Improvement (-pts)',
      informalVsFormal: 'Formal Credit vs Informal Moneylender Savings',
      informalRate: '48% APR Informal Moneylender',
      formalRate: '11.8% APR Formal Gig Loan',
      youSave: 'You Save ~₹18,400 in Interest',
      dnaTitle: 'UPI Cashflow DNA Metrics',
      inflowVelocity: 'Daily Inflow Velocity',
      consistencyIndex: 'Daily Active Consistency',
      liquidReserve: 'Liquid Reserve Cushion',
      bounceRate: 'Autopay Bounce Rate',
    },
    hi: {
      title: 'पारदर्शी कैशफ़्लो क्रेडिट स्कोर',
      subtitle: 'वर्टेक्स AI द्वारा 42 लाख UPI लेन-देन पर प्रशिक्षित सटीक स्कोर',
      cibilComparison: 'पारंपरिक सिबिल (CIBIL): कोई रिकॉर्ड नहीं / शून्य स्कोर',
      primeBadge: 'प्राइम गिग श्रेणी (बैंक लोन स्वीकृत)',
      confidence: `सटीकता: ${confidenceScore}%`,
      shapTitle: 'SHAP पारदर्शी विश्लेषण ("यह स्कोर क्यों मिला")',
      shapSubtitle: 'वर्टेक्स एक्सप्लेनेबल AI - हर अंक का स्पष्ट कारण, कोई छुपाव नहीं',
      positiveImpact: 'सकारात्मक प्रभाव (+अंक)',
      negativeImpact: 'सुधार के बिंदु (-अंक)',
      informalVsFormal: 'बैंक लोन बनाम साहूकार के ब्याज में अंतर',
      informalRate: '48% वार्षिक साहूकार का भारी ब्याज',
      formalRate: '11.8% वार्षिक सरकारी/बैंक ब्याज',
      youSave: 'आप बचाते हैं ~₹18,400 ब्याज में',
      dnaTitle: 'UPI कैशफ़्लो डीएनए मेट्रिक्स',
      inflowVelocity: 'औसत दैनिक कमाई',
      consistencyIndex: 'मासिक सक्रियता दर',
      liquidReserve: 'नकदी रिज़र्व सुरक्षा',
      bounceRate: 'बाउंस या डिफ़ॉल्ट दर',
    },
    ta: {
      title: 'வெளிப்படையான பணப்புழக்க கிரெடிட் ஸ்கோர்',
      subtitle: 'வூர்டெக்ஸ் AI மூலம் பகுப்பாய்வு செய்யப்பட்ட நம்பகமான மதிப்பீடு',
      cibilComparison: 'வழக்கமான CIBIL: முந்தைய வரலாறு இல்லை',
      primeBadge: 'பிரைம் கிக் நிலை (கடன் ஒப்புதல் வழங்கப்பட்டது)',
      confidence: `நம்பகத்தன்மை: ${confidenceScore}%`,
      shapTitle: 'SHAP விளக்கக் காரணி ("ஸ்கோருக்கான காரணம்")',
      shapSubtitle: 'ஒவ்வொரு மதிப்பெண்ணுக்கும் வெளிப்படையான ஆதாரம்',
      positiveImpact: 'ஸ்கோரை உயர்த்திய காரணிகள் (+புள்ளிகள்)',
      negativeImpact: 'மேம்படுத்த வேண்டிய பகுதிகள் (-புள்ளிகள்)',
      informalVsFormal: 'வங்கி கடன் vs கந்துவட்டி சேமிப்பு',
      informalRate: '48% கந்துவட்டி விகிதம்',
      formalRate: '11.8% வங்கி அங்கீகரிக்கப்பட்ட கடன்',
      youSave: 'சுமார் ₹18,400 வட்டி மிச்சமாகிறது',
      dnaTitle: 'UPI பணவரவு அளவீடுகள்',
      inflowVelocity: 'தினசரி வருமான வேகம்',
      consistencyIndex: 'தொடர்ச்சியான உழைப்பு',
      liquidReserve: 'பாதுகாப்பு சேமிப்பு',
      bounceRate: 'பவுன்ஸ் ஆகாத பதிவுகள்',
    },
  }[currentLanguage];

  const positiveShaps = shapFeatures.filter((f) => f.type === 'positive');
  const negativeShaps = shapFeatures.filter((f) => f.type === 'negative');

  return (
    <div id="cashflow-score-section" className="space-y-4">
      {/* Top Banner: Formal vs Informal Moneylender Savings Comparison */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold">
              {texts.informalVsFormal}
            </div>
            <div className="text-base sm:text-lg font-extrabold text-white flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-emerald-300">{texts.formalRate}</span>
              <span className="text-xs text-slate-400 line-through">vs {texts.informalRate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-center sm:text-right">
          <div>
            <div className="text-[11px] text-emerald-300 font-medium">{texts.youSave}</div>
            <div className="text-xs text-slate-400">Zero predatory collateral, zero physical visits</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Score Gauge + SHAP Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Score Gauge & Key Metrics (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                {texts.title}
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {texts.confidence}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6">{texts.subtitle}</p>

            {/* Circular SVG Gauge */}
            <div className="flex flex-col items-center justify-center my-2 relative">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                {/* Score circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#emerald-gradient)"
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283 - strokeDash}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Gauge Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {cashflowScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">out of 900</span>
                <span className="mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {texts.primeBadge}
                </span>
              </div>
            </div>

            <div className="text-center mt-3 text-xs text-amber-300/90 font-medium bg-amber-500/10 border border-amber-500/20 rounded-lg py-1.5 px-3">
              {texts.cibilComparison}
            </div>
          </div>

          {/* DNA 4-Grid Metrics */}
          <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-slate-800">
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-mono">{texts.inflowVelocity}</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                ₹{Math.round(profile.monthlyAvgInflow / 30).toLocaleString('en-IN')}/day
              </div>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-mono">{texts.consistencyIndex}</div>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">
                {profile.dailyActiveDays} / 30 Days (90%)
              </div>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-mono">{texts.liquidReserve}</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">
                ₹{profile.monthlyNetSurplus.toLocaleString('en-IN')} (40%)
              </div>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-mono">{texts.bounceRate}</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                0.0% (Zero)
              </div>
            </div>
          </div>
        </div>

        {/* Right: SHAP Feature Attribution Waterfall (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                {texts.shapTitle}
              </h3>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                Vertex Explainable AI
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-5">{texts.shapSubtitle}</p>

            {/* Positive contributors */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {texts.positiveImpact}
              </div>

              <div className="space-y-2.5">
                {positiveShaps.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-950/80 border border-emerald-950/60 rounded-xl hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-200">
                        {item.vernacularName[currentLanguage] || item.name}
                      </span>
                      <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        +{item.impact} pts
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, item.impact * 2)}%` }}
                      ></div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      {item.description[currentLanguage] || item.description.en}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Negative contributors / improvement */}
            {negativeShaps.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {texts.negativeImpact}
                </div>

                <div className="space-y-2.5">
                  {negativeShaps.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-950/80 border border-rose-950/60 rounded-xl hover:border-rose-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-200">
                          {item.vernacularName[currentLanguage] || item.name}
                        </span>
                        <span className="text-xs font-mono font-extrabold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                          {item.impact} pts
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1.5 overflow-hidden">
                        <div
                          className="bg-rose-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, Math.abs(item.impact) * 3)}%` }}
                        ></div>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        {item.description[currentLanguage] || item.description.en}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Model: Vertex AI XGBoost v2.8 (SHAP TreeExplainer)</span>
            <span className="text-emerald-400 font-semibold">100% Deterministic & Auditable</span>
          </div>
        </div>
      </div>
    </div>
  );
};
