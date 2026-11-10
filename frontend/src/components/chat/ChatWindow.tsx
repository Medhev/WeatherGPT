import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, AlertCircle, RefreshCw, Cpu } from 'lucide-react';
import { apiClient } from '../../services/api';
import { ChatMessageResponse } from '../../types';
import { GroundedDataCard } from './GroundedDataCard';
import { VoiceRecorder, SpeakButton } from './VoiceRecorder';
import { useWeather } from '../../context/WeatherContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  groundedData?: any;
  uncertainty?: string;
  time: string;
  provider?: string;
  is_fallback?: boolean;
  model_name?: string;
  warning?: string;
  isError?: boolean;
  lastQuery?: string;
}

export const ChatWindow: React.FC = () => {
  const { locationName, language, t } = useWeather();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      content: t.chat.welcomeSubtitle,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'deterministic',
      model_name: 'WeatherGPT Assistant',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([
    "What is the weather in Chennai right now?",
    "Will it rain tomorrow in Chennai?",
    "Should I carry an umbrella today?",
    "Compare Chennai and Bengaluru weather.",
    "Give me a simple weather advisory for farmers."
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post<ChatMessageResponse>('/chat', {
        message: query,
        session_id: sessionId,
        language: language,
        current_location: locationName,
      });

      setSessionId(res.data.session_id);
      if (res.data.suggested_followups?.length) {
        setSuggestedFollowups(res.data.suggested_followups);
      }

      const asstMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: res.data.reply,
        groundedData: res.data.grounded_data,
        uncertainty: res.data.uncertainty_note,
        provider: res.data.provider,
        is_fallback: res.data.is_fallback,
        model_name: res.data.model_name,
        warning: res.data.warning,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, asstMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: "Sorry, I encountered an issue retrieving real-time meteorological observations or reaching the AI service. Please verify your query or try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        lastQuery: query,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] rounded-2xl glass-card border border-slate-800 overflow-hidden">
      
      {/* Chat header */}
      <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{t.chat.welcomeTitle}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Live Grounded
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Active Context: {locationName} · Language: {language.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isGemini = msg.provider === 'gemini' && !msg.is_fallback;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isUser
                    ? 'bg-sky-500 text-white'
                    : isGemini
                    ? 'bg-purple-900/50 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800 text-sky-400 border border-slate-700'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : isGemini ? <Sparkles className="w-4 h-4 text-purple-400" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-md'
                }`}
              >
                {/* Assistant Model Badge */}
                {!isUser && (
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-700/50 text-[10px]">
                    {isGemini ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium border border-purple-500/30">
                        <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                        {msg.model_name || 'Gemini 1.5 Flash'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium border border-slate-600">
                        <Cpu className="w-2.5 h-2.5 text-sky-400" />
                        {msg.model_name || 'Deterministic Engine'}
                      </span>
                    )}

                    {msg.is_fallback && (
                      <span className="text-[10px] text-amber-400/90 font-medium">
                        (Deterministic Fallback)
                      </span>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Warning note if fallback triggered due to rate limit or key */}
                {msg.warning && (
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-400" />
                    <span>{msg.warning}</span>
                  </div>
                )}

                {/* Grounded Meteorological Evidence card */}
                {msg.groundedData && <GroundedDataCard data={msg.groundedData} />}

                {/* Uncertainty note */}
                {msg.uncertainty && (
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-400" />
                    <span>{msg.uncertainty}</span>
                  </div>
                )}

                {/* Retry action for error state */}
                {msg.isError && msg.lastQuery && (
                  <button
                    onClick={() => handleSendMessage(msg.lastQuery)}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-medium transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry Request
                  </button>
                )}

                {/* Footer timestamp & text-to-speech */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[10px] text-slate-400">
                  <span>{msg.time}</span>
                  {!isUser && !msg.isError && (
                    <SpeakButton text={msg.content} language={language} />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-sky-400 border border-slate-700 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 text-xs text-sky-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-slate-300">Retrieving meteorological telemetry & synthesizing grounded advisory...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Followups */}
      {suggestedFollowups.length > 0 && (
        <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/60 overflow-x-auto no-scrollbar flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
          {suggestedFollowups.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendMessage(prompt)}
              className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700 hover:border-sky-500/40 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <VoiceRecorder
            onTranscript={(spoken) => {
              setInput(spoken);
              handleSendMessage(spoken);
            }}
            language={language}
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.chat.placeholder}
            disabled={loading}
            className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t.chat.send}</span>
          </button>
        </form>
      </div>

    </div>
  );
};
