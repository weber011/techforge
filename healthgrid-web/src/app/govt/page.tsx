'use client';

import React, { useEffect, useState } from 'react';
import { 
  Activity, AlertTriangle, Building2, Package, ShieldAlert, 
  ArrowRight, Lock, LogOut, CheckCircle2, RefreshCw, Send, 
  MapPin, Zap, UserCheck, ShieldCheck, TrendingUp, AlertCircle, X, Bell,
  MessageSquare, Plus, CheckCircle, Pill, Bed, Sparkles, Phone, Truck,
  Stethoscope, HelpCircle, Check, Clock, Radio
} from 'lucide-react';
import Link from 'next/link';
import NewsTicker from '@/components/NewsTicker';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';
import { RANCHI_FACILITIES_MASTER } from '@/lib/ranchiData';
import { PHC_CREDENTIALS_MASTER, GovtDirective, PhcLiveState, PhcGovtRequest } from '@/lib/phcStore';

export default function GovtPortal() {
  const { t } = useLanguage();
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

  // Government Directives & PHC Communication State
  const [directives, setDirectives] = useState<GovtDirective[]>([]);
  const [loadingDirectives, setLoadingDirectives] = useState<boolean>(false);
  const [targetFacilityId, setTargetFacilityId] = useState<string>(PHC_CREDENTIALS_MASTER[0].facility_id);
  const [directivePriority, setDirectivePriority] = useState<GovtDirective['priority']>('URGENT_DIRECTIVE');
  const [directiveTitle, setDirectiveTitle] = useState<string>('');
  const [directiveMsg, setDirectiveMsg] = useState<string>('');
  const [dispatchingDirective, setDispatchingDirective] = useState<boolean>(false);
  const [directiveFeedback, setDirectiveFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Incoming PHC Support Escalations State
  const [phcRequests, setPhcRequests] = useState<PhcGovtRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(false);
  const [activeRespondModal, setActiveRespondModal] = useState<PhcGovtRequest | null>(null);
  const [respondAction, setRespondAction] = useState<'GOVT_APPROVED_DISPATCHED' | 'GOVT_RESOLVED' | 'UNDER_REVIEW'>('GOVT_APPROVED_DISPATCHED');
  const [respondNote, setRespondNote] = useState<string>('');
  const [submittingResponse, setSubmittingResponse] = useState<boolean>(false);

  // Live PHC States (Medicines & Beds)
  const [livePhcStates, setLivePhcStates] = useState<Record<string, PhcLiveState>>({});
  const [loadingLiveStates, setLoadingLiveStates] = useState<boolean>(false);

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

  const fetchPhcRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch('/api/phc/support-request');
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        setPhcRequests(data.requests);
      }
    } catch (err) {
      console.error('Failed to load PHC support requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchDirectivesAndInventory = async () => {
    setLoadingDirectives(true);
    setLoadingLiveStates(true);
    try {
      // 1. Fetch directives
      const dirRes = await fetch('/api/government/directives');
      const dirData = await dirRes.json();
      if (dirData.success && Array.isArray(dirData.directives)) {
        setDirectives(dirData.directives);
      }

      // 2. Fetch live inventory
      const invRes = await fetch('/api/phc/inventory');
      const invData = await invRes.json();
      if (invData.success && invData.facilities) {
        setLivePhcStates(invData.facilities);
      }
    } catch (err) {
      console.error('Failed to load directives or live states:', err);
    } finally {
      setLoadingDirectives(false);
      setLoadingLiveStates(false);
    }
  };

  // Setup Real-Time SSE Listener when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchEmergencies();
    fetchDirectivesAndInventory();
    fetchPhcRequests();

    // Connect to Server-Sent Events stream
    const eventSource = new EventSource('/api/government/emergencies/stream');

    eventSource.addEventListener('emergency', (e) => {
      try {
        const newEvent = JSON.parse(e.data);
        setActivePopupAlert(newEvent);
        fetchEmergencies();
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    });

    eventSource.onerror = () => {
      console.warn('SSE connection disconnected. Will auto-retry.');
    };

    // Periodic polling refresh for live PHC telemetry
    const interval = setInterval(() => {
      fetchDirectivesAndInventory();
      fetchPhcRequests();
    }, 15000);

    return () => {
      eventSource.close();
      clearInterval(interval);
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

  // Dispatch Government Directive to PHC
  const handleDispatchDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveTitle.trim() || !directiveMsg.trim()) return;

    setDispatchingDirective(true);
    setDirectiveFeedback(null);

    try {
      const res = await fetch('/api/government/directives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_facility_id: targetFacilityId,
          priority: directivePriority,
          title: directiveTitle.trim(),
          message: directiveMsg.trim(),
          sender_officer_id: 'govtjharkhand123 (State Command)'
        })
      });

      const data = await res.json();
      if (data.success) {
        setDirectiveFeedback({
          type: 'success',
          text: `Directive ${data.directive.directive_code} successfully dispatched to ${data.directive.target_facility_name}.`
        });
        setDirectiveTitle('');
        setDirectiveMsg('');
        fetchDirectivesAndInventory();
      } else {
        setDirectiveFeedback({ type: 'error', text: data.error || 'Failed to dispatch directive.' });
      }
    } catch (err: any) {
      setDirectiveFeedback({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setDispatchingDirective(false);
    }
  };

  // Respond to PHC Support Request
  const handleActionPhcRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRespondModal) return;

    setSubmittingResponse(true);
    try {
      const res = await fetch('/api/phc/support-request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: activeRespondModal.id,
          status: respondAction,
          response_notes: respondNote.trim() || (respondAction === 'GOVT_APPROVED_DISPATCHED' ? 'Support requisition approved. Central warehouse dispatch unit notified.' : 'Requisition acknowledged and resolved.'),
          officer_id: 'govtjharkhand123'
        })
      });

      const data = await res.json();
      if (data.success) {
        setActiveRespondModal(null);
        setRespondNote('');
        fetchPhcRequests();
      } else {
        alert(data.error || 'Failed to update request');
      }
    } catch (err) {
      console.error('Failed to respond to PHC request:', err);
    } finally {
      setSubmittingResponse(false);
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

  // ==========================================
  // UN-AUTHENTICATED GOVT LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans jharkhand-bg-watermark">
        <div className="w-full bg-[#064e3b] text-white px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-medium z-20 border-b border-[#047857]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t('header_portal_title')} &bull; {t('govt_login_title')}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <span className="text-emerald-200 font-bold text-[11px] hidden sm:inline">
              HEALTHGRID SECURE
            </span>
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
              <h2 className="text-base font-black tracking-wide">सरकारी कमान केंद्र लॉगिन</h2>
              <p className="text-xs text-emerald-100 mt-1 font-medium">
                HealthGrid AI Official Government Gateway
              </p>
              <div className="inline-block mt-2 bg-emerald-900/60 border border-emerald-400/40 text-[10px] text-amber-300 font-bold px-3 py-1 rounded-full">
                Department of Health &amp; Family Welfare, GoJ
              </div>
            </div>

            <form onSubmit={handleLogin} className="p-6 flex flex-col gap-4">
              
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-[#064e3b] uppercase mb-1">
                  Government ID / सरकारी आईडी:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={govId}
                    onChange={(e) => setGovId(e.target.value)}
                    placeholder="Enter Govt ID"
                    className="w-full text-xs p-3 pl-9 bg-slate-50 border border-emerald-200 rounded-xl focus:bg-white focus:border-[#064e3b] outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#064e3b] uppercase mb-1">
                  Password / पासवर्ड:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Officer Password"
                    className="w-full text-xs p-3 pl-9 bg-slate-50 border border-emerald-200 rounded-xl focus:bg-white focus:border-[#064e3b] outline-none font-semibold text-slate-800"
                  />
                </div>
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
                  ← नागरिक मुख्य पृष्ठ (Back to Home)
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

  // ==========================================
  // AUTHENTICATED GOVERNMENT COMMAND RADAR
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans jharkhand-bg-watermark">
      
      {/* REAL-TIME EMERGENCY POPUP MODAL */}
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

      {/* GOVT RESPONSE ACTION MODAL (FOR PHC REQUESTS) */}
      {activeRespondModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-emerald-400 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div>
                <h3 className="text-sm font-black text-[#064e3b]">PHC सहायता अनुरोध कार्रवाई (Govt Action on PHC Requisition)</h3>
                <p className="text-[10px] text-slate-500 font-bold">{activeRespondModal.request_code} &bull; {activeRespondModal.source_facility_name}</p>
              </div>
              <button onClick={() => setActiveRespondModal(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-1.5">
              <div><strong className="text-slate-700">Category:</strong> <span className="font-bold text-emerald-800">{activeRespondModal.category.replace(/_/g, ' ')}</span></div>
              <div><strong className="text-slate-700">Urgency:</strong> <span className="font-black text-red-600">{activeRespondModal.urgency}</span></div>
              <div><strong className="text-slate-700">Subject:</strong> <span className="font-bold text-slate-900">{activeRespondModal.title}</span></div>
              <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 mt-1 italic">&ldquo;{activeRespondModal.description}&rdquo;</div>
            </div>

            <form onSubmit={handleActionPhcRequest} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Select Command Action / कार्रवाई का चयन करें:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRespondAction('GOVT_APPROVED_DISPATCHED')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition-all ${
                      respondAction === 'GOVT_APPROVED_DISPATCHED' ? 'bg-emerald-100 border-emerald-500 text-[#064e3b] ring-2 ring-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    ✓ Approve &amp; Dispatch
                  </button>
                  <button
                    type="button"
                    onClick={() => setRespondAction('UNDER_REVIEW')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition-all ${
                      respondAction === 'UNDER_REVIEW' ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    ⏳ Under Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setRespondAction('GOVT_RESOLVED')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition-all ${
                      respondAction === 'GOVT_RESOLVED' ? 'bg-blue-100 border-blue-500 text-blue-900 ring-2 ring-blue-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    ✔ Mark Resolved
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Command Note / निर्देश संदेश:</label>
                <textarea
                  rows={3}
                  value={respondNote}
                  onChange={(e) => setRespondNote(e.target.value)}
                  placeholder="e.g. Emergency drug stock vehicle #JH-01-AX-9901 dispatched from Sadar Hospital Central Depot with 500 ASV vials. ETA 35 mins."
                  className="w-full p-2.5 bg-slate-50 border border-emerald-200 rounded-xl text-slate-800 font-semibold outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveRespondModal(null)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResponse}
                  className="py-2.5 bg-[#064e3b] hover:bg-[#047857] text-white rounded-xl text-xs font-black transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  {submittingResponse ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-amber-300" />}
                  <span>Confirm &amp; Update PHC</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="w-full bg-[#064e3b] text-white px-4 sm:px-6 py-1.5 flex items-center justify-between text-[11px] font-medium z-30 border-b border-[#047857]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>झारखंड सरकार &bull; राज्य स्वास्थ्य कमान केंद्र &bull; RANCHI COMMAND RADAR</span>
        </div>
        <div className="flex items-center gap-3 text-emerald-100 font-semibold text-[10px]">
          <LanguageSelector />
          <span className="bg-[#047857] px-2.5 py-0.5 rounded text-amber-300 font-bold flex items-center gap-1 hidden md:flex">
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
            PHC Staff Portal
          </Link>
          <Link href="/simulator" className="text-slate-600 hover:text-[#064e3b] transition-colors">
            Digital Twin Simulator
          </Link>
          <Link href="/admin/test-logs" className="text-purple-700 hover:text-purple-900 transition-colors">
            Test &amp; Audit Logs
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
              <span className="text-xs font-bold text-slate-500 uppercase">Verified PHCs</span>
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="text-3xl font-black text-[#064e3b]">
              {PHC_CREDENTIALS_MASTER.length}
            </div>
            <div className="text-[10px] text-emerald-700 font-bold">10 Dedicated Portals Active</div>
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
              <span className="text-xs font-bold text-amber-700 uppercase">Incoming PHC Requests</span>
              <HelpCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-amber-700">
              {phcRequests.filter(r => r.status === 'PENDING_GOVT_ACTION' || r.status === 'UNDER_REVIEW').length}
            </div>
            <div className="text-[10px] text-amber-700 font-bold">Pending State Government Action</div>
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

        {/* ========================================================= */}
        {/* INCOMING PHC SUPPORT ESCALATIONS & REQUISITIONS           */}
        {/* ========================================================= */}
        <section className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-amber-300 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase mb-1">
                <Radio className="w-3 h-3 text-amber-700" />
                <span>PHC TO GOVT ESCALATION RADAR &bull; प्राथमिक स्वास्थ्य केंद्र आपात मांगें</span>
              </div>
              <h3 className="text-sm font-black text-[#064e3b]">
                PHC से प्राप्त आपातकालीन मांगें एवं सहायता अनुरोध (Incoming PHC Support Requests &amp; Requisitions)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Real-time requests initiated directly by PHC Medical Officers (ASV drugs, specialist doctors, 108 ambulances, generator/equipment repairs)
              </p>
            </div>
            <button
              onClick={fetchPhcRequests}
              className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-800 text-xs flex items-center gap-1 font-bold border border-amber-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRequests ? 'animate-spin' : ''}`} />
              <span>Refresh Requests</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] bg-amber-50/50">
                  <th className="py-2.5 px-3">Req Code &amp; Time</th>
                  <th className="py-2.5 px-2">Source PHC</th>
                  <th className="py-2.5 px-2">Category &amp; Urgency</th>
                  <th className="py-2.5 px-2">Request Details</th>
                  <th className="py-2.5 px-2">Govt Action / Notes</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {phcRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                      No incoming PHC support requests at this time.
                    </td>
                  </tr>
                ) : (
                  phcRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono font-black text-slate-800">{req.request_code}</div>
                        <div className="text-[10px] text-slate-400">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      <td className="py-3 px-2 font-bold text-[#064e3b]">
                        <div>{req.source_facility_name.replace('Community Health Centre ', 'CHC ').replace('Primary Health Centre ', 'PHC ')}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{req.requested_by_officer}</div>
                      </td>

                      <td className="py-3 px-2">
                        <div className="font-bold text-slate-800 text-[11px]">{req.category.replace(/_/g, ' ')}</div>
                        <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded mt-0.5 ${
                          req.urgency === 'CRITICAL_URGENT' ? 'bg-red-100 text-red-700 border border-red-200' :
                          req.urgency === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {req.urgency}
                        </span>
                      </td>

                      <td className="py-3 px-2 max-w-[200px]">
                        <div className="font-bold text-slate-900 truncate" title={req.title}>{req.title}</div>
                        <div className="text-[10.5px] text-slate-600 line-clamp-2 mt-0.5" title={req.description}>{req.description}</div>
                      </td>

                      <td className="py-3 px-2 max-w-[180px]">
                        {req.govt_response_notes ? (
                          <div className="text-[10.5px] text-slate-700 italic bg-emerald-50/70 p-1.5 rounded border border-emerald-200">
                            <span className="font-bold text-[#064e3b] not-italic block text-[9.5px]">Govt Officer Note:</span>
                            &ldquo;{req.govt_response_notes}&rdquo;
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No notes recorded yet</span>
                        )}
                      </td>

                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          req.status === 'PENDING_GOVT_ACTION' ? 'bg-red-100 text-red-900 border border-red-300' :
                          req.status === 'GOVT_APPROVED_DISPATCHED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                          req.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => {
                            setActiveRespondModal(req);
                            setRespondNote('');
                            setRespondAction('GOVT_APPROVED_DISPATCHED');
                          }}
                          className="px-3 py-1 bg-[#064e3b] hover:bg-[#047857] text-white rounded-lg text-[10.5px] font-bold transition-colors shadow-2xs"
                        >
                          Action ➔
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* LIVE REAL-TIME PHC OPERATIONAL & TELEMETRY RADAR          */}
        {/* ========================================================= */}
        <section className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-300 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#064e3b] text-[10px] font-black uppercase mb-1">
                <Activity className="w-3 h-3 text-[#047857]" />
                <span>STATEWIDE FACILITY TELEMETRY &bull; 10 PHC लाइव स्थिति</span>
              </div>
              <h3 className="text-sm font-black text-[#064e3b]">
                सभी 10 प्राथमिक स्वास्थ्य केंद्रों की लाइव स्थिति (Live Real-Time PHC Operational Telemetry)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live operational beds, doctors on duty, 108 ambulance status, ER status, and essential drug stock across all Ranchi PHCs
              </p>
            </div>
            <button
              onClick={fetchDirectivesAndInventory}
              className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-800 text-xs flex items-center gap-1 font-bold border border-emerald-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLiveStates ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PHC_CREDENTIALS_MASTER.map((phc) => {
              const live = livePhcStates[phc.facility_id];
              const totalBeds = live?.total_beds ?? 30;
              const availBeds = live?.available_beds ?? 20;
              const doctors = live?.doctors_present ?? 4;
              const ambStatus = live?.ambulance_status ?? 'READY_24_7';
              const erStatus = live?.emergency_room_status ?? 'ACCEPTING_PATIENTS';
              const meds = live?.medicines || [];
              const safeMeds = meds.filter(m => m.status === 'SAFE').length;
              const criticalMeds = meds.filter(m => m.status === 'CRITICAL').length;

              return (
                <div key={phc.facility_id} className="bg-slate-50/80 rounded-2xl border border-emerald-200 p-4 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-2 border-b border-emerald-100/60 pb-2">
                    <div>
                      <h4 className="text-xs font-black text-[#064e3b]">{phc.facility_name}</h4>
                      <div className="text-[10px] text-slate-500">Block: {phc.block} &bull; MOIC: {phc.medical_officer_in_charge.split('(')[0]}</div>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      erStatus === 'ACCEPTING_PATIENTS' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {erStatus === 'ACCEPTING_PATIENTS' ? 'ER ACCEPTING' : 'ER OVERFLOW'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 flex flex-col">
                      <span className="text-[9.5px] text-slate-500 font-bold uppercase flex items-center gap-1">
                        <Bed className="w-3 h-3 text-emerald-600" />
                        Available Beds
                      </span>
                      <span className="text-base font-black text-[#064e3b] mt-0.5">
                        {availBeds} <span className="text-[10px] text-slate-400 font-medium">/ {totalBeds} Total</span>
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200 flex flex-col">
                      <span className="text-[9.5px] text-slate-500 font-bold uppercase flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-emerald-600" />
                        Doctors On Duty
                      </span>
                      <span className="text-base font-black text-[#064e3b] mt-0.5">
                        {doctors} <span className="text-[10px] text-slate-400 font-medium">Present</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <Truck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>108 Amb:</span>
                      <span className={`font-black ${
                        ambStatus === 'READY_24_7' ? 'text-emerald-700' :
                        ambStatus === 'ON_CALL_DISPATCHED' ? 'text-amber-700' : 'text-red-600'
                      }`}>
                        {ambStatus === 'READY_24_7' ? 'Ready 24/7' : ambStatus === 'ON_CALL_DISPATCHED' ? 'Dispatched' : 'Maintenance'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <Pill className="w-3 h-3 text-slate-500" />
                      <span>{meds.length} Drugs</span>
                      {criticalMeds > 0 ? (
                        <span className="bg-red-100 text-red-700 px-1 rounded text-[9px]">({criticalMeds} Low)</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 px-1 rounded text-[9px]">(Safe)</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* TWO-WAY GOVERNMENT ⇄ PHC DIRECTIVES & ORDERS DISPATCH     */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Dispatch Directive Form */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-300 p-6 shadow-sm flex flex-col gap-4">
            <div className="border-b border-emerald-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#064e3b] text-[10px] font-black uppercase mb-1">
                <Send className="w-3 h-3 text-[#047857]" />
                <span>DIRECT PHC COMMUNICATION &bull; कमान केंद्र संचार</span>
              </div>
              <h3 className="text-sm font-black text-[#064e3b]">PHC को निर्देश या आपूर्ति आदेश भेजें (Send Directive to PHC)</h3>
              <p className="text-xs text-slate-500 font-medium">
                Dispatch an official command, transfer requisition, or stock audit directly into the target PHC&apos;s logged-in portal.
              </p>
            </div>

            {directiveFeedback && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${
                directiveFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {directiveFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                <span>{directiveFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleDispatchDirective} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Select Target PHC / लक्षित प्राथमिक केंद्र:</label>
                <select
                  value={targetFacilityId}
                  onChange={(e) => setTargetFacilityId(e.target.value)}
                  className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-[#064e3b] font-bold outline-none cursor-pointer"
                >
                  {PHC_CREDENTIALS_MASTER.map(p => (
                    <option key={p.facility_id} value={p.facility_id}>
                      {p.facility_name} (Block: {p.block} &bull; {p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Directive Priority:</label>
                <select
                  value={directivePriority}
                  onChange={(e: any) => setDirectivePriority(e.target.value)}
                  className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none"
                >
                  <option value="URGENT_DIRECTIVE">🔴 URGENT DIRECTIVE (Surge Response / Transfer Order)</option>
                  <option value="STOCK_INQUIRY">🟠 STOCK INQUIRY (Buffer Audit / Vaccine Cold-Chain)</option>
                  <option value="ROUTINE_AUDIT">🟢 ROUTINE AUDIT (Weekly Resource Review)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Subject / शीर्षक:</label>
                <input
                  type="text"
                  required
                  value={directiveTitle}
                  onChange={(e) => setDirectiveTitle(e.target.value)}
                  placeholder="e.g. Urgent: Pre-allocate 300 Paracetamol vials for outbreak support"
                  className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Official Directive Message / विस्तृत संदेश:</label>
                <textarea
                  rows={3}
                  required
                  value={directiveMsg}
                  onChange={(e) => setDirectiveMsg(e.target.value)}
                  placeholder="e.g. Telemetry radar detected a 42% fever surge. Prepare emergency observation beds and confirm drug dispatch capability within 1 hour."
                  className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-semibold outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={dispatchingDirective}
                className="w-full py-3 bg-[#064e3b] hover:bg-[#047857] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-1 border border-emerald-800 disabled:opacity-50"
              >
                {dispatchingDirective ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatches in progress...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>Dispatch Directive to PHC Portal</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Directives Tracking Log */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-300 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-[#064e3b]">
                  सरकारी निर्देश एवं PHC उत्तर स्थिति (Govt Directives &amp; PHC Response Status)
                </h3>
                <p className="text-xs text-slate-500 font-medium">Real-time status of all commands sent to Ranchi PHCs</p>
              </div>
              <button
                onClick={fetchDirectivesAndInventory}
                className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-800 text-xs flex items-center gap-1 font-bold border border-emerald-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDirectives ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] bg-emerald-50/40">
                    <th className="py-2.5 px-3">Code &amp; Time</th>
                    <th className="py-2.5 px-2">Target PHC</th>
                    <th className="py-2.5 px-2">Subject</th>
                    <th className="py-2.5 px-2">PHC Feedback &amp; Problem</th>
                    <th className="py-2.5 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {directives.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                        No active directives sent yet.
                      </td>
                    </tr>
                  ) : (
                    directives.map((dir) => (
                      <tr key={dir.id} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-800">{dir.directive_code}</div>
                          <div className="text-[10px] text-slate-400">{new Date(dir.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>

                        <td className="py-3 px-2 font-bold text-[#064e3b]">
                          {dir.target_facility_name.replace('Community Health Centre ', 'CHC ').replace('Primary Health Centre ', 'PHC ')}
                        </td>

                        <td className="py-3 px-2 max-w-[160px]">
                          <div className="font-semibold text-slate-800 truncate" title={dir.title}>{dir.title}</div>
                        </td>

                        <td className="py-3 px-2 max-w-[200px]">
                          {dir.phc_response_notes ? (
                            <div className="text-[11px] text-slate-700 italic bg-white p-1.5 rounded border border-slate-200">
                              <span className="font-bold text-[#064e3b] not-italic block text-[10px]">
                                By {dir.phc_responded_by}:
                              </span>
                              &ldquo;{dir.phc_response_notes}&rdquo;
                            </div>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Pending PHC Officer Review
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-2 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            dir.status === 'PENDING_RESPONSE' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            dir.status === 'APPROVED_AND_READY' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                            'bg-red-100 text-red-900 border border-red-300'
                          }`}>
                            {dir.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </section>

        {/* Live Emergency Queue & Outbreak Box */}
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
