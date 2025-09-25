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
      <View className="bg-primary-600 rounded-2xl p-6 mb-6 shadow-md">
        <Text className="text-white font-cairo_bold text-lg mb-2">
          تقدمك اليوم
        </Text>
        <Text className="text-primary-100 font-cairo text-sm mb-4">
          لقد أنجزت 3 من أصل 5 مهام
        </Text>
        <View className="bg-white h-3 w-full rounded-full overflow-hidden">
          <View className="bg-primary-400 h-3 w-[60%]" />
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row justify-between mb-8">
        {[
          { label: "المحاضرات", icon: "book", href: "/subjects" },
          { label: "الاختبارات", icon: "check-circle", href: "/quizzes" },
          { label: "التقارير", icon: "archive" },
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
