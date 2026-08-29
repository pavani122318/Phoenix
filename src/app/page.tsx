'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLetter } from '@/context/LetterContext';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Compass, 
  Sparkles, 
  ChevronDown, 
  Star,
  PenTool,
  Bookmark
} from 'lucide-react';

export default function Home() {
  const { updateLetterData, resetLetterData } = useLetter();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const startWithOccasion = (occasion: string) => {
    resetLetterData();
    updateLetterData({ occasion });
    router.push('/send-letter');
  };

  const occasions = [
    { name: 'Love ❤️', desc: 'Anniversaries, proposals, & messages from the heart.', key: 'Love' },
    { name: 'Birthday 🎂', desc: 'Memorable birthday stories & photo-laden scrolls.', key: 'Birthday' },
    { name: 'Friendship 🤝', desc: 'For friends who deserve more than a quick DM.', key: 'Friendship' },
    { name: 'Thank You 🙏', desc: 'Deep appreciation printed on archival parchment.', key: 'Thank You' },
    { name: 'Apology 😔', desc: 'Sincere words of regret, delivered carefully.', key: 'Apology' },
    { name: 'Festival 🪔', desc: 'Diwali, Holi, Eid, & Christmas special collections.', key: 'Festival' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Compose Online',
      desc: 'Write your message in our interface. Use our smart local AI copywriter to draft beautiful emotions in seconds.',
      icon: <PenTool className="text-terracotta-500 w-6 h-6" />
    },
    {
      num: '02',
      title: 'Personalize Stationery',
      desc: 'Choose premium parchment, custom envelopes, and optionally convert your typed text into realistic handwriting.',
      icon: <Sparkles className="text-phoenix-gold w-6 h-6" />
    },
    {
      num: '03',
      title: 'Pigeon or Express Flight',
      desc: 'If the recipient is within a station zone and weather permits, a trained carrier pigeon is assigned. Otherwise, express courier partner.',
      icon: <Compass className="text-phoenix-forest w-6 h-6" />
    },
    {
      num: '04',
      title: 'Track the Journey',
      desc: 'Watch a live interactive tracking map simulating the flight path, speed, and real-time operational status.',
      icon: <MapPin className="text-phoenix-indigo w-6 h-6" />
    }
  ];

  const faqs = [
    {
      q: "Does a real pigeon actually deliver my letter?",
      a: "Yes! In areas within 12-20 km of our active stations (Mumbai, Hyderabad, Delhi) and for served PIN codes, we utilize our trained homing pigeons. They carry a lightweight parchment roll safely attached in a secure harness. For other destinations across India, we utilize our Express Postal Partner."
    },
    {
      q: "What happens if there is bad weather?",
      a: "The safety of our birds is our absolute priority. If there is rain, storm, poor visibility, or extreme heat, pigeon flights are suspended. Your dashboard will show: 'Phoenix is protecting its messengers.' We will either wait for clear weather or, if you request, immediately dispatch via express ground partners at no extra cost."
    },
    {
      q: "How does the handwriting service work?",
      a: "We have mapped elegant cursive styles that avoid standard blocky computer fonts. When selected, your letter is plotted onto premium handmade paper using realistic ink flow configurations, making it indistinguishable from a beautiful handwritten letter."
    },
    {
      q: "How long does delivery take?",
      a: "Digital copies are delivered within minutes of payment. Physical pigeon deliveries (in station regions) are fulfilled within 24-48 hours. Express partner deliveries across India take 2-4 business days."
    }
  ];

  const reviews = [
    {
      name: "Aarav Sharma",
      city: "Hyderabad",
      text: "Sent an anniversary letter to my wife. She was in tears when she saw the vintage envelope and the handwritten calligraphy. The tracking map was magical to watch!",
      rating: 5
    },
    {
      name: "Priya Patel",
      city: "Mumbai",
      text: "The premium parchment feels heavy and high-quality, exactly like old post letters. Better than any WhatsApp text could ever be. Truly traditional yet modern.",
      rating: 5
    },
    {
      name: "Karan Malhotra",
      city: "Delhi",
      text: "A very unique experience. The carrier pigeon assignment and the detailed rest cycles make you appreciate the service. Great animal welfare policies too.",
      rating: 5
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:py-32 bg-gradient-to-b from-parchment-100 to-parchment-200 border-b border-parchment-300">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 border border-parchment-300/30 rounded-full opacity-20 hidden md:block" />
        <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-dashed border-parchment-300/20 rounded-full opacity-35 hidden md:block" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            {/* Hero Content */}
            <div className="md:col-span-7 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-terracotta-50 border border-terracotta-500/10 text-terracotta-700 text-xs font-semibold uppercase tracking-widest mx-auto md:mx-0 shadow-sm animate-pulse">
                <Sparkles size={12} />
                Traditional Soul × Modern Tech
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-phoenix-indigo leading-tight">
                Some messages deserve more than <span className="text-terracotta-500 italic font-medium">a notification.</span>
              </h1>
              <p className="text-base sm:text-lg text-parchment-800 leading-relaxed font-sans max-w-xl mx-auto md:mx-0">
                Write it online. We&apos;ll turn your words into a real physical parchment letter, custom wax-sealed, and sent on an extraordinary pigeon flight or express journey.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4 pt-4">
                <Link
                  href="/send-letter"
                  className="w-full sm:w-auto text-center vintage-btn font-bold px-8 py-4 rounded-xl shadow-lg text-sm tracking-wide"
                >
                  Send a Letter
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto text-center px-8 py-4 rounded-xl text-phoenix-indigo hover:bg-parchment-300/50 border border-parchment-300 font-semibold text-sm transition-all"
                >
                  How Phoenix Works
                </a>
              </div>

              {/* Badges / Trust points */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-parchment-300 max-w-md mx-auto md:mx-0 text-left">
                <div>
                  <h4 className="font-serif text-lg font-bold text-phoenix-indigo">100%</h4>
                  <p className="text-[10px] text-parchment-800 uppercase tracking-widest font-semibold">Premium Parchment</p>
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-phoenix-indigo">Wax Sealed</h4>
                  <p className="text-[10px] text-parchment-800 uppercase tracking-widest font-semibold">By Hand in India</p>
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-phoenix-indigo">Welfare Cert.</h4>
                  <p className="text-[10px] text-parchment-800 uppercase tracking-widest font-semibold">Pigeon Safety Laws</p>
                </div>
              </div>
            </div>

            {/* Hero Animation Box */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-2xl border border-phoenix-gold/30 bg-parchment-50 p-6 shadow-2xl flex items-center justify-center overflow-hidden parchment-texture">
                {/* Vintage stamp background */}
                <div className="absolute top-4 right-4 w-16 h-20 border border-dotted border-phoenix-gold-dark/40 rounded flex items-center justify-center flex-col opacity-60">
                  <span className="text-[8px] font-serif">PHX-IND</span>
                  <div className="w-8 h-8 rounded-full border border-phoenix-gold-dark/40 my-1 flex items-center justify-center text-[6px] font-bold">2026</div>
                  <span className="text-[8px] font-serif">FREE</span>
                </div>

                {/* Postmark circles */}
                <div className="absolute bottom-6 left-6 w-24 h-24 border border-phoenix-gold-dark/20 rounded-full flex items-center justify-center opacity-40">
                  <div className="w-20 h-20 border border-phoenix-gold-dark/20 rounded-full" />
                </div>

                {/* Interactive SVG Animation */}
                <div className="relative w-full h-full flex items-center justify-center animate-float">
                  {/* The Bird Path Line */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                    {/* Dashed trail */}
                    <path
                      d="M 50 300 Q 200 100 350 150"
                      fill="none"
                      stroke="#cca662"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                      className="opacity-40"
                    />
                  </svg>
                  
                  {/* The Flying Phoenix Silhouette */}
                  <div className="absolute top-24 left-1/3 transform -translate-x-1/2 -translate-y-1/2 text-terracotta-500 scale-125">
                    <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md">
                      {/* Stylized Phoenix flying with wings flap */}
                      <path 
                        d="M 50 30 C 53 38 65 35 75 25 C 80 20 83 23 80 28 C 70 40 55 42 50 48 C 45 42 30 40 20 28 C 17 23 20 20 25 25 C 35 35 47 38 50 30 Z" 
                        fill="currentColor"
                        className="animate-flap"
                      />
                      {/* Body & beak */}
                      <path d="M 48 45 L 50 32 L 52 45 Q 50 65 50 80 Q 48 83 45 80 L 48 70 Z" fill="#aa4830" />
                      {/* Tiny envelope in beak */}
                      <rect x="47" y="27" width="6" height="4" fill="#fdfcf9" stroke="#1a2a4a" strokeWidth="0.5" transform="rotate(15 50 29)" />
                    </svg>
                  </div>

                  {/* Letter Box (Parallax Card) */}
                  <div className="absolute bottom-10 w-64 p-4 bg-parchment-100 rounded-lg shadow-lg border border-phoenix-gold-dark/40 transform rotate-[-4deg] deckled-border">
                    <div className="flex justify-between items-start border-b border-parchment-300 pb-2 mb-2">
                      <span className="text-[10px] font-bold text-phoenix-indigo tracking-wider">PHOENIX LETTER CO.</span>
                      <span className="text-[8px] font-mono text-terracotta-600">PHX-IN-2026</span>
                    </div>
                    <div className="h-2 w-3/4 bg-parchment-300 rounded mb-1.5" />
                    <div className="h-2 w-5/6 bg-parchment-300 rounded mb-1.5" />
                    <div className="h-2 w-1/2 bg-parchment-300 rounded mb-3" />
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[8px] font-sans text-parchment-800">Wax seal: Classic Red</span>
                      <div className="w-5 h-5 rounded-full wax-seal transform scale-75" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Occasions Showcase */}
      <section className="py-20 bg-parchment-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="font-serif text-3xl font-bold text-phoenix-indigo">Choose Your Occasion</h2>
            <p className="text-sm text-parchment-800 mt-2">
              Select one of our thematic templates. We&apos;ll tailor the paper styling, envelopes, and simulated stamps to fit the mood perfectly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {occasions.map((occ) => (
              <button
                key={occ.name}
                onClick={() => startWithOccasion(occ.key)}
                className="group text-left p-6 rounded-2xl border border-parchment-300 bg-parchment-100 hover:bg-parchment-200 transition-all hover:shadow-md transform hover:-translate-y-1 duration-250 flex flex-col justify-between h-48 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 border border-dashed border-parchment-300/10 rounded-full -mr-8 -mt-8 group-hover:border-parchment-300/35 transition-colors" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-phoenix-indigo mb-2 flex justify-between items-center">
                    {occ.name}
                    <Bookmark size={14} className="text-parchment-800 group-hover:text-terracotta-500 opacity-40 group-hover:opacity-100 transition-all" />
                  </h3>
                  <p className="text-xs text-parchment-800 leading-relaxed">{occ.desc}</p>
                </div>
                <span className="text-[10px] uppercase font-bold text-terracotta-600 group-hover:underline">Compose Scroll →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-parchment-50 to-parchment-200 border-t border-b border-parchment-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold text-terracotta-600 uppercase tracking-widest">Process Flow</span>
            <h2 className="font-serif text-3xl font-bold text-phoenix-indigo mt-1">How Phoenix Works</h2>
            <p className="text-sm text-parchment-800 mt-2">
              From a keyboard in your browser to a hand-folded parchment scroll, your letters undergo a careful process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step) => (
              <div key={step.title} className="relative space-y-4 text-center md:text-left bg-parchment-100/50 p-6 rounded-xl border border-parchment-300/50">
                <div className="flex justify-between items-center">
                  <span className="font-serif text-3xl font-bold text-parchment-300">{step.num}</span>
                  <div className="p-3 bg-parchment-50 rounded-xl border border-parchment-300/40 shadow-inner">
                    {step.icon}
                  </div>
                </div>
                <h3 className="font-serif text-base font-bold text-phoenix-indigo">{step.title}</h3>
                <p className="text-xs text-parchment-800 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animal Welfare Commit */}
      <section className="py-20 bg-parchment-50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="inline-flex p-4 rounded-full bg-phoenix-forest/10 border border-phoenix-forest/20 text-phoenix-forest">
            <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest font-bold text-phoenix-forest">Our Ethical Commitment</span>
            <h2 className="font-serif text-3xl font-bold text-phoenix-indigo">Our Homing Pigeon Welfare Charter</h2>
            <p className="text-sm text-parchment-800 max-w-2xl mx-auto leading-relaxed">
              We care deeply about our birds. Our flight logistics operate under severe humane guidelines. We restrict each pigeon to a maximum of 2 flight missions per day, enforce mandatory rest cycles, provide high-nutrition feeds, and suspend flights instantly during heavy rain, high winds, and heatwaves.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-2xl mx-auto pt-4">
            <div className="p-4 rounded-lg bg-parchment-100 border border-parchment-300">
              <h4 className="text-xs font-bold text-phoenix-forest uppercase tracking-wider mb-1">Rest Cycles</h4>
              <p className="text-[10px] text-parchment-800 leading-normal">Minimum 12 hours of aviary rest with full medical tracking before reassignment.</p>
            </div>
            <div className="p-4 rounded-lg bg-parchment-100 border border-parchment-300">
              <h4 className="text-xs font-bold text-phoenix-forest uppercase tracking-wider mb-1">Weather Protection</h4>
              <p className="text-[10px] text-parchment-800 leading-normal">Automatic meteorological triggers reroute letters via ground courier in extreme conditions.</p>
            </div>
            <div className="p-4 rounded-lg bg-parchment-100 border border-parchment-300">
              <h4 className="text-xs font-bold text-phoenix-forest uppercase tracking-wider mb-1">Veterinary Care</h4>
              <p className="text-[10px] text-parchment-800 leading-normal">Bi-weekly veterinary health inspections ensure all messengers are healthy and active.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 bg-gradient-to-b from-parchment-50 to-parchment-200 border-t border-b border-parchment-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold text-terracotta-600 uppercase tracking-widest">Testimonials</span>
            <h2 className="font-serif text-3xl font-bold text-phoenix-indigo mt-1">How Phoenix Made Them Feel</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <div key={rev.name} className="parchment-texture p-8 rounded-2xl shadow-md border border-phoenix-gold-dark/30 flex flex-col justify-between h-64 relative deckled-border">
                {/* Stylized vintage post stamp */}
                <div className="absolute top-4 right-4 w-10 h-10 border border-dotted border-terracotta-600/30 rounded flex items-center justify-center text-[7px] text-terracotta-600 select-none uppercase tracking-widest font-mono">
                  PHX
                </div>
                
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-phoenix-gold text-phoenix-gold" />
                    ))}
                  </div>
                  <p className="text-xs text-phoenix-indigo leading-relaxed italic">&ldquo;{rev.text}&rdquo;</p>
                </div>

                <div className="border-t border-parchment-300 pt-4 flex justify-between items-center mt-4">
                  <div>
                    <span className="text-xs font-bold text-phoenix-indigo block">{rev.name}</span>
                    <span className="text-[9px] uppercase tracking-wider text-parchment-800">{rev.city}, IN</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-terracotta-500/10 border border-terracotta-500/30 flex items-center justify-center text-[8px] font-bold text-terracotta-600">
                    ✓
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="py-20 bg-parchment-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-phoenix-indigo">Frequently Asked Questions</h2>
            <p className="text-sm text-parchment-800 mt-2">Find clear answers to operations, delivery logistics, and welfare rules.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={faq.q} className="border-b border-parchment-300 pb-4">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center text-left py-2 focus:outline-none"
                >
                  <h3 className="font-serif text-base font-bold text-phoenix-indigo">{faq.q}</h3>
                  <ChevronDown
                    size={18}
                    className={`transform transition-transform ${openFaq === idx ? 'rotate-180 text-terracotta-500' : 'text-phoenix-indigo'}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="pt-2 text-xs text-parchment-800 leading-relaxed animate-draw">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
