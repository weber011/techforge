'use client';

import React, { useState } from 'react';
import { Activity, AlertTriangle, ShieldAlert, ArrowLeft, RefreshCw, Zap, TrendingUp, Bed, Pill } from 'lucide-react';
import Link from 'next/link';

export default function SimulatorPage() {
  const [patientSurge, setPatientSurge] = useState(40);
  const [medicineDemand, setMedicineDemand] = useState(40);
  const [phcUnavailable, setPhcUnavailable] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/emergency/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientDemandIncrease: patientSurge,
          medicineDemandIncrease: medicineDemand,
          phcUnavailable: phcUnavailable || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch (err) {
      console.error('Simulation run failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Digital Twin & Emergency Simulator</h1>
              <p className="text-xs text-slate-500">HEALTHGRID NETWORK RESILIENCE ENGINE</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Simulation Sandbox Mode
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls Column */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6 h-fit">
          <div>
            <h2 className="text-base font-bold text-slate-800">Crisis Stress Parameters</h2>
            <p className="text-xs text-slate-500 mt-1">Simulate acute healthcare surges and cascade vulnerabilities across the network.</p>
          </div>

          {/* Patient Demand Slider */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Patient Footfall Surge
              </label>
              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                +{patientSurge}%
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="10"
              value={patientSurge} 
              onChange={(e) => setPatientSurge(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Baseline (0%)</span>
              <span>Moderate (+40%)</span>
              <span>Severe (+100%)</span>
            </div>
          </div>

          {/* Medicine Demand Slider */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-blue-600" />
                Critical Medicine Demand
              </label>
              <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                +{medicineDemand}%
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="10"
              value={medicineDemand} 
              onChange={(e) => setMedicineDemand(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Node Failure / Closure Simulator */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Simulate Facility Outage (Spillover)
            </label>
            <select 
              value={phcUnavailable} 
              onChange={(e) => setPhcUnavailable(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-800 outline-none"
            >
              <option value="">None (All Facilities Operational)</option>
              <option value="PHC_PAT_01">Patna Sadar PHC (Offline)</option>
              <option value="PHC_LKO_01">Hazratganj Urban PHC (Offline)</option>
              <option value="PHC_RNC_01">Ranchi Sadar PHC (Offline)</option>
              <option value="PHC_GAY_02">Bodh Gaya PHC (Offline)</option>
            </select>
            <p className="text-[11px] text-slate-400">Forces 20% patient redistribution to nearest adjacent district facilities.</p>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleRunSimulation}
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Calculating Network Impact...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Run Digital Twin Simulation
              </>
            )}
          </button>
        </section>

        {/* Results Column */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Header Banner */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulation Output</span>
                <h2 className="text-xl font-bold text-slate-800 mt-0.5">
                  {results ? `${results.impactedFacilities} Critical Nodes Impacted` : 'Simulation Ready'}
                </h2>
              </div>
              {results && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  results.networkStatus === 'SEVERE_STRESS' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  Status: {results.networkStatus.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>

          {/* AI Automated Response Protocol */}
          {results?.recommendations && (
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AI Mitigation Strategy</h3>
              </div>
              <ul className="flex flex-col gap-2">
                {results.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">0{idx + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Impacted Facilities Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-800">Cascade Risk Assessment by Facility</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Facility</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Simulated Risk</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Bed Pressure</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Cascade Alerts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {!results ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        Adjust crisis parameters and click &ldquo;Run Digital Twin Simulation&rdquo; to analyze results.
                      </td>
                    </tr>
                  ) : results.facilityDetails.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        Network resilient. No facilities exceeded critical risk thresholds under this scenario.
                      </td>
                    </tr>
                  ) : (
                    results.facilityDetails.map((fac: any) => (
                      <tr key={fac.phcId} className="hover:bg-slate-50/60">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-800">{fac.name}</div>
                          <div className="text-[11px] text-slate-400">{fac.district}, {fac.state}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            fac.simulatedRisk > 80 ? 'bg-red-50 text-red-700' :
                            fac.simulatedRisk > 50 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {fac.simulatedRisk}/100 ({fac.status})
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-700">
                          {fac.projectedBedOccupancy}%
                        </td>
                        <td className="px-5 py-3.5">
                          {fac.cascadeEffects.map((eff: string, i: number) => (
                            <div key={i} className="text-red-600 text-[11px] flex items-center gap-1">
                              • {eff}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
