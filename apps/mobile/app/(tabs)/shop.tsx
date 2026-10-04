import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Search, Star, ShieldCheck, ShoppingBag, ChevronLeft } from "lucide-react-native";
import { useCartStore } from "../../src/stores/use-cart-store";

export default function MobileShopScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { items } = useCartStore();

  const products = [
    {
      id: "prod-rc-cat-adult",
      title: "غذای خشک گربه بالغ رویال کنین مدل فیت ۳۲",
      brand: "Royal Canin",
      price: "۲,۱۹۰,۰۰۰ تومان",
      originalPrice: "۲,۴۹۰,۰۰۰ تومان",
      rating: 4.8,
      seller: "پت‌شاپ نیاوران (Buy Box)",
      badge: "کمترین قیمت",
    },
    {
      id: "prod-purina-proplan-cat",
      title: "پورینا پروپلن عقیم‌شده ۱.۵ کیلوگرم",
      brand: "Purina Pro Plan",
      price: "۱,۸۹۰,۰۰۰ تومان",
      originalPrice: "۲,۱۵۰,۰۰۰ تومان",
      rating: 4.7,
      seller: "پت سنتر تهران",
      badge: "تخفیف ویژه",
    },
    {
      id: "prod-rc-mini-adult",
      title: "رویال کنین مینی ادالت ویژه سگ‌های نژاد کوچک",
      brand: "Royal Canin",
      price: "۲,۴۵۰,۰۰۰ تومان",
      originalPrice: "۲,۷۹۰,۰۰۰ تومان",
      rating: 4.9,
      seller: "رویال کنین لند",
      badge: "پرفروش",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header & Cart Badge */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>فروشگاه هوشمند بونیو</Text>
          <Text style={styles.subtitle}>تضمین کمترین قیمت در جعبه خرید (Buy Box)</Text>
        </View>

        <TouchableOpacity style={styles.cartBtn}>
          <ShoppingBag size={18} color="#ffffff" />
          {items.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{items.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={16} color="#64748b" />
        <TextInput
          placeholder="جستجو در محصولات، برندها و تشویقی..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Guarantee Pill */}
      <View style={styles.guaranteePill}>
        <ShieldCheck size={14} color="#10b981" />
        <Text style={styles.guaranteeText}>
          تمام سفارشات شامل ضمانت بازگشت وجه ۴ ساعته بونیو هستند.
        </Text>
      </View>

      {/* Product List */}
      <View style={styles.productList}>
        {products.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => router.push(`/product/${p.id}`)}
            style={styles.productCard}
          >
            <View style={styles.productHeader}>
              <View style={styles.brandBadge}>
                <Text style={styles.brandText}>{p.brand}</Text>
              </View>
              <View style={styles.ratingRow}>
                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingText}>{p.rating}</Text>
              </View>
            </View>

            <Text style={styles.pTitle}>{p.title}</Text>
            <Text style={styles.pSeller}>✓ {p.seller}</Text>

            <View style={styles.pFooter}>
              <View>
                <Text style={styles.pOldPrice}>{p.originalPrice}</Text>
                <Text style={styles.pPrice}>{p.price}</Text>
              </View>

              <View style={styles.viewBtn}>
                <Text style={styles.viewBtnText}>نمایش ۳۶۰°</Text>
                <ChevronLeft size={16} color="#10b981" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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
    paddingBottom: 110,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  cartBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 12,
    textAlign: "right",
  },
  guaranteePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  guaranteeText: {
    fontSize: 10,
    color: "#34d399",
    fontWeight: "500",
  },
  productList: {
    gap: 12,
  },
  productCard: {
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  brandBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  brandText: {
    fontSize: 9,
    color: "#cbd5e1",
    fontWeight: "bold",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 10,
    color: "#f59e0b",
    fontWeight: "bold",
  },
  pTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
    lineHeight: 18,
  },
  pSeller: {
    fontSize: 10,
    color: "#10b981",
    marginTop: 4,
  },
  pFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  pOldPrice: {
    fontSize: 10,
    color: "#64748b",
    textDecorationLine: "line-through",
  },
  pPrice: {
    fontSize: 13,
    fontWeight: "900",
    color: "#34d399",
  },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewBtnText: {
    fontSize: 11,
    color: "#10b981",
    fontWeight: "bold",
  },
});
