'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Compass, 
  Clock, 
  Search, 
  CloudRain
} from 'lucide-react';
import { getOrderByTrackingId, getSystemSettings } from '@/lib/actions';

interface TrackingOrder {
  id?: string;
  trackingId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  recipientState: string;
  recipientPinCode: string;
  deliveryMethod: string;
  totalAmount: number;
  status: string;
  pigeonName?: string | null;
  createdAt: string;
}

// Status mapping to stages (0-8 index)
const STAGES = [
  { key: 'PENDING', label: 'Order Received', desc: 'The order has been received at the dispatch hub.' },
  { key: 'PREPARING', label: 'Preparing Scroll', desc: 'Printing on chosen parchment grade.' },
  { key: 'PERSONALIZED', label: 'Personalization Done', desc: 'Photo enclosed and custom wax-seal applied.' },
  { key: 'READY_FOR_DISPATCH', label: 'Ready for Dispatch', desc: 'Secure harness check complete.' },
  { key: 'ASSIGNED', label: 'Phoenix Assigned', desc: 'Messenger pigeon assigned to coordinates.' },
  { key: 'FLYING', label: 'Journey Started', desc: 'The bird is in flight carrying your letter.' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Pigeon has reached local hub and is descending.' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Your message has arrived at destination coordinates.' }
];

