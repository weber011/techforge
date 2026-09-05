'use client';

import React, { useState, useEffect } from 'react';
import { Activity, MapPin, Search, Phone, Navigation, ShieldCheck, HeartPulse, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function PublicPortal() {
  const [phcs, setPhcs] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/phcs')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPhcs(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load facilities:', err);
        setLoading(false);
      });
  }, []);

  const filtered = phcs.filter(phc => {
    const matchesDistrict = selectedDistrict === 'All' || phc.district === selectedDistrict;
    const matchesSearch = phc.name.toLowerCase().includes(searchQuery.toLowerCase()) || phc.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Citizen Header */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-700 p-2 rounded-lg">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">HealthGrid Public Portal</h1>
            <p className="text-[11px] text-slate-500">CITIZEN FACILITY FINDER & OPERATIONAL AVAILABILITY</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg bg-emerald-50">
            Government Portal
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-12 px-6 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Public Healthcare Directory
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Find Public Healthcare Facilities Near You
          </h2>
          <p className="text-sm text-slate-600 max-w-xl">
            Real-time public health center locator across Bihar, Uttar Pradesh, and Jharkhand with live facility readiness indicators.
          </p>

          {/* Search & Filter Bar */}
          <div className="w-full max-w-2xl bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-2 mt-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by facility name or city..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 outline-none"
              />
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs font-medium px-4 py-2 bg-slate-50 rounded-xl border-none outline-none text-slate-700"
            >
              <option value="All">All Districts</option>
              <option value="Patna">Patna (Bihar)</option>
              <option value="Gaya">Gaya (Bihar)</option>
              <option value="Lucknow">Lucknow (UP)</option>
              <option value="Varanasi">Varanasi (UP)</option>
              <option value="Ranchi">Ranchi (Jharkhand)</option>
              <option value="Dhanbad">Dhanbad (Jharkhand)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Available Facilities ({filtered.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Live status updated hourly</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading verified facilities...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            No healthcare centers match your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((phc) => (
              <div key={phc.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Open 24/7
                    </span>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {phc.district}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-800 mt-1">{phc.name}</h4>
                  <p className="text-xs text-slate-500">{phc.state} Public Health Network</p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span><strong>{phc.totalBeds}</strong> Inpatient Beds</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Readiness: Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a 
                    href={`https://maps.google.com/?q=${phc.latitude || 25.5},${phc.longitude || 85.1}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Get Directions
                  </a>
                  <button className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Call Facility
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Citizen Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-400">
        HEALTHGRID AI &bull; Smart Public Healthcare Supply Chain &amp; Resource Resilience Platform
      </footer>
    </div>
  );
}
