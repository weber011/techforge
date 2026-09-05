'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartPulse, Search, MapPin, Phone, Navigation, ShieldCheck, 
  Building2, Bot, Send, User, Sparkles, MessageSquare, X, ChevronRight, 
  AlertCircle, RefreshCw, AlertTriangle, ExternalLink, CheckCircle2, Locate
} from 'lucide-react';
import Link from 'next/link';
import NewsTicker from '@/components/NewsTicker';
import PublicMap, { MapFacility } from '@/components/PublicMap';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function PublicPortal() {
  const [facilities, setFacilities] = useState<MapFacility[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedService, setSelectedService] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableServices, setAvailableServices] = useState<string[]>([]);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'requesting' | 'granted' | 'denied' | 'unavailable'>('prompt');
  const [locationError, setLocationError] = useState<string | null>(null);

  // Selected Facility
  const [selectedFacility, setSelectedFacility] = useState<MapFacility | null>(null);

  // Emergency Modal State
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencySubmitting, setEmergencySubmitting] = useState(false);
  const [emergencySeverity, setEmergencySeverity] = useState<'CRITICAL' | 'HIGH'>('CRITICAL');
  const [emergencyDescription, setEmergencyDescription] = useState('');
  const [activeEmergency, setActiveEmergency] = useState<any | null>(null);

  // AI Assistant Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 **Namaste! I am your HealthGrid Citizen AI Assistant.**\n\nI can help you locate the nearest Public Health Center (PHC), check verified services, or provide first-aid advice for mild symptoms.\n\n*How can I assist you today?*'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch verified facilities on mount
  const fetchFacilities = async (lat?: number, lng?: number) => {
    setLoadingFacilities(true);
    try {
      let url = '/api/public/facilities';
      if (lat !== undefined && lng !== undefined) {
        url = `/api/public/nearby-facilities?lat=${lat}&lng=${lng}&radius=50`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        const list = data.nearest_facilities || data.facilities || [];
        setFacilities(list);
        if (list.length > 0 && !selectedFacility) {
          setSelectedFacility(list[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load facilities:', err);
    } finally {
      setLoadingFacilities(false);
    }
  };

  // Fetch services list
  useEffect(() => {
    fetchFacilities();
    fetch('/api/public/services')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.services)) {
          setAvailableServices(data.services);
        }
      })
      .catch(() => {});
  }, []);

  // Handle Browser Geolocation Request
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('requesting');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        };
        setUserLocation(coords);
        setLocationStatus('granted');
        fetchFacilities(coords.latitude, coords.longitude);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('denied');
          setLocationError('Location access was denied. Search manually instead.');
        } else {
          setLocationStatus('unavailable');
          setLocationError('Unable to determine your location. Please check GPS settings or search manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Handle Emergency Alert Submission
  const handleSendEmergency = async () => {
    setEmergencySubmitting(true);
    try {
      // Require real user location
      let lat = userLocation?.latitude;
      let lng = userLocation?.longitude;
      let acc = userLocation?.accuracy || 15;

      if (!lat || !lng) {
        // Attempt quick geolocation
        if (navigator.geolocation) {
          try {
            const pos: any = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
            acc = pos.coords.accuracy;
            setUserLocation({ latitude: lat!, longitude: lng!, accuracy: acc });
          } catch (e) {
            alert('Location permission is required to send emergency dispatch coordinates.');
            setEmergencySubmitting(false);
            return;
          }
        } else {
          alert('Geolocation is not available on this device.');
          setEmergencySubmitting(false);
          return;
        }
      }

      const res = await fetch('/api/public/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          location_accuracy: acc,
          severity: emergencySeverity,
          description: emergencyDescription || 'Citizen emergency medical assistance request.'
        })
      });

      const data = await res.json();
      if (data.success && data.event) {
        setActiveEmergency(data.event);
        setEmergencyModalOpen(false);
      } else {
        alert(data.error || 'Emergency alert could not be submitted.');
      }
    } catch (err) {
      alert('Emergency alert failed to transmit. Please dial 108 immediately.');
    } finally {
      setEmergencySubmitting(false);
    }
  };

  // AI Chat message sender
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isAiLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputValue('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/public/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userLocation
        })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
        if (data.map_action?.facility_ids?.length > 0) {
          const target = facilities.find(f => f.facility_id === data.map_action.facility_ids[0]);
          if (target) setSelectedFacility(target);
        }
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'AI Assistant is currently unavailable because the AI service is not configured.' }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Connection error. For medical emergencies, please dial 108.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filter facilities
  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = searchQuery === '' || 
      f.facility_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === 'All' || f.district === selectedDistrict;
    const matchesService = selectedService === 'All' || (f.public_services && f.public_services.some(s => s.toLowerCase().includes(selectedService.toLowerCase())));
    return matchesSearch && matchesDistrict && matchesService;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col relative jharkhand-bg-watermark">
      
      {/* Top Official Government Strip */}
      <div className="w-full bg-[#064e3b] text-white px-6 py-1.5 flex items-center justify-between text-[11px] font-medium z-40 border-b border-[#047857]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>झारखंड सरकार &bull; नागरिक स्वास्थ्य खोज एवं आपातकालीन सेवा &bull; CITIZEN PORTAL</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-100 text-[10px] font-bold">
          <span>आपातकालीन: 108</span>
          <span className="text-emerald-400">|</span>
          <span>स्वास्थ्य सलाह: 104</span>
        </div>
      </div>

      {/* Real Live News Ticker */}
      <NewsTicker />

      {/* Main Citizen Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-emerald-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-auto">
              <img 
                src="/emblem-logo.png" 
                alt="Government of Jharkhand Health" 
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>
          <div className="border-l-2 border-emerald-600 pl-3">
            <h1 className="text-sm font-black text-[#064e3b] leading-tight">झारखंड स्वास्थ्य मित्र</h1>
            <p className="text-[10px] text-emerald-800 font-bold">CITIZEN HEALTHCARE LOCATOR &amp; AI ADVISOR</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-[#064e3b] text-xs font-bold hover:bg-emerald-200 transition-colors shadow-2xs"
          >
            <Bot className="w-4 h-4 text-[#047857]" />
            <span>AI स्वास्थ्य मित्र</span>
          </button>

          {/* Real Emergency Button */}
          <button
            onClick={() => setEmergencyModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all shadow-md animate-pulse border border-red-800"
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>🚨 EMERGENCY (आपातकालीन)</span>
          </button>
        </div>
      </header>

      {/* Active Emergency Status Banner if Triggered */}
      {activeEmergency && (
        <div className="w-full bg-red-600 text-white px-6 py-3 shadow-lg z-30 flex items-center justify-between text-xs border-b border-red-800 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
            <div>
              <span className="font-black text-amber-300">EMERGENCY ACTIVE: {activeEmergency.event_id}</span>
              <span className="mx-2">&bull;</span>
              <span>Status: <strong className="uppercase bg-red-800 px-2 py-0.5 rounded">{activeEmergency.status}</strong></span>
              <span className="mx-2">&bull;</span>
              <span>Coordinates: {activeEmergency.latitude.toFixed(4)}°N, {activeEmergency.longitude.toFixed(4)}°E</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="tel:108" className="px-3 py-1 bg-white text-red-700 font-black rounded-lg text-xs hover:bg-red-50">
              📞 Call 108
            </a>
            <button 
              onClick={() => setActiveEmergency(null)}
              className="p-1 text-red-200 hover:text-white"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6 relative z-10">
        
        {/* Geolocation Prompt & Search Controls */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-emerald-300 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-[#064e3b] text-xs font-black uppercase mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#047857]" />
                सत्यापित स्वास्थ्य केंद्र खोज / VERIFIED HEALTHCARE GIS
              </div>
              <h2 className="text-xl font-black text-[#064e3b]">
                नजदीकी प्राथमिक स्वास्थ्य केंद्र एवं अस्पताल खोजें
              </h2>
            </div>

            {/* GPS Detection Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleRequestLocation}
                disabled={locationStatus === 'requesting'}
                className="px-4 py-2.5 bg-[#064e3b] hover:bg-[#047857] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 border border-emerald-900 w-full sm:w-auto justify-center"
              >
                <Locate className={`w-4 h-4 text-amber-300 ${locationStatus === 'requesting' ? 'animate-spin' : ''}`} />
                <span>
                  {locationStatus === 'granted' ? '📍 GPS सक्रिय (Update Location)' : '📍 मेरा नजदीकी स्वास्थ्य केंद्र खोजें (Use My GPS)'}
                </span>
              </button>
            </div>
          </div>

          {/* Location Status Messages */}
          {locationStatus === 'denied' && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Location access was denied. You can search verified facilities manually below.</span>
            </div>
          )}

          {locationStatus === 'unavailable' && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Unable to determine your location. Please check GPS settings or search manually below.</span>
            </div>
          )}

          {locationStatus === 'granted' && userLocation && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-[#064e3b] font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#047857]" />
                GPS Coordinates: {userLocation.latitude.toFixed(4)}°N, {userLocation.longitude.toFixed(4)}°E (Accuracy: &plusmn;{Math.round(userLocation.accuracy || 10)}m)
              </span>
              <span className="text-[11px] text-emerald-800">
                Sorted by geodesic proximity
              </span>
            </div>
          )}

          {/* Search & Service Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-100">
            <div className="sm:col-span-2 flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-emerald-200 rounded-xl">
              <Search className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="text"
                placeholder="Search facility name, block, or address (e.g. Ratu, Kanke, Sadar, Bero)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs w-full outline-none font-semibold text-slate-800"
              />
            </div>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="p-2 text-xs bg-slate-50 border border-emerald-200 rounded-xl text-slate-800 font-bold outline-none"
            >
              <option value="All">All Public Services</option>
              {availableServices.map((srv, idx) => (
                <option key={idx} value={srv}>{srv}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Map & Facility Results Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Interactive Leaflet Map */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <PublicMap
              userLocation={userLocation}
              facilities={filteredFacilities}
              selectedFacilityId={selectedFacility?.facility_id}
              onSelectFacility={(fac) => setSelectedFacility(fac)}
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
              <span>🔵 Your Location &bull; 🟢 Verified PHC/CHC &bull; 🔴 District Hospital</span>
              <span className="text-emerald-800 font-bold">OpenStreetMap &bull; Real GIS</span>
            </div>
          </div>

          {/* Facilities List & Detail Card */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Selected Facility Quick Action Card */}
            {selectedFacility && (
              <div className="bg-[#064e3b] text-white p-5 rounded-2xl shadow-md border border-emerald-900 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-[#047857] text-emerald-100 border border-emerald-500">
                    {selectedFacility.facility_type} &bull; {selectedFacility.block}
                  </span>
                  {selectedFacility.distance_km !== undefined && (
                    <span className="text-xs font-black text-amber-300">
                      📍 {selectedFacility.distance_km} km away
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-black text-white">{selectedFacility.facility_name}</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">{selectedFacility.address}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedFacility.public_services?.slice(0, 4).map((s, idx) => (
                    <span key={idx} className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-emerald-100 font-medium">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-emerald-800">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 bg-white text-[#064e3b] hover:bg-emerald-50 font-bold text-xs rounded-xl text-center transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#047857]" />
                    <span>Get Directions</span>
                  </a>

                  <a
                    href={`tel:${selectedFacility.phone}`}
                    className="py-2 px-3 bg-[#047857] hover:bg-[#059669] text-white font-bold text-xs rounded-xl text-center transition-colors flex items-center justify-center gap-1.5 border border-emerald-600"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Facility</span>
                  </a>
                </div>
              </div>
            )}

            {/* Scrollable Facilities Cards */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-emerald-200 p-4 shadow-sm flex flex-col gap-3 max-h-[480px] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100 text-xs font-black text-[#064e3b]">
                <span>सत्यापित केंद्र सूची ({filteredFacilities.length})</span>
                <span className="text-slate-500 font-normal text-[11px]">Click to inspect</span>
              </div>

              {loadingFacilities ? (
                <div className="py-8 text-center text-xs text-slate-500 font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#064e3b]" />
                  <span>Loading verified facilities...</span>
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-medium">
                  No verified healthcare facilities match your criteria.
                </div>
              ) : (
                filteredFacilities.map((fac) => {
                  const isSelected = selectedFacility?.facility_id === fac.facility_id;

                  return (
                    <div
                      key={fac.facility_id}
                      onClick={() => setSelectedFacility(fac)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-400 shadow-xs' 
                          : 'bg-slate-50/70 hover:bg-emerald-50/40 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-black text-[#064e3b]">{fac.facility_name}</div>
                          <div className="text-[10px] text-slate-500">{fac.address}</div>
                        </div>
                        {fac.distance_km !== undefined && (
                          <span className="text-[11px] font-bold text-emerald-800 shrink-0 bg-white px-2 py-0.5 rounded border border-emerald-200">
                            {fac.distance_km} km
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium pt-1 border-t border-emerald-100/60">
                        <span className="text-emerald-700 font-bold">
                          {fac.emergency_available ? '🚑 24x7 Emergency' : '🩺 Standard OPD'}
                        </span>
                        <span>{fac.phone}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </main>

      {/* EMERGENCY CONFIRMATION MODAL */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-red-500 flex flex-col gap-5 animate-in zoom-in-95">
            
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertTriangle className="w-8 h-8 text-red-600 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-black leading-tight">आपातकालीन सहायता अनुरोध</h3>
                <p className="text-xs text-slate-600 font-bold">CONFIRM EMERGENCY ALERT DISPATCH</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Are you sure you want to broadcast an emergency medical alert? Your exact GPS coordinates will be transmitted to the <strong>Government of Jharkhand Health Command Center</strong> and the nearest emergency facility.
            </p>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs flex flex-col gap-2">
              <div className="font-bold text-red-800">Alert Details:</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Location Status:</span>
                <span className="font-bold text-emerald-700">
                  {userLocation ? 'GPS Coordinates Captured' : 'Will capture on submit'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Severity Level:</span>
                <span className="font-black text-red-600">CRITICAL PRIORITY</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Brief Medical Issue (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Chest pain, accident, high fever with breathlessness..."
                value={emergencyDescription}
                onChange={(e) => setEmergencyDescription(e.target.value)}
                className="text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEmergencyModalOpen(false)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                रद्द करें (Cancel)
              </button>

              <button
                type="button"
                disabled={emergencySubmitting}
                onClick={handleSendEmergency}
                className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {emergencySubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>भेजा जा रहा है...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>🚨 पुष्टि करें (Send Alert)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AI Assistant Chat Modal */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border-2 border-emerald-300 overflow-hidden flex flex-col h-[520px]">
          
          <div className="bg-[#064e3b] p-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-300" />
              <div>
                <h4 className="text-xs font-black">AI स्वास्थ्य मित्र (Citizen AI)</h4>
                <p className="text-[10px] text-emerald-200">Verified Healthcare Advisor</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-emerald-200 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 text-xs bg-slate-50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#064e3b] text-white flex items-center justify-center shrink-0 text-[10px]">
                    AI
                  </div>
                )}
                <div className={`p-3 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-[#064e3b] text-white rounded-br-none font-medium' 
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 font-medium shadow-2xs'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="text-slate-500 text-xs flex items-center gap-2 p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#064e3b]" />
                <span>AI विचार कर रहा है...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-2.5 bg-white border-t border-emerald-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about PHCs, fever remedies, OPD timings..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium"
            />
            <button
              type="submit"
              disabled={isAiLoading || !inputValue.trim()}
              className="p-2.5 bg-[#064e3b] hover:bg-[#047857] text-white rounded-xl disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Official Public Footer */}
      <footer className="w-full bg-[#064e3b] text-white py-6 px-6 text-center text-xs border-t-2 border-[#f37021] z-20 mt-auto">
        झारखंड सरकार &bull; स्वास्थ्य, चिकित्सा शिक्षा एवं परिवार कल्याण विभाग &bull; आपातकालीन एम्बुलेंस: 108 &bull; स्वास्थ्य परामर्श: 104
      </footer>

    </div>
  );
}
