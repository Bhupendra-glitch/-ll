import React from 'react';
import { Language, WorkerProfile } from '../types';
import { SAMPLE_PROFILES } from '../data/sampleProfiles';
import { ShieldCheck, Cpu, Volume2, Sparkles, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  selectedProfile: WorkerProfile;
  onSelectProfile: (profile: WorkerProfile) => void;
  onOpenGcpPipeline: () => void;
  onOpenDemoTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  selectedProfile,
  onSelectProfile,
  onOpenGcpPipeline,
  onOpenDemoTour,
}) => {
  return (
    <header id="app-header" className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top GCP Tech Stack Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/50 px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 overflow-x-auto py-0.5 scrollbar-none">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Google Cloud Stack:
          </span>
          <span className="bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60 font-mono text-[11px]">
            Document AI (UPI OCR)
          </span>
          <span className="bg-slate-800/80 text-indigo-300 px-2 py-0.5 rounded border border-indigo-900/60 font-mono text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            Cloud DLP Masking
          </span>
          <span className="bg-slate-800/80 text-amber-300 px-2 py-0.5 rounded border border-amber-900/60 font-mono text-[11px] flex items-center gap-1">
            <Cpu className="w-3 h-3 text-amber-400" />
            Vertex AI (XGBoost + SHAP)
          </span>
          <span className="bg-slate-800/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-900/60 font-mono text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Gemini 3.8 Flash
          </span>
          <span className="bg-slate-800/80 text-purple-300 px-2 py-0.5 rounded border border-purple-900/60 font-mono text-[11px] flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-purple-400" />
            Speech APIs
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-open-gcp-pipeline"
            onClick={onOpenGcpPipeline}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition-colors cursor-pointer"
            title="Inspect Google Cloud Platform pipeline architecture"
          >
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>GCP Architecture</span>
          </button>
          <button
            id="btn-open-demo-tour"
            onClick={onOpenDemoTour}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 text-[11px] font-medium transition-colors cursor-pointer"
            title="Launch 3-minute guided judging walkthrough"
          >
            <HelpCircle className="w-3 h-3 text-emerald-400" />
            <span>3-Min Demo Tour</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-emerald-400 to-cyan-300 text-lg">
                ₹G
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                GigCred
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold tracking-normal">
                  Income Twin™
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Explainable UPI Cashflow Credit Scoring for India's 180M Gig Workers
            </p>
          </div>
        </div>

        {/* Profile Selector & Vernacular Language Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Worker Profile Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-500 px-2 hidden lg:inline font-mono text-[11px]">Worker:</span>
            {SAMPLE_PROFILES.map((p) => {
              const isSelected = p.id === selectedProfile.id;
              return (
                <button
                  key={p.id}
                  id={`profile-btn-${p.id}`}
                  onClick={() => onSelectProfile(p)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all text-xs font-medium cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-4 h-4 rounded-full object-cover border border-slate-700"
                  />
                  <span>{p.name.split(' ')[0]}</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400 hidden sm:inline" />}
                </button>
              );
            })}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              id="lang-btn-en"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                currentLanguage === 'en'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              id="lang-btn-hi"
              onClick={() => onLanguageChange('hi')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer font-['Noto_Sans_Devanagari'] ${
                currentLanguage === 'hi'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिन्दी
            </button>
            <button
              id="lang-btn-ta"
              onClick={() => onLanguageChange('ta')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer font-['Noto_Sans_Tamil'] ${
                currentLanguage === 'ta'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
