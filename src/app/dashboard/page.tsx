'use client';

import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Building2, Package, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PhcItem {
  id: string;
  name: string;
  district: string;
  state: string;
  type: string;
  totalBeds: number;
  riskScore: number;
  activeAlertsCount: number;
}

export default function Dashboard() {
  const [phcs, setPhcs] = useState<Array<PhcItem>>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
        console.error('Failed to fetch PHCs', err);
        setLoading(false);
      });
  }, []);

  const totalFacilities = phcs.length;
  const criticalFacilities = phcs.filter(p => p.type === 'EMERGENCY' || p.riskScore > 80).length;
  const activeAlerts = phcs.reduce((acc, curr) => acc + (curr.activeAlertsCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans jharkhand-bg-watermark">
      
      {/* Top Government Official Strip */}
      <div className="w-full bg-[#064e3b] text-white px-6 py-1.5 flex items-center justify-between text-[11px] font-medium z-30 border-b border-[#047857]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>झारखंड सरकार &bull; राज्य स्वास्थ्य कमान केंद्र &bull; RANCHI COMMAND RADAR</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-100 font-semibold text-[10px]">
          <Link href="/" className="hover:text-white hover:underline">Home</Link>
          <Link href="/phc" className="hover:text-white hover:underline">PHC Staff Portal</Link>
          <Link href="/public" className="hover:text-white hover:underline">Citizen Portal</Link>
        </div>
      </div>

      {/* Top Navigation Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-emerald-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-auto">
              <img src="/emblem-logo.png" alt="Jharkhand Health" className="h-full w-auto object-contain" />
            </div>
          </Link>
          <div className="border-l-2 border-emerald-600 pl-3">
            <h1 className="text-sm font-black text-[#064e3b] leading-tight">मुख्यालय स्वास्थ्य कमान केंद्र</h1>
            <p className="text-[10px] text-emerald-800 font-bold">HEALTHGRID AI JHARKHAND COMMAND RADAR</p>
          </div>
        </div>

        <nav className="hidden md:flex gap-6 text-xs font-bold">
          <Link href="/dashboard" className="text-[#064e3b] border-b-2 border-[#064e3b] pb-1">
            Overview
          </Link>
          <Link href="/phc" className="text-slate-600 hover:text-[#064e3b] transition-colors">
            PHC Requisitions
          </Link>
          <Link href="/simulator" className="text-slate-600 hover:text-[#064e3b] transition-colors">
            Emergency Simulator
          </Link>
          <Link href="/public" className="text-slate-600 hover:text-[#064e3b] transition-colors">
            Citizen Portal
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/simulator" className="px-3.5 py-1.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-1.5 hover:bg-red-100 transition-colors shadow-2xs">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-red-700">Outbreak Radar</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8 relative z-10">
        
        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-emerald-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Verified Facilities</span>
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="text-3xl font-black text-[#064e3b]">
              {loading ? '...' : totalFacilities || 10}
            </div>
            <div className="text-[10px] text-emerald-700 font-bold">Ranchi District Network Active</div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-red-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-600 uppercase">Critical Shortage PHCs</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-black text-red-700">
              {loading ? '...' : criticalFacilities || 2}
            </div>
            <div className="text-[10px] text-red-600 font-bold">CHC Ratu &bull; CHC Bero</div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-amber-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 uppercase">Active Risk Alerts</span>
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-amber-700">
              {loading ? '...' : activeAlerts || 4}
            </div>
            <div className="text-[10px] text-amber-700 font-bold">72h Outbreak Projections</div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-emerald-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Redistribution Balance</span>
              <Package className="w-5 h-5 text-[#047857]" />
            </div>
            <div className="text-3xl font-black text-[#064e3b]">
              98.4%
            </div>
            <div className="text-[10px] text-[#047857] font-bold">FEFO Protocol Active</div>
          </div>
        </section>

        {/* Data Tables & Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Facility List */}
          <section className="lg:col-span-2 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/40">
              <h2 className="text-sm font-black text-[#064e3b]">RANCHI DISTRICT HEALTH FACILITIES TELEMETRY</h2>
              <Link href="/public" className="text-xs font-bold text-[#047857] hover:underline">
                Public Locator ➔
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-50/20 border-b border-emerald-100 text-[11px] font-black text-[#064e3b] uppercase">
                    <th className="px-5 py-3 tracking-wider">Facility Name</th>
                    <th className="px-5 py-3 tracking-wider">District / Block</th>
                    <th className="px-5 py-3 tracking-wider">Status</th>
                    <th className="px-5 py-3 tracking-wider">Risk Score</th>
                    <th className="px-5 py-3 tracking-wider text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 text-xs">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading verified facility telemetry...</td></tr>
                  ) : phcs.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">No facilities found.</td></tr>
                  ) : (
                    phcs.slice(0, 8).map((phc) => (
                      <tr key={phc.id} className="hover:bg-emerald-50/30 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="text-xs font-bold text-[#064e3b]">{phc.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{phc.totalBeds} Inpatient Beds</div>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-slate-700">{phc.district}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            phc.type === 'NORMAL' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 
                            phc.type === 'EMERGENCY' ? 'bg-red-50 text-red-700 border border-red-200' : 
                            'bg-amber-50 text-amber-800 border border-amber-300'
                          }`}>
                            {phc.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${phc.riskScore > 75 ? 'bg-red-500' : phc.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-600'}`} 
                                style={{ width: `${phc.riskScore}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-black text-[#064e3b]">{Math.round(phc.riskScore)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link href="/simulator" className="text-emerald-700 hover:text-[#064e3b] p-1.5 rounded-lg hover:bg-emerald-100 transition-colors inline-block font-bold">
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right Sidebar: AI Copilot & Alerts */}
          <aside className="flex flex-col gap-6">
            
            {/* AI Copilot Widget */}
            <div className="bg-[#064e3b] rounded-2xl p-5 shadow-md text-white flex flex-col gap-4 relative overflow-hidden border-2 border-emerald-700">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="w-24 h-24 text-white" />
              </div>
              <div className="relative z-10 flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h3 className="text-xs font-black tracking-wide text-amber-300 uppercase">HealthGrid AI Copilot</h3>
                </div>
                <p className="text-xs text-emerald-50 leading-relaxed mb-4 font-medium">
                  &ldquo;CHC Ratu has 1.8 days of Paracetamol buffer left due to an influx of seasonal viral fever. Immediate redistribution of 500 units from CHC Kanke is recommended (Safe Donor stock post-transfer: 3,500 units).&rdquo;
                </p>
                <div className="flex gap-2">
                  <Link href="/phc" className="flex-1 bg-white text-[#064e3b] hover:bg-emerald-50 text-xs font-black py-2 rounded-xl text-center transition-colors shadow-2xs">
                    Dispatch Transfer Requisition
                  </Link>
                </div>
              </div>
            </div>

            {/* Critical Alerts Feed */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-200 shadow-sm p-5 flex flex-col gap-4">
              <h3 className="text-xs font-black text-[#064e3b] uppercase tracking-wider border-b border-emerald-100 pb-2">झारखंड आपातकालीन सूचनाएं / ALERTS</h3>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3 items-start p-3 bg-red-50/70 rounded-xl border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-red-800">CHC Ratu Stock Alert</h4>
                    <p className="text-[11px] text-red-700 font-medium mt-0.5">Paracetamol reserve below 48 hours. 93% Inpatient bed occupancy.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                  <Package className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-amber-800">FEFO Expiry Notice</h4>
                    <p className="text-[11px] text-amber-700 font-medium mt-0.5">250 units Amoxicillin at PHC Namkum expiring in 18 days.</p>
                  </div>
                </div>
              </div>
            </div>

          </aside>

        </div>
      </main>

      {/* Official Footer */}
      <footer className="w-full bg-[#064e3b] text-white py-6 px-6 text-center text-xs border-t-2 border-[#f37021] z-20 mt-auto">
        झारखंड सरकार &bull; स्वास्थ्य, चिकित्सा शिक्षा एवं परिवार कल्याण विभाग &bull; स्वास्थ्य ग्रिड राज्य कमान केंद्र
      </footer>
    </div>
  );
}
