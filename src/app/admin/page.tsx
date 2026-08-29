'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  TrendingUp, 
  Compass, 
  MapPin, 
  CloudRain, 
  Award,
  FileText,
  ChevronRight
} from 'lucide-react';
import { 
  getOrders, 
  getSystemSettings, 
  updateSystemSetting, 
  getStations, 
  getPigeons, 
  updateOrderStatus 
} from '@/lib/actions';

interface AdminOrder {
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

interface AdminPigeon {
  id: string;
  name: string;
  station: string;
  status: string;
  healthStatus: string;
  flights: number;
}

interface AdminStation {
  id: string;
  name: string;
  city: string;
  pinCodes: string;
  radiusKm: number;
  isActive: boolean;
  pigeonsCount?: number;
}

interface AdminCoupon {
  code: string;
  type: string;
  value: number;
  isActive: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'pigeons' | 'stations' | 'coupons'>('analytics');

  // Load weather overrides
  const [globalWeather, setGlobalWeather] = useState('none'); // 'none', 'heavy_rain', 'extreme_heat', 'storm'
  
  // Seed stations in state
  const [stations, setStations] = useState<AdminStation[]>([
    { id: 'mumbai', name: 'Phoenix Mumbai Station', city: 'Mumbai', pinCodes: '400001,400002,400003,400004,400005', radiusKm: 15.0, isActive: true, pigeonsCount: 2 },
    { id: 'hyderabad', name: 'Phoenix Hyderabad Station', city: 'Hyderabad', pinCodes: '500001,500002,500003,500081', radiusKm: 12.0, isActive: true, pigeonsCount: 3 },
    { id: 'delhi', name: 'Phoenix Delhi Station', city: 'Delhi', pinCodes: '110001,110002,110003,110004', radiusKm: 20.0, isActive: true, pigeonsCount: 2 }
  ]);

  // Seed pigeons in state
  const [pigeons, setPigeons] = useState<AdminPigeon[]>([
    { id: 'p1', name: 'Rani', station: 'Phoenix Mumbai Station', status: 'AVAILABLE', healthStatus: 'Excellent', flights: 12 },
    { id: 'p2', name: 'Vikram', station: 'Phoenix Mumbai Station', status: 'RESTING', healthStatus: 'Excellent', flights: 8 },
    { id: 'p3', name: 'Tejas', station: 'Phoenix Hyderabad Station', status: 'AVAILABLE', healthStatus: 'Excellent', flights: 15 },
    { id: 'p4', name: 'Birju', station: 'Phoenix Hyderabad Station', status: 'AVAILABLE', healthStatus: 'Excellent', flights: 19 },
    { id: 'p5', name: 'Shera', station: 'Phoenix Hyderabad Station', status: 'SICK', healthStatus: 'Under Treatment', flights: 4 },
    { id: 'p6', name: 'Samrat', station: 'Phoenix Delhi Station', status: 'AVAILABLE', healthStatus: 'Excellent', flights: 24 },
    { id: 'p7', name: 'Vayu', station: 'Phoenix Delhi Station', status: 'AVAILABLE', healthStatus: 'Excellent', flights: 31 }
  ]);

  // Seed orders in state
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  // Seed coupons
  const [coupons, setCoupons] = useState<AdminCoupon[]>([
    { code: 'WELCOME50', type: 'FIXED', value: 50, isActive: true },
    { code: 'PHOENIX20', type: 'PERCENTAGE', value: 20, isActive: true },
    { code: 'FESTIVAL10', type: 'PERCENTAGE', value: 10, isActive: true }
  ]);

