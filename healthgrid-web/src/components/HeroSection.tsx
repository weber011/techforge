'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Activity, AlertTriangle, CheckCircle, Map } from 'lucide-react';
import Link from 'next/link';

// Conceptual data structure placeholders for the visualization
const mockNetworkData = {
  status: 'attention', // stable | attention | critical
  nodes: [
    { id: '1', type: 'hub', status: 'stable', x: 20, y: 30 },
    { id: '2', type: 'phc', status: 'attention', x: 45, y: 50 },
    { id: '3', type: 'phc', status: 'critical', x: 70, y: 40 },
    { id: '4', type: 'phc', status: 'stable', x: 80, y: 70 },
    { id: '5', type: 'hub', status: 'stable', x: 30, y: 80 },
  ],
  connections: [
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '1', to: '5' },
    { from: '2', to: '4' },
    { from: '5', to: '4' },
  ]
};

export default function HeroSection() {
  const [networkState, setNetworkState] = useState(mockNetworkData);
  
  // Subtle interaction effect for the network map
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkState(prev => {
        // Toggle status of node 2 for subtle visual life
        const newNodes = [...prev.nodes];
        newNodes[1].status = newNodes[1].status === 'attention' ? 'stable' : 'attention';
        return { ...prev, nodes: newNodes };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full bg-white overflow-hidden min-h-screen flex flex-col">
      {/* Header / Navigation */}
      <header className="w-full px-6 py-4 md:px-12 flex items-center justify-between z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Activity className="text-emerald-700 w-6 h-6" />
          <span className="text-xl font-semibold text-slate-800 tracking-tight">HealthGrid</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="#features" className="hover:text-emerald-700 transition-colors">Features</Link>
          <Link href="#impact" className="hover:text-emerald-700 transition-colors">Impact</Link>
          <Link href="#phcs" className="hover:text-emerald-700 transition-colors">For PHCs</Link>
          <Link href="#about" className="hover:text-emerald-700 transition-colors">About</Link>
        </nav>
        <div className="flex items-center">
          <Link href="/dashboard" className="px-5 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors shadow-sm">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24 flex flex-col lg:flex-row items-center gap-16 z-10">
        
        {/* Left Column: Typography & CTAs */}
        <div className="flex-1 flex flex-col items-start max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold tracking-wide uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Healthcare Resource Intelligence
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
            See the Crisis <br/>
            <span className="text-emerald-700">Before It Happens.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-xl font-light">
            AI-powered resource intelligence for resilient public healthcare networks. Predict shortages, optimize inventory, and protect patient care.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group">
              Explore Command Center
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/simulator" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium text-base transition-all flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              Run Emergency Simulation
            </Link>
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="flex-1 w-full flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg aspect-square bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden group">
            
            {/* Soft decorative background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-emerald-100/30 rounded-full blur-3xl opacity-50"></div>
            
            {/* Header of the visualization card */}
            <div className="relative flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Map className="w-4 h-4" />
                <span>Regional Network Status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Live</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>

            {/* Network Graph Visualization Area */}
            <div className="relative w-full h-[60%] border border-slate-200/50 rounded-2xl bg-white shadow-sm overflow-hidden p-4">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                {/* Connections */}
                {networkState.connections.map((conn, idx) => {
                  const fromNode = networkState.nodes.find(n => n.id === conn.from);
                  const toNode = networkState.nodes.find(n => n.id === conn.to);
                  if (!fromNode || !toNode) return null;
                  
                  // Determine line color based on node status
                  const isCritical = fromNode.status === 'critical' || toNode.status === 'critical';
                  const isAttention = fromNode.status === 'attention' || toNode.status === 'attention';
                  
                  return (
                    <line 
                      key={idx}
                      x1={fromNode.x} y1={fromNode.y} 
                      x2={toNode.x} y2={toNode.y}
                      stroke={isCritical ? '#fecaca' : isAttention ? '#fef08a' : '#e2e8f0'}
                      strokeWidth="0.5"
                      strokeDasharray={isCritical ? "2,2" : "none"}
                      className="transition-all duration-1000 ease-in-out"
                    />
                  );
                })}
                
                {/* Nodes */}
                {networkState.nodes.map(node => {
                  let fillColor = '#10b981'; // emerald-500 (stable)
                  let pulseColor = 'rgba(16, 185, 129, 0.2)';
                  if (node.status === 'critical') {
                    fillColor = '#ef4444'; // red-500
                    pulseColor = 'rgba(239, 68, 68, 0.2)';
                  } else if (node.status === 'attention') {
                    fillColor = '#f59e0b'; // amber-500
                    pulseColor = 'rgba(245, 158, 11, 0.2)';
                  }

                  const radius = node.type === 'hub' ? 3.5 : 2;

                  return (
                    <g key={node.id} className="transition-all duration-1000 ease-in-out">
                      {/* Pulse ring for non-stable nodes */}
                      {node.status !== 'stable' && (
                        <circle cx={node.x} cy={node.y} r={radius * 2.5} fill={pulseColor} className="animate-pulse" />
                      )}
                      <circle 
                        cx={node.x} cy={node.y} r={radius} 
                        fill={fillColor} 
                        stroke="#ffffff" 
                        strokeWidth="0.75"
                        className="drop-shadow-sm transition-colors duration-1000"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Contextual UI indicators below the graph */}
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
              <div className="flex flex-col gap-3 w-full">
                {/* Indicator 1 */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group-hover:-translate-y-1 transition-transform duration-500 ease-out">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-medium">Supply Route</span>
                      <span className="text-sm text-slate-800 font-semibold">Stable</span>
                    </div>
                  </div>
                </div>
                {/* Indicator 2 */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group-hover:-translate-y-1 transition-transform duration-500 ease-out delay-75">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-medium">Risk Detected</span>
                      <span className="text-sm text-slate-800 font-semibold">Critical Priority</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
