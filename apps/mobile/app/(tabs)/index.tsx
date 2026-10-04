import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { usePetStore } from "../../src/stores/use-pet-store";
import { useAuthStore } from "../../src/stores/use-auth-store";
import { Sparkles, ShoppingBag, ShieldCheck, HeartHandshake, ChevronLeft } from "lucide-react-native";

export default function MobileHomeScreen() {
  const router = useRouter();
  const { pets, activePetId, selectPet, careTasks } = usePetStore();
  const { currentRole } = useAuthStore();

  const activePet = pets.find((p) => p.id === activePetId) || pets[0];
  const pendingTasks = careTasks.filter((t) => !t.completed).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerBrand}>بونیو • BONYO</Text>
          <Text style={styles.headerSubtitle}>
            همراه هوشمند زندگی {activePet?.name || "پت شما"}
          </Text>
        </View>

        {/* Pet Switcher Avatars */}
        <View style={styles.petSwitcherRow}>
          {pets.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => selectPet(p.id)}
              style={[
                styles.petPill,
                p.id === activePetId && styles.petPillActive,
              ]}
            >
              <Text style={styles.petPillText}>{p.species === "DOG" ? "🐶" : "🐱"} {p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 3D Floating Island Hero Banner (Reference Image Theme) */}
      <View style={styles.islandBanner}>
        <View style={styles.islandBadgeRow}>
          <View style={styles.islandBadge}>
            <Sparkles size={12} color="#10b981" />
            <Text style={styles.islandBadgeText}>جزیره ۳ بعدی بونیو</Text>
          </View>
          <Text style={styles.islandRoleText}>نقش: {currentRole}</Text>
        </View>

        <Text style={styles.islandTitle}>اکوسیستم یکپارچه مراقبت و خرید</Text>
        <Text style={styles.islandDesc}>
          دسترسی فوری به خدمات دامپزشکی، دوره‌های مربیگری، رویدادها و تضمین بازگشت وجه ۴ ساعته.
        </Text>

        {/* Quick Category Icons Row */}
        <View style={styles.categoryRow}>
          {[
            { title: "سگ‌ها", emoji: "🐶" },
            { title: "گربه‌ها", emoji: "🐱" },
            { title: "سلامت", emoji: "💊" },
            { title: "غذا", emoji: "🍖" },
            { title: "بازی", emoji: "🎾" },
          ].map((cat, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => router.push("/shop")}
              style={styles.categoryItem}
            >
              <View style={styles.categoryIconCircle}>
                <Text style={{ fontSize: 18 }}>{cat.emoji}</Text>
              </View>
              <Text style={styles.categoryLabel}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Daily Routine Snapshot */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>مراقبت امروز (Today)</Text>
          <TouchableOpacity onPress={() => router.push("/care")}>
            <Text style={styles.sectionLink}>مشاهده همه</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionDesc}>
          {pendingTasks > 0
            ? `${pendingTasks} وظیفه برای سلامت ${activePet?.name} باقی‌مانده است.`
            : "تمام وظایف روزانه با موفقیت انجام شد! 🎉"}
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/care")}
          style={styles.actionButton}
        >
          <HeartHandshake size={16} color="#ffffff" />
          <Text style={styles.actionButtonText}>ثبت فعالیت‌های روزانه</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Buy Box Product Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>پیشنهاد ویژه جعبه خرید (Buy Box)</Text>
          <View style={styles.guaranteeTag}>
            <ShieldCheck size={12} color="#2563eb" />
            <Text style={styles.guaranteeText}>ضمانت ۴ ساعته</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/product/prod-rc-cat-adult")}
          style={styles.productRow}
        >
          <View style={styles.productAvatar}>
            <Text style={{ fontSize: 32 }}>🐱</Text>
          </View>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.productTitle}>غذای خشک رویال کنین مدل فیت ۳۲</Text>
            <Text style={styles.productSeller}>فروشنده: پت‌شاپ نیاوران (کمترین قیمت)</Text>
            <Text style={styles.productPrice}>۲,۱۹۰,۰۰۰ تومان</Text>
          </View>
          <ChevronLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
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
    marginBottom: 20,
  },
  headerBrand: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  petSwitcherRow: {
    flexDirection: "row",
    gap: 6,
  },
  petPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  petPillActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  petPillText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
  islandBanner: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    marginBottom: 16,
  },
  islandBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  islandBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  islandBadgeText: {
    fontSize: 10,
    color: "#10b981",
    fontWeight: "bold",
  },
  islandRoleText: {
    fontSize: 10,
    color: "#94a3b8",
  },
  islandTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  islandDesc: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 16,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  categoryItem: {
    alignItems: "center",
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 10,
    color: "#cbd5e1",
    fontWeight: "500",
  },
  sectionCard: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
  },
  sectionLink: {
    fontSize: 11,
    color: "#10b981",
    fontWeight: "bold",
  },
  sectionDesc: {
    fontSize: 11,
    color: "#94a3b8",
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#10b981",
    paddingVertical: 10,
    borderRadius: 16,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  guaranteeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(37, 99, 235, 0.15)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  guaranteeText: {
    fontSize: 9,
    color: "#60a5fa",
    fontWeight: "bold",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  productAvatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  productTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  productSeller: {
    fontSize: 10,
    color: "#10b981",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: "900",
    color: "#34d399",
    marginTop: 2,
  },
});
