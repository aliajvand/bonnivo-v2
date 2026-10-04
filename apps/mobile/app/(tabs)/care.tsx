import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { usePetStore } from "../../src/stores/use-pet-store";
import { CalendarCheck, CheckCircle2, Clock, Plus } from "lucide-react-native";

export default function MobileCareScreen() {
  const { pets, activePetId, careTasks, toggleCareTask } = usePetStore();
  const activePet = pets.find((p) => p.id === activePetId) || pets[0];

  const completedCount = careTasks.filter((t) => t.completed).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>برنامه مراقبت {activePet?.name}</Text>
          <Text style={styles.subtitle}>
            {completedCount} از {careTasks.length} وظیفه امروز انجام شده است.
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${(completedCount / careTasks.length) * 100}%` },
          ]}
        />
      </View>

      {/* Routine Checklist (Offline-first) */}
      <View style={styles.tasksList}>
        {careTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            onPress={() => toggleCareTask(task.id)}
            style={[
              styles.taskCard,
              task.completed && styles.taskCardCompleted,
            ]}
          >
            <View style={styles.taskCheckCircle}>
              <CheckCircle2
                size={22}
                color={task.completed ? "#10b981" : "#475569"}
                strokeWidth={task.completed ? 2.5 : 1.5}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.taskTitle,
                  task.completed && styles.taskTitleCompleted,
                ]}
              >
                {task.title}
              </Text>
              <View style={styles.taskTimeRow}>
                <Clock size={12} color="#64748b" />
                <Text style={styles.taskTime}>{task.time}</Text>
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    height: 6,
    backgroundColor: "#1e293b",
    borderRadius: 3,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 3,
  },
  tasksList: {
    gap: 10,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  taskCardCompleted: {
    opacity: 0.6,
    backgroundColor: "rgba(15, 23, 42, 0.3)",
  },
  taskCheckCircle: {
    marginEnd: 12,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#64748b",
  },
  taskTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  taskTime: {
    fontSize: 10,
    color: "#94a3b8",
  },
});
