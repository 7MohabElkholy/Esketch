import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  I18nManager,
} from "react-native";
import { Image } from "expo-image";
import { useAuth } from "../../../utils/authContext";
import { useRouter } from "expo-router";
import Octicons from "@expo/vector-icons/Octicons";
import { supabase } from "../../../utils/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Animated, Easing } from "react-native";

// Ensure RTL globally
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function HomeScreen() {
  const { userData } = useAuth();
  const router = useRouter();
  const [lectures, setLectures] = React.useState([
    {
      id: 1,
      title: "المحاضرة الاولى",
      subject: "الاقتصاد الجزئي",
      cover: require("../../../assets/images/finance_cover.svg"),
    },
    {
      id: 2,
      title: "المحاضرة الثانية",
      subject: "الاقتصاد الجزئي",
      cover: require("../../../assets/images/finance_cover.svg"),
    },
    {
      id: 3,
      title: "المحاضرة الاولى",
      subject: "التسويق",
      cover: require("../../../assets/images/markting_cover.svg"),
    },
  ]);
  const [progress, setProgress] = React.useState({ completed: 0, total: 0 });
  const [showTasks, setShowTasks] = React.useState(false);
  const animatedHeight = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: showTasks ? progress.tasks.length * 65 : 0, // 50px per task
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [showTasks, progress]);

  const fetchProgress = async () => {
    const { data, error } = await supabase
      .from("daily_progress")
      .select("test_type, completed")
      .eq("user_id", userData.id)
      .eq("date", new Date().toISOString().slice(0, 10));

    if (error) {
      console.error("Error fetching progress:", error);
      return;
    }

    const requiredTasks = [
      { type: "MCQ", label: "اختبار اختيار من متعدد" },
      { type: "TFQ", label: "اختبار صح/خطأ" },
    ];

    const done = data.filter((p) => p.completed).map((p) => p.test_type);

    const tasks = requiredTasks.map((task) => ({
      ...task,
      completed: done.includes(task.type),
    }));

    setProgress({
      tasks,
      completed: tasks.filter((t) => t.completed).length,
      total: tasks.length,
    });
  };

  // run once when userData changes
  React.useEffect(() => {
    if (userData?.id) {
      fetchProgress();
    }
  }, [userData]);

  // re-run whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      if (userData?.id) {
        fetchProgress();
      }
    }, [userData])
  );

  return (
    <ScrollView
      className="flex-1 bg-background px-6 pt-12 "
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex flex-row items-center justify-between gap-2">
          <Text className="text-lg font-cairo text-neutral-500">مرحباً</Text>
          <Text className="text-xl font-cairo_bold text-primary-700">
            {userData?.first_name || "مستخدم مجهول الهوية"}
          </Text>
        </View>
        <TouchableOpacity>
          <Image
            source={require("../../../assets/images/profile-user.png")}
            style={{ width: 32, height: 32, borderRadius: 24 }}
          />
        </TouchableOpacity>
      </View>

      {/* Progress Card */}
      <TouchableOpacity
        onPress={() => setShowTasks((prev) => !prev)}
        activeOpacity={0.9}
        className="bg-primary-600 rounded-2xl p-6 mb-6 shadow-md"
      >
        <Text className="text-white font-cairo_bold text-lg mb-2">
          تقدمك اليوم
        </Text>
        <Text className="text-primary-100 font-cairo text-sm mb-4">
          لقد أنجزت {progress.completed} من أصل {progress.total} مهام
        </Text>
        <View className="bg-primary-400 h-3 w-full rounded-full overflow-hidden">
          <View
            className="bg-white h-3"
            style={{ width: `${(progress.completed / progress.total) * 100}%` }}
          />
        </View>

        {/* Expandable tasks */}
        <Animated.View style={{ height: animatedHeight, overflow: "hidden" }}>
          {progress.tasks?.map((task) => (
            <View
              key={task.type}
              className="flex-row items-center mt-4 bg-white/10 rounded-lg p-3"
            >
              <Octicons
                name={task.completed ? "check-circle" : "circle"}
                size={20}
                color={task.completed ? "#4ade80" : "#facc15"}
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-cairo">{task.label}</Text>
            </View>
          ))}
        </Animated.View>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View className="flex-row justify-between mb-8">
        {[
          { label: "المحاضرات", icon: "book", href: "/subjects" },
          { label: "الاختبارات", icon: "check-circle", href: "/quizzes" },
          { label: "التقارير", icon: "archive", href: "/reports" },
        ].map((item, idx) => (
          <TouchableOpacity
            key={idx}
            className="bg-primary-50 rounded-xl items-center justify-center p-4 w-[30%] shadow-sm"
            onPress={() => {
              if (item.href) {
                router.push(item.href);
              }
            }}
          >
            <Octicons name={item.icon} size={24} color="#000000" />
            <Text className="mt-2 text-sm font-cairo_semibold text-primary-700">
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upcoming Test */}
      <TouchableOpacity className="bg-primary-50 p-5 rounded-xl mb-8 shadow-sm">
        <Text className="font-cairo_bold text-neutral-800 text-base mb-2">
          اختبار قادم
        </Text>
        <Text className="font-cairo text-neutral-600 text-sm">
          اختبار مادة الاقتصاد الجزئي
        </Text>
        <Text className="font-cairo_semibold text-primary-600 mt-2">
          غداً - الساعة 10 صباحاً
        </Text>
      </TouchableOpacity>

      {/* Recent Lectures */}
      <Text className="font-cairo_bold text-lg text-neutral-800 mb-4">
        المحاضرات الأخيرة
      </Text>
      <ScrollView
        className="pb-24"
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {lectures.map((lecture) => (
          <TouchableOpacity
            key={lecture.id}
            className="bg-primary-50 rounded-xl w-40 h-48 mr-4 shadow-sm p-3"
          >
            <Image
              source={lecture.cover}
              style={{
                width: 100,
                height: 100,
                alignSelf: "center",
              }}
              contentFit="contain"
            />
            <Text className="font-cairo_semibold text-neutral-800 text-sm">
              {lecture.title}
            </Text>
            <Text className="font-cairo text-neutral-500 text-xs">
              {lecture.subject}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}
