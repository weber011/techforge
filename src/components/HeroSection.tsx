'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Activity, AlertTriangle, CheckCircle, MapPin, Zap, ShieldAlert, Building2, Users, FileText, HeartPulse, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import NewsTicker from '@/components/NewsTicker';
import { RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';

// Geographically calibrated network nodes placed on Jharkhand State map projection (viewBox: 0 0 420 360)
const JHARKHAND_STATE_NODES = [
  { id: 'RNC-DH-001', name: 'Sadar Hospital Ranchi', district: 'Ranchi (Central)', type: 'DH', status: 'stable', x: 210, y: 175, beds: 500, stock: 'Safe Reserve', issue: '' },
  { id: 'RNC-CHC-002', name: 'CHC Ratu (Ushamatu)', district: 'Ranchi (West)', type: 'CHC', status: 'critical', x: 175, y: 170, beds: 30, stock: '1.8 Days', issue: 'Paracetamol Shortage & 93% Beds' },
  { id: 'RNC-CHC-004', name: 'CHC Kanke', district: 'Ranchi (North)', type: 'CHC', status: 'stable', x: 205, y: 145, beds: 35, stock: 'Surplus (Safe Donor)', issue: '' },
  { id: 'RNC-PHC-003', name: 'PHC Namkum', district: 'Ranchi (East)', type: 'PHC', status: 'attention', x: 240, y: 185, beds: 25, stock: '5.2 Days', issue: 'Antibiotic Buffer Low' },
  { id: 'RNC-CHC-006', name: 'CHC Bero', district: 'Ranchi (South-West)', type: 'CHC', status: 'critical', x: 145, y: 205, beds: 30, stock: '2.4 Days', issue: 'Gastro Surge & Staff Deficit' },
  { id: 'RNC-CHC-005', name: 'CHC Ormanjhi', district: 'Ranchi (North-East)', type: 'CHC', status: 'stable', x: 245, y: 140, beds: 30, stock: 'Safe Reserve', issue: '' },
  { id: 'RNC-CHC-007', name: 'CHC Mandar', district: 'Ranchi (North-West)', type: 'CHC', status: 'stable', x: 150, y: 140, beds: 30, stock: 'Safe Reserve', issue: '' },
  { id: 'RNC-SDH-008', name: 'SDH Bundu', district: 'Ranchi (South-East)', type: 'SDH', status: 'stable', x: 270, y: 235, beds: 100, stock: 'Safe Reserve', issue: '' },
  
  // State Key Hubs
  { id: 'JSR-01', name: 'Jamshedpur MGM Hub', district: 'East Singhbhum', type: 'DH', status: 'stable', x: 310, y: 275, beds: 400, stock: 'Surplus', issue: '' },
  { id: 'DHN-01', name: 'Dhanbad SNMMCH', district: 'Dhanbad', type: 'DH', status: 'stable', x: 295, y: 135, beds: 450, stock: 'Surplus', issue: '' },
  { id: 'HZB-01', name: 'Hazaribagh Sadar', district: 'Hazaribagh', type: 'DH', status: 'stable', x: 215, y: 100, beds: 250, stock: 'Surplus', issue: '' },
  { id: 'BKO-01', name: 'Bokaro General', district: 'Bokaro', type: 'DH', status: 'stable', x: 270, y: 160, beds: 300, stock: 'Safe Reserve', issue: '' },
  { id: 'DGH-01', name: 'Deoghar AIIMS Hub', district: 'Deoghar', type: 'DH', status: 'stable', x: 340, y: 80, beds: 500, stock: 'Surplus', issue: '' },
];

const JHARKHAND_SUPPLY_CORRIDORS = [
  { from: 'RNC-DH-001', to: 'RNC-CHC-002', status: 'critical' },
  { from: 'RNC-CHC-004', to: 'RNC-CHC-002', status: 'stable' }, // Safe Donor route
  { from: 'RNC-DH-001', to: 'RNC-PHC-003', status: 'attention' },
  { from: 'RNC-CHC-002', to: 'RNC-CHC-006', status: 'critical' },
  { from: 'RNC-CHC-002', to: 'RNC-CHC-007', status: 'stable' },
  { from: 'RNC-DH-001', to: 'RNC-CHC-005', status: 'stable' },
  { from: 'RNC-PHC-003', to: 'RNC-SDH-008', status: 'stable' },
  { from: 'RNC-DH-001', to: 'HZB-01', status: 'stable' },
  { from: 'HZB-01', to: 'DHN-01', status: 'stable' },
  { from: 'DHN-01', to: 'BKO-01', status: 'stable' },
  { from: 'RNC-DH-001', to: 'BKO-01', status: 'stable' },
  { from: 'RNC-SDH-008', to: 'JSR-01', status: 'stable' },
  { from: 'DHN-01', to: 'DGH-01', status: 'stable' },
];

export default function HeroSection() {
  const [selectedNode, setSelectedNode] = useState(JHARKHAND_STATE_NODES[1]); // CHC Ratu
  const [livePulse, setLivePulse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setLivePulse(p => !p), 2000);
    return () => clearInterval(timer);
  }, []);

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
        <main className="w-full max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 flex flex-col lg:flex-row items-center gap-10 lg:gap-14 relative z-10">
          
          {/* Left Column: Vision, Objectives & CTAs */}
          <div className="flex-1 flex flex-col items-start max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 text-[#064e3b] text-xs font-black tracking-wide uppercase mb-6 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#047857] animate-pulse"></span>
              झारखंड स्वास्थ्य ग्रिड &bull; HEALTHGRID JHARKHAND
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black text-[#064e3b] tracking-tight leading-[1.12] mb-5">
              Predict. Prepare. <br/>
              <span className="text-[#047857]">Redistribute. Save.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed mb-8 font-semibold drop-shadow-xs">
              झारखंड के प्राथमिक स्वास्थ्य केंद्रों (PHC) और जिला अस्पतालों को जोड़ने वाला रीयल-टाइम स्वास्थ्य ग्रिड — <strong>72 घंटे पूर्व दवा संकट पूर्वानुमान</strong>, <strong>GIS आधारित नजदीकी सुविधा खोज</strong>, और <strong>स्वचालित इंटर-PHC दवा पुनर्वितरण</strong>।
            </p>
            
            {/* 100% Public-Oriented Quick Access Cards with Green & White Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full mb-8">
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
                className="p-4 bg-white/95 border-2 border-emerald-600 text-[#064e3b] rounded-xl shadow-md hover:shadow-lg hover:bg-emerald-50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[#047857] mb-2">
                    <Activity className="w-5 h-5 text-[#047857]" />
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-xs font-black text-[#064e3b]">आपातकालीन सहायता</div>
                  <div className="text-[11px] font-bold text-emerald-800">108 / 104 Helplines</div>
                  <div className="text-[10px] text-slate-600 mt-1">Direct Emergency Ambulance</div>
                </div>
              </Link>
            </div>

          {/* Verification Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 rounded-lg font-bold text-[#064e3b] border border-emerald-300 shadow-2xs">
              <CheckCircle className="w-4 h-4 text-[#047857]" />
              10 Verified Ranchi PHCs
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 rounded-lg font-bold text-[#064e3b] border border-emerald-300 shadow-2xs">
              <Zap className="w-4 h-4 text-amber-500" />
              72h Outbreak Radar
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 rounded-lg font-bold text-[#064e3b] border border-emerald-300 shadow-2xs">
              <MapPin className="w-4 h-4 text-emerald-700" />
              GIS Geodesic Routing
            </span>
          </div>
        </div>

        {/* Right Column: Light / White Theme Jharkhand Healthcare Network Map */}
        <div className="flex-1 w-full flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[500px] bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border-2 border-emerald-300 overflow-hidden">
            
            {/* Soft Ambient Light Glows */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-red-100/40 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header of Map Card */}
            <div className="relative flex items-center justify-between pb-3 border-b border-emerald-100 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span className="text-xs font-black text-[#064e3b] tracking-wide uppercase">झारखंड स्वास्थ्य जीआईएस नेटवर्क / GIS NETWORK</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold">
                  2 Critical
                </span>
                <span className="text-[10px] bg-emerald-50 text-[#064e3b] border border-emerald-300 px-2 py-0.5 rounded font-bold">
                  11 Corridors
                </span>
              </div>
            </div>

            {/* SVG GIS Map of Jharkhand State in Light Theme */}
            <div className="relative w-full h-[300px] bg-emerald-50/40 rounded-2xl my-3.5 border border-emerald-200 p-2 overflow-hidden flex items-center justify-center shadow-inner">
              <svg className="w-full h-full" viewBox="0 0 420 360" fill="none" xmlns="http://www.w3.org/2000/svg">
                
                {/* Accurate Contour of Jharkhand State Silhouette */}
                <path
                  d="M 120 40 
                     L 165 30 L 220 45 L 265 35 L 310 50 L 370 70 L 385 105 L 360 145 
                     L 375 185 L 350 230 L 360 280 L 320 330 L 270 310 L 230 335 L 180 320
                     L 130 300 L 95 270 L 80 220 L 60 170 L 85 110 L 105 75 Z"
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Sub-District Grid / Topography Lines */}
                <path
                  d="M 100 120 L 360 120 M 80 200 L 360 200 M 110 270 L 330 270 M 180 40 L 180 320 M 260 45 L 260 320 M 320 60 L 320 300"
                  stroke="#d1fae5"
                  strokeWidth="0.75"
                />

                {/* Regional Supply Corridors */}
                {JHARKHAND_SUPPLY_CORRIDORS.map((link, idx) => {
                  const src = JHARKHAND_STATE_NODES.find(n => n.id === link.from);
                  const dst = JHARKHAND_STATE_NODES.find(n => n.id === link.to);
                  if (!src || !dst) return null;
                  const isCrit = link.status === 'critical';
                  const isAtt = link.status === 'attention';

                  return (
                    <line
                      key={idx}
                      x1={src.x} y1={src.y}
                      x2={dst.x} y2={dst.y}
                      stroke={isCrit ? '#ef4444' : isAtt ? '#f59e0b' : '#059669'}
                      strokeWidth={isCrit ? 2.5 : 1.5}
                      strokeOpacity={isCrit ? 0.9 : 0.6}
                      strokeDasharray={isCrit ? '4 3' : 'none'}
                      className={isCrit ? 'animate-pulse' : ''}
                    />
                  );
                })}

                {/* Facility & District Hub Nodes */}
                {JHARKHAND_STATE_NODES.map((node) => {
                  const isSelected = selectedNode.id === node.id;
                  const isCrit = node.status === 'critical';
                  const isAtt = node.status === 'attention';
                  const nodeColor = isCrit ? '#ef4444' : isAtt ? '#f59e0b' : '#047857';

                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer transition-transform hover:scale-115"
                    >
                      {/* Radar Pulse for Critical / Warning Nodes */}
                      {(isCrit || isAtt) && (
                        <circle
                          cx={node.x} cy={node.y}
                          r={isCrit ? (livePulse ? 22 : 11) : 10}
                          fill={isCrit ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)'}
                          className="transition-all duration-1000"
                        />
                      )}

                      {/* Selection Ring */}
                      {isSelected && (
                        <circle
                          cx={node.x} cy={node.y} r="11"
                          fill="none" stroke="#064e3b" strokeWidth="2.5" strokeDasharray="2 2"
                        />
                      )}

                      {/* Core Node Circle with crisp white border */}
                      <circle
                        cx={node.x} cy={node.y}
                        r={node.type === 'DH' ? 6 : node.type === 'SDH' ? 5 : 4.5}
                        fill={nodeColor}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="drop-shadow-sm"
                      />

                      {/* Node Label */}
                      <text
                        x={node.x + 8} y={node.y + 3.5}
                        fill={isCrit ? '#b91c1c' : isAtt ? '#b45309' : '#064e3b'}
                        fontSize="9.5"
                        fontWeight={isCrit || isSelected ? '900' : '700'}
                        className="select-none pointer-events-none"
                      >
                        {node.name.replace('Community Health Centre', 'CHC').replace('Primary Health Centre', 'PHC').replace('Sub-Divisional Hospital', 'SDH').split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Node Details Bar (Light Theme) */}
            <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between text-xs z-10 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                  selectedNode.status === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                  selectedNode.status === 'attention' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  'bg-emerald-100 text-[#064e3b] border border-emerald-300'
                }`}>
                  {selectedNode.status === 'critical' ? <AlertTriangle className="w-5 h-5" /> : <MapPin className="w-5 h-5 text-[#047857]" />}
                </div>
                <div>
                  <div className="font-bold text-[#064e3b] flex items-center gap-1.5">
                    {selectedNode.name}
                    <span className="text-[10px] text-slate-500 font-normal">({selectedNode.district})</span>
                  </div>
                  <div className="text-[11px] mt-0.5">
                    {selectedNode.issue ? (
                      <span className="text-red-600 font-bold">{selectedNode.issue}</span>
                    ) : (
                      <span className="text-[#047857] font-bold">Stock: {selectedNode.stock} &bull; {selectedNode.beds} Inpatient Beds</span>
                    )}
                  </div>
                </div>
              </div>
              <Link
                href="/public"
                className="px-3.5 py-1.5 bg-[#064e3b] hover:bg-[#047857] text-white font-bold rounded-lg text-[11px] shrink-0 transition-colors shadow-2xs"
              >
                सुविधा देखें ➔
              </Link>
            </div>

            {/* Live Telemetry Notification Footer */}
            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-600 px-1 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>Active Requisition: <strong>CHC Ratu ← CHC Kanke [500 units Paracetamol]</strong></span>
              </span>
              <span className="text-emerald-700 font-bold">Click nodes</span>
            </div>

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
