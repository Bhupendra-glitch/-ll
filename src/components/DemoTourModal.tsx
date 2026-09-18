import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Play, Award } from 'lucide-react';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep: (stepIndex: number) => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({ isOpen, onClose, onJumpToStep }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Step 1: Statement Ingestion & DLP Privacy Shield',
      time: '0:00 - 0:45',
      summary:
        'Upload raw UPI statement or select synthetic gig profiles (e.g. Rajesh - Zomato & Porter, Priya - Zepto rider, Ramesh - Chai QR tapri).',
      highlight:
        'Notice how Google Cloud DLP instantly redacts Aadhaar numbers, phone handles, and UPI VPAs before passing data to Vertex AI.',
      targetSelectorId: 'statement-uploader-card',
    },
    {
      title: 'Step 2: Explainable Cashflow Score & SHAP Waterfall',
      time: '0:45 - 1:30',
      summary:
        'Traditional CIBIL rejects gig workers due to lack of bureau history. GigCred calculates a 300-900 score using 27 active earning days, daily UPI velocity, and zero bounces.',
      highlight:
        'Inspect the SHAP Feature Attribution Waterfall: see exact +46 pts for regularity and -16 pts for fuel volatility.',
      targetSelectorId: 'cashflow-score-section',
    },
    {
      title: 'Step 3: Income Twin™ — Live Cashflow Stress Simulator',
      time: '1:30 - 2:20',
      summary:
        'The WOW Feature! Drag the loan principal and tenure sliders to watch 1,000 Monte Carlo stochastic cashflow paths fan out in real time.',
      highlight:
        'Test "Monsoon Slump (-25%)" or "Medical Shock" to verify whether the green safe zone holds and avoid debt traps.',
      targetSelectorId: 'income-twin-simulator-section',
    },
    {
      title: 'Step 4: Vernacular Voice & Matched Formal Sanction',
      time: '2:20 - 3:00',
      summary:
        'Listen to the Gemini + Speech voice narrative in Hindi or Tamil. Click "View Matched Formal Micro-Loans" to see instant digital sanction at 11.8% APR vs 48% informal moneylenders.',
      highlight:
        'GigCred closes the credit divide for 180M Indian gig workers with complete transparency and dignity.',
      targetSelectorId: 'vernacular-voice-assistant-card',
    },
  ];

  const current = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onJumpToStep(next);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onJumpToStep(prev);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Judging Guide • 3-Minute Demo Narrative ({current.time})
          </div>
          <h2 className="text-xl font-extrabold text-white">{current.title}</h2>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          {tourSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= currentStep ? 'bg-emerald-400' : 'bg-slate-800'
              }`}
            ></div>
          ))}
        </div>

        {/* Step Body */}
        <div className="space-y-4 mb-6 text-sm leading-relaxed">
          <p className="text-slate-300">{current.summary}</p>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-950 text-emerald-300 text-xs font-medium">
            💡 <strong>Judge Note:</strong> {current.highlight}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-xs font-mono text-slate-500">
            Step {currentStep + 1} of {tourSteps.length}
          </span>

          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <span>{currentStep === tourSteps.length - 1 ? 'Start Exploring' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
