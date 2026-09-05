'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartPulse, Search, MapPin, Phone, Navigation, ShieldCheck, 
  Building2, Bot, Send, User, Sparkles, MessageSquare, X, ChevronRight, AlertCircle, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function PublicPortal() {
  const [phcs, setPhcs] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // AI Chat Assistant State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 **Namaste! I am your HealthGrid Citizen AI Assistant.**\n\nI can help you locate the nearest Public Health Center (PHC), check bed readiness, or provide first-aid advice for mild symptoms (fever, cold, dehydration).\n\n*How can I help you today?*'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/phcs')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setPhcs(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load facilities:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isAiLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputValue('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/public/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'I am temporarily experiencing connectivity issues. Please visit your nearest PHC directly for urgent medical support.' }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Connection error. For medical emergencies, please dial 108 or visit your nearest government hospital.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filtered = phcs.filter(phc => {
    const matchesDistrict = selectedDistrict === 'All' || phc.district === selectedDistrict;
    const matchesSearch = phc.name.toLowerCase().includes(searchQuery.toLowerCase()) || phc.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  const promptSuggestions = [
    '🏥 Find nearest PHC in Patna',
    '🌡️ Mild fever home care advice',
    '💧 Dehydration & ORS guide',
    '🚑 Emergency facilities in Lucknow'
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative">
      {/* Citizen Header */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-700 p-2 rounded-lg">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">HealthGrid Public Portal</h1>
            <p className="text-[11px] text-slate-500">CITIZEN HEALTHCARE LOCATOR &amp; AI ADVISOR</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <Bot className="w-4 h-4 text-emerald-700" />
            <span>Ask AI Health Assistant</span>
          </button>
          <Link href="/dashboard" className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg bg-white hidden sm:inline-block">
            Command Center
          </Link>
        </div>
      </header>

      {/* Hero Banner with Integrated AI Assistant Callout */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-10 px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Public Healthcare Directory &bull; Bihar, UP, Jharkhand
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Find Public Health Centers &amp; Instant Medical Guidance
          </h2>
          <p className="text-sm text-slate-600 max-w-xl">
            Locate 30+ verified Primary Health Centers with live inpatient bed availability, or consult our Citizen AI Assistant for nearest center planning and mild symptom first aid.
          </p>

          {/* Quick AI Prompts */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsChatOpen(true);
                  handleSendMessage(prompt.substring(3)); // Strip emoji
                }}
                className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 px-3 py-1.5 rounded-full shadow-2xs transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="w-full max-w-2xl bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-2 mt-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by facility name or city (e.g. Danapur, Chinhat)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 outline-none"
              />
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs font-semibold px-4 py-2 bg-slate-50 rounded-xl border-none outline-none text-slate-700 cursor-pointer"
            >
              <option value="All">All Districts (30 Centers)</option>
              <option value="Patna">Patna (Bihar)</option>
              <option value="Gaya">Gaya (Bihar)</option>
              <option value="Lucknow">Lucknow (UP)</option>
              <option value="Varanasi">Varanasi (UP)</option>
              <option value="Ranchi">Ranchi (Jharkhand)</option>
              <option value="Dhanbad">Dhanbad (Jharkhand)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Verified Health Centers ({filtered.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Free Essential Medicines &amp; Consultations</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading verified facilities...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            No healthcare centers match your search criteria. Try selecting &ldquo;All Districts&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((phc) => (
              <div key={phc.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1 ${
                      phc.type === 'EMERGENCY' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${phc.type === 'EMERGENCY' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                      {phc.type === 'EMERGENCY' ? '24/7 Emergency Unit' : '24/7 Primary Care'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {phc.district}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-800 mt-1">{phc.name}</h4>
                  <p className="text-xs text-slate-500">{phc.state} Public Healthcare Network</p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span><strong>{phc.totalBeds}</strong> Inpatient Beds</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Status: Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a 
                    href={`https://maps.google.com/?q=${phc.latitude || 25.5},${phc.longitude || 85.1}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Get Route
                  </a>
                  <button 
                    onClick={() => {
                      setIsChatOpen(true);
                      handleSendMessage(`Tell me about facility readiness and directions to ${phc.name} in ${phc.district}`);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5 text-emerald-700" />
                    Ask AI
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating AI Chat Assistant Toggle Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          </div>
          <span className="text-xs font-bold pr-1 hidden sm:inline-block">Ask Health AI</span>
        </button>
      )}

      {/* Interactive AI Chat Assistant Modal / Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Chat Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">HealthGrid Citizen AI</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Online &bull; 30 PHCs Directory Linked</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 bg-slate-50/50 text-xs">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                  msg.role === 'user' 
                    ? 'bg-emerald-700 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isAiLoading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Checking medical directory...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts in Chat */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleSendMessage('Which PHC in Patna has emergency beds?')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded-full whitespace-nowrap transition-colors"
            >
              Emergency PHC in Patna
            </button>
            <button
              onClick={() => handleSendMessage('What first aid should I take for fever and headache?')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded-full whitespace-nowrap transition-colors"
            >
              Fever &amp; headache advice
            </button>
          </div>

          {/* Input Box */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about nearest PHC, symptoms, or remedies..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 text-slate-800"
            />
            <button
              type="submit"
              disabled={isAiLoading || !inputValue.trim()}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Citizen Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-400">
        HEALTHGRID AI &bull; Smart Public Healthcare Supply Chain &amp; Resource Resilience Platform &bull; Emergency National Helpline: 108
      </footer>
    </div>
  );
}
