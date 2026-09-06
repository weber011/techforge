'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Pill, Send, RefreshCw, CheckCircle, AlertTriangle, 
  ArrowRight, ShieldCheck, Mail, Lock, LogOut, Package, UserCheck, 
  Activity, ArrowDownLeft, ArrowUpRight, MessageSquare, Plus, CheckCircle2,
  X, AlertCircle, Edit3, Bed, Users, ShieldAlert, Sparkles, Phone, MapPin
} from 'lucide-react';
import Link from 'next/link';
import NewsTicker from '@/components/NewsTicker';
import { RANCHI_FACILITIES_MASTER, RANCHI_MEDICINE_MASTER, PeerTransferRequest } from '@/lib/ranchiData';
import { PHC_CREDENTIALS_MASTER, PhcUser, PhcLiveState, PhcMedicineStock, GovtDirective } from '@/lib/phcStore';

export default function PHCPortal() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<PhcUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showCredentialDrawer, setShowCredentialDrawer] = useState(true);

  // PHC Live State (Medicines, Beds, Staff)
  const [liveState, setLiveState] = useState<PhcLiveState | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [stockUpdatingId, setStockUpdatingId] = useState<string | null>(null);
  const [editStockValues, setEditStockValues] = useState<Record<string, number>>({});
  const [stockSaveMsg, setStockSaveMsg] = useState<{ id: string; msg: string } | null>(null);

  // Government Directives State
  const [directives, setDirectives] = useState<GovtDirective[]>([]);
  const [loadingDirectives, setLoadingDirectives] = useState(false);
  const [activeDirectiveAction, setActiveDirectiveAction] = useState<{
    directive: GovtDirective;
    actionType: 'APPROVE' | 'REPORT_PROBLEM';
  } | null>(null);
  const [directiveResponseNote, setDirectiveResponseNote] = useState('');
  const [submittingDirective, setSubmittingDirective] = useState(false);

  // Peer Requisition State
  const [transfers, setTransfers] = useState<PeerTransferRequest[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [targetDonorEmail, setTargetDonorEmail] = useState('phc.kanke@gmail.com');
  const [selectedMedicine, setSelectedMedicine] = useState('Paracetamol 500mg');
  const [requiredQty, setRequiredQty] = useState(500);
  const [urgency, setUrgency] = useState<'CRITICAL' | 'HIGH' | 'NORMAL'>('CRITICAL');
  const [submittingRequisition, setSubmittingRequisition] = useState(false);
  const [requisitionMsg, setRequisitionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Medicine Modal State
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedCategory, setNewMedCategory] = useState('Essential Drug');
  const [newMedUnit, setNewMedUnit] = useState('Tablets');
  const [newMedStock, setNewMedStock] = useState(500);
  const [newMedMinSafety, setNewMedMinSafety] = useState(200);
  const [newMedBatch, setNewMedBatch] = useState('JH-2026-N1');
  const [newMedExpiry, setNewMedExpiry] = useState('2028-06-30');
  const [isAddingMed, setIsAddingMed] = useState(false);

  // Check saved session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('jh_phc_auth_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setCurrentUser(user);
      } catch (e) {
        console.error('Error parsing session user', e);
      }
    }
    setCheckingAuth(false);
  }, []);

  // Fetch Live State & Directives when logged in
  const fetchPhcData = async (facilityId: string, email: string) => {
    setLoadingState(true);
    setLoadingDirectives(true);
    try {
      // 1. Fetch live inventory & state
      const invRes = await fetch(`/api/phc/inventory?facility_id=${facilityId}`);
      const invData = await invRes.json();
      if (invData.success && invData.state) {
        setLiveState(invData.state);
        const stockMap: Record<string, number> = {};
        invData.state.medicines.forEach((m: PhcMedicineStock) => {
          stockMap[m.id] = m.current_stock;
        });
        setEditStockValues(stockMap);
      }

      // 2. Fetch government directives
      const dirRes = await fetch(`/api/government/directives?facility_id=${facilityId}&email=${encodeURIComponent(email)}`);
      const dirData = await dirRes.json();
      if (dirData.success && Array.isArray(dirData.directives)) {
        setDirectives(dirData.directives);
      }

      // 3. Fetch peer transfers
      const trRes = await fetch(`/api/phc/transfer-request?email=${encodeURIComponent(email)}`);
      const trData = await trRes.json();
      if (trData.success && Array.isArray(trData.transfers)) {
        setTransfers(trData.transfers);
      }
    } catch (err) {
      console.error('Failed to load PHC data:', err);
    } finally {
      setLoadingState(false);
      setLoadingDirectives(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchPhcData(currentUser.facility_id, currentUser.email);
    }
  }, [currentUser]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/phc/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (data.success && data.user) {
        sessionStorage.setItem('jh_phc_auth_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
      } else {
        setAuthError(data.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setAuthError('Connection failed: ' + err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Quick 1-Click Login Helper for evaluators
  const handleQuickLogin = (email: string, pass: string) => {
    setEmailInput(email);
    setPasswordInput(pass);
    setAuthError('');
    setIsAuthenticating(true);
    setTimeout(async () => {
      try {
        const res = await fetch('/api/phc/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });
        const data = await res.json();
        if (data.success && data.user) {
          sessionStorage.setItem('jh_phc_auth_user', JSON.stringify(data.user));
          setCurrentUser(data.user);
        }
      } finally {
        setIsAuthenticating(false);
      }
    }, 200);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('jh_phc_auth_user');
    setCurrentUser(null);
    setLiveState(null);
    setDirectives([]);
    setEmailInput('');
    setPasswordInput('');
  };

  // Handle Medicine Stock Update
  const handleSaveStock = async (medicineId: string) => {
    if (!currentUser) return;
    const newQty = editStockValues[medicineId];
    if (typeof newQty !== 'number' || isNaN(newQty)) return;

    setStockUpdatingId(medicineId);
    try {
      const res = await fetch('/api/phc/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_id: currentUser.facility_id,
          action: 'UPDATE_STOCK',
          medicine_id: medicineId,
          new_stock: newQty
        })
      });
      const data = await res.json();
      if (data.success && data.state) {
        setLiveState(data.state);
        setStockSaveMsg({ id: medicineId, msg: '✓ Updated & Synced with Govt Radar' });
        setTimeout(() => setStockSaveMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error saving stock:', err);
    } finally {
      setStockUpdatingId(null);
    }
  };

  // Handle Add New Medicine
  const handleAddNewMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newMedName.trim()) return;

    setIsAddingMed(true);
    try {
      const res = await fetch('/api/phc/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_id: currentUser.facility_id,
          action: 'ADD_MEDICINE',
          medicine_data: {
            name: newMedName.trim(),
            category: newMedCategory,
            unit: newMedUnit,
            current_stock: Number(newMedStock),
            min_safety_stock: Number(newMedMinSafety),
            batch_number: newMedBatch,
            expiry_date: newMedExpiry
          }
        })
      });
      const data = await res.json();
      if (data.success && data.state) {
        setLiveState(data.state);
        const stockMap = { ...editStockValues };
        data.state.medicines.forEach((m: PhcMedicineStock) => {
          stockMap[m.id] = m.current_stock;
        });
        setEditStockValues(stockMap);
        setIsAddMedModalOpen(false);
        setNewMedName('');
      }
    } catch (err) {
      console.error('Error adding medicine:', err);
    } finally {
      setIsAddingMed(false);
    }
  };

  // Handle Directive Response (Approve or Report Problem)
  const handleSubmitDirectiveResponse = async () => {
    if (!activeDirectiveAction || !currentUser) return;
    setSubmittingDirective(true);

    try {
      const status = activeDirectiveAction.actionType === 'APPROVE' 
        ? 'APPROVED_AND_READY' 
        : 'PROBLEM_REPORTED';

      const res = await fetch('/api/government/directives', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directive_id: activeDirectiveAction.directive.id,
          status,
          response_notes: directiveResponseNote,
          responded_by: currentUser.medical_officer_in_charge
        })
      });

      const data = await res.json();
      if (data.success) {
        const dirRes = await fetch(`/api/government/directives?facility_id=${currentUser.facility_id}`);
        const dirData = await dirRes.json();
        if (dirData.success && Array.isArray(dirData.directives)) {
          setDirectives(dirData.directives);
        }
        setActiveDirectiveAction(null);
        setDirectiveResponseNote('');
      }
    } catch (err) {
      console.error('Failed to submit directive response:', err);
    } finally {
      setSubmittingDirective(false);
    }
  };

  // Handle Peer Requisition
  const handleCreatePeerRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmittingRequisition(true);
    setRequisitionMsg(null);

    try {
      const res = await fetch('/api/phc/transfer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_phc_email: currentUser.email,
          destination_phc_email: targetDonorEmail,
          medicine_name: selectedMedicine,
          requested_quantity: requiredQty,
          urgency
        })
      });

      const data = await res.json();
      if (data.success) {
        setRequisitionMsg({
          type: 'success',
          text: `Direct Requisition Dispatched! ${data.donor_safety_assessment}`
        });
        const trRes = await fetch(`/api/phc/transfer-request?email=${encodeURIComponent(currentUser.email)}`);
        const trData = await trRes.json();
        if (trData.success) setTransfers(trData.transfers);
      } else {
        setRequisitionMsg({ type: 'error', text: data.error || 'Failed to dispatch peer request.' });
      }
    } catch (err: any) {
      setRequisitionMsg({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmittingRequisition(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#064e3b] flex items-center justify-center text-white font-sans">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          <span className="text-sm font-bold">झारखंड स्वास्थ्य ग्रिड: PHC पोर्टल सत्यापन...</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: UN-AUTHENTICATED PHC LOGIN SCREEN
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans jharkhand-bg-watermark">
        
        {/* Top Government Official Strip */}
        <div className="w-full bg-[#064e3b] text-white px-6 py-2 flex items-center justify-between text-xs font-medium z-20 border-b border-[#047857]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>झारखंड सरकार &bull; GOVERNMENT OF JHARKHAND &bull; PHC STAFF &amp; MEDICAL OFFICER PORTAL</span>
          </div>
          <div className="text-emerald-200 font-bold text-[11px]">
            HEALTHGRID AI PHC GATEWAY
          </div>
        </div>

        <NewsTicker />

        <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row items-center justify-center gap-8 relative z-10 my-auto">
          
          {/* Login Card */}
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-emerald-300 overflow-hidden">
            
            <div className="bg-[#064e3b] p-6 text-white text-center relative">
              <div className="w-16 h-16 bg-white rounded-2xl p-2 mx-auto mb-3 shadow-md flex items-center justify-center">
                <img 
                  src="/emblem-logo.png" 
                  alt="Government Emblem" 
                  className="max-h-full max-w-full object-contain" 
                />
              </div>
              <h2 className="text-base font-black tracking-wide">प्राथमिक स्वास्थ्य केंद्र (PHC) लॉगिन</h2>
              <p className="text-xs text-emerald-100 mt-1 font-medium">
                HealthGrid AI PHC Medical Officer &amp; Staff Gateway
              </p>
              <div className="inline-block mt-2 bg-emerald-900/60 border border-emerald-400/40 text-[10px] text-amber-300 font-bold px-3 py-1 rounded-full">
                Jharkhand Health Directorate
              </div>
            </div>

            <form onSubmit={handleLogin} className="p-6 flex flex-col gap-4">
              
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-[#064e3b] uppercase mb-1">
                  PHC Email ID / लॉगिन आईडी:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. phc.kanke@gmail.com"
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
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="e.g. kanke@123"
                    className="w-full text-xs p-3 pl-9 bg-slate-50 border border-emerald-200 rounded-xl focus:bg-white focus:border-[#064e3b] outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  256-Bit SSL Encrypted
                </span>
                <span className="text-emerald-700 font-semibold">NIC HealthGrid</span>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 bg-[#064e3b] hover:bg-[#047857] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 border border-emerald-900 disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>सत्यापन हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>PHC पोर्टल में प्रवेश करें (Enter PHC Portal)</span>
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
              National Informatics Centre &bull; HealthGrid AI Jharkhand
            </div>

          </div>

          {/* Quick Credential Directory for Evaluators */}
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border-2 border-emerald-300 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#064e3b] text-[10px] font-black uppercase mb-1">
                  <Sparkles className="w-3 h-3 text-[#047857]" />
                  <span>1-Click Fast Login / क्रेडेंशियल संदर्भ सूची</span>
                </div>
                <h3 className="text-sm font-black text-[#064e3b]">Ranchi PHC Credential Reference</h3>
                <p className="text-xs text-slate-500 font-medium">Click any PHC below to automatically fill credentials &amp; login instantly:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {PHC_CREDENTIALS_MASTER.map((phc, idx) => (
                <div 
                  key={phc.facility_id}
                  onClick={() => handleQuickLogin(phc.email, phc.password)}
                  className="p-3 bg-emerald-50/50 hover:bg-emerald-100/80 border border-emerald-200 hover:border-[#047857] rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-black text-[#064e3b] group-hover:text-[#047857]">
                        {phc.facility_name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold">
                        Block: {phc.block} &bull; {phc.facility_type}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-200/80 text-emerald-900 rounded">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-700 font-semibold">{phc.email}</span>
                    <span className="text-emerald-800 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                      {phc.password}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Each PHC maintains its own isolated inventory, stock edit logs, and government communication thread.</span>
            </div>

          </div>

        </div>

        <footer className="w-full bg-[#064e3b] text-white py-4 px-6 text-center text-xs border-t-2 border-[#f37021] z-20">
          झारखंड सरकार &bull; स्वास्थ्य, चिकित्सा शिक्षा एवं परिवार कल्याण विभाग &bull; प्राथमिक स्वास्थ्य केंद्र पोर्टल
        </footer>

      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED PHC WORKSPACE
  // ==========================================
  const currentFacilityData = RANCHI_FACILITIES_MASTER.find(f => f.facility_id === currentUser.facility_id) || RANCHI_FACILITIES_MASTER[3];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col jharkhand-bg-watermark">
      
      {/* DIRECTIVE RESPONSE MODAL (Approve or Report Problem) */}
      {activeDirectiveAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-emerald-600 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${activeDirectiveAction.actionType === 'APPROVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {activeDirectiveAction.actionType === 'APPROVE' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-[#064e3b]">
                    {activeDirectiveAction.actionType === 'APPROVE' ? 'स्वीकृत एवं तैयार (Confirm & Approve Order)' : 'समस्या दर्ज करें (Report Problem / Shortage)'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold">
                    DIRECTIVE CODE: {activeDirectiveAction.directive.directive_code}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveDirectiveAction(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col gap-1.5">
              <div className="font-bold text-[#064e3b]">{activeDirectiveAction.directive.title}</div>
              <p className="text-slate-600">{activeDirectiveAction.directive.message}</p>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-bold text-[#064e3b]">
                {activeDirectiveAction.actionType === 'APPROVE' 
                  ? 'Dispatch / Confirmation Remarks (optional):' 
                  : 'Specify Problem / Local Constraint (Required for State Command):'}
              </label>
              <textarea
                rows={3}
                required={activeDirectiveAction.actionType === 'REPORT_PROBLEM'}
                value={directiveResponseNote}
                onChange={(e) => setDirectiveResponseNote(e.target.value)}
                placeholder={activeDirectiveAction.actionType === 'APPROVE' 
                  ? 'e.g. 300 units Paracetamol packed and ready for cold-chain transit.' 
                  : 'e.g. Local stock is at critical minimum buffer. Can only supply 50 units. Requesting alternative donor.'}
                className="w-full p-3 bg-emerald-50/40 border border-emerald-300 rounded-xl text-slate-800 font-semibold outline-none focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveDirectiveAction(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingDirective || (activeDirectiveAction.actionType === 'REPORT_PROBLEM' && !directiveResponseNote.trim())}
                onClick={handleSubmitDirectiveResponse}
                className={`py-2.5 text-white rounded-xl text-xs font-black transition-colors shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                  activeDirectiveAction.actionType === 'APPROVE' ? 'bg-[#064e3b] hover:bg-[#047857]' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submittingDirective ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{activeDirectiveAction.actionType === 'APPROVE' ? 'Confirm Approval' : 'Submit Problem Report'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEDICINE BATCH MODAL */}
      {isAddMedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-emerald-600 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#047857]" />
                <h3 className="text-base font-black text-[#064e3b]">नई दवा बैच पंजीकृत करें (Add Medicine Batch)</h3>
              </div>
              <button onClick={() => setIsAddMedModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewMedicine} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Medicine Name / दवा का नाम:</label>
                <input
                  type="text"
                  required
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g. Ciprofloxacin 500mg"
                  className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Category:</label>
                  <input
                    type="text"
                    value={newMedCategory}
                    onChange={(e) => setNewMedCategory(e.target.value)}
                    className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Unit:</label>
                  <select
                    value={newMedUnit}
                    onChange={(e) => setNewMedUnit(e.target.value)}
                    className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-semibold outline-none"
                  >
                    <option value="Tablets">Tablets</option>
                    <option value="Capsules">Capsules</option>
                    <option value="Sachets">Sachets</option>
                    <option value="Vials">Vials</option>
                    <option value="Cylinders">Cylinders</option>
                    <option value="Bottles">Bottles</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Received Stock Qty:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMedStock}
                    onChange={(e) => setNewMedStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Min Safety Threshold:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMedMinSafety}
                    onChange={(e) => setNewMedMinSafety(Number(e.target.value))}
                    className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Batch Number:</label>
                  <input
                    type="text"
                    value={newMedBatch}
                    onChange={(e) => setNewMedBatch(e.target.value)}
                    className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Expiry Date:</label>
                  <input
                    type="date"
                    value={newMedExpiry}
                    onChange={(e) => setNewMedExpiry(e.target.value)}
                    className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddMedModalOpen(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingMed}
                  className="py-2.5 bg-[#064e3b] hover:bg-[#047857] text-white rounded-xl font-black shadow-md flex items-center justify-center gap-1.5"
                >
                  {isAddingMed ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Register &amp; Sync</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Top Strip (Jharkhand Deep Green) */}
      <div className="w-full bg-[#064e3b] text-white px-6 py-1.5 flex items-center justify-between text-[11px] font-medium z-30 border-b border-[#047857]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>झारखंड सरकार &bull; प्राथमिक स्वास्थ्य केंद्र पोर्टल &bull; {currentUser.facility_name.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-100 font-semibold text-[10px]">
          <span className="bg-[#047857] px-2.5 py-0.5 rounded text-amber-300 font-bold flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-amber-300" />
            {currentUser.medical_officer_in_charge}
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

      {/* Main Header with Emblem */}
      <header className="w-full px-6 md:px-12 py-3.5 bg-white/95 backdrop-blur-md border-b border-emerald-200 flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/phc" className="flex items-center gap-2">
            <div className="h-10 w-auto">
              <img src="/emblem-logo.png" alt="Jharkhand Health" className="h-full w-auto object-contain" />
            </div>
          </Link>
          <div className="border-l-2 border-emerald-600 pl-3">
            <h1 className="text-sm font-black text-[#064e3b] leading-tight">
              {currentUser.facility_name} &bull; चिकित्सा एवं रसद प्रबंधन
            </h1>
            <p className="text-[10px] text-emerald-800 font-bold">
              BLOCK: {currentUser.block.toUpperCase()} &bull; {currentUser.email} &bull; RANCHI HEALTH COMMAND
            </p>
          </div>
        </div>

        {/* Action Header Nav */}
        <div className="flex items-center gap-3">
          <Link 
            href="/public" 
            className="px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors hidden sm:flex items-center gap-1.5 shadow-2xs"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-700" />
            <span>नागरिक दृश्य (Citizen View)</span>
          </Link>

          <button 
            onClick={() => fetchPhcData(currentUser.facility_id, currentUser.email)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingState ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश (Sync)</span>
          </button>
        </div>
      </header>

      {/* Real Live News Ticker */}
      <NewsTicker />

      {/* Main PHC Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-6">
        
        {/* PHC Station Profile & Capacity Banner */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-200 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#064e3b] text-white flex items-center justify-center font-bold text-lg border border-emerald-700 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#064e3b]">{currentUser.facility_name}</h2>
                <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-[#064e3b] text-[10px] font-bold rounded">
                  {currentUser.facility_id}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Block: <strong>{currentUser.block}</strong> &bull; Medical Officer: <strong>{currentUser.medical_officer_in_charge}</strong> &bull; Ph: {currentUser.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200 text-center min-w-[85px]">
              <div className="font-black text-[#064e3b]">
                {liveState?.available_beds ?? currentFacilityData.operational_data.available_beds} / {liveState?.total_beds ?? currentFacilityData.total_beds}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Beds Available</div>
            </div>

            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200 text-center min-w-[85px]">
              <div className="font-black text-[#064e3b]">
                {liveState?.doctors_present ?? currentFacilityData.operational_data.doctors_present} / {liveState?.doctors_sanctioned ?? currentFacilityData.doctors_sanctioned}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Doctors on Duty</div>
            </div>

            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200 text-center min-w-[85px]">
              <div className="font-black text-emerald-800">
                {liveState?.ambulance_ready ? '24/7 ACTIVE' : 'STANDBY'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">108 Ambulance</div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 1: TWO-WAY GOVERNMENT DIRECTIVES & ORDERS INBOX   */}
        {/* ========================================================= */}
        <section className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-200 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase mb-1 border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>GOVERNMENT DIRECTIVES &bull; सरकारी आदेश एवं संचार</span>
              </div>
              <h3 className="text-sm font-black text-[#064e3b]">
                मुख्यालय कमान केंद्र से प्राप्त निर्देश (Official Directives from State Command)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Incoming supply orders, fever cluster directives, and transfer requisitions targeted for this PHC.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {directives.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs font-medium">
                No active government directives at this time. All health commands in standard status.
              </div>
            ) : (
              directives.map(dir => (
                <div 
                  key={dir.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-3 ${
                    dir.status === 'PENDING_RESPONSE' 
                      ? 'bg-amber-50/70 border-amber-300' 
                      : dir.status === 'APPROVED_AND_READY'
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : 'bg-red-50/60 border-red-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        dir.priority === 'URGENT_DIRECTIVE' ? 'bg-red-600 text-white' : 'bg-[#064e3b] text-white'
                      }`}>
                        {dir.priority.replace('_', ' ')}
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-800">{dir.directive_code}</span>
                      <span className="text-[11px] text-slate-500">From: {dir.sender_officer_id}</span>
                    </div>

                    <div>
                      {dir.status === 'PENDING_RESPONSE' ? (
                        <span className="px-2.5 py-1 bg-amber-200 text-amber-900 border border-amber-400 rounded-full text-[10px] font-black flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                          उत्तर प्रतीक्षित (Pending Response)
                        </span>
                      ) : dir.status === 'APPROVED_AND_READY' ? (
                        <span className="px-2.5 py-1 bg-emerald-200 text-emerald-900 border border-emerald-400 rounded-full text-[10px] font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                          स्वीकृत एवं तैयार (Approved &amp; Ready)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-red-200 text-red-900 border border-red-400 rounded-full text-[10px] font-black flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-800" />
                          समस्या दर्ज (Problem Reported)
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-[#064e3b]">{dir.title}</h4>
                    <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">{dir.message}</p>
                  </div>

                  {/* If PHC responded, show response notes */}
                  {dir.phc_response_notes && (
                    <div className="p-3 bg-white/90 rounded-xl border border-slate-200 text-xs flex flex-col gap-1">
                      <div className="font-bold text-[#064e3b] flex items-center justify-between text-[11px]">
                        <span>PHC Response by {dir.phc_responded_by}:</span>
                        <span className="text-slate-400 font-normal">
                          {dir.phc_responded_at ? new Date(dir.phc_responded_at).toLocaleTimeString() : ''}
                        </span>
                      </div>
                      <div className="text-slate-700 italic font-medium">&ldquo;{dir.phc_response_notes}&rdquo;</div>
                    </div>
                  )}

                  {/* If Pending, Show Action Buttons */}
                  {dir.status === 'PENDING_RESPONSE' && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={() => {
                          setActiveDirectiveAction({ directive: dir, actionType: 'APPROVE' });
                          setDirectiveResponseNote('Confirmed by PHC Medical Officer. Stock and beds are prepared.');
                        }}
                        className="px-4 py-2 bg-[#064e3b] hover:bg-[#047857] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>स्वीकृत एवं तैयार (Approve &amp; Confirm Ready)</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveDirectiveAction({ directive: dir, actionType: 'REPORT_PROBLEM' });
                          setDirectiveResponseNote('');
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                        <span>समस्या दर्ज करें (Report Issue / Shortage)</span>
                      </button>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: LIVE MEDICINE & RESOURCE STOCK MANAGEMENT       */}
        {/* ========================================================= */}
        <section className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-200 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#064e3b] text-[10px] font-black uppercase mb-1">
                <Pill className="w-3 h-3 text-[#047857]" />
                <span>LIVE PHC INVENTORY &bull; दवा एवं संसाधन स्टॉक प्रबंधन</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#064e3b]">
                आवश्यक औषधि एवं संसाधन लाइव स्टॉक अपडेशन (Direct Stock Update &amp; Synchronize)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Changes saved here reflect in real-time across the Government Command Radar and Citizen Public Portal.
              </p>
            </div>

            <button
              onClick={() => setIsAddMedModalOpen(true)}
              className="px-4 py-2.5 bg-[#064e3b] hover:bg-[#047857] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shrink-0 border border-emerald-800"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>नई दवा बैच जोड़ें (Add Drug Batch)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-emerald-200 text-[11px] font-black text-[#064e3b] uppercase">
                  <th className="px-3 py-3">Medicine &amp; Category</th>
                  <th className="px-3 py-3">Batch &amp; Expiry</th>
                  <th className="px-3 py-3">Safety Limit</th>
                  <th className="px-3 py-3">Current Stock</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Update Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {liveState?.medicines.map((med) => {
                  const editVal = editStockValues[med.id] ?? med.current_stock;
                  const isModified = editVal !== med.current_stock;
                  const isSaving = stockUpdatingId === med.id;

                  return (
                    <tr key={med.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-3 py-3 font-bold text-slate-800">
                        <div className="text-xs font-black text-[#064e3b]">{med.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{med.category} ({med.unit})</div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="font-mono text-xs font-semibold text-slate-700">{med.batch_number}</div>
                        <div className="text-[10px] text-slate-500">Exp: {med.expiry_date}</div>
                      </td>

                      <td className="px-3 py-3 text-slate-600 font-medium">
                        Min: <strong>{med.min_safety_stock} {med.unit}</strong>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditStockValues({
                              ...editStockValues,
                              [med.id]: Math.max(0, (editStockValues[med.id] ?? med.current_stock) - 50)
                            })}
                            className="w-6 h-6 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-bold flex items-center justify-center text-slate-700"
                          >
                            -
                          </button>
                          
                          <input
                            type="number"
                            min="0"
                            value={editVal}
                            onChange={(e) => setEditStockValues({
                              ...editStockValues,
                              [med.id]: Number(e.target.value)
                            })}
                            className="w-20 p-1 text-center font-bold text-xs bg-emerald-50/40 border border-emerald-300 rounded outline-none focus:bg-white text-slate-800"
                          />

                          <button
                            type="button"
                            onClick={() => setEditStockValues({
                              ...editStockValues,
                              [med.id]: (editStockValues[med.id] ?? med.current_stock) + 50
                            })}
                            className="w-6 h-6 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-bold flex items-center justify-center text-slate-700"
                          >
                            +
                          </button>
                        </div>

                        {stockSaveMsg?.id === med.id && (
                          <div className="text-[10px] text-emerald-700 font-black mt-1 animate-pulse">
                            {stockSaveMsg.msg}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          med.status === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-300' :
                          med.status === 'LOW' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-emerald-100 text-[#064e3b] border border-emerald-300'
                        }`}>
                          {med.status}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          disabled={!isModified || isSaving}
                          onClick={() => handleSaveStock(med.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 ${
                            isModified 
                              ? 'bg-[#064e3b] hover:bg-[#047857] text-white shadow-sm' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Edit3 className="w-3 h-3" />}
                          <span>Save</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: DIRECT INTER-PHC PEER REQUISITIONS & TRANSFERS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Requisition Form */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2 text-[#064e3b] font-black text-sm">
                <Send className="w-4 h-4 text-[#047857]" />
                <h3>Direct Peer-to-Peer Inter-PHC Requisition</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Request urgent medicine transfers directly from another PHC in the Ranchi network.
              </p>
            </div>

            {requisitionMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${
                requisitionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {requisitionMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                <span>{requisitionMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreatePeerRequest} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Select Target Donor PHC Email ID:</label>
                <select
                  value={targetDonorEmail}
                  onChange={(e) => setTargetDonorEmail(e.target.value)}
                  className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-[#064e3b] font-bold outline-none"
                >
                  {PHC_CREDENTIALS_MASTER.filter(p => p.facility_id !== currentUser.facility_id).map(p => (
                    <option key={p.facility_id} value={p.email}>
                      {p.email} ({p.facility_name})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">HealthGrid AI evaluates donor safety stock before dispatch.</span>
              </div>

              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Essential Medicine Required:</label>
                <select
                  value={selectedMedicine}
                  onChange={(e) => setSelectedMedicine(e.target.value)}
                  className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-semibold outline-none"
                >
                  {RANCHI_MEDICINE_MASTER.map(m => (
                    <option key={m.id} value={m.name}>{m.name} ({m.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Required Quantity:</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    step="50"
                    value={requiredQty}
                    onChange={(e) => setRequiredQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Priority Level:</label>
                  <select
                    value={urgency}
                    onChange={(e: any) => setUrgency(e.target.value)}
                    className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none"
                  >
                    <option value="CRITICAL">🔴 CRITICAL (&lt; 24h Stockout)</option>
                    <option value="HIGH">🟠 HIGH (Surge Buffer)</option>
                    <option value="NORMAL">🟢 NORMAL (Weekly Refill)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingRequisition}
                className="w-full py-3 bg-[#064e3b] hover:bg-[#047857] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 border border-emerald-800"
              >
                {submittingRequisition ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running Donor Safety Evaluation...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Dispatch Peer Requisition to {targetDonorEmail.split('@')[0]}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Transfers Log */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div>
                <h3 className="font-black text-[#064e3b] text-sm">Direct Peer Requisitions &amp; Dispatch History</h3>
                <p className="text-xs text-slate-500 font-medium">Live inter-PHC medicine transfer records for {currentUser.email}</p>
              </div>
              <button 
                onClick={() => fetchPhcData(currentUser.facility_id, currentUser.email)}
                className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-800 text-xs flex items-center gap-1 font-bold border border-emerald-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingTransfers ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-200 text-[11px] font-black text-[#064e3b] uppercase">
                    <th className="px-3 py-2.5">Requisition ID</th>
                    <th className="px-3 py-2.5">Type &amp; Peer</th>
                    <th className="px-3 py-2.5">Medicine &amp; Qty</th>
                    <th className="px-3 py-2.5">Donor Safety</th>
                    <th className="px-3 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                        No transfer records found for this PHC account.
                      </td>
                    </tr>
                  ) : (
                    transfers.map(tr => {
                      const isOutgoing = tr.source_phc_email.toLowerCase() === currentUser.email.toLowerCase();
                      return (
                        <tr key={tr.id} className="hover:bg-emerald-50/30">
                          <td className="px-3 py-3 font-mono font-bold text-slate-800">
                            {tr.id}
                            <div className="text-[10px] text-slate-400 font-sans">{tr.timestamp}</div>
                          </td>
                          <td className="px-3 py-3">
                            {isOutgoing ? (
                              <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span>To: {tr.destination_phc_name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                                <span>From: {tr.source_phc_name}</span>
                              </div>
                            )}
                            <div className="text-[10px] text-slate-500 font-medium">{tr.distance_km} km transit</div>
                          </td>
                          <td className="px-3 py-3 font-bold text-slate-800">
                            {tr.medicine_name}
                            <div className="text-[10px] text-emerald-700 font-black">{tr.requested_quantity} units ({tr.urgency})</div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-black text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Safe Donor
                            </span>
                            <div className="text-[10px] text-slate-500 font-medium">Post-transfer: {tr.donor_safety_check.donor_post_transfer_stock} units</div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              tr.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-800 border border-amber-300' :
                              tr.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' :
                              'bg-blue-50 text-blue-800 border border-blue-300'
                            }`}>
                              {tr.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </main>

      {/* Official Footer */}
      <footer className="w-full bg-[#064e3b] text-white py-6 px-6 text-center text-xs border-t-2 border-[#f37021] z-20">
        झारखंड सरकार &bull; स्वास्थ्य, चिकित्सा शिक्षा एवं परिवार कल्याण विभाग &bull; प्राथमिक स्वास्थ्य केंद्र रसद एवं संसाधन प्रबंधन
      </footer>
    </div>
  );
}
