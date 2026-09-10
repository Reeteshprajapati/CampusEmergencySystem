import React, { useState } from 'react';
import { aiService } from '../../services/aiService';
import { Bot, Send, X, Sparkles, User, Loader2 } from 'lucide-react';

export const AiAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am CampusGuard AI Assistant (powered by Groq AI). How can I assist you with campus safety, emergency protocols, or reporting today?',
    },
  ]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMsg = prompt.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await aiService.chat(userMsg);
      const reply = res?.reply || res?.data?.reply || 'CampusGuard AI Safety Assistant is ready to help.';
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error reaching Groq AI service. For immediate emergencies, please contact Campus Security Hotline.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl hover:scale-105 hover:shadow-indigo-500/25 transition-all group cursor-pointer border border-white/20"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow text-yellow-300" />
          <span>Campus AI Copilot</span>
          <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
            Groq AI
          </span>
        </button>
      )}

      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-slate-900 border border-slate-700 shadow-2xl rounded-3xl overflow-hidden flex flex-col h-[480px] animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Drawer Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  CampusGuard AI <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">Powered by Groq LLM</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-8">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> AI is thinking...
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask AI safety question..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
