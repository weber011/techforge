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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-700 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">Command Center</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">HEALTHGRID AI</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-emerald-700 border-b-2 border-emerald-700 pb-1">
            Overview
          </Link>
          <Link href="/simulator" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            Emergency Simulator
          </Link>
          <Link href="/public" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            Public Portal
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/simulator" className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-md flex items-center gap-2 hover:bg-red-100 transition-colors">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-red-700">Emergency Mode</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8">
        
        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Total Facilities</span>
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {loading ? '...' : totalFacilities}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-red-600">Critical Risk PHCs</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-700">
              {loading ? '...' : criticalFacilities}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-amber-600">Active Alerts</span>
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-amber-700">
              {loading ? '...' : activeAlerts}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Pending Transfers</span>
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {loading ? '...' : 3}
            </div>
          </div>
        </section>

        {/* Data Tables & Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Facility List */}
          <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-base font-semibold text-slate-800">Network Facilities</h2>
              <Link href="/public" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                Public Directory
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Facility</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">District</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Score</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading network data...</td></tr>
                  ) : phcs.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">No facilities found.</td></tr>
                  ) : (
                    phcs.slice(0, 8).map((phc) => (
                      <tr key={phc.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-slate-800">{phc.name}</div>
                          <div className="text-xs text-slate-500">{phc.totalBeds} Beds</div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{phc.district}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            phc.type === 'NORMAL' ? 'bg-emerald-50 text-emerald-700' : 
                            phc.type === 'EMERGENCY' ? 'bg-red-50 text-red-700' : 
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {phc.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${phc.riskScore > 75 ? 'bg-red-500' : phc.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${phc.riskScore}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-slate-600">{Math.round(phc.riskScore)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link href="/simulator" className="text-slate-400 hover:text-emerald-700 p-1 rounded-md hover:bg-emerald-50 transition-colors inline-block">
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && phcs.length > 8 && (
              <div className="p-4 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-500">Showing 8 of {phcs.length} facilities</span>
              </div>
            )}
          </section>

          {/* Right Sidebar: AI Copilot & Alerts */}
          <aside className="flex flex-col gap-6">
            
            {/* AI Copilot Widget */}
            <div className="bg-slate-900 rounded-xl p-5 shadow-sm text-white flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="w-24 h-24" />
              </div>
              <div className="relative z-10 flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h3 className="text-sm font-semibold tracking-wide text-emerald-400 uppercase">AI Copilot</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  &ldquo;I have detected a projected stock-out of Paracetamol at Patna Sadar PHC within 48 hours. Recommend transferring 500 units from Danapur PHC.&rdquo;
                </p>
                <div className="flex gap-2">
                  <Link href="/simulator" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium py-2 rounded text-center transition-colors shadow-sm">
                    Simulate Crisis
                  </Link>
                </div>
              </div>
            </div>

            {/* Critical Alerts Feed */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Priority Alerts</h3>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3 items-start p-3 bg-red-50/50 rounded-lg border border-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-red-800">Bed Capacity Critical</h4>
                    <p className="text-xs text-red-600 mt-1">Lucknow Chinhat PHC has reached 95% occupancy.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                  <Package className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-amber-800">Approaching Expiry</h4>
                    <p className="text-xs text-amber-600 mt-1">200 units of Amoxicillin at Ranchi Sadar PHC expiring in 14 days.</p>
                  </div>
                </div>
              </div>
            </div>

          </aside>

        </div>
      </main>
    </div>
  );
}
