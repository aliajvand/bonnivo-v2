import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight, Star, Box, ShoppingBag, ShieldCheck, Truck, Plus, Minus, Check } from "lucide-react-native";
import { useCartStore } from "../../src/stores/use-cart-store";

export default function MobileProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addItem } = useCartStore();

  const [is3DMode, setIs3DMode] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("۲ کیلوگرم");
  const [showAddedToast, setShowAddedToast] = useState(false);

  const productData = {
    id: id as string,
    brand: "Royal Canin",
    title: "Royal Canin Adult Cat Food",
    titleFa: "غذای خشک گربه بالغ رویال کنین مدل فیت ۳۲",
    priceToman: 2190000,
    priceDisplay: "۲,۱۹۰,۰۰۰ تومان",
    rating: 4.8,
    seller: "پت‌شاپ نیاوران (بهترین قیمت)",
    descriptionFa:
      "تأمین کامل نیازهای تغذیه‌ای گربه‌های بالغ، حفظ وزن ایده‌آل و ارتقای سلامت دستگاه ادراری با پروتئین مرغوب L.I.P.",
    variants: ["۲ کیلوگرم", "۴ کیلوگرم", "۱۰ کیلوگرم"],
  };

  const handleAddToCart = () => {
    addItem({
      id: `${productData.id}-${selectedVariant}`,
      productId: productData.id,
      title: productData.titleFa,
      priceToman: productData.priceToman,
      quantity,
      sellerName: productData.seller,
      variantLabel: selectedVariant,
    });

    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2500);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowRight size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>جزئیات محصول</Text>
          <TouchableOpacity onPress={() => router.push("/shop")} style={styles.cartBtn}>
            <ShoppingBag size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* 3D Pedestal Stage (Direct Reference Image Replication) */}
        <View style={styles.pedestalStage}>
          {/* 3D / 360 Mode Button */}
          <TouchableOpacity
            onPress={() => setIs3DMode(!is3DMode)}
            style={styles.mode3dBtn}
          >
            <Box size={14} color="#10b981" />
            <Text style={styles.mode3dText}>
              {is3DMode ? "3D / 360° Drag to rotate" : "عکس دو بعدی"}
            </Text>
          </TouchableOpacity>

          {/* Floating Price Pill */}
          <View style={styles.floatingPriceBadge}>
            <Text style={styles.floatingPriceText}>{productData.priceDisplay}</Text>
          </View>

          {/* Floating Rating Badge */}
          <View style={styles.floatingRatingBadge}>
            <Star size={12} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.floatingRatingText}>{productData.rating} ★</Text>
          </View>

          {/* Floating Quantity Indicator */}
          <View style={styles.floatingQtyBadge}>
            <Text style={styles.floatingQtyText}>تعداد: {quantity}</Text>
          </View>

          {/* Pedestal Surface and Product Packaging */}
          <View style={styles.pedestalCenter}>
            {/* Cylindrical Stone Pedestal */}
            <View style={styles.stonePedestalDisc}>
              <View style={styles.stonePedestalInner} />
            </View>

            {/* Product Bag on Pedestal */}
            <View style={styles.productBagContainer}>
              <Text style={{ fontSize: 10, color: "#f59e0b", fontWeight: "bold" }}>ROYAL CANIN</Text>
              <Text style={{ fontSize: 44, marginVertical: 4 }}>🐱</Text>
              <Text style={{ fontSize: 11, fontWeight: "bold", color: "#ffffff", textAlign: "center" }}>
                Adult Cat Food
              </Text>
              <Text style={{ fontSize: 9, color: "#94a3b8" }}>{selectedVariant}</Text>
            </View>

            {/* 360 Rotation Arc Arrows */}
            {is3DMode && (
              <View style={styles.rotationIndicators}>
                <Text style={styles.rotationArrow}>↺</Text>
                <Text style={styles.rotationLabel}>۳۶۰° قابلیت چرخش لمسی</Text>
                <Text style={styles.rotationArrow}>↻</Text>
              </View>
            )}
          </View>
        </View>

        {/* Product Details Section */}
        <View style={styles.detailsCard}>
          <Text style={styles.productEnglishTitle}>{productData.title}</Text>
          <Text style={styles.productPersianTitle}>{productData.titleFa}</Text>
          <Text style={styles.productDesc}>{productData.descriptionFa}</Text>

          {/* Variant Selector */}
          <Text style={styles.variantLabel}>وزن بسته:</Text>
          <View style={styles.variantRow}>
            {productData.variants.map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => setSelectedVariant(v)}
                style={[
                  styles.variantChip,
                  selectedVariant === v && styles.variantChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.variantChipText,
                    selectedVariant === v && styles.variantChipTextActive,
                  ]}
                >
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Seller & Guarantee Box */}
          <View style={styles.sellerBox}>
            <View style={styles.sellerRow}>
              <Truck size={14} color="#10b981" />
              <Text style={styles.sellerText}>فروشنده انتخابی: {productData.seller}</Text>
            </View>
            <View style={styles.sellerRow}>
              <ShieldCheck size={14} color="#2563eb" />
              <Text style={[styles.sellerText, { color: "#60a5fa" }]}>
                ضمانت بازگشت وجه ۴ ساعته بونیو
              </Text>
            </View>
          </View>

          {/* Quantity Controls */}
          <View style={styles.qtyControlRow}>
            <Text style={styles.qtyLabel}>تعداد سفارش:</Text>
            <View style={styles.qtyCounter}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.qtyBtn}
              >
                <Minus size={14} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={styles.qtyBtn}
              >
                <Plus size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Add-to-Cart Bar (Reference Image Style) */}
      <View style={styles.bottomBar}>
        {showAddedToast && (
          <View style={styles.toastNotice}>
            <Check size={14} color="#ffffff" />
            <Text style={styles.toastText}>محصول به سبد خرید افزوده شد!</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleAddToCart}
          style={styles.addToCartButton}
          activeOpacity={0.85}
        >
          <ShoppingBag size={18} color="#ffffff" />
          <Text style={styles.addToCartButtonText}>Add to Cart • افزودن به سبد</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d16",
  },
  content: {
    padding: 16,
    paddingTop: 48,
    paddingBottom: 120,
  },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  cartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  pedestalStage: {
    height: 330,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 20,
  },
  mode3dBtn: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    zIndex: 10,
  },
  mode3dText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "bold",
  },
  floatingPriceBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#10b981",
    zIndex: 10,
  },
  floatingPriceText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#34d399",
    fontFamily: "monospace",
  },
  floatingRatingBadge: {
    position: "absolute",
    top: 50,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  floatingRatingText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "bold",
  },
  floatingQtyBadge: {
    position: "absolute",
    top: 86,
    right: 14,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    zIndex: 10,
  },
  floatingQtyText: {
    fontSize: 9,
    color: "#94a3b8",
  },
  pedestalCenter: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  stonePedestalDisc: {
    position: "absolute",
    bottom: -25,
    width: 200,
    height: 60,
    borderRadius: 100,
    backgroundColor: "#334155",
    borderWidth: 2,
    borderColor: "#475569",
    alignItems: "center",
    justifyContent: "center",
  },
  stonePedestalInner: {
    width: 180,
    height: 48,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  productBagContainer: {
    width: 130,
    height: 160,
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  rotationIndicators: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  rotationArrow: {
    fontSize: 16,
    color: "#10b981",
  },
  rotationLabel: {
    fontSize: 10,
    color: "#94a3b8",
  },
  detailsCard: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  productEnglishTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  productPersianTitle: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "bold",
    marginTop: 4,
  },
  productDesc: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 18,
    marginTop: 8,
  },
  variantLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 14,
    marginBottom: 6,
  },
  variantRow: {
    flexDirection: "row",
    gap: 8,
  },
  variantChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  variantChipActive: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: "#10b981",
  },
  variantChipText: {
    fontSize: 11,
    color: "#94a3b8",
  },
  variantChipTextActive: {
    color: "#34d399",
    fontWeight: "bold",
  },
  sellerBox: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sellerText: {
    fontSize: 10,
    color: "#cbd5e1",
    fontWeight: "500",
  },
  qtyControlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  qtyLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  qtyCounter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    padding: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyVal: {
    width: 32,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(9, 13, 22, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  toastNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#10b981",
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  toastText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  addToCartButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
});
