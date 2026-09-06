'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLetter } from '@/context/LetterContext';
import { generateLetterDraft } from '@/lib/ai';
import { validatePinCode, validatePhoneNumber } from '@/lib/validation';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Upload, 
  Trash2, 
  Gift, 
  Check, 
  Loader2
} from 'lucide-react';
import { createOrder, getSystemSettings, getStationByPinCode } from '@/lib/actions';

interface StationMatch {
  stationId: string;
  stationName: string;
  city: string;
  state: string;
}

export default function SendLetter() {
  const router = useRouter();
  const {
    user,
    currentStep,
    setCurrentStep,
    letterData,
    updateLetterData,
    recipientData,
    updateRecipientData,
    deliveryMethod,
    setDeliveryMethod,
    giftOptions,
    updateGiftOptions,
    calculateTotal,
    resetLetterData
  } = useLetter();

  // Navigation step control
  const stepTabs = ['occasion', 'write', 'personalize', 'checkout'] as const;
  const activeTab = stepTabs[currentStep - 1] || 'occasion';

  // AI Assistant states
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [aiTone, setAiTone] = useState('Heartfelt');
  const [aiLength, setAiLength] = useState('Medium');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState('');

  // Recipient validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stationAvailable, setStationAvailable] = useState<StationMatch | null>(null);
  const [weatherCondition, setWeatherCondition] = useState<'safe' | 'suspended'>('safe');



  // Payment states
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load weather condition from DB on mount
  useEffect(() => {
    async function loadWeather() {
      const settings = await getSystemSettings();
      const weather = settings.global_weather_override;
      if (weather === 'suspended' || weather === 'heavy_rain' || weather === 'storm' || weather === 'extreme_heat') {
        setWeatherCondition('suspended');
      } else {
        setWeatherCondition('safe');
      }
    }
    loadWeather();
  }, []);

  const handleOccasionSelect = (occ: string) => {
    updateLetterData({ occasion: occ });
    setCurrentStep(2);
  };

  const handleAIWrite = () => {
    setGeneratingAi(true);
    setTimeout(() => {
      const generated = generateLetterDraft(
        letterData.occasion,
        aiTone,
        aiLength,
        aiPrompt,
        recipientData.name || 'My Friend',
        letterData.signatureUrl || 'Someone who cares'
      );
      updateLetterData({ content: generated });
      setGeneratingAi(false);
      setShowAiHelper(false);
    }, 1500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be smaller than 5MB');
      return;
    }

    // Validate type
    if (!file.type.match('image.*')) {
      setImageError('Only JPEG, PNG, or WebP images are allowed');
      return;
    }

    setImageError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateLetterData({ photoUrl: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    updateLetterData({ photoUrl: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Recipient pin code checking
  const handlePinCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    updateRecipientData({ pinCode: pin });

    if (pin.length === 6) {
      const pinVal = validatePinCode(pin);
      if (pinVal.isValid) {
        const matchRes = await getStationByPinCode(pin);
        if (matchRes.success && matchRes.station) {
          const match = matchRes.station;
          setStationAvailable(match);
          updateRecipientData({ city: match.city, state: match.state });
          // Default to Pigeon if available and weather is safe
          if (weatherCondition === 'safe') {
            setDeliveryMethod('PIGEON');
          } else {
            setDeliveryMethod('EXPRESS');
          }
        } else {
          setStationAvailable(null);
          setDeliveryMethod('EXPRESS');
        }
        setErrors((prev) => ({ ...prev, pinCode: '' }));
      } else {
        setErrors((prev) => ({ ...prev, pinCode: pinVal.error || '' }));
      }
    } else {
      setStationAvailable(null);
    }
  };

  const validateRecipientStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (!recipientData.name.trim()) newErrors.name = 'Recipient name is required';
    if (!recipientData.address.trim()) newErrors.address = 'Recipient address is required';
    
    const phoneVal = validatePhoneNumber(recipientData.phone);
    if (!phoneVal.isValid) newErrors.phone = phoneVal.error || 'Invalid phone';
    
    const pinVal = validatePinCode(recipientData.pinCode);
    if (!pinVal.isValid) newErrors.pinCode = pinVal.error || 'Invalid PIN code';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleCheckoutSubmit = async () => {
    if (!validateRecipientStep()) {
      return;
    }
    
    setIsPaying(true);
    
    // Simulate Razorpay processing callback (2.5s delay)
    setTimeout(async () => {
      const totals = calculateTotal();
      const res = await createOrder(
        letterData,
        recipientData,
        deliveryMethod,
        giftOptions,
        totals.total,
        user ? user.id : null
      );

      setIsPaying(false);

      if (res.success && res.order) {
        setPaymentSuccess(true);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        
        // Redirect user to tracking page
        setTimeout(() => {
          router.push(`/track?id=${res.order.trackingId}`);
          resetLetterData();
        }, 3000);
      } else {
        alert(res.error || 'Failed to place order.');
      }
    }, 2500);
  };



  // Stationery Paper styles definitions
  const paperStylesConfig: Record<string, { bg: string; text: string; font: string; border: string }> = {
    'Classic': { bg: 'bg-[#faf7ef] parchment-texture', text: 'text-[#1a2a4a]', font: 'font-serif', border: 'border-parchment-300' },
    'Vintage': { bg: 'bg-[#f3ead3] parchment-texture-dark', text: 'text-parchment-900', font: 'font-vintage', border: 'border-[#bca57a]' },
    'Royal': { bg: 'bg-[#faf7ef] bg-gradient-to-br from-[#faf7ef] to-[#fbf9f0]', text: 'text-[#0f1b29]', font: 'font-serif', border: 'border-[6px] border-double border-[#cca662] p-4' },
    'Minimal': { bg: 'bg-white', text: 'text-neutral-800', font: 'font-sans', border: 'border border-neutral-200' },
    'Handmade': { bg: 'bg-[#fcfbf9] deckled-border', text: 'text-[#2a1d08]', font: 'font-serif', border: 'border-l-4 border-r-2 border-dashed border-[#cca662]/30 p-2' },
    'Festival': { bg: 'bg-[#fdf9f2] bg-gradient-to-r from-[#fdf9f2] via-[#fffcf0] to-[#fdf9f2]', text: 'text-[#501c0c]', font: 'font-serif', border: 'border-[4px] border-dotted border-terracotta-500 p-2' },
  };

  const selectedPaper = paperStylesConfig[letterData.paperStyle] || paperStylesConfig.Classic;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Wizard Steps indicator */}
      <div className="flex justify-between items-center mb-10 max-w-xl mx-auto border-b border-parchment-300 pb-4">
        {[
          { step: 1, key: 'occasion', label: 'Occasion' },
          { step: 2, key: 'write', label: 'Write' },
          { step: 3, key: 'personalize', label: 'Customize' },
          { step: 4, key: 'checkout', label: 'Send' }
        ].map((s) => (
          <button
            key={s.step}
            disabled={s.step > currentStep}
            onClick={() => setCurrentStep(s.step)}
            className={`flex flex-col items-center gap-1.5 focus:outline-none transition-all ${
              currentStep === s.step 
                ? 'text-terracotta-600 font-bold scale-105' 
                : currentStep > s.step 
                  ? 'text-phoenix-indigo/80 hover:text-phoenix-indigo' 
                  : 'text-parchment-800/40 cursor-not-allowed'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border font-bold ${
              currentStep === s.step 
                ? 'bg-terracotta-500 border-terracotta-600 text-white' 
                : currentStep > s.step 
                  ? 'bg-phoenix-indigo/10 border-phoenix-indigo/20 text-phoenix-indigo' 
                  : 'bg-transparent border-parchment-300 text-parchment-300'
            }`}>
              {currentStep > s.step ? <Check size={14} /> : s.step}
            </div>
            <span className="text-[10px] uppercase tracking-wider">{s.label}</span>
          </button>
        ))}
      </div>

      {paymentSuccess ? (
        <div className="max-w-md mx-auto text-center space-y-6 py-12 parchment-texture p-8 rounded-2xl shadow-xl border border-phoenix-gold">
          <div className="w-20 h-20 bg-phoenix-forest/10 border border-phoenix-forest/20 text-phoenix-forest rounded-full flex items-center justify-center mx-auto text-4xl">
            🕊️
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-phoenix-indigo">Pigeon Dispatched!</h2>
            <p className="text-sm text-parchment-800">
              Your message has been processed, printed, customized, and the delivery route has commenced.
            </p>
          </div>
          <div className="p-4 bg-parchment-200 rounded-lg border border-parchment-300 flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-phoenix-indigo" />
            <span className="text-xs font-semibold uppercase tracking-wider text-phoenix-indigo">Initializing tracking link...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Controls (steps) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Step 1: Occasion */}
            {activeTab === 'occasion' && (
              <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-phoenix-indigo">Choose Your Occasion</h2>
                  <p className="text-xs text-parchment-800">We will structure stationery motifs based on your choice.</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    'Love ❤️', 'Birthday 🎂', 'Anniversary 💍', 'Friendship 🤝', 
                    'Thank You 🙏', 'Congratulations 🎓', 'Apology 😔', 'Family  🏡',
                    'Long Distance ✈️', 'Festival 🪔', 'Just Because ✉️'
                  ].map((occ) => (
                    <button
                      key={occ}
                      onClick={() => handleOccasionSelect(occ.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim())}
                      className={`p-4 border rounded-xl font-serif text-sm transition-all hover:bg-parchment-200 ${
                        letterData.occasion === occ.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim()
                          ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700 font-bold'
                          : 'border-parchment-300 text-phoenix-indigo'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-parchment-300 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="vintage-btn font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-1"
                  >
                    Next Step <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Write Letter */}
            {activeTab === 'write' && (
              <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-phoenix-indigo">Write Your Scroll</h2>
                    <p className="text-xs text-parchment-800">Your text will render in real-time on the parchment preview.</p>
                  </div>
                  <button
                    onClick={() => setShowAiHelper(!showAiHelper)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-terracotta-500 to-phoenix-gold text-white text-xs font-bold shadow-sm"
                  >
                    <Sparkles size={14} />
                    Help me write
                  </button>
                </div>

                {/* AI Helper pane */}
                {showAiHelper && (
                  <div className="p-4 bg-terracotta-50 border border-terracotta-500/20 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">AI emotional assistant</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-phoenix-indigo mb-1">Tone</label>
                        <select
                          value={aiTone}
                          onChange={(e) => setAiTone(e.target.value)}
                          className="w-full bg-parchment-50 border border-parchment-300 text-xs px-2 py-1.5 rounded"
                        >
                          <option value="Heartfelt">Heartfelt</option>
                          <option value="Romantic">Romantic</option>
                          <option value="Funny">Funny</option>
                          <option value="Friendly">Friendly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-phoenix-indigo mb-1">Length</label>
                        <select
                          value={aiLength}
                          onChange={(e) => setAiLength(e.target.value)}
                          className="w-full bg-parchment-50 border border-parchment-300 text-xs px-2 py-1.5 rounded"
                        >
                          <option value="Medium">Medium</option>
                          <option value="Short">Short</option>
                          <option value="Long">Long</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-phoenix-indigo mb-1">Context Prompt (optional)</label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. mention our tea stall talks or how she always supports me when I fail..."
                        className="w-full bg-parchment-50 border border-parchment-300 text-xs px-3 py-2 rounded focus:outline-none"
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowAiHelper(false)}
                        className="px-3 py-1.5 text-xs text-parchment-800 hover:text-phoenix-indigo"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAIWrite}
                        disabled={generatingAi}
                        className="vintage-btn px-4 py-1.5 text-xs font-bold rounded flex items-center gap-1.5"
                      >
                        {generatingAi ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Drafting...
                          </>
                        ) : (
                          'Generate Draft'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Editor settings */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-parchment-300 pb-4">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">Font family</label>
                    <select
                      value={letterData.fontFamily}
                      onChange={(e) => updateLetterData({ fontFamily: e.target.value })}
                      className="w-full bg-parchment-50 border border-parchment-300 text-xs p-1.5 rounded font-semibold text-phoenix-indigo"
                    >
                      <option value="Classic">Classic Post</option>
                      <option value="Handwritten">Handwritten</option>
                      <option value="Elegant">Elegant</option>
                      <option value="Modern">Modern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">Size</label>
                    <select
                      value={letterData.fontSize}
                      onChange={(e) => updateLetterData({ fontSize: e.target.value })}
                      className="w-full bg-parchment-50 border border-parchment-300 text-xs p-1.5 rounded font-semibold text-phoenix-indigo"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Large">Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">Alignment</label>
                    <select
                      value={letterData.alignment}
                      onChange={(e) => updateLetterData({ alignment: e.target.value })}
                      className="w-full bg-parchment-50 border border-parchment-300 text-xs p-1.5 rounded font-semibold text-phoenix-indigo"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">Signature</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={letterData.signatureUrl || ''}
                      onChange={(e) => updateLetterData({ signatureUrl: e.target.value })}
                      className="w-full bg-parchment-50 border border-parchment-300 text-xs p-1.5 rounded font-semibold text-phoenix-indigo"
                    />
                  </div>
                </div>

                {/* Text Area */}
                <div className="space-y-1">
                  <textarea
                    value={letterData.content}
                    onChange={(e) => updateLetterData({ content: e.target.value })}
                    placeholder="Write your emotional story here..."
                    className="w-full min-h-[250px] p-4 bg-parchment-50 border border-parchment-300 rounded-xl focus:outline-none focus:border-terracotta-500 font-serif text-sm text-phoenix-indigo"
                  />
                  <div className="flex justify-between items-center text-[10px] text-parchment-800 font-semibold uppercase">
                    <span>Characters: {letterData.content.length}</span>
                    <span>Words: {letterData.content.split(/\s+/).filter(Boolean).length}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-parchment-300 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 text-xs font-semibold text-phoenix-indigo hover:text-terracotta-500 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={!letterData.content.trim()}
                    className="vintage-btn font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Styling <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Personalize Styling */}
            {activeTab === 'personalize' && (
              <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-phoenix-indigo">Customize Details</h2>
                  <p className="text-xs text-parchment-800">Select paper grades, envelope designs, and premium add-ons.</p>
                </div>

                {/* Paper Styles selection */}
                <div>
                  <span className="block text-xs font-bold text-phoenix-indigo uppercase tracking-wider mb-2">Paper Styling</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['Classic', 'Vintage', 'Royal', 'Minimal', 'Handmade', 'Festival'].map((p) => (
                      <button
                        key={p}
                        onClick={() => updateLetterData({ paperStyle: p })}
                        className={`p-3 border rounded-xl text-xs font-semibold transition-all ${
                          letterData.paperStyle === p
                            ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                            : 'border-parchment-300 text-parchment-900 hover:bg-parchment-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Envelope selection */}
                <div>
                  <span className="block text-xs font-bold text-phoenix-indigo uppercase tracking-wider mb-2">Envelope Seal Design</span>
                  <div className="grid grid-cols-4 gap-2">
                    {['Classic', 'Vintage', 'Premium', 'Custom'].map((e) => (
                      <button
                        key={e}
                        onClick={() => updateLetterData({ envelopeStyle: e })}
                        className={`p-2 border rounded-lg text-[10px] font-semibold transition-all ${
                          letterData.envelopeStyle === e
                            ? 'border-phoenix-indigo bg-phoenix-indigo/5 text-phoenix-indigo'
                            : 'border-parchment-300 text-parchment-900 hover:bg-parchment-200'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Handwriting toggle */}
                <div className="p-4 bg-parchment-50 border border-parchment-300 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-phoenix-indigo block">Realistic Handwriting Print</span>
                      <p className="text-[10px] text-parchment-800">Converts your typed content into realistic cursive ink.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={letterData.isHandwritten}
                        onChange={(e) => updateLetterData({ isHandwritten: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-parchment-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-terracotta-500"></div>
                    </label>
                  </div>

                  {letterData.isHandwritten && (
                    <div className="flex gap-2 pt-2 border-t border-parchment-300">
                      {['Classic Script', 'Bold Print', 'Flowing cursive'].map((hs) => (
                        <button
                          key={hs}
                          onClick={() => updateLetterData({ handwritingStyle: hs })}
                          className={`flex-grow p-1.5 border rounded text-[10px] font-semibold transition-all ${
                            letterData.handwritingStyle === hs
                              ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                              : 'border-parchment-300 text-parchment-800'
                          }`}
                        >
                          {hs}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Photo Upload validation */}
                <div className="p-4 bg-parchment-50 border border-parchment-300 rounded-xl space-y-3">
                  <div>
                    <span className="text-xs font-bold text-phoenix-indigo block">Attach Photograph Memory</span>
                    <p className="text-[10px] text-parchment-800">Your photo will be printed and enclosed inside the parchment scroll. (Max 5MB)</p>
                  </div>

                  {letterData.photoUrl ? (
                    <div className="flex items-center justify-between p-2 border border-phoenix-gold bg-parchment-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img
                          src={letterData.photoUrl}
                          className="w-10 h-10 object-cover rounded border border-parchment-300"
                          alt="Thumbnail"
                        />
                        <span className="text-xs text-phoenix-indigo font-semibold">Memory Attachment Added</span>
                      </div>
                      <button
                        onClick={removePhoto}
                        className="p-1.5 text-terracotta-600 hover:bg-terracotta-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 border border-dashed border-parchment-300 hover:border-terracotta-500 rounded-lg flex flex-col items-center justify-center text-xs text-parchment-800 gap-1.5 transition-all"
                      >
                        <Upload size={18} className="text-phoenix-gold-dark" />
                        <span>Select JPG/PNG Memory Photo</span>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        className="hidden"
                        accept="image/*"
                      />
                      {imageError && <p className="text-[10px] text-terracotta-600 font-semibold mt-1">{imageError}</p>}
                    </div>
                  )}
                </div>

                {/* Gift wrapping Add-on */}
                <div className="p-4 bg-parchment-50 border border-parchment-300 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-phoenix-indigo block flex items-center gap-1">
                        <Gift size={14} className="text-phoenix-gold-dark" />
                        Send as Premium Gift Experience
                      </span>
                      <p className="text-[10px] text-parchment-800">Add custom wraps and small non-restricted gift items (Free).</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={giftOptions.giftWrapping}
                        onChange={(e) => updateGiftOptions({ giftWrapping: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-parchment-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-terracotta-500"></div>
                    </label>
                  </div>

                  {giftOptions.giftWrapping && (
                    <div className="space-y-3 pt-3 border-t border-parchment-300">
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">Select Gift item</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { key: 'none', label: 'None' },
                            { key: 'rose', label: 'Fresh Rose (Free)' },
                            { key: 'perfume', label: 'Perfume (Free)' },
                            { key: 'mithai', label: 'Mithai (Free)' }
                          ].map((gift) => (
                            <button
                              key={gift.key}
                              type="button"
                              onClick={() => updateGiftOptions({ addon: gift.key as 'none' | 'rose' | 'perfume' | 'mithai' | 'rakhi' })}
                              className={`p-1.5 border rounded text-[8px] font-bold transition-all ${
                                giftOptions.addon === gift.key
                                  ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                                  : 'border-parchment-300 text-parchment-800 hover:bg-parchment-200'
                              }`}
                            >
                              {gift.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">Gift Card Message (Max 150 chars)</label>
                        <input
                          type="text"
                          value={giftOptions.giftMessage}
                          onChange={(e) => updateGiftOptions({ giftMessage: e.target.value.slice(0, 150) })}
                          placeholder="e.g. Happy Anniversary Mom & Dad! From Rohan."
                          className="w-full bg-parchment-50 border border-parchment-300 text-xs px-3 py-2 rounded focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-parchment-300 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 text-xs font-semibold text-phoenix-indigo hover:text-terracotta-500 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="vintage-btn font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-1"
                  >
                    Next: Delivery & Checkout <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Recipient Address & Checkout */}
            {activeTab === 'checkout' && (
              <div className="glass-parchment p-6 rounded-2xl border border-parchment-300 space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-phoenix-indigo">Recipient Details</h2>
                  <p className="text-xs text-parchment-800">Specify destination coordinates. PIN code determines carrier pigeon options.</p>
                </div>

                {/* Recipient form */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">Recipient full name</label>
                    <input
                      type="text"
                      value={recipientData.name}
                      onChange={(e) => updateRecipientData({ name: e.target.value })}
                      placeholder="Name of recipient"
                      className="w-full bg-parchment-50 border border-parchment-300 text-xs px-3 py-2 rounded-lg focus:outline-none"
                    />
                    {errors.name && <p className="text-[9px] text-terracotta-600 font-bold mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">PIN Code (Indian)</label>
                    <input
                      type="text"
                      value={recipientData.pinCode}
                      onChange={handlePinCodeChange}
                      placeholder="e.g. 500081 (Hyd)"
                      className="w-full bg-parchment-50 border border-parchment-300 text-xs px-3 py-2 rounded-lg focus:outline-none"
                    />
                    {errors.pinCode && <p className="text-[9px] text-terracotta-600 font-bold mt-1">{errors.pinCode}</p>}
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">Phone Number (10 digit)</label>
                    <input
                      type="text"
                      value={recipientData.phone}
                      onChange={(e) => updateRecipientData({ phone: e.target.value })}
                      placeholder="Contact number"
                      className="w-full bg-parchment-50 border border-parchment-300 text-xs px-3 py-2 rounded-lg focus:outline-none"
                    />
                    {errors.phone && <p className="text-[9px] text-terracotta-600 font-bold mt-1">{errors.phone}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">Physical Address</label>
                    <input
                      type="text"
                      value={recipientData.address}
                      onChange={(e) => updateRecipientData({ address: e.target.value })}
                      placeholder="House number, Street details"
                      className="w-full bg-parchment-50 border border-parchment-300 text-xs px-3 py-2 rounded-lg focus:outline-none"
                    />
                    {errors.address && <p className="text-[9px] text-terracotta-600 font-bold mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">City</label>
                    <input
                      type="text"
                      value={recipientData.city}
                      onChange={(e) => updateRecipientData({ city: e.target.value })}
                      className="w-full bg-parchment-100 border border-parchment-200 text-xs px-3 py-2 rounded-lg text-parchment-900 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-phoenix-gold-dark mb-1">State</label>
                    <input
                      type="text"
                      value={recipientData.state}
                      onChange={(e) => updateRecipientData({ state: e.target.value })}
                      className="w-full bg-parchment-100 border border-parchment-200 text-xs px-3 py-2 rounded-lg text-parchment-900 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                {/* Pin Code Alert Box */}
                {recipientData.pinCode.length === 6 && (
                  <div>
                    {stationAvailable ? (
                      <div className="p-3 bg-phoenix-forest/5 border border-phoenix-forest/20 text-phoenix-forest rounded-lg text-[10px] space-y-1">
                        <span className="font-bold flex items-center gap-1">🕊️ Pigeon Delivery Station Locked!</span>
                        <p className="leading-normal">
                          Served by {stationAvailable.stationName} (City: {stationAvailable.city}). Homing pigeon dispatch is fully operational.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-phoenix-indigo/5 border border-phoenix-indigo/25 text-phoenix-indigo rounded-lg text-[10px] space-y-1">
                        <span className="font-bold">🚚 Pigeon delivery out of range</span>
                        <p className="leading-normal">
                          This location will be served via Phoenix Express Ground Partner.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Delivery Options */}
                <div className="space-y-3">
                  <span className="block text-xs font-bold text-phoenix-indigo uppercase tracking-wider">Delivery Mode</span>
                  <div className="space-y-2">
                    {/* Pigeon */}
                    <label className={`flex items-start justify-between p-3 border rounded-xl cursor-pointer ${
                      deliveryMethod === 'PIGEON' ? 'border-terracotta-500 bg-terracotta-50/50' : 'border-parchment-300 hover:bg-parchment-200'
                    } ${(!stationAvailable || weatherCondition === 'suspended') ? 'opacity-40 cursor-not-allowed' : ''}`}>
                      <div className="flex gap-2">
                        <input
                          type="radio"
                          name="delivery_mode"
                          disabled={!stationAvailable || weatherCondition === 'suspended'}
                          checked={deliveryMethod === 'PIGEON'}
                          onChange={() => setDeliveryMethod('PIGEON')}
                          className="mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-bold text-phoenix-indigo block">Phoenix Pigeon Flight (Free)</span>
                          <p className="text-[9px] text-parchment-800">Delivered by homing pigeon in parchment harness. (Subject to weather)</p>
                          {weatherCondition === 'suspended' && (
                            <span className="text-[8px] font-bold text-terracotta-600 uppercase block mt-1">⚠️ Weather Suspended (Heavy rain/heat)</span>
                          )}
                        </div>
                      </div>
                    </label>

                    {/* Express */}
                    <label className={`flex items-start justify-between p-3 border rounded-xl cursor-pointer ${
                      deliveryMethod === 'EXPRESS' ? 'border-terracotta-500 bg-terracotta-50/50' : 'border-parchment-300 hover:bg-parchment-200'
                    }`}>
                      <div className="flex gap-2">
                        <input
                          type="radio"
                          name="delivery_mode"
                          checked={deliveryMethod === 'EXPRESS'}
                          onChange={() => setDeliveryMethod('EXPRESS')}
                          className="mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-bold text-phoenix-indigo block">Phoenix Express Ground Partner (Free)</span>
                          <p className="text-[9px] text-parchment-800">Delivered via vintage envelope container through express postal partners.</p>
                        </div>
                      </div>
                    </label>

                    {/* Digital */}
                    <label className={`flex items-start justify-between p-3 border rounded-xl cursor-pointer ${
                      deliveryMethod === 'DIGITAL' ? 'border-terracotta-500 bg-terracotta-50/50' : 'border-parchment-300 hover:bg-parchment-200'
                    }`}>
                      <div className="flex gap-2">
                        <input
                          type="radio"
                          name="delivery_mode"
                          checked={deliveryMethod === 'DIGITAL'}
                          onChange={() => setDeliveryMethod('DIGITAL')}
                          className="mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-bold text-phoenix-indigo block">Digital Scroll Only (Free)</span>
                          <p className="text-[9px] text-parchment-800">Recipient receives a beautiful email landing link to read the letter digitally.</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-parchment-300 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 text-xs font-semibold text-phoenix-indigo hover:text-terracotta-500 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                  <button
                    onClick={handleCheckoutSubmit}
                    disabled={isPaying}
                    className="vintage-btn font-bold px-8 py-3 rounded-lg text-sm flex items-center justify-center gap-2 flex-grow sm:flex-grow-0"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Preparing Dispatch...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Confirm & Dispatch (Free)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: Live Preview */}
          <div className="lg:col-span-6 sticky top-24">
            <div className="text-center mb-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-phoenix-gold-dark bg-phoenix-indigo/5 border border-phoenix-gold/25 px-3 py-1 rounded-full">
                Interactive Parchment preview
              </span>
            </div>

            {/* Simulated letter card */}
            <div className={`w-full p-8 shadow-xl min-h-[400px] border relative overflow-hidden transition-all duration-300 ${selectedPaper.bg} ${selectedPaper.border} ${selectedPaper.text}`}>
              {/* Burnt overlay for Vintage paper */}
              {letterData.paperStyle === 'Vintage' && (
                <div className="absolute inset-0 border-[12px] border-transparent border-image-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22none%22 stroke=%22%234a3116%22 stroke-width=%2210%22 opacity=%220.35%22 filter=%22blur%285px%29%22/%3E%3C/svg%3E')] opacity-75 pointer-events-none" />
              )}

              {/* Gold corners for Royal paper */}
              {letterData.paperStyle === 'Royal' && (
                <>
                  <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#cca662]" />
                  <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#cca662]" />
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#cca662]" />
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#cca662]" />
                </>
              )}

              {/* Postmark stamp simulation on top-right */}
              <div className="absolute top-4 right-4 w-12 h-14 border border-dashed border-phoenix-indigo/30 rounded flex flex-col items-center justify-center p-1 opacity-60">
                <span className="text-[6px] tracking-wide uppercase font-semibold">Phoenix</span>
                <span className="text-[8px] font-bold">FREE</span>
                <div className="w-5 h-5 rounded-full border border-dotted border-phoenix-indigo/30 my-0.5" />
              </div>

              {/* Envelope flap visual lines if Custom style */}
              <div className="space-y-4">
                <div className="border-b border-parchment-300 pb-3 flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest font-bold text-phoenix-indigo/60">
                    Occasion: {letterData.occasion}
                  </span>
                  <span className="text-[10px] font-mono text-terracotta-600 opacity-60">
                    {deliveryMethod === 'PIGEON' ? '🕊️ Pigeon post' : deliveryMethod === 'EXPRESS' ? '🚚 Express post' : '💻 Digital scroll'}
                  </span>
                </div>

                {/* Main letter content preview */}
                <div className={`whitespace-pre-line leading-relaxed min-h-[180px] ${
                  letterData.fontFamily === 'Handwritten' ? 'font-handwritten text-xl' :
                  letterData.fontFamily === 'Elegant' ? 'font-serif italic' :
                  letterData.fontFamily === 'Modern' ? 'font-sans text-xs' : 'font-serif'
                } ${
                  letterData.fontSize === 'Large' ? 'text-lg' : 'text-sm'
                } text-${letterData.alignment}`}>
                  {letterData.content || (
                    <span className="opacity-30 italic text-sm">Draft text will appear here as you type...</span>
                  )}
                </div>

                {/* Signature alignment */}
                {letterData.signatureUrl && (
                  <div className={`mt-8 text-${letterData.alignment} ${
                    letterData.fontFamily === 'Handwritten' ? 'font-handwritten text-2xl' : 'font-serif'
                  } font-semibold`}>
                    {letterData.signatureUrl}
                  </div>
                )}

                {/* Polaroid photo overlay inside the letter */}
                {letterData.photoUrl && (
                  <div className="mt-8 flex justify-center">
                    <div className="bg-white p-3 shadow-md border border-neutral-200 transform rotate-[2deg] max-w-[200px]">
                      <img
                        src={letterData.photoUrl}
                        className="w-full h-32 object-cover"
                        alt="Preview Memory"
                      />
                      <div className="text-center text-[10px] font-serif text-neutral-500 mt-2">
                        Memorandum
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wax Seal rendering */}
              <div className="absolute bottom-6 right-6 flex items-center gap-2">
                <span className="text-[8px] uppercase tracking-widest font-bold opacity-40">Sealed</span>
                <div className="w-8 h-8 rounded-full wax-seal" />
              </div>
            </div>

            {/* envelope layout indicator */}
            <div className="mt-4 p-4 rounded-xl bg-parchment-200 border border-parchment-300 text-[10px] flex items-center justify-between text-parchment-900">
              <div>
                <span className="font-bold">Envelope Outer Container:</span>
                <span className="ml-1 opacity-70">{letterData.envelopeStyle} Grade Paper</span>
              </div>
              <div>
                <span className="font-bold">Stamp Category:</span>
                <span className="ml-1 opacity-70">Vintage Homing Stamp</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
