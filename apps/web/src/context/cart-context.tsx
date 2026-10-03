"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { CartItem, SplitShipment, OrderConfirmation } from "@/types/cart";
import { CatalogProduct, SellerOffer, ProductWeightVariant } from "@/types/catalog";
import { mockCatalogProducts } from "@/data/mock-catalog";
import { usePet } from "./pet-context";

interface CartContextType {
  items: CartItem[];
  itemsCount: number;
  subtotalToman: number;
  totalDiscountToman: number;
  payableGoodsTotalToman: number;
  shippingFeeToman: number;
  grandTotalToman: number;
  splitShipments: SplitShipment[];
  addItem: (
    product: CatalogProduct,
    offer?: SellerOffer,
    targetPetId?: string | null,
    selectedVariant?: ProductWeightVariant | null,
    quantity?: number
  ) => void;
  buyAgain: (productId: string, targetPetId?: string | null) => { success: boolean; message: string };
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  assignPetToItem: (itemId: string, petId: string | null) => void;
  clearCart: () => void;
  lastOrder: OrderConfirmation | null;
  setLastOrder: (order: OrderConfirmation | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Initial mock items matching the reference image ("Your Cart (3 items)")
const initialSeedCartItems: CartItem[] = [
  {
    id: "cart-item-1",
    productId: "prod-rc-adult-cat",
    titleFa: "غذای خشک گربه رویال کنین مدل ادالت فیت ۲ کیلوگرم",
    brand: "Royal Canin",
    imageSrc: "/icons/food.svg",
    unitPriceToman: 2490000,
    discountedPriceToman: 2290000,
    quantity: 1,
    sellerId: "seller-1",
    sellerName: "فروشگاه رویال پت (برنده بای‌باکس)",
    leadTimeDays: 0,
    assignedPetId: "pet-barfi",
    assignedPetName: "برفی",
    assignedPetAvatar: "/icons/cat.svg",
  },
  {
    id: "cart-item-2",
    productId: "prod-cat-treats",
    titleFa: "تشویقی مدادی گربه وینستون با طعم مرغ و پنیر",
    brand: "Winston",
    imageSrc: "/icons/toys.svg",
    unitPriceToman: 590000,
    discountedPriceToman: undefined,
    quantity: 2,
    sellerId: "seller-1",
    sellerName: "فروشگاه رویال پت (برنده بای‌باکس)",
    leadTimeDays: 0,
    assignedPetId: "pet-barfi",
    assignedPetName: "برفی",
    assignedPetAvatar: "/icons/cat.svg",
  },
  {
    id: "cart-item-3",
    productId: "prod-pet-toy-ball",
    titleFa: "توپ تعاملی و صدادار مناسب سگ و گربه",
    brand: "Petstages",
    imageSrc: "/icons/toys.svg",
    unitPriceToman: 950000,
    discountedPriceToman: 820000,
    quantity: 1,
    sellerId: "seller-2",
    sellerName: "پت سنتر ونک (ارسال مستقیم)",
    leadTimeDays: 1,
    assignedPetId: "pet-milo",
    assignedPetName: "میلو",
    assignedPetAvatar: "/icons/dog.svg",
  },
];

const LOCAL_STORAGE_KEY = "bonnivo_cart_v1";
const LOCAL_STORAGE_ORDER_KEY = "bonnivo_last_order_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { pets, activePet } = usePet();
  const [items, setItems] = useState<CartItem[]>(initialSeedCartItems);
  const [lastOrder, setLastOrderState] = useState<OrderConfirmation | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync with LocalStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
      const savedOrder = localStorage.getItem(LOCAL_STORAGE_ORDER_KEY);
      if (savedOrder) {
        setLastOrderState(JSON.parse(savedOrder));
      }
    } catch {
      // Ignore fallback
    }
    setIsHydrated(true);
  }, []);

  const setLastOrder = (order: OrderConfirmation | null) => {
    setLastOrderState(order);
    try {
      if (order) {
        localStorage.setItem(LOCAL_STORAGE_ORDER_KEY, JSON.stringify(order));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_ORDER_KEY);
      }
    } catch {
      // Ignore storage error
    }
  };

  // Save to LocalStorage whenever items change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Ignore quota
      }
    }
  }, [items, isHydrated]);

  // Aggregate quantity
  const itemsCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  // Financial calculations
  const subtotalToman = useMemo(() => {
    return items.reduce((sum, item) => sum + item.unitPriceToman * item.quantity, 0);
  }, [items]);

  const payableGoodsTotalToman = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.discountedPriceToman || item.unitPriceToman;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  const totalDiscountToman = useMemo(() => {
    return Math.max(0, subtotalToman - payableGoodsTotalToman);
  }, [subtotalToman, payableGoodsTotalToman]);

  // Shipping Fee: Free if goods total > 1,500,000 Toman, else 45,000 Toman
  const shippingFeeToman = useMemo(() => {
    if (items.length === 0) return 0;
    return payableGoodsTotalToman >= 1500000 ? 0 : 45000;
  }, [items.length, payableGoodsTotalToman]);

  const grandTotalToman = useMemo(() => {
    return payableGoodsTotalToman + shippingFeeToman;
  }, [payableGoodsTotalToman, shippingFeeToman]);

  // Split Shipments calculation (grouping by sellerId)
  const splitShipments = useMemo<SplitShipment[]>(() => {
    const sellerMap = new Map<string, CartItem[]>();

    items.forEach((item) => {
      const existing = sellerMap.get(item.sellerId) || [];
      sellerMap.set(item.sellerId, [...existing, item]);
    });

    let packageIndex = 1;
    const shipments: SplitShipment[] = [];

    sellerMap.forEach((sellerItems, sellerId) => {
      const sellerName = sellerItems[0]?.sellerName || "تأمین‌کننده بونیو";
      const maxLead = Math.max(...sellerItems.map((i) => i.leadTimeDays || 0));
      const deliveryText = maxLead === 0 ? "آماده ارسال با پیک فوری تهران (امروز/فردا)" : `آماده ارسال طی ${maxLead + 1} روز کاری`;

      shipments.push({
        sellerId,
        sellerName,
        items: sellerItems,
        packageNumber: packageIndex++,
        estimatedDeliveryText: deliveryText,
        shippingFeeToman: 0, // Absorbed in overall checkout fee
      });
    });

    return shipments;
  }, [items]);

  // Action: Add Item to Cart
  const addItem = (
    product: CatalogProduct,
    offer?: SellerOffer,
    targetPetId?: string | null,
    selectedVariant?: ProductWeightVariant | null,
    quantity: number = 1
  ) => {
    const selectedOffer = offer || product.buyBoxOffer;
    const petId = targetPetId !== undefined ? targetPetId : (activePet ? activePet.id : null);
    const pet = petId ? pets.find((p) => p.id === petId) : null;
    const variantWeight = selectedVariant?.labelFa || product.weightText;
    const unitPrice = selectedVariant ? selectedVariant.priceToman : selectedOffer.priceToman;
    const discountedPrice = selectedVariant
      ? selectedVariant.discountedPriceToman
      : selectedOffer.discountedPriceToman;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === product.id &&
          i.sellerId === selectedOffer.sellerId &&
          i.assignedPetId === petId &&
          i.selectedWeightText === variantWeight
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += Math.max(1, quantity);
        return copy;
      }

      const newItem: CartItem = {
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        titleFa: product.titleFa,
        brand: product.brand,
        imageSrc: product.imageSrc,
        unitPriceToman: unitPrice,
        discountedPriceToman: discountedPrice,
        quantity: Math.max(1, quantity),
        sellerId: selectedOffer.sellerId,
        sellerName: selectedOffer.storeNameFa,
        leadTimeDays: Math.ceil((selectedOffer.leadTimeHours || 0) / 24),
        assignedPetId: petId,
        assignedPetName: pet ? pet.name : undefined,
        assignedPetAvatar: pet ? pet.avatarUrl : undefined,
        selectedWeightText: variantWeight,
        offerId: selectedOffer.id,
      };

      return [newItem, ...prev];
    });
  };

  // Action: Smart Buy Again (resolves product, active pet, merges with cart)
  const buyAgain = (productId: string, targetPetId?: string | null): { success: boolean; message: string } => {
    const product = mockCatalogProducts.find((p) => p.id === productId);
    if (!product) {
      return { success: false, message: "کالای مورد نظر در کاتالوگ جاری یافت نشد." };
    }

    if (!product.isAvailable) {
      return { success: false, message: `متأسفانه «${product.titleFa}» در حال حاضر ناموجود است.` };
    }

    addItem(product, product.buyBoxOffer, targetPetId);
    return { success: true, message: `«${product.titleFa}» با قیمت روز به سبد خرید اضافه شد ✓` };
  };

  // Action: Remove Item
  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Action: Update Quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
    );
  };

  // Action: Assign Pet to Cart Item
  const assignPetToItem = (itemId: string, petId: string | null) => {
    const pet = petId ? pets.find((p) => p.id === petId) : null;
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              assignedPetId: petId,
              assignedPetName: pet ? pet.name : undefined,
              assignedPetAvatar: pet ? pet.avatarUrl : undefined,
            }
          : i
      )
    );
  };

  // Action: Clear Cart
  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemsCount,
        subtotalToman,
        totalDiscountToman,
        payableGoodsTotalToman,
        shippingFeeToman,
        grandTotalToman,
        splitShipments,
        addItem,
        buyAgain,
        removeItem,
        updateQuantity,
        assignPetToItem,
        clearCart,
        lastOrder,
        setLastOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
