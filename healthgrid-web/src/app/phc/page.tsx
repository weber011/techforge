'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Pill, Send, RefreshCw, CheckCircle, AlertTriangle, 
  ArrowRight, ShieldCheck, Mail, Lock, LogOut, Package, UserCheck, 
  Activity, ArrowDownLeft, ArrowUpRight, MessageSquare, Plus, CheckCircle2,
  X, AlertCircle, Edit3, Bed, Users, ShieldAlert, Sparkles, Phone, MapPin,
  Ambulance, Stethoscope, AlertOctagon, Bot, Calculator, Radio, HelpCircle,
  Clock, Zap, Check, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import NewsTicker from '@/components/NewsTicker';
import { RANCHI_FACILITIES_MASTER, RANCHI_MEDICINE_MASTER, PeerTransferRequest } from '@/lib/ranchiData';
import { 
  PHC_CREDENTIALS_MASTER, PhcUser, PhcLiveState, PhcMedicineStock, 
  GovtDirective, PhcGovtRequest 
} from '@/lib/phcStore';

function formatInlineText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldContent = part.slice(2, -2);
      return <strong key={i} className="font-bold text-[#064e3b]">{boldContent}</strong>;
    }
    return part;
  });
}

function CopilotMessageRenderer({ content, role }: { content: string; role: 'user' | 'assistant' }) {
  if (role === 'user') {
    return <div className="leading-relaxed font-semibold">{content}</div>;
  }

  const cleanText = content.replace(/<br\s*\/?>/gi, '\n');
  const lines = cleanText.split('\n');

  return (
    <div className="flex flex-col gap-1.5 leading-relaxed text-slate-800 text-[11.5px]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-0.5" />;

        if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          const hText = trimmed.replace(/^#+\s*/, '');
          return (
            <div key={idx} className="font-black text-[#064e3b] text-xs pt-1 border-b border-emerald-200 pb-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{formatInlineText(hText)}</span>
            </div>
          );
        }

        if (trimmed.startsWith('• ') || trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const bText = trimmed.replace(/^[•*-]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className="text-[#047857] font-bold mt-0.5">•</span>
              <span className="flex-1 text-slate-700">{formatInlineText(bText)}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className="font-black text-[#064e3b] bg-emerald-100 px-1.5 rounded text-[10px] shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <span className="flex-1 text-slate-700">{formatInlineText(numMatch[2])}</span>
            </div>
          );
        }

        return (
          <div key={idx} className="text-slate-800">
            {formatInlineText(line)}
          </div>
        );
      })}
    </div>
  );
}

