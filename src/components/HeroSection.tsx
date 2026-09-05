'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Activity, AlertTriangle, CheckCircle, MapPin, Zap, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

// Geographically calibrated network nodes placed on India map projection (viewBox: 0 0 400 440)
const INDIA_NETWORK_NODES = [
  { id: 'delhi', name: 'New Delhi Hub', city: 'National Center', type: 'hub', status: 'stable', x: 155, y: 135, beds: 120, stock: '98%' },
  { id: 'lucknow', name: 'Lucknow Command', city: 'Uttar Pradesh', type: 'hub', status: 'critical', x: 215, y: 165, beds: 95, stock: 'Critically Low', issue: '95% Bed Occupancy' },
  { id: 'varanasi', name: 'Varanasi PHC Hub', city: 'Uttar Pradesh', type: 'phc', status: 'attention', x: 245, y: 185, beds: 65, stock: '7 Days', issue: 'Surge Warning' },
  { id: 'patna', name: 'Patna Sadar PHC', city: 'Bihar', type: 'phc', status: 'critical', x: 280, y: 180, beds: 45, stock: '1.8 Days', issue: 'Paracetamol Shortage' },
  { id: 'gaya', name: 'Bodh Gaya PHC', city: 'Bihar', type: 'phc', status: 'attention', x: 275, y: 205, beds: 50, stock: '12 Days', issue: 'Surge +32%' },
  { id: 'ranchi', name: 'Ranchi Regional Hub', city: 'Jharkhand', type: 'hub', status: 'stable', x: 280, y: 230, beds: 80, stock: 'Safe Reserve' },
  { id: 'dhanbad', name: 'Dhanbad Cluster', city: 'Jharkhand', type: 'phc', status: 'stable', x: 300, y: 220, beds: 40, stock: 'Safe Reserve' },
  { id: 'kolkata', name: 'Kolkata Port Buffer', city: 'West Bengal', type: 'hub', status: 'stable', x: 320, y: 240, beds: 110, stock: 'Surplus' },
  { id: 'mumbai', name: 'Mumbai Pharma Gateway', city: 'Maharashtra', type: 'hub', status: 'stable', x: 105, y: 265, beds: 150, stock: 'Surplus' },
  { id: 'hyderabad', name: 'Hyderabad Vaccine Depot', city: 'Telangana', type: 'hub', status: 'stable', x: 185, y: 290, beds: 130, stock: 'Surplus' },
  { id: 'bengaluru', name: 'Bengaluru Medical Center', city: 'Karnataka', type: 'hub', status: 'stable', x: 165, y: 345, beds: 140, stock: 'Surplus' },
];

const INDIA_SUPPLY_CORRIDORS = [
  { from: 'delhi', to: 'lucknow', status: 'stable' },
  { from: 'lucknow', to: 'varanasi', status: 'attention' },
  { from: 'varanasi', to: 'patna', status: 'critical' },
  { from: 'patna', to: 'gaya', status: 'attention' },
  { from: 'patna', to: 'ranchi', status: 'stable' },
  { from: 'ranchi', to: 'dhanbad', status: 'stable' },
  { from: 'dhanbad', to: 'kolkata', status: 'stable' },
  { from: 'delhi', to: 'mumbai', status: 'stable' },
  { from: 'mumbai', to: 'hyderabad', status: 'stable' },
  { from: 'hyderabad', to: 'bengaluru', status: 'stable' },
  { from: 'hyderabad', to: 'ranchi', status: 'stable' },
];

