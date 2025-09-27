import React, { useEffect, useState, useCallback, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  I18nManager,
} from "react-native";
import { Image } from "expo-image";
import { useAuth } from "../../../utils/authContext";
import { useRouter } from "expo-router";
import Octicons from "@expo/vector-icons/Octicons";
import { supabase } from "../../../utils/supabase";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

// RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// Cover images
const coverImages = {
  finance_cover: require("../../../assets/covers/finance_cover.svg"),
  markting_cover: require("../../../assets/covers/markting_cover.svg"),
  accounting_cover: require("../../../assets/covers/accounting_cover.svg"),
  law_cover: require("../../../assets/covers/law_cover.svg"),
  logistics_cover: require("../../../assets/covers/logistics_cover.svg"),
};

// Memoized Lecture Card
const LectureCard = memo(({ lecture, router }) => (
  <TouchableOpacity
    className="bg-primary-50 rounded-xl w-40 h-48 mr-4 shadow-sm p-3"
    onPress={() =>
      router.push(
        `/(protected)/subjects/${lecture.subject}?url=${lecture.pdf_path}`
      )
    }
  >
    <Image
      source={coverImages[lecture.cover] || coverImages.finance_cover}
      style={{ width: 100, height: 100, alignSelf: "center" }}
      contentFit="contain"
    />
    <Text className="font-cairo_semibold text-neutral-800 text-sm">
      {lecture.title}
    </Text>
    <Text className="font-cairo text-neutral-500 text-xs">
      {lecture.subject.slice(0, 20)}
    </Text>
  </TouchableOpacity>
));

// Memoized Task Item
const TaskItem = memo(({ task }) => (
  <View className="flex-row items-center mt-4 bg-white/10 rounded-lg p-3">
    <Octicons
      name={task.completed ? "check-circle" : "circle"}
      size={20}
      color={task.completed ? "#4ade80" : "#facc15"}
      style={{ marginRight: 8 }}
    />
    <Text className="text-white font-cairo">{task.label}</Text>
  </View>
));

// Memoized Upcoming Event
const UpcomingEvent = memo(({ event }) => (
  <View className="bg-primary-50 p-5 rounded-xl mb-4 shadow-sm">
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
));

export default function HomeScreen() {
  const { userData } = useAuth();
  const router = useRouter();

  const [lectures, setLectures] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 2,
    tasks: [],
  });
  const [showTasks, setShowTasks] = useState(false);
  const [loading, setLoading] = useState(true);

  const animatedHeight = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: "hidden",
  }));

  // Animate task container
  useEffect(() => {
    animatedHeight.value = withTiming(
      showTasks ? (progress.tasks?.length || 0) * 65 : 0,
      {
        duration: 300,
        easing: Easing.out(Easing.ease),
      }
    );
  }, [showTasks, progress.tasks]);

  const fetchData = useCallback(async () => {
    try {
      const [lecturesRes, eventsRes, progressRes] = await Promise.all([
        supabase
          .from("lectures")
          .select("id, title, subject, pdf_path, created_at, cover")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("upcoming_events")
          .select("id, title, description, date_text")
          .order("id", { ascending: true }),
        supabase
          .from("daily_progress")
          .select("test_type, completed")
          .eq("user_id", userData.id)
          .eq("date", new Date().toISOString().slice(0, 10)),
      ]);

      // Lectures
      if (lecturesRes.error)
        console.error("Lectures fetch error:", lecturesRes.error);
      else setLectures(lecturesRes.data || []);

      // Events
      if (eventsRes.error)
        console.error("Events fetch error:", eventsRes.error);
      else setUpcomingEvents(eventsRes.data || []);

      // Progress
      if (progressRes.error)
        console.error("Progress fetch error:", progressRes.error);
      else {
        const requiredTasks = [
          { type: "MCQ", label: "اختبار اختيار من متعدد" },
          { type: "TFQ", label: "اختبار صح/خطأ" },
        ];
        const done = progressRes.data
          .filter((p) => p.completed)
          .map((p) => p.test_type);
        const tasks = requiredTasks.map((t) => ({
          ...t,
          completed: done.includes(t.type),
        }));
        setProgress({
          tasks,
          completed: tasks.filter((t) => t.completed).length,
          total: tasks.length,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.id) fetchData();
  }, [userData]);

  useFocusEffect(
    useCallback(() => {
      if (userData?.id) fetchData();
    }, [userData])
  );

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#3f9ef2"
        className="flex-1 justify-center items-center"
      />
    );

  return (
    <View className="flex-1 bg-background px-6 pt-12">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex flex-row items-center gap-2">
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
        <Animated.View style={animatedStyle}>
          {progress.tasks?.map((task) => (
            <TaskItem key={task.type} task={task} />
          ))}
        </Animated.View>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View className="flex-row justify-between mb-8">
        {[
          { label: "المحاضرات", icon: "book", href: "/subjects" },
          { label: "الاختبارات", icon: "check-circle", href: "/quizzes" },
          { label: "التقارير", icon: "archive", href: "/reports" },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            className="bg-primary-50 rounded-xl items-center justify-center p-4 w-[30%] shadow-sm"
            onPress={() => item.href && router.push(item.href)}
          >
            <Octicons name={item.icon} size={24} color="#000000" />
            <Text className="mt-2 text-sm font-cairo_semibold text-primary-700">
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upcoming Events */}
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
        <FlatList
          data={upcomingEvents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <UpcomingEvent event={item} />}
          scrollEnabled={false}
        />
      )}

      {/* Recent Lectures */}
      <Text className="font-cairo_bold text-lg text-neutral-800 mb-4">
        المحاضرات الأخيرة
      </Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={lectures}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <LectureCard lecture={item} router={router} />
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
