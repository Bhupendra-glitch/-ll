import React, { useState, useEffect } from 'react';
import { SAMPLE_PROFILES } from './data/sampleProfiles';
import { WorkerProfile, Language } from './types';
import { Header } from './components/Header';
import { StatementUploader } from './components/StatementUploader';
import { CashflowScoreCard } from './components/CashflowScoreCard';
import { IncomeTwinSimulator } from './components/IncomeTwinSimulator';
import { IncomeForecastView } from './components/IncomeForecastView';
import { VernacularVoiceAssistant } from './components/VernacularVoiceAssistant';
import { MatchedLoansModal } from './components/MatchedLoansModal';
import { GcpPipelineModal } from './components/GcpPipelineModal';
import { DemoTourModal } from './components/DemoTourModal';
import { testFirestoreConnection, initAuthListener, syncWorkerToDatabase } from './lib/firebase';
import { ShieldCheck, Heart, Sparkles, ExternalLink, Cpu } from 'lucide-react';

export default function App() {
  const [selectedProfile, setSelectedProfile] = useState<WorkerProfile>(SAMPLE_PROFILES[0]);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isMatchedLoansOpen, setIsMatchedLoansOpen] = useState<boolean>(false);
  const [isGcpPipelineOpen, setIsGcpPipelineOpen] = useState<boolean>(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);
  const [voiceTriggerLoanAmount, setVoiceTriggerLoanAmount] = useState<number>(35000);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [authUserId, setAuthUserId] = useState<string>('');

  // Initialize Firebase Auth & test Firestore connection on mount
  useEffect(() => {
    // 1. Check connection
    testFirestoreConnection().then((connected) => {
      setIsDbConnected(connected);
    });

    // 2. Initialize anonymous auth session
    const unsubscribe = initAuthListener((user) => {
      setAuthUserId(user.uid);
      // Synchronize initial worker profile to Firestore
      syncWorkerToDatabase(user.uid, selectedProfile).catch((err) => {
        console.warn('Initial profile sync note:', err);
      });
      // Also persist to server backend
      fetch('/api/db/sync-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: user.uid,
          profile: selectedProfile,
        }),
      }).catch((e) => console.warn('Server sync note:', e));
    });

    return () => unsubscribe();
  }, []);

  // When selectedProfile changes, sync to Firestore
  useEffect(() => {
    const idToSync = authUserId || selectedProfile.id;
    syncWorkerToDatabase(idToSync, selectedProfile).catch((err) => {
      console.warn('Profile change sync note:', err);
    });
    fetch('/api/db/sync-worker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: idToSync,
        profile: selectedProfile,
      }),
    }).catch(() => {});
  }, [selectedProfile, authUserId]);

  // Trigger statement analysis simulation via server or deterministic model
  const handleAnalyzeStatement = async (customText?: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statementText: customText || `Recent transactions for ${selectedProfile.name}`,
          workerName: selectedProfile.name,
          platformType: selectedProfile.platforms.join(', '),
          profileData: selectedProfile,
        }),
      });
      const data = await res.json();
      if (data.analysis && data.analysis.cashflowScore) {
        // Dynamically update profile score if Gemini provided custom weights
        setSelectedProfile((prev) => ({
          ...prev,
          cashflowScore: data.analysis.cashflowScore || prev.cashflowScore,
          confidenceScore: data.analysis.confidenceScore || prev.confidenceScore,
        }));
      }
    } catch (err) {
      console.warn('API analysis fallback to profile default:', err);
    } finally {
      setTimeout(() => setIsAnalyzing(false), 600);
    }
  };

  // Switch profile and scroll smoothly
  const handleSelectProfile = (profile: WorkerProfile) => {
    setSelectedProfile(profile);
  };

  // Trigger voice narration from the Income Twin card
  const handleTriggerVoiceNarration = (loanAmount: number) => {
    setVoiceTriggerLoanAmount(loanAmount);
    // Smooth scroll to the voice assistant section
    const el = document.getElementById('vernacular-voice-assistant-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Jump to step during demo tour
  const handleJumpToStep = (stepIndex: number) => {
    const sectionIds = [
      'statement-uploader-card',
      'cashflow-score-section',
      'income-twin-simulator-section',
      'vernacular-voice-assistant-card',
    ];
    const targetId = sectionIds[stepIndex];
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        selectedProfile={selectedProfile}
        onSelectProfile={handleSelectProfile}
        onOpenGcpPipeline={() => setIsGcpPipelineOpen(true)}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
        isDbConnected={isDbConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* 1. Statement Ingestion & Cloud DLP Vault */}
        <section aria-label="Statement Ingestion and Privacy Vault">
          <StatementUploader
            selectedProfile={selectedProfile}
            currentLanguage={currentLanguage}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyzeStatement}
          />
        </section>

        {/* 2. Explainable Cashflow Score & SHAP Waterfall */}
        <section aria-label="Explainable Cashflow Score and SHAP Attribution">
          <CashflowScoreCard
            profile={selectedProfile}
            currentLanguage={currentLanguage}
          />
        </section>

        {/* 3. WOW FEATURE — Income Twin Live Cashflow Stress Simulator */}
        <section aria-label="Income Twin Live Simulator">
          <IncomeTwinSimulator
            profile={selectedProfile}
            currentLanguage={currentLanguage}
            onOpenMatchedLoans={() => setIsMatchedLoansOpen(true)}
            onTriggerVoiceNarration={handleTriggerVoiceNarration}
          />
        </section>

        {/* 4. 30/60/90 Day Vertex AI Probabilistic Income Forecast */}
        <section aria-label="Income Forecasting">
          <IncomeForecastView
            profile={selectedProfile}
            currentLanguage={currentLanguage}
          />
        </section>

        {/* 5. Vernacular Voice Assistant & Financial Counselor */}
        <section aria-label="Vernacular Voice Assistant">
          <VernacularVoiceAssistant
            profile={selectedProfile}
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            voiceTriggerLoanAmount={voiceTriggerLoanAmount}
          />
        </section>
      </main>

      {/* Modals */}
      <MatchedLoansModal
        isOpen={isMatchedLoansOpen}
        onClose={() => setIsMatchedLoansOpen(false)}
        profile={selectedProfile}
        currentLanguage={currentLanguage}
      />

      <GcpPipelineModal
        isOpen={isGcpPipelineOpen}
        onClose={() => setIsGcpPipelineOpen(false)}
      />

      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onJumpToStep={handleJumpToStep}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-8 px-4 sm:px-6 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 text-base">
              GigCred
            </span>
            <span>• Financial inclusion for India's 180M credit-invisible gig economy</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <button
              onClick={() => setIsGcpPipelineOpen(true)}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>GCP AI Architecture</span>
            </button>
            <button
              onClick={() => setIsDemoTourOpen(true)}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>3-Min Demo Tour</span>
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">RBI Micro-Lending Sandbox Framework</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