export default function HeroSection() {
  const [selectedNode, setSelectedNode] = useState(INDIA_NETWORK_NODES[3]); // Default to Patna
  const [livePulse, setLivePulse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLivePulse(prev => !prev);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full bg-white overflow-hidden min-h-screen flex flex-col">
      {/* Header / Navigation */}
      <header className="w-full px-6 py-4 md:px-12 flex items-center justify-between z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-700 p-2 rounded-lg text-white">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">HealthGrid</span>
            <span className="text-xs text-emerald-700 font-semibold ml-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">AI</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/dashboard" className="hover:text-emerald-700 transition-colors">Command Center</Link>
          <Link href="/simulator" className="hover:text-emerald-700 transition-colors">Digital Twin Simulator</Link>
          <Link href="/public" className="hover:text-emerald-700 transition-colors">Citizen Portal</Link>
          <a href="https://github.com/weber011/techforge" target="_blank" rel="noreferrer" className="hover:text-emerald-700 transition-colors">GitHub</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="px-5 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm">
            Launch Platform
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 z-10">
        
        {/* Left Column: Typography & CTAs */}
        <div className="flex-1 flex flex-col items-start max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide uppercase mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            National Public Healthcare Intelligence
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
            See the Crisis <br/>
            <span className="text-emerald-700">Before It Happens.</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl font-light">
            AI-powered supply chain resilience platform connecting government command centers, frontline PHCs, and citizens across India with real-time risk telemetry and smart resource redistribution.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-8">
            <Link href="/dashboard" className="w-full sm:w-auto px-7 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group">
              Explore Command Center
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/simulator" className="w-full sm:w-auto px-7 py-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Run Emergency Simulator
            </Link>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 w-full max-w-md">
            <div>
              <div className="text-xl font-bold text-slate-900">30 PHCs</div>
              <div className="text-xs text-slate-500">Live Telemetry</div>
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-700">72-Hour</div>
              <div className="text-xs text-slate-500">Shortage Radar</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">Zero-Waste</div>
              <div className="text-xs text-slate-500">FEFO Transfers</div>
            </div>
          </div>
        </div>

        {/* Right Column: India Healthcare Network SVG Visualization */}
        <div className="flex-1 w-full flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[520px] bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-800 overflow-hidden group">
            
            {/* Ambient Background Grid & Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Header of the visualization card */}
            <div className="relative flex items-center justify-between mb-4 z-10 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">India HealthGrid Telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                  2 Critical Alerts
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  9 Supply Routes
                </span>
              </div>
            </div>

            {/* India Vector Map Container */}
            <div className="relative w-full h-[320px] bg-slate-950/60 rounded-xl border border-slate-800 p-2 overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full max-h-[300px]" viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Glowing gradients */}
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="alertGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                  </linearGradient>
                  <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Stylized Silhouette Contour of India */}
                <path
                  d="M 160 30 
                     L 185 45 L 205 60 L 195 85 L 180 100 
                     L 240 105 L 280 115 L 340 115 L 365 140 L 350 170 L 310 170
                     L 325 210 L 320 250 L 290 280 L 255 310 L 225 350 L 190 390 L 180 415
                     L 170 395 L 145 350 L 125 300 L 105 260 L 95 230 L 110 200 L 90 180
                     L 95 140 L 130 115 L 140 75 Z"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="transition-colors"
                />

                {/* Topographical Grid Pattern */}
                <path
                  d="M 100 150 L 330 150 M 100 230 L 320 230 M 120 310 L 250 310 M 160 60 L 160 380 M 240 90 L 240 330 M 290 140 L 290 280"
                  stroke="#1e293b"
                  strokeWidth="0.75"
                />

                {/* Connecting Inter-Facility Supply Corridors */}
                {INDIA_SUPPLY_CORRIDORS.map((corridor, idx) => {
                  const src = INDIA_NETWORK_NODES.find(n => n.id === corridor.from);
                  const dst = INDIA_NETWORK_NODES.find(n => n.id === corridor.to);
                  if (!src || !dst) return null;

                  const isCritical = corridor.status === 'critical';
                  const isAttention = corridor.status === 'attention';

                  return (
                    <g key={idx}>
                      {/* Glow line */}
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={dst.x}
                        y2={dst.y}
                        stroke={isCritical ? '#ef4444' : isAttention ? '#f59e0b' : '#10b981'}
                        strokeWidth={isCritical ? '2.5' : '1.5'}
                        strokeOpacity={isCritical ? '0.8' : '0.4'}
                        strokeDasharray={isCritical ? '4 3' : isAttention ? '6 4' : 'none'}
                        className={isCritical ? 'animate-pulse' : ''}
                      />
                    </g>
                  );
                })}

                {/* Regional Facility & Command Nodes */}
                {INDIA_NETWORK_NODES.map((node) => {
                  const isSelected = selectedNode.id === node.id;
                  const isCritical = node.status === 'critical';
                  const isAttention = node.status === 'attention';
                  const nodeColor = isCritical ? '#ef4444' : isAttention ? '#f59e0b' : '#10b981';

                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      {/* Radar Pulse for Critical / Attention Nodes */}
                      {(isCritical || isAttention) && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isCritical ? (livePulse ? 22 : 12) : 12}
                          fill={isCritical ? 'url(#radarGlow)' : 'rgba(245, 158, 11, 0.15)'}
                          className="transition-all duration-1000 ease-out"
                        />
                      )}

                      {/* Selection Ring */}
                      {isSelected && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="10"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                      )}

                      {/* Core Node Circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.type === 'hub' ? 5.5 : 4}
                        fill={nodeColor}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="drop-shadow-md"
                      />

                      {/* Node Label Text */}
                      <text
                        x={node.x + 8}
                        y={node.y + 3}
                        fill={isCritical ? '#fca5a5' : isAttention ? '#fde68a' : '#cbd5e1'}
                        fontSize="9"
                        fontWeight={isCritical || isSelected ? '700' : '500'}
                        className="select-none pointer-events-none"
                      >
                        {node.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Interactive Selected Facility Telemetry Card */}
            <div className="mt-4 bg-slate-800/90 rounded-xl p-3.5 border border-slate-700/80 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                  selectedNode.status === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  selectedNode.status === 'attention' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {selectedNode.status === 'critical' ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <MapPin className="w-5 h-5 text-emerald-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {selectedNode.name}
                    <span className="text-[10px] text-slate-400 font-normal">({selectedNode.city})</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {selectedNode.issue ? (
                      <span className="text-red-400 font-medium">{selectedNode.issue}</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">Supply Status: {selectedNode.stock}</span>
                    )}
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors shrink-0"
              >
                Inspect ➔
              </Link>
            </div>

            {/* Real-Time Telemetry Feed Footer */}
            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                <span>Telemetry: <strong>Patna ⇄ Lucknow [Redistribution Active]</strong></span>
              </span>
              <span className="text-slate-500">Tap nodes on map</span>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
