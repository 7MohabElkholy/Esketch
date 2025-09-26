import { Tabs } from "expo-router";
import Octicons from "@expo/vector-icons/Octicons";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          animation: "shift",
          headerShown: false,
          tabBarShowLabel: false,

          tabBarIcon: ({ color }) => (
            <Octicons name="home" size={24} color={color} />
          ),
          tabBarStyle: { paddingTop: 10 },
        }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{
          animation: "shift",
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Octicons name="check-circle" size={24} color={color} />
          ),
          tabBarStyle: { paddingTop: 10 },
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          animation: "shift",
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Octicons name="book" size={24} color={color} />
          ),
          tabBarStyle: { paddingTop: 10 },
        }}
      />
      <Tabs.Screen
        name="settigns"
        options={{
          animation: "shift",
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Octicons name="gear" size={24} color={color} />
          ),
          tabBarStyle: { paddingTop: 10 },
        }}
      />
    </Tabs>
  );
}
