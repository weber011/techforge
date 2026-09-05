'use client';

import React, { useEffect, useState } from 'react';
import { 
  Activity, AlertTriangle, Building2, Package, ShieldAlert, 
  ArrowRight, Lock, LogOut, CheckCircle2, RefreshCw, Send, 
  MapPin, Zap, UserCheck, ShieldCheck, TrendingUp, AlertCircle, X, Bell
} from 'lucide-react';
import Link from 'next/link';
import NewsTicker from '@/components/NewsTicker';
import { RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';

export default function GovtPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  
  // Login State
  const [govId, setGovId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Command Data State
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loadingEmergencies, setLoadingEmergencies] = useState<boolean>(false);
  const [activePopupAlert, setActivePopupAlert] = useState<any | null>(null);

  // Check auth
  useEffect(() => {
    const authStatus = sessionStorage.getItem('jh_govt_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  const fetchEmergencies = async () => {
    setLoadingEmergencies(true);
    try {
      const res = await fetch('/api/government/emergencies');
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setEmergencies(data.events);
      }
    } catch (err) {
      console.error('Failed to load emergencies:', err);
    } finally {
      setLoadingEmergencies(false);
    }
  };

  // Setup Real-Time SSE Listener when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchEmergencies();

    // Connect to Server-Sent Events stream
    const eventSource = new EventSource('/api/government/emergencies/stream');

    eventSource.addEventListener('emergency', (e) => {
      try {
        const newEvent = JSON.parse(e.data);
        // Show real-time popup
        setActivePopupAlert(newEvent);
        // Refresh emergencies list
        fetchEmergencies();
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    });

    eventSource.onerror = () => {
      console.warn('SSE connection disconnected. Will auto-retry.');
    };

    return () => {
      eventSource.close();
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    setTimeout(() => {
      if (govId.trim() === 'govtjharkhand123' && password === 'aman123') {
        sessionStorage.setItem('jh_govt_auth', 'true');
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        setLoginError('अमान्य सरकारी आईडी या पासवर्ड (Invalid Govt ID or Password)');
      }
      setIsLoggingIn(false);
    }, 400);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('jh_govt_auth');
    setIsAuthenticated(false);
    setGovId('');
    setPassword('');
  };

  const handleAcknowledge = async (eventId: string) => {
    try {
      const res = await fetch(`/api/government/emergencies/${eventId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officer_id: 'govtjharkhand123' })
      });
      const data = await res.json();
      if (data.success) {
        fetchEmergencies();
        if (activePopupAlert?.event_id === eventId || activePopupAlert?.id === eventId) {
          setActivePopupAlert(null);
        }
      }
    } catch (err) {
      console.error('Failed to acknowledge:', err);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#064e3b] flex items-center justify-center text-white font-sans">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          <span className="text-sm font-bold">झारखंड सरकार स्वास्थ्य ग्रिड सत्यापन...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated: Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans jharkhand-bg-watermark">
        <div className="w-full bg-[#064e3b] text-white px-6 py-2 flex items-center justify-between text-xs font-medium z-20 border-b border-[#047857]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>झारखंड सरकार &bull; GOVERNMENT OF JHARKHAND &bull; OFFICIAL ACCESS ONLY</span>
          </div>
          <div className="text-emerald-200 font-bold text-[11px]">
            HEALTHGRID AI SECURE GATEWAY
          </div>
        </div>

        <NewsTicker />

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-auto">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-emerald-300 overflow-hidden">
            
            <div className="bg-[#064e3b] p-6 text-white text-center relative">
              <div className="w-16 h-16 bg-white rounded-2xl p-2 mx-auto mb-3 shadow-md flex items-center justify-center">
                <img 
                  src="/emblem-logo.png" 
                  alt="Government Emblem" 
                  className="max-h-full max-w-full object-contain" 
                />
              </div>
              <h2 className="text-lg font-black tracking-wide">राज्य स्वास्थ्य कमान केंद्र</h2>
              <p className="text-xs text-emerald-200 font-bold mt-0.5">
                GOVERNMENT COMMAND &amp; RADAR PORTAL
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-[#047857] text-emerald-100 rounded-full text-[10px] font-bold mt-2 border border-emerald-500">
                <Lock className="w-3 h-3 text-amber-300" />
                <span>Restricted to Authorized Health Officials</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="p-6 sm:p-8 flex flex-col gap-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#064e3b]">
                  सरकारी अधिकृत आईडी (Govt Officer ID)
                </label>
                <input
                  type="text"
                  required
                  value={govId}
                  onChange={(e) => setGovId(e.target.value)}
                  placeholder="Enter Official Govt ID"
                  className="w-full text-xs p-3 bg-slate-50 border border-emerald-200 rounded-xl focus:bg-white focus:border-[#064e3b] outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#064e3b]">
                  सुरक्षित पासवर्ड (Security Password)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Officer Password"
                  className="w-full text-xs p-3 bg-slate-50 border border-emerald-200 rounded-xl focus:bg-white focus:border-[#064e3b] outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  256-Bit SSL Encrypted
                </span>
                <span className="text-emerald-700 font-semibold">NIC Jharkhand</span>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-[#064e3b] hover:bg-[#047857] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 border border-emerald-900 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>सत्यापन हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>कमान केंद्र में प्रवेश करें (Authenticate &amp; Enter)</span>
                  </>
                )}
              </button>

              <div className="text-center mt-2">
                <Link href="/" className="text-[11px] font-bold text-emerald-700 hover:text-[#064e3b] hover:underline">
                  ← नागरिक मुख्य पृष्ठ पर वापस जाएं (Back to Public Home)
                </Link>
              </div>
            </form>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium">
              National Informatics Centre (NIC) &bull; HealthGrid AI Jharkhand
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Authenticated Command Center
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans jharkhand-bg-watermark">
      
      {/* REAL-TIME EMERGENCY POPUP MODAL (WITHOUT REFRESH) */}
      {activePopupAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-red-600 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-red-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-black text-red-700">🚨 NEW EMERGENCY ALERT RECEIVED</h3>
                  <p className="text-[10px] text-slate-500 font-bold">REAL-TIME TELEMETRY DISPATCH</p>
                </div>
              </div>
              <button 
                onClick={() => setActivePopupAlert(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-red-50/80 rounded-2xl border border-red-200 flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Event ID:</span>
                <span className="font-black text-red-700">{activePopupAlert.event_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Coordinates:</span>
                <span className="font-bold text-slate-800">
                  {Number(activePopupAlert.latitude).toFixed(4)}°N, {Number(activePopupAlert.longitude).toFixed(4)}°E (&plusmn;{activePopupAlert.location_accuracy}m)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Nearest Facility:</span>
                <span className="font-bold text-[#064e3b]">
                  {RANCHI_FACILITIES_MASTER.find(f => f.facility_id === activePopupAlert.nearest_facility_id)?.facility_name || activePopupAlert.nearest_facility_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Caller Phone:</span>
                {activePopupAlert.contact_phone && activePopupAlert.contact_phone !== 'Not Provided' ? (
                  <a 
                    href={`tel:${activePopupAlert.contact_phone}`} 
                    className="font-black text-red-700 hover:underline bg-red-100 px-2 py-0.5 rounded text-xs tracking-wider"
                  >
                    📞 {activePopupAlert.contact_phone}
                  </a>
                ) : (
                  <span className="font-bold text-slate-500">Not Provided</span>
                )}
              </div>
              {activePopupAlert.citizen_name && activePopupAlert.citizen_name !== 'Citizen Caller' && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Patient / Caller:</span>
                  <span className="font-bold text-slate-800">{activePopupAlert.citizen_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">Severity:</span>
                <span className="font-black text-red-600 bg-red-100 px-2 py-0.5 rounded text-[10px]">
                  {activePopupAlert.severity}
                </span>
              </div>
              <div className="mt-1 pt-1 border-t border-red-200 text-[11px] text-slate-700">
                <strong>Description:</strong> {activePopupAlert.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${activePopupAlert.latitude},${activePopupAlert.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View on Map</span>
              </a>

              <button
                onClick={() => handleAcknowledge(activePopupAlert.id || activePopupAlert.event_id)}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Acknowledge Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="w-full bg-[#064e3b] text-white px-6 py-1.5 flex items-center justify-between text-[11px] font-medium z-30 border-b border-[#047857]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>झारखंड सरकार &bull; राज्य स्वास्थ्य कमान केंद्र &bull; RANCHI COMMAND RADAR</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-100 font-semibold text-[10px]">
          <span className="bg-[#047857] px-2.5 py-0.5 rounded text-amber-300 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            OFFICER: govtjharkhand123
          </span>
          <button 
            onClick={handleLogout}
            className="hover:text-red-300 transition-colors flex items-center gap-1 font-bold text-red-200"
          >
            <LogOut className="w-3 h-3" />
            <span>लॉगआउट (Logout)</span>
          </button>
        </div>
      </div>

      <NewsTicker />

      <header className="w-full bg-white/95 backdrop-blur-md border-b border-emerald-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/govt" className="flex items-center gap-2">
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
          <Link href="/govt" className="text-[#064e3b] border-b-2 border-[#064e3b] pb-1">
            Overview &amp; Radar
          </Link>
          <Link href="/phc" className="text-slate-600 hover:text-[#064e3b] transition-colors">
            PHC Portal
          </Link>
          <Link href="/simulator" className="text-slate-600 hover:text-[#064e3b] transition-colors">
            Digital Twin Simulator
          </Link>
          <Link href="/public" className="text-slate-600 hover:text-[#064e3b] transition-colors">
            Citizen View
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/simulator" className="px-3.5 py-1.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-1.5 hover:bg-red-100 transition-colors shadow-2xs">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-red-700">72h Outbreak Radar</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-slate-300"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
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
              {RANCHI_FACILITIES_MASTER.length}
            </div>
            <div className="text-[10px] text-emerald-700 font-bold">Ranchi District Network Active</div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-red-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-600 uppercase">Active Citizen Emergencies</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-black text-red-700">
              {emergencies.filter(e => e.status !== 'RESOLVED' && e.status !== 'CANCELLED').length}
            </div>
            <div className="text-[10px] text-red-600 font-bold">Live Real-Time Stream Connected</div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-amber-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase">Outbreak Warning</span>
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-amber-700">
              2 Zones
            </div>
            <div className="text-[10px] text-amber-700 font-bold">Viral Fever Surge in Ratu &bull; Bero</div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-emerald-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#064e3b] uppercase">AI Supply Corridors</span>
              <Zap className="w-5 h-5 text-[#047857]" />
            </div>
            <div className="text-3xl font-black text-[#064e3b]">
              11 Active
            </div>
            <div className="text-[10px] text-emerald-700 font-bold">Automatic Inter-PHC Balancing</div>
          </div>
        </section>

        {/* Live Emergency Queue & Ranchi Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Emergencies Queue */}
          <div className="lg:col-span-2 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-red-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-red-100">
              <div>
                <h3 className="text-sm font-black text-red-700 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                  नागरिक आपातकालीन कतार / LIVE CITIZEN EMERGENCY RADAR
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Real-time incoming alerts from Public Portal</p>
              </div>
              <button 
                onClick={fetchEmergencies}
                className="p-2 hover:bg-red-50 rounded-lg text-red-700 transition-colors border border-red-200"
              >
                <RefreshCw className={`w-4 h-4 ${loadingEmergencies ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-black uppercase text-[10px]">
                    <th className="py-2.5 px-3">Event ID</th>
                    <th className="py-2.5 px-2">Time</th>
                    <th className="py-2.5 px-2">Caller Phone</th>
                    <th className="py-2.5 px-2">Coordinates</th>
                    <th className="py-2.5 px-2">Nearest PHC</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {emergencies.map((emg) => (
                    <tr key={emg.id || emg.event_id} className="hover:bg-red-50/30 transition-colors">
                      <td className="py-3 px-3 font-black text-red-700">
                        {emg.event_id}
                      </td>
                      <td className="py-3 px-2 text-slate-500 font-medium text-[11px]">
                        {new Date(emg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-2 text-[11px]">
                        {emg.contact_phone && emg.contact_phone !== 'Not Provided' ? (
                          <a href={`tel:${emg.contact_phone}`} className="font-bold text-red-700 hover:underline">
                            📞 {emg.contact_phone}
                          </a>
                        ) : (
                          <span className="text-slate-400 font-medium">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-2 font-mono text-[11px]">
                        {Number(emg.latitude).toFixed(3)}°N, {Number(emg.longitude).toFixed(3)}°E
                      </td>
                      <td className="py-3 px-2 font-bold text-[#064e3b]">
                        {RANCHI_FACILITIES_MASTER.find(f => f.facility_id === emg.nearest_facility_id)?.facility_name.split(' ')[0] || emg.nearest_facility_id}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          emg.status === 'RECEIVED' ? 'bg-red-100 text-red-700 border border-red-300' :
                          emg.status === 'ACKNOWLEDGED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-emerald-100 text-[#064e3b] border border-emerald-300'
                        }`}>
                          {emg.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {emg.status === 'RECEIVED' && (
                          <button
                            onClick={() => handleAcknowledge(emg.id || emg.event_id)}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Outbreak Radar Info Box */}
          <div className="flex flex-col gap-5">
            <div className="bg-[#064e3b] text-white rounded-2xl p-5 shadow-sm flex flex-col gap-3 border border-emerald-900">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-300" />
                <h4 className="text-xs font-black uppercase tracking-wide">72H AI OUTBREAK RADAR</h4>
              </div>
              <p className="text-[11px] text-emerald-100 leading-relaxed font-medium">
                Predictive telemetry detects a <strong>+42% surge</strong> in viral febrile cases across the Ratu-Bero rural corridor over the next 72 hours.
              </p>
              <div className="p-3 bg-[#047857] rounded-xl border border-emerald-500 text-[11px] flex flex-col gap-1">
                <div className="font-bold text-amber-300">Command Directive:</div>
                <div className="text-emerald-100">
                  Pre-allocate 1,500 units Paracetamol &amp; 800 units ORS from Ranchi Central Sadar Depots.
                </div>
              </div>
              <Link
                href="/simulator"
                className="mt-1 py-2 bg-white text-[#064e3b] hover:bg-emerald-50 rounded-xl font-bold text-xs text-center transition-colors shadow-2xs"
              >
                Run Digital Twin Simulation ➔
              </Link>
            </div>
          </div>

        </div>

      </main>

      <footer className="w-full bg-[#064e3b] text-white py-6 px-6 text-center text-xs border-t-4 border-[#f37021] mt-auto">
        झारखंड सरकार &bull; स्वास्थ्य एवं परिवार कल्याण विभाग &bull; राज्य स्वास्थ्य कमान केंद्र (govtjharkhand123)
      </footer>

    </div>
  );
}
