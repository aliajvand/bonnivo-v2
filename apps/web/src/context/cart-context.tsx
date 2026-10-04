"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { CartItem, SplitShipment, OrderConfirmation } from "@/types/cart";
import { CatalogProduct, SellerOffer, ProductWeightVariant } from "@/types/catalog";
import { mockCatalogProducts } from "@/data/mock-catalog";
import { usePet } from "./pet-context";
import { useAuth } from "./auth-context";
import { fetchServerCart, syncServerCart, clearServerCart } from "@/lib/api/checkout";

interface CartContextType {
  items: CartItem[];
  itemsCount: number;
  subtotalToman: number;
  totalDiscountToman: number;
  payableGoodsTotalToman: number;
  shippingFeeToman: number;
  grandTotalToman: number;
  splitShipments: SplitShipment[];
  isAdding: boolean;
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

const LOCAL_STORAGE_KEY = "bonnivo_cart_v1";
const LOCAL_STORAGE_ORDER_KEY = "bonnivo_last_order_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { pets, activePet } = usePet();
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrderState] = useState<OrderConfirmation | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const lastAddRef = useRef<{ key: string; time: number }>({ key: "", time: 0 });

  // Sync with LocalStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
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

  // Fetch or sync server cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchServerCart().then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          const serverItems: CartItem[] = res.data.map((si) => ({
            id: si.id,
            productId: si.product_id,
            offerId: si.offer_id,
            titleFa: si.product_title,
            brand: si.brand || "Bonnivo",
            imageSrc: "/icons/food.svg",
            unitPriceToman: si.unit_price_tomans,
            quantity: si.quantity,
            sellerId: si.offer_id,
            sellerName: si.seller_name,
            leadTimeDays: si.lead_time_days,
            assignedPetId: si.pet_id || null,
          }));
          setItems(serverItems);
        } else if (items.length > 0) {
          syncServerCart(
            items.map((i) => ({
              offer_id: i.offerId || i.id,
              quantity: i.quantity,
              pet_id: i.assignedPetId || null,
            }))
          );
        }
      });
    }
  }, [isAuthenticated]);

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

  // Save to LocalStorage and sync to server whenever items change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Ignore quota
      }
      if (isAuthenticated) {
        const timer = setTimeout(() => {
          syncServerCart(
            items.map((i) => ({
              offer_id: i.offerId || i.id,
              quantity: i.quantity,
              pet_id: i.assignedPetId || null,
            }))
          );
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [items, isHydrated, isAuthenticated]);

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

  // Action: Add Item to Cart (with debounce and submission lock)
  const addItem = (
    product: CatalogProduct,
    offer?: SellerOffer,
    targetPetId?: string | null,
    selectedVariant?: ProductWeightVariant | null,
    quantity: number = 1
  ) => {
    const now = Date.now();
    const itemKey = `${product.id}-${offer?.sellerId || ""}-${selectedVariant?.labelFa || ""}`;
    if (lastAddRef.current.key === itemKey && now - lastAddRef.current.time < 500) {
      return; // Debounce rapid multi-clicks
    }
    lastAddRef.current = { key: itemKey, time: now };
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 400);

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
        offerId: selectedOffer.id || selectedOffer.sellerId,
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
    if (isAuthenticated) {
      clearServerCart();
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
        isAdding,
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
