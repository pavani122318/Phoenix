'use client';

import React, { useState, useEffect } from 'react';
import { useLetter } from '@/context/LetterContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, 
  MapPin, 
  Clock, 
  Compass, 
  ChevronRight, 
  Award,
  LogOut
} from 'lucide-react';
import { getOrders } from '@/lib/actions';

interface DashboardOrder {
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

interface SavedRecipient {
  name: string;
  phone: string;
  address: string;
  city: string;
  pinCode: string;
}

export default function Dashboard() {
  const { user, logout } = useLetter();
  const router = useRouter();
  
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [savedRecipients, setSavedRecipients] = useState<SavedRecipient[]>([]);

  useEffect(() => {
    // Redirect if not logged in
    const savedUser = localStorage.getItem('phoenix_user');
    if (!savedUser) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(savedUser);

    async function loadDashboardData() {
      // Fetch actual orders from DB
      const dbOrders = await getOrders(parsedUser.id, parsedUser.role);
      
      const formattedOrders: DashboardOrder[] = dbOrders.map((o) => ({
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
        createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
      }));

      // Fallback if DB returns empty
      if (formattedOrders.length === 0) {
        const savedOrders = JSON.parse(localStorage.getItem('phoenix_orders') || '[]');
        if (savedOrders.length === 0) {
          const seedOrders = [
            {
              trackingId: 'PHX-IN-2026-882910',
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
            },
            {
              trackingId: 'PHX-IN-2026-554819',
              recipientName: 'Pooja Hegde',
              recipientPhone: '9002817281',
              recipientAddress: 'Jubilee Hills, Road No. 10',
              recipientCity: 'Hyderabad',
              recipientState: 'Telangana',
              recipientPinCode: '500081',
              deliveryMethod: 'EXPRESS',
              totalAmount: 248,
              status: 'DELIVERED',
              createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
            }
          ];
          localStorage.setItem('phoenix_orders', JSON.stringify(seedOrders));
          setOrders(seedOrders);
        } else {
          setOrders(savedOrders);
        }
      } else {
        setOrders(formattedOrders);
      }

      // Load recipients from orders
      const uniqueRecipientsMap = new Map<string, SavedRecipient>();
      const currentOrders = formattedOrders.length > 0 ? formattedOrders : JSON.parse(localStorage.getItem('phoenix_orders') || '[]');
      currentOrders.forEach((o: DashboardOrder) => {
        if (!uniqueRecipientsMap.has(o.recipientPhone)) {
          uniqueRecipientsMap.set(o.recipientPhone, {
            name: o.recipientName,
            phone: o.recipientPhone,
            address: o.recipientAddress,
            city: o.recipientCity,
            pinCode: o.recipientPinCode,
          });
        }
      });
      
      const recs = Array.from(uniqueRecipientsMap.values());
      if (recs.length === 0) {
        // Mock fallback recipients
        const mockRecipients = [
          { name: 'Karan Johar', phone: '9827361829', address: 'Bandra West, Carter Road', city: 'Mumbai', pinCode: '400021' },
          { name: 'Pooja Hegde', phone: '9002817281', address: 'Jubilee Hills, Road No. 10', city: 'Hyderabad', pinCode: '500081' },
          { name: 'Rohan Sharma', phone: '9928172810', address: 'Connaught Place, Block E', city: 'Delhi', pinCode: '110001' }
        ];
        setSavedRecipients(mockRecipients);
      } else {
        setSavedRecipients(recs);
      }
    }

    loadDashboardData();
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string }> = {
      'PENDING': { bg: 'bg-yellow-50 text-yellow-700 border-yellow-500/20', text: 'Processing' },
      'PREPARING': { bg: 'bg-blue-50 text-blue-700 border-blue-500/20', text: 'Printing Parchment' },
      'PERSONALIZED': { bg: 'bg-indigo-50 text-indigo-700 border-indigo-500/20', text: 'Wax Sealing' },
      'ASSIGNED': { bg: 'bg-purple-50 text-purple-700 border-purple-500/20', text: 'Pigeon Assigned' },
      'FLYING': { bg: 'bg-orange-50 text-orange-700 border-orange-500/20 animate-pulse', text: 'In Flight 🕊️' },
      'DELIVERED': { bg: 'bg-green-50 text-green-700 border-green-500/20', text: 'Delivered' }
    };
    const c = configs[status] || configs.PENDING;
    return (
      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${c.bg}`}>
        {c.text}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Customer profile summary card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="parchment-texture p-6 rounded-2xl border border-phoenix-gold/30 shadow-md relative overflow-hidden deckled-border">
            <div className="absolute top-2 right-2 w-12 h-12 border border-dotted border-phoenix-gold-dark/20 rounded-full flex items-center justify-center text-[8px] font-serif opacity-30 select-none">
              MEMBER
            </div>

            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className="w-16 h-16 rounded-full bg-terracotta-500/10 border border-terracotta-500/30 flex items-center justify-center text-2xl text-terracotta-600 font-serif">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-phoenix-indigo">{user?.name || 'Guest Customer'}</h2>
                <span className="text-[10px] text-parchment-800 uppercase tracking-widest font-semibold">{user?.email}</span>
              </div>
              
              <div className="w-full grid grid-cols-2 gap-2 text-xs pt-4 border-t border-parchment-300">
                <div className="text-center p-2 bg-parchment-200/50 rounded-lg">
                  <span className="block text-[8px] uppercase tracking-wider text-parchment-800 font-semibold">Sent Scrolls</span>
                  <span className="font-bold text-phoenix-indigo text-lg">{orders.length}</span>
                </div>
                <div className="text-center p-2 bg-parchment-200/50 rounded-lg">
                  <span className="block text-[8px] uppercase tracking-wider text-parchment-800 font-semibold">Active Flights</span>
                  <span className="font-bold text-terracotta-600 text-lg">
                    {orders.filter((o) => o.status === 'FLYING' || o.status === 'PREPARING').length}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-terracotta-500/20 text-terracotta-600 hover:bg-terracotta-50 text-xs font-semibold transition-colors mt-4"
              >
                <LogOut size={14} />
                Sign Out Session
              </button>
            </div>
          </div>

          {/* Quick promotions wallet card replaced with Launch Status card */}
          <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 space-y-4">
            <h3 className="font-serif text-xs font-bold text-phoenix-indigo uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} className="text-phoenix-gold-dark" />
              Launch Promotion
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-phoenix-forest/5 border border-phoenix-forest/20 rounded-lg text-[11px] leading-relaxed text-phoenix-forest">
                <span className="font-bold block mb-1">🕊️ Free Beta Launch</span>
                Phoenix Pigeon Service is currently free of charge to celebrate our launch! Write and dispatch scrolls at no cost.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: History & Recipients List */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Letters */}
          <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 space-y-6">
            <div className="flex justify-between items-center border-b border-parchment-300 pb-3">
              <h3 className="font-serif text-base font-bold text-phoenix-indigo uppercase tracking-wider flex items-center gap-2">
                <Compass size={18} className="text-terracotta-500" />
                Dispatch History
              </h3>
              <Link
                href="/send-letter"
                className="vintage-btn text-[10px] font-bold px-4 py-2 rounded-lg"
              >
                Send New Letter
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Mail size={48} className="mx-auto text-parchment-300 opacity-60" />
                <p className="text-xs text-parchment-800 italic">No dispatches logged in this session yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.trackingId}
                    className="p-4 bg-parchment-50 border border-parchment-300 rounded-xl hover:shadow-sm transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-phoenix-indigo">{order.trackingId}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-parchment-900">
                        To: <span className="font-bold">{order.recipientName}</span> ({order.recipientCity})
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-parchment-800">
                        <span className="flex items-center gap-0.5"><Clock size={10} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-0.5"><Compass size={10} /> {order.deliveryMethod === 'PIGEON' ? 'Homing Pigeon' : order.deliveryMethod === 'EXPRESS' ? 'Express Ground' : 'Digital Scroll'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-parchment-300">
                      <span className="text-xs font-bold text-phoenix-indigo">{order.totalAmount === 0 ? 'Free' : `₹ ${order.totalAmount}`}</span>
                      <Link
                        href={`/track?id=${order.trackingId}`}
                        className="px-3.5 py-2 rounded-lg bg-parchment-200 hover:bg-parchment-300 text-phoenix-indigo text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                      >
                        Track <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Contacts */}
          <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 space-y-4">
            <h3 className="font-serif text-base font-bold text-phoenix-indigo uppercase tracking-wider border-b border-parchment-300 pb-3 flex items-center gap-2">
              <MapPin size={18} className="text-phoenix-gold-dark" />
              Saved Contacts Book
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedRecipients.map((rec, idx) => (
                <div key={idx} className="p-4 bg-parchment-50 border border-parchment-300 rounded-xl space-y-2">
                  <div className="flex justify-between items-center border-b border-parchment-200 pb-1.5">
                    <span className="text-xs font-bold text-phoenix-indigo">{rec.name}</span>
                    <span className="text-[8px] bg-parchment-200 px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider font-mono text-parchment-900">{rec.pinCode}</span>
                  </div>
                  <div className="text-[10px] text-parchment-800 leading-normal">
                    <p>{rec.address}, {rec.city}</p>
                    <p className="mt-1 font-semibold text-phoenix-indigo/70">Phone: +91 {rec.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
