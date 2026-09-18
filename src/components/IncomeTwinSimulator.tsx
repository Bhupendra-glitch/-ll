import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WorkerProfile, Language, SimulationParams, StressScenario } from '../types';
import { runMonteCarloTwinSimulation } from '../utils/simulation';
import {
  Sliders,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Zap,
  TrendingUp,
  Volume2,
  Sparkles,
  CloudRain,
  HeartPulse,
  Flame,
  HelpCircle,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';

interface IncomeTwinSimulatorProps {
  profile: WorkerProfile;
  currentLanguage: Language;
  onOpenMatchedLoans: () => void;
  onTriggerVoiceNarration: (loanAmount: number) => void;
}

export const IncomeTwinSimulator: React.FC<IncomeTwinSimulatorProps> = ({
  profile,
  currentLanguage,
  onOpenMatchedLoans,
  onTriggerVoiceNarration,
}) => {
  const [principal, setPrincipal] = useState<number>(35000);
  const [tenureMonths, setTenureMonths] = useState<number>(6);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [stressScenario, setStressScenario] = useState<StressScenario['id']>('baseline');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Run Monte Carlo twin simulation
  const simulationParams: SimulationParams = useMemo(
    () => ({
      principal,
      tenureMonths,
      frequency,
      interestRateAnnual: 12.0, // Standard formal micro-loan rate
      stressScenario,
    }),
    [principal, tenureMonths, frequency, stressScenario]
  );

  const result = useMemo(
    () => runMonteCarloTwinSimulation(profile, simulationParams),
    [profile, simulationParams]
  );

  // Render animated Monte Carlo trajectories on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI screens
    const width = canvas.parentElement?.clientWidth || 600;
    const height = 240;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Grid styling
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let y = 40; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }

    // Zero / Breach threshold line
    const zeroY = height - 45;
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(40, zeroY);
    ctx.lineTo(width - 20, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#f43f5e';
    ctx.font = '10px monospace';
    ctx.fillText('CRITICAL LIQUIDITY BUFFER (₹0 RESERVE)', 45, zeroY - 6);

    // Plot Monte Carlo paths
    const paths = result.simulatedPaths;
    const days = 60;
    const stepX = (width - 70) / days;

    // Find min and max for scaling
    let maxVal = profile.monthlyNetSurplus * 2.2;
    let minVal = -profile.monthlyNetSurplus * 0.4;

    function scaleY(val: number) {
      const normalized = (val - minVal) / (maxVal - minVal);
      return height - 35 - normalized * (height - 60);
    }

    // Draw stochastic fan
    paths.forEach((path) => {
      ctx.beginPath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = path.isBreached
        ? 'rgba(244, 63, 94, 0.25)' // Red if breached
        : 'rgba(16, 185, 129, 0.22)'; // Green if safe

      path.points.forEach((pt, idx) => {
        const x = 45 + idx * stepX;
        const y = scaleY(pt);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    // Draw median (P50) highlighted thick curve
    if (paths.length > 0) {
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#10b981'; // Emerald
      ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
      ctx.shadowBlur = 8;

      const medianPath = paths[0]; // representative median
      medianPath.points.forEach((pt, idx) => {
        const x = 45 + idx * stepX;
        const y = scaleY(pt);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }

    // Draw Day markers
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText('Day 1', 45, height - 10);
    ctx.fillText('Day 30', 45 + 30 * stepX - 15, height - 10);
    ctx.fillText('Day 60 (Twin Horizon)', width - 140, height - 10);
  }, [result, profile]);

  const texts = {
    en: {
      tag: 'WOW FEATURE • PATENTED SIMULATION',
      title: 'Income Twin™ — Live Cashflow Stress Simulator',
      subtitle:
        'Drag loan amount & tenure to test 1,000 Monte Carlo stochastic cashflow paths before borrowing.',
      sliderAmount: 'Simulate Loan Principal',
      sliderTenure: 'Repayment Tenure',
      frequencyLabel: 'Repayment Mode',
      dailyMode: 'Daily Auto-Debit (UPI AutoPay)',
      weeklyMode: 'Weekly Debit',
      monthlyMode: 'Monthly ECS',
      scenariosTitle: 'Stress Test Scenarios (What-If Shock Analysis)',
      baseline: 'Normal Season',
      baselineDesc: 'Steady regular order flow & typical customer tips',
      monsoon: 'Monsoon Slump (-25%)',
      monsoonDesc: 'Heavy rain flooding & localized transport slowdown',
      health: 'Medical Shock (₹8,500)',
      healthDesc: 'Sudden out-of-pocket clinic or family medical expense',
      festive: 'Diwali Surge (+35%)',
      festiveDesc: 'Peak festive gifting, surge pay, and customer bonuses',
      defaultRisk: 'Default Probability',
      liquidityBuffer: 'Net Cashflow Buffer Remaining',
      safeBorrowingZone: 'Safe Borrowing Zone',
      formalEmi: 'Calculated Micro-Repayment',
      interestSavedTitle: 'Total Interest Saved vs Moneylender',
      applyButton: 'View Matched Formal Micro-Loans',
      voiceExplainButton: 'Narrate Income Twin by Voice',
    },
    hi: {
      tag: 'विशेष फीचर • लाइव डिजिटल ट्विन',
      tagline: 'इनकम ट्विन™ — भविष्य की आय का लाइव सिमुलेटर',
      title: 'इनकम ट्विन™ — लाइव कैशफ़्लो तनाव सिमुलेटर',
      subtitle:
        'ऋण लेने से पहले 1,000 अलग-अलग परिस्थितियों में अपनी आय और बचत की सुरक्षा की तुरंत जाँच करें।',
      sliderAmount: 'लोन राशि चुनें',
      sliderTenure: 'लोन की अवधि',
      frequencyLabel: 'किस्त चुकाने का तरीका',
      dailyMode: 'रोज़ाना छोटी किस्त (UPI ऑटोपे)',
      weeklyMode: 'साप्ताहिक किस्त',
      monthlyMode: 'मासिक किस्त',
      scenariosTitle: 'कठिन परिस्थिति की जाँच (What-If विश्लेषण)',
      baseline: 'सामान्य स्थिति',
      baselineDesc: 'नियमित ऑर्डर और स्थिर आय',
      monsoon: 'भारी बारिश मंदी (-25%)',
      monsoonDesc: 'जलभराव और ऑर्डर में अस्थायी कमी',
      health: 'स्वास्थ्य आपातकाल (₹8,500)',
      healthDesc: 'अचानक अस्पताल या दवाई का अतिरिक्त खर्च',
      festive: 'त्योहारी कमाई (+35%)',
      festiveDesc: 'दिवाली पर अतिरिक्त टिप्स और इनसेंटिव',
      defaultRisk: 'डिफ़ॉल्ट या बाउंस जोखिम',
      liquidityBuffer: 'खर्च के बाद बची हुई शुद्ध बचत',
      safeBorrowingZone: 'ऋण सुरक्षा स्तर',
      formalEmi: 'आसान दैनिक/मासिक किस्त',
      interestSavedTitle: 'साहूकार की तुलना में ब्याज की कुल बचत',
      applyButton: 'अनुमोदित औपचारिक लोन देखें',
      voiceExplainButton: 'आवाज़ में समझें (Hindi Audio)',
    },
    ta: {
      tag: 'முக்கிய அம்சம் • லைவ் டிஜிட்டல் ட்வின்',
      title: 'இன்கம் ட்வின்™ — லைவ் பணப்புழக்க சிமுலேட்டர்',
      subtitle:
        'கடன் பெறுவதற்கு முன் உங்கள் எதிர்கால வருமானம் மற்றும் சேமிப்பை 1,000 சூழ்நிலைகளில் உருவகப்படுத்துங்கள்.',
      sliderAmount: 'தேவையான கடன் தொகை',
      sliderTenure: 'திருப்பிச் செலுத்தும் காலம்',
      frequencyLabel: 'தவணை முறை',
      dailyMode: 'தினசரி சிறிய தவணை (UPI ஆட்டோபே)',
      weeklyMode: 'வாராந்திர தவணை',
      monthlyMode: 'மாதாந்திர தவணை',
      scenariosTitle: 'நெருக்கடி சோதனை (What-If சூழ்நிலைகள்)',
      baseline: 'வழக்கமான காலம்',
      baselineDesc: 'சீரான வருமானம் மற்றும் வாடிக்கையாளர் ஆர்டர்கள்',
      monsoon: 'மழைக்கால மந்தநிலை (-25%)',
      monsoonDesc: 'கனமழை காரணமாக சவாரிகள் குறைவது',
      health: 'மருத்துவ அவசரம் (₹8,500)',
      healthDesc: 'திடீர் மருத்துவ செலவு',
      festive: 'பண்டிகை கால உயர்வு (+35%)',
      festiveDesc: 'தீபாவளி/பொங்கல் சிறப்பு வருமானம்',
      defaultRisk: 'கடன் திருப்பிச் செலுத்த முடியாத ஆபத்து',
      liquidityBuffer: 'தவணைக்கு பின் மிஞ்சும் சேமிப்பு',
      safeBorrowingZone: 'பாதுகாப்பான கடன் நிலை',
      formalEmi: 'கணக்கிடப்பட்ட தவணைத் தொகை',
      interestSavedTitle: 'கந்துவட்டியுடன் ஒப்பிடும்போது சேமிப்பு',
      applyButton: 'பொருத்தமான வங்கிக் கடன்களைக் காண்க',
      voiceExplainButton: 'குரல் வழியே விளக்கம் கேளுங்கள்',
    },
  }[currentLanguage];

  const safeZoneBadgeClass =
    result.safeZone === 'OPTIMAL'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : result.safeZone === 'MODERATE'
      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
      : result.safeZone === 'CAUTION'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

  return (
    <div id="income-twin-simulator-section" className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Background neon ambient highlight */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[11px] mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {texts.tag}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            {texts.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">{texts.subtitle}</p>
        </div>

        {/* Voice Narrator Button */}
        <button
          id="btn-narrate-income-twin"
          onClick={() => onTriggerVoiceNarration(principal)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900/90 text-purple-200 border border-purple-700/60 font-medium text-xs transition-all cursor-pointer shadow-lg shadow-purple-950/40"
        >
          <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>{texts.voiceExplainButton}</span>
        </button>
      </div>

      {/* Interactive Controls & Canvas 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders & Scenarios (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800">
          {/* Slider 1: Loan Principal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                {texts.sliderAmount}
              </label>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">
                ₹{principal.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              id="slider-loan-principal"
              min={5000}
              max={150000}
              step={5000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            {/* Quick buttons */}
            <div className="flex items-center justify-between gap-1.5 mt-2">
              {[20000, 35000, 50000, 75000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setPrincipal(amt)}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                    principal === amt
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ₹{amt / 1000}k
                </button>
              ))}
            </div>
          </div>

          {/* Slider 2: Tenure Months */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                {texts.sliderTenure}:
              </label>
              <span className="text-sm font-bold text-cyan-400 font-mono">
                {tenureMonths} Months ({Math.round(tenureMonths * 30)} Days)
              </span>
            </div>
            <input
              type="range"
              id="slider-loan-tenure"
              min={3}
              max={18}
              step={1}
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-1">
              <span>3 Mos</span>
              <span>6 Mos</span>
              <span>12 Mos</span>
              <span>18 Mos</span>
            </div>
          </div>

          {/* Frequency Mode */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              {texts.frequencyLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="freq-daily"
                onClick={() => setFrequency('daily')}
                className={`p-2 rounded-lg text-xs font-medium text-center border transition-all cursor-pointer ${
                  frequency === 'daily'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold">Daily</div>
                <div className="text-[10px] opacity-75">Auto-Debit</div>
              </button>

              <button
                id="freq-weekly"
                onClick={() => setFrequency('weekly')}
                className={`p-2 rounded-lg text-xs font-medium text-center border transition-all cursor-pointer ${
                  frequency === 'weekly'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold">Weekly</div>
                <div className="text-[10px] opacity-75">Auto-Debit</div>
              </button>

              <button
                id="freq-monthly"
                onClick={() => setFrequency('monthly')}
                className={`p-2 rounded-lg text-xs font-medium text-center border transition-all cursor-pointer ${
                  frequency === 'monthly'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold">Monthly</div>
                <div className="text-[10px] opacity-75">Standard ECS</div>
              </button>
            </div>
          </div>

          {/* Stress Scenarios (What-If Shock Analysis) */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              {texts.scenariosTitle}
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setStressScenario('baseline')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  stressScenario === 'baseline'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {texts.baseline}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                  {texts.baselineDesc}
                </div>
              </button>

              <button
                onClick={() => setStressScenario('monsoon_slump')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  stressScenario === 'monsoon_slump'
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-cyan-400" />
                  {texts.monsoon}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                  {texts.monsoonDesc}
                </div>
              </button>

              <button
                onClick={() => setStressScenario('health_emergency')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  stressScenario === 'health_emergency'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1">
                  <HeartPulse className="w-3 h-3 text-rose-400" />
                  {texts.health}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                  {texts.healthDesc}
                </div>
              </button>

              <button
                onClick={() => setStressScenario('festive_boom')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  stressScenario === 'festive_boom'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  {texts.festive}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                  {texts.festiveDesc}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Monte Carlo Canvas & Stress Metrics (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Top Live Risk Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Safe Zone Badge */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400 uppercase font-mono">{texts.safeBorrowingZone}</div>
              <div className="mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold border inline-block ${safeZoneBadgeClass}`}>
                  {result.safeZoneLabel[currentLanguage] || result.safeZone}
                </span>
              </div>
            </div>

            {/* Default Probability */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-mono">{texts.defaultRisk}</div>
              <div className="text-lg font-extrabold text-white mt-0.5 flex items-baseline gap-1">
                <span className={result.defaultProbability > 15 ? 'text-rose-400' : 'text-emerald-400'}>
                  {result.defaultProbability}%
                </span>
                <span className="text-[10px] text-slate-500 font-normal">(1k runs)</span>
              </div>
            </div>

            {/* Liquidity Buffer */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-mono">{texts.liquidityBuffer}</div>
              <div className="text-lg font-extrabold text-cyan-400 mt-0.5">
                {result.cashflowBufferRemaining}%
              </div>
            </div>

            {/* Calculated EMI */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-mono">{texts.formalEmi}</div>
              <div className="text-lg font-extrabold text-amber-400 mt-0.5">
                ₹{result.emiAmount.toLocaleString('en-IN')}
                <span className="text-[10px] text-slate-400 font-normal">
                  /{frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'wk' : 'mo'}
                </span>
              </div>
            </div>
          </div>

          {/* Monte Carlo Visual Canvas */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 relative">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-[11px] flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Stochastic Cashflow Fan (1,000 Monte Carlo Paths)
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                Green = Positive Surplus • Red = Liquidity Breach
              </span>
            </div>

            <canvas
              ref={canvasRef}
              className="w-full h-48 sm:h-56 block rounded-lg bg-slate-950/60"
            />
          </div>

          {/* Bottom Interest Saved & Action Bar */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-slate-900 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider font-mono">
                  {texts.interestSavedTitle}
                </div>
                <div className="text-lg font-black text-white">
                  ₹{result.interestSaved.toLocaleString('en-IN')} Saved in Interest!
                </div>
              </div>
            </div>

            <button
              id="btn-view-matched-loans"
              onClick={onOpenMatchedLoans}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs tracking-wide uppercase transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{texts.applyButton}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
