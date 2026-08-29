'use server';

import { db } from './db';
import { LetterData, RecipientData, GiftOptions } from '@/context/LetterContext';

// Helper to generate custom tracking ID
function generateTrackingId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PHX-IN-${year}-${random}`;
}

// 1. Authentication
export async function loginUser(email: string, passwordInput: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.password !== passwordInput) {
      return { success: false, error: 'Invalid password' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'Phoenix User',
        role: user.role as 'CUSTOMER' | 'ADMIN',
      },
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Database error' };
  }
}

// 2. Pricing & Coupons
export async function getPricing() {
  try {
    const pricing = await db.pricing.findMany();
    const pricesMap: Record<string, number> = {};
    pricing.forEach((item) => {
      pricesMap[item.itemKey] = item.priceInINR;
    });
    return pricesMap;
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return {};
  }
}

export async function validateCoupon(code: string, cartAmount: number) {
  try {
    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return { success: false, error: 'Invalid or inactive coupon code' };
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { success: false, error: 'Coupon has expired' };
    }

    if (cartAmount < coupon.minAmount) {
      return { success: false, error: `Minimum order amount of ₹${coupon.minAmount} required` };
    }

    return {
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { success: false, error: 'Database check failed' };
  }
}

// 3. System Settings & Weather Overrides
export async function getSystemSettings() {
  try {
    const settings = await db.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((item) => {
      settingsMap[item.key] = item.value;
    });
    return settingsMap;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}

export async function updateSystemSetting(key: string, value: string) {
  try {
    const setting = await db.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return { success: true, setting };
  } catch (error) {
    console.error('Error updating system setting:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Database error' };
  }
}

// 4. Stations & Pigeons
export async function getStations() {
  try {
    return await db.phoenixStation.findMany({
      include: {
        pigeons: true,
      },
    });
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
}

export async function getPigeons() {
  try {
    return await db.pigeon.findMany({
      include: {
        station: true,
      },
    });
  } catch (error) {
    console.error('Error fetching pigeons:', error);
    return [];
  }
}

export async function createPigeon(name: string, stationId: string) {
  try {
    const pigeon = await db.pigeon.create({
      data: {
        name,
        stationId,
        status: 'AVAILABLE',
        healthStatus: 'Excellent',
        maxRangeKm: 25.0,
      },
    });
    return { success: true, pigeon };
  } catch (error) {
    console.error('Error creating pigeon:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Database error' };
  }
}

// Check station by pincode dynamically
export async function getStationByPinCode(pinCode: string) {
  try {
    const stations = await db.phoenixStation.findMany({
      where: { isActive: true },
    });

    for (const station of stations) {
      const pinCodesList = station.pinCodes.split(',').map((p) => p.trim());
      if (pinCodesList.includes(pinCode.trim())) {
        return {
          success: true,
          station: {
            stationId: station.id,
            stationName: station.name,
            city: station.city,
            state: station.state,
          },
        };
      }
    }

    return { success: false, error: 'Area not served by homing pigeons' };
  } catch (error) {
    console.error('Error checking pincode station:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Database error' };
  }
}

// 5. Orders & Tracking
export async function getOrders(userId?: string, role?: 'CUSTOMER' | 'ADMIN') {
  try {
    if (role === 'ADMIN') {
      return await db.order.findMany({
        include: {
          letter: true,
          pigeon: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (userId) {
      return await db.order.findMany({
        where: { userId },
        include: {
          letter: true,
          pigeon: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function getOrderByTrackingId(trackingId: string) {
  try {
    const order = await db.order.findUnique({
      where: { trackingId: trackingId.trim().toUpperCase() },
      include: {
        letter: true,
        pigeon: true,
        trackingEvents: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    return order;
  } catch (error) {
    console.error('Error fetching order by tracking ID:', error);
    return null;
  }
}

const STATUS_EVENT_CONFIGS: Record<string, { title: string; description: string }> = {
  'PENDING': { title: 'Order Received', description: 'The order has been received at the dispatch hub.' },
  'PREPARING': { title: 'Preparing Scroll', description: 'Printing on chosen parchment grade.' },
  'PERSONALIZED': { title: 'Personalization Done', description: 'Photo enclosed and custom wax-seal applied.' },
  'READY_FOR_DISPATCH': { title: 'Ready for Dispatch', description: 'Secure harness check complete.' },
  'ASSIGNED': { title: 'Phoenix Assigned', description: 'Messenger pigeon assigned to coordinates.' },
  'FLYING': { title: 'Journey Started', description: 'The bird is in flight carrying your letter.' },
  'OUT_FOR_DELIVERY': { title: 'Out for Delivery', description: 'Pigeon has reached local hub and is descending.' },
  'DELIVERED': { title: 'Delivered', description: 'Your message has arrived at destination coordinates.' },
  'FAILED': { title: 'Flight Aborted', description: 'Weather suspension or visibility issue forced grounding.' },
};

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const eventConfig = STATUS_EVENT_CONFIGS[status] || {
      title: `Status Changed to ${status}`,
      description: 'Order status updated by system operations.',
    };

    // Update order status
    const order = await db.order.update({
      where: { id: orderId },
      data: {
        status,
        trackingEvents: {
          create: {
            status,
            title: eventConfig.title,
            description: eventConfig.description,
          },
        },
      },
    });

    return { success: true, order };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Database error' };
  }
}

export async function createOrder(
  letterInput: LetterData,
  recipientInput: RecipientData,
  deliveryMethod: 'PIGEON' | 'EXPRESS' | 'DIGITAL',
  giftOptions: GiftOptions,
  totalAmount: number,
  userId?: string | null
) {
  try {
    // 1. Create the Letter
    const letter = await db.letter.create({
      data: {
        userId: userId || null,
        occasion: letterInput.occasion,
        content: letterInput.content,
        fontFamily: letterInput.fontFamily,
        fontSize: letterInput.fontSize,
        alignment: letterInput.alignment,
        paperStyle: letterInput.paperStyle,
        envelopeStyle: letterInput.envelopeStyle,
        photoUrl: letterInput.photoUrl,
        signatureUrl: letterInput.signatureUrl,
        isHandwritten: letterInput.isHandwritten,
        handwritingStyle: letterInput.handwritingStyle,
      },
    });

    // 2. Match Pigeon if needed
    let assignedPigeonId: string | null = null;
    if (deliveryMethod === 'PIGEON') {
      const stationCheck = await getStationByPinCode(recipientInput.pinCode);
      if (stationCheck.success && stationCheck.station) {
        // Query for an available pigeon at this station
        const pigeon = await db.pigeon.findFirst({
          where: {
            stationId: stationCheck.station.stationId,
            status: 'AVAILABLE',
          },
        });

        if (pigeon) {
          assignedPigeonId = pigeon.id;
          // Optionally mark the pigeon as ASSIGNED
          await db.pigeon.update({
            where: { id: pigeon.id },
            data: { status: 'ASSIGNED' },
          });
        } else {
          // If no available pigeon, pick any pigeon at that station as fallback
          const anyPigeon = await db.pigeon.findFirst({
            where: { stationId: stationCheck.station.stationId },
          });
          if (anyPigeon) {
            assignedPigeonId = anyPigeon.id;
          }
        }
      }
    }

    // 3. Create the Order
    const trackingId = generateTrackingId();
    const initialStatus = deliveryMethod === 'DIGITAL' ? 'DELIVERED' : 'PENDING';

    const order = await db.order.create({
      data: {
        trackingId,
        userId: userId || null,
        letterId: letter.id,
        recipientName: recipientInput.name,
        recipientPhone: recipientInput.phone,
        recipientAddress: recipientInput.address,
        recipientCity: recipientInput.city,
        recipientState: recipientInput.state,
        recipientPinCode: recipientInput.pinCode,
        deliveryMethod,
        giftWrapping: giftOptions.giftWrapping,
        giftMessage: giftOptions.giftMessage || null,
        totalAmount,
        status: initialStatus,
        pigeonId: assignedPigeonId,
        trackingEvents: {
          create: {
            status: initialStatus,
            title: STATUS_EVENT_CONFIGS[initialStatus].title,
            description: STATUS_EVENT_CONFIGS[initialStatus].description,
          },
        },
      },
      include: {
        pigeon: true,
      },
    });

    return { success: true, order };
  } catch (error) {
    console.error('Error creating order in DB:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to place order' };
  }
}
