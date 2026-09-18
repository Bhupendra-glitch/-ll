import React, { useState, useEffect } from 'react';
import { WorkerProfile, Language } from '../types';
import { speakTextVernacular, stopAllSpeech, playAudioBase64 } from '../utils/speech';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  MessageSquare,
  Bot,
  User,
  Play,
  Pause,
  Languages,
  CheckCircle2,
} from 'lucide-react';

interface VernacularVoiceAssistantProps {
  profile: WorkerProfile;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  voiceTriggerLoanAmount?: number;
}

export const VernacularVoiceAssistant: React.FC<VernacularVoiceAssistantProps> = ({
  profile,
  currentLanguage,
  onLanguageChange,
  voiceTriggerLoanAmount = 35000,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScript, setCurrentScript] = useState<string>('');
  const [userQuestion, setUserQuestion] = useState('');
  const [isCounselorLoading, setIsCounselorLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([]);

  // Base scripts per language
  const defaultScripts = {
    hi: `नमस्ते ${profile.name} जी! आपका गिगक्रेडिट स्कोर ${profile.cashflowScore} है, जो कि बहुत बढ़िया प्राइम श्रेणी में आता है। आपके नियमित UPI लेन-देन से पता चलता है कि आप बिना किसी परेशानी के ₹${voiceTriggerLoanAmount.toLocaleString('en-IN')} का ऋण ले सकते हैं। सरकारी सब्सिडी और 11.8% की औपचारिक ब्याज दर से आप साहूकार के मुकाबले ₹18,400 से अधिक की सीधी बचत कर रहे हैं।`,
    ta: `வணக்கம் ${profile.name} அவர்களே! உங்கள் கிக்-கிரெடிட் ஸ்கோர் ${profile.cashflowScore} ஆக உள்ளது. உங்கள் தொடர்ச்சியான UPI வரவு உங்கள் உண்மையான உழைப்பைக் காட்டுகிறது. நீங்கள் ₹${voiceTriggerLoanAmount.toLocaleString('en-IN')} வரை எளிதாக கடன் பெறலாம். கந்துவட்டியின் 48% அதிக வட்டிக்கு பதிலாக, 11.8% நியாயமான வட்டியில் நீங்கள் பாதுகாப்பாக முன்னேறலாம்!`,
    en: `Hello ${profile.name}! Your GigCred cashflow score is ${profile.cashflowScore} out of 900, placing you in the Prime Gig Tier. Based on your 27 active working days and verified UPI velocity, you can safely borrow ₹${voiceTriggerLoanAmount.toLocaleString('en-IN')} with an easy daily micro-debit of just ₹135. You save over ₹18,400 compared to predatory 48% informal lenders!`,
  };

  // Update script when language or profile changes
  useEffect(() => {
    const script = defaultScripts[currentLanguage] || defaultScripts.en;
    setCurrentScript(script);
  }, [currentLanguage, profile, voiceTriggerLoanAmount]);

  // Handle Play/Stop Voice Narration
  const handleTogglePlay = async () => {
    if (isPlaying) {
      stopAllSpeech();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    // Call server to attempt Gemini voice explain or synthesize speech
    try {
      const res = await fetch('/api/voice-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerName: profile.name,
          score: profile.cashflowScore,
          language: currentLanguage,
          loanAmount: voiceTriggerLoanAmount,
          monthlyIncome: profile.monthlyAvgInflow,
          riskTier: profile.riskTier,
        }),
      });

      const data = await res.json();
      if (data.script) {
        setCurrentScript(data.script);
      }

      if (data.audioBase64) {
        playAudioBase64(data.audioBase64, () => setIsPlaying(false));
      } else {
        // Use browser vernacular speech synthesis
        speakTextVernacular(
          data.script || currentScript,
          currentLanguage,
          () => setIsPlaying(true),
          () => setIsPlaying(false)
        );
      }
    } catch (err) {
      // Fallback directly to client-side speech synthesis
      speakTextVernacular(
        currentScript,
        currentLanguage,
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    }
  };

  // Quick prompt questions
  const samplePrompts = {
    en: [
      'Can I comfortably service a ₹50,000 loan?',
      'How does daily micro-repayment protect me during monsoons?',
      'Why is 11.8% formal APR better than 48% meter vaddi?',
    ],
    hi: [
      'क्या मैं ₹50,000 का लोन आसानी से चुका सकता हूँ?',
      'बारिश या मंदी के दिनों में दैनिक किस्त कैसे सुरक्षित है?',
      'साहूकार के 4% मासिक ब्याज से बैंक का 11.8% कितना बेहतर है?',
    ],
    ta: [
      'நான் ₹50,000 கடன் வாங்கினால் சுலபமாக திருப்பிச் செலுத்த முடியுமா?',
      'மழைக்காலத்தில் தினசரி தவணை எவ்வாறு பாதுகாப்பாக இருக்கும்?',
      'கந்துவட்டிக்கும் இந்த வங்கி கடனுக்கும் என்ன வித்தியாசம்?',
    ],
  }[currentLanguage];

  const handleAskQuestion = async (q: string) => {
    if (!q.trim() || isCounselorLoading) return;

    const userText = q.trim();
    setUserQuestion('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsCounselorLoading(true);

    try {
      const res = await fetch('/api/ask-counselor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          language: currentLanguage,
          workerProfile: profile,
          currentSimulation: {
            principal: voiceTriggerLoanAmount,
            tenureMonths: 6,
            dailyEmi: 135,
          },
        }),
      });

      const data = await res.json();
      const botAnswer =
        data.answer ||
        (currentLanguage === 'hi'
          ? 'आपकी नियमित UPI कमाई से यह लोन पूरी तरह सुरक्षित है।'
          : currentLanguage === 'ta'
          ? 'உங்கள் தினசரி வருமானம் இந்த கடனை எளிதாக திருப்பிச் செலுத்த உதவும்.'
          : 'Your regular cashflow easily supports this loan with an 80% safety buffer.');

      setChatMessages((prev) => [...prev, { sender: 'bot', text: botAnswer }]);

      // Automatically speak the answer aloud
      speakTextVernacular(botAnswer, currentLanguage);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text:
            currentLanguage === 'hi'
              ? 'आपकी वर्तमान बचत के अनुसार आप बिना किसी वित्तीय दबाव के यह किस्त चुका सकते हैं।'
              : 'Based on your liquid surplus, this loan remains in the safe borrowing green zone.',
        },
      ]);
    } finally {
      setIsCounselorLoading(false);
    }
  };

  const texts = {
    en: {
      title: 'Vernacular Voice Assistant (Gemini + Speech APIs)',
      subtitle: 'Speaks fluently in Hindi, Tamil, and English. No financial jargon—pure clarity.',
      nowNarrating: 'Voice Narration Playing',
      clickToListen: 'Click to Listen in Vernacular',
      askCounselor: 'Ask Financial Counselor in Your Language',
      placeholder: 'Ask question in Hindi, Tamil, or English...',
      send: 'Ask',
    },
    hi: {
      title: 'मातृभाषा आवाज़ सहायक (जेमिनी + स्पीच इंजन)',
      subtitle: 'हिंदी, तमिल और अंग्रेजी में आसान शब्दों में वित्तीय सलाह। कोई कठिन कागजी भाषा नहीं।',
      nowNarrating: 'आवाज़ में जानकारी सुनाई जा रही है',
      clickToListen: 'हिंदी में आवाज़ सुनने के लिए क्लिक करें',
      askCounselor: 'अपनी भाषा में वित्तीय सलाहकार से पूछें',
      placeholder: 'हिंदी में कोई भी प्रश्न पूछें...',
      send: 'पूछें',
    },
    ta: {
      title: 'தமிழ் குரல் வழிகாட்டி (Gemini & Speech)',
      subtitle: 'தமிழ், இந்தி மற்றும் ஆங்கிலத்தில் தெளிவான நிதியுதவி வழிகாட்டல்.',
      nowNarrating: 'குரல் விளக்கம் ஒலிக்கிறது',
      clickToListen: 'தமிழில் கேட்க கிளிக் செய்யவும்',
      askCounselor: 'உங்கள் மொழியில் சந்தேகங்களைக் கேளுங்கள்',
      placeholder: 'தமிழில் கேள்விகளைக் கேளுங்கள்...',
      send: 'கேள்',
    },
  }[currentLanguage];

  return (
    <div id="vernacular-voice-assistant-card" className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">{texts.title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{texts.subtitle}</p>
        </div>

        {/* Language Quick Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <Languages className="w-3.5 h-3.5 text-purple-400 ml-1.5" />
          {(['en', 'hi', 'ta'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer text-xs ${
                currentLanguage === lang
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'hi' ? 'हिन्दी' : 'தமிழ்'}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Narration Player Card */}
      <div className="bg-slate-950/90 border border-purple-900/40 rounded-xl p-4 sm:p-5 mb-5 shadow-inner">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Play Button */}
            <button
              id="btn-play-vernacular-audio"
              onClick={handleTogglePlay}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-lg ${
                isPlaying
                  ? 'bg-purple-500 text-slate-950 ring-4 ring-purple-500/30'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white shadow-purple-950/60'
              }`}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {isPlaying ? texts.nowNarrating : texts.clickToListen}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Narrated for <span className="text-slate-200 font-semibold">{profile.name}</span> in{' '}
                <span className="text-purple-300 font-semibold">
                  {currentLanguage === 'hi' ? 'Hindi (हिंदी)' : currentLanguage === 'ta' ? 'Tamil (தமிழ்)' : 'English'}
                </span>
              </div>
            </div>
          </div>

          {/* Sound wave visualizer bars */}
          <div className="flex items-center gap-1 h-8 px-4 py-1 bg-slate-900/80 rounded-lg border border-slate-800">
            {[14, 28, 18, 32, 22, 12, 30, 24, 16, 26, 14, 20].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isPlaying ? 'bg-purple-400 animate-pulse' : 'bg-slate-700'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(6, (h * (i % 2 === 0 ? 1.2 : 0.8)))}px` : '6px',
                }}
              ></span>
            ))}
          </div>
        </div>

        {/* Narrative Transcript */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300 italic leading-relaxed bg-purple-950/20 p-3 rounded-lg border border-purple-950/60 font-serif">
          "{currentScript}"
        </div>
      </div>

      {/* Interactive Counselor Chat & Questions */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          {texts.askCounselor}
        </div>

        {/* Quick prompt chips */}
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(prompt)}
              className="text-left text-[11px] px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              💬 "{prompt}"
            </button>
          ))}
        </div>

        {/* Chat History if any */}
        {chatMessages.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 text-xs ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && <Bot className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />}
                <div
                  className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-xs'
                      : 'bg-slate-900 border border-slate-700/80 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
              </div>
            ))}
            {isCounselorLoading && (
              <div className="flex items-center gap-2 text-xs text-purple-300 italic">
                <Bot className="w-4 h-4 animate-spin text-purple-400" />
                <span>Thinking in vernacular...</span>
              </div>
            )}
          </div>
        )}

        {/* User Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion(userQuestion);
          }}
          className="flex items-center gap-2 mt-2"
        >
          <input
            type="text"
            id="input-voice-assistant-question"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder={texts.placeholder}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!userQuestion.trim() || isCounselorLoading}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>{texts.send}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