export default function PHCPortal() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<PhcUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // PHC Live State (Medicines, Beds, Staff, Ambulance)
  const [liveState, setLiveState] = useState<PhcLiveState | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [stockUpdatingId, setStockUpdatingId] = useState<string | null>(null);
  const [editStockValues, setEditStockValues] = useState<Record<string, number>>({});
  const [stockSaveMsg, setStockSaveMsg] = useState<{ id: string; msg: string } | null>(null);

  // Operational Control Edit State
  const [editBedsAvailable, setEditBedsAvailable] = useState<number>(10);
  const [editDoctorsPresent, setEditDoctorsPresent] = useState<number>(4);
  const [editAmbulanceStatus, setEditAmbulanceStatus] = useState<PhcLiveState['ambulance_status']>('READY_24_7');
  const [editErStatus, setEditErStatus] = useState<PhcLiveState['emergency_room_status']>('ACCEPTING_PATIENTS');
  const [savingOperational, setSavingOperational] = useState(false);
  const [operationalSaveMsg, setOperationalSaveMsg] = useState<string | null>(null);

  // Government Directives (Govt -> PHC)
  const [directives, setDirectives] = useState<GovtDirective[]>([]);
  const [loadingDirectives, setLoadingDirectives] = useState(false);
  const [activeDirectiveAction, setActiveDirectiveAction] = useState<{
    directive: GovtDirective;
    actionType: 'APPROVE' | 'REPORT_PROBLEM';
  } | null>(null);
  const [directiveResponseNote, setDirectiveResponseNote] = useState('');
  const [submittingDirective, setSubmittingDirective] = useState(false);

  // PHC -> Government Escalations
  const [myGovtRequests, setMyGovtRequests] = useState<PhcGovtRequest[]>([]);
  const [loadingGovtRequests, setLoadingGovtRequests] = useState(false);
  const [reqCategory, setReqCategory] = useState<PhcGovtRequest['category']>('EMERGENCY_DRUG_REQUISITION');
  const [reqUrgency, setReqUrgency] = useState<PhcGovtRequest['urgency']>('CRITICAL_URGENT');
  const [reqTitle, setReqTitle] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [submittingGovtReq, setSubmittingGovtReq] = useState(false);
  const [govtReqFeedback, setGovtReqFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // AI Copilot Chat State
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'नमस्कार! I am your PHC AI Clinical & Inventory Copilot. You can ask me to calculate pediatric dosages, estimate drug burn rates, check WHO dehydration ORS volumes, IV drip rates, or emergency ASV snakebite protocols.'
    }
  ]);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const copilotEndRef = useRef<HTMLDivElement>(null);

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
    setLoadingGovtRequests(true);
    setLoadingTransfers(true);

    try {
      // 1. Fetch live operational & medicine state
      const invRes = await fetch(`/api/phc/inventory?facility_id=${facilityId}&email=${encodeURIComponent(email)}`);
      const invData = await invRes.json();
      if (invData.success && invData.facility) {
        setLiveState(invData.facility);
        setEditBedsAvailable(invData.facility.available_beds ?? 10);
        setEditDoctorsPresent(invData.facility.doctors_present ?? 4);
        setEditAmbulanceStatus(invData.facility.ambulance_status ?? 'READY_24_7');
        setEditErStatus(invData.facility.emergency_room_status ?? 'ACCEPTING_PATIENTS');
      }

      // 2. Fetch official Government directives
      const dirRes = await fetch(`/api/government/directives?facility_id=${facilityId}&email=${encodeURIComponent(email)}`);
      const dirData = await dirRes.json();
      if (dirData.success && Array.isArray(dirData.directives)) {
        setDirectives(dirData.directives);
      }

      // 3. Fetch PHC -> Govt requests
      const reqRes = await fetch(`/api/phc/support-request?facility_id=${facilityId}&email=${encodeURIComponent(email)}`);
      const reqData = await reqRes.json();
      if (reqData.success && Array.isArray(reqData.requests)) {
        setMyGovtRequests(reqData.requests);
      }

      // 4. Fetch peer transfers
      const trRes = await fetch(`/api/phc/transfer-request?email=${encodeURIComponent(email)}`);
      const trData = await trRes.json();
      if (trData.success && Array.isArray(trData.transfers)) {
        setTransfers(trData.transfers);
      }
    } catch (err) {
      console.error('Failed to load PHC data', err);
    } finally {
      setLoadingState(false);
      setLoadingDirectives(false);
      setLoadingGovtRequests(false);
      setLoadingTransfers(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchPhcData(currentUser.facility_id, currentUser.email);

      // Periodic polling refresh
      const interval = setInterval(() => {
        fetchPhcData(currentUser.facility_id, currentUser.email);
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  useEffect(() => {
    copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotMessages, copilotLoading]);

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/phc/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput.trim()
        })
      });

      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        sessionStorage.setItem('jh_phc_auth_user', JSON.stringify(data.user));
        setEmailInput('');
        setPasswordInput('');
        setAuthError('');
      } else {
        setAuthError(data.error || 'अमान्य ईमेल या पासवर्ड (Invalid PHC Email or Password)');
      }
    } catch (err: any) {
      setAuthError(err.message || 'सत्यापन में त्रुटि (Authentication failed)');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('jh_phc_auth_user');
    setCurrentUser(null);
    setLiveState(null);
    setDirectives([]);
    setMyGovtRequests([]);
    setTransfers([]);
  };

  const handleSelectPhc = (email: string) => {
    setEmailInput(email);
    setPasswordInput('');
    setAuthError('');
    const passField = document.getElementById('phc-password-input');
    if (passField) passField.focus();
  };

  // Handle Live Capacity / Operational Save
  const handleSaveOperational = async () => {
    if (!currentUser) return;
    setSavingOperational(true);
    setOperationalSaveMsg(null);

    try {
      const res = await fetch('/api/phc/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_id: currentUser.facility_id,
          action: 'UPDATE_OPERATIONAL',
          operational: {
            available_beds: Number(editBedsAvailable),
            doctors_present: Number(editDoctorsPresent),
            ambulance_status: editAmbulanceStatus,
            emergency_room_status: editErStatus
          }
        })
      });

      const data = await res.json();
      if (data.success && data.facility) {
        setLiveState(data.facility);
        setOperationalSaveMsg('✓ Live capacity updated across Govt & Public Portals!');
        setTimeout(() => setOperationalSaveMsg(null), 4000);
      }
    } catch (err) {
      console.error('Failed to update operational data', err);
    } finally {
      setSavingOperational(false);
    }
  };

  // Handle Individual Medicine Stock Save
  const handleSaveStock = async (medicineId: string) => {
    if (!currentUser) return;
    const newQty = editStockValues[medicineId];
    if (newQty === undefined || isNaN(newQty)) return;

    setStockUpdatingId(medicineId);
    setStockSaveMsg(null);

    try {
      const res = await fetch('/api/phc/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_id: currentUser.facility_id,
          action: 'UPDATE_STOCK',
          medicine_id: medicineId,
          new_stock: Number(newQty)
        })
      });

      const data = await res.json();
      if (data.success && data.facility) {
        setLiveState(data.facility);
        setStockSaveMsg({
          id: medicineId,
          msg: newQty < 200 
            ? '⚡ Critical shortage! Auto-pushed alert to Government Radar.' 
            : newQty < 300 
            ? '⚠️ Warning buffer alert recorded.' 
            : '✓ Stock synced to Govt & Citizen Portals'
        });
        setTimeout(() => setStockSaveMsg(null), 4000);
        // Refresh govt requests to show auto-created AI Sentinel ticket if any
        fetchPhcData(currentUser.facility_id, currentUser.email);
      }
    } catch (err) {
      console.error('Failed to update stock', err);
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
          name: newMedName.trim(),
          category: newMedCategory,
          unit: newMedUnit,
          current_stock: Number(newMedStock),
          min_safety_stock: Number(newMedMinSafety),
          batch_number: newMedBatch.trim() || 'JH-2026-N1',
          expiry_date: newMedExpiry
        })
      });

      const data = await res.json();
      if (data.success && data.facility) {
        setLiveState(data.facility);
        setIsAddMedModalOpen(false);
        setNewMedName('');
        setNewMedStock(500);
        setNewMedMinSafety(200);
      }
    } catch (err) {
      console.error('Failed to add medicine', err);
    } finally {
      setIsAddingMed(false);
    }
  };

  // Handle Directive Response (Approve / Report Problem)
  const handleSubmitDirectiveResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDirectiveAction || !currentUser) return;

    setSubmittingDirective(true);
    try {
      const res = await fetch('/api/government/directives', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directive_id: activeDirectiveAction.directive.id,
          status: activeDirectiveAction.actionType === 'APPROVE' ? 'APPROVED_AND_READY' : 'PROBLEM_REPORTED',
          response_notes: directiveResponseNote.trim() || (activeDirectiveAction.actionType === 'APPROVE' ? 'Stock allocation approved and prepared for dispatch.' : 'Resource constraint reported to Government.'),
          responded_by: currentUser.medical_officer_in_charge
        })
      });

      const data = await res.json();
      if (data.success) {
        setActiveDirectiveAction(null);
        setDirectiveResponseNote('');
        fetchPhcData(currentUser.facility_id, currentUser.email);
      }
    } catch (err) {
      console.error('Failed to submit directive response', err);
    } finally {
      setSubmittingDirective(false);
    }
  };

  // Handle PHC Escalation to Govt
  const handleSubmitGovtRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !reqTitle.trim() || !reqDescription.trim()) return;

    setSubmittingGovtReq(true);
    setGovtReqFeedback(null);

    try {
      const res = await fetch('/api/phc/support-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_facility_id: currentUser.facility_id,
          category: reqCategory,
          urgency: reqUrgency,
          title: reqTitle.trim(),
          description: reqDescription.trim(),
          requested_by_officer: currentUser.medical_officer_in_charge
        })
      });

      const data = await res.json();
      if (data.success) {
        setGovtReqFeedback({
          type: 'success',
          text: `Request ${data.request.request_code} successfully escalated to State Government Command Radar!`
        });
        setReqTitle('');
        setReqDescription('');
        fetchPhcData(currentUser.facility_id, currentUser.email);
      } else {
        setGovtReqFeedback({ type: 'error', text: data.error || 'Failed to submit request' });
      }
    } catch (err: any) {
      setGovtReqFeedback({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmittingGovtReq(false);
    }
  };

  // Handle Copilot Chat Submission
  const handleSendCopilot = async (overridePrompt?: string) => {
    const promptToSend = (overridePrompt || copilotInput).trim();
    if (!promptToSend || copilotLoading || !currentUser) return;

    const newHistory = [...copilotMessages, { role: 'user' as const, content: promptToSend }];
    setCopilotMessages(newHistory);
    if (!overridePrompt) setCopilotInput('');
    setCopilotLoading(true);

    try {
      const res = await fetch('/api/phc/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptToSend,
          facility_id: currentUser.facility_id,
          facility_email: currentUser.email,
          chat_history: newHistory.slice(-6)
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setCopilotMessages([...newHistory, { role: 'assistant', content: data.reply }]);
      } else {
        setCopilotMessages([
          ...newHistory,
          { role: 'assistant', content: '⚠️ Unable to process query. Please verify internet connection or try a simplified clinical formula request.' }
        ]);
      }
    } catch (err: any) {
      setCopilotMessages([
        ...newHistory,
        { role: 'assistant', content: `⚠️ Error communicating with AI Clinical Engine: ${err.message || 'Network Timeout'}` }
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#064e3b] flex items-center justify-center text-white font-sans">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          <span className="text-sm font-bold">PHC स्टाफ पोर्टल सत्यापन...</span>
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
        
        {/* Top Header */}
        <div className="w-full bg-[#064e3b] text-white px-6 py-2 flex items-center justify-between text-xs font-medium z-20 border-b border-[#047857]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>झारखंड सरकार &bull; प्राथमिक स्वास्थ्य केंद्र (PHC/CHC) पोर्टल</span>
          </div>
          <div className="text-emerald-200 font-bold text-[11px]">
            HEALTHGRID AI PHC STAFF ACCESS
          </div>
        </div>

        <NewsTicker />

        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-8 gap-8 relative z-10 max-w-6xl mx-auto my-auto w-full">
          
          {/* Login Card */}
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-emerald-300 overflow-hidden shrink-0">
            
            <div className="bg-[#064e3b] p-6 text-white text-center relative">
              <div className="w-16 h-16 bg-white rounded-2xl p-2 mx-auto mb-3 shadow-md flex items-center justify-center">
                <img 
                  src="/emblem-logo.png" 
                  alt="Government Emblem" 
                  className="max-h-full max-w-full object-contain" 
                />
              </div>
              <h2 className="text-base font-black tracking-wide">प्राथमिक स्वास्थ्य केंद्र स्टाफ लॉगिन</h2>
              <p className="text-xs text-emerald-100 mt-1 font-medium">
                Official PHC / CHC Medical Officer &amp; Staff Gateway
              </p>
              <div className="inline-block mt-2 bg-emerald-900/60 border border-emerald-400/40 text-[10px] text-amber-300 font-bold px-3 py-1 rounded-full">
                Department of Health &amp; Family Welfare, GoJ
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
                  PHC Official Email / आधिकारिक ईमेल:
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
                    id="phc-password-input"
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter Medical Officer Password"
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

          {/* Quick Facility Directory (Selects Email Only, Does NOT Show Passwords) */}
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border-2 border-emerald-300 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#064e3b] text-[10px] font-black uppercase mb-1">
                  <Building2 className="w-3 h-3 text-[#047857]" />
                  <span>PHC SELECTION &bull; प्राथमिक स्वास्थ्य केंद्र सूची</span>
                </div>
                <h3 className="text-sm font-black text-[#064e3b]">Ranchi District PHC Directory</h3>
                <p className="text-xs text-slate-500 font-medium">Click any PHC to select email ID, then enter your officer password to log in:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {PHC_CREDENTIALS_MASTER.map((phc, idx) => (
                <div 
                  key={phc.facility_id}
                  onClick={() => handleSelectPhc(phc.email)}
                  className={`p-3 bg-emerald-50/50 hover:bg-emerald-100/80 border rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-2xs ${
                    emailInput.toLowerCase() === phc.email.toLowerCase() 
                      ? 'border-[#064e3b] bg-emerald-100/90 ring-2 ring-emerald-400' 
                      : 'border-emerald-200 hover:border-[#047857]'
                  }`}
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

                  <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-700 font-semibold font-mono text-[10.5px]">{phc.email}</span>
                    <span className="text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-[10px] flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-emerald-700" />
                      <span>Enter Pass</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Passwords are protected. Enter your password to securely authenticate into the PHC workspace.</span>
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
  const lowDrugsCount = liveState?.medicines?.filter(m => m.current_stock < 300 || m.status === 'LOW' || m.status === 'CRITICAL').length || 0;
  const criticalDrugsCount = liveState?.medicines?.filter(m => m.current_stock < 200 || m.status === 'CRITICAL').length || 0;

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
                onClick={handleSubmitDirectiveResponse}
                disabled={submittingDirective}
                className={`py-2.5 text-white rounded-xl text-xs font-black transition-colors shadow-md flex items-center justify-center gap-1.5 ${
                  activeDirectiveAction.actionType === 'APPROVE' ? 'bg-[#064e3b] hover:bg-[#047857]' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submittingDirective ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>
                  {activeDirectiveAction.actionType === 'APPROVE' ? 'Confirm Dispatch Readiness' : 'Transmit Problem to Govt Radar'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEDICINE BATCH MODAL */}
      {isAddMedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-emerald-400 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-[#064e3b] rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#064e3b]">नई दवा / आपूर्ति बैच जोड़ें</h3>
                  <p className="text-[10px] text-slate-500 font-bold">Register New Drug Stock to {currentUser.facility_name}</p>
                </div>
              </div>
              <button onClick={() => setIsAddMedModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewMedicine} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Medicine Name / दवा का नाम:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ciprofloxacin 500mg"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Category:</label>
                  <select
                    value={newMedCategory}
                    onChange={(e) => setNewMedCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-emerald-200 rounded-xl text-slate-800 font-semibold outline-none"
                  >
                    <option value="Essential Drug">Essential Drug</option>
                    <option value="Emergency Care">Emergency Care</option>
                    <option value="Critical Antidote">Critical Antidote</option>
                    <option value="Maternal & Child">Maternal &amp; Child</option>
                    <option value="Antibiotic">Antibiotic</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Unit:</label>
                  <select
                    value={newMedUnit}
                    onChange={(e) => setNewMedUnit(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-emerald-200 rounded-xl text-slate-800 font-semibold outline-none"
                  >
                    <option value="Tablets">Tablets</option>
                    <option value="Vials">Vials</option>
                    <option value="Packets">Packets</option>
                    <option value="Bottles">Bottles</option>
                    <option value="Ampoules">Ampoules</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Initial Stock Count:</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newMedStock}
                    onChange={(e) => setNewMedStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Safety Threshold:</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newMedMinSafety}
                    onChange={(e) => setNewMedMinSafety(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Batch Number:</label>
                  <input
                    type="text"
                    required
                    value={newMedBatch}
                    onChange={(e) => setNewMedBatch(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-emerald-200 rounded-xl text-slate-800 font-mono text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#064e3b] block mb-1">Expiry Date:</label>
                  <input
                    type="date"
                    required
                    value={newMedExpiry}
                    onChange={(e) => setNewMedExpiry(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-emerald-200 rounded-xl text-slate-800 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMedModalOpen(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingMed}
                  className="py-2.5 bg-[#064e3b] hover:bg-[#047857] text-white rounded-xl text-xs font-black transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  {isAddingMed ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Add to Master Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="w-full bg-[#064e3b] text-white px-6 py-1.5 flex items-center justify-between text-[11px] font-medium z-30 border-b border-[#047857]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>झारखंड सरकार &bull; {currentUser.facility_name} (Block: {currentUser.block})</span>
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

      <NewsTicker />

      {/* Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-emerald-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/phc" className="flex items-center gap-2">
            <div className="h-10 w-auto">
              <img src="/emblem-logo.png" alt="Jharkhand Health" className="h-full w-auto object-contain" />
            </div>
          </Link>
          <div className="border-l-2 border-emerald-600 pl-3">
            <h1 className="text-sm font-black text-[#064e3b] leading-tight">{currentUser.facility_name}</h1>
            <p className="text-[10px] text-emerald-800 font-bold">HEALTHGRID AI DEDICATED PHC COMMAND &amp; CLINICAL STATION</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <Phone className="w-3 h-3 text-emerald-700" />
              {currentUser.phone}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-300 shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8 relative z-10">
        
        {/* Top Operational Status Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-emerald-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Facility Status</span>
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="text-xl font-black text-[#064e3b]">
              {currentUser.facility_type} &bull; {currentUser.block}
            </div>
            <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>Live Synchronized with Govt Radar</span>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-blue-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase">Bed Availability</span>
              <Bed className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-900">
              {liveState?.available_beds ?? editBedsAvailable} <span className="text-sm font-normal text-slate-500">/ {liveState?.total_beds ?? 30} Total</span>
            </div>
            <div className="text-[10px] text-blue-700 font-bold">
              {liveState?.emergency_room_status === 'ACCEPTING_PATIENTS' ? '🟢 ER Accepting Patients' : '🔴 ER Critical Overflow'}
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-amber-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase">Govt Directives</span>
              <MessageSquare className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-800">
              {directives.filter(d => d.status === 'PENDING_RESPONSE').length} Pending
            </div>
            <div className="text-[10px] text-amber-700 font-bold">
              {directives.length} Total State Commands Received
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-red-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700 uppercase">AI Sentinel Alerts</span>
              <Zap className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-black text-red-700">
              {criticalDrugsCount > 0 ? `${criticalDrugsCount} Critical` : `${lowDrugsCount} Low`}
            </div>
            <div className="text-[10px] text-red-600 font-bold">
              Auto-dispatched to State Command
            </div>
          </div>

        </section>

        {/* ========================================================= */}
        {/* 🤖 AI AUTONOMOUS INVENTORY SENTINEL CARD                  */}
        {/* ========================================================= */}
        <section className="bg-gradient-to-r from-emerald-900 via-[#064e3b] to-teal-900 text-white rounded-3xl p-6 shadow-md border-2 border-emerald-400 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-emerald-800/80 border border-emerald-400/50 rounded-2xl shadow-inner shrink-0">
              <Zap className="w-7 h-7 text-amber-300 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  AI AUTONOMOUS SENTINEL 24/7 ACTIVE
                </span>
                <span className="text-amber-300 text-xs font-bold">स्वचालित स्टॉक निगरानी एवं कमान केंद्र अलर्ट</span>
              </div>
              <h3 className="text-base font-black text-white">
                Autonomous Shortage Notification Engine
              </h3>
              <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                Whenever any drug stock falls below <strong>300 units</strong> (Warning) or <strong>200 units</strong> (Critical Urgent Shortage), the AI Sentinel instantly generates and pushes a high-priority emergency replenishment ticket directly into the <strong>State Government Command Radar</strong> without requiring manual filing.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
            <div className="bg-black/30 backdrop-blur-md px-4 py-3 rounded-2xl border border-emerald-500/40 text-center w-full sm:w-auto">
              <div className="text-[10px] uppercase font-bold text-emerald-300">Monitored Thresholds</div>
              <div className="text-xs font-black text-white mt-0.5">&lt; 300 (Warning) &bull; &lt; 200 (Critical)</div>
            </div>

            <button
              onClick={() => handleSendCopilot('Check current stock depletion and verify AI Sentinel triggers')}
              className="py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 border border-amber-500 w-full sm:w-auto"
            >
              <Bot className="w-4 h-4 text-slate-900" />
              <span>Run Sentinel Audit with AI</span>
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 🤖 PHC MEDICAL OFFICER & STAFF AI CLINICAL COPILOT (CHAT) */}
        {/* ========================================================= */}
        <section className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-emerald-400 p-6 shadow-md flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-2xl text-[#064e3b]">
                <Bot className="w-6 h-6 text-[#047857]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-[#064e3b] text-[10px] font-black uppercase mb-0.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>PHC CLINICAL &amp; INVENTORY AI ASSISTANT &bull; चिकित्सा AI सहायक</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-[#064e3b]">
                  PHC Medical Officer &amp; Staff AI Copilot (दवा गणना एवं प्रोटोकॉल सहायक)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Ask dosage calculations, emergency snakebite ASV protocols, ORS hydration charts, IV drip rates, or live stock burn-rate formulas
                </p>
              </div>
            </div>

            <button
              onClick={() => setCopilotMessages([
                {
                  role: 'assistant',
                  content: 'नमस्कार! I am ready to calculate dosages, emergency protocols, or verify PHC inventory safety buffers.'
                }
              ])}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-1 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          </div>

          {/* Quick Action Calculation Prompt Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => handleSendCopilot('Calculate pediatric paracetamol dose for a 12 kg child with acute fever')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#064e3b] rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Pill className="w-3.5 h-3.5 text-emerald-700" />
              <span>💊 Paracetamol (12kg Child)</span>
            </button>

            <button
              onClick={() => handleSendCopilot('Explain the national Snakebite Anti-Snake Venom (ASV) dosage and infusion protocol for PHC')}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>🐍 Snakebite ASV Protocol</span>
            </button>

            <button
              onClick={() => handleSendCopilot('Calculate WHO ORS volume for 8kg infant and calculate IV drip rate for 500mL RL over 2 hours')}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5 text-blue-700" />
              <span>💧 ORS &amp; IV Drip Rate Formula</span>
            </button>

            <button
              onClick={() => handleSendCopilot('What is the Oxytocin AMTSL protocol and cold-chain storage rule for PHC delivery room?')}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-purple-700" />
              <span>👶 Oxytocin AMTSL Protocol</span>
            </button>

            <button
              onClick={() => handleSendCopilot('List all medicines currently below safety thresholds at this PHC')}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-300 text-red-900 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-red-700" />
              <span>⚠️ Check Low Stock Items</span>
            </button>
          </div>

          {/* Chat Messages Box */}
          <div className="bg-slate-50/80 rounded-2xl border border-emerald-200 p-4 min-h-[260px] max-h-[420px] overflow-y-auto flex flex-col gap-3 shadow-inner">
            {copilotMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 max-w-[90%] sm:max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                    msg.role === 'user'
                      ? 'bg-[#064e3b] text-white shadow-2xs'
                      : 'bg-white text-emerald-700 border border-emerald-300 shadow-2xs'
                  }`}
                >
                  {msg.role === 'user' ? 'MO' : <Bot className="w-4 h-4 text-[#064e3b]" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#064e3b] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-emerald-200 rounded-tl-none shadow-2xs'
                  }`}
                >
                  <CopilotMessageRenderer content={msg.content} role={msg.role} />
                </div>
              </div>
            ))}

            {copilotLoading && (
              <div className="flex gap-2.5 mr-auto max-w-[85%]">
                <div className="w-7 h-7 rounded-xl bg-white text-emerald-700 border border-emerald-300 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#064e3b]" />
                </div>
                <div className="p-3.5 bg-white border border-emerald-200 rounded-2xl rounded-tl-none text-xs text-slate-600 font-semibold flex items-center gap-2 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>Clinical AI engine calculating dosage &amp; protocols...</span>
                </div>
              </div>
            )}

            <div ref={copilotEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCopilot();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              placeholder="Type clinical question, dosage calculation, or stock formula (e.g. Calculate pediatric amoxicillin for 15kg)..."
              className="flex-1 p-3 bg-emerald-50/40 border border-emerald-300 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#064e3b] transition-all"
            />

            <button
              type="submit"
              disabled={copilotLoading || !copilotInput.trim()}
              className="py-3 px-5 bg-[#064e3b] hover:bg-[#047857] text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 border border-emerald-800 disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>Ask Copilot</span>
            </button>
          </form>
        </section>

        {/* ========================================================= */}
        {/* FACILITY OPERATIONAL CAPACITY CONTROLS                    */}
        {/* ========================================================= */}
        <section className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-300 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#064e3b] text-[10px] font-black uppercase mb-1">
                <Activity className="w-3 h-3 text-[#047857]" />
                <span>REAL-TIME TELEMETRY CONTROL &bull; क्षमता नियंत्रण</span>
              </div>
              <h3 className="text-sm font-black text-[#064e3b]">
                दैनिक क्षमता एवं परिचालन स्थिति अपडेट (Live Facility Operational Controls)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Changes saved here immediately sync to Government Command Radar and Public Citizen Map!
              </p>
            </div>

            {operationalSaveMsg && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                {operationalSaveMsg}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            
            {/* Available Beds Stepper */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex flex-col gap-2">
              <label className="font-bold text-[#064e3b] flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-emerald-700" />
                <span>Available Beds (उपलब्ध बेड):</span>
              </label>
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setEditBedsAvailable(Math.max(0, editBedsAvailable - 1))}
                  className="w-9 h-9 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-xl font-black text-base text-[#064e3b] flex items-center justify-center transition-colors shadow-2xs"
                >
                  -
                </button>
                <span className="text-xl font-black text-[#064e3b] min-w-[40px] text-center">
                  {editBedsAvailable}
                </span>
                <button
                  type="button"
                  onClick={() => setEditBedsAvailable(Math.min(liveState?.total_beds ?? 30, editBedsAvailable + 1))}
                  className="w-9 h-9 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-xl font-black text-base text-[#064e3b] flex items-center justify-center transition-colors shadow-2xs"
                >
                  +
                </button>
                <span className="text-[11px] text-slate-500 font-bold ml-1">/ {liveState?.total_beds ?? 30} Total</span>
              </div>
            </div>

            {/* Doctors Present Stepper */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex flex-col gap-2">
              <label className="font-bold text-[#064e3b] flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                <span>Doctors On Duty (उपस्थित डॉक्टर):</span>
              </label>
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setEditDoctorsPresent(Math.max(0, editDoctorsPresent - 1))}
                  className="w-9 h-9 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-xl font-black text-base text-[#064e3b] flex items-center justify-center transition-colors shadow-2xs"
                >
                  -
                </button>
                <span className="text-xl font-black text-[#064e3b] min-w-[40px] text-center">
                  {editDoctorsPresent}
                </span>
                <button
                  type="button"
                  onClick={() => setEditDoctorsPresent(editDoctorsPresent + 1)}
                  className="w-9 h-9 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-xl font-black text-base text-[#064e3b] flex items-center justify-center transition-colors shadow-2xs"
                >
                  +
                </button>
                <span className="text-[11px] text-slate-500 font-bold ml-1">Doctors</span>
              </div>
            </div>

            {/* 108 Ambulance Status */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex flex-col gap-2">
              <label className="font-bold text-[#064e3b] flex items-center gap-1.5">
                <Ambulance className="w-4 h-4 text-emerald-700" />
                <span>108 Ambulance Status:</span>
              </label>
              <select
                value={editAmbulanceStatus}
                onChange={(e: any) => setEditAmbulanceStatus(e.target.value)}
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-slate-800 outline-none mt-1"
              >
                <option value="READY_24_7">🟢 24/7 ACTIVE &amp; READY</option>
                <option value="ON_CALL_DISPATCHED">🟠 ON CALL / DISPATCHED</option>
                <option value="MAINTENANCE">🔴 UNDER MAINTENANCE</option>
              </select>
            </div>

            {/* Emergency Room Status */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex flex-col gap-2">
              <label className="font-bold text-[#064e3b] flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-emerald-700" />
                <span>Emergency Room (ER) Status:</span>
              </label>
              <select
                value={editErStatus}
                onChange={(e: any) => setEditErStatus(e.target.value)}
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-slate-800 outline-none mt-1"
              >
                <option value="ACCEPTING_PATIENTS">🟢 ACCEPTING PATIENTS</option>
                <option value="CRITICAL_OVERFLOW">🔴 CRITICAL OVERFLOW</option>
              </select>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveOperational}
              disabled={savingOperational}
              className="py-2.5 px-6 bg-[#064e3b] hover:bg-[#047857] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 border border-emerald-900 disabled:opacity-50"
            >
              {savingOperational ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-amber-300" />}
              <span>Save &amp; Broadcast Operational Capacity to Govt Radar</span>
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* OFFICIAL GOVT DIRECTIVES (GOVT -> PHC)                    */}
        {/* ========================================================= */}
        <section className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-amber-300 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase mb-1">
                <ShieldAlert className="w-3 h-3 text-amber-700" />
                <span>INCOMING STATE ORDERS &bull; सरकारी निर्देश इनबॉक्स</span>
              </div>
              <h3 className="text-sm font-black text-[#064e3b]">
                मुख्यालय से प्राप्त सरकारी निर्देश (Directives from State Health Command)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Official commands, inter-facility transfer orders, and surge alerts sent directly by Government Officers.
              </p>
            </div>
            <button
              onClick={() => fetchPhcData(currentUser.facility_id, currentUser.email)}
              className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-800 text-xs flex items-center gap-1 font-bold border border-amber-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDirectives ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] bg-amber-50/50">
                  <th className="py-2.5 px-3">Directive Code</th>
                  <th className="py-2.5 px-2">Time</th>
                  <th className="py-2.5 px-2">Priority</th>
                  <th className="py-2.5 px-2">Subject &amp; Message</th>
                  <th className="py-2.5 px-2">Response / Remarks</th>
                  <th className="py-2.5 px-2 text-right">Status &amp; Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {directives.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      No active government directives for this facility.
                    </td>
                  </tr>
                ) : (
                  directives.map((dir) => (
                    <tr key={dir.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-black text-slate-800">
                        {dir.directive_code}
                      </td>
                      <td className="py-3 px-2 text-slate-500 font-medium text-[11px]">
                        {new Date(dir.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-black ${
                          dir.priority === 'URGENT_DIRECTIVE' ? 'bg-red-100 text-red-700 border border-red-200' :
                          dir.priority === 'STOCK_INQUIRY' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {dir.priority.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-2 max-w-[260px]">
                        <div className="font-bold text-slate-900">{dir.title}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{dir.message}</div>
                      </td>
                      <td className="py-3 px-2 max-w-[200px]">
                        {dir.phc_response_notes ? (
                          <div className="text-[11px] text-slate-700 italic bg-white p-1.5 rounded border border-slate-200">
                            &ldquo;{dir.phc_response_notes}&rdquo;
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No remarks recorded</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {dir.status === 'PENDING_RESPONSE' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setActiveDirectiveAction({ directive: dir, actionType: 'APPROVE' });
                                setDirectiveResponseNote('');
                              }}
                              className="px-2.5 py-1 bg-[#064e3b] hover:bg-[#047857] text-white rounded-lg text-[10.5px] font-bold transition-colors shadow-2xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setActiveDirectiveAction({ directive: dir, actionType: 'REPORT_PROBLEM' });
                                setDirectiveResponseNote('');
                              }}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10.5px] font-bold transition-colors"
                            >
                              Report Issue
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            dir.status === 'APPROVED_AND_READY' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            'bg-red-100 text-red-800 border border-red-300'
                          }`}>
                            {dir.status === 'APPROVED_AND_READY' ? '✓ Approved' : '⚠️ Problem Reported'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PHC -> GOVERNMENT DIRECT ESCALATION & SUPPORT FORM        */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Create Request Form */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-300 p-6 shadow-sm flex flex-col gap-4">
            <div className="border-b border-emerald-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#064e3b] text-[10px] font-black uppercase mb-1">
                <Send className="w-3 h-3 text-[#047857]" />
                <span>PHC TO GOVT CHANNEL &bull; सरकार से सहायता मांग</span>
              </div>
              <h3 className="text-sm font-black text-[#064e3b]">
                सरकार से सहायता / आपात आपूर्ति मांगें (Escalate Need to State Command)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Connect directly to Government Command for emergency medicines, specialist doctors, 108 ambulances, or equipment repairs.
              </p>
            </div>

            {govtReqFeedback && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${
                govtReqFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {govtReqFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                <span>{govtReqFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmitGovtRequest} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Select Need Category / आवश्यकता श्रेणी:</label>
                <select
                  value={reqCategory}
                  onChange={(e: any) => setReqCategory(e.target.value)}
                  className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none cursor-pointer"
                >
                  <option value="EMERGENCY_DRUG_REQUISITION">💊 Emergency Drug Requisition (ASV, Paracetamol, ORS, IV)</option>
                  <option value="SPECIALIST_DOCTOR_NEED">🩺 Visiting Specialist Doctor Need (Pediatric, Gynae, Surgeon)</option>
                  <option value="AMBULANCE_DISPATCH_NEED">🚑 Advanced 108 Life Support Ambulance Dispatch</option>
                  <option value="INFRASTRUCTURE_OR_EQUIPMENT">⚡ Infrastructure, Generator or Cold-Chain Repair</option>
                  <option value="GENERAL_SUPPORT">🛡️ General PHC Administrative Support</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Urgency Level:</label>
                <select
                  value={reqUrgency}
                  onChange={(e: any) => setReqUrgency(e.target.value)}
                  className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none"
                >
                  <option value="CRITICAL_URGENT">🔴 CRITICAL URGENT (Immediate 1-2 hour response needed)</option>
                  <option value="HIGH">🟠 HIGH (Within 24 hours)</option>
                  <option value="NORMAL">🟢 NORMAL (Routine Schedule)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Subject / शीर्षक:</label>
                <input
                  type="text"
                  required
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="e.g. Urgent need of 15 ASV vials due to snakebite cluster in Block"
                  className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#064e3b] block mb-1">Detailed Requirement / विस्तृत विवरण:</label>
                <textarea
                  rows={3}
                  required
                  value={reqDescription}
                  onChange={(e) => setReqDescription(e.target.value)}
                  placeholder="Describe patient count, clinical urgency, specific quantities needed, and facility readiness..."
                  className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-800 font-semibold outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingGovtReq}
                className="w-full py-3 bg-[#064e3b] hover:bg-[#047857] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-1 border border-emerald-800 disabled:opacity-50"
              >
                {submittingGovtReq ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting to Govt Command...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>Transmit Need Request to Govt Radar</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Requests Status Log */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-300 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-[#064e3b]">
                  भेजे गए सहायता अनुरोध स्थिति (My Transmitted Government Requisitions)
                </h3>
                <p className="text-xs text-slate-500 font-medium">Tracking status of requests sent by this PHC to State Headquarters</p>
              </div>
              <button
                onClick={() => fetchPhcData(currentUser.facility_id, currentUser.email)}
                className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-800 text-xs flex items-center gap-1 font-bold border border-emerald-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingGovtRequests ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] bg-emerald-50/40">
                    <th className="py-2.5 px-3">Req Code &amp; Time</th>
                    <th className="py-2.5 px-2">Category</th>
                    <th className="py-2.5 px-2">Subject</th>
                    <th className="py-2.5 px-2">Govt Action / Notes</th>
                    <th className="py-2.5 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myGovtRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                        No support requests initiated yet.
                      </td>
                    </tr>
                  ) : (
                    myGovtRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-800">{req.request_code}</div>
                          <div className="text-[10px] text-slate-400">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>

                        <td className="py-3 px-2">
                          <div className="font-semibold text-slate-800">{req.category.replace(/_/g, ' ')}</div>
                          <span className={`text-[9.5px] font-bold ${
                            req.urgency === 'CRITICAL_URGENT' ? 'text-red-600' : 'text-amber-600'
                          }`}>
                            {req.urgency}
                          </span>
                        </td>

                        <td className="py-3 px-2 max-w-[180px]">
                          <div className="font-bold text-slate-900 truncate" title={req.title}>{req.title}</div>
                          <div className="text-[10.5px] text-slate-500 line-clamp-1">{req.description}</div>
                        </td>

                        <td className="py-3 px-2 max-w-[180px]">
                          {req.govt_response_notes ? (
                            <div className="text-[10.5px] text-slate-700 italic bg-emerald-50 p-1.5 rounded border border-emerald-200">
                              &ldquo;{req.govt_response_notes}&rdquo;
                            </div>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Under State Review
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-2 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            req.status === 'PENDING_GOVT_ACTION' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            req.status === 'GOVT_APPROVED_DISPATCHED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                            'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}>
                            {req.status.replace(/_/g, ' ')}
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

        {/* ========================================================= */}
        {/* LIVE MEDICINE INVENTORY MANAGEMENT                        */}
        {/* ========================================================= */}
        <section className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-300 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#064e3b] text-[10px] font-black uppercase mb-1">
                <Package className="w-3 h-3 text-[#047857]" />
                <span>LIVE DRUG INVENTORY &bull; वास्तविक दवा भंडार</span>
              </div>
              <h3 className="text-sm font-black text-[#064e3b]">
                PHC दवा एवं आपूर्ति प्रबंधन (Real-Time Drug Stock Controls)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Update stock levels, batch numbers, and expiry dates. All updates instantly reflect on Govt Command and Public views.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddMedModalOpen(true)}
                className="py-2 px-3.5 bg-[#064e3b] hover:bg-[#047857] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 border border-emerald-900"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Add Medicine Batch</span>
              </button>

              <button
                onClick={() => fetchPhcData(currentUser.facility_id, currentUser.email)}
                className="p-2 hover:bg-emerald-50 rounded-xl text-emerald-800 text-xs flex items-center gap-1 font-bold border border-emerald-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingState ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] bg-emerald-50/40">
                  <th className="py-2.5 px-3">Medicine &amp; Category</th>
                  <th className="py-2.5 px-2">Batch &amp; Expiry</th>
                  <th className="py-2.5 px-2">Current Stock</th>
                  <th className="py-2.5 px-2">Safety Buffer</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-right">Quick Edit Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!liveState?.medicines || liveState.medicines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      Loading medicine stocks...
                    </td>
                  </tr>
                ) : (
                  liveState.medicines.map((med) => {
                    const editVal = editStockValues[med.id] !== undefined ? editStockValues[med.id] : med.current_stock;
                    const isSaving = stockUpdatingId === med.id;
                    const saveMsg = stockSaveMsg?.id === med.id ? stockSaveMsg.msg : null;

                    return (
                      <tr key={med.id} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#064e3b] text-xs">{med.name}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{med.category} &bull; Unit: {med.unit}</div>
                        </td>

                        <td className="py-3 px-2 font-mono text-[11px] text-slate-700">
                          <div>Batch: {med.batch_number}</div>
                          <div className="text-[10px] text-slate-400">Exp: {med.expiry_date}</div>
                        </td>

                        <td className="py-3 px-2">
                          <span className="text-sm font-black text-slate-900">{med.current_stock}</span>
                          <span className="text-[10px] text-slate-500 font-medium ml-1">{med.unit}</span>
                        </td>

                        <td className="py-3 px-2 text-slate-600 font-semibold text-[11px]">
                          {med.min_safety_stock} {med.unit}
                        </td>

                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            med.status === 'SAFE' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                            med.status === 'LOW' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            'bg-red-100 text-red-900 border border-red-300'
                          }`}>
                            {med.status}
                          </span>
                        </td>

                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {saveMsg && (
                              <span className="text-[10px] font-bold text-emerald-700 animate-in fade-in">
                                {saveMsg}
                              </span>
                            )}
                            <input
                              type="number"
                              min={0}
                              value={editVal}
                              onChange={(e) => setEditStockValues({
                                ...editStockValues,
                                [med.id]: Number(e.target.value)
                              })}
                              className="w-20 p-1.5 bg-slate-50 border border-emerald-300 rounded-lg text-xs font-bold text-slate-800 text-center outline-none focus:bg-white"
                            />
                            <button
                              onClick={() => handleSaveStock(med.id)}
                              disabled={isSaving}
                              className="px-2.5 py-1.5 bg-[#064e3b] hover:bg-[#047857] text-white rounded-lg text-[10.5px] font-bold transition-all shadow-2xs flex items-center gap-1 disabled:opacity-50"
                            >
                              {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 text-amber-300" />}
                              <span>Save</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-[#064e3b] text-white py-6 px-6 text-center text-xs border-t-4 border-[#f37021] mt-auto">
        झारखंड सरकार &bull; स्वास्थ्य एवं परिवार कल्याण विभाग &bull; प्राथमिक स्वास्थ्य केंद्र पोर्टल ({currentUser.facility_name})
      </footer>

    </div>
  );
}