function TrackLetterContent() {
  const searchParams = useSearchParams();
  const trackingIdParam = searchParams.get('id');

  const [searchId, setSearchId] = useState('');
  const [activeOrder, setActiveOrder] = useState<TrackingOrder | null>(null);
  const [trackingError, setTrackingError] = useState('');

  // Mock flight position animation
  const [flightProgress, setFlightProgress] = useState(0);

  // Weather check from admin settings
  const [weatherSuspended, setWeatherSuspended] = useState(false);

  useEffect(() => {
    async function loadWeather() {
      const settings = await getSystemSettings();
      const weather = settings.global_weather_override;
      if (weather === 'suspended' || weather === 'heavy_rain' || weather === 'storm' || weather === 'extreme_heat') {
        setWeatherSuspended(true);
      } else {
        setWeatherSuspended(false);
      }
    }
    loadWeather();
  }, []);

  // Search orders logic
  const handleSearch = async (idToSearch: string) => {
    const cleanId = idToSearch.trim().toUpperCase();
    if (!cleanId) return;

    // Try finding in database
    const matched = await getOrderByTrackingId(cleanId);

    if (matched) {
      const orderObj = {
        ...matched,
        pigeonName: matched.pigeon?.name || null,
        createdAt: matched.createdAt instanceof Date ? matched.createdAt.toISOString() : String(matched.createdAt)
      };
      setActiveOrder(orderObj);
      setTrackingError('');
      // Set progress indicator based on status
      const statusIdx = STAGES.findIndex((s) => s.key === matched.status);
      setFlightProgress(statusIdx >= 0 ? (statusIdx / (STAGES.length - 1)) * 100 : 0);
    } else {
      // Try finding in localStorage fallback
      const savedOrders = JSON.parse(localStorage.getItem('phoenix_orders') || '[]');
      const matchedLocal = savedOrders.find((o: { trackingId: string }) => o.trackingId === cleanId);

      if (matchedLocal) {
        setActiveOrder(matchedLocal);
        setTrackingError('');
        const statusIdx = STAGES.findIndex((s) => s.key === matchedLocal.status);
        setFlightProgress(statusIdx >= 0 ? (statusIdx / (STAGES.length - 1)) * 100 : 0);
      } else if (cleanId.startsWith('PHX-IN-2026-')) {
        const dummyOrder = {
          trackingId: cleanId,
          recipientName: 'Karan Johar',
          recipientPhone: '9827361829',
          recipientAddress: 'Sea Breeze View, Carter Road, Bandra West',
          recipientCity: 'Mumbai',
          recipientState: 'Maharashtra',
          recipientPinCode: '400021',
          deliveryMethod: 'PIGEON',
          totalAmount: 548,
          status: 'FLYING',
          pigeonName: 'Vikram',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        };
        setActiveOrder(dummyOrder);
        setTrackingError('');
        setFlightProgress(65); // Active flight simulation
      } else {
        setTrackingError('Tracking ID not found. Enter a valid ID e.g., PHX-IN-2026-882910');
        setActiveOrder(null);
      }
    }
  };

  // If query param is present on mount, load it automatically
  useEffect(() => {
    const initialId = trackingIdParam || 'PHX-IN-2026-882910';
    
    async function loadInitial() {
      setSearchId(initialId);
      const cleanId = initialId.trim().toUpperCase();
      const matched = await getOrderByTrackingId(cleanId);
      if (matched) {
        const orderObj = {
          ...matched,
          pigeonName: matched.pigeon?.name || null,
          createdAt: matched.createdAt instanceof Date ? matched.createdAt.toISOString() : String(matched.createdAt)
        };
        setActiveOrder(orderObj);
        setTrackingError('');
        const statusIdx = STAGES.findIndex((s) => s.key === matched.status);
        setFlightProgress(statusIdx >= 0 ? (statusIdx / (STAGES.length - 1)) * 100 : 0);
      } else {
        const savedOrders = JSON.parse(localStorage.getItem('phoenix_orders') || '[]');
        const matchedLocal = savedOrders.find((o: { trackingId: string }) => o.trackingId === cleanId);
        if (matchedLocal) {
          setActiveOrder(matchedLocal);
          setTrackingError('');
          const statusIdx = STAGES.findIndex((s) => s.key === matchedLocal.status);
          setFlightProgress(statusIdx >= 0 ? (statusIdx / (STAGES.length - 1)) * 100 : 0);
        } else if (cleanId.startsWith('PHX-IN-2026-')) {
          const dummyOrder = {
            trackingId: cleanId,
            recipientName: 'Karan Johar',
            recipientPhone: '9827361829',
            recipientAddress: 'Sea Breeze View, Carter Road, Bandra West',
            recipientCity: 'Mumbai',
            recipientState: 'Maharashtra',
            recipientPinCode: '400021',
            deliveryMethod: 'PIGEON',
            totalAmount: 548,
            status: 'FLYING',
            pigeonName: 'Vikram',
            createdAt: new Date(Date.now() - 3600000).toISOString()
          };
          setActiveOrder(dummyOrder);
          setTrackingError('');
          setFlightProgress(65);
        } else {
          setTrackingError('Tracking ID not found. Enter a valid ID e.g., PHX-IN-2026-882910');
          setActiveOrder(null);
        }
      }
    }
    loadInitial();
  }, [trackingIdParam]);

  // Simulate moving pigeon coordinates on fly state
  useEffect(() => {
    if (activeOrder && activeOrder.status === 'FLYING' && !weatherSuspended) {
      const interval = setInterval(() => {
        setFlightProgress((prev) => {
          if (prev >= 90) return 50; // loop back flight for simulation
          return prev + 1;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeOrder, weatherSuspended]);

  const activeStatusIdx = activeOrder ? STAGES.findIndex((s) => s.key === activeOrder.status) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto text-center space-y-4 mb-10">
        <h1 className="font-serif text-3xl font-bold text-phoenix-indigo">Track Homing Journeys</h1>
        <p className="text-xs text-parchment-800">
          Enter your unique tracking index number to track letter progress, bird logs, and meteorological vectors.
        </p>

        {/* Search Input Box */}
        <div className="flex gap-2 max-w-md mx-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. PHX-IN-2026-882910"
              className="w-full bg-parchment-50 border border-parchment-300 px-10 py-3 rounded-xl text-sm focus:outline-none focus:border-terracotta-500 font-mono text-phoenix-indigo"
            />
            <Search size={18} className="absolute left-3 top-3.5 text-parchment-800 opacity-60" />
          </div>
          <button
            onClick={() => handleSearch(searchId)}
            className="vintage-btn font-bold px-6 py-3 rounded-xl text-xs"
          >
            Track Flight
          </button>
        </div>
        {trackingError && <p className="text-xs text-terracotta-600 font-semibold">{trackingError}</p>}
      </div>

      {activeOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Map details & Flight details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Weather safety banners */}
            {weatherSuspended && activeOrder.deliveryMethod === 'PIGEON' && (
              <div className="p-4 bg-terracotta-50 border border-terracotta-500/20 text-terracotta-700 rounded-2xl flex gap-3">
                <CloudRain size={24} className="flex-shrink-0 animate-bounce" />
                <div className="text-xs space-y-1">
                  <span className="font-bold uppercase tracking-wider block">Flight Alert: Weather Suspension</span>
                  <p className="leading-relaxed">
                    Phoenix is protecting its messengers. Atmospheric radar indicates rainfall or wind gusts in Mumbai. Homing flights are resting in local aviaries. Ground logistics will dispatch shortly if weather holds.
                  </p>
                </div>
              </div>
            )}

            {/* Journey Map Canvas */}
            <div className="parchment-texture p-6 rounded-2xl border border-phoenix-gold/30 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[350px]">
              
              {/* Compass symbol in background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <Compass size={240} className="text-phoenix-gold-dark animate-spin-slow" />
              </div>

              <div className="flex justify-between items-start border-b border-parchment-300 pb-3 z-10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-phoenix-gold-dark">Flight Tracker Map</span>
                  <h3 className="font-serif text-base font-bold text-phoenix-indigo">
                    {activeOrder.deliveryMethod === 'PIGEON' ? `Pigeon "${activeOrder.pigeonName || 'Tejas'}" Flight Path` : 'Express Ground Logistics Route'}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-parchment-800">Tracking Code</span>
                  <p className="font-mono text-xs font-bold text-terracotta-600">{activeOrder.trackingId}</p>
                </div>
              </div>

              {/* Map vector with flying bird */}
              <div className="relative h-48 w-full border border-dashed border-parchment-300/60 rounded-xl my-6 bg-parchment-200/40 overflow-hidden flex items-center justify-center">
                
                {/* Simulated Landmarks */}
                <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
                  <div className="w-8 h-8 rounded-full bg-phoenix-indigo text-white flex items-center justify-center shadow-md">
                    🕊️
                  </div>
                  <span className="text-[8px] font-bold text-phoenix-indigo bg-parchment-50 px-1 rounded">PHX Station</span>
                </div>

                <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
                  <div className="w-8 h-8 rounded-full bg-terracotta-500 text-white flex items-center justify-center shadow-md">
                    📍
                  </div>
                  <span className="text-[8px] font-bold text-terracotta-700 bg-parchment-50 px-1 rounded">{activeOrder.recipientCity}</span>
                </div>

                {/* Flying path vector */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 200">
                  {/* Dashed trail */}
                  <path
                    d="M 100 100 Q 300 20 500 100"
                    fill="none"
                    stroke="#cca662"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                    className="opacity-50"
                  />
                  
                  {/* Highlighted trail based on progress */}
                  <path
                    d="M 100 100 Q 300 20 500 100"
                    fill="none"
                    stroke="#c2593f"
                    strokeWidth="3"
                    strokeDasharray="600"
                    strokeDashoffset={600 - (600 * flightProgress) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Simulated flight stats popup overlay */}
                {activeOrder.status === 'FLYING' && !weatherSuspended && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-parchment-100/90 border border-phoenix-gold/30 rounded px-3 py-1 flex items-center gap-4 text-[9px] font-semibold text-phoenix-indigo shadow-sm backdrop-blur-sm z-10">
                    <span className="flex items-center gap-1"><Clock size={10} /> Speed: 42 km/h</span>
                    <span className="flex items-center gap-1"><Compass size={10} /> Altitude: 120m</span>
                    <span className="flex items-center gap-1">Wind: SE 12 km/h</span>
                  </div>
                )}

                {/* The animated pigeon icon */}
                {activeOrder.status === 'FLYING' && !weatherSuspended && (
                  <div 
                    className="absolute z-20 text-terracotta-600 transition-all duration-1000 ease-out"
                    style={{
                      left: `calc(100px + ${(flightProgress / 100) * 400}px)`,
                      // Simulating parabolic arc height Q 300 20
                      top: `calc(100px - ${Math.sin((flightProgress / 100) * Math.PI) * 70}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current drop-shadow-md animate-float">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.25 15.5h-2.5v-3.5h2.5v3.5zm0-5.5h-2.5V7h2.5v5z" opacity="0.1" />
                      <path d="M21 11.5c0-1.47-.56-2.8-1.46-3.8l-1.42 1.42c.55.63.88 1.46.88 2.38 0 1.93-1.57 3.5-3.5 3.5H9c-1.93 0-3.5-1.57-3.5-3.5 0-1.93 1.57-3.5 3.5-3.5h4.5c.34 0 .66.05.97.14l1.46-1.46C15.13 6.22 14.1 6 13 6H9c-3.31 0-6 2.69-6 6s2.69 6 6 6h6.5c3.03 0 5.5-2.47 5.5-5.5z" />
                    </svg>
                  </div>
                )}

              </div>

              <div className="flex justify-between items-center text-xs border-t border-parchment-300 pt-4 z-10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-phoenix-gold-dark animate-pulse" />
                  <span className="font-semibold">Current State: {STAGES[activeStatusIdx]?.label || 'Under Transit'}</span>
                </div>
                <div>
                  <span className="text-parchment-800">Est. Delivery: </span>
                  <span className="font-bold text-phoenix-indigo">
                    {activeOrder.deliveryMethod === 'DIGITAL' ? 'Instant via email' : 'Within 36 hours'}
                  </span>
                </div>
              </div>

            </div>

            {/* Recipient Details card */}
            <div className="glass-parchment p-6 rounded-2xl border border-parchment-300">
              <h3 className="font-serif text-sm font-bold text-phoenix-indigo mb-4 uppercase tracking-wider">Delivery Coordinates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">Recipient Name</span>
                  <p className="font-semibold text-phoenix-indigo">{activeOrder.recipientName}</p>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">Contact Phone</span>
                  <p className="font-semibold text-phoenix-indigo">+91 {activeOrder.recipientPhone}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">Delivery Address</span>
                  <p className="font-semibold text-phoenix-indigo">
                    {activeOrder.recipientAddress}, {activeOrder.recipientCity}, {activeOrder.recipientState} - {activeOrder.recipientPinCode}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Timeline */}
          <div className="lg:col-span-4 glass-parchment p-6 rounded-2xl border border-parchment-300">
            <h3 className="font-serif text-sm font-bold text-phoenix-indigo mb-6 uppercase tracking-wider border-b border-parchment-300 pb-2">
              Journey Timeline
            </h3>

            <div className="space-y-6">
              {STAGES.map((st, sIdx) => {
                const isPassed = activeStatusIdx >= sIdx;
                const isCurrent = activeStatusIdx === sIdx;

                return (
                  <div key={st.key} className="flex gap-4 relative">
                    {/* Vertical line between nodes */}
                    {sIdx < STAGES.length - 1 && (
                      <div className={`absolute left-3 top-6 w-0.5 bottom-[-24px] ${
                        activeStatusIdx > sIdx ? 'bg-terracotta-500' : 'bg-parchment-300'
                      }`} />
                    )}

                    {/* Timeline Node Icon */}
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold z-10 flex-shrink-0 ${
                      isPassed 
                        ? 'bg-terracotta-500 border-terracotta-600 text-white shadow-sm' 
                        : 'bg-transparent border-parchment-300 text-parchment-300'
                    } ${isCurrent ? 'ring-4 ring-terracotta-500/20' : ''}`}>
                      {isPassed ? '✓' : sIdx + 1}
                    </div>

                    <div className="space-y-1">
                      <span className={`text-xs font-bold block ${
                        isCurrent ? 'text-terracotta-600' : isPassed ? 'text-phoenix-indigo' : 'text-parchment-300'
                      }`}>
                        {st.label}
                      </span>
                      <p className={`text-[10px] leading-relaxed ${
                        isPassed ? 'text-parchment-800' : 'text-parchment-300'
                      }`}>
                        {st.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default function TrackLetter() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-serif text-sm text-parchment-800">
        Loading pigeon flight details...
      </div>
    }>
      <TrackLetterContent />
    </Suspense>
  );
}
