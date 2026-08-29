import React from 'react';
import Link from 'next/link';
import { Heart, Compass, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-phoenix-navy text-parchment-100 border-t border-phoenix-gold/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-wider text-phoenix-gold">PHOENIX</span>
            </div>
            <p className="text-xs text-parchment-300 leading-relaxed font-sans">
              &ldquo;Bring Your Message Back to Life.&rdquo;<br />
              Combining traditional Indian letter culture with modern operations, delivering emotions across horizons.
            </p>
            <div className="flex gap-3 text-parchment-300">
              {/* Retro stamp logo */}
              <div className="w-8 h-8 rounded border border-parchment-300/20 flex items-center justify-center text-[10px] font-serif opacity-70">
                IN
              </div>
              <div className="w-8 h-8 rounded border border-parchment-300/20 flex items-center justify-center text-[10px] font-serif opacity-70">
                PHX
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-sm font-bold tracking-wider text-phoenix-gold uppercase mb-4">Navigations</h3>
            <ul className="space-y-2 text-xs text-parchment-300">
              <li><Link href="/" className="hover:text-phoenix-gold transition-colors">Home Landing</Link></li>
              <li><Link href="/send-letter" className="hover:text-phoenix-gold transition-colors">Send a Letter</Link></li>
              <li><Link href="/track" className="hover:text-phoenix-gold transition-colors">Track Letter</Link></li>
              <li><Link href="/#faq" className="hover:text-phoenix-gold transition-colors">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Core Occasions */}
          <div>
            <h3 className="font-serif text-sm font-bold tracking-wider text-phoenix-gold uppercase mb-4">Occasions</h3>
            <ul className="space-y-2 text-xs text-parchment-300">
              <li><Link href="/send-letter?occasion=Love" className="hover:text-phoenix-gold transition-colors">Love ❤️</Link></li>
              <li><Link href="/send-letter?occasion=Birthday" className="hover:text-phoenix-gold transition-colors">Birthday 🎂</Link></li>
              <li><Link href="/send-letter?occasion=Anniversary" className="hover:text-phoenix-gold transition-colors">Anniversary 💍</Link></li>
              <li><Link href="/send-letter?occasion=Friendship" className="hover:text-phoenix-gold transition-colors">Friendship 🤝</Link></li>
            </ul>
          </div>

          {/* Welfare Statement */}
          <div className="p-4 rounded-xl bg-parchment-50/5 border border-parchment-50/10 space-y-2">
            <h3 className="text-xs font-bold text-phoenix-gold flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck size={14} />
              Animal Welfare First
            </h3>
            <p className="text-[10px] text-parchment-300 leading-normal">
              Phoenix operates with strict ethical charters. Our homing pigeons undergo veterinary checkups, receive feed/hydration, fly a maximum of 2 missions/day, and rest in safe aviaries. Pigeon delivery is suspended automatically during inclement weather.
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-parchment-50/10 my-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-parchment-300 gap-4">
          <p>© {new Date().getFullYear()} Phoenix Pigeon Letter Service. Developed for local sandbox.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Heart size={10} className="text-terracotta-500" /> Made in India</span>
            <span className="flex items-center gap-1"><Compass size={10} className="text-phoenix-gold" /> Navigating Horizons</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