  useEffect(() => {
    // Check if admin is logged in
    const savedUser = localStorage.getItem('phoenix_user');
    if (!savedUser) {
      router.push('/');
      return;
    }
    const parsed = JSON.parse(savedUser);
    if (parsed.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    async function loadAdminData() {
      // 1. Fetch weather override
      const settings = await getSystemSettings();
      setGlobalWeather(settings.global_weather_override || 'none');

      // 2. Fetch stations
      const dbStations = await getStations();
      if (dbStations.length > 0) {
        setStations(dbStations.map(s => ({
          id: s.id,
          name: s.name,
          city: s.city,
          pinCodes: s.pinCodes,
          radiusKm: s.radiusKm,
          isActive: s.isActive,
          pigeonsCount: s.pigeons?.length || 0
        })));
      }

      // 3. Fetch pigeons
      const dbPigeons = await getPigeons();
      if (dbPigeons.length > 0) {
        setPigeons(dbPigeons.map(p => ({
          id: p.id,
          name: p.name,
          station: p.station.name,
          status: p.status,
          healthStatus: p.healthStatus,
          flights: p.totalFlights
        })));
      }

      // 4. Fetch orders
      const dbOrders = await getOrders(undefined, 'ADMIN');
      const formattedOrders = dbOrders.map(o => ({
        id: o.id,
        trackingId: o.trackingId,
        recipientName: o.recipientName,
        recipientPhone: o.recipientPhone,
        recipientAddress: o.recipientAddress,
        recipientCity: o.recipientCity,
        recipientState: o.recipientState,
        recipientPinCode: o.recipientPinCode,
        deliveryMethod: o.deliveryMethod,
        totalAmount: o.totalAmount,
        status: o.status,
        pigeonName: o.pigeon?.name || null,
        createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt)
      }));

      if (formattedOrders.length === 0) {
        const savedOrders = JSON.parse(localStorage.getItem('phoenix_orders') || '[]');
        setOrders(savedOrders);
      } else {
        setOrders(formattedOrders);
      }
    }

    loadAdminData();
  }, [router]);

  // Update weather override globally
  const handleWeatherChange = async (newWeather: string) => {
    setGlobalWeather(newWeather);
    localStorage.setItem('phoenix_global_weather', newWeather);
    await updateSystemSetting('global_weather_override', newWeather);
  };

  // Toggle station status
  const toggleStation = (id: string) => {
    setStations((prev) => 
      prev.map((s) => s.id === id ? { ...s, isActive: !s.isActive } : s)
    );
  };

  // Update pigeon status
  const updatePigeonStatus = (id: string, newStatus: string) => {
    setPigeons((prev) => 
      prev.map((p) => p.id === id ? { ...p, status: newStatus } : p)
    );
  };

