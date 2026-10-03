import { CatalogProduct, SellerOffer } from "./catalog";

export interface CartItem {
  id: string;
  productId: string;
  titleFa: string;
  brand: string;
  imageSrc: string;
  unitPriceToman: number;
  discountedPriceToman?: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
  leadTimeDays: number;
  assignedPetId: string | null; // null represents general / unassigned purchase
  assignedPetName?: string;
  assignedPetAvatar?: string;
  selectedWeightText?: string;
  offerId?: string;
}

export interface SplitShipment {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  packageNumber: number;
  estimatedDeliveryText: string;
  shippingFeeToman: number;
}

export interface DeliveryTimeslot {
  id: string;
  dateStr: string; // e.g., "۱۴۰۳/۰۷/۱۰"
  dayName: string; // e.g., "فردا (پنج‌شنبه)"
  shift: "MORNING" | "AFTERNOON" | "EVENING";
  shiftLabel: string; // e.g., "شیفت عصر (۱۴ الی ۱۸)"
  isAvailable: boolean;
}

export interface CheckoutFormData {
  fullName: string;
  phoneNumber: string;
  city: string;
  district: string;
  address: string;
  unit?: string;
  postalCode?: string;
  deliveryNotes?: string;
  timeslotId: string;
  paymentMethod: "ZARINPAL_IPG" | "SNAP_PAY" | "WALLET";
}

export interface OrderConfirmation {
  orderId: string;
  orderNumber: string; // e.g. BNY-849201
  createdAt: string;
  items: CartItem[];
  subtotalToman: number;
  discountToman: number;
  shippingFeeToman: number;
  totalPaidToman: number;
  deliveryDateStr: string;
  deliveryShiftLabel: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  splitShipments: SplitShipment[];
  paymentStatus: "paid" | "pending_payment" | "payment_failed" | "cancelled";
  fulfillmentStage?: number; // 1 to 6
  beneficiaryPets: {
    petId: string;
    petName: string;
    petAvatar: string;
    itemsCount: number;
  }[];
}

