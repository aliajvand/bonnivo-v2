import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useAuthStore, MobileUserRole } from "../../src/stores/use-auth-store";
import {
  ShieldCheck,
  Stethoscope,
  Calendar,
  Award,
  User,
  Repeat,
  Headphones,
  Check,
} from "lucide-react-native";

export default function MobileMoreScreen() {
  const { currentRole, switchRole, user } = useAuthStore();

  const roleOptions: {
    role: MobileUserRole;
    title: string;
    desc: string;
    icon: any;
    color: string;
  }[] = [
    {
      role: "CUSTOMER",
      title: "سرپرست پت / مشتری",
      desc: "دسترسی به خرید، مراقبت و پرونده سلامت پت",
      icon: User,
      color: "#10b981",
    },
    {
      role: "ADMIN",
      title: "مدیر ارشد سیستم",
      desc: "تحلیل کلان، نظارت بر سفارشات و ممیزی بازارچه",
      icon: ShieldCheck,
      color: "#2563eb",
    },
    {
      role: "VETERINARIAN",
      title: "دامپزشک و درمانگاه",
      desc: "ویزیت‌ها، ثبت واکسیناسیون و پرونده بالینی",
      icon: Stethoscope,
      color: "#0d9488",
    },
    {
      role: "EVENT_ORGANIZER",
      title: "برگزارکننده رویدادها",
      desc: "مدیریت همایش‌ها، چک‌این بلیت‌ها و فروش",
      icon: Calendar,
      color: "#f59e0b",
    },
    {
      role: "TRAINER",
      title: "مربی و رفتارشناس",
      desc: "جلسات آموزشی، پکیج‌ها و رفتارشناسی",
      icon: Award,
      color: "#9333ea",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Header */}
      <View style={styles.userCard}>
        <View style={styles.userAvatar}>
          <Text style={{ fontSize: 20 }}>👤</Text>
        </View>
        <View>
          <Text style={styles.userName}>{user?.fullName || "کاربر بونیو"}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          <Text style={styles.userRoleBadge}>نقش فعال: {currentRole}</Text>
        </View>
      </View>

      {/* Role Switcher Section for Auditor Simulation */}
      <Text style={styles.sectionHeader}>شبیه‌سازی و تغییر نقش در اپلیکیشن</Text>
      <View style={styles.rolesList}>
        {roleOptions.map((opt) => {
          const isSelected = currentRole === opt.role;
          const Icon = opt.icon;

          return (
            <TouchableOpacity
              key={opt.role}
              onPress={() => switchRole(opt.role)}
              style={[
                styles.roleCard,
                isSelected && { borderColor: opt.color, backgroundColor: `${opt.color}15` },
              ]}
            >
              <View style={[styles.roleIcon, { backgroundColor: `${opt.color}20` }]}>
                <Icon size={18} color={opt.color} />
              </View>

              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={styles.roleTitle}>{opt.title}</Text>
                <Text style={styles.roleDesc}>{opt.desc}</Text>
              </View>

              {isSelected && <Check size={18} color={opt.color} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Utilities */}
      <Text style={styles.sectionHeader}>سایر امکانات</Text>
      <View style={styles.utilityCard}>
        <TouchableOpacity style={styles.utilityItem}>
          <Repeat size={18} color="#10b981" />
          <Text style={styles.utilityText}>سفارشات شارژ خودکار (Autoship)</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.utilityItem}>
          <Headphones size={18} color="#2563eb" />
          <Text style={styles.utilityText}>پشتیبانی آنلاین و هوش مصنوعی بونیو</Text>
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
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 20,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  userPhone: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "monospace",
  },
  userRoleBadge: {
    fontSize: 10,
    color: "#10b981",
    fontWeight: "bold",
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
    marginTop: 8,
  },
  rolesList: {
    gap: 8,
    marginBottom: 20,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  roleTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  roleDesc: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 2,
  },
  utilityCard: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  utilityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  utilityText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
});