  // Advance Order Status Flow
  const advanceOrderStatus = async (trackingId: string, currentStatus: string) => {
    const statusFlow = ['PENDING', 'PREPARING', 'PERSONALIZED', 'READY_FOR_DISPATCH', 'ASSIGNED', 'FLYING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIdx = statusFlow.indexOf(currentStatus);
    if (currentIdx === -1 || currentIdx === statusFlow.length - 1) return;

    const nextStatus = statusFlow[currentIdx + 1];

    const orderObj = orders.find(o => o.trackingId === trackingId);
    if (orderObj && orderObj.id) {
      const res = await updateOrderStatus(orderObj.id, nextStatus);
      if (res.success) {
        // Reload all orders
        const dbOrders = await getOrders(undefined, 'ADMIN');
        setOrders(dbOrders.map(o => ({
          id: o.id,
          trackingId: o.trackingId,
          recipientName: o.recipientName,
          recipientPhone: o.recipientPhone,
          recipientAddress: o.recipientAddress,
          recipientCity: o.recipientCity,
          recipientState: o.recipientState,
          recipientPinCode: o.recipientPinCode,
          deliveryMethod: o.deliveryMethod,
          totalAmount: o.totalAmount,
          status: o.status,
          pigeonName: o.pigeon?.name || null,
          createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt)
        })));
        return;
      }
    }

    // Fallback local storage
    setOrders((prev) => {
      const updated = prev.map((o) => o.trackingId === trackingId ? { ...o, status: nextStatus } : o);
      localStorage.setItem('phoenix_orders', JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle coupon status
  const toggleCoupon = (code: string) => {
    setCoupons((prev) => 
      prev.map((c) => c.code === code ? { ...c, isActive: !c.isActive } : c)
    );
  };

  // Calculations for analytics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pigeonShare = orders.filter((o) => o.deliveryMethod === 'PIGEON').length;
  const expressShare = orders.filter((o) => o.deliveryMethod === 'EXPRESS').length;
  const digitalShare = orders.filter((o) => o.deliveryMethod === 'DIGITAL').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-parchment-300 pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600 flex items-center gap-1">
            <ShieldAlert size={14} /> Admin Access Mode
          </span>
          <h1 className="font-serif text-3xl font-bold text-phoenix-indigo mt-1">Phoenix Control Center</h1>
        </div>

        {/* Global weather safety controls */}
        <div className="flex items-center gap-3 p-3 bg-parchment-200 rounded-xl border border-parchment-300">
          <div className="flex items-center gap-1.5 text-xs text-phoenix-indigo font-bold">
            <CloudRain size={16} className="text-terracotta-600 animate-bounce" />
            Safety Override:
          </div>
          <div className="flex gap-1.5">
            {[
              { key: 'none', label: 'Clear Safe' },
              { key: 'heavy_rain', label: 'Heavy Rain' },
              { key: 'storm', label: 'Storm suspended' }
            ].map((w) => (
              <button
                key={w.key}
                onClick={() => handleWeatherChange(w.key)}
                className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all ${
                  globalWeather === w.key 
                    ? 'bg-terracotta-500 text-white font-bold' 
                    : 'bg-parchment-50 border border-parchment-300 text-parchment-800 hover:bg-parchment-200'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-parchment-300 mb-8 overflow-x-auto pb-2 gap-2">
        {[
          { key: 'analytics', label: 'Analytics Dashboard', icon: <TrendingUp size={14} /> },
          { key: 'orders', label: 'Letters Queue', icon: <FileText size={14} /> },
          { key: 'pigeons', label: 'Aviary Welfare', icon: <Compass size={14} /> },
          { key: 'stations', label: 'Phoenix Stations', icon: <MapPin size={14} /> },
          { key: 'coupons', label: 'Discounts & Coupons', icon: <Award size={14} /> }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'analytics' | 'orders' | 'pigeons' | 'stations' | 'coupons')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap focus:outline-none ${
              activeTab === tab.key 
                ? 'bg-phoenix-indigo text-white shadow-md' 
                : 'text-phoenix-indigo hover:bg-parchment-200 border border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Key metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 shadow-sm text-center">
              <span className="block text-[10px] uppercase tracking-wider text-parchment-800 font-semibold mb-1">Total Orders logged</span>
              <span className="font-serif text-3xl font-bold text-phoenix-indigo">{orders.length}</span>
            </div>
            <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 shadow-sm text-center">
              <span className="block text-[10px] uppercase tracking-wider text-parchment-800 font-semibold mb-1">Gross Revenue</span>
              <span className="font-serif text-3xl font-bold text-[#28402c]">₹ {totalRevenue} <span className="text-[10px] block font-sans text-phoenix-indigo">(Free Service Launch)</span></span>
            </div>
            <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 shadow-sm text-center">
              <span className="block text-[10px] uppercase tracking-wider text-parchment-800 font-semibold mb-1">Active Flights</span>
              <span className="font-serif text-3xl font-bold text-terracotta-600">
                {orders.filter((o) => o.status === 'FLYING').length}
              </span>
            </div>
            <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 shadow-sm text-center">
              <span className="block text-[10px] uppercase tracking-wider text-parchment-800 font-semibold mb-1">Aviary Status</span>
              <span className="font-serif text-3xl font-bold text-phoenix-forest">
                {pigeons.filter((p) => p.status === 'AVAILABLE').length} / {pigeons.length} Avl
              </span>
            </div>
          </div>

          {/* Delivery shares visual chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 space-y-4">
              <h3 className="font-serif text-sm font-bold text-phoenix-indigo uppercase tracking-wider border-b border-parchment-300 pb-3">
                Logistics shares
              </h3>
              
              <div className="space-y-4 text-xs">
                {/* Pigeon Share */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>Homing Pigeon Flight</span>
                    <span>{pigeonShare} orders</span>
                  </div>
                  <div className="w-full bg-parchment-300 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-terracotta-500 h-full rounded-full" 
                      style={{ width: `${orders.length ? (pigeonShare / orders.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Express Share */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>Express Ground Partner</span>
                    <span>{expressShare} orders</span>
                  </div>
                  <div className="w-full bg-parchment-300 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-phoenix-indigo h-full rounded-full" 
                      style={{ width: `${orders.length ? (expressShare / orders.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Digital Share */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>Digital Scroll Only</span>
                    <span>{digitalShare} orders</span>
                  </div>
                  <div className="w-full bg-parchment-300 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-phoenix-gold-dark h-full rounded-full" 
                      style={{ width: `${orders.length ? (digitalShare / orders.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Popular occassions summary */}
            <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 space-y-4">
              <h3 className="font-serif text-sm font-bold text-phoenix-indigo uppercase tracking-wider border-b border-parchment-300 pb-3">
                Popular occasions
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-parchment-50 rounded-lg">
                  <span className="font-semibold">Love ❤️ Letters</span>
                  <span className="font-bold text-phoenix-indigo">60% of volume</span>
                </div>
                <div className="flex justify-between p-2.5 bg-parchment-50 rounded-lg">
                  <span className="font-semibold">Birthday 🎂 Memories</span>
                  <span className="font-bold text-phoenix-indigo">25% of volume</span>
                </div>
                <div className="flex justify-between p-2.5 bg-parchment-50 rounded-lg">
                  <span className="font-semibold">Festival 🪔 Collections</span>
                  <span className="font-bold text-phoenix-indigo">15% of volume</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Letters queue */}
      {activeTab === 'orders' && (
        <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 space-y-6">
          <h3 className="font-serif text-base font-bold text-phoenix-indigo uppercase tracking-wider border-b border-parchment-300 pb-3">
            Print & Seal queue
          </h3>

          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.trackingId}
                className="p-4 bg-parchment-50 border border-parchment-300 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-phoenix-indigo">{order.trackingId}</span>
                    <span className="px-2 py-0.5 border rounded text-[9px] font-bold bg-parchment-200">
                      {order.status}
                    </span>
                  </div>
                  <p>To: <span className="font-bold">{order.recipientName}</span> ({order.recipientCity} PIN: {order.recipientPinCode})</p>
                  <p className="text-[10px] text-parchment-800">
                    Mode: <span className="font-semibold">{order.deliveryMethod}</span> {order.pigeonName && `| Pigeon Assigned: "${order.pigeonName}"`}
                  </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                  {order.status !== 'DELIVERED' ? (
                    <button
                      onClick={() => advanceOrderStatus(order.trackingId, order.status)}
                      className="vintage-btn px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      Advance stage <ChevronRight size={12} />
                    </button>
                  ) : (
                    <span className="px-3 py-2 rounded-lg bg-phoenix-forest/10 border border-phoenix-forest/20 text-phoenix-forest font-bold text-[10px] uppercase">
                      Fulfillment Done ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Pigeon aviary */}
      {activeTab === 'pigeons' && (
        <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 space-y-6">
          <div className="flex justify-between items-center border-b border-parchment-300 pb-3">
            <h3 className="font-serif text-base font-bold text-phoenix-indigo uppercase tracking-wider">
              Aviary & welfare rosters
            </h3>
            <span className="text-[10px] text-parchment-800 font-bold uppercase">Rest cycle: Min 12h aviary time</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pigeons.map((pig) => (
              <div key={pig.id} className="p-4 bg-parchment-50 border border-parchment-300 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-phoenix-indigo flex items-center gap-1">
                      🕊️ {pig.name}
                    </h4>
                    <span className="text-[9px] text-parchment-800 uppercase block">{pig.station}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    pig.status === 'AVAILABLE' ? 'bg-green-50 text-green-700 border-green-500/20' :
                    pig.status === 'RESTING' ? 'bg-blue-50 text-blue-700 border-blue-500/20' :
                    'bg-red-50 text-red-700 border-red-500/20'
                  }`}>
                    {pig.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] bg-parchment-200/50 p-2 rounded-lg">
                  <div>
                    <span className="block text-[8px] text-parchment-800 uppercase font-semibold">Health</span>
                    <span className="font-bold text-phoenix-indigo">{pig.healthStatus}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-parchment-800 uppercase font-semibold">Flights</span>
                    <span className="font-bold text-phoenix-indigo">{pig.flights}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-parchment-800 uppercase font-semibold">Range Max</span>
                    <span className="font-bold text-phoenix-indigo">30 km</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1.5 border-t border-parchment-200 justify-end">
                  <button
                    onClick={() => updatePigeonStatus(pig.id, 'AVAILABLE')}
                    className="px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-700 rounded text-[9px] font-semibold"
                  >
                    Available
                  </button>
                  <button
                    onClick={() => updatePigeonStatus(pig.id, 'RESTING')}
                    className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-700 rounded text-[9px] font-semibold"
                  >
                    Rest
                  </button>
                  <button
                    onClick={() => updatePigeonStatus(pig.id, 'SICK')}
                    className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-700 rounded text-[9px] font-semibold"
                  >
                    Sick Leave
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Stations */}
      {activeTab === 'stations' && (
        <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 space-y-6">
          <h3 className="font-serif text-base font-bold text-phoenix-indigo uppercase tracking-wider border-b border-parchment-300 pb-3">
            Homing dispatch centers
          </h3>

          <div className="space-y-4">
            {stations.map((stat) => (
              <div 
                key={stat.id}
                className="p-4 bg-parchment-50 border border-parchment-300 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-sm font-bold text-phoenix-indigo">{stat.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                      stat.isActive ? 'bg-green-50 text-green-700 border-green-500/20' : 'bg-red-50 text-red-700 border-red-500/20'
                    }`}>
                      {stat.isActive ? 'Active' : 'Offline'}
                    </span>
                  </div>
                  <p>City: <span className="font-bold">{stat.city}</span> | Service Radius: {stat.radiusKm} km</p>
                  <p className="text-[10px] text-parchment-800 max-w-xl">
                    Served PINs: <span className="font-semibold">{stat.pinCodes}</span>
                  </p>
                </div>

                <button
                  onClick={() => toggleStation(stat.id)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    stat.isActive 
                      ? 'border border-red-500/30 text-red-600 hover:bg-red-50' 
                      : 'vintage-btn'
                  }`}
                >
                  {stat.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Coupons */}
      {activeTab === 'coupons' && (
        <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 space-y-6">
          <h3 className="font-serif text-base font-bold text-phoenix-indigo uppercase tracking-wider border-b border-parchment-300 pb-3">
            Discount Coupon Ledger
          </h3>

          <div className="space-y-3">
            {coupons.map((c) => (
              <div 
                key={c.code}
                className="p-4 bg-parchment-50 border border-parchment-300 rounded-xl flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-terracotta-600 block text-sm">{c.code}</span>
                  <span className="text-[10px] text-parchment-800">
                    Type: {c.type} | Value: {c.type === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value}`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    c.isActive ? 'bg-green-50 text-green-700 border-green-500/20' : 'bg-red-50 text-red-700 border-red-500/20'
                  }`}>
                    {c.isActive ? 'Active' : 'Expired'}
                  </span>
                  <button
                    onClick={() => toggleCoupon(c.code)}
                    className="p-1.5 rounded bg-parchment-200 hover:bg-parchment-300 text-phoenix-indigo font-bold text-[10px] uppercase"
                  >
                    Toggle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
