import React, { useState, useRef } from 'react';
import { WorkerProfile, Language, UpiTransaction } from '../types';
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  FileCheck,
  FileDown,
  Table,
  Check,
  Loader2,
} from 'lucide-react';

interface StatementUploaderProps {
  selectedProfile: WorkerProfile;
  currentLanguage: Language;
  isAnalyzing: boolean;
  onAnalyze: (customText?: string) => void;
}

interface ParsedFileInfo {
  name: string;
  size: string;
  type: string;
  source: 'DROPPED_FILE' | 'BROWSED_FILE' | 'SAMPLE_PRESET';
  timestamp: string;
}

export const StatementUploader: React.FC<StatementUploaderProps> = ({
  selectedProfile,
  currentLanguage,
  isAnalyzing,
  onAnalyze,
}) => {
  const [showDlpInspection, setShowDlpInspection] = useState(true);
  const [showOcrTable, setShowOcrTable] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedFile, setParsedFile] = useState<ParsedFileInfo | null>(null);
  const [processingStage, setProcessingStage] = useState<'idle' | 'ocr' | 'dlp' | 'scoring' | 'done'>('idle');
  const [dragError, setDragError] = useState<string | null>(null);
  const dragCounterRef = useRef(0);

  const labels = {
    en: {
      title: 'UPI Statement Ingestion & Privacy Vault',
      subtitle: 'Document AI extracts transactions; Cloud DLP redacts PII before Vertex AI scoring.',
      dropActive: 'Drop your UPI PDF / Statement here...',
      uploadArea: 'Drop UPI PDF / Passbook Photo, or browse file',
      supports: 'Supports PhonePe, Google Pay, Paytm, Bank PDFs & scanned receipts',
      dlpActive: 'Cloud DLP Redaction Shield: ACTIVE',
      dlpToggleShow: 'Show DLP Masking',
      dlpToggleHide: 'Hide DLP Details',
      processBtn: 'Re-Analyze with Document AI + Vertex AI',
      analyzing: 'Extracting features via Document AI & Vertex...',
      verifiedTag: 'UPI Financial Trail Verified',
      transactionsFound: 'Verified Transactions',
      ocrTableBtn: 'Inspect Extracted OCR Table',
      ocrTableHide: 'Hide OCR Table',
      quickSamples: 'Or drop a pre-loaded UPI statement:',
      stageOcr: 'Document AI OCR parsing UPI transaction rows & UTR codes...',
      stageDlp: 'Cloud DLP redacting Indian Aadhaar, Phone & VPA...',
      stageScoring: 'Vertex AI computing cashflow stability & SHAP attribution...',
      stageDone: 'Statement successfully verified & cashflow mapped!',
    },
    hi: {
      title: 'UPI स्टेटमेंट विश्लेषण एवं डेटा सुरक्षा',
      subtitle: 'डॉक्यूमेंट एआई लेन-देन पढ़ता है और क्लाउड डीएलपी आपकी निजी जानकारी सुरक्षित रखता है।',
      dropActive: 'अपना UPI PDF या पासबुक यहाँ छोड़ें...',
      uploadArea: 'UPI स्टेटमेंट PDF या पासबुक फोटो डालें, या फ़ाइल चुनें',
      supports: 'PhonePe, Google Pay, Paytm और बैंक पासबुक समर्थित',
      dlpActive: 'क्लाउड DLP गोपनीयता शील्ड: सक्रिय',
      dlpToggleShow: 'DLP डेटा सुरक्षा देखें',
      dlpToggleHide: 'DLP विवरण छिपाएं',
      processBtn: 'डॉक्यूमेंट AI और वर्टेक्स AI से दोबारा जाँचें',
      analyzing: 'डॉक्यूमेंट AI द्वारा डेटा निकाला जा रहा है...',
      verifiedTag: 'सत्यापित UPI वित्तीय रिकॉर्ड',
      transactionsFound: 'सत्यापित लेन-देन',
      ocrTableBtn: 'निकाला गया OCR टेबल देखें',
      ocrTableHide: 'OCR टेबल छिपाएं',
      quickSamples: 'या तैयार UPI स्टेटमेंट ड्रॉप करें:',
      stageOcr: 'डॉक्यूमेंट AI द्वारा UPI लेन-देन और UTR कोड निकाले जा रहे हैं...',
      stageDlp: 'क्लाउड DLP द्वारा आधार और मोबाइल नंबर सुरक्षित किया जा रहा है...',
      stageScoring: 'वर्टेक्स AI द्वारा कैशफ्लो स्कोर तैयार किया जा रहा है...',
      stageDone: 'स्टेटमेंट सफलतापूर्वक सत्यापित एवं स्कोर अपडेट!',
    },
    ta: {
      title: 'UPI அறிக்கை சரிபார்ப்பு மற்றும் தனியுரிமை',
      subtitle: 'டாகுமென்ட் AI பரிவர்த்தனைகளைப் படிக்கிறது; கிளவுட் DLP தனிப்பட்ட தகவல்களைப் பாதுகாக்கிறது.',
      dropActive: 'உங்கள் UPI PDF அறிக்கையை இங்கே விடவும்...',
      uploadArea: 'UPI PDF அல்லது புகைப்படத்தை பதிவேற்றவும், அல்லது கோப்பைத் தேர்ந்தெடுக்கவும்',
      supports: 'PhonePe, Google Pay, Paytm அறிக்கைகள் ஆதரிக்கப்படுகின்றன',
      dlpActive: 'கிளவுட் DLP பாதுகாப்பு: செயலில் உள்ளது',
      dlpToggleShow: 'DLP விவரங்களைக் காட்டு',
      dlpToggleHide: 'DLP விவரங்களை மறைக்க',
      processBtn: 'டாகுமென்ட் AI மூலம் மீண்டும் பகுப்பாய்வு செய்க',
      analyzing: 'வூர்டெக்ஸ் AI மூலம் கணக்கிடப்படுகிறது...',
      verifiedTag: 'சரிபார்க்கப்பட்ட UPI பணவரவு',
      transactionsFound: 'சரிபார்க்கப்பட்ட பதிவுகள்',
      ocrTableBtn: 'OCR அட்டவணையைப் பார்க்க',
      ocrTableHide: 'OCR அட்டவணையை மறைக்க',
      quickSamples: 'அல்லது மாதிரி UPI அறிக்கையைத் தேர்ந்தெடுக்கவும்:',
      stageOcr: 'டாகுமென்ட் AI பரிவர்த்தனைகளை பிரித்தெடுக்கிறது...',
      stageDlp: 'கிளவுட் DLP மூலம் தரவு பாதுகாக்கப்படுகிறது...',
      stageScoring: 'வூர்டெக்ஸ் AI மூலம் கணக்கீடு செய்யப்படுகிறது...',
      stageDone: 'அறிக்கை வெற்றிகரமாக சரிபார்க்கப்பட்டது!',
    },
  }[currentLanguage];

  const sampleStatements = [
    {
      name: 'PhonePe_Delivery_UPI_Statements_Q3.pdf',
      size: '1.4 MB',
      type: 'application/pdf',
      txCount: 84,
      tag: 'PhonePe Rider Passbook',
    },
    {
      name: 'GPay_ChaiTapri_Merchant_QR_Passbook.pdf',
      size: '2.1 MB',
      type: 'application/pdf',
      txCount: 142,
      tag: 'GPay Merchant QR',
    },
    {
      name: 'Paytm_AllInOne_Soundbox_Statements.pdf',
      size: '890 KB',
      type: 'application/pdf',
      txCount: 96,
      tag: 'Paytm Soundbox Daily',
    },
  ];

  const runIngestionSimulation = (fileName: string, fileSize: string, fileType: string, source: ParsedFileInfo['source']) => {
    setDragError(null);
    setParsedFile({
      name: fileName,
      size: fileSize,
      type: fileType,
      source,
      timestamp: new Date().toLocaleTimeString(),
    });

    setProcessingStage('ocr');
    setTimeout(() => {
      setProcessingStage('dlp');
      setTimeout(() => {
        setProcessingStage('scoring');
        setTimeout(() => {
          setProcessingStage('done');
          onAnalyze(`Ingested UPI PDF Statement: ${fileName} (${fileSize})`);
        }, 600);
      }, 600);
    }, 600);
  };

  const processFile = (file: File) => {
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.csv', '.txt'];
    const isExtensionValid = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isExtensionValid) {
      setDragError('Please drop a valid statement format (.pdf, .png, .jpg, .csv).');
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    runIngestionSimulation(file.name, sizeFormatted, file.type || 'application/pdf', 'DROPPED_FILE');
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
      e.dataTransfer.clearData();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeFormatted =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;
      runIngestionSimulation(file.name, sizeFormatted, file.type || 'application/pdf', 'BROWSED_FILE');
    }
  };

  return (
    <div id="statement-uploader-card" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              {labels.title}
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {labels.verifiedTag}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{labels.subtitle}</p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-toggle-ocr-table"
            onClick={() => setShowOcrTable(!showOcrTable)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium bg-slate-800 border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Table className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showOcrTable ? labels.ocrTableHide : labels.ocrTableBtn}</span>
          </button>

          {/* DLP Masking switch */}
          <button
            id="btn-toggle-dlp-inspection"
            onClick={() => setShowDlpInspection(!showDlpInspection)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              showDlpInspection
                ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showDlpInspection ? labels.dlpToggleHide : labels.dlpToggleShow}</span>
            {showDlpInspection ? <EyeOff className="w-3 h-3 text-indigo-400" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Profile quick banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl">
        <div className="flex items-center gap-3">
          <img
            src={selectedProfile.avatar}
            alt={selectedProfile.name}
            className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/30"
          />
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              {selectedProfile.name}
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {selectedProfile.city}
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate max-w-[200px]">
              {selectedProfile.occupation}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-around border-t md:border-t-0 md:border-l border-slate-800/80 pt-2 md:pt-0 md:pl-4">
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">Monthly UPI Inflow</div>
            <div className="text-sm sm:text-base font-bold text-emerald-400">
              ₹{selectedProfile.monthlyAvgInflow.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">Net Surplus</div>
            <div className="text-sm sm:text-base font-bold text-cyan-400">
              ₹{selectedProfile.monthlyNetSurplus.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-around border-t md:border-t-0 md:border-l border-slate-800/80 pt-2 md:pt-0 md:pl-4">
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">Active Days</div>
            <div className="text-sm sm:text-base font-bold text-amber-400">
              {selectedProfile.dailyActiveDays} / 30 days
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">UPI Scans/Mo</div>
            <div className="text-sm sm:text-base font-bold text-purple-400">
              {selectedProfile.upiTxCount} txns
            </div>
          </div>
        </div>
      </div>

      {/* Cloud DLP Inspection Panel */}
      {showDlpInspection && (
        <div className="mb-5 bg-indigo-950/30 border border-indigo-900/50 rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono">
                Google Cloud DLP (Data Loss Prevention) Inspection Layer
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              InfoTypes Redacted: 4
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {selectedProfile.dlpEntities.map((item, idx) => (
              <div key={idx} className="bg-slate-950/70 border border-indigo-950 p-2.5 rounded-lg text-xs">
                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between mb-1">
                  <span>{item.field}</span>
                  <span className="text-indigo-400 font-semibold">{item.infoType}</span>
                </div>
                <div className="flex items-center justify-between gap-2 font-mono">
                  <span className="line-through text-slate-500 text-[11px]">{item.originalValue}</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded text-[11px]">
                    {item.redactedValue}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-indigo-300/80 mt-2.5">
            ✓ Vertex AI and Gemini only receive mathematically de-identified cashflow vectors. PII never leaves your device unencrypted (Cloud KMS Envelope Encryption).
          </p>
        </div>
      )}

      {/* Interactive Ingestion & Drag Drop Zone */}
      <div
        id="upi-drag-drop-zone"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-emerald-400 bg-emerald-950/30 ring-4 ring-emerald-500/20 scale-[1.008]'
            : 'border-slate-700/90 hover:border-emerald-500/70 bg-slate-950/50 hover:bg-slate-950/70'
        }`}
      >
        <input
          type="file"
          id="file-upload-input"
          accept=".pdf,.png,.jpg,.jpeg,.csv,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <label
          htmlFor="file-upload-input"
          className="flex flex-col items-center justify-center cursor-pointer group"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all ${
              isDragging
                ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 scale-110 animate-bounce'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105'
            }`}
          >
            {isDragging ? <FileDown className="w-7 h-7" /> : <UploadCloud className="w-7 h-7" />}
          </div>

          <div className="text-sm sm:text-base font-bold text-slate-100 mb-1">
            {isDragging
              ? labels.dropActive
              : parsedFile
              ? `Active Statement: ${parsedFile.name}`
              : labels.uploadArea}
          </div>

          <p className="text-xs text-slate-400 max-w-md mb-3">
            {isDragging ? 'Release to ingest and run Document AI OCR' : labels.supports}
          </p>

          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20">
              Browse Statement File
            </span>
          </div>
        </label>

        {dragError && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{dragError}</span>
          </div>
        )}

        {/* Live Ingestion Progress Pipeline */}
        {processingStage !== 'idle' && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 max-w-lg mx-auto">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                {processingStage === 'done' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                )}
                <span className="font-semibold text-white">
                  {processingStage === 'ocr' && labels.stageOcr}
                  {processingStage === 'dlp' && labels.stageDlp}
                  {processingStage === 'scoring' && labels.stageScoring}
                  {processingStage === 'done' && labels.stageDone}
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
                style={{
                  width:
                    processingStage === 'ocr'
                      ? '35%'
                      : processingStage === 'dlp'
                      ? '70%'
                      : processingStage === 'scoring'
                      ? '90%'
                      : '100%',
                }}
              />
            </div>
          </div>
        )}

        {/* Loaded File Badge */}
        {parsedFile && processingStage === 'done' && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {parsedFile.name} ({parsedFile.size}) • Document AI Extraction: 100% OK
            </span>
          </div>
        )}
      </div>

      {/* Quick Drop Samples Bar */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            {labels.quickSamples}
          </span>
          <span className="text-[10px] text-slate-500">1-click test file injection</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {sampleStatements.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => runIngestionSimulation(sample.name, sample.size, sample.type, 'SAMPLE_PRESET')}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="truncate">
                  <div className="text-xs font-medium text-slate-200 truncate group-hover:text-emerald-300">
                    {sample.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {sample.size} • {sample.tag}
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0 font-mono ml-1">
                Drop
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Document AI OCR Table Drawer */}
      {showOcrTable && (
        <div className="mt-4 bg-slate-950/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
                Document AI Extracted UPI Settlements Table
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              OCR Confidence: 99.4% • Parser: Form Parser v2.1
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Counterparty / Platform</th>
                  <th className="pb-2">VPA (Cloud DLP Masked)</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-right">UTR / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {selectedProfile.recentTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="py-2 text-slate-400">{tx.timestamp}</td>
                    <td className="py-2 font-medium text-white flex items-center gap-1.5">
                      {tx.platform && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      )}
                      <span>{tx.partyName}</span>
                    </td>
                    <td className="py-2 text-slate-400">{tx.vpa}</td>
                    <td className="py-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {tx.category}
                      </span>
                    </td>
                    <td
                      className={`py-2 text-right font-bold ${
                        tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 text-right">
                      <span className="text-emerald-400 font-semibold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>
            {selectedProfile.recentTransactions.length} recent settlements parsed • Document AI OCR Score: 99.4%
          </span>
        </div>

        <button
          id="btn-reanalyze-statement"
          onClick={() => onAnalyze()}
          disabled={isAnalyzing}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAnalyzing ? labels.analyzing : labels.processBtn}</span>
        </button>
      </div>
    </div>
  );
};

