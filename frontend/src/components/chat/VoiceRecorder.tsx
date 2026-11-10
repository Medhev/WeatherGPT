import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  language: 'en' | 'ta' | 'hi';
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript, language }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const getLangCode = () => {
    switch (language) {
      case 'ta': return 'ta-IN';
      case 'hi': return 'hi-IN';
      default: return 'en-IN';
    }
  };

  const toggleListening = () => {
    if (!isSupported) {
      alert("Voice input is not supported in this browser. Please type your query.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = getLangCode();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (err: any) => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
        isListening
          ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
      }`}
      title={isListening ? "Listening... click to stop" : "Start Voice Input"}
    >
      {isListening ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-sky-400" />}
    </button>
  );
};

export const SpeakButton: React.FC<{ text: string; language: 'en' | 'ta' | 'hi' }> = ({ text, language }) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown asterisks
    const cleanText = text.replace(/[*#_`-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={toggleSpeech}
      className="p-1 rounded-md text-slate-400 hover:text-sky-300 hover:bg-slate-700/50 transition-colors"
      title={isSpeaking ? "Stop speech" : "Read aloud"}
    >
      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
    </button>
  );
};
