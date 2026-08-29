'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPricing } from '@/lib/actions';

export interface User {
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
  id?: string;
}

export interface LetterData {
  occasion: string;
  content: string;
  fontFamily: string;
  fontSize: string;
  alignment: string;
  paperStyle: string;
  envelopeStyle: string;
  photoUrl: string | null;
  signatureUrl: string | null;
  isHandwritten: boolean;
  handwritingStyle: string;
}

export interface RecipientData {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface GiftOptions {
  giftWrapping: boolean;
  giftMessage: string;
  addon: 'none' | 'rose' | 'perfume' | 'mithai' | 'rakhi';
}

interface LetterContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  
  // Letter Wizard
  currentStep: number;
  setCurrentStep: (step: number) => void;
  letterData: LetterData;
  updateLetterData: (data: Partial<LetterData>) => void;
  resetLetterData: () => void;
  
  // Recipient Wizard
  recipientData: RecipientData;
  updateRecipientData: (data: Partial<RecipientData>) => void;
  
  // Checkout & Delivery Details
  deliveryMethod: 'PIGEON' | 'EXPRESS' | 'DIGITAL';
  setDeliveryMethod: (method: 'PIGEON' | 'EXPRESS' | 'DIGITAL') => void;
  giftOptions: GiftOptions;
  updateGiftOptions: (options: Partial<GiftOptions>) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  discountAmount: number;
  setDiscountAmount: (amount: number) => void;
  
  // Base Prices (in INR)
  prices: Record<string, number>;
  setPrices: (prices: Record<string, number>) => void;
  calculateTotal: () => { base: number; extras: number; discount: number; total: number };
}

const defaultLetterData: LetterData = {
  occasion: 'Love',
  content: '',
  fontFamily: 'Classic',
  fontSize: 'Normal',
  alignment: 'left',
  paperStyle: 'Classic',
  envelopeStyle: 'Classic',
  photoUrl: null,
  signatureUrl: null,
  isHandwritten: false,
  handwritingStyle: 'Classic Script',
};

const defaultRecipientData: RecipientData = {
  name: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pinCode: '',
};

const defaultGiftOptions: GiftOptions = {
  giftWrapping: false,
  giftMessage: '',
  addon: 'none',
};

const defaultPrices = {
  base_digital: 49,
  base_classic: 149,
  base_premium: 299,
  handwriting_service: 79,
  pigeon_delivery: 399,
  express_delivery: 99,
  gift_wrapping: 50,
  addon_rose: 100,
  addon_perfume: 250,
  addon_mithai: 150,
  addon_rakhi: 80,
};

const LetterContext = createContext<LetterContextType | undefined>(undefined);

export function LetterProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('phoenix_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          localStorage.removeItem('phoenix_user');
        }
      }
    }
    return null;
  });
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [letterData, setLetterData] = useState<LetterData>(defaultLetterData);
  const [recipientData, setRecipientData] = useState<RecipientData>(defaultRecipientData);
  const [deliveryMethod, setDeliveryMethod] = useState<'PIGEON' | 'EXPRESS' | 'DIGITAL'>('EXPRESS');
  const [giftOptions, setGiftOptions] = useState<GiftOptions>(defaultGiftOptions);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [prices, setPrices] = useState<Record<string, number>>(defaultPrices);

  // Fetch pricing config from database on mount
  useEffect(() => {
    async function loadPrices() {
      const dbPrices = await getPricing();
      if (dbPrices && Object.keys(dbPrices).length > 0) {
        setPrices((prev) => ({ ...prev, ...dbPrices }));
      }
    }
    loadPrices();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('phoenix_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('phoenix_user');
  };

  const updateLetterData = (data: Partial<LetterData>) => {
    setLetterData((prev) => ({ ...prev, ...data }));
  };

  const resetLetterData = () => {
    setLetterData(defaultLetterData);
    setRecipientData(defaultRecipientData);
    setDeliveryMethod('EXPRESS');
    setGiftOptions(defaultGiftOptions);
    setCouponCode('');
    setDiscountAmount(0);
    setCurrentStep(1);
  };

  const updateRecipientData = (data: Partial<RecipientData>) => {
    setRecipientData((prev) => ({ ...prev, ...data }));
  };

  const updateGiftOptions = (options: Partial<GiftOptions>) => {
    setGiftOptions((prev) => ({ ...prev, ...options }));
  };

  const calculateTotal = () => {
    return {
      base: 0,
      extras: 0,
      discount: 0,
      total: 0,
    };
  };

  return (
    <LetterContext.Provider
      value={{
        user,
        login,
        logout,
        currentStep,
        setCurrentStep,
        letterData,
        updateLetterData,
        resetLetterData,
        recipientData,
        updateRecipientData,
        deliveryMethod,
        setDeliveryMethod,
        giftOptions,
        updateGiftOptions,
        couponCode,
        setCouponCode,
        discountAmount,
        setDiscountAmount,
        prices,
        setPrices,
        calculateTotal,
      }}
    >
      {children}
    </LetterContext.Provider>
  );
}

export function useLetter() {
  const context = useContext(LetterContext);
  if (!context) {
    throw new Error('useLetter must be used within a LetterProvider');
  }
  return context;
}
