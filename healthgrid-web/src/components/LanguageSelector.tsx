'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Language } from '@/lib/translations';

export default function LanguageSelector({ variant = 'default' }: { variant?: 'default' | 'compact' | 'light' }) {
  const { lang, setLang, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = supportedLanguages.find(l => l.code === lang) || supportedLanguages[0];

  if (variant === 'compact') {
    return (
      <div className="flex items-center bg-black/20 backdrop-blur-md rounded-lg p-0.5 border border-emerald-400/30 text-[11px] font-bold">
        {supportedLanguages.map(l => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`px-2 py-0.5 rounded transition-colors ${
              lang === l.code 
                ? 'bg-amber-400 text-slate-900 font-black shadow-2xs' 
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            {l.code === 'hi' ? 'हिन्दी' : l.code === 'en' ? 'EN' : l.code === 'sant' ? 'ᱥᱟᱱ' : 'বাং'}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${isOpen ? 'z-[9999]' : 'z-30'}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-black shadow-2xs ${
          variant === 'light'
            ? 'bg-white/90 hover:bg-white text-[#064e3b] border border-emerald-300'
            : 'bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 border border-emerald-500/50'
        }`}
        title="Change Language / भाषा बदलें"
      >
        <Globe className="w-3.5 h-3.5 text-amber-400" />
        <span>{currentOption.nativeLabel}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-2xl border-2 border-emerald-400 py-1.5 z-[9999] animate-in fade-in zoom-in-95 text-xs font-semibold ring-1 ring-black/10">
          <div className="px-3 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-emerald-100 bg-slate-50/80">
            Select Language / भाषा चुनें
          </div>
          <div className="py-1">
            {supportedLanguages.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLang(item.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                  lang === item.code ? 'bg-emerald-100/80 text-[#064e3b] font-black' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.flag}</span>
                  <span className="font-bold">{item.nativeLabel}</span>
                </div>
                {lang === item.code && <Check className="w-4 h-4 text-[#047857]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
