'use client';

import React, { useEffect, useRef } from 'react';

export interface MapFacility {
  facility_id: string;
  facility_name: string;
  facility_type: string;
  block: string;
  district: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  emergency_available?: boolean;
  public_services?: string[];
  total_beds?: number;
  available_beds?: number;
}

interface PublicMapProps {
  userLocation: { latitude: number; longitude: number; accuracy?: number } | null;
  facilities: MapFacility[];
  selectedFacilityId?: string | null;
  onSelectFacility?: (facility: MapFacility) => void;
}

export default function PublicMap({
  userLocation,
  facilities,
  selectedFacilityId,
  onSelectFacility
}: PublicMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;
    let isCancelled = false;

    import('leaflet').then((leafletModule) => {
      if (isCancelled) return;
      L = leafletModule.default || leafletModule;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const defaultCenter: [number, number] = userLocation 
          ? [userLocation.latitude, userLocation.longitude]
          : [23.3600, 85.3200];

        const map = L.map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: userLocation ? 12 : 11,
          zoomControl: true,
          scrollWheelZoom: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear previous markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // 1. Plot User Location if available
      if (userLocation) {
        const userIcon = L.divIcon({
          className: 'user-gps-marker',
          html: '<div style="width: 20px; height: 20px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <strong style="color: #1e3a8a; font-size: 12px;">📍 Your Detected Location</strong>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">GPS Accuracy: &plusmn;${Math.round(userLocation.accuracy || 10)}m</div>
            </div>
          `);

        markersRef.current.push(userMarker);

        if (userLocation.accuracy && userLocation.accuracy < 1000) {
          const accCircle = L.circle([userLocation.latitude, userLocation.longitude], {
            radius: userLocation.accuracy,
            color: '#3b82f6',
            fillColor: '#93c5fd',
            fillOpacity: 0.15,
            weight: 1
          }).addTo(map);
          markersRef.current.push(accCircle);
        }
      }

      // 2. Plot Facility Markers
      facilities.forEach((fac) => {
        const isHospital = fac.facility_type === 'DH' || fac.facility_type === 'SDH';
        const isSelected = selectedFacilityId === fac.facility_id;
        
        const pinColor = isHospital ? '#b91c1c' : '#047857';
        const pinBg = isSelected ? '#f59e0b' : pinColor;

        const facIcon = L.divIcon({
          className: 'health-fac-marker',
          html: `
            <div style="
              background: ${pinBg}; 
              color: white; 
              padding: 4px 7px; 
              border-radius: 8px; 
              border: 2px solid white; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.3); 
              font-family: sans-serif; 
              font-size: 10px; 
              font-weight: 800; 
              display: flex; 
              align-items: center; 
              gap: 3px;
              white-space: nowrap;
            ">
              <span>${isHospital ? '🏥' : '🩺'}</span>
              <span>${fac.facility_name.split(' ')[0]}</span>
            </div>
          `,
          iconSize: [80, 26],
          iconAnchor: [40, 13]
        });

        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`;

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 220px; padding: 2px;">
            <div style="font-size: 13px; font-weight: 800; color: #064e3b; margin-bottom: 2px;">
              ${fac.facility_name}
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
              ${fac.address}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
              <span style="background: #ecfdf5; color: #065f46; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid #a7f3d0;">
                ${fac.facility_type}
              </span>
              ${fac.distance_km !== undefined ? `
                <span style="background: #eff6ff; color: #1e40af; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid #bfdbfe;">
                  ${fac.distance_km} km away
                </span>
              ` : ''}
              ${fac.emergency_available ? `
                <span style="background: #fef2f2; color: #991b1b; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid #fecaca;">
                  24x7 Emergency
                </span>
              ` : ''}
            </div>
            <div style="display: flex; gap: 6px; margin-top: 6px;">
              <a href="${directionsUrl}" target="_blank" rel="noreferrer" style="
                flex: 1; 
                background: #064e3b; 
                color: white; 
                text-decoration: none; 
                text-align: center; 
                padding: 5px 8px; 
                border-radius: 6px; 
                font-size: 10px; 
                font-weight: bold;
              ">
                🗺️ Directions
              </a>
              <a href="tel:${fac.phone}" style="
                background: #f1f5f9; 
                color: #0f172a; 
                text-decoration: none; 
                text-align: center; 
                padding: 5px 8px; 
                border-radius: 6px; 
                font-size: 10px; 
                font-weight: bold; 
                border: 1px solid #cbd5e1;
              ">
                📞 Call
              </a>
            </div>
          </div>
        `;

        const marker = L.marker([fac.latitude, fac.longitude], { icon: facIcon })
          .addTo(map)
          .bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectFacility) onSelectFacility(fac);
        });

        if (isSelected) {
          marker.openPopup();
        }

        markersRef.current.push(marker);
      });

      if (selectedFacilityId) {
        const target = facilities.find(f => f.facility_id === selectedFacilityId);
        if (target) {
          map.setView([target.latitude, target.longitude], 14, { animate: true });
        }
      } else if (userLocation && facilities.length > 0) {
        map.setView([userLocation.latitude, userLocation.longitude], 12);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [userLocation, facilities, selectedFacilityId]);

  return (
    <div className="relative w-full h-[400px] md:h-[480px] rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-md bg-slate-100 z-0">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
