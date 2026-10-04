import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { usePetStore } from "../../src/stores/use-pet-store";
import { QrCode, Shield, Phone, AlertCircle, Plus } from "lucide-react-native";

export default function MobilePetsScreen() {
  const { pets, activePetId, selectPet } = usePetStore();
  const activePet = pets.find((p) => p.id === activePetId) || pets[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>پت‌های من و شناسنامه QR</Text>
          <Text style={styles.subtitle}>پلاک ضد گم‌شدن با استعلام فوری مشخصات</Text>
        </View>

        <TouchableOpacity style={styles.addBtn}>
          <Plus size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Pet Switcher Horizontal */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petScroll}>
        {pets.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => selectPet(p.id)}
            style={[
              styles.petCard,
              p.id === activePetId && styles.petCardActive,
            ]}
          >
            <Text style={styles.petEmoji}>{p.species === "DOG" ? "🐶" : "🐱"}</Text>
            <Text style={styles.petName}>{p.name}</Text>
            <Text style={styles.petBreed}>{p.breed}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Smart QR Passport Card */}
      <View style={styles.passportCard}>
        <View style={styles.passportHeader}>
          <View style={styles.qrIconBox}>
            <QrCode size={24} color="#10b981" />
          </View>
          <View>
            <Text style={styles.passportTitle}>پاسپورت دیجیتال {activePet?.name}</Text>
            <Text style={styles.passportSub}>شناسه یکتا: BNV-PET-{activePet?.id.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.qrDisplayBox}>
          <Text style={styles.qrPlaceholderText}>[ بارکد امن QR بونیو ]</Text>
          <Text style={styles.qrScanText}>اسکن دوربین در موارد گم‌شدن یا مراجعه به درمانگاه</Text>
        </View>

        <View style={styles.passportInfoRow}>
          <View>
            <Text style={styles.infoLabel}>تاریخ تولد</Text>
            <Text style={styles.infoVal}>{activePet?.birthDate}</Text>
          </View>
          <View>
            <Text style={styles.infoLabel}>وزن فعلی</Text>
            <Text style={styles.infoVal}>{activePet?.weightKg} کیلوگرم</Text>
          </View>
          <View>
            <Text style={styles.infoLabel}>واکسن سالانه</Text>
            <Text style={[styles.infoVal, { color: "#10b981" }]}>معتبر</Text>
          </View>
        </View>
      </View>

      {/* Emergency Contact */}
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyHeader}>
          <AlertCircle size={16} color="#f43f5e" />
          <Text style={styles.emergencyTitle}>اطلاعات تماس اضطراری یابنده</Text>
        </View>
        <Text style={styles.emergencyDesc}>
          در صورت اسکن بارکد، یابنده امکان تماس مستقیم با شماره سرپرست را خواهد داشت بدون دسترسی به آدرس منزل.
        </Text>
        <View style={styles.phoneRow}>
          <Phone size={14} color="#ffffff" />
          <Text style={styles.phoneText}>شماره ثبت‌شده: ۰۹۱۲۱۲۳۴۵۶۷</Text>
        </View>
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  petScroll: {
    flexDirection: "row",
    marginBottom: 20,
  },
  petCard: {
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    marginEnd: 10,
    width: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  petCardActive: {
    borderColor: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  petEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  petName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  petBreed: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 2,
    textAlign: "center",
  },
  passportCard: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    marginBottom: 16,
  },
  passportHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  qrIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  passportTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  passportSub: {
    fontSize: 10,
    color: "#94a3b8",
    fontFamily: "monospace",
    marginTop: 2,
  },
  qrDisplayBox: {
    height: 120,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
  },
  qrPlaceholderText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#10b981",
    fontFamily: "monospace",
  },
  qrScanText: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 6,
    textAlign: "center",
  },
  passportInfoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  infoLabel: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
  },
  infoVal: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 2,
    textAlign: "center",
  },
  emergencyCard: {
    backgroundColor: "rgba(244, 63, 94, 0.08)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.2)",
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  emergencyTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f43f5e",
  },
  emergencyDesc: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 16,
    marginBottom: 10,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(244, 63, 94, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  phoneText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
