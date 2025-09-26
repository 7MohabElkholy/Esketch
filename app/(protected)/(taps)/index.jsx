import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  I18nManager,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useAuth } from "../../../utils/authContext";
import { useRouter } from "expo-router";
import Octicons from "@expo/vector-icons/Octicons";
import { supabase } from "../../../utils/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

// Ensure RTL globally
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const coverImages = {
  finance_cover: require("../../../assets/covers/finance_cover.svg"),
  markting_cover: require("../../../assets/covers/markting_cover.svg"),
  accounting_cover: require("../../../assets/covers/accounting_cover.svg"),
  law_cover: require("../../../assets/covers/law_cover.svg"),
  logistics_cover: require("../../../assets/covers/logistics_cover.svg"),
};

export default function HomeScreen() {
  const { userData } = useAuth();
  const router = useRouter();

  const [lectures, setLectures] = React.useState([]);
  const [loadingLectures, setLoadingLectures] = React.useState(true);
  const [progress, setProgress] = React.useState({
    completed: 0,
    total: 2,
    tasks: [
      { type: "MCQ", label: "اختبار اختيار من متعدد" },
      { type: "TFQ", label: "اختبار صح/خطأ" },
    ],
  });
  const [showTasks, setShowTasks] = React.useState(false);
  const animatedHeight = useSharedValue(0);
  const [upcomingEvents, setUpcomingEvents] = React.useState([]);

  const fetchUpcoming = async () => {
    const { data, error } = await supabase
      .from("upcoming_events")
      .select("id, title, description, date_text")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching upcoming tests:", error);
      return;
    }

    setUpcomingEvents(data || []);
  };

  React.useEffect(() => {
    fetchUpcoming();
  }, []);

  React.useEffect(() => {
    animatedHeight.value = withTiming(
      showTasks ? (progress.tasks?.length || 0) * 65 : 0, // 65px per task
      {
        duration: 300,
        easing: Easing.out(Easing.ease),
      }
    );
  }, [showTasks, progress.tasks]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: "hidden",
  }));

  const fetchLatestLectures = async () => {
    const { data, error } = await supabase
      .from("lectures")
      .select("id, title, subject, pdf_path, created_at, cover")
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Error fetching latest lectures:", error);
      return;
    }

    setLectures(data);
    setLoadingLectures(false);
  };

  React.useEffect(() => {
    fetchLatestLectures();
  }, []);

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

  React.useEffect(() => {
    if (userData?.id) {
      fetchProgress();
    }
  }, [userData]);

  useFocusEffect(
    useCallback(() => {
      if (userData?.id) {
        fetchProgress();
      }
    }, [userData])
  );

  return (
    <ScrollView
      className="flex-1 bg-background px-6 pt-12"
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
        <Animated.View style={animatedStyle}>
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
              if (item.href) router.push(item.href);
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
      {upcomingEvents.length === 0 ? (
        <View className="bg-primary-50 p-5 rounded-xl mb-4 shadow-sm">
          <Text className="font-cairo_bold text-neutral-800 text-base mb-2">
            لا توجد احداث قادمة
          </Text>
          <Text className="font-cairo text-neutral-600 text-sm">
            لا توجد كويزات او تسليمات قريبة
          </Text>
          <Text className="font-cairo_semibold text-primary-600 mt-2">
            استمتع بوقتك!
          </Text>
        </View>
      ) : (
        upcomingEvents.map((event) => (
          <View
            key={event.id}
            className="bg-primary-50 p-5 rounded-xl mb-4 shadow-sm"
          >
            <Text className="font-cairo_bold text-neutral-800 text-base mb-2">
              {event.title}
            </Text>
            <Text className="font-cairo text-neutral-600 text-sm">
              {event.description}
            </Text>
            <Text className="font-cairo_semibold text-primary-600 mt-2">
              {event.date_text}
            </Text>
          </View>
        ))
      )}

      {/* Recent Lectures */}
      <Text className="font-cairo_bold text-lg text-neutral-800 mb-4">
        المحاضرات الأخيرة
      </Text>

      {loadingLectures ? (
        <ActivityIndicator size="small" color="#3f9ef2" />
      ) : lectures.length === 0 ? (
        <Text className="font-cairo text-neutral-500">لا توجد محاضرات بعد</Text>
      ) : (
        <ScrollView
          className="pb-24"
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {lectures.map((lecture) => (
            <TouchableOpacity
              key={lecture.id}
              className="bg-primary-50 rounded-xl w-40 h-48 mr-4 shadow-sm p-3"
              onPress={() =>
                router.push(
                  `/(protected)/subjects/${lecture.subject}?url=${lecture.pdf_path}`
                )
              }
            >
              <Image
                source={coverImages[lecture.cover] || coverImages.finance_cover}
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
                {lecture.subject.slice(0, 20)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
}
