import React, { useEffect, useState, useMemo, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { getLectures } from "../../../utils/lecturesFetcher";
import { useRouter } from "expo-router";

// Memoized Lecture Item
const LectureItem = memo(({ lecture, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-primary-50 rounded-xl p-4 mb-2"
  >
    <Text className="font-cairo_semibold text-lg text-neutral-800">
      {lecture.title}
    </Text>
  </TouchableOpacity>
));

export default function LectureList() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const data = await getLectures(true); // true if bucket is private
        setLectures(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  // Group lectures by subject using useMemo
  const groupedLectures = useMemo(() => {
    return lectures.reduce((acc, lecture) => {
      if (!acc[lecture.subject]) acc[lecture.subject] = [];
      acc[lecture.subject].push(lecture);
      return acc;
    }, {});
  }, [lectures]);

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3f9ef2" />
        <Text className="mt-4 font-cairo text-gray-500">
          جاري تحميل المحاضرات...
        </Text>
      </View>
    );

  if (lectures.length === 0)
    return (
      <SafeAreaView className="flex-1 bg-background px-6 justify-center items-center">
        <Image
          style={{ width: 400, height: 250, alignSelf: "center" }}
          contentFit="contain"
          source={require("../../../assets/images/Learning-pana.svg")}
        />
        <Text className="text-2xl text-center font-cairo_bold text-primary">
          لا توجد مواد دراسية
        </Text>
        <Text className="font-cairo text-center text-sm text-gray-500 mt-2">
          لم يتم إضافة أي مواد دراسية بعد. يرجى التحقق مرة أخرى لاحقًا.
        </Text>
      </SafeAreaView>
    );

  // Render a single subject section
  const renderSubject = ({ item: [subject, subjectLectures] }) => (
    <View className="mb-6">
      <Text className="text-xl font-cairo_bold mb-2">{subject}</Text>
      {subjectLectures.map((lecture) => (
        <LectureItem
          key={lecture.id}
          lecture={lecture}
          onPress={() =>
            router.push(
              `/(protected)/subjects/${lecture.subject}?url=${lecture.pdf_url}`
            )
          }
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background px-6">
      <Image
        style={{ width: 400, height: 250, alignSelf: "center" }}
        contentFit="contain"
        source={require("../../../assets/images/Learning-pana.svg")}
      />
      <FlatList
        data={Object.entries(groupedLectures)}
        keyExtractor={([subject]) => subject}
        renderItem={renderSubject}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
