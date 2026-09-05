'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Pill, Send, RefreshCw, CheckCircle, AlertTriangle, 
  ArrowRight, ShieldCheck, Mail, Lock, LogOut, Package, UserCheck, Activity, ArrowDownLeft, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import NewsTicker from '@/components/NewsTicker';
import { RANCHI_FACILITIES_MASTER, RANCHI_MEDICINE_MASTER, PeerTransferRequest } from '@/lib/ranchiData';

export default function PHCPortal() {
  const [selectedEmail, setSelectedEmail] = useState('phc.ratu.ushamatu@gov.in');
  const [isLoggedIn, setIsLoggedIn] = useState(true); // default logged in for prototype demo
  const [transfers, setTransfers] = useState<PeerTransferRequest[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);

  // Form State for Peer Requisition
  const [targetDonorEmail, setTargetDonorEmail] = useState('phc.kanke@gov.in');
  const [selectedMedicine, setSelectedMedicine] = useState('Paracetamol 500mg');
  const [requiredQty, setRequiredQty] = useState(500);
  const [urgency, setUrgency] = useState<'CRITICAL' | 'HIGH' | 'NORMAL'>('CRITICAL');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Current logged in PHC details
  const currentPhc = RANCHI_FACILITIES_MASTER.find(f => f.email.toLowerCase() === selectedEmail.toLowerCase()) || RANCHI_FACILITIES_MASTER[1];

  const fetchTransfers = async () => {
    setLoadingTransfers(true);
    try {
      const res = await fetch(`/api/phc/transfer-request?email=${encodeURIComponent(selectedEmail)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.transfers)) {
        setTransfers(data.transfers);
      }
    } catch (err) {
      console.error('Failed to load transfers:', err);
    } finally {
      setLoadingTransfers(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTransfers();
    }
  }, [selectedEmail, isLoggedIn]);

  const handleCreatePeerRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/phc/transfer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_phc_email: selectedEmail,
          destination_phc_email: targetDonorEmail,
          medicine_name: selectedMedicine,
          requested_quantity: requiredQty,
          urgency
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Direct Requisition Dispatched! ${data.donor_safety_assessment}`
        });
        fetchTransfers();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to dispatch peer request.' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col jharkhand-bg-watermark">
      {/* Official Top Strip (Jharkhand Deep Green) */}
      <div className="w-full bg-[#064e3b] text-white px-6 py-1.5 flex items-center justify-between text-[11px] font-medium z-30 border-b border-[#047857]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>झारखंड सरकार &bull; प्राथमिक स्वास्थ्य केंद्र पोर्टल &bull; PHC STAFF PORTAL</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-100 font-semibold text-[10px]">
          <Link href="/" className="hover:text-white hover:underline">Home</Link>
          <Link href="/dashboard" className="hover:text-white hover:underline">Command Center</Link>
          <Link href="/public" className="hover:text-white hover:underline">Citizen Portal</Link>
        </div>
      </div>

      {/* Main Header with Emblem */}
      <header className="w-full px-6 md:px-12 py-3.5 bg-white/95 backdrop-blur-md border-b border-emerald-200 flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-auto">
              <img src="/emblem-logo.png" alt="Jharkhand Health" className="h-full w-auto object-contain" />
            </div>
          </Link>
          <div className="border-l-2 border-emerald-600 pl-3">
            <h1 className="text-sm font-black text-[#064e3b] leading-tight">PHC संसाधन एवं पुनर्वितरण पोर्टल</h1>
            <p className="text-[10px] text-emerald-800 font-bold">RANCHI DISTRICT HEALTH INVENTORY &bull; GOVT OF JHARKHAND</p>
          </div>
        </div>

        {/* PHC Email Login / Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs shadow-2xs">
            <Mail className="w-3.5 h-3.5 text-[#047857]" />
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="bg-transparent text-[#064e3b] font-bold outline-none cursor-pointer"
            >
              <option value="phc.ratu.ushamatu@gov.in">phc.ratu.ushamatu@gov.in (CHC Ratu)</option>
              <option value="phc.namkum@gov.in">phc.namkum@gov.in (PHC Namkum)</option>
              <option value="phc.kanke@gov.in">phc.kanke@gov.in (CHC Kanke)</option>
              <option value="phc.bero@gov.in">phc.bero@gov.in (CHC Bero)</option>
              <option value="phc.ormanjhi@gov.in">phc.ormanjhi@gov.in (CHC Ormanjhi)</option>
              <option value="phc.mandar@gov.in">phc.mandar@gov.in (CHC Mandar)</option>
              <option value="phc.bundu@gov.in">phc.bundu@gov.in (SDH Bundu)</option>
              <option value="phc.sadar.ranchi@gov.in">phc.sadar.ranchi@gov.in (Sadar Hospital)</option>
            </select>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authenticated</span>
          </div>
        </div>
      </header>

      {/* Real Live News Ticker */}
      <NewsTicker />

      {/* Main PHC Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-6">
        
        {/* PHC Station Profile Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-200 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#064e3b] text-white flex items-center justify-center font-bold text-lg border border-emerald-700 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#064e3b]">{currentPhc.facility_name}</h2>
                <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-[#064e3b] text-[10px] font-bold rounded">
                  {currentPhc.facility_code}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Block: <strong>{currentPhc.block}</strong> &bull; {currentPhc.address} &bull; Ph: {currentPhc.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200 text-center">
              <div className="font-bold text-[#064e3b]">{currentPhc.total_beds} Beds</div>
              <div className="text-[10px] text-slate-500 font-medium">Total Capacity</div>
            </div>
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200 text-center">
              <div className="font-bold text-[#064e3b]">{currentPhc.operational_data.current_patients_today}</div>
              <div className="text-[10px] text-slate-500 font-medium">Patients Today</div>
            </div>
            <div className={`p-2.5 rounded-xl border text-center font-bold ${
              currentPhc.ai_predictions.risk_level === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
              currentPhc.ai_predictions.risk_level === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}>
              <div>{currentPhc.ai_predictions.risk_level}</div>
              <div className="text-[10px] font-medium">Risk Score: {currentPhc.ai_predictions.overall_risk_score}/100</div>
            </div>
          </div>
        </div>

        {/* 2-Column Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Direct Peer Requisition Form */}
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

            {feedbackMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${
                feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {feedbackMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                <span>{feedbackMsg.text}</span>
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
                  <option value="phc.kanke@gov.in">phc.kanke@gov.in (CHC Kanke - High Surplus Safe Donor)</option>
                  <option value="phc.ormanjhi@gov.in">phc.ormanjhi@gov.in (CHC Ormanjhi - Safe Donor)</option>
                  <option value="phc.mandar@gov.in">phc.mandar@gov.in (CHC Mandar - Safe Buffer)</option>
                  <option value="phc.sadar.ranchi@gov.in">phc.sadar.ranchi@gov.in (Sadar Hospital Central Warehouse)</option>
                  <option value="phc.bundu@gov.in">phc.bundu@gov.in (SDH Bundu)</option>
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
                disabled={submitting}
                className="w-full py-3 bg-[#064e3b] hover:bg-[#047857] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 border border-emerald-800"
              >
                {submitting ? (
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

          {/* Right Column: Live Peer Transfers Log */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-200 p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div>
                <h3 className="font-black text-[#064e3b] text-sm">Direct Peer Requisitions &amp; Dispatch History</h3>
                <p className="text-xs text-slate-500 font-medium">Live inter-PHC medicine transfer records for {selectedEmail}</p>
              </div>
              <button 
                onClick={fetchTransfers}
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
                      const isOutgoing = tr.source_phc_email.toLowerCase() === selectedEmail.toLowerCase();
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
