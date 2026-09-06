'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function NewsTicker() {
  const { t } = useLanguage();
  const [newsList, setNewsList] = useState<string[]>([
    "District Resource Envelope 2026 - 27: Health & Family Welfare Department, GoJ",
    "Free Essential Medicine Supply Drive launched across 30+ Primary Health Centers in Ranchi District",
    "National Health Mission (NHM) Jharkhand issues seasonal Vector-Borne Disease Advisory for South Chotanagpur division",
    "Special Procurement of Fever & Pediatric Anti-Infectives authorized for CHC Ratu, CHC Bero & Sadar Hospital",
    "Chief Minister's Jan Arogya Yojana: Mobile Medical Telemedicine Units deployed in rural Ranchi blocks",
    "Inter-PHC Emergency Medicine Redistribution Protocol active under HealthGrid AI Command"
  ]);

  useEffect(() => {
    fetch('/api/news/jharkhand')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.news) && data.news.length > 0) {
          setNewsList(data.news);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full bg-white border-b border-emerald-200 shadow-2xs flex items-stretch overflow-hidden text-xs relative z-10">
      {/* Forest Green Badge with Saffron Top Line (Jharkhand Government Design) */}
      <div className="relative bg-[#064e3b] text-white px-5 py-2.5 flex items-center justify-center font-bold tracking-wider shrink-0 z-10 shadow-md">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#f37021]"></div>
        <span className="text-[11px] uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t('news_title', 'ताज़ा समाचार / LATEST NEWS')}</span>
        </span>
      </div>

      {/* Scrolling Marquee Container */}
      <div className="flex-1 overflow-hidden relative flex items-center bg-white py-2 group">
        <div className="whitespace-nowrap flex items-center gap-6 animate-marquee group-hover:[animation-play-state:paused]">
          {newsList.concat(newsList).map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-2 text-slate-700 hover:text-blue-700 transition-colors font-medium">
              <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded shrink-0">
                {t('news_badge', '💥 NEW')}
              </span>
              <span>{item}</span>
              <span className="text-slate-300 font-bold ml-4">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
