'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Activity, AlertTriangle, CheckCircle, MapPin, Zap, ShieldAlert, ShieldCheck, Building2, Users, FileText, HeartPulse, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import NewsTicker from '@/components/NewsTicker';
import { RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';

export default function HeroSection() {
  return (
    <div className="relative w-full bg-white font-sans flex flex-col min-h-screen jharkhand-bg-watermark">
      
      {/* Top Government Official Strip (Jharkhand Deep Forest Green) */}
      <div className="w-full bg-[#064e3b] text-white px-6 py-1.5 flex items-center justify-between text-[11px] font-medium z-20 border-b border-[#047857]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>झारखंड सरकार &bull; GOVERNMENT OF JHARKHAND &bull; RANCHI HEALTH COMMAND</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-emerald-100">
          <span>स्वास्थ्य, चिकित्सा शिक्षा एवं परिवार कल्याण विभाग</span>
          <span className="text-emerald-400">|</span>
          <span className="font-bold text-amber-300">● HEALTHGRID AI LIVE PROTOTYPE</span>
        </div>
      </div>

      {/* Main Government Header with MoHFW & Jharkhand Seal */}
      <header className="w-full px-6 md:px-12 py-3.5 bg-white/95 backdrop-blur-md border-b border-emerald-200 flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-48 sm:w-60">
              <img 
                src="/emblem-logo.png" 
                alt="Ministry of Health & Family Welfare - Government of India" 
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>
          <div className="hidden lg:block border-l-2 border-emerald-600 pl-4">
            <div className="text-xs font-black text-[#064e3b] tracking-wide">HEALTHGRID AI JHARKHAND</div>
            <div className="text-[10px] text-emerald-800 font-bold">राज्य स्वास्थ्य रसद एवं आपातकालीन प्रबंधन प्रणाली</div>
          </div>
        </div>

        {/* Public Citizen Navigation */}
        <nav className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
          <Link 
            href="/public" 
            className="px-3.5 py-2 text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors inline-flex items-center gap-1.5 font-bold shadow-2xs"
          >
            <HeartPulse className="w-4 h-4 text-emerald-700" />
            <span>नागरिक स्वास्थ्य पोर्टल</span>
          </Link>
          <Link 
            href="/public" 
            className="px-3.5 py-2 text-slate-700 hover:text-[#064e3b] hover:bg-emerald-50 rounded-lg transition-colors hidden sm:inline-flex items-center gap-1.5 border border-transparent hover:border-emerald-200 font-bold"
          >
            <Activity className="w-4 h-4 text-emerald-700" />
            <span>AI स्वास्थ्य मित्र</span>
          </Link>
          <a 
            href="tel:108" 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm font-bold inline-flex items-center gap-1.5 border border-red-700"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            <span>108 आपातकालीन</span>
          </a>
        </nav>
      </header>

      {/* Real Live News Ticker Just Below Navbar (Exact Government Marquee) */}
      <NewsTicker />

      {/* Hero Presentation Section with Vivid Jharkhand Template Background */}
      <div className="w-full jharkhand-hero-bg border-b border-emerald-100">
        <main className="w-full max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-18 flex flex-col items-center text-center relative z-10">
          
          {/* Main Hero Header & CTAs */}
          <div className="w-full flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 text-[#064e3b] text-xs font-black tracking-wide uppercase mb-5 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#047857] animate-pulse"></span>
              झारखंड स्वास्थ्य ग्रिड &bull; HEALTHGRID JHARKHAND
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#064e3b] tracking-tight leading-[1.12] mb-5">
              Predict. Prepare. <span className="text-[#047857]">Redistribute. Save.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed mb-8 font-semibold max-w-3xl drop-shadow-xs">
              झारखंड के प्राथमिक स्वास्थ्य केंद्रों (PHC) और जिला अस्पतालों को जोड़ने वाला रीयल-टाइम स्वास्थ्य ग्रिड — <strong>72 घंटे पूर्व दवा संकट पूर्वानुमान</strong>, <strong>GIS आधारित नजदीकी सुविधा खोज</strong>, और <strong>स्वचालित इंटर-PHC दवा पुनर्वितरण</strong>।
            </p>
            
            {/* 100% Public-Oriented Quick Access Cards with Green & White Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8 text-left">
              <Link 
                href="/public" 
                className="p-4 bg-[#064e3b] text-white rounded-xl shadow-md hover:shadow-lg hover:bg-[#047857] transition-all flex flex-col justify-between group border border-emerald-700"
              >
                <div>
                  <div className="flex items-center justify-between text-emerald-200 mb-2">
                    <MapPin className="w-5 h-5 text-amber-300" />
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-xs font-black text-white">नजदीकी स्वास्थ्य केंद्र</div>
                  <div className="text-[11px] font-bold text-emerald-100">Find Nearest PHC / CHC</div>
                  <div className="text-[10px] text-emerald-200 mt-1">Live Bed Capacity &amp; OPD</div>
                </div>
              </Link>

              <Link 
                href="/public" 
                className="p-4 bg-[#047857] text-white rounded-xl shadow-md hover:shadow-lg hover:bg-[#059669] transition-all flex flex-col justify-between group border border-emerald-600"
              >
                <div>
                  <div className="flex items-center justify-between text-emerald-200 mb-2">
                    <HeartPulse className="w-5 h-5 text-white" />
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-xs font-black text-white">AI स्वास्थ्य मित्र</div>
                  <div className="text-[11px] font-bold text-emerald-100">Citizen Health AI</div>
                  <div className="text-[10px] text-emerald-200 mt-1">24x7 Symptom &amp; Remedy Guide</div>
                </div>
              </Link>

              <Link 
                href="/public" 
                className="p-4 bg-[#064e3b] text-white rounded-xl shadow-md hover:shadow-lg hover:bg-[#047857] transition-all flex flex-col justify-between group border border-emerald-700"
              >
                <div>
                  <div className="flex items-center justify-between text-emerald-200 mb-2">
                    <Activity className="w-5 h-5 text-amber-300" />
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-xs font-black text-white">आपातकालीन सहायता</div>
                  <div className="text-[11px] font-bold text-emerald-100">108 / 104 Helplines</div>
                  <div className="text-[10px] text-emerald-200 mt-1">Direct Emergency Ambulance</div>
                </div>
              </Link>
            </div>

          {/* Verification Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 rounded-xl font-bold text-[#064e3b] border border-emerald-300 shadow-2xs">
              <CheckCircle className="w-4 h-4 text-[#047857]" />
              10 Verified Ranchi PHCs
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 rounded-xl font-bold text-[#064e3b] border border-emerald-300 shadow-2xs">
              <Zap className="w-4 h-4 text-amber-500" />
              72h Outbreak Radar
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 rounded-xl font-bold text-[#064e3b] border border-emerald-300 shadow-2xs">
              <MapPin className="w-4 h-4 text-emerald-700" />
              GIS Geodesic Distance Routing
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 rounded-xl font-bold text-[#064e3b] border border-emerald-300 shadow-2xs">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              24/7 SOS Emergency Alert Dispatch
            </span>
          </div>
        </div>

      </main>
    </div>

      {/* OUR LEADERSHIP Section - 4 Separate Individual Cropped Portrait Images */}
      <section className="w-full bg-emerald-50/60 border-t border-emerald-200 py-12 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          
          {/* Section Heading with Orange Accent Underline */}
          <div>
            <div className="relative inline-block">
              <h3 className="text-lg font-black text-[#064e3b] uppercase tracking-wider">हमारा नेतृत्व / OUR LEADERSHIP</h3>
              <div className="h-1 bg-[#f37021] w-full mt-1.5 rounded-full"></div>
            </div>
            <p className="text-xs text-emerald-900 font-semibold mt-2">झारखंड सरकार &bull; स्वास्थ्य, चिकित्सा शिक्षा एवं परिवार कल्याण विभाग</p>
          </div>

          {/* Dignitaries Grid with Individual Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Hon'ble Chief Minister */}
            <div className="bg-white border-2 border-emerald-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative w-full h-52 bg-gradient-to-b from-emerald-100 to-emerald-50 overflow-hidden flex items-center justify-center p-2">
                <img 
                  src="/leader-hemant-soren.png" 
                  alt="Shri Hemant Soren" 
                  className="max-h-full max-w-full object-contain drop-shadow-md rounded-lg"
                />
              </div>
              <div className="p-4 flex flex-col text-center border-t-2 border-[#f37021]">
                <h4 className="text-sm font-black text-[#064e3b]">Shri. Hemant Soren</h4>
                <div className="text-xs font-bold text-[#047857] mt-0.5">Hon&apos;ble Chief Minister</div>
                <div className="text-[11px] text-slate-600 mt-1 font-medium">Government of Jharkhand</div>
              </div>
            </div>

            {/* Card 2: Hon'ble Health Minister */}
            <div className="bg-white border-2 border-emerald-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative w-full h-52 bg-gradient-to-b from-emerald-100 to-emerald-50 overflow-hidden flex items-center justify-center p-2">
                <img 
                  src="/leader-irfan-ansari.png" 
                  alt="Dr. Irfan Ansari" 
                  className="max-h-full max-w-full object-contain drop-shadow-md rounded-lg"
                />
              </div>
              <div className="p-4 flex flex-col text-center border-t-2 border-[#f37021]">
                <h4 className="text-sm font-black text-[#064e3b]">Dr. Irfan Ansari</h4>
                <div className="text-xs font-bold text-[#047857] mt-0.5">Hon&apos;ble Minister</div>
                <div className="text-[11px] text-slate-600 mt-1 font-medium">Health, Medical Education &amp; Family Welfare, GoJ</div>
              </div>
            </div>

            {/* Card 3: Additional Chief Secretary */}
            <div className="bg-white border-2 border-emerald-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative w-full h-52 bg-gradient-to-b from-emerald-100 to-emerald-50 overflow-hidden flex items-center justify-center p-2">
                <img 
                  src="/leader-ajay-singh.png" 
                  alt="Shri. Ajay Kumar Singh, IAS" 
                  className="max-h-full max-w-full object-contain drop-shadow-md rounded-lg"
                />
              </div>
              <div className="p-4 flex flex-col text-center border-t-2 border-[#f37021]">
                <h4 className="text-sm font-black text-[#064e3b]">Shri. Ajay Kumar Singh, IAS</h4>
                <div className="text-xs font-bold text-[#047857] mt-0.5">Additional Chief Secretary</div>
                <div className="text-[11px] text-slate-600 mt-1 font-medium">Health, Medical Education &amp; Family Welfare, GoJ</div>
              </div>
            </div>

            {/* Card 4: Mission Director NHM */}
            <div className="bg-white border-2 border-emerald-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative w-full h-52 bg-gradient-to-b from-emerald-100 to-emerald-50 overflow-hidden flex items-center justify-center p-2">
                <img 
                  src="/leader-shashi-jha.png" 
                  alt="Mr. Shashi Prakash Jha, IAS" 
                  className="max-h-full max-w-full object-contain drop-shadow-md rounded-lg"
                />
              </div>
              <div className="p-4 flex flex-col text-center border-t-2 border-[#f37021]">
                <h4 className="text-sm font-black text-[#064e3b]">Mr. Shashi Prakash Jha, IAS</h4>
                <div className="text-xs font-bold text-[#047857] mt-0.5">Mission Director</div>
                <div className="text-[11px] text-slate-600 mt-1 font-medium">National Health Mission (NHM), Jharkhand</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* JHARKHAND GOVT MEDICAL & HEALTHCARE HIGHLIGHTS SECTION */}
      <section className="w-full bg-white border-t-2 border-emerald-200 py-14 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-emerald-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-[#064e3b] text-xs font-black rounded-full uppercase mb-2 border border-emerald-300">
                <Activity className="w-3.5 h-3.5 text-[#047857]" />
                <span>STATE MEDICAL ADVANCEMENTS &bull; उपलब्धियां</span>
              </div>
              <div className="relative inline-block">
                <h3 className="text-xl sm:text-2xl font-black text-[#064e3b] uppercase tracking-wide">
                  झारखंड सरकार: चिकित्सा एवं स्वास्थ्य क्षेत्र की प्रमुख उपलब्धियां
                </h3>
                <div className="h-1 bg-[#f37021] w-full mt-1.5 rounded-full"></div>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-2 max-w-3xl">
                Government of Jharkhand Initiatives in Modernizing Hospital Infrastructure, 108 Emergency Ambulance Networks, Specialist PHC Doctor Visits, and Departmental Field Audits.
              </p>
            </div>
            <Link
              href="/public"
              className="px-4 py-2.5 bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 inline-flex items-center gap-2 border border-emerald-800"
            >
              <span>नागरिक स्वास्थ्य पोर्टल</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </Link>
          </div>

          {/* Highlights 6-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Highlight 1: Ambulance System */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200/90 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group hover:border-[#047857]">
              <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                <img 
                  src="/highlight-ambulance-network.jpg" 
                  alt="District PHC Fully Functioned Ambulance System in Jharkhand" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#064e3b]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/50 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                  <span>108 Emergency Network</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between border-t-2 border-[#f37021]">
                <div>
                  <h4 className="text-sm font-black text-[#064e3b] leading-snug">
                    जिला प्राथमिक स्वास्थ्य केंद्रों में सुसज्जित 108 एम्बुलेंस प्रणाली
                  </h4>
                  <div className="text-[11px] font-bold text-[#047857] mt-0.5">
                    District PHCs Fully Functioned 108 Ambulance System
                  </div>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">
                    झारखंड के ग्रामीण और ब्लॉक स्तरीय प्राथमिक स्वास्थ्य केंद्रों (PHC/CHC) को 24/7 लाइफ-सपोर्ट युक्त 108 एम्बुलेंस बेड़े से जोड़ा गया है, जिससे आपातकालीन मरीजों को समय पर सुरक्षित रेफरल मिल रहा है।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="text-emerald-700">✓ 24/7 GPS Tracking</span>
                  <span className="text-slate-700">Ranchi &amp; All Districts</span>
                </div>
              </div>
            </div>

            {/* Highlight 2: Large Hospital Infrastructure */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200/90 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group hover:border-[#047857]">
              <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                <img 
                  src="/highlight-hospital-infra.webp" 
                  alt="Large Infrastructure for Hospitals in Jharkhand" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#064e3b]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/50 flex items-center gap-1 shadow-sm">
                  <Building2 className="w-3 h-3 text-amber-300" />
                  <span>Hospital Modernization</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between border-t-2 border-[#f37021]">
                <div>
                  <h4 className="text-sm font-black text-[#064e3b] leading-snug">
                    राज्य भर में आधुनिक अस्पताल अवसंरचना एवं नए वार्ड्स का विस्तार
                  </h4>
                  <div className="text-[11px] font-bold text-[#047857] mt-0.5">
                    Large Scale Infrastructure Upgrades for Jharkhand Hospitals
                  </div>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">
                    सदर अस्पतालों और सुपर-स्पेशियलिटी विंग्स का आधुनिकीकरण — अत्याधुनिक आईसीयू, एनआईसीयू, ब्लड कंपोनेंट सेपरेशन यूनिट्स और डायलिसिस सुविधाओं का व्यापक विस्तार।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="text-emerald-700">✓ Sadar Hospital 500+ Beds</span>
                  <span className="text-slate-700">Multi-Specialty Care</span>
                </div>
              </div>
            </div>

            {/* Highlight 3: Senior Doctor Visits */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200/90 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group hover:border-[#047857]">
              <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                <img 
                  src="/highlight-senior-doctor-visit.jpg" 
                  alt="Senior Doctor Visit in Jharkhand PHC" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#064e3b]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/50 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  <span>Specialist Mentorship</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between border-t-2 border-[#f37021]">
                <div>
                  <h4 className="text-sm font-black text-[#064e3b] leading-snug">
                    वरिष्ठ चिकित्सकों एवं विशेषज्ञों द्वारा प्राथमिक केंद्रों का दौरा
                  </h4>
                  <div className="text-[11px] font-bold text-[#047857] mt-0.5">
                    Senior Doctor Clinical Visits &amp; Patient Audits in PHCs
                  </div>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">
                    वरिष्ठ फिजिशियन, बाल रोग विशेषज्ञ एवं सर्जन नियमित रूप से प्रखंड स्तरीय स्वास्थ्य केंद्रों का दौरा कर गंभीर मरीजों का उपचार एवं स्थानीय डॉक्टरों का मार्गदर्शन करते हैं।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="text-emerald-700">✓ Clinical Protocols</span>
                  <span className="text-slate-700">On-Ground Guidance</span>
                </div>
              </div>
            </div>

            {/* Highlight 4: Regular Doctor Visits in PHC */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200/90 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group hover:border-[#047857]">
              <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                <img 
                  src="/highlight-doctor-visit.webp" 
                  alt="Regular Doctor Visit in PHC" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#064e3b]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/50 flex items-center gap-1 shadow-sm">
                  <Users className="w-3 h-3 text-amber-300" />
                  <span>Daily OPD Coverage</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between border-t-2 border-[#f37021]">
                <div>
                  <h4 className="text-sm font-black text-[#064e3b] leading-snug">
                    प्राथमिक स्वास्थ्य केंद्रों (PHC) में डॉक्टरों की नियमित उपस्थिति
                  </h4>
                  <div className="text-[11px] font-bold text-[#047857] mt-0.5">
                    Regular Doctor Visits &amp; Outpatient Consultations in PHCs
                  </div>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">
                    प्रत्येक ब्लॉक में प्राथमिक केंद्रों पर डॉक्टरों की शत-प्रतिशत दैनिक उपस्थिति सुनिश्चित की गई है। मातृत्व सुरक्षा, टीकाकरण और मुफ्त आवश्यक दवा वितरण सुचारू रूप से संचालित है।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="text-emerald-700">✓ Free Essential Drugs</span>
                  <span className="text-slate-700">Maternal &amp; Child Health</span>
                </div>
              </div>
            </div>

            {/* Highlight 5: Department Surveillance of PHC */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200/90 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group hover:border-[#047857]">
              <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                <img 
                  src="/highlight-department-surveillance.jpg" 
                  alt="Regular Surveillance of PHC by Health Department of Jharkhand" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#064e3b]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/50 flex items-center gap-1 shadow-sm">
                  <Activity className="w-3 h-3 text-emerald-300" />
                  <span>Quality Surveillance</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between border-t-2 border-[#f37021]">
                <div>
                  <h4 className="text-sm font-black text-[#064e3b] leading-snug">
                    स्वास्थ्य विभाग द्वारा PHC/CHC का नियमित फील्ड सर्विलांस एवं निरीक्षण
                  </h4>
                  <div className="text-[11px] font-bold text-[#047857] mt-0.5">
                    Continuous Field Surveillance of PHCs by Health Directorate
                  </div>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">
                    गुणवत्ता नियंत्रण, कोल्ड-चेन वैक्सीन तापमान मॉनिटरिंग, बायो-मेडिकल वेस्ट निस्तारण और पैथोलॉजी लैब परीक्षणों की निरंतर राज्यव्यापी निगरानी एवं डेटा ऑडिट।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="text-emerald-700">✓ Strict Cold-Chain Audit</span>
                  <span className="text-slate-700">Directorate Team</span>
                </div>
              </div>
            </div>

            {/* Highlight 6: Government Meetings for Steps Toward Health */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200/90 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group hover:border-[#047857]">
              <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                <img 
                  src="/highlight-govt-meetings.jpg" 
                  alt="Govt Meetings for Steps Toward Health in Jharkhand" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#064e3b]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/50 flex items-center gap-1 shadow-sm">
                  <FileText className="w-3 h-3 text-amber-300" />
                  <span>Policy &amp; Governance</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between border-t-2 border-[#f37021]">
                <div>
                  <h4 className="text-sm font-black text-[#064e3b] leading-snug">
                    स्वास्थ्य क्षेत्र के सर्वांगीण विकास हेतु उच्चस्तरीय नीतिगत बैठकें
                  </h4>
                  <div className="text-[11px] font-bold text-[#047857] mt-0.5">
                    High-Level Strategic Review Meetings for Healthcare Transformation
                  </div>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-medium">
                    माननीय मंत्री एवं वरिष्ठ अधिकारियों की अध्यक्षता में नियमित समीक्षा बैठकें — स्वास्थ्य बजट आवंटन, नई स्वास्थ्य योजनाओं (मुख्यमंत्री जन आरोग्य योजना) एवं HealthGrid AI लागू करने पर त्वरित निर्णय।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="text-emerald-700">✓ Strategic Health Policy</span>
                  <span className="text-slate-700">State Steering Council</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Official Jharkhand Government Footer */}
      <footer className="w-full bg-[#064e3b] text-white py-8 px-6 md:px-12 text-xs border-t-4 border-[#f37021] z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="font-bold text-sm text-amber-300">स्वास्थ्य एवं परिवार कल्याण विभाग &bull; झारखंड सरकार</div>
            <div className="text-emerald-100 text-[11px]">HealthGrid AI Jharkhand: Citizen Healthcare Services &amp; Emergency Supply Chain Resilience</div>
            <div className="text-emerald-300 text-[10px] mt-1">आपातकालीन एम्बुलेंस: 108 &bull; स्वास्थ्य हेल्पलाइन: 104 &bull; रांची जिला नियंत्रण कक्ष: 0651-2446666</div>
          </div>
          <div className="flex items-center gap-6 text-emerald-100 text-[11px] font-semibold">
            <Link href="/public" className="hover:text-white hover:underline">नागरिक पोर्टल (Citizen Portal)</Link>
            <a href="tel:108" className="hover:text-white hover:underline">108 आपातकालीन</a>
            <a href="tel:104" className="hover:text-white hover:underline">104 हेल्पलाइन</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
