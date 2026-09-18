import { Language } from '../types';

let currentAudio: HTMLAudioElement | null = null;

export function stopAllSpeech(): void {
  if (typeof window !== 'undefined') {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }
}

export function playAudioBase64(base64Data: string, onEnd?: () => void): boolean {
  try {
    stopAllSpeech();
    const audioSrc = `data:audio/mp3;base64,${base64Data}`;
    const audio = new Audio(audioSrc);
    currentAudio = audio;
    audio.onended = () => {
      currentAudio = null;
      if (onEnd) onEnd();
    };
    audio.play().catch((err) => {
      console.warn("Audio autoplay blocked or failed:", err);
      if (onEnd) onEnd();
    });
    return true;
  } catch (err) {
    console.warn("Could not play base64 audio:", err);
    return false;
  }
}

export function speakTextVernacular(
  text: string,
  lang: Language,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }

  stopAllSpeech();

  const utterance = new SpeechSynthesisUtterance(text);

  const langCodeMap: Record<Language, string> = {
    hi: 'hi-IN',
    ta: 'ta-IN',
    en: 'en-IN',
  };

  const targetLang = langCodeMap[lang] || 'en-IN';
  utterance.lang = targetLang;
  utterance.rate = lang === 'ta' ? 0.92 : lang === 'hi' ? 0.95 : 1.0;
  utterance.pitch = 1.0;

  // Try finding an exact voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) => v.lang.toLowerCase().startsWith(targetLang.toLowerCase()) || v.lang.includes(targetLang)
  );

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn("Speech synthesis error:", e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}
