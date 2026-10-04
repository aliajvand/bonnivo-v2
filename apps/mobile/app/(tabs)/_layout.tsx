import React from "react";
import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, HeartHandshake, ShoppingBag, Dog, Menu } from "lucide-react-native";

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.floatingContainer}>
      <View style={styles.dockSurface}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const IconComponent = () => {
            const color = isFocused ? "#10b981" : "#94a3b8";
            const size = 22;
            switch (route.name) {
              case "index":
                return <Home size={size} color={color} strokeWidth={isFocused ? 2.5 : 1.75} />;
              case "care":
                return <HeartHandshake size={size} color={color} strokeWidth={isFocused ? 2.5 : 1.75} />;
              case "shop":
                return <ShoppingBag size={size} color={color} strokeWidth={isFocused ? 2.5 : 1.75} />;
              case "pets":
                return <Dog size={size} color={color} strokeWidth={isFocused ? 2.5 : 1.75} />;
              case "more":
                return <Menu size={size} color={color} strokeWidth={isFocused ? 2.5 : 1.75} />;
              default:
                return <Home size={size} color={color} />;
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={typeof label === "string" ? label : route.name}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemFocused,
              ]}
              activeOpacity={0.8}
            >
              <IconComponent />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? "#10b981" : "#64748b", fontWeight: isFocused ? "bold" : "500" },
                ]}
              >
                {typeof label === "string" ? label : route.name}
              </Text>

              {/* Active Circular Luminous Halo Indicator */}
              {isFocused && (
                <View style={styles.luminousHalo}>
                  <View style={styles.luminousDot} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "خانه" }} />
      <Tabs.Screen name="care" options={{ title: "مراقبت" }} />
      <Tabs.Screen name="shop" options={{ title: "فروشگاه" }} />
      <Tabs.Screen name="pets" options={{ title: "پت‌های من" }} />
      <Tabs.Screen name="more" options={{ title: "بیشتر" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 28 : 16,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  dockSurface: {
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.94)", // Luxury dark elevated surface
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    maxWidth: 420,
    width: "100%",
    justifyContent: "space-around",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    borderRadius: 16,
    position: "relative",
  },
  tabItemFocused: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  luminousHalo: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(16, 185, 129, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  luminousDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
});
