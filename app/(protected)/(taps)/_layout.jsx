import { Tabs } from "expo-router";
import Octicons from "@expo/vector-icons/Octicons";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
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
